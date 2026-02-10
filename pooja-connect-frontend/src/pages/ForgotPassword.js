import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@gmail.com')) {
      toast.error("Please enter a valid @gmail.com address");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('https://localhost:3000/api/auth/forgot-password', { email });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
          <Link to="/login" className="flex items-center text-sm text-gray-500 hover:text-orange-600 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Login
          </Link>
          
          <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Forgot Password?</h1>
          <p className="text-gray-500 mb-8 text-sm">Enter your email and we'll send you a link to reset your password.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                placeholder="yourname@gmail.com"
                className="w-full p-3 pl-10 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500 transition-all"
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <Mail className="absolute left-3 top-9 text-gray-400" size={18} />
            </div>

            <button 
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition shadow-lg ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" size={20} />}
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;