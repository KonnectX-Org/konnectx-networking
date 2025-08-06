import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import screwClockIcon from "../../assets/icons/screwClockIcon.svg";
import { useSnackbar } from "../../hooks/SnackbarContext";
import { useNavigate } from "react-router-dom";
import "./FormSection1.css";

// Form for getting the username
const FormSection1 = ({
  name,
  setName,
  email,
  setEmail,
  number,
  setNumber,
  linkedin,
  setLinkedin,
  nextForm,
}: {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  number: string;
  setNumber: React.Dispatch<React.SetStateAction<string>>;
  linkedin: string;
  setLinkedin: React.Dispatch<React.SetStateAction<string>>;
  nextForm: Function;
}) => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const validAndGoToNext = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Function to validate email
    const validateEmail = (email: string) => emailRegex.test(email);

    // Function to validate LinkedIn URL (optional)
    const validateLinkedIn = (url: string) => {
      if (!url) return true; // Optional field
      const linkedinRegex =
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
      return linkedinRegex.test(url);
    };

    if (name && email) {
      if (!validateEmail(email)) {
        showSnackbar("Enter a valid email", "warning");
        return;
      } else if (!validateLinkedIn(linkedin)) {
        showSnackbar("Enter a valid LinkedIn URL", "warning");
        return;
      }

      nextForm();
    } else {
      showSnackbar(
        "Please fill the mandatory details (Name and Email)",
        "warning"
      );
    }
  };

  return (
    <div className={`w-full h-full flex flex-col flex-shrink-0 relative px-3`}>
      <div className="w-full grid grid-cols-3 grid-rows-1 py-3 gap-3 [&>*]:bg-darkBg [&>*]:h-1  [&>*]:rounded-full [&>*]:opacity-50">
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className="mt-2">
        <div className="flex items-center space-x-2">
          <img src={screwClockIcon} alt="clock icon" />
          <p className="text-grey text-xs">Sign up in less than 2 minutes!</p>
        </div>

        <h1 className="text-darkBg text-2xl font-bold my-4 mb-8">
          Tell us about yourself!
        </h1>

        <div className="w-full space-y-3">
          {/* Full Name Input */}
          <div className="w-full">
            <label className="block text-sm font-medium text-darkBg mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Input */}
          <div className="w-full">
            <label className="block text-sm font-medium text-darkBg mb-2">
              Email ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>

          {/* Phone Number Input */}
          <div className="w-full">
            <label className="block text-sm font-medium text-darkBg mb-2">
              Phone Number (Optional)
            </label>
            <PhoneInput
              defaultCountry="in"
              value={number}
              onChange={(phone: string) => setNumber(phone)}
              className="w-full"
            />
          </div>

          {/* LinkedIn Input */}
          <div className="w-full">
            <label className="block text-sm font-medium text-darkBg mb-2">
              LinkedIn Profile (Optional)
            </label>
            <input
              type="url"
              value={linkedin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLinkedin(e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://linkedin.com/in/your-profile"
            />
          </div>

          {/* Login link below phone number field */}
          <div className="mt-2 text-sm ">
            <span>Existing User? </span>
            <span
              className="text-blue-600 underline cursor-pointer"
              onClick={() => navigate("/login/6864dd952cf135f217b9e057")}
            >
              Login
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto mb-4 left-0 w-full flex flex-col items-center justify-center px-3">
        <div className="text-grey text-xs space-y-1">
          <p>*NOTE</p>
          <p>
            Your contact information is not shared with anyone without you
            accept their request to connect.
          </p>
        </div>
        <button
          onClick={() => {
            validAndGoToNext();
          }}
          className={`bg-darkBg mt-4 font-bold text-white py-4 rounded-md w-full text-xs ${
            name && email ? "opacity-100" : "opacity-60"
          }`}
        >
          I am ready to start!
        </button>
      </div>
    </div>
  );
};

export default FormSection1;
