// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginWithEmailPassword, 
  logout, 
  onAuthStateChange, 
  getCurrentUser 
} from '../firebase/authService';

// Criar o contexto
const AuthContext = createContext();

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efeito para observar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Limpar o observador quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Função para login
  const login = async (email, password) => {
    try {
      setError(null);
      await loginWithEmailPassword(email, password);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Função para logout
  const handleLogout = async () => {
    try {
      setError(null);
      await logout();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Verificar se a página atual está na área de admin
  const isAdminPage = () => {
    return window.location.pathname.startsWith('/admin');
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout: handleLogout,
    isAuthenticated,
    isAdminPage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};