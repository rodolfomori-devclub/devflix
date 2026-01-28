// src/contexts/DevflixContext.jsx (optimized)
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDevflixByPath, getHeaderButtonsConfig } from '../firebase/firebaseService';
import eventBus, { MATERIAL_EVENTS } from '../services/eventBus';
import cacheService from '../services/cacheService';
import SupportBubble from '../components/SupportBubble';

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
  const [countdownVisible, setCountdownVisible] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [headerButtonsConfig, setHeaderButtonsConfig] = useState(null);
  
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
        
        // Check cache validity before using
        const cachedData = sessionStorage.getItem(`devflix-${path}`);
        let devflixData;
        let useCachedData = false;
        
        if (cachedData) {
          try {
            devflixData = JSON.parse(cachedData);
            
            // Validate cached data isn't stale (materials with past scheduled unlocks)
            const now = new Date().getTime();
            let hasStaleData = false;
            
            if (devflixData.materials) {
              devflixData.materials.forEach(classM => {
                if (classM.items) {
                  classM.items.forEach(item => {
                    if (item.locked && item.scheduledUnlock) {
                      const unlockTime = new Date(item.scheduledUnlock).getTime();
                      if (unlockTime <= now) {
                        hasStaleData = true;
                      }
                    }
                  });
                }
              });
            }
            
            // Only use cache if it's not stale
            if (!hasStaleData && isMounted) {
              setCurrentDevflix(devflixData);
              setIsLoading(false);
              useCachedData = true;
            } else if (hasStaleData) {
              console.log('[DevflixContext] Cache has stale scheduled unlocks, fetching fresh data');
              sessionStorage.removeItem(`devflix-${path}`);
            }
          } catch (error) {
            console.warn('Error parsing cached data:', error);
            sessionStorage.removeItem(`devflix-${path}`);
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
          
          // Load header buttons configuration
          try {
            const buttonsConfig = await getHeaderButtonsConfig(freshData.id);
            if (isMounted) {
              setHeaderButtonsConfig(buttonsConfig);
            }
          } catch (configError) {
            console.warn('Error loading header buttons config:', configError);
            // Set default config if loading fails
            setHeaderButtonsConfig({
              home: { enabled: true, label: 'Home' },
              materiais: { enabled: true, label: 'Materiais de Apoio' },
              cronograma: { enabled: true, label: 'Cronograma' },
              aquecimento: { enabled: true, label: 'Aquecimento' },
              nossosAlunos: { enabled: true, label: 'Alunos Transformados', url: 'https://stars.devclub.com.br' },
              aiChat: { enabled: true, label: 'Fale com a IA' }
            });
          }
          
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
    
    // Função para recarregar dados do Firebase
    const refreshData = async () => {
      console.log('[DevflixContext] Refreshing data...');

      // Clear cache
      cacheService.invalidate(`devflix-${path}`);
      sessionStorage.removeItem(`devflix-${path}`);

      // Fetch fresh data
      try {
        const freshData = await getDevflixByPath(path);
        if (isMounted && freshData) {
          setCurrentDevflix(freshData);
          sessionStorage.setItem(`devflix-${path}`, JSON.stringify(freshData));
          console.log('[DevflixContext] Data refreshed successfully');
        }
      } catch (error) {
        console.error('[DevflixContext] Error refreshing data:', error);
      }
    };

    // Listen for data refresh events (do MaterialsUnlockChecker legado - pode ser removido no futuro)
    const handleRefresh = eventBus.on(MATERIAL_EVENTS.DATA_REFRESH_NEEDED, async (data) => {
      if (data.path === path) {
        console.log('[DevflixContext] DATA_REFRESH_NEEDED event received');
        await refreshData();
      }
    });

    // Listen for materials synced events (do SchedulerService - principal)
    const handleMaterialsSync = eventBus.on(MATERIAL_EVENTS.MATERIALS_SYNCED, async (data) => {
      if (data.path === path) {
        console.log(`[DevflixContext] MATERIALS_SYNCED event: ${data.itemsActivated} items unlocked`);
        await refreshData();
      }
    });

    // Listen for schedule check completed events (quando o scheduler global faz verificações)
    const handleScheduleCheck = eventBus.on(MATERIAL_EVENTS.SCHEDULE_CHECK_COMPLETED, async (data) => {
      if (data.hasChanges) {
        console.log('[DevflixContext] SCHEDULE_CHECK_COMPLETED with changes, refreshing...');
        await refreshData();
      }
    });

    return () => {
      isMounted = false;
      handleRefresh();
      handleMaterialsSync();
      handleScheduleCheck();
    };
  }, [path, navigate, dataInitialized]);
  
  // Function to control banner visibility
  const toggleBannerVisibility = useCallback((visible) => {
    setBannerVisible(visible);
  }, []);

  // Function to control countdown visibility
  const setCountdownBannerVisible = useCallback((visible) => {
    setCountdownVisible(visible);
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
    countdownVisible,
    setCountdownBannerVisible,
    classes: currentDevflix?.classes || [],
    materials: currentDevflix?.materials || [],
    headerButtonsConfig,
    path
  }), [
    currentDevflix,
    isLoading,
    error,
    bannerVisible,
    toggleBannerVisibility,
    countdownVisible,
    setCountdownBannerVisible,
    headerButtonsConfig,
    path
  ]);
  
  return (
    <DevflixContext.Provider value={value}>
      <SupportBubble />
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