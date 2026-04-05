import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged, AuthProvider as FirebaseAuthProvider } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider, twitterProvider } from '../firebase';

interface AuthContextType {
  user: User | null;
  role: string | null;
  userData: any | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribeDoc = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role);
            setUserData(data);
          } else {
            const isDefaultAdmin = currentUser.email === 'mohmadahmeadmohmad@gmail.com';
            const newRole = isDefaultAdmin ? 'admin' : 'customer';
            const newData = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'مستخدم جديد',
              email: currentUser.email || '',
              role: newRole,
              favorites: [],
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(userDocRef, newData);
              setRole(newRole);
              setUserData(newData);
            } catch (error) {
              console.error("Error creating user document:", error);
              setRole(newRole);
              setUserData(newData);
            }
          }
        });
      } else {
        setRole(null);
        setUserData(null);
        if (unsubscribeDoc) unsubscribeDoc();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const handleProviderLogin = async (provider: FirebaseAuthProvider) => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // ✅ تجاهل خطأ إغلاق نافذة الـ Login - مش خطأ حقيقي
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (error.code === 'auth/popup-blocked') {
        alert('❌ المتصفح حجب نافذة تسجيل الدخول. يرجى السماح بالنوافذ المنبثقة.');
        return;
      }
      if (error.code === 'auth/account-exists-with-different-credential') {
        alert('❌ هذا الإيميل مسجل بطريقة تسجيل دخول مختلفة.');
        return;
      }
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginWithGoogle = () => handleProviderLogin(googleProvider);
  const loginWithFacebook = () => handleProviderLogin(facebookProvider);
  const loginWithTwitter = () => handleProviderLogin(twitterProvider);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, userData, loading, loginWithGoogle, loginWithFacebook, loginWithTwitter, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
