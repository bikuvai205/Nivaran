const express = require("express");
const Authority = require("../models/authorities/Authority");

const router = express.Router();

// Register Authority
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, type } = req.body;

    // Check required fields
    if (!name || !email || !password || !type) {
      return res.status(400).json({ message: "All fields are required " });
    }

    // Check if email already exists
    const existing = await Authority.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const authority = new Authority({ name, email, password, type });
    await authority.save(); // <-- this actually writes to MongoDB
console.log("Saved Authority:");
    res.status(201).json({ message: "Authority registered successfully", authority });
  } catch (err) {
     console.error("Error registering authority:", err); // This will print the full error
    res.status(500).json({ message: err.message });     // Send error message back to Postman
  }
});

module.exports = router;
