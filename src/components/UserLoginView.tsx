import React, { useState } from 'react';
import { W2VLogo } from './W2VLogo';
import {
  findRegistrationByEmail,
  updateRegistrationPassword,
  StoredRegistration,
} from '../services/registrationStorage';
import {
  AlertCircle,
  Clock,
  XCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface UserLoginViewProps {
  onBackToHome: () => void;
  onCreateNewAccount: () => void;
  onOtpVerifiedRedirect: (user: StoredRegistration) => void;
}

type LoginStep =
  | 'login'
  | 'pending_verification'
  | 'rejected_verification'
  | 'otp_verification'
  | 'forgot_password';

export const UserLoginView: React.FC<UserLoginViewProps> = ({
  onBackToHome,
  onCreateNewAccount,
  onOtpVerifiedRedirect,
}) => {
  const [currentStep, setCurrentStep] = useState<LoginStep>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Matched record
  const [activeUser, setActiveUser] = useState<StoredRegistration | null>(null);

  // Dynamic OTP state
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpResentNotice, setOtpResentNotice] = useState<string | null>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotGeneratedOtp, setForgotGeneratedOtp] = useState('');
  const [forgotEnteredOtp, setForgotEnteredOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Generate dynamic 6-digit OTP
  const createDynamicOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 1. Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setLoginError('Please enter both email address and password.');
      return;
    }

    const user = findRegistrationByEmail(trimmedEmail);

    if (!user) {
      setLoginError('No registration record found for this email address. Please create an account.');
      return;
    }

    // Check password
    if (user.password && user.password !== password) {
      setLoginError('Incorrect password. Please verify your credentials or reset your password.');
      return;
    }

    setActiveUser(user);

    // Check account status according to spec
    if (user.status === 'PENDING') {
      setCurrentStep('pending_verification');
      return;
    }

    if (user.status === 'REJECTED') {
      setCurrentStep('rejected_verification');
      return;
    }

    if (user.status === 'VERIFIED') {
      // Generate dynamic OTP and proceed to Page 10
      const newOtp = createDynamicOtp();
      setGeneratedOtp(newOtp);
      setEnteredOtp('');
      setOtpError(null);
      setOtpResentNotice(null);
      setCurrentStep('otp_verification');
    }
  };

  // 2. Handle OTP Verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!enteredOtp.trim()) {
      setOtpError('Please enter the OTP sent to your contact.');
      return;
    }

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid OTP. Please check the code and try again.');
      return;
    }

    if (activeUser) {
      onOtpVerifiedRedirect(activeUser);
    }
  };

  const handleResendOtp = () => {
    const newOtp = createDynamicOtp();
    setGeneratedOtp(newOtp);
    setEnteredOtp('');
    setOtpError(null);
    setOtpResentNotice('A new dynamic OTP has been generated and dispatched.');
    setTimeout(() => setOtpResentNotice(null), 4000);
  };

  // 3. Handle Forgot Password Flow
  const handleSendForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const user = findRegistrationByEmail(forgotEmail);
    if (!user) {
      setForgotError('No account found with this email address.');
      return;
    }

    const otp = createDynamicOtp();
    setForgotGeneratedOtp(otp);
    setForgotOtpSent(true);
    setForgotSuccess('OTP sent to registered contact.');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotEnteredOtp.trim() !== forgotGeneratedOtp.trim()) {
      setForgotError('Invalid OTP.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    const success = updateRegistrationPassword(forgotEmail, forgotNewPassword);
    if (success) {
      setForgotSuccess('Password reset successfully. You can now login with your new password.');
      setTimeout(() => {
        setCurrentStep('login');
        setPassword('');
        setForgotOtpSent(false);
        setForgotSuccess(null);
      }, 2000);
    } else {
      setForgotError('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
      {/* Top Header Bar */}
      <header className="w-full bg-white border-b border-[#0C2D21]/10 py-4 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (currentStep !== 'login') {
                setCurrentStep('login');
                setLoginError(null);
              } else {
                onBackToHome();
              }
            }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0C2D21] hover:text-[#F97316] transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <W2VLogo size="sm" />

          <button
            onClick={onCreateNewAccount}
            className="text-xs font-bold uppercase tracking-wider text-[#F97316] hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto">
          
          {/* STEP 1: LOGIN TO W2V */}
          {currentStep === 'login' && (
            <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-8 sm:p-10 shadow-lg">
              <div className="text-center mb-8">
                <div className="font-display font-black text-2xl text-[#0C2D21] tracking-tight">
                  W2V
                </div>
                <div className="font-display text-xs font-semibold text-[#166534] tracking-tight mb-4">
                  Waste2Value
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] tracking-tight uppercase">
                  LOGIN TO W2V
                </h1>
                <p className="mt-2 text-xs text-[#161A18]/70">
                  Access your organization's smart recovery workspace
                </p>
              </div>

              {loginError && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.org"
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

              {/* DEMO ACCOUNTS QUICK-FILL */}
              <div className="mt-4 p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                  Quick Demo Access:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('fpu.agro@w2v-ecosystem.org');
                      setPassword('password123');
                      setLoginError(null);
                    }}
                    className="p-2 rounded-xl bg-white border border-[#0C2D21]/15 hover:border-[#F97316] text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-[11px] text-[#0C2D21] block">🏭 Verified FPU</span>
                    <span className="text-[9px] text-stone-500 font-mono">fpu.agro@w2v...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('kitchen.vnit@w2v-ecosystem.org');
                      setPassword('password123');
                      setLoginError(null);
                    }}
                    className="p-2 rounded-xl bg-white border border-[#0C2D21]/15 hover:border-[#10B981] text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-[11px] text-[#0C2D21] block">🍳 Kitchen</span>
                    <span className="text-[9px] text-stone-500 font-mono">kitchen.vnit@w2v...</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#0C2D21]/10 flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotOtpSent(false);
                    setForgotError(null);
                    setForgotSuccess(null);
                    setCurrentStep('forgot_password');
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-[#F97316] hover:underline cursor-pointer"
                >
                  FORGOT PASSWORD?
                </button>

                <div className="w-full border-t border-stone-200/80 pt-4 flex flex-col items-center">
                  <span className="text-xs text-stone-500 mb-2">Don't have an account?</span>
                  <button
                    type="button"
                    onClick={onCreateNewAccount}
                    className="w-full py-3 px-4 rounded-xl border-2 border-[#0C2D21] text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-white hover:bg-[#0C2D21] hover:text-white transition-all cursor-pointer text-center"
                  >
                    CREATE NEW ACCOUNT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2A: IF STATUS = PENDING */}
          {currentStep === 'pending_verification' && activeUser && (
            <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-8 sm:p-10 shadow-lg text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
                Status: PENDING VERIFICATION
              </div>

              <h1 className="font-display text-2xl font-extrabold text-[#0C2D21] tracking-tight uppercase mb-3">
                ACCOUNT UNDER VERIFICATION
              </h1>

              <p className="text-sm text-[#161A18]/80 leading-relaxed mb-6">
                Your registration is currently being reviewed by the W2V administrator.
              </p>

              <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/10 text-xs text-[#0C2D21] space-y-1 text-left mb-6">
                <div>Organization: <strong>{activeUser.orgName}</strong></div>
                <div>Type: <strong>{activeUser.orgType}</strong></div>
                <div>Submitted: <strong>{new Date(activeUser.submittedAt).toLocaleDateString()}</strong></div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep('login')}
                className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-xs cursor-pointer"
              >
                BACK TO LOGIN
              </button>
            </div>
          )}

          {/* STEP 2B: IF STATUS = REJECTED */}
          {currentStep === 'rejected_verification' && activeUser && (
            <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-8 sm:p-10 shadow-lg text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider mb-3">
                Status: REJECTED
              </div>

              <h1 className="font-display text-2xl font-extrabold text-red-700 tracking-tight uppercase mb-3">
                REGISTRATION NOT APPROVED
              </h1>

              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 text-left mb-6 space-y-2">
                <div className="font-bold text-red-800 uppercase tracking-wider text-[11px]">
                  Administrator Rejection Reason:
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-red-100 font-medium">
                  {activeUser.rejectionReason || 'Compliance documentation or license number mismatch.'}
                </div>
                {activeUser.reviewedAt && (
                  <div className="text-[10px] text-stone-500 font-mono">
                    Reviewed on {new Date(activeUser.reviewedAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <a
                  href="mailto:support@w2v-ecosystem.org?subject=W2V%20Registration%20Review%20Appeal"
                  className="w-full inline-block py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-xs cursor-pointer text-center"
                >
                  CONTACT SUPPORT
                </a>

                <button
                  type="button"
                  onClick={() => setCurrentStep('login')}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  BACK TO LOGIN
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAGE 10 — OTP VERIFICATION (Only reached if VERIFIED) */}
          {currentStep === 'otp_verification' && activeUser && (
            <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-8 sm:p-10 shadow-lg text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#10B981]/15 text-[#059669] flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-[#10B981]/20 text-[#059669] text-xs font-bold uppercase tracking-wider mb-3">
                VERIFIED ACCOUNT
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] tracking-tight uppercase mb-2">
                VERIFY YOUR ACCOUNT
              </h1>

              <p className="text-xs text-[#161A18]/75 mb-6">
                Enter the OTP sent to your registered contact.
              </p>

              {/* Dynamic OTP notification card */}
              <div className="p-3.5 mb-6 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider">Dynamic OTP Dispatch:</span>
                  <span className="font-mono text-sm font-black px-2 py-0.5 rounded bg-white border border-amber-300 text-[#0C2D21]">
                    {generatedOtp}
                  </span>
                </div>
                <p className="text-[10px] text-amber-700 mt-1">
                  Sent to {activeUser.contactNumber} & {activeUser.email}
                </p>
              </div>

              {otpResentNotice && (
                <div className="mb-4 p-2.5 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800 animate-in fade-in">
                  {otpResentNotice}
                </div>
              )}

              {otpError && (
                <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in flex items-center gap-1.5 justify-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center tracking-widest font-mono text-xl py-3.5 px-4 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/20 text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-md transition-all cursor-pointer"
                >
                  VERIFY OTP
                </button>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-xs font-bold uppercase tracking-wider text-[#F97316] hover:underline cursor-pointer"
                  >
                    RESEND OTP
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep('login')}
                    className="text-xs font-medium text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Change Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: FORGOT PASSWORD */}
          {currentStep === 'forgot_password' && (
            <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-8 sm:p-10 shadow-lg">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#0C2D21]/10 text-[#0C2D21] flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="font-display text-2xl font-extrabold text-[#0C2D21] tracking-tight uppercase">
                  RESET PASSWORD
                </h1>
                <p className="mt-1 text-xs text-[#161A18]/70">
                  Verify contact via OTP to establish new security passkey
                </p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {!forgotOtpSent ? (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@organization.org"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] shadow-md transition-all cursor-pointer"
                  >
                    SEND OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* Dynamic OTP notification card */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase">Reset OTP:</span>
                    <span className="font-mono text-sm font-bold bg-white px-2 py-0.5 rounded border border-amber-300">
                      {forgotGeneratedOtp}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                      OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotEnteredOtp}
                      onChange={(e) => setForgotEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] shadow-md transition-all cursor-pointer"
                  >
                    RESET PASSWORD
                  </button>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-[#0C2D21]/10 text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep('login')}
                  className="text-xs font-bold text-stone-600 hover:underline cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#0C2D21]/8 text-center text-xs text-[#161A18]/60 bg-white">
        W2V — Waste2Value
      </footer>
    </div>
  );
};
