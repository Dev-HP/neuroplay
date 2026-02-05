import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './PainelAluno.css';

function PainelAluno({ user, onLogout }) {
  const navigate = useNavigate();

  const jogos = [
    {
      id: 'mestres-sinal',
      titulo: 'Mestres do Sinal',
      descricao: 'Treine seu controle inibitório',
      icone: '🎯',
      cor: 'coral',
      rota: '/jogo/mestres-sinal',
      nivel: 'Iniciante'
    },
    {
      id: 'cacador-alvos',
      titulo: 'Caçador de Alvos',
      descricao: 'Aventura espacial 3D',
      icone: '🚀',
      cor: 'azul',
      rota: '/jogo/cacador-alvos',
      nivel: 'Intermediário'
    },
    {
      id: 'memoria-dupla',
      titulo: 'Memória Dupla',
      descricao: 'Treino N-back avançado',
      icone: '🧠',
      cor: 'verde',
      rota: '/jogo/memoria-dupla',
      nivel: 'Avançado'
    },
    {
      id: 'quebra-cabeca',
      titulo: 'Quebra-cabeça',
      descricao: 'Desenvolva sua lógica',
      icone: '🧩',
      cor: 'amarelo',
      rota: '/jogo/quebra-cabeca',
      nivel: 'Iniciante',
      emBreve: true
    },
    {
      id: 'jogo-memoria',
      titulo: 'Jogo da Memória',
      descricao: 'Exercite sua memória',
      icone: '🎴',
      cor: 'roxo',
      rota: '/jogo/jogo-memoria',
      nivel: 'Iniciante',
      emBreve: true
    }
  ];

  return (
    <div className="painel-aluno">
      {/* Header com saudação personalizada */}
      <header className="painel-header">
        <div className="header-content">
          <Logo size="medium" showText={true} animated={true} />
          
          <div className="user-section">
            <div className="user-greeting">
              <span className="greeting-text">Olá, {user.nome}! 👋</span>
              <span className="greeting-subtitle">Pronto para uma nova aventura?</span>
            </div>
            <button onClick={onLogout} className="btn-logout" aria-label="Sair">
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Seção de progresso */}
      <section className="progress-section">
        <div className="progress-card">
          <div className="progress-icon">⭐</div>
          <div className="progress-info">
            <h3>Seu Progresso</h3>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-value">0</span>
                <span className="stat-label">Jogos Completos</span>
              </div>
              <div className="stat">
                <span className="stat-value">0</span>
                <span className="stat-label">Estrelas</span>
              </div>
              <div className="stat">
                <span className="stat-value">Nível 1</span>
                <span className="stat-label">Seu Nível</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de jogos */}
      <section className="jogos-section">
        <h2 className="section-title">
          <span className="title-icon">🎮</span>
          Escolha sua Aventura
        </h2>
        
        <div className="jogos-grid">
          {jogos.map((jogo) => (
            <div
              key={jogo.id}
              className={`jogo-card jogo-${jogo.cor} ${jogo.emBreve ? 'em-breve' : ''}`}
              onClick={() => !jogo.emBreve && navigate(jogo.rota)}
              role="button"
              tabIndex={0}
              aria-label={`${jogo.titulo} - ${jogo.descricao}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !jogo.emBreve) {
                  navigate(jogo.rota);
                }
              }}
            >
              {jogo.emBreve && <div className="badge-em-breve">Em Breve</div>}
              
              <div className="jogo-icone">{jogo.icone}</div>
              
              <div className="jogo-content">
                <h3 className="jogo-titulo">{jogo.titulo}</h3>
                <p className="jogo-descricao">{jogo.descricao}</p>
                
                <div className="jogo-footer">
                  <span className="jogo-nivel">{jogo.nivel}</span>
                  {!jogo.emBreve && (
                    <span className="jogo-cta">Jogar →</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dicas e motivação */}
      <section className="tips-section">
        <div className="tip-card">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <h3>Dica do Dia</h3>
            <p>Comece com jogos mais fáceis e vá aumentando o desafio aos poucos. Você está indo muito bem!</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PainelAluno;
