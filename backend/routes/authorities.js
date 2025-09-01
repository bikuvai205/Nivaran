// routes/authorities.js

const express = require("express");
const {
  registerAuthority,
  loginAuthority,
  authorityDashboard,
} = require("../controllers/authorityController");

const router = express.Router();

// Register
router.post("/register", registerAuthority);

// Login
router.post("/login", loginAuthority);

// Dashboard (protected test route)
router.get("/dashboard", authorityDashboard);

module.exports = router;

