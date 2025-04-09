// src/pages/Home.jsx (Netflix-style)
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
    path,
    currentDevflix
  } = useDevflix();
  
  // Usa o path do contexto para garantir consistência nas rotas
  const basePath = path ? `/${path}` : '';
  
  // Ajuste para o conteúdo principal baseado na presença do banner
  const contentPaddingTop = (bannerEnabled && bannerVisible) ? 'pt-[60px]' : 'pt-0';
  
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
  
  // Filtrar por categorias (se houver)
  const featuredClasses = classes.filter(course => course.featured);
  const regularClasses = classes.filter(course => !course.featured);
  
  // Obter o nome do curso ou título da DevFlix
  const courseTitle = currentDevflix?.title || 'Profissão Gestor de Tráfego';
  const courseSubtitle = currentDevflix?.subtitle || 'Domine o tráfego pago e transforme sua carreira';
  
  return (
    <div className={`min-h-screen ${contentPaddingTop}`}>
      {/* Banner promocional */}
      <PromoBanner 
        banner={banner} 
        enabled={bannerEnabled} 
        onToggle={toggleBannerVisibility}
      />
      
      {/* Hero Section com imagem de fundo e gradientes tipo Netflix */}
      <div className="relative h-screen w-full bg-netflix-black">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/instructor.png')" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/40 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative h-full container-custom z-10 flex flex-col justify-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block bg-netflix-red px-3 py-1 text-sm font-bold mb-4">SÉRIE</span>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-4">{courseTitle}</h1>
              
              <p className="text-xl text-gray-300 mb-8">
                {courseSubtitle}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to={`${basePath}/aula/1`} className="btn-primary py-3 px-8 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Assistir Agora
                </Link>
                
                <Link to={`${basePath}/materiais`} className="btn-secondary py-3 px-8 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Materiais de Apoio
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Gradient fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-netflix-black to-transparent"></div>
      </div>

      {/* Courses Section (em estilo Netflix) */}
      <section className="py-16 bg-netflix-black -mt-32 relative z-10">
        <div className="container-custom">
          <motion.h2 
            className="section-header"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Em alta
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
      
      {/* About section (for Netflix style, showing information about the course) */}
      <section className="py-16 bg-netflix-dark">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-2/3">
              <h2 className="section-header mb-6">Sobre o curso</h2>
              <p className="text-gray-300 mb-4">
                Transforme sua carreira aprendendo a gerenciar tráfego pago de forma eficiente. Este curso completo 
                vai te ensinar tudo o que precisa para se tornar um especialista em gestão de tráfego e aumentar 
                significativamente seus resultados online.
              </p>
              <p className="text-gray-300 mb-4">
                Aprenda estratégias avançadas de configuração de campanhas, segmentação de audiência, 
                otimização de conversões e muito mais!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="bg-netflix-black p-4 rounded-md">
                  <h3 className="text-xl font-bold mb-2">4 Aulas</h3>
                  <p className="text-gray-400">Conteúdo completo dividido em módulos práticos</p>
                </div>
                <div className="bg-netflix-black p-4 rounded-md">
                  <h3 className="text-xl font-bold mb-2">Materiais Exclusivos</h3>
                  <p className="text-gray-400">Templates e recursos para implementação imediata</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/3 bg-netflix-black rounded-md overflow-hidden">
              <img 
                src="/images/instructor.png" 
                alt="Instrutor" 
                className="w-full object-cover h-64"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">Seu Instrutor</h3>
                <p className="text-gray-400 mb-3">Especialista em Tráfego Pago</p>
                <p className="text-sm text-gray-300">
                  Com anos de experiência no mercado digital, nosso instrutor já ajudou centenas de empresas 
                  a escalar seus resultados através do tráfego pago.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;