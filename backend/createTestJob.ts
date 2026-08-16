import mongoose from "mongoose";
import { Job } from "./models/jobModel.ts";
import { User } from "./models/userModel.ts";
import { Room } from "./models/roomModel.ts";
import connectDB from "./config/db.ts";

const seedTestJob = async () => {
  try {
    await connectDB();

    // 1. Find your admin user to act as the job poster
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("❌ Admin user not found. Run your admin script first.");
      process.exit(1);
    }

    // 2. Create a test room (if you don't have one)
    let room = await Room.findOne();
    if (!room) {
      room = await Room.create({
        name: "Batch 2026 - CS",
        description: "Main room for CS students",
        isPublic: true,
        owner: adminUser._id
      });
    }

    // 3. Create the Job
    const newJob = await Job.create({
      title: "Frontend Developer Intern",
      company: "Google",
      description: "We are looking for a skilled React developer to join our team for the summer. You will be building user interfaces for our admin dashboards.",
      applyLink: "https://careers.google.com",
      location: "Remote",
      salary: "1.2 Lakh/month",
      skills: ["React", "TypeScript", "Tailwind CSS"],
      deadline: new Date("2026-12-31"),
      postedBy: adminUser._id,
      room: room._id,
    });

    console.log(`✅ SUCCESS! Test job created: ${newJob.title} at ${newJob.company}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create test job:", error);
    process.exit(1);
  }
};

seedTestJob();