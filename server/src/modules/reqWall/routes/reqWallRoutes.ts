import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as reqWallControllers from "../controllers/reqWallController";

const router = express.Router();

router.post("/postRequirement"             ,  asyncHandler(reqWallControllers.postRequirement));
router.get("/getAllRequirementsOfEvent"    ,  asyncHandler(reqWallControllers.getAllRequirementsOfEvent));
router.post("/postMessage"                 ,  asyncHandler(reqWallControllers.postMessage));
router.get("/getMessagesForRequirement"    ,  asyncHandler(reqWallControllers.getMessagesForRequirement));
// router.get("/deleteEvent"         ,  asyncHandler(reqWallControllers.deleteEvent));
// router.get("/handlePublishQR"     ,  asyncHandler(reqWallControllers.handlePublishQR));
// router.get("/updateAttendeeRoles" ,  asyncHandler(reqWallControllers.updateAttendeeRoles));

export default router;
