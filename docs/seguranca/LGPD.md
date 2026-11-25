# LGPD e proteção de crianças — o que o NeuroPlay precisa

Data: 24/11/2026. Este documento é um checklist técnico e de produto. **Não substitui parecer jurídico**; antes de uso real com crianças, a escola, clínica ou instituição responsável deve validá-lo com um profissional de direito digital.

## 1. Por que este projeto exige cuidado redobrado

- **Titulares são crianças e adolescentes.** O art. 14 da LGPD exige que o tratamento seja feito no **melhor interesse** deles.
- **Base legal.** O Enunciado CD/ANPD nº 1/2023 admite qualquer base legal dos arts. 7º ou 11, desde que prevaleça o melhor interesse. **Se a base for o consentimento**, ele deve ser **específico e em destaque, dado por pelo menos um dos pais ou responsável legal** (art. 14, §1º), e o controlador deve fazer **todos os esforços razoáveis para verificar** que foi o responsável quem consentiu (art. 14, §5º).
- **Dado de saúde é dado sensível** (art. 5º, II e art. 11). Diagnóstico de TEA ou TDAH é dado de saúde. O NeuroPlay **não coleta diagnóstico** e não deve passar a coletar sem necessidade justificada.
- **ECA Digital (Lei 15.211/2025)**, em vigor desde 17/03/2026, vale para produtos e serviços digitais acessíveis a crianças e adolescentes, **inclusive jogos**. A ANPD fiscaliza. Exige proteção por padrão, ferramentas de supervisão parental e limita publicidade dirigida a esse público.
- **Incidentes:** pela Resolução CD/ANPD nº 15/2024, a comunicação à ANPD e aos titulares deve ocorrer em **3 dias úteis** a partir do conhecimento do incidente, com complemento em até 20 dias úteis e registro guardado por no mínimo 5 anos. Agentes de pequeno porte têm o prazo dobrado.

## 2. Situação atual × o que falta

| Requisito | Base | Situação no NeuroPlay | O que fazer |
|---|---|---|---|
| Definir controlador, operador e encarregado | Arts. 5º, 37, 39, 41 | Não definido | A escola/clínica que usa o sistema tende a ser a **controladora**; quem hospeda e mantém o NeuroPlay, a **operadora**. Formalizar em contrato e indicar o encarregado (DPO) e o canal de contato |
| Base legal documentada | Arts. 7º, 11, 14; Enunciado ANPD 1/2023 | Consentimento registrado no sistema | Registrar por escrito a base usada para cada finalidade (jogar, relatório ao educador, pesquisa) |
| Consentimento **do responsável**, em destaque, com verificação razoável | Art. 14, §§1º e 5º | Parcial: o consentimento é registrado pelo educador, com campo de evidência; não há confirmação pelo responsável | Termo assinado pelo responsável (papel ou digital) anexado como evidência; fluxo opcional de confirmação por e-mail do responsável (`GuardianLink` já existe) |
| Transparência pública sobre os dados de crianças | Art. 14, §§2º e 6º | Faltava | Publicar o aviso de privacidade (rascunho em [`AVISO_DE_PRIVACIDADE.md`](AVISO_DE_PRIVACIDADE.md)), em linguagem simples para pais e adaptada à criança, e linkar no app |
| Minimização | Art. 6º, III | **Bom:** apelido pseudonimizado, ano de nascimento opcional, sem foto, sem localização, sem diagnóstico; Google Fonts removido | Manter; não adicionar campos sem finalidade documentada |
| Finalidade e limite de interpretação | Art. 6º, I e II | **Bom:** relatórios descritivos, sem classificação clínica | Manter o aviso "não é diagnóstico" no app e nos relatórios |
| Direitos do titular (acesso, correção, portabilidade, eliminação, revogação) | Art. 18 | Parcial: exportação e revogação de consentimento existem; exclusão é lógica | Exclusão definitiva sob pedido; edição de apelido; canal para pedidos dos responsáveis com prazo de resposta |
| Retenção e eliminação | Arts. 15 e 16 | Não definida | Definir prazo (por exemplo, fim do ano letivo + 6 meses) e rotina automática de eliminação |
| Segurança | Arts. 46 a 49 | Ver [`REVISAO_SEGURANCA.md`](REVISAO_SEGURANCA.md) (12 correções feitas) | Concluir as pendências da revisão e o checklist de produção |
| Plano de resposta a incidentes | Art. 48; Res. CD/ANPD 15/2024 | Não existe | Plano escrito: quem decide, como avaliar o risco, modelo de comunicação, prazo de 3 dias úteis, registro por 5 anos |
| Relatório de Impacto (RIPD) | Art. 38 | Não existe | Elaborar o RIPD: tratamento de dados de crianças, potencialmente sensíveis, em ambiente escolar |
| Registro das operações | Art. 37 | Parcial: auditoria de eventos no sistema | Inventário: dados, finalidade, base legal, prazo, onde ficam, quem acessa |
| Terceiros e transferência internacional | Arts. 33 e 39 | GitHub Pages (frontend estático) e a hospedagem da API e do banco | Listar fornecedores no aviso de privacidade; contrato de operador com a hospedagem da API |
| ECA Digital | Lei 15.211/2025 | **Bom:** sem publicidade, sem chat entre usuários, sem perfil comercial, sem compras; controle por adulto | Confirmar o enquadramento com assessoria jurídica; manter "proteção por padrão" como requisito de produto |
| Pesquisa com crianças (artigo, TCC, extensão) | Ética em pesquisa | — | Uso dos dados em pesquisa requer aprovação de Comitê de Ética (CEP), TCLE do responsável e assentimento da criança; usar dados anonimizados |

## 3. Requisitos de produto que saem daqui

1. **Termo do responsável:** ao registrar consentimento, exigir o upload ou a referência do termo assinado e o nome do responsável.
2. **Aviso de privacidade** acessível no login e no painel do educador.
3. **Exclusão definitiva** com confirmação e registro na auditoria.
4. **Retenção automática** configurável por organização.
5. **Painel de pedidos do titular** (acesso, correção, exclusão), com prazo e registro.
6. **Nenhuma** coleta de diagnóstico, foto, voz ou localização.

## Referências

- Lei 13.709/2018 (LGPD), arts. 5º, 6º, 7º, 11, 14, 15, 16, 18, 37, 38, 41, 46 a 49.
- ANPD. Enunciado CD/ANPD nº 1, de 22/05/2023 (dados de crianças e adolescentes).
- ANPD. Resolução CD/ANPD nº 15/2024 (Regulamento de Comunicação de Incidente de Segurança).
- Lei 15.211/2025 (ECA Digital), em vigor desde 17/03/2026.
- ANPD. Guia orientativo de segurança da informação para agentes de tratamento de pequeno porte.
