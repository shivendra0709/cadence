import React, { useState } from 'react';
import {
  Check,
  ArrowRight,
  BookOpen,
  Briefcase,
  FolderKanban,
  Dumbbell,
  User,
  MoreHorizontal,
  CheckSquare,
  Clock,
  TrendingUp,
  Flame,
  Sparkles,
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CadenceMark } from '../components/brand/BrandLogo';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { completeOnboarding, user, logout } = useCadence();
  const needsProfile = !user?.username;
  const [step, setStep] = useState<0 | 1 | 2 | 3>(needsProfile ? 0 : 1);

  // Step 0: Profile
  const [username, setUsername] = useState(user?.username || '');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [profession, setProfession] = useState(user?.profession || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Focus Areas
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['Study', 'Work', 'Projects']);

  // Step 2: Track Items
  const [selectedTrack, setSelectedTrack] = useState<string[]>(['Daily Tasks', 'Projects', 'Consistency', 'Time']);

  // Step 3: Target Threshold
  const [threshold, setThreshold] = useState<number>(70);

  const focusOptions = [
    { id: 'Study', label: 'Study & Academics', icon: BookOpen },
    { id: 'Work', label: 'Work & Career', icon: Briefcase },
    { id: 'Projects', label: 'Side Projects & Shipping', icon: FolderKanban },
    { id: 'Fitness', label: 'Fitness & Health', icon: Dumbbell },
    { id: 'Personal', label: 'Personal Habits', icon: User },
    { id: 'Other', label: 'Other Disciplines', icon: MoreHorizontal },
  ];

  const trackOptions = [
    { id: 'Daily Tasks', label: 'Daily Tasks & Checklist', icon: CheckSquare },
    { id: 'Projects', label: 'Project Milestones & Kanban', icon: FolderKanban },
    { id: 'Consistency', label: 'Consistency Scores & Heatmap', icon: TrendingUp },
    { id: 'Time', label: 'Focus Time Tracking', icon: Clock },
    { id: 'All', label: 'All of the above', icon: Sparkles },
  ];

  const toggleFocus = (id: string) => {
    setSelectedFocus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTrack = (id: string) => {
    if (id === 'All') {
      setSelectedTrack(['Daily Tasks', 'Projects', 'Consistency', 'Time']);
      return;
    }
    setSelectedTrack((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    completeOnboarding(selectedFocus, selectedTrack, threshold, needsProfile ? {
      username: username.toLowerCase().trim(),
      name: name.trim(),
      email: email.trim(),
      dob,
      profession,
      profileCompleted: true
    } : undefined);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950 text-neutral-100 relative overflow-hidden selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-violet-600/20 blur-[130px] rounded-full" />
      </div>

      <div className="w-full max-w-lg relative z-10 glass-panel rounded-3xl border border-white/5 p-8 sm:p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <CadenceMark size="sm" />
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Personalize Cadence
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-400">
            <span>Step {step} of 3</span>
          </div>
        </div>

              {step === 0 && (
        <div className="animate-in slide-in-from-right fade-in duration-500">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Complete your profile</h2>
            <p className="text-neutral-400">Let's get to know you a bit better before we begin.</p>
          </div>
          <div className="space-y-4 text-left bg-neutral-900/50 p-6 rounded-2xl border border-white/5 max-h-[50vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 rounded-xl border border-white/10 text-white focus:border-cyan-500" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 rounded-xl border border-white/10 text-white focus:border-cyan-500" placeholder="e.g. john@example.com" disabled={!!user?.email} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 rounded-xl border border-white/10 text-white focus:border-cyan-500 lowercase" placeholder="e.g. johndoe" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 rounded-xl border border-white/10 text-white focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">Profession</label>
              <input type="text" value={profession} onChange={e => setProfession(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 rounded-xl border border-white/10 text-white focus:border-cyan-500" placeholder="e.g. Designer" />
            </div>
            {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
          </div>
          <button
            onClick={async () => {
              try {
                if (!name || !name.trim() || !email || !email.trim() || !username || !username.trim() || !dob || !dob.trim() || !profession || !profession.trim()) {
                  setError('All fields (Name, Email, Username, DOB, Profession) are required.');
                  return;
                }
                setLoading(true);
                setError(null);
                
                if (!user?.id) {
                  throw new Error("User ID is missing. Please sign in again.");
                }

                const lowerUser = username.toLowerCase().trim();
                const dRef = doc(db, 'usernames', lowerUser);
                
                // Add a timeout to Firestore calls in case it hangs
                const withTimeout = (promise, ms) => {
                  return Promise.race([
                    promise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. Please check your connection.')), ms))
                  ]);
                };

                const snap = await withTimeout(getDoc(dRef), 8000) as any;
                if (snap.exists() && snap.data().uid !== user.id) {
                  setError('That username is already taken by another account. Please try a different one (e.g. add a number).');
                  setLoading(false);
                  return;
                }
                await withTimeout(setDoc(dRef, { uid: user.id }), 8000);
                
                setError(null);
                setStep(1);
              } catch (err: any) {
                console.error("Onboarding Flow Error:", err);
                setError(err.message || 'An unexpected error occurred. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full mt-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Continue'} <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => logout()}
            className="w-full mt-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-wider"
          >
            Sign Out & Go Back
          </button>
        </div>
      )}

        {/* Step 1: Focus Areas */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1 text-left">
              <h2 className="text-2xl font-bold text-white">What are you focusing on?</h2>
              <p className="text-xs text-neutral-400">
                Select one or more areas you want to build momentum in.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {focusOptions.map((opt) => {
                const isSelected = selectedFocus.includes(opt.id);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleFocus(opt.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-500/10'
                        : 'glass-card hover:bg-white/5 border-white/5 text-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-cyan-500 text-neutral-950' : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold flex-1">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              {needsProfile && (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-4 py-3 rounded-2xl glass-card hover:bg-white/5 text-neutral-300 font-semibold text-xs transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                disabled={selectedFocus.length === 0}
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Track Items */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1 text-left">
              <h2 className="text-2xl font-bold text-white">What do you want to track?</h2>
              <p className="text-xs text-neutral-400">
                Choose the productivity modules to display in your daily rhythm dashboard.
              </p>
            </div>

            <div className="space-y-2.5">
              {trackOptions.map((opt) => {
                const isSelected = selectedTrack.includes(opt.id) || (opt.id === 'All' && selectedTrack.length >= 4);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleTrack(opt.id)}
                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-200 shadow-md shadow-violet-500/10'
                        : 'glass-card hover:bg-white/5 border-white/5 text-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-violet-500 text-white' : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold flex-1">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-2xl glass-card hover:bg-white/5 text-neutral-300 font-semibold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Set Consistency Target */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1 text-left">
              <h2 className="text-2xl font-bold text-white">Set your daily consistency target</h2>
              <p className="text-xs text-neutral-400">
                Choose the threshold percentage of daily planned tasks needed to maintain your streak.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-white/5 text-center space-y-4">
              <div className="text-5xl font-black font-mono text-cyan-400 tracking-tight flex items-center justify-center gap-1">
                <span>{threshold}%</span>
                <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>

              {/* Slider */}
              <div className="space-y-2 px-2">
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                  <span>50% (Flexible)</span>
                  <span className="text-cyan-300 font-bold">70% (Recommended)</span>
                  <span>95% (Hardcore)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-neutral-300 text-left leading-relaxed">
                Complete at least <span className="font-bold text-cyan-300">{threshold}%</span> of your planned tasks to count the day toward your streak.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-2xl glass-card hover:bg-white/5 text-neutral-300 font-semibold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-neutral-950 font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Cadence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
