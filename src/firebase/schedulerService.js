// src/firebase/schedulerService.js
import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc,
    query,
    where,
    Timestamp
  } from 'firebase/firestore';
  import { db } from './config';
  
  /**
   * Verifica e ativa todos os itens agendados em todas as instâncias DevFlix
   * Esta função centraliza a lógica de ativação para banners, materiais e links
   * em um único local, garantindo que todos sejam processados mesmo quando 
   * o usuário não está na tela específica.
   */
  export const checkAndActivateScheduledItems = async () => {
    try {
      const now = new Date();
      const results = {
        itemsActivated: 0,
        activatedTypes: []
      };
      
      // Buscar todas as instâncias DevFlix
      const devflixCollection = collection(db, 'devflix-instances');
      const snapshot = await getDocs(devflixCollection);
      const instances = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));
      
      // Para cada instância, verificar agendamentos
      for (const instance of instances) {
        const updates = {};
        let hasChanges = false;
        
        // 1. Verificar banner
        if (
          !instance.bannerEnabled && 
          instance.banner?.scheduledVisibility && 
          new Date(instance.banner.scheduledVisibility) <= now
        ) {
          // Ativar o banner e limpar agendamento
          updates.bannerEnabled = true;
          updates.banner = {
            ...instance.banner,
            scheduledVisibility: null
          };
          hasChanges = true;
          results.itemsActivated++;
          if (!results.activatedTypes.includes('banner')) {
            results.activatedTypes.push('banner');
          }
          console.log(`Ativando banner para instância: ${instance.name} (${instance.id})`);
        }
        
        // 2. Verificar materiais
        if (instance.materials && instance.materials.length > 0) {
          const updatedMaterials = [...instance.materials];
          let materialChanges = false;
          
          // Para cada classe da instância
          for (let i = 0; i < updatedMaterials.length; i++) {
            const classMaterials = updatedMaterials[i];
            
            if (classMaterials && classMaterials.items && classMaterials.items.length > 0) {
              let itemChanges = false;
              const updatedItems = classMaterials.items.map(item => {
                // Se o material está trancado, tem agendamento e o horário já passou
                if (
                  item.locked && 
                  item.scheduledUnlock && 
                  new Date(item.scheduledUnlock) <= now
                ) {
                  results.itemsActivated++;
                  if (!results.activatedTypes.includes('material')) {
                    results.activatedTypes.push('material');
                  }
                  console.log(`Desbloqueando material: ${item.title} (${item.id})`);
                  
                  // Desbloquear o material e limpar agendamento
                  return { ...item, locked: false, scheduledUnlock: null };
                }
                return item;
              });
              
              // Verificar se houve mudanças nos itens
              if (JSON.stringify(updatedItems) !== JSON.stringify(classMaterials.items)) {
                updatedMaterials[i] = { ...classMaterials, items: updatedItems };
                materialChanges = true;
                itemChanges = true;
              }
            }
          }
          
          // Se houve mudanças nos materiais, atualizar a instância
          if (materialChanges) {
            updates.materials = updatedMaterials;
            hasChanges = true;
          }
        }
        
        // 3. Verificar links do cabeçalho
        if (instance.headerLinks && instance.headerLinks.length > 0) {
          const updatedLinks = instance.headerLinks.map(link => {
            // Se o link está invisível, tem agendamento e o horário já passou
            if (
              !link.visible && 
              link.scheduledVisibility && 
              new Date(link.scheduledVisibility) <= now
            ) {
              results.itemsActivated++;
              if (!results.activatedTypes.includes('link')) {
                results.activatedTypes.push('link');
              }
              console.log(`Ativando link: ${link.title} (${link.id})`);
              
              // Tornar o link visível e limpar agendamento
              return { ...link, visible: true, scheduledVisibility: null };
            }
            return link;
          });
          
          // Verificar se houve mudanças nos links
          if (JSON.stringify(updatedLinks) !== JSON.stringify(instance.headerLinks)) {
            updates.headerLinks = updatedLinks;
            hasChanges = true;
          }
        }
        
        // Se houve alguma mudança, atualizar a instância no Firebase
        if (hasChanges) {
          const instanceRef = doc(devflixCollection, instance.id);
          await updateDoc(instanceRef, updates);
          console.log(`Atualização realizada na instância ${instance.name} (${instance.id})`);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Erro ao verificar e ativar itens agendados:', error);
      throw error;
    }
  };