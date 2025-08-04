import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../hooks/SnackbarContext";
import userApi from "../apis/userApi";
import { TextField, Button, Box, Typography, CircularProgress } from "@mui/material";

const LoginPage = () => {
  const eventId = "6864dd952cf135f217b9e057";
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
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
    const response = await userApi.post("/user/login", { email });
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
      const response = await userApi.post("/user/verify-otp", { email, otp });
      
      if (response.data.success) {
        // Check if user is registered for this event
        const eventCheck = await userApi.get(`/user/${eventId}/check-registration`);
        
        if (eventCheck.data.registered) {
          navigate(`/home`);
        } else {
          // If not registered, redirect to registration form
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
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <Typography variant="body1" gutterBottom>
        Login to access the event
      </Typography>

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
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          margin="normal"
          sx={{ mb: 2 }}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }}
        />
      )}

      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={otpSent ? handleVerifyOtp : handleSendOtp}
        disabled={loading}
        sx={{ mt: 2, height: 48 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : otpSent ? (
          "Verify OTP"
        ) : (
          "Send OTP"
        )}
      </Button>

      {otpSent && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
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