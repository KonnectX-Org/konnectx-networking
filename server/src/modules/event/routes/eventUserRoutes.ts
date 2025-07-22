import express from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as eventUserControllers from "../controllers/eventUserController";

const router = express.Router();

router.get("/getGuestOfAnEvent"   ,  asyncHandler(eventUserControllers.getGuestOfAnEvent));
router.get("/getAllEventsOfUser"  ,  asyncHandler(eventUserControllers.getAllEventsOfUser));
router.get("/getAttendiesRole"    ,  asyncHandler(eventUserControllers.getAttendiesRole));
router.get("/searchGuestInEvents" ,  asyncHandler(eventUserControllers.searchGuestInEvents));

export default router;



// import express, { Router } from "express";
// import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
// import asyncHandler from "../../../utils/asyncHandler";
// import * as additionalDocControllers from "../../../controllers/visaApplications/additionalDocController";
// import {upload} from "../../../services/s3Upload"


// const router = Router();

// // Additional doc routes

// router.post("/uploadAdditionalDoc/:visaApplicationId/:reqId"      , authenticate  , upload.single("file") ,  asyncHandler(additionalDoxControllers.uploadAdditionalDoc)  );
// router.get("/fetchAdditionalDocsInfo/:visaApplicationId"          , authenticate  ,                          asyncHandler(additionalDoxControllers.fetchAdditionalDocsInfo)  );
// router.post("/requestReUpload/:docStatusId"                       , authenticate  , authorizeAdmin        ,  asyncHandler(additionalDoxControllers.requestReUpload)  );
// router.post("/markAsVerified/:docStatusId"                        , authenticate  , authorizeAdmin        ,  asyncHandler(additionalDoxControllers.markAsVerified)  );
// router.patch("/reuploadAdditionalDoc/:docStatusId"                , authenticate  , upload.single("file") ,  asyncHandler(additionalDoxControllers.reuploadAdditionalDoc)  );


// export default router;