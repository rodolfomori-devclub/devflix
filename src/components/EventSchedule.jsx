import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useDevflix } from '../contexts/DevflixContext';
import { getScheduleStartData, getScheduleData } from '../firebase/firebaseService';

// Função para extrair ID do YouTube e gerar URL embed
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  console.log('Processing URL:', url);
  
  // Se já é uma URL de embed, retorna como está
  if (url.includes('youtube.com/embed/')) {
    console.log('Already embed URL:', url);
    return url;
  }
  
  // Extrair ID do YouTube de diferentes formatos de URL
  let videoId = null;
  
  // https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
    console.log('Extracted ID from watch URL:', videoId);
  }
  // https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
    console.log('Extracted ID from short URL:', videoId);
  }
  
  // Se encontrou o ID, cria URL embed
  if (videoId) {
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    console.log('Generated embed URL:', embedUrl);
    return embedUrl;
  }
  
  console.log('Could not process URL, returning original:', url);
  return url; // Retorna URL original se não conseguir processar
};

const EventSchedule = () => {
  const { currentDevflix } = useDevflix();
  const [selectedTab, setSelectedTab] = useState('start'); // 'start' ou 'schedule'
  const [selectedDay, setSelectedDay] = useState(0);
  const [videoModal, setVideoModal] = useState({ isOpen: false, videoUrl: null, title: '' });
  const [startMapData, setStartMapData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const openVideoModal = (videoUrl, title) => {
    setVideoModal({ isOpen: true, videoUrl, title });
    document.body.style.overflow = 'hidden'; // Previne scroll do body
  };

  const closeVideoModal = () => {
    setVideoModal({ isOpen: false, videoUrl: null, title: '' });
    document.body.style.overflow = 'unset'; // Restaura scroll do body
  };

  // Cleanup - restaura scroll quando componente é desmontado
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Adiciona listener para ESC fechar modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && videoModal.isOpen) {
        closeVideoModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [videoModal.isOpen]);

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!currentDevflix?.id) return;
      
      try {
        // Carregar dados do "Comece por AQUI"
        const startData = await getScheduleStartData(currentDevflix.id);
        if (startData && startData.length > 0) {
          setStartMapData(startData);
        } else {
          // Fallback to default data if nothing in Firebase
          setStartMapData([
            {
              id: 1,
              title: "Bem-vindo à Jornada!",
              description: "Antes de começarmos, é importante entender o que você vai aprender e como nossa metodologia funciona.",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              status: "available"
            },
            {
              id: 2,
              title: "Configurando o Ambiente",
              description: "Vamos preparar todas as ferramentas necessárias para o desenvolvimento.",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              status: "available"
            },
            {
              id: 3,
              title: "Primeiros Conceitos",
              description: "Aprenda os fundamentos básicos que você precisa dominar.",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              status: "available"
            },
            {
              id: 4,
              title: "Projeto Prático",
              description: "Coloque a mão na massa com seu primeiro projeto real.",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              status: "available"
            }
          ]);
        }
        
        // Carregar dados do Cronograma Completo
        const schedData = await getScheduleData(currentDevflix.id);
        if (schedData && schedData.length > 0) {
          setScheduleData(schedData);
        } else {
          // Dados padrão se não houver nada no Firebase
          setScheduleData([
            {
              day: "Aula 1",
              weekDay: "Terça",
              theme: "Fundamentos",
              color: "from-red-600 to-red-800",
              classes: [
                {
                  id: 1,
                  time: "19:00",
                  duration: "90min",
                  title: "Introdução ao Desenvolvimento",
                  description: "Aprenda os conceitos básicos e prepare seu ambiente de desenvolvimento",
                  instructor: "Prof. João Silva",
                  type: "Aula ao Vivo",
                  status: "completed"
                }
              ]
            }
          ]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do cronograma:', error);
        // Fallback data on error
        setStartMapData([]);
        setScheduleData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentDevflix]);

  // Os dados do scheduleData agora vêm do Firebase via state
  // Removido mock data - agora usa [scheduleData, setScheduleData] do state

  const getStatusIcon = (status) => {
    switch(status) {
      case 'live':
        return (
          <div className="flex items-center text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            AO VIVO
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center text-green-500">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            CONCLUÍDO
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            EM BREVE
          </div>
        );
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Aula ao Vivo': 'bg-red-600',
      'Workshop Prático': 'bg-blue-600', 
      'Projeto Hands-on': 'bg-green-600',
      'Masterclass': 'bg-purple-600',
      'Interação': 'bg-orange-600',
      'Aula Exclusiva': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold'
    };
    return colors[type] || 'bg-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-netflix-red rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl">Carregando cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black pt-40 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-netflix-red to-red-400 bg-clip-text text-transparent"
          >
            {selectedTab === 'start' ? 'Comece por AQUI' : 'Cronograma do Evento'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            {selectedTab === 'start' 
              ? 'Siga este roteiro para começar sua jornada da melhor forma'
              : '4 dias intensivos de aprendizado prático em desenvolvimento web'
            }
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-netflix-dark rounded-2xl p-2 flex gap-2">
            <button
              onClick={() => setSelectedTab('start')}
              className={`px-8 py-3 rounded-xl transition-all duration-300 font-semibold ${
                selectedTab === 'start'
                  ? 'bg-gradient-to-r from-netflix-red to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Comece por AQUI
            </button>
            <button
              onClick={() => setSelectedTab('schedule')}
              className={`px-8 py-3 rounded-xl transition-all duration-300 font-semibold ${
                selectedTab === 'schedule'
                  ? 'bg-gradient-to-r from-netflix-red to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Cronograma Completo
            </button>
          </div>
        </div>

        {/* Render based on selected tab */}
        {selectedTab === 'start' ? (
          // Trilha Minimalista
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Linha da trilha */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-600"></div>
              
              {startMapData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="relative flex items-start pb-8 last:pb-0"
                >
                  {/* Número do passo */}
                  <div className="flex-shrink-0 w-12 h-12 bg-netflix-red rounded-full flex items-center justify-center text-white font-bold relative z-10">
                    {index + 1}
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="ml-6 flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-400 mb-4">
                      {item.description}
                    </p>

                    {/* Botão do vídeo com destaque e pulsação suave */}
                    {item.videoUrl && (
                      <button
                        onClick={() => openVideoModal(item.videoUrl, item.title)}
                        className="inline-flex items-center gap-3 bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-netflix-red/50 animate-soft-pulse"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Assistir Agora
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          // Schedule Content
          <>
            {/* Day Selector */}
            <div className="flex justify-center mb-12">
              <div className="bg-netflix-dark rounded-2xl p-2 flex gap-2 overflow-x-auto">
                {scheduleData.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap relative ${
                      selectedDay === index
                        ? `bg-gradient-to-r ${day.color} text-white shadow-lg`
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {day.isBonus && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    <div className="font-semibold">{day.day}</div>
                    <div className="text-sm opacity-80">{day.weekDay}</div>
                    {day.isBonus && (
                      <div className="text-xs font-bold text-yellow-200">BÔNUS</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Day Content */}
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Day Header */}
              <div className={`bg-gradient-to-r ${scheduleData[selectedDay].color} p-8 rounded-t-2xl relative`}>
                {scheduleData[selectedDay].isBonus && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      ⭐ AULA BÔNUS
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{scheduleData[selectedDay].day}</h2>
                    <p className="text-lg opacity-90">{scheduleData[selectedDay].weekDay}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-80">{scheduleData[selectedDay].isBonus ? 'Conteúdo' : 'Foco do Dia'}</div>
                    <div className="text-2xl font-bold">{scheduleData[selectedDay].theme}</div>
                  </div>
                </div>
              </div>

              {/* Classes */}
              <div className="bg-netflix-dark rounded-b-2xl overflow-hidden">
                {scheduleData[selectedDay].classes.map((classItem, index) => (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-700 last:border-b-0"
                  >
                    <div className="p-8 hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Time & Duration */}
                        <div className="lg:w-32 flex-shrink-0">
                          <div className="text-2xl font-bold text-white">{classItem.time}</div>
                          <div className="text-sm text-gray-400">{classItem.duration}</div>
                          <div className="mt-2 text-xs">
                            {getStatusIcon(classItem.status)}
                          </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="lg:w-48 flex-shrink-0">
                          <div className="relative rounded-lg overflow-hidden aspect-video">
                            <img
                              src={classItem.thumbnail}
                              alt={classItem.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-2">{classItem.title}</h3>
                              <p className="text-gray-300 leading-relaxed">{classItem.description}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              classItem.type === 'Aula Exclusiva' 
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold' 
                                : `text-white ${getTypeColor(classItem.type)}`
                            }`}>
                              {classItem.type === 'Aula Exclusiva' && '⭐ '}{classItem.type}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              {classItem.instructor}
                            </div>
                            
                            <button className="flex items-center px-4 py-2 bg-netflix-red hover:bg-red-700 rounded-lg transition-colors">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                              </svg>
                              Adicionar à Agenda
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12 p-8 bg-gradient-to-r from-netflix-red to-red-600 rounded-2xl"
            >
              <h3 className="text-3xl font-bold mb-4">Não perca nenhum momento!</h3>
              <p className="text-lg mb-6 opacity-90">Receba lembretes por email e WhatsApp para todas as aulas</p>
              <button className="px-8 py-4 bg-white text-netflix-red font-bold rounded-lg hover:bg-gray-100 transition-colors">
                Configurar Lembretes
              </button>
            </motion.div>
          </>
        )}
      </div>

      {/* Video Modal */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeVideoModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-4xl mx-4">
            {/* Close Button */}
            <button
              onClick={closeVideoModal}
              className="absolute -top-12 right-0 text-white hover:text-netflix-red transition-colors z-10"
              aria-label="Fechar vídeo"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video Container */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={getYouTubeEmbedUrl(videoModal.videoUrl)}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                title={videoModal.title}
                allow="autoplay"
              ></iframe>
            </div>

            {/* Video Title */}
            <h3 className="text-white text-xl font-bold mt-4 text-center">
              {videoModal.title}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSchedule;