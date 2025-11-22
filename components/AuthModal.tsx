import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signIn, signUp, confirmSignUp, signInWithRedirect } from 'aws-amplify/auth';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void; // Triggered after successful email login/signup
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'CONFIRM'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<UserRole>('GUEST');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      // IMPORTANT: This requires the OAuth config in index.tsx to be correct
      await signInWithRedirect({ provider: 'Google' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error with Google Sign In");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn({ username: email, password });
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to login");
      if (err.name === 'UserNotConfirmedException') {
        setView('CONFIRM');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            'custom:role': role, // Ensure 'custom:role' exists in your Cognito User Pool attributes
          },
        },
      });
      setView('CONFIRM');
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      // Auto login after confirmation
      await signIn({ username: email, password });
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
         
         <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
                {view === 'LOGIN' && 'Welcome Back'}
                {view === 'SIGNUP' && 'Create Account'}
                {view === 'CONFIRM' && 'Verify Email'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
            </button>
         </div>
         
         <div className="p-6">
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {/* Google Sign In Button */}
            {view !== 'CONFIRM' && (
                <>
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-6 relative overflow-hidden"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        Continue with Google
                    </button>
                    
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>
                </>
            )}

            {view === 'CONFIRM' ? (
                <form onSubmit={handleConfirm} className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600 mb-2">
                        We sent a verification code to <strong>{email}</strong>.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                            placeholder="123456"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                        />
                    </div>
                    <button disabled={loading} type="submit" className="mt-2 w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all">
                        {loading ? 'Verifying...' : 'Confirm & Login'}
                    </button>
                </form>
            ) : (
                <form onSubmit={view === 'LOGIN' ? handleLogin : handleSignup} className="flex flex-col gap-4">
                    
                    {view === 'SIGNUP' && (
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
                    
                    {view === 'SIGNUP' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
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
                    )}

                    <button disabled={loading} type="submit" className="mt-2 w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all transform active:scale-[0.98]">
                        {loading ? 'Please wait...' : (view === 'LOGIN' ? 'Log In' : 'Sign Up')}
                    </button>
                </form>
            )}
         </div>

         {view !== 'CONFIRM' && (
             <div className="p-6 border-t border-gray-100 bg-gray-50 text-center">
                <p className="text-sm text-gray-600">
                    {view === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} 
                        className="font-semibold text-rose-500 hover:underline"
                    >
                        {view === 'LOGIN' ? 'Sign up' : 'Log in'}
                    </button>
                </p>
             </div>
         )}
      </div>
    </div>
  );
};

export default AuthModal;