import React, { useState } from 'react';
import { Gauge, ShieldCheck, Lock, Mail, User, KeyRound, ArrowRight, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { UserAccount } from '../types/refinery.js';

interface AuthPageProps {
  onLoginSuccess: (user: UserAccount, stateData: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const endpoint = mode === 'REGISTER' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'REGISTER' ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user, data.state);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error authenticating account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('operator@refinery.com');
    setPassword('password123');
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'operator@refinery.com', password: 'password123' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');
      onLoginSuccess(data.user, data.state);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0b0e11] text-[#e1e7ed] font-mono flex items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500/30">
      {/* Background Industrial Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#10141a] border border-amber-500/30 rounded-lg p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500 mx-auto">
            <Gauge className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100 tracking-widest uppercase tech-font">
              OROC REFINERY CONTROL
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Centralized Operational Telemetry & Analytics Platform
            </p>
          </div>
        </div>

        {/* Login / Register Toggle Tabs */}
        <div className="grid grid-cols-2 bg-[#0b0e11] p-1 rounded border border-[#1e2631]">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-amber-500" />
                <span>FULL NAME</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chief Engineer Vance"
                required={mode === 'REGISTER'}
                className="w-full bg-[#0b0e11] border border-[#1e2631] focus:border-amber-500 rounded p-2.5 text-xs text-gray-100 focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Mail className="w-3 h-3 text-amber-500" />
              <span>EMAIL ADDRESS</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@refinery.com"
              required
              className="w-full bg-[#0b0e11] border border-[#1e2631] focus:border-amber-500 rounded p-2.5 text-xs text-gray-100 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-500" />
              <span>PASSWORD</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-[#0b0e11] border border-[#1e2631] focus:border-amber-500 rounded p-2.5 text-xs text-gray-100 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{isLoading ? 'AUTHENTICATING...' : mode === 'LOGIN' ? 'AUTHENTICATE & ENTER' : 'REGISTER & ENTER'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Account Login Button */}
        <div className="pt-2 border-t border-[#18202b] space-y-2 text-center">
          <p className="text-[10px] text-gray-500">Quick test access with pre-configured operator profile:</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full bg-[#18202b] hover:bg-[#202936] text-amber-400 border border-amber-500/30 font-bold py-2 rounded transition-colors text-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>DEMO SIGN IN (H. VANCE - CHIEF ENGINEER)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
