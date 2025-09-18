'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  updateProfile: (profile: { displayName?: string; photoURL?: string; }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    router.push('/landing?showLogin=true');
  };
  
  const updateProfile = async (profile: { displayName?: string; photoURL?: string; }) => {
    if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, profile);
        // This is a workaround to force re-render with updated user info
        setUser(auth.currentUser ? { ...auth.currentUser } : null);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
