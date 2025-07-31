import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as userControllers from "../controllers/userController";
import { authenticate } from "../../../middlewares/authenticate";

const router = express.Router();

// Create user (usually no auth needed if it's a registration endpoint)
router.route("/create").post(asyncHandler(userControllers.createUser));

// Get current user info
router.route("/").get(authenticate, asyncHandler(userControllers.UserInfo));

// Update basic user info
router.route("/edit").put(authenticate, asyncHandler(userControllers.updateUser));

// Update interests or preferences
router.route("/edit-interest").put(authenticate, asyncHandler(userControllers.updateUser));

// Update looking for
router.route("/edit-lookingFor").put(authenticate, asyncHandler(userControllers.updateLookingFor));

// Edit profile picture
router.route("/edit-profile-picture").put(authenticate, asyncHandler(userControllers.editProfilePicture));

// Update badge read status (use PATCH if it's partial, or PUT if full)
router.route("/update-badge-status").patch(authenticate, asyncHandler(userControllers.badgeSplashReadStatus));

// Update bio
router.route("/update-bio").patch(authenticate, asyncHandler(userControllers.updateProfileBio));

// Update social links
router.route("/update-social-links").patch(authenticate, asyncHandler(userControllers.updateSocialLinks));

// Update services offered
router.route("/update-services").patch(authenticate, asyncHandler(userControllers.updateServices));

export default router;
