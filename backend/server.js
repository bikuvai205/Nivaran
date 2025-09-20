// backend/server.js

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');


// Routes
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/adminRoute');
const authorityRoutes = require('./routes/authorities');
const citizenRoutes = require('./routes/citizenRoutes');
const complaintRoutes = require("./routes/complaintRoutes");
const admindashboardRoutes = require("./routes/admindashboardRoute");




// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
  }
});
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/admin', adminAuthRoutes); // Admin login
app.use('/admin', adminRoutes);     // Admin password management
app.use('/api/admin/dashboard', admindashboardRoutes); // Admin dashboard routes
app.use('/api/authorities', authorityRoutes); // Authority register & login
app.use('/api/citizens', citizenRoutes); // Citizen register & login
app.use('/api/notifications', require('./routes/notificationRoutes')); // Notification routes
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploads folder as static
app.use("/api/complaints", complaintRoutes); // Complaint routes
// Make io accessible in routes via req.app.get("io")

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err.message));

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Nivaran backend running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// handle client connection
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  // join room by userId
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
