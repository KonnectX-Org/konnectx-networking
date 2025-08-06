import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as userControllers from "../controllers/userController";
import { authenticate } from "../../../middlewares/authenticate";
import { authenticateEventUser, validateEventContext } from "../../../middlewares/authenticateEventUser";

const router = express.Router();

// Create user (usually no auth needed if it's a registration endpoint)
router.route("/create").post(asyncHandler(userControllers.createUser));

// Login endpoints (event-specific)
router.route("/login").post(asyncHandler(userControllers.loginUser));
router.route("/verify-otp").post(asyncHandler(userControllers.verifyOtp));

// Get current user info (event-specific)
router.route("/").get(authenticateEventUser, asyncHandler(userControllers.UserInfo));

// Update basic user info (event-specific)
router
  .route("/edit")
  .put(authenticateEventUser, asyncHandler(userControllers.updateUser));

// Update interests or preferences (event-specific)
router
  .route("/edit-interest")
  .put(authenticateEventUser, asyncHandler(userControllers.updateInterest));

// Update looking for (event-specific)
router
  .route("/edit-lookingFor")
  .put(authenticateEventUser, asyncHandler(userControllers.updateLookingFor));

// Check event registration status (with event validation)
router
  .route("/:eventId/check-registration")
  .get(authenticate, validateEventContext, asyncHandler(userControllers.checkUserEventRegistration));

// Edit profile picture (event-specific)
router
  .route("/edit-profile-picture")
  .put(authenticateEventUser, asyncHandler(userControllers.editProfilePicture));

// Update badge read status (event-specific)
router
  .route("/update-badge-status")
  .patch(authenticateEventUser, asyncHandler(userControllers.badgeSplashReadStatus));

// Update bio (event-specific)
router
  .route("/update-bio")
  .patch(authenticateEventUser, asyncHandler(userControllers.updateProfileBio));

// Update social links (event-specific)
router
  .route("/update-social-links")
  .put(authenticateEventUser, asyncHandler(userControllers.updateSocialLinks));

// Update services offered (event-specific)
router
  .route("/update-services")
  .put(authenticateEventUser, asyncHandler(userControllers.updateServices));

export default router;