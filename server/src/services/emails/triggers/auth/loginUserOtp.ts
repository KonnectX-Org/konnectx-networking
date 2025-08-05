import { EmailService } from "../../EmailService";
import { loginUserOtp } from "../../templates/auth/loginUserOtp/loginUserOtp";

export const sendLoginOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<void> => {
  const emailService = EmailService.getInstance();

  const { subject, html } = loginUserOtp(email, otp);

  await emailService.sendEmail({
    to: email,
    subject,
    html,
  });
};
export default sendLoginOtp;
