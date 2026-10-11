# Código-fonte do app (versão 9)

- `src/logica.js`: regras (status, previsão de parto, relatórios, lançamento em lote). Usado pelo app e pela integração por foto.
- `src/app.jsx` e `src/telas/`: telas. `src/estilos.js`: visual. `src/api.js`: conversa com a planilha. `src/excel.js`: exportação.
- `Code_v8.gs`: script da planilha (Apps Script).
- Para gerar o site: `npm install` e `node build9.mjs` (cria `site9/app.js` e `site9/logica.js`). Copiar para `teste/` (ou para a raiz, na versão de verdade).
- No modo teste (`window.MODO_TESTE = true` no `index.html`) o app só lê a planilha e nunca grava.
