import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { 
  User, Calendar, MessageSquare, IndianRupee, Star, 
  Clock, CheckCircle, Check, X, MapPin, Loader2 
} from 'lucide-react';

const PanditDashboard = () => {
  const navigate = useNavigate();
  const [panditData, setPanditData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBookings: 0, pending: 0, revenue: 0 });
  
  const panditId = localStorage.getItem('userId');

  const fetchDashboardData = useCallback(async () => {
    if (!panditId || panditId === 'undefined') {
      setLoading(false);
      toast.error("Session expired. Please login again.");
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ FIX: Use the 'my-profile' endpoint to find profile by User ID
      const [profileRes, bookingsRes] = await Promise.all([
        axios.get(`https://poojaconnect.onrender.com/api/pandits/my-profile/${panditId}`),
        axios.get(`https://poojaconnect.onrender.com/api/bookings/pandit/${panditId}`)
      ]);

      // ✅ REDIRECT: If profile doesn't exist, send them to setup
      if (!profileRes.data) {
        toast("Please set up your professional profile first", { icon: '📋' });
        navigate('/manage-profile');
        return;
      }

      setPanditData(profileRes.data);
      const bookings = bookingsRes.data;
      setRequests(bookings);
      
      // Calculate Stats
      const revenue = bookings.reduce((sum, b) => b.status === 'Confirmed' ? sum + (b.price || 0) : sum, 0);
      setStats({
        totalBookings: bookings.length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        revenue: revenue
      });
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      if (err.response?.status === 404) {
        toast.error("API Error: Route not found.");
      }
    } finally {
      setLoading(false);
    }
  }, [panditId, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const updateStatus = async (bookingId, newStatus, userContext) => {
    try {
      await axios.put(`https://poojaconnect.onrender.com/api/bookings/${bookingId}`, {
        status: newStatus,
        userEmail: userContext.email,
        userName: userContext.name,
        pujaName: userContext.pujaName
      });
      fetchDashboardData(); 
      toast.success(`Ritual ${newStatus}`);
    } catch (err) {
      console.error("❌ Status update failed:", err);
      toast.error("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              Hari Om, {panditData?.name || 'Rahul Ji'}! 🙏
            </h1>
            <p className="text-gray-500 font-medium">Your spiritual service command center.</p>
          </div>
          <button 
            onClick={() => navigate('/manage-profile')}
            className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 flex items-center gap-2 hover:scale-105 transition"
          >
            <User size={18} /> Edit Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Calendar className="text-blue-600" />} label="Total Rituals" value={stats.totalBookings} />
          <StatCard icon={<Clock className="text-orange-600" />} label="Pending Requests" value={stats.pending} />
          <StatCard icon={<IndianRupee className="text-green-600" />} label="Total Earnings" value={`₹${stats.revenue}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Profile & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                <User size={48} className="text-orange-600" />
              </div>
              <h2 className="text-xl font-black dark:text-white tracking-tight">{panditData?.name}</h2>
              <div className="flex items-center gap-1 text-yellow-500 my-2">
                <Star size={16} fill="currentColor" />
                <span className="font-bold text-sm">4.9 (120 Reviews)</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-6">"{panditData?.specialization || 'Vedic Ritual Specialist'}"</p>
              <div className="w-full space-y-3">
                <div className="flex justify-between text-sm border-b pb-2 dark:border-gray-800">
                  <span className="text-gray-400 font-medium uppercase text-[10px] tracking-widest">Experience</span>
                  <span className="font-bold dark:text-white">{panditData?.experience || '10+'} Years</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border dark:border-gray-800 shadow-sm">
              <h3 className="font-black mb-4 dark:text-white uppercase text-[10px] tracking-widest text-gray-400">Quick Navigation</h3>
              <div className="grid grid-cols-1 gap-3">
                <ActionButton icon={<MessageSquare size={18}/>} label="Open Inbox" color="bg-blue-50 dark:bg-blue-900/20 text-blue-600" onClick={() => navigate('/inbox')} />
                <ActionButton icon={<CheckCircle size={18}/>} label="Booking History" color="bg-green-50 dark:bg-green-900/20 text-green-700" onClick={() => navigate('/my-bookings')} />
              </div>
            </div>
          </div>

          {/* Right Side: Active Requests */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Active Ritual Requests</h3>
            
            {requests.length > 0 ? (
              requests.map(req => (
                <div key={req._id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-all">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold dark:text-white">{req.pujaName}</h4>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        req.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-900/40 text-green-700' : 
                        req.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/40 text-red-700' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700'
                      }`}>
                        {req.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 font-medium">Customer: <span className="font-bold text-gray-800 dark:text-gray-200">{req.userName}</span></p>
                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                        <Calendar size={12} className="mr-1.5 text-orange-500"/> {new Date(req.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                        <MapPin size={12} className="mr-1.5 text-orange-500"/> {req.address || "Online"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex gap-2">
                    {(!req.status || req.status === 'Pending') ? (
                      <>
                        <button 
                          onClick={() => updateStatus(req._id, 'Confirmed', { email: req.userEmail, name: req.userName, pujaName: req.pujaName })}
                          className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-100 dark:shadow-none"
                        >
                          <Check size={20} />
                        </button>
                        <button 
                          onClick={() => updateStatus(req._id, 'Rejected', { email: req.userEmail, name: req.userName, pujaName: req.pujaName })}
                          className="p-3 bg-white dark:bg-gray-800 border border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => navigate('/inbox')}
                        className="p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-orange-600 hover:text-white transition"
                      >
                        <MessageSquare size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem] text-center flex flex-col items-center">
                <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-full mb-4">
                    <Calendar className="text-gray-300 dark:text-gray-700" size={48} />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active rituals found</p>
                <p className="text-gray-500 text-sm mt-1">Your new bookings will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border dark:border-gray-800 shadow-sm flex items-center gap-4">
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-transform hover:scale-[0.98] font-bold text-sm ${color}`}>
    <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">{icon}</div> {label}
  </button>
);

export default PanditDashboard;