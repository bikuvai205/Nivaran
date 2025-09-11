const express = require('express');
const router = express.Router();
const {
  registerCitizen,
  loginCitizen,
  citizenDashboard,
  getAllCitizens,
  deleteCitizenByEmail,
   changePassword 
} = require('../controllers/citizenController');

const authMiddleware = require('../middleware/authMiddleware'); // check token
const upload = require("../middleware/uploadMiddleware"); // handle file uploads

// --- Citizen Registration ---
router.post('/register', registerCitizen);

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


module.exports = router;
