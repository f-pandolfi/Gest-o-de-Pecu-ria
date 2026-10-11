/**
 * Backend da planilha "Gestão Pecuária - Fazenda Ibiraçu"  ·  VERSÃO 8
 *
 * Novidades da v8 (em relação à v7):
 *  - CORRIGE as colunas calculadas (Último Parto, Nº Cria, Previsão de Parto): em planilha com idioma pt-BR o
 *    Google exige ponto e vírgula nas fórmulas; agora o separador é escolhido pelo idioma da planilha.
 *  - repararPlanilha converte datas gravadas como texto ("2026-05-09T03:00:00.000Z") em datas de verdade.
 *
 * Novidades da v7 (em relação à v6):
 *  - Conserta a causa do "lancei e a planilha não gravou": o app agora consegue conferir a versão deste script.
 *  - Migra planilhas antigas SEM bagunçar os dados (lê pelo nome da coluna, não pela posição).
 *  - Garante linhas/colunas suficientes antes de formatar (a v3-v6 podia falhar em abas novas).
 *  - Remove faixas alternadas antigas antes de recriar (evita erro de sobreposição).
 *  - Trava de gravação (duas pessoas salvando ao mesmo tempo não se atropelam).
 *  - Erros voltam como JSON legível ({"error": "..."}), nunca como página HTML.
 *  - Novas ações: appendEventos, upsertMatrizes, atualizarCampos, repararPlanilha.
 *  - Previsão de parto na planilha só aparece para matriz "Cheia" e ignora toque/IATF anteriores ao último parto.
 */

var VERSAO = 8;
var COR_CABECALHO = '#2C4A3B';
var COR_TEXTO_CABECALHO = '#FFFFFF';
var LINHAS_RESERVADAS = 1500;   // faixa de formatação pré-aplicada (cobre lançamentos futuros)
var PERIODO_GESTACAO_DIAS = 285; // mesmo período usado na planilha original da fazenda

var MATRIZES_COLS = ['id','brinco','categoria','raca','lote','dataNascimento','partosAnteriores','status','createdAt'];
var EXTRAS_MATRIZES = ['Último Parto', 'Nº Cria (Último Parto)', 'Previsão de Parto'];
var TOUROS_COLS = ['id','nome','raca','fornecedor','anoAquisicao','doses','custoDose','observacoes','createdAt'];
var CAMPOS_DATA = ['data', 'dataNascimento', 'dataInicioProtocolo'];

var TIPO_TABS = [
  {tipo:'nascimento', sheet:'Nascimentos', cor:'#7FA86B', cols:['id','data','matrizId','resultadoParto','sexo','pesoNascer','brincoBezerro','pelagem','touroId','touroOutro','tipoParto','observacoes','createdAt']},
  {tipo:'desmama', sheet:'Desmama', cor:'#7FA86B', cols:['id','data','brincoBezerro','pesoDesmama','idadeDias','createdAt']},
  {tipo:'recria', sheet:'Recria', cor:'#7FA86B', cols:['id','data','matrizId','pesoAtual','aptaReproducao','observacoes','createdAt']},
  {tipo:'iatf', sheet:'IATF', cor:'#D4954A', cols:['id','data','matrizId','tipoServico','numeroServico','dataInicioProtocolo','touroId','touroOutro','tecnico','custo','observacoes','createdAt']},
  {tipo:'diagnostico', sheet:'Diagnosticos', cor:'#D4954A', cols:['id','data','matrizId','resultado','metodo','dg','veterinario','custo','motivo','createdAt']},
  {tipo:'venda', sheet:'Vendas', cor:'#D4A63A', cols:['id','data','categoria','animais','pesoTotal','valorArroba','valorTotal','frete','comprador','createdAt']},
  {tipo:'insumo', sheet:'Insumos', cor:'#D4A63A', cols:['id','data','produto','quantidade','unidade','custo','categoriaAnimal','createdAt']},
  {tipo:'descarte', sheet:'Descartes', cor:'#B5533C', cols:['id','data','matrizId','motivo','origemDiagnostico','createdAt']}
];

// ============================================================
// Entradas da Web App
// ============================================================
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'getAll';
    if (action === 'getAll') return jsonResponse(getAllData());
    if (action === 'versao') return jsonResponse({ versao: VERSAO });
    return jsonResponse({ error: 'ação desconhecida: ' + action });
  } catch (err) {
    return jsonResponse({ error: mensagemErro(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    var body = JSON.parse(e.postData.contents);
    return jsonResponse(executar(body));
  } catch (err) {
    return jsonResponse({ error: mensagemErro(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function executar(body) {
  var action = body.action;

  if (action === 'syncAll') {
    // gravação completa: só para importação em massa / carga inicial / limpar tudo / "Sincronizar planilha agora"
    writeSheetCompleto('Matrizes', MATRIZES_COLS, body.matrizes || [], '#2C4A3B', true);
    writeSheetCompleto('Touros', TOUROS_COLS, body.touros || [], '#5B7FA6', false);
    var eventos = body.eventos || [];
    TIPO_TABS.forEach(function (cfg) {
      var rows = eventos.filter(function (ev) { return ev.tipo === cfg.tipo; });
      writeSheetCompleto(cfg.sheet, cfg.cols, rows, cfg.cor, false);
    });
    if (body.resumo) writeResumo(body.resumo);
    orderSheets();
    return { ok: true, versao: VERSAO };
  }

  if (action === 'appendEvento') {
    var cfg = configDoTipo(body.tipo);
    if (!cfg) return { error: 'tipo de evento desconhecido: ' + body.tipo };
    appendLinhas(cfg.sheet, cfg.cols, [body.evento], cfg.cor, false);
    return { ok: true };
  }

  if (action === 'appendEventos') {
    var porTipo = {};
    (body.itens || []).forEach(function (it) {
      if (!porTipo[it.tipo]) porTipo[it.tipo] = [];
      porTipo[it.tipo].push(it.evento);
    });
    var gravados = 0;
    Object.keys(porTipo).forEach(function (t) {
      var c = configDoTipo(t);
      if (!c) throw new Error('tipo de evento desconhecido: ' + t);
      appendLinhas(c.sheet, c.cols, porTipo[t], c.cor, false);
      gravados += porTipo[t].length;
    });
    return { ok: true, gravados: gravados };
  }

  if (action === 'appendTouro') {
    appendLinhas('Touros', TOUROS_COLS, [body.touro], '#5B7FA6', false);
    return { ok: true };
  }

  if (action === 'upsertMatriz') {
    upsertMatrizes([body.matriz]);
    return { ok: true };
  }

  if (action === 'upsertMatrizes') {
    upsertMatrizes(body.matrizes || []);
    return { ok: true, total: (body.matrizes || []).length };
  }

  if (action === 'atualizarCampos') {
    var alterados = atualizarCampos(body.tipo, body.itens || []);
    return { ok: true, alterados: alterados };
  }

  if (action === 'repararPlanilha') {
    return repararPlanilha();
  }

  return { error: 'ação desconhecida: ' + action };
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function mensagemErro(err) {
  return String(err && err.message ? err.message : err);
}

function configDoTipo(tipo) {
  return TIPO_TABS.filter(function (t) { return t.tipo === tipo; })[0];
}

// ============================================================
// Utilidades
// ============================================================
function planilha() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

// 'yyyy-MM-dd' (ou ISO com hora) -> Date no fuso da planilha; qualquer outra coisa volta como está
function paraData(v) {
  if (typeof v === 'string') {
    var m = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) {
      try { return Utilities.parseDate(m[1], planilha().getSpreadsheetTimeZone(), 'yyyy-MM-dd'); } catch (e) {}
    }
  }
  return v;
}

function linhaParaValores(cols, obj) {
  return cols.map(function (c) {
    var v = obj ? obj[c] : undefined;
    if (v === undefined || v === null) return '';
    if (CAMPOS_DATA.indexOf(c) !== -1 && v) return paraData(v);
    return v;
  });
}

function garantirTamanho(sh, linhas, colunas) {
  var maxL = sh.getMaxRows();
  if (maxL < linhas) sh.insertRowsAfter(maxL, linhas - maxL);
  var maxC = sh.getMaxColumns();
  if (maxC < colunas) sh.insertColumnsAfter(maxC, colunas - maxC);
}

function removerBandings(sh) {
  sh.getBandings().forEach(function (b) { b.remove(); });
}

function limparAba(sh) {
  removerBandings(sh);
  sh.clear();
}

function proximaLinhaLivre(sh) {
  var ultima = sh.getLastRow();
  if (ultima < 2) return 2;
  var colA = sh.getRange(1, 1, ultima, 1).getValues();
  for (var i = colA.length - 1; i >= 1; i--) {
    if (colA[i][0] !== '' && colA[i][0] !== null) return i + 2;
  }
  return 2;
}

// ============================================================
// Preparo e migração de abas
// ============================================================
function prepararAba(sh, cols, corAba, comExtras) {
  var totalCols = cols.length + (comExtras ? EXTRAS_MATRIZES.length : 0);
  garantirTamanho(sh, LINHAS_RESERVADAS, totalCols);
  removerBandings(sh);

  var cabecalho = comExtras ? cols.concat(EXTRAS_MATRIZES) : cols;
  var hdr = sh.getRange(1, 1, 1, totalCols);
  hdr.setValues([cabecalho]);
  hdr.setBackground(COR_CABECALHO).setFontColor(COR_TEXTO_CABECALHO)
    .setFontWeight('bold').setFontSize(10).setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 28);
  if (corAba) sh.setTabColor(corAba);

  sh.getRange(1, 1, LINHAS_RESERVADAS, totalCols).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREEN, true, false);

  cols.forEach(function (c, i) {
    if (CAMPOS_DATA.indexOf(c) !== -1) {
      sh.getRange(2, i + 1, LINHAS_RESERVADAS - 1, 1).setNumberFormat('dd/mm/yy');
    }
  });
  if (comExtras) {
    sh.getRange(2, cols.length + 1, LINHAS_RESERVADAS - 1, 1).setNumberFormat('dd/mm/yy');
    sh.getRange(2, cols.length + 3, LINHAS_RESERVADAS - 1, 1).setNumberFormat('dd/mm/yy');
  }

  sh.autoResizeColumns(1, totalCols);
  for (var c = 1; c <= totalCols; c++) {
    if (sh.getColumnWidth(c) > 220) sh.setColumnWidth(c, 220);
  }
}

// Devolve a aba pronta para uso. Cria se não existe; se existe num layout antigo, migra pelos NOMES das colunas.
function garantirAba(nomeAba, cols, corAba, comExtras) {
  var ss = planilha();
  var sh = ss.getSheetByName(nomeAba);
  if (!sh) {
    sh = ss.insertSheet(nomeAba);
    prepararAba(sh, cols, corAba, comExtras);
    return sh;
  }
  if (sh.getLastRow() === 0 || sh.getLastColumn() === 0) {
    prepararAba(sh, cols, corAba, comExtras);
    return sh;
  }
  var cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var layoutOk = cols.every(function (c, i) { return cab[i] === c; });
  var extrasOk = !comExtras || EXTRAS_MATRIZES.every(function (c, i) { return cab[cols.length + i] === c; });
  if (layoutOk && extrasOk) return sh;

  if (layoutOk && !extrasOk) {
    // só faltam as colunas calculadas (Último Parto etc.): não mexe nos dados
    prepararAba(sh, cols, corAba, comExtras);
    escreverFormulasExtras(sh, cols.length, 2, Math.max(sh.getLastRow() - 1, 0));
    return sh;
  }

  // layout antigo (por exemplo, sem a coluna "pelagem"): reorganiza pelos nomes das colunas
  var ultLin = sh.getLastRow();
  var dados = ultLin >= 2 ? sh.getRange(2, 1, ultLin - 1, cab.length).getValues() : [];
  var novos = dados
    .filter(function (row) { return row.some(function (v) { return v !== '' && v !== null; }); })
    .map(function (row) {
      return cols.map(function (c) {
        var idx = cab.indexOf(c);
        return idx >= 0 ? row[idx] : '';
      });
    })
    .filter(function (row) { return row[0] !== ''; });
  limparAba(sh);
  prepararAba(sh, cols, corAba, comExtras);
  if (novos.length) {
    garantirTamanho(sh, novos.length + 1, cols.length);
    sh.getRange(2, 1, novos.length, cols.length).setValues(novos);
    if (comExtras) escreverFormulasExtras(sh, cols.length, 2, novos.length);
  }
  return sh;
}

// ============================================================
// Fórmulas: Último Parto, Nº da Cria e Previsão de Parto (Matrizes)
// ============================================================
// Previsão: só para matriz "Cheia". Usa o toque mais recente com DG (dias de gestação) preenchido:
//   concepção = data do toque - DG;  previsão = concepção + 285.
// Sem DG, usa a IATF mais recente + 285. Toque/IATF anteriores ao último parto são ignorados.
// Planilha em pt-BR (e outros idiomas que usam vírgula decimal) exige ";" entre argumentos, mesmo via Apps Script.
var _sepFormula = null;
function separadorFormula() {
  if (_sepFormula === null) {
    var loc = String(planilha().getSpreadsheetLocale() || 'en_US');
    var idioma = loc.split('_')[0].toLowerCase();
    _sepFormula = ['en', 'ja', 'zh', 'ko', 'th', 'he', 'iw', 'hi'].indexOf(idioma) >= 0 ? ',' : ';';
  }
  return _sepFormula;
}

function formulasExtras(linha) {
  var L = String(linha);
  var ult = 'N(J' + L + ')';
  var sep = separadorFormula();
  return [
    '=IFERROR(MAX(FILTER(Nascimentos!$B$2:$B,Nascimentos!$C$2:$C=A' + L + ')),"")',
    '=IFERROR(INDEX(SORT(FILTER(Nascimentos!$A$2:$M,Nascimentos!$C$2:$C=A' + L + '),2,FALSE),1,7),"")',
    '=IF(H' + L + '<>"Cheia","",IFERROR(LET(linha,SORT(FILTER(Diagnosticos!$A$2:$J,Diagnosticos!$C$2:$C=A' + L +
      ',Diagnosticos!$D$2:$D="Prenhe",Diagnosticos!$F$2:$F<>"",Diagnosticos!$B$2:$B>' + ult + '),2,FALSE),INDEX(linha,1,2)+(' +
      PERIODO_GESTACAO_DIAS + '-INDEX(linha,1,6))),IFERROR(MAX(FILTER(IATF!$B$2:$B,IATF!$C$2:$C=A' + L +
      ',IATF!$B$2:$B>' + ult + '))+' + PERIODO_GESTACAO_DIAS + ',"")))'
  ].map(function (f) { return sep === ',' ? f : f.replace(/,/g, sep); });
}

function escreverFormulasExtras(sh, nColsBase, primeiraLinha, quantidade) {
  if (quantidade < 1) return;
  var f = [];
  for (var i = 0; i < quantidade; i++) f.push(formulasExtras(primeiraLinha + i));
  sh.getRange(primeiraLinha, nColsBase + 1, quantidade, EXTRAS_MATRIZES.length).setFormulas(f);
}

// ============================================================
// Gravação incremental (rápida)
// ============================================================
function appendLinhas(nomeAba, cols, objs, corAba, comExtras) {
  if (!objs || !objs.length) return 0;
  var sh = garantirAba(nomeAba, cols, corAba, comExtras);
  var ini = proximaLinhaLivre(sh);
  garantirTamanho(sh, ini + objs.length, cols.length);
  var valores = objs.map(function (o) { return linhaParaValores(cols, o); });
  sh.getRange(ini, 1, valores.length, cols.length).setValues(valores);
  return ini;
}

function upsertMatrizes(lista) {
  if (!lista || !lista.length) return;
  var sh = garantirAba('Matrizes', MATRIZES_COLS, '#2C4A3B', true);
  var ultima = sh.getLastRow();
  var ids = ultima >= 2 ? sh.getRange(2, 1, ultima - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
  lista.forEach(function (m) {
    var idx = ids.indexOf(String(m.id));
    var linha;
    if (idx >= 0) {
      linha = idx + 2;
    } else {
      linha = ids.length + 2;
      ids.push(String(m.id));
      garantirTamanho(sh, linha, MATRIZES_COLS.length + EXTRAS_MATRIZES.length);
    }
    sh.getRange(linha, 1, 1, MATRIZES_COLS.length).setValues([linhaParaValores(MATRIZES_COLS, m)]);
    escreverFormulasExtras(sh, MATRIZES_COLS.length, linha, 1);
  });
}

// Atualiza campos de eventos já gravados, achando a linha pelo id. itens: [{id, campos:{dg:120}}]
function atualizarCampos(tipo, itens) {
  var cfg = configDoTipo(tipo);
  if (!cfg) throw new Error('tipo de evento desconhecido: ' + tipo);
  var sh = garantirAba(cfg.sheet, cfg.cols, cfg.cor, false);
  var ultima = sh.getLastRow();
  if (ultima < 2) return 0;
  var faixa = sh.getRange(2, 1, ultima - 1, cfg.cols.length);
  var valores = faixa.getValues();
  var porId = {};
  valores.forEach(function (row, i) { porId[String(row[0])] = i; });
  var alterados = 0;
  itens.forEach(function (it) {
    var i = porId[String(it.id)];
    if (i === undefined) return;
    Object.keys(it.campos || {}).forEach(function (campo) {
      var col = cfg.cols.indexOf(campo);
      if (col < 0 || col === 0) return;
      var v = it.campos[campo];
      if (v === undefined || v === null) v = '';
      if (CAMPOS_DATA.indexOf(campo) !== -1 && v) v = paraData(v);
      valores[i][col] = v;
    });
    alterados++;
  });
  if (alterados) faixa.setValues(valores);
  return alterados;
}

// Converte datas gravadas como TEXTO ISO (ex.: "2026-05-09T03:00:00.000Z") em datas de verdade, nas colunas de data.
function normalizarDatasAba(sh, cols) {
  var ultLin = sh.getLastRow();
  var ultCol = sh.getLastColumn();
  if (ultLin < 2 || ultCol < 1) return 0;
  var cab = sh.getRange(1, 1, 1, ultCol).getValues()[0];
  var convertidas = 0;
  cols.forEach(function (c) {
    if (CAMPOS_DATA.indexOf(c) === -1) return;
    var idx = cab.indexOf(c);
    if (idx < 0) return;
    var faixa = sh.getRange(2, idx + 1, ultLin - 1, 1);
    var vals = faixa.getValues();
    var mudou = false;
    for (var i = 0; i < vals.length; i++) {
      var v = vals[i][0];
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
        vals[i][0] = paraData(v);
        mudou = true;
        convertidas++;
      }
    }
    if (mudou) {
      faixa.setValues(vals);
      faixa.setNumberFormat('dd/mm/yy');
    }
  });
  return convertidas;
}

// Põe todas as abas no layout atual (sem apagar dado), acerta datas em texto e refaz as fórmulas das matrizes.
function repararPlanilha() {
  var convertidas = 0;
  var shT = garantirAba('Touros', TOUROS_COLS, '#5B7FA6', false);
  TIPO_TABS.forEach(function (cfg) {
    var sh = garantirAba(cfg.sheet, cfg.cols, cfg.cor, false);
    convertidas += normalizarDatasAba(sh, cfg.cols);
  });
  var shM = garantirAba('Matrizes', MATRIZES_COLS, '#2C4A3B', true);
  convertidas += normalizarDatasAba(shM, MATRIZES_COLS);
  var total = Math.max(shM.getLastRow() - 1, 0);
  escreverFormulasExtras(shM, MATRIZES_COLS.length, 2, total);
  orderSheets();
  return { ok: true, versao: VERSAO, matrizes: total, datasConvertidas: convertidas };
}

// ============================================================
// Gravação completa (importação em massa / "Sincronizar planilha agora")
// ============================================================
function writeSheetCompleto(nomeAba, cols, rows, corAba, comExtras) {
  var ss = planilha();
  var sh = ss.getSheetByName(nomeAba);
  if (!sh) sh = ss.insertSheet(nomeAba);
  limparAba(sh);
  prepararAba(sh, cols, corAba, comExtras);
  if (rows.length > 0) {
    garantirTamanho(sh, rows.length + 1, cols.length);
    var data = rows.map(function (r) { return linhaParaValores(cols, r); });
    sh.getRange(2, 1, data.length, cols.length).setValues(data);
    if (comExtras) escreverFormulasExtras(sh, cols.length, 2, data.length);
  }
}

function writeResumo(resumoRows) {
  var ss = planilha();
  var sh = ss.getSheetByName('Resumo');
  if (!sh) sh = ss.insertSheet('Resumo', 0);
  sh.clear();

  sh.getRange(1, 1, 1, 2).merge().setValue('🐄 Fazenda Ibiraçu — Resumo da Gestão')
    .setFontSize(14).setFontWeight('bold').setBackground(COR_CABECALHO).setFontColor('#FFFFFF');
  sh.setRowHeight(1, 34);

  sh.getRange(2, 1, 1, 2).setValues([['Atualizado em', new Date()]])
    .setFontStyle('italic').setFontColor('#666666');

  var startRow = 4;
  resumoRows.forEach(function (row, i) {
    var r = startRow + i;
    if (row[0] === '') { sh.setRowHeight(r, 8); return; }
    sh.getRange(r, 1).setValue(row[0]).setFontWeight('bold');
    sh.getRange(r, 2).setValue(row[1]);
  });

  sh.setColumnWidth(1, 320);
  sh.setColumnWidth(2, 160);
  sh.setTabColor('#D4954A');
}

function orderSheets() {
  var ss = planilha();
  var ordem = ['Resumo', 'Matrizes', 'Touros', 'Nascimentos', 'Desmama', 'Recria', 'IATF', 'Diagnosticos', 'Vendas', 'Insumos', 'Descartes'];
  var pos = 1;
  ordem.forEach(function (nome) {
    var sh = ss.getSheetByName(nome);
    if (sh) {
      ss.setActiveSheet(sh);
      ss.moveActiveSheet(pos);
      pos++;
    }
  });
}

// ============================================================
// Leitura (pelo NOME da coluna, então funciona em qualquer layout)
// ============================================================
function readSheet(name, cols) {
  var ss = planilha();
  var sh = ss.getSheetByName(name);
  if (!sh) return [];
  var ultLin = sh.getLastRow();
  var ultCol = sh.getLastColumn();
  if (ultLin < 2 || ultCol < 1) return [];
  var cab = sh.getRange(1, 1, 1, ultCol).getValues()[0];
  var valores = sh.getRange(2, 1, ultLin - 1, ultCol).getValues();
  var idx = cols.map(function (c) { return cab.indexOf(c); });
  var zona = ss.getSpreadsheetTimeZone();
  return valores
    .map(function (row) {
      var obj = {};
      cols.forEach(function (c, i) {
        var v = idx[i] >= 0 ? row[idx[i]] : '';
        if (Object.prototype.toString.call(v) === '[object Date]') {
          v = CAMPOS_DATA.indexOf(c) !== -1 ? Utilities.formatDate(v, zona, 'yyyy-MM-dd') : v.toISOString();
        }
        obj[c] = v;
      });
      return obj;
    })
    .filter(function (obj) { return obj.id !== '' && obj.id !== null && obj.id !== undefined; });
}

function getAllData() {
  var matrizes = readSheet('Matrizes', MATRIZES_COLS);
  var touros = readSheet('Touros', TOUROS_COLS);
  var eventos = [];
  TIPO_TABS.forEach(function (cfg) {
    var rows = readSheet(cfg.sheet, cfg.cols);
    rows.forEach(function (r) { r.tipo = cfg.tipo; eventos.push(r); });
  });
  return { versao: VERSAO, matrizes: matrizes, touros: touros, eventos: eventos };
}
