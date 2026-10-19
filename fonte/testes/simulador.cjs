// Simulador do Google Planilhas para testar o script da planilha (Code_vXX.gs) sem a internet.
// Roda o próprio arquivo .gs dentro de um "Apps Script de mentira": abas, células, fórmulas (só guardadas), datas.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function criarPlanilha() {
  const abas = [];
  function novaAba(nome) {
    const cel = new Map(); // "l,c" -> valor
    const form = new Map(); // "l,c" -> fórmula
    let maxL = 1000; let maxC = 26;
    const sh = {
      _nome: nome, _cel: cel, _form: form,
      getName: () => nome,
      getLastRow() { let u = 0; for (const k of [...cel.keys(), ...form.keys()]) { const [l] = k.split(',').map(Number); const v = cel.get(k); if ((v !== '' && v !== undefined && v !== null) || form.has(k)) u = Math.max(u, l); } return u; },
      getLastColumn() { let u = 0; for (const k of [...cel.keys(), ...form.keys()]) { const c = Number(k.split(',')[1]); const v = cel.get(k); if ((v !== '' && v !== undefined && v !== null) || form.has(k)) u = Math.max(u, c); } return u; },
      getMaxRows: () => maxL, getMaxColumns: () => maxC,
      insertRowsAfter: (_, n) => { maxL += n; }, insertColumnsAfter: (_, n) => { maxC += n; },
      getRange(l, c, nl, nc) {
        nl = nl || 1; nc = nc || 1;
        const r = {
          getValues() { const out = []; for (let i = 0; i < nl; i++) { const row = []; for (let j = 0; j < nc; j++) { const v = cel.get(`${l + i},${c + j}`); row.push(v === undefined ? '' : v); } out.push(row); } return out; },
          setValues(vals) {
            if (vals.length !== nl || vals.some((row) => row.length !== nc)) throw new Error(`tamanho errado em setValues (${vals.length}x${vals[0] && vals[0].length} em ${nl}x${nc})`);
            vals.forEach((row, i) => row.forEach((v, j) => { cel.set(`${l + i},${c + j}`, v); form.delete(`${l + i},${c + j}`); }));
            return r;
          },
          setValue(v) { cel.set(`${l},${c}`, v); return r; },
          setFormulas(fs2) { fs2.forEach((row, i) => row.forEach((f, j) => { form.set(`${l + i},${c + j}`, f); cel.set(`${l + i},${c + j}`, ''); })); return r; },
          applyRowBanding() { return { remove() {} }; },
          merge() { return r; },
        };
        const px = new Proxy(r, { get: (t, p) => (p in t ? t[p] : () => px) });
        ['setValues', 'setValue', 'setFormulas', 'merge'].forEach((n) => { const f = r[n]; r[n] = (...a) => { f(...a); return px; }; });
        return px;
      },
      getBandings: () => [], clear() { cel.clear(); form.clear(); },
      setFrozenRows() {}, setRowHeight() {}, setTabColor() {}, autoResizeColumns() {}, getColumnWidth: () => 100, setColumnWidth() {},
    };
    return sh;
  }
  const ss = {
    getSheetByName: (n) => abas.find((a) => a._nome === n) || null,
    insertSheet(n, pos) { const a = novaAba(n); if (pos === 0) abas.unshift(a); else abas.push(a); return a; },
    getSpreadsheetTimeZone: () => 'America/Sao_Paulo', getSpreadsheetLocale: () => 'pt_BR',
    setActiveSheet() {}, moveActiveSheet() {}, getSheets: () => abas,
  };
  return { ss, abas };
}

// Carrega o script .gs e devolve funções para chamar como se fosse o app (doGet / doPost)
function carregarScript(arquivoGs) {
  const { ss, abas } = criarPlanilha();
  const p2 = (n) => String(n).padStart(2, '0');
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, BandingTheme: { LIGHT_GREEN: 'LG' } },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ _t: t, setMimeType() { return this; } }) },
    Utilities: {
      // datas guardadas ao meio-dia UTC (evita virar o dia por causa do fuso)
      parseDate: (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); },
      formatDate: (d) => `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`,
    },
    Session: { getScriptTimeZone: () => 'America/Sao_Paulo' },
    console, Date, JSON, Math, Object, String, Number, Array, Error, RegExp, parseInt, parseFloat, isNaN,
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(arquivoGs, 'utf8'), ctx, { filename: path.basename(arquivoGs) });
  const resp = (o) => JSON.parse(o._t);
  return {
    ss, abas,
    get: (action) => resp(ctx.doGet({ parameter: { action: action || 'getAll' } })),
    post: (body) => resp(ctx.doPost({ postData: { contents: JSON.stringify(body) } })),
    linhas: (aba) => { const sh = ss.getSheetByName(aba); if (!sh) return 0; return Math.max(0, sh.getLastRow() - 1); },
  };
}

module.exports = { carregarScript, criarPlanilha };
