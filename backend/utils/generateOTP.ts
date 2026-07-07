import otpGenerator from "otp-generator"

export const generateOTP=()=>{
    return otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        loswerCaseAlphabets:false,
        specialChars:false,
    });
};