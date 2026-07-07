import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        name:{type:String,required:true,trim:true},
        email:{type:String,required:true,unique:true,trim:true,lowercase:true},
        password:{type:String,required:true,minlength:7},
        role:{type:String,enum:["student","admin"],default:"student"},
        isVerified:{type:Boolean,default:false},
        otp:{type:String,default:null},
        otpExpiry:{type:Date,default:null},
        googleId:{type:String,default:null}
    },{timestamps:true}
);

const User = mongoose.model("User",userSchema);

export default User;