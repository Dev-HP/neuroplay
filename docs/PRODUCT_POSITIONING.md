# Posicionamento e limites do Neuroplay

## Promessa atual

O Neuroplay é um **MVP educacional de atividades digitais lúdicas** para registrar indicadores descritivos de interação, atenção, memória de trabalho e controle inibitório em experiências de navegador autorizadas. O sistema possui autenticação adulta, organizações, perfis de estudantes pseudonimizados, consentimento versionado, persistência de sessões e auditoria. Ele pode apoiar acompanhamento pedagógico e estudos de usabilidade, mas não constitui produto clínico, terapêutico ou diagnóstico.

> A pontuação de um jogo descreve apenas o desempenho naquela sessão e naquela tarefa. Ela não mede inteligência, não identifica transtornos, não confirma evolução clínica e não deve orientar decisões de saúde ou educação sem avaliação profissional independente.

## O que o Neuroplay não faz

O produto não fornece diagnóstico, tratamento, cura, prescrição ou recomendação clínica. Também não substitui avaliação de psicólogo, médico, terapeuta, professor ou responsável. Referências a tarefas cognitivas, literatura acadêmica ou produtos regulados servem para contextualização e não representam validação clínica do Neuroplay.

## Estado da publicação e do backend

O build de produção é gerado com `REACT_APP_DEMO_MODE=false`; não há credenciais de demonstração, arrays de alunos ou progresso fictício no fluxo de runtime. O frontend consulta a API e bloqueia operações identificáveis quando não existe estudante selecionado ou consentimento válido. Os sete jogos enviam sessões autorizadas ao endpoint real `/api/v1/gameplay/sync`.

O GitHub Pages hospeda apenas o frontend estático. Para operar com dados reais, o secret `REACT_APP_API_URL` precisa apontar para uma API Flask pública com HTTPS, PostgreSQL e Redis gerenciados, CORS restrito e secrets configurados no provedor. Sem essa infraestrutura e sem a governança institucional descrita no guia de deploy, a publicação deve ser usada somente com dados sintéticos.

## Critérios para futuros resultados

Qualquer afirmação quantitativa deverá informar, no mínimo, a métrica, unidade, amostra, período, tarefa, versão do jogo, baseline, método de análise e limitações. Resultados internos do jogo devem ser apresentados como indicadores exploratórios. Claims clínicos ou de generalização exigem desenho de estudo, revisão ética, governança de dados e avaliação profissional apropriada.

## Dados e privacidade

O MVP implementa minimização, pseudonimização, controle adulto, isolamento por organização, consentimento versionado e revogável, exportação, exclusão lógica e eventos de auditoria. Ainda assim, a entrada em produção com dados de crianças depende de DPIA/RIPD, política de retenção e descarte, backup e restauração testados, revisão de segurança, responsabilidades institucionais, contratos de processamento e operação HTTPS efetivamente configurada.

Issues, logs, screenshots e arquivos CSV de testes não podem conter nomes, idades, e-mails ou qualquer outro dado de menor real. Caso o produto venha a receber finalidade de prevenção, diagnóstico, tratamento, reabilitação ou monitoramento clínico, será necessária avaliação regulatória e clínica específica antes de comercializar ou disponibilizar essa funcionalidade.
