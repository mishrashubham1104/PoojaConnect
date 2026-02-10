import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { Calendar, Clock, CheckCircle, XCircle, Loader2, Sparkles, MessageCircle } from 'lucide-react';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://localhost:3000/api/bookings/user/${userId}`);
        console.log("My Bookings Data Array:", res.data);
        setBookings(res.data);
      } catch (err) {
        console.error("Error loading bookings", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMyBookings();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // --- UPDATED DUAL-ROLE NAVIGATION LOGIC ---
  const handleOpenChat = (booking) => {
  const myId = localStorage.getItem('userId');
  const myRole = localStorage.getItem('role');

  // If I am the Pandit, the receiver is the customer (userId)
  // If I am the User, the receiver is the Pandit (panditId)
  let targetId;

  if (myRole === 'pandit' || myId === (booking.panditId?._id || booking.panditId)) {
    targetId = booking.userId?._id || booking.userId;
  } else {
    targetId = booking.panditId?._id || booking.panditId;
  }

  console.log("Navigating to Chat. Target ID identified as:", targetId);

  if (!targetId || targetId === 'undefined') {
    toast.error("Participant ID missing. This booking record is incomplete.");
    console.error("❌ Navigation failed. Booking data:", booking);
    return;
  }

  // Ensure the route matches your App.js path (e.g., /chat/:userId)
  navigate(`/chat/${targetId}`, { 
    state: { 
      chatWithName: (myRole === 'pandit') ? (booking.userName || "Customer") : (booking.panditName || "Pandit Ji") 
    } 
  });
};

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': 
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Rejected': 
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: 
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
        <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-xs">Fetching your blessings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none">
                <Sparkles className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">My Rituals</h1>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-16 rounded-[3rem] text-center border dark:border-gray-800 shadow-sm">
            <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-gray-300 dark:text-gray-600" size={40} />
            </div>
            <p className="text-gray-400 dark:text-gray-500 font-bold text-xl uppercase tracking-tighter">No active bookings found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking._id} 
                className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{booking.pujaName}</h3>
                  <p className="text-orange-600 dark:text-orange-500 font-bold text-sm mb-4 italic">with {booking.panditName || 'Professional Pandit'}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400">
                        <Calendar size={14} className="mr-2 text-orange-500" /> 
                        {new Date(booking.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    </span>
                    <span className="flex items-center bg-gray-50 dark:bg-gray-800 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="mr-2 text-orange-500" /> 
                        {booking.timeSlot || booking.time || 'Schedule Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 mt-6 md:mt-0">
                  <div className={`px-6 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm ${getStatusStyle(booking.status)}`}>
                    {booking.status === 'Confirmed' ? <CheckCircle size={14} className="mr-2" /> : 
                     booking.status === 'Rejected' ? <XCircle size={14} className="mr-2" /> : <Clock size={14} className="mr-2" />}
                    {booking.status || 'Awaiting Confirmation'}
                  </div>

                  {booking.status === 'Confirmed' && (
                    <button 
                      onClick={() => handleOpenChat(booking)}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all active:scale-95 shadow-lg shadow-orange-200"
                    >
                      <MessageCircle size={16} />
                      Open Discussion
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;