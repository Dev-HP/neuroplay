-- Criação do banco de dados NeuroPlay
CREATE DATABASE neuroplay;

\c neuroplay;

-- Tabela de Usuários
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('educador', 'aluno')),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Alunos
CREATE TABLE aluno (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
    educador_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    pontos_totais INTEGER DEFAULT 0,
    nivel INTEGER DEFAULT 1
);

-- Tabela de Atividades
CREATE TABLE atividade (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    descricao TEXT,
    dificuldade INTEGER DEFAULT 1
);

-- Tabela de Progresso
CREATE TABLE progresso (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(id) ON DELETE CASCADE,
    atividade_id INTEGER REFERENCES atividade(id) ON DELETE CASCADE,
    pontos INTEGER DEFAULT 0,
    tempo_gasto INTEGER,
    acertos INTEGER DEFAULT 0,
    erros INTEGER DEFAULT 0,
    data_realizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir atividades padrão
INSERT INTO atividade (nome, tipo, descricao, dificuldade) VALUES
('Mestres do Sinal', 'mestres_sinal', 'Jogo de controle inibitório', 1),
('Quebra-cabeça', 'quebra_cabeca', 'Jogo de lógica e raciocínio', 1),
('Jogo da Memória', 'memoria', 'Jogo de memória visual', 1);

-- Índices para melhor performance
CREATE INDEX idx_aluno_usuario ON aluno(usuario_id);
CREATE INDEX idx_aluno_educador ON aluno(educador_id);
CREATE INDEX idx_progresso_aluno ON progresso(aluno_id);
CREATE INDEX idx_progresso_atividade ON progresso(atividade_id);
