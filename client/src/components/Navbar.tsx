import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const NavButton = ({
  icon,
  title,
  toRoute,
  isActive,
  setCurrentTab,
  tabNo,
}: {
  icon: string;
  title: string;
  toRoute: string;
  isActive: boolean;
  setCurrentTab: React.Dispatch<React.SetStateAction<number>>;
  tabNo: number;
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        setCurrentTab(tabNo);
        navigate(toRoute);
      }}
      className="flex flex-col items-center space-y-1 "
    >
      <Icon
        icon={icon}
        width={20}
        height={20}
        className={`${isActive && "text-primary"}`}
      />
      <p className={`text-xs ${isActive && "text-primary"}`}>{title}</p>
    </div>
  );
};

const Navbar = () => {
  const { eventId } = useParams();

  const location = useLocation();

  const [currentTab, setCurrentTab] = useState<number>(0);

  useEffect(() => {
    const paths = location.pathname.split("/");

    if (eventId) {
      localStorage.setItem("currentEventId", eventId);
    }

    if (paths[1] == "connect") setCurrentTab(0);
    else if (paths[1] == "network") setCurrentTab(1);
    else if (paths[1] == "profile") setCurrentTab(2);
  }, [location]);

  return (
    <div className="w-full h-fit py-2 bg-grey01 flex items-center justify-evenly border-t border-t-lightGrey">
      <NavButton
        icon={"proicons:home"}
        title="Home"
        tabNo={0}
        toRoute={
          eventId
            ? `/connect/${eventId}`
            : `/connect/${localStorage.getItem("currentEventId")}`
        }
        isActive={currentTab == 0}
        setCurrentTab={setCurrentTab}
      />
      <NavButton
        icon={"material-symbols-light:business-messages-outline-rounded"}
        title="My Network"
        toRoute={`/network`}
        isActive={currentTab == 1}
        tabNo={1}
        setCurrentTab={setCurrentTab}
      />
      <NavButton
        icon={"carbon:user-profile"}
        title="Profile"
        toRoute={`/profile`}
        isActive={currentTab == 2}
        setCurrentTab={setCurrentTab}
        tabNo={2}
      />
    </div>
  );
};

export default Navbar;
