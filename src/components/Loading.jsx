// src/components/Loading.jsx - Improved loading component
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="fixed inset-0 bg-netflix-black flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <span className="text-netflix-red font-bold text-5xl">DEV<span className="text-white">FLIX</span></span>
      </motion.div>
      
      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
        <motion.div 
          className="h-full bg-netflix-red"
          initial={{ width: '0%' }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <motion.p 
        className="text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Carregando conteúdo... {Math.round(loadingProgress)}%
      </motion.p>
    </motion.div>
  );
};

export default Loading;