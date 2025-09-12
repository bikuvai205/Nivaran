// middleware/authorityAuth.js
const jwt = require("jsonwebtoken");
const Authority = require("../models/authorities/Authority"); // Adjust path if needed

const protectAuthority = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch authority from DB, exclude password
    const authority = await Authority.findById(decoded.id).select("-password");
    if (!authority) {
      return res.status(401).json({ message: "Authority not found" });
    }

    // Attach the authenticated authority to the request
    req.authority = authority;
    next();
  } catch (error) {
    console.error("Authority Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = protectAuthority;
