import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const LayoutWithOutHeader = () => {
  return (
    <div
      className="w-full flex flex-col flex-1 bg-whiteBG"
      style={{
        minHeight: innerHeight,
        height: innerHeight,
      }}
    >
      <div className="flex-[0.97] w-full h-full overflow-y-hidden">
        <Outlet />
      </div>

      <div className="flex-[0.03] w-full h-full flex flex-col justify-end">
        <Navbar />
      </div>
    </div>
  );
};

export default LayoutWithOutHeader;
