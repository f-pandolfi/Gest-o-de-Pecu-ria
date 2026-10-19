# Código-fonte do app (versão 9.5)

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
