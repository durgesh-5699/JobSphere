import {Router} from "express"
import * as jobController from '../controllers/jobController.ts'
import * as matchController from '../controllers/matchController.ts'
import {protect} from "../middleware/authMiddleware.ts"

const jobRouter = Router();

jobRouter.post("/",protect,jobController.createJob);
jobRouter.get("/locations", protect, jobController.getJobLocations); 
jobRouter.get("/my-jobs",protect,jobController.getMyJobs);
jobRouter.get("/",protect,jobController.getJobs);
jobRouter.get("/recommended", protect, matchController.getRecommendedJobs);
jobRouter.get("/:id",protect,jobController.getJobById);
jobRouter.delete("/:id",protect,jobController.deleteJob);
jobRouter.get("/:id/match", protect, matchController.getJobMatch);

export default jobRouter
