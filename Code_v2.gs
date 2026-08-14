/**
 * Backend da planilha "Gestão Pecuária - Fazenda Ibiraçú"
 * Recebe e entrega os dados do app via requisições Web, com formatação profissional.
 */

var COR_CABECALHO = '#2C4A3B';
var COR_TEXTO_CABECALHO = '#FFFFFF';

var MATRIZES_COLS = ['id','brinco','categoria','raca','lote','dataNascimento','partosAnteriores','status','createdAt'];
var TOUROS_COLS = ['id','nome','raca','fornecedor','anoAquisicao','doses','custoDose','observacoes','createdAt'];

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

function doGet(e) {
  var action = (e.parameter && e.parameter.action) || 'getAll';
  if (action === 'getAll') {
    return jsonResponse(getAllData());
  }
  return jsonResponse({ error: 'ação desconhecida' });
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var action = body.action;

  if (action === 'syncAll') {
    writeSheet('Matrizes', MATRIZES_COLS, body.matrizes || [], '#2C4A3B');
    writeSheet('Touros', TOUROS_COLS, body.touros || [], '#5B7FA6');
    var eventos = body.eventos || [];
    TIPO_TABS.forEach(function (cfg) {
      var rows = eventos.filter(function (ev) { return ev.tipo === cfg.tipo; });
      writeSheet(cfg.sheet, cfg.cols, rows, cfg.cor);
    });
    if (body.resumo) {
      writeResumo(body.resumo);
    }
    orderSheets();
    return jsonResponse({ ok: true });
  }

  return jsonResponse({ error: 'ação desconhecida' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name, cols) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  return sh;
}

function formatarCabecalho(sh, numCols, corAba) {
  var header = sh.getRange(1, 1, 1, numCols);
  header.setBackground(COR_CABECALHO)
    .setFontColor(COR_TEXTO_CABECALHO)
    .setFontWeight('bold')
    .setFontSize(10)
    .setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 28);
  if (corAba) sh.setTabColor(corAba);
}

var CAMPOS_DATA = ['data', 'dataNascimento', 'dataInicioProtocolo'];

function writeSheet(name, cols, rows, corAba) {
  var sh = getSheet(name, cols);
  sh.clearContents();
  sh.clearFormats();
  sh.getRange(1, 1, 1, cols.length).setValues([cols]);
  formatarCabecalho(sh, cols.length, corAba);

  if (rows.length > 0) {
    var data = rows.map(function (r) {
      return cols.map(function (c) {
        var v = r[c];
        if (CAMPOS_DATA.indexOf(c) !== -1 && v) {
          var d = new Date(v + 'T00:00:00');
          if (!isNaN(d.getTime())) return d;
        }
        return v !== undefined && v !== null ? v : '';
      });
    });
    var range = sh.getRange(2, 1, data.length, cols.length);
    range.setValues(data);
    // faixas alternadas (banding) só nas linhas de dado, preservando o cabeçalho
    try { range.getBandings().forEach(function (b) { b.remove(); }); } catch (err) {}
    sh.getRange(2, 1, data.length, cols.length).applyRowBanding(
      SpreadsheetApp.BandingTheme.LIGHT_GREEN, false, false
    );
    // formato brasileiro DD/MM/AA nas colunas de data (mantendo como data de verdade, ordenável)
    cols.forEach(function (c, i) {
      if (CAMPOS_DATA.indexOf(c) !== -1) {
        sh.getRange(2, i + 1, data.length, 1).setNumberFormat('dd/mm/yy');
      }
    });
  }

  sh.autoResizeColumns(1, cols.length);
  // limita largura máxima pra não ficar colunas gigantes com texto longo
  for (var c = 1; c <= cols.length; c++) {
    if (sh.getColumnWidth(c) > 220) sh.setColumnWidth(c, 220);
  }
}

function writeResumo(resumoRows) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Resumo');
  if (!sh) sh = ss.insertSheet('Resumo', 0);
  sh.clear();
  sh.clearFormats();

  sh.getRange(1, 1, 1, 2).merge().setValue('🐄 Fazenda Ibiraçú — Resumo da Gestão')
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
  ss.setActiveSheet(sh);
}

function orderSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordem = ['Resumo', 'Matrizes', 'Touros', 'Nascimentos', 'Desmama', 'Recria', 'IATF', 'Diagnosticos', 'Vendas', 'Insumos', 'Descartes'];
  ordem.forEach(function (nome, i) {
    var sh = ss.getSheetByName(nome);
    if (sh) ss.setActiveSheet(sh) && ss.moveActiveSheet(i + 1);
  });
}

function readSheet(name, cols) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) return [];
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  var values = sh.getRange(2, 1, lastRow - 1, cols.length).getValues();
  return values
    .map(function (row) {
      var obj = {};
      cols.forEach(function (c, i) {
        var v = row[i];
        if (CAMPOS_DATA.indexOf(c) !== -1 && Object.prototype.toString.call(v) === '[object Date]') {
          v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        }
        obj[c] = v;
      });
      return obj;
    })
    .filter(function (obj) { return obj.id; });
}

function getAllData() {
  var matrizes = readSheet('Matrizes', MATRIZES_COLS);
  var touros = readSheet('Touros', TOUROS_COLS);
  var eventos = [];
  TIPO_TABS.forEach(function (cfg) {
    var rows = readSheet(cfg.sheet, cfg.cols);
    rows.forEach(function (r) { r.tipo = cfg.tipo; eventos.push(r); });
  });
  return { matrizes: matrizes, touros: touros, eventos: eventos };
}
