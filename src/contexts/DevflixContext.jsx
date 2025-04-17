// src/contexts/DevflixContext.jsx (optimized)
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDevflixByPath } from '../firebase/firebaseService';

// Create the context
const DevflixContext = createContext();

// Provider component
export const DevflixProvider = ({ children }) => {
  const { path } = useParams();
  const navigate = useNavigate();
  const [currentDevflix, setCurrentDevflix] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  
  // Load data - optimized with useEffect
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      // Skip if already initialized or no path
      if (dataInitialized || !path) return;
      
      try {
        setIsLoading(true);
        setError(null);
        setBannerVisible(true);
        
        if (!path) {
          navigate('/');
          return;
        }
        
        // Attempt to load from cache first to improve performance
        const cachedData = sessionStorage.getItem(`devflix-${path}`);
        let devflixData;
        
        if (cachedData) {
          try {
            // Use cached data first for immediate rendering
            devflixData = JSON.parse(cachedData);
            if (isMounted) {
              setCurrentDevflix(devflixData);
              setIsLoading(false);
            }
          } catch (error) {
            console.warn('Error parsing cached data:', error);
            // Continue to fetch from Firebase
          }
        }
        
        // Always fetch fresh data from Firebase
        try {
          const freshData = await getDevflixByPath(path);
          
          if (!isMounted) return;
          
          if (!freshData) {
            navigate(`/error?message=Instância DevFlix "/${path}" não encontrada.&code=404`);
            return;
          }
          
          // Check if instance is published
          if (freshData.isPublished === false) {
            navigate(`/error?message=Instância DevFlix "/${path}" não está disponível no momento.&code=403`);
            return;
          }
          
          // Update state with fresh data
          setCurrentDevflix(freshData);
          
          // Cache the data for faster loading next time
          sessionStorage.setItem(`devflix-${path}`, JSON.stringify(freshData));
          
          setDataInitialized(true);
        } catch (fetchError) {
          console.error('Error fetching data:', fetchError);
          
          // Only navigate to error if we don't already have cached data
          if (!devflixData) {
            navigate(`/error?message=${encodeURIComponent(fetchError.message || 'Não foi possível carregar os dados.')}&code=500`);
          }
        }
      } catch (err) {
        console.error('Error loading DevFlix data:', err);
        if (isMounted) {
          navigate(`/error?message=${encodeURIComponent('Não foi possível carregar os dados.')}&code=500`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [path, navigate, dataInitialized]);
  
  // Function to control banner visibility
  const toggleBannerVisibility = useCallback((visible) => {
    setBannerVisible(visible);
  }, []);
  
  // Optimize context value with useMemo
  const value = useMemo(() => ({
    currentDevflix,
    isLoading,
    error,
    banner: currentDevflix?.banner,
    bannerEnabled: currentDevflix?.bannerEnabled,
    bannerVisible,
    toggleBannerVisibility,
    classes: currentDevflix?.classes || [],
    materials: currentDevflix?.materials || [],
    path
  }), [
    currentDevflix,
    isLoading,
    error,
    bannerVisible,
    toggleBannerVisibility,
    path
  ]);
  
  return (
    <DevflixContext.Provider value={value}>
      {children}
    </DevflixContext.Provider>
  );
};

// Custom hook
export const useDevflix = () => {
  const context = useContext(DevflixContext);
  if (context === undefined) {
    throw new Error('useDevflix must be used within a DevflixProvider');
  }
  return context;
};