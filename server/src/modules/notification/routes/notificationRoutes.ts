import express from "express";
import { authenticate } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as notificationController from "../controllers/notification";

const router = express.Router();

router.route("/").get(authenticate, asyncHandler(notificationController.getNotification))
router.route("/read").put(authenticate, asyncHandler(notificationController.markNotificationRead));
router.route("/delete").delete(asyncHandler(notificationController.deleteNotification));

export default router;