const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Complaint = require("../models/Complaint");
const authMiddleware = require("../middleware/authMiddleware");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/complaints");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// POST route: create complaint
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, severity, anonymous, location } = req.body;
    const image = req.file ? req.file.filename : null;

    // Validate required fields
    if (!title || !description || !location) {
      return res.status(400).json({ message: "Title, description, and location are required." });
    }

    const complaint = new Complaint({
      user: req.user._id,
      title,
      description,
      severity,
      anonymous: anonymous === "true",
      image,
      location, // <-- Added location
      upvotes: 0,
      downvotes: 0,
      status: "pending",
    });

    await complaint.save();
    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ message: "Failed to submit complaint" });
  }
});

// GET route: fetch all pending complaints
router.get("/pending", async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: "pending" })
      .populate("user", "_id fullName")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

module.exports = router;
