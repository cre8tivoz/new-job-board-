import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePassport } from '../PassportContext';
import { loginWithGoogle } from '../firebase';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { LogIn, Mail, Lock, Github, Chrome, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  theme: Theme;
}

export function LoginPage({ theme }: LoginPageProps) {
  const { user, isAuthReady } = usePassport();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthReady && user) {
      const from = (location.state as any)?.from?.pathname || '/passport';
      navigate(from, { replace: true });
    }
  }, [user, isAuthReady, navigate, location]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Navigation is handled by the useEffect above
    } catch (err) {
      setError('Failed to login with Google. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className={cn(
        "p-8 transition-all",
        theme === 'neo' && "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        theme === 'cottagecore' && "bg-[#fdfbf7] border-2 border-[#d2c5b3] rounded-3xl shadow-sm",
        theme === 'lame' && "bg-white border border-[#D9E2EC] rounded-xl shadow-lg"
      )}>
        <div className="text-center mb-8">
          <h2 className={cn(
            "text-3xl mb-2",
            theme === 'neo' && "font-display-neo font-black uppercase tracking-tighter",
            theme === 'cottagecore' && "font-display-cottage font-bold text-[#2d4a22]",
            theme === 'lame' && "font-display-lame font-black tracking-tight text-[#102A43]"
          )}>
            Welcome Back
          </h2>
          <p className={cn(
            "text-gray-500",
            theme === 'neo' && "font-mono text-sm",
            theme === 'cottagecore' && "font-serif italic",
            theme === 'lame' && "font-display-lame"
          )}>
            Login to access your Talent Passport and save your progress.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* OAuth Options */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={cn(
              "w-full flex items-center justify-center gap-3 py-3 px-4 transition-all disabled:opacity-50",
              theme === 'neo' && "bg-white border-4 border-black font-display-neo font-bold uppercase hover:bg-[#ccff00] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              theme === 'cottagecore' && "bg-white border border-[#d2c5b3] text-[#2d4a22] font-serif rounded-full hover:bg-[#f4ecd8]",
              theme === 'lame' && "bg-white border border-[#D9E2EC] text-[#102A43] font-display-lame font-bold rounded-lg hover:bg-[#F0F4F8]"
            )}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5" />}
            Continue with Google
          </button>

          <button
            disabled
            className={cn(
              "w-full flex items-center justify-center gap-3 py-3 px-4 opacity-50 cursor-not-allowed transition-all",
              theme === 'neo' && "bg-white border-4 border-black font-display-neo font-bold uppercase",
              theme === 'cottagecore' && "bg-white border border-[#d2c5b3] text-[#2d4a22] font-serif rounded-full",
              theme === 'lame' && "bg-white border border-[#D9E2EC] text-[#102A43] font-display-lame font-bold rounded-lg"
            )}
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={cn(
                "px-2 bg-white text-gray-500",
                theme === 'neo' && "font-mono uppercase",
                theme === 'cottagecore' && "font-serif italic bg-[#fdfbf7]",
                theme === 'lame' && "font-display-lame"
              )}>
                Or continue with email
              </span>
            </div>
          </div>

          {/* Regular Login (Placeholders) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={cn(
                "block text-sm font-bold",
                theme === 'neo' && "font-display-neo uppercase",
                theme === 'cottagecore' && "font-serif text-[#2d4a22]",
                theme === 'lame' && "font-display-lame text-[#102A43]"
              )}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  disabled
                  className={cn(
                    "w-full pl-10 pr-4 py-2 border-2 outline-none transition-all opacity-50 cursor-not-allowed",
                    theme === 'neo' && "border-black font-mono focus:bg-[#ccff00]",
                    theme === 'cottagecore' && "border-[#d2c5b3] rounded-xl font-serif",
                    theme === 'lame' && "border-[#D9E2EC] rounded-lg font-display-lame"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={cn(
                "block text-sm font-bold",
                theme === 'neo' && "font-display-neo uppercase",
                theme === 'cottagecore' && "font-serif text-[#2d4a22]",
                theme === 'lame' && "font-display-lame text-[#102A43]"
              )}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled
                  className={cn(
                    "w-full pl-10 pr-4 py-2 border-2 outline-none transition-all opacity-50 cursor-not-allowed",
                    theme === 'neo' && "border-black font-mono focus:bg-[#ccff00]",
                    theme === 'cottagecore' && "border-[#d2c5b3] rounded-xl font-serif",
                    theme === 'lame' && "border-[#D9E2EC] rounded-lg font-display-lame"
                  )}
                />
              </div>
            </div>

            <button
              disabled
              className={cn(
                "w-full py-3 px-4 font-bold transition-all opacity-50 cursor-not-allowed",
                theme === 'neo' && "bg-black text-white font-display-neo uppercase border-4 border-black",
                theme === 'cottagecore' && "bg-[#2d4a22] text-white font-serif rounded-full",
                theme === 'lame' && "bg-[#102A43] text-white font-display-lame rounded-lg"
              )}
            >
              Sign In
            </button>
          </div>

          <p className={cn(
            "text-center text-sm mt-6",
            theme === 'neo' && "font-mono",
            theme === 'cottagecore' && "font-serif",
            theme === 'lame' && "font-display-lame"
          )}>
            Don't have an account? <span className="underline cursor-not-allowed opacity-50">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
}
