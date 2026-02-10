import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      toast.error("Please use a valid @gmail.com address");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('https://pooja-backend.onrender.com/api/auth/register', {
        name,
        email,
        password,
        role
      });
      toast.success("Account created! Please login.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed. Email might already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-extrabold text-center mb-2">Join PoojaConnect</h1>
          <p className="text-gray-500 text-center mb-8">Start your spiritual journey today</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                className="w-full p-3 border rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                placeholder="example@gmail.com"
                className="w-full p-3 border rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-3 rounded-2xl font-bold transition border-2 ${role === 'user' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
                >
                  Customer
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('pandit')}
                  className={`p-3 rounded-2xl font-bold transition border-2 ${role === 'pandit' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
                >
                  Pandit
                </button>
              </div>
            </div>

            {/* PASSWORD SECTION WITH DYNAMIC VALIDATION */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  placeholder="Min. 8 characters"
                  className={`w-full p-3 pr-12 border-2 rounded-2xl outline-none transition-all duration-300 ${
                    password.length === 0 
                      ? 'border-gray-100 focus:ring-orange-500' 
                      : password.length < 8 
                        ? 'border-red-400 focus:ring-red-500' 
                        : 'border-green-400 focus:ring-green-500'
                  }`} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                    password.length >= 8 ? 'text-green-500' : 'text-gray-400'
                  }`}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Helper text that disappears when the requirement is met */}
              {password.length > 0 && password.length < 8 && (
                <p className="text-red-500 text-xs mt-1 ml-2 font-medium animate-pulse">
                  Keep typing... {8 - password.length} more characters to go!
                </p>
              )}
            </div>

            <button 
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center shadow-lg mt-4 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <UserPlus className="mr-2" size={20} />
              )}
              {isSubmitting ? 'Registering...' : 'Register Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account? <Link to="/login" className="text-orange-600 font-bold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;