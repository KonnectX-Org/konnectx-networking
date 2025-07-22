import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Navbar from "../components/Navbar";

const LayoutWithHeader = () => {
  return (
    <div
      className="w-full flex flex-col flex-1 bg-whiteBG"
      style={{
        minHeight: innerHeight,
        height: innerHeight,
      }}
    >
      <div className="flex-[0.03] w-full h-full">
        <Header />
      </div>

      <div className="flex-[0.89] w-full h-full overflow-y-hidden">
        <Outlet />
      </div>

      <div className="flex-[0.08] w-full h-full flex flex-col justify-end">
        <Navbar />
      </div>
    </div>
  );
};

export default LayoutWithHeader;
