import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Send, User, Loader2, X } from 'lucide-react';

const socket = io('https://localhost:3000', {
  transports: ['websocket'], 
  upgrade: false
});
const ChatWindow = ({ customReceiverId, customReceiverName }) => { 
  const { userId: urlReceiverId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Memoized helper to prevent unnecessary effect triggers
  const getActiveReceiverId = useCallback(() => { 
    return customReceiverId || urlReceiverId;
  }, [customReceiverId, urlReceiverId]);

  const receiverName = customReceiverName || location.state?.chatWithName || "User";
  const senderId = localStorage.getItem('userId');
  
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  // --- ROOM JOINING ---
  useEffect(() => {
    if (senderId) {
      socket.connect();
      socket.emit('join_room', senderId); 
      console.log("Joined room as:", senderId);
    }
    return () => socket.disconnect();
  }, [senderId]);

  // --- FETCH HISTORY & RECEIVE LOGIC ---
  useEffect(() => {
    // 1. Get the current ID using the memoized helper
    const receiverId = getActiveReceiverId();
    
    const fetchHistory = async () => {
      // Safety guard against missing or malformed IDs
      if (!receiverId || !senderId || receiverId === 'undefined') {
        setLoading(false);
        return; 
      }

      try {
        setLoading(true);
        const res = await axios.get(`https://localhost:3000/api/messages/${senderId}/${receiverId}`);
        setChat(res.data);
      } catch (err) {
        console.error("Chat History Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    const handleReceiveMessage = (data) => {
      // Re-verify the current receiver context when a message arrives
      const currentReceiverId = getActiveReceiverId();
      
      const incomingSender = String(data.senderId);
      const incomingReceiver = String(data.receiverId);
      const currentChatPartner = String(currentReceiverId);
      const me = String(senderId);

      // Only add to state if it belongs to the active chat session
      if (incomingSender === currentChatPartner && incomingReceiver === me) {
        setChat((prev) => {
          const isDuplicate = prev.some(m => 
            m.text === data.text && 
            new Date(m.timestamp).getTime() === new Date(data.timestamp).getTime()
          );
          return isDuplicate ? prev : [...prev, data];
        });
      } else if (incomingReceiver === me) {
        // Notification for background messages
        toast.success(`New message from ${data.senderName || 'Someone'}`);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
    
    // getActiveReceiverId is now a stable dependency because of useCallback
  }, [getActiveReceiverId, senderId]);

  // --- AUTO-SCROLL ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // --- SEND MESSAGE LOGIC ---
  const sendMessage = (e) => {
    if (e) e.preventDefault();
    
    const currentReceiverId = getActiveReceiverId();

    if (!message.trim()) return;

    if (!currentReceiverId || currentReceiverId === 'undefined') {
      toast.error("Receiver ID is missing.");
      return;
    }

    const msgData = { 
      senderId, 
      receiverId: currentReceiverId,
      text: message,
      senderName: localStorage.getItem('userName'), 
      timestamp: new Date() 
    };

    try {
      socket.emit('send_message', msgData);
      setChat((prev) => [...prev, msgData]);
      setMessage('');
    } catch (err) {
      console.error("Socket emit failed:", err);
      toast.error("Message not sent. Check connection.");
    }
  };

  const handleClose = () => navigate(-1);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="bg-orange-600 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight">{receiverName}</h3>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold opacity-80 uppercase">Active</span>
            </div>
          </div>
        </div>
        {!customReceiverId && (
          <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-all">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-orange-600" />
          </div>
        ) : chat.length > 0 ? (
          chat.map((m, i) => (
            <div key={i} className={`flex ${m.senderId === senderId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm ${
                m.senderId === senderId 
                  ? 'bg-orange-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border dark:border-gray-700 rounded-tl-none'
              }`}>
                <p className="font-medium leading-relaxed">{m.text}</p>
                <p className="text-[9px] mt-1.5 font-black uppercase opacity-60">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-gray-400 font-bold text-sm italic">Starting discussion with {receiverName} 🙏</p>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-gray-900 border-t flex gap-3">
        <input 
          type="text" 
          className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="bg-orange-600 text-white p-3.5 rounded-2xl hover:bg-orange-700 transition-all shadow-lg">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;