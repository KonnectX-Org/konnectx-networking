import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as eventUserControllers from "../controllers/eventUserController";
import { authenticateEventUser } from "../../../middlewares/authenticateEventUser";

const router = express.Router();

router.get(
  "/get-all-event-Guest",
  authenticateEventUser,
  asyncHandler(eventUserControllers.getGuestOfAnEvent)
);
router.get(
  "/get-events",
  authenticateEventUser,
  asyncHandler(eventUserControllers.getAllEventsOfUser)
);
router.get(
  "/get-attendees-list",
  authenticateEventUser,
  asyncHandler(eventUserControllers.getAttendiesRole)
);
router.get(
  "/search-guests",
  authenticateEventUser,
  asyncHandler(eventUserControllers.searchGuestInEvents)
);

export default router;
