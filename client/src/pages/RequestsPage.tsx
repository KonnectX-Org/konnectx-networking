import { Icon } from "@iconify/react";
// import OfferBanner from "../components/OfferBanner";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
// import videoTestImg from "../assets/test-video-image.png";
import userApi from "../apis/userApi";
import { useSnackbar } from "../hooks/SnackbarContext";
import { getTimeAgo } from "../utils/time";

// const VideoCard = () => {
//   return (
//     <div className="flex flex-col w-28 h-fit flex-shrink-0 mx-1">
//       <div className="w-full h-48 rounded-lg">
//         <img
//           src={videoTestImg}
//           alt="video test image"
//           className="w-full h-full object-cover rounded-lg"
//         />
//       </div>

//       <div className="flex flex-col space-y-[1px] mt-1">
//         <p className="text-xs font-bold">Ronak Paul</p>
//         <p className="text-[10px] text-grey">Founder</p>
//       </div>
//     </div>
//   );
// };

const NoteCard = ({
  receiverId,
  senderId,
  name,
  note,
  type,
  removeCard,
  createdAt,
}: {
  receiverId: string;
  senderId: string;
  name: string;
  note: string;
  type: "sent" | "received";
  removeCard: Function;
  createdAt: string;
}) => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [isNoteExpanded, setIsNoteExpanded] = useState<boolean>(false);

  const acceptOrRejectReq = async (status: "ACCEPTED" | "REJECTED") => {
    try {
      await userApi.post(
        `/user/friend-management/accept-reject-friend-request?senderId=${senderId}&status=${status}`
      );

      removeCard("received", senderId);

      showSnackbar(
        `Request is ${status.toLowerCase()} successfully`,
        "success"
      );
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
        `/user/friend-management/withdraw-friend-request?receiverId=${receiverId}`
      );

      if (res.status == 200) {
        removeCard("sent", receiverId);
        showSnackbar("Request is withdrawed successfully", "success");
      }
    } catch (e) {
      showSnackbar("Error in withdrawing the request", "error");
    }
  };

  return (
    <div className="flex items-center justify-between">
      {/* left section */}
      <div>
        <div
          onClick={() => {
            navigate(`/profile/${type == "sent" ? receiverId : senderId}`);
          }}
          className="flex items-center space-x-2"
        >
          <p className="text-sm font-bold text-darkBg">{name}</p>
          <p className="text-xs text-grey">Freelancer</p>
        </div>
        <div className="flex flex-col space-y-1">
          {note != "" && (
            <>
              <p className="text-sm text-grey">
                “{isNoteExpanded ? note : `${note.substring(0, 40)}...`}"
              </p>

              <p
                className="text-primary text-sm"
                onClick={() => setIsNoteExpanded(!isNoteExpanded)}
              >
                {isNoteExpanded ? "View Less" : "Tap to view"}
              </p>
            </>
          )}

          <p className="text-xs text-grey">{getTimeAgo(createdAt)}</p>
        </div>
      </div>

      {/* right section */}
      <div className="flex items-center space-x-2">
        {type == "received" && (
          <div
            onClick={() => acceptOrRejectReq("ACCEPTED")}
            className="border border-darkBg bg-darkBg px-2 py-2 rounded-xl text-white"
          >
            <Icon icon={"material-symbols:done-rounded"} fontSize={"16px"} />
          </div>
        )}

        <div
          onClick={() => {
            if (type == "received") acceptOrRejectReq("REJECTED");
            else if (type == "sent") withdrawalRequest();
          }}
          className="border border-darkBg text-darkBg px-2 py-2 rounded-xl"
        >
          <Icon icon={"material-symbols:close-rounded"} fontSize={"16px"} />
        </div>
      </div>
    </div>
  );
};

interface UserConnectionI {
  name: string;
  email: string;
  note: string;
  video: string;
  senderId: string;
  receiverId: string;
  interest: string[];
  createdAt: string;
}

const RequestsPage = () => {
  const navigate = useNavigate();
  const { rtype } = useParams();

  const [currentTab, setCurrentTab] = useState<"received" | "sent">("received");

  //   const [_isVideoSectionExpanded, setIsVideoSectionExpanded] =
  //     useState<boolean>(false);

  //   const [isNoteSectionExpanded, setIsNoteSectionExpanded] =
  //     useState<boolean>(true);

  const [pendingRequests, setPendingRequests] = useState<UserConnectionI[]>([]);
  const [noteRequestsSent, setNoteRequestsSent] = useState<UserConnectionI[]>(
    []
  );

  const fetchPendingRequests = async () => {
    try {
      const response = await userApi.get(
        "/user/friend-management/request-recieved"
      );

      if (response.status == 200) {
        setPendingRequests(response.data.data);
      }
    } catch (e) {}
  };

  const fetchRequestsSent = async () => {
    try {
      const response = await userApi.get(
        "/user/friend-management/request-sended"
      );

      if (response.status == 200) setNoteRequestsSent(response.data.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPendingRequests();
    fetchRequestsSent();
  }, []);

  const removeCard = (type: "sent" | "received", id: string) => {
    if (type == "sent") {
      setNoteRequestsSent((requests) => {
        const temp = requests.filter((request) => request.receiverId != id);

        return temp;
      });
    } else if (type == "received") {
      setPendingRequests((requests) => {
        const temp = requests.filter((request) => request.senderId != id);
        return temp;
      });
    }
  };

  useEffect(() => {
    // setting the current tab from the url param
    if (rtype) setCurrentTab(rtype as "received" | "sent");
  }, []);

  return (
    <div className="w-full h-full">
      <div className="bg-grey01 px-3 py-5">
        <div className="text-darkBg space-x-3 flex items-center">
          <Icon
            onClick={() => navigate(-1)}
            icon="proicons:arrow-left"
            width="24"
            height="24"
          />
          <p className="font-medium">Requests</p>
        </div>
      </div>
      {/* <OfferBanner /> */}

      <div className="py-4 h-full overflow-y-scroll">
        {/* Tabs */}
        <div className="flex items-center space-x-3 px-3">
          <div
            className={`border border-darkBg rounded-md px-2 py-1 ${
              currentTab != "received" && "opacity-50"
            }`}
            onClick={() => setCurrentTab("received")}
          >
            <p className="text-sm font-medium text-darkBg">Received</p>
          </div>

          <div
            className={`border border-darkBg rounded-md px-2 py-1 ${
              currentTab != "sent" && "opacity-50"
            }`}
            onClick={() => setCurrentTab("sent")}
          >
            <p className="text-sm font-medium text-darkBg">Sent</p>
          </div>
        </div>

        <div className="mt-3 space-y-4 pt-5 px-3">
          {/* Video Requests */}
          {/* <Accordion
            onChange={(_, isExpanded) => {
              setIsVideoSectionExpanded(isExpanded);
              setIsNoteSectionExpanded(false);
            }}
            expanded={isVideoSectionExpanded}
            sx={{
              border: "none",
              boxShadow: "none",
              padding: "0px",
              backgroundColor: "transparent",
            }}
          >
            <AccordionSummary
              expandIcon={
                <Icon icon={"tabler:chevron-down"} fontSize={"20px"} />
              }
              aria-controls="panel1-content"
              id="panel1-header"
              sx={{
                padding: "0px 12px",
              }}
            >
              <div className="flex items-center space-x-2">
                <Icon icon={"proicons:video"} fontSize={"20px"} />
                <p>Video Requests {currentTab == "sent" && "Sent to"}</p>
              </div>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                padding: "0px 0px",
              }}
            >
              <div className="w-full flex items-center  overflow-x-scroll no-scrollbar">
                <VideoCard />
                <VideoCard />
                <VideoCard />
                <VideoCard />
                <VideoCard />
                <VideoCard />
                <VideoCard />
              </div>
            </AccordionDetails>
          </Accordion> */}

          {/* Note Requests */}

          <div className="w-full space-y-3">
            {currentTab == "sent"
              ? noteRequestsSent.map((req, index) => (
                  <NoteCard
                    type="sent"
                    key={index}
                    receiverId={req.receiverId}
                    senderId={req.senderId}
                    name={req.name}
                    note={req.note}
                    removeCard={removeCard}
                    createdAt={req.createdAt}
                  />
                ))
              : pendingRequests.map((req, index) => (
                  <NoteCard
                    type="received"
                    key={index}
                    receiverId={req.receiverId}
                    senderId={req.senderId}
                    name={req.name}
                    note={req.note}
                    removeCard={removeCard}
                    createdAt={req.createdAt}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;
