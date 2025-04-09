// src/components/CourseCard.jsx (Netflix-style)
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, basePath = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="course-card group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Thumbnail Image */}
        <img 
          src={course.coverImage} 
          alt={`Capa da ${course.title}`}
          className="course-card-image transition-transform duration-500 group-hover:scale-110 group-hover:brightness-50"
        />
        
        {/* Class Number Badge */}
        <div className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow-lg">
          {`Aula ${course.id}`}
        </div>
        
        {/* Overlay Content (only visible on hover) */}
        <div className="course-card-overlay">
          <h3 className="course-card-title">{course.title}</h3>
          {course.description && (
            <p className="text-sm text-gray-300 mb-4">{course.description}</p>
          )}
          
          <div className="flex space-x-2">
            <Link 
              to={`${basePath}/aula/${course.id}`} 
              className="course-card-button flex-1 text-center"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Assistir
              </div>
            </Link>
            
            {course.videoLink && (
              <a 
                href={course.videoLink} 
                target="_blank"
                rel="noopener noreferrer"
                className="course-card-button flex-1 text-center bg-gray-700 hover:bg-gray-600"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                  Link Direto
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Info visible outside of hover for mobile UX */}
      <div className="p-3 bg-netflix-dark md:hidden">
        <h3 className="text-sm font-bold truncate mb-2">{course.title}</h3>
        <Link 
          to={`${basePath}/aula/${course.id}`} 
          className="course-card-button block w-full text-center text-sm py-1"
        >
          Assistir Agora
        </Link>
      </div>
      
      {/* Motion Animation for Scale Effect */}
      {isHovered && (
        <motion.div
          className="absolute -inset-3 bg-netflix-dark/50 rounded-lg -z-10"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
};

export default CourseCard;