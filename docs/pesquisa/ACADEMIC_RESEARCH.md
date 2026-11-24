# Pesquisa acadêmica e regulatória aplicada ao NeuroPlay

**Autor:** Manus AI  
**Escopo:** jogos digitais, funções executivas, crianças, privacidade, evidência e posicionamento do produto  
**Data da revisão:** agosto de 2026

## Resumo executivo

A literatura indica que serious games podem favorecer engajamento e, em alguns estudos, apresentar melhora em atenção, memória de trabalho, flexibilidade, controle inibitório ou habilidades relacionadas. Entretanto, a evidência é heterogênea: revisões recentes encontram amostras pequenas, diferenças substanciais entre jogos e parâmetros de intervenção, resultados inconsistentes e risco de viés. Portanto, o score produzido pelo NeuroPlay deve ser tratado como **dado descritivo de uma sessão**, não como teste neuropsicológico, diagnóstico ou prova de eficácia terapêutica.

A análise também mostra que transformar o NeuroPlay em produto exige mais que conectar um banco. Como a plataforma pode lidar com perfis de crianças, a arquitetura deve priorizar melhor interesse, minimização, transparência apropriada à idade, controle adulto, consentimento versionado, isolamento por organização, exportação, exclusão, auditoria e segurança operacional. Se o produto assumir finalidade médica, entrará em uma trilha regulatória e clínica diferente da atual.

## Método e critérios de seleção

Foram priorizadas revisões sistemáticas e documentos institucionais primários. A seleção combinou bases acadêmicas indexadas, periódicos de saúde digital, documentos oficiais brasileiros e padrões internacionais de direitos da criança e evidência para tecnologias digitais. Foram excluídos snippets de buscadores, páginas comerciais usadas como prova de eficácia e materiais que não permitiam verificar autoria, método ou autoridade institucional.

A síntese abaixo separa quatro tipos de fonte: estudos de intervenção, revisões sistemáticas, diretrizes de direitos/privacidade e referenciais regulatórios/evidenciais. A finalidade não é concluir que o NeuroPlay funciona clinicamente, mas definir o que pode ser afirmado e o que ainda precisa de pesquisa.

## Evidência sobre jogos e cognição infantil

### Revisão internacional sobre funções executivas

A revisão sistemática publicada no *JMIR Serious Games* em 2024 pesquisou Scopus, Web of Science e PubMed, avaliou risco de viés com RoB 2 e ROBINS-I e incluiu 16 estudos, dos quais 15 envolveram populações neurodiversas. Os autores relatam resultados positivos em atenção, memória de trabalho e flexibilidade cognitiva, mas destacam heterogeneidade de participantes, idades, jogos, desfechos e qualidade metodológica [1].

Essa evidência apoia o desenho de atividades com objetivos pedagógicos claros, feedback imediato e métricas agregadas. Ela não autoriza transformar uma sessão do NeuroPlay em diagnóstico, nem inferir que uma pontuação alta produz melhora fora do jogo.

### Estudo brasileiro sobre controle inibitório

Um estudo brasileiro publicado na *Revista Brasileira de Educação Especial* utilizou delineamento quase-experimental com oito crianças atendidas na educação especializada, intervenção de aproximadamente cinco semanas e sessões de cerca de quinze minutos três vezes por semana. O grupo participante apresentou melhoria superior em atividades lúdicas e em quatro de cinco testes aplicados [2].

O achado é relevante para a hipótese educacional, mas a amostra pequena e por conveniência limita a generalização. O estudo não sustenta claims quantitativos do NeuroPlay para outras populações, escolas ou condições clínicas. A consequência prática é registrar o protocolo e os desfechos se o projeto futuramente realizar estudo próprio, em vez de apresentar o resultado como validação do produto.

### Revisão sistemática recente sobre ADHD e serious games

Uma revisão sistemática de 2025 analisou 35 estudos e 1.408 participantes, com buscas em PubMed, Web of Science, Scopus, IEEE Xplore e ACM Digital Library. Atenção foi avaliada em 28 dos 35 estudos, funções executivas em 15 dos 35, e 31 dos 35 estudos relataram atitude positiva das crianças em relação às intervenções. Apesar do potencial, os autores afirmam que a evidência ainda é insuficiente para demonstrar impacto específico, por limitações na quantidade de estudos, na variedade de jogos e na consistência dos resultados [3].

O NeuroPlay deve aproveitar a força de engajamento sem confundir aceitação com eficácia. Métricas de gameplay precisam vir acompanhadas de versão do jogo, duração, acertos, erros, contexto e limitações explícitas.

## Direitos, privacidade e dados infantis

### Brasil: ANPD e LGPD

A tomada de subsídios da ANPD sobre crianças e adolescentes destaca o melhor interesse, transparência adequada, verificação razoável do responsável quando o consentimento for utilizado, minimização e a necessidade de não exigir informações pessoais além das estritamente necessárias para a participação em jogos [4].

A implementação do NeuroPlay traduz esses princípios em perfis pseudonimizados, criação por adulto autorizado, consentimento versionado, revogação, exportação, exclusão lógica, auditoria e bloqueio do gameplay identificável quando não há consentimento válido. A aplicação não deve solicitar diagnóstico, CPF, localização, contato social ou texto livre sobre a criança para executar os jogos.

### Direitos digitais: Comitê da ONU

O Comentário Geral nº 25 do Comitê da ONU sobre os Direitos da Criança foi desenvolvido a partir de consultas a Estados, especialistas e 709 crianças em 28 países. O documento orienta a implementação dos direitos da criança no ambiente digital considerando oportunidades, riscos, privacidade, segurança, transparência, participação e mecanismos de reparação [5].

No produto, isso exige mais que um aviso jurídico para adultos. O fluxo deve explicar em linguagem acessível o que é coletado, por quê, por quanto tempo e quem pode ver; deve permitir intervenção do responsável; e deve evitar experiências que incentivem a criança a fornecer dados desnecessários ou permanecer conectada além do objetivo pedagógico.

### Design apropriado à idade

O *Age Appropriate Design Code* do ICO reúne quinze padrões para serviços online acessíveis por crianças: melhor interesse, DPIA, aplicação apropriada à idade, transparência, configurações de alta privacidade por padrão, minimização, compartilhamento restrito, geolocalização desligada por padrão, controle parental, limites a profiling e prevenção de nudges que enfraqueçam a privacidade [6].

Embora seja uma referência britânica e não substitua a LGPD, o código é uma boa régua internacional de engenharia. Por isso, o NeuroPlay não deve usar profiling comportamental para classificar a criança, nem fazer recomendação clínica automática a partir de score.

## Quando a finalidade deixa de ser educacional

A ANVISA define, na RDC nº 657/2022, regras para software como dispositivo médico e diferencia software de bem-estar de software destinado a prevenção, diagnóstico, tratamento, reabilitação ou outras indicações médicas. A resolução também exige, conforme a classe e a finalidade, documentação de arquitetura, cibersegurança, verificação, validação, gerenciamento de risco e avaliação clínica [7].

O NICE Evidence Standards Framework fornece um referencial para avaliar tecnologias digitais de saúde e afirma explicitamente que atender ao framework não significa aprovação regulatória nem endosso [8]. Assim, o NeuroPlay deve manter o escopo educacional nesta fase. Uma futura mudança para DTx ou SaMD exigiria revisão de finalidade pretendida, evidência clínica, usabilidade, risco, pós-mercado e enquadramento regulatório; não é uma simples alteração de copy.

## Tradução dos achados para o produto

| Achado | Requisito de produto | Estado implementado |
|---|---|---|
| Evidência heterogênea | Scores são descritivos e não clínicos | Implementado na UI e no README |
| Estudos usam parâmetros distintos | Registrar versão, atividade, duração, acertos, erros e eventos limitados | Implementado no modelo `GameSession` |
| Melhor interesse e minimização | Perfil pseudonimizado e coleta mínima | Implementado no MVP |
| Controle adulto | Conta de adulto, organização e papéis | Implementado |
| Consentimento | Status, versão, finalidade, concessão e revogação | Implementado na API |
| Transparência | Avisos de finalidade e limites no login/painéis | Implementado |
| Isolamento | Tenant isolation por organização no servidor | Implementado e testado |
| Prestação de contas | Exportação, exclusão lógica e audit events | Implementado na API; UI de operação ainda pode ser expandida |
| Claim terapêutico | Trilha separada com evidência e regulação | Não deve ser ativado no MVP |

## Agenda de pesquisa futura

Se o NeuroPlay avançar para uma avaliação de eficácia, o protocolo deverá definir previamente população, elegibilidade, intervenção, comparador, duração, frequência, desfechos primários e secundários, eventos adversos, critérios de exclusão e análise estatística. O estudo deverá passar pela governança ética e institucional aplicável, usar instrumentos apropriados e publicar limitações. O produto não deve retroativamente escolher apenas as métricas que parecem positivas.

A agenda técnica deve incluir estudo de usabilidade com educadores e responsáveis, avaliação de compreensão da tela de consentimento, teste de acessibilidade infantil, validação da qualidade dos dados, teste de retenção/exclusão e revisão independente de segurança. A agenda de produto deve medir conclusão de sessões, clareza, carga cognitiva, frustração, acessibilidade e valor pedagógico percebido sem chamar esses resultados de benefício clínico.

## Conclusão

É tecnicamente possível transformar o NeuroPlay em um MVP real sem dados estáticos, e a implementação atual já substitui os principais mocks por API, banco, autenticação, organizações, consentimento, persistência e auditoria. Isso **não equivale** a validar eficácia clínica, obter autorização regulatória ou estar pronto para operar com dados reais de crianças sem infraestrutura pública, governança institucional, DPIA/RIPD, política de retenção, backup, segurança e responsabilidades formalizadas.

> A promessa apropriada para o produto atual é: **oferecer atividades lúdicas e registrar indicadores descritivos de sessões autorizadas para acompanhamento educacional**.

## Referências

[1]: https://games.jmir.org/2024/1/e59053/ "Use of Serious Games in Interventions of Executive Functions in Neurodiverse Children — JMIR Serious Games, 2024"

[2]: https://www.scielo.br/j/rbee/a/YPhVPPQ5x9xWXv6BXJZ6MGz/?lang=pt "Jogos Digitais e Aprimoramento do Controle Inibitório — Revista Brasileira de Educação Especial, 2019"

[3]: https://games.jmir.org/2025/1/e60937/ "Effectiveness of Serious Games as Digital Therapeutics for Enhancing the Abilities of Children With ADHD — JMIR Serious Games, 2025"

[4]: https://www.gov.br/participamaisbrasil/tscriancaeadolescente "ANPD — Tratamento de dados pessoais de crianças e adolescentes"

[5]: https://www.ohchr.org/en/documents/general-comments-and-recommendations/general-comment-no-25-2021-childrens-rights-relation "OHCHR — General comment No. 25 (2021) on children’s rights in relation to the digital environment"

[6]: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/ "ICO — Age appropriate design: a code of practice for online services"

[7]: https://anvisalegis.datalegis.net/action/ActionDatalegis.php?acao=abrirTextoAto&tipo=RDC&numeroAto=00000657&seqAto=000&valorAno=2022&orgao=RDC/DC/ANVISA/MS&codTipo=&desItem=&desItemFim=&cod_menu=1696&cod_modulo=134&pesquisa=true "ANVISA — RDC nº 657/2022: software como dispositivo médico"

[8]: https://www.nice.org.uk/what-nice-does/digital-health/evidence-standards-framework-esf-for-digital-health-technologies "NICE — Evidence Standards Framework for Digital Health Technologies"
