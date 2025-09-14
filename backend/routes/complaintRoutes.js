// routes/complaintRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Complaint = require("../models/Complaint");
const Authority = require("../models/authorities/Authority"); // ✅ authority model
const Citizen = require("../models/Citizen"); // ✅ citizen model

const authMiddleware = require("../middleware/authMiddleware"); // citizen middleware
const { adminAuthMiddleware } = require("../middleware/adminAuthMiddleware"); // admin middleware
const protectAuthority = require("../middleware/authAuthority"); // authority middleware

// -------------------- MULTER SETUP --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/complaints"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// -------------------- CREATE COMPLAINT --------------------
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, severity, anonymous, location, complaintType } =
      req.body;
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
    res
      .status(201)
      .json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ message: "Failed to submit complaint" });
  }
});

// -------------------- GET PENDING COMPLAINTS --------------------
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: "pending" })
      .populate("user", "_id fullName")
      .sort({ createdAt: -1 });

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

// -------------------- VOTE COMPLAINT --------------------
router.put("/:id/vote", authMiddleware, async (req, res) => {
  try {
    const { voteType } = req.body; // 1 = upvote, -1 = downvote, 0 = remove
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    const existingVoteIndex = complaint.votes.findIndex(
      (v) => v.user.toString() === req.user._id.toString()
    );

    if (existingVoteIndex > -1) {
      const prevVote = complaint.votes[existingVoteIndex];
      if (prevVote.voteType === 1) complaint.upvotes--;
      if (prevVote.voteType === -1) complaint.downvotes--;

      if (voteType === 0) {
        complaint.votes.splice(existingVoteIndex, 1);
      } else {
        complaint.votes[existingVoteIndex].voteType = voteType;
        if (voteType === 1) complaint.upvotes++;
        if (voteType === -1) complaint.downvotes++;
      }
    } else {
      if (voteType === 1) complaint.upvotes++;
      if (voteType === -1) complaint.downvotes++;
      if (voteType !== 0)
        complaint.votes.push({ user: req.user._id, voteType });
    }

    await complaint.save();
    res.json({ upvotes: complaint.upvotes, downvotes: complaint.downvotes });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Failed to vote" });
  }
});

// -------------------- UPDATE COMPLAINT (PENDING ONLY) --------------------
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    if (complaint.user.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "Not authorized to edit this complaint" });

    if (complaint.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending complaints can be edited" });

    if (title?.trim()) complaint.title = title.trim();
    if (description?.trim()) complaint.description = description.trim();
    if (location?.trim()) complaint.location = location.trim();

    const updated = await complaint.save();
    res.json(updated);
  } catch (err) {
    console.error("Error updating complaint:", err);
    res.status(500).json({ message: "Failed to update complaint" });
  }
});

// -------------------- GET MINE --------------------
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// -------------------- DELETE COMPLAINT --------------------
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    if (complaint.user.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "Not authorized to delete this complaint" });

    if (complaint.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending complaints can be deleted" });

    await complaint.deleteOne();
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete complaint" });
  }
});


// -------------------- ADMIN: VIEW ALL COMPLAINTS --------------------
router.get("/admin", adminAuthMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "fullName username email")
      .populate("assigned_to", "username type email phone")
      .sort({ createdAt: -1 });

    const formatted = complaints.map((c) => ({
      ...c.toObject(),
      displayUser: c.anonymous
        ? `${c.user?.username || "user123"} / Anonymous`
        : c.user?.fullName || "Unknown User",
      // 🔑 Normalize `assigned_to` → `assignedTo`
      assignedTo: c.assigned_to
        ? {
            username: c.assigned_to.username,
            type: c.assigned_to.type,
            email: c.assigned_to.email,
            phone: c.assigned_to.phone,
          }
        : null,
    }));
    // console.log(formatted);
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching complaints (admin):", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- STATS --------------------
router.get("/stats/per-day", async (req, res) => {
  try {
    const complaints = await Complaint.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Kathmandu",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats/complaints-per-hour", async (req, res) => {
  try {
    const complaints = await Complaint.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d %H:00",
              date: "$createdAt",
              timezone: "Asia/Kathmandu",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, hour: "$_id", count: 1 } },
    ]);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- SUMMARY COUNT --------------------
router.get("/summary", async (req, res) => {
  try {
    const totalAuthorities = await Authority.countDocuments();
    const totalCitizens = await Citizen.countDocuments();
    const totalTasks = await Complaint.countDocuments();

    // Count complaints per status
    const statusAggregation = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusCounts = statusAggregation.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, { pending: 0, assigned: 0, inprogress: 0, resolved: 0 });

    res.json({ totalAuthorities, totalCitizens, totalTasks, statusCounts });
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// -------------------- STATUS COUNT ONLY --------------------
router.get("/status-count", async (req, res) => {
  try {
    const complaints = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", value: "$count" } },
    ]);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/summary", async (req, res) => {
  try {
    const totalAuthorities = await Authority.countDocuments();
    const totalCitizens = await Citizen.countDocuments();
    const totalTasks = await Complaint.countDocuments();

    // Count complaints per status
    const statusAggregation = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert array to object
    const statusCounts = statusAggregation.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {
      pending: 0,
      assigned: 0,
      inprogress: 0,
      resolved: 0,
    });

    res.json({
      totalAuthorities,
      totalCitizens,
      totalTasks,
      statusCounts,
    });
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// -------------------- ADMIN: ASSIGN AUTHORITY --------------------
router.post("/assign", adminAuthMiddleware, async (req, res) => {
  try {
    const { complaintId, authorityId } = req.body;
    if (!complaintId || !authorityId)
      return res
        .status(400)
        .json({ message: "Complaint ID and Authority ID are required" });

    const complaint = await Complaint.findById(complaintId);
    const authority = await Authority.findById(authorityId);
    if (!complaint || !authority)
      return res
        .status(404)
        .json({ message: "Complaint or Authority not found" });

    complaint.assigned_to = authorityId;
    complaint.status = "assigned";
    await complaint.save();

    authority.status = "assigned";
    await authority.save();

    res.json({ message: "Authority assigned successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign authority" });
  }
});

// -------------------- AUTHORITY: ACCEPT TASK --------------------
router.post("/:id/accept", protectAuthority, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const authorityId = req.authority._id;

    const complaint = await Complaint.findById(complaintId);
    const authority = await Authority.findById(authorityId);
    if (!complaint || !authority)
      return res
        .status(404)
        .json({ message: "Complaint or Authority not found" });

    if (
      !complaint.assigned_to ||
      complaint.assigned_to.toString() !== authorityId.toString()
    )
      return res
        .status(403)
        .json({ message: "You are not assigned to this complaint" });

    if (complaint.status !== "assigned")
      return res
        .status(400)
        .json({ message: "Complaint cannot be accepted now" });

    complaint.status = "inprogress";
    await complaint.save();

    authority.status = "busy";
    await authority.save();

    res.json({
      message: "Complaint accepted. Status updated to inprogress.",
      complaint,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept complaint" });
  }
});

// -------------------- AUTHORITY: REJECT TASK --------------------
router.post("/:id/reject", protectAuthority, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const authorityId = req.authority._id;

    const complaint = await Complaint.findById(complaintId);
    const authority = await Authority.findById(authorityId);
    if (!complaint || !authority)
      return res
        .status(404)
        .json({ message: "Complaint or Authority not found" });

    if (
      !complaint.assigned_to ||
      complaint.assigned_to.toString() !== authorityId.toString()
    )
      return res
        .status(403)
        .json({ message: "You are not assigned to this complaint" });

    if (complaint.status !== "assigned")
      return res
        .status(400)
        .json({ message: "Complaint cannot be rejected now" });

    complaint.assigned_to = null;
    complaint.status = "pending";
    await complaint.save();

    authority.status = "free";
    await authority.save();

    res.json({
      message: "Complaint rejected. Authority is now free.",
      complaint,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject complaint" });
  }
});

// -------------------- AUTHORITY: GET ASSIGNED TASKS --------------------
router.get("/assigned", protectAuthority, async (req, res) => {
  try {
    const authorityId = req.authority._id;

    const tasks = await Complaint.find({ assigned_to: authorityId }).sort({
      createdAt: -1,
    });

    const tasksWithAssignedAt = tasks.map((t) => ({
      ...t.toObject(),
      assignedAt: t.updatedAt,
    }));

    res.json(tasksWithAssignedAt);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assigned tasks" });
  }
});

// -------------------- AUTHORITY: MARK AS RESOLVED --------------------
router.post("/:id/resolve", protectAuthority, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const authorityId = req.authority._id;

    const complaint = await Complaint.findById(complaintId);
    const authority = await Authority.findById(authorityId);

    if (!complaint || !authority)
      return res
        .status(404)
        .json({ message: "Complaint or Authority not found" });

    if (
      !complaint.assigned_to ||
      complaint.assigned_to.toString() !== authorityId.toString()
    )
      return res
        .status(403)
        .json({ message: "You are not assigned to this complaint" });

    if (complaint.status !== "inprogress")
      return res
        .status(400)
        .json({ message: "Only in-progress complaints can be resolved" });

    complaint.status = "resolved";
    complaint.solvedAt = new Date();
    await complaint.save();

    authority.status = "free";
    await authority.save();

    res.json({ message: "Complaint marked as resolved.", complaint });
  } catch (err) {
    console.error("Error resolving complaint:", err);
    res.status(500).json({ message: "Failed to mark complaint as resolved" });
  }
});

module.exports = router;
