import { InputAdornment, TextField } from "@mui/material";
import screwClockIcon from "../../assets/icons/screwClockIcon.svg";
import { useSnackbar } from "../../hooks/SnackbarContext";

// Form for getting the username
const FormSection1 = ({
  name,
  setName,
  email,
  setEmail,
  number,
  setNumber,
  nextForm,
}: {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  number: string;
  setNumber: React.Dispatch<React.SetStateAction<string>>;
  nextForm: Function;
}) => {
  const { showSnackbar } = useSnackbar();

  const validAndGoToNext = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;

    // Function to validate email
    const validateEmail = (email: string) => emailRegex.test(email);

    // Function to validate phone number
    const validatePhone = (phone: string) => phoneRegex.test(phone);

    if (name && email && number) {
      if (!validateEmail(email)) {
        showSnackbar("Enter a valid email", "warning");
        return;
      } else if (!validatePhone(number)) {
        showSnackbar("Enter a valid phone number", "warning");
        return;
      }

      nextForm();
    } else {
      showSnackbar("Please fill the details", "warning");
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col flex-shrink-0 relative px-3`}
      // style={{
      //   height: innerHeight,
      // }}
    >
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

        <div className="w-full space-y-6">
          <TextField
            type="text"
            label="Full Name"
            value={name}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            sx={{
              width: "100%",
              borderRadius: "8px",
            }}
          />
          <TextField
            type="email"
            label="Email ID"
            value={email}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            sx={{
              width: "100%",
            }}
          />
          <TextField
            type="text"
            label="Phone Number"
            value={number}
            onChange={(e) => {
              setNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
            }}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <p className="text-gray-500">+91</p>
                </InputAdornment>
              ),
            }}
            sx={{
              width: "100%",
            }}
          />
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
            name && email && number.length == 10 ? "opacity-100" : "opacity-60"
          }`}
        >
          I am ready to start!
        </button>
      </div>
    </div>
  );
};

export default FormSection1;
