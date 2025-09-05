import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const LayoutWithOutHeader = () => {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="w-full flex flex-col flex-1 bg-whiteBG"
      style={{
        minHeight: windowHeight,
        height: windowHeight,
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
