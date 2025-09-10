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
router.post("/:id/vote", authMiddleware, async (req, res) => {
  try {
    const { voteType } = req.body; // 1 = upvote, -1 = downvote, 0 = remove
    const citizenId = req.user._id;
    const complaintId = req.params.id;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Find existing vote by this user
    const existingVoteIndex = complaint.votes.findIndex(
      (v) => v.user.toString() === citizenId.toString()
    );

    if (existingVoteIndex > -1) {
      // If user already voted
      if (voteType === 0) {
        // Remove vote
        complaint.votes.splice(existingVoteIndex, 1);
      } else {
        // Update vote
        complaint.votes[existingVoteIndex].voteType = voteType;
      }
    } else if (voteType !== 0) {
      // New vote
      complaint.votes.push({ user: citizenId, voteType });
    }

    // Recalculate upvotes & downvotes
    complaint.upvotes = complaint.votes.filter((v) => v.voteType === 1).length;
    complaint.downvotes = complaint.votes.filter((v) => v.voteType === -1).length;

    await complaint.save();

    // Send response including this user's current vote
    const userVote =
      complaint.votes.find((v) => v.user.toString() === citizenId.toString())?.voteType || 0;

    res.json({
      upvotes: complaint.upvotes,
      downvotes: complaint.downvotes,
      userVote,
    });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Failed to update vote" });
  }
});


module.exports = router;
