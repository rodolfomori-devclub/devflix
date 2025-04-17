// src/components/BackgroundVideo.jsx
import { useEffect, useRef, useState } from 'react';

const BackgroundVideo = ({ videoSrc, fallbackImageSrc, children, overlay = true, darken = true }) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;
    
    const handleCanPlay = () => {
      setIsLoaded(true);
    };
    
    const handleError = () => {
      console.error("Error loading video");
      setHasError(true);
    };
    
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);
    
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Fallback image shown while video loads or if there's an error */}
      {(!isLoaded || hasError) && fallbackImageSrc && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ 
            backgroundImage: `url('${fallbackImageSrc}')`, 
            opacity: 1
          }}
        />
      )}
      
      {/* Video background */}
      {!hasError && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Gradient overlay for better content visibility */}
      {overlay && (
        <div className={`absolute inset-0 ${darken ? 'bg-gradient-to-r from-netflix-black via-netflix-black/70 to-transparent' : ''}`}></div>
      )}
      
      {/* Additional vertical gradient for text readability */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/40 to-transparent"></div>
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default BackgroundVideo;