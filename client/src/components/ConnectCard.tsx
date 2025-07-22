import React, { useState } from "react";
import { useSnackbar } from "../hooks/SnackbarContext";
import userApi from "../apis/userApi";
import { Icon } from "@iconify/react";
import ReactCardFlip from "react-card-flip";
import CircularProgress from "@mui/material/CircularProgress";
import { industries } from "./formSections/FormSection3";

enum CARD_COLORS {
  "FOUNDER" = "bg-[linear-gradient(40deg,_#FFA469_42%,_#FF6B0B_100%)]",
  "STUDENT" = "bg-[linear-gradient(40deg,_#FF6F72_29%,_#EC0004_100%)]",
  "INVESTOR" = "bg-[linear-gradient(40deg,_#6D9EFF_29%,_#1362FF_100%)]",
  "MENTOR" = "bg-[linear-gradient(40deg,_#D386FF_29%,_#9600EC_100%)]",
  "EMPLOYEE" = "bg-[linear-gradient(40deg,_#81B1C4_29%,_#019AD6_100%)]",
  "FREELANCER" = "bg-[linear-gradient(40deg,_#00DD4A_29%,_#00B43C_100%)]",
}

// const VideoPreview = ({
//   stream,
//   startRecording,
//   stopRecording,
//   mediaBlobUrl,
//   status,
// }: {
//   stream: MediaStream | null;
//   startRecording: Function;
//   stopRecording: Function;
//   mediaBlobUrl: string | undefined;
//   status: string;
// }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   const [timer, setTimer] = useState<number>(0);

//   useEffect(() => {
//     startRecording();
//   }, []);

//   useEffect(() => {
//     let interval: number;

//     if (timer < 30) {
//       interval = setTimeout(() => {
//         setTimer((t) => t + 1);
//       }, 1000);
//     }

//     return () => {
//       clearInterval(interval);
//     };
//   }, [timer]);

//   const streamToCanvas = () => {
//     if (!(canvasRef.current && videoRef.current)) return;

//     const canvasW = 410;
//     const canvasH = 410;
//     const ctx = canvasRef.current.getContext("2d");

//     ctx?.clearRect(0, 0, canvasW, canvasH);

//     const videoAspectRatio = canvasW / videoRef.current.clientHeight;
//     const canvasAspectRatio = canvasW / canvasH;

//     let width, height, offX, offY;

//     // Scale the video to fit within the canvas dimensions
//     if (videoAspectRatio > canvasAspectRatio) {
//       // Video is wider than the canvas, fit by height
//       height = canvasH;
//       width = canvasW * videoAspectRatio;
//       offX = (canvasW - width) / 2;
//       offY = 0;
//     } else {
//       // Video is taller than the canvas, fit by width
//       width = canvasH;
//       height = canvasW / videoAspectRatio;
//       offX = 0;
//       offY = (canvasH - height) / 2;
//     }

//     ctx?.drawImage(videoRef.current, offX, offY, width, height);

//     requestAnimationFrame(streamToCanvas);
//   };

//   useEffect(() => {
//     if (videoRef.current && stream) {
//       videoRef.current.srcObject = stream;
//     }

//     requestAnimationFrame(streamToCanvas);
//   }, [stream]);

//   if (!stream) {
//     return null;
//   }

//   return (
//     <>
//       <video
//         ref={videoRef}
//         className="absolute left-0 top-0 -z-10 opacity-0"
//         autoPlay
//       />

//       {/* Recorded video preview */}
//       {status == "stopped" && (
//         <video
//           src={mediaBlobUrl}
//           className="absolute left-0 top-0 z-10"
//           autoPlay
//           controls
//         />
//       )}

//       <video className="absolute left-0 top-0 z-10" />
//       <div className="relative">
//         <div className="absolute top-3 right-3 bg-white rounded-full px-5">
//           <p className="text-blue-600">{timer}/30s</p>
//         </div>
//         <div className="absolute right-3 bottom-3 text-center flex items-center space-x-3">
//           <div
//             className=" text-5xl bg-blue-100 flex items-center justify-center rounded-full text-blue-600"
//             onClick={() => {
//               stopRecording();
//             }}
//           >
//             <FiberPinSharp />
//           </div>
//         </div>

//         <canvas
//           ref={canvasRef}
//           width={"380px"}
//           height={"410px"}
//           className="rounded-md"
//         ></canvas>
//       </div>
//     </>
//   );
// };

export const InfoSection = ({
  heading,
  text,
  theme = "light",
}: {
  heading: string;
  text: string;
  theme?: "dark" | "light";
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div
        className={`w-1 h-8 ${
          theme == "dark" ? "bg-darkBg" : "bg-white"
        } rounded-r-lg`}
      ></div>

      <div>
        <div className="flex items-center space-x-2">
          <Icon
            icon={"solar:suitcase-outline"}
            fontSize={"12px"}
            color={theme == "dark" ? "#242424" : "#fff"}
          />
          <p
            className={`text-xs font-extralight ${
              theme == "dark" ? "text-darkBg" : "text-white"
            }`}
          >
            {heading}
          </p>
        </div>

        <p
          className={`text-sm font-medium ${
            theme == "dark" ? "text-darkBg" : "text-white"
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

const getGradientCardColor = (position: string | undefined) => {
  if (!position) return CARD_COLORS.FOUNDER;

  if (position == "Founder") return CARD_COLORS.FOUNDER;
  else if (position == "Student") return CARD_COLORS.STUDENT;
  else if (position == "Investor") return CARD_COLORS.INVESTOR;
  else if (position == "Mentor") return CARD_COLORS.MENTOR;
  else if (position == "Employee") return CARD_COLORS.EMPLOYEE;
  else if (position == "Freelancer") return CARD_COLORS.FREELANCER;
};

export const getIconFromIndustries = (label: string) => {
  const temp = industries.filter((industry) => industry.label == label);

  if (temp.length != 0) return temp[0].icon;

  return "";
};

const ConnectCard = ({
  name,
  interests,
  company,
  instituteName,
  courseName,
  profession,
  lookingFor,
  position,
  id,
}: {
  name: string;
  interests: string[];
  id: string;
  company?: string;
  instituteName?: string;
  courseName?: string;
  profession?: string;
  position?: string;
  lookingFor?: string[];
}) => {
  const [note, setNote] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuickConnecting, setIsQuickConnecting] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();
  const [isFlipped, setFlipped] = useState<boolean>(false);

  const [isConnected, setIsConnected] = useState<boolean>(false);

  const sendConnectionRequest = async () => {
    if (isConnected) return;

    if (!note) {
      showSnackbar("Please provide a note", "warning");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await userApi.post(
        "user/friend-management/friend-request-Sent",
        {
          data: {
            recieverId: id,
            note,
          },
        }
      );

      if (response.status == 200) {
        setFlipped(false);
        setIsConnected(true);
        showSnackbar("Request is sent successfully", "success");
      }
    } catch (e) {
      showSnackbar("Error in connecting", "error");
    }

    setIsLoading(false);
  };

  const sendQuickConnect = async () => {
    if (isQuickConnecting) return;

    setIsQuickConnecting(true);
    try {
      const response = await userApi.post(
        "user/friend-management/friend-request-Sent",
        {
          data: {
            recieverId: id,
            note: "",
          },
        }
      );

      if (response.status == 200) {
        showSnackbar("Quick Connected", "success");
        setIsConnected(true);
      }
    } catch (e) {
      showSnackbar("Error in quick connecting", "error");
    }

    setIsQuickConnecting(false);
  };

  const withdrawalRequest = async () => {
    try {
      const res = await userApi.delete(
        `/user/friend-management/withdraw-friend-request?receiverId=${id}`
      );

      if (res.status == 200) {
        setIsConnected(false);
        showSnackbar("Request is withdrawed successfully", "success");
      }
    } catch (e) {
      showSnackbar("Error in withdrawing the request", "error");
    }
  };

  return (
    <>
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        {/* Front side component */}
        <>
          <div
            className={`w-full h-[415px] min-h-fit rounded-xl flex flex-col justify-between ${getGradientCardColor(
              position
            )}  flex-shrink-0 relative px-3 pb-3`}
          >
            <div className="bg-black w-fit px-3 py-1 rounded-b-md mb-2">
              <p className="text-white text-sm font-light">{position}</p>
            </div>
            <div className="w-full h-full flex flex-col justify-between">
              <div>
                <div className="w-full flex items-center ">
                  <div className="w-full flex flex-col space-y-2">
                    <h1 className="text-[22px] text-white font-medium">
                      {name}
                    </h1>

                    {position == "Student" && (
                      <div className="w-full flex-1 flex items-start my-3">
                        <div className="flex-[0.5] space-y-1">
                          <div className="flex items-center space-x-3 text-grey01 ">
                            <Icon icon={"ic:outline-room"} fontSize={"12px"} />
                            <p className="text-xs ">Institute</p>
                          </div>

                          <p className="text-xs text-white font-medium">
                            {instituteName}
                          </p>
                        </div>

                        <div className="flex-[0.5] space-y-1">
                          <div className="flex items-center space-x-3 text-grey01 ">
                            <Icon
                              icon={"mdi:college-outline"}
                              fontSize={"12px"}
                            />
                            <p className="text-xs ">Course Enrolled</p>
                          </div>

                          <p className="text-xs text-white font-medium">
                            {courseName}
                          </p>
                        </div>
                      </div>
                    )}

                    {position != "Student" &&
                      position != "Freelancer" &&
                      company && (
                        <InfoSection heading="Company" text={company} />
                      )}

                    {(position == "Employee" || position == "Freelancer") &&
                      profession && (
                        <InfoSection heading="Profession" text={profession} />
                      )}
                  </div>
                </div>

                {position != "Employee" && position != "Freelancer" && (
                  <div className="my-5 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Icon
                        icon={"material-symbols-light:domain"}
                        fontSize={"14px"}
                        color="#fff"
                      />
                      <p className="text-sm font-extralight text-white">
                        Belongs to industries like
                      </p>
                    </div>
                    <div className=" flex flex-wrap gap-3">
                      {interests?.map((label, index) => (
                        <div
                          key={index}
                          className={`border border-white
                   w-fit px-2 py-1 rounded-lg flex items-center space-x-2`}
                        >
                          <p>{getIconFromIndustries(label)}</p>
                          <p className="text-base text-white">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="my-5">
                  <p className="text-sm font-extralight text-white">
                    Looking to connect with
                  </p>
                  <p className="text-base   font-medium text-white leading-normal">
                    {lookingFor?.map((text, index) => (
                      <React.Fragment key={index}>
                        {text} {index != lookingFor.length - 1 && ","}{" "}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <p className=" text-black font-light text-sm">
                    Request to connect
                  </p>

                  {/* <div className="flex items-center space-x-1 border-[0.5px] border-darkBg rounded-full px-1">
                    <Icon icon={"formkit:info"} fontSize={"6px"} />
                    <p className="text-[6px] text-darkBg">Pro Tip</p>
                  </div> */}
                </div>

                <div className=" w-full h-fit flex justify-center items-center  space-x-2">
                  {isConnected ? (
                    <button
                      onClick={withdrawalRequest}
                      className="  bg-[#242424]  font-medium text-white px-3 py-3 rounded-lg w-full flex items-center justify-center space-x-3"
                    >
                      Withdraw Request
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={sendQuickConnect}
                        className="  bg-[#242424]  font-medium text-white px-2 py-3 rounded-lg w-full flex items-center justify-center space-x-2"
                      >
                        {isQuickConnecting ? (
                          <CircularProgress size={"18px"} />
                        ) : (
                          <>
                            <Icon
                              icon="tdesign:lighting-circle"
                              width="15"
                              height="15"
                            />
                            <p className="text-sm whitespace-nowrap">Quick Connect</p>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setFlipped(true);
                        }}
                        className="  bg-transparent  font-medium text-black px-2 py-3 rounded-lg w-full border border-black flex items-center justify-center space-x-2"
                      >
                        <Icon icon="proicons:note" width="15" height="15" />
                        <p className="text-sm whitespace-nowrap">Via a text note</p>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>

        {/* Back side component */}
        <>
          <div className="w-full h-[450px] rounded-xl flex flex-col justify-between bg-white border border-slate-200 flex-shrink-0 relative px-3 py-3">
            <div
              className="w-full h-full bg-white rounded-xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className=" w-full space-y-1">
                <p className="text-darkBg font-medium">Request to {name}</p>
                <p className="text-grey text-sm">
                  {position} {company && `- ${company}`}
                </p>
              </div>

              <div className="w-full mt-3 text-center">
                <div className=" border border-[#E1E1E1]  rounded-lg  px-4 py-3">
                  <textarea
                    value={note}
                    onChange={(e) => {
                      if (e.target.value.length <= 150) setNote(e.target.value);
                      else showSnackbar("Can't exceed limit", "warning");
                    }}
                    className="w-full h-[200px] placeholder:font-medium outline-none text-grey"
                    placeholder="Type your message here…"
                  />

                  <div className="text-grey text-[10px] text-end">
                    <p>{note.length}/150</p>
                  </div>
                </div>

                {/* <p className="text-xs font-light text-darkBg mt-3">
                  Pro tip: Video requests get more accepts than text notes!
                </p> */}
              </div>

              <div className="flex flex-col w-full mt-3 space-y-3">
                <button
                  onClick={sendConnectionRequest}
                  className={`w-full font-medium text-white bg-gradient-to-r from-[#242424] to-[#242424] py-3 rounded-lg  ${
                    !note && "opacity-55"
                  }`}
                >
                  {isLoading ? (
                    <CircularProgress size={"18px"} />
                  ) : (
                    "Send Request"
                  )}
                </button>

                <button
                  onClick={() => setFlipped(false)}
                  className="font-medium text-darkBg py-3 rounded-lg border border-darkBg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      </ReactCardFlip>
    </>
  );
};

export default ConnectCard;
