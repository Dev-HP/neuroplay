#!/bin/bash

# Script de Instalação do Cyber-Runner MVP
# NeuroPlay 2.0

echo "🎮 NeuroPlay 2.0 - Instalação do Cyber-Runner MVP"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verifica Node.js
echo -e "${BLUE}Verificando Node.js...${NC}"
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js encontrado: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js não encontrado!${NC}"
    echo "Por favor, instale Node.js: https://nodejs.org/"
    exit 1
fi

# Verifica Python
echo -e "${BLUE}Verificando Python...${NC}"
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python encontrado: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python não encontrado!${NC}"
    echo "Por favor, instale Python 3: https://www.python.org/"
    exit 1
fi

echo ""
echo -e "${BLUE}Instalando dependências do Frontend...${NC}"
cd frontend
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependências do frontend instaladas${NC}"
else
    echo -e "${RED}✗ Erro ao instalar dependências do frontend${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Instalando dependências do Backend...${NC}"
cd ../backend
pip3 install flask flask-cors flask-sqlalchemy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependências do backend instaladas${NC}"
else
    echo -e "${RED}✗ Erro ao instalar dependências do backend${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}=================================================="
echo "✅ Instalação concluída com sucesso!"
echo "==================================================${NC}"
echo ""
echo "Para iniciar o sistema:"
echo ""
echo "1. Backend:"
echo "   cd backend && python3 app.py"
echo ""
echo "2. Frontend (em outro terminal):"
echo "   cd frontend && npm start"
echo ""
echo "3. Acesse: http://localhost:3000/jogo/cyber-runner"
echo ""
echo "📚 Consulte CYBER_RUNNER_MVP.md para mais informações"
echo ""
