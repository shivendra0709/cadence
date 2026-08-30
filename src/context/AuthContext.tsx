import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../types';
import { INITIAL_USER } from '../services/seedData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  authReady: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, username?: string, dob?: string, profession?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'cadence_user_v1',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.warn('localStorage access denied:', e);
    }
  
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(prev => {
          if (prev && prev.id === firebaseUser.uid) {
            return prev;
          }
          return {
            ...INITIAL_USER,
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          };
        });
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Persist User to local storage for instant session restore
  useEffect(() => {
    if (user) {
      
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('localStorage access denied:', e);
    }
  
    } else {
      
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.warn('localStorage access denied:', e);
    }
  
    }
  }, [user]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const loggedUser: User = {
        ...INITIAL_USER,
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        profileCompleted: false
      };
      setUser(loggedUser);
      return { success: true };
    } catch (error: any) {
      console.error('Google login error', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email: string, password?: string) => {
    try {
      if (!password) return { success: false, error: 'Password is required for login.' };
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error('Login error', error);
      return { success: false, error: 'Invalid email or password.' };
    }
  };

  const register = async (name: string, email: string, password?: string, username?: string, dob?: string, profession?: string) => {
    try {
      if (!password) return { success: false, error: 'Password is required' };
      if (!username) return { success: false, error: 'Username is required' };
      
      const lowerUsername = username.toLowerCase().trim();
      
      const usernameDocRef = doc(db, 'usernames', lowerUsername);
      const usernameDoc = await getDoc(usernameDocRef);
      
      if (usernameDoc.exists()) {
        return { success: false, error: 'Username is already taken. Please choose another.' };
      }
      
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(usernameDocRef, { uid: cred.user.uid });
      
      const newUser: User = {
        ...INITIAL_USER,
        id: cred.user.uid,
        email,
        name,
        username: lowerUsername,
        dob: dob || '',
        profession: profession || '',
        profileCompleted: false
      };
      
      await setDoc(doc(db, 'users', cred.user.uid), {
        projects: [],
        tasks: [],
        dailyTasksMap: {},
        activities: [],
        notifications: [],
        userProfile: newUser
      });
      
      setUser(newUser);
      return { success: true };
    } catch (error: any) {
      console.error('Register error', error);
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Reset error', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error', error);
    }
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const next = { ...prev, ...data };
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      authReady,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
