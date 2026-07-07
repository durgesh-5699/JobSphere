import { sendOTP } from './../utils/sendOTP';
import { hashOTP } from './../utils/hashOTP.ts';
import { generateOTP } from './../utils/generateOTP.ts';
import type { Request, Response } from "express";
import User from "../models/userModel.ts";
import bcrypt from "bcryptjs"
import config from "../config/config.ts";
import jwt from "jsonwebtoken"

const setCookies=(res:Response,token:string)=>{
    res.cookie("token",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
        maxAge:7*24*60*60*1000,
    });
}

export const registerUser = async(req:Request,res:Response)=>{
    try {
        const {name,email,password} = req.body;

        const userExist = await User.findOne({email});
        if(userExist){
            return res.status(400).json({message:"User already exist"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const otp = generateOTP();
        const hashedOtp = hashOTP(otp);
        const optExpiry = new Date(Date.now() + 5*60*1000);

        const user = await User.create({name,email,password:hashedPassword,isVerified:false,otp:hashedOtp,otpExpiry});

        await sendOTP(email,otp);

         return res.status(201).json({
            message: "OTP sent successfully. Please verify your email.",
            email: user.email,
         });

    }catch(err:any){
     res.status(500).json({message:`Error : ${err.message}`});
    }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified.",
      });
    }

    // OTP Expiry Check
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP expired. Please request a new OTP.",
      });
    }

    // Compare OTP
    const hashedOTP = hashOTP(otp);

    if (hashedOTP !== user.otp) {
      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    // Verify User
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // Login Automatically
    const token = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: "1d" }
    );

    setCookies(res, token);

    return res.status(200).json({
      message: "Email verified successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const loginUser = async(req:Request,res:Response)=>{
    try {
        const {email,password}  = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"User doesn't exits"});
        }

        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({message:"Incorrect password"});
        }
        const token = jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn:'1d'});
        setCookies(res,token);
        res.status(200).json({
            message:"Login Successful",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        })
    }catch(err:any){
        res.status(500).json({message:`Error : ${err.message}`});
    }
}

export const logoutUser=(req:Request,res:Response)=>{
    res.cookie("token","",{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
        expires: new Date(0),
    })
    res.status(200).json({
        message:"Logout Successful",
    });
}

export const getMe = async(req:Request,res:Response)=>{
    res.status(200).json({
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
    });
}
