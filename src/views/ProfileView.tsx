import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Globe,
  Flame,
  TrendingUp,
  CheckCircle2,
  LogOut,
  Save,
  Check,
  Camera,
} from 'lucide-react';
import { useCadence } from '../context/CadenceContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

interface ProfileViewProps {
  onNavigate: (route: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { user, updateUser, logout, getConsistencyStats } = useCadence();
  const stats = getConsistencyStats();

  const [name, setName] = useState(user?.name || 'Shivendra');
  const [email, setEmail] = useState(user?.email || 'shivendra@cadence.app');
  const [avatar, setAvatar] = useState(
    user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata (IST)');
  const [username, setUsername] = useState(user?.username || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [profession, setProfession] = useState(user?.profession || '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      let finalUsername = username.toLowerCase().trim();
      // If username changed, check uniqueness
      if (user?.username && finalUsername !== user.username) {
         const newRef = doc(db, 'usernames', finalUsername);
         const snap = await getDoc(newRef);
         if (snap.exists() && snap.data().uid !== user.id) {
            setError('Username is already taken.');
            setSaving(false);
            return;
         }
         // Write new, delete old
         await setDoc(newRef, { uid: user.id });
         const oldRef = doc(db, 'usernames', user.username);
         await deleteDoc(oldRef);
      }
      
      updateUser({
        name: name.trim(),
        email: email.trim(),
        avatar: avatar.trim(),
        timezone,
        username: finalUsername,
        dob,
        profession
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch(err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Manage your personal credentials, identity, and rhythm preferences.
        </p>
      </div>

      {/* User Hero Badge Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group cursor-pointer shrink-0">
          <img
            src={avatar}
            alt={name}
            className="w-24 h-24 rounded-3xl object-cover border-2 border-white/20 shadow-xl transition-all duration-300 group-hover:brightness-50 group-hover:ring-2 group-hover:ring-cyan-500 group-hover:ring-offset-4 group-hover:ring-offset-[#050505]"
          />
          <label className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-3xl">
            <Camera className="w-6 h-6 text-cyan-400 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Change</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatar(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }} 
            />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-extrabold text-white">{name}</h2>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">@{username || 'username'} • {email}</p>
              {profession && <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mt-1">{profession}</p>}
            </div>

            <button
              onClick={() => {
                logout();
                onNavigate('landing');
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Member since Aug 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> {timezone}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Active Streak
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            🔥 {stats.currentStreak} Days
          </div>
          <div className="text-xs text-neutral-400">Streak Target: {user?.consistencyThreshold || 70}%</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Consistency
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {stats.thirtyDayScore}%
          </div>
          <div className="text-xs text-neutral-400">30-day average</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Completed Tasks
          </span>
          <div className="text-2xl font-bold font-mono text-violet-300">
            142
          </div>
          <div className="text-xs text-neutral-400">Total historical executions</div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 space-y-5">
        <h3 className="text-base font-bold text-white">Edit Profile Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-xl border border-white/5 text-neutral-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-xl border border-white/5 text-neutral-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-xl border border-white/5 text-neutral-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-xl border border-white/5 text-neutral-100 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST - UTC+5:30)</option>
              <option value="America/New_York (EST)">America/New_York (EST - UTC-5:00)</option>
              <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST - UTC-8:00)</option>
              <option value="Europe/London (GMT)">Europe/London (GMT - UTC+0:00)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
