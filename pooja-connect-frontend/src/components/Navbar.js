import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { 
  Home, Search, LayoutDashboard, MessageSquare, 
  User, Sun, Moon, Menu, ShieldAlert, 
  BookOpen, UserCog 
} from 'lucide-react';
// ✅ LogOut, X, and UserCircle removed from imports above as they are now used in MobileSidebar.js
import MobileSidebar from './MobileSidebar'; 

const socket = io('https://poojaconnect.onrender.com', {
  transports: ['websocket'],
  upgrade: false
});

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (userId) {
      socket.emit('join_room', userId);
      socket.on('receive_message', (data) => {
        if (location.pathname !== '/inbox' && data.senderId !== userId) {
          toast((t) => (
            <span className="flex items-center gap-3">
              <MessageSquare className="text-orange-600" size={18} />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {data.senderName || "New Message"}
                </span>
                <span className="text-[10px] text-gray-500 truncate w-32">
                  {data.text}
                </span>
              </div>
              <button 
                onClick={() => { toast.dismiss(t.id); navigate('/inbox'); }}
                className="ml-2 bg-orange-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-md"
              >
                Reply
              </button>
            </span>
          ), { 
            duration: 4000,
            style: {
              borderRadius: '16px',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#fff' : '#333',
              border: '1px solid #ea580c'
            }
          });
        }
      });
    }
    return () => socket.off('receive_message');
  }, [userId, location.pathname, navigate, darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.clear();
    setIsSidebarOpen(false);
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-[100] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <span className="text-white font-black text-xl italic">V</span>
              </div>
              <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">
                VEDIC<span className="text-orange-600">PRO</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {role === 'pandit' ? (
                <Link to="/pandit-dashboard" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-orange-600 transition">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              ) : (
                <Link to="/home" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-orange-600 transition">
                  <Home size={18} /> Home
                </Link>
              )}

              {role === 'admin' && (
                <Link to="/admin-dashboard" className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition">
                  <ShieldAlert size={18} /> Admin
                </Link>
              )}

              {role === 'user' && (
                <>
                  <Link to="/find-pandit" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-orange-600 transition">
                    <Search size={18} /> Find Pandit
                  </Link>
                  <Link to="/my-bookings" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-orange-600 transition">
                    <BookOpen size={18} /> Rituals
                  </Link>
                </>
              )}

              {token && (
                <Link to="/inbox" className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-orange-600 transition">
                  <MessageSquare size={18} /> Inbox
                </Link>
              )}
            </div>

            {/* Actions & Theme */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {token ? (
                <div className="flex items-center gap-3">
                  <Link to={role === 'pandit' ? `/manage-profile` : '/my-bookings'}>
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition">
                      {role === 'pandit' ? <UserCog size={20} className="text-orange-600" /> : <User size={20} className="text-gray-600 dark:text-gray-300" />}
                    </div>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="hidden md:block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 transition shadow-md"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-orange-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-200 transition-transform active:scale-95">
                  Login
                </Link>
              )}

              <button className="md:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ ALL MOBILE UI IS NOW HANDLED HERE */}
      <MobileSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        handleLogout={handleLogout}
        userName={userName}
        role={role}
        token={token}
      />
    </>
  );
};

export default Navbar;