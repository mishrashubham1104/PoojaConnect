import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, LayoutDashboard, MessageSquare, 
  UserCog, BookOpen, LogOut, Star, UserCircle 
} from 'lucide-react';

const MobileSidebar = ({ isOpen, onClose, handleLogout, userName, role, token }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path 
    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600" 
    : "text-gray-600 dark:text-gray-300";

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 2. Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 z-[120] transform transition-transform duration-300 ease-in-out shadow-2xl border-r dark:border-gray-800 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header with User Info */}
        <div className="p-8 bg-orange-600 text-white relative overflow-hidden">
          {/* ✅ USED X ICON for Closing */}
          <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X size={20} />
          </button>
          
          <div className="flex flex-col gap-4 mt-4">
            {/* ✅ USED UserCircle ICON as Avatar */}
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
              <UserCircle size={40} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                {role === 'pandit' ? "Pandit Portal" : "Yajaman Portal"}
              </p>
              <h3 className="font-black text-2xl tracking-tighter leading-tight">
                {userName || "Guest User"}
              </h3>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-6 space-y-2">
          {role === 'pandit' ? (
            <SidebarLink 
              to="/pandit-dashboard" 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={isActive('/pandit-dashboard')} 
              onClick={onClose} 
            />
          ) : (
            <SidebarLink 
              to="/find-pandit" 
              icon={<UserCog size={20} />} 
              label="Find Pandit" 
              active={isActive('/find-pandit')} 
              onClick={onClose} 
            />
          )}

          <SidebarLink 
            to="/inbox" 
            icon={<MessageSquare size={20} />} 
            label="Messages" 
            active={isActive('/inbox')} 
            onClick={onClose} 
          />

          <SidebarLink 
            to="/my-bookings" 
            icon={<BookOpen size={20} />} 
            label="My Rituals" 
            active={isActive('/my-bookings')} 
            onClick={onClose} 
          />
          
          {role === 'pandit' && (
            <SidebarLink 
              to="/manage-profile" 
              icon={<UserCog size={20} />} 
              label="Professional Profile" 
              active={isActive('/manage-profile')} 
              onClick={onClose} 
            />
          )}

          {/* ✅ USED LogOut ICON for the Logout Button */}
          <div className="pt-6 mt-6 border-t dark:border-gray-800">
             <button 
              onClick={handleLogout}
              className="flex items-center gap-4 w-full p-4 rounded-2xl text-red-500 font-black text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-all uppercase tracking-widest"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {/* Bottom Status Card */}
        <div className="absolute bottom-10 left-6 right-6 p-5 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border dark:border-gray-700">
           <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Star size={16} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">Divine Pro Status</span>
           </div>
           <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
             Helping you manage spiritual journeys with modern ease.
           </p>
        </div>
      </div>
    </>
  );
};

// Helper Link Component
const SidebarLink = ({ to, icon, label, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${active} hover:scale-[0.98] active:scale-95`}
  >
    {icon} {label}
  </Link>
);

export default MobileSidebar;