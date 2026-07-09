import brevo from "../config/mail.ts";
import config from "../config/config.ts";

export const sendOTP = async (email: string, otp: string) => {
    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: "Verify Your Email",
            htmlContent: `
            <div style="font-family:Arial;padding:20px">
                <h2>Email Verification</h2>
                <p>Your verification code is</p>
                <h1>${otp}</h1>
                <p>This code expires in 5 minutes.</p>
            </div>
            `,
            sender: { name: "jobSphere", email: config.EMAIL_USER },
            to: [{ email }],
        });

        console.log("OTP email sent:", result);
        return result;
    } catch (error: any) {
        console.error("Brevo error:", error);
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};