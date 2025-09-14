'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  updateProfile: (profile: { displayName?: string; photoURL?: string; }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const protectedRoutes = ['/dashboard', '/farms', '/disease-detection', '/market-watch', '/settings', '/financial-overview', '/notifications'];
const publicRoutes = ['/login', '/signup'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!user && isProtectedRoute) {
        router.push('/login');
      }
      if (user && isPublicRoute) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };
  
  const updateProfile = async (profile: { displayName?: string; photoURL?: string; }) => {
    if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, profile);
        // Manually update the user state to ensure UI reflects changes immediately
        setUser(prevUser => {
          if (!prevUser) return null;
          // The auth.currentUser object is the same reference, so we need to create a new one
          // to trigger re-renders. We also merge the new profile data.
          return {
            ...prevUser,
            ...profile,
            // Re-create the user object from a plain object to satisfy Type 'User'
            reload: prevUser.reload,
            delete: prevUser.delete,
            getIdToken: prevUser.getIdToken,
            getIdTokenResult: prevUser.getIdTokenResult,
            toJSON: prevUser.toJSON,
            providerData: prevUser.providerData,
            providerId: prevUser.providerId,
            uid: prevUser.uid,
            email: prevUser.email,
            emailVerified: prevUser.emailVerified,
            isAnonymous: prevUser.isAnonymous,
            metadata: prevUser.metadata,
            phoneNumber: prevUser.phoneNumber,
            tenantId: prevUser.tenantId,
            displayName: profile.displayName || prevUser.displayName,
            photoURL: profile.photoURL || prevUser.photoURL,
          } as User;
        });
    }
  };

  if (loading || (!user && protectedRoutes.some(route => pathname.startsWith(route)))) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

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
