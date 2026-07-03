import type { NextFunction, Request, Response } from "express";
import config from "../config/config.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel.ts";

export const protect = async(req:Request,res:Response,next:NextFunction)=>{
    try{
       const token = req.cookies.token;
       if(!token){
        return res.status(401).json({message:"Not authorised"});
       } 

       const decoded = jwt.verify(token,config.JWT_SECRET) as JwtPayload;
       req.user = await User.findById(decoded.id).select("-password");

       if(!req.user){
        return res.status(401).json({message:"User not found"});
       }
       console.log("before next");
       next();
       console.log("after next");
    }catch(err){
      return res.status(401).json({ message: "Not authorized, token failed" });   
    }
}