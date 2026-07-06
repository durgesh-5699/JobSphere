import { Router } from "express";
import * as roomController from "../controllers/roomController.ts"
import {protect} from "../middleware/authMiddleware.ts"

const roomRouter = Router();

roomRouter.post("/",protect,roomController.createRoom);
roomRouter.get("/public",protect,roomController.listPublicRooms);
roomRouter.get("/mine",protect,roomController.listMyRoooms);
roomRouter.get("/search", protect, roomController.searchRooms);
roomRouter.get("/:id",protect,roomController.getRoomById);
roomRouter.post("/:id/join",protect,roomController.joinRoom);
roomRouter.get("/:id/requests",protect,roomController.getPendingRequest);
roomRouter.patch("/:id/request/:membershipId",protect,roomController.respondToRequest);

export default roomRouter ;