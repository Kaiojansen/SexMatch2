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
  setPersistence
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await setPersistence(auth, browserSessionPersistence);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in:', error);
      let errorMessage = 'Ocorreu um erro ao fazer login. Tente novamente.';
      
      if (error.code === 'auth/popup-blocked') {
        console.log('Popup blocked, trying redirect...');
        try {
          await signInWithRedirect(auth, googleProvider);
          return; // Redirect will handle the rest
        } catch (redirectError) {
          console.error('Redirect also failed:', redirectError);
          errorMessage = 'Não foi possível fazer login. Por favor, verifique suas configurações de privacidade.';
        }
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Erro ao fazer logout. Tente novamente.');
      throw error;
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Successfully signed in after redirect:', result.user.email);
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
        setError('Erro ao processar login. Tente novamente.');
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        console.log('User authenticated:', user.email);
      }
    });

    return unsubscribe;
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