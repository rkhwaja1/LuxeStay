import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { signUp, signIn, confirmSignUp, signInWithRedirect } from 'aws-amplify/auth';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthStep = 'LOGIN' | 'SIGNUP' | 'CONFIRM';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<AuthStep>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('GUEST');
  const [confirmationCode, setConfirmationCode] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      if (isSignedIn) {
        onSuccess();
        onClose();
      } else if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        setStep('CONFIRM');
      } else {
        console.log('Next Step:', nextStep);
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.name === 'UserNotConfirmedException') {
          // Resend code logic could go here, but for now just move to confirm
          setStep('CONFIRM');
      } else {
          setError(err.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            name,
            'custom:role': role, 
          },
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setStep('CONFIRM');
      }
    } catch (err: any) {
      console.error('Signup Error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode,
      });

      if (isSignUpComplete) {
        // Auto login after confirmation
        const { isSignedIn } = await signIn({ username: email, password });
        if (isSignedIn) {
            onSuccess();
            onClose();
        } else {
            setStep('LOGIN');
            setError('Account confirmed! Please log in.');
        }
      }
    } catch (err: any) {
      console.error('Confirm Error:', err);
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setError(null);
    setStep(step === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
         <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
                {step === 'LOGIN' && 'Welcome Back'}
                {step === 'SIGNUP' && 'Create Account'}
                {step === 'CONFIRM' && 'Verify Email'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
            </button>
         </div>
         
         {error && (
            <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
                <span>{error}</span>
            </div>
         )}

         <div className="p-6">
            {step === 'CONFIRM' ? (
                <form onSubmit={handleConfirm} className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600 mb-2">We sent a verification code to <strong>{email}</strong>. Please enter it below.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                            placeholder="123456"
                            value={confirmationCode}
                            onChange={e => setConfirmationCode(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="mt-2 w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm Account'}
                    </button>
                </form>
            ) : (
                <form onSubmit={step === 'LOGIN' ? handleLogin : handleSignup} className="flex flex-col gap-4">
                    {step === 'SIGNUP' && (
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
                    
                    {step === 'SIGNUP' && (
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

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="mt-2 w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (step === 'LOGIN' ? 'Log In' : 'Sign Up')}
                    </button>
                </form>
            )}
         </div>

         {step !== 'CONFIRM' && (
             <div className="p-6 border-t border-gray-100 bg-gray-50 text-center">
                <p className="text-sm text-gray-600">
                    {step === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={switchMode} 
                        className="font-semibold text-rose-500 hover:underline"
                    >
                        {step === 'LOGIN' ? 'Sign up' : 'Log in'}
                    </button>
                </p>
             </div>
         )}
      </div>
    </div>
  );
};

export default AuthModal;