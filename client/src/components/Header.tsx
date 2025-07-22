import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import SearchPageComponent from "./SearchPageComponent";
import { useEffect, useState } from "react";
import { useUser } from "../hooks/UserContext";
import userApi from "../apis/userApi";

const getColorForCharacters = (
  char1: string | undefined,
  char2: string | undefined
): string => {
  if (!char1 || !char2) return "#fff";

  const colors = [
    "#1E90FF",
    "#FF4500",
    "#32CD32",
    "#8A2BE2",
    "#FF1493",
    "#FFD700",
    "#DC143C",
    "#00CED1",
    "#FF6347",
    "#4682B4",
    "#9932CC",
    "#008080",
    "#2E8B57",
  ];

  char1 = char1.toUpperCase();
  char2 = char2.toUpperCase();

  const charCode1 = char1.charCodeAt(0) - 64;
  const charCode2 = char2.charCodeAt(0) - 64;

  const hash = (charCode1 * 31 + charCode2 * 17) % colors.length;

  return colors[hash];
};

const Header = () => {
  const navigate = useNavigate();

  const [isSearchbarOpen, setIsSearchbarOpen] = useState<boolean>(false);
  const [notificationsCount, setNotificationsCount] = useState<number>(0);

  const fetchNotifications = async () => {
    try {
      const res = await userApi.get("/user/notification?limit=10&cursor=");

      if (res.status == 200) {
        const countUnReadNoti = res.data.notification.filter(
          (noti: any) => noti.isRead == false
        );

        setNotificationsCount(countUnReadNoti.length);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const { user } = useUser();

  return (
    <header className="flex items-center justify-between px-3 py-3 sticky top-0 left-0 w-full z-50 bg-grey01">
      {/* The search bar component */}
      {isSearchbarOpen && (
        <div
          className="w-full absolute top-0 left-0 z-50"
          style={{
            height: innerHeight,
          }}
        >
          <SearchPageComponent setIsSearchbarOpen={setIsSearchbarOpen} />
        </div>
      )}

      <div onClick={() => navigate("/profile")} className="flex items-center cursor-pointer space-x-5 ">
        {/* <img
          onClick={() => navigate("/profile")}
          src={user?.profileImage}
          className="w-9 object-cover rounded-full"
        /> */}
        <div
          className={` text-white w-9 h-9 rounded-full flex items-center justify-center `}
          style={{
            backgroundColor: getColorForCharacters(
              user?.name.charAt(0),
              user?.name.charAt(1)
            ),
          }}
        >
          <p>{user?.name.substring(0, 2).toUpperCase()}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-xs">Welcome!</p>
          <p className="font-semibold">{user?.name}</p>
        </div>
      </div>

      <div className="flex space-x-3 items-center ">
        <div className="text-3xl" onClick={() => setIsSearchbarOpen(true)}>
          <Icon icon={"bitcoin-icons:search-filled"} width={24} height={24} />
        </div>

        <div onClick={() => navigate("/qr")} className="text-3xl">
          <Icon icon={"uil:qrcode-scan"} width={24} height={24} />
        </div>

        <div
          onClick={() => navigate("/notifications")}
          className="text-black text-3xl relative"
        >
          {notificationsCount != 0 && (
            <div className="absolute px-2 py-1  bg-red-600 -top-3 -right-1 rounded-full">
              <p className="text-xs text-white">{notificationsCount}</p>
            </div>
          )}

          <Icon icon="proicons:bell" width="24" height="24" />
        </div>
      </div>
    </header>
  );
};

export default Header;
