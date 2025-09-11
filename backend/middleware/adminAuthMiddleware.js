import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const adminAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.user = admin;
    next();
  } catch (err) {
    console.error("Admin Auth Middleware Error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
