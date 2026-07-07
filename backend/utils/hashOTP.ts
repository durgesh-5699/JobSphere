import bcrypt from 'bcryptjs';

export const hashOTP = async (otp:string)=>{
    const salt = await bcrypt.genSalt(5);
    const hashotp = await bcrypt.hash(otp,salt);
    return hashotp;
}