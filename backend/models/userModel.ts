import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true, minlength: 7 },
        role: { type: String, enum: ["student", "admin"], default: "student" },
        isVerified: { type: Boolean, default: false },
        otp: { type: String, default: null },
        otpExpiry: { type: Date, default: null },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpiry: { type: String, default: null },
    }, 
    { timestamps: true }
);

// Fix 1 & 2: Removed the missing <IUser> interface and matched the 'userSchema' spelling
export const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;