// routes/admindashboardRoute.js
const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const Citizen = require("../models/Citizen");
const Authority = require("../models/authorities/Authority");
const { adminAuthMiddleware } = require("../middleware/adminAuthMiddleware");

// ------------------ ADMIN DASHBOARD SUMMARY ------------------
router.get("/summary", adminAuthMiddleware, async (req, res) => {
  try {
    const totalCitizens = await Citizen.countDocuments();
    const totalAuthorities = await Authority.countDocuments();
    const totalComplaints = await Complaint.countDocuments();

    const statusCounts = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const formattedStatus = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      totalCitizens,
      totalAuthorities,
      totalComplaints,
      statusCounts: formattedStatus,
    });
  } catch (err) {
    console.error("Error fetching admin summary:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ COMPLAINTS BY CATEGORY ------------------
router.get("/complaints-by-category", adminAuthMiddleware, async (req, res) => {
  try {
    const result = await Complaint.aggregate([
      { $group: { _id: "$complaintType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error fetching complaints by category:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ COMPLAINTS TREND (per day) ------------------
router.get("/complaints-per-day", adminAuthMiddleware, async (req, res) => {
  try {
    const perDay = await Complaint.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(perDay.map((d) => ({ date: d._id, count: d.count })));
  } catch (err) {
    console.error("Error fetching complaints per day:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- AUTHORITY PERFORMANCE ----------
router.get("/authority-performance", adminAuthMiddleware, async (req, res) => {
  try {
    const result = await Complaint.aggregate([
      {
        $lookup: {
          from: "authorities",
          localField: "assigned_to",
          foreignField: "_id",
          as: "authority",
        },
      },
      { $unwind: "$authority" },
      {
        $group: {
          _id: "$authority.type",
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          pending: {
            $sum: {
              $cond: [
                { $in: ["$status", ["pending", "assigned", "inprogress"]] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          type: "$_id",
          resolved: 1,
          pending: 1,
          _id: 0,
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Authority performance error:", err);
    res.status(500).json({ error: "Failed to fetch authority performance" });
  }
});


module.exports = router;
