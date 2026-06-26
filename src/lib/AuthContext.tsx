'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  getAuth,
  type User,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import app from './firebase';

// Lazily get auth & db — these must only run in the browser
const auth = getAuth(app);
const db = getFirestore(app);

export type UserRole = 'customer' | 'seller' | 'admin';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const googleProvider = new GoogleAuthProvider();

async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return (snap.data().role as UserRole) || 'customer';
  } catch {}
  return 'customer';
}

async function toAuthUser(firebaseUser: User): Promise<AuthUser> {
  const role = await getUserRole(firebaseUser.uid);
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result from Google Sign-In
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const snap = await getDoc(doc(db, 'users', result.user.uid));
          if (!snap.exists()) {
            await setDoc(doc(db, 'users', result.user.uid), {
              email: result.user.email,
              displayName: result.user.displayName,
              role: 'customer',
              createdAt: new Date().toISOString(),
            });
          }
          const authUser = await toAuthUser(result.user);
          setUser(authUser);
        }
      })
      .catch(() => {});

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser = await toAuthUser(firebaseUser);
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const authUser = await toAuthUser(cred.user);
    setUser(authUser);
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      displayName: name,
      role,
      createdAt: new Date().toISOString(),
    });
    const authUser: AuthUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name,
      photoURL: null,
      role,
    };
    setUser(authUser);
  };

  const loginWithGoogle = async () => {
    // Redirect-based flow works on all domains including Vercel
    await signInWithRedirect(auth, googleProvider);
    // Result is handled in useEffect via getRedirectResult
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
