import { ChevronLeft } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useSnackbar } from "../../hooks/SnackbarContext";

const FormSquareButton = ({
  icon,
  label,
  setWantToNetworkWith,
  totalSelected,
}: {
  icon: string;
  label: string;
  setWantToNetworkWith: React.Dispatch<React.SetStateAction<string[]>>;
  totalSelected: number;
}) => {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (isSelected) {
      setWantToNetworkWith((selectedProfessions) => {
        const temp = [...selectedProfessions];
        temp.push(label);
        return temp;
      });
    } else {
      setWantToNetworkWith((selectedProfessions) =>
        selectedProfessions.filter((text) => text !== label)
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
      className={`border ${
        isSelected ? "border-darkBg" : "border-[#E1E1E1]"
      }   rounded-lg  w-[109px] h-[95px] transition-transform active:scale-95 flex flex-col space-y-1 text-center justify-center px-2`}
    >
      <p className="text-2xl px-3 py-1">{icon}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
};

export const suggestedProfessions = [
  {
    icon: "🚀",
    label: "Founder",
  },
  {
    icon: "💰",
    label: "Investor",
  },
  {
    icon: "👨🏻",
    label: "Mentor",
  },
  {
    icon: "💻",
    label: "Full Stack Developer",
  },
  {
    icon: "📱",
    label: "Mobile Developer",
  },
  {
    icon: "🎨",
    label: "Graphic Designer",
  },
  {
    icon: "💡",
    label: "UI/UX Designer",
  },
  {
    icon: "📋",
    label: "Project Manager",
  },
  {
    icon: "📢",
    label: "Digital Marketer",
  },
  {
    icon: "🤑",
    label: "Sales Person",
  },
  {
    icon: "📈",
    label: "Accounting Professional",
  },
  {
    icon: "🤳",
    label: "Content Creator",
  },
];

// Form section to select who you want to network with
const FormSection4 = ({
  nextForm,
  backForm,
  wantToNetworkWith,
  setWantToNetworkWith,
}: {
  nextForm: Function;
  backForm: Function;
  wantToNetworkWith: string[];
  setWantToNetworkWith: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const { showSnackbar } = useSnackbar();
  return (
    <div
      className={`w-full h-full flex-shrink-0 px-3 relative`}
      // style={{
      //   height: innerHeight,
      // }}
    >
      <div className="w-full grid grid-cols-3 grid-rows-1 py-3 gap-3 [&>*]:bg-darkBg [&>*]:h-1  [&>*]:rounded-full ">
        <div className="opacity-100"></div>
        <div className="opacity-100"></div>
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
            I want to network with
          </h1>

          <div className="border border-grey  rounded-lg px-2 py-1">
            <p className="text-xs text-grey">{wantToNetworkWith.length}/3</p>
          </div>
        </div>

        <div className="w-full grid grid-cols-3 justify-evenly gap-2">
          {suggestedProfessions.map((profession, index) => (
            <FormSquareButton
              key={index}
              label={profession.label}
              icon={profession.icon}
              setWantToNetworkWith={setWantToNetworkWith}
              totalSelected={wantToNetworkWith.length}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 left-0 w-full flex flex-col items-center justify-center px-3">
        <button
          onClick={() => {
            if (wantToNetworkWith.length == 3) nextForm();
            else showSnackbar("Please select 3 options", "warning");
          }}
          className={`bg-darkBg mt-4 font-bold text-white py-4 rounded-md w-full text-xs  ${
            wantToNetworkWith.length == 3 ? "opacity-100" : "opacity-60"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FormSection4;
