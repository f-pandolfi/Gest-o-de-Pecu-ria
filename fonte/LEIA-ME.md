# Código-fonte do app (versão 9.3)

- `src/logica.js`: regras (status, previsão de parto, crias, pesagem, novilhas, venda por peso, relatórios, lançamento em lote). Usado pelo app e pela integração por foto.
- `src/app.jsx` e `src/telas/`: telas. A tela **Crias** é feita de `Crias.jsx` (abas) e `CriasLista`, `CriasPesar`, `CriasParaVender`, `CriasNovilhas`, `CriasVendas`. `src/estilos.js`: visual. `src/api.js`: conversa com a planilha. `src/excel.js`: exportação.
- `Code_v9.gs`: script da planilha (Apps Script) da versão 9. `Code_v8.gs`: o anterior, só para consulta.
- Para gerar o site: `npm install` e `node build9.mjs` (cria `site9/app.js` e `site9/logica.js`). Copiar para `teste/` (ou para a raiz, na versão de verdade).
- No modo teste (`window.MODO_TESTE = true` no `index.html`) o app só lê a planilha e nunca grava.

## Como funcionam as crias (v9.3)
- Uma cria é o evento de nascimento. Peso, desmama e venda são eventos ligados a ela (`pesagem`, `desmama`, `venda` e `vendaitem`).
- Desmama de fêmea cria a novilha como matriz `cria-<id do nascimento>`, categoria Novilha, destino "A definir". Novilha em recria (destino "A definir" ou "Venda") não conta nas matrizes; com destino "Matriz" conta.
- Novilha com peso a partir do corte (padrão 280 kg, configurável na aba Config da planilha) fica "apta" para virar matriz.
- Venda por peso: comprador e valor do kg, e uma linha por animal (número, tipo e peso). Animal com número dá baixa; vaca de descarte sem número só entra na venda.
- Funcionário vê Crias e Pesar. Proprietário (senha) também desmama, define metas, novilhas e vendas.

## Ordem para publicar (versão de verdade)
1. Publicar `Code_v9.gs` como nova versão da implantação do Apps Script (a v9 é compatível com o app 9.2) e rodar `repararPlanilha`.
2. Conferir `?action=getAll` (versao 9).
3. Só então copiar `site9/app.js` e `site9/logica.js` para a raiz do repositório e tirar o `window.MODO_TESTE` (a raiz já não tem).
