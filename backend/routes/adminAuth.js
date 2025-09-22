// backend/routes/adminAuth.js
const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminAuthController');

// POST /admin/login
router.post('/login', adminLogin);

module.exports = router;
//comment