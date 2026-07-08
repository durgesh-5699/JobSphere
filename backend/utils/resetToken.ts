import crypto from "crypto";

export const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashResetToken(resetToken);
    return { resetToken, hashedToken };
};

export const hashResetToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};