import { ReactNode } from "react";
import adImg from "../assets/ad-image.png";

const AdCard = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full h-[450px] rounded-xl bg-grey01 relative">
      <div className="text-2xl font-semibold text-darkBg px-7 py-6 w-[75%]">
        {children}
      </div>

      <div className="absolute right-0 bottom-3 ">
        <img src={adImg} alt="Ad image" className="w-[230px] object-contain" />
      </div>
    </div>
  );
};

export default AdCard;
