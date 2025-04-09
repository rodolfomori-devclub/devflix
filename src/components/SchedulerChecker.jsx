// src/components/SchedulerChecker.jsx
import { useEffect, useState } from 'react';
import { 
  checkAndActivateScheduledItems 
} from '../firebase/schedulerService';

/**
 * Componente global para verificar e processar agendamentos de banners e materiais
 * Este componente roda em background para assegurar que todos os conteúdos
 * agendados sejam ativados no horário correto, mesmo que o usuário não esteja
 * na página de edição.
 */
const SchedulerChecker = () => {
  const [lastCheckTime, setLastCheckTime] = useState(null);
  
  useEffect(() => {
    // Função para verificar todos os agendamentos em todo o banco
    const checkAllSchedules = async () => {
      try {
        const now = new Date();
        console.log(`[SchedulerChecker] Verificando agendamentos: ${now.toLocaleString()}`);
        
        // Chamar o serviço para verificar e ativar itens agendados
        const result = await checkAndActivateScheduledItems();
        
        if (result.itemsActivated > 0) {
          console.log(`[SchedulerChecker] ${result.itemsActivated} itens ativados: ${
            result.activatedTypes.join(', ')
          }`);
        }
        
        setLastCheckTime(now);
      } catch (error) {
        console.error("[SchedulerChecker] Erro ao verificar agendamentos:", error);
      }
    };
    
    // Verificar imediatamente ao montar o componente
    checkAllSchedules();
    
    // Configurar verificação periódica a cada 15 segundos
    const intervalId = setInterval(checkAllSchedules, 15000);
    
    // Limpar intervalo ao desmontar
    return () => clearInterval(intervalId);
  }, []);
  
  // Este componente não renderiza nada visível
  return null;
};

export default SchedulerChecker;