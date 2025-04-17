// src/pages/Home.jsx - Performance optimized version
import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import CourseCard from '../components/CourseCard';
import PromoBanner from '../components/PromoBanner';
import BackgroundVideo from '../components/BackgroundVideo';
import { useDevflix } from '../contexts/DevflixContext';
import VideoSrc from '../assets/devflix.mp4'

// Memoized CourseCard to prevent unnecessary re-renders
const MemoizedCourseCard = memo(CourseCard);

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

  // Track loading state for video/image resources
  const [resourcesLoading, setResourcesLoading] = useState(true);

  // Uses the path from context to ensure consistency in routes
  const basePath = useMemo(() => path ? `/${path}` : '', [path]);

  // Content padding based on banner presence
  const contentPaddingTop = useMemo(() =>
    (bannerEnabled && bannerVisible) ? 'pt-[60px]' : 'pt-0',
    [bannerEnabled, bannerVisible]);

  // Home buttons configuration with memoization
  const homeButtons = useMemo(() => currentDevflix?.homeButtons || {
    primary: { text: 'Assistir Agora', url: '' },
    secondary: { text: 'Materiais de Apoio', url: '/materiais', enabled: true },
    whatsapp: { enabled: false, text: 'Entre no Grupo VIP do WhatsApp', url: '' }
  }, [currentDevflix]);

  // Optimize resource loading
  useEffect(() => {
    // Only load essential resources first, defer others
    const loadEssentialResources = () => {
      // Mark resources as loaded
      setResourcesLoading(false);
    };

    // Implement a short timeout to ensure UI is responsive
    const timer = setTimeout(loadEssentialResources, 800);

    return () => clearTimeout(timer);
  }, []);

  // Function to determine if a link is external (memoized)
  const isExternalLink = useMemo(() => (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  }, []);

  // Function to format URLs correctly (memoized)
  const formatUrl = useMemo(() => (url) => {
    if (!url) return basePath + '/aula/1'; // Default to first class

    if (isExternalLink(url)) {
      return url;
    } else {
      // For internal URLs, add basePath if needed
      return url.startsWith('/') ? basePath + url : basePath + '/' + url;
    }
  }, [basePath, isExternalLink]);

  // Get video and fallback sources
  const fallbackImageSrc = currentDevflix?.heroImage || '/images/bg-hero.jpg';

  // Show loading state if still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  // Error handling
  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-netflix-dark p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-netflix-red mb-4">Erro</h1>
            <p className="text-white mb-6">{error}</p>
            <a
              href="/"
              className="btn-primary py-2 px-4 inline-block"
            >
              Voltar
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Get course title/subtitle
  const courseTitle = currentDevflix?.title || 'Missão Programação do Zero';
  const courseSubtitle = currentDevflix?.subtitle || 'Pessoas comuns, insatisfeitas com o caminho tradicional, decidiram aprender programação com Rodolfo Mori para construir a vida que realmente querem';

  return (
    <div className={`min-h-screen ${contentPaddingTop}`}>
      {/* Banner promocional */}
      <PromoBanner
        banner={banner}
        enabled={bannerEnabled}
        onToggle={toggleBannerVisibility}
      />

      {/* Hero Section with extended background video - containing "Em alta" section */}
      <div className="relative min-h-screen w-full bg-netflix-black">
        <BackgroundVideo
          videoSrc={VideoSrc}
          fallbackImageSrc={fallbackImageSrc}
          overlay={true}
          darken={true}
        >
          {/* Hero Content - reduced height to make room for thumbnails */}
          <div className="flex justify-end h-[75vh] container-custom flex-col pb-10">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <span className="inline-block bg-netflix-red px-2 py-1 text-sm font-bold mb-4">SÉRIE</span>

                <h1 className="text-5xl md:text-7xl font-bold mb-4">{courseTitle}</h1>

                <p className="text-xl text-gray-300 mb-8">
                  {courseSubtitle}
                </p>

                <div className="flex flex-wrap gap-4">
                  {/* Primary Button */}
                  <a
                    href={formatUrl(homeButtons.primary.url)}
                    target={isExternalLink(homeButtons.primary.url) ? "_blank" : "_self"}
                    rel={isExternalLink(homeButtons.primary.url) ? "noopener noreferrer" : ""}
                    className="btn-primary py-3 px-8 text-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {homeButtons.primary.text}
                  </a>

                  {/* Secondary Button - Only if enabled */}
                  {homeButtons.secondary.enabled && (
                    <a
                      href={formatUrl(homeButtons.secondary.url)}
                      target={isExternalLink(homeButtons.secondary.url) ? "_blank" : "_self"}
                      rel={isExternalLink(homeButtons.secondary.url) ? "noopener noreferrer" : ""}
                      className="btn-secondary py-3 px-8 text-lg flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {homeButtons.secondary.text}
                    </a>
                  )}

                  {/* WhatsApp Button - Only if enabled */}
                  {homeButtons.whatsapp && homeButtons.whatsapp.enabled && (
                    <a
                      href={homeButtons.whatsapp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 text-lg rounded flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.3-.77.966-.944 1.164-.175.2-.349.223-.647.075-.3-.15-1.269-.465-2.411-1.485-.897-.8-1.502-1.788-1.674-2.085-.172-.3-.018-.465.13-.61.134-.133.3-.347.448-.522.15-.17.2-.3.3-.498.099-.2.05-.375-.025-.522-.075-.15-.672-1.621-.922-2.22-.24-.6-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.522.074-.797.375-.273.3-1.045 1.019-1.045 2.487 0 1.462 1.069 2.875 1.219 3.074.149.2 2.096 3.2 5.077 4.487.712.3 1.268.48 1.704.625.714.227 1.365.195 1.88.125.57-.075 1.758-.719 2.006-1.413.248-.693.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.422 7.403h-.004a9.87 9.87 0 01-5.032-1.378l-.36-.214-3.742.982.999-3.658-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.993c-.003 5.45-4.437 9.884-9.885 9.884m8.412-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.1.547 4.149 1.588 5.951L0 24l6.304-1.654a11.882 11.882 0 005.684 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" fillRule="evenodd" />
                      </svg>
                      {homeButtons.whatsapp.text}
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* "Em alta" section now positioned higher with less padding */}
          <div className="relative z-10 -mt-16">
            <section className="pt-40 pb-8">
              <div className="container-custom">
                <motion.h2
                  className="section-header mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Em alta
                </motion.h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {classes.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }} // Limiting delay
                    >
                      <MemoizedCourseCard
                        course={course}
                        basePath={basePath}
                      />
                    </motion.div>
                  ))}
                </div>

                {homeButtons.secondary.enabled && (
                  <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <a
                      href={formatUrl(homeButtons.secondary.url)}
                      target={isExternalLink(homeButtons.secondary.url) ? "_blank" : "_self"}
                      rel={isExternalLink(homeButtons.secondary.url) ? "noopener noreferrer" : ""}
                      className="btn-primary py-3 px-8 text-lg"
                    >
                      {homeButtons.secondary.text}
                    </a>
                  </motion.div>
                )}
              </div>
            </section>
          </div>
        </BackgroundVideo>
      </div>

      {/* About section - lazy loaded */}
      <section className="py-16 bg-netflix-dark">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-2/3">
              <motion.h2
                className="section-header mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Sobre o curso
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="text-gray-300 mb-4">
                  Criada por Rodolfo Mori, ex-eletricista que se tornou programador sênior em empresas como Santander, BTG Pactual, PI Investimentos e Toro Investimentos, a Formação DevClub Full Stack já ajudou mais de 15 mil alunos a saírem do zero e conquistarem seus primeiros empregos na programação, muitos faturando entre R$5 mil e R$20 mil por mês.

                  Com uma metodologia direta ao ponto, suporte 7 dias por semana, mentorias ao vivo e acompanhamento com recrutadora, o DevClub oferece tudo o que o mercado realmente exige para quem quer transformar a própria carreira, mesmo sem experiência, faculdade ou computador de última geração.
                </p>
                <p className="text-gray-300 mb-4">
                  Aprenda estratégias avançadas de configuração de campanhas, segmentação de audiência,
                  otimização de conversões e muito mais!
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <motion.div
                  className="bg-netflix-black p-4 rounded-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-2">Entre no Grupo VIP do Whatsapp
                  </h3>
                  <p className="text-gray-400">Clique abaixo e entre no meu grupo exclusivo no Whatsapp para ter acesso aos avisos, atualizações e à condição exclusiva da Formação de programadores DevClub Full Stack.
                  </p>
                </motion.div>
                <motion.div
                  className="bg-netflix-black p-4 rounded-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-xl font-bold mb-2">Materiais Exclusivos
                  </h3>
                  <p className="text-gray-400">Apostilas, códigos e ferramentas práticas pra te ajudar a sair do zero, acelerar seu aprendizado e dar os primeiros passos rumo ao seu primeiro “sim” na programação.

                  </p>
                </motion.div>
              </div>
            </div>

            <motion.div
              className="md:w-1/3 bg-netflix-black rounded-md overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <img
                src={currentDevflix?.instructorImage || "/images/instructor.png"}
                alt="Instrutor"
                className="w-full object-cover h-64"
                loading="lazy" // Lazy load this image
              />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">Seu Instrutor</h3>
                <p className="text-gray-400 mb-3">Programador Sênior

                </p>
                <p className="text-sm text-gray-300">
                  Rodolfo Mori, fundador do DevClub, já levou mais de 15 mil alunos do zero à programação. De eletricista a Dev Sênior em empresas como Santander e BTG, hoje ensina como conquistar os melhores empregos do mercado.


                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;