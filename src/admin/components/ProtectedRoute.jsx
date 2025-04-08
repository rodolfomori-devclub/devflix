// src/admin/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Enquanto estiver verificando a autenticação, mostra um loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Se estiver autenticado, renderiza o conteúdo da rota
  return <Outlet />;
};

export default ProtectedRoute;