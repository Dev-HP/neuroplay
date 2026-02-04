import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ onLogin }) {
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
      setError(err.response?.data?.message || 'Erro ao processar requisição');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="logo-icon">🧠</div>
          <h1>NeuroPlay</h1>
          <p>Bem-vindo(a) ao NeuroPlay!</p>
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
