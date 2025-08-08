import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "../hooks/SnackbarContext";
import userApi from "../apis/userApi";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

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
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 2, p: 3 }}>
      {/* <Typography variant="h4" gutterBottom>
        Login
      </Typography> */}
      <h1 className="text-darkBg text-3xl font-bold">Login</h1>
      <p className="text-darkBg text-base mb-4 ">Login to access the event</p>

      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        disabled={otpSent}
        sx={{ mb: 2 }}
      />

      {otpSent && (
        <TextField
          fullWidth
          label="OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          margin="normal"
          sx={{ mb: 2 }}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
          }}
        />
      )}

      <button
        onClick={otpSent ? handleVerifyOtp : handleSendOtp}
        disabled={loading}
        className="w-full bg-darkBg text-white py-2 px-4 rounded"
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : otpSent ? (
          "Verify OTP"
        ) : (
          "Send OTP"
        )}
      </button>

      {otpSent && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Didn't receive OTP?
          </Typography>
          <Button
            variant="text"
            onClick={handleResendOtp}
            disabled={resendDisabled || loading}
          >
            Resend OTP {resendDisabled && `(${resendTimer}s)`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LoginPage;
