// src/components/Navbar.jsx (ajuste para banner)
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevflix } from '../contexts/DevflixContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Obtém informações do banner do contexto DevFlix
  const { bannerEnabled, bannerVisible } = useDevflix();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Extrair o path da URL para manter consistência nas rotas
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const basePath = pathSegments.length > 0 ? `/${pathSegments[0]}` : '';
  
  // Ajustar posição do navbar baseado na presença do banner
  const navbarPosition = (bannerEnabled && bannerVisible) ? 'top-[60px]' : 'top-0';
  
  return (
    <motion.nav 
      className={`fixed left-0 right-0 z-40 transition-all duration-300 ${navbarPosition} ${
        scrolled ? 'bg-netflix-black/90 backdrop-blur-sm py-3 shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent py-5'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <Link to={basePath} className="flex items-center">
          <span className="text-netflix-red font-bold text-3xl">DEV<span className="text-white">FLIX</span></span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to={basePath} 
            className={`hover:text-netflix-red transition-colors ${
              location.pathname === basePath ? 'text-netflix-red font-medium' : 'text-white'
            }`}
          >
            Home
          </Link>
          <Link 
            to={`${basePath}/materiais`} 
            className={`hover:text-netflix-red transition-colors ${
              location.pathname.includes('/materiais') ? 'text-netflix-red font-medium' : 'text-white'
            }`}
          >
            Materiais de Apoio
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-netflix-black shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container-custom py-4 space-y-4">
              <Link 
                to={basePath} 
                className={`block py-2 ${
                  location.pathname === basePath ? 'text-netflix-red font-medium' : 'text-white'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to={`${basePath}/materiais`} 
                className={`block py-2 ${
                  location.pathname.includes('/materiais') ? 'text-netflix-red font-medium' : 'text-white'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Materiais de Apoio
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;