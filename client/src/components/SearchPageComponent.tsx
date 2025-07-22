import { Icon } from "@iconify/react";
// import OfferBanner from "./OfferBanner";
import React, { useEffect, useState } from "react";
import userApi from "../apis/userApi";
import useDebounce from "../hooks/Debounce";
import { interests } from "./formSections/FormSection2";
import { useSnackbar } from "../hooks/SnackbarContext";
import { useNavigate } from "react-router-dom";

// const NotFoundSearchCard = () => {
//   return (
//     <div className="flex items-center justify-between">
//       {/* Left section */}
//       <div className="flex items-center space-x-2">
//         <Icon icon={"carbon:recently-viewed"} fontSize={"16px"} />
//         <p className="text-sm text-darkBg">Bhumi</p>
//       </div>

//       {/* Right section */}
//       <div>
//         <Icon icon={"material-symbols:close-rounded"} fontSize={"16px"} />
//       </div>
//     </div>
//   );
// };

interface SearchResultI {
  _id: string;
  name: string;
  position: string;
  company: string;
  industry: string[];
  lookingFor: string[];
  instituteName: string[];
  courseName: string;
  profession: string;
}

const getIconFromPosition = (position: string) => {
  const temp = interests.filter((interest) => interest.label == position);

  return temp[0].icon;
};

const SearchResultCard = ({
  data,
  isRecentSearched = false,
}: {
  data: SearchResultI;
  isRecentSearched?: boolean;
}) => {
  const navigate = useNavigate();

  const addRecentSearch = async () => {
    try {
      await userApi.post(`/user/recent-search/add?searchedUserId=${data._id}`);
    } catch (e) {}
  };

  const handleClick = () => {
    if (!isRecentSearched) addRecentSearch();
    navigate(`/profile/${data._id}`);
  };

  return (
    <div onClick={handleClick} className="flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <p className="text-[33px]">{getIconFromPosition(data.position)}</p>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-bold text-darkBg">{data.name}</p>
            <p className="text-xs text-grey">{data.position}</p>
          </div>

          <p className="text-sm text-grey">{data.company}</p>
        </div>
      </div>

      {/* Right section */}
      <div>
        <div className="flex items-center space-x-3 ">
          {/* <div className="border border-darkBg  bg-darkBg rounded-lg px-1 py-1">
            <Icon icon={"proicons:video"} fontSize={"16px"} color="white" />
          </div> */}

          <div className="border border-darkBg rounded-lg px-1 py-1">
            <Icon icon={"proicons:note"} fontSize={"16px"} />
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPageComponent = ({
  setIsSearchbarOpen,
}: {
  setIsSearchbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [searchedName, setSearchedName] = useState<string>("");
  const debounceQuery = useDebounce(searchedName, 500);
  const { showSnackbar } = useSnackbar();

  const [searchedResults, setSearchedResults] = useState<SearchResultI[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResultI[]>([]);

  const fetchSearchResults = async () => {
    if (debounceQuery == "") {
      return;
    }

    try {
      const res = await userApi(
        `/user/events/search-guests?eventId=6864dd952cf135f217b9e057&name=${debounceQuery}`
      );

      if (res.status == 200) {
        setSearchedResults(res.data.eventGuests);
      }
    } catch (e) {}
  };

  const fetchRecentSearches = async () => {
    try {
      const res = await userApi.get("/user/recent-search");

      if (res.status == 200) {
        setRecentSearches(res.data.recentSearches);
      }
    } catch (e) {}
  };

  const clearRecentSearchHistory = async () => {
    try {
      const res = await userApi.delete(
        "/user/recent-search/clear-search-history"
      );

      if (res.status == 200) {
        showSnackbar("Recent searches are cleared", "success");
        setRecentSearches([]);
      }
    } catch (e) {
      showSnackbar("Error in clearing recent searches", "error");
    }
  };

  useEffect(() => {
    if (debounceQuery != "") fetchSearchResults();
    else fetchRecentSearches();
  }, [debounceQuery]);

  return (
    <div className="w-full h-full bg-white overflow-y-hidden">
      {/* Search header */}

      <div className="px-3 py-4 bg-grey01">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 w-full">
            <Icon icon={"bitcoin-icons:search-filled"} fontSize={"25px"} />
            <input
              type="text"
              value={searchedName}
              onChange={(e) => {
                if (e.target.value == "") setSearchedResults([]);
                setSearchedName(e.target.value);
              }}
              placeholder="Search"
              className="placeholder:text-xs text-xs placeholder:text-black placeholder:font-light bg-transparent w-full outline-none"
            />
          </div>

          <div>
            <Icon
              onClick={() => setIsSearchbarOpen(false)}
              icon={"material-symbols:close-rounded"}
              fontSize={"25px"}
            />
          </div>
        </div>
      </div>

      {/* {searchedName.length == 0 && <OfferBanner />} */}

      {/* Recent search portion */}
      <div className="mt-2 px-3 h-full overflow-y-scroll no-scrollbar">
        {searchedName.length == 0 && recentSearches.length != 0 && (
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-darkBg">Recent</p>

              <p
                onClick={clearRecentSearchHistory}
                className="text-xs text-darkBg font-light"
              >
                Clear All
              </p>
            </div>

            <div className="mt-4 space-y-5 h-full pb-[200px]  overflow-y-scroll">
              {recentSearches?.map((data) => (
                <SearchResultCard
                  key={data._id}
                  data={data}
                  isRecentSearched={true}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-5 h-full pb-[200px]  overflow-y-scroll">
          {searchedResults?.map((data) => (
            <SearchResultCard key={data._id} data={data} />
          ))}
        </div>

        {/* <div className="mt-6 space-y-3">
          <NotFoundSearchCard />
          <NotFoundSearchCard />
          <NotFoundSearchCard />
        </div> */}
      </div>
    </div>
  );
};

export default SearchPageComponent;
