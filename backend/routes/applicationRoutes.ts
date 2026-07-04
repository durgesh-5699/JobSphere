import { Router } from 'express';
import {protect} from "../middleware/authMiddleware.ts"
import * as applicationController from "../controllers/applicationController.ts"

const applicationRouter = Router()

applicationRouter.post("/",protect,applicationController.applyToJob);
applicationRouter.get("/me",protect,applicationController.getMyApplication);

export default applicationRouter;