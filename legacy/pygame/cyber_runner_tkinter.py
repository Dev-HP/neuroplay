"""
Cyber-Runner - Versão Tkinter (sem dependências externas)
Jogo de controle inibitório com matemática
"""

import tkinter as tk
from tkinter import messagebox
import random
import json
from datetime import datetime
import math

class CyberRunner:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Cyber-Runner - NeuroPlay 2.0")
        self.root.geometry("1280x720")
        self.root.configure(bg='#0a0e27')
        self.root.resizable(False, False)
        
        # Canvas principal
        self.canvas = tk.Canvas(
            self.root,
            width=1280,
            height=720,
            bg='#0a0e27',
            highlightthickness=0
        )
        self.canvas.pack()
        
        # Estado do jogo
        self.estado = "menu"  # menu, jogando, game_over
        self.pontos = 0
        self.vidas = 3
        self.velocidade = 5
        
        # Jogador
        self.jogador_x = 100
        self.jogador_y = 570
        self.jogador_largura = 40
        self.jogador_altura = 60
        self.pulando = False
        self.velocidade_pulo = 0
        self.deslizando = False
        
        # Obstáculos
        self.obstaculos = []
        self.tempo_ultimo_obstaculo = 0
        self.intervalo_obstaculo = 2000  # ms
        
        # Matemática
        self.matematica_ativa = False
        self.equacao_atual = None
        self.tempo_matematica = 0
        
        # Estatísticas
        self.stats = {
            'acertos': 0,
            'erros': 0,
            'tempo_reacao': []
        }
        
        # Telemetria
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Controles
        self.root.bind('<space>', self.pular)
        self.root.bind('<Down>', self.deslizar_start)
        self.root.bind('<KeyRelease-Down>', self.deslizar_stop)
        self.canvas.bind('<Button-1>', self.click_matematica)
        
        # Inicia loop
        self.desenhar_menu()
        self.atualizar()
        
    def pular(self, event=None):
        if self.estado == "menu":
            self.estado = "jogando"
            self.resetar_jogo()
        elif self.estado == "jogando" and not self.matematica_ativa and not self.pulando:
            self.pulando = True
            self.velocidade_pulo = -15
        elif self.estado == "game_over":
            self.estado = "menu"
            
    def deslizar_start(self, event=None):
        if self.estado == "jogando" and not self.matematica_ativa:
            self.deslizando = True
            
    def deslizar_stop(self, event=None):
        self.deslizando = False
        
    def criar_obstaculo(self):
        """Cria um novo obstáculo"""
        tipo = "go" if random.random() < 0.7 else "nogo"
        cor = "#00ff00" if tipo == "go" else "#ff0000"
        altura = 80 if tipo == "go" else 40
        
        obstaculo = {
            'x': 1280,
            'y': 570 - altura if tipo == "go" else 590,
            'largura': 60,
            'altura': altura,
            'tipo': tipo,
            'cor': cor,
            'tempo_apareceu': self.root.after_idle(lambda: None)
        }
        
        self.obstaculos.append(obstaculo)
        
    def gerar_equacao(self):
        """Gera uma equação matemática"""
        operacoes = ['+', '-', '×']
        op = random.choice(operacoes)
        
        a = random.randint(1, 20)
        b = random.randint(1, 20)
        
        if op == '+':
            resposta = a + b
        elif op == '-':
            resposta = a - b
        else:  # ×
            resposta = a * b
        
        # Gera respostas erradas
        erradas = [
            resposta + random.randint(1, 5),
            resposta - random.randint(1, 5)
        ]
        
        opcoes = [resposta] + erradas
        random.shuffle(opcoes)
        
        return {
            'pergunta': f"{a} {op} {b} = ?",
            'resposta_correta': resposta,
            'opcoes': opcoes,
            'botoes': []
        }
        
    def desenhar_menu(self):
        """Desenha tela de menu"""
        self.canvas.delete("all")
        
        # Título
        self.canvas.create_text(
            640, 150,
            text="CYBER-RUNNER",
            font=("Arial", 72, "bold"),
            fill="#00ffff"
        )
        
        # Subtítulo
        self.canvas.create_text(
            640, 250,
            text="Treinamento de Controle Inibitório",
            font=("Arial", 24),
            fill="white"
        )
        
        # Instruções
        instrucoes = [
            "VERDE = PULAR (ESPAÇO)",
            "VERMELHO = DESLIZAR (↓)",
            "",
            "Pressione ESPAÇO para começar"
        ]
        
        y = 350
        for linha in instrucoes:
            cor = "white" if linha else "#00ffff"
            self.canvas.create_text(
                640, y,
                text=linha,
                font=("Arial", 20),
                fill=cor
            )
            y += 50
            
    def desenhar_jogo(self):
        """Desenha o jogo em andamento"""
        self.canvas.delete("all")
        
        # Grid de fundo
        for i in range(0, 1280, 50):
            self.canvas.create_line(i, 0, i, 720, fill="#003264", width=1)
        for i in range(0, 720, 50):
            self.canvas.create_line(0, i, 1280, i, fill="#003264", width=1)
        
        # Pista
        self.canvas.create_rectangle(
            0, 620, 1280, 720,
            fill="#1a1f3a",
            outline=""
        )
        
        # Jogador
        altura_jogador = self.jogador_altura // 2 if self.deslizando else self.jogador_altura
        cor_jogador = "#ffff00" if self.pulando or self.deslizando else "#00ffff"
        
        self.canvas.create_rectangle(
            self.jogador_x,
            self.jogador_y,
            self.jogador_x + self.jogador_largura,
            self.jogador_y + altura_jogador,
            fill=cor_jogador,
            outline="white",
            width=2
        )
        
        # Obstáculos
        for obs in self.obstaculos:
            self.canvas.create_rectangle(
                obs['x'],
                obs['y'],
                obs['x'] + obs['largura'],
                obs['y'] + obs['altura'],
                fill=obs['cor'],
                outline="white",
                width=2
            )
            
            # Ícone
            icone = "↑" if obs['tipo'] == "go" else "↓"
            self.canvas.create_text(
                obs['x'] + 30,
                obs['y'] + obs['altura']//2,
                text=icone,
                font=("Arial", 36, "bold"),
                fill="white"
            )
        
        # HUD
        self.desenhar_hud()
        
        # Matemática
        if self.matematica_ativa:
            self.desenhar_matematica()
            
    def desenhar_hud(self):
        """Desenha HUD"""
        # Pontos
        self.canvas.create_text(
            20, 20,
            text=f"PONTOS: {self.pontos}",
            font=("Arial", 20, "bold"),
            fill="#ffff00",
            anchor="nw"
        )
        
        # Vidas
        self.canvas.create_text(
            1260, 20,
            text=f"VIDAS: {'❤️' * self.vidas}",
            font=("Arial", 20, "bold"),
            fill="#ff0000",
            anchor="ne"
        )
        
        # Precisão
        total = self.stats['acertos'] + self.stats['erros']
        precisao = (self.stats['acertos'] / total * 100) if total > 0 else 0
        self.canvas.create_text(
            640, 20,
            text=f"PRECISÃO: {precisao:.1f}%",
            font=("Arial", 20, "bold"),
            fill="#00ffff",
            anchor="n"
        )
        
    def desenhar_matematica(self):
        """Desenha portal de matemática"""
        # Overlay
        self.canvas.create_rectangle(
            0, 0, 1280, 720,
            fill="#0a0e27",
            stipple="gray50"
        )
        
        # Caixa
        self.canvas.create_rectangle(
            340, 160, 940, 560,
            fill="#0a0e27",
            outline="#00ffff",
            width=3
        )
        
        # Pergunta
        self.canvas.create_text(
            640, 250,
            text=self.equacao_atual['pergunta'],
            font=("Arial", 48, "bold"),
            fill="white"
        )
        
        # Opções
        self.equacao_atual['botoes'] = []
        for i, opcao in enumerate(self.equacao_atual['opcoes']):
            x = 390 + i * 180
            y = 380
            
            # Botão
            btn = self.canvas.create_rectangle(
                x, y, x + 150, y + 80,
                fill="#00aaff",
                outline="#00ffff",
                width=2,
                tags=f"btn_{i}"
            )
            
            # Número
            self.canvas.create_text(
                x + 75, y + 40,
                text=str(opcao),
                font=("Arial", 36, "bold"),
                fill="white",
                tags=f"btn_{i}"
            )
            
            self.equacao_atual['botoes'].append({
                'x1': x,
                'y1': y,
                'x2': x + 150,
                'y2': y + 80,
                'valor': opcao
            })
            
    def desenhar_game_over(self):
        """Desenha tela de game over"""
        self.canvas.delete("all")
        
        # Título
        self.canvas.create_text(
            640, 150,
            text="GAME OVER",
            font=("Arial", 72, "bold"),
            fill="#ff0000"
        )
        
        # Estatísticas
        total = self.stats['acertos'] + self.stats['erros']
        precisao = (self.stats['acertos'] / total * 100) if total > 0 else 0
        
        stats_texto = [
            f"Pontuação Final: {self.pontos}",
            f"Acertos: {self.stats['acertos']}",
            f"Erros: {self.stats['erros']}",
            f"Precisão: {precisao:.1f}%",
            "",
            "Pressione ESPAÇO para jogar novamente"
        ]
        
        y = 300
        for linha in stats_texto:
            cor = "#ffff00" if "Pontuação" in linha else "white"
            self.canvas.create_text(
                640, y,
                text=linha,
                font=("Arial", 24),
                fill=cor
            )
            y += 50
            
    def click_matematica(self, event):
        """Processa clique na matemática"""
        if not self.matematica_ativa:
            return
            
        for i, btn in enumerate(self.equacao_atual['botoes']):
            if (btn['x1'] <= event.x <= btn['x2'] and 
                btn['y1'] <= event.y <= btn['y2']):
                
                correto = btn['valor'] == self.equacao_atual['resposta_correta']
                
                if correto:
                    self.pontos += 50
                    self.stats['acertos'] += 1
                else:
                    self.stats['erros'] += 1
                
                self.matematica_ativa = False
                break
                
    def atualizar(self):
        """Atualiza lógica do jogo"""
        if self.estado == "jogando":
            # Física do pulo
            if self.pulando:
                self.jogador_y += self.velocidade_pulo
                self.velocidade_pulo += 1  # Gravidade
                
                if self.jogador_y >= 570:
                    self.jogador_y = 570
                    self.pulando = False
                    self.velocidade_pulo = 0
            
            # Gera obstáculos
            tempo_atual = self.root.after_idle(lambda: None)
            if len(self.obstaculos) < 3:
                self.criar_obstaculo()
            
            # Move obstáculos
            for obs in self.obstaculos[:]:
                obs['x'] -= self.velocidade
                
                # Colisão
                if (self.jogador_x < obs['x'] + obs['largura'] and
                    self.jogador_x + self.jogador_largura > obs['x'] and
                    self.jogador_y < obs['y'] + obs['altura'] and
                    self.jogador_y + self.jogador_altura > obs['y']):
                    
                    # Verifica ação correta
                    acao_correta = (
                        (obs['tipo'] == 'go' and self.pulando) or
                        (obs['tipo'] == 'nogo' and self.deslizando)
                    )
                    
                    if acao_correta:
                        self.pontos += 10
                        self.stats['acertos'] += 1
                    else:
                        self.vidas -= 1
                        self.stats['erros'] += 1
                        
                        if self.vidas <= 0:
                            self.estado = "game_over"
                            self.salvar_telemetria()
                    
                    self.obstaculos.remove(obs)
                
                # Remove se saiu da tela
                elif obs['x'] < -obs['largura']:
                    self.obstaculos.remove(obs)
            
            # Ativa matemática periodicamente
            if not self.matematica_ativa and random.random() < 0.002:
                self.matematica_ativa = True
                self.equacao_atual = self.gerar_equacao()
        
        # Redesenha
        if self.estado == "menu":
            self.desenhar_menu()
        elif self.estado == "jogando":
            self.desenhar_jogo()
        elif self.estado == "game_over":
            self.desenhar_game_over()
        
        # Próximo frame
        self.root.after(16, self.atualizar)  # ~60 FPS
        
    def resetar_jogo(self):
        """Reseta o jogo"""
        self.pontos = 0
        self.vidas = 3
        self.obstaculos = []
        self.matematica_ativa = False
        self.stats = {'acertos': 0, 'erros': 0, 'tempo_reacao': []}
        
    def salvar_telemetria(self):
        """Salva dados de telemetria"""
        total = self.stats['acertos'] + self.stats['erros']
        dados = {
            'session_id': self.session_id,
            'pontos_final': self.pontos,
            'acertos': self.stats['acertos'],
            'erros': self.stats['erros'],
            'precisao': (self.stats['acertos'] / total * 100) if total > 0 else 0
        }
        
        with open(f'telemetria_{self.session_id}.json', 'w') as f:
            json.dump(dados, f, indent=2)
        
        print(f"Telemetria salva: telemetria_{self.session_id}.json")
        
    def rodar(self):
        """Inicia o jogo"""
        self.root.mainloop()

if __name__ == "__main__":
    jogo = CyberRunner()
    jogo.rodar()
