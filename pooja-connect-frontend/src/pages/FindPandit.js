import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, MapPin, Star, Award, ArrowRight, Loader2, Filter } from 'lucide-react';

const FindPandit = () => {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPandits = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/pandits');
        setPandits(res.data);
      } catch (err) {
        console.error("Error fetching pandits", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPandits();
  }, []);

  // Logic to filter the list based on search and category
  const filteredPandits = pandits.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || p.specialization?.includes(filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      
      {/* Hero Search Section */}
      <div className="bg-orange-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Find Your Vedic Expert</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-4 text-gray-400" size={24} />
            <input 
              type="text"
              placeholder="Search by Name or Ritual (e.g. Satyanarayan, Vastu)..."
              className="w-full p-5 pl-14 rounded-2xl text-gray-900 outline-none shadow-2xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border dark:border-gray-800 text-gray-500">
            <Filter size={18} /> <span className="text-sm font-bold uppercase tracking-widest">Filters</span>
          </div>
          {['All', 'Vedic Rituals', 'Vastu', 'Marriage', 'Astrology'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === cat 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border dark:border-gray-800 hover:border-orange-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-orange-600" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPandits.map(pandit => (
              <div 
                key={pandit._id} 
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 border dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center">
                    <Award className="text-orange-600" size={32} />
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Available
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 transition">
                  {pandit.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{pandit.specialization}</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={16} fill="currentColor" />
                    <span className="font-bold text-sm">4.9</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">{pandit.location}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/pandit/${pandit._id}`)}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white transition-all"
                >
                  View Profile <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredPandits.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">No experts found matching your criteria. 🙏</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPandit;