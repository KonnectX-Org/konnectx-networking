import { Router } from "express";
import userRouter from "./userRoutes";
import organizationRoutes from "./organizationRoutes";
import authRoutes from "../../modules/auth/authRoutes";

const router = Router();


router.use("/auth", authRoutes);
router.use("/user", userRouter);
router.use("/organization", organizationRoutes);

export default router;
