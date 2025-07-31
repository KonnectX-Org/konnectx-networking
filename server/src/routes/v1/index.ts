import { Router } from "express";
import userRouter from "./userRoutes";
import organizationRoutes from "./organizationRoutes";
import authRoutes from "../../modules/auth/authRoutes";
import microCallRoutes from "../../modules/microCalls/routes/microCallRoutes";


const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRouter);
router.use("/organization", organizationRoutes);
router.use("/microCalls", microCallRoutes);

export default router;
