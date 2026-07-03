import {Router} from "express"
import * as jobController from '../controllers/jobController.ts'
import {protect} from "../middleware/authMiddleware.ts"

const jobRouter = Router();

jobRouter.post("/",protect,jobController.createJob);
jobRouter.get("/my-jobs",protect,jobController.getMyJobs);
jobRouter.get("/",protect,jobController.getJobs);
jobRouter.get("/:id",protect,jobController.getJobById);
jobRouter.delete("/:id",protect,jobController.deleteJob);

export default jobRouter
