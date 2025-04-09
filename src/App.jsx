// src/App.jsx (updated with error routes)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Materiais from './pages/Materiais';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';
import ErrorPage from './pages/ErrorPage';
import ErrorPageStandalone from './pages/ErrorPageStandalone';
import ErrorRouteHandler from './pages/ErrorRouteHandler';

// Componentes de Admin
import AdminLayout from './admin/components/AdminLayout';
import AdminHome from './admin/pages/AdminHome';
import AdminMaterials from './admin/pages/AdminMaterials';
import AdminHeaderSettings from './admin/pages/AdminHeaderSettings';
import AdminSettings from './admin/pages/AdminSettings';
import Login from './admin/pages/Login';
import ProtectedRoute from './admin/components/ProtectedRoute';

// Provedores de Contexto
import { AdminProvider } from './admin/contexts/AdminContext';
import { DevflixProvider } from './contexts/DevflixContext';
import { AuthProvider } from './contexts/AuthContext';
import SchedulerChecker from './components/SchedulerChecker';

// Componente para simular páginas de aula individuais
const AulaPage = ({ match }) => {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-netflix-black">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8">Aula {match.params.id}</h1>
        <div className="aspect-video w-full max-w-4xl mx-auto bg-netflix-dark rounded-lg flex items-center justify-center">
          <p className="text-xl text-gray-400">Vídeo da Aula {match.params.id}</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulação de carregamento de recursos
  useEffect(() => {
    // Simulando o tempo de carregamento dos recursos
    console.log('Carregando recursos...');
    
    // Verificar se as imagens existem e estão acessíveis
    const preloadImages = async () => {
      try {
        // Verificar a imagem do instrutor
        const instructorImg = new Image();
        instructorImg.src = '/images/instructor.png';
        
        // Verificar imagens das aulas
        for (let i = 1; i <= 4; i++) {
          const img = new Image();
          img.src = `/images/aula${i}.jpg`;
        }
        
        console.log('Imagens pré-carregadas com sucesso!');
      } catch (error) {
        console.warn('Algumas imagens podem não estar disponíveis:', error);
      }
    };
    
    preloadImages();
    
    // Aqui você pode adicionar lógica para carregar ou pré-carregar recursos
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      console.log('Recursos carregados!');
    }, 2500);
    
    return () => clearTimeout(loadingTimer);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          {/* Adicionar verificador de agendamentos */}
          <SchedulerChecker />
          
          <Routes>
            {/* Rota raiz - redireciona para página de erro standalone */}
            <Route path="/" element={<ErrorPageStandalone message="Selecione uma DevFlix específica" code="404" />} />
            
            {/* Nova rota para lidar com erros dinamicamente */}
            <Route path="/error" element={<ErrorRouteHandler />} />
            
            {/* Rota de Login */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* Rotas de Admin Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dev" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />
                <Route path="materials" element={<AdminMaterials />} />
                <Route path="header" element={<AdminHeaderSettings />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
            
            {/* Rotas específicas para cada DevFlix */}
            <Route path="/:path" element={
              isLoading ? (
                <Loading />
              ) : (
                <DevflixProvider>
                  <Navbar />
                  <main className="flex-grow">
                    <Home />
                  </main>
                  <Footer />
                </DevflixProvider>
              )
            } />
            
            {/* Rotas de materiais - sempre seguem o caminho da home */}
            <Route path="/:path/materiais" element={
              <DevflixProvider>
                <Navbar />
                <main className="flex-grow">
                  <Materiais />
                </main>
                <Footer />
              </DevflixProvider>
            } />
            
            {/* Rotas de aulas */}
            <Route path="/:path/aula/:id" element={
              <DevflixProvider>
                <Navbar />
                <AulaPage match={{ params: { id: window.location.pathname.split('/').pop() } }} />
                <Footer />
              </DevflixProvider>
            } />
            
            {/* Rota para redirecionar caminhos não encontrados */}
            <Route path="*" element={<ErrorPageStandalone message="Página não encontrada" code="404" />} />
          </Routes>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;