// src/admin/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { login, isAuthenticated, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Se já estiver autenticado, redirecionar para o painel admin
  if (isAuthenticated()) {
    return <Navigate to="/admin/dev" replace />;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      await login(email, password);
      navigate('/admin/dev');
    } catch (err) {
      setError(err.message || 'Falha ao fazer login.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-netflix-dark p-8 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-netflix-red">DEV</span>
            <span className="text-white">FLIX</span>
            <span className="text-white text-xl ml-2">ADMIN</span>
          </h1>
          <p className="mt-2 text-gray-400">Faça login para acessar o painel administrativo</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {(error || authError) && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm">
              {error || authError}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Endereço de E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-netflix-black text-white focus:outline-none focus:ring-netflix-red focus:border-netflix-red sm:text-sm"
              placeholder="admin@exemplo.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-netflix-black text-white focus:outline-none focus:ring-netflix-red focus:border-netflix-red sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-netflix-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-netflix-red transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Para obter acesso, entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;