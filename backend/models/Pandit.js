const mongoose = require('mongoose');

const panditSchema = new mongoose.Schema({
  // Link to the User model to identify which account owns this profile
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // Ensures one user can only have one professional profile
  },
  name: { 
    type: String, 
    required: true 
  },
  specialization: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  bio: { 
    type: String, 
    required: true 
  },
  experience: { 
    type: String, 
    required: true 
  },
  languages: { 
    type: [String], 
    default: [] 
  },
  image: { 
    type: String, 
    default: "" // Stores the secure URL from Cloudinary
  },
  rating: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('Pandit', panditSchema);