import {Router} from "express"
import * as notificationController from "../controllers/notificationController.ts"
import {protect} from "../middleware/authMiddleware.ts"

const notificationRouter = Router();

notificationRouter.get("/",protect,notificationController.getMyNotifications);
notificationRouter.get("/unread-count",protect,notificationController.getUnreadCount);
notificationRouter.patch("/:id/read", protect, notificationController.markAsRead);
notificationRouter.patch("/read-all", protect, notificationController.markAllAsRead);

export default notificationRouter;