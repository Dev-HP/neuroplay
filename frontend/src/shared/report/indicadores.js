// Indicadores descritivos de cada sessão para o relatório do educador.
// Nada aqui classifica a criança: só nomeia o que foi medido na tarefa.

export const ATIVIDADES = {
  'mestres-sinal': { nome: 'Mestres do Sinal', tarefa: 'Go/No-Go (controle inibitório)' },
  'memoria-dupla': { nome: 'Memória Dupla', tarefa: 'n-back visual e auditivo (memória de trabalho)' },
  'echo-temple': { nome: 'Templo dos Ecos', tarefa: 'Sequência visuoespacial, tipo Corsi' },
  'gravity-lab': { nome: 'Gravity Lab', tarefa: 'Troca de regra (flexibilidade)' },
  'cyber-runner-canvas': { nome: 'Cyber-Runner', tarefa: 'Escolha rápida com distratores' },
  'sonic-jump': { nome: 'Sonic Jump', tarefa: 'Discriminação de sons da fala' },
  'cacador-alvos': { nome: 'Caçador de Alvos', tarefa: 'Busca visual' },
};

export function nomeDaAtividade(slug) {
  return ATIVIDADES[slug]?.nome || slug || 'Atividade';
}

export function taxaDeAcerto(sessao) {
  const acertos = Number(sessao?.acertos) || 0;
  const erros = Number(sessao?.erros) || 0;
  const total = acertos + erros;
  return total ? Math.round((acertos / total) * 100) : null;
}

const numero = (valor) => (typeof valor === 'number' && Number.isFinite(valor) ? valor : null);

// Lista [rótulo, valor] com as métricas próprias de cada tarefa.
export function indicadoresDaTarefa(sessao) {
  const m = sessao?.metadata || {};
  const itens = [];
  const add = (rotulo, valor, sufixo = '') => {
    if (valor !== null && valor !== undefined && valor !== '') itens.push([rotulo, `${valor}${sufixo}`]);
  };
  switch (sessao?.game_type) {
    case 'mestres-sinal':
      add('Omissões', numero(m.omissoes));
      add('Comissões', numero(m.comissoes));
      add('Inibições corretas', numero(m.inibicoes_corretas));
      add('TR médio', numero(m.tempo_reacao_medio_ms), ' ms');
      break;
    case 'memoria-dupla':
      add('N-back final', numero(m.n_back_final));
      add('Posição: acertos/alarmes falsos/omissões', [m.acertos_posicao, m.alarmes_falsos_posicao, m.omissoes_posicao].every((v) => numero(v) !== null)
        ? `${m.acertos_posicao}/${m.alarmes_falsos_posicao}/${m.omissoes_posicao}` : null);
      add('Som: acertos/alarmes falsos/omissões', [m.acertos_som, m.alarmes_falsos_som, m.omissoes_som].every((v) => numero(v) !== null)
        ? `${m.acertos_som}/${m.alarmes_falsos_som}/${m.omissoes_som}` : null);
      break;
    case 'echo-temple':
      add('Maior sequência', numero(m.maior_sequencia));
      add('Nível', numero(m.nivel));
      break;
    case 'gravity-lab':
      add('Trocas de regra', numero(m.trocas_de_regra));
      add('Experimentos', numero(m.experimentos));
      break;
    case 'cacador-alvos':
      add('Colisões', numero(m.colisoes));
      add('TR médio', numero(m.tempo_reacao_medio_ms), ' ms');
      break;
    case 'cyber-runner-canvas':
    case 'sonic-jump':
      add('Nível', numero(m.nivel));
      add('Vidas restantes', numero(m.vidas_restantes));
      break;
    default:
      break;
  }
  return itens;
}

export function textoDosIndicadores(sessao) {
  return indicadoresDaTarefa(sessao).map(([rotulo, valor]) => `${rotulo}: ${valor}`).join(' · ');
}
