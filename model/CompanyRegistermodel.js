import mongoose from "mongoose";

export const companySchema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
    },
    logo: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required : true,
        unique: true,
    },
    otp:{ 
        type:String
    },
    otpExpiration:Date,
    balance:Number
});

const companyModel = mongoose.model('company',companySchema);
export default companyModel;