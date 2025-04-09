// src/admin/components/ScheduledUnlockField.jsx (correção final timezone)
import { useState, useEffect } from 'react';

const ScheduledUnlockField = ({ scheduledUnlock, onChange }) => {
  const [enableSchedule, setEnableSchedule] = useState(!!scheduledUnlock);
  const [scheduleDate, setScheduleDate] = useState('');
  
  // CORREÇÃO: Função para verificar se um timestamp é válido
  const isValidTimestamp = (timestamp) => {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  };
  
  // CORREÇÃO: Função para converter timestamp em formato de datetime local
  const formatToLocalDateTime = (timestamp) => {
    if (!isValidTimestamp(timestamp)) return '';
    
    const date = new Date(timestamp);
    
    // Formatar manualmente para evitar problemas com timezones
    return `${date.getFullYear()}-${
      String(date.getMonth() + 1).padStart(2, '0')}-${
      String(date.getDate()).padStart(2, '0')}T${
      String(date.getHours()).padStart(2, '0')}:${
      String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  // Inicializar data quando o componente montar ou quando o scheduledUnlock mudar
  useEffect(() => {
    setEnableSchedule(!!scheduledUnlock);
    
    // CORREÇÃO: Converter timestamp para datetime local apenas se for válido
    if (isValidTimestamp(scheduledUnlock)) {
      setScheduleDate(formatToLocalDateTime(scheduledUnlock));
      console.log('Scheduled date set to:', formatToLocalDateTime(scheduledUnlock));
    } else {
      setScheduleDate('');
    }
  }, [scheduledUnlock]);
  
  const handleToggle = (e) => {
    const isEnabled = e.target.checked;
    setEnableSchedule(isEnabled);
    
    if (isEnabled && scheduleDate) {
      // CORREÇÃO: Verificar se a data é válida antes de converter para ISO
      const selectedDate = new Date(scheduleDate);
      if (!isNaN(selectedDate.getTime())) {
        onChange(selectedDate.toISOString());
        console.log('Toggle schedule enabled with date:', selectedDate.toISOString());
      } else {
        onChange(null);
      }
    } else {
      onChange(null);
      console.log('Toggle schedule disabled');
    }
  };
  
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setScheduleDate(newDate);
    
    if (enableSchedule && newDate) {
      // CORREÇÃO: Garantir que a data selecionada seja interpretada corretamente
      const selectedDate = new Date(newDate);
      
      if (!isNaN(selectedDate.getTime())) {
        onChange(selectedDate.toISOString());
        console.log('Date changed to:', selectedDate.toISOString());
      } else {
        onChange(null);
        console.warn('Invalid date selected');
      }
    } else {
      onChange(null);
    }
  };
  
  // CORREÇÃO: Calcular o valor mínimo permitido (agora + 1 minuto, não 3 horas)
  const getMinDatetime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Adicionar 1 minuto ao invés de 3 horas
    
    // Formatar manualmente para evitar problemas com timezones
    return `${now.getFullYear()}-${
      String(now.getMonth() + 1).padStart(2, '0')}-${
      String(now.getDate()).padStart(2, '0')}T${
      String(now.getHours()).padStart(2, '0')}:${
      String(now.getMinutes()).padStart(2, '0')}`;
  };
  
  // CORREÇÃO: Exibir informações de debugging para entender melhor possíveis problemas
  console.log("Schedule field state:", {
    enableSchedule,
    scheduleDate,
    originalTimestamp: scheduledUnlock,
    minTimestamp: getMinDatetime()
  });
  
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enableSchedule}
            onChange={handleToggle}
          />
          <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-netflix-red peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-netflix-red">
            <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${enableSchedule ? 'right-1' : 'left-1'}`}></div>
          </div>
          <span className="ml-3 text-white text-sm">
            Programar liberação automática
          </span>
        </label>
      </div>
      
      {enableSchedule && (
        <div>
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={handleDateChange}
            min={getMinDatetime()}
            className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            O conteúdo será liberado automaticamente na data e hora programadas.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduledUnlockField;