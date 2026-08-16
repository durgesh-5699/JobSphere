import User from "../models/userModel.ts";
import connectDB  from "../config/db.ts";
import config from "../config/config.ts";
import bcrypt from "bcryptjs"; // Add this import!

connectDB();

const createAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: config.ADMIN_EMAIL });
    
    // 1. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD, salt);

    if (existingAdmin) {
      // 2. If user exists, upgrade them to admin AND fix their password
      existingAdmin.role = "admin";
      existingAdmin.password = hashedPassword; 
      await existingAdmin.save();
      console.log(`✅ Existing user "${config.ADMIN_EMAIL}" updated to admin with secured password.`);
    } else {
      // 3. If they don't exist, create them with the hashed password
      await User.create({
        name: config.ADMIN_NAME,
        email: config.ADMIN_EMAIL,
        password: hashedPassword, 
        role: "admin",
        isVerified: true, 
      });
      console.log(`🚀 New admin user created: ${config.ADMIN_EMAIL}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();