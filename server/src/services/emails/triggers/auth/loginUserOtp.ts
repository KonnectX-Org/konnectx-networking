import { EmailService } from "../../EmailService";

export const sendLoginOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<void> => {
  const emailService = EmailService.getInstance();

  const subject = "Login OTP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Login Verification</h2>
      <p>Hello,</p>
      <p>You've requested to log in to your KonnectX account. Please use the following OTP to complete your login process:</p>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; letter-spacing: 5px;">
        ${otp}
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this login, please ignore this email or contact support if you have any concerns.</p>
      <p>Thank you,<br>The KonnectX Team</p>
    </div>
  `;

  await emailService.sendEmail({
    to: email,
    subject,
    html,
  });
};
