// src/firebase/firebaseService.js
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
    where 
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
      if (!path) {
        // Se não houver caminho, retorne a primeira instância
        const instances = await getAllDevflixInstances();
        return instances.length > 0 ? instances[0] : null;
      }
      
      const q = query(devflixCollection, where("path", "==", path));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      } else {
        // Se não encontrar, retorne a primeira instância como fallback
        const instances = await getAllDevflixInstances();
        return instances.length > 0 ? instances[0] : null;
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
      
      const docRef = await addDoc(devflixCollection, data);
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
      
      const docRef = doc(devflixCollection, id);
      await updateDoc(docRef, data);
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
      
      // Atualizar a seção de materiais desta aula
      const updatedMaterials = instance.materials.map(item => 
        item.classId === classId ? { classId, items: materials } : item
      );
      
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
      await updateDevflixInstance(instanceId, {
        bannerEnabled: enabled,
        banner: bannerData
      });
      return true;
    } catch (error) {
      console.error("Erro ao atualizar banner:", error);
      throw error;
    }
  };