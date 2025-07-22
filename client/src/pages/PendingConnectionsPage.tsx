import {
  ChevronRightOutlined,
  CloseRounded,
  DoneRounded,
  ExpandLess,
  ExpandMore,
  PlayArrow,
} from "@mui/icons-material";
import avatarProfile from "../assets/tempProfile.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import testRecording from "../assets/test-recording.mp4";
import userApi from "../apis/userApi";
import LoadingComp from "../components/loading/LoadingComp";
import { useSnackbar } from "../hooks/SnackbarContext";

const VideoConnectionRequestCard = () => {
  const interests = ["Science & Technology", "AI & ML", "Business"];

  const [isVideoPaused, setIsVideoPause] = useState<boolean>(true);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const streamToCanvas = () => {
    if (!(canvasRef.current && videoRef.current)) return;

    const canvasW = 400;
    const canvasH = 410;
    const ctx = canvasRef.current.getContext("2d");

    ctx?.clearRect(0, 0, canvasW, canvasH);

    const videoAspectRatio = canvasW / videoRef.current.clientHeight;
    const canvasAspectRatio = canvasW / canvasH;

    let width, height, offX, offY;

    // Scale the video to fit within the canvas dimensions
    if (videoAspectRatio > canvasAspectRatio) {
      // Video is wider than the canvas, fit by height
      height = canvasH;
      width = canvasW * videoAspectRatio;
      offX = (canvasW - width) / 2;
      offY = 0;
    } else {
      // Video is taller than the canvas, fit by width
      width = canvasH;
      height = canvasW / videoAspectRatio;
      offX = 0;
      offY = (canvasH - height) / 2;
    }

    ctx?.drawImage(videoRef.current, offX, offY, width, height);

    requestAnimationFrame(streamToCanvas);
  };

  const pauseVideo = () => {
    if (videoRef.current) videoRef.current.pause();
    setIsVideoPause(true);
  };

  const resumeVideo = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();

    if (videoRef.current) videoRef.current.play();

    setIsVideoPause(false);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onended = () => {
        setIsVideoPause(true);
      };
    }

    requestAnimationFrame(streamToCanvas);
  }, []);

  return (
    <div
      className={`w-full ${
        isExpanded ? "h-fit" : "h-[700px]"
      } py-3 rounded-xl flex flex-col justify-between  bg-blue-400 flex-shrink-0`}
    >
      <div className="px-3 py-2">
        <div className="flex items-center justify-between ">
          <div className="flex items-center">
            <img
              src={avatarProfile}
              alt="Profile pic"
              className="w-16 h-16 object-contain"
            />
            <div className="flex flex-col ml-3 ">
              <h1 className="text-3xl text-white font-medium">Ronak Paul</h1>
              <p className="text-white">Software Developer</p>
            </div>
          </div>

          <div className="text-3xl text-white w-fit h-fit">
            {isExpanded ? (
              <ExpandLess
                onClick={() => setIsExpanded(false)}
                fontSize="inherit"
              />
            ) : (
              <ExpandMore
                onClick={() => setIsExpanded(true)}
                fontSize="inherit"
              />
            )}
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="my-8 flex flex-wrap gap-3">
              {interests.map((label, index) => (
                <div
                  key={index}
                  className={`  bg-blue-200
             w-fit px-3 py-2 rounded-full transition-transform active:scale-95`}
                >
                  <p className="text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xl text-white">
                <span className="font-bold">Industry:</span>
                <span className="text-lg ml-3"> Tech Industry</span>
              </p>
              <p className="text-xl text-white">
                <span className="font-bold">Company:</span>
                <span className="text-lg ml-3">Creative Upaay</span>
              </p>
            </div>

            <div className="my-3">
              <h2 className="text-xl text-white leading-normal">
                Looking for Software Developers, Designers, Game Developer
              </h2>
            </div>
          </>
        )}

        {/* Video Preview section */}
        <div
          className="w-[410px] h-[410px] flex justify-center my-3 relative"
          onClick={pauseVideo}
        >
          <video
            ref={videoRef}
            src={testRecording}
            className="absolute top-0 left-0 -z-20 opacity-0"
          />

          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            {isVideoPaused && (
              <div
                className="text-6xl bg-white rounded-full px-1 text-blue-600"
                onClick={(e) => resumeVideo(e)}
              >
                <PlayArrow fontSize="inherit" />
              </div>
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={"410px"}
            height={"410px"}
            className="rounded-md bg-black"
          ></canvas>
        </div>
      </div>

      <div className=" w-full h-fit flex flex-col justify-center items-center  space-y-2">
        <button className="  bg-blue-600  font-semibold text-white px-3 py-3 rounded-full w-[95%] text-xl">
          Connect Now
        </button>
        <button className="  bg-red-700  font-semibold text-white px-3 py-3 rounded-full w-[95%] text-xl">
          Remove
        </button>
      </div>
    </div>
  );
};

const ConnectionRequestCard = ({
  name,
  interests,
  note,
  id,
}: {
  name: string;
  interests: string[];
  note: string;
  id: string;
}) => {
  const [connectionState, setConnectionState] = useState<
    "ACCEPTED" | "REJECTED" | "PENDING"
  >("PENDING");

  const [isLoading, setIsLoading] = useState<{
    type: "ACCEPTED" | "REJECTED";
    state: boolean;
  }>({ type: "ACCEPTED", state: false });

  const { showSnackbar } = useSnackbar();

  const acceptRjectRequest = async (type: "ACCEPTED" | "REJECTED") => {
    if (isLoading.state) return;

    setIsLoading({ type, state: true });

    try {
      await userApi.post(
        `/user/friend-management/accept-reject-friend-request?senderId=${id}&status=${type}`
      );

      setConnectionState(type);
    } catch (e) {
      showSnackbar("Error in accepting connection", "error");
    }

    setIsLoading({ type, state: false });
  };

  return (
    <div className="w-full h-[700px] py-3 rounded-xl flex flex-col justify-between  bg-blue-400 flex-shrink-0">
      <div className="px-3 py-2">
        <div className="flex items-center ">
          <img
            src={avatarProfile}
            alt="Profile pic"
            className="w-16 h-16 object-contain"
          />
          <div className="flex flex-col ml-3 ">
            <h1 className="text-3xl text-white font-medium">{name}</h1>
            <p className="text-white">Software Developer</p>
          </div>
        </div>

        <div className="my-8 flex flex-wrap gap-3">
          {interests.map((label, index) => (
            <div
              key={index}
              className={`  bg-blue-200
             w-fit px-3 py-2 rounded-full transition-transform active:scale-95`}
            >
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xl text-white">
            <span className="font-bold">Industry:</span>
            <span className="text-lg ml-3"> Tech Industry</span>
          </p>
          <p className="text-xl text-white">
            <span className="font-bold">Company:</span>
            <span className="text-lg ml-3">Creative Upaay</span>
          </p>
        </div>

        <div className="my-3">
          <h2 className="text-xl text-white leading-normal">
            Looking for Software Developers, Designers, Game Developer
          </h2>
        </div>

        <div className="w-full space-y-2">
          <p className="text-lg text-white text-center">Note</p>
          <div className="w-full h-[150px] bg-gradient-to-r from-[#E5E7FF] to-[#FCF1E3] rounded-xl overflow-y-scroll px-2 py-3 text-lg text-center">
            {note}
          </div>
        </div>
      </div>

      {connectionState == "PENDING" ? (
        <div className=" w-full h-fit flex flex-col justify-center items-center  space-y-2">
          <button
            onClick={() => acceptRjectRequest("ACCEPTED")}
            className="  bg-blue-600  font-semibold text-white px-3 py-3 rounded-full w-[95%] text-xl"
          >
            {isLoading.type == "ACCEPTED" && isLoading.state ? (
              <div className="flex justify-center">
                <LoadingComp color="white" />
              </div>
            ) : (
              "Connect Now"
            )}
          </button>
          <button
            onClick={() => acceptRjectRequest("REJECTED")}
            className="  bg-red-700  font-semibold text-white px-3 py-3 rounded-full w-[95%] text-xl"
          >
            {isLoading.type == "REJECTED" && isLoading.state ? (
              <div className="flex justify-center">
                <LoadingComp color="white" />
              </div>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center">
          {connectionState == "ACCEPTED" ? (
            <div className="rounded-full text-5xl bg-white px-4 py-4 flex items-center justify-center">
              <DoneRounded fontSize="inherit" />
            </div>
          ) : (
            <div className="rounded-full text-5xl bg-red-500 color-white px-4 py-4 flex items-center justify-center">
              <CloseRounded fontSize="inherit" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface UserConnectionI {
  name: string;
  email: string;
  note: string;
  video: string;
  senderId: string;
  interest: string[];
}

const PendingConnectionsPage = () => {
  const navigate = useNavigate();

  const [pendingRequests, setPendingRequests] = useState<UserConnectionI[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const response = await userApi.get(
        "/user/friend-management/request-recieved"
      );

      if (response.status == 200) {
        setPendingRequests(response.data.data);
      }

      setIsLoading(false);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <div className="w-full h-full">
      <div className="  px-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Connections{" "}
          <span className="text-blue-600 text-sm ml-2">( 100 )</span>
        </h1>

        <div
          onClick={() => navigate("/connections/all")}
          className="flex items-center space-x-2 text-blue-500"
        >
          <p>Show all</p>
          <ChevronRightOutlined />
        </div>
      </div>
      <div className="my-7 w-full h-full">
        <h2 className=" px-3 text-xl font-medium">
          Pending{" "}
          <span className="text-blue-600 text-sm ml-2">
            ( {pendingRequests.length} )
          </span>
        </h2>
        <div className="my-5 w-full h-full">
          {isLoading ? (
            <div className="w-full h-full flex justify-center">
              <LoadingComp />
            </div>
          ) : (
            <>
              {pendingRequests.length != 0 ? (
                <Swiper
                  spaceBetween={10}
                  slidesPerView={1.1}
                  centeredSlides={true}
                >
                  {pendingRequests?.map((request) => (
                    <SwiperSlide key={request.senderId}>
                      <ConnectionRequestCard
                        name={request.name}
                        interests={request.interest}
                        note={request.note}
                        id={request.senderId}
                      />
                    </SwiperSlide>
                  ))}
                  <SwiperSlide>
                    <VideoConnectionRequestCard />
                  </SwiperSlide>
                </Swiper>
              ) : (
                <div className="w-full h-full text-center">
                  <p className="text-slate-400">No Pending Connections</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingConnectionsPage;
