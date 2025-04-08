// src/admin/contexts/AdminContext.jsx (atualizado)
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  saveToStorage, 
  generateId, 
  getDefaultDevflix
} from '../utils/adminHelpers';

// Mock da API - em um caso real, isso seria armazenado em um banco de dados
const initialDevflixData = [
  {
    id: '1',
    name: 'DevFlix 16',
    path: 'dev-16',
    bannerEnabled: true,
    banner: {
      text: 'Aproveite 50% de desconto nos próximos 3 dias!',
      buttonText: 'Garantir Vaga',
      backgroundColor: '#ff3f3f',
      buttonColor: '#222222',
      buttonLink: 'https://exemplo.com/promo'
    },
    classes: [
      {
        id: '1',
        title: 'Aula 1: Introdução ao HTML e CSS',
        coverImage: '/images/aula1.jpg',
        videoLink: 'https://exemplo.com/aula1'
      },
      {
        id: '2',
        title: 'Aula 2: JavaScript Básico',
        coverImage: '/images/aula2.jpg',
        videoLink: 'https://exemplo.com/aula2'
      },
      {
        id: '3',
        title: 'Aula 3: React Fundamentos',
        coverImage: '/images/aula3.jpg',
        videoLink: 'https://exemplo.com/aula3'
      },
      {
        id: '4',
        title: 'Aula 4: Projeto Final',
        coverImage: '/images/aula4.jpg',
        videoLink: 'https://exemplo.com/aula4'
      }
    ],
    materials: [
      {
        classId: '1',
        items: [
          { id: '1-1', title: 'Slides da Aula 1', url: '#', type: 'slides', locked: false },
          { id: '1-2', title: 'Código dos Exemplos', url: '#', type: 'code', locked: false },
          { id: '1-3', title: 'Exercícios Práticos', url: '#', type: 'exercise', locked: true },
        ]
      },
      {
        classId: '2',
        items: [
          { id: '2-1', title: 'Slides da Aula 2', url: '#', type: 'slides', locked: false },
          { id: '2-2', title: 'Código dos Exemplos', url: '#', type: 'code', locked: true },
        ]
      },
      {
        classId: '3',
        items: [
          { id: '3-1', title: 'Slides da Aula 3', url: '#', type: 'slides', locked: false },
          { id: '3-2', title: 'Repositório do Projeto', url: '#', type: 'code', locked: true },
        ]
      },
      {
        classId: '4',
        items: [
          { id: '4-1', title: 'Slides da Aula 4', url: '#', type: 'slides', locked: false },
          { id: '4-2', title: 'Código Final', url: '#', type: 'code', locked: true },
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'DevFlix 17',
    path: 'dev-17',
    bannerEnabled: false,
    banner: {
      text: '',
      buttonText: '',
      backgroundColor: '#3366ff',
      buttonColor: '#ffffff',
      buttonLink: ''
    },
    classes: [
      {
        id: '1',
        title: 'Aula 1: HTML e CSS Avançados',
        coverImage: '/images/aula1.jpg',
        videoLink: 'https://exemplo.com/aula1-nova'
      },
      {
        id: '2',
        title: 'Aula 2: JavaScript ES6+',
        coverImage: '/images/aula2.jpg',
        videoLink: 'https://exemplo.com/aula2-nova'
      },
      {
        id: '3',
        title: 'Aula 3: React Hooks',
        coverImage: '/images/aula3.jpg',
        videoLink: 'https://exemplo.com/aula3-nova'
      },
      {
        id: '4',
        title: 'Aula 4: Deploy de Aplicações',
        coverImage: '/images/aula4.jpg',
        videoLink: 'https://exemplo.com/aula4-nova'
      }
    ],
    materials: [
      {
        classId: '1',
        items: [
          { id: '1-1', title: 'Slides da Aula 1', url: '#', type: 'slides', locked: false },
          { id: '1-2', title: 'Exemplos CSS Grid', url: '#', type: 'code', locked: false },
        ]
      },
      {
        classId: '2',
        items: [
          { id: '2-1', title: 'Slides da Aula 2', url: '#', type: 'slides', locked: false },
          { id: '2-2', title: 'Exemplos Práticos', url: '#', type: 'exercise', locked: true },
        ]
      },
      {
        classId: '3',
        items: [
          { id: '3-1', title: 'Slides da Aula 3', url: '#', type: 'slides', locked: false },
        ]
      },
      {
        classId: '4',
        items: [
          { id: '4-1', title: 'Slides da Aula 4', url: '#', type: 'slides', locked: false },
          { id: '4-2', title: 'Guia de Deploy', url: '#', type: 'doc', locked: false },
        ]
      }
    ]
  }
];

// Função para obter dados do localStorage ou usar os dados iniciais
const getStoredData = () => {
  try {
    const storedData = localStorage.getItem('devflixInstances');
    return storedData ? JSON.parse(storedData) : initialDevflixData;
  } catch (error) {
    console.error('Erro ao recuperar dados armazenados:', error);
    return initialDevflixData;
  }
};

// Cria o contexto
const AdminContext = createContext();

// Provider Component
export const AdminProvider = ({ children }) => {
  const [devflixInstances, setDevflixInstances] = useState([]);
  const [currentDevflix, setCurrentDevflix] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulação de carregamento de dados
  useEffect(() => {
    // Em um ambiente real, aqui faria uma chamada à API
    const fetchData = () => {
      try {
        setIsLoading(true);
        setError(null);
        
        setTimeout(() => {
          const instances = getStoredData();
          setDevflixInstances(instances);
          setCurrentDevflix(instances.length > 0 ? instances[0] : null);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Atualizar o localStorage sempre que devflixInstances mudar
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(devflixInstances);
    }
  }, [devflixInstances, isLoading]);

  // Função para adicionar uma nova instância DevFlix
  const addDevflixInstance = (newInstance) => {
    try {
      const instance = getDefaultDevflix(newInstance.name, newInstance.path);
      
      setDevflixInstances(prev => {
        const updated = [...prev, instance];
        saveToStorage(updated);
        return updated;
      });
      
      return instance.id;
    } catch (err) {
      console.error('Erro ao adicionar instância:', err);
      setError('Falha ao adicionar instância. Verifique se o caminho é único.');
      throw err;
    }
  };

  // Função para atualizar uma instância existente
  const updateDevflixInstance = (id, updatedData) => {
    try {
      setDevflixInstances(prev => {
        const updated = prev.map(instance => 
          instance.id === id ? { ...instance, ...updatedData } : instance
        );
        saveToStorage(updated);
        return updated;
      });
      
      if (currentDevflix && currentDevflix.id === id) {
        setCurrentDevflix(prev => ({ ...prev, ...updatedData }));
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar instância:', err);
      setError('Falha ao atualizar instância.');
      throw err;
    }
  };

  // Função para deletar uma instância
  const deleteDevflixInstance = (id) => {
    try {
      setDevflixInstances(prev => {
        const updated = prev.filter(instance => instance.id !== id);
        saveToStorage(updated);
        return updated;
      });
      
      if (currentDevflix && currentDevflix.id === id) {
        const remaining = devflixInstances.filter(instance => instance.id !== id);
        setCurrentDevflix(remaining.length > 0 ? remaining[0] : null);
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao excluir instância:', err);
      setError('Falha ao excluir instância.');
      throw err;
    }
  };

  // Função para selecionar uma instância
  const selectDevflix = (id) => {
    try {
      const selected = devflixInstances.find(instance => instance.id === id);
      if (selected) {
        setCurrentDevflix(selected);
      }
    } catch (err) {
      console.error('Erro ao selecionar instância:', err);
      setError('Falha ao selecionar instância.');
    }
  };

  // Função para atualizar materiais de apoio
  const updateMaterials = (classId, materials) => {
    if (!currentDevflix) return;
    
    try {
      const updatedMaterials = currentDevflix.materials.map(item => 
        item.classId === classId ? { classId, items: materials } : item
      );
      
      updateDevflixInstance(currentDevflix.id, { materials: updatedMaterials });
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar materiais:', err);
      setError('Falha ao atualizar materiais.');
      throw err;
    }
  };

  // Função para adicionar material de apoio
  const addMaterial = (classId, material) => {
    if (!currentDevflix) return;
    
    try {
      const classMaterials = currentDevflix.materials.find(m => m.classId === classId);
      
      if (classMaterials) {
        const newMaterial = {
          id: `${classId}-${generateId()}`,
          ...material
        };
        
        const updatedItems = [...classMaterials.items, newMaterial];
        updateMaterials(classId, updatedItems);
        
        return newMaterial.id;
      }
    } catch (err) {
      console.error('Erro ao adicionar material:', err);
      setError('Falha ao adicionar material.');
      throw err;
    }
  };

  // Função para atualizar material de apoio
  const updateMaterial = (classId, materialId, updatedData) => {
    if (!currentDevflix) return;
    
    try {
      const classMaterials = currentDevflix.materials.find(m => m.classId === classId);
      
      if (classMaterials) {
        const updatedItems = classMaterials.items.map(item => 
          item.id === materialId ? { ...item, ...updatedData } : item
        );
        
        updateMaterials(classId, updatedItems);
        
        return true;
      }
    } catch (err) {
      console.error('Erro ao atualizar material:', err);
      setError('Falha ao atualizar material.');
      throw err;
    }
  };

  // Função para deletar material de apoio
  const deleteMaterial = (classId, materialId) => {
    if (!currentDevflix) return;
    
    try {
      const classMaterials = currentDevflix.materials.find(m => m.classId === classId);
      
      if (classMaterials) {
        const updatedItems = classMaterials.items.filter(item => item.id !== materialId);
        updateMaterials(classId, updatedItems);
        
        return true;
      }
    } catch (err) {
      console.error('Erro ao excluir material:', err);
      setError('Falha ao excluir material.');
      throw err;
    }
  };

  // Função para atualizar informações das aulas
  const updateClass = (classId, updatedData) => {
    if (!currentDevflix) return;
    
    try {
      const updatedClasses = currentDevflix.classes.map(classItem => 
        classItem.id === classId ? { ...classItem, ...updatedData } : classItem
      );
      
      updateDevflixInstance(currentDevflix.id, { classes: updatedClasses });
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar aula:', err);
      setError('Falha ao atualizar aula.');
      throw err;
    }
  };

  // Função para atualizar o banner
  const updateBanner = (bannerData, enabled = true) => {
    if (!currentDevflix) return;
    
    try {
      updateDevflixInstance(currentDevflix.id, {
        bannerEnabled: enabled,
        banner: { ...currentDevflix.banner, ...bannerData }
      });
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar banner:', err);
      setError('Falha ao atualizar banner.');
      throw err;
    }
  };

  // Função para desabilitar o banner
  const toggleBanner = (enabled) => {
    if (!currentDevflix) return;
    
    try {
      updateDevflixInstance(currentDevflix.id, { bannerEnabled: enabled });
      
      return true;
    } catch (err) {
      console.error('Erro ao alterar status do banner:', err);
      setError('Falha ao alterar status do banner.');
      throw err;
    }
  };

  // Limpar todos os dados armazenados (para funcionalidade de reset)
  const clearAllData = () => {
    try {
      localStorage.removeItem('devflixInstances');
      
      const instances = getStoredData(); // Recarregar os dados iniciais
      setDevflixInstances(instances);
      setCurrentDevflix(instances.length > 0 ? instances[0] : null);
      
      return true;
    } catch (err) {
      console.error('Erro ao limpar dados:', err);
      setError('Falha ao limpar dados.');
      return false;
    }
  };

  const value = {
    devflixInstances,
    currentDevflix,
    isLoading,
    error,
    selectDevflix,
    addDevflixInstance,
    updateDevflixInstance,
    deleteDevflixInstance,
    updateMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    updateClass,
    updateBanner,
    toggleBanner,
    clearAllData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};