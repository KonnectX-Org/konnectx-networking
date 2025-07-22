import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";
// import OfferBanner from "../components/OfferBanner";
import userApi from "../apis/userApi";
import React, { useEffect, useState } from "react";
import { userI } from "../types/userTypes";
import CustomButton from "../components/CustomButton";
import { useSnackbar } from "../hooks/SnackbarContext";
import { badgeInfo } from "./Profile";
import { eventId } from "../utils/eventId";

const ConnectionProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profileInfo, setProfileInfo] = useState<userI | undefined>(undefined);
  const [profileLevelData, setProfileLevelData] = useState<{
    badgeName: string;
    level: number;
  }>({ badgeName: "", level: 0 });

  const { showSnackbar } = useSnackbar();

  const [currentState, setCurrentState] = useState<
    | "REQUEST_SENT"
    | "REQUEST_RECEIVED"
    | "CONNECTED"
    | "NOT_CONNECTED"
    | undefined
  >(undefined);

  const fetchProfile = async () => {
    try {
      const res = await userApi.get(
        `/user/friend-management/friend-profile?friendId=${id}`
      );

      console.log(res.data);

      if (res.status == 200) {
        setProfileInfo(res.data.friendProfile[0]);
        setCurrentState(res.data.friendProfile[0].friendShipStatus);

        if (res.data.friendProfile[0].badgeInfo)
          setProfileLevelData(res.data.friendProfile[0].badgeInfo);
      }
    } catch (e) {}
  };

  const acceptOrRejectReq = async (status: "ACCEPTED" | "REJECTED") => {
    try {
      await userApi.post(
        `/user/friend-management/accept-reject-friend-request?senderId=${id}&status=${status}`
      );

      showSnackbar(
        `Request is ${status.toLowerCase()} successfully`,
        "success"
      );

      if (status == "ACCEPTED") setCurrentState("CONNECTED");
      else if (status == "REJECTED") setCurrentState("NOT_CONNECTED");
    } catch (e) {
      if (status == "ACCEPTED")
        showSnackbar("Error in accepting the request", "error");
      else if (status == "REJECTED")
        showSnackbar("Error in rejecting the request", "error");
    }
  };

  const withdrawalRequest = async () => {
    try {
      const res = await userApi.delete(
        `/user/friend-management/withdraw-friend-request?receiverId=${id}`
      );

      if (res.status == 200) {
        showSnackbar("Request is withdrawed successfully", "success");
        setCurrentState("NOT_CONNECTED");
      }
    } catch (e) {
      showSnackbar("Error in withdrawing the request", "error");
    }
  };

  const sendQuickConnect = async () => {
    try {
      const response = await userApi.post(
        "user/friend-management/friend-request-Sent",
        {
          data: {
            recieverId: id,
            note: "",
          },
        }
      );

      if (response.status == 200) {
        showSnackbar("Request sent", "success");
        setCurrentState("REQUEST_SENT");
      }
    } catch (e) {
      showSnackbar("Error in sending the request", "error");
    }
  };

  const saveContact = async () => {
    const url = `https://wa.me/91${profileInfo?.contactNumber}?text=Hi%20${profileInfo?.name}%21%20Great%20meeting%20you%20at%20TIECON.%20Let%E2%80%99s%20connect%20and%20stay%20in%20touch%21`;

    window.open(url);
  };

  // const saveContact = async () => {
  //   const vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${profileInfo?.name}\nEMAIL:${profileInfo?.email}\nORG:${profileInfo?.company}\nTEL:${profileInfo?.contactNumber}\nEND:VCARD`;

  //   const blob = new Blob([vCardData], { type: "text/vcard" });
  //   const url = URL.createObjectURL(blob);

  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `${name}.vcf`;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);

  //   URL.revokeObjectURL(url);

  //   setTimeout(() => {
  //     const userConfirmed = confirm("The contact has been downloaded. Would you like to open it now?");
  //     if (userConfirmed) {
  //       window.open(url, "_self"); // Try opening it automatically
  //     }
  //   }, 500);
  // };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* top header */}
      <div className="bg-grey01 px-3 py-5 flex items-center justify-between">
        <div className="text-darkBg space-x-3 flex items-center">
          <Icon
            onClick={() => navigate(`/connect/${eventId}`)}
            icon="proicons:arrow-left"
            fontSize={"24px"}
          />
          <p className="font-medium">Profile</p>
        </div>
      </div>
      {/* <OfferBanner /> */}

      <div className="w-full h-full relative overflow-y-scroll no-scrollbar">
        {/* main profile section with name and badge */}
        <div className="flex flex-col justify-center items-center mt-4 space-y-2 ">
          <p className="text-xl font-bold">{profileInfo?.name}</p>
          <img
            src={
              badgeInfo[profileLevelData?.level ? profileLevelData?.level : 0]
                .badge
            }
            alt="badge"
            className="w-24 object-contain "
          />
        </div>

        {/* Other contents */}
        <div className="w-full bg-transparent px-3 absolute top-28 left-0 space-y-4">
          {/* badge current score section */}
          <div className="w-full bg-white p-3 space-y-3 rounded-lg">
              <p className="text-md text-center font-medium text-darkBg">
                {profileLevelData?.badgeName}
              </p>
              {/* <p className="text-[10px] text-darkBg">
                Connections Made : {profileInfo?.connections}
              </p> */}
            {/* Level bar */}
            {/* <div className="w-full h-3 bg-[#EDE8FF] rounded-full">
              <div
                className={` h-full bg-[#7E1891] rounded-full`}
                style={{
                  width: `${
                    profileInfo
                      ? (profileInfo.connections /
                          badgeInfo[profileLevelData.level].connectionsNeeded) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div> */}

            {/* personal details section */}

            {profileInfo?.friendShipStatus == "CONNECTED" && (
              <div className="w-full bg-white p-3 rounded-lg">
                <p className="text-sm font-medium">Personal Details</p>

                <div className="w-full flex-1 flex flex-col space-y-4 my-3">
                  <div className="flex items-center">
                    <div className="flex-[0.5] w-full text-sm text-grey">
                      <p>Name</p>
                    </div>

                    <div className="flex-[0.5] w-full text-sm text-darkBg">
                      <p>{profileInfo?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-[0.5] w-full text-sm text-grey">
                      <p>Email</p>
                    </div>

                    <div className="flex-[0.5] w-full text-sm text-darkBg">
                      <p>{profileInfo?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-[0.5] w-full text-sm text-grey">
                      <p>Phone Number</p>
                    </div>

                    <div className="flex-[0.5] w-full text-sm text-darkBg">
                      <p>{profileInfo?.contactNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* professoinal details section */}
            <div className="w-full bg-white p-3 rounded-lg">
              <p className="text-sm font-medium">Professional Details</p>

              <div className="w-full flex-1 flex flex-col space-y-4 my-3">
                <div className="flex items-center">
                  <div className="flex-[0.5] w-full text-sm text-grey">
                    <p>Work Status</p>
                  </div>

                  <div className="flex-[0.5] w-full text-sm text-darkBg">
                    <p>{profileInfo?.position}</p>
                  </div>
                </div>

                {profileInfo?.company && (
                  <div className="flex items-center">
                    <div className="flex-[0.5] w-full text-sm text-grey">
                      <p>Company Name</p>
                    </div>

                    <div className="flex-[0.5] w-full text-sm text-darkBg">
                      <p>{profileInfo?.company}</p>
                    </div>
                  </div>
                )}

               {profileInfo?.profession && <div className="flex items-center">
                  <div className="flex-[0.5] w-full text-sm text-grey">
                    <p>Role</p>
                  </div>

                  <div className="flex-[0.5] w-full text-sm text-darkBg">
                    <p>{profileInfo?.profession}</p>
                  </div>
                </div>}
              </div>
            </div>

            {/* interests section */}
            {profileInfo?.position != "Employee" &&
              profileInfo?.position != "Freelancer" && (
                <div className="w-full bg-white p-3 rounded-lg">
                  <p className="text-sm font-medium">{profileInfo?.position==="Student"?"Interests":"Industry"}</p>

                  <div className="w-full flex items-center  my-3 text-sm text-darkBg">
                    <p>
                      {profileInfo?.industry.map((label, index) => (
                        <React.Fragment key={index}>
                          {label}
                          {index != profileInfo.industry.length - 1 && ", "}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </div>
              )}

            {/* Want to network with section */}
            <div className="w-full bg-white p-3 rounded-lg pb-[200px]">
              <p className="text-sm font-medium">Want to network with</p>

              <div className="w-full flex items-center space-x-2 my-3 text-sm text-darkBg">
                <p>
                  {profileInfo?.lookingFor.map((label, index) => (
                    <React.Fragment key={index}>
                      {label}
                      {index != profileInfo.lookingFor.length - 1 && ","}{" "}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accept, reject, Withdraw, connect buttons */}
      <div className="w-full absolute bottom-0 left-0 py-2 px-7 backdrop-blur-md">
        {currentState == "REQUEST_SENT" && (
          <div>
            <CustomButton
              onClick={() => {
                withdrawalRequest();
              }}
              text="Withdraw Request"
              type="filled"
              width="100%"
              bgColor="#ef4444"
            />
          </div>
        )}

        {currentState == "NOT_CONNECTED" && (
          <div>
            <CustomButton
              onClick={() => {
                sendQuickConnect();
              }}
              text="Connect"
              type="filled"
              width="100%"
              bgColor="#16a34a"
            />
          </div>
        )}

        {currentState == "CONNECTED" && (
          <div>
            <CustomButton
              onClick={() => {
                saveContact();
              }}
              text="Connect on WhatsApp"
              type="filled"
              width="100%"
            />
          </div>
        )}

        {currentState == "REQUEST_RECEIVED" && (
          <div className="flex items-center w-full space-x-3">
            <CustomButton
              onClick={() => {
                acceptOrRejectReq("ACCEPTED");
              }}
              text="Accept"
              type="filled"
              width="100%"
              bgColor="#16a34a"
            />

            <CustomButton
              onClick={() => {
                acceptOrRejectReq("REJECTED");
              }}
              text="Reject"
              type="outlined"
              width="100%"
              bgColor="#ef4444"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionProfile;
