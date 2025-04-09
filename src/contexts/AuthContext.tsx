import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  User,
  signInWithRedirect,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
  browserSessionPersistence,
  setPersistence,
  GoogleAuthProvider
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  error: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Primeiro tenta usar popup
      try {
        await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        // Se o popup for bloqueado, tenta redirect
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.message || 'Erro ao fazer login. Tente novamente.');
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      setError(error.message || 'Erro ao fazer logout. Tente novamente.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        console.log('User authenticated:', user.email);
        
        // Verificar se há resultado de redirect
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            console.log('Redirect result:', result);
          }
        } catch (error) {
          console.error('Error getting redirect result:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 