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
  
// Modifiy the useEffect hook in DevflixContext.jsx to handle the publication status
// Modificação no useEffect do DevflixContext.jsx

useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setBannerVisible(true); // Reset do estado do banner para cada nova instância
      
      if (!path) {
        // Se não houver path, redirecionar para a página de erro standalone
        navigate('/');
        return;
      }
      
      let devflixData;
      
      try {
        // Buscar dados diretamente do Firebase
        devflixData = await getDevflixByPath(path);
        
        // Se não encontrou dados, redireciona para a página de erro standalone
        if (!devflixData) {
          navigate(`/error?message=Instância DevFlix "/${path}" não encontrada.&code=404`);
          return;
        }
        
        // Verificar se a instância está publicada
        if (devflixData.isPublished === false) {
          navigate(`/error?message=Instância DevFlix "/${path}" não está disponível no momento.&code=403`);
          return;
        }
        
        setCurrentDevflix(devflixData);
      } catch (fetchError) {
        console.error('Erro ao buscar dados:', fetchError);
        navigate(`/error?message=${encodeURIComponent(fetchError.message || 'Não foi possível carregar os dados.')}&code=500`);
        return;
      }
    } catch (err) {
      console.error('Erro ao carregar dados da DevFlix:', err);
      navigate(`/error?message=${encodeURIComponent('Não foi possível carregar os dados.')}&code=500`);
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