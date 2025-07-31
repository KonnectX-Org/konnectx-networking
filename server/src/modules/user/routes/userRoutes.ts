import { Router } from "express";
import * as UserController from "../controllers/userController";
import { authenticate } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";

const router = Router();

router.post("/create", asyncHandler(UserController.createUser));
router.get("/", authenticate, asyncHandler(UserController.UserInfo));
router.put("/update-socials", authenticate, asyncHandler(UserController.updateSocialLinks));

export default router;
