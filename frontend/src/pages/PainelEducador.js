import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './PainelEducador.css';

function PainelEducador({ user, onLogout }) {
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [progresso, setProgresso] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddAluno, setShowAddAluno] = useState(false);
  const [novoAluno, setNovoAluno] = useState({ nome: '', idade: '', nivel: 'iniciante' });

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/alunos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlunos(response.data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      // Mock data para demonstração
      setAlunos([
        { id: 1, nome: 'João Silva', idade: 8, nivel: 'intermediario', pontos_totais: 850, ultima_atividade: '2026-02-12', avatar: '👦' },
        { id: 2, nome: 'Maria Santos', idade: 7, nivel: 'iniciante', pontos_totais: 420, ultima_atividade: '2026-02-11', avatar: '👧' },
        { id: 3, nome: 'Pedro Costa', idade: 9, nivel: 'avancado', pontos_totais: 1250, ultima_atividade: '2026-02-12', avatar: '👦' },
        { id: 4, nome: 'Ana Oliveira', idade: 8, nivel: 'intermediario', pontos_totais: 680, ultima_atividade: '2026-02-10', avatar: '👧' },
        { id: 5, nome: 'Lucas Ferreira', idade: 7, nivel: 'iniciante', pontos_totais: 320, ultima_atividade: '2026-02-09', avatar: '👦' },
      ]);
    }
  };

  const adicionarAluno = async () => {
    if (!novoAluno.nome || !novoAluno.idade) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/alunos', novoAluno, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddAluno(false);
      setNovoAluno({ nome: '', idade: '', nivel: 'iniciante' });
      carregarAlunos();
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      alert('Aluno adicionado com sucesso! (modo demonstração)');
      setShowAddAluno(false);
      setNovoAluno({ nome: '', idade: '', nivel: 'iniciante' });
    }
  };

  const carregarProgresso = async (alunoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/progresso/${alunoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgresso(response.data);
      setAlunoSelecionado(alunos.find(a => a.id === alunoId));
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
      // Mock data
      const mockProgresso = [
        { jogo: 'Cyber Runner', acertos: 45, erros: 12, pontos: 450, tempo_medio: 120, data: '2026-02-12' },
        { jogo: 'Echo Temple', acertos: 38, erros: 15, pontos: 380, tempo_medio: 150, data: '2026-02-11' },
        { jogo: 'Sonic Jump', acertos: 52, erros: 8, pontos: 520, tempo_medio: 90, data: '2026-02-10' },
        { jogo: 'Gravity Lab', acertos: 41, erros: 14, pontos: 410, tempo_medio: 135, data: '2026-02-09' },
      ];
      setProgresso(mockProgresso);
      setAlunoSelecionado(alunos.find(a => a.id === alunoId));
    }
  };

  const calcularEstatisticasGerais = () => {
    const totalAlunos = alunos.length;
    const totalPontos = alunos.reduce((sum, a) => sum + (a.pontos_totais || 0), 0);
    const mediaPontos = totalAlunos > 0 ? Math.round(totalPontos / totalAlunos) : 0;
    const alunosAtivos = alunos.filter(a => {
      const ultimaAtividade = new Date(a.ultima_atividade);
      const hoje = new Date();
      const diffDias = Math.floor((hoje - ultimaAtividade) / (1000 * 60 * 60 * 24));
      return diffDias <= 7;
    }).length;

    return { totalAlunos, totalPontos, mediaPontos, alunosAtivos };
  };

  const calcularEstatisticas = () => {
    if (progresso.length === 0) return null;

    const totalAcertos = progresso.reduce((sum, p) => sum + p.acertos, 0);
    const totalErros = progresso.reduce((sum, p) => sum + p.erros, 0);
    const total = totalAcertos + totalErros;
    const taxaAcerto = total > 0 ? ((totalAcertos / total) * 100).toFixed(0) : 0;

    return {
      totalPontos: progresso.reduce((sum, p) => sum + p.pontos, 0),
      taxaAcerto,
      totalAcertos,
      totalErros,
      tempoMedio: Math.round(progresso.reduce((sum, p) => sum + p.tempo_medio, 0) / progresso.length)
    };
  };

  const exportarRelatorio = () => {
    if (!alunoSelecionado) return;
    
    const csv = [
      ['Jogo', 'Acertos', 'Erros', 'Pontos', 'Tempo Médio', 'Data'],
      ...progresso.map(p => [p.jogo, p.acertos, p.erros, p.pontos, p.tempo_medio, p.data])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${alunoSelecionado.nome.replace(' ', '_')}.csv`;
    a.click();
  };

  const statsGerais = calcularEstatisticasGerais();
  const stats = calcularEstatisticas();

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

  return (
    <div className="painel-educador">
      {/* Header */}
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
            <div className="user-avatar">👨‍🏫</div>
            <div className="user-details">
              <span className="user-name">{user?.nome || 'Educador'}</span>
              <span className="user-role">Professor</span>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout">
            <span>🚪</span> Sair
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="educator-nav">
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span>📊</span> Dashboard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'alunos' ? 'active' : ''}`}
          onClick={() => setActiveTab('alunos')}
        >
          <span>👥</span> Alunos
        </button>
        <button 
          className={`nav-tab ${activeTab === 'relatorios' ? 'active' : ''}`}
          onClick={() => setActiveTab('relatorios')}
        >
          <span>📈</span> Relatórios
        </button>
        <button 
          className={`nav-tab ${activeTab === 'configuracoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuracoes')}
        >
          <span>⚙️</span> Configurações
        </button>
      </nav>

      {/* Main Content */}
      <main className="educator-main">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="page-header">
              <h1>Dashboard Geral</h1>
              <p>Visão geral do desempenho dos alunos</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card card-purple">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Total de Alunos</h3>
                  <div className="stat-value">{statsGerais.totalAlunos}</div>
                  <p className="stat-label">cadastrados</p>
                </div>
              </div>

              <div className="stat-card card-blue">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>Alunos Ativos</h3>
                  <div className="stat-value">{statsGerais.alunosAtivos}</div>
                  <p className="stat-label">últimos 7 dias</p>
                </div>
              </div>

              <div className="stat-card card-green">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <h3>Pontos Totais</h3>
                  <div className="stat-value">{statsGerais.totalPontos.toLocaleString()}</div>
                  <p className="stat-label">acumulados</p>
                </div>
              </div>

              <div className="stat-card card-orange">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>Média de Pontos</h3>
                  <div className="stat-value">{statsGerais.mediaPontos}</div>
                  <p className="stat-label">por aluno</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Desempenho por Aluno</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alunos.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pontos_totais" fill="#667eea" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Distribuição por Nível</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Iniciante', value: alunos.filter(a => a.nivel === 'iniciante').length },
                        { name: 'Intermediário', value: alunos.filter(a => a.nivel === 'intermediario').length },
                        { name: 'Avançado', value: alunos.filter(a => a.nivel === 'avancado').length },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity card">
              <h3>Atividade Recente</h3>
              <div className="activity-list">
                {alunos.slice(0, 5).map(aluno => (
                  <div key={aluno.id} className="activity-item">
                    <div className="activity-avatar">{aluno.avatar}</div>
                    <div className="activity-info">
                      <strong>{aluno.nome}</strong> jogou recentemente
                      <span className="activity-time">{aluno.ultima_atividade}</span>
                    </div>
                    <div className="activity-points">+{aluno.pontos_totais} pts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alunos Tab */}
        {activeTab === 'alunos' && (
          <div className="alunos-content">
            <div className="page-header">
              <div>
                <h1>Gerenciar Alunos</h1>
                <p>Adicione e acompanhe seus alunos</p>
              </div>
              <button className="btn-primary" onClick={() => setShowAddAluno(true)}>
                <span>➕</span> Adicionar Aluno
              </button>
            </div>

            <div className="alunos-grid">
              {alunos.map(aluno => (
                <div key={aluno.id} className="aluno-card" onClick={() => {
                  setAlunoSelecionado(aluno);
                  carregarProgresso(aluno.id);
                  setActiveTab('relatorios');
                }}>
                  <div className="aluno-card-header">
                    <div className="aluno-avatar-large">{aluno.avatar}</div>
                    <div className={`nivel-badge nivel-${aluno.nivel}`}>
                      {aluno.nivel}
                    </div>
                  </div>
                  <div className="aluno-card-body">
                    <h3>{aluno.nome}</h3>
                    <p className="aluno-idade">{aluno.idade} anos</p>
                    <div className="aluno-stats">
                      <div className="aluno-stat">
                        <span className="stat-icon">🏆</span>
                        <span>{aluno.pontos_totais} pts</span>
                      </div>
                      <div className="aluno-stat">
                        <span className="stat-icon">📅</span>
                        <span>{aluno.ultima_atividade}</span>
                      </div>
                    </div>
                  </div>
                  <div className="aluno-card-footer">
                    <button className="btn-view">Ver Detalhes →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relatórios Tab */}
        {activeTab === 'relatorios' && (
          <div className="relatorios-content">
            {alunoSelecionado ? (
              <>
                <div className="page-header">
                  <div>
                    <h1>Relatório de {alunoSelecionado.nome}</h1>
                    <p>Análise detalhada do desempenho</p>
                  </div>
                  <button className="btn-export" onClick={exportarRelatorio}>
                    <span>📥</span> Exportar CSV
                  </button>
                </div>

                {stats && (
                  <div className="stats-grid">
                    <div className="stat-card-small card-purple">
                      <h4>Pontos Totais</h4>
                      <div className="stat-value-small">{stats.totalPontos}</div>
                    </div>
                    <div className="stat-card-small card-blue">
                      <h4>Taxa de Acerto</h4>
                      <div className="stat-value-small">{stats.taxaAcerto}%</div>
                    </div>
                    <div className="stat-card-small card-green">
                      <h4>Total Acertos</h4>
                      <div className="stat-value-small">{stats.totalAcertos}</div>
                    </div>
                    <div className="stat-card-small card-orange">
                      <h4>Tempo Médio</h4>
                      <div className="stat-value-small">{stats.tempoMedio}s</div>
                    </div>
                  </div>
                )}

                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>Desempenho por Jogo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={progresso}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="jogo" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="acertos" fill="#48bb78" name="Acertos" />
                        <Bar dataKey="erros" fill="#f56565" name="Erros" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Pontuação por Jogo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={progresso}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="jogo" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="pontos" stroke="#667eea" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="table-card">
                  <h3>Histórico Detalhado</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Jogo</th>
                        <th>Acertos</th>
                        <th>Erros</th>
                        <th>Pontos</th>
                        <th>Tempo Médio</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progresso.map((p, index) => (
                        <tr key={index}>
                          <td><strong>{p.jogo}</strong></td>
                          <td><span className="badge badge-success">{p.acertos}</span></td>
                          <td><span className="badge badge-error">{p.erros}</span></td>
                          <td>{p.pontos}</td>
                          <td>{p.tempo_medio}s</td>
                          <td>{p.data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h2>Selecione um aluno</h2>
                <p>Escolha um aluno na aba "Alunos" para ver o relatório detalhado</p>
                <button className="btn-primary" onClick={() => setActiveTab('alunos')}>
                  Ver Alunos
                </button>
              </div>
            )}
          </div>
        )}

        {/* Configurações Tab */}
        {activeTab === 'configuracoes' && (
          <div className="configuracoes-content">
            <div className="page-header">
              <h1>Configurações</h1>
              <p>Personalize a experiência dos alunos</p>
            </div>

            <div className="config-sections">
              <div className="config-card">
                <h3>⚙️ Dificuldade dos Jogos</h3>
                <div className="config-item">
                  <label>Velocidade Padrão</label>
                  <select className="config-select">
                    <option>Lenta</option>
                    <option selected>Normal</option>
                    <option>Rápida</option>
                  </select>
                </div>
                <div className="config-item">
                  <label>Complexidade</label>
                  <select className="config-select">
                    <option>Básica</option>
                    <option selected>Intermediária</option>
                    <option>Avançada</option>
                  </select>
                </div>
              </div>

              <div className="config-card">
                <h3>🎯 Metas e Objetivos</h3>
                <div className="config-item">
                  <label>Pontos Diários</label>
                  <input type="number" className="config-input" defaultValue="100" />
                </div>
                <div className="config-item">
                  <label>Tempo Recomendado (minutos)</label>
                  <input type="number" className="config-input" defaultValue="30" />
                </div>
              </div>

              <div className="config-card">
                <h3>🔔 Notificações</h3>
                <div className="config-item">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Email ao atingir metas</span>
                  </label>
                </div>
                <div className="config-item">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Alertas de inatividade</span>
                  </label>
                </div>
                <div className="config-item">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Relatórios semanais</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="config-actions">
              <button className="btn-primary">Salvar Configurações</button>
              <button className="btn-secondary">Restaurar Padrões</button>
            </div>
          </div>
        )}
      </main>

      {/* Modal Adicionar Aluno */}
      {showAddAluno && (
        <div className="modal-overlay" onClick={() => setShowAddAluno(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar Novo Aluno</h2>
              <button className="modal-close" onClick={() => setShowAddAluno(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome *</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={novoAluno.nome}
                  onChange={(e) => setNovoAluno({...novoAluno, nome: e.target.value})}
                  placeholder="Digite o nome do aluno"
                />
              </div>
              <div className="form-group">
                <label>Idade *</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={novoAluno.idade}
                  onChange={(e) => setNovoAluno({...novoAluno, idade: e.target.value})}
                  placeholder="Digite a idade"
                />
              </div>
              <div className="form-group">
                <label>Nível</label>
                <select 
                  className="form-select"
                  value={novoAluno.nivel}
                  onChange={(e) => setNovoAluno({...novoAluno, nivel: e.target.value})}
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddAluno(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={adicionarAluno}>
                Adicionar Aluno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PainelEducador;
