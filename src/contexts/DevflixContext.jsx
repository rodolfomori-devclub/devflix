// src/contexts/DevflixContext.jsx (atualizado para Firebase)
import { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDevflixByPath } from '../firebase/firebaseService';

// Criar o contexto
const DevflixContext = createContext();

// Provedor do contexto
export const DevflixProvider = ({ children }) => {
  const { path } = useParams();
  const [currentDevflix, setCurrentDevflix] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const devflixData = await getDevflixByPath(path);
        setCurrentDevflix(devflixData);
      } catch (err) {
        console.error('Erro ao carregar dados da DevFlix:', err);
        setError('Não foi possível carregar os dados. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [path]);
  
  const value = {
    currentDevflix,
    isLoading,
    error,
    banner: currentDevflix?.banner,
    bannerEnabled: currentDevflix?.bannerEnabled,
    classes: currentDevflix?.classes || [],
    materials: currentDevflix?.materials || []
  };
  
  return (
    <DevflixContext.Provider value={value}>
      {children}
    </DevflixContext.Provider>
  );
};

// Hook personalizado
export const useDevflix = () => {
  const context = useContext(DevflixContext);
  if (context === undefined) {
    throw new Error('useDevflix must be used within a DevflixProvider');
  }
  return context;
};