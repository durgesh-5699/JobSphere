import config from "../config/config.ts";
import transporter from "../config/mail.ts";

export const sendOTP = async (email: string, otp: string) => {

    try {
        const info = await transporter.sendMail({
            from: `"jobSphere" <${config.EMAIL_USER}>`,
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

        console.log("OTP email sent:", info.messageId);
        return info;

    } catch (error: any) {
        console.error("Nodemailer error:", error);
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};