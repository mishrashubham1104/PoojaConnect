require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const connectDB = require('./db');
const http = require('http'); 
const { Server } = require('socket.io'); 

// --- MODELS ---
const Pandit = require('./models/Pandit'); 
const Booking = require('./models/Booking'); 
const User = require('./models/User'); 
const Review = require('./models/Review');
const Message = require('./models/Message'); 
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev'; 

app.use(cors());
app.use(express.json()); 
connectDB();

// --- SECURITY MIDDLEWARE ---
const protectAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access Denied" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {return res.status(403).json({ error: "Admins Only" });}
    req.user = decoded; 
    next();
    
  } catch (err) {
    console.error("JWT Verify Error:", err.message);
    return res.status(401).json({ error: "Session Expired" }); 
  }
};

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  // 1. User joins their private room based on their Database ID
  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User joined room: ${userId}`);
    }
  });

  // 2. Updated Message Handling with Validation
  socket.on('send_message', async (data) => {
    try {
      // DATA VALIDATION: Prevents "Message validation failed" errors
      if (!data.receiverId || !data.senderId || !data.text) {
        return console.error("❌ Invalid message data received. Missing required fields:", data);
      }

      // Explicitly map data to your Message model
      const newMessage = new Message({
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text,
        timestamp: data.timestamp || new Date()
      });
      await newMessage.save();
      console.log(`💾 Message saved: ${data.senderId} -> ${data.receiverId}`);

      // EMIT: Send only to the specific receiver's room
      io.to(data.receiverId).emit('receive_message', data);
      console.log(`💾 Message reflected: ${data.senderId} -> ${data.receiverId}`);
    } catch (err) { 
      console.error("🚀 Database Save Error:", err.message); 
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// --- ROUTE IMPORTS ---
const panditRoutes = require('./routes/panditRoutes'); 
app.use('/api/pandits', panditRoutes); 

// --- ADMIN ROUTES ---
app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: '1d' });
      
      // ADD 'return' HERE
      return res.json({
        success: true,
        token: token,
        user: { name: "Admin", role: "admin" }
      });
    }

    // AND ADD 'return' HERE
    return res.status(401).json({ success: false, message: "Invalid Credentials" });

  } catch (err) {
    // AND ADD 'return' HERE
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get('/api/admin/stats', protectAdmin, async (req, res) => {
  try {
    const [p, u, b] = await Promise.all([
      Pandit.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments()
    ]);
    res.json({ pandits: p, users: u, bookings: b });
  } catch (err) { res.status(500).json({ error: "Stats failed" }); }
});

// --- ADMIN DATA ROUTES ---

// 1. Fetch ALL Bookings for the Dashboard
app.get('/api/bookings', protectAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// 2. Fetch ALL Users for the Dashboard
app.get('/api/users', protectAdmin, async (req, res) => {
  try {
    // We only want 'user' roles and we hide passwords for security
    const users = await User.find({ role: 'user' }).select('-password');
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});


app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- BOOKING ROUTES ---
app.post('/api/bookings/create', async (req, res) => {
  try {
    const { userId, userName, panditId, panditName, pujaName, date } = req.body;
    if (!userId || !panditId) {
      return res.status(400).json({ error: "Booking must have both a Customer ID and a Pandit ID" });
    }
    const newBooking = new Booking({
      userId,    // <--- The Customer's ID
      userName,  // <--- The Customer's Name (helps the Pandit know who they are)
      panditId,
      panditName,
      pujaName,
      date,
      status: "Pending"
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: "Booking failed" });
  }
});

// Fix for MyBookings 404: Get bookings for a specific user
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: "Failed to fetch bookings" }); }
});

// Get bookings for a specific Pandit
app.get('/api/bookings/pandit/:panditId', async (req, res) => {
  try {
    const requests = await Booking.find({ panditId: req.params.panditId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: "Failed to load requests" }); }
});

// Update Booking Status
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// --- MESSAGING & INBOX ---

app.get('/api/chat/inbox/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 1. Find all messages involving this user
    const messages = await Message.find({ 
      $or: [{ senderId: userId }, { receiverId: userId }] 
    }).sort({ timestamp: -1 });

    // 2. Get unique contact IDs
    const contactIds = [...new Set(messages.map(m => 
      m.senderId.toString() === userId ? m.receiverId.toString() : m.senderId.toString()
    ))];

    // 3. For each contact, find their name and their last message
    const contactsWithLastMsg = await Promise.all(contactIds.map(async (id) => {
      const user = await User.findById(id, 'name email');
      const lastMsg = await Message.findOne({
        $or: [
          { senderId: userId, receiverId: id },
          { senderId: id, receiverId: userId }
        ]
      }).sort({ timestamp: -1 });

      return {
        _id: user._id,
        name: user.name,
        lastMessage: lastMsg ? lastMsg.text : "",
        lastMessageTime: lastMsg ? lastMsg.timestamp : null
      };
    }));

    res.json(contactsWithLastMsg);
  } catch (err) {
    res.status(500).json({ error: "Inbox failed" });
  }
});

app.get('/api/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  // 1. Check if the frontend accidentally sent the string "undefined"
  if (user1 === 'undefined' || user2 === 'undefined' || !user1 || !user2) {
    console.warn("⚠️ Blocked invalid request: One of the IDs is 'undefined'");
    return res.status(400).json({ error: "Invalid user IDs provided" });
  }

  try {
    const history = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ timestamp: 1 });
    
    return res.json(history);
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- REVIEWS ---
app.post('/api/reviews', async (req, res) => {
  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) { res.status(500).json({ error: "Review failed" }); }
});

app.get('/api/reviews/:panditId', async (req, res) => {
  try {
    const reviews = await Review.find({ panditId: req.params.panditId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: "Failed to load reviews" }); }
});

// --- USER AUTH ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.status(201).json({ success: true });
  } catch (err) { res.status(400).json({ error: "Registration failed" }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) 
      return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, userId: user._id, userName: user.name, role: user.role });
  } catch (err) { res.status(500).json({ error: "Login failed" }); }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));