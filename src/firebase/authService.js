// src/firebase/authService.js
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
  } from 'firebase/auth';
  import { auth } from './config';
  
  // Login com e-mail e senha
  export const loginWithEmailPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      
      // Traduzir mensagens de erro do Firebase
      let errorMessage = "Falha ao fazer login. Tente novamente.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "E-mail ou senha incorretos.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas de login. Tente novamente mais tarde.";
      }
      
      throw new Error(errorMessage);
    }
  };
  
  // Logout
  export const logout = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  };
  
  // Observar estado de autenticação
  export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  };
  
  // Obter usuário atual
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  // Verificar se o usuário está logado
  export const isAuthenticated = () => {
    return !!auth.currentUser;
  };