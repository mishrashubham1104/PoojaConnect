import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { LogIn, Loader2, Eye, EyeOff, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      toast.error("Please use your @gmail.com address");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post('https://poojaconnect.onrender.com/api/auth/login', { email, password });
      
      const { token, userId, userName, role } = res.data;
      
      // ✅ Store basic user data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('role', role);

      toast.success(`Welcome back, ${userName}!`);
      
      // ✅ UPDATED REDIRECTION LOGIC
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } 
      else if (role === 'pandit') {
        // 🚀 Check if this Pandit has already filled their professional details
        try {
          const profileCheck = await axios.get(`https://poojaconnect.onrender.com/api/pandits/my-profile/${userId}`);
          
          if (profileCheck.data && profileCheck.data._id) {
            // Profile exists -> Dashboard
            navigate('/pandit-dashboard');
          } else {
            // No profile yet -> Activation Page
            navigate('/manage-profile');
          }
        } catch (err) {
          // If the profile fetch fails (e.g., 404), send them to create it
          navigate('/manage-profile');
        }
      } 
      else {
        // Regular Users
        navigate('/home'); 
      }

    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-center mb-8">Sign in to your PoojaConnect account</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  placeholder="yourname@gmail.com"
                  className={`w-full p-3 pl-10 border-2 rounded-2xl outline-none transition-all ${
                    email.length > 0 && !email.endsWith('@gmail.com') ? 'border-red-300' : 'border-gray-100 focus:border-orange-500'
                  }`}
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-orange-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  className="w-full p-3 pr-12 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500 transition-all" 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-orange-600"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center shadow-lg ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2" size={20} />}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-600">
            New to PoojaConnect? <Link to="/signup" className="text-orange-600 font-bold">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;