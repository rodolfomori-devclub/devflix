// src/admin/pages/AdminSchedule.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import { 
  updateScheduleStartData, 
  getScheduleStartData,
  updateScheduleData,
  getScheduleData 
} from '../../firebase/firebaseService';

// Função para extrair ID do YouTube e gerar URL embed
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  console.log('Admin - Processing URL:', url);
  
  // Se já é uma URL de embed, retorna como está
  if (url.includes('youtube.com/embed/')) {
    console.log('Admin - Already embed URL:', url);
    return url;
  }
  
  // Extrair ID do YouTube de diferentes formatos de URL
  let videoId = null;
  
  // https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
    console.log('Admin - Extracted ID from watch URL:', videoId);
  }
  // https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
    console.log('Admin - Extracted ID from short URL:', videoId);
  }
  
  // Se encontrou o ID, cria URL embed
  if (videoId) {
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    console.log('Admin - Generated embed URL:', embedUrl);
    return embedUrl;
  }
  
  console.log('Admin - Could not process URL, returning original:', url);
  return url; // Retorna URL original se não conseguir processar
};

const AdminSchedule = () => {
  const { currentDevflix } = useAdmin();
  const [selectedTab, setSelectedTab] = useState('start-map');
  const [scheduleData, setScheduleData] = useState([]);
  const [startMapData, setStartMapData] = useState([
    {
      id: 1,
      title: "Bem-vindo à Jornada!",
      description: "Antes de começarmos, é importante entender o que você vai aprender e como nossa metodologia funciona. Este vídeo vai te guiar pelos primeiros passos.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      position: { top: "10%", left: "20%" },
      ctaButton: {
        text: "Começar Agora",
        url: "https://example.com/start",
        enabled: true
      },
      auxiliaryText: "💡 Dica: Prepare um caderno para anotar os pontos importantes!"
    },
    {
      id: 2,
      title: "Configurando seu Ambiente",
      description: "Vamos preparar todas as ferramentas necessárias para o desenvolvimento. Um ambiente bem configurado é fundamental para o sucesso.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      position: { top: "30%", left: "60%" },
      ctaButton: {
        text: "Download Ferramentas",
        url: "https://example.com/tools",
        enabled: true
      },
      auxiliaryText: "⚡ Importante: Certifique-se de que seu computador atende aos requisitos mínimos."
    },
    {
      id: 3,
      title: "Primeiro Projeto Prático",
      description: "Agora que tudo está configurado, vamos criar seu primeiro projeto do zero. Você verá como é satisfatório ver seu código funcionando!",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      position: { top: "50%", left: "25%" },
      ctaButton: {
        text: "Ver Código Completo",
        url: "https://github.com/example/projeto1",
        enabled: true
      },
      auxiliaryText: "🎯 Meta: Ao final deste vídeo, você terá seu primeiro site funcionando!"
    },
    {
      id: 4,
      title: "Conectando com a Comunidade",
      description: "Aprender sozinho é difícil. Descubra como se conectar com outros desenvolvedores e acelerar seu aprendizado através da comunidade.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      position: { top: "70%", left: "65%" },
      ctaButton: {
        text: "Entrar na Comunidade",
        url: "https://discord.gg/devflix",
        enabled: true
      },
      auxiliaryText: "🤝 Conecte-se: Mais de 10.000 desenvolvedores já fazem parte da nossa comunidade!"
    },
    {
      id: 5,
      title: "Próximos Passos",
      description: "Parabéns por chegar até aqui! Agora você está pronto para mergulhar no cronograma completo do evento. Vamos juntos nessa jornada!",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      position: { top: "85%", left: "40%" },
      ctaButton: {
        text: "Ver Cronograma Completo",
        url: "/cronograma",
        enabled: true
      },
      auxiliaryText: "🚀 Pronto para o próximo nível? O cronograma completo te espera!"
    }
  ]);

  const [editingItem, setEditingItem] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Adicionar novo item ao Comece por AQUI
  const addStartMapItem = () => {
    const newItem = {
      id: Date.now(),
      title: "Novo Passo",
      description: "Descrição do novo passo",
      videoUrl: "",
      status: "available"
    };
    setStartMapData([...startMapData, newItem]);
    setHasUnsavedChanges(true);
  };

  // Remover item do Comece por AQUI
  const removeStartMapItem = (itemId) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      setStartMapData(startMapData.filter(item => item.id !== itemId));
      setHasUnsavedChanges(true);
    }
  };

  // Mover item para cima
  const moveItemUp = (index) => {
    if (index === 0) return;
    const newData = [...startMapData];
    [newData[index - 1], newData[index]] = [newData[index], newData[index - 1]];
    setStartMapData(newData);
    setHasUnsavedChanges(true);
  };

  // Mover item para baixo
  const moveItemDown = (index) => {
    if (index === startMapData.length - 1) return;
    const newData = [...startMapData];
    [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
    setStartMapData(newData);
    setHasUnsavedChanges(true);
  };

  const handleItemChange = (itemId, field, value) => {
    setStartMapData(prevData => 
      prevData.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleCtaChange = (itemId, field, value) => {
    setStartMapData(prevData => 
      prevData.map(item => 
        item.id === itemId 
          ? { ...item, ctaButton: { ...item.ctaButton, [field]: value } }
          : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handlePositionChange = (itemId, axis, value) => {
    setStartMapData(prevData => 
      prevData.map(item => 
        item.id === itemId 
          ? { ...item, position: { ...item.position, [axis]: value } }
          : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!currentDevflix?.id) return;
      
      try {
        // Carregar dados do "Comece por AQUI"
        const startData = await getScheduleStartData(currentDevflix.id);
        if (startData && startData.length > 0) {
          setStartMapData(startData);
        }
        
        // Carregar dados do Cronograma Completo
        const schedData = await getScheduleData(currentDevflix.id);
        if (schedData && schedData.length > 0) {
          setScheduleData(schedData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do cronograma:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentDevflix]);

  const saveChanges = async () => {
    if (!currentDevflix?.id) {
      alert('Nenhuma instância selecionada');
      return;
    }

    try {
      // Salvar dados baseado na aba selecionada
      if (selectedTab === 'start-map') {
        await updateScheduleStartData(currentDevflix.id, startMapData);
      } else if (selectedTab === 'schedule') {
        await updateScheduleData(currentDevflix.id, scheduleData);
      }
      
      setHasUnsavedChanges(false);
      alert('Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar dados');
    }
  };

  const resetChanges = async () => {
    if (!currentDevflix?.id) return;
    
    try {
      if (selectedTab === 'start-map') {
        const originalData = await getScheduleStartData(currentDevflix.id);
        setStartMapData(originalData || []);
      } else if (selectedTab === 'schedule') {
        const originalData = await getScheduleData(currentDevflix.id);
        setScheduleData(originalData || []);
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-netflix-red rounded-full mx-auto mb-4"></div>
          <p className="text-white">Carregando dados do cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Cronograma</h1>
          <p className="text-gray-300">Configure o conteúdo do cronograma e mapa interativo</p>
        </div>

        {/* Save/Reset Buttons */}
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex space-x-4"
          >
            <button
              onClick={saveChanges}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Salvar Alterações
            </button>
            <button
              onClick={resetChanges}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Descartar Alterações
            </button>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-netflix-dark rounded-xl p-2 flex gap-2 w-fit">
            <button
              onClick={() => setSelectedTab('start-map')}
              className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold ${
                selectedTab === 'start-map'
                  ? 'bg-netflix-red text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Mapa "Comece por AQUI"
            </button>
            <button
              onClick={() => setSelectedTab('schedule')}
              className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold ${
                selectedTab === 'schedule'
                  ? 'bg-netflix-red text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Cronograma Completo
            </button>
          </div>
        </div>

        {/* Start Map Editor */}
        {selectedTab === 'start-map' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Editor - Comece por AQUI</h2>
              <button
                onClick={addStartMapItem}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Novo Passo
              </button>
            </div>
            
            {startMapData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-netflix-dark rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-white">Passo {index + 1}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveItemUp(index)}
                        disabled={index === 0}
                        className={`p-2 rounded transition-colors ${
                          index === 0 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                        title="Mover para cima"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveItemDown(index)}
                        disabled={index === startMapData.length - 1}
                        className={`p-2 rounded transition-colors ${
                          index === startMapData.length - 1
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                        title="Mover para baixo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        editingItem === item.id
                          ? 'bg-netflix-red text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }`}
                    >
                      {editingItem === item.id ? 'Minimizar' : 'Editar'}
                    </button>
                    <button
                      onClick={() => removeStartMapItem(item.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Remover item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {editingItem === item.id && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Título</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-netflix-red focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">URL do Vídeo</label>
                        <div className="relative">
                          <input
                            type="url"
                            value={item.videoUrl}
                            onChange={(e) => handleItemChange(item.id, 'videoUrl', e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                            className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-2 pr-10 focus:outline-none ${
                              item.videoUrl && getYouTubeEmbedUrl(item.videoUrl) 
                                ? 'border-green-500 focus:border-green-400' 
                                : item.videoUrl 
                                  ? 'border-red-500 focus:border-red-400' 
                                  : 'border-gray-600 focus:border-netflix-red'
                            }`}
                          />
                          {item.videoUrl && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {getYouTubeEmbedUrl(item.videoUrl) ? (
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                        {item.videoUrl && !getYouTubeEmbedUrl(item.videoUrl) && (
                          <p className="text-red-400 text-sm mt-1">
                            ⚠️ URL inválida. Use: youtube.com/watch?v=... ou youtu.be/...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-white font-medium mb-2">Descrição</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        rows="3"
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-netflix-red focus:outline-none"
                      />
                    </div>


                    {/* Preview */}
                    <div className="border border-gray-600 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-4">Pré-visualização</h4>
                      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-netflix-red rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white font-bold text-lg mb-2">{item.title}</h5>
                            <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                            {item.videoUrl && (
                              <button className="mt-3 inline-flex items-center gap-2 bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Assistir Agora
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editingItem !== item.id && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Título:</span>
                      <p className="text-white truncate">{item.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Vídeo:</span>
                      <p className="text-white truncate">{item.videoUrl ? '✅ Configurado' : '❌ Não configurado'}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Schedule Editor */}
        {selectedTab === 'schedule' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Editor - Cronograma Completo</h2>
              <button
                onClick={() => {
                  const newDay = {
                    id: Date.now(),
                    day: `Aula ${scheduleData.length + 1}`,
                    weekDay: "Segunda",
                    theme: "Novo Tema",
                    color: "from-blue-600 to-blue-800",
                    classes: []
                  };
                  setScheduleData([...scheduleData, newDay]);
                  setHasUnsavedChanges(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Novo Dia
              </button>
            </div>

            {scheduleData.length === 0 ? (
              <div className="bg-netflix-dark rounded-xl p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-lg mb-4">Nenhum dia configurado no cronograma</p>
                <button
                  onClick={() => {
                    // Adicionar dados padrão
                    const defaultSchedule = [
                      {
                        id: 1,
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
                            description: "Aprenda os conceitos básicos",
                            instructor: "Prof. João Silva"
                          }
                        ]
                      },
                      {
                        id: 2,
                        day: "Aula 2",
                        weekDay: "Quarta",
                        theme: "Prática",
                        color: "from-blue-600 to-blue-800",
                        classes: []
                      }
                    ];
                    setScheduleData(defaultSchedule);
                    setHasUnsavedChanges(true);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Usar Template Padrão
                </button>
              </div>
            ) : (
              scheduleData.map((day, dayIndex) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.1 }}
                  className="bg-netflix-dark rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Dia {dayIndex + 1}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newClass = {
                            id: Date.now(),
                            time: "19:00",
                            duration: "60min",
                            title: "Nova Aula",
                            description: "Descrição da aula",
                            instructor: "Instrutor"
                          };
                          const updated = [...scheduleData];
                          updated[dayIndex].classes.push(newClass);
                          setScheduleData(updated);
                          setHasUnsavedChanges(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        + Adicionar Aula
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Remover este dia do cronograma?')) {
                            setScheduleData(scheduleData.filter((_, i) => i !== dayIndex));
                            setHasUnsavedChanges(true);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Remover Dia
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Nome do Dia</label>
                      <input
                        type="text"
                        value={day.day}
                        onChange={(e) => {
                          const updated = [...scheduleData];
                          updated[dayIndex].day = e.target.value;
                          setScheduleData(updated);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-netflix-red focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Dia da Semana</label>
                      <input
                        type="text"
                        value={day.weekDay}
                        onChange={(e) => {
                          const updated = [...scheduleData];
                          updated[dayIndex].weekDay = e.target.value;
                          setScheduleData(updated);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-netflix-red focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Tema</label>
                      <input
                        type="text"
                        value={day.theme}
                        onChange={(e) => {
                          const updated = [...scheduleData];
                          updated[dayIndex].theme = e.target.value;
                          setScheduleData(updated);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-netflix-red focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Cor (Gradient)</label>
                      <select
                        value={day.color}
                        onChange={(e) => {
                          const updated = [...scheduleData];
                          updated[dayIndex].color = e.target.value;
                          setScheduleData(updated);
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-netflix-red focus:outline-none"
                      >
                        <option value="from-red-600 to-red-800">Vermelho</option>
                        <option value="from-blue-600 to-blue-800">Azul</option>
                        <option value="from-green-600 to-green-800">Verde</option>
                        <option value="from-purple-600 to-purple-800">Roxo</option>
                        <option value="from-yellow-500 to-yellow-600">Amarelo</option>
                        <option value="from-orange-600 to-orange-800">Laranja</option>
                      </select>
                    </div>
                  </div>

                  {/* Classes do Dia */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Aulas do Dia</h4>
                    {day.classes.length === 0 ? (
                      <p className="text-gray-400 text-sm">Nenhuma aula configurada</p>
                    ) : (
                      day.classes.map((cls, classIndex) => (
                        <div key={cls.id} className="bg-gray-800 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Título da aula"
                              value={cls.title}
                              onChange={(e) => {
                                const updated = [...scheduleData];
                                updated[dayIndex].classes[classIndex].title = e.target.value;
                                setScheduleData(updated);
                                setHasUnsavedChanges(true);
                              }}
                              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Instrutor"
                              value={cls.instructor}
                              onChange={(e) => {
                                const updated = [...scheduleData];
                                updated[dayIndex].classes[classIndex].instructor = e.target.value;
                                setScheduleData(updated);
                                setHasUnsavedChanges(true);
                              }}
                              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Horário"
                              value={cls.time}
                              onChange={(e) => {
                                const updated = [...scheduleData];
                                updated[dayIndex].classes[classIndex].time = e.target.value;
                                setScheduleData(updated);
                                setHasUnsavedChanges(true);
                              }}
                              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Duração"
                              value={cls.duration}
                              onChange={(e) => {
                                const updated = [...scheduleData];
                                updated[dayIndex].classes[classIndex].duration = e.target.value;
                                setScheduleData(updated);
                                setHasUnsavedChanges(true);
                              }}
                              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                            />
                            <textarea
                              placeholder="Descrição"
                              value={cls.description}
                              onChange={(e) => {
                                const updated = [...scheduleData];
                                updated[dayIndex].classes[classIndex].description = e.target.value;
                                setScheduleData(updated);
                                setHasUnsavedChanges(true);
                              }}
                              className="md:col-span-2 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                              rows="2"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const updated = [...scheduleData];
                              updated[dayIndex].classes = updated[dayIndex].classes.filter((_, i) => i !== classIndex);
                              setScheduleData(updated);
                              setHasUnsavedChanges(true);
                            }}
                            className="mt-2 text-red-400 hover:text-red-300 text-sm"
                          >
                            Remover Aula
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchedule;