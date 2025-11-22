import React, { useState } from 'react';
import { X } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, role: UserRole) => void;
  onSignup: (email: string, password: string, name: string, role: UserRole) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('GUEST');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
        onLogin(email, role);
    } else {
        onSignup(email, password, name, role);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
         <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
            </button>
         </div>
         
         <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {!isLogin && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                        placeholder="Jane Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                    required 
                    type="email" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                    required 
                    type="password" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isLogin ? 'Select Portal' : 'I am a'}
                </label>
                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white cursor-pointer"
                >
                    <option value="GUEST">Guest (Booking Services)</option>
                    <option value="PROVIDER">Service Provider (Offering Services)</option>
                    <option value="HOTEL">Hotel Manager</option>
                </select>
            </div>

            <button type="submit" className="mt-2 w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all transform active:scale-[0.98]">
                {isLogin ? 'Log In' : 'Sign Up'}
            </button>
         </form>

         <div className="p-6 border-t border-gray-100 bg-gray-50 text-center">
            <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="font-semibold text-rose-500 hover:underline"
                >
                    {isLogin ? 'Sign up' : 'Log in'}
                </button>
            </p>
         </div>
      </div>
    </div>
  );
};

export default AuthModal;