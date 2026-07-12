import { Router } from "express";
import * as roomController from "../controllers/roomController.ts"
import * as analyticsController from "../controllers/analyticsController.ts"
import {protect} from "../middleware/authMiddleware.ts"

const roomRouter = Router();

roomRouter.post("/",protect,roomController.createRoom);
roomRouter.get("/public",protect,roomController.listPublicRooms);
roomRouter.get("/mine",protect,roomController.listMyRoooms);
roomRouter.get("/search", protect, roomController.searchRooms);
roomRouter.get("/:id",protect,roomController.getRoomById);
roomRouter.post("/:id/join",protect,roomController.joinRoom);
roomRouter.get("/:id/jobs", protect, roomController.getRoomJobs);
roomRouter.get("/:id/members", protect, roomController.getRoomMembers);
roomRouter.get("/:id/analytics", protect, analyticsController.getRoomAnalytics);
roomRouter.get("/:id/requests",protect,roomController.getPendingRequest);
roomRouter.patch("/:id/requests/:membershipId",protect,roomController.respondToRequest);
roomRouter.delete("/:id/members/:membershipId", protect, roomController.removeMember);

export default roomRouter ;