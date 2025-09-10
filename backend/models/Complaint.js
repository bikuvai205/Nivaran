// backend/models/Complaint.js
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], default: "low" },
    anonymous: { type: Boolean, default: false },
    location: { type: String, required: true }, // added field
    image: { type: String },

    // voting
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    votes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen" },
        voteType: { type: Number, enum: [1, -1] }, // 1 = upvote, -1 = downvote
      },
    ],

    status: {
      type: String,
      enum: ["pending", "inprogress", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
