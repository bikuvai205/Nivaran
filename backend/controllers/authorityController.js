import Authority from "../models/authorities/Authority.js";
import jwt from "jsonwebtoken";

// Register Authority
export const registerAuthority = async (req, res) => {
  try {
    const { name, email, password, type } = req.body;

    if (!name || !email || !password || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Authority.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newAuthority = new Authority({
      name,
      email,
      password, // plain → hashed by pre-save hook
      type,
    });

    const savedAuthority = await newAuthority.save();

    res.status(201).json({
      message: "Authority registered successfully",
      authority: {
        id: savedAuthority._id,
        name: savedAuthority.name,
        email: savedAuthority.email,
        type: savedAuthority.type,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Authority
export const loginAuthority = async (req, res) => {
  try {
    const { email, password } = req.body;

    const authority = await Authority.findOne({ email });
    if (!authority) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await authority.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: authority._id, type: authority.type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: `Welcome ${authority.name}`,
      token,
      authority: {
        id: authority._id,
        name: authority.name,
        email: authority.email,
        type: authority.type,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Protected test route
export const authorityDashboard = (req, res) => {
  res.send("Welcome Authority! 🎉");
};
