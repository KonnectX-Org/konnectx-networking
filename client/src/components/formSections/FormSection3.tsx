import { ChevronLeft } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useSnackbar } from "../../hooks/SnackbarContext";

const IndustryBox = ({
  label,
  icon,
  setSelectedIndustries,
  totalSelected,
}: {
  label: string;
  icon: string;
  setSelectedIndustries: React.Dispatch<React.SetStateAction<string[]>>;
  totalSelected: number;
}) => {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (isSelected) {
      setSelectedIndustries((industries) => {
        const temp = [...industries];
        temp.push(label);
        return temp;
      });
    } else {
      setSelectedIndustries((industries) =>
        industries.filter((text) => text !== label)
      );
    }
  }, [isSelected]);

  return (
    <div
      onClick={() => {
        if (totalSelected == 3 && isSelected) setIsSelected(false);
        else if (totalSelected < 3) setIsSelected(!isSelected);
        else {
          showSnackbar("Max 3 can be selected", "warning");
        }
      }}
      className={`w-full h-fit py-2 border  rounded-md text-center ${
        isSelected
          ? "bg-primary text-white border-primary"
          : " border-lightGrey text-darkBg"
      } cursor-pointer`}
    >
      <p>
        <span className="mr-1">{icon}</span> {label}
      </p>
    </div>
  );
};

export const industries = [
  {
    label: "AI & Automation",
    icon: "🤖",
  },
  {
    label: "Aerospace",
    icon: "🚀",
  },
  {
    label: "AR/VR",
    icon: "👓",
  },
  {
    label: "Beauty",
    icon: "💅",
  },
  {
    label: "Blockchain",
    icon: "📱",
  },
  {
    label: "Construction",
    icon: "🏗️",
  },
  {
    label: "Cybersecurity",
    icon: "🔑",
  },
  {
    label: "Design",
    icon: "🎨",
  },
  {
    label: "Ecommerce",
    icon: "🛍️",
  },
  {
    label: "EdTech",
    icon: "🎓",
  },
  {
    label: "Fashion",
    icon: "👗",
  },
  {
    label: "Fintech",
    icon: "🤑",
  },
  {
    label: "Food",
    icon: "🍟",
  },
  {
    label: "Gaming",
    icon: "🎮",
  },
  {
    label: "HealthTech",
    icon: "🍎",
  },
  {
    label: "Hospitality",
    icon: "🏨",
  },
  {
    label: "HR",
    icon: "🙋‍♀️",
  },
  {
    label: "IoT",
    icon: "🔌",
  },
  {
    label: "Legal",
    icon: "🙋‍♀️",
  },
  {
    label: "Media",
    icon: "📺",
  },
  {
    label: "Mobility",
    icon: "🛵",
  },
  {
    label: "️Non-Profit",
    icon: "🤝️",
  },
  {
    label: "️Real Estate",
    icon: "🏘️",
  },
  {
    label: "️Retail",
    icon: "🏪",
  },
  {
    label: "️SaaS",
    icon: "💻",
  },
  {
    label: "️Smart Devices",
    icon: "📟",
  },
  {
    label: "️Sports",
    icon: "🏃‍♂",
  },
  {
    label: "Spirituality",
    icon: "🔮",
  },
  {
    label: "Sustainability",
    icon: "🌴",
  },
  {
    label: "Travel",
    icon: "🧳",
  },
  {
    label: "Web3",
    icon: "🌐",
  },
  {
    label: "Consulting",
    icon: "💼",
  },
  {
    label: "Branding",
    icon: "🖌️",
  },
  {
    label: "Marketing",
    icon: "📈",
  },
  {
    label: "Health and Wellness",
    icon: "💪",
  },
  {
    label: "Beverage",
    icon: "🥤",
  },
];

// Form field for getting user industries
const FormSection3 = ({
  setSelectedIndustries,
  selectedIndustries,
  nextForm,
  backForm,
  bestDescribedAs,
}: {
  setSelectedIndustries: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIndustries: string[];
  nextForm: Function;
  backForm: Function;
  bestDescribedAs: string;
}) => {
  const { showSnackbar } = useSnackbar();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customIndustry, setCustomIndustry] = useState("");

  const handleOtherClick = () => {
    if (selectedIndustries.length >= 3) {
      showSnackbar("Max 3 can be selected", "warning");
      return;
    }
    setShowCustomInput(true);
  };

  const handleCustomIndustrySubmit = () => {
    if (customIndustry.trim() === "") {
      showSnackbar("Please enter an industry name", "warning");
      return;
    }

    if (selectedIndustries.includes(customIndustry.trim())) {
      showSnackbar("Industry already selected", "warning");
      return;
    }

    setSelectedIndustries((prev) => [...prev, customIndustry.trim()]);
    setCustomIndustry("");
    setShowCustomInput(false);
  };

  const handleCustomIndustryCancel = () => {
    setCustomIndustry("");
    setShowCustomInput(false);
  };

  return (
    <div
      className={`w-full h-full flex-shrink-0 px-3 relative`}
      // style={{
      //   height: innerHeight,
      // }}
    >
      <div className="w-full grid grid-cols-3 grid-rows-1 py-3 gap-3 [&>*]:bg-darkBg [&>*]:h-1  [&>*]:rounded-full ">
        <div className="opacity-100"></div>
        <div className="opacity-50"></div>
        <div className="opacity-50"></div>
      </div>

      <div className="mt-2">
        <div
          onClick={() => backForm()}
          className="flex items-center space-x-1 text-xs text-grey cursor-pointer"
        >
          <ChevronLeft fontSize="inherit" color="inherit" />
          <p>Back</p>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-darkBg text-2xl font-bold my-4">
            Choose your{" "}
            {bestDescribedAs === "Student" ? "Interests" : "Industry"}
          </h1>

          <div className="border border-grey  rounded-lg px-2 py-1">
            <p className="text-xs text-grey">{selectedIndustries.length}/3</p>
          </div>
        </div>

        {/* Selected Industries Display */}

        <div className="mb-4">
          <p className="text-sm text-grey mb-2">Selected:</p>
          <div className="flex flex-wrap gap-2">
            {selectedIndustries.length<=0?<p className="text-sm text-grey">No Industries Selected</p>:selectedIndustries.map((industry, index) => (
              <div
                key={index}
                className="bg-primary text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1"
              >
                <span>{industry}</span>
                <button
                  onClick={() => {
                    setSelectedIndustries((prev) =>
                      prev.filter((item) => item !== industry)
                    );
                  }}
                  className="ml-1 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-[62vh] pb-28 mt-3 grid grid-cols-2 gap-2 overflow-y-scroll custom-scrollbar">
          {industries.map((industry, index) => (
            <IndustryBox
              key={index}
              label={industry.label}
              icon={industry.icon}
              setSelectedIndustries={setSelectedIndustries}
              totalSelected={selectedIndustries.length}
            />
          ))}

          {/* Add Custom Button - Less Prominent */}
          <div className="col-span-2 mt-4">
            <button
              onClick={handleOtherClick}
              disabled={selectedIndustries.length >= 3}
              className={`w-full py-2 border border-dashed rounded-md text-center text-sm ${
                selectedIndustries.length >= 3
                  ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50"
                  : "border-grey text-grey hover:border-darkBg hover:text-darkBg cursor-pointer"
              } transition-colors`}
            >
              <span className="mr-1 text-xs">+</span>
              Add Custom{" "}
              {bestDescribedAs === "Student" ? "Interest" : "Industry"}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Industry Input Modal */}
      {showCustomInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-darkBg">
              Enter Custom{" "}
              {bestDescribedAs === "Student" ? "Interest" : "Industry"}
            </h3>
            <input
              type="text"
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              placeholder={`Enter ${
                bestDescribedAs === "Student" ? "interest" : "industry"
              } name...`}
              className="w-full p-3 border border-lightGrey rounded-md mb-4 text-darkBg"
              maxLength={50}
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={handleCustomIndustryCancel}
                className="flex-1 py-2 px-4 border border-lightGrey rounded-md text-darkBg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomIndustrySubmit}
                className="flex-1 py-2 px-4 bg-darkBg text-white rounded-md font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 left-0 w-full flex flex-col items-center justify-center px-3">
        <button
          onClick={() => {
            if (selectedIndustries.length == 3) nextForm();
            else showSnackbar("Please select 3 options", "warning");
          }}
          className={`mt-4 font-bold text-white py-4 rounded-md w-full text-xs  ${
            selectedIndustries.length == 3 ? "bg-darkBg " : "bg-[#7b7b7b]"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FormSection3;
