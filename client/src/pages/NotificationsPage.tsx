import { Icon } from "@iconify/react";
// import OfferBanner from "../components/OfferBanner";
// import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import userApi from "../apis/userApi";

const ActivityCard = ({
  type,
  name,
  userId,
  message,
  isRead,
  notificationId,
}: {
  type: "Note" | "Video";
  name: string;
  userId: string;
  message: string;
  isRead: boolean;
  notificationId: string;
}) => {
  const navigate = useNavigate();

  const readNotification = async () => {
    try {
      await userApi.put(
        `/user/notification/read?notificationId=${notificationId}`
      );
    } catch (e) {}
  };

  return (
    <div
      onClick={() => {
        if (!isRead) readNotification();
        navigate(`/profile/${userId}`);
      }}
      className={`flex items-start space-x-4 ${
        !isRead && "bg-grey01"
      } py-3 px-4`}
    >
      <div className="flex items-center space-x-2">
        <Icon
          icon={type == "Note" ? "proicons:note" : "proicons:video"}
          fontSize={"20px"}
        />
        <p className="text-sm font-bold text-darkBg">
          {name} <span className="font-normal text-grey ml-2">{message}</span>
        </p>
      </div>
    </div>
  );
};

interface notificationI {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  reference: string;
  user: [
    {
      _id: string;
      name: string;
      profileImage: string;
      position: string;
    }
  ];
}

const NotificatonsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<notificationI[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await userApi.get("/user/notification?limit=10&cursor=");

      if (res.status == 200) {
        setNotifications(res.data.notification);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
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
          <p className="font-medium">Notifications</p>
        </div>
      </div>
      {/* <OfferBanner /> */}

      <div className="w-full h-full flex flex-col py-4  overflow-y-scroll no-scrollbar">
        <div>
          <div className="flex items-center space-x-2 px-4">
            <Icon icon={"hugeicons:activity-01"} fontSize={"22px"} />
            <p className="text-sm font-medium text-darkBg">Activity</p>
          </div>

          {notifications?.length == 0 ? (
            <div className="w-full my-8 text-center">
              <p className="text-xs text-grey">No notifications</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {notifications?.map((notification) => (
                <ActivityCard
                  key={notification._id}
                  type="Note"
                  message={notification.message}
                  name={notification.user[0].name}
                  userId={notification.user[0]._id}
                  isRead={notification.isRead}
                  notificationId={notification._id}
                />
              ))}

              {/* <div className="flex items-center justify-center space-x-3">
                <p className="text-xs text-grey">View All</p>
                <Icon
                  icon="tabler:chevron-down"
                  fontSize={"16px"}
                  className="text-grey"
                />
              </div> */}
            </div>
          )}
        </div>

        {/* <div className="mt-9 space-y-4"> */}
        {/* Video Requests */}
        {/* <Accordion
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
                padding: "0px",
              }}
            >
              <div className="flex items-center space-x-2">
                <Icon icon={"proicons:video"} fontSize={"20px"} />
                <p>Video Requests</p>
              </div>
            </AccordionSummary>

            <AccordionDetails></AccordionDetails>
          </Accordion> */}
        {/* Note Requests */}
        {/* <Accordion
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
              aria-controls="panel2-content"
              id="panel2-header"
              sx={{
                padding: "0px",
              }}
            >
              <div className="flex items-center space-x-2">
                <Icon icon={"proicons:note"} fontSize={"20px"} />
                <p>Note Requests</p>
              </div>
            </AccordionSummary>

            <AccordionDetails></AccordionDetails>
          </Accordion> */}
        {/* </div> */}
      </div>
    </div>
  );
};

export default NotificatonsPage;
