# Importação do histórico (22/10/2026)

Scripts usados para montar a importação dos nascimentos de 2023-2025 (planilha REBANHO 2026 do Dropbox, aba NASCIMENTOS)
e a pesagem/manejos de 10/10/2026. Os dados da fazenda NÃO ficam no repositório: os scripts leem arquivos baixados na
pasta de trabalho da sessão (texto da planilha do Dropbox e a planilha do app exportada do Drive).

1. `para_getall.py plan.xlsx getall.json`: planilha do app (xlsx do Drive) no formato do getAll.
2. `montar_historico.py`: regras da importação (mãe no cadastro, número repetido, cria que virou matriz, situação de origem).
3. `simular.mjs`: aplica a importação sobre os dados reais e roda as regras do app (nada é gravado).
4. `montar_1010.mjs`: pesagem e manejos de 10/10/2026 (ids fixos `p1010-*` e `mj1010-*`; reenvio não duplica).
5. `dados_pagina.mjs`: dados da página de conferência.

Nada é gravado sem o OK do Pandolfi. A gravação é feita pelo navegador do computador dele (appendEventos em pacotes de 40).
