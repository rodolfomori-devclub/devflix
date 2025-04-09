// src/pages/Home.jsx (ajuste de espaçamento)
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CodeAnimation from '../components/CodeAnimation';
import CourseCard from '../components/CourseCard';
import PromoBanner from '../components/PromoBanner';
import { useDevflix } from '../contexts/DevflixContext';

const Home = () => {
  const { 
    classes, 
    banner, 
    bannerEnabled, 
    bannerVisible,
    toggleBannerVisibility, 
    isLoading, 
    error, 
    path 
  } = useDevflix();
  
  // Usa o path do contexto para garantir consistência nas rotas
  const basePath = path ? `/${path}` : '';
  
  // Ajuste para o conteúdo principal baseado na presença do banner
  // Corrigindo para altura exata do header (16) + banner (60) quando presente
  const contentPaddingTop = (bannerEnabled && bannerVisible) ? 'pt-[76px]' : 'pt-16';
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-netflix-dark p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-netflix-red mb-4">Erro</h1>
            <p className="text-white mb-6">{error}</p>
            <Link 
              to="/" 
              className="btn-primary py-2 px-4 inline-block"
            >
              Voltar
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${contentPaddingTop}`}>
      {/* Banner promocional */}
      <PromoBanner 
        banner={banner} 
        enabled={bannerEnabled} 
        onToggle={toggleBannerVisibility}
      />
      
      {/* Hero Section */}
      <section className="relative h-screen">
        <CodeAnimation />
        <div className="hero-content text-left px-6 md:px-12 lg:px-20">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full gap-8 md:gap-12">
            {/* Imagem do instrutor */}
            <div className="relative w-64 md:w-72 lg:w-96 mt-4 md:mt-0 z-20">
              <img 
                src="/images/instructor.png" 
                alt="Instrutor DevClub" 
                className="w-full h-auto"
              />
            </div>
            
            {/* Conteúdo de texto */}
            <div className="max-w-2xl">
              <motion.h1 
                className="text-5xl md:text-7xl font-extrabold text-left"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="text-white">Programador em</span>
                <span className="block text-netflix-red">72hrs</span>
              </motion.h1>
              <motion.p 
                className="mt-4 text-xl md:text-2xl text-gray-300 text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Aprenda programação do zero e transforme sua carreira em apenas 3 dias
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link to="#cursos" className="btn-primary py-3 px-8 text-lg">
                  Ver Aulas
                </Link>
                <Link to={`${basePath}/materiais`} className="py-3 px-8 text-lg border border-white hover:bg-white hover:text-netflix-black transition-colors duration-300 rounded">
                  Materiais de Apoio
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Courses Section */}
      <section id="cursos" className="py-16 bg-netflix-dark">
        <div className="container-custom">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-12 border-l-4 border-netflix-red pl-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Aulas Disponíveis
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CourseCard 
                  course={course} 
                  basePath={basePath}
                />
              </motion.div>
            ))}
          </div>
          
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link to={`${basePath}/materiais`} className="btn-primary py-3 px-8 text-lg">
              Ver Materiais de Apoio
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;