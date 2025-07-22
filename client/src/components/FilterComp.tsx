import { Icon } from "@iconify/react";
import CustomButton from "./CustomButton";
import { industries } from "./formSections/FormSection3";
import { suggestedProfessions } from "./formSections/FormSection4";

export interface filterI {
  workStatus: string[];
  industries: string[];
  lookingFor: string[];
}

const Option = ({
  label,
  setFilters,
  filters,
}: {
  label: string;
  setFilters: React.Dispatch<React.SetStateAction<filterI>>;
  filters: filterI;
}) => {
  // Instead of maintaining a separate state, derive it from filters
  const isSelected = filters.workStatus.includes(label);

  const toggleSelection = () => {
    setFilters((prevFilters) => {
      if (isSelected) {
        // Remove the label if it's already selected
        const filteredWorkStatus = prevFilters.workStatus.filter(
          (text) => text !== label
        );
        return {
          ...prevFilters,
          workStatus: filteredWorkStatus,
        };
      } else {
        // Add the label if it's not selected
        return {
          ...prevFilters,
          workStatus: [...prevFilters.workStatus, label],
        };
      }
    });
  };

  return (
    <div
      onClick={toggleSelection}
      className={`text-xs px-3 py-2 rounded-full font-medium ${
        isSelected ? "text-white bg-darkBg" : "bg-grey01 text-darkBg"
      } active:scale-95 transition-transform`}
    >
      {label}
    </div>
  );
};

const FilterComp = ({
  setIsFilterModalOpen,
  filters,
  setFilters,
  applyFilters,
}: {
  setIsFilterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filters: filterI;
  setFilters: React.Dispatch<React.SetStateAction<filterI>>;
  applyFilters: Function;
}) => {
  return (
    <div className="w-full h-fit flex flex-col flex-1 rounded-lg bg-white px-4 py-3">
      <div className="flex-[0.02] flex justify-end">
        <Icon
          onClick={() => setIsFilterModalOpen(false)}
          icon={"ph:x-bold"}
          fontSize={"20px"}
        />
      </div>

      {/* Middle filter section */}
      <div className="flex-[0.9] h-full w-full">
        <div className="flex items-center justify-between my-3">
          <h1 className="text-xl font-semibold text-darkBg">Filter</h1>
          <p
            className="text-primary text-sm font-medium cursor-pointer"
            onClick={() => {
              setFilters({
                industries: [],
                workStatus: [],
                lookingFor: [],
              });
            }}
          >
            Reset all
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-sm font-semibold text-grey">Work Status</p>

            <div className="flex items-center flex-wrap gap-3">
              {[
                "Employee",
                "Investor",
                "Founder",
                "Mentor",
                "Student",
                "Freelancer",
              ].map((label, index) => (
                <Option
                  key={index}
                  label={label}
                  setFilters={setFilters}
                  filters={filters}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold text-grey">Industries</p>
            <select
              onChange={(e) => {
                if (e.target.value !== "Choose your preference") {
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    industries: [...prevFilters.industries, e.target.value],
                  }));
                }
              }}
              className="w-full py-2 px-3 bg-transparent border border-grey01 rounded-lg outline-none text-grey text-sm"
            >
              <option>Choose your preference</option>
              {industries.map((data, index) => (
                <option key={index}>{data.label}</option>
              ))}
            </select>

            <div className="flex items-center flex-wrap gap-3">
              {filters.industries.map((label, index) => (
                <div
                  key={index}
                  className="text-xs bg-grey01 px-3 py-2 rounded-full font-medium text-darkBg flex items-center space-x-4"
                >
                  <p>{label}</p>{" "}
                  <Icon
                    onClick={() => {
                      setFilters((prevFilters) => ({
                        ...prevFilters,
                        industries: prevFilters.industries.filter(
                          (text) => text !== label
                        ),
                      }));
                    }}
                    icon={"ph:x-bold"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold text-grey">
              Looking to Connect with
            </p>
            <select
              onChange={(e) => {
                if (e.target.value !== "Choose your preference") {
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    lookingFor: [...prevFilters.lookingFor, e.target.value],
                  }));
                }
              }}
              className="w-full py-2 px-3 bg-transparent border border-grey01 rounded-lg outline-none text-grey text-sm"
            >
              <option>Choose your preference</option>
              {suggestedProfessions.map((data, index) => (
                <option key={index}>{data.label}</option>
              ))}
            </select>

            <div className="flex items-center flex-wrap gap-3">
              {filters.lookingFor.map((label, index) => (
                <div
                  key={index}
                  className="text-xs bg-grey01 px-3 py-2 rounded-full font-medium text-darkBg flex items-center space-x-4"
                >
                  <p>{label}</p>{" "}
                  <Icon
                    onClick={() => {
                      setFilters((prevFilters) => ({
                        ...prevFilters,
                        lookingFor: prevFilters.lookingFor.filter(
                          (text) => text !== label
                        ),
                      }));
                    }}
                    icon={"ph:x-bold"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Button apply filter button section */}
      <div className="flex-[0.08] w-full h-full ">
        <CustomButton
          text="Apply Filters"
          onClick={() => {
            applyFilters();
            setIsFilterModalOpen(false);
          }}
          width="100%"
        />
      </div>
    </div>
  );
};

export default FilterComp;