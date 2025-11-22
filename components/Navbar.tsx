import React, { useState } from 'react';
import { Search, User, Menu, LogOut, LogIn, UserPlus } from 'lucide-react';
import { AuthState, Booking } from '../types';

interface NavbarProps {
  authState: AuthState;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  bookings?: Booking[];
}

const Navbar: React.FC<NavbarProps> = ({ authState, onOpenAuth, onLogout, onSearch, bookings }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm pb-4 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Logo & Auth Controls */}
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-rose-500 tracking-tight cursor-pointer">LuxeStay</h1>
            
            <div className="relative z-50">
                {authState.isAuthenticated && authState.user ? (
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                                {authState.user.avatar ? (
                                    <img src={authState.user.avatar} alt={authState.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-rose-100 text-rose-500 font-bold text-xs">
                                        {authState.user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-gray-900 leading-none">{authState.user.name}</p>
                                <p className="text-xs text-gray-500 uppercase">{authState.user.role}</p>
                            </div>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                     </div>
                ) : (
                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 border rounded-full px-3 py-2 hover:shadow-md transition bg-white"
                        >
                            <Menu size={18} />
                            <div className="bg-gray-500 rounded-full p-1 text-white">
                                <User size={16} fill="white" />
                            </div>
                        </button>
                        
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                <div className="py-1">
                                    <button 
                                        onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} 
                                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 font-semibold"
                                    >
                                        <LogIn size={16} /> Log In
                                    </button>
                                    <button 
                                        onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} 
                                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100"
                                    >
                                        <UserPlus size={16} /> Sign Up
                                    </button>
                                    <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                                        LuxeStay © 2024
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Search Bar Pill */}
        <div className="flex justify-center relative z-0">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-3xl h-16 divide-x divide-gray-200">
                
                <div className="flex-1 px-6 py-2 hover:bg-gray-50 rounded-l-full cursor-pointer group">
                    <label className="block text-xs font-bold text-gray-800 group-hover:text-black">Where</label>
                    <input 
                        type="text" 
                        placeholder="Search destinations" 
                        className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400 truncate"
                    />
                </div>

                <div className="flex-1 px-6 py-2 hover:bg-gray-50 cursor-pointer group hidden sm:block">
                    <label className="block text-xs font-bold text-gray-800 group-hover:text-black">When</label>
                    <div className="text-sm text-gray-400">Add dates</div>
                </div>

                <div className="flex-[1.5] pl-6 pr-2 py-2 hover:bg-gray-50 rounded-r-full cursor-pointer flex items-center justify-between group relative">
                    <div className="flex-1">
                         <label className="block text-xs font-bold text-gray-800 group-hover:text-black">Type of service</label>
                         <input 
                            type="text"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            placeholder="Add service or ask AI..." 
                            className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
                        />
                    </div>
                    <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-full transition-colors flex-shrink-0">
                        <Search size={18} strokeWidth={3} />
                    </button>
                </div>

            </form>
        </div>

      </div>
    </div>
  );
};

export default Navbar;