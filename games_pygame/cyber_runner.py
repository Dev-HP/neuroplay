"""
Cyber-Runner - Pygame Version
Jogo de controle inibitório com matemática
"""

import pygame
import random
import sys
from datetime import datetime
import json

# Inicializa Pygame
pygame.init()

# Configurações
LARGURA = 1280
ALTURA = 720
FPS = 60

# Cores
PRETO = (10, 14, 39)
BRANCO = (255, 255, 255)
VERDE = (0, 255, 0)
VERMELHO = (255, 0, 0)
CIANO = (0, 255, 255)
AMARELO = (255, 255, 0)

class CyberRunner:
    def __init__(self):
        self.tela = pygame.display.set_mode((LARGURA, ALTURA))
        pygame.display.set_caption("Cyber-Runner - NeuroPlay 2.0")
        self.clock = pygame.time.Clock()
        self.fonte = pygame.font.Font(None, 36)
        self.fonte_grande = pygame.font.Font(None, 72)
        
        # Estado do jogo
        self.estado = "menu"  # menu, jogando, game_over
        self.pontos = 0
        self.vidas = 3
        self.velocidade = 5
        
        # Jogador
        self.jogador_y = ALTURA - 150
        self.jogador_altura = 60
        self.jogador_largura = 40
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
        self.eventos = []
    
    def criar_obstaculo(self):
        """Cria um novo obstáculo (Go ou No-Go)"""
        tipo = "go" if random.random() < 0.7 else "nogo"
        cor = VERDE if tipo == "go" else VERMELHO
        altura = 80 if tipo == "go" else 40
        
        obstaculo = {
            'x': LARGURA,
            'y': ALTURA - 150 - (altura if tipo == "go" else 0),
            'largura': 60,
            'altura': altura,
            'tipo': tipo,
            'cor': cor,
            'tempo_apareceu': pygame.time.get_ticks()
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
            'tempo_inicio': pygame.time.get_ticks()
        }
    
    def desenhar_menu(self):
        """Desenha tela de menu"""
        self.tela.fill(PRETO)
        
        # Título
        titulo = self.fonte_grande.render("CYBER-RUNNER", True, CIANO)
        self.tela.blit(titulo, (LARGURA//2 - titulo.get_width()//2, 150))
        
        # Subtítulo
        subtitulo = self.fonte.render("Treinamento de Controle Inibitório", True, BRANCO)
        self.tela.blit(subtitulo, (LARGURA//2 - subtitulo.get_width()//2, 250))
        
        # Instruções
        instrucoes = [
            "VERDE = PULAR (ESPAÇO)",
            "VERMELHO = DESLIZAR (↓)",
            "",
            "Pressione ESPAÇO para começar"
        ]
        
        y = 350
        for linha in instrucoes:
            texto = self.fonte.render(linha, True, BRANCO if linha else CIANO)
            self.tela.blit(texto, (LARGURA//2 - texto.get_width()//2, y))
            y += 50
    
    def desenhar_jogo(self):
        """Desenha o jogo em andamento"""
        # Fundo
        self.tela.fill(PRETO)
        
        # Grid (efeito cyberpunk)
        for i in range(0, LARGURA, 50):
            pygame.draw.line(self.tela, (0, 50, 100), (i, 0), (i, ALTURA), 1)
        for i in range(0, ALTURA, 50):
            pygame.draw.line(self.tela, (0, 50, 100), (0, i), (LARGURA, i), 1)
        
        # Pista
        pygame.draw.rect(self.tela, (26, 31, 58), (0, ALTURA - 100, LARGURA, 100))
        
        # Jogador
        altura_jogador = self.jogador_altura // 2 if self.deslizando else self.jogador_altura
        cor_jogador = AMARELO if self.pulando or self.deslizando else CIANO
        
        pygame.draw.rect(self.tela, cor_jogador, 
                        (100, self.jogador_y, self.jogador_largura, altura_jogador))
        
        # Obstáculos
        for obs in self.obstaculos:
            pygame.draw.rect(self.tela, obs['cor'], 
                           (obs['x'], obs['y'], obs['largura'], obs['altura']))
            
            # Ícone no obstáculo
            icone = "↑" if obs['tipo'] == "go" else "↓"
            texto_icone = self.fonte_grande.render(icone, True, BRANCO)
            self.tela.blit(texto_icone, 
                          (obs['x'] + 10, obs['y'] + obs['altura']//2 - 20))
        
        # HUD
        self.desenhar_hud()
        
        # Matemática
        if self.matematica_ativa:
            self.desenhar_matematica()
    
    def desenhar_hud(self):
        """Desenha HUD (pontos, vidas)"""
        # Pontos
        texto_pontos = self.fonte.render(f"PONTOS: {self.pontos}", True, AMARELO)
        self.tela.blit(texto_pontos, (20, 20))
        
        # Vidas
        texto_vidas = self.fonte.render(f"VIDAS: {'❤️' * self.vidas}", True, VERMELHO)
        self.tela.blit(texto_vidas, (LARGURA - 200, 20))
        
        # Precisão
        total = self.stats['acertos'] + self.stats['erros']
        precisao = (self.stats['acertos'] / total * 100) if total > 0 else 0
        texto_precisao = self.fonte.render(f"PRECISÃO: {precisao:.1f}%", True, CIANO)
        self.tela.blit(texto_precisao, (LARGURA//2 - 100, 20))
    
    def desenhar_matematica(self):
        """Desenha portal de matemática"""
        # Fundo semi-transparente
        overlay = pygame.Surface((LARGURA, ALTURA))
        overlay.set_alpha(200)
        overlay.fill(PRETO)
        self.tela.blit(overlay, (0, 0))
        
        # Caixa da equação
        caixa_largura = 600
        caixa_altura = 400
        caixa_x = LARGURA//2 - caixa_largura//2
        caixa_y = ALTURA//2 - caixa_altura//2
        
        pygame.draw.rect(self.tela, (10, 14, 39), 
                        (caixa_x, caixa_y, caixa_largura, caixa_altura))
        pygame.draw.rect(self.tela, CIANO, 
                        (caixa_x, caixa_y, caixa_largura, caixa_altura), 3)
        
        # Pergunta
        texto_pergunta = self.fonte_grande.render(
            self.equacao_atual['pergunta'], True, BRANCO)
        self.tela.blit(texto_pergunta, 
                      (LARGURA//2 - texto_pergunta.get_width()//2, caixa_y + 80))
        
        # Opções
        y_opcao = caixa_y + 200
        for i, opcao in enumerate(self.equacao_atual['opcoes']):
            # Botão
            botao_x = caixa_x + 50 + i * 180
            botao_largura = 150
            botao_altura = 80
            
            pygame.draw.rect(self.tela, (0, 170, 255), 
                           (botao_x, y_opcao, botao_largura, botao_altura))
            pygame.draw.rect(self.tela, CIANO, 
                           (botao_x, y_opcao, botao_largura, botao_altura), 2)
            
            # Número
            texto_opcao = self.fonte_grande.render(str(opcao), True, BRANCO)
            self.tela.blit(texto_opcao, 
                          (botao_x + botao_largura//2 - texto_opcao.get_width()//2,
                           y_opcao + 20))
            
            # Guarda posição para clique
            self.equacao_atual[f'botao_{i}'] = pygame.Rect(
                botao_x, y_opcao, botao_largura, botao_altura)
    
    def desenhar_game_over(self):
        """Desenha tela de game over"""
        self.tela.fill(PRETO)
        
        # Título
        titulo = self.fonte_grande.render("GAME OVER", True, VERMELHO)
        self.tela.blit(titulo, (LARGURA//2 - titulo.get_width()//2, 150))
        
        # Estatísticas
        stats_texto = [
            f"Pontuação Final: {self.pontos}",
            f"Acertos: {self.stats['acertos']}",
            f"Erros: {self.stats['erros']}",
            f"Precisão: {(self.stats['acertos']/(self.stats['acertos']+self.stats['erros'])*100):.1f}%" 
                if (self.stats['acertos']+self.stats['erros']) > 0 else "Precisão: 0%",
            "",
            "Pressione ESPAÇO para jogar novamente"
        ]
        
        y = 300
        for linha in stats_texto:
            cor = AMARELO if "Pontuação" in linha else BRANCO
            texto = self.fonte.render(linha, True, cor)
            self.tela.blit(texto, (LARGURA//2 - texto.get_width()//2, y))
            y += 50
    
    def atualizar(self):
        """Atualiza lógica do jogo"""
        if self.estado != "jogando":
            return
        
        tempo_atual = pygame.time.get_ticks()
        
        # Física do pulo
        if self.pulando:
            self.jogador_y += self.velocidade_pulo
            self.velocidade_pulo += 1  # Gravidade
            
            if self.jogador_y >= ALTURA - 150:
                self.jogador_y = ALTURA - 150
                self.pulando = False
                self.velocidade_pulo = 0
        
        # Gera obstáculos
        if tempo_atual - self.tempo_ultimo_obstaculo > self.intervalo_obstaculo:
            self.criar_obstaculo()
            self.tempo_ultimo_obstaculo = tempo_atual
        
        # Move e remove obstáculos
        for obs in self.obstaculos[:]:
            obs['x'] -= self.velocidade
            
            # Colisão
            jogador_rect = pygame.Rect(100, self.jogador_y, 
                                      self.jogador_largura, self.jogador_altura)
            obs_rect = pygame.Rect(obs['x'], obs['y'], obs['largura'], obs['altura'])
            
            if jogador_rect.colliderect(obs_rect):
                # Verifica se ação foi correta
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
        
        # Ativa matemática a cada 45 segundos
        if not self.matematica_ativa and tempo_atual - self.tempo_matematica > 45000:
            self.matematica_ativa = True
            self.equacao_atual = self.gerar_equacao()
            self.tempo_matematica = tempo_atual
    
    def processar_eventos(self):
        """Processa eventos do Pygame"""
        for evento in pygame.event.get():
            if evento.type == pygame.QUIT:
                return False
            
            if evento.type == pygame.KEYDOWN:
                if self.estado == "menu":
                    if evento.key == pygame.K_SPACE:
                        self.estado = "jogando"
                        self.resetar_jogo()
                
                elif self.estado == "jogando":
                    if not self.matematica_ativa:
                        if evento.key == pygame.K_SPACE and not self.pulando:
                            self.pulando = True
                            self.velocidade_pulo = -15
                        
                        elif evento.key == pygame.K_DOWN:
                            self.deslizando = True
                
                elif self.estado == "game_over":
                    if evento.key == pygame.K_SPACE:
                        self.estado = "menu"
            
            if evento.type == pygame.KEYUP:
                if evento.key == pygame.K_DOWN:
                    self.deslizando = False
            
            # Clique na matemática
            if evento.type == pygame.MOUSEBUTTONDOWN and self.matematica_ativa:
                pos = pygame.mouse.get_pos()
                for i in range(3):
                    if f'botao_{i}' in self.equacao_atual:
                        if self.equacao_atual[f'botao_{i}'].collidepoint(pos):
                            opcao_clicada = self.equacao_atual['opcoes'][i]
                            correto = opcao_clicada == self.equacao_atual['resposta_correta']
                            
                            if correto:
                                self.pontos += 50
                                self.stats['acertos'] += 1
                            else:
                                self.stats['erros'] += 1
                            
                            self.matematica_ativa = False
        
        return True
    
    def resetar_jogo(self):
        """Reseta o jogo"""
        self.pontos = 0
        self.vidas = 3
        self.obstaculos = []
        self.matematica_ativa = False
        self.tempo_ultimo_obstaculo = pygame.time.get_ticks()
        self.tempo_matematica = pygame.time.get_ticks()
        self.stats = {'acertos': 0, 'erros': 0, 'tempo_reacao': []}
    
    def salvar_telemetria(self):
        """Salva dados de telemetria"""
        dados = {
            'session_id': self.session_id,
            'pontos_final': self.pontos,
            'acertos': self.stats['acertos'],
            'erros': self.stats['erros'],
            'precisao': (self.stats['acertos'] / 
                        (self.stats['acertos'] + self.stats['erros']) * 100)
                        if (self.stats['acertos'] + self.stats['erros']) > 0 else 0
        }
        
        with open(f'telemetria_{self.session_id}.json', 'w') as f:
            json.dump(dados, f, indent=2)
        
        print(f"Telemetria salva: telemetria_{self.session_id}.json")
    
    def rodar(self):
        """Loop principal do jogo"""
        rodando = True
        
        while rodando:
            rodando = self.processar_eventos()
            
            self.atualizar()
            
            # Desenha
            if self.estado == "menu":
                self.desenhar_menu()
            elif self.estado == "jogando":
                self.desenhar_jogo()
            elif self.estado == "game_over":
                self.desenhar_game_over()
            
            pygame.display.flip()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    jogo = CyberRunner()
    jogo.rodar()
