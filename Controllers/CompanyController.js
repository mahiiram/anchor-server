import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import companyModel from '../model/CompanyRegistermodel.js';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator'

import dotenv from 'dotenv';
import rolemodel from '../model/roleschema.js';

const env = dotenv.config(); 

export async function companyregister (req,res){
  
    try {
      const { name, email, password,logo } = req.body;
      
      let user = await companyModel.findOne({ email });
  
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
     const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
      const otpExpiration = new Date();
      otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
  
      user = new companyModel({
        name,
        logo,
        email,
        password: hashedPassword,
        otp,
        otpExpiration,
        balance:200
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
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }

}

export async function verifyOTP (req,res){
    const { email, otp } = req.body;

    try {
      const user = await companyModel.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid email' });
      }
  
      if (otp !== user.otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      if (new Date() > user.otpExpiration) {
        const deleteEmail = companyModel.deleteOne({email})
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

    let existingCompany;
    try {
        existingCompany = await companyModel.findOne({ email });
        if (!existingCompany) {
            return res.status(500).json({
                message: "Account is not valid"
            })
        }
    } catch (err) {
        return console.log(err)
    }



    const ispasswordcorrect = bcrypt.compareSync(password, existingCompany.password);
    if (!ispasswordcorrect) {
        return res.status(400).json({
            message: "password is not valid"
        })
    }
    const token = jwt.sign({ id: existingCompany._id }, process.env.SECRET_KEY, {
        expiresIn: "7d",
    })
    return res.status(200).json({
        message: "Login successfully",
        token,
        email: existingCompany.email
    })

}


export async function addRole (req,res){
    const { name, minCTC, maxCTC, location, companyId } = req.body;
   let roleCost = name.length + minCTC.length + maxCTC.length + location.length
    
    const company = await companyModel.findById(companyId)
    console.log(company)
  
      if (!company || company.balance < roleCost ) {
        return res.status(400).send({ error: 'Insufficient balance to post job' });   
        }   
     company.balance -= roleCost; 
    await company.save();
    const newrole = new rolemodel({ name, minCTC, maxCTC, location, companyId: companyId });
    await newrole.save();
    return res.status(200).json({
        newrole
    })
}


export async function getUser(req,res){
  try {
    const { email } = req.params;
    const user = await companyModel.findOne({ email }).select('-password'); // Exclude the password field

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user object without the password field
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }

}


export async function getallcompanyRoles(req,res){
  
  try {
    const companyId = req.params.companyId;
    const roles = await rolemodel.find({ companyId })
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  
}
  export async function deleteRole(req,res){
    try {
      await rolemodel.deleteOne({_id: req.params.id})
      return res.status(201).send({
          message:'deleted',
          status:true
      })
    } catch (error) {
      return res.status(500).send(error)
    }
  }