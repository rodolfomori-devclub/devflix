// src/admin/components/DevflixCard.jsx
import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const DevflixCard = ({ instance, onSelect, isSelected }) => {
  const { updateDevflixInstance, deleteDevflixInstance } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(instance.name);
  const [path, setPath] = useState(instance.path);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSave = () => {
    // Validar o caminho
    const pathPattern = /^[a-z0-9\-]+$/;
    if (!pathPattern.test(path)) {
      alert('O caminho deve conter apenas letras minúsculas, números e hífen.');
      return;
    }

    updateDevflixInstance(instance.id, { name, path });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteDevflixInstance(instance.id);
    setShowConfirmDelete(false);
  };

  return (
    <div className={`bg-netflix-dark rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ${
      isSelected ? 'ring-2 ring-netflix-red' : ''
    }`}>
      <div className="p-5">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Nome</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
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
                  className="flex-1 bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                  placeholder="dev-xx"
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{instance.name}</h3>
                <p className="text-gray-400 mt-1">/{instance.path}</p>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors text-gray-300"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
                <button 
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-1.5 bg-gray-700 rounded-full hover:bg-red-600 transition-colors text-gray-300"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  instance.bannerEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {instance.bannerEnabled ? 'Banner Ativo' : 'Sem Banner'}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  {instance.classes.length} aulas
                </span>
              </div>
              
              <button
                onClick={() => onSelect(instance.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  isSelected 
                    ? 'bg-netflix-red text-white' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                } transition-colors`}
              >
                {isSelected ? 'Selecionado' : 'Selecionar'}
              </button>
            </div>
            
            <div className="mt-3 space-x-2">
              <a 
                href={`/${instance.path}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-gray-400 hover:text-netflix-red transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                Ver site
              </a>
            </div>
          </>
        )}
      </div>
      
      {/* Confirmação de exclusão */}
      {showConfirmDelete && (
        <div className="bg-netflix-black p-4 border-t border-gray-800">
          <p className="text-white text-sm mb-3">
            Tem certeza que deseja excluir <strong>{instance.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevflixCard;