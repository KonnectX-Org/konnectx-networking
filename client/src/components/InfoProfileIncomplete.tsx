import CircularProgress from "@mui/joy/CircularProgress";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "../hooks/UserContext";
import { useNavigate } from "react-router-dom";

interface InfoProfileIncompleteProps {
  className?: string;
  percentageIncomplete: number;
}
const InfoProfileIncomplete = ({
  className,
  percentageIncomplete,
}: InfoProfileIncompleteProps) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasShownAlert = sessionStorage.getItem("profileAlertShown");
    if (percentageIncomplete > 0 && !hasShownAlert) {
      setIsOpen(true);
      sessionStorage.setItem("profileAlertShown", "true");
    }
  }, [percentageIncomplete]);

  return (
    <div className={`relative ${className}`}>
      <Info
        size={16}
        color={"#3A7CFF"}
        className="cursor-pointer"
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-40 p-2 bg-white border rounded-xl shadow-lg w-[200px] flex flex-col items-center">
          <CircularProgress
            determinate
            value={100 - percentageIncomplete}
            thickness={2}
            color="success"
          >
            {100 - percentageIncomplete}%
          </CircularProgress>
          <h2 className="text-sm font-light mt-2">Hi {user?.name}</h2>
          <p className="font-bold text-darkBg">Complete Your Profile</p>
          <button
            onClick={() => navigate("/profile")}
            className="mt-3 px-4 py-1 bg-darkBg w-full text-white rounded-lg"
          >
            Complete Now
          </button>
        </div>
      )}
      {isOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-30 bg-black opacity-50"
          onClick={() => {
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default InfoProfileIncomplete;
