// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible in routes via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/admin', require('./routes/adminAuth')); // Admin login
app.use('/admin', require('./routes/adminRoute')); // Admin password & management
app.use('/api/admin/dashboard', require('./routes/admindashboardRoute')); // Admin dashboard
app.use('/api/authorities', require('./routes/authorities')); // Authority routes
app.use('/api/citizens', require('./routes/citizenRoutes')); // Citizen routes
app.use('/api/notifications', require('./routes/notificationRoutes')); // Notification routes
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploads
app.use("/api/complaints", require('./routes/complaintRoutes')); // Complaint routes

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection failed:', err.message));

// Test route
app.get('/', (req, res) => res.send('🚀 Nivaran backend running...'));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Socket.IO handling
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  // Join room by userId
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
