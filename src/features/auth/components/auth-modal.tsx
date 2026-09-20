'use client';

import * as React from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, Loader2, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/features/profile/context/profile-context';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'register' }: AuthModalProps) {
  const [mode, setMode] = React.useState<'login' | 'register'>(defaultMode);
  const [prevDefaultMode, setPrevDefaultMode] = React.useState(defaultMode);
  
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  
  const [timerSeconds, setTimerSeconds] = React.useState(106); // 1:46

  const { activeProfile, setIsPickerOpen } = useProfile();
  const supabase = React.useMemo(() => createClient(), []);

  // Sync state if defaultMode changes
  if (defaultMode !== prevDefaultMode) {
    setPrevDefaultMode(defaultMode);
    setMode(defaultMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  // Prevent background body scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => {
            onClose();
          }, 600);
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created successfully!');
          setTimeout(() => {
            onClose();
          }, 600);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl backdrop-saturate-150 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-zinc-950/75 backdrop-blur-2xl shadow-2xl shadow-black/90 flex flex-col justify-between my-auto">
        {/* Top Header Title */}
        <div className="relative pt-7 pb-4 px-6 text-center space-y-1">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {mode === 'register' ? 'Create your MovieBox account' : 'Welcome back to MovieBox'}
          </h2>
          <p className="text-xs text-zinc-400">
            {mode === 'register' ? 'Sign in to use this feature' : 'Enter your credentials to continue'}
          </p>
        </div>

        <div className="px-6 sm:px-8 py-4">

          {/* Right Column: Clean Form Fields */}
          <div className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full rounded-xl border border-white/10 bg-[#12161f] pl-10 pr-4 py-3 text-xs font-medium text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-white/10 bg-[#12161f] pl-10 pr-4 py-3 text-xs font-medium text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-white/10 bg-[#12161f] pl-10 pr-10 py-3 text-xs font-medium text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-transform active:scale-95 shadow-md mt-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'register' ? 'Sign up' : 'Login'}
              </Button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-400">
                {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                className="text-xs font-bold text-white hover:underline cursor-pointer"
              >
                {mode === 'register' ? 'Login' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 px-6 py-3 bg-[#06080a] text-[11px] text-zinc-500 text-center sm:text-left">
          <div>
            By continuing you agree to our{' '}
            <a href="/terms" className="underline hover:text-zinc-300">Terms</a>,{' '}
            <a href="/privacy" className="underline hover:text-zinc-300">Privacy</a> and{' '}
            <a href="/dmca" className="underline hover:text-zinc-300">DMCA</a>.
          </div>
          <button className="flex items-center gap-1 hover:text-zinc-300 shrink-0">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Get help</span>
          </button>
        </div>
      </div>
    </div>
  );
}

