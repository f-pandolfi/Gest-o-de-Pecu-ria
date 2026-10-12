// logica.js: regras da Gestão da Pecuária (sem React, sem tela).
// É usado por dois lados: o app (app.jsx) e a integração por foto (lançamentos em lote feitos pelo Claude).
// Mexeu aqui = mudou nos dois, de propósito: uma única fonte da verdade para status, previsão e relatórios.

export const VERSAO_APP = '9.1 (12/10/26)';
export const VERSAO_MINIMA_SCRIPT = 7;
export const PERIODO_GESTACAO_DIAS = 285; // mesmo período usado na planilha original da fazenda

// Tipos de lançamento visíveis no modo Funcionário (restrito)
export const TIPOS_FUNCIONARIO = ['nascimento', 'desmama', 'iatf', 'insumo', 'descarte'];

export const TIPOS_EVENTO = [
  { id: 'cadastro', label: 'Nova Matriz' },
  { id: 'touro', label: 'Touro / Sêmen' },
  { id: 'iatf', label: 'Inseminação (IATF)' },
  { id: 'diagnostico', label: 'Diagnóstico (Toque)' },
  { id: 'nascimento', label: 'Nascimento' },
  { id: 'desmama', label: 'Desmama' },
  { id: 'recria', label: 'Recria (pesagem)' },
  { id: 'venda', label: 'Venda' },
  { id: 'insumo', label: 'Sal / Medicamento' },
  { id: 'descarte', label: 'Descarte' },
];

// Campos editáveis ao clicar numa matriz (modo proprietário)
export const CAMPOS_EDICAO_MATRIZ = [
  { key: 'brinco', label: 'Brinco / ID', type: 'text', required: true },
  { key: 'categoria', label: 'Categoria', type: 'select', options: ['Novilha', 'Primípara', 'Multípara', 'Vaca'] },
  { key: 'raca', label: 'Raça', type: 'text' },
  { key: 'lote', label: 'Lote / piquete', type: 'text' },
  { key: 'dataNascimento', label: 'Data de nascimento', type: 'date' },
  { key: 'partosAnteriores', label: 'Partos antes de entrar na fazenda', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['Vazia', 'Cheia', 'Descarte'] },
];

export const CAMPOS = {
  cadastro: [
    { key: 'brinco', label: 'Brinco / ID', type: 'text', required: true },
    { key: 'categoria', label: 'Categoria', type: 'select', options: ['Novilha', 'Primípara', 'Multípara', 'Vaca'] },
    { key: 'raca', label: 'Raça', type: 'text' },
    { key: 'lote', label: 'Lote / piquete', type: 'text' },
    { key: 'dataNascimento', label: 'Data de nascimento', type: 'date' },
    { key: 'partosAnteriores', label: 'Partos antes de entrar na fazenda', type: 'number' },
    { key: 'statusInicial', label: 'Status inicial', type: 'select', options: ['Vazia', 'Cheia'] },
  ],
  touro: [
    { key: 'nome', label: 'Nome do touro / sêmen', type: 'text', required: true },
    { key: 'raca', label: 'Raça', type: 'text', required: true },
    { key: 'fornecedor', label: 'Central / fornecedor', type: 'text' },
    { key: 'anoAquisicao', label: 'Ano de aquisição', type: 'number' },
    { key: 'doses', label: 'Doses adquiridas', type: 'number' },
    { key: 'custoDose', label: 'Custo por dose (R$)', type: 'number' },
    { key: 'observacoes', label: 'Observações', type: 'text' },
  ],
  iatf: [
    { key: 'matrizId', label: 'Matriz', type: 'matriz', required: true },
    { key: 'tipoServico', label: 'Tipo', type: 'select', options: ['IATF', 'Repasse (monta natural)'] },
    { key: 'numeroServico', label: 'Nº da tentativa', type: 'select', options: ['1ª', '2ª', '3ª ou mais'] },
    { key: 'data', label: 'Data da IA / cobertura', type: 'date', required: true },
    { key: 'dataInicioProtocolo', label: 'Início do protocolo', type: 'date' },
    { key: 'touroId', label: 'Sêmen / touro', type: 'touro' },
    { key: 'touroOutro', label: 'Nome (não cadastrado)', type: 'text', showIf: (f) => f.touroId === '__outro__' },
    { key: 'tecnico', label: 'Técnico', type: 'text' },
    { key: 'custo', label: 'Custo (R$)', type: 'number' },
    { key: 'observacoes', label: 'Observações', type: 'text' },
  ],
  diagnostico: [
    { key: 'matrizId', label: 'Matriz', type: 'matriz', required: true },
    { key: 'data', label: 'Data do exame', type: 'date', required: true },
    { key: 'resultado', label: 'Resultado', type: 'select', options: ['Prenhe', 'Vazia', 'Descarte'], required: true },
    { key: 'metodo', label: 'Método', type: 'select', options: ['Toque retal', 'Ultrassom'] },
    { key: 'dg', label: 'DG (dias de gestação)', type: 'number' },
    { key: 'motivo', label: 'Motivo do descarte', type: 'text', showIf: (f) => f.resultado === 'Descarte' },
    { key: 'veterinario', label: 'Veterinário', type: 'text' },
    { key: 'custo', label: 'Custo (R$)', type: 'number' },
  ],
  nascimento: [
    { key: 'matrizId', label: 'Matriz (mãe)', type: 'matriz' },
    { key: 'data', label: 'Data do nascimento', type: 'date', required: true },
    { key: 'resultadoParto', label: 'Resultado', type: 'select', options: ['Vivo', 'Natimorto'], required: true, default: 'Vivo' },
    { key: 'sexo', label: 'Sexo', type: 'select', options: ['Fêmea', 'Macho'] },
    { key: 'brincoBezerro', label: 'Brinco do bezerro (sugerido automaticamente)', type: 'text' },
    { key: 'pelagem', label: 'Pelagem', type: 'text' },
    { key: 'touroId', label: 'Pai (touro / sêmen)', type: 'touro' },
    { key: 'touroOutro', label: 'Nome (não cadastrado)', type: 'text', showIf: (f) => f.touroId === '__outro__' },
    { key: 'tipoParto', label: 'Tipo de parto', type: 'select', options: ['Normal', 'Distócico (com dificuldade)'], default: 'Normal' },
    { key: 'observacoes', label: 'Observações', type: 'text' },
  ],
  desmama: [
    { key: 'brincoBezerro', label: 'Brinco do bezerro', type: 'text', required: true },
    { key: 'data', label: 'Data da desmama', type: 'date', required: true },
    { key: 'pesoDesmama', label: 'Peso na desmama (kg)', type: 'number' },
    { key: 'idadeDias', label: 'Idade (dias)', type: 'number' },
  ],
  recria: [
    { key: 'matrizId', label: 'Novilha', type: 'matriz', required: true },
    { key: 'data', label: 'Data da pesagem', type: 'date', required: true },
    { key: 'pesoAtual', label: 'Peso atual (kg)', type: 'number' },
    { key: 'aptaReproducao', label: 'Apta para reprodução?', type: 'select', options: ['Ainda não', 'Sim, apta'] },
    { key: 'observacoes', label: 'Observações', type: 'text' },
  ],
  venda: [
    { key: 'data', label: 'Data da venda', type: 'date', required: true },
    { key: 'categoria', label: 'Categoria do animal', type: 'select', options: ['Bezerro(a) (mamando)', 'Novilha (recria)', 'Boi/Boiadinho (engorda)', 'Vaca de descarte'] },
    { key: 'animais', label: 'Animais (descrição/qtd)', type: 'text' },
    { key: 'pesoTotal', label: 'Peso total (kg)', type: 'number' },
    { key: 'valorArroba', label: 'Valor por arroba (R$)', type: 'number' },
    { key: 'valorTotal', label: 'Valor total da venda (R$)', type: 'number', required: true },
    { key: 'frete', label: 'Frete / comissão (R$)', type: 'number' },
    { key: 'comprador', label: 'Comprador', type: 'text' },
  ],
  insumo: [
    { key: 'data', label: 'Data', type: 'date', required: true },
    { key: 'produto', label: 'Produto', type: 'select', options: ['Sal Mineral', 'Medicamento', 'Vacina', 'Outro'] },
    { key: 'quantidade', label: 'Quantidade', type: 'number' },
    { key: 'unidade', label: 'Unidade', type: 'select', options: ['kg', 'L', 'un', 'dose'] },
    { key: 'custo', label: 'Custo (R$)', type: 'number' },
    { key: 'categoriaAnimal', label: 'Categoria de animal', type: 'text' },
  ],
  descarte: [
    { key: 'matrizId', label: 'Matriz', type: 'matriz', required: true },
    { key: 'data', label: 'Data', type: 'date', required: true },
    { key: 'motivo', label: 'Motivo', type: 'text' },
  ],
};

// ---------------------------------------------------------------- datas
const p2 = (n) => String(n).padStart(2, '0');

// Data de hoje no fuso do aparelho (toISOString usava UTC e virava "amanhã" depois das 21h no Brasil)
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

export function paraUTC(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
export function addDias(dataISO, dias) {
  return new Date(paraUTC(dataISO) + dias * 86400000).toISOString().slice(0, 10);
}
export function diasEntre(deISO, ateISO) {
  return Math.round((paraUTC(ateISO) - paraUTC(deISO)) / 86400000);
}

// A planilha pode devolver data como "2026-05-09T03:00:00.000Z" (meia-noite de Brasília); o app trabalha só com AAAA-MM-DD
export function normalizarDataISO(v) {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v !== 'string') return String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
    const t = new Date(v).getTime();
    if (!isNaN(t)) return new Date(t - 3 * 3600 * 1000).toISOString().slice(0, 10); // UTC-3 (Paragominas)
  }
  return v;
}

// Formata data ISO (YYYY-MM-DD) para o padrão brasileiro DD/MM/AA
export function formatarDataBR(iso) {
  if (!iso || typeof iso !== 'string') return iso || '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const [, ano, mes, dia] = m;
  return `${dia}/${mes}/${ano.slice(2)}`;
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
// '2026-10' -> 'out/26'
export function mesCurto(aaaamm) {
  const [a, m] = String(aaaamm).split('-');
  return `${MESES[parseInt(m, 10) - 1] || m}/${String(a).slice(2)}`;
}

// Entende datas escritas à mão: 09/10/26, 9/10/2026, 09.10.26, 2026-10-09; sem ano (09/10) assume o ano corrente
export function parseDataFlex(txt, hoje) {
  hoje = hoje || todayISO();
  if (txt === null || txt === undefined) return '';
  const s = String(txt).trim();
  if (!s) return '';
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  let ano; let mes; let dia;
  if (m) { ano = +m[1]; mes = +m[2]; dia = +m[3]; } else {
    m = s.match(/^(\d{1,2})[/.\-](\d{1,2})(?:[/.\-](\d{2}|\d{4}))?$/);
    if (!m) return '';
    dia = +m[1]; mes = +m[2];
    if (m[3]) ano = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    else {
      ano = parseInt(hoje.slice(0, 4), 10);
      const cand = `${ano}-${p2(mes)}-${p2(dia)}`;
      if (!isNaN(paraUTC(cand)) && diasEntre(hoje, cand) > 60) ano -= 1; // sem ano e muito no futuro: era do ano passado
    }
  }
  const iso = `${ano}-${p2(mes)}-${p2(dia)}`;
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return '';
  return iso;
}

// ---------------------------------------------------------------- ano de gestão
export function anoDe(iso) {
  const m = /^(\d{4})-/.exec(iso || '');
  return m ? parseInt(m[1], 10) : null;
}

// Anos que aparecem nos lançamentos (mais o ano de hoje), do mais novo para o mais antigo
export function anosDisponiveis(eventos, hoje) {
  const set = new Set([anoDe(hoje || todayISO())]);
  eventos.forEach((e) => { const a = anoDe(e.data); if (a) set.add(a); });
  return [...set].sort((a, b) => b - a);
}

// ano = número (2026) ou 'todos'
export function filtrarPorAno(eventos, ano) {
  if (ano === 'todos' || ano === null || ano === undefined) return eventos;
  return eventos.filter((e) => anoDe(e.data) === ano);
}

export function rotuloAno(ano) {
  return ano === 'todos' ? 'todos os anos' : String(ano);
}

// ---------------------------------------------------------------- normalização dos dados vindos da planilha
// Brinco sempre como texto (a planilha devolve número) e datas sempre AAAA-MM-DD
export function normalizarDados(data) {
  const matrizes = (data.matrizes || []).map((m) => ({
    ...m, brinco: String(m.brinco ?? ''), dataNascimento: normalizarDataISO(m.dataNascimento),
  }));
  const eventos = (data.eventos || []).map((e) => ({
    ...e,
    data: normalizarDataISO(e.data),
    dataInicioProtocolo: normalizarDataISO(e.dataInicioProtocolo),
    brincoBezerro: e.brincoBezerro === undefined || e.brincoBezerro === null ? '' : String(e.brincoBezerro),
  }));
  return { matrizes, touros: data.touros || [], eventos };
}

// ---------------------------------------------------------------- reprodução
// Data (ISO) do parto mais recente daquela matriz, olhando os nascimentos já lançados
export function ultimoPartoDe(matrizId, eventos) {
  const nascs = eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === matrizId && e.data);
  if (!nascs.length) return '';
  return nascs.reduce((max, e) => (e.data > max ? e.data : max), nascs[0].data);
}

// Número (brinco) da cria do último parto daquela matriz
export function numeroCriaUltimoParto(matrizId, eventos) {
  const nascs = eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === matrizId && e.data);
  if (!nascs.length) return '';
  const maisRecente = nascs.reduce((max, e) => (e.data > max.data ? e : max), nascs[0]);
  return maisRecente.brincoBezerro || '';
}

// Previsão de parto (cálculo padrão): concepção = data do toque - dias de gestação (DG); parto = concepção + 285 dias.
// Sem DG, usa a IATF mais recente + 285. Ignora toque/IATF anteriores ao último parto (aquela prenhez já terminou).
// Devolve { data, origem: 'toque' | 'iatf' | 'toque-sem-dg', base, dg } ou null.
export function previsaoPartoInfo(matrizId, eventos) {
  const ultimo = ultimoPartoDe(matrizId, eventos);
  const valida = (d) => d && (!ultimo || d > ultimo);
  const diagsPrenhe = eventos
    .filter((e) => e.tipo === 'diagnostico' && e.matrizId === matrizId && e.resultado === 'Prenhe' && valida(e.data))
    .sort((a, b) => b.data.localeCompare(a.data));
  const comDG = diagsPrenhe.filter((e) => e.dg !== '' && e.dg !== null && e.dg !== undefined && !isNaN(parseInt(e.dg, 10)));
  if (comDG.length) {
    const dg = parseInt(comDG[0].dg, 10);
    return { data: addDias(addDias(comDG[0].data, -dg), PERIODO_GESTACAO_DIAS), origem: 'toque', base: comDG[0].data, dg };
  }
  const iatfs = eventos
    .filter((e) => e.tipo === 'iatf' && e.matrizId === matrizId && valida(e.data))
    .sort((a, b) => b.data.localeCompare(a.data));
  if (iatfs.length) return { data: addDias(iatfs[0].data, PERIODO_GESTACAO_DIAS), origem: 'iatf', base: iatfs[0].data };
  if (diagsPrenhe.length) return { data: '', origem: 'toque-sem-dg', base: diagsPrenhe[0].data };
  return null;
}

// Sugere o próximo número de brinco de bezerro seguindo a convenção do produtor:
// 1º dígito = último dígito do ano · faixa 000-499 = fêmea, 500-999 = macho · resto = sequência
export function sugerirBrincoBezerro(data, sexo, eventos) {
  if (!data || !sexo) return '';
  const ano = parseInt(data.slice(0, 4), 10) % 10;
  const base = sexo === 'Macho' ? 500 : 0;
  const usados = new Set();
  eventos
    .filter((e) => e.tipo === 'nascimento' && e.brincoBezerro)
    .forEach((e) => {
      const n = parseInt(e.brincoBezerro, 10);
      if (!isNaN(n) && Math.floor(n / 1000) === ano) {
        const resto = n % 1000;
        if (resto >= base && resto < base + 500) usados.add(resto - base);
      }
    });
  // A sequência da fazenda começa em 001 (fêmeas) e 501 (machos) e segue do maior número já usado
  let max = 0;
  usados.forEach((x) => { if (x > max) max = x; });
  let seq = max + 1;
  if (seq >= 500) { seq = 1; while (usados.has(seq)) seq++; } // estourou a faixa: procura o primeiro livre
  return String(ano * 1000 + base + seq);
}

// Linhas da tela Previsão de Parto (Cheias: por data prevista; Vazias: mais recém-paridas primeiro)
export function linhasPrevisao(matrizes, eventos, status, hoje, busca) {
  hoje = hoje || todayISO();
  const q = (busca || '').toLowerCase();
  return matrizes
    .filter((m) => m.status === status)
    .filter((m) => !q || String(m.brinco).toLowerCase().includes(q))
    .map((m) => {
      const info = status === 'Cheia' ? previsaoPartoInfo(m.id, eventos) : null;
      const previsao = info ? info.data : '';
      const ultimoParto = ultimoPartoDe(m.id, eventos);
      return {
        matriz: m, info, previsao,
        dias: previsao ? diasEntre(hoje, previsao) : null,
        ultimoParto,
        diasDesdeParto: ultimoParto ? diasEntre(ultimoParto, hoje) : null,
        numeroCria: numeroCriaUltimoParto(m.id, eventos),
      };
    })
    .sort((a, b) => {
      if (status === 'Cheia') {
        if (!a.previsao) return 1;
        if (!b.previsao) return -1;
        return a.previsao.localeCompare(b.previsao);
      }
      if (!a.ultimoParto) return 1;
      if (!b.ultimoParto) return -1;
      return b.ultimoParto.localeCompare(a.ultimoParto);
    });
}

// ---------------------------------------------------------------- indicadores
export function calcularKPIs(matrizes, eventos) {
  const cheias = matrizes.filter((m) => m.status === 'Cheia').length;
  const vazias = matrizes.filter((m) => m.status === 'Vazia').length;
  const descartes = matrizes.filter((m) => m.status === 'Descarte').length;
  const diagnosticos = eventos.filter((e) => e.tipo === 'diagnostico');
  const taxaPrenhez = diagnosticos.length
    ? (diagnosticos.filter((d) => d.resultado === 'Prenhe').length / diagnosticos.length) * 100 : 0;
  const nascimentosTodos = eventos.filter((e) => e.tipo === 'nascimento');
  const natimortos = nascimentosTodos.filter((n) => n.resultadoParto === 'Natimorto').length;
  const nascimentos = nascimentosTodos.filter((n) => n.resultadoParto !== 'Natimorto');
  const taxaPerda = nascimentosTodos.length ? (natimortos / nascimentosTodos.length) * 100 : 0;
  const desmamas = eventos.filter((e) => e.tipo === 'desmama');
  const taxaDesmama = nascimentos.length ? (desmamas.length / nascimentos.length) * 100 : 0;
  const emRecria = matrizes.filter((m) => m.categoria === 'Novilha' && m.status !== 'Descarte').length;
  const vendas = eventos.filter((e) => e.tipo === 'venda');
  const receitaTotal = vendas.reduce((s, v) => s + (parseFloat(v.valorTotal) || 0), 0);
  const custoFrete = vendas.reduce((s, v) => s + (parseFloat(v.frete) || 0), 0);
  const iatfs = eventos.filter((e) => e.tipo === 'iatf');
  const custoIatf = iatfs.reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const custoDiag = diagnosticos.reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const custoInsumo = eventos.filter((e) => e.tipo === 'insumo').reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const custoTotal = custoIatf + custoDiag + custoInsumo + custoFrete;
  const custoPorBezerro = nascimentos.length ? custoTotal / nascimentos.length : 0;
  const margem = receitaTotal - custoTotal;
  const machos = nascimentos.filter((n) => n.sexo === 'Macho').length;
  const femeas = nascimentos.filter((n) => n.sexo === 'Fêmea').length;
  const pesoMedioDesmama = desmamas.length
    ? desmamas.reduce((s, d) => s + (parseFloat(d.pesoDesmama) || 0), 0) / desmamas.length : 0;
  return {
    total: matrizes.length, cheias, vazias, descartes, taxaPrenhez, nascimentos: nascimentos.length,
    natimortos, taxaPerda, desmamas: desmamas.length, taxaDesmama, emRecria, receitaTotal, custoTotal,
    custoPorBezerro, margem, machos, femeas, pesoMedioDesmama,
    iatfs: iatfs.length, diagnosticos: diagnosticos.length,
  };
}

export function buildResumoRows(kpis, ano) {
  return [
    ['Ano de gestão', ano === 'todos' || !ano ? 'todos os anos' : String(ano)],
    ['', ''],
    ['Total de matrizes (hoje)', kpis.total],
    ['Cheias (hoje)', kpis.cheias],
    ['Vazias (hoje)', kpis.vazias],
    ['Descarte (hoje)', kpis.descartes],
    ['Novilhas em recria (hoje)', kpis.emRecria],
    ['Taxa de prenhez do ano (%)', kpis.taxaPrenhez.toFixed(1)],
    ['', ''],
    ['Nascimentos', kpis.nascimentos],
    ['Natimortos', kpis.natimortos],
    ['Taxa de perda ao nascer (%)', kpis.taxaPerda.toFixed(1)],
    ['Nascimentos: machos', kpis.machos],
    ['Nascimentos: fêmeas', kpis.femeas],
    ['Desmamas', kpis.desmamas],
    ['Taxa de desmama (%)', kpis.taxaDesmama.toFixed(1)],
    ['Peso médio na desmama (kg)', kpis.pesoMedioDesmama.toFixed(1)],
    ['', ''],
    ['Receita total de vendas (R$)', kpis.receitaTotal.toFixed(2)],
    ['Custo total (R$)', kpis.custoTotal.toFixed(2)],
    ['Custo por bezerro (R$)', kpis.custoPorBezerro.toFixed(2)],
    ['Margem (R$)', kpis.margem.toFixed(2)],
  ];
}

// ---------------------------------------------------------------- nomes e buscas
export function mapaBrincos(matrizes) {
  return Object.fromEntries(matrizes.map((m) => [m.id, m.brinco]));
}
export function nomeTouroEvento(e, touros) {
  if (e.touroId === '__outro__') return e.touroOutro || '';
  const t = (touros || []).find((x) => x.id === e.touroId);
  return (t && t.nome) || e.touroOutro || '';
}

const semAcento = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const chave = (s) => semAcento(s).toLowerCase().trim();

// Acha matriz pelo brinco escrito (ignora espaços; "02024" casa com "2024"). Devolve { matriz } ou { erro }
export function acharMatrizPorBrinco(matrizes, brinco) {
  const b = String(brinco ?? '').trim();
  if (!b) return { erro: 'brinco da matriz em branco' };
  let achadas = matrizes.filter((m) => String(m.brinco).trim() === b);
  if (!achadas.length && /^\d+$/.test(b)) achadas = matrizes.filter((m) => /^\d+$/.test(String(m.brinco)) && Number(m.brinco) === Number(b));
  if (achadas.length === 1) return { matriz: achadas[0] };
  if (achadas.length > 1) return { erro: `brinco ${b} aparece em mais de uma matriz` };
  return { erro: `matriz ${b} não encontrada` };
}

export function novoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------- lançar (única fonte da verdade das mudanças de status)
export function camposFaltando(tipo, form) {
  return (CAMPOS[tipo] || []).filter((c) => c.required && (!c.showIf || c.showIf(form)) && !form[c.key]);
}

// estado = { matrizes, touros, eventos }. Devolve { estado (novo), eventosNovos, matrizesAlteradas, tourosNovos }
export function aplicarLancamento(estado, tipo, form, opcoes) {
  const op = opcoes || {};
  const id = op.id || novoId();
  const now = op.now || new Date().toISOString();
  const { matrizes, touros, eventos } = estado;
  const out = { eventosNovos: [], matrizesAlteradas: [], tourosNovos: [] };
  let m = matrizes; let t = touros; let ev = eventos;

  if (tipo === 'cadastro') {
    const nova = {
      id, brinco: form.brinco, categoria: form.categoria || 'Novilha',
      raca: form.raca || '', lote: form.lote || '',
      dataNascimento: form.dataNascimento || '',
      partosAnteriores: parseInt(form.partosAnteriores) || 0,
      status: form.statusInicial || 'Vazia', createdAt: now,
    };
    m = [...matrizes, nova];
    out.matrizesAlteradas.push(nova);
  } else if (tipo === 'touro') {
    const novo = {
      id, nome: form.nome, raca: form.raca,
      fornecedor: form.fornecedor || '', anoAquisicao: form.anoAquisicao || '',
      doses: parseInt(form.doses) || 0, custoDose: parseFloat(form.custoDose) || 0,
      observacoes: form.observacoes || '', createdAt: now,
    };
    t = [...touros, novo];
    out.tourosNovos.push(novo);
  } else if (tipo === 'descarte') {
    m = matrizes.map((x) => (x.id === form.matrizId ? { ...x, status: 'Descarte' } : x));
    const novoEvento = { id, tipo: 'descarte', ...form, createdAt: now };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
    const alt = m.find((x) => x.id === form.matrizId);
    if (alt) out.matrizesAlteradas.push(alt);
  } else if (tipo === 'diagnostico') {
    const novoStatus = form.resultado === 'Prenhe' ? 'Cheia' : form.resultado === 'Descarte' ? 'Descarte' : 'Vazia';
    m = matrizes.map((x) => (x.id === form.matrizId ? { ...x, status: novoStatus } : x));
    out.eventosNovos.push({ id, tipo: 'diagnostico', ...form, createdAt: now });
    if (form.resultado === 'Descarte') {
      out.eventosNovos.push({
        id: `${id}-desc`, tipo: 'descarte', matrizId: form.matrizId, data: form.data,
        motivo: form.motivo || 'Identificado no diagnóstico veterinário', origemDiagnostico: true, createdAt: now,
      });
    }
    ev = [...eventos, ...out.eventosNovos];
    const alt = m.find((x) => x.id === form.matrizId);
    if (alt) out.matrizesAlteradas.push(alt);
  } else if (tipo === 'nascimento') {
    const novoEvento = { id, tipo: 'nascimento', ...form, createdAt: now };
    const eventosNext = [...eventos, novoEvento];
    if (form.matrizId) {
      const partosNaFazenda = eventosNext.filter((e) => e.tipo === 'nascimento' && e.matrizId === form.matrizId).length;
      m = matrizes.map((x) => {
        if (x.id !== form.matrizId) return x;
        let categoria = x.categoria;
        if (categoria === 'Novilha' && partosNaFazenda >= 1) categoria = 'Primípara';
        else if (categoria === 'Primípara' && partosNaFazenda >= 2) categoria = 'Multípara';
        const atualizada = { ...x, categoria, status: x.status === 'Cheia' ? 'Vazia' : x.status }; // pariu: deixa de estar prenhe
        out.matrizesAlteradas.push(atualizada);
        return atualizada;
      });
    }
    ev = eventosNext;
    out.eventosNovos.push(novoEvento);
  } else {
    const novoEvento = { id, tipo, ...form, createdAt: now };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
  }
  return { estado: { matrizes: m, touros: t, eventos: ev }, ...out };
}

// ---------------------------------------------------------------- lote (integração por foto)
export function normSexo(v) {
  const s = chave(v);
  if (['m', 'macho', 'boi', 'bezerro', 'garrote'].includes(s)) return 'Macho';
  if (['f', 'femea', 'bezerra', 'novilha'].includes(s)) return 'Fêmea';
  return '';
}
export function normResultadoDiag(v) {
  const s = chave(v);
  if (['prenhe', 'prenha', 'p', '+', 'positivo', 'cheia', 'gestante'].includes(s)) return 'Prenhe';
  if (['vazia', 'v', '-', 'negativo', 'falhada', 'falhou'].includes(s)) return 'Vazia';
  if (['descarte', 'd', 'descartar'].includes(s)) return 'Descarte';
  return '';
}
export function normResultadoParto(v) {
  const s = chave(v);
  if (!s || ['vivo', 'viva', 'v', 'nasceu vivo'].includes(s)) return 'Vivo';
  if (['natimorto', 'morto', 'morta', 'n', 'nasceu morto'].includes(s)) return 'Natimorto';
  return '';
}

function acharTouro(touros, nome) {
  const k = chave(nome);
  if (!k) return null;
  return touros.find((t) => chave(t.nome) === k) || touros.find((t) => chave(t.nome).includes(k)) || null;
}

// Converte um item "como escrito no papel" no formulário do app. Devolve { form } ou { erro }.
// Chaves aceitas (todas opcionais, menos as que o tipo exige):
//   nascimento: matriz, data, sexo, resultado, brincoCria, pelagem, pai, tipoParto, obs
//   diagnostico: matriz, data, resultado, dg, metodo, veterinario, motivo
//   iatf: matriz, data, tipoServico, tentativa, inicioProtocolo, touro, tecnico, custo, obs
//   desmama: brincoCria, data, peso, idadeDias
//   descarte: matriz, data, motivo
//   recria: matriz, data, peso, apta, obs
//   insumo: data, produto, quantidade, unidade, custo, categoriaAnimal
//   venda: data, categoria, animais, pesoTotal, valorArroba, valorTotal, frete, comprador
//   cadastro: brinco, categoria, raca, lote, dataNascimento, partosAnteriores, status
export function itemParaFormulario(item, estado, hoje) {
  const tipo = item.tipo;
  if (!CAMPOS[tipo]) return { erro: `tipo desconhecido: ${tipo}` };
  const f = {};
  const data = parseDataFlex(item.data, hoje);
  const comData = !['cadastro', 'touro', 'desmama'].includes(tipo) || tipo === 'desmama';
  if (comData) {
    if (!data) return { erro: `data inválida ou em branco (${item.data ?? ''})` };
    f.data = data;
  }
  const exigeMatriz = ['iatf', 'diagnostico', 'descarte', 'recria'].includes(tipo);
  if (exigeMatriz || (tipo === 'nascimento' && item.matriz)) {
    const r = acharMatrizPorBrinco(estado.matrizes, item.matriz);
    if (r.erro) return { erro: r.erro };
    f.matrizId = r.matriz.id;
    f._matrizBrinco = r.matriz.brinco;
  }
  if (tipo === 'nascimento') {
    f.resultadoParto = normResultadoParto(item.resultado);
    if (!f.resultadoParto) return { erro: `resultado do parto não entendido (${item.resultado})` };
    if (item.sexo) { f.sexo = normSexo(item.sexo); if (!f.sexo) return { erro: `sexo não entendido (${item.sexo})` }; }
    if (item.pelagem) f.pelagem = item.pelagem;
    f.tipoParto = item.tipoParto || 'Normal';
    if (item.obs) f.observacoes = item.obs;
    if (item.brincoCria) f.brincoBezerro = String(item.brincoCria).trim();
    if (item.pai) { const t = acharTouro(estado.touros, item.pai); if (t) f.touroId = t.id; else { f.touroId = '__outro__'; f.touroOutro = String(item.pai); } }
  } else if (tipo === 'diagnostico') {
    f.resultado = normResultadoDiag(item.resultado);
    if (!f.resultado) return { erro: `resultado do toque não entendido (${item.resultado})` };
    if (item.dg !== undefined && item.dg !== '' && item.dg !== null) {
      const dg = parseInt(item.dg, 10);
      if (isNaN(dg) || dg < 0 || dg > 300) return { erro: `DG fora do normal (${item.dg})` };
      f.dg = dg;
    }
    if (item.metodo) f.metodo = item.metodo;
    if (item.veterinario) f.veterinario = item.veterinario;
    if (item.motivo) f.motivo = item.motivo;
    if (item.custo) f.custo = item.custo;
  } else if (tipo === 'iatf') {
    f.tipoServico = item.tipoServico || 'IATF';
    if (item.tentativa) f.numeroServico = item.tentativa;
    const ini = parseDataFlex(item.inicioProtocolo, hoje);
    if (ini) f.dataInicioProtocolo = ini;
    if (item.touro) { const t = acharTouro(estado.touros, item.touro); if (t) f.touroId = t.id; else { f.touroId = '__outro__'; f.touroOutro = String(item.touro); } }
    if (item.tecnico) f.tecnico = item.tecnico;
    if (item.custo) f.custo = item.custo;
    if (item.obs) f.observacoes = item.obs;
  } else if (tipo === 'desmama') {
    if (!item.brincoCria) return { erro: 'brinco da cria em branco' };
    f.brincoBezerro = String(item.brincoCria).trim();
    if (item.peso) f.pesoDesmama = item.peso;
    if (item.idadeDias) f.idadeDias = item.idadeDias;
  } else if (tipo === 'descarte') {
    if (item.motivo) f.motivo = item.motivo;
  } else if (tipo === 'recria') {
    if (item.peso) f.pesoAtual = item.peso;
    if (item.apta) f.aptaReproducao = item.apta;
    if (item.obs) f.observacoes = item.obs;
  } else if (tipo === 'insumo') {
    ['produto', 'quantidade', 'unidade', 'custo', 'categoriaAnimal'].forEach((k) => { if (item[k] !== undefined && item[k] !== '') f[k] = item[k]; });
  } else if (tipo === 'venda') {
    ['categoria', 'animais', 'pesoTotal', 'valorArroba', 'valorTotal', 'frete', 'comprador'].forEach((k) => { if (item[k] !== undefined && item[k] !== '') f[k] = item[k]; });
  } else if (tipo === 'cadastro') {
    if (!String(item.brinco ?? '').trim()) return { erro: 'brinco em branco' };
    f.brinco = String(item.brinco).trim();
    ['categoria', 'raca', 'lote', 'partosAnteriores'].forEach((k) => { if (item[k] !== undefined && item[k] !== '') f[k] = item[k]; });
    const dn = parseDataFlex(item.dataNascimento, hoje);
    if (dn) f.dataNascimento = dn;
    if (item.status) f.statusInicial = item.status;
  }
  return { form: f };
}

// Já existe esse mesmo lançamento? (evita gravar duas vezes a mesma linha do papel)
export function jaExiste(tipo, form, estado) {
  const { eventos, matrizes } = estado;
  if (tipo === 'cadastro') return matrizes.some((m) => String(m.brinco).trim() === String(form.brinco).trim());
  if (tipo === 'desmama') return eventos.some((e) => e.tipo === 'desmama' && e.brincoBezerro === form.brincoBezerro && e.data === form.data);
  if (tipo === 'nascimento') {
    return eventos.some((e) => e.tipo === 'nascimento' && e.data === form.data
      && ((form.matrizId && e.matrizId === form.matrizId) || (form.brincoBezerro && e.brincoBezerro === form.brincoBezerro)));
  }
  if (tipo === 'diagnostico') return eventos.some((e) => e.tipo === 'diagnostico' && e.matrizId === form.matrizId && e.data === form.data);
  if (['iatf', 'descarte', 'recria'].includes(tipo)) return eventos.some((e) => e.tipo === tipo && e.matrizId === form.matrizId && e.data === form.data);
  return false;
}

// Aplica vários lançamentos de uma vez (uma página do caderno). Não grava em lugar nenhum:
// devolve o novo estado e o que precisa ir para a planilha.
export function aplicarLote(estado, itens, opcoes) {
  const op = opcoes || {};
  const hoje = op.hoje || todayISO();
  const now = op.now || new Date().toISOString();
  let atual = estado;
  const aplicados = []; const rejeitados = []; const avisos = [];
  const eventosParaGravar = []; const matrizesMap = new Map(); const tourosParaGravar = [];

  itens.forEach((item, indice) => {
    const conv = itemParaFormulario(item, atual, hoje);
    if (conv.erro) { rejeitados.push({ indice, item, motivo: conv.erro }); return; }
    const form = conv.form; const brincoMae = form._matrizBrinco; delete form._matrizBrinco;
    if (item.tipo === 'nascimento' && form.sexo && !form.brincoBezerro) {
      const sug = sugerirBrincoBezerro(form.data, form.sexo, atual.eventos);
      if (sug) { form.brincoBezerro = sug; avisos.push({ indice, aviso: `brinco da cria sugerido: ${sug}` }); }
    }
    const faltando = camposFaltando(item.tipo, form);
    if (faltando.length) { rejeitados.push({ indice, item, motivo: `faltou: ${faltando.map((c) => c.label).join(', ')}` }); return; }
    if (!item.forcar && jaExiste(item.tipo, form, atual)) { rejeitados.push({ indice, item, motivo: 'esse lançamento já existe (mesma matriz/cria e data)' }); return; }
    if (item.tipo === 'nascimento' && form.matrizId) {
      const m0 = atual.matrizes.find((x) => x.id === form.matrizId);
      if (m0 && m0.status !== 'Cheia') avisos.push({ indice, aviso: `matriz ${m0.brinco} estava ${m0.status}, não Cheia; confira se o toque dela foi lançado` });
    }
    const r = aplicarLancamento(atual, item.tipo, form, { id: novoId(), now });
    atual = r.estado;
    r.eventosNovos.forEach((e) => eventosParaGravar.push({ tipo: e.tipo, evento: e }));
    r.matrizesAlteradas.forEach((m) => matrizesMap.set(m.id, m));
    r.tourosNovos.forEach((t) => tourosParaGravar.push(t));
    aplicados.push({ indice, item, mae: brincoMae || '', form, eventos: r.eventosNovos, matrizes: r.matrizesAlteradas });
  });

  return {
    estado: atual, aplicados, rejeitados, avisos,
    eventosParaGravar, matrizesParaGravar: [...matrizesMap.values()], tourosParaGravar,
  };
}

// ---------------------------------------------------------------- relatórios
// Cada relatório devolve { titulo, resumo: [{ rotulo, valor }], secoes: [{ titulo, nota?, colunas: [{ k, label, align?, mono? }], linhas: [obj] }] }
const listaBrincos = (arr) => arr.join(', ');

export function relatorioPrevisaoParto(matrizes, eventos, hoje) {
  hoje = hoje || todayISO();
  const cheias = linhasPrevisao(matrizes, eventos, 'Cheia', hoje, '');
  const atrasadas = cheias.filter((l) => l.dias !== null && l.dias < 0);
  const futuras = cheias.filter((l) => l.dias !== null && l.dias >= 0);
  const semPrev = cheias.filter((l) => l.dias === null);
  const porMes = new Map();
  futuras.forEach((l) => {
    const k = l.previsao.slice(0, 7);
    if (!porMes.has(k)) porMes.set(k, []);
    porMes.get(k).push(l.matriz.brinco);
  });
  const linhasMes = [];
  if (atrasadas.length) linhasMes.push({ periodo: 'Atrasadas', qtd: atrasadas.length, brincos: listaBrincos(atrasadas.map((l) => l.matriz.brinco)) });
  [...porMes.keys()].sort().forEach((k) => linhasMes.push({ periodo: mesCurto(k), qtd: porMes.get(k).length, brincos: listaBrincos(porMes.get(k)) }));
  if (semPrev.length) linhasMes.push({ periodo: 'Sem previsão', qtd: semPrev.length, brincos: listaBrincos(semPrev.map((l) => l.matriz.brinco)) });
  const prox30 = futuras.filter((l) => l.dias <= 30).length;
  return {
    titulo: 'Previsão de parto',
    resumo: [
      { rotulo: 'Cheias', valor: cheias.length },
      { rotulo: 'Atrasadas', valor: atrasadas.length },
      { rotulo: 'Próximos 30 dias', valor: prox30 },
      { rotulo: 'Sem previsão calculada', valor: semPrev.length },
    ],
    secoes: [
      {
        titulo: 'Partos previstos por mês',
        nota: `Cálculo: toque menos os dias de gestação (DG) mais ${PERIODO_GESTACAO_DIAS} dias; sem DG, a IATF mais recente mais ${PERIODO_GESTACAO_DIAS}. "Atrasadas" são as que já passaram da data: confira se pariram.`,
        colunas: [{ k: 'periodo', label: 'Período' }, { k: 'qtd', label: 'Vacas', align: 'right', mono: true }, { k: 'brincos', label: 'Brincos', mono: true }],
        linhas: linhasMes,
      },
      {
        titulo: 'Vaca por vaca',
        colunas: [
          { k: 'brinco', label: 'Brinco', mono: true }, { k: 'categoria', label: 'Categoria' },
          { k: 'previsao', label: 'Previsão', mono: true }, { k: 'dias', label: 'Dias', align: 'right', mono: true },
        ],
        linhas: cheias.map((l) => ({
          brinco: l.matriz.brinco, categoria: [l.matriz.categoria, l.matriz.raca].filter(Boolean).join(' · '),
          previsao: l.previsao ? formatarDataBR(l.previsao) : '—', dias: l.dias === null ? '—' : l.dias,
        })),
      },
    ],
  };
}

export function relatorioNascimentos(matrizes, eventos, touros, ano) {
  const nascs = filtrarPorAno(eventos, ano).filter((e) => e.tipo === 'nascimento');
  const mapa = mapaBrincos(matrizes);
  const vivos = nascs.filter((n) => n.resultadoParto !== 'Natimorto');
  const machos = vivos.filter((n) => n.sexo === 'Macho').length;
  const femeas = vivos.filter((n) => n.sexo === 'Fêmea').length;
  const semSexo = vivos.length - machos - femeas;
  const natimortos = nascs.length - vivos.length;
  const contar = (lista) => {
    const v = lista.filter((n) => n.resultadoParto !== 'Natimorto');
    return {
      machos: v.filter((n) => n.sexo === 'Macho').length,
      femeas: v.filter((n) => n.sexo === 'Fêmea').length,
      semSexo: v.filter((n) => n.sexo !== 'Macho' && n.sexo !== 'Fêmea').length,
      natimortos: lista.length - v.length,
      total: lista.length,
    };
  };
  const meses = new Map();
  nascs.forEach((n) => { const k = (n.data || '').slice(0, 7) || 'sem-data'; if (!meses.has(k)) meses.set(k, []); meses.get(k).push(n); });
  const linhasMes = [...meses.keys()].sort().map((k) => ({ periodo: k === 'sem-data' ? 'Sem data' : mesCurto(k), ...contar(meses.get(k)) }));
  if (linhasMes.length) linhasMes.push({ periodo: 'Total', ...contar(nascs) });
  const pais = new Map();
  nascs.forEach((n) => { const nome = nomeTouroEvento(n, touros) || 'Pai não informado'; if (!pais.has(nome)) pais.set(nome, []); pais.get(nome).push(n); });
  const linhasPai = [...pais.entries()].sort((a, b) => b[1].length - a[1].length).map(([nome, lista]) => ({ pai: nome, ...contar(lista) }));
  const colSexo = [
    { k: 'machos', label: 'Machos', align: 'right', mono: true }, { k: 'femeas', label: 'Fêmeas', align: 'right', mono: true },
    { k: 'semSexo', label: 'Sem sexo', align: 'right', mono: true }, { k: 'natimortos', label: 'Natim.', align: 'right', mono: true },
    { k: 'total', label: 'Total', align: 'right', mono: true },
  ];
  const pct = (x, base) => (base ? `${Math.round((x / base) * 100)}%` : '—');
  return {
    titulo: `Nascimentos por sexo · ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: 'Nascimentos', valor: nascs.length },
      { rotulo: 'Machos', valor: `${machos} (${pct(machos, machos + femeas)})` },
      { rotulo: 'Fêmeas', valor: `${femeas} (${pct(femeas, machos + femeas)})` },
      { rotulo: 'Natimortos', valor: natimortos },
      { rotulo: 'Vivos sem sexo anotado', valor: semSexo },
    ],
    secoes: [
      { titulo: 'Por mês', colunas: [{ k: 'periodo', label: 'Mês' }, ...colSexo], linhas: linhasMes },
      { titulo: 'Por pai (touro / sêmen)', colunas: [{ k: 'pai', label: 'Pai' }, ...colSexo], linhas: linhasPai },
      {
        titulo: 'Lançamentos',
        colunas: [
          { k: 'data', label: 'Data', mono: true }, { k: 'mae', label: 'Mãe', mono: true }, { k: 'cria', label: 'Cria', mono: true },
          { k: 'sexo', label: 'Sexo' }, { k: 'resultado', label: 'Resultado' },
        ],
        linhas: [...nascs].sort((a, b) => (b.data || '').localeCompare(a.data || '')).map((n) => ({
          data: formatarDataBR(n.data), mae: mapa[n.matrizId] || '—', cria: n.brincoBezerro || '—',
          sexo: n.sexo || '—', resultado: n.resultadoParto || '',
        })),
      },
    ],
  };
}

// Agrupa os toques "Prenhe" de uma matriz em gestações (vários toques da mesma prenhez contam uma vez só)
export function gestacoesDe(matrizId, eventos) {
  const diags = eventos.filter((e) => e.tipo === 'diagnostico' && e.matrizId === matrizId && e.resultado === 'Prenhe' && e.data)
    .sort((a, b) => a.data.localeCompare(b.data));
  const partos = eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === matrizId && e.data).map((e) => e.data).sort();
  const iatfs = eventos.filter((e) => e.tipo === 'iatf' && e.matrizId === matrizId && e.data).map((e) => e.data).sort();
  const grupos = [];
  diags.forEach((d) => {
    const g = grupos[grupos.length - 1];
    const mesmaGestacao = g && diasEntre(g.ultima, d.data) <= 150 && !partos.some((p) => p > g.ultima && p <= d.data);
    if (mesmaGestacao) { g.diags.push(d); g.ultima = d.data; } else grupos.push({ diags: [d], primeira: d.data, ultima: d.data });
  });
  return grupos.map((g) => {
    const comDG = [...g.diags].reverse().find((d) => d.dg !== '' && d.dg !== null && d.dg !== undefined && !isNaN(parseInt(d.dg, 10)));
    let concepcao = null;
    if (comDG) concepcao = addDias(comDG.data, -parseInt(comDG.dg, 10));
    else {
      const candidatas = iatfs.filter((i) => i <= g.primeira && diasEntre(i, g.primeira) <= 90);
      if (candidatas.length) concepcao = candidatas[candidatas.length - 1];
    }
    const partoAnterior = concepcao ? [...partos].reverse().find((p) => p < concepcao) : null;
    const diasAbertos = concepcao && partoAnterior ? diasEntre(partoAnterior, concepcao) : null;
    return { primeira: g.primeira, concepcao, partoAnterior: partoAnterior || null, diasAbertos: diasAbertos !== null && diasAbertos > 0 && diasAbertos < 700 ? diasAbertos : null };
  });
}

function mediaOuNull(nums) {
  const v = nums.filter((n) => n !== null && n !== undefined && !isNaN(n));
  return v.length ? Math.round(v.reduce((s, n) => s + n, 0) / v.length) : null;
}

export function relatorioMelhoresVacas(matrizes, eventos, ano) {
  const noPeriodo = (d) => ano === 'todos' || anoDe(d) === ano;
  const linhas = matrizes.map((m) => {
    const servicos = eventos.filter((e) => e.tipo === 'iatf' && e.matrizId === m.id && noPeriodo(e.data)).length;
    const gest = gestacoesDe(m.id, eventos).filter((g) => noPeriodo(g.primeira));
    const partos = eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === m.id && noPeriodo(e.data)).length;
    const datasPartos = eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === m.id && e.data).map((e) => e.data).sort();
    const intervalos = [];
    for (let i = 1; i < datasPartos.length; i++) { const d = diasEntre(datasPartos[i - 1], datasPartos[i]); if (d > 200 && d < 900) intervalos.push(d); }
    const prenhezes = gest.length;
    return {
      m, servicos, prenhezes, partos,
      taxa: servicos ? Math.min(100, Math.round((prenhezes / servicos) * 100)) : null,
      diasAbertos: mediaOuNull(gest.map((g) => g.diasAbertos)),
      ipp: mediaOuNull(intervalos),
    };
  }).filter((l) => l.servicos > 0 || l.prenhezes > 0);

  linhas.sort((a, b) => (b.prenhezes - a.prenhezes)
    || ((b.taxa ?? -1) - (a.taxa ?? -1))
    || ((a.diasAbertos ?? 9999) - (b.diasAbertos ?? 9999))
    || String(a.m.brinco).localeCompare(String(b.m.brinco), 'pt-BR', { numeric: true }));

  const colunas = [
    { k: 'pos', label: '#', align: 'right', mono: true }, { k: 'brinco', label: 'Brinco', mono: true },
    { k: 'servicos', label: 'IATF', align: 'right', mono: true }, { k: 'prenhezes', label: 'Prenhez', align: 'right', mono: true },
    { k: 'taxa', label: 'Taxa', align: 'right', mono: true }, { k: 'diasAbertos', label: 'Dias abertos', align: 'right', mono: true },
    { k: 'ipp', label: 'Interv. partos', align: 'right', mono: true }, { k: 'partos', label: 'Partos', align: 'right', mono: true },
  ];
  const fmt = (l, i) => ({
    pos: i + 1, brinco: l.m.brinco, servicos: l.servicos, prenhezes: l.prenhezes,
    taxa: l.taxa === null ? '—' : `${l.taxa}%`, diasAbertos: l.diasAbertos === null ? '—' : l.diasAbertos,
    ipp: l.ipp === null ? '—' : l.ipp, partos: l.partos,
  });
  const comPrenhez = linhas.filter((l) => l.prenhezes > 0);
  const observar = linhas.filter((l) => l.servicos >= 2 && l.prenhezes === 0);
  return {
    titulo: `Melhores vacas em prenhez · ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: 'Vacas com IATF ou toque no período', valor: linhas.length },
      { rotulo: 'Com prenhez confirmada', valor: comPrenhez.length },
      { rotulo: 'Para observar (2+ IATF, sem prenhez)', valor: observar.length },
    ],
    secoes: [
      {
        titulo: 'Ranking',
        nota: 'Ordem: mais prenhezes, depois melhor taxa (prenhez por IATF), depois menos dias abertos (do parto até a concepção). "Interv. partos" usa todo o histórico lançado. Traço (—) = faltou informação para calcular.',
        colunas, linhas: comPrenhez.slice(0, 25).map(fmt),
      },
      {
        titulo: 'Para observar',
        nota: 'Duas ou mais IATF no período e nenhuma prenhez confirmada. Vale rever com o veterinário.',
        colunas: colunas.filter((c) => ['pos', 'brinco', 'servicos', 'prenhezes', 'partos'].includes(c.k)),
        linhas: observar.map(fmt),
      },
    ],
  };
}

export function relatorioIATF(matrizes, eventos, touros, ano) {
  const todas = eventos.filter((e) => e.tipo === 'iatf' && e.data);
  const doAno = filtrarPorAno(todas, ano);
  const resultadoDe = (iatf) => {
    const proximas = todas.filter((x) => x.matrizId === iatf.matrizId && x.data > iatf.data).map((x) => x.data).sort();
    const limite = proximas.length ? proximas[0] : addDias(iatf.data, 150);
    const diags = eventos.filter((e) => e.tipo === 'diagnostico' && e.matrizId === iatf.matrizId && e.data > iatf.data && e.data <= limite)
      .sort((a, b) => a.data.localeCompare(b.data));
    if (diags.some((d) => d.resultado === 'Prenhe')) return 'Prenhe';
    if (diags.length) return 'Vazia';
    return 'Sem diagnóstico';
  };
  const itens = doAno.map((e) => ({ e, r: resultadoDe(e) }));
  const contar = (lista) => {
    const prenhes = lista.filter((x) => x.r === 'Prenhe').length;
    const vazias = lista.filter((x) => x.r === 'Vazia').length;
    const sem = lista.length - prenhes - vazias;
    return { total: lista.length, prenhes, vazias, sem, taxa: prenhes + vazias ? `${Math.round((prenhes / (prenhes + vazias)) * 100)}%` : '—' };
  };
  const agrupar = (chaveFn) => {
    const mapa = new Map();
    itens.forEach((x) => { const k = chaveFn(x.e); if (!mapa.has(k)) mapa.set(k, []); mapa.get(k).push(x); });
    return mapa;
  };
  const cols = [
    { k: 'total', label: 'IATF', align: 'right', mono: true }, { k: 'prenhes', label: 'Prenhes', align: 'right', mono: true },
    { k: 'vazias', label: 'Vazias', align: 'right', mono: true }, { k: 'sem', label: 'Sem diag.', align: 'right', mono: true },
    { k: 'taxa', label: 'Taxa', align: 'right', mono: true },
  ];
  const porData = agrupar((e) => e.data);
  const porTent = agrupar((e) => e.numeroServico || 'Não informada');
  const porTouro = agrupar((e) => nomeTouroEvento(e, touros) || 'Touro/sêmen não informado');
  const porTipo = agrupar((e) => e.tipoServico || 'IATF');
  const total = contar(itens);
  const custo = doAno.reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  return {
    titulo: `IATF · ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: 'IATF / coberturas', valor: total.total },
      { rotulo: 'Prenhes', valor: total.prenhes },
      { rotulo: 'Vazias', valor: total.vazias },
      { rotulo: 'Sem diagnóstico ainda', valor: total.sem },
      { rotulo: 'Taxa de prenhez (diagnosticadas)', valor: total.taxa },
      ...(custo > 0 ? [{ rotulo: 'Custo lançado (R$)', valor: custo.toFixed(2) }] : []),
    ],
    secoes: [
      {
        titulo: 'Por data (lote de IATF)',
        nota: 'Resultado = o que o toque seguinte registrou para aquela vaca (até a próxima IATF dela, no máximo 150 dias).',
        colunas: [{ k: 'chave', label: 'Data', mono: true }, ...cols],
        linhas: [...porData.keys()].sort().map((k) => ({ chave: formatarDataBR(k), ...contar(porData.get(k)) })),
      },
      { titulo: 'Por tentativa', colunas: [{ k: 'chave', label: 'Tentativa' }, ...cols], linhas: [...porTent.keys()].sort().map((k) => ({ chave: k, ...contar(porTent.get(k)) })) },
      { titulo: 'Por touro / sêmen', colunas: [{ k: 'chave', label: 'Touro / sêmen' }, ...cols], linhas: [...porTouro.keys()].sort().map((k) => ({ chave: k, ...contar(porTouro.get(k)) })) },
      { titulo: 'Por tipo de serviço', colunas: [{ k: 'chave', label: 'Tipo' }, ...cols], linhas: [...porTipo.keys()].sort().map((k) => ({ chave: k, ...contar(porTipo.get(k)) })) },
    ],
  };
}

export function relatorioSituacaoVacas(matrizes, eventos, hoje) {
  hoje = hoje || todayISO();
  const brincosDe = (arr) => listaBrincos(arr.map((m) => m.brinco));
  const contarPor = (campo, vazioRotulo) => {
    const mapa = new Map();
    matrizes.forEach((m) => { const k = m[campo] || vazioRotulo; if (!mapa.has(k)) mapa.set(k, []); mapa.get(k).push(m); });
    return [...mapa.entries()].sort((a, b) => b[1].length - a[1].length).map(([k, lista]) => ({
      chave: k, total: lista.length,
      cheias: lista.filter((m) => m.status === 'Cheia').length,
      vazias: lista.filter((m) => m.status === 'Vazia').length,
      descarte: lista.filter((m) => m.status === 'Descarte').length,
    }));
  };
  const cols = [
    { k: 'total', label: 'Total', align: 'right', mono: true }, { k: 'cheias', label: 'Cheias', align: 'right', mono: true },
    { k: 'vazias', label: 'Vazias', align: 'right', mono: true }, { k: 'descarte', label: 'Descarte', align: 'right', mono: true },
  ];
  const cheias = matrizes.filter((m) => m.status === 'Cheia');
  const vazias = matrizes.filter((m) => m.status === 'Vazia');
  const descarte = matrizes.filter((m) => m.status === 'Descarte');
  const prev = (m) => previsaoPartoInfo(m.id, eventos);
  const cheiasEmDia = cheias.filter((m) => { const p = prev(m); return p && p.data && diasEntre(hoje, p.data) >= 0; });
  const cheiasAtrasadas = cheias.filter((m) => { const p = prev(m); return p && p.data && diasEntre(hoje, p.data) < 0; });
  const cheiasSemPrev = cheias.filter((m) => { const p = prev(m); return !p || !p.data; });
  const diasDesdeParto = (m) => { const u = ultimoPartoDe(m.id, eventos); return u ? diasEntre(u, hoje) : null; };
  const vaziasRecentes = vazias.filter((m) => { const d = diasDesdeParto(m); return d !== null && d <= 60; });
  const vaziasACobrir = vazias.filter((m) => { const d = diasDesdeParto(m); return d !== null && d > 60; });
  const vaziasSemParto = vazias.filter((m) => diasDesdeParto(m) === null);
  const semHistorico = matrizes.filter((m) => m.status !== 'Descarte'
    && !eventos.some((e) => (e.tipo === 'iatf' || e.tipo === 'diagnostico') && e.matrizId === m.id));
  const bucket = (rotulo, arr) => ({ situacao: rotulo, qtd: arr.length, brincos: brincosDe(arr) });
  return {
    titulo: 'Situação das vacas · hoje',
    resumo: [
      { rotulo: 'Matrizes', valor: matrizes.length }, { rotulo: 'Cheias', valor: cheias.length },
      { rotulo: 'Vazias', valor: vazias.length }, { rotulo: 'Descarte', valor: descarte.length },
      { rotulo: 'Sem IATF nem toque lançados', valor: semHistorico.length },
    ],
    secoes: [
      {
        titulo: 'Situação reprodutiva',
        nota: 'Vazia "a cobrir" = mais de 60 dias desde o último parto lançado. Vazia sem parto lançado = a vaca não tem nascimento registrado no sistema.',
        colunas: [{ k: 'situacao', label: 'Situação' }, { k: 'qtd', label: 'Vacas', align: 'right', mono: true }, { k: 'brincos', label: 'Brincos', mono: true }],
        linhas: [
          bucket('Cheia, parto no prazo', cheiasEmDia), bucket('Cheia, parto atrasado (conferir)', cheiasAtrasadas),
          bucket('Cheia, sem previsão calculada', cheiasSemPrev), bucket('Vazia, parto recente (até 60 dias)', vaziasRecentes),
          bucket('Vazia, a cobrir (mais de 60 dias do parto)', vaziasACobrir), bucket('Vazia, sem parto lançado', vaziasSemParto),
          bucket('Descarte', descarte),
        ],
      },
      { titulo: 'Por categoria', colunas: [{ k: 'chave', label: 'Categoria' }, ...cols], linhas: contarPor('categoria', 'Sem categoria') },
      { titulo: 'Por raça', colunas: [{ k: 'chave', label: 'Raça' }, ...cols], linhas: contarPor('raca', 'Raça não informada') },
      { titulo: 'Por lote', colunas: [{ k: 'chave', label: 'Lote' }, ...cols], linhas: contarPor('lote', 'Sem lote') },
    ],
  };
}

export const RELATORIOS = [
  { id: 'previsao', titulo: 'Previsão de parto', porAno: false },
  { id: 'nascimentos', titulo: 'Nascimentos por sexo', porAno: true },
  { id: 'melhores', titulo: 'Melhores vacas em prenhez', porAno: true },
  { id: 'iatf', titulo: 'IATF', porAno: true },
  { id: 'situacao', titulo: 'Situação das vacas', porAno: false },
];

export function montarRelatorio(id, { matrizes, touros, eventos }, ano, hoje) {
  if (id === 'previsao') return relatorioPrevisaoParto(matrizes, eventos, hoje);
  if (id === 'nascimentos') return relatorioNascimentos(matrizes, eventos, touros, ano);
  if (id === 'melhores') return relatorioMelhoresVacas(matrizes, eventos, ano);
  if (id === 'iatf') return relatorioIATF(matrizes, eventos, touros, ano);
  return relatorioSituacaoVacas(matrizes, eventos, hoje);
}

// ---------------------------------------------------------------- planilha / Excel
// Linhas (objetos) de cada aba da Planilha. Eventos já vêm filtrados pelo ano escolhido.
export function linhasPlanilha(tipo, { matrizes, touros, eventos }) {
  const brincoMap = mapaBrincos(matrizes);
  const nomeTouro = (e) => nomeTouroEvento(e, touros);
  if (tipo === 'matrizes') {
    return matrizes.map((m) => ({
      'Brinco': m.brinco, 'Categoria': m.categoria, 'Raça': m.raca || '',
      'Lote': m.lote || '', 'Data Nasc.': formatarDataBR(m.dataNascimento) || '', 'Status': m.status,
      'Partos (Fazenda)': eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === m.id).length,
      'Partos Ant.': m.partosAnteriores || 0,
      'Último Parto': formatarDataBR(ultimoPartoDe(m.id, eventos)) || '',
      'Nº Cria': numeroCriaUltimoParto(m.id, eventos),
    }));
  }
  if (tipo === 'touros') {
    return touros.map((t) => {
      const usadas = eventos.filter((e) => e.tipo === 'iatf' && e.touroId === t.id).length;
      const adquiridas = parseInt(t.doses) || 0;
      return {
        'Nome': t.nome, 'Raça': t.raca, 'Fornecedor': t.fornecedor || '', 'Ano': t.anoAquisicao || '',
        'Doses Adq.': adquiridas, 'Doses Usadas': usadas, 'Doses Rest.': adquiridas ? adquiridas - usadas : '',
        'Custo/Dose (R$)': t.custoDose || '', 'Observações': t.observacoes || '',
      };
    });
  }
  const evs = eventos.filter((e) => e.tipo === tipo);
  if (tipo === 'nascimento') {
    return evs.map((e) => ({
      'Data': formatarDataBR(e.data), 'Matriz': brincoMap[e.matrizId] || '', 'Resultado': e.resultadoParto || '',
      'Sexo': e.sexo || '', 'Peso (kg)': e.pesoNascer || '', 'Brinco Bezerro': e.brincoBezerro || '',
      'Pelagem': e.pelagem || '', 'Pai': nomeTouro(e), 'Tipo Parto': e.tipoParto || '', 'Observações': e.observacoes || '',
    }));
  }
  if (tipo === 'desmama') {
    return evs.map((e) => ({ 'Data': formatarDataBR(e.data), 'Brinco Bezerro': e.brincoBezerro || '', 'Peso (kg)': e.pesoDesmama || '', 'Idade (dias)': e.idadeDias || '' }));
  }
  if (tipo === 'recria') {
    return evs.map((e) => ({ 'Data': formatarDataBR(e.data), 'Novilha': brincoMap[e.matrizId] || '', 'Peso Atual (kg)': e.pesoAtual || '', 'Apta Reprodução': e.aptaReproducao || '', 'Observações': e.observacoes || '' }));
  }
  if (tipo === 'iatf') {
    return evs.map((e) => ({
      'Data': formatarDataBR(e.data), 'Matriz': brincoMap[e.matrizId] || '', 'Tipo': e.tipoServico || '', 'Nº Tent.': e.numeroServico || '',
      'Início Protocolo': formatarDataBR(e.dataInicioProtocolo) || '', 'Touro/Sêmen': nomeTouro(e), 'Técnico': e.tecnico || '',
      'Custo (R$)': e.custo || '', 'Observações': e.observacoes || '',
    }));
  }
  if (tipo === 'diagnostico') {
    return evs.map((e) => ({
      'Data': formatarDataBR(e.data), 'Matriz': brincoMap[e.matrizId] || '', 'Resultado': e.resultado || '', 'Método': e.metodo || '',
      'DG (dias)': e.dg || '', 'Veterinário': e.veterinario || '', 'Custo (R$)': e.custo || '', 'Motivo (se descarte)': e.motivo || '',
    }));
  }
  if (tipo === 'venda') {
    return evs.map((e) => ({
      'Data': formatarDataBR(e.data), 'Categoria': e.categoria || '', 'Animais': e.animais || '', 'Peso Total (kg)': e.pesoTotal || '',
      'Valor Arroba (R$)': e.valorArroba || '', 'Valor Total (R$)': e.valorTotal || '', 'Frete/Comissão (R$)': e.frete || '', 'Comprador': e.comprador || '',
    }));
  }
  if (tipo === 'insumo') {
    return evs.map((e) => ({ 'Data': formatarDataBR(e.data), 'Produto': e.produto || '', 'Quantidade': e.quantidade || '', 'Unidade': e.unidade || '', 'Custo (R$)': e.custo || '', 'Categoria Animal': e.categoriaAnimal || '' }));
  }
  if (tipo === 'descarte') {
    return evs.map((e) => ({
      'Data': formatarDataBR(e.data), 'Matriz': brincoMap[e.matrizId] || '', 'Motivo': e.motivo || '',
      'Origem': e.origemDiagnostico ? 'Diagnóstico veterinário' : 'Lançamento manual',
    }));
  }
  return [];
}

export const ABAS_EXCEL = [
  ['Matrizes', 'matrizes'], ['Nascimentos', 'nascimento'], ['Desmama', 'desmama'], ['Recria', 'recria'], ['IATF', 'iatf'],
  ['Diagnósticos', 'diagnostico'], ['Vendas', 'venda'], ['Insumos', 'insumo'], ['Descartes', 'descarte'], ['Touros', 'touros'],
];
