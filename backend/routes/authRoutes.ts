import {Router} from "express"
import * as authController from '../controllers/authController.ts'
import { protect } from "../middleware/authMiddleware.ts";

const authRouter = Router();

authRouter.post("/register",authController.registerUser);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/login",authController.loginUser);
authRouter.post("/logout",authController.logoutUser);
authRouter.get("/me",protect,authController.getMe);

export default authRouter ;