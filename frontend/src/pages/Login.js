import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../shared/components/Logo';
import { apiUrl, isApiConfigured } from '../shared/config/api';
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    organizacao_nome: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isApiConfigured()) {
      setError('Esta publicação ainda não está conectada a um backend. Configure REACT_APP_API_URL no deploy para habilitar o produto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
      const response = await axios.post(apiUrl(endpoint), formData, { withCredentials: true });
      const user = response.data.usuario;
      onLogin(user, response.data.token);
      navigate(user?.tipo === 'educador' || user?.role === 'owner' ? '/educador' : '/aluno');
    } catch (requestError) {
      const payload = requestError.response?.data;
      setError(
        payload?.error ||
          payload?.message ||
          'Não foi possível concluir a operação. Verifique os dados e tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
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
          <p>{isRegister ? 'Crie o espaço seguro da sua organização.' : 'Entre para acompanhar atividades educacionais.'}</p>
          <p className="login-disclaimer" role="note">
            Plataforma educacional de atividades lúdicas. Não fornece diagnóstico ou tratamento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="nome">Seu nome</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Como podemos chamar você?"
                  value={formData.nome}
                  onChange={(event) => setFormData({ ...formData, nome: event.target.value })}
                  autoComplete="name"
                  minLength={2}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="organizacao_nome">Nome da organização</label>
                <input
                  id="organizacao_nome"
                  name="organizacao_nome"
                  type="text"
                  placeholder="Escola, clínica educacional ou projeto"
                  value={formData.organizacao_nome}
                  onChange={(event) => setFormData({ ...formData, organizacao_nome: event.target.value })}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              placeholder="Mínimo de 10 caracteres"
              value={formData.senha}
              onChange={(event) => setFormData({ ...formData, senha: event.target.value })}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 10 : undefined}
              required
            />
          </div>

          {error && (
            <div className="error-message" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Aguarde…' : isRegister ? 'Criar organização' : 'Entrar'}
          </button>

          <div className="toggle-form">
            {isRegister ? 'Já tem conta?' : 'Primeiro acesso?'}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setError('');
                setIsRegister(!isRegister);
              }}
            >
              {isRegister ? 'Fazer login' : 'Criar conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
