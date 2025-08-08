import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as friendManagementController from "../controllers/friendController";
import multer from "multer";
import { authenticateEventUser } from "../../../middlewares/authenticateEventUser";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router
  .route("/request-sended")
  .get(
    authenticateEventUser,
    asyncHandler(friendManagementController.getRequestSended)
  );
router
  .route("/request-recieved")
  .get(
    authenticateEventUser,
    asyncHandler(friendManagementController.getRequestRecieved)
  );
router
  .route("/friend-request-Sent")
  .post(
    authenticateEventUser,
    upload.single("video"),
    asyncHandler(friendManagementController.sendFriendRequest)
  );
router
  .route("/accept-reject-friend-request")
  .post(
    authenticateEventUser,
    asyncHandler(friendManagementController.acceptRequestReceived)
  );
router
  .route("/get-all-friends")
  .get(
    authenticateEventUser,
    asyncHandler(friendManagementController.getAllFriends)
  );
router
  .route("/unfollow")
  .delete(
    authenticateEventUser,
    asyncHandler(friendManagementController.unfollowFriend)
  );
router
  .route("/withdraw-friend-request")
  .delete(
    authenticateEventUser,
    asyncHandler(friendManagementController.withdrawFriendRequest)
  );
router
  .route("/quick-add-friend")
  .post(
    authenticateEventUser,
    asyncHandler(friendManagementController.addFriendDirect)
  );

router
  .route("/friend-profile")
  .get(
    authenticateEventUser,
    asyncHandler(friendManagementController.userProfileById)
  );

export default router;
