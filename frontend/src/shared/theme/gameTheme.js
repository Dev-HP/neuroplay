// Tema visual único dos jogos. Os jogos em canvas desenham com estas cores e
// fonte, e os jogos em HTML usam as mesmas cores pelas variáveis --game-* do
// index.css, para que todas as atividades tenham a mesma aparência.

export const TEMA = {
  fundoTopo: '#16294a',
  fundoMeio: '#1b304f',
  fundoBase: '#223c63',
  painel: 'rgba(22, 41, 74, 0.88)',
  linha: 'rgba(140, 201, 214, 0.12)',
  texto: '#ffffff',
  textoSuave: '#b9cde8',
  destaque: '#8cc9d6',
  primaria: '#628cc6',
  amarelo: '#e6c768',
  verde: '#5cc98a',
  vermelho: '#e06b68',
  lilas: '#a99ad1',
};

export const FONTE = 'Inter, "Segoe UI", system-ui, -apple-system, sans-serif';

export function fonte(tamanho, peso = 400) {
  return `${peso} ${tamanho}px ${FONTE}`;
}

// Fundo comum: o mesmo degradê azul-marinho da página, com uma grade discreta.
export function pintarFundo(ctx, largura, altura, { grade = true } = {}) {
  const degrade = ctx.createLinearGradient(0, 0, 0, altura);
  degrade.addColorStop(0, TEMA.fundoTopo);
  degrade.addColorStop(0.55, TEMA.fundoMeio);
  degrade.addColorStop(1, TEMA.fundoBase);
  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, largura, altura);
  if (!grade) return;
  ctx.strokeStyle = TEMA.linha;
  ctx.lineWidth = 1;
  for (let x = 0; x <= largura; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, altura);
    ctx.stroke();
  }
  for (let y = 0; y <= altura; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(largura, y);
    ctx.stroke();
  }
}

// Tela de abertura/fim padronizada: título, subtítulo e linhas de instrução.
export function desenharTelaTitulo(ctx, largura, { titulo, subtitulo, linhas = [], chamada }) {
  const centro = largura / 2;
  ctx.textAlign = 'center';
  ctx.shadowBlur = 0;
  ctx.fillStyle = TEMA.texto;
  ctx.font = fonte(64, 800);
  ctx.fillText(titulo, centro, 170);
  if (subtitulo) {
    ctx.fillStyle = TEMA.destaque;
    ctx.font = fonte(26, 600);
    ctx.fillText(subtitulo, centro, 225);
  }
  ctx.fillStyle = TEMA.textoSuave;
  ctx.font = fonte(22, 500);
  linhas.forEach((linha, i) => ctx.fillText(linha, centro, 300 + i * 40));
  if (chamada) {
    ctx.fillStyle = TEMA.amarelo;
    ctx.font = fonte(26, 700);
    ctx.fillText(chamada, centro, 320 + linhas.length * 40 + 30);
  }
}

function caixaArredondada(ctx, x, y, largura, altura, raio) {
  ctx.beginPath();
  ctx.moveTo(x + raio, y);
  ctx.lineTo(x + largura - raio, y);
  ctx.quadraticCurveTo(x + largura, y, x + largura, y + raio);
  ctx.lineTo(x + largura, y + altura - raio);
  ctx.quadraticCurveTo(x + largura, y + altura, x + largura - raio, y + altura);
  ctx.lineTo(x + raio, y + altura);
  ctx.quadraticCurveTo(x, y + altura, x, y + altura - raio);
  ctx.lineTo(x, y + raio);
  ctx.quadraticCurveTo(x, y, x + raio, y);
  ctx.closePath();
}

// Placar padrão: "fichas" no topo, começando depois do botão "Voltar".
export function desenharPlacar(ctx, itens, { x = 150, y = 16 } = {}) {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.font = fonte(20, 700);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let posicao = x;
  itens.forEach((item) => {
    const largura = ctx.measureText(item).width + 28;
    caixaArredondada(ctx, posicao, y, largura, 40, 12);
    ctx.fillStyle = TEMA.painel;
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 201, 214, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = TEMA.texto;
    ctx.fillText(item, posicao + 14, y + 21);
    posicao += largura + 10;
  });
  ctx.restore();
}

// Faixa central de orientação ("Memorize", "Organize por cor", avisos).
export function desenharFaixa(ctx, texto, { y = 96, cor = TEMA.destaque, largura = 1280 } = {}) {
  if (!texto) return;
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.font = fonte(24, 700);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(texto).width + 40;
  caixaArredondada(ctx, largura / 2 - w / 2, y - 22, w, 44, 14);
  ctx.fillStyle = TEMA.painel;
  ctx.fill();
  ctx.strokeStyle = cor;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = cor;
  ctx.fillText(texto, largura / 2, y + 1);
  ctx.restore();
}
