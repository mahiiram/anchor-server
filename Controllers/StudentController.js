import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import studentModel from '../model/studentRegistermodel.js';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator'

import dotenv from 'dotenv';
import companyModel from '../model/CompanyRegistermodel.js';
import rolemodel from '../model/roleschema.js';

const env = dotenv.config(); 

export async function studentregister (req,res,next){
    const { name, email, password,profile } = req.body;

    try {
      let user = await studentModel.findOne({ email });
  
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
    //   const otp = Math.floor(100000 + Math.random() * 900000);
     const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
      const otpExpiration = new Date();
      otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
  
      user = new studentModel({
        name,
        profile,
        email,
        password: hashedPassword,
        otp,
        otpExpiration,
        balance:300
      });
  
      await user.save();
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }

}

export async function verifyOTP (req,res){
    const { email, otp } = req.body;

    try {
      const user = await studentModel.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid email' });
      }
  
      if (otp !== user.otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      if (new Date() > user.otpExpiration) {
        return res.status(400).json({ message: 'OTP expired' });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: '1day'
      });
  
      res.status(200).json({ message: 'OTP verified successfully', token });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
    
}

export async function login(req, res, next) {

    const { email, password } = req.body

    let existingStudent;
    try {
        existingStudent = await studentModel.findOne({ email });
        if (!existingStudent) {
            return res.status(500).json({
                message: "Account is not valid"
            })
        }
    } catch (err) {
        return console.log(err)
    }



    const ispasswordcorrect = bcrypt.compareSync(password, existingStudent.password);
    if (!ispasswordcorrect) {
        return res.status(400).json({
            message: "password is not valid"
        })
    }
    const token = jwt.sign({ id: existingStudent._id }, process.env.SECRET_KEY, {
        expiresIn: "7d",
    })
    return res.status(200).json({
        message: "Login successfully",
        token,
        email: existingStudent.email
    })

}


export async function applyRole(req,res){
  const { studentId, roleId } = req.body;

  const student = await studentModel.findById(studentId);
  const role = await rolemodel.findById(roleId).populate('companyId');

  console.log(role)

  if (!student || student.balance < calculateCost(role.name, role.minCTC, role.maxCTC, role.location)) {
    return res.status(400).send({ error: 'Insufficient balance to apply for job' });
  }

  student.balance -= calculateCost(role.name, role.minCTC, role.maxCTC, role.location);
  student.appliedroles.push(roleId);
  await student.save();

  const company = await companyModel.findById(role.companyId);
  console.log(company)
  company.balance += calculateCost(role.name, role.minCTC, role.maxCTC, role.location);
  await company.save();

  const trans = {
    studentName: student.name,
    roleName: role.name,
    cost: calculateCost(role.name, role.minCTC, role.maxCTC, role.location)
  };

  sendEmailNotification(role.companyId.name,role.name, student.name,student.email);

  res.send(trans);
}


function calculateCost(name, minCTC, maxCTC, location) {
  return name.length + minCTC.toString().length + maxCTC.toString().length + location.length;
}

function sendEmailNotification(companyName,roleName,studentName,studentEmail) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

  const mailOptions = {
    from:process.env.EMAIL,
    to: studentEmail,
    subject: `New Application for ${roleName}`,
    text: `Student ${studentName} has applied for the role ${roleName} at ${companyName}.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
