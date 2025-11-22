import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';
import { signIn, signUp, confirmSignUp, signInWithRedirect, getCurrentUser } from 'aws-amplify/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

type AuthStep = 'SIGN_IN' | 'SIGN_UP' | 'CONFIRM_SIGN_UP';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<AuthStep>('SIGN_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('GUEST');
  const [confirmationCode, setConfirmationCode] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmationCode('');
    setError(null);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (err: any) {
      setError(err.message || 'Failed to start Google sign in');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (isSignedIn) {
        onLoginSuccess();
        onClose();
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        setStep('CONFIRM_SIGN_UP');
      } else {
        setError(`Next step required: ${nextStep.signInStep}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      if (err.code === 'UserNotConfirmedException') {
          setStep('CONFIRM_SIGN_UP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            // We save the selected role as a custom attribute
            // Note: Ensure 'custom:role' is defined in your Cognito User Pool
            'custom:role': role, 
          },
          autoSignIn: true,
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setStep('CONFIRM_SIGN_UP');
      } else if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        onLoginSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode
      });

      if (isSignUpComplete) {
        // Auto sign in usually happens, but sometimes we need to manually sign in after confirmation
        // Attempt a fresh sign in just in case
        try {
             await signIn({ username: email, password });
             onLoginSuccess();
             onClose();
        } catch (signInError) {
            // If auto sign-in is already active, this might fail, check current user
            try {
                await getCurrentUser();
                onLoginSuccess();
                onClose();
            } catch {
                setStep('SIGN_IN');
                setError('Account confirmed! Please log in.');
            }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
         
         {/* Header */}
         <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
                {step === 'SIGN_IN' && 'Welcome Back'}
                {step === 'SIGN_UP' && 'Create Account'}
                {step === 'CONFIRM_SIGN_UP' && 'Verify Email'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
            </button>
         </div>
         
         {/* Body */}
         <div className="p-6">
             {error && (
                 <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                     <span className="mt-0.5">⚠️</span> {error}
                 </div>
             )}

             {/* Verification Code Form */}
             {step === 'CONFIRM_SIGN_UP' && (
                 <form onSubmit={handleConfirmation} className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600">We sent a code to <strong>{email}</strong>. Enter it below to verify your account.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none tracking-widest text-center font-bold"
                            placeholder="123456"
                            value={confirmationCode}
                            onChange={e => setConfirmationCode(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}
                    </button>
                    <button type="button" onClick={() => setStep('SIGN_IN')} className="text-sm text-gray-500 hover:text-gray-900">
                        Back to Login
                    </button>
                 </form>
             )}

             {/* Login & Signup Forms */}
             {step !== 'CONFIRM_SIGN_UP' && (
                 <>
                     {step === 'SIGN_IN' && (
                        <button 
                            onClick={handleGoogleSignIn}
                            className="w-full mb-4 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>
                     )}
                     
                     {step === 'SIGN_IN' && (
                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with email</span></div>
                        </div>
                     )}

                     <form onSubmit={step === 'SIGN_IN' ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
                        {step === 'SIGN_UP' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <input 
                                        required 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none"
                                        placeholder="Jane Doe"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                    <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <input 
                                    required 
                                    type="email" 
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <Mail size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input 
                                    required 
                                    type="password" 
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            </div>
                        </div>
                        
                        {step === 'SIGN_UP' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                                <select 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value as UserRole)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                                >
                                    <option value="GUEST">Guest (Booking Services)</option>
                                    <option value="PROVIDER">Service Provider</option>
                                    <option value="HOTEL">Hotel Manager</option>
                                </select>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="mt-2 w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] flex justify-center items-center"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (step === 'SIGN_IN' ? 'Log In' : 'Create Account')}
                        </button>
                     </form>

                     <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            {step === 'SIGN_IN' ? "Don't have an account? " : "Already have an account? "}
                            <button 
                                onClick={() => {
                                    setStep(step === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN');
                                    resetForm();
                                }} 
                                className="font-semibold text-rose-500 hover:underline"
                            >
                                {step === 'SIGN_IN' ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                     </div>
                 </>
             )}
         </div>
      </div>
    </div>
  );
};

export default AuthModal;