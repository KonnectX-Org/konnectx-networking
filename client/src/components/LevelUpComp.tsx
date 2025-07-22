import { useNavigate } from "react-router-dom";
import userApi from "../apis/userApi";
import chandraBadge from "../assets/badges/chandra.png";
import lockBadge from "../assets/badges/lock.png";
import levelupBottomImg from "../assets/levelup-bottom-img.png";
import { useUser } from "../hooks/UserContext";
import { badgeInfo } from "../pages/Profile";
import CustomButton from "./CustomButton";

const LevelUpComp = () => {
  const { userLevelData } = useUser();
  const navigate = useNavigate();
  const updateBadgeStatus = async () => {
    try {
      await userApi.put("/user/upadate-badge-status");
      navigate(`/connect/${localStorage.getItem("currentEventId")}`);
    } catch (e) {}
  };

  return (
    <div
      className=" w-full flex flex-col flex-1 overflow-x-hidden"
      style={{
        height: innerHeight,
      }}
    >
      <div className="flex-[0.8] w-full h-full">
        <div className="w-full text-center mt-10">
          <h1 className="text-xl font-bold text-darkBg">Congratulations</h1>
          <p className="text-sm text-primary font-medium">
            Level {userLevelData?.level} Unlocked
          </p>
        </div>

        <div className="flex items-center my-8">
          {/* Left image */}
          <div>
            <img
              className="w-[300px] object-contain -translate-x-9"
              src={chandraBadge}
              alt="chandra badge"
            />
          </div>

          {/* Center image */}
          <div>
            <img
              className="w-[550px] object-contain"
              src={userLevelData ? badgeInfo[userLevelData.level].badge : ""}
              alt="current level up badge"
            />
          </div>

          {/* Right image */}
          <div>
            <img
              className="w-[300px] object-contain translate-x-9"
              src={lockBadge}
              alt="locked badge"
            />
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center space-y-7">
          <div className="w-[85%] text-center space-y-2">
            <p className="text-sm text-grey">You've leveled up to</p>
            <h2 className="text-2xl font-bold text-darkBg">
              {userLevelData ? badgeInfo[userLevelData.level].badgeName : ""}
            </h2>
            <p className="text-xs text-darkBg">{userLevelData?.subText}</p>
          </div>

          <CustomButton
            text="Continue"
            onClick={() => {
              updateBadgeStatus();
            }}
          />
        </div>
      </div>

      <div className="flex-[0.2] w-full h-full flex items-end">
        <img className="w-full object-contain" src={levelupBottomImg} />
      </div>
    </div>
  );
};

export default LevelUpComp;
