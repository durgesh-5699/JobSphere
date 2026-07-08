import config from "../config/config.ts";
import transporter from "../config/mail.ts";

export const sendResetPasswordEmail = async (email: string, resetLink: string) => {

    try {
        const info = await transporter.sendMail({
            from: `"jobSphere" <${config.EMAIL_USER}>`,
            to: email,
            subject: "Reset Your Password",

            html: `
            <div style="font-family:Arial;padding:20px">
                <h2>Password Reset Request</h2>

                <p>We received a request to reset your password. Click the button below to choose a new one.</p>

                <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#2F5D50;color:#ffffff;text-decoration:none;border-radius:8px;margin-top:16px;font-weight:bold">
                    Reset Password
                </a>

                <p style="margin-top:20px;color:#666">This link expires in 15 minutes.</p>

                <p style="color:#666">If you didn't request this, you can safely ignore this email.</p>
            </div>
            `
        });

        console.log("Reset password email sent:", info.messageId);
        return info;

    } catch (error: any) {
        console.error("Nodemailer error:", error);
        throw new Error(`Failed to send reset email: ${error.message}`);
    }
};