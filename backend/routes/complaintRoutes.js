// backend/routes/complaintRoutes.js
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

// GET route: fetch all pending complaints
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: "pending" })
      .populate("user", "_id fullName")
      .sort({ createdAt: -1 });

    // add userVote for current logged-in citizen
    const formatted = complaints.map((c) => {
      const vote = c.votes.find((v) => v.user.toString() === req.user._id);
      return {
        ...c.toObject(),
        userVote: vote ? vote.voteType : 0,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// POST /api/complaints/:id/vote
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { title, description, location } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Ensure the logged-in user is the owner
    // req.user may be a Mongoose document or plain object, compare strings
    const ownerId = complaint.user.toString();
    const requesterId = req.user._id ? req.user._id.toString() : req.user.toString();
    if (ownerId !== requesterId) {
      return res.status(403).json({ message: "Not authorized to edit this complaint" });
    }

    // Only allow edits when still pending
    if (complaint.status !== "pending") {
      return res.status(400).json({ message: "Only pending complaints can be edited" });
    }

    // Update allowed fields
    if (typeof title === "string" && title.trim().length > 0) complaint.title = title.trim();
    if (typeof description === "string" && description.trim().length > 0) complaint.description = description.trim();
    if (typeof location === "string") complaint.location = location.trim();

    const updated = await complaint.save();

    // Return the updated document
    res.json(updated);
  } catch (err) {
    console.error("Error updating complaint:", err);
    res.status(500).json({ message: "Failed to update complaint" });
  }
});
// GET /api/complaints/mine - fetch complaints of logged-in citizen
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints" });
  }
});
// Delete complaint (only owner, only when status === 'pending')
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this complaint" });
    }

    if (complaint.status !== "pending") {
      return res.status(400).json({ message: "Only pending complaints can be deleted" });
    }

    await complaint.deleteOne();
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Error deleting complaint:", err);
    res.status(500).json({ message: "Failed to delete complaint" });
  }
});



module.exports = router;
