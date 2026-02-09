import React, { useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewForm = ({ panditId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Explicitly grab the ID from storage to satisfy backend validation
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');

    // 2. Safety check: Prevents "Required userId" backend errors
    if (!storedUserId) {
      return toast.error("You must be logged in to leave a review.");
    }

    if (!rating) {
      return toast.error("Please select a star rating");
    }

    try {
      const reviewData = {
        panditId: panditId, // Passed from PanditProfile.js
        userId: storedUserId, // The field your backend specifically requested
        userName: storedUserName || "Anonymous User",
        rating: rating,
        comment: comment
      };

      console.log("🚀 FRONTEND SENDING:", { panditId, storedUserId, rating, comment });

      // Submit to backend
      await axios.post('http://localhost:5000/api/reviews', reviewData);
      
      toast.success("Review submitted! 🙏");
      
      // Reset local UI state
      setComment(""); 
      setRating(0);
      
      // Trigger refresh in parent component
      onReviewSubmit(); 
      
    } catch (err) {
      console.error("❌ Submission failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Validation failed. Check console.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border mt-6">
      <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
      
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={32}
            className={`cursor-pointer transition ${
              star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      <textarea
        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
        placeholder="Share your experience..."
        rows="3"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      <button className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 transition">
        Submit Feedback
      </button>
    </form>
  );
};

export default ReviewForm;