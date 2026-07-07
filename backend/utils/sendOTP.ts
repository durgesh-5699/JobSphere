import config from "../config/config.ts";
import resend from "../config/mail.ts";

export const sendOTP =async(email: string, otp: string)=>{

    await resend.emails.send({

        from: config.EMAIL_FROM!,
        to: email,
        subject: "Verify Your Email",

        html: `
        <div style="font-family:Arial;padding:20px">
            <h2>Email Verification</h2>

            <p>Your verification code is</p>

            <h1>${otp}</h1>

            <p>This code expires in 5 minutes.</p>
        </div>
        `
    });

};