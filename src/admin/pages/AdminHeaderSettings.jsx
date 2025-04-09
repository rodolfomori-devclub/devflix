// src/admin/pages/AdminHeaderSettings.jsx
import { useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import HeaderLinksEditor from '../components/HeaderLinksEditor';

const AdminHeaderSettings = () => {
  const { isLoading, currentDevflix } = useAdmin();
  
  // Efeito para scroll para o topo ao montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Configurações do Cabeçalho</h2>
        
        {currentDevflix && (
          <div className="text-gray-400 text-sm">
            Gerenciando: <span className="text-white font-medium">{currentDevflix.name}</span>
          </div>
        )}
      </div>
      
      <HeaderLinksEditor />
    </div>
  );
};

export default AdminHeaderSettings;