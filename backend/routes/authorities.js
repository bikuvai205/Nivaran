const express = require("express");
const {
  registerAuthority,
  loginAuthority,
  authorityDashboard,
  getAllAuthorities,
  deleteAuthorityByEmail,
  getAuthorityMe
} = require("../controllers/authorityController");

const protectAuthority = require("../middleware/authAuthority"); // <-- import middleware

const router = express.Router();

// Register Authority
router.post("/register", registerAuthority);

// Login Authority
router.post("/login", loginAuthority);

// Dashboard (protected test route)
router.get("/dashboard", protectAuthority, authorityDashboard); // <-- protected

// Get all verified authorities
router.get("/", getAllAuthorities);

// Delete authority by email
router.delete("/email/:email", deleteAuthorityByEmail);

// Get logged-in authority info
router.get("/me", protectAuthority, getAuthorityMe); // <-- protected

module.exports = router;
