// src/admin/pages/AdminSettings.jsx
import { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const AdminSettings = () => {
  const { isLoading, currentDevflix, updateDevflixInstance } = useAdmin();
  const [baseUrl, setBaseUrl] = useState('');
  
  useEffect(() => {
    // Determinar a URL base do site
    const url = window.location.origin;
    setBaseUrl(url);
  }, []);
  
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
  
  const clearStoredData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados armazenados? Esta ação não pode ser desfeita.')) {
      // Em um ambiente real, aqui faria uma requisição para limpar os dados no servidor
      alert('Funcionalidade ainda não implementada.');
    }
  };
  
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-white mb-6">Configurações</h2>
      
      <div className="space-y-8">
        {/* Links e URLs */}
        <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-white mb-4">Links e URLs</h3>
          
          {currentDevflix ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">URL da Página Principal</label>
                <div className="flex">
                  <input 
                    type="text"
                    value={`${baseUrl}/${currentDevflix.path}`}
                    readOnly
                    className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${baseUrl}/${currentDevflix.path}`)}
                    className="ml-2 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    title="Copiar URL"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">URL da Página de Materiais</label>
                <div className="flex">
                  <input 
                    type="text"
                    value={`${baseUrl}/${currentDevflix.path}/materiais`}
                    readOnly
                    className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${baseUrl}/${currentDevflix.path}/materiais`)}
                    className="ml-2 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    title="Copiar URL"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Selecione uma instância da DevFlix para ver as URLs.</p>
          )}
        </div>
        
        {/* Dados e Cache */}
        <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-white mb-4">Dados e Cache</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 mb-2">
                Limpar todos os dados armazenados. Esta ação irá redefinir todas as configurações e instâncias.
              </p>
              <button
                onClick={clearStoredData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Limpar Todos os Dados
              </button>
            </div>
          </div>
        </div>
        
        {/* Informações */}
        <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-white mb-4">Informações</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Versão:</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total de instâncias:</span>
              <span className="text-white">{isLoading ? '...' : '2'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;