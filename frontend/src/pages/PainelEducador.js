import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './PainelEducador.css';

function PainelEducador({ user, onLogout }) {
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [progresso, setProgresso] = useState([]);

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
    }
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
      totalErros
    };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="painel-educador">
      <header className="header">
        <div className="logo">🧠 NeuroPlay</div>
        <div className="user-info">
          <span>Educador: {user.nome}</span>
          <button onClick={onLogout} className="btn btn-logout">Sair</button>
        </div>
      </header>

      <div className="container">
        <div className="painel-content">
          <aside className="sidebar">
            <h2>Alunos</h2>
            <div className="alunos-lista">
              {alunos.map((aluno) => (
                <div
                  key={aluno.id}
                  className={`aluno-item ${alunoSelecionado?.id === aluno.id ? 'active' : ''}`}
                  onClick={() => carregarProgresso(aluno.id)}
                >
                  <div className="aluno-avatar">👤</div>
                  <div className="aluno-info">
                    <h4>{aluno.nome}</h4>
                    <p>Pontos: {aluno.pontos_totais}</p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min((aluno.pontos_totais / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className="main-content">
            {alunoSelecionado ? (
              <>
                <div className="relatorio-header">
                  <h1>Desempenho de {alunoSelecionado.nome}</h1>
                </div>

                {stats && (
                  <div className="stats-grid">
                    <div className="stat-card stat-coral">
                      <h3>Pontos Totais</h3>
                      <div className="stat-value">{stats.totalPontos}</div>
                    </div>
                    <div className="stat-card stat-azul">
                      <h3>Taxa de Acerto</h3>
                      <div className="stat-value">{stats.taxaAcerto}%</div>
                    </div>
                  </div>
                )}

                <div className="chart-container card">
                  <h3>Desempenho por Categoria</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { categoria: 'Atenção', acertos: stats?.totalAcertos || 0, erros: stats?.totalErros || 0 },
                      { categoria: 'Memória', acertos: 0, erros: 0 },
                      { categoria: 'Lógica', acertos: 0, erros: 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="acertos" fill="#6BCB77" />
                      <Bar dataKey="erros" fill="#FF6B6B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h2>Selecione um aluno para ver o relatório</h2>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default PainelEducador;
