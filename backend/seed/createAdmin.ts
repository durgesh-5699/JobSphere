import User from "../models/userModel.ts";
import connectDB  from "../config/db.ts"
import config from "../config/config.ts";


connectDB();

const createAdmin=async()=>{
  try{
    console.log(`Existing user "${config.ADMIN_EMAIL}" promoted to admin.`);
    const existingAdmin = await User.findOne({ email: config.ADMIN_EMAIL});
    if(existingAdmin){
      existingAdmin.role = "admin";
      await existingAdmin.save();
    }else{
      await User.create({
        name: config.ADMIN_NAME,
        email: config.ADMIN_EMAIL,
        password: config.ADMIN_PASSWORD,
        role: "admin",
        isVerified: true, 
      });
      console.log(`New admin user created: ${config.ADMIN_EMAIL} / ${config.ADMIN_PASSWORD}`);
    }
    process.exit(0);
  }catch(err){
    process.exit(1);
  }
};

createAdmin();