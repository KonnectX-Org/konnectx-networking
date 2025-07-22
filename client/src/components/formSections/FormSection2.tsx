import { ChevronLeft } from "@mui/icons-material";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useSnackbar } from "../../hooks/SnackbarContext";

export const FormSquareButton = ({
  icon,
  label,
  setDescribedAs,
  describedAs,
}: {
  icon: string;
  label: string;
  setDescribedAs: React.Dispatch<React.SetStateAction<string>>;
  describedAs: string;
}) => {
  return (
    <div
      onClick={() => {
        setDescribedAs(label);
      }}
      className={`border ${
        describedAs === label ? "border-darkBg" : "border-[#E1E1E1]"
      }   rounded-lg  transition-transform active:scale-95 flex flex-col space-y-1 text-center justify-center px-2 py-2`}
    >
      <p className="text-2xl px-3 py-2">{icon}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
};

const ConditionalFields = ({
  companyName,
  setCompanyName,
  describedAs,
  instituteName,
  setInsituteName,
  courseName,
  setCourseName,
}: {
  companyName: string;
  setCompanyName: React.Dispatch<React.SetStateAction<string>>;
  describedAs: string;
  instituteName: string;
  setInsituteName: React.Dispatch<React.SetStateAction<string>>;
  courseName: string;
  setCourseName: React.Dispatch<React.SetStateAction<string>>;
}) => {
  if (["Founder", "Employee"].includes(describedAs)) {
    return (
      <TextField
        type="text"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        label="Company Name"
        variant="outlined"
        sx={{
          width: "100%",
          borderRadius: "8px",
        }}
      />
    );
  } else if (["Investor", "Mentor"].includes(describedAs)) {
    return (
      <TextField
        type="text"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        label="Company Name (Optional)"
        variant="outlined"
        sx={{
          width: "100%",
          borderRadius: "8px",
        }}
      />
    );
  } else if (describedAs == "Student") {
    return (
      <div className="space-y-3">
        <TextField
          type="text"
          value={instituteName}
          onChange={(e) => setInsituteName(e.target.value)}
          label="Institute Name"
          variant="outlined"
          sx={{
            width: "100%",
            borderRadius: "8px",
          }}
        />
        <TextField
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          label="Course Name"
          variant="outlined"
          sx={{
            width: "100%",
            borderRadius: "8px",
          }}
        />
      </div>
    );
  } else {
    return <></>;
  }
};

export const interests = [
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
    icon: "💼",
    label: "Employee",
  },
  {
    icon: "💻",
    label: "Freelancer",
  },
  {
    icon: "👨🏻‍🎓",
    label: "Student",
  },
];

// Form section to collect user interests
const FormSection2 = ({
  describedAs,
  setDescribedAs,
  companyName,
  setCompanyName,
  instituteName,
  setInsituteName,
  courseName,
  setCourseName,
  nextForm,
  backForm,
}: {
  describedAs: string;
  setDescribedAs: React.Dispatch<React.SetStateAction<string>>;
  companyName: string;
  setCompanyName: React.Dispatch<React.SetStateAction<string>>;
  instituteName: string;
  setInsituteName: React.Dispatch<React.SetStateAction<string>>;
  courseName: string;
  setCourseName: React.Dispatch<React.SetStateAction<string>>;
  nextForm: Function;
  backForm: Function;
}) => {
  const [canGoToNext, setCanGoToNext] = useState<boolean>(false);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (
      ((describedAs == "Founder" || describedAs == "Employee") &&
        companyName) ||
      describedAs == "Freelancer" ||
      describedAs == "Investor" ||
      describedAs == "Mentor" ||
      (describedAs == "Student" && instituteName && courseName)
    )
      setCanGoToNext(true);
    else {
      setCanGoToNext(false);
    }
  }, [describedAs, companyName, instituteName, courseName]);

  return (
    <div
      className={`w-full h-full flex-shrink-0 px-3 relative `}
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

        <h1 className="text-darkBg text-2xl font-bold my-4">
          I am best described as
        </h1>

        <div className="w-full grid grid-cols-3 justify-evenly gap-2">
          {interests.map((interest, index) => (
            <FormSquareButton
              key={index}
              label={interest.label}
              icon={interest.icon}
              setDescribedAs={setDescribedAs}
              describedAs={describedAs}
            />
          ))}
        </div>

        <div className="mt-10">
          <ConditionalFields
            companyName={companyName}
            describedAs={describedAs}
            setCompanyName={setCompanyName}
            courseName={courseName}
            setCourseName={setCourseName}
            instituteName={instituteName}
            setInsituteName={setInsituteName}
          />
        </div>
      </div>

      <div className="absolute bottom-5 left-0 w-full flex flex-col items-center justify-center px-3">
        <button
          onClick={() => {
            if (canGoToNext) {
              nextForm();
            } else {
              if (!describedAs) {
                showSnackbar("Please select your role", "warning");
              } else if ((describedAs === "Founder" || describedAs === "Employee") && !companyName) {
                showSnackbar("Please enter your company name", "warning");
              } else if (describedAs === "Student") {
                if (!instituteName) {
                  showSnackbar("Please enter your institute name", "warning");
                } else if (!courseName) {
                  showSnackbar("Please enter your course name", "warning");
                }
              } else {
                showSnackbar("Please complete the required fields", "warning");
              }
            }
          }}
          className={`bg-darkBg mt-4 font-bold text-white py-4 rounded-md w-full text-xs ${
            canGoToNext ? "opacity-100" : "opacity-60"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FormSection2;
