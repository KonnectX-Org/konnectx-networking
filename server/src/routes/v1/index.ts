import express from "express";
import userRoutes from "./userRoutes";
import adminRoutes from "./adminRoutes";
import commonRoutes from "./commonRoutes";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/common",commonRoutes)





export default router;
