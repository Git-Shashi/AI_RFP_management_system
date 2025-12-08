const nodemailer = require('nodemailer');

const emailConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_APP_PASSWORD,
  imap: {
    host: process.env.EMAIL_IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.EMAIL_IMAP_PORT) || 993,
  },
  smtp: {
    host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SMTP_PORT) || 587,
  }
};

const transporter = nodemailer.createTransport({
  host: emailConfig.smtp.host,
  port: emailConfig.smtp.port,
  secure: false,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.password,
  },
});

module.exports = { emailConfig, transporter };
