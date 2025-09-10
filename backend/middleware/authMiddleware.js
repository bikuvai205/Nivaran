const jwt = require("jsonwebtoken");
const Citizen = require("../models/Citizen"); // adjust path if needed

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch citizen from DB
    const citizen = await Citizen.findById(decoded.id).select("_id fullName email");
    if (!citizen) {
      return res.status(401).json({ message: "Citizen not found" });
    }

    req.user = citizen; // attach authenticated citizen
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
