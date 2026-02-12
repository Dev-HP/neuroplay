import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import './App.css';

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData, token) => {
    console.log('🎯 App.js handleLogin chamado com:', userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('✅ User state atualizado:', userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            user ? (
              user.tipo === 'aluno' ? 
                <Navigate to="/aluno" /> : 
                <Navigate to="/educador" />
            ) : (
              <Navigate to="/login" />
            )
          } />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/aluno" element={
            user && user.tipo === 'aluno' ? 
              <PainelAluno user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
          } />
          <Route path="/educador" element={
            user && user.tipo === 'educador' ? 
              <PainelEducador user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
          } />
          <Route path="/jogo/mestres-sinal" element={
            user ? <JogoMestresSinal user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/jogo/cacador-alvos" element={
            user ? <JogoCacadorAlvos user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/jogo/memoria-dupla" element={
            user ? <JogoMemoriaDupla user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/jogo/cyber-runner" element={
            user ? <CyberRunner user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/jogo/cyber-runner-canvas" element={
            user ? <CyberRunnerEnhanced user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/jogo/echo-temple" element={
            user ? <EchoTemple user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/jogo/sonic-jump" element={
            user ? <SonicJump user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/jogo/gravity-lab" element={
            user ? <GravityLab user={user} /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
