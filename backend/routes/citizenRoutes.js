const express = require('express');
const router = express.Router();
const {
  registerCitizen,
  verifyOTP,          // <- New
  loginCitizen,
  citizenDashboard,
  getAllCitizens,
  deleteCitizenByEmail,
  changePassword
} = require('../controllers/citizenController');

const authMiddleware = require('../middleware/authMiddleware'); // check token
const upload = require("../middleware/uploadMiddleware"); // handle file uploads
const Citizen = require('../models/Citizen');
const bcrypt = require('bcryptjs');

// --- Citizen Registration ---
router.post('/register', registerCitizen);

// --- Verify OTP for registration ---
router.post('/verify-otp', verifyOTP); // <- New endpoint

// --- Citizen Login ---
router.post('/login', loginCitizen);

// --- Citizen Dashboard (Protected) ---
router.get('/dashboard', authMiddleware, citizenDashboard);

// --- Admin: fetch all citizens ---
router.get('/', getAllCitizens);

// --- Delete citizen by email ---
router.delete("/email/:email", deleteCitizenByEmail);

// --- Change Password (Protected) ---
router.put("/change-password", authMiddleware, changePassword);

// --- Citizen submits a complaint with image ---
router.post("/complaints", upload.single("image"), (req, res) => {
  try {
    const { title, description, severity, anonymous } = req.body;

    // Image path if uploaded
    const imageUrl = req.file ? `/uploads/complaints/${req.file.filename}` : null;

    // For now, just send back response (later save in DB)
    res.json({
      message: "Complaint submitted successfully!",
      data: {
        title,
        description,
        severity,
        anonymous,
        imageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading complaint", error });
  }
});
// TEMP: Debug password match
router.post('/debug-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const citizen = await Citizen.findOne({ email });
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });

    console.log("Login attempt:", { email, password });
    console.log("Stored hash:", citizen.password);

    const isMatch = await bcrypt.compare(password, citizen.password);
    console.log("Password match result:", isMatch);

    res.json({ email, isMatch, storedHash: citizen.password });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
