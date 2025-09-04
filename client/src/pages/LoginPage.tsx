import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "../hooks/SnackbarContext";
import userApi from "../apis/userApi";

const LoginPage = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const handleSendOtp = async () => {
    if (!email) {
      showSnackbar("Please enter your email", "warning");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending OTP request..."); // Add this
      const response = await userApi.post("/user/login", { email, eventId });
      console.log("OTP response:", response); // Add this
      setOtpSent(true);
      showSnackbar("OTP sent to your email", "success");
      startResendTimer();
    } catch (error) {
      console.error("OTP Error:", error); // Add this to see the full error
      showSnackbar("Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendDisabled(true);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showSnackbar("Please enter a valid 6-digit OTP", "warning");
      return;
    }

    try {
      setLoading(true);
      const response = await userApi.post("/user/verify-otp", { email, otp,eventId });

      if (response.data.success) {
        const eventCheck = await userApi.get(
          `/user/${eventId}/check-registration`
        );
        if (eventCheck.data.registered) {
          navigate(`/connect/${eventId}`);
        } else {
          navigate(`/form/${eventId}`);
        }
      }
    } catch (error) {
      showSnackbar("Invalid OTP or error verifying", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await handleSendOtp();
  };

  return (
    <div className="max-w-md mx-auto mt-2 p-3">
      <h1 className="text-darkBg text-3xl font-bold">Login</h1>
      <p className="text-darkBg text-base mb-4">Login to access the event</p>

      {/* Email Input */}
      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-darkBg mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          disabled={otpSent}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Enter your email address"
        />
      </div>

      {/* OTP Input */}
      {otpSent && (
        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-darkBg mb-2">
            OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter 6-digit OTP"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={otpSent ? handleVerifyOtp : handleSendOtp}
        disabled={loading}
        className={`w-full bg-darkBg text-white py-4 px-4 rounded-md font-bold text-sm ${
          loading ? "opacity-60 cursor-not-allowed" : "opacity-100"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : otpSent ? (
          "Verify OTP"
        ) : (
          "Send OTP"
        )}
      </button>

      {/* Resend OTP Section */}
      {otpSent && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive OTP?
          </p>
          <button
            onClick={handleResendOtp}
            disabled={resendDisabled || loading}
            className={`text-blue-600 underline text-sm ${
              resendDisabled || loading 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:text-blue-800 cursor-pointer"
            }`}
          >
            Resend OTP {resendDisabled && `(${resendTimer}s)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
