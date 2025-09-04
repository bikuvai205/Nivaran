const Citizen = require('../models/Citizen'); // Import model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Citizen
const registerCitizen = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const existingCitizen = await Citizen.findOne({ email });
    if (existingCitizen) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const citizen = new Citizen({
      fullName,
      email,
      password: hashedPassword,
    });

    await citizen.save();

    res.status(201).json({ message: 'Citizen registered successfully!' });
  } catch (error) {
    console.error('❌ Citizen Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login Citizen
const loginCitizen = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required!' });
    }

    const citizen = await Citizen.findOne({ email });
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });

    const isMatch = await bcrypt.compare(password, citizen.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Create JWT token
    const token = jwt.sign(
      { id: citizen._id, email: citizen.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Citizen logged in successfully!',
      token,
      citizen: {
        id: citizen._id,
        fullName: citizen.fullName,
        email: citizen.email,
      },
    });
  } catch (error) {
    console.error('❌ Citizen Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Citizen Dashboard (Protected)
const citizenDashboard = async (req, res) => {
  try {
    // req.user comes from authMiddleware (after verifying token)
    const citizen = await Citizen.findById(req.user.id).select('-password'); // exclude password

    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    res.json({
      message: `Welcome to your dashboard, ${citizen.fullName}!`,
      citizen,
    });
  } catch (error) {
    console.error('❌ Dashboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  citizenDashboard,
};
