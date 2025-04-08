// src/admin/components/DevflixEditor.jsx
import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import DevflixCard from './DevflixCard';

const DevflixEditor = () => {
  const { devflixInstances, currentDevflix, selectDevflix, addDevflixInstance } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [path, setPath] = useState('');

  const handleAddDevflix = () => {
    // Validar o caminho
    const pathPattern = /^[a-z0-9\-]+$/;
    if (!pathPattern.test(path)) {
      alert('O caminho deve conter apenas letras minúsculas, números e hífen.');
      return;
    }

    // Verificar se o caminho já existe
    if (devflixInstances.some(instance => instance.path === path)) {
      alert(`O caminho /${path} já está em uso. Por favor, escolha outro.`);
      return;
    }

    const newDevflix = {
      name,
      path,
      bannerEnabled: false,
      banner: {
        text: '',
        buttonText: '',
        backgroundColor: '#ff3f3f',
        buttonColor: '#222222',
        buttonLink: ''
      }
    };

    const newId = addDevflixInstance(newDevflix);
    selectDevflix(newId);
    
    setShowForm(false);
    setName('');
    setPath('');
  };

  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Instâncias DevFlix</h3>
        
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nova DevFlix
        </button>
      </div>
      
      {showForm && (
        <div className="mb-6 bg-netflix-black p-4 rounded-md border border-gray-700">
          <h4 className="text-white font-medium mb-4">Nova Instância DevFlix</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Nome</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: DevFlix 18"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Caminho</label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">/</span>
                <input 
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="flex-1 bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                  placeholder="dev-xx"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">Apenas letras minúsculas, números e hífen.</p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDevflix}
                className="px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors"
                disabled={!name || !path}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devflixInstances.map((instance) => (
          <DevflixCard 
            key={instance.id} 
            instance={instance} 
            onSelect={selectDevflix}
            isSelected={currentDevflix && currentDevflix.id === instance.id}
          />
        ))}
      </div>
      
      {devflixInstances.length === 0 && (
        <div className="text-center py-10">
          <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
          </svg>
          <p className="mt-4 text-gray-400">Nenhuma instância DevFlix encontrada.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors"
          >
            Criar Primeira DevFlix
          </button>
        </div>
      )}
    </div>
  );
};

export default DevflixEditor;