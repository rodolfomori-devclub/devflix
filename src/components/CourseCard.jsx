// src/components/CourseCard.jsx (atualizado)
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, basePath = '' }) => {
  return (
    <motion.div 
      className="card relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 } 
      }}
    >
      <div className="relative aspect-video overflow-hidden rounded-md">
        <div className="relative w-full h-full">
          <img 
            src={course.coverImage} 
            alt={`Capa da ${course.title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-3 text-xl font-bold text-white drop-shadow-lg">{`Aula ${course.id}`}</div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-xl font-bold mb-2">{course.title}</h3>
          <p className="text-sm text-gray-300 mb-4">{course.description}</p>
          {course.videoLink && (
            <a 
              href={course.videoLink} 
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block text-center"
            >
              Assistir Aula
            </a>
          )}
        </div>
      </div>
      
      {/* Botão visível fora do hover */}
      <div className="mt-3 p-2">
        <h3 className="text-lg font-bold mb-1 truncate">{course.title}</h3>
        <Link 
          to={`${basePath}/aula/${course.id}`} 
          className="btn-primary inline-block text-center w-full"
        >
          Assistir Agora
        </Link>
      </div>
    </motion.div>
  );
};

export default CourseCard;