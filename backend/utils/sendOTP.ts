import config from "../config/config.ts";
import transporter from "../config/mail.ts";

export const sendOTP = async(email:string,otp:string)=>{
    await transporter.sendMail({
        from : config.EMAIL_USER,
        to:email,
        subject:"Verify your Email",
        html:`
            <h2>Email Verification</h2>
            <p>Your OTP is</p>
            <h1>${otp}</h1>
            <p>This OTP expires in 5 minutes.</p>
        `
    });
};