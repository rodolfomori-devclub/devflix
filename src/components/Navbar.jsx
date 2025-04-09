// src/components/Navbar.jsx (correção alinhamento)
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevflix } from '../contexts/DevflixContext';
import AiChatModal from './AiChatModal';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
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
  
  // Função para abrir/fechar o modal da IA
  const toggleAiModal = () => {
    setAiModalOpen(!aiModalOpen);
  };
  
  // Extrair o path da URL para manter consistência nas rotas
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const basePath = pathSegments.length > 0 ? `/${pathSegments[0]}` : '';
  
  // Ajustar posição do navbar baseado na presença do banner
  // Mudança: Removendo o espaçamento estranho entre o banner e o navbar
  const navbarPosition = (bannerEnabled && bannerVisible) ? 'top-[60px]' : 'top-0';
  
  // Alterando classes para melhorar o alinhamento vertical
  return (
    <>
      <motion.nav 
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${navbarPosition} ${
          scrolled ? 'bg-netflix-black/90 backdrop-blur-sm shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-custom h-16 flex justify-between items-center"> {/* Altura fixa e centralizada */}
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
            
            {/* Botão de chat com IA */}
            <button
              onClick={toggleAiModal}
              className="bg-netflix-red hover:bg-red-700 text-white py-1.5 px-4 rounded-md transition-all duration-200 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
              <span>Fale com a IA</span>
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Botão de IA para mobile */}
            <button
              onClick={toggleAiModal}
              className="bg-netflix-red hover:bg-red-700 text-white p-1.5 rounded-md transition-colors"
              aria-label="Fale com a IA"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </button>
            
            <button 
              className="text-white focus:outline-none"
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
      
      {/* Modal de Chat com IA */}
      <AiChatModal isOpen={aiModalOpen} onClose={toggleAiModal} />
    </>
  );
};

export default Navbar;