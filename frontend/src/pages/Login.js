import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../shared/components/Logo';
import { apiUrl, isApiConfigured } from '../shared/config/api';
import './Login.css';

const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';
const DEMO_USERS = {
  'aluno@demo.com': { senha: 'demo123', tipo: 'aluno', nome: 'Aluno Demo' },
  'educador@demo.com': { senha: 'demo123', tipo: 'educador', nome: 'Educador Demo' }
};

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    tipo: 'aluno'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (isRegister && !isApiConfigured()) {
      setError('O cadastro precisa de um backend configurado. No momento, esta instância está em modo demonstração.');
      return;
    }

    if (!isRegister && DEMO_MODE) {
      const demoUser = DEMO_USERS[formData.email.toLowerCase().trim()];
      if (demoUser && demoUser.senha === formData.senha) {
        onLogin(
          { id: 1, nome: demoUser.nome, email: formData.email, tipo: demoUser.tipo },
          `demo-session-${Date.now()}`
        );
        navigate(demoUser.tipo === 'aluno' ? '/aluno' : '/educador');
        return;
      }

      setError('Credenciais de demonstração inválidas. Use um dos acessos exibidos nesta tela.');
      return;
    }

    if (!isApiConfigured()) {
      setError('Backend não configurado. Defina REACT_APP_API_URL ou habilite explicitamente o modo demonstração.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(apiUrl(endpoint), formData);

      if (isRegister) {
        setIsRegister(false);
        setFormData((current) => ({ ...current, senha: '' }));
        setError('Cadastro realizado. Faça login para continuar.');
      } else {
        onLogin(response.data.usuario, response.data.token);
        navigate(response.data.usuario?.tipo === 'educador' ? '/educador' : '/aluno');
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Não foi possível conectar ao backend. Verifique a URL da API e tente novamente.'
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
          <p>Bem-vindo(a) ao NeuroPlay.</p>
          <p className="login-disclaimer" role="note">
            Protótipo de atividades lúdicas. Não fornece diagnóstico ou tratamento.
          </p>
          {DEMO_MODE && (
            <div className="demo-credentials" role="note" aria-label="Credenciais do modo demonstração">
              <small>
                <strong>Modo demonstração ativo</strong><br />
                Aluno: aluno@demo.com<br />
                Educador: educador@demo.com<br />
                Senha: demo123
              </small>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="Como podemos chamar você?"
                value={formData.nome}
                onChange={(event) => setFormData({ ...formData, nome: event.target.value })}
                autoComplete="name"
                required
              />
            </div>
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
              placeholder="Digite sua senha"
              value={formData.senha}
              onChange={(event) => setFormData({ ...formData, senha: event.target.value })}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {isRegister && (
            <fieldset className="form-group tipo-selector">
              <legend>Perfil</legend>
              <button
                type="button"
                className={`tipo-btn ${formData.tipo === 'educador' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, tipo: 'educador' })}
                aria-pressed={formData.tipo === 'educador'}
              >
                Sou educador
              </button>
              <button
                type="button"
                className={`tipo-btn ${formData.tipo === 'aluno' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, tipo: 'aluno' })}
                aria-pressed={formData.tipo === 'aluno'}
              >
                Sou aluno
              </button>
            </fieldset>
          )}

          {error && (
            <div className="error-message" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Aguarde…' : isRegister ? 'Cadastrar' : 'Entrar'}
          </button>

          <div className="toggle-form">
            {isRegister ? 'Já tem conta?' : 'Não tem conta ainda?'}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setError('');
                setIsRegister(!isRegister);
              }}
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
