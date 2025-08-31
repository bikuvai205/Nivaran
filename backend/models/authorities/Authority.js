const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authoritySchema = new mongoose.Schema({
  name: { type: String, required: true },              // Person's name
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["Ward Police Unit", "Garbage Disposal Unit", "Infrastructure Development Unit", "Electricity Authority Unit", "Water Supply Unit", "Vetenary Unit", "Animal Control Unit"],
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

// 🔒 Hash password before saving
authoritySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Password check method
authoritySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Authority", authoritySchema);
