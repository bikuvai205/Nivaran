const express = require("express");
const {
  registerAuthority,
  loginAuthority,
  authorityDashboard,
  getAllAuthorities,
  deleteAuthorityByEmail
} = require("../controllers/authorityController");

const router = express.Router();

// Register Authority
router.post("/register", registerAuthority);

// Login Authority
router.post("/login", loginAuthority);

// Dashboard (protected test route)
router.get("/dashboard", authorityDashboard);

// Get all verified authorities
router.get("/", getAllAuthorities);

// Delete authority by email
router.delete("/email/:email", deleteAuthorityByEmail);

module.exports = router;
