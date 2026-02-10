import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star, MapPin, Camera, ArrowRight, UserCheck, Sparkles, Trash2 } from 'lucide-react';

const PanditCard = ({ pandit, refreshData }) => {
  const navigate = useNavigate();
  
  // Get user role from local storage for permission check
  const userRole = localStorage.getItem('role');

  // --- DELETE LOGIC (Restricted to Admin) ---
  const deletePandit = async (e) => {
    e.stopPropagation(); // Prevents navigating to the profile page
    
    // Extra guard check in logic
    if (userRole !== 'admin') {
      return toast.error("Unauthorized: Only admins can delete profiles.");
    }

    if (!window.confirm(`Admin: Are you sure you want to permanently remove ${pandit.name}?`)) return;

    try {
      await axios.delete(`https://poojaconnect.onrender.com/api/pandits/${pandit._id}`, {
        headers: {
          role: userRole // Pass role in headers for backend verification
        }
      });
      toast.success(`${pandit.name} deleted successfully`);
      
      if (refreshData) refreshData(); 
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(err.response?.data?.error || "Failed to delete the profile");
    }
  };

  return (
    <div 
      onClick={() => navigate(`/pandit/${pandit._id}`)}
      className="group bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative"
    >
      {/* ADULT DELETE BUTTON: Only rendered if userRole is 'admin' */}
      {userRole === 'admin' && (
        <button 
          onClick={deletePandit}
          className="absolute top-4 left-4 z-20 p-2.5 bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-700 shadow-lg active:scale-90"
          title="Admin Delete"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* IMAGE SECTION */}
      <div className="relative h-64 w-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
        {pandit.image && pandit.image.trim() !== "" ? (
          <img
            src={pandit.image}
            alt={pandit.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            crossOrigin="anonymous" 
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
            }}
          />
        ) : (
          <div className="flex flex-col items-center text-gray-300 dark:text-gray-600">
            <Camera size={54} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3">Photo Pending</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-orange-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0">
          <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Services Offered</p>
          <div className="flex flex-wrap gap-2">
            {(pandit.specialization || "Vedic Rituals").split(',').map((service, index) => (
              <span key={index} className="text-white text-xs font-bold flex items-center gap-1">
                <Sparkles size={10} className="text-orange-400" /> {service.trim()}
              </span>
            ))}
          </div>
        </div>
        
        <div className="absolute top-5 right-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 z-10">
          <Star size={14} className="text-yellow-500" fill="currentColor" />
          <span className="text-sm font-black text-gray-900 dark:text-gray-100">{pandit.rating || '5.0'}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-orange-600 dark:text-orange-500 text-[10px] font-black uppercase tracking-widest mb-1">
            {pandit.specialization?.split(',')[0] || "Vedic Specialist"}
          </p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight group-hover:text-orange-600 transition-colors">
            {pandit.name}
          </h3>
        </div>

        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-bold mb-6">
          <MapPin size={16} className="mr-1.5 text-orange-500" />
          {pandit.location}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Experience</span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{pandit.experience || "10+"} Years</span>
          </div>

          {userRole === 'pandit' ? (
            <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl transition-all group-hover:bg-gray-100 dark:group-hover:bg-gray-700">
              <UserCheck size={16} /> Profile
            </div>
          ) : (
            <button 
              className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-2xl font-black text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 dark:shadow-none active:scale-95"
            >
              Book Now <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanditCard;