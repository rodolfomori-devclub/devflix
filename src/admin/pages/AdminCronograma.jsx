// src/admin/pages/AdminCronograma.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import {
  getCronogramaDescriptions,
  updateCronogramaDescriptions
} from '../../firebase/firebaseService';

// Formatar data para exibição
const formatClassDate = (isoDate) => {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${weekdays[date.getDay()]} ${day}/${month} às ${hours}:${minutes}`;
};

// Mapear ID da aula para a chave de data
const getClassDateKey = (classId) => {
  const mapping = {
    1: 'aula1',
    2: 'aula2',
    3: 'aula3',
    4: 'aula4',
    5: 'aulaBonus'
  };
  return mapping[classId];
};

const AdminCronograma = () => {
  const { currentDevflix } = useAdmin();
  const [descriptions, setDescriptions] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const classes = currentDevflix?.classes || [];
  const classDates = currentDevflix?.classDates || {};

  // Carregar descrições ao montar
  useEffect(() => {
    const loadDescriptions = async () => {
      if (!currentDevflix?.id) return;

      try {
        const desc = await getCronogramaDescriptions(currentDevflix.id);
        setDescriptions(desc || {});
      } catch (error) {
        console.error('Erro ao carregar descrições:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDescriptions();
  }, [currentDevflix]);

  // Atualizar descrição de uma aula
  const handleDescriptionChange = (classId, value) => {
    setDescriptions(prev => ({
      ...prev,
      [`aula${classId}`]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Salvar alterações
  const saveChanges = async () => {
    if (!currentDevflix?.id) {
      alert('Nenhuma instância selecionada');
      return;
    }

    setIsSaving(true);
    try {
      await updateCronogramaDescriptions(currentDevflix.id, descriptions);
      setHasUnsavedChanges(false);
      alert('Descrições salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar descrições');
    } finally {
      setIsSaving(false);
    }
  };

  // Descartar alterações
  const discardChanges = async () => {
    if (!currentDevflix?.id) return;

    try {
      const desc = await getCronogramaDescriptions(currentDevflix.id);
      setDescriptions(desc || {});
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao descartar alterações:', error);
    }
  };

  // Template padrão com descrições para todas as aulas
  const applyDefaultTemplate = () => {
    const defaultDescriptions = {
      aula1: 'Nesta primeira aula, você vai dar os primeiros passos na programação e entender os fundamentos essenciais para sua jornada como desenvolvedor.',
      aula2: 'Avançando no aprendizado, você vai construir seu primeiro projeto prático e aplicar os conceitos aprendidos na aula anterior.',
      aula3: 'Hora de elevar o nível! Você vai aprender técnicas avançadas e boas práticas utilizadas por desenvolvedores profissionais.',
      aula4: 'Na aula final, você vai consolidar todo o conhecimento e criar um projeto completo do zero ao deploy.',
      aula5: 'Conteúdo exclusivo de bônus! Dicas especiais e recursos extras para acelerar ainda mais sua evolução como programador.'
    };

    setDescriptions(defaultDescriptions);
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-netflix-red rounded-full mx-auto mb-4"></div>
          <p className="text-white">Carregando cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Página de Cronograma</h1>
              <p className="text-gray-400">
                Configure a "Trilha de Aprendizado" que aparece em /{currentDevflix?.path}/cronograma. As descrições são editáveis, os demais dados (thumb, data, título) vêm automaticamente das aulas.
              </p>
            </div>
            <button
              onClick={applyDefaultTemplate}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Template Padrão
            </button>
          </div>
        </div>

        {/* Botões de Salvar/Descartar */}
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex gap-4 sticky top-0 z-10 bg-netflix-black py-4"
          >
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </>
              )}
            </button>
            <button
              onClick={discardChanges}
              disabled={isSaving}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Descartar Alterações
            </button>
          </motion.div>
        )}

        {/* Lista de Aulas */}
        <div className="space-y-6">
          {classes.map((classItem, index) => {
            const classId = parseInt(classItem.id) || index + 1;
            const dateKey = getClassDateKey(classId);
            const classDate = classDates[dateKey];
            const isBonus = classId === 5 || classItem.title?.toLowerCase().includes('bônus');

            return (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl overflow-hidden border ${
                  isBonus
                    ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border-yellow-600/30'
                    : 'bg-netflix-dark border-gray-700'
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail */}
                  <div className="md:w-64 flex-shrink-0">
                    <div className="relative aspect-video md:aspect-auto md:h-full">
                      <img
                        src={classItem.coverImage || `/images/aula${classId}.jpg`}
                        alt={classItem.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          isBonus
                            ? 'bg-yellow-500 text-black'
                            : 'bg-netflix-red text-white'
                        }`}>
                          {isBonus ? 'BÔNUS' : `AULA ${classId}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 p-6">
                    {/* Info da aula (não editável) */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {classItem.title}
                      </h3>
                      {classDate && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                          isBonus ? 'bg-yellow-500/20 text-yellow-400' : 'bg-netflix-red/20 text-netflix-red'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatClassDate(classDate)}
                        </div>
                      )}
                    </div>

                    {/* Descrição (editável) */}
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Descrição da aula (aparece na trilha)
                      </label>
                      <textarea
                        value={descriptions[`aula${classId}`] || ''}
                        onChange={(e) => handleDescriptionChange(classId, e.target.value)}
                        placeholder="Ex: Nesta aula você vai aprender os fundamentos de HTML e CSS, criando sua primeira página web do zero..."
                        rows={3}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-netflix-red placeholder-gray-500 resize-none"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Máximo recomendado: 150 caracteres ({(descriptions[`aula${classId}`] || '').length}/150)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Preview */}
        <div className="mt-12 bg-netflix-dark rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Pré-visualização
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Veja como as descrições aparecerão na página de cronograma (trilha de aprendizado).
          </p>

          <div className="space-y-4">
            {classes.slice(0, 2).map((classItem, index) => {
              const classId = parseInt(classItem.id) || index + 1;
              const description = descriptions[`aula${classId}`];

              return (
                <div key={classItem.id} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <div className="w-32 aspect-video rounded overflow-hidden flex-shrink-0">
                    <img
                      src={classItem.coverImage || `/images/aula${classId}.jpg`}
                      alt={classItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{classItem.title}</h4>
                    {description ? (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{description}</p>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1 italic">Sem descrição</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCronograma;
