export const loginUserOtp = (email: string, otp: string) => {
  const subject = "Login OTP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Login Verification</h2>
      <p>Hi,</p>
      <p>Your OTP for logging into your account is <strong>${otp}</strong>.</p>
      <p>Please use this code to complete your login.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you!</p>
    </div>
  `;

  return { subject, html };
};
