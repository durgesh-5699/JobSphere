import { Router } from "express";
import * as profileController from "../controllers/profileController.ts"
import {protect} from "../middleware/authMiddleware.ts"
import { upload } from "../middleware/uploadMiddleware.ts";

const profileRouter = Router();

profileRouter.get("/user/:userId", protect, profileController.getProfileByUserId);
profileRouter.get("/me",protect,profileController.getMyProfile);
profileRouter.put("/me",protect,profileController.updateMyProfile);
profileRouter.post("/resume",protect,upload.single("resume"),profileController.uploadResume);

export default profileRouter ;