import Lottie from "lottie-react";
import heroAnimation from "../animations/hero-animation.json";
import { Handshake } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col items-center mt-20">
        <Lottie animationData={heroAnimation} loop={true} />
        <div className="text-center flex flex-col items-center">
          <h1 className="text-3xl font-semibold ">Swipe. Connect. Grow.</h1>
          <p className="w-4/5 mt-4">
            Effortless networking at events—swipe to meet like-minded people,
            make instant connections, and grow your circle!
          </p>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="bg-blue-600 mt-7 font-semibold text-white px-3 py-2 rounded-md text-md"
        >
          Connect Now <Handshake />
        </button>
      </div>
    </>
  );
};

export default Home;
