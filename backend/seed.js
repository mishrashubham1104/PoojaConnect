const mongoose = require('mongoose');
const Pandit = require('./models/Pandit'); // Make sure path is correct
require('dotenv').config();

const seedData = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/pooja_connect');
    console.log("Connected to MongoDB for seeding...");

    // 2. Clear existing data (optional, prevents duplicates)
    await Pandit.deleteMany({});

    // 3. Sample Pandit Data
    const samplePandits = [
      {
        name: "Pandit Rajesh Sharma",
        specialization: "Vedic Rituals & Astrology",
        experience: "15+ Years",
        location: "Varanasi",
        languages: ["Hindi", "Sanskrit"],
        rating: 4.9,
        bio: "Specialist in Satyanarayan Katha and personal Horoscope.",
        image: "https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?q=80&w=300&h=300&auto=format&fit=crop"
      },
      {
        name: "Acharya Ankit Iyer",
        specialization: "Marriage & Griha Pravesh",
        experience: "10 Years",
        location: "Mumbai",
        languages: ["English", "Tamil", "Hindi"],
        rating: 4.8,
        bio: "Expert in South Indian Vedic wedding traditions.",
        image: "https://images.unsplash.com/photo-1590059397223-9993318041c2?q=80&w=300&h=300&auto=format&fit=crop"
      }
    ];

    // 4. Insert into Database
    await Pandit.insertMany(samplePandits);
    console.log("Data Seeded Successfully! 🕉️");
    
    // 5. Close connection
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();