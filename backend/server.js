// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/adminRoute');


// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/admin', adminAuthRoutes);// verify adimin login
app.use('/admin', adminRoutes);  //change admin password
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// Simple route to test
app.get('/', (req, res) => {
  res.send('🚀 Nivaran backend running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
