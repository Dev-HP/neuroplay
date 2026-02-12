"""
Game Launcher - Inicia jogos Pygame
"""

import subprocess
import os
import sys
from pathlib import Path

# Diretório dos jogos
GAMES_DIR = Path(__file__).parent.parent / "games_pygame"

# Jogos disponíveis
JOGOS_DISPONIVEIS = {
    'cyber-runner': 'cyber_runner_tkinter.py',  # Versão Tkinter (sem dependências)
    'echo-temple': 'echo_temple.py',
    'sonic-jump': 'sonic_jump.py',
    'gravity-lab': 'gravity_lab.py'
}

def iniciar_jogo(nome_jogo):
    """
    Inicia um jogo Pygame
    
    Args:
        nome_jogo: Nome do jogo (cyber-runner, echo-temple, etc)
    
    Returns:
        True se iniciou com sucesso, False caso contrário
    """
    if nome_jogo not in JOGOS_DISPONIVEIS:
        print(f"Jogo '{nome_jogo}' não encontrado!")
        print(f"Jogos disponíveis: {', '.join(JOGOS_DISPONIVEIS.keys())}")
        return False
    
    arquivo_jogo = JOGOS_DISPONIVEIS[nome_jogo]
    caminho_completo = GAMES_DIR / arquivo_jogo
    
    if not caminho_completo.exists():
        print(f"Arquivo do jogo não encontrado: {caminho_completo}")
        return False
    
    print(f"Iniciando {nome_jogo}...")
    
    try:
        # Inicia o jogo em um processo separado
        subprocess.Popen([sys.executable, str(caminho_completo)])
        return True
    except Exception as e:
        print(f"Erro ao iniciar jogo: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python game_launcher.py <nome-do-jogo>")
        print(f"Jogos disponíveis: {', '.join(JOGOS_DISPONIVEIS.keys())}")
        sys.exit(1)
    
    nome = sys.argv[1]
    sucesso = iniciar_jogo(nome)
    sys.exit(0 if sucesso else 1)
