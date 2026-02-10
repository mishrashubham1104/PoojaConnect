import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ReviewForm from '../components/ReviewForm';
import ChatWindow from '../components/ChatWindow';
import { Star, MapPin, Languages, Award, ShieldCheck, MessageCircle, Loader2, X } from 'lucide-react';

const PanditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pandit, setPandit] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0); 
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const currentUserId = localStorage.getItem('userId');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Ensure backend uses localhost:https://localhost:5001 for consistency
      const panditRes = await axios.get(`https://localhost:5001/api/pandits/${id}`);
      setPandit(panditRes.data);

      // --- FIXED URL: Points to the nested review route in panditRoutes.js ---
      const reviewsRes = await axios.get(`https://localhost:5001/api/pandits/reviews/${id}`);
      
      setReviews(reviewsRes.data.reviews || []);
      setAverageRating(reviewsRes.data.averageRating || 5.0);
      
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-orange-600" size={48} />
    </div>
  );

  if (!pandit) return (
    <div className="text-center py-20 px-4">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight">Profile not found</h2>
      <button onClick={() => navigate('/')} className="mt-6 bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200">
        Return to Directory
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white relative">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Left Column: Image & Verification */}
          <div className="w-full md:w-1/3">
            <div className="sticky top-24">
              <img 
                src={pandit.image || "https://via.placeholder.com/400"} 
                alt={pandit.name} 
                className="w-full aspect-[3/4] object-cover rounded-3xl shadow-2xl mb-8 border-4 border-white"
                crossOrigin="anonymous" 
              />
              
              <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-3xl border border-orange-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <ShieldCheck className="mr-2 text-orange-600" size={20} /> Identity Verified
                </h3>
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Professional Exp.</span> 
                    <span className="bg-white px-3 py-1 rounded-full text-gray-800 shadow-sm">{pandit.experience || '10+ Years'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Service Success</span> 
                    <span className="bg-white px-3 py-1 rounded-full text-gray-800 shadow-sm">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="w-full md:w-2/3">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6">
              <div>
                <h1 className="text-5xl font-black text-gray-900 leading-tight">{pandit.name}</h1>
                <p className="text-orange-600 font-bold text-xl uppercase tracking-widest mt-2">{pandit.specialization}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-3xl border border-yellow-100 text-center min-w-[120px]">
                <div className="flex items-center justify-center text-3xl font-black text-yellow-600">
                   {averageRating} <Star fill="currentColor" className="ml-1" size={28} />
                </div>
                <p className="text-yellow-700/60 text-xs font-bold uppercase tracking-tighter mt-1">{reviews.length} Trust Ratings</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-10">
              <span className="flex items-center text-gray-700 bg-gray-100 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm">
                <MapPin size={18} className="mr-2 text-orange-500" /> {pandit.location}
              </span>
              <span className="flex items-center text-gray-700 bg-gray-100 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm">
                <Languages size={18} className="mr-2 text-orange-500" /> {pandit.languages?.join(", ") || "Hindi, Sanskrit"}
              </span>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 text-orange-500" /> Professional Background
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg font-medium">{pandit.bio}</p>
            </div>

            {/* Actions Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
  {localStorage.getItem('role') !== 'pandit' ? (
    <button 
      onClick={() => {
        // Logic: Pass the Pandit's ID and Name to the next page
        // We use pandit.userId if the chat system is based on User IDs
        // or pandit._id if it's based on the Pandit profile ID.
        const targetId = pandit.userId || pandit._id;

        if (!targetId) {
          console.error("❌ Pandit ID is missing from the data object:", pandit);
          return;
        }

        navigate('/book', { 
          state: { 
            panditId: targetId, 
            panditName: pandit.name 
          } 
        });
      }}
      className="bg-orange-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-orange-700 transition-all transform hover:-translate-y-1 shadow-2xl shadow-orange-200"
    >
      Book Ritual
    </button>
  ) : (
    <div className="bg-orange-50 text-orange-700 p-5 rounded-2xl font-bold text-center border-2 border-dashed border-orange-200">
      Business Dashboard View
    </div>
  )}

  <button 
    onClick={() => setShowChat(!showChat)}
    className={`flex items-center justify-center border-2 py-5 rounded-2xl font-black text-xl transition-all shadow-sm ${
      showChat 
        ? 'bg-gray-900 text-white border-gray-900' 
        : 'border-gray-200 text-gray-900 hover:bg-gray-50'
    }`}
  >
    <MessageCircle className="mr-2" /> 
    {showChat ? "Close Chat" : "Discussion"}
  </button>
</div>

            {/* Reviews Grid Section */}
            <div className="pt-10 border-t-2 border-gray-50">
              <h2 className="text-3xl font-black mb-8 text-gray-900 tracking-tight">Community Feedback</h2>
              <div className="grid grid-cols-1 gap-6 mb-12">
                {reviews.length > 0 ? reviews.map((rev) => (
                  <div key={rev._id} className="bg-white p-6 rounded-3xl border-2 border-gray-50 shadow-sm hover:border-orange-100 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-black text-gray-900 text-lg uppercase tracking-tighter">{rev.userName}</span>
                      <div className="flex text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "transparent"} stroke="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium italic text-lg leading-snug">"{rev.comment}"</p>
                  </div>
                )) : (
                  <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold italic uppercase tracking-widest">No reviews submitted yet</p>
                  </div>
                )}
              </div>

              {localStorage.getItem('role') === 'user' && (
                <div className="bg-orange-50/50 p-8 rounded-[40px] border border-orange-100">
                  <ReviewForm panditId={id} onReviewSubmit={fetchData} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Floating Chat (if logged in as customer) */}
      {currentUserId !== pandit.userId && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
          {showChat && (
            <div className="mb-6 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 transition-all duration-300">
              <ChatWindow 
                receiverId={pandit.userId} 
                receiverName={pandit.name} 
                onClose={() => setShowChat(false)}
              />
            </div>
          )}
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-lg shadow-2xl transition-all hover:scale-105 active:scale-95 ${
              showChat ? 'bg-gray-900 text-white' : 'bg-orange-600 text-white shadow-orange-200'
            }`}
          >
            {showChat ? <X size={24} /> : <MessageCircle size={24} />}
            {showChat ? "Exit Discussion" : "Direct Message"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PanditProfile;