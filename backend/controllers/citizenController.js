const Citizen = require('../models/Citizen');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendOTPEmail = require('../utils/sendEmail'); // Nodemailer utility

// ------------------------- REGISTER CITIZEN -------------------------
const registerCitizen = async (req, res) => {
  try {
    let { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ message: 'All fields are required!' });

    fullName = fullName.trim();
    email = email.trim().toLowerCase();
    password = password.trim();

    const existingCitizen = await Citizen.findOne({ email });
    if (existingCitizen)
      return res.status(400).json({ message: 'Email already registered!' });

    // console.log("Raw password before save (will be hashed in schema):", password);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const citizen = new Citizen({ fullName, email, password, otp, otpExpires });
    await citizen.save();

    const sent = await sendOTPEmail(email, otp);
    if (!sent)
      return res.status(500).json({ message: 'Failed to send OTP email' });

    res.status(201).json({
      message: 'OTP sent to email. Please verify to complete registration.',
      email,
    });
  } catch (error) {
    console.error('❌ Citizen Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------- VERIFY OTP -------------------------
const verifyOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required!' });

    email = email.trim().toLowerCase();
    otp = otp.trim();

    const citizen = await Citizen.findOne({ email });
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });

    if (citizen.isVerified)
      return res.status(400).json({ message: 'Email already verified!' });

    if (citizen.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (citizen.otpExpires < new Date())
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    citizen.isVerified = true;
    citizen.otp = undefined;
    citizen.otpExpires = undefined;
    await citizen.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('❌ OTP Verification Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------- LOGIN CITIZEN -------------------------
const loginCitizen = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required!' });

    email = email.trim().toLowerCase();
    password = password.trim();

    const citizen = await Citizen.findOne({ email });
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });
    if (!citizen.isVerified)
      return res.status(401).json({ message: 'Email not verified. Please verify first.' });

    // console.log("Login attempt (cleaned):", { email, password });
    // console.log("Stored hash in DB:", citizen.password);

    const isMatch = await bcrypt.compare(password, citizen.password);
    // console.log("Password match result:", isMatch);

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: citizen._id, email: citizen.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Citizen logged in successfully!',
      token,
      citizen: { id: citizen._id, fullName: citizen.fullName, email: citizen.email },
    });
  } catch (error) {
    console.error('❌ Citizen Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------- DASHBOARD -------------------------
const citizenDashboard = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user.id).select('-password');
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });

    res.json({ message: `Welcome to your dashboard, ${citizen.fullName}!`, citizen });
  } catch (error) {
    console.error('❌ Dashboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------- GET ALL CITIZENS -------------------------
const getAllCitizens = async (req, res) => {
  try {
    const citizens = await Citizen.find().select('-password');
    res.status(200).json(citizens);
  } catch (error) {
    console.error('❌ Fetch Citizens Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------- DELETE CITIZEN -------------------------
const deleteCitizenByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const deletedCitizen = await Citizen.findOneAndDelete({ email: email.trim().toLowerCase() });
    if (!deletedCitizen) return res.status(404).json({ message: 'Citizen not found' });

    res.status(200).json({ message: `Citizen with email ${email} deleted successfully!` });
  } catch (error) {
    console.error('❌ Delete Citizen Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------- CHANGE PASSWORD -------------------------
const changePassword = async (req, res) => {
  if (!req.user || !req.user._id) return res.status(401).json({ message: 'Unauthorized: no user info' });

  const citizenId = req.user._id;
  let { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new passwords are required' });

  currentPassword = currentPassword.trim();
  newPassword = newPassword.trim();

  try {
    const citizen = await Citizen.findById(citizenId).select('+password');
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });

    const isCurrentMatch = await bcrypt.compare(currentPassword, citizen.password);
    if (!isCurrentMatch) return res.status(401).json({ message: 'Invalid current password' });

    const isSamePassword = await bcrypt.compare(newPassword, citizen.password);
    if (isSamePassword) return res.status(400).json({ message: 'New password cannot be same as current' });

    // assign plain password, schema pre-save hook will hash it
    citizen.password = newPassword;
    await citizen.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change Password Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerCitizen,
  verifyOTP,
  loginCitizen,
  citizenDashboard,
  getAllCitizens,
  deleteCitizenByEmail,
  changePassword,
};
