import { ChevronLeft } from "@mui/icons-material";
import { FormSquareButton } from "./FormSection2";
import { useSnackbar } from "../../hooks/SnackbarContext";

const roles = [
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

// Additional form section for student and freelancer means for non company person
const FormSectionNonCompany = ({
  nextForm,
  backForm,
  bestDescribedAs,
  setBestDescribedAs,
}: {
  nextForm: Function;
  backForm: Function;
  bestDescribedAs: string;
  setBestDescribedAs: React.Dispatch<React.SetStateAction<string>>;
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
          {roles.map((role, index) => (
            <FormSquareButton
              key={index}
              label={role.label}
              icon={role.icon}
              setDescribedAs={setBestDescribedAs}
              describedAs={bestDescribedAs}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 left-0 w-full flex flex-col items-center justify-center px-3">
        <button
          onClick={() => {
            if (bestDescribedAs) nextForm();
            else showSnackbar("Please select an option", "warning");
          }}
          className={`bg-darkBg mt-4 font-bold text-white py-4 rounded-md w-full text-xs ${
            bestDescribedAs ? "opacity-100" : "opacity-60"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FormSectionNonCompany;
