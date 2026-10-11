import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
}) => {
  const { login, register, switchDemoRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to register.');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (email.toLowerCase().includes('admin') && onAdminLoginSuccess) {
          onAdminLoginSuccess();
        }
        onClose();
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    }
  };

  const handleDemoSignIn = (role: 'customer' | 'admin') => {
    switchDemoRole(role);
    if (role === 'admin' && onAdminLoginSuccess) {
      onAdminLoginSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E7E5E4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div>
            <h2 className="font-serif-display text-xl font-semibold text-[#1C1917]">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              {isRegister
                ? 'Join LuxeLane for instant checkout and order tracking.'
                : 'Sign in to manage your orders and saved addresses.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Switcher Buttons */}
          <div className="p-3 bg-[#F5F5F4] rounded-xl border border-[#E7E5E4] space-y-2">
            <div className="text-[11px] font-semibold text-[#57534E] uppercase tracking-wider">
              Instant Demo Access
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoSignIn('customer')}
                className="py-2 px-3 bg-white hover:bg-stone-50 border border-[#D6D3D1] rounded-lg font-medium text-[#1C1917] transition-colors"
              >
                Sign in as Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                className="py-2 px-3 bg-[#1C1917] hover:bg-[#292524] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E7E5E4]"></div>
            <span className="flex-shrink mx-3 text-[11px] text-[#A8A29E] uppercase tracking-wider">Or continue with email</span>
            <div className="flex-grow border-t border-[#E7E5E4]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {isRegister && (
              <div>
                <label className="block text-[#57534E] font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg pl-9 pr-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[#57534E] font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.j@example.com"
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg pl-9 pr-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#57534E] font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg pl-9 pr-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1C1917] hover:bg-[#292524] text-white font-medium rounded-lg transition-colors shadow-sm mt-2 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-[#78716C] pt-2">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-[#78350F] font-semibold underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-[#78350F] font-semibold underline"
                >
                  Create one now
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
