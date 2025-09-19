const Authority = require("../models/authorities/Authority");
const jwt = require("jsonwebtoken");

// Register Authority
const registerAuthority = async (req, res) => {
  try {
    const { name, username, email, phone, password, type } = req.body;

    if (!name || !username || !email || !phone || !password || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicates
    const existingEmail = await Authority.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already registered" });

    const existingUsername = await Authority.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already taken" });

    const newAuthority = new Authority({ name, username, email, phone, password, type });
    const savedAuthority = await newAuthority.save();

    res.status(201).json({
      message: "Authority registered successfully",
      authority: {
        id: savedAuthority._id,
        name: savedAuthority.name,
        username: savedAuthority.username,
        email: savedAuthority.email,
        phone: savedAuthority.phone,
        type: savedAuthority.type,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Authority
const loginAuthority = async (req, res) => {
  try {
    const { email, password } = req.body;

    const authority = await Authority.findOne({ email });
    if (!authority) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await authority.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: authority._id, type: authority.type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: `Welcome ${authority.username}`,
      token,
      authority: {
        id: authority._id,
        name: authority.name,
        username: authority.username,
        email: authority.email,
        phone: authority.phone,
        type: authority.type,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Protected test route
const authorityDashboard = (req, res) => {
  res.send("Welcome Authority! 🎉");
};

// Get all verified authorities
const getAllAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find().select("-password");
    res.status(200).json(authorities);
  } catch (error) {
    console.error("Fetch Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete authority by email
const deleteAuthorityByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const authority = await Authority.findOne({ email });
    if (!authority) return res.status(404).json({ message: "Authority not found" });

    await Authority.deleteOne({ email });
    res.status(200).json({ message: `Authority ${email} deleted successfully!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get logged-in authority info
const getAuthorityMe = async (req, res) => {
  try {
    if (!req.authority) return res.status(401).json({ message: "Not authorized" });

    res.status(200).json({
      id: req.authority._id,
      name: req.authority.name,
      username: req.authority.username,
      email: req.authority.email,
      phone: req.authority.phone,
      type: req.authority.type,
    });
  } catch (error) {
    console.error("Get Authority Me Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export all functions
module.exports = {
  registerAuthority,
  loginAuthority,
  authorityDashboard,
  getAllAuthorities,
  deleteAuthorityByEmail,
  getAuthorityMe,
};
