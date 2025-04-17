// src/components/Loading.jsx - Improved loading component with pulsing effect
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loading = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Simulate progressive loading to give user feedback
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        // Progress slowly up to 90%, then wait for actual loading to complete
        if (prev < 90) {
          return prev + (90 - prev) / 10;
        }
        return prev;
      });
    }, 200);
    
    // Simulate completion time - in a real app, this would be based on actual loading
    const timer = setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => setIsVisible(false), 500); // Fade out after reaching 100%
    }, 2500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 bg-netflix-black flex flex-col items-center justify-center z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo with pulsing animation */}
          <div className="mb-8 relative">
            {/* Pulsing background glow effect */}
            <motion.div
              className="absolute inset-0 bg-netflix-red/30 rounded-full blur-xl"
              animate={{ 
                scale: [1, 1.4, 1], 
                opacity: [0.3, 0.7, 0.3] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut" 
              }}
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* Pulsing text */}
            <motion.span 
              className="text-netflix-red font-bold text-5xl relative z-10 inline-block"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.08, 1],
                opacity: 1
              }}
              transition={{
                scale: {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                },
                opacity: {
                  duration: 0.5
                }
              }}
            >
              DEVFLIX
            </motion.span>
          </div>
          
          {/* Progress bar */}
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
            <motion.div 
              className="h-full bg-netflix-red"
              initial={{ width: '0%' }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Progress text */}
          <motion.p 
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Carregando conteúdo... {Math.round(loadingProgress)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;