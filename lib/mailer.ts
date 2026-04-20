import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: "SSLv3",
  },
});

export const FROM = `"Search & Play" <${process.env.EMAIL_USER}>`;

export function otpEmailHtml(name: string, otp: string, message = "Enter this code to continue:") {
  return `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0d14;color:#e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(90deg,#f97316,#fb923c);padding:24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;">Search &amp; Play</h1>
      </div>
      <div style="padding:32px;text-align:center;">
        <p style="font-size:16px;margin-bottom:8px;">Hi <strong>${name}</strong>,</p>
        <p style="color:#94a3b8;margin-bottom:24px;">${message}</p>
        <div style="background:#1e1e2e;border:2px solid #f97316;border-radius:12px;padding:24px;display:inline-block;margin-bottom:24px;">
          <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#f97316;">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:13px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#64748b;font-size:13px;">If you did not request this, ignore this email.</p>
      </div>
    </div>`;
}
