import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';
import './Login.css';

function Login({ onLogin }) {
  console.log('🔌 Login component - onLogin prop:', typeof onLogin);
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    tipo: 'aluno'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('🔐 Tentando login com:', formData.email);

    // Modo demonstração - credenciais de teste
    const demoUsers = {
      'aluno@demo.com': { senha: 'demo123', tipo: 'aluno', nome: 'Aluno Demo' },
      'educador@demo.com': { senha: 'demo123', tipo: 'educador', nome: 'Educador Demo' }
    };

    if (!isRegister) {
      // Login com credenciais demo
      const user = demoUsers[formData.email];
      console.log('👤 Usuário encontrado:', user);
      
      if (user && user.senha === formData.senha) {
        console.log('✅ Login bem-sucedido!');
        onLogin(
          { id: 1, nome: user.nome, email: formData.email, tipo: user.tipo },
          'demo-token-123'
        );
        // Redirecionar após login
        setTimeout(() => {
          navigate(user.tipo === 'aluno' ? '/aluno' : '/educador');
        }, 100);
        return;
      } else {
        console.log('❌ Credenciais inválidas');
        setError('Email ou senha incorretos. Use: aluno@demo.com ou educador@demo.com (senha: demo123)');
        return;
      }
    }

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);

      if (isRegister) {
        setIsRegister(false);
        alert('Cadastro realizado com sucesso! Faça login.');
      } else {
        onLogin(response.data.usuario, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao conectar ao servidor. Use as credenciais demo: aluno@demo.com ou educador@demo.com (senha: demo123)');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="logo-wrapper">
            <Logo size="large" showText={false} animated={true} />
          </div>
          <h1>NeuroPlay</h1>
          <p>Bem-vindo(a) ao NeuroPlay!</p>
          <div className="demo-credentials">
            <small>
              <strong>Modo Demo:</strong><br/>
              Aluno: aluno@demo.com<br/>
              Educador: educador@demo.com<br/>
              Senha: demo123
            </small>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Senha"
              value={formData.senha}
              onChange={(e) => setFormData({...formData, senha: e.target.value})}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group tipo-selector">
              <button
                type="button"
                className={`tipo-btn ${formData.tipo === 'educador' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, tipo: 'educador'})}
              >
                Sou Educador
              </button>
              <button
                type="button"
                className={`tipo-btn ${formData.tipo === 'aluno' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, tipo: 'aluno'})}
              >
                Sou Aluno
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full">
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </button>

          <div className="toggle-form">
            {isRegister ? 'Já tem conta?' : 'Não tem conta ainda?'}
            <button
              type="button"
              className="link-btn"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Fazer login' : 'Cadastre-se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
