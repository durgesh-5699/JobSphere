import User from "./models/userModel.ts"; // Adjust path if needed
import connectDB from "./config/db.ts";
import bcrypt from "bcryptjs";

const forceResetAdmin = async () => {
  try {
    await connectDB();
    
    const email = "durgeshbhatt1320@gmail.com";
    const plainPassword = "Durgesh@5699";

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Find the user and forcefully update their password and role
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { 
        $set: { 
          password: hashedPassword, 
          role: "admin",
          isVerified: true
        } 
      },
      { new: true, upsert: true } // upsert creates them if they got deleted
    );

    console.log(`✅ SUCCESS! Admin account (${updatedUser.email}) forcefully reset with a valid hashed password.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }
};

forceResetAdmin();