// src/firebase/firebaseService.js (atualização para cores de texto)
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Referências às coleções
const devflixCollection = collection(db, 'devflix-instances');

// Obter todas as instâncias da DevFlix
export const getAllDevflixInstances = async () => {
  try {
    const snapshot = await getDocs(devflixCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erro ao obter instâncias DevFlix:", error);
    throw error;
  }
};

// Obter uma instância específica por ID
export const getDevflixById = async (id) => {
  try {
    const docRef = doc(devflixCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log("Documento não encontrado!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao obter instância DevFlix:", error);
    throw error;
  }
};

// Obter uma instância pela URL path
export const getDevflixByPath = async (path) => {
  try {
    // Se não houver caminho, retornar erro
    if (!path) {
      throw new Error("Caminho não especificado");
    }
    
    // Buscar a instância pelo path
    const q = query(devflixCollection, where("path", "==", path));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } else {
      // Se não encontrar o path, retorna null (será tratado como erro no contexto)
      return null;
    }
  } catch (error) {
    console.error("Erro ao obter instância DevFlix por path:", error);
    throw error;
  }
};

// Adicionar nova instância DevFlix
export const addDevflixInstance = async (data) => {
  try {
    // Verificar se o path já existe
    const q = query(devflixCollection, where("path", "==", data.path));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error(`O caminho '${data.path}' já está em uso.`);
    }
    
    // Estrutura inicial padrão
    const newInstance = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      classes: data.classes || [
        {
          id: '1',
          title: 'Aula 1',
          coverImage: '/images/aula1.jpg',
          videoLink: ''
        },
        {
          id: '2',
          title: 'Aula 2',
          coverImage: '/images/aula2.jpg',
          videoLink: ''
        },
        {
          id: '3',
          title: 'Aula 3',
          coverImage: '/images/aula3.jpg',
          videoLink: ''
        },
        {
          id: '4',
          title: 'Aula 4',
          coverImage: '/images/aula4.jpg',
          videoLink: ''
        }
      ],
      materials: data.materials || [
        { classId: '1', items: [] },
        { classId: '2', items: [] },
        { classId: '3', items: [] },
        { classId: '4', items: [] }
      ],
      banner: data.banner || {
        title: '', // Campo para o título H1
        text: 'Bem-vindo à DevFlix!',
        buttonText: 'Saiba mais',
        backgroundColor: '#E50914',
        buttonColor: '#141414',
        buttonLink: '#',
        titleColor: '#ffffff',     // Cor do título
        textColor: '#ffffff',      // Cor do texto
        buttonTextColor: '#ffffff' // Cor do texto do botão
      },
      bannerEnabled: data.bannerEnabled !== undefined ? data.bannerEnabled : false
    };
    
    const docRef = await addDoc(devflixCollection, newInstance);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar instância DevFlix:", error);
    throw error;
  }
};

// Atualizar instância DevFlix existente
export const updateDevflixInstance = async (id, data) => {
  try {
    // Se estiver atualizando o path, verificar se já existe
    if (data.path) {
      const q = query(devflixCollection, where("path", "==", data.path));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty && snapshot.docs[0].id !== id) {
        throw new Error(`O caminho '${data.path}' já está em uso.`);
      }
    }
    
    // Adicionar timestamp de atualização
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    const docRef = doc(devflixCollection, id);
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar instância DevFlix:", error);
    throw error;
  }
};

// Excluir instância DevFlix
export const deleteDevflixInstance = async (id) => {
  try {
    const docRef = doc(devflixCollection, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Erro ao excluir instância DevFlix:", error);
    throw error;
  }
};

// Atualizar materiais de apoio de uma aula
export const updateClassMaterials = async (instanceId, classId, materials) => {
  try {
    const instance = await getDevflixById(instanceId);
    
    if (!instance) {
      throw new Error("Instância não encontrada");
    }
    
    // Verificar se já existe materiais para esta aula
    const materialIndex = instance.materials.findIndex(m => m.classId === classId);
    
    let updatedMaterials;
    
    if (materialIndex === -1) {
      // Se não existe, adicionar novo
      updatedMaterials = [...instance.materials, { classId, items: materials }];
    } else {
      // Se existe, atualizar existente
      updatedMaterials = instance.materials.map(item => 
        item.classId === classId ? { classId, items: materials } : item
      );
    }
    
    await updateDevflixInstance(instanceId, { materials: updatedMaterials });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar materiais:", error);
    throw error;
  }
};

// Atualizar informações de uma aula
export const updateClassInfo = async (instanceId, classId, classData) => {
  try {
    const instance = await getDevflixById(instanceId);
    
    if (!instance) {
      throw new Error("Instância não encontrada");
    }
    
    // Atualizar informações desta aula
    const updatedClasses = instance.classes.map(item => 
      item.id === classId ? { ...item, ...classData } : item
    );
    
    await updateDevflixInstance(instanceId, { classes: updatedClasses });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar informações da aula:", error);
    throw error;
  }
};

// Atualizar configurações do banner
export const updateBannerSettings = async (instanceId, bannerData, enabled) => {
  try {
    // Garantir que os campos de cores tenham valores padrão, se não especificados
    const updatedBannerData = {
      ...bannerData,
      title: bannerData.title || '',
      titleColor: bannerData.titleColor || '#ffffff',
      textColor: bannerData.textColor || '#ffffff',
      buttonTextColor: bannerData.buttonTextColor || '#ffffff'
    };
    
    await updateDevflixInstance(instanceId, {
      bannerEnabled: enabled !== undefined ? enabled : true,
      banner: updatedBannerData
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar banner:", error);
    throw error;
  }
};