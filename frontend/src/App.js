import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import PainelAluno from './pages/PainelAluno';
import PainelEducador from './pages/PainelEducador';
import JogoMestresSinal from './pages/JogoMestresSinal';
import JogoCacadorAlvos from './pages/JogoCacadorAlvos';
import JogoMemoriaDupla from './pages/JogoMemoriaDupla';
import CyberRunner from './games/CyberRunner/CyberRunner';
import CyberRunnerCanvas from './games/CyberRunnerCanvas/CyberRunnerCanvas';
import CyberRunnerEnhanced from './games/CyberRunnerCanvas/CyberRunnerEnhanced';
import EchoTemple from './games/EchoTemple/EchoTemple';
import SonicJump from './games/SonicJump/SonicJump';
import GravityLab from './games/GravityLab/GravityLab';
import { apiUrl, isApiConfigured } from './shared/config/api';
import './App.css';

function App() {
  const basename = window.location.pathname.startsWith('/neuroplay') ? '/neuroplay' : '';
  const [user, setUser] = React.useState(null);
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const storedUser = sessionStorage.getItem('user');
      const storedToken = sessionStorage.getItem('token');

      if (storedUser && storedToken) {
        try {
          if (active) setUser(JSON.parse(storedUser));
        } catch (_error) {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
        }
      }

      if (isApiConfigured()) {
        try {
          const response = await axios.post(apiUrl('/api/v1/auth/refresh'), {}, { withCredentials: true });
          if (active && response.data?.token && response.data?.usuario) {
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data.usuario));
            setUser(response.data.usuario);
          }
        } catch (_error) {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
          if (active) setUser(null);
        }
      }

      if (active) setIsBootstrapping(false);
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = (userData, token) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem('token');
    try {
      if (token && isApiConfigured()) {
        await axios.post(
          apiUrl('/api/v1/auth/logout'),
          {},
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
      }
    } catch (_error) {
      // A sessão local deve ser removida mesmo quando a rede estiver indisponível.
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
    }
  };

  if (isBootstrapping) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        Restaurando sua sessão segura…
      </div>
    );
  }

  const isAdult = user && ['educador', 'owner', 'admin', 'responsavel'].includes(user.tipo || user.role);

  return (
    <Router basename={basename}>
      <div className="App">
        <Routes>
          <Route path="/" element={user ? <Navigate to={isAdult ? '/educador' : '/aluno'} replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/aluno" element={user ? <PainelAluno user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
          <Route path="/educador" element={isAdult ? <PainelEducador user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
          <Route path="/jogo/mestres-sinal" element={user ? <JogoMestresSinal user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/jogo/cacador-alvos" element={user ? <JogoCacadorAlvos user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/jogo/memoria-dupla" element={user ? <JogoMemoriaDupla user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/jogo/cyber-runner" element={user ? <CyberRunner user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/jogo/cyber-runner-canvas" element={user ? <CyberRunnerEnhanced user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/jogo/echo-temple" element={user ? <EchoTemple user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/jogo/sonic-jump" element={user ? <SonicJump user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/jogo/gravity-lab" element={user ? <GravityLab user={user} /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
