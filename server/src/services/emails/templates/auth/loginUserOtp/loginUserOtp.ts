export const loginUserOtp = (email: string, otp: string) => {
  return {
    subject: "Login OTP",
    text: `Your OTP for login is ${otp}. Please use this to complete your login process.`,
    html: `<p>Your OTP for login is <strong>${otp}</strong>. Please use this to complete your login process.</p>`,
    to: email,
  };
};
