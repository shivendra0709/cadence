import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { CadenceLogo, CadenceMark } from '../components/brand/BrandLogo';
import { useCadence } from '../context/CadenceContext';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'sign-in' | 'register' | 'forgot-password' | 'reset-password';

interface AuthPagesProps {
  initialMode?: AuthMode;
  onSuccess: (isNewUser: boolean) => void;
  onBackToLanding: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'sign-in',
  onSuccess,
  onBackToLanding,
}) => {
  const { login, loginWithGoogle, register } = useCadence();
  const { resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form states
  const [fullName, setFullName] = useState('Shivendra');
  const [email, setEmail] = useState('shivendra@cadence.app');
  const [password, setPassword] = useState('Password123!');
  const [confirmPassword, setConfirmPassword] = useState('Password123!');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [profession, setProfession] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-neutral-700' };
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;

    if (s <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (s === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (s === 3) return { score: 75, label: 'Good', color: 'bg-cyan-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'sign-in') {
        if (!email.trim() || !password.trim()) {
          setError('Please fill in both email and password.');
          setLoading(false);
          return;
        }
        await login(email, password);
        onSuccess(false);
      } else if (mode === 'register') {
        if (!fullName.trim() || !email.trim() || !password.trim() || !username.trim() || !dob.trim() || !profession.trim()) {
          setError('Please complete all fields (Name, Email, Password, Username, DOB, Profession).');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        
        const res = await register(fullName, email, password, username, dob, profession);
        if (res.success) {
           onSuccess(true);
        } else {
           setError(res.error || 'Registration failed');
           setLoading(false);
           return;
        }
      } else if (mode === 'forgot-password') {
        if (!email.trim()) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }
        const result = await resetPassword(email);
        if (result.success) {
          setForgotSubmitted(true);
        } else {
          setError(result.error || 'Failed to send reset email.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    if (result.success) {
      onSuccess(false);
    } else {
      setError(result.error || 'Google authentication failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950 text-neutral-100 relative overflow-hidden selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Dynamic ambient backdrop light */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-violet-600/20 blur-[130px] rounded-full" />
      </div>

      {/* Main Glass Form Card */}
      <div className="w-full max-w-md relative z-10 glass-panel rounded-3xl border border-white/5 p-8 sm:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <CadenceMark size="lg" className="mb-1" />
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            CADENCE
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </h2>
          
          <div>
            {mode === 'sign-in' && (
              <>
                <h3 className="text-xl font-bold text-neutral-100">Welcome back</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Continue your progress.</p>
              </>
            )}
            {mode === 'register' && (
              <>
                <h3 className="text-xl font-bold text-neutral-100">Create your account</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Start building your rhythm.</p>
              </>
            )}
            {mode === 'forgot-password' && (
              <>
                <h3 className="text-xl font-bold text-neutral-100">Forgot your password?</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Enter your email and we'll send you a secure password reset link.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Forgot Password Success State */}
        {mode === 'forgot-password' && forgotSubmitted ? (
          <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Check your inbox.</h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              If an account exists for <span className="font-mono text-cyan-300">{email}</span>, you'll receive a password reset link shortly.
            </p>
            <button
              onClick={() => {
                setForgotSubmitted(false);
                setMode('sign-in');
              }}
              className="mt-2 text-xs font-semibold text-cyan-400 hover:underline block mx-auto"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          /* Main Auth Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Shivendra"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/80 rounded-xl border border-white/5 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="shivendra"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/80 rounded-xl border border-white/5 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 lowercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-900/80 rounded-xl border border-white/5 text-neutral-100 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Profession
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Developer"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-900/80 rounded-xl border border-white/5 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/80 rounded-xl border border-white/5 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="•••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-900/80 rounded-xl border border-white/5 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicator for registration */}
                {mode === 'register' && password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-neutral-400">Password Strength:</span>
                      <span className="font-semibold text-cyan-300">{strength.label}</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="•••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/80 rounded-xl border border-white/5 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            )}

            {mode === 'sign-in' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-neutral-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-900 border-white/20 accent-cyan-400"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-cyan-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>
                {mode === 'sign-in' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot-password' && 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {mode !== 'forgot-password' && (
              <>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-mono">
                    or
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-2.5 rounded-2xl glass-card hover:bg-white/5 text-neutral-200 font-semibold text-xs transition-colors border border-white/15 flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}
          </form>
        )}

        {/* Switch Mode Links */}
        <div className="pt-2 text-center text-xs text-neutral-400 border-t border-white/5">
          {mode === 'sign-in' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-semibold text-cyan-400 hover:underline"
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('sign-in')}
                className="font-semibold text-cyan-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}

          <button
            type="button"
            onClick={onBackToLanding}
            className="text-[11px] text-neutral-500 hover:text-neutral-300 mt-2 block mx-auto"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
