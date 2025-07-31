import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as eventUserControllers from "../controllers/eventUserController";
import { authenticate } from "../../../middlewares/authenticate";

const router = express.Router();

router.get(
  "/get-all-event-Guest",
  authenticate,
  asyncHandler(eventUserControllers.getGuestOfAnEvent)
);
router.get(
  "/get-events",
  authenticate,
  asyncHandler(eventUserControllers.getAllEventsOfUser)
);
router.get(
  "/get-attendees-list",
  authenticate,
  asyncHandler(eventUserControllers.getAttendiesRole)
);
router.get(
  "/search-guests",
  authenticate,
  asyncHandler(eventUserControllers.searchGuestInEvents)
);

export default router;
