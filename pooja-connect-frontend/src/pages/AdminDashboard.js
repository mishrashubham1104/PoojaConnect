import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Users, Shield, Calendar, Trash2, Loader2, IndianRupee, Search, Download, AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  // --- AUTH STATE ---
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- DATA STATE ---
  const [data, setData] = useState({ users: [], pandits: [], bookings: [] });
  const [stats, setStats] = useState({ users: 0, pandits: 0, bookings: 0 });
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Helper for Auth headers - standardized to look for 'token'
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // 1. Updated Handle Admin Login with explicit Token storage
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('http://localhost:5000/api/auth/admin-login', { email, password });
      
      if (res.data.success) {
        // --- SECURE TOKEN STORAGE ---
        localStorage.setItem('token', res.data.token); 
        localStorage.setItem('role', 'admin');
        localStorage.setItem('userName', res.data.user?.name || "Admin");
        
        setIsAdmin(true);
        toast.success("Token Generated. Accessing Dashboard...");
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Dashboard Data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const config = getAuthConfig();

      const [statsRes, uRes, pRes, bRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', config),
        axios.get('http://localhost:5000/api/users', config),
        axios.get('http://localhost:5000/api/pandits', config),
        axios.get('http://localhost:5000/api/bookings', config)
      ]);

      setStats(statsRes.data);
      setData({ users: uRes.data, pandits: pRes.data, bookings: bRes.data });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Unauthorized access. Please re-login.";
      setError(errMsg);
      // Only force logout if it's a true 401/403 security error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAdmin(false);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin, fetchAllData]);

  // --- ACTIONS ---
  const deleteItem = async (type, id) => {
    if (!window.confirm(`Permanently remove this ${type}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/${type}/${id}`, getAuthConfig());
      setData(prev => ({ ...prev, [type]: prev[type].filter(item => item._id !== id) }));
      toast.success("Record purged.");
    } catch (err) {
      toast.error("Action denied.");
    }
  };

  const downloadCSV = () => {
    const currentData = data[activeTab];
    if (currentData.length === 0) return toast.error("No data to export");
    const headers = Object.keys(currentData[0]).filter(k => k !== 'password' && k !== '__v').join(",");
    const rows = currentData.map(item => Object.entries(item).filter(([k]) => k !== 'password' && k !== '__v').map(([, v]) => `"${v}"`).join(","));
    const blob = new Blob([[headers, ...rows].join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PoojaConnect_${activeTab}.csv`;
    a.click();
  };

  const totalRevenue = data.bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + (Number(b.price) || 501), 0);

  const filteredData = data[activeTab].filter(item => {
    const searchStr = searchTerm.toLowerCase();
    return (item.name || item.pujaName || "").toLowerCase().includes(searchStr) || 
           (item.email || "").toLowerCase().includes(searchStr);
  });

  // --- VIEW A: LOGIN FORM ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <form onSubmit={handleAdminLogin} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 transition-all">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-black text-center dark:text-white mb-8 tracking-tighter">Admin Authorization</h2>
          <input 
            type="email" placeholder="Admin ID" required
            className="w-full p-4 mb-4 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Access Key" required
            className="w-full p-4 mb-8 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Verify & Enter"}
          </button>
        </form>
      </div>
    );
  }

  // --- VIEW B: COMMAND CENTER ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
               <ShieldCheck className="text-red-600" /> Command Center
            </h1>
            <p className="text-gray-500 font-medium">Platform Management & Oversight</p>
          </div>
          <div className="flex gap-3">
             <button onClick={downloadCSV} className="flex items-center bg-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-700 transition shadow-lg">
                <Download size={18} className="mr-2" /> Export
             </button>
             <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:text-red-600 transition">
                Logout
             </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border-l-8 border-red-600 rounded-2xl flex items-center text-red-800 dark:text-red-200 shadow-sm transition-all animate-pulse">
            <AlertCircle className="mr-4" size={24} /> 
            <div>
              <p className="font-black uppercase text-xs tracking-widest">System Alert</p>
              <p className="text-sm font-bold opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Users" val={stats.users} Icon={Users} color="blue" />
          <StatCard label="Active Pandits" val={stats.pandits} Icon={Shield} color="orange" />
          <StatCard label="Total Bookings" val={stats.bookings} Icon={Calendar} color="green" />
          <StatCard label="Est. Revenue" val={`₹${totalRevenue.toLocaleString('en-IN')}`} Icon={IndianRupee} color="purple" />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border dark:border-gray-700">
            {['users', 'pandits', 'bookings'].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSearchTerm(''); }} 
                className={`px-8 py-2.5 rounded-xl font-bold transition-all capitalize ${activeTab === tab ? 'bg-gray-900 text-white shadow-xl scale-105' : 'text-gray-400 hover:text-orange-500'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" placeholder={`Search ${activeTab}...`} 
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 shadow-sm" 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border dark:border-gray-700">
          {loading && <div className="p-10 text-center text-gray-400">Refreshing Data...</div>}
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
              <tr>
                <th className="p-6 font-black text-gray-400 uppercase text-xs tracking-widest">Detail</th>
                <th className="p-6 font-black text-gray-400 uppercase text-xs tracking-widest">Status</th>
                <th className="p-6 font-black text-gray-400 uppercase text-xs tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredData.map((item) => (
                <tr key={item._id} className="hover:bg-orange-50/30 dark:hover:bg-gray-800/50 group">
                  <td className="p-6">
                    <p className="font-bold text-gray-800 dark:text-gray-200">{item.name || item.pujaName}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase">ID: {item._id?.slice(-6)}</p>
                  </td>
                  <td className="p-6">
                     <span className="text-gray-600 dark:text-gray-400 text-sm">{item.email || item.date}</span>
                  </td>
                  <td className="p-6 text-center">
                    <button onClick={() => deleteItem(activeTab, item._id)} className="text-gray-300 hover:text-red-600 transition-all p-2">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, Icon, color }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border-b-4 border-${color}-600 flex items-center justify-between transition-transform hover:scale-[1.02]`}>
    <div>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black dark:text-white">{val}</h3>
    </div>
    <div className={`p-4 bg-${color}-50 dark:bg-${color}-900/20 rounded-2xl text-${color}-600`}>
      <Icon size={24}/>
    </div>
  </div>
);

export default AdminDashboard;