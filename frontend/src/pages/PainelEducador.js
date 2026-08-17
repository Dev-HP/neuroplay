import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { apiUrl, isApiConfigured } from '../shared/config/api';
import './PainelEducador.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

function PainelEducador({ user, onLogout }) {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [progresso, setProgresso] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddAluno, setShowAddAluno] = useState(false);
  const [novoAluno, setNovoAluno] = useState({ apelido: '', ano_nascimento: '' });
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const token = sessionStorage.getItem('token');
  const organizationId = user?.organizacoes?.[0]?.id;
  const requestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(organizationId ? { 'X-Organization-ID': String(organizationId) } : {})
    }
  };

  const carregarAlunos = async () => {
    if (!isApiConfigured()) {
      setFeedback('Backend não configurado. O produto não exibe dados locais ou fictícios.');
      setAlunos([]);
      setIsLoading(false);
      return;
    }
    if (!organizationId) {
      setFeedback('Sua conta ainda não possui uma organização autorizada.');
      setAlunos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl('/api/v1/students'), requestConfig);
      setAlunos(response.data.students || []);
      setFeedback('');
    } catch (error) {
      setAlunos([]);
      setFeedback(error.response?.data?.error || 'Não foi possível carregar os estudantes autorizados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarAlunos();
    // A organização é definida pela sessão autenticada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const adicionarAluno = async (event) => {
    event.preventDefault();
    if (!novoAluno.apelido.trim()) {
      setFeedback('Informe um apelido ou identificador pedagógico para o estudante.');
      return;
    }
    setIsSaving(true);
    try {
      await axios.post(apiUrl('/api/v1/students'), {
        apelido: novoAluno.apelido.trim(),
        ano_nascimento: novoAluno.ano_nascimento ? Number(novoAluno.ano_nascimento) : undefined
      }, requestConfig);
      setShowAddAluno(false);
      setNovoAluno({ apelido: '', ano_nascimento: '' });
      setFeedback('Perfil pseudonimizado criado. Registre o consentimento antes da primeira sessão.');
      await carregarAlunos();
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Não foi possível criar o perfil do estudante.');
    } finally {
      setIsSaving(false);
    }
  };

  const registrarConsentimento = async () => {
    if (!alunoSelecionado) return;
    setIsSaving(true);
    try {
      await axios.post(apiUrl('/api/v1/consents'), {
        student_id: alunoSelecionado.id,
        status: 'granted',
        finalidade: 'gameplay_educacional',
        evidencia: 'Consentimento registrado por usuário autorizado da organização.'
      }, requestConfig);
      const updated = { ...alunoSelecionado, consentimento_ativo: true };
      setAlunoSelecionado(updated);
      setAlunos((current) => current.map((aluno) => aluno.id === updated.id ? updated : aluno));
      setFeedback('Consentimento registrado. As sessões deste perfil poderão ser persistidas.');
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Não foi possível registrar o consentimento.');
    } finally {
      setIsSaving(false);
    }
  };

  const carregarProgresso = async (aluno) => {
    setAlunoSelecionado(aluno);
    setActiveTab('relatorios');
    if (!isApiConfigured()) {
      setProgresso([]);
      setFeedback('Backend não configurado. O relatório real ainda não está disponível.');
      return;
    }
    try {
      const response = await axios.get(apiUrl(`/api/v1/students/${aluno.id}/progress`), requestConfig);
      const sessions = (response.data.sessions || []).map((session) => ({
        ...session,
        jogo: session.game_type,
        pontos: session.score,
        tempo_medio: session.duration_seconds,
        data: session.completed_at ? new Date(session.completed_at).toLocaleDateString('pt-BR') : 'Em andamento'
      }));
      setProgresso(sessions);
      setFeedback('');
    } catch (error) {
      setProgresso([]);
      setFeedback(error.response?.data?.error || 'Não foi possível carregar o progresso deste estudante.');
    }
  };

  const statsGerais = useMemo(() => {
    const totalAlunos = alunos.length;
    const totalPontos = alunos.reduce((sum, aluno) => sum + Number(aluno.pontos_totais || 0), 0);
    const alunosAtivos = alunos.filter((aluno) => aluno.ultima_atividade).length;
    return {
      totalAlunos,
      totalPontos,
      mediaPontos: totalAlunos ? Math.round(totalPontos / totalAlunos) : 0,
      alunosAtivos
    };
  }, [alunos]);

  const stats = useMemo(() => {
    if (!progresso.length) return null;
    const totalAcertos = progresso.reduce((sum, item) => sum + Number(item.acertos || 0), 0);
    const totalErros = progresso.reduce((sum, item) => sum + Number(item.erros || 0), 0);
    const total = totalAcertos + totalErros;
    return {
      totalPontos: progresso.reduce((sum, item) => sum + Number(item.pontos || 0), 0),
      taxaAcerto: total ? Math.round((totalAcertos / total) * 100) : 0,
      totalAcertos,
      totalErros,
      tempoMedio: Math.round(progresso.reduce((sum, item) => sum + Number(item.tempo_medio || 0), 0) / progresso.length)
    };
  }, [progresso]);

  const distribuicaoNiveis = useMemo(() => {
    const groups = { 1: 'Inicial', 2: 'Em desenvolvimento', 3: 'Avançado' };
    return Object.entries(groups).map(([level, name]) => ({
      name,
      value: alunos.filter((aluno) => Math.min(3, Number(aluno.nivel || 1)) === Number(level)).length
    }));
  }, [alunos]);

  const exportarRelatorio = () => {
    if (!alunoSelecionado || !progresso.length) return;
    const rows = [
      ['Atividade', 'Acertos', 'Erros', 'Pontos', 'Duração (s)', 'Data'],
      ...progresso.map((item) => [item.jogo, item.acertos, item.erros, item.pontos, item.tempo_medio, item.data])
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\n');
    const url = window.URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${alunoSelecionado.apelido || alunoSelecionado.nome}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="painel-educador">
      <header className="educator-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">NeuroPlay</span>
            <span className="logo-badge">Educador</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <div className="user-avatar" aria-hidden="true">👨‍🏫</div>
            <div className="user-details">
              <span className="user-name">{user?.nome || 'Educador'}</span>
              <span className="user-role">{user?.organizacoes?.[0]?.nome || 'Organização'}</span>
            </div>
          </div>
          <button type="button" onClick={onLogout} className="btn-logout"><span aria-hidden="true">🚪</span> Sair</button>
        </div>
      </header>

      <nav className="educator-nav" aria-label="Navegação do educador">
        {[
          ['dashboard', '📊', 'Dashboard'],
          ['alunos', '👥', 'Estudantes'],
          ['relatorios', '📈', 'Relatórios'],
          ['configuracoes', '⚙️', 'Governança']
        ].map(([tab, icon, label]) => (
          <button type="button" key={tab} className={`nav-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined}>
            <span aria-hidden="true">{icon}</span> {label}
          </button>
        ))}
      </nav>

      {feedback && <div className="status-banner" role="status" aria-live="polite">{feedback}</div>}

      <main className="educator-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="page-header">
              <h1>Dashboard da organização</h1>
              <p>Indicadores descritivos derivados das sessões persistidas, sem interpretação clínica.</p>
            </div>
            {isLoading ? <div className="empty-state" role="status">Carregando dados autorizados…</div> : (
              <>
                <div className="stats-grid">
                  <div className="stat-card card-purple"><div className="stat-icon">👥</div><div className="stat-info"><h3>Estudantes</h3><div className="stat-value">{statsGerais.totalAlunos}</div><p className="stat-label">perfis ativos</p></div></div>
                  <div className="stat-card card-blue"><div className="stat-icon">✅</div><div className="stat-info"><h3>Com sessões</h3><div className="stat-value">{statsGerais.alunosAtivos}</div><p className="stat-label">com atividade registrada</p></div></div>
                  <div className="stat-card card-green"><div className="stat-icon">🏆</div><div className="stat-info"><h3>Pontuação agregada</h3><div className="stat-value">{statsGerais.totalPontos.toLocaleString('pt-BR')}</div><p className="stat-label">somatório descritivo</p></div></div>
                  <div className="stat-card card-orange"><div className="stat-icon">📊</div><div className="stat-info"><h3>Média por estudante</h3><div className="stat-value">{statsGerais.mediaPontos}</div><p className="stat-label">sem classificação clínica</p></div></div>
                </div>
                {alunos.length ? <div className="charts-grid">
                  <div className="chart-card"><h3>Pontuação por estudante</h3><ResponsiveContainer width="100%" height={300}><BarChart data={alunos.slice(0, 10)}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="nome" /><YAxis /><Tooltip /><Bar dataKey="pontos_totais" fill="#667eea" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
                  <div className="chart-card"><h3>Distribuição de nível de atividade</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={distribuicaoNiveis} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">{distribuicaoNiveis.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                </div> : <div className="empty-state"><div className="empty-icon">👥</div><h2>Nenhum perfil cadastrado</h2><p>Crie o primeiro perfil pseudonimizado na aba Estudantes.</p></div>}
              </>
            )}
          </div>
        )}

        {activeTab === 'alunos' && (
          <div className="alunos-content">
            <div className="page-header"><div><h1>Estudantes</h1><p>Perfis pseudonimizados da organização. O consentimento é obrigatório antes do gameplay.</p></div><button type="button" className="btn-primary" onClick={() => setShowAddAluno(true)}><span aria-hidden="true">➕</span> Adicionar perfil</button></div>
            {isLoading ? <div className="empty-state" role="status">Carregando perfis…</div> : alunos.length ? <div className="alunos-grid">{alunos.map((aluno) => <button type="button" key={aluno.id} className="aluno-card" onClick={() => carregarProgresso(aluno)} aria-label={`Ver relatório de ${aluno.nome}`}><div className="aluno-card-header"><div className="aluno-avatar-large" aria-hidden="true">{(aluno.apelido || aluno.nome || '?').charAt(0).toUpperCase()}</div><div className={`nivel-badge nivel-${aluno.nivel}`}>{aluno.consentimento_ativo ? 'Consentido' : 'Consentimento pendente'}</div></div><div className="aluno-card-body"><h3>{aluno.apelido || aluno.nome}</h3><p className="aluno-idade">Código: {aluno.codigo}</p><div className="aluno-stats"><div className="aluno-stat"><span className="stat-icon">🏆</span><span>{aluno.pontos_totais || 0} pts</span></div><div className="aluno-stat"><span className="stat-icon">📅</span><span>{aluno.ultima_atividade ? new Date(aluno.ultima_atividade).toLocaleDateString('pt-BR') : 'Sem sessões'}</span></div></div></div><div className="aluno-card-footer"><span className="btn-view">Ver relatório →</span><span className="btn-view" onClick={(event) => { event.stopPropagation(); navigate(`/aluno?student_id=${aluno.id}`); }}>Abrir jogos</span></div></button>)}</div> : <div className="empty-state"><div className="empty-icon">🧒</div><h2>Nenhum estudante ainda</h2><p>Adicione um perfil usando apenas o identificador necessário para a atividade pedagógica.</p></div>}
          </div>
        )}

        {activeTab === 'relatorios' && (
          <div className="relatorios-content">
            {alunoSelecionado ? <>
              <div className="page-header"><div><h1>Relatório de {alunoSelecionado.apelido || alunoSelecionado.nome}</h1><p>Histórico de gameplay persistido e autorizado. Os indicadores não são diagnóstico.</p></div><button type="button" className="btn-export" onClick={exportarRelatorio} disabled={!progresso.length}><span aria-hidden="true">📥</span> Exportar CSV</button></div>
              {!alunoSelecionado.consentimento_ativo && <div className="consent-notice" role="note"><strong>Consentimento pendente.</strong><p>O perfil ainda não pode registrar gameplay identificável. Confirme que a base legal e a autorização institucional foram verificadas antes de continuar.</p><button type="button" className="btn-primary" onClick={registrarConsentimento} disabled={isSaving}>{isSaving ? 'Registrando…' : 'Registrar consentimento autorizado'}</button></div>}
              {stats ? <div className="stats-grid"><div className="stat-card-small card-purple"><h4>Pontos registrados</h4><div className="stat-value-small">{stats.totalPontos}</div></div><div className="stat-card-small card-blue"><h4>Acertos / tentativas</h4><div className="stat-value-small">{stats.taxaAcerto}%</div></div><div className="stat-card-small card-green"><h4>Total de acertos</h4><div className="stat-value-small">{stats.totalAcertos}</div></div><div className="stat-card-small card-orange"><h4>Duração média</h4><div className="stat-value-small">{stats.tempoMedio}s</div></div></div> : <div className="empty-state"><div className="empty-icon">📊</div><h2>Sem sessões concluídas</h2><p>Os dados aparecerão aqui depois que uma sessão autorizada for concluída.</p></div>}
              {!!progresso.length && <><div className="charts-grid"><div className="chart-card"><h3>Acertos e erros por atividade</h3><ResponsiveContainer width="100%" height={300}><BarChart data={progresso}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="jogo" /><YAxis /><Tooltip /><Legend /><Bar dataKey="acertos" fill="#48bb78" name="Acertos" /><Bar dataKey="erros" fill="#f56565" name="Erros" /></BarChart></ResponsiveContainer></div><div className="chart-card"><h3>Pontuação por atividade</h3><ResponsiveContainer width="100%" height={300}><LineChart data={progresso}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="jogo" /><YAxis /><Tooltip /><Line type="monotone" dataKey="pontos" stroke="#667eea" strokeWidth={3} /></LineChart></ResponsiveContainer></div></div><div className="table-card"><h3>Histórico detalhado</h3><table className="data-table"><thead><tr><th>Atividade</th><th>Acertos</th><th>Erros</th><th>Pontos</th><th>Duração</th><th>Data</th></tr></thead><tbody>{progresso.map((item) => <tr key={item.id}><td><strong>{item.jogo}</strong></td><td><span className="badge badge-success">{item.acertos}</span></td><td><span className="badge badge-error">{item.erros}</span></td><td>{item.pontos}</td><td>{item.tempo_medio}s</td><td>{item.data}</td></tr>)}</tbody></table></div></>}
            </> : <div className="empty-state"><div className="empty-icon">📊</div><h2>Selecione um estudante</h2><p>Escolha um perfil na aba Estudantes para consultar dados persistidos.</p><button type="button" className="btn-primary" onClick={() => setActiveTab('alunos')}>Ver estudantes</button></div>}
          </div>
        )}

        {activeTab === 'configuracoes' && <div className="configuracoes-content"><div className="page-header"><h1>Governança e privacidade</h1><p>Configurações operacionais da organização e limites do produto.</p></div><div className="config-sections"><div className="config-card"><h3>🔐 Dados por padrão</h3><p>Perfis infantis são pseudonimizados. O gameplay identificável só é persistido quando existe consentimento válido.</p></div><div className="config-card"><h3>🧾 Auditoria</h3><p>Criação de contas, perfis, consentimentos e sessões geram eventos de auditoria para a organização.</p></div><div className="config-card"><h3>🧠 Limite de interpretação</h3><p>Os gráficos descrevem sessões, acertos, erros, duração e pontuação. Eles não classificam desenvolvimento, transtornos ou eficácia clínica.</p></div></div></div>}
      </main>

      {showAddAluno && <div className="modal-overlay" role="presentation" onClick={() => setShowAddAluno(false)}><div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="add-student-title" onClick={(event) => event.stopPropagation()}><div className="modal-header"><h2 id="add-student-title">Adicionar perfil de estudante</h2><button type="button" className="modal-close" onClick={() => setShowAddAluno(false)} aria-label="Fechar">×</button></div><form onSubmit={adicionarAluno}><div className="modal-body"><div className="form-group"><label htmlFor="apelido">Apelido ou código pedagógico *</label><input id="apelido" type="text" className="form-input" value={novoAluno.apelido} onChange={(event) => setNovoAluno({ ...novoAluno, apelido: event.target.value })} required /></div><div className="form-group"><label htmlFor="ano_nascimento">Ano de nascimento (opcional)</label><input id="ano_nascimento" type="number" min="1900" max={new Date().getFullYear()} className="form-input" value={novoAluno.ano_nascimento} onChange={(event) => setNovoAluno({ ...novoAluno, ano_nascimento: event.target.value })} /></div><p className="form-help">Não informe nome completo ou diagnóstico. Use somente o dado necessário à organização da atividade.</p></div><div className="modal-footer"><button type="button" className="btn-secondary" onClick={() => setShowAddAluno(false)}>Cancelar</button><button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? 'Salvando…' : 'Criar perfil'}</button></div></form></div></div>}
    </div>
  );
}

export default PainelEducador;
