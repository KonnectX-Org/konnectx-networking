import { useNavigate, useParams } from "react-router-dom";
import userApi from "../apis/userApi";
import { useSnackbar } from "../hooks/SnackbarContext";
import { useEffect } from "react";

const QRConnecting = () => {
  const { friendId } = useParams();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const connect = async () => {
    try {
      await userApi.post(
        `/user/friend-management/quick-add-friend?friendId=${friendId}`
      );

      showSnackbar("You are now connected", "success");
    } catch (e:any) {
      console.log(e)
      console.log("Error response",e.response)
      if(e.response.status===409){
        showSnackbar("Already Connected", "info");
      }
      else{
        showSnackbar("Error in connecting", "error");
      }

    }

    navigate(`/profile/${friendId}`);
    // navigate(`/connect/${localStorage.getItem("currentEventId")}`);
  };

  useEffect(() => {
    connect();
  }, []);

  return (
    <div
      className="w-full flex items-center justify-center"
      style={{
        height: innerHeight,
      }}
    >
      <p className="text-darkBg">Connecting...</p>
    </div>
  );
};

export default QRConnecting;
