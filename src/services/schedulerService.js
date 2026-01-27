/**
 * Scheduler Service - Serviço centralizado e robusto para gerenciamento de agendamentos
 * 
 * Responsabilidades:
 * - Verificação e ativação de materiais agendados
 * - Sincronização com Firebase
 * - Notificação de mudanças via EventBus
 * - Invalidação de cache quando necessário
 * - Tratamento de erros e retry logic
 */

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import eventBus, { MATERIAL_EVENTS } from './eventBus';
import cacheService from './cacheService';

class SchedulerService {
  constructor() {
    this.isChecking = false;
    this.checkInterval = null;
    this.CHECK_INTERVAL = 15000; // 15 segundos
    this.lastCheckTime = null;
    this.errorCount = 0;
    this.maxErrors = 3;
  }

  /**
   * Inicia o serviço de agendamento
   */
  start() {
    if (this.checkInterval) {
      console.log('[SchedulerService] Already running');
      return;
    }

    console.log('[SchedulerService] Starting scheduler service');
    
    // Verificar imediatamente
    this.checkScheduledItems();
    
    // Configurar verificação periódica
    this.checkInterval = setInterval(() => {
      this.checkScheduledItems();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Para o serviço de agendamento
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[SchedulerService] Stopped');
    }
  }

  /**
   * Verifica e ativa todos os itens agendados
   */
  async checkScheduledItems() {
    // Evitar verificações simultâneas
    if (this.isChecking) {
      console.log('[SchedulerService] Check already in progress, skipping...');
      return;
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      console.log('[SchedulerService] Checking scheduled items...');
      
      const results = await this.processAllScheduledItems();
      
      // Log resultados
      const duration = Date.now() - startTime;
      console.log(`[SchedulerService] Check completed in ${duration}ms`, results);
      
      // Resetar contador de erros em caso de sucesso
      this.errorCount = 0;
      this.lastCheckTime = new Date();
      
      // Emitir evento se houve mudanças
      if (results.itemsActivated > 0) {
        eventBus.emit(MATERIAL_EVENTS.SCHEDULE_CHECK_COMPLETED, {
          hasChanges: true,
          itemsActivated: results.itemsActivated,
          types: results.activatedTypes
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('[SchedulerService] Error checking scheduled items:', error);
      
      this.errorCount++;
      
      // Se muitos erros consecutivos, parar o serviço temporariamente
      if (this.errorCount >= this.maxErrors) {
        console.error('[SchedulerService] Too many errors, pausing service for 1 minute');
        this.stop();
        
        // Reiniciar após 1 minuto
        setTimeout(() => {
          this.errorCount = 0;
          this.start();
        }, 60000);
      }
      
      throw error;
      
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Processa todos os itens agendados de todas as instâncias
   */
  async processAllScheduledItems() {
    const now = new Date();
    const results = {
      itemsActivated: 0,
      activatedTypes: [],
      processedInstances: 0,
      errors: []
    };

    try {
      // Buscar todas as instâncias DevFlix
      const devflixCollection = collection(db, 'devflix-instances');
      const snapshot = await getDocs(devflixCollection);
      
      if (snapshot.empty) {
        console.log('[SchedulerService] No instances found');
        return results;
      }

      const instances = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));

      console.log(`[SchedulerService] Processing ${instances.length} instances`);

      // Processar cada instância
      for (const instance of instances) {
        try {
          const instanceResults = await this.processInstance(instance, now);
          
          if (instanceResults.hasChanges) {
            results.itemsActivated += instanceResults.itemsActivated;
            results.activatedTypes = [...new Set([...results.activatedTypes, ...instanceResults.types])];
            
            // Invalidar cache da instância
            cacheService.invalidate(`devflix-${instance.path}`);
            
            // Emitir evento específico da instância
            eventBus.emit(MATERIAL_EVENTS.MATERIALS_SYNCED, {
              path: instance.path,
              itemsActivated: instanceResults.itemsActivated
            });
          }
          
          results.processedInstances++;
          
        } catch (error) {
          console.error(`[SchedulerService] Error processing instance ${instance.id}:`, error);
          results.errors.push({
            instanceId: instance.id,
            error: error.message
          });
        }
      }

    } catch (error) {
      console.error('[SchedulerService] Fatal error in processAllScheduledItems:', error);
      throw error;
    }

    return results;
  }

  /**
   * Processa uma instância específica
   */
  async processInstance(instance, now) {
    const results = {
      hasChanges: false,
      itemsActivated: 0,
      types: []
    };

    const updates = {};

    // 1. Verificar banner
    if (this.shouldActivateBanner(instance, now)) {
      updates.bannerEnabled = true;
      updates.banner = {
        ...instance.banner,
        scheduledVisibility: null
      };
      results.itemsActivated++;
      results.types.push('banner');
      results.hasChanges = true;
      
      console.log(`[SchedulerService] Activating banner for: ${instance.name}`);
    }

    // 2. Verificar materiais
    const materialsResult = this.processInstanceMaterials(instance, now);
    if (materialsResult.hasChanges) {
      updates.materials = materialsResult.materials;
      results.itemsActivated += materialsResult.count;
      results.types.push('material');
      results.hasChanges = true;
    }

    // 3. Verificar links do cabeçalho
    const linksResult = this.processInstanceLinks(instance, now);
    if (linksResult.hasChanges) {
      updates.headerLinks = linksResult.links;
      results.itemsActivated += linksResult.count;
      results.types.push('link');
      results.hasChanges = true;
    }

    // Aplicar atualizações se houver mudanças
    if (results.hasChanges) {
      await this.updateInstance(instance.id, updates);
    }

    return results;
  }

  /**
   * Verifica se o banner deve ser ativado
   */
  shouldActivateBanner(instance, now) {
    if (instance.bannerEnabled || !instance.banner?.scheduledVisibility) {
      return false;
    }

    const visibilityTime = this.parseTimestamp(instance.banner.scheduledVisibility);
    if (!visibilityTime) return false;

    return visibilityTime <= now;
  }

  /**
   * Processa materiais de uma instância
   */
  processInstanceMaterials(instance, now) {
    const result = {
      hasChanges: false,
      materials: [...(instance.materials || [])],
      count: 0
    };

    if (!instance.materials || instance.materials.length === 0) {
      return result;
    }

    for (let i = 0; i < result.materials.length; i++) {
      const classMaterials = result.materials[i];
      
      if (!classMaterials?.items || classMaterials.items.length === 0) {
        continue;
      }

      const updatedItems = classMaterials.items.map(item => {
        // Se já foi desbloqueado anteriormente, garantir que permanece desbloqueado
        if (item.unlockedAt && item.locked) {
          console.log(`[SchedulerService] Fixing re-locked material: ${item.title}`);
          result.count++;
          result.hasChanges = true;
          return { 
            ...item, 
            locked: false, 
            scheduledUnlock: null
          };
        }
        
        // Verificar se deve ser desbloqueado agora
        if (this.shouldUnlockMaterial(item, now)) {
          console.log(`[SchedulerService] Unlocking material: ${item.title}`);
          result.count++;
          result.hasChanges = true;
          
          // Desbloquear e limpar agendamento
          return { 
            ...item, 
            locked: false, 
            scheduledUnlock: null,
            unlockedAt: now.toISOString() // Adicionar timestamp de desbloqueio
          };
        }
        
        // Manter item como está
        return item;
      });

      if (JSON.stringify(updatedItems) !== JSON.stringify(classMaterials.items)) {
        result.materials[i] = { ...classMaterials, items: updatedItems };
      }
    }

    return result;
  }

  /**
   * Converte um timestamp do Firestore ou string ISO para Date
   */
  parseTimestamp(timestamp) {
    if (!timestamp) return null;

    // Se for um Firestore Timestamp (tem seconds e nanoseconds)
    if (timestamp.seconds !== undefined) {
      return new Date(timestamp.seconds * 1000);
    }

    // Se for um objeto com método toDate (Firestore Timestamp)
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }

    // Se for string ISO ou número
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.warn('[SchedulerService] Invalid timestamp:', timestamp);
      return null;
    }

    return date;
  }

  /**
   * Verifica se um material deve ser desbloqueado
   */
  shouldUnlockMaterial(item, now) {
    // Se já está desbloqueado, não fazer nada
    if (!item.locked) {
      return false;
    }

    // Se já foi desbloqueado anteriormente (tem timestamp), manter desbloqueado
    if (item.unlockedAt) {
      return false;
    }

    // Se não tem agendamento, manter bloqueado
    if (!item.scheduledUnlock) {
      return false;
    }

    const unlockTime = this.parseTimestamp(item.scheduledUnlock);
    if (!unlockTime) {
      console.warn('[SchedulerService] Could not parse scheduledUnlock:', item.scheduledUnlock);
      return false;
    }

    console.log(`[SchedulerService] Checking material "${item.title}": unlock at ${unlockTime.toISOString()}, now is ${now.toISOString()}, should unlock: ${unlockTime <= now}`);

    return unlockTime <= now;
  }

  /**
   * Processa links do cabeçalho de uma instância
   */
  processInstanceLinks(instance, now) {
    const result = {
      hasChanges: false,
      links: [...(instance.headerLinks || [])],
      count: 0
    };

    if (!instance.headerLinks || instance.headerLinks.length === 0) {
      return result;
    }

    const updatedLinks = result.links.map(link => {
      if (this.shouldActivateLink(link, now)) {
        console.log(`[SchedulerService] Activating link: ${link.title}`);
        result.count++;
        result.hasChanges = true;
        
        // Tornar visível e limpar agendamento
        return { 
          ...link, 
          visible: true, 
          scheduledVisibility: null,
          activatedAt: now.toISOString() // Adicionar timestamp de ativação
        };
      }
      return link;
    });

    if (result.hasChanges) {
      result.links = updatedLinks;
    }

    return result;
  }

  /**
   * Verifica se um link deve ser ativado
   */
  shouldActivateLink(link, now) {
    if (link.visible || !link.scheduledVisibility) {
      return false;
    }

    const visibilityTime = this.parseTimestamp(link.scheduledVisibility);
    if (!visibilityTime) return false;

    return visibilityTime <= now;
  }

  /**
   * Atualiza uma instância no Firebase
   */
  async updateInstance(instanceId, updates) {
    try {
      const instanceRef = doc(db, 'devflix-instances', instanceId);
      await updateDoc(instanceRef, {
        ...updates,
        lastSchedulerUpdate: Timestamp.now()
      });
      
      console.log(`[SchedulerService] Instance ${instanceId} updated successfully`);
      
    } catch (error) {
      console.error(`[SchedulerService] Error updating instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Força verificação manual
   */
  async forceCheck() {
    console.log('[SchedulerService] Force check requested');
    return await this.checkScheduledItems();
  }

  /**
   * Obtém status do serviço
   */
  getStatus() {
    return {
      isRunning: !!this.checkInterval,
      isChecking: this.isChecking,
      lastCheckTime: this.lastCheckTime,
      errorCount: this.errorCount,
      checkInterval: this.CHECK_INTERVAL
    };
  }
}

// Criar instância única (Singleton)
const schedulerService = new SchedulerService();

// Exportar serviço
export default schedulerService;

// Exportar função legada para compatibilidade
export const checkAndActivateScheduledItems = () => schedulerService.checkScheduledItems();