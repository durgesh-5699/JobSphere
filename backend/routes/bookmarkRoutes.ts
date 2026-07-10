import { Router } from "express";
import * as bookmarkController from "../controllers/bookmarkController.ts";
import { protect } from "../middleware/authMiddleware.ts";

const bookmarkRouter = Router();

bookmarkRouter.get("/me", protect, bookmarkController.getMyBookmarks);
bookmarkRouter.get("/mine-ids", protect, bookmarkController.getMyBookmarkIds);
bookmarkRouter.post("/:jobId", protect, bookmarkController.toggleBookmark);

export default bookmarkRouter;