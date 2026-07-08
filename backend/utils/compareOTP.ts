import bcrypt from 'bcryptjs';

export const compareOTP = async (otp: string, hashedOtp: string) => {
    return await bcrypt.compare(otp, hashedOtp);
}