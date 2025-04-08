// src/App.jsx (atualizado com Firebase e autenticação)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Materiais from './pages/Materiais';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';

// Componentes de Admin
import AdminLayout from './admin/components/AdminLayout';
import AdminHome from './admin/pages/AdminHome';
import AdminMaterials from './admin/pages/AdminMaterials';
import AdminSettings from './admin/pages/AdminSettings';
import Login from './admin/pages/Login';
import ProtectedRoute from './admin/components/ProtectedRoute';

// Provedores de Contexto
import { AdminProvider } from './admin/contexts/AdminContext';
import { DevflixProvider } from './contexts/DevflixContext';
import { AuthProvider } from './contexts/AuthContext';

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
          <Routes>
            {/* Rota de Login */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* Rotas de Admin Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dev" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />
                <Route path="materials" element={<AdminMaterials />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
            
            {/* Rotas Públicas */}
            <Route path="/" element={
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
            
            <Route path="/:path" element={
              <DevflixProvider>
                <Navbar />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </DevflixProvider>
            } />
            
            <Route path="/materiais" element={
              <DevflixProvider>
                <Navbar />
                <main className="flex-grow">
                  <Materiais />
                </main>
                <Footer />
              </DevflixProvider>
            } />
            
            <Route path="/:path/materiais" element={
              <DevflixProvider>
                <Navbar />
                <main className="flex-grow">
                  <Materiais />
                </main>
                <Footer />
              </DevflixProvider>
            } />
            
            <Route path="/aula/:id" element={
              <DevflixProvider>
                <Navbar />
                <AulaPage match={{ params: { id: window.location.pathname.split('/').pop() } }} />
                <Footer />
              </DevflixProvider>
            } />
            
            <Route path="/:path/aula/:id" element={
              <DevflixProvider>
                <Navbar />
                <AulaPage match={{ params: { id: window.location.pathname.split('/').pop() } }} />
                <Footer />
              </DevflixProvider>
            } />
            
            {/* Rota para redirecionar caminhos não encontrados */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;