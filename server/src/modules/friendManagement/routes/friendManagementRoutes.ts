import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as friendManagementController from "../controllers/friendController";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });

router.route("/request-sended").get(authenticate, asyncHandler(friendManagementController.getRequestSended));
router.route("/request-recieved").get(authenticate, asyncHandler(friendManagementController.getRequestRecieved));
router.route("/friend-request-Sent").post(authenticate,upload.single('video'), asyncHandler(friendManagementController.sendFriendRequest))
router.route("/accept-reject-friend-request").post(authenticate, asyncHandler(friendManagementController.acceptRequestReceived));
router.route("/get-all-friends").get(authenticate, asyncHandler(friendManagementController.getAllFriends));
router.route("/unfollow").delete(authenticate, asyncHandler(friendManagementController.unfollowFriend));
router.route("/withdraw-friend-request").delete(authenticate, asyncHandler(friendManagementController.withdrawFriendRequest));
router.route("/quick-add-friend").post(authenticate, asyncHandler(friendManagementController.addFriendDirect));

router.route("/friend-profile").get(authenticate, asyncHandler(friendManagementController.userProfileById))

export default router;
