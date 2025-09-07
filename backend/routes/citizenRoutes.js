const express = require('express');
const {
  registerCitizen,
  loginCitizen,
  citizenDashboard,
  getAllCitizens,
  deleteCitizenByEmail
} = require('../controllers/citizenController');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ middleware to check token

const router = express.Router();

// Citizen Registration
router.post('/register', registerCitizen);

// Citizen Login
router.post('/login', loginCitizen);

// Citizen Dashboard (Protected)
router.get('/dashboard', authMiddleware, citizenDashboard);


//admin:fetch all citizens
router.get('/',getAllCitizens);

// Delete citizen by email
router.delete("/email/:email", deleteCitizenByEmail);


module.exports = router; // ✅ CommonJS export
