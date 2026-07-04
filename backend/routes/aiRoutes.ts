import { Router } from "express";
import * as aiControllers from "../controllers/aiControllers"
import {protect} from "../middleware/authMiddleware.ts"

const aiRouter = Router();

aiRouter.post("/parse-job",protect,aiControllers.parseJobText);

export default aiRouter ;