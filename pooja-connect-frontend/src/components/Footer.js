import React from 'react';
import { Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-20">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-bold text-orange-500 mb-4">PoojaConnect</h2>
          <p className="text-gray-400 leading-relaxed">
            Connecting you with verified and experienced Pandits for all your spiritual needs. 
            Experience rituals with purity and tradition.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/" className="hover:text-orange-500 transition">Home</a></li>
            <li><a href="/my-bookings" className="hover:text-orange-500 transition">My Bookings</a></li>
            <li><a href="/login" className="hover:text-orange-500 transition">Pandit Login</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-bold mb-4">Support</h3>
          <div className="flex items-center space-x-3 text-gray-400 mb-2">
            <Mail size={18} /> <span>support@poojaconnect.com</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-400 mb-4">
            <Phone size={18} /> <span>+91 98765 43210</span>
          </div>
          <div className="flex space-x-4">
            <Instagram className="cursor-pointer hover:text-orange-500" />
            <Facebook className="cursor-pointer hover:text-orange-500" />
            <Twitter className="cursor-pointer hover:text-orange-500" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
        © 2026 PoojaConnect. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;