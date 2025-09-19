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
  subject: `Nivaran - Registration Code [${otp}]`,
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f8f8f8; padding: 20px;">
      <div style="
        max-width: 600px; 
        margin: auto; 
        background-color: #ffffff; 
        border-radius: 10px; 
        padding: 30px; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      ">
        <h2 style="color: #e11d48; margin-bottom: 10px;">Welcome to Nivaran!</h2>
        <p style="color: #333; font-size: 16px;">
          Hi there, <br/>
          Thank you for registering with <strong>Nivaran</strong>. Please use the OTP below to verify your account and complete the registration process. This OTP is valid for a limited time.
        </p>

        <p style="
          background-color: #000; 
          color: #fff; 
          font-size: 28px; 
          font-weight: bold; 
          text-align: center; 
          padding: 15px 0; 
          border-radius: 8px; 
          margin: 20px 0;
        ">
          ${otp}
        </p>

        <p style="color: #b91c1c; font-weight: bold; font-size: 14px;">
          ⚠️ Do not share this OTP with anyone. Keep it confidential.
        </p>

        <p style="color: #333; font-size: 16px; margin-top: 30px;">
          Thank you for choosing Nivaran!
        </p>
        <p style="color: #333; font-size: 16px;">
          Yours sincerely,<br/>
          - Nivaran Team
        </p>
      </div>
    </div>
  `,
};



    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = sendOTPEmail;
