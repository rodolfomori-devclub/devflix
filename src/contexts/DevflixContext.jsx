// src/contexts/DevflixContext.jsx (controle de banner)
import { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDevflixByPath } from '../firebase/firebaseService';

// Criar o contexto
const DevflixContext = createContext();

// Provedor do contexto
export const DevflixProvider = ({ children }) => {
  const { path } = useParams();
  const navigate = useNavigate();
  const [currentDevflix, setCurrentDevflix] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(true); // Controle de visibilidade do banner
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setBannerVisible(true); // Reset do estado do banner para cada nova instância
        
        if (!path) {
          // Se não houver path, redireciona para a página de erro
          navigate('/');
          return;
        }
        
        let devflixData;
        
        try {
          // Buscar dados diretamente do Firebase
          devflixData = await getDevflixByPath(path);
          
          // Se não encontrou dados, mostra erro
          if (!devflixData) {
            throw new Error(`Instância DevFlix "/${path}" não encontrada.`);
          }
          
          setCurrentDevflix(devflixData);
        } catch (fetchError) {
          console.error('Erro ao buscar dados:', fetchError);
          setError(fetchError.message || 'Não foi possível carregar os dados. Por favor, tente novamente.');
          return;
        }
      } catch (err) {
        console.error('Erro ao carregar dados da DevFlix:', err);
        setError('Não foi possível carregar os dados. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [path, navigate]);
  
  // Função para controlar a visibilidade do banner
  const toggleBannerVisibility = (visible) => {
    setBannerVisible(visible);
  };
  
  const value = {
    currentDevflix,
    isLoading,
    error,
    banner: currentDevflix?.banner,
    bannerEnabled: currentDevflix?.bannerEnabled,
    bannerVisible, // Novo estado para controlar visibilidade
    toggleBannerVisibility, // Função para controlar visibilidade
    classes: currentDevflix?.classes || [],
    materials: currentDevflix?.materials || [],
    path // Incluindo o path atual para facilitar a navegação
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