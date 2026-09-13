const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
}

async function sendOtpEmail(to, otp) {
  await sendEmail({
    to,
    subject: 'Your login verification code',
    html: `<p>Your one-time verification code is:</p>
           <h2 style="letter-spacing:4px">${otp}</h2>
           <p>This code expires in ${process.env.OTP_EXPIRES_MIN || 5} minutes. If you didn't request this, you can ignore this email.</p>`,
  });
}

async function sendResetEmail(to, resetUrl) {
  await sendEmail({
    to,
    subject: 'Reset your password',
    html: `<p>We received a request to reset your password.</p>
           <p><a href="${resetUrl}">Click here to reset your password</a> (expires in ${process.env.RESET_TOKEN_EXPIRES_MIN || 30} minutes).</p>
           <p>If you didn't request this, you can safely ignore this email.</p>`,
  });
}

module.exports = { sendEmail, sendOtpEmail, sendResetEmail };
