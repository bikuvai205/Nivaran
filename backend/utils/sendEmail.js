const nodemailer = require("nodemailer");

const sendOTPEmail = async (toEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // or your email provider
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    const mailOptions = {
      from: `"Nivaran" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Email Verification OTP",
      html: `<p>Your OTP for registration is: <b>${otp}</b></p>`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = sendOTPEmail;
