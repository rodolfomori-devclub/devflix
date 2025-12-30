import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useDevflix } from '../contexts/DevflixContext';
import { getScheduleStartData } from '../firebase/firebaseService';
import PromoBanner from '../components/PromoBanner';
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton';

// Função para extrair ID do YouTube
const getYouTubeVideoId = (url) => {
  if (!url) return null;

  let videoId = null;

  // https://www.youtube.com/embed/VIDEO_ID
  if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
  }
  // https://www.youtube.com/watch?v=VIDEO_ID
  else if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  }
  // https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }

  return videoId;
};

// Função para gerar URL embed
const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

// Função para gerar URL da thumbnail
const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return null;
};

// Mapeamento de ícones para presentes
const giftIconMap = {
  gift: '🎁',
  download: '📥',
  book: '📚',
  link: '🔗',
  video: '🎬',
  code: '💻',
  star: '⭐'
};

// Mapeamento de ícones para tipos de desafio
const challengeIconMap = {
  youtube_reminder: '🔔',
  whatsapp_group: '💬',
  calendar: '📅',
  custom: '🔗'
};

// Mapeamento de textos para tipos de desafio
const challengeTextMap = {
  youtube_reminder: 'Ative o lembrete no YouTube para desbloquear seu presente!',
  whatsapp_group: 'Entre no grupo do WhatsApp para desbloquear seu presente!',
  calendar: 'Adicione o evento à sua agenda para desbloquear seu presente!',
  custom: 'Complete o desafio para desbloquear seu presente!'
};

// Chave do localStorage para presentes desbloqueados
const UNLOCKED_GIFTS_KEY = 'devflix_unlocked_gifts';

const Aquecimento = () => {
  const {
    currentDevflix,
    banner,
    bannerEnabled,
    bannerVisible,
    toggleBannerVisibility,
    countdownVisible
  } = useDevflix();
  const [videoModal, setVideoModal] = useState({ isOpen: false, videoUrl: null, title: '' });
  const [challengeModal, setChallengeModal] = useState({ isOpen: false, gift: null });
  const [startMapData, setStartMapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unlockedGifts, setUnlockedGifts] = useState([]);

  // Carregar presentes desbloqueados do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(UNLOCKED_GIFTS_KEY);
      if (stored) {
        setUnlockedGifts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar presentes desbloqueados:', error);
    }
  }, []);

  // Verificar se um presente está desbloqueado
  const isGiftUnlocked = useCallback((giftId) => {
    return unlockedGifts.includes(giftId);
  }, [unlockedGifts]);

  // Desbloquear um presente
  const unlockGift = useCallback((giftId) => {
    setUnlockedGifts(prev => {
      if (prev.includes(giftId)) return prev;
      const updated = [...prev, giftId];
      try {
        localStorage.setItem(UNLOCKED_GIFTS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erro ao salvar presente desbloqueado:', error);
      }
      return updated;
    });
  }, []);

  // Padding top baseado no countdown/banner
  const getContentPadding = () => {
    if (countdownVisible) {
      return 'pt-[164px] sm:pt-[116px]';
    }
    return (bannerEnabled && bannerVisible) ? 'pt-[76px]' : 'pt-16';
  };
  const contentPaddingTop = getContentPadding();

  const openVideoModal = (videoUrl, title) => {
    setVideoModal({ isOpen: true, videoUrl, title });
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    setVideoModal({ isOpen: false, videoUrl: null, title: '' });
    document.body.style.overflow = 'unset';
  };

  // Abrir modal de desafio
  const openChallengeModal = (gift) => {
    setChallengeModal({ isOpen: true, gift });
    document.body.style.overflow = 'hidden';
  };

  // Fechar modal de desafio
  const closeChallengeModal = () => {
    setChallengeModal({ isOpen: false, gift: null });
    document.body.style.overflow = 'unset';
  };

  // Completar desafio - abre link e desbloqueia o presente
  const completeChallenge = (gift) => {
    // Abre o link do desafio em nova aba
    window.open(gift.challenge.url, '_blank');
    // Desbloqueia o presente
    unlockGift(gift.id);
    // Fecha o modal
    closeChallengeModal();
  };

  // Handler para clique no presente
  const handleGiftClick = (e, gift) => {
    e.preventDefault();

    // Se não tem desafio habilitado, abre direto
    if (!gift.challenge?.enabled) {
      window.open(gift.url, '_blank');
      return;
    }

    // Se já está desbloqueado, abre direto
    if (isGiftUnlocked(gift.id)) {
      window.open(gift.url, '_blank');
      return;
    }

    // Se tem desafio e não está desbloqueado, abre o modal
    openChallengeModal(gift);
  };

  // Cleanup - restaura scroll quando componente é desmontado
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Adiciona listener para ESC fechar modais
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (videoModal.isOpen) {
          closeVideoModal();
        }
        if (challengeModal.isOpen) {
          closeChallengeModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [videoModal.isOpen, challengeModal.isOpen]);

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!currentDevflix?.id) return;

      try {
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
              videoUrl: "",
              gifts: []
            },
            {
              id: 2,
              title: "Configurando o Ambiente",
              description: "Vamos preparar todas as ferramentas necessárias para o desenvolvimento.",
              videoUrl: "",
              gifts: []
            },
            {
              id: 3,
              title: "Primeiros Conceitos",
              description: "Aprenda os fundamentos básicos que você precisa dominar.",
              videoUrl: "",
              gifts: []
            },
            {
              id: 4,
              title: "Projeto Prático",
              description: "Coloque a mão na massa com seu primeiro projeto real.",
              videoUrl: "",
              gifts: []
            }
          ]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do aquecimento:', error);
        setStartMapData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentDevflix]);

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-netflix-black ${contentPaddingTop} pb-20 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-netflix-red rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-netflix-black ${contentPaddingTop} pb-20`}>
      {/* Banner promocional */}
      <PromoBanner
        banner={banner}
        enabled={bannerEnabled}
        onToggle={toggleBannerVisibility}
      />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton />

      <div className="container-custom pt-24">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-netflix-red to-red-400 bg-clip-text text-transparent"
          >
            Comece por AQUI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Siga este roteiro para começar sua jornada da melhor forma
          </motion.p>
        </div>

        {/* Trilha Minimalista */}
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

                  {/* Thumbnail do vídeo clicável */}
                  {item.videoUrl && (
                    <button
                      onClick={() => openVideoModal(item.videoUrl, item.title)}
                      className="group relative w-full max-w-xs rounded-lg overflow-hidden shadow-lg hover:shadow-netflix-red/30 transition-all duration-300 hover:scale-[1.02]"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-800">
                        <img
                          src={getYouTubeThumbnail(item.videoUrl)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Overlay escuro no hover */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                        {/* Botão de play centralizado */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-netflix-red/90 group-hover:bg-netflix-red group-hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-lg">
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Label abaixo da thumbnail */}
                      <div className="bg-netflix-red group-hover:bg-red-700 text-white py-2 px-4 text-sm font-semibold text-center transition-colors duration-300">
                        Assistir Agora
                      </div>
                    </button>
                  )}

                  {/* Presentes / Links Extras */}
                  {(item.gifts || []).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                        <span className="text-lg">🎁</span>
                        Presentes deste passo:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(item.gifts || []).map(gift => {
                          const hasChallenge = gift.challenge?.enabled;
                          const isUnlocked = isGiftUnlocked(gift.id);
                          const showLock = hasChallenge && !isUnlocked;

                          return (
                            <button
                              key={gift.id}
                              onClick={(e) => handleGiftClick(e, gift)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md ${
                                showLock
                                  ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white hover:shadow-yellow-500/30'
                                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white hover:shadow-green-500/30'
                              }`}
                            >
                              {showLock ? (
                                <span className="text-base">🔒</span>
                              ) : (
                                <span className="text-base">{giftIconMap[gift.icon] || '🎁'}</span>
                              )}
                              {gift.title}
                              {!showLock && (
                                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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

      {/* Challenge Modal */}
      <AnimatePresence>
        {challengeModal.isOpen && challengeModal.gift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closeChallengeModal}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-700"
            >
              {/* Close Button */}
              <button
                onClick={closeChallengeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                aria-label="Fechar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header com animação de brilho */}
              <div className="relative bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 p-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                  className="text-6xl mb-2"
                >
                  🔒
                </motion.div>
                <h3 className="text-2xl font-bold text-white">
                  Desbloqueie seu presente!
                </h3>
              </div>

              {/* Conteúdo */}
              <div className="p-6 text-center">
                {/* Presente que será desbloqueado */}
                <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Presente a ser desbloqueado:</p>
                  <div className="flex items-center justify-center gap-2 text-white font-semibold">
                    <span className="text-2xl">{giftIconMap[challengeModal.gift.icon] || '🎁'}</span>
                    <span className="text-lg">{challengeModal.gift.title}</span>
                  </div>
                </div>

                {/* Instrução do desafio */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 text-4xl mb-3">
                    {challengeIconMap[challengeModal.gift.challenge?.type] || '🔗'}
                  </div>
                  <p className="text-gray-300 text-lg">
                    {challengeTextMap[challengeModal.gift.challenge?.type] || 'Complete o desafio para desbloquear!'}
                  </p>
                </div>

                {/* Botão de ação */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => completeChallenge(challengeModal.gift)}
                  className="w-full bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg shadow-netflix-red/30 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">
                    {challengeIconMap[challengeModal.gift.challenge?.type] || '🔗'}
                  </span>
                  {challengeModal.gift.challenge?.buttonText || 'Desbloquear Agora'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.button>

                {/* Nota explicativa */}
                <p className="mt-4 text-gray-500 text-sm">
                  Ao clicar, o link será aberto em uma nova aba e seu presente será desbloqueado automaticamente.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Aquecimento;
