const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Complaint = require("../models/Complaint");
const authMiddleware = require("../middleware/authMiddleware");
const { adminAuthMiddleware } = require("../middleware/adminAuthMiddleware");

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

// -------------------- CREATE COMPLAINT --------------------
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, severity, anonymous, location, complaintType } = req.body;
    const image = req.file ? req.file.filename : null;

    const complaint = new Complaint({
      user: req.user._id,
      title,
      description,
      severity,
      location,
      anonymous: anonymous === "true",
      image,
      complaintType,
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

// -------------------- ASSIGN AUTHORITY --------------------
router.put("/:id/assign", adminAuthMiddleware, async (req, res) => {
  try {
    const { authorityId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Assign authority and update status
    complaint.assigned_to = authorityId;
    complaint.status = "inprocess";

    const updatedComplaint = await complaint.save();
    await updatedComplaint.populate("assigned_to", "name type");

    res.json({ message: "Authority assigned successfully", complaint: updatedComplaint });
  } catch (err) {
    console.error("Assign authority error:", err);
    res.status(500).json({ message: "Failed to assign authority" });
  }
});

// -------------------- GET ALL COMPLAINTS (ADMIN) --------------------
router.get("/admin", adminAuthMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "fullName email")
      .populate("assigned_to", "name type")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
