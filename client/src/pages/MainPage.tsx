import { useNavigate } from "react-router-dom";
import udaipurPalaceImg from "../assets/udaipur-palace-image.jpeg";

const EventCard = ({ eventName }: { eventName: string }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/connect/6864dd952cf135f217b9e057`)}
      className="w-full h-48 bg-blue-500 rounded-lg"
    >
      <div className="w-full h-full  rounded-lg flex flex-1 justify-between">
        <div className="flex-[0.6] h-full px-3 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 rounded-full bg-blue-800"></div>
            <h1 className="text-2xl text-white font-semibold">{eventName}</h1>
          </div>

          <div className="my-3">
            <p className="text-lg text-white">
              <span className="font-semibold">Date:</span> 3 to 6 March
            </p>
            <p className="text-lg text-white">
              <span className="font-semibold">Timing:</span> 9 A.M. to 6 P.M.
            </p>
          </div>
        </div>

        <div className="flex-[0.4] w-full h-full bg-slate-400 rounded-r-lg">
          <img
            src={udaipurPalaceImg}
            alt="Udaipur Palace"
            className="w-full h-full object-cover rounded-r-lg"
          />
        </div>
      </div>
    </div>
  );
};

// This is the main home page for the user
const MainPage = () => {
  return (
    <div className="px-3 h-full overflow-y-scroll">
      <h1 className="text-3xl font-semibold">Events</h1>
      <div className="my-7">
        <h2 className="text-2xl font-medium">Ongoing</h2>
        <div className="my-5 w-full  flex flex-col space-y-5">
          <EventCard eventName="Tiecon, Udaipur" />
        </div>
      </div>

      <div className="my-20">
        <h2 className="text-2xl font-medium">Past Events</h2>
        <div className=" w-full my-5 flex items-center justify-center">
          <p className="text-slate-500">No Past Events</p>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
