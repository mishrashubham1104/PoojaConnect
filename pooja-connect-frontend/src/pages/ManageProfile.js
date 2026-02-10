import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Camera, Loader2, Trash2 } from 'lucide-react';

const ManageProfile = () => {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: localStorage.getItem('userName') || '',
    specialization: '',
    location: '',
    experience: '',
    bio: '',
    languages: '',
    image: ''
  });

  // --- FETCH EXISTING PROFILE ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`https://poojaconnect.onrender.com/api/pandits/my-profile/${userId}`);
        if (res.data) {
          setFormData({
            name: res.data.name || '',
            specialization: res.data.specialization || '',
            location: res.data.location || '',
            experience: res.data.experience || '',
            bio: res.data.bio || '',
            image: res.data.image || '',
            languages: Array.isArray(res.data.languages) ? res.data.languages.join(', ') : (res.data.languages || '')
          });
          setIsExistingUser(true);
        }
      } catch (err) {
        console.log("New user - showing blank setup form.");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "nncom3fs");

    try {
      setUploading(true);
      const res = await axios.post("https://api.cloudinary.com/v1_1/dbbgazcis/image/upload", data);
      setFormData(prev => ({ ...prev, image: res.data.secure_url }));
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // --- UPDATED SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return toast.error("Please wait for image upload");

    // Get the userId from localStorage (as you requested)
    const userId = localStorage.getItem('userId'); 

    if (!userId) {
      toast.error("User session expired. Please login again.");
      return navigate('/login');
    }

    try {
      // Constructing the payload using the current state
      const profileData = {
        userId: userId, // 👈 THE KEY!
        name: formData.name,
        specialization: formData.specialization,
        location: formData.location,
        experience: formData.experience,
        bio: formData.bio,
        image: formData.image,
        languages: formData.languages.split(',').map(l => l.trim())
      };

      // 🚀 LOGIC FIX:
      // If profile doesn't exist yet, use '/add'. If it exists, use '/profile'
      const endpoint = isExistingUser 
        ? 'https://poojaconnect.onrender.com/api/pandits/profile' 
        : 'https://poojaconnect.onrender.com/api/pandits/add';

      const res = await axios.post(endpoint, profileData);

      const wasNewUser = !isExistingUser;
      setIsExistingUser(true);
      toast.success(wasNewUser ? "Profile activated! 🙏" : "Changes synced! 🙏");

      if (wasNewUser) {
        setTimeout(() => {
          navigate('/pandit-dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error("Save Error:", err);
      toast.error(err.response?.data?.error || "Error saving profile details.");
    }
  };
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure? This will delete everything.")) {
      try {
        await axios.delete(`https://poojaconnect.onrender.com/api/auth/delete-account/${userId}`);
        localStorage.clear();
        window.location.href = "/";
      } catch (err) {
        toast.error("Delete failed.");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
      <Loader2 className="animate-spin text-orange-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 px-6">

        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white tracking-tight">
          {isExistingUser ? "Update Professional Profile" : "Create Pandit Profile"}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border dark:border-gray-800 space-y-6">
          
          {/* PHOTO UPLOAD */}
          <div className="pb-6 border-b dark:border-gray-800">
            <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Profile Identity</label>
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 bg-gray-100 dark:bg-gray-800 rounded-[2rem] overflow-hidden border-2 border-orange-100 flex items-center justify-center relative shadow-inner">
                {formData.image ? (
                  <img 
                    src={formData.image} 
                    alt="Profile Preview" 
                    crossOrigin="anonymous" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                    }}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Camera className="text-gray-400" size={32} />
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-gray-950/60 flex items-center justify-center">
                    <Loader2 className="animate-spin text-orange-600" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer transition-all" 
                />
                <p className="mt-2 text-xs text-gray-400 font-medium italic">Clear portrait photos build the most trust.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" className="w-full p-3.5 border dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Primary Specialization</label>
              <input type="text" placeholder="Vedic Rituals, Vastu Shastra, Marriage" className="w-full p-3.5 border dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Base Location</label>
                <input type="text" placeholder="City, State" className="w-full p-3.5 border dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Total Experience (Yrs)</label>
                <input type="text" placeholder="e.g. 15" className="w-full p-3.5 border dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Biography / About You</label>
              <textarea className="w-full p-3.5 border dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10" rows="4" placeholder="Describe your background and the rituals you perform..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Languages Spoken</label>
              <input type="text" placeholder="Hindi, English, Sanskrit" className="w-full p-3.5 border dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10" value={formData.languages} onChange={(e) => setFormData({ ...formData, languages: e.target.value })} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading} 
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${
              uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200 dark:shadow-none hover:-translate-y-1'
            }`}
          >
            {uploading ? "Uploading Assets..." : isExistingUser ? "Sync Profile Updates" : "Activate Pandit Account"}
          </button>
        </form>

        <div className="mt-12 p-8 border-2 border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 rounded-[2.5rem] transition-all hover:shadow-lg">
          <div className="flex items-center gap-3 mb-4 text-red-700">
            <div className="p-2 bg-red-100 rounded-xl">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="font-black text-xl tracking-tight uppercase">Account Decommission</h3>
          </div>
          <p className="text-red-600/80 font-medium mb-6 leading-relaxed">
            Deactivating your account is **irreversible**. All your profile data, active ritual schedules, and community reviews will be purged from the database.
          </p>
          <button 
            onClick={handleDeleteAccount} 
            className="bg-white border-2 border-red-600 text-red-600 px-10 py-3.5 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-sm"
          >
            Terminate Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageProfile;