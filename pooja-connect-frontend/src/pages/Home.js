import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PanditCard from '../components/PanditCard';
import { Search, MapPin, Loader2, Filter, Star } from 'lucide-react';

const Home = () => {
  const [pandits, setPandits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Vedic", "Vastu", "Marriage", "Graha Shanti", "Last Rites"];

  // Memoized fetch function to allow cards to trigger a refresh after deletion
  const fetchPandits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/pandits');
      setPandits(response.data);
    } catch (error) {
      console.error("❌ API Error:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPandits();
  }, [fetchPandits]);

  const filteredPandits = pandits.filter((p) => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || 
      p.specialization?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Identify the specific "Featured" Pandit for the Editor's Choice section
  const featuredPandit = pandits.find(p => p.name === "Pandit Rajesh Sharma");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      
      <header className="bg-gradient-to-br from-orange-600 to-red-700 py-16 px-4 text-center text-white shadow-inner">
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Divine Connections</h1>
        <p className="text-lg opacity-90 mb-8 font-medium">Verified Priests for your Sacred Rituals</p>
        
        <div className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-5 top-4 text-gray-400 group-focus-within:text-orange-600 transition-colors" size={22} />
          <input 
            type="text"
            placeholder="Search by name, city, or puja type..."
            className="w-full p-4 pl-14 rounded-2xl text-gray-800 dark:bg-gray-100 shadow-2xl outline-none focus:ring-4 focus:ring-orange-500/20 transition-all text-lg"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <section className="container mx-auto py-10 px-4">
        
        {/* --- NEW: EDITOR'S CHOICE / FEATURED SECTION --- */}
        {!searchTerm && selectedCategory === "All" && featuredPandit && (
          <div className="mb-12">
             <div className="flex items-center gap-2 mb-4 text-orange-600">
                <Star size={20} fill="currentColor" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Editor's Choice</h2>
             </div>
             <div className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800/50 p-6 md:p-10 rounded-[3rem] shadow-xl shadow-orange-100/20 dark:shadow-none">
                <div className="max-w-sm">
                   <PanditCard pandit={featuredPandit} refreshData={fetchPandits} />
                </div>
             </div>
          </div>
        )}

        {/* Quick Filter Bar */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex items-center gap-2 text-gray-500 font-bold mr-2">
            <Filter size={20} /> <span className="text-sm uppercase tracking-widest">Filters</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-black text-sm transition-all whitespace-nowrap border-2 ${
                selectedCategory === cat 
                ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200' 
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-orange-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
          {searchTerm || selectedCategory !== "All" ? "Matched Professionals" : "Recommended for You"}
          <span className="text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-3 py-1 rounded-lg ml-2">{filteredPandits.length}</span>
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={60} />
            <p className="text-gray-400 font-black uppercase tracking-widest">Synchronizing Directory...</p>
          </div>
        ) : filteredPandits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPandits.map(p => (
              <PanditCard key={p._id} pandit={p} refreshData={fetchPandits} /> 
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <MapPin size={64} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
            <p className="text-gray-400 font-black text-xl uppercase tracking-tighter">No divine matches found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;