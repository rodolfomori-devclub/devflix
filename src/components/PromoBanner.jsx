// src/components/PromoBanner.jsx (com cores personalizadas)
import { useState, useEffect } from 'react';

const PromoBanner = ({ banner, enabled = false, onToggle }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Resetar a visibilidade quando o banner mudar ou for ativado/desativado
  useEffect(() => {
    setIsVisible(true);
  }, [banner, enabled]);

  // Quando o banner é fechado, notifica o componente pai
  const handleClose = () => {
    setIsVisible(false);
    if (onToggle) {
      onToggle(false);
    }
  };
  
  // Se o banner não está habilitado ou não há dados do banner, não mostra nada
  if (!enabled || !isVisible || !banner) return null;
  
  // Valores padrão para caso algum campo esteja faltando
  const {
    title = '', 
    text = 'Bem-vindo à DevFlix!',
    buttonText,
    buttonLink,
    backgroundColor = '#E50914',
    buttonColor = '#141414',
    titleColor = '#ffffff',     // Nova cor para o título
    textColor = '#ffffff',      // Nova cor para o texto
    buttonTextColor = '#ffffff' // Nova cor para o texto do botão
  } = banner;
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 w-full py-3 px-6 transition-all z-50"
      style={{ backgroundColor }}
    >
      <div className="container-custom flex flex-col sm:flex-row justify-between items-center">
        <div className="flex-1 flex flex-col items-start text-left">
          {title && (
            <h1 
              className="text-lg md:text-xl font-bold mb-1"
              style={{ color: titleColor }} // Aplicando a cor do título
            >
              {title}
            </h1>
          )}
          <p 
            className="text-sm md:text-base font-medium"
            style={{ color: textColor }} // Aplicando a cor do texto
          >
            {text}
          </p>
        </div>
        
        <div className="flex items-center mt-2 sm:mt-0">
          {buttonText && buttonLink && (
            <a 
              href={buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded text-xs font-bold mr-4"
              style={{ 
                backgroundColor: buttonColor,
                color: buttonTextColor // Aplicando a cor do texto do botão
              }}
            >
              {buttonText}
            </a>
          )}
          
          <button 
            onClick={handleClose}
            className="text-white opacity-80 hover:opacity-100"
            title="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;