import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Reset your Axiglot password",
    html: `
      <p>Hello,</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#6366f1;color:white;border-radius:6px;text-decoration:none;font-weight:bold;">
          Reset Password
        </a>
      </p>
      <p>If you didn’t request this, you can ignore this email.</p>
      <p>Thanks,<br/>The Axiglot Team</p>
    `,
  });
}
