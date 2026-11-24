// Funções de desenho para o Cyber Runner Enhanced

export const drawBackground = (ctx, offset, width, height) => {
  // Fundo gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0a0e27');
  gradient.addColorStop(1, '#1a1f3a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Grid animado
  ctx.strokeStyle = '#003264';
  ctx.lineWidth = 1;
  for (let i = -offset % 50; i < width; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let i = 0; i < height; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Estrelas de fundo
  ctx.fillStyle = 'white';
  for (let i = 0; i < 50; i++) {
    const x = (i * 137 + offset * 0.5) % width;
    const y = (i * 73) % (height - 200);
    const size = (i % 3) + 1;
    ctx.fillRect(x, y, size, size);
  }

  // Pista
  ctx.fillStyle = '#1a1f3a';
  ctx.fillRect(0, 620, width, 100);
  
  // Linha da pista
  ctx.strokeStyle = '#8cc9d6';
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 10]);
  ctx.beginPath();
  ctx.moveTo(0, 620);
  ctx.lineTo(width, 620);
  ctx.stroke();
  ctx.setLineDash([]);
};

export const drawCollectible = (ctx, collectible) => {
  const { x, y, width, height, type, rotation } = collectible;
  
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rotation);
  
  if (type === 'coin') {
    // Moeda girando
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, height / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffed4e';
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 3, height / 4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'star') {
    // Estrela
    ctx.fillStyle = '#e6c768';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#e6c768';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? width / 2 : width / 4;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  } else if (type === 'powerup') {
    // Power-up
    ctx.fillStyle = '#a99ad1';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#a99ad1';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', 0, 7);
  }
  
  ctx.shadowBlur = 0;
  ctx.restore();
};

export const drawParticles = (ctx, particles) => {
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 30;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;
};

export const drawHUD = (ctx, score, lives, coins, level, combo, precisao, powerUp) => {
  // Pontos
  ctx.fillStyle = '#e6c768';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`PONTOS: ${score}`, 20, 30);
  
  // Moedas
  ctx.fillText(`💰 ${coins}`, 20, 60);
  
  // Nível
  ctx.fillText(`NÍVEL: ${level}`, 20, 90);

  // Vidas
  ctx.textAlign = 'right';
  ctx.fillStyle = '#e06b68';
  ctx.fillText(`${'❤️'.repeat(lives)}`, 1260, 30);

  // Precisão
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8cc9d6';
  ctx.fillText(`PRECISÃO: ${precisao}%`, 640, 30);
  
  // Combo
  if (combo > 0) {
    ctx.fillStyle = '#e6c768';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`COMBO x${combo}! 🔥`, 640, 70);
  }
  
  // Power-up ativo
  if (powerUp) {
    ctx.fillStyle = '#a99ad1';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`⚡ ${powerUp.toUpperCase()} ATIVO!`, 640, 100);
  }
};

export const drawChallenge = (ctx, challenge, buttons) => {
  // Overlay
  ctx.fillStyle = 'rgba(10, 14, 39, 0.95)';
  ctx.fillRect(0, 0, 1280, 720);

  // Caixa principal
  ctx.strokeStyle = '#8cc9d6';
  ctx.lineWidth = 4;
  ctx.strokeRect(290, 140, 700, 440);
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(290, 140, 700, 440);

  // Ícone do tipo de desafio
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  const icons = { math: '🔢', color: '🎨', sequence: '🔄', memory: '🧠' };
  ctx.fillText(icons[challenge.type] || '❓', 640, 200);

  // Pergunta
  ctx.fillStyle = 'white';
  ctx.font = 'bold 36px Arial';
  
  if (challenge.type === 'color') {
    ctx.fillText(challenge.question, 640, 260);
    ctx.fillStyle = challenge.display.color;
    ctx.font = 'bold 48px Arial';
    ctx.fillText(challenge.display.text, 640, 320);
  } else if (challenge.type === 'memory' && challenge.sequence) {
    ctx.fillText(challenge.question, 640, 260);
    ctx.font = 'bold 40px Arial';
    ctx.fillText(challenge.sequence.join(' '), 640, 320);
  } else {
    ctx.fillText(challenge.question, 640, 280);
  }

  // Botões de resposta
  buttons.forEach((btn, i) => {
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
    ctx.strokeStyle = '#8cc9d6';
    ctx.lineWidth = 3;
    ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(btn.value.toString(), btn.x + btn.width / 2, btn.y + 55);
  });
};
