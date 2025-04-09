// src/admin/components/AdminSidebar.jsx (atualizado com nova rota)
import { NavLink } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

const AdminSidebar = () => {
  const { currentDevflix } = useAdmin();

  // Lista de navegação
  const navItems = [
    { 
      path: '/admin/dev', 
      label: 'Painel Principal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      )
    },
    { 
      path: '/admin/dev/materials', 
      label: 'Materiais de Apoio',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      )
    },
    { 
      path: '/admin/dev/header', 
      label: 'Menu Principal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
        </svg>
      )
    },
    { 
      path: '/admin/dev/settings', 
      label: 'Configurações',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      )
    }
  ];

  return (
    <aside className="w-64 bg-netflix-dark h-screen fixed left-0 top-0 pt-16 pb-4 overflow-y-auto">
      <div className="px-4 py-6">
        <h2 className="text-white font-medium text-lg mb-1">
          {currentDevflix ? currentDevflix.name : 'Sem instância selecionada'}
        </h2>
        <p className="text-gray-400 text-sm">
          {currentDevflix ? `/${currentDevflix.path}` : 'Selecione uma instância'}
        </p>
        
        {/* Mostrar badge de status de publicação */}
        {currentDevflix && currentDevflix.isPublished === false && (
          <span className="mt-2 inline-block px-2 py-1 bg-red-900/50 border border-red-600 rounded-full text-xs text-red-400">
            Não publicado
          </span>
        )}
      </div>
      
      <nav className="mt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-1 px-2">
              <NavLink
                to={item.path}
                end={item.path === '/admin/dev'}
                className={({ isActive }) => 
                  `flex items-center px-3 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-netflix-red text-white' 
                      : 'text-gray-300 hover:bg-netflix-black hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="px-4 mt-8 pt-8 border-t border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Links Rápidos
        </h3>
        <ul className="space-y-2">
          {currentDevflix && (
            <li>
              <a 
                href={`/${currentDevflix.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-netflix-red transition-colors flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                Ver DevFlix
              </a>
            </li>
          )}
          <li>
            <a 
              href={`/${currentDevflix?.path}/materiais`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-netflix-red transition-colors flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Materiais
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default AdminSidebar;