
import Authority from "../models/authorities/Authority.js";

export const registerAuthority = async (req, res) => {
  try {
    const { type, officeName, email, phone, username, password } = req.body;

    // check if email already exists
    const existing = await Authority.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newAuthority = new Authority({
      type,
      officeName,
      email,
      phone,
      username,
      password, // gets hashed automatically by pre-save hook
    });

    await newAuthority.save();

    res.status(201).json({
      message: "Authority registered successfully",
      authority: {
        id: newAuthority._id,
        type: newAuthority.type,
        officeName: newAuthority.officeName,
        email: newAuthority.email,
        phone: newAuthority.phone,
        username: newAuthority.username,
      },
    });
  } catch (error) {
    console.error("Error registering authority:", error);
    res.status(500).json({ message: "Server error" });
  }
};
