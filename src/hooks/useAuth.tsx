import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface ExtendedUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role: 'student' | 'teacher';
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: any | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string) => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.data();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: (profile as any)?.role || 'student'
        });
        setSession(firebaseUser);
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
await setDoc(doc(db, "users", firebaseUser.uid), {
        name: firebaseUser.email?.split('@')[0] || 'Student',
        email: firebaseUser.email,
        role: 'student',
        agreedToTerms: false,
        createdAt: Timestamp.now(),
      });
      // Refresh user with profile
      const profile = await fetchUserProfile(firebaseUser.uid);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: 'student'
      });
      setSession(firebaseUser);
    } catch (error) {
      return { error: error as Error };
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const profile = await fetchUserProfile(firebaseUser.uid);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: (profile as any)?.role || 'student'
      });
      setSession(firebaseUser);
    } catch (error) {
      return { error: error as Error };
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
await setDoc(userDocRef, {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
          role: 'student',
          agreedToTerms: false,
          createdAt: Timestamp.now(),
        });
      }
      const profile = await fetchUserProfile(firebaseUser.uid);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: (profile as any)?.role || 'student'
      });
      setSession(firebaseUser);
    } catch (error) {
      return { error: error as Error };
    }
    return { error: null };
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signUp, 
      signIn, 
      signInWithGoogle, 
      signOut: signOutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

