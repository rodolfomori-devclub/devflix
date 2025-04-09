// src/components/Navbar.jsx (com links fixos)
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
  
  // Obtém informações do contexto DevFlix
  const { bannerEnabled, bannerVisible, currentDevflix } = useDevflix();
  
  // Obter links do header dinamicamente
  const headerLinks = currentDevflix?.headerLinks || [];
  
  // Filtrar apenas links visíveis que não sejam os fixos
  const visibleCustomLinks = headerLinks.filter(link => 
    link.visible && 
    link.id !== 'link-home' && 
    link.id !== 'link-materials' &&
    link.id !== 'link-ai'
  ).sort((a, b) => a.order - b.order);
  
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
  const navbarPosition = (bannerEnabled && bannerVisible) ? 'top-[60px]' : 'top-0';
  
  // Função para renderizar links personalizados
  const renderCustomLinks = (isMobile = false) => {
    return visibleCustomLinks.map(link => {
      // Determinar se o link é externo
      const isExternal = link.url.startsWith('http');
      
      // Se a URL começa com /, e não com //, mantém o caminho relativo
      // caso contrário, adiciona o basePath no início
      const finalUrl = link.url.startsWith('/') && !link.url.startsWith('//') 
        ? (link.url === '/' ? basePath : `${basePath}${link.url}`)
        : link.url;
      
      // Verificar se o link está ativo
      const isActive = link.url === '/' 
        ? location.pathname === basePath
        : location.pathname.includes(link.url);
      
      if (isExternal) {
        return (
          <a 
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:text-netflix-red transition-colors ${
              isMobile ? 'block py-2' : ''
            } text-white`}
            onClick={isMobile ? () => setMenuOpen(false) : undefined}
          >
            {link.title}
          </a>
        );
      }
      
      return (
        <Link 
          key={link.id}
          to={finalUrl}
          className={`hover:text-netflix-red transition-colors ${
            isActive ? 'text-netflix-red font-medium' : 'text-white'
          } ${isMobile ? 'block py-2' : ''}`}
          onClick={isMobile ? () => setMenuOpen(false) : undefined}
        >
          {link.title}
        </Link>
      );
    });
  };
  
  // Verificar se link está fixo ou não
  const isHomeLinkActive = location.pathname === basePath;
  const isMaterialsLinkActive = location.pathname.includes('/materiais');
  
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
        <div className="container-custom h-16 flex justify-between items-center">
          {/* Logo */}
          <Link to={basePath} className="flex items-center">
            <span className="text-netflix-red font-bold text-3xl">DEV<span className="text-white">FLIX</span></span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Links fixos + links personalizados */}
            <Link 
              to={basePath} 
              className={`hover:text-netflix-red transition-colors ${
                isHomeLinkActive ? 'text-netflix-red font-medium' : 'text-white'
              }`}
            >
              Home
            </Link>
            
            <Link 
              to={`${basePath}/materiais`} 
              className={`hover:text-netflix-red transition-colors ${
                isMaterialsLinkActive ? 'text-netflix-red font-medium' : 'text-white'
              }`}
            >
              Materiais de Apoio
            </Link>
            
            {/* Links personalizados */}
            {renderCustomLinks()}
            
            {/* Botão de chat com IA (sempre visível) */}
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
                {/* Links fixos para mobile */}
                <Link 
                  to={basePath} 
                  className={`block py-2 ${
                    isHomeLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                
                <Link 
                  to={`${basePath}/materiais`} 
                  className={`block py-2 ${
                    isMaterialsLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Materiais de Apoio
                </Link>
                
                {/* Links personalizados para mobile */}
                {renderCustomLinks(true)}
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