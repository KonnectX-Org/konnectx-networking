import express from "express";
import * as authController from "./authController";
import asyncHandler from "../../utils/asyncHandler";

const router = express.Router();

router.route("/login").post(asyncHandler(authController.login));
router.route("/register-organization").post(asyncHandler(authController.registerOrganization));
router.route("/refresh-token").post(asyncHandler(authController.refreshToken));
router.route("/logout").post(asyncHandler(authController.logout));

export default router;