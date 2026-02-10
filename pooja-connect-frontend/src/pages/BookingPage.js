import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, Send, Calendar, MapPin, Sparkles, Clock, Banknote, ChevronDown } from 'lucide-react';

const timeSlots = ["06:00 AM", "08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"];

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const panditIdFromState = location.state?.panditId;
  const panditName = location.state?.panditName || "the Pandit";

  const [step, setStep] = useState(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [booking, setBooking] = useState({
    pujaType: '',
    date: '',
    time: '',
    address: ''
  });

  const handleBooking = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // --- CRITICAL: VALIDATE IDS BEFORE SENDING ---
    const currentUserId = localStorage.getItem('userId');
    const currentUserName = localStorage.getItem('userName');

    if (!currentUserId) {
      toast.error("Please login again to continue.");
      navigate("/login");
      return;
    }

    if (!panditIdFromState) {
      toast.error("Pandit details missing. Please select a Pandit again.");
      navigate("/find-pandit");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsSubmitting(true);
    setStep(2); // Show loading step

    const bookingPayload = {
      userId: currentUserId,      // Customer ID
      userName: currentUserName,  // Customer Name
      userEmail: localStorage.getItem('userEmail'),
      panditId: panditIdFromState, // Pandit ID
      panditName: panditName,      // Storing Pandit name for the user dashboard
      pujaName: booking.pujaType,
      date: booking.date,
      time: booking.time, 
      address: booking.address,
      paymentStatus: paymentMethod,
      status: 'Pending'           // Initial booking status
    };

    try {
      // API call to backend
      const res = await axios.post('https://poojaconnect.onrender.com/api/bookings/create', bookingPayload);
      
      // Simulate checking availability delay
      setTimeout(() => {
        setStep(3); 
        toast.success(res.data.message || "Booking request sent!");
        setIsSubmitting(false);
      }, 2000);

    } catch (error) {
      console.error("Booking failed:", error);
      const errorMessage = error.response?.data?.error || "Submission failed. Please try again.";
      toast.error(errorMessage);
      
      setStep(1); // Go back to form
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 md:py-20 px-4 text-center">
        
        {step === 1 && (
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl text-left border border-orange-100 dark:border-gray-800">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">Booking Details</h2>
            <p className="text-orange-600 mb-6 font-medium text-sm flex items-center gap-2">
              <Sparkles size={16} /> Requesting services from: {panditName}
            </p>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <input 
                 type="text" 
                 placeholder="Puja Type (e.g. Ganesh Puja)" 
                 className="w-full p-3 pl-4 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition" 
                 required 
                 onChange={(e) => setBooking({...booking, pujaType: e.target.value})} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute top-3 left-3 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                    required 
                    onChange={(e) => setBooking({...booking, date: e.target.value})} 
                  />
                </div>

                <div className="relative">
                  <Clock className="absolute top-3 left-3 text-gray-400 pointer-events-none" size={18} />
                  <select 
                    className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer" 
                    required 
                    value={booking.time}
                    onChange={(e) => setBooking({...booking, time: e.target.value})} 
                  >
                    <option value="">Select Time Slot</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute top-3.5 right-3 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="relative">
                <MapPin className="absolute top-3 left-3 text-gray-400" size={18} />
                <textarea 
                  placeholder="Full Ceremony Address" 
                  className="w-full p-3 pl-10 h-24 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                  required 
                  onChange={(e) => setBooking({...booking, address: e.target.value})} 
                />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Select Payment Method</h3>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Pay at Venue')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'Pay at Venue' 
                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/10' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="bg-orange-600 p-2 rounded-lg text-white">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">Pay at Venue</p>
                      <p className="text-xs text-gray-500">Handover cash after the puja</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'Pay at Venue' ? 'border-orange-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'Pay at Venue' && <div className="w-3 h-3 bg-orange-600 rounded-full"></div>}
                  </div>
                </button>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-4 rounded-xl font-bold mt-8 flex items-center justify-center transition shadow-lg active:scale-95 ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed shadow-none" : "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
                }`}
              >
                {isSubmitting ? (
                  <>Processing... <Loader2 size={18} className="ml-2 animate-spin" /></>
                ) : (
                  <>Confirm Booking <Send size={18} className="ml-2" /></>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl shadow-xl border border-orange-100 dark:border-gray-800 flex flex-col items-center">
            <Loader2 size={80} className="text-orange-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Checking availability...</h2>
            <p className="text-gray-500 dark:text-gray-400">Verifying the slot with {panditName}.</p>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl shadow-xl border border-green-100 dark:border-gray-800 flex flex-col items-center">
            <CheckCircle2 size={60} className="text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Confirmed!</h2>
            <button onClick={() => navigate("/my-bookings")} className="bg-orange-600 text-white px-8 py-3 rounded-xl mt-6 font-bold">
              View My Bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;