import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const { id } = useParams(); // Gets the userId from the URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`https://localhost:5001/api/auth/reset-password/${id}`, { password });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full text-orange-600">
              <Lock size={32} />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-800">New Password</h1>
          <p className="text-gray-500 text-center mb-8">Please choose a strong 8-character password.</p>

          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  className={`w-full p-3 pr-12 border-2 rounded-2xl outline-none transition-all duration-300 ${
                    password.length === 0 
                      ? 'border-gray-100' 
                      : password.length < 8 
                        ? 'border-red-400' 
                        : 'border-green-400'
                  }`}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-orange-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p className="text-red-500 text-xs mt-1">Need {8 - password.length} more characters...</p>
              )}
            </div>

            <button 
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition shadow-lg ${
                loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" size={20} />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;