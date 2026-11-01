# Código-fonte do app (versão 10)

- `src/logica.js`: regras (status, previsão de parto, crias, pesagem, novilhas, venda por peso, relatórios, lançamento em lote). Usado pelo app e pela integração por foto.
- `src/app.jsx` e `src/telas/`: telas. A tela **Crias** é feita de `Crias.jsx` (abas) e `CriasLista`, `CriasPesar`, `CriasParaVender`, `CriasNovilhas`, `CriasVendas`. `src/estilos.js`: visual. `src/api.js`: conversa com a planilha. `src/excel.js`: exportação.
- `Code_v10.gs`: script da planilha (Apps Script) da versão 10 (cria a aba Mortes). `Code_v9.gs` e `Code_v8.gs`: anteriores, só para consulta.
- Para gerar o site: `npm install` e `node build9.mjs` (cria em `site9/`: `app.js`, `logica.js`, `pdf.js` e `sw.js`). Copiar os quatro para `teste/` (ou para a raiz, na versão de verdade), junto com o `index.html` que pede `app.js?v=9.5` e registra o `sw.js`.
- No modo teste (`window.MODO_TESTE = true` no `index.html`) o app só lê a planilha e nunca grava.

## Como funcionam as crias (v9.3)
- Uma cria é o evento de nascimento. Peso, desmama e venda são eventos ligados a ela (`pesagem`, `desmama`, `venda` e `vendaitem`).
- Desmama de fêmea cria a novilha como matriz `cria-<id do nascimento>`, categoria Novilha, destino "A definir". Novilha em recria (destino "A definir" ou "Venda") não conta nas matrizes; com destino "Matriz" conta.
- Novilha com peso a partir do corte (padrão 280 kg, configurável na aba Config da planilha) fica "apta" para virar matriz.
- Venda por peso: comprador e valor do kg, e uma linha por animal (número, tipo e peso). Animal com número dá baixa; vaca de descarte sem número só entra na venda.
- Funcionário vê Crias e Pesar. Proprietário (senha) também desmama, define metas, novilhas e vendas.

## Mortes e correções (v9.4)
- Aba **Morte** em Lançar, para qualquer animal (cria, novilha, vaca, touro, boi ou animal sem cadastro). Funcionário só lança; o proprietário (senha) corrige ou anula. Evento `morte` (aba Mortes da planilha): data, causa, observação, tipo do animal, ligação com cria e matriz.
- Morte de vaca: a matriz vira status "Morta" (sai de vacas, previsão e totais). Anular a morte devolve o status anterior (`statusAnterior`). A cria da vaca morta continua normal e aparece como "órfã" para os funcionários.
- Nascimento agora exige mãe, sexo e brinco da cria. O proprietário corrige nascimentos já lançados (lista com busca e filtro "Faltando dados"); trocar o brinco leva junto pesagens, desmama, novilha e morte da cria.
- Relatório **Mortalidade** (causa, tipo de animal, mês, lote, lista), com impressão e Excel.

## Ordem para publicar (versão de verdade)
1. Publicar `Code_v10.gs` como nova versão da implantação do Apps Script (a v10 é compatível com o app 9.3) e rodar `repararPlanilha`.
2. Conferir `?action=getAll` (versao 10 e aba Mortes criada).
3. Só então copiar `site9/app.js` e `site9/logica.js` para a raiz do repositório e tirar o `window.MODO_TESTE` (a raiz já não tem).

## Uso sem internet, Pesar e Desmama (v9.5)
- **Fila no celular** (`src/fila.js`): todo lançamento muda a tela na hora e entra numa fila guardada no aparelho (localStorage). A fila manda para a planilha um de cada vez, na ordem; sem internet espera e reenvia sozinha (ao voltar a internet, ao abrir o app e a cada 20 s). No topo aparece "N no celular" (sem internet), "gravando N" ou "erro ao gravar"; tocando, abre a lista. Só o dono pode descartar um item que a planilha recusa sempre.
- **Cópia dos dados no celular**: o app abre na hora com a última cópia (e a fila por cima) e depois relê a planilha. Sem internet continua funcionando com a cópia. "Sincronizar planilha agora" só roda com a fila vazia e com dados lidos da planilha.
- **Service worker** (`src/sw.js`): guarda página, `app.js`, `logica.js`, `pdf.js`, bibliotecas (esm.sh) e fontes, para o app abrir sem internet. Nunca guarda a resposta da planilha.
- **Script da planilha v11** (`Code_v11.gs`): ignora linha de evento ou touro com id que já existe (um reenvio depois de resposta perdida não duplica). Nada mais mudou. Publicar o v11 ANTES do app 9.5 na raiz.
- **Pesar**: cartão com idade em meses e dias, nascimento, mãe e último peso (ou "Ainda não foi pesado"); número já pesado na mesma data avisa com número e peso, e "Lançar mesmo assim" grava os dois pesos marcados como 2x (lista, relatório do dia, ficha); a lista em digitação fica guardada no celular; botão "PDF da pesagem" (relatório do dia: `relatorioPesagemDia`).
- **Desmama**: o mesmo cartão da cria e a idade em meses e dias calculada sozinha pelo nascimento (editável; grava em dias na coluna `idadeDias`).
- **PDF** (`src/pdf.js`, jsPDF + autotable, arquivo separado carregado só quando pedem): serve para qualquer relatório no formato { titulo, resumo, secoes }. Já está nos Relatórios do dono e no Pesar.

## Testes (pasta `testes/`)
- `node testes/test_script_v11.cjs`: script da planilha no simulador do Google Planilhas (`simulador.cjs`).
- `node testes/test_logica_95.mjs`: regras novas (idade, ficha, 2x, relatório do dia, fila).
- Navegador (Chromium, sem internet de verdade: bibliotecas locais e planilha simulada):
  `node build9.mjs && node testes/montar_site_teste.mjs && node testes/servidor.cjs 8765 &` e depois
  `python3 testes/test_navegador_95.py` (21 testes: Pesar, 2x, PDF, sem internet, reenvio sem duplicar, erro da planilha, Desmama, passeio por todas as telas). Para a área de teste: `node testes/montar_site_teste.mjs teste` e `python3 testes/test_modo_teste.py`.

## App 10 (19/10/2026): curral, toque, vacinas, touros e relatórios para todos
- **`src/manejo.js`**: regras novas (protocolos de IATF e monta, manejo de curral, toque geral, vacinas, touros, relatórios do app). `logica.js` continua com as regras antigas e é o arquivo usado pela integração por foto.
- **Tela Manejo** (`telas/Manejo.jsx`, para todos): abas Protocolos (`Protocolos.jsx` + `ManejoCurral.jsx`), Toque (`Toque.jsx`) e Vacinas (`Vacinas.jsx`). Peças comuns em `ManejoComum.jsx` (vacinas do cabeçalho e lista que se marca, começando desmarcada).
- **Protocolo IATF** (dono cria): nome, D0, modelo de 3 ou 4 manejos (dias, descrição, medicamentos, qual é a IA), sêmen padrão, técnico, custo opcional, animais (busca mostra último parto e última IATF; atalhos "todas as vazias" e "vazias e novilhas aptas do último toque"). No dia da IA cada vaca marcada ganha um lançamento de IATF (protocoloId, sêmen), que alimenta previsão de parto, doses do sêmen e pai da cria. Brinco digitado fora do protocolo é avisado.
- **Monta (repasse)**: botão "Mandar para o repasse" cria o lote de monta 17 dias depois da IA, por 90 dias, com vários touros vivos. O pai da cria sem IATF compatível passa a ser "Monta · touro A ou B" (`origemDaCria` com protocolos).
- **Toque geral**: cabeçalho (data, veterinário, método, vacinas) e todas as matrizes e novilhas com crias, último parto, serviço, último toque e vacina. Cheia (com dias, mostra concepção, previsão e origem), Vazia, Descarte (motivo), novilha Apta/Não apta, Ausente. Avisos: dias que não batem com o parto, prenhez sem IATF nem monta, perda. Marcações guardadas no celular; "Gravar" manda diagnósticos (com toqueId) e um manejo "Toque". Encerrar mostra o resumo (taxa de prenhez por protocolo, sêmen, touro, lote, categoria), PDF e "Montar protocolo" (dono). Novilha apta com destino de recria passa a destino Matriz.
- **Vacinas**: aplicações ficam no manejo (aba Manejos, coluna aplicacoes) e valem para os presentes. Reforço da Lepto aos 6 meses de prenhez (concepção pela previsão de parto: toque menos dias de gestação, ou IATF); vacina reprodutiva por ciclo com "Foi vacinada?"; brucelose das bezerras de 3 a 8 meses (crias como `c:<id do nascimento>`); vacinas periódicas que o dono cria. Calendário e dias mínimos de parida na aba Config (`calendarioVacinas`, `diasMinPosParto`). A tela Parto mostra a vacina de cada cheia.
- **Touros** (Rebanho > Touros): sêmen (central, código, partida, tipo, doses, ajuste, compra, botijão, caneca, parto fácil, RGD, DEPs) ou touro vivo (brinco, nascimento, origem, compra, RGD, pais, lote, peso, exame andrológico com aviso de vencido). Só o dono cadastra e altera.
- **Relatórios para todos**, com PDF: crias por sexo (ordem numérica), vazias, prenhas, situação, previsão, último toque, IATF, vacinas, pesagens, crias e pesos, descartes, mortalidade, vendas (sem valores para o funcionário), touros. Dono vê também valores, Excel, Planilha, nascimentos e melhores vacas.
- **Script v12** (`Code_v12.gs`): abas Protocolos e Manejos, colunas novas no fim de Touros, Diagnosticos e IATF, ações upsertTouros e upsertProtocolos, config nova. Inclui a regra da v11 (não duplica reenvio). O app 10 exige o script 12.
- Testes: `node testes/test_script_v12.cjs`, `node testes/test_manejo.mjs`, `python3 testes/test_navegador_10.py` (com o servidor de teste no ar).

## App 10.5 (31/10/2026): Manejo > Geral por brinco e Parto > Vazias completa
- **Manejo > Geral** (`src/manejoGeral.js`, `src/telas/ManejoBusca.jsx`, `src/telas/ManejoGeral.jsx`): o brinco digitado é procurado em matrizes, novilhas, crias e touros vivos (`buscarAnimais`). A ficha aparece na hora, sem Enter, com a situação (`situacaoMatriz`: cheia com previsão de parto em data e dias, atrasada, vazia com último parto, cria ao pé, lote atual, vendida/morta). Botão Marcar (é do lote) ou Incluir (outro lote). Brinco que não existe entra como "Não está no banco de dados nem em nenhum lote" (`semCadastro: true`). Lote novo sem animais grava. Brinco repetido mostra todos os animais. Letra, barra e maiúscula/minúscula (E5, 219/1413) valem, com botão ABC/123 no campo.
- Na tela, o estado guarda só `incluidos: [{brinco, animal}]` e o resto é recalculado (`resolverInclusoes`), então trocar o lote não perde nada. Rascunho antigo (`fora`) é convertido ao abrir.
- Gravação: itens de fora ganham `sit` (situação no dia do manejo) e `semCadastro`; o relatório da conferência separa "De outro lote" e "Sem cadastro". **Sem mudança no script: continua v13.** Touros vivos com brinco e lote entram na relação do lote (`t:<id>`).
- **Parto > Vazias** (`src/telas/Parto.jsx`): colunas Brinco, Categoria (com "último parto há N dias"), Partos (todas as datas) e Crias (brinco da cria de cada parto, `natim.` para natimorto); ao tocar, detalhe de cada parto (sexo, situação da cria, pai pela IATF/monta, pesos, tipo de parto). Busca pelo brinco da vaca ou da cria. Ajuda `partosPorMatriz` em `logica.js` (também usado no Rebanho).
- Corrigido: a caixa "Incluir as crias ao pé" ficava espremida (a classe `chk` do CSS tem 26 px de largura; agora `chk-lin`).
- Testes: `node testes/test_manejo_geral.mjs` (15), `python3 testes/test_navegador_geral.py` (16), `python3 testes/test_parto_vazias.py` (30), mais todos os anteriores.

## App 10.6 (31/10/2026): observação por brinco no Manejo > Geral
- Cada brinco do manejo (do lote, de outro lote ou sem cadastro) pode levar uma **observação**: campo na ficha que aparece ao digitar o brinco, botão com ícone de nota em cada linha da lista do lote, e campo nas linhas "de fora" e "sem cadastro". O rascunho guarda as observações (`f.notas`, chave = id do animal ou `b:<brinco>`, ver `chaveNota`).
- Gravação **sem mudar o script (continua v13)**: a observação vai dentro da coluna `foraDoLote` (campo `nota`; `notaOk` = data em que o proprietário efetivou). Animal do lote com observação entra nessa lista com `doLote: true` e **não conta como "de fora"** (`conferencia` filtra); presentes e ausentes não mudam por causa da nota. Observação em animal que não foi marcado também é gravada (ele continua como faltando).
- Proprietário: cartão **Observações para efetivar** na aba Geral (`pendenciasNotas`), botão Efetivada por linha ou "Marcar todas", Desfazer logo após marcar (`efetivarNotas` → `efetivarObservacoes` em `app.jsx`, mesmo caminho de gravação da confirmação de lote). O número na aba Geral soma mudanças de lote e observações. Funcionário só anota; não vê o cartão.
- Conferência e PDF: KPI "Observações" e seção "Observações por brinco" (brinco, animal e situação, observação, efetivada).
- Testes: `node testes/test_manejo_geral.mjs` (20) e `python3 testes/test_navegador_notas.py` (12), mais todos os anteriores.

## App 10.7 (31/10/2026): editar, incluir e excluir manejo geral já gravado
- Na conferência de um manejo geral (toque na lista "Manejos feitos") há botões conforme quem está usando:
  - **Qualquer usuário**: "Incluir brincos e observações" reabre o manejo no mesmo formulário com o cabeçalho travado. Pode marcar mais animais, incluir mais brincos (de outro lote e sem cadastro), escrever observação nova e corrigir observação já gravada. Não consegue desmarcar quem já passou, tirar brinco gravado, mudar cabeçalho nem decidir mudança de lote (o pedido continua pendente para o proprietário). Isso é imposto nas regras (`editarManejoGeral` sem `dono`), não só na tela.
  - **Proprietário**: "Editar manejo" (muda data, lote, manejo, responsável, produtos, quem passou, brincos de fora, observações, e aprova mudança de lote) e "Excluir manejo" (confirmação com o resumo do que se perde).
- Regras em `src/manejoGeral.js`: `formDoManejo`, `idsDoManejo`, `editarManejoGeral(estado, id, form, {dono})`, `resumoExclusao`, `excluirManejoGeral`. Brincos já gravados voltam como itens "fixos" (`manter: true`) que guardam a decisão de lote que tinham; só pedido aprovado na edição mexe no lote da matriz. Mudança de lote já confirmada NÃO volta ao excluir. A efetivação de uma observação só é mantida se o texto não mudou.
- Gravação: edição usa `atualizarCampos` (já existe no script 13). `logica.js` ganhou `mudancas.excluir` em `postsDeMudancas` e `aplicarMudancasNoEstado`. Em `app.jsx`: `corrigirManejoGeral` e `excluirManejo`.
- **Script v14** (`Code_v14.gs`): ação `excluirEventos` (só `manejo` com etapa `Geral`; outras etapas e tipos são recusados), copia a linha apagada para a aba **Excluidos** (excluidoEm, tipo, id, linha em JSON) e compacta a aba Manejos. O resto é igual à v13. **Sem o script 14 o app edita e inclui, mas Excluir avisa que precisa do script 14 e não apaga nada.** O app continua exigindo só o script 12.
- Manejos gravados antes da 10.6 não têm `semCadastro` nos brincos sem cadastro: o formulário de edição usa `semCad()` (sem animal ligado = sem cadastro).
- Testes: `node testes/test_manejo_geral.mjs` (27), `node testes/test_script_v14.cjs` (6), `python3 testes/test_navegador_editar.py` (13, com o servidor no script 14) e `python3 testes/test_navegador_editar_v13.py` (4, com `node testes/servidor.cjs 8766 Code_v13.gs`). O servidor de teste agora usa o `Code_v14.gs`.

## App 11 (01/11/26): ficha do animal, rebanho completo, nascimentos, diagnóstico, indução e cadastros
- **Busca e ficha** (`src/ficha.js` regras, `src/telas/Ficha.jsx` tela): lupa no topo para todos. A ficha mostra identificação, mãe/pai, reprodução (último toque, previsão, última IATF, intervalo entre partos), partos e crias clicáveis, peso com gráfico, manejos com observações, indução (novilha) e linha do tempo. Brinco repetido mostra a escolha. Alterar cadastro só com a senha (abre direto a edição).
- **Rebanho**: resumo e abas Todos, Matrizes, Crias, Touros, Bois. Vaca mostra previsão de parto (cheia) e última cria; bezerro mostra último peso; novilha mostra "Induzida em" ou "Não induzida".
- **Bois**: ficam na aba Touros da planilha com `tipo` "Boi" (nome "<categoria> <brinco>"). Não aparecem como reprodutor.
- **Nascimentos** (antes Crias): nova sub-aba Nascimentos por ano (totais, gráfico por mês, faltando dados). O lançamento do parto continua em Lançar.
- **Diagnóstico** (antes Parto): Cheias, Vazias e Toque (o Toque saiu do Manejo).
- **Manejo > Indução**: etapas D0 · Implante, D12 · Retirada e Avaliação, gravadas como manejo com etapa "Indução · <etapa>". Na avaliação: presentes = ciclando, ausentes = não ciclou.
- **Cadastros** (engrenagem, só dono): listas do app na aba Config, chave `cadastros` (JSON). Campos com `cadastro:` em `CAMPOS` (logica.js) usam a lista; texto vira sugestão. **Precisa do script v15** (`Code_v15.gs`: só acrescenta a chave `cadastros` na Config). Sem o v15 a mudança fica só na tela.
- Testes: `node testes/test_script_v15.cjs` e `python3 testes/test_navegador_11.py` (servidor de teste agora simula o v15).
