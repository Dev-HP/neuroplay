# Guia de Instalação - NeuroPlay

## Pré-requisitos

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

## Instalação do Backend

1. Instale o PostgreSQL e crie o banco de dados:
```bash
psql -U postgres
CREATE DATABASE neuroplay;
\q
```

2. Execute o script de criação das tabelas:
```bash
psql -U postgres -d neuroplay -f database/schema.sql
```

3. Instale as dependências Python:
```bash
cd backend
pip install -r requirements.txt
```

4. Configure a conexão com o banco de dados em `backend/app.py`:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://usuario:senha@localhost/neuroplay'
```

5. Inicie o servidor backend:
```bash
python app.py
```

O backend estará rodando em `http://localhost:5000`

## Instalação do Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm start
```

O frontend estará rodando em `http://localhost:3000`

## Acesso à Plataforma

1. Acesse `http://localhost:3000`
2. Crie uma conta como Educador ou Aluno
3. Faça login e explore a plataforma!

## Estrutura de Usuários

- **Educador**: Pode visualizar relatórios e acompanhar o progresso dos alunos
- **Aluno**: Pode jogar os jogos educativos e acumular pontos

## Jogos Disponíveis

1. **Mestres do Sinal**: Jogo de controle inibitório (Go/No-Go)
2. **Quebra-cabeça**: Em desenvolvimento
3. **Jogo da Memória**: Em desenvolvimento

## Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais de acesso no arquivo `app.py`

### Erro CORS no frontend
- Certifique-se de que o backend está rodando na porta 5000
- Verifique se o Flask-CORS está instalado

### Porta já em uso
- Backend: Altere a porta em `app.py`: `app.run(port=NOVA_PORTA)`
- Frontend: Defina `PORT=NOVA_PORTA` antes de executar `npm start`
