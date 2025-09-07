const express = require('express');
const {
  registerCitizen,
  loginCitizen,
  citizenDashboard
} = require('../controllers/citizenController');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ middleware to check token
const upload = require("../middleware/uploadMiddleware"); // ✅ middleware for handling file uploads


// for the debugging purpose
// const router = express.Router();
// router.use((req, res, next) => {
//   console.log(`📝 Citizen Route Hit: ${req.method} ${req.originalUrl}`);
//   next();
// });

// Citizen Registration
router.post('/register', registerCitizen);

// Citizen Login
router.post('/login', loginCitizen);

// Citizen Dashboard (Protected)
router.get('/dashboard', authMiddleware, citizenDashboard);
// ✅ New route: Citizen submits a complaint with image
router.post("/complaints", upload.single("image"), (req, res) => {
  try {
    const { title, description, severity, anonymous } = req.body;

    // Image path if uploaded
    const imageUrl = req.file ? `/uploads/complaints/${req.file.filename}` : null;

    // For now, just send back response (later we’ll save in MongoDB)
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

module.exports = router; //  CommonJS export
