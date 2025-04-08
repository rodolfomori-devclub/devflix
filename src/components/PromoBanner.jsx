// src/components/PromoBanner.jsx
import { useState } from 'react';

const PromoBanner = ({ banner, enabled = false }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!enabled || !isVisible) return null;
  
  return (
    <div 
      className="w-full py-3 px-6 transition-all"
      style={{ backgroundColor: banner.backgroundColor || '#ff3f3f' }}
    >
      <div className="container-custom flex flex-col sm:flex-row justify-between items-center">
        <p className="text-white text-sm md:text-base font-medium mb-2 sm:mb-0">
          {banner.text || 'Promoção especial para você!'}
        </p>
        
        <div className="flex items-center">
          {banner.buttonText && banner.buttonLink && (
            <a 
              href={banner.buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded text-xs font-bold mr-4"
              style={{ 
                backgroundColor: banner.buttonColor || '#222222',
                color: '#ffffff' 
              }}
            >
              {banner.buttonText}
            </a>
          )}
          
          <button 
            onClick={() => setIsVisible(false)}
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