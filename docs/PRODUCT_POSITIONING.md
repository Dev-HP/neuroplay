# Posicionamento e limites do Neuroplay

## Promessa atual

O Neuroplay é um **protótipo de atividades digitais lúdicas** para explorar interação, atenção, memória de trabalho e controle inibitório em experiências de navegador. O projeto pode apoiar demonstrações educacionais e estudos de usabilidade, mas ainda não constitui um produto clínico, terapêutico ou diagnóstico.

> A pontuação de um jogo descreve apenas o desempenho naquela sessão e naquela tarefa. Ela não mede inteligência, não identifica transtornos, não confirma evolução clínica e não deve orientar decisões de saúde ou educação sem avaliação profissional independente.

## O que o Neuroplay não faz

O protótipo não fornece diagnóstico, tratamento, cura, prescrição ou recomendação clínica. Também não substitui avaliação de psicólogo, médico, terapeuta, professor ou responsável. Referências a tarefas cognitivas, literatura acadêmica ou produtos regulados servem apenas para contextualização e não representam validação do Neuroplay.

## Modo demonstração

A publicação do GitHub Pages é construída com `REACT_APP_DEMO_MODE=true`. Nesse modo, as credenciais de teste são exibidas na própria tela, os registros de alunos e progresso são fictícios e as ações não devem ser interpretadas como persistência real. A demo não deve receber nomes reais, dados de crianças, dados clínicos, tokens de produção ou informações identificáveis.

O modo demo é separado do fluxo real por uma flag de build. A configuração de produção deve usar `REACT_APP_DEMO_MODE=false`, uma `REACT_APP_API_URL` HTTPS e autenticação emitida e validada pelo backend. O frontend não possui autoridade para decidir permissões, organização, consentimento, retenção ou exportação de dados.

## Critérios para futuros resultados

Qualquer afirmação quantitativa deverá informar, no mínimo, a métrica, unidade, amostra, período, tarefa, versão do jogo, baseline, método de análise e limitações. Resultados internos do jogo devem ser apresentados como indicadores exploratórios. Claims clínicos ou de generalização exigem desenho de estudo, revisão ética, governança de dados e avaliação profissional apropriada.

## Dados e privacidade

Até que exista um backend de produção com autorização por organização e papel, consentimento de responsável, retenção, exclusão, auditoria e exportação controlada, o sistema deve ser usado somente com dados sintéticos. Issues, logs, screenshots e arquivos CSV não podem conter nomes, idades, e-mails ou qualquer outro dado de menor real.
