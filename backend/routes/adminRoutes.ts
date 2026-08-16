import { Router } from 'express';
import { User } from '../models/userModel.ts';
import { Job } from '../models/jobModel.ts';
import { Room } from '../models/roomModel.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// ==========================================
// 0. ADMIN AUTHENTICATION ENDPOINT
// ==========================================

// POST /api/admin/login
router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Verify they are actually an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    // 3. Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    // 5. Return the token and user data
    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ==========================================
// 1. DASHBOARD OVERVIEW ENDPOINT
// ==========================================

// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalRooms] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Room.countDocuments()
    ]);

    // Hardcoded for now until you create an Application model
    const totalApplications = 210; 

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendData = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          users: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", users: 1 } }
    ]);

    res.json({
      totalUsers,
      totalJobs,
      totalRooms,
      totalApplications,
      newUsersTrend: trendData
    });
  } catch (error) {
    console.error("Overview Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch overview statistics" });
  }
});

// ==========================================
// 2. USER MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password -otp').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req: any, res: any) => {
  try {
    const { role } = req.body;
    const userIdToUpdate = req.params.id;

    // Prevent admin from demoting themselves (if req.user is set by auth middleware)
    if (req.user && req.user._id.toString() === userIdToUpdate && role === 'student') {
      return res.status(400).json({ message: "Action denied: You cannot demote your own admin account." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userIdToUpdate,
      { role },
      { new: true }
    ).select('-password -otp');

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: any, res: any) => {
  try {
    const userIdToDelete = req.params.id;

    if (req.user && req.user._id.toString() === userIdToDelete) {
      return res.status(400).json({ message: "Action denied: You cannot delete your own admin account." });
    }

    const deletedUser = await User.findByIdAndDelete(userIdToDelete);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ==========================================
// 3. ROOM MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/admin/rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('owner', 'name email _id') 
      .sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (error) {
    console.error("Fetch Rooms Error:", error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// ==========================================
// 4. JOB MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/admin/jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name email _id') 
      .populate('room', 'name _id') 
      .sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    console.error("Fetch Jobs Error:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// DELETE /api/admin/jobs/:id
router.delete('/jobs/:id', async (req: any, res: any) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete Job Error:", error);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

export default router;