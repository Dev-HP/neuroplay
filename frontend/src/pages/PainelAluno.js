import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Logo from '../shared/components/Logo';
import { apiUrl, isApiConfigured } from '../shared/config/api';
import './PainelAluno.css';

const jogos = [
  { id: 'cyber-runner-canvas', titulo: 'Cyber-Runner', descricao: 'Decisões rápidas e obstáculos', icone: '🏃', cor: 'ciano', rota: '/jogo/cyber-runner-canvas', nivel: 'Inicial', integrado: true },
  { id: 'echo-temple', titulo: 'Templo dos Ecos', descricao: 'Memória visuoespacial e navegação', icone: '🗺️', cor: 'roxo', rota: '/jogo/echo-temple', nivel: 'Inicial', integrado: true },
  { id: 'sonic-jump', titulo: 'Sonic Jump', descricao: 'Processamento de sons e timing', icone: '🎵', cor: 'coral', rota: '/jogo/sonic-jump', nivel: 'Inicial', integrado: true },
  { id: 'gravity-lab', titulo: 'Gravity Lab', descricao: 'Resolução de problemas e flexibilidade', icone: '🧪', cor: 'azul', rota: '/jogo/gravity-lab', nivel: 'Inicial', integrado: true },
  { id: 'mestres-sinal', titulo: 'Mestres do Sinal', descricao: 'Respostas a sinais e controle de impulsos', icone: '🎯', cor: 'coral', rota: '/jogo/mestres-sinal', nivel: 'Inicial' },
  { id: 'cacador-alvos', titulo: 'Caçador de Alvos', descricao: 'Atenção visual e seleção de alvos', icone: '🚀', cor: 'azul', rota: '/jogo/cacador-alvos', nivel: 'Em desenvolvimento' },
  { id: 'memoria-dupla', titulo: 'Memória Dupla', descricao: 'Memória de trabalho visuoespacial', icone: '🧠', cor: 'verde', rota: '/jogo/memoria-dupla', nivel: 'Avançado' },
  { id: 'quebra-cabeca', titulo: 'Quebra-cabeça', descricao: 'Desenvolva sua lógica', icone: '🧩', cor: 'amarelo', rota: '/jogo/quebra-cabeca', nivel: 'Em breve', emBreve: true },
  { id: 'jogo-memoria', titulo: 'Jogo da Memória', descricao: 'Exercite sua memória', icone: '🎴', cor: 'roxo', rota: '/jogo/jogo-memoria', nivel: 'Em breve', emBreve: true }
];

function PainelAluno({ user, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student_id') || user?.student_id;
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;
    const loadStudent = async () => {
      if (!studentId) {
        setIsLoading(false);
        setFeedback('Selecione um perfil de estudante no painel do educador para iniciar uma sessão.');
        return;
      }
      if (!isApiConfigured()) {
        setIsLoading(false);
        setFeedback('Backend não configurado. Nenhuma pontuação local ou fictícia será exibida.');
        return;
      }
      try {
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(apiUrl(`/api/v1/students/${studentId}/progress`), { headers });
        if (active) {
          setStudent(response.data.student);
          setSessions(response.data.sessions || []);
          setFeedback('');
        }
      } catch (error) {
        if (active) {
          setStudent(null);
          setSessions([]);
          setFeedback(error.response?.data?.error || 'Não foi possível carregar este perfil autorizado.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadStudent();
    return () => { active = false; };
  }, [studentId]);

  const metrics = useMemo(() => {
    const completed = sessions.filter((session) => session.status === 'completed');
    return {
      jogos: completed.length,
      pontos: completed.reduce((sum, session) => sum + Number(session.score || 0), 0),
      acertos: completed.reduce((sum, session) => sum + Number(session.acertos || 0), 0)
    };
  }, [sessions]);

  const openGame = (game) => {
    if (!studentId || game.emBreve || !student?.consentimento_ativo) return;
    navigate(`${game.rota}?student_id=${encodeURIComponent(studentId)}`);
  };

  return (
    <div className="painel-aluno">
      <header className="painel-header"><div className="header-content"><Logo size="medium" showText={true} animated={true} /><div className="user-section"><div className="user-greeting"><span className="greeting-text">Olá, {student?.apelido || user?.nome || 'estudante'}!</span><span className="greeting-subtitle">Escolha uma atividade no seu ritmo.</span></div><button type="button" onClick={onLogout} className="btn-logout" aria-label="Sair"><span className="logout-icon" aria-hidden="true">🚪</span><span className="logout-text">Sair</span></button></div></div></header>

      <main>
        {feedback && <div className="status-banner" role="status" aria-live="polite">{feedback}</div>}
        {isLoading ? <div className="empty-state" role="status">Carregando seu perfil…</div> : !studentId ? <div className="empty-state"><div className="empty-icon">👥</div><h2>Perfil não selecionado</h2><p>Volte ao painel do educador e escolha um perfil autorizado.</p><button type="button" className="btn-primary" onClick={() => navigate('/educador')}>Voltar ao educador</button></div> : (
          <>
            <section className="progress-section" aria-labelledby="progress-title"><div className="progress-card"><div className="progress-icon" aria-hidden="true">⭐</div><div className="progress-info"><h2 id="progress-title">Seu progresso</h2><p className="progress-disclaimer">Indicadores de sessões concluídas, não uma avaliação clínica.</p><div className="progress-stats"><div className="stat"><span className="stat-value">{metrics.jogos}</span><span className="stat-label">Sessões concluídas</span></div><div className="stat"><span className="stat-value">{metrics.pontos}</span><span className="stat-label">Pontos registrados</span></div><div className="stat"><span className="stat-value">{metrics.acertos}</span><span className="stat-label">Acertos registrados</span></div></div></div></div></section>
            {!student?.consentimento_ativo && <div className="consent-notice" role="note"><strong>Consentimento pendente.</strong> Um responsável ou educador autorizado precisa registrar o consentimento antes de uma atividade ser salva.</div>}
            <section className="jogos-section" aria-labelledby="games-title"><h2 id="games-title" className="section-title"><span className="title-icon" aria-hidden="true">🎮</span> Escolha uma atividade</h2><div className="jogos-grid">{jogos.map((jogo) => <button type="button" key={jogo.id} className={`jogo-card jogo-${jogo.cor} ${jogo.emBreve ? 'em-breve' : ''} ${jogo.integrado ? 'destaque' : ''}`} onClick={() => openGame(jogo)} disabled={jogo.emBreve || !student?.consentimento_ativo} aria-label={`${jogo.titulo} — ${jogo.descricao}`}><div className="jogo-icone" aria-hidden="true">{jogo.icone}</div><div className="jogo-content"><h3 className="jogo-titulo">{jogo.titulo}</h3><p className="jogo-descricao">{jogo.descricao}</p><div className="jogo-footer"><span className="jogo-nivel">{jogo.emBreve ? 'Em breve' : !student?.consentimento_ativo ? 'Aguardando consentimento' : jogo.nivel}</span>{!jogo.emBreve && <span className="jogo-cta">Jogar →</span>}</div></div></button>)}</div></section>
            <section className="tips-section"><div className="tip-card"><div className="tip-icon" aria-hidden="true">💡</div><div className="tip-content"><h3>Uma atividade por vez</h3><p>Faça pausas quando quiser. O objetivo é explorar e aprender com segurança.</p></div></div></section>
          </>
        )}
      </main>
    </div>
  );
}

export default PainelAluno;
