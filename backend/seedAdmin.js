// backend/seedAdmin.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const bcrypt = require('bcrypt');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  const existingAdmin = await Admin.findOne({ adminId: 'admin123' }); // ✅ match the field
  if (existingAdmin) {
    console.log('✅ Admin already exists');
  } else {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const newAdmin = new Admin({ adminId: 'admin123', password: hashedPassword }); // ✅ match field name
    await newAdmin.save();
    console.log('✅ Admin created');
  }
  mongoose.connection.close();
})
.catch((err) => console.error('❌ Error:', err));
