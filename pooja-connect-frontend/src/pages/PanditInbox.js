import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow';
import { User, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PanditInbox = () => {
  const panditId = localStorage.getItem('userId');
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!panditId) {
        setLoading(false);
        return;
      }

      try {
        // Updated route to get users with their last message data
        const res = await axios.get(`https://localhost:5001/api/chat/inbox/${panditId}`);
        setConversations(res.data);
      } catch (err) {
        console.error("❌ Frontend Inbox Error:", err);
        toast.error("Failed to load inbox history");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [panditId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-orange-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-6">
        
        {/* LEFT: Conversation List */}
        <div className="w-full md:w-1/3 bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 shadow-xl h-[650px] flex flex-col overflow-hidden">
          <div className="p-6 border-b dark:border-gray-800 bg-orange-50/50 dark:bg-orange-950/20">
            <h2 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <MessageSquare className="text-orange-600" /> Your Messages
            </h2>
          </div>

          <div className="flex-grow overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((user) => (
                <div 
                  key={user._id} 
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 border-b dark:border-gray-800 cursor-pointer transition-all flex items-center gap-3 hover:bg-orange-50 dark:hover:bg-gray-800 ${
                    selectedUser?._id === user._id 
                      ? 'bg-orange-100/50 dark:bg-orange-900/20 border-r-4 border-r-orange-600' 
                      : ''
                  }`}
                >
                  <div className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 p-3 rounded-2xl flex-shrink-0">
                    <User size={24} />
                  </div>
                  
                  {/* --- NEW: Last Message Preview Logic --- */}
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                      {user.lastMessageTime && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate italic">
                      {user.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 text-center">
                <MessageSquare size={40} className="mb-2 opacity-20" />
                <p className="italic">No messages found yet.</p>
              </div>
            )}
          </div>
        </div>
      {/* RIGHT: Chat Window */}
<div className="w-full md:w-2/3 h-[650px]">
  {selectedUser ? (
    <ChatWindow 
      // ADDING 'key' HERE IS CRITICAL
      key={selectedUser._id} 
      customReceiverId={selectedUser._id} 
      customReceiverName={selectedUser.name} 
    />
  ) : (
    <div className="h-full ...">
       <p>Select a conversation to start chatting</p>
    </div>
  )}
</div>
      </div>
      </div>
    );
};

export default PanditInbox;