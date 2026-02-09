const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Customer
  userName: String,
  panditId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Pandit's User ID
  panditname: String,
  pujaName: String,
  date: String,
  timeSlot: String,
  address: String,
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);