import React, { useState } from 'react';
import { W2VLogo } from './W2VLogo';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminLoginViewProps {
  onBackToHome: () => void;
  onGoToWhoAreYou: () => void;
  onAdminLoginSuccess: (adminEmail: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onBackToHome,
  onGoToWhoAreYou,
  onAdminLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@w2v-ecosystem.org');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide both admin email and password.');
      return;
    }

    // Verification check for authorized W2V administrators
    // Allows admin@w2v-ecosystem.org / admin@w2v.org or any valid admin credential
    if (
      (trimmedEmail.includes('admin') || trimmedEmail.endsWith('@w2v.org') || trimmedEmail.endsWith('@w2v-ecosystem.org')) &&
      password.length >= 6
    ) {
      onAdminLoginSuccess(trimmedEmail);
    } else {
      setError('Unauthorized access. Only authorized W2V administrators can access this page.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-[#0C2D21]/10 py-4 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0C2D21] hover:text-[#F97316] transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <W2VLogo size="sm" />

          <button
            onClick={onGoToWhoAreYou}
            className="text-xs font-bold uppercase tracking-wider text-[#F97316] hover:underline cursor-pointer"
          >
            Who Are You?
          </button>
        </div>
      </header>

      {/* Main Admin Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-8 sm:p-10 shadow-lg">
            
            <div className="text-center mb-8">
              <div className="font-display font-black text-2xl text-[#0C2D21] tracking-tight">
                W2V
              </div>
              <div className="font-display text-xs font-semibold text-[#166534] tracking-tight mb-4">
                Waste2Value
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] tracking-tight uppercase">
                ADMIN LOGIN
              </h1>
              <p className="mt-2 text-xs text-[#161A18]/70">
                Only authorized W2V administrators can access this page.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@w2v-ecosystem.org"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-md transition-all cursor-pointer"
              >
                LOGIN
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#0C2D21]/10 text-center">
              <span className="text-xs text-[#161A18]/60">
                Default prototype credential:{' '}
                <strong className="text-[#0C2D21]">admin@w2v-ecosystem.org</strong>
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#0C2D21]/8 text-center text-xs text-[#161A18]/60 bg-white">
        W2V — Waste2Value
      </footer>
    </div>
  );
};
