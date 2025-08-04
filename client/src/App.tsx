import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
// import Home from "./pages/Home";
import FormPage from "./pages/FormPage";
import MainPage from "./pages/MainPage";
import ConnectPage from "./pages/ConnectPage";
import Profile from "./pages/Profile";
import NotificatonsPage from "./pages/NotificationsPage";
// import { useSnackbar } from "./hooks/SnackbarContext";
import LayoutWithHeader from "./layouts/LayoutWithHeader";
import LayoutWithOutHeader from "./layouts/LayoutWithOutHeader";
import RequestsPage from "./pages/RequestsPage";
import MyNetworkPage from "./pages/MyNetworkPage";
import LevelUpPage from "./pages/LevelUpPage";
import QRPage from "./pages/QRPage";
import userApi from "./apis/userApi";
import { useEffect, useState } from "react";
import { UserProvider } from "./hooks/UserContext";
import { userI, userLevelDataI } from "./types/userTypes";
import QRConnecting from "./pages/QRConnecting";
import ConnectionProfile from "./pages/ConnectionProfile";

const App = () => {
  // const { showSnackbar } = useSnackbar();
  const [user, setUser] = useState<userI | undefined>(undefined);
  const [userLevelData, setUserLevelData] = useState<
    userLevelDataI | undefined
  >(undefined);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const response = await userApi.get("/user/");

      if (response.status == 200) {
        setUser(response.data.user);
        setUserLevelData(response.data.userLevelData);

        if (!response.data.userLevelData.badgeSplashRead) navigate("/levelup");
      }
    } catch (e) {
      navigate("/form/6864dd952cf135f217b9e057");
      // showSnackbar("Please fill the form first", "warning");
    }
  };

  useEffect(() => {
    if (!user) fetchUser();
  }, [location.pathname]);

  return (
    <>
      <UserProvider 
        user={user} 
        userLevelData={userLevelData} 
        setUser={setUser}
        setUserLevelData={setUserLevelData}
      >
        <Routes>
          <Route element={<LayoutWithHeader />}>
            <Route path="/home" element={<MainPage />} />

            <Route path="/connect/:eventId" element={<ConnectPage />} />
          </Route>
        </Routes>

        <Routes>
          <Route path="/" element={<FormPage />} />

          <Route element={<LayoutWithOutHeader />}>
            {/*temp form page in the index page*/}
            <Route path="/notifications" element={<NotificatonsPage />} />
            <Route path="/requests/:rtype" element={<RequestsPage />} />
            <Route path="/network" element={<MyNetworkPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<ConnectionProfile />} />
          </Route>

          <Route path="/qr" element={<QRPage />} />
          <Route path="/qr-connect/:friendId" element={<QRConnecting />} />
          <Route path="/levelup" element={<LevelUpPage />} />
          <Route path="/form/:eventId" element={<FormPage />} />
        </Routes>
      </UserProvider>
    </>
  );
};

export default App;
