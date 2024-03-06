import mongoose from "mongoose";

export const studentSchema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
        unique:true
    },
    profile: {
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
    appliedroles:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Role'
    }],
    otp:{
        type:String
    },
    otpExpiration:Date,
    balance:Number
});

const studentModel = mongoose.model('student',studentSchema);
export default studentModel;