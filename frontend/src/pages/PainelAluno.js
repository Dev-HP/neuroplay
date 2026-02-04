import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PainelAluno.css';

function PainelAluno({ user, onLogout }) {
  const navigate = useNavigate();

  const jogos = [
    {
      id: 1,
      nome: 'Mestres do Sinal',
      descricao: 'Treine seu controle inibitório',
      cor: 'coral',
      icone: '🚫',
      rota: '/jogo/mestres-sinal'
    },
    {
      id: 2,
      nome: 'Caçador de Alvos',
      descricao: 'Aventura espacial 3D',
      cor: 'roxo',
      icone: '🚀',
      rota: '/jogo/cacador-alvos'
    },
    {
      id: 3,
      nome: 'Memória Dupla',
      descricao: 'Treino N-Back avançado',
      cor: 'azul',
      icone: '🧠',
      rota: '/jogo/memoria-dupla'
    },
    {
      id: 4,
      nome: 'Quebra-cabeça',
      descricao: 'Desenvolva sua lógica',
      cor: 'amarelo',
      icone: '🧩',
      rota: '/jogo/quebra-cabeca'
    },
    {
      id: 5,
      nome: 'Jogo da Memória',
      descricao: 'Exercite sua memória',
      cor: 'verde',
      icone: '🎴',
      rota: '/jogo/memoria'
    }
  ];

  return (
    <div className="painel-aluno">
      <header className="header">
        <div className="logo">🧠 NeuroPlay</div>
        <div className="user-info">
          <span>Olá, {user.nome}!</span>
          <button onClick={onLogout} className="btn btn-logout">Sair</button>
        </div>
      </header>

      <div className="container">
        <div className="welcome-section fade-in">
          <h1>Olá! Qual será a aventura de hoje?</h1>
        </div>

        <div className="jogos-grid">
          {jogos.map((jogo) => (
            <div
              key={jogo.id}
              className={`jogo-card jogo-${jogo.cor} fade-in`}
              onClick={() => navigate(jogo.rota)}
            >
              <div className="jogo-icone">{jogo.icone}</div>
              <h3>{jogo.nome}</h3>
              <p>{jogo.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PainelAluno;
