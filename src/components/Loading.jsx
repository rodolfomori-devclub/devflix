// src/components/Loading.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Simula o tempo de carregamento
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
    
    return () => clearTimeout(timer);
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
      
      <div className="w-24 h-24 relative">
        <motion.div 
          className="absolute inset-0 border-t-4 border-netflix-red rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          className="absolute inset-2 border-r-4 border-white/30 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      </div>
      
      <motion.p 
        className="mt-6 text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Carregando conteúdo...
      </motion.p>
    </motion.div>
  );
};

export default Loading;