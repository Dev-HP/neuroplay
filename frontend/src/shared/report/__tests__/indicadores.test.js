import { indicadoresDaTarefa, nomeDaAtividade, taxaDeAcerto, textoDosIndicadores } from '../indicadores';

describe('indicadores do relatório', () => {
  it('traduz o identificador do jogo para o nome exibido', () => {
    expect(nomeDaAtividade('mestres-sinal')).toBe('Mestres do Sinal');
    expect(nomeDaAtividade('desconhecido')).toBe('desconhecido');
  });

  it('calcula a taxa de acerto e devolve null sem tentativas', () => {
    expect(taxaDeAcerto({ acertos: 15, erros: 5 })).toBe(75);
    expect(taxaDeAcerto({ acertos: 0, erros: 0 })).toBeNull();
  });

  it('mostra omissões, comissões e TR do Go/No-Go', () => {
    const sessao = { game_type: 'mestres-sinal', metadata: { omissoes: 2, comissoes: 1, inibicoes_corretas: 4, tempo_reacao_medio_ms: 512 } };
    expect(textoDosIndicadores(sessao)).toBe('Omissões: 2 · Comissões: 1 · Inibições corretas: 4 · TR médio: 512 ms');
  });

  it('agrupa acertos, alarmes falsos e omissões do n-back', () => {
    const sessao = {
      game_type: 'memoria-dupla',
      metadata: { n_back_final: 2, acertos_posicao: 5, alarmes_falsos_posicao: 1, omissoes_posicao: 2, acertos_som: 4, alarmes_falsos_som: 0, omissoes_som: 3 },
    };
    expect(indicadoresDaTarefa(sessao)).toEqual([
      ['N-back final', '2'],
      ['Posição: acertos/alarmes falsos/omissões', '5/1/2'],
      ['Som: acertos/alarmes falsos/omissões', '4/0/3'],
    ]);
  });

  it('ignora métricas ausentes ou com tipo errado (sessões antigas)', () => {
    expect(indicadoresDaTarefa({ game_type: 'mestres-sinal', metadata: { omissoes: 'muitas' } })).toEqual([]);
    expect(indicadoresDaTarefa({ game_type: 'echo-temple' })).toEqual([]);
  });
});
