import React, { useState } from 'react';
import { Search, User, Menu, LogOut } from 'lucide-react';
import { UserRole, AuthState } from '../types';

interface NavbarProps {
  authState: AuthState;
  onLogin: (role: UserRole) => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ authState, onLogin, onLogout, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm pb-4 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Logo & Auth Controls */}
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-rose-500 tracking-tight cursor-pointer">LuxeStay</h1>
            
            <div className="relative">
                {authState.isAuthenticated ? (
                     <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                            {authState.role} View
                        </span>
                        <button 
                            onClick={onLogout}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                     </div>
                ) : (
                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 border rounded-full px-3 py-2 hover:shadow-md transition"
                        >
                            <Menu size={18} />
                            <div className="bg-gray-500 rounded-full p-1 text-white">
                                <User size={16} fill="white" />
                            </div>
                        </button>
                        
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="py-1">
                                    <button onClick={() => { onLogin('GUEST'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        Login as Guest
                                    </button>
                                    <button onClick={() => { onLogin('PROVIDER'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        Login as Provider
                                    </button>
                                    <button onClick={() => { onLogin('HOTEL'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        Login as Hotel Admin
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Search Bar Pill */}
        <div className="flex justify-center">
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