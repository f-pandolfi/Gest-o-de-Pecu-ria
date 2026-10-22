// logica.js: regras da Gestão da Pecuária (sem React, sem tela).
// É usado por dois lados: o app (app.jsx) e a integração por foto (lançamentos em lote feitos pelo Claude).
// Mexeu aqui = mudou nos dois, de propósito: uma única fonte da verdade para status, previsão e relatórios.

export const VERSAO_APP = '10.4 (22/10/26)';
export const VERSAO_MINIMA_SCRIPT = 12; // v12 = protocolos, manejos, touros completos (v11 = não duplica reenvio; v10 = aba Mortes)
export const PERIODO_GESTACAO_DIAS = 285; // mesmo período usado na planilha original da fazenda

// Tipos de lançamento visíveis no modo Funcionário (restrito)
export const TIPOS_FUNCIONARIO = ['nascimento', 'desmama', 'insumo', 'descarte', 'pesagem', 'morte']; // IATF agora é pelo protocolo (tela Manejo)

// Morte de animal (qualquer um: cria, novilha, matriz, touro ou animal sem cadastro)
export const CAUSAS_MORTE = ['Doença', 'Acidente', 'Picada de cobra', 'Raio', 'Parto difícil', 'Não sabe', 'Outra'];
export const TIPOS_ANIMAL_MORTE = ['Cria', 'Novilha', 'Matriz', 'Touro', 'Boi', 'Outro'];

export const TIPOS_EVENTO = [
  { id: 'cadastro', label: 'Nova Matriz' },
  { id: 'touro', label: 'Touro / Sêmen' },
  { id: 'iatf', label: 'Inseminação (IATF)' },
  { id: 'diagnostico', label: 'Diagnóstico (Toque)' },
  { id: 'nascimento', label: 'Nascimento' },
  { id: 'desmama', label: 'Desmama' },
  { id: 'recria', label: 'Recria (pesagem)' },
  { id: 'pesagem', label: 'Pesagem' },
  { id: 'venda', label: 'Venda' },
  { id: 'vendaitem', label: 'Animal vendido' },
  { id: 'insumo', label: 'Sal / Medicamento' },
  { id: 'descarte', label: 'Descarte' },
  { id: 'morte', label: 'Morte' },
  { id: 'manejo', label: 'Manejo' },
];

// Campos editáveis ao clicar numa matriz (modo proprietário)
export const CAMPOS_EDICAO_MATRIZ = [
  { key: 'brinco', label: 'Brinco / ID', type: 'text', required: true },
  { key: 'categoria', label: 'Categoria', type: 'select', options: ['Novilha', 'Primípara', 'Multípara', 'Vaca'] },
  { key: 'raca', label: 'Raça', type: 'text' },
  { key: 'lote', label: 'Lote / piquete', type: 'text' },
  { key: 'dataNascimento', label: 'Data de nascimento', type: 'date' },
  { key: 'partosAnteriores', label: 'Partos antes de entrar na fazenda', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['Vazia', 'Cheia', 'Descarte', 'Vendida'] },
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
    { key: 'matrizId', label: 'Matriz (mãe)', type: 'matriz', required: true },
    { key: 'data', label: 'Data do nascimento', type: 'date', required: true },
    { key: 'resultadoParto', label: 'Resultado', type: 'select', options: ['Vivo', 'Natimorto'], required: true, default: 'Vivo' },
    { key: 'sexo', label: 'Sexo', type: 'select', options: ['Fêmea', 'Macho'], required: true },
    { key: 'brincoBezerro', label: 'Brinco do bezerro (sugerido automaticamente)', type: 'text', required: true },
    { key: 'pelagem', label: 'Pelagem', type: 'text' },
    // Sem campo "Pai": a origem da cria (IATF ou monta) e o pai são deduzidos depois, cruzando o parto
    // com o IATF da mãe (ver origemDaCria). Sem IATF compatível, a cria é de monta natural.
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
  // Pesagem de cria ou novilha. O animal é achado pelo brinco (ver acharAnimal); a tela de Crias também manda criaId/matrizId.
  pesagem: [
    { key: 'brinco', label: 'Brinco do animal', type: 'text', required: true },
    { key: 'data', label: 'Data da pesagem', type: 'date', required: true },
    { key: 'peso', label: 'Peso (kg)', type: 'number', required: true },
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
  // Morte de qualquer animal. O animal é achado pelo brinco (cria, novilha ou matriz); sem cadastro, escolhe-se o tipo (ver validarMorte).
  morte: [
    { key: 'brinco', label: 'Brinco do animal', type: 'text' },
    { key: 'data', label: 'Data da morte', type: 'date', required: true },
    { key: 'causa', label: 'Causa', type: 'select', options: CAUSAS_MORTE, required: true },
    { key: 'tipoAnimal', label: 'Que animal é', type: 'select', options: TIPOS_ANIMAL_MORTE },
    { key: 'observacoes', label: 'Observação', type: 'text' },
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
    ...m, brinco: String(m.brinco ?? ''), dataNascimento: normalizarDataISO(m.dataNascimento), dataBaixa: normalizarDataISO(m.dataBaixa),
  }));
  const eventos = (data.eventos || []).map((e) => ({
    ...e,
    data: normalizarDataISO(e.data),
    dataInicioProtocolo: normalizarDataISO(e.dataInicioProtocolo),
    brincoBezerro: e.brincoBezerro === undefined || e.brincoBezerro === null ? '' : String(e.brincoBezerro),
  }));
  return { matrizes: reconciliarMortes(matrizes, eventos), touros: data.touros || [], eventos, config: data.config && typeof data.config === 'object' ? data.config : {} };
}

// Se uma gravação parou no meio (a morte chegou na planilha mas a matriz não), o evento manda: matriz com morte ativa fica
// "Morta"; matriz "Morta" cujas mortes foram todas anuladas volta ao status de antes.
function reconciliarMortes(matrizes, eventos) {
  const porMatriz = new Map();
  eventos.forEach((e) => { if (e.tipo === 'morte' && e.matrizId) { if (!porMatriz.has(e.matrizId)) porMatriz.set(e.matrizId, []); porMatriz.get(e.matrizId).push(e); } });
  if (!porMatriz.size) return matrizes;
  return matrizes.map((m) => {
    const mortes = porMatriz.get(m.id);
    if (!mortes) return m;
    const ativa = mortes.find(morteAtiva);
    if (ativa && m.status !== 'Morta') return { ...m, status: 'Morta', dataBaixa: m.dataBaixa || ativa.data || '', motivoBaixa: m.motivoBaixa || `Morte: ${ativa.causa || ''}` };
    if (!ativa && m.status === 'Morta') return { ...m, status: mortes[mortes.length - 1].statusAnterior || 'Vazia', dataBaixa: '', motivoBaixa: '' };
    return m;
  });
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
    .filter((m) => m.status === status && noPlantel(m))
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
export function calcularKPIs(todasMatrizes, eventos) {
  const matrizes = todasMatrizes.filter(noPlantel); // fora: vendidas (baixa) e novilhas ainda na recria
  const vendidas = todasMatrizes.filter((m) => m.status === 'Vendida').length;
  const mortas = todasMatrizes.filter((m) => m.status === 'Morta').length;
  const mortesAtivas = eventos.filter(morteAtiva);
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
  const emRecria = todasMatrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta' && m.categoria === 'Novilha' && m.status !== 'Descarte').length;
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
    iatfs: iatfs.length, diagnosticos: diagnosticos.length, vendidas, mortas,
    mortes: mortesAtivas.length, mortesCrias: mortesAtivas.filter((e) => e.tipoAnimal === 'Cria').length,
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
    ['Matrizes vendidas (baixa)', kpis.vendidas || 0],
    ['Matrizes mortas (baixa)', kpis.mortas || 0],
    ['Novilhas em recria (hoje)', kpis.emRecria],
    ['Taxa de prenhez do ano (%)', kpis.taxaPrenhez.toFixed(1)],
    ['', ''],
    ['Nascimentos', kpis.nascimentos],
    ['Natimortos', kpis.natimortos],
    ['Taxa de perda ao nascer (%)', kpis.taxaPerda.toFixed(1)],
    ['Mortes de animais (ano)', kpis.mortes || 0],
    ['Mortes de crias (ano)', kpis.mortesCrias || 0],
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

// Origem da cria e pai, deduzidos do cruzamento do parto com o IATF da mãe (o nascimento não tem mais campo "Pai").
// IATF compatível = IATF da mesma mãe de 250 a 320 dias antes do parto (gestação de ~285). O pai é o touro/sêmen desse IATF.
// Sem IATF compatível, ou com "Repasse (monta natural)", a cria é de monta natural.
export const JANELA_IATF_DIAS = [250, 320];
export function origemDaCria(nasc, eventos, touros, protocolos) {
  const informado = nomeTouroEvento(nasc, touros); // lançamentos antigos que já traziam o pai
  if (informado) return { origem: 'Informado', pai: informado, iatfData: '', rotulo: informado };
  if (!nasc.matrizId) return { origem: 'Sem mãe', pai: '', iatfData: '', rotulo: 'Mãe não informada' };
  if (!nasc.data) return { origem: 'Monta', pai: 'Monta natural', iatfData: '', rotulo: 'Monta natural' };
  const [min, max] = JANELA_IATF_DIAS;
  const dias = (d) => Math.round((new Date(nasc.data) - new Date(d)) / 86400000);
  const candidatos = (eventos || []).filter((e) => e.tipo === 'iatf' && e.matrizId === nasc.matrizId && e.data && dias(e.data) >= min && dias(e.data) <= max);
  if (!candidatos.length) return origemPelaMonta(nasc, touros, protocolos) || { origem: 'Monta', pai: 'Monta natural', iatfData: '', rotulo: 'Monta natural' };
  candidatos.sort((a, b) => Math.abs(dias(a.data) - PERIODO_GESTACAO_DIAS) - Math.abs(dias(b.data) - PERIODO_GESTACAO_DIAS));
  const e = candidatos[0];
  const nome = nomeTouroEvento(e, touros);
  if (/repasse|monta/i.test(e.tipoServico || '')) {
    return { origem: 'Monta', pai: nome || 'Monta natural', iatfData: e.data, rotulo: nome ? `Monta · ${nome}` : 'Monta natural' };
  }
  return { origem: 'IATF', pai: nome, iatfData: e.data, rotulo: nome ? `IATF · ${nome}` : 'IATF · touro não informado' };
}

// v10: sem IATF compatível, procura o lote de monta (protocolo de monta) em que a mãe estava na época da concepção.
// O lote pode ter mais de um touro: o pai fica "touro A ou B".
function origemPelaMonta(nasc, touros, protocolos) {
  if (!protocolos || !protocolos.length) return null;
  const concepcao = addDias(nasc.data, -PERIODO_GESTACAO_DIAS);
  const montas = protocolos.filter((p) => p.tipo === 'Monta' && p.dataInicio && (p.animais || []).includes(nasc.matrizId)
    && concepcao >= addDias(p.dataInicio, -20) && concepcao <= addDias(p.dataFim || addDias(p.dataInicio, 90), 20))
    .sort((a, b) => (b.dataInicio || '').localeCompare(a.dataInicio || ''));
  if (!montas.length) return null;
  const nomes = (montas[0].touros || []).map((id) => { const t = (touros || []).find((x) => x.id === id); return t ? t.nome : ''; }).filter(Boolean);
  const pai = nomes.length ? nomes.join(' ou ') : 'Monta natural';
  return { origem: 'Monta', pai, iatfData: '', rotulo: nomes.length ? `Monta · ${pai}` : `Monta (${montas[0].nome})` };
}

const semAcento = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const chave = (s) => semAcento(s).toLowerCase().trim();

// Acha matriz pelo brinco escrito (ignora espaços; "02024" casa com "2024"). Devolve { matriz } ou { erro }
// ---------------------------------------------------------------- lotes
// Nome do lote padronizado: se já existe um lote com o mesmo nome (sem diferença de maiúscula, acento ou espaço),
// usa a escrita que já existe. Assim "Novilhas", "NOVILHAS" e " novilhas " viram um lote só.
export const LOTE_NOVILHAS = 'NOVILHAS';
const chaveLote = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
export function mesmoLote(a, b) { return chaveLote(a) === chaveLote(b); }
export function padronizarLote(texto, matrizes) {
  const t = String(texto ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  if (mesmoLote(t, LOTE_NOVILHAS)) return LOTE_NOVILHAS;
  const ex = (matrizes || []).map((m) => String(m.lote ?? '').trim()).find((l) => l && mesmoLote(l, t));
  return ex || t;
}
// Lotes em uso (animais no rebanho), com quantos animais cada um tem
export function lotesExistentes(matrizes) {
  const cont = new Map();
  (matrizes || []).filter((m) => m.status !== 'Vendida' && m.status !== 'Morta').forEach((m) => {
    const l = padronizarLote(m.lote, matrizes);
    if (!l) return;
    cont.set(l, (cont.get(l) || 0) + 1);
  });
  return [...cont.entries()].map(([lote, n]) => ({ lote, n })).sort((a, b) => b.n - a.n || a.lote.localeCompare(b.lote, 'pt-BR'));
}

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
  // Nascimento: mãe, sexo e brinco da cria são obrigatórios (CAMPOS.nascimento). Brinco só com espaços conta como vazio.
  const vazio = (c) => !form[c.key] || (typeof form[c.key] === 'string' && !form[c.key].trim());
  return (CAMPOS[tipo] || []).filter((c) => c.required && (!c.showIf || c.showIf(form)) && vazio(c));
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
      raca: form.raca || '', lote: padronizarLote(form.lote, matrizes),
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
  } else if (tipo === 'desmama') {
    // Desmama de FÊMEA: a cria passa para o lote de novilhas (vira uma matriz "Novilha", destino "A definir").
    const nasc = acharCriaPorBrinco(eventos, form.brincoBezerro, form.data);
    const idade = nasc && nasc.data && form.data ? diasEntre(nasc.data, form.data) : '';
    const novoEvento = { id, tipo: 'desmama', ...form, idadeDias: form.idadeDias || (idade !== '' && idade >= 0 ? idade : ''), createdAt: now };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
    if (nasc && nasc.sexo === 'Fêmea') {
      const idNov = idNovilha(nasc.id);
      const jaTem = matrizes.some((x) => x.id === idNov || String(x.brinco).trim() === String(nasc.brincoBezerro).trim());
      if (!jaTem) {
        const nova = {
          id: idNov, brinco: String(nasc.brincoBezerro).trim(), categoria: 'Novilha', raca: '', lote: padronizarLote(LOTE_NOVILHAS, matrizes),
          dataNascimento: nasc.data || '', partosAnteriores: 0, status: 'Vazia', destino: 'A definir',
          dataBaixa: '', motivoBaixa: '', createdAt: now,
        };
        m = [...matrizes, nova];
        out.matrizesAlteradas.push(nova);
      }
    }
  } else if (tipo === 'morte') {
    // Morte de qualquer animal. Cria e novilha ficam ligadas pelo criaId/matrizId; a matriz que morreu vira "Morta" e sai do plantel.
    const info = infoAnimalMorte(estado, form.brinco);
    const novoEvento = {
      id, tipo: 'morte', data: form.data, tipoAnimal: info.achado ? info.tipoAnimal : (form.tipoAnimal || 'Outro'),
      criaId: info.criaId || '', matrizId: info.matrizId || '', brinco: info.achado ? info.brinco : String(form.brinco ?? '').trim(),
      causa: form.causa, observacoes: form.observacoes || '', statusAnterior: info.matriz ? info.matriz.status : '', anulada: '', createdAt: now,
    };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
    if (info.matriz) {
      const morta = { ...info.matriz, status: 'Morta', dataBaixa: form.data, motivoBaixa: `Morte: ${form.causa}` };
      m = matrizes.map((x) => (x.id === morta.id ? morta : x));
      out.matrizesAlteradas.push(morta);
    }
  } else if (tipo === 'pesagem') {
    // Pesagem de cria ou novilha. O animal vem pelo brinco (ou já com criaId / matrizId, quando escolhido numa lista).
    const a = acharAnimal(estado, form.brinco);
    const matrizId = (a && a.matriz && a.matriz.id) || form.matrizId || '';
    const criaId = (a && a.nasc && a.nasc.id) || form.criaId || '';
    const brinco = String(form.brinco || (a && a.nasc && a.nasc.brincoBezerro) || (a && a.matriz && a.matriz.brinco) || '').trim();
    const novoEvento = {
      id, tipo: 'pesagem', data: form.data, criaId, matrizId, brinco,
      peso: numPeso(form.peso), observacoes: form.observacoes || '', createdAt: now,
    };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
  } else {
    const novoEvento = { id, tipo, ...form, createdAt: now };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
  }
  return { estado: { ...estado, matrizes: m, touros: t, eventos: ev }, ...out };
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
//   nascimento: matriz, data, sexo, resultado, brincoCria, pelagem, tipoParto, obs  (pelo menos matriz, sexo ou brincoCria)
//   diagnostico: matriz, data, resultado, dg, metodo, veterinario, motivo
//   iatf: matriz, data, tipoServico, tentativa, inicioProtocolo, touro, tecnico, custo, obs
//   desmama: brincoCria, data, peso, idadeDias
//   descarte: matriz, data, motivo
//   recria: matriz, data, peso, apta, obs
//   pesagem: brincoCria (cria ou novilha; aceita também matriz antiga pelo brinco), data, peso, obs
//   insumo: data, produto, quantidade, unidade, custo, categoriaAnimal
//   venda: data, categoria, animais, pesoTotal, valorArroba, valorTotal, frete, comprador
//   morte: brincoCria (ou brinco), data, causa (Doença, Acidente, Picada de cobra, Raio, Parto difícil, Não sabe, Outra), tipoAnimal (só se o número não estiver cadastrado), obs
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
    // "pai" não é mais lançado no nascimento: a origem sai do cruzamento com o IATF da mãe (origemDaCria)
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
    const imd = infoAnimalMorte(estado, f.brincoBezerro);
    if (imd.jaMorto) return { erro: `cria ${f.brincoBezerro} morreu${imd.mortoEm ? ` em ${formatarDataBR(imd.mortoEm)}` : ''}; não dá para desmamar` };
    if (item.peso) f.pesoDesmama = item.peso;
    if (item.idadeDias) f.idadeDias = item.idadeDias;
  } else if (tipo === 'descarte') {
    if (item.motivo) f.motivo = item.motivo;
  } else if (tipo === 'recria') {
    if (item.peso) f.pesoAtual = item.peso;
    if (item.apta) f.aptaReproducao = item.apta;
    if (item.obs) f.observacoes = item.obs;
  } else if (tipo === 'pesagem') {
    const b = String(item.brincoCria ?? item.brinco ?? '').trim();
    if (!b) return { erro: 'brinco do animal em branco' };
    if (!acharAnimal(estado, b)) return { erro: `animal ${b} não encontrado (nem cria, nem matriz)` };
    const im = infoAnimalMorte(estado, b);
    if (im.jaMorto) return { erro: `animal ${b} morreu${im.mortoEm ? ` em ${formatarDataBR(im.mortoEm)}` : ''}; não dá para lançar peso` };
    const p = numPeso(item.peso);
    if (isNaN(p) || p <= 0) return { erro: `peso inválido (${item.peso ?? ''})` };
    f.brinco = b; f.peso = p;
    if (item.obs) f.observacoes = item.obs;
  } else if (tipo === 'morte') {
    const b = String(item.brincoCria ?? item.brinco ?? '').trim();
    if (b) f.brinco = b;
    f.causa = normCausaMorte(item.causa);
    if (!f.causa) return { erro: `causa da morte não entendida (${item.causa ?? ''})` };
    if (item.tipoAnimal) { f.tipoAnimal = normTipoAnimalMorte(item.tipoAnimal); if (!f.tipoAnimal) return { erro: `tipo de animal não entendido (${item.tipoAnimal})` }; }
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
  if (tipo === 'desmama') {
    // uma cria só é desmamada uma vez: qualquer desmama anterior desse brinco (em até 3 anos) já vale
    const nasc = acharCriaPorBrinco(eventos, form.brincoBezerro, form.data);
    return eventos.some((e) => e.tipo === 'desmama' && String(e.brincoBezerro).trim() === String(form.brincoBezerro).trim()
      && (e.data === form.data || (nasc && nasc.data && e.data >= nasc.data && diasEntre(nasc.data, e.data) < 1100)));
  }
  if (tipo === 'pesagem') {
    const a = acharAnimal(estado, form.brinco);
    const crId = (a && a.nasc && a.nasc.id) || form.criaId; const mzId = (a && a.matriz && a.matriz.id) || form.matrizId;
    return eventos.some((e) => e.tipo === 'pesagem' && e.data === form.data
      && ((crId && e.criaId === crId) || (mzId && e.matrizId === mzId) || (!crId && !mzId && String(e.brinco) === String(form.brinco))));
  }
  if (tipo === 'nascimento') {
    return eventos.some((e) => e.tipo === 'nascimento' && e.data === form.data
      && ((form.matrizId && e.matrizId === form.matrizId) || (form.brincoBezerro && e.brincoBezerro === form.brincoBezerro)));
  }
  if (tipo === 'morte') {
    const info = infoAnimalMorte(estado, form.brinco);
    return info.achado && info.jaMorto; // o mesmo animal só morre uma vez (vale qualquer data)
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
    if (item.tipo === 'morte') {
      const v = validarMorte(atual, form, hoje);
      if (v.erros.length) { rejeitados.push({ indice, item, motivo: v.erros.join(' ') }); return; }
      v.avisos.forEach((aviso) => avisos.push({ indice, aviso }));
    } else if (!item.forcar && jaExiste(item.tipo, form, atual)) { rejeitados.push({ indice, item, motivo: 'esse lançamento já existe (mesma matriz/cria e data)' }); return; }
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

// ---------------------------------------------------------------- crias, pesagens, novilhas e venda por peso
// A cria não tem cadastro próprio: ela é derivada do lançamento de nascimento (id do nascimento = id da cria).
// Pesagens e vendas são eventos (tipos "pesagem", "venda" e "vendaitem"); a desmama de uma fêmea cria a matriz "Novilha"
// com id fixo `cria-<id do nascimento>`, o que liga a novilha à cria sem coluna extra.
export const PESO_MATRIZ_PADRAO = 280; // a partir deste peso (kg) a novilha pode virar matriz
export const KG_POR_ARROBA = 15;
export const DESTINOS_NOVILHA = ['A definir', 'Matriz', 'Venda'];
// Plantel de matrizes: fora as vendidas e fora as novilhas que ainda estão na recria (destino "A definir" ou "Venda").
// Novilha antiga (sem destino) e novilha com destino "Matriz" fazem parte do plantel.
export const noPlantel = (m) => m.status !== 'Vendida' && m.status !== 'Morta' && !(m.categoria === 'Novilha' && (m.destino === 'A definir' || m.destino === 'Venda'));
export const TIPOS_ANIMAL_VENDA = ['Bezerro', 'Bezerra', 'Garrote', 'Novilha', 'Vaca de descarte', 'Vaca velha', 'Vaca', 'Boi', 'Touro', 'Outro'];

export const idNovilha = (nascId) => `cria-${nascId}`;

// Peso escrito como "280", "280,5" ou "280.5" -> número (NaN se não for número)
export function numPeso(v) {
  if (typeof v === 'number') return v;
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim().replace(',', '.');
  return s === '' ? NaN : Number(s);
}
const arred = (n, casas) => { const f = 10 ** (casas === undefined ? 1 : casas); return Math.round(n * f) / f; };

// Metas e critério de peso (guardados na aba Config da planilha). Valor ausente ou inválido = padrão / sem meta.
export function configCompleta(cfg) {
  const c = cfg || {};
  const pos = (v) => { const x = numPeso(v); return isNaN(x) || x <= 0 ? null : x; };
  return { pesoMatriz: pos(c.pesoMatriz) || PESO_MATRIZ_PADRAO, metaPesoMacho: pos(c.metaPesoMacho), metaQtdMacho: pos(c.metaQtdMacho) };
}

const mesmoBrinco = (a, b) => {
  const x = String(a ?? '').trim(); const y = String(b ?? '').trim();
  if (!x || !y) return false;
  return x === y || (/^\d+$/.test(x) && /^\d+$/.test(y) && Number(x) === Number(y));
};

// Nascimento (cria viva) com aquele brinco; se houver repetido de outro ano, o mais recente até a data dada
// ---------------------------------------------------------------- v10.4: nascimentos importados do histórico
// Os nascimentos de 2023 a 2025 vieram da planilha REBANHO do Dropbox. A observação começa com "Histórico" e traz a
// situação de origem da cria, num formato fixo que o app lê:
//   "Histórico (planilha REBANHO 2026) · situação: VENDIDO em 03/06/2024 · raça NELORE · mãe 1001 (fora do cadastro)"
// Situações: VENDIDO, MORTO, NA FAZENDA (macho que ficou), MATRIZ (fêmea que está no cadastro de matrizes com o
// mesmo brinco) e A CONFIRMAR (fêmea sem informação ainda). Assim não se inventa registro de venda ou de morte.
export const SITUACOES_HISTORICO = ['VENDIDO', 'MORTO', 'NA FAZENDA', 'MATRIZ', 'A CONFIRMAR'];
export const ehHistorico = (n) => !!n && n.tipo === 'nascimento' && /^\s*hist[óo]rico/i.test(String(n.observacoes || ''));
export function situacaoHistorica(n) {
  if (!ehHistorico(n)) return null;
  const obs = String(n.observacoes || '');
  const m = /situa[çc][ãa]o:\s*(VENDIDO|MORTO|NA FAZENDA|MATRIZ|A CONFIRMAR)(?:\s+em\s+(\d{2})\/(\d{2})\/(\d{4}))?/i.exec(obs);
  const mae = /m[ãa]e\s+(\S+)\s+\(fora do cadastro/i.exec(obs);
  return {
    sit: m ? m[1].toUpperCase() : 'A CONFIRMAR',
    data: m && m[2] ? `${m[4]}-${m[3]}-${m[2]}` : '',
    maeFora: mae ? mae[1] : '',
  };
}
// Matriz do cadastro que é esta cria: a novilha criada na desmama (id cria-<nascimento>) ou, no histórico, a matriz com o mesmo brinco
export function matrizDaCria(estado, n) {
  if (!n) return null;
  const porId = estado.matrizes.find((m) => m.id === idNovilha(n.id));
  if (porId) return porId;
  const h = situacaoHistorica(n);
  if (h && h.sit === 'MATRIZ') return acharMatrizPorBrinco(estado.matrizes, n.brincoBezerro).matriz || null;
  return null;
}

export function acharCriaPorBrinco(eventos, brinco, ate) {
  const lista = eventos
    .filter((e) => e.tipo === 'nascimento' && e.resultadoParto !== 'Natimorto' && mesmoBrinco(e.brincoBezerro, brinco))
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  if (!lista.length) return null;
  return (ate && lista.find((e) => !e.data || e.data <= ate)) || lista[0];
}

// Acha um animal pelo brinco: cria (ainda sem cadastro de matriz), novilha (matriz criada na desmama) ou matriz antiga.
// Devolve { tipo: 'cria' | 'matriz', nasc, matriz } ou null
export function acharAnimal(estado, brinco) {
  const b = String(brinco ?? '').trim();
  if (!b) return null;
  const nasc = acharCriaPorBrinco(estado.eventos, b);
  const r = acharMatrizPorBrinco(estado.matrizes, b);
  if (nasc) {
    const matriz = matrizDaCria(estado, nasc);
    if (matriz) return { tipo: 'matriz', nasc, matriz };
    // número repetido: cria antiga (histórico) com o mesmo brinco de uma matriz do cadastro -> vale a matriz
    if (ehHistorico(nasc) && r.matriz) return { tipo: 'matriz', nasc: null, matriz: r.matriz };
    return { tipo: 'cria', nasc, matriz: null };
  }
  if (r.matriz) return { tipo: 'matriz', nasc: null, matriz: r.matriz };
  return null;
}

// Ganho de peso por dia (kg/dia): do último peso até um peso anterior com pelo menos 7 dias de diferença
export function ganhoDiario(pontos) {
  if (!pontos || pontos.length < 2) return null;
  const ult = pontos[pontos.length - 1];
  for (let i = pontos.length - 2; i >= 0; i--) {
    const d = diasEntre(pontos[i].data, ult.data);
    if (d >= 7) return (ult.peso - pontos[i].peso) / d;
  }
  return null;
}

function mapaListas(itens, chaveFn) {
  const mapa = new Map();
  itens.forEach((e) => { const k = chaveFn(e); if (k === undefined || k === null || k === '') return; if (!mapa.has(k)) mapa.set(k, []); mapa.get(k).push(e); });
  return mapa;
}

function indicesDeEventos(eventos) {
  return {
    pesPorCria: mapaListas(eventos.filter((e) => e.tipo === 'pesagem'), (e) => e.criaId),
    pesPorMatriz: mapaListas(eventos.filter((e) => e.tipo === 'pesagem' || e.tipo === 'recria'), (e) => e.matrizId),
    desmamas: mapaListas(eventos.filter((e) => e.tipo === 'desmama'), (e) => String(e.brincoBezerro ?? '').trim()),
    vendaPorCria: mapaListas(eventos.filter((e) => e.tipo === 'vendaitem'), (e) => e.criaId),
    vendaPorMatriz: mapaListas(eventos.filter((e) => e.tipo === 'vendaitem'), (e) => e.matrizId),
    mortePorCria: mapaListas(eventos.filter(morteAtiva), (e) => e.criaId),
    mortePorMatriz: mapaListas(eventos.filter(morteAtiva), (e) => e.matrizId),
  };
}

// Pontos de peso (ordenados por data) de um animal. fonte: Nascimento | Pesagem | Recria | Desmama
function pontosDePeso(idx, { nasc, matriz }) {
  const vistos = new Set(); const pts = [];
  const add = (id, data, peso, fonte) => {
    const p = numPeso(peso);
    if (!data || isNaN(p) || p <= 0 || vistos.has(id)) return;
    vistos.add(id); pts.push({ id, data, peso: p, fonte });
  };
  if (nasc) {
    add(`${nasc.id}-nascer`, nasc.data, nasc.pesoNascer, 'Nascimento');
    (idx.pesPorCria.get(nasc.id) || []).forEach((e) => add(e.id, e.data, e.peso, 'Pesagem'));
    const brinco = String(nasc.brincoBezerro ?? '').trim();
    const d = (idx.desmamas.get(brinco) || []).filter((x) => x.data >= nasc.data && diasEntre(nasc.data, x.data) < 1100).sort((a, b) => a.data.localeCompare(b.data))[0];
    if (d) add(d.id, d.data, d.pesoDesmama, 'Desmama');
  }
  if (matriz) (idx.pesPorMatriz.get(matriz.id) || []).forEach((e) => add(e.id, e.data, e.tipo === 'recria' ? e.pesoAtual : e.peso, e.tipo === 'recria' ? 'Recria' : 'Pesagem'));
  pts.sort((a, b) => a.data.localeCompare(b.data) || a.id.localeCompare(b.id));
  // mesma data pesada mais de uma vez (ex.: dois celulares sem internet, ou repesagem confirmada): marca "2x"
  const porData = new Map();
  pts.filter((x) => x.fonte === 'Pesagem').forEach((x) => porData.set(x.data, (porData.get(x.data) || 0) + 1));
  pts.forEach((x) => { if (x.fonte === 'Pesagem' && porData.get(x.data) > 1) x.vezes = porData.get(x.data); });
  return pts;
}

export function rotuloSituacao(c) {
  const f = c.sexo === 'Fêmea';
  return { mamando: 'Mamando', desmamado: f ? 'Desmamada' : 'Desmamado', novilha: 'Novilha', matriz: 'Virou matriz', vendido: f ? 'Vendida' : 'Vendido', morto: f ? 'Morta' : 'Morto', confirmar: 'Situação a confirmar' }[c.situacao] || c.situacao;
}

// Todas as crias vivas (uma por nascimento). Cada uma traz idade, mãe, origem/pai, pesos, ganho diário e situação.
// situacao: mamando | desmamado | novilha | matriz | vendido | morto | confirmar (histórico sem informação ainda)
// orfa = a mãe morreu e a cria ainda está mamando (os funcionários continuam criando)
export function listarCrias(estado, hoje) {
  hoje = hoje || todayISO();
  const { matrizes, eventos, touros } = estado;
  const idx = indicesDeEventos(eventos);
  const brincos = mapaBrincos(matrizes);
  const matrizPorId = new Map(matrizes.map((m) => [m.id, m]));
  return eventos
    .filter((e) => e.tipo === 'nascimento' && e.resultadoParto !== 'Natimorto')
    .map((n) => {
      const hist = situacaoHistorica(n);
      const novilha = matrizPorId.get(idNovilha(n.id)) || (hist && hist.sit === 'MATRIZ' ? matrizDaCria(estado, n) : null) || null;
      const pontos = pontosDePeso(idx, { nasc: n, matriz: novilha });
      const ultimo = pontos.length ? pontos[pontos.length - 1] : null;
      const brinco = String(n.brincoBezerro ?? '').trim();
      const desm = (idx.desmamas.get(brinco) || []).filter((x) => x.data >= n.data && diasEntre(n.data, x.data) < 1100).sort((a, b) => a.data.localeCompare(b.data))[0] || null;
      const itensVenda = [...(idx.vendaPorCria.get(n.id) || []), ...(novilha ? idx.vendaPorMatriz.get(novilha.id) || [] : [])];
      const mortes = [...(idx.mortePorCria.get(n.id) || []), ...(novilha ? idx.mortePorMatriz.get(novilha.id) || [] : [])];
      const morte = mortes[0] || null;
      let situacao = 'mamando';
      if (morte || (novilha && novilha.status === 'Morta')) situacao = 'morto';
      else if (itensVenda.length || (novilha && novilha.status === 'Vendida')) situacao = 'vendido';
      else if (novilha) situacao = novilha.destino === 'Matriz' ? 'matriz' : hist && !novilha.destino ? (novilha.categoria === 'Novilha' ? 'novilha' : 'matriz') : 'novilha';
      else if (hist && hist.sit === 'VENDIDO') situacao = 'vendido';
      else if (hist && hist.sit === 'MORTO') situacao = 'morto';
      else if (hist && hist.sit === 'A CONFIRMAR') situacao = 'confirmar';
      else if (desm || (hist && hist.sit === 'NA FAZENDA')) situacao = 'desmamado';
      const baixa = itensVenda[0] || null;
      const mae = n.matrizId ? matrizPorId.get(n.matrizId) || null : null;
      const maeMorta = !!(mae && mae.status === 'Morta');
      return {
        id: n.id, nasc: n, brinco, sexo: n.sexo || '', nascData: n.data, idadeDias: n.data ? diasEntre(n.data, hoje) : null,
        matrizId: n.matrizId || '', maeBrinco: n.matrizId ? brincos[n.matrizId] || '?' : (hist && hist.maeFora) || '', maeFora: !n.matrizId && !!(hist && hist.maeFora),
        origem: origemDaCria(n, eventos, touros, estado.protocolos), pelagem: n.pelagem || '',
        pontos, pesoAtual: ultimo ? ultimo.peso : null, pesoData: ultimo ? ultimo.data : '',
        diasDesdePeso: ultimo ? diasEntre(ultimo.data, hoje) : null, gmd: ganhoDiario(pontos),
        situacao, desmamaData: desm ? desm.data : '', novilha, vendaData: baixa ? baixa.data : (novilha && novilha.dataBaixa) || (hist && hist.sit === 'VENDIDO' ? hist.data : '') || '',
        historico: !!hist,
        ativa: situacao !== 'vendido' && situacao !== 'morto',
        mortoData: morte ? morte.data : (novilha && novilha.status === 'Morta' && novilha.dataBaixa) || (hist && hist.sit === 'MORTO' ? hist.data : '') || '', causaMorte: morte ? morte.causa : '',
        maeMorta, maeMortaData: maeMorta ? mae.dataBaixa || '' : '', orfa: maeMorta && situacao === 'mamando',
      };
    })
    .sort((a, b) => (b.nascData || '').localeCompare(a.nascData || '') || String(b.brinco).localeCompare(String(a.brinco), 'pt-BR', { numeric: true }));
}

// Novilhas do lote de recria: matrizes "Novilha" com destino definido (A definir / Venda / Matriz).
// As novilhas antigas, sem destino, já fazem parte do plantel de matrizes e ficam de fora.
export function listarNovilhas(estado, cfg, hoje) {
  hoje = hoje || todayISO();
  const c = configCompleta(cfg);
  const { matrizes, eventos } = estado;
  const idx = indicesDeEventos(eventos);
  const nascPorId = new Map(eventos.filter((e) => e.tipo === 'nascimento').map((e) => [idNovilha(e.id), e]));
  return matrizes
    .filter((m) => m.categoria === 'Novilha' && DESTINOS_NOVILHA.includes(m.destino) && m.status !== 'Vendida' && m.status !== 'Morta' && m.status !== 'Descarte')
    .map((m) => {
      const nasc = nascPorId.get(m.id) || null;
      const pontos = pontosDePeso(idx, { nasc, matriz: m });
      const ultimo = pontos.length ? pontos[pontos.length - 1] : null;
      const gmd = ganhoDiario(pontos);
      const peso = ultimo ? ultimo.peso : null;
      const nascData = m.dataNascimento || (nasc && nasc.data) || '';
      const apta = peso !== null && peso >= c.pesoMatriz;
      const faltam = peso !== null && !apta ? arred(c.pesoMatriz - peso) : null;
      return {
        matriz: m, brinco: m.brinco, nascData, idadeDias: nascData ? diasEntre(nascData, hoje) : null,
        destino: m.destino, pontos, pesoAtual: peso, pesoData: ultimo ? ultimo.data : '', gmd, apta, faltam,
        diasParaApta: faltam !== null && gmd > 0 ? Math.ceil(faltam / gmd) : null,
        diasDesdePeso: ultimo ? diasEntre(ultimo.data, hoje) : null,
      };
    })
    .sort((a, b) => (b.pesoAtual ?? -1) - (a.pesoAtual ?? -1) || String(a.brinco).localeCompare(String(b.brinco), 'pt-BR', { numeric: true }));
}

// Análise de venda dos machos: quantos já estão no peso alvo, quantos faltam para a quantidade alvo e quando devem chegar.
export function analiseMachos(crias, cfg) {
  const c = configCompleta(cfg);
  const machos = crias.filter((x) => x.sexo === 'Macho' && (x.situacao === 'mamando' || x.situacao === 'desmamado'));
  const comPeso = machos.filter((x) => x.pesoAtual !== null);
  const diasAteAlvo = (x) => {
    if (!c.metaPesoMacho || x.pesoAtual === null) return null;
    if (x.pesoAtual >= c.metaPesoMacho) return 0;
    return x.gmd > 0 ? Math.ceil((c.metaPesoMacho - x.pesoAtual) / x.gmd) : null;
  };
  const linhas = machos.map((x) => ({ cria: x, dias: diasAteAlvo(x), pronto: !!c.metaPesoMacho && x.pesoAtual !== null && x.pesoAtual >= c.metaPesoMacho }))
    .sort((a, b) => (b.cria.pesoAtual ?? -1) - (a.cria.pesoAtual ?? -1) || String(a.cria.brinco).localeCompare(String(b.cria.brinco), 'pt-BR', { numeric: true }));
  const prontos = linhas.filter((l) => l.pronto);
  const prox = (n) => linhas.filter((l) => !l.pronto && l.dias !== null && l.dias <= n).length;
  const kgProntos = prontos.reduce((s, l) => s + l.cria.pesoAtual, 0);
  // data em que a quantidade alvo deve ser atingida, no ritmo atual de ganho (pronto agora = 0 dias)
  let diasParaMetaQtd = null;
  if (c.metaPesoMacho && c.metaQtdMacho) {
    const ordem = linhas.filter((l) => l.dias !== null).map((l) => l.dias).sort((a, b) => a - b);
    if (ordem.length >= c.metaQtdMacho) diasParaMetaQtd = ordem[c.metaQtdMacho - 1];
  }
  return {
    cfg: c, linhas, total: machos.length, semPeso: machos.length - comPeso.length, prontos: prontos.length,
    faltamQtd: c.metaQtdMacho ? Math.max(0, c.metaQtdMacho - prontos.length) : null,
    metaQtdAtingida: c.metaQtdMacho ? prontos.length >= c.metaQtdMacho : null,
    kgProntos: arred(kgProntos), pesoMedioProntos: prontos.length ? arred(kgProntos / prontos.length) : null,
    pesoMedio: comPeso.length ? arred(comPeso.reduce((s, x) => s + x.pesoAtual, 0) / comPeso.length) : null,
    prox30: prox(30), prox60: prox(60), diasParaMetaQtd,
  };
}

// Avisos sobre um peso digitado (não bloqueiam): muito baixo, queda, ganho fora do normal
export function avisoDePeso(pontos, peso, data) {
  const p = numPeso(peso);
  if (isNaN(p) || p <= 0) return 'Peso inválido.';
  if (p < 15 || p > 1200) return `${p} kg parece fora do normal. Confira se o peso está certo.`;
  const antes = (pontos || []).filter((x) => x.data <= data && x.fonte !== 'Nascimento').pop();
  if (antes) {
    const d = diasEntre(antes.data, data);
    if (d > 0 && p < antes.peso - 5) return `Este peso (${p} kg) é menor que o anterior (${antes.peso} kg em ${formatarDataBR(antes.data)}). Confira.`;
    if (d >= 1 && p - antes.peso > 15 && (p - antes.peso) / d > 2.5) return `Ganho de ${arred((p - antes.peso) / d, 2)} kg por dia desde ${formatarDataBR(antes.data)}: muito alto. Confira o peso.`;
  }
  return '';
}

// Lista colada "um animal por linha": "6532 245", "6532;245,5", "6532 = 245 kg". Devolve { itens: [{ brinco, peso }], erros: [texto da linha] }.
export function lerListaPesos(texto) {
  const itens = []; const erros = [];
  String(texto || '').split(/\r?\n/).forEach((linha) => {
    const t = linha.trim();
    if (!t) return;
    const m = t.match(/^(\S+?)(?:\s*[;:=\t]\s*|\s+|\s*,\s+)(\d+(?:[.,]\d+)?)\s*(?:kg)?$/i);
    if (!m) { erros.push(t); return; }
    const peso = numPeso(m[2]);
    if (!(peso > 0)) { erros.push(t); return; }
    itens.push({ brinco: m[1], peso });
  });
  return { itens, erros };
}

// ---- venda por peso
// Dados do animal para uma linha de venda: quem é, tipo sugerido, último peso e se já saiu do rebanho.
export function infoAnimalVenda(estado, brinco, hoje, crias) {
  const b = String(brinco ?? '').trim();
  if (!b) return { brinco: '', achado: false };
  const lista = crias || listarCrias(estado, hoje);
  const a = acharAnimal(estado, b);
  if (!a) return { brinco: b, achado: false };
  const cria = a.nasc ? lista.find((x) => x.id === a.nasc.id) : null;
  if (a.tipo === 'cria' && cria) {
    return {
      brinco: b, achado: true, origem: 'cria', criaId: cria.id, matrizId: '', sexo: cria.sexo,
      tipoSugerido: cria.sexo === 'Fêmea' ? 'Bezerra' : 'Bezerro', pesoUltimo: cria.pesoAtual, pesoData: cria.pesoData,
      jaVendido: cria.situacao === 'vendido', vendidoEm: cria.vendaData, jaMorto: cria.situacao === 'morto', mortoEm: cria.mortoData, descricao: `${cria.sexo || 'Cria'} · ${cria.idadeDias ?? '?'} dias`,
      pontos: cria.pontos,
    };
  }
  const m = a.matriz;
  const pts = pontosDePeso(indicesDeEventos(estado.eventos), { nasc: a.nasc, matriz: m });
  const ult = pts.length ? pts[pts.length - 1] : null;
  const nov = m.categoria === 'Novilha';
  const itemVendido = estado.eventos.find((e) => e.tipo === 'vendaitem' && e.matrizId === m.id) || null;
  return {
    brinco: b, achado: true, origem: 'matriz', criaId: a.nasc ? a.nasc.id : '', matrizId: m.id, sexo: 'Fêmea',
    tipoSugerido: m.status === 'Descarte' ? 'Vaca de descarte' : nov ? 'Novilha' : 'Vaca',
    pesoUltimo: ult ? ult.peso : null, pesoData: ult ? ult.data : '',
    jaVendido: m.status === 'Vendida' || !!itemVendido, vendidoEm: m.dataBaixa || (itemVendido && itemVendido.data) || '',
    jaMorto: m.status === 'Morta', mortoEm: m.status === 'Morta' ? m.dataBaixa || '' : '',
    descricao: `${m.categoria || 'Matriz'}${m.raca ? ' · ' + m.raca : ''} · ${m.status}`, pontos: pts,
  };
}

// Totais de uma venda. itens: [{ tipoAnimal, peso }]
export function totaisVenda(itens, valorKg, frete) {
  const validos = (itens || []).filter((i) => numPeso(i.peso) > 0);
  const kg = validos.reduce((s, i) => s + numPeso(i.peso), 0);
  const vkg = numPeso(valorKg);
  const valor = vkg > 0 ? arred(kg * vkg, 2) : 0;
  const fr = numPeso(frete) > 0 ? numPeso(frete) : 0;
  const porTipo = new Map();
  validos.forEach((i) => {
    const t = i.tipoAnimal || 'Sem tipo';
    const x = porTipo.get(t) || { tipo: t, qtd: 0, kg: 0 };
    x.qtd += 1; x.kg = arred(x.kg + numPeso(i.peso)); porTipo.set(t, x);
  });
  return {
    qtd: validos.length, kg: arred(kg), kgMedio: validos.length ? arred(kg / validos.length) : 0,
    valor, frete: fr, liquido: arred(valor - fr, 2), porTipo: [...porTipo.values()],
  };
}

// Confere uma venda antes de gravar. form: { data, comprador, valorKg, frete, itens: [{ brinco, tipoAnimal, peso }] }
// Devolve { erros, avisos, linhas } (linhas já com o animal encontrado). Com erros, não deve gravar.
export function validarVenda(estado, form, hoje) {
  const erros = []; const avisos = [];
  const crias = listarCrias(estado, hoje);
  if (!form.data) erros.push('Falta a data da venda.');
  if (!String(form.comprador || '').trim()) erros.push('Falta o comprador.');
  if (!(numPeso(form.valorKg) > 0)) erros.push('Falta o valor do kg.');
  const itens = (form.itens || []).filter((i) => String(i.brinco ?? '').trim() || String(i.peso ?? '').trim());
  if (!itens.length) erros.push('Coloque pelo menos um animal na venda.');
  const vistos = new Set();
  const linhas = itens.map((i, n) => {
    const pos = `Linha ${n + 1}`;
    const info = infoAnimalVenda(estado, i.brinco, hoje, crias);
    const peso = numPeso(i.peso);
    if (!(peso > 0)) erros.push(`${pos}${info.brinco ? ` (${info.brinco})` : ''}: falta o peso.`);
    if (!i.tipoAnimal) erros.push(`${pos}${info.brinco ? ` (${info.brinco})` : ''}: falta o tipo de animal.`);
    if (info.brinco) {
      if (vistos.has(info.brinco)) erros.push(`${pos}: o animal ${info.brinco} aparece duas vezes.`);
      vistos.add(info.brinco);
      if (!info.achado) avisos.push(`${pos}: o número ${info.brinco} não está no sistema. A venda é registrada, mas sem dar baixa em ninguém.`);
      else if (info.jaMorto) erros.push(`${pos}: o animal ${info.brinco} morreu${info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : ''}.`);
      else if (info.jaVendido) erros.push(`${pos}: o animal ${info.brinco} já foi vendido${info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ''}.`);
    } else if (peso > 0) {
      avisos.push(`${pos}: sem número do animal. A venda é registrada, mas sem dar baixa em ninguém.`);
    }
    return { ...i, info, peso };
  });
  return { erros, avisos, linhas };
}

// Aplica a venda: um registro "venda" (cabeçalho), um "vendaitem" por animal e a baixa das matrizes vendidas.
// As crias (machos e fêmeas ainda sem cadastro de matriz) saem do estoque pelo próprio item de venda.
export function aplicarVenda(estado, form, opcoes) {
  const op = opcoes || {};
  const hoje = op.hoje || todayISO();
  const now = op.now || new Date().toISOString();
  const vendaId = op.id || novoId();
  const v = validarVenda(estado, form, hoje);
  if (v.erros.length) return { erro: v.erros.join(' '), erros: v.erros };
  const vkg = numPeso(form.valorKg);
  const tot = totaisVenda(v.linhas.map((l) => ({ tipoAnimal: l.tipoAnimal, peso: l.peso })), vkg, form.frete);
  const resumoTipos = tot.porTipo.map((t) => `${t.qtd} ${t.tipo}`).join(', ');
  const venda = {
    id: vendaId, tipo: 'venda', data: form.data, categoria: 'Venda por peso', animais: `${tot.qtd} animais: ${resumoTipos}`,
    qtd: tot.qtd, pesoTotal: tot.kg, valorKg: vkg, valorArroba: arred(vkg * KG_POR_ARROBA, 2), valorTotal: tot.valor,
    frete: tot.frete || '', comprador: String(form.comprador).trim(), createdAt: now,
  };
  const itens = v.linhas.map((l, i) => ({
    id: `${vendaId}-${i + 1}`, tipo: 'vendaitem', vendaId, data: form.data, brinco: l.info.brinco || '', tipoAnimal: l.tipoAnimal,
    peso: l.peso, valorKg: vkg, valor: arred(l.peso * vkg, 2), criaId: l.info.criaId || '', matrizId: l.info.matrizId || '',
    comprador: venda.comprador, createdAt: now,
  }));
  const idsBaixa = new Set(itens.filter((i) => i.matrizId).map((i) => i.matrizId));
  const alteradas = [];
  const matrizes = estado.matrizes.map((m) => {
    if (!idsBaixa.has(m.id)) return m;
    const nova = { ...m, status: 'Vendida', destino: 'Venda', dataBaixa: form.data, motivoBaixa: 'Venda' };
    alteradas.push(nova);
    return nova;
  });
  return {
    estado: { ...estado, matrizes, eventos: [...estado.eventos, venda, ...itens] },
    eventosNovos: [venda, ...itens], matrizesAlteradas: alteradas, venda, itens, totais: tot, avisos: v.avisos,
  };
}

// Histórico de vendas, da mais recente para a mais antiga. Vendas antigas (sem itens) aparecem só com o cabeçalho.
export function listarVendas(estado) {
  const itens = mapaListas(estado.eventos.filter((e) => e.tipo === 'vendaitem'), (e) => e.vendaId);
  return estado.eventos.filter((e) => e.tipo === 'venda')
    .map((v) => ({ venda: v, itens: itens.get(v.id) || [] }))
    .sort((a, b) => (b.venda.data || '').localeCompare(a.venda.data || '') || (b.venda.createdAt || '').localeCompare(a.venda.createdAt || ''));
}

// Muda o destino de uma novilha (A definir / Matriz / Venda). Devolve a matriz alterada.
export function definirDestinoNovilha(matriz, destino) {
  if (!DESTINOS_NOVILHA.includes(destino)) throw new Error(`destino inválido: ${destino}`);
  return { ...matriz, destino };
}

// ---------------------------------------------------------------- morte de animais
// Evento "morte": um por animal (cria, novilha, matriz, touro ou animal sem cadastro). Cria e novilha ficam ligadas à morte pelo
// criaId / matrizId; a matriz que morre ganha status "Morta" (com dataBaixa e motivoBaixa) e sai do plantel. O evento guarda o
// statusAnterior da matriz para poder desfazer. Lançamento errado não se apaga: o proprietário "anula" (anulada = "Sim").
// A cria de uma mãe que morreu continua normalmente (os funcionários criam), só aparece marcada como "órfã" (listarCrias).
export const morteAtiva = (e) => e.tipo === 'morte' && String(e.anulada ?? '').trim().toLowerCase() !== 'sim';

export function normCausaMorte(v) {
  const s = chave(v);
  if (!s) return '';
  const exata = CAUSAS_MORTE.find((c) => chave(c) === s);
  if (exata) return exata;
  if (/cobra/.test(s)) return 'Picada de cobra';
  if (/raio|trovao/.test(s)) return 'Raio';
  if (/parto/.test(s)) return 'Parto difícil';
  if (/^(nao sabe|nao se sabe|desconhecida|ignorada)/.test(s)) return 'Não sabe';
  if (/^doenc|^doente/.test(s)) return 'Doença';
  if (/^acident/.test(s)) return 'Acidente';
  if (/^outr/.test(s)) return 'Outra';
  return '';
}
export function normTipoAnimalMorte(v) {
  const s = chave(v);
  if (!s) return '';
  const exata = TIPOS_ANIMAL_MORTE.find((t) => chave(t) === s);
  if (exata) return exata;
  if (/^(bezerr|cria)/.test(s)) return 'Cria';
  if (/^(vaca|matriz)/.test(s)) return 'Matriz';
  if (/^(garrote|boi)/.test(s)) return 'Boi';
  if (/^novilh/.test(s)) return 'Novilha';
  if (/^(touro|reprodutor)/.test(s)) return 'Touro';
  if (/^outr/.test(s)) return 'Outro';
  return '';
}

// Quem é o animal daquele brinco e se ele ainda pode morrer (não pode já estar morto nem vendido).
export function infoAnimalMorte(estado, brinco) {
  const b = String(brinco ?? '').trim();
  if (!b) return { brinco: '', achado: false };
  const a = acharAnimal(estado, b);
  if (!a) return { brinco: b, achado: false };
  const { nasc, matriz } = a;
  const doAnimal = (e) => (nasc && e.criaId === nasc.id) || (matriz && e.matrizId === matriz.id);
  const mortes = estado.eventos.filter((e) => morteAtiva(e) && doAnimal(e));
  const vendas = estado.eventos.filter((e) => e.tipo === 'vendaitem' && doAnimal(e));
  const maeBrinco = nasc && nasc.matrizId ? mapaBrincos(estado.matrizes)[nasc.matrizId] || '' : '';
  const tipoAnimal = matriz ? (matriz.categoria === 'Novilha' ? 'Novilha' : 'Matriz') : 'Cria';
  const descricao = matriz && !nasc
    ? `${matriz.categoria || 'Matriz'} ${b} · ${matriz.status}`
    : `${tipoAnimal} ${b} · ${(nasc && nasc.sexo) || 'sexo ?'}${maeBrinco ? ` · mãe ${maeBrinco}` : ''}`;
  return {
    brinco: b, achado: true, tipoAnimal, descricao, nasc: nasc || null, matriz: matriz || null,
    criaId: nasc ? nasc.id : '', matrizId: matriz ? matriz.id : '',
    nascData: (nasc && nasc.data) || (matriz && matriz.dataNascimento) || '',
    jaMorto: mortes.length > 0 || (!!matriz && matriz.status === 'Morta'),
    mortoEm: (mortes[0] && mortes[0].data) || (matriz && matriz.status === 'Morta' && matriz.dataBaixa) || '',
    jaVendido: vendas.length > 0 || (!!matriz && matriz.status === 'Vendida'),
    vendidoEm: (vendas[0] && vendas[0].data) || (matriz && matriz.status === 'Vendida' && matriz.dataBaixa) || '',
  };
}

// Confere uma morte antes de gravar. Devolve { erros, avisos, info }. Com erros, não deve gravar.
export function validarMorte(estado, form, hoje) {
  const erros = []; const avisos = [];
  hoje = hoje || todayISO();
  const brinco = String(form.brinco ?? '').trim();
  const info = infoAnimalMorte(estado, brinco);
  if (!form.data) erros.push('Falta a data da morte.');
  else if (form.data > hoje) erros.push('A data da morte não pode ser no futuro.');
  if (!form.causa) erros.push('Falta a causa da morte.');
  else if (!CAUSAS_MORTE.includes(form.causa)) erros.push(`Causa não reconhecida (${form.causa}).`);
  if (info.achado) {
    if (info.jaMorto) erros.push(`O animal ${brinco} já está registrado como morto${info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : ''}.`);
    else if (info.jaVendido) erros.push(`O animal ${brinco} já foi vendido${info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ''}.`);
    if (form.data && info.nascData && form.data < info.nascData) erros.push(`A data da morte (${formatarDataBR(form.data)}) é antes do nascimento do animal (${formatarDataBR(info.nascData)}).`);
  } else {
    if (!form.tipoAnimal) erros.push(brinco ? `O número ${brinco} não está no sistema. Escolha que animal é para registrar assim mesmo.` : 'Sem número: escolha que animal é.');
    else if (!TIPOS_ANIMAL_MORTE.includes(form.tipoAnimal)) erros.push(`Tipo de animal não reconhecido (${form.tipoAnimal}).`);
    else if (brinco) avisos.push(`O número ${brinco} não está no sistema: a morte é registrada, mas sem dar baixa em ninguém.`);
  }
  return { erros, avisos, info };
}

// Lote do animal que morreu: o da matriz/novilha; para cria, o lote da mãe; sem cadastro, "Sem cadastro".
export function loteDaMorte(estado, e) {
  const matriz = e.matrizId ? estado.matrizes.find((m) => m.id === e.matrizId) : null;
  if (matriz) return matriz.lote || 'Sem lote';
  if (e.criaId) {
    const nasc = estado.eventos.find((x) => x.id === e.criaId);
    const mae = nasc && nasc.matrizId ? estado.matrizes.find((m) => m.id === nasc.matrizId) : null;
    return mae ? mae.lote || 'Sem lote' : 'Sem lote';
  }
  return 'Sem cadastro';
}
const rotuloAnimalMorte = (e) => `${e.tipoAnimal || 'Animal'}${e.brinco ? ` ${e.brinco}` : ' (sem número)'}`;

// Todas as mortes lançadas (inclusive as anuladas, marcadas), da mais recente para a mais antiga
export function listarMortes(estado) {
  const brincos = mapaBrincos(estado.matrizes);
  return estado.eventos.filter((e) => e.tipo === 'morte')
    .map((e) => {
      const nasc = e.criaId ? estado.eventos.find((x) => x.id === e.criaId) : null;
      return {
        e, ativa: morteAtiva(e), animal: rotuloAnimalMorte(e), lote: loteDaMorte(estado, e),
        mae: nasc && nasc.matrizId ? brincos[nasc.matrizId] || '' : '',
      };
    })
    .sort((a, b) => (b.e.data || '').localeCompare(a.e.data || '') || (b.e.createdAt || '').localeCompare(a.e.createdAt || ''));
}

// ---- correções feitas pelo proprietário (com a senha). Cada função devolve { erro } ou
// { estado, evento, mudancas: { eventos: [{ tipo, id, campos }], matrizes: [matriz] }, avisos }.
// As mudanças são o que precisa ir para a planilha (ver postsDeMudancas).
export function postsDeMudancas(mudancas) {
  const posts = [];
  const porTipo = new Map();
  (mudancas.eventos || []).forEach((m) => { if (!porTipo.has(m.tipo)) porTipo.set(m.tipo, []); porTipo.get(m.tipo).push({ id: m.id, campos: m.campos }); });
  porTipo.forEach((itens, tipo) => posts.push({ action: 'atualizarCampos', tipo, itens }));
  if ((mudancas.matrizes || []).length) posts.push({ action: 'upsertMatrizes', matrizes: mudancas.matrizes });
  return posts;
}

export function aplicarMudancasNoEstado(estado, mudancas) {
  const camposPorId = new Map(mudancas.eventos.map((m) => [m.id, m.campos]));
  const matPorId = new Map(mudancas.matrizes.map((m) => [m.id, m]));
  return {
    ...estado,
    eventos: estado.eventos.map((e) => (camposPorId.has(e.id) ? { ...e, ...camposPorId.get(e.id) } : e)),
    matrizes: estado.matrizes.map((m) => matPorId.get(m.id) || m),
  };
}

export const CAMPOS_EDITAVEIS_NASCIMENTO = ['data', 'matrizId', 'resultadoParto', 'sexo', 'brincoBezerro', 'pelagem', 'tipoParto', 'observacoes'];

// Corrige um nascimento já lançado. Mãe, sexo e brinco não podem ser apagados (só trocados); o que já estava em branco
// pode continuar em branco (volta como aviso). Mudar o brinco leva junto desmama, pesagens, venda, morte e a novilha dessa cria.
export function editarNascimento(estado, id, campos) {
  const nasc = estado.eventos.find((e) => e.id === id && e.tipo === 'nascimento');
  if (!nasc) return { erro: 'Não achei esse nascimento.' };
  const novo = { ...nasc };
  CAMPOS_EDITAVEIS_NASCIMENTO.forEach((k) => { if (campos[k] !== undefined) novo[k] = typeof campos[k] === 'string' ? campos[k].trim() : campos[k]; });
  const mudou = CAMPOS_EDITAVEIS_NASCIMENTO.filter((k) => String(novo[k] ?? '') !== String(nasc[k] ?? ''));
  if (!mudou.length) return { erro: 'Nada foi alterado.' };

  const erros = []; const avisos = [];
  if (!novo.data) erros.push('Falta a data do nascimento.');
  if (!['Vivo', 'Natimorto'].includes(novo.resultadoParto)) erros.push('Falta o resultado do parto (vivo ou natimorto).');
  if (novo.sexo && !['Macho', 'Fêmea'].includes(novo.sexo)) erros.push('Sexo inválido.');
  [['matrizId', 'a mãe'], ['sexo', 'o sexo'], ['brincoBezerro', 'o brinco da cria']].forEach(([k, rot]) => {
    if (String(nasc[k] ?? '').trim() && !String(novo[k] ?? '').trim()) erros.push(`Não dá para apagar ${rot}; troque por outro valor.`);
  });
  if (novo.matrizId && !estado.matrizes.some((m) => m.id === novo.matrizId)) erros.push('A mãe escolhida não está no cadastro.');

  const antigo = String(nasc.brincoBezerro ?? '').trim();
  const novoB = String(novo.brincoBezerro ?? '').trim();
  if (mudou.includes('brincoBezerro') && novoB) {
    const outro = estado.eventos.find((e) => e.tipo === 'nascimento' && e.id !== id && mesmoBrinco(e.brincoBezerro, novoB)
      && e.data && novo.data && Math.abs(diasEntre(e.data, novo.data)) < 1100);
    if (outro) erros.push(`O brinco ${novoB} já é de outra cria (nascida em ${formatarDataBR(outro.data)}).`);
  }

  // o que já está ligado a esta cria (pesagens, desmama, venda, morte e a novilha)
  const ligadoA = (e) => e.criaId === id;
  const idNov = idNovilha(id);
  const pesagens = estado.eventos.filter((e) => e.tipo === 'pesagem' && ligadoA(e));
  const vendas = estado.eventos.filter((e) => e.tipo === 'vendaitem' && ligadoA(e));
  const mortes = estado.eventos.filter((e) => e.tipo === 'morte' && ligadoA(e));
  const desmama = antigo
    ? estado.eventos.filter((e) => e.tipo === 'desmama' && mesmoBrinco(e.brincoBezerro, antigo) && e.data && nasc.data && e.data >= nasc.data && diasEntre(nasc.data, e.data) < 1100)
      .sort((a, b) => a.data.localeCompare(b.data))[0] || null
    : null;
  const novilha = estado.matrizes.find((m) => m.id === idNov) || null;

  if (mudou.includes('resultadoParto') && novo.resultadoParto === 'Natimorto' && (pesagens.length || vendas.length || mortes.length || desmama || novilha)) {
    erros.push('Esta cria já tem pesagem, desmama, venda ou morte lançada; não dá para virar natimorto.');
  }
  if (mudou.includes('sexo') && (desmama || novilha)) {
    erros.push('Esta cria já foi desmamada; trocar o sexo agora deixaria o rebanho inconsistente (a novilha é criada na desmama).');
  }
  if (erros.length) return { erro: erros.join(' '), erros };

  const eventosMud = [{ tipo: 'nascimento', id, campos: Object.fromEntries(mudou.map((k) => [k, novo[k] ?? ''])) }];
  const matrizesMud = [];
  if (mudou.includes('brincoBezerro') && antigo && novoB) {
    pesagens.forEach((e) => eventosMud.push({ tipo: 'pesagem', id: e.id, campos: { brinco: novoB } }));
    vendas.forEach((e) => eventosMud.push({ tipo: 'vendaitem', id: e.id, campos: { brinco: novoB } }));
    mortes.forEach((e) => eventosMud.push({ tipo: 'morte', id: e.id, campos: { brinco: novoB } }));
    if (desmama) eventosMud.push({ tipo: 'desmama', id: desmama.id, campos: { brincoBezerro: novoB } });
    if (novilha) matrizesMud.push({ ...novilha, brinco: novoB });
  }
  if (mudou.includes('matrizId')) avisos.push('A mãe foi trocada, mas a categoria e o status das vacas não foram recalculados. Confira em Rebanho se precisar.');
  if (mudou.includes('sexo') && String(nasc.sexo ?? '').trim() && !mudou.includes('brincoBezerro')) avisos.push('O brinco da cria não foi mudado junto com o sexo. Confira se a numeração continua certa.');
  if (!String(novo.matrizId ?? '').trim()) avisos.push('Ainda falta informar a mãe.');
  if (!String(novo.sexo ?? '').trim()) avisos.push('Ainda falta informar o sexo.');
  if (!novoB) avisos.push('Ainda falta informar o brinco da cria.');

  const mudancas = { eventos: eventosMud, matrizes: matrizesMud };
  const novoEstado = aplicarMudancasNoEstado(estado, mudancas);
  return { estado: novoEstado, evento: novoEstado.eventos.find((e) => e.id === id), mudancas, avisos };
}

// Corrige uma morte já lançada: data, causa e observação sempre; tipo e número só quando o animal não tem cadastro.
export function editarMorte(estado, id, campos, hoje) {
  const ev = estado.eventos.find((e) => e.id === id && e.tipo === 'morte');
  if (!ev) return { erro: 'Não achei essa morte.' };
  if (!morteAtiva(ev)) return { erro: 'Esta morte já foi anulada.' };
  const semCadastro = !ev.criaId && !ev.matrizId;
  const permitidos = ['data', 'causa', 'observacoes', ...(semCadastro ? ['tipoAnimal', 'brinco'] : [])];
  const novo = { ...ev };
  permitidos.forEach((k) => { if (campos[k] !== undefined) novo[k] = typeof campos[k] === 'string' ? campos[k].trim() : campos[k]; });
  const mudou = permitidos.filter((k) => String(novo[k] ?? '') !== String(ev[k] ?? ''));
  if (!mudou.length) return { erro: 'Nada foi alterado.' };
  const erros = [];
  hoje = hoje || todayISO();
  if (!novo.data) erros.push('Falta a data da morte.');
  else if (novo.data > hoje) erros.push('A data da morte não pode ser no futuro.');
  if (!CAUSAS_MORTE.includes(novo.causa)) erros.push('Falta a causa da morte.');
  if (semCadastro) {
    if (novo.tipoAnimal && !TIPOS_ANIMAL_MORTE.includes(novo.tipoAnimal)) erros.push('Tipo de animal inválido.');
    if (!novo.tipoAnimal) erros.push('Escolha que animal é.');
    if (mudou.includes('brinco') && String(novo.brinco ?? '').trim() && acharAnimal(estado, novo.brinco)) {
      erros.push(`O número ${novo.brinco} está cadastrado. Anule esta morte e lance de novo para o animal certo.`);
    }
  } else {
    const nasc = ev.criaId ? estado.eventos.find((x) => x.id === ev.criaId) : null;
    const nascData = (nasc && nasc.data) || '';
    if (novo.data && nascData && novo.data < nascData) erros.push(`A data da morte é antes do nascimento do animal (${formatarDataBR(nascData)}).`);
  }
  if (erros.length) return { erro: erros.join(' '), erros };
  const eventosMud = [{ tipo: 'morte', id, campos: Object.fromEntries(mudou.map((k) => [k, novo[k] ?? ''])) }];
  const matrizesMud = [];
  const matriz = ev.matrizId ? estado.matrizes.find((m) => m.id === ev.matrizId) : null;
  if (matriz && matriz.status === 'Morta' && (mudou.includes('data') || mudou.includes('causa'))) {
    matrizesMud.push({ ...matriz, dataBaixa: novo.data, motivoBaixa: `Morte: ${novo.causa}` });
  }
  const mudancas = { eventos: eventosMud, matrizes: matrizesMud };
  const novoEstado = aplicarMudancasNoEstado(estado, mudancas);
  return { estado: novoEstado, evento: novoEstado.eventos.find((e) => e.id === id), mudancas, avisos: [] };
}

// Desfaz uma morte lançada por engano: marca como anulada e devolve a matriz ao status de antes.
export function anularMorte(estado, id) {
  const ev = estado.eventos.find((e) => e.id === id && e.tipo === 'morte');
  if (!ev) return { erro: 'Não achei essa morte.' };
  if (!morteAtiva(ev)) return { erro: 'Esta morte já foi anulada.' };
  const matriz = ev.matrizId ? estado.matrizes.find((m) => m.id === ev.matrizId) : null;
  const matrizesMud = [];
  if (matriz && matriz.status === 'Morta') matrizesMud.push({ ...matriz, status: ev.statusAnterior || 'Vazia', dataBaixa: '', motivoBaixa: '' });
  const mudancas = { eventos: [{ tipo: 'morte', id, campos: { anulada: 'Sim' } }], matrizes: matrizesMud };
  const novoEstado = aplicarMudancasNoEstado(estado, mudancas);
  return { estado: novoEstado, evento: novoEstado.eventos.find((e) => e.id === id), mudancas, avisos: [] };
}

// Crias que ficaram órfãs (a mãe morreu e elas ainda estão mamando)
export const listarOrfas = (crias) => crias.filter((c) => c.orfa);

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
  nascs.forEach((n) => { const nome = origemDaCria(n, eventos, touros).rotulo; if (!pais.has(nome)) pais.set(nome, []); pais.get(nome).push(n); });
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
      {
        titulo: 'Por origem e pai (IATF ou monta)',
        nota: 'O pai sai do cruzamento do parto com o IATF da mãe (de 250 a 320 dias antes). Sem IATF compatível, a cria é de monta natural.',
        colunas: [{ k: 'pai', label: 'Origem / pai' }, ...colSexo], linhas: linhasPai,
      },
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

export function relatorioSituacaoVacas(todasMatrizes, eventos, hoje) {
  hoje = hoje || todayISO();
  const matrizes = todasMatrizes.filter(noPlantel);
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


const idadeTxt = (dias) => (dias === null || dias === undefined ? '—' : dias < 60 ? `${dias} d` : `${arred(dias / 30.4, 1)} m`);
const kg1 = (n) => (n === null || n === undefined ? '—' : String(arred(n, 1)));
const gmdTxt = (g) => (g === null || g === undefined ? '—' : `${arred(g, 2)}`);

export function relatorioCrias(estado, cfg, ano, hoje) {
  hoje = hoje || todayISO();
  const crias = listarCrias(estado, hoje).filter((c) => ano === 'todos' || anoDe(c.nascData) === ano);
  const sit = ['mamando', 'desmamado', 'novilha', 'matriz', 'vendido', 'morto'];
  const linhasSit = ['Macho', 'Fêmea', ''].map((sx) => {
    const l = crias.filter((c) => (c.sexo || '') === sx);
    const o = { sexo: sx || 'Sem sexo', total: l.length };
    sit.forEach((k) => { o[k] = l.filter((c) => c.situacao === k).length; });
    return o;
  }).filter((o) => o.total > 0);
  if (linhasSit.length) { const t = { sexo: 'Total', total: crias.length }; sit.forEach((k) => { t[k] = crias.filter((c) => c.situacao === k).length; }); linhasSit.push(t); }
  const faixas = [['0 a 90 dias', 0, 90], ['91 a 180 dias', 91, 180], ['181 a 270 dias', 181, 270], ['271 a 365 dias', 271, 365], ['mais de 365 dias', 366, 99999]];
  const ativas = crias.filter((c) => c.ativa && c.pesoAtual !== null && c.idadeDias !== null);
  const linhasFaixa = faixas.map(([rot, a, b]) => {
    const l = ativas.filter((c) => c.idadeDias >= a && c.idadeDias <= b);
    const med = (sx) => { const x = l.filter((c) => c.sexo === sx); return x.length ? `${kg1(x.reduce((s, c) => s + c.pesoAtual, 0) / x.length)} (${x.length})` : '—'; };
    return { faixa: rot, machos: med('Macho'), femeas: med('Fêmea') };
  });
  const an = analiseMachos(listarCrias(estado, hoje), cfg);
  const nov = listarNovilhas(estado, cfg, hoje);
  const comPeso = crias.filter((c) => c.ativa && c.pesoAtual !== null).length;
  return {
    titulo: `Crias e pesos · ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: 'Crias vivas (nascimentos)', valor: crias.length },
      { rotulo: 'Ainda no rebanho', valor: crias.filter((c) => c.ativa).length },
      { rotulo: 'Com pelo menos uma pesagem', valor: comPeso },
      { rotulo: an.cfg.metaPesoMacho ? `Machos a partir de ${an.cfg.metaPesoMacho} kg` : 'Machos no peso alvo', valor: an.cfg.metaPesoMacho ? an.prontos : 'meta não definida' },
      { rotulo: `Novilhas a partir de ${an.cfg.pesoMatriz} kg`, valor: nov.filter((n) => n.apta).length },
    ],
    secoes: [
      {
        titulo: 'Situação das crias',
        colunas: [{ k: 'sexo', label: 'Sexo' }, { k: 'mamando', label: 'Mamando', align: 'right', mono: true }, { k: 'desmamado', label: 'Desmam.', align: 'right', mono: true },
          { k: 'novilha', label: 'Novilhas', align: 'right', mono: true }, { k: 'matriz', label: 'Matriz', align: 'right', mono: true }, { k: 'vendido', label: 'Vendidas', align: 'right', mono: true }, { k: 'morto', label: 'Mortas', align: 'right', mono: true }, { k: 'total', label: 'Total', align: 'right', mono: true }],
        linhas: linhasSit,
      },
      {
        titulo: 'Peso médio por idade (último peso de cada cria no rebanho)',
        nota: 'Em cada célula: peso médio em kg e, entre parênteses, quantos animais pesados entram na média.',
        colunas: [{ k: 'faixa', label: 'Idade' }, { k: 'machos', label: 'Machos', align: 'right', mono: true }, { k: 'femeas', label: 'Fêmeas', align: 'right', mono: true }],
        linhas: linhasFaixa,
      },
      {
        titulo: 'Machos para venda',
        nota: an.cfg.metaPesoMacho ? `Peso alvo ${an.cfg.metaPesoMacho} kg${an.cfg.metaQtdMacho ? ` · quantidade alvo ${an.cfg.metaQtdMacho}` : ''}. "Dias" é uma projeção pelo ganho diário recente.` : 'Defina o peso alvo em Crias > Para vender.',
        colunas: [{ k: 'brinco', label: 'Brinco', mono: true }, { k: 'idade', label: 'Idade', align: 'right', mono: true }, { k: 'peso', label: 'Peso (kg)', align: 'right', mono: true },
          { k: 'gmd', label: 'kg/dia', align: 'right', mono: true }, { k: 'dias', label: 'Dias p/ alvo', align: 'right', mono: true }, { k: 'mae', label: 'Mãe', mono: true }],
        linhas: an.linhas.map((l) => ({
          brinco: l.cria.brinco || '—', idade: idadeTxt(l.cria.idadeDias), peso: kg1(l.cria.pesoAtual), gmd: gmdTxt(l.cria.gmd),
          dias: l.pronto ? 'pronto' : l.dias === null ? '—' : l.dias, mae: l.cria.maeBrinco || '—',
        })),
      },
      {
        titulo: 'Novilhas em recria',
        nota: `A partir de ${an.cfg.pesoMatriz} kg a novilha está apta a virar matriz.`,
        colunas: [{ k: 'brinco', label: 'Brinco', mono: true }, { k: 'idade', label: 'Idade', align: 'right', mono: true }, { k: 'peso', label: 'Peso (kg)', align: 'right', mono: true },
          { k: 'gmd', label: 'kg/dia', align: 'right', mono: true }, { k: 'apta', label: 'Situação' }, { k: 'destino', label: 'Destino' }],
        linhas: nov.map((n) => ({
          brinco: n.brinco, idade: idadeTxt(n.idadeDias), peso: kg1(n.pesoAtual), gmd: gmdTxt(n.gmd),
          apta: n.pesoAtual === null ? 'sem peso' : n.apta ? 'apta' : `faltam ${n.faltam} kg`, destino: n.destino,
        })),
      },
    ],
  };
}

export function relatorioVendas(estado, ano) {
  const vendas = listarVendas(estado).filter((v) => ano === 'todos' || anoDe(v.venda.data) === ano);
  const todosItens = vendas.flatMap((v) => v.itens);
  const kgItens = todosItens.reduce((s, i) => s + (numPeso(i.peso) || 0), 0);
  const receita = vendas.reduce((s, v) => s + (parseFloat(v.venda.valorTotal) || 0), 0);
  const kgVendas = vendas.reduce((s, v) => s + (parseFloat(v.venda.pesoTotal) || 0), 0);
  const agrupar = (chaveFn) => {
    const mapa = new Map();
    todosItens.forEach((i) => { const k = chaveFn(i) || 'Não informado'; if (!mapa.has(k)) mapa.set(k, []); mapa.get(k).push(i); });
    return [...mapa.entries()].map(([k, l]) => ({
      chave: k, qtd: l.length, kg: kg1(l.reduce((s, i) => s + (numPeso(i.peso) || 0), 0)),
      valor: arred(l.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0), 2).toFixed(2),
    }));
  };
  const colAgr = [{ k: 'qtd', label: 'Animais', align: 'right', mono: true }, { k: 'kg', label: 'Kg', align: 'right', mono: true }, { k: 'valor', label: 'Valor (R$)', align: 'right', mono: true }];
  return {
    titulo: `Vendas por peso · ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: 'Vendas', valor: vendas.length },
      { rotulo: 'Animais vendidos (com número)', valor: todosItens.length },
      { rotulo: 'Peso vendido (kg)', valor: kg1(kgVendas || kgItens) },
      { rotulo: 'Receita (R$)', valor: receita.toFixed(2) },
      { rotulo: 'Valor médio do kg (R$)', valor: kgVendas ? (receita / kgVendas).toFixed(2) : '—' },
    ],
    secoes: [
      { titulo: 'Por tipo de animal', colunas: [{ k: 'chave', label: 'Tipo' }, ...colAgr], linhas: agrupar((i) => i.tipoAnimal).sort((a, b) => b.qtd - a.qtd) },
      { titulo: 'Por comprador', colunas: [{ k: 'chave', label: 'Comprador' }, ...colAgr], linhas: agrupar((i) => i.comprador).sort((a, b) => b.qtd - a.qtd) },
      {
        titulo: 'Vendas',
        colunas: [{ k: 'data', label: 'Data', mono: true }, { k: 'comprador', label: 'Comprador' }, { k: 'qtd', label: 'Animais', align: 'right', mono: true }, { k: 'kg', label: 'Kg', align: 'right', mono: true },
          { k: 'vkg', label: 'R$/kg', align: 'right', mono: true }, { k: 'total', label: 'Total (R$)', align: 'right', mono: true }],
        linhas: vendas.map(({ venda: v, itens }) => ({
          data: formatarDataBR(v.data), comprador: v.comprador || '—', qtd: v.qtd || itens.length || '—', kg: v.pesoTotal ? kg1(parseFloat(v.pesoTotal)) : '—',
          vkg: v.valorKg ? Number(v.valorKg).toFixed(2) : '—', total: v.valorTotal ? Number(v.valorTotal).toFixed(2) : '—',
        })),
      },
    ],
  };
}

export function relatorioMortes(estado, ano) {
  const { eventos } = estado;
  const noAno = (d) => ano === 'todos' || anoDe(d) === ano;
  const mortes = listarMortes(estado).filter((x) => x.ativa && noAno(x.e.data));
  const grupo = (e) => (['Cria', 'Novilha', 'Matriz'].includes(e.tipoAnimal) ? e.tipoAnimal : 'Outros');
  const nascs = eventos.filter((e) => e.tipo === 'nascimento' && noAno(e.data));
  const vivos = nascs.filter((e) => e.resultadoParto !== 'Natimorto').length;
  const criasMortas = mortes.filter((x) => grupo(x.e) === 'Cria').length;
  const contar = (lista) => ({
    total: lista.length,
    crias: lista.filter((x) => grupo(x.e) === 'Cria').length,
    novilhas: lista.filter((x) => grupo(x.e) === 'Novilha').length,
    matrizes: lista.filter((x) => grupo(x.e) === 'Matriz').length,
    outros: lista.filter((x) => grupo(x.e) === 'Outros').length,
  });
  const colGrupo = [
    { k: 'total', label: 'Total', align: 'right', mono: true }, { k: 'crias', label: 'Crias', align: 'right', mono: true },
    { k: 'novilhas', label: 'Novilhas', align: 'right', mono: true }, { k: 'matrizes', label: 'Matrizes', align: 'right', mono: true },
    { k: 'outros', label: 'Outros', align: 'right', mono: true },
  ];
  const agrupar = (chaveFn) => {
    const mapa = new Map();
    mortes.forEach((x) => { const k = chaveFn(x) || 'Não informado'; if (!mapa.has(k)) mapa.set(k, []); mapa.get(k).push(x); });
    return mapa;
  };
  const comTotal = (mapa, ordenar) => {
    const linhas = [...mapa.entries()].map(([k, l]) => ({ chave: k, ...contar(l) }));
    linhas.sort(ordenar || ((a, b) => b.total - a.total || String(a.chave).localeCompare(String(b.chave), 'pt-BR')));
    if (linhas.length) linhas.push({ chave: 'Total', ...contar(mortes) });
    return linhas;
  };
  const porCausa = agrupar((x) => x.e.causa);
  const topCausa = [...porCausa.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const pct = criasMortas && vivos ? `${Math.round((criasMortas / vivos) * 100)}% (${criasMortas} de ${vivos})` : vivos ? `0% (0 de ${vivos})` : '—';
  return {
    titulo: `Mortalidade · ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: 'Mortes lançadas', valor: mortes.length },
      { rotulo: 'Crias', valor: criasMortas },
      { rotulo: 'Novilhas e matrizes', valor: mortes.filter((x) => ['Novilha', 'Matriz'].includes(grupo(x.e))).length },
      { rotulo: 'Outros animais', valor: mortes.filter((x) => grupo(x.e) === 'Outros').length },
      { rotulo: 'Crias mortas / nascidas vivas', valor: pct },
      { rotulo: 'Natimortos (lançados no nascimento)', valor: nascs.length - vivos },
      { rotulo: 'Causa mais frequente', valor: topCausa ? `${topCausa[0]} (${topCausa[1].length})` : '—' },
    ],
    secoes: [
      {
        titulo: 'Por causa',
        nota: 'Conta só as mortes lançadas na aba Morte (anuladas não entram). Natimortos ficam no lançamento de nascimento.',
        colunas: [{ k: 'chave', label: 'Causa' }, ...colGrupo], linhas: comTotal(porCausa),
      },
      { titulo: 'Por tipo de animal', colunas: [{ k: 'chave', label: 'Animal' }, { k: 'total', label: 'Mortes', align: 'right', mono: true }],
        linhas: [...agrupar((x) => x.e.tipoAnimal).entries()].map(([k, l]) => ({ chave: k, total: l.length })).sort((a, b) => b.total - a.total) },
      {
        titulo: 'Por mês',
        colunas: [{ k: 'chave', label: 'Mês' }, ...colGrupo],
        linhas: (() => {
          const mapa = agrupar((x) => (x.e.data || '').slice(0, 7) || 'sem-data');
          const linhas = [...mapa.keys()].sort().map((k) => ({ chave: k === 'sem-data' ? 'Sem data' : mesCurto(k), ...contar(mapa.get(k)) }));
          if (linhas.length) linhas.push({ chave: 'Total', ...contar(mortes) });
          return linhas;
        })(),
      },
      {
        titulo: 'Por lote',
        nota: 'Para cria, vale o lote da mãe. Animal sem cadastro aparece como "Sem cadastro".',
        colunas: [{ k: 'chave', label: 'Lote' }, ...colGrupo], linhas: comTotal(agrupar((x) => x.lote)),
      },
      {
        titulo: 'Lançamentos',
        colunas: [{ k: 'data', label: 'Data', mono: true }, { k: 'animal', label: 'Animal' }, { k: 'causa', label: 'Causa' }, { k: 'lote', label: 'Lote' },
          { k: 'mae', label: 'Mãe', mono: true }, { k: 'obs', label: 'Observação' }],
        linhas: mortes.map((x) => ({
          data: formatarDataBR(x.e.data), animal: x.animal, causa: x.e.causa || '—', lote: x.lote, mae: x.mae || '—', obs: x.e.observacoes || '',
        })),
      },
    ],
  };
}

export const RELATORIOS = [
  { id: 'previsao', titulo: 'Previsão de parto', porAno: false },
  { id: 'nascimentos', titulo: 'Nascimentos por sexo', porAno: true },
  { id: 'melhores', titulo: 'Melhores vacas em prenhez', porAno: true },
  { id: 'iatf', titulo: 'IATF', porAno: true },
  { id: 'situacao', titulo: 'Situação das vacas', porAno: false },
  { id: 'crias', titulo: 'Crias e pesos', porAno: true },
  { id: 'vendas', titulo: 'Vendas por peso', porAno: true },
  { id: 'mortes', titulo: 'Mortalidade', porAno: true },
];

export function montarRelatorio(id, { matrizes, touros, eventos, config }, ano, hoje) {
  if (id === 'crias') return relatorioCrias({ matrizes, touros, eventos }, config, ano, hoje);
  if (id === 'vendas') return relatorioVendas({ matrizes, touros, eventos }, ano);
  if (id === 'mortes') return relatorioMortes({ matrizes, touros, eventos }, ano);
  if (id === 'previsao') return relatorioPrevisaoParto(matrizes, eventos, hoje);
  if (id === 'nascimentos') return relatorioNascimentos(matrizes, eventos, touros, ano);
  if (id === 'melhores') return relatorioMelhoresVacas(matrizes, eventos, ano);
  if (id === 'iatf') return relatorioIATF(matrizes, eventos, touros, ano);
  return relatorioSituacaoVacas(matrizes, eventos, hoje);
}

// ---------------------------------------------------------------- planilha / Excel
// Linhas (objetos) de cada aba da Planilha. Eventos já vêm filtrados pelo ano escolhido.
export function linhasPlanilha(tipo, { matrizes, touros, eventos, config, todosEventos }) {
  const brincoMap = mapaBrincos(matrizes);
  const nomeTouro = (e) => nomeTouroEvento(e, touros);
  if (tipo === 'crias') {
    return listarCrias({ matrizes, touros, eventos: todosEventos || eventos }).map((c) => ({
      'Brinco': c.brinco, 'Sexo': c.sexo, 'Nascimento': formatarDataBR(c.nascData), 'Idade (dias)': c.idadeDias ?? '', 'Mãe': c.maeBrinco,
      'Origem / pai': c.origem.rotulo, 'Situação': rotuloSituacao(c), 'Último peso (kg)': c.pesoAtual ?? '', 'Data do peso': formatarDataBR(c.pesoData),
      'Ganho (kg/dia)': c.gmd === null ? '' : arred(c.gmd, 2), 'Desmama': formatarDataBR(c.desmamaData), 'Baixa (venda)': formatarDataBR(c.vendaData),
      'Morte em': formatarDataBR(c.mortoData), 'Causa da morte': c.causaMorte || '', 'Órfã (mãe morreu)': c.orfa ? 'Sim' : '',
    }));
  }
  if (tipo === 'pesagem') {
    return eventos.filter((e) => e.tipo === 'pesagem').map((e) => ({
      'Data': formatarDataBR(e.data), 'Brinco': e.brinco || '', 'Peso (kg)': e.peso, 'Observações': e.observacoes || '',
    }));
  }
  if (tipo === 'vendaitem') {
    return eventos.filter((e) => e.tipo === 'vendaitem').map((e) => ({
      'Data': formatarDataBR(e.data), 'Número': e.brinco || '', 'Tipo de animal': e.tipoAnimal || '', 'Peso (kg)': e.peso, 'R$/kg': e.valorKg, 'Valor (R$)': e.valor, 'Comprador': e.comprador || '',
    }));
  }
  if (tipo === 'matrizes') {
    return matrizes.map((m) => ({
      'Brinco': m.brinco, 'Categoria': m.categoria, 'Raça': m.raca || '',
      'Lote': m.lote || '', 'Data Nasc.': formatarDataBR(m.dataNascimento) || '', 'Status': m.status, 'Destino': m.destino || '', 'Baixa em': formatarDataBR(m.dataBaixa) || '',
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
      'Data': formatarDataBR(e.data), 'Categoria': e.categoria || '', 'Animais': e.animais || '', 'Qtd': e.qtd || '', 'Peso Total (kg)': e.pesoTotal || '',
      'Valor kg (R$)': e.valorKg || '', 'Valor Arroba (R$)': e.valorArroba || '', 'Valor Total (R$)': e.valorTotal || '', 'Frete/Comissão (R$)': e.frete || '', 'Comprador': e.comprador || '',
    }));
  }
  if (tipo === 'insumo') {
    return evs.map((e) => ({ 'Data': formatarDataBR(e.data), 'Produto': e.produto || '', 'Quantidade': e.quantidade || '', 'Unidade': e.unidade || '', 'Custo (R$)': e.custo || '', 'Categoria Animal': e.categoriaAnimal || '' }));
  }
  if (tipo === 'morte') {
    return evs.map((e) => ({
      'Data': formatarDataBR(e.data), 'Animal': e.tipoAnimal || '', 'Brinco': e.brinco || '', 'Causa': e.causa || '', 'Observação': e.observacoes || '',
      'Status anterior': e.statusAnterior || '', 'Anulada': e.anulada || '',
    }));
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
  ['Matrizes', 'matrizes'], ['Crias', 'crias'], ['Nascimentos', 'nascimento'], ['Pesagens', 'pesagem'], ['Desmama', 'desmama'], ['Recria', 'recria'], ['IATF', 'iatf'],
  ['Diagnósticos', 'diagnostico'], ['Vendas', 'venda'], ['Animais vendidos', 'vendaitem'], ['Insumos', 'insumo'], ['Descartes', 'descarte'], ['Mortes', 'morte'], ['Touros', 'touros'],
];

// ---------------------------------------------------------------- v9.5: idade em meses e dias, ficha rápida, pesagem do dia, fila sem internet
// Idade de calendário: "7 meses e 12 dias" (meses cheios contados no calendário, o resto em dias)
export function idadeMesesDias(nascISO, refISO) {
  if (!nascISO || !refISO || refISO < nascISO) return null;
  const [y1, m1, d1] = nascISO.split('-').map(Number);
  const [y2, m2, d2] = refISO.split('-').map(Number);
  let meses = (y2 - y1) * 12 + (m2 - m1);
  if (d2 < d1) meses -= 1;
  const base = addMeses(nascISO, meses);
  const dias = diasEntre(base, refISO);
  return { meses, dias, totalDias: diasEntre(nascISO, refISO), texto: textoMesesDias(meses, dias) };
}
export function textoMesesDias(meses, dias) {
  const m = meses === 1 ? '1 mês' : `${meses} meses`;
  const d = dias === 1 ? '1 dia' : `${dias} dias`;
  if (!meses) return d;
  if (!dias) return m;
  return `${m} e ${d}`;
}
// Soma meses de calendário (31/01 + 1 mês = 28 ou 29/02)
export function addMeses(iso, meses) {
  const [y, m, d] = iso.split('-').map(Number);
  const alvo = new Date(Date.UTC(y, m - 1 + meses, 1));
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimo));
  return alvo.toISOString().slice(0, 10);
}
// Meses e dias digitados -> total de dias (com a data de nascimento conta no calendário; sem ela, mês de 30 dias)
export function diasDeMesesDias(nascISO, meses, dias) {
  const m = parseInt(meses, 10) || 0; const d = parseInt(dias, 10) || 0;
  if (nascISO) return diasEntre(nascISO, addDias(addMeses(nascISO, m), d));
  return m * 30 + d;
}

// Tudo o que o funcionário precisa ver ao digitar um brinco (Pesar e Desmama): quem é, idade, nascimento, mãe,
// último peso e as pesagens já gravadas numa data. ref = data da pesagem/desmama (idade calculada nessa data).
export function fichaAnimal(estado, brinco, ref, crias) {
  const info = infoAnimalVenda(estado, brinco, ref, crias);
  if (!info.achado) return { ...info, mesmaData: [] };
  const a = acharAnimal(estado, brinco);
  const nasc = a && a.nasc;
  const m = a && a.matriz;
  const nascData = (nasc && nasc.data) || (m && m.dataNascimento) || '';
  const maeId = nasc && nasc.matrizId;
  const mae = maeId ? estado.matrizes.find((x) => x.id === maeId) : null;
  const pesagens = (info.pontos || []).filter((p) => p.fonte === 'Pesagem');
  const anteriores = (info.pontos || []).filter((p) => p.data < ref && p.fonte !== 'Nascimento');
  const desm = nasc ? estado.eventos.find((e) => e.tipo === 'desmama' && mesmoBrinco(e.brincoBezerro, nasc.brincoBezerro) && e.data >= nasc.data) : null;
  return {
    ...info,
    sexo: info.sexo || (nasc && nasc.sexo) || '',
    categoria: m ? m.categoria : 'Cria',
    nascData, idade: nascData ? idadeMesesDias(nascData, ref) : null,
    maeBrinco: mae ? String(mae.brinco) : (maeId ? '?' : ''),
    jaPesado: (info.pontos || []).some((p) => p.fonte !== 'Nascimento'),
    ultimoPeso: (() => { const l = (info.pontos || []).filter((p) => p.fonte !== 'Nascimento'); return l.length ? l[l.length - 1] : null; })(),
    pesoAnterior: anteriores.length ? anteriores[anteriores.length - 1] : null,
    mesmaData: pesagens.filter((p) => p.data === ref),
    desmamaData: desm ? desm.data : '',
  };
}

// ---------------------------------------------------------------- v10.4: pesagem de animal sem brinco
// Animal que perdeu o brinco é pesado assim mesmo: a pesagem fica sem cria ligada e com a observação "SEM BRINCO: <sinal>".
// Depois, na conferência da pesagem, ele é ligado a um dos animais que ficaram sem peso naquela data.
export const MARCA_SEM_BRINCO = 'SEM BRINCO';
export const ehSemBrinco = (e) => !!e && e.tipo === 'pesagem' && !e.criaId && !e.matrizId && /^\s*sem brinco/i.test(String(e.observacoes || ''));
export const sinalSemBrinco = (e) => String((e && e.observacoes) || '').replace(/^\s*sem brinco\s*:?\s*/i, '').trim();
export const chavePesagem = (e) => (ehSemBrinco(e) ? `sb:${e.id}` : e.criaId || e.matrizId || String(e.brinco ?? '').trim());

// Relatório da pesagem de um dia (tela Pesar e PDF). Pesagens e desmamas gravadas na data, com idade, mãe, peso anterior e ganho.
export function relatorioPesagemDia(estado, data, hoje) {
  const crias = listarCrias(estado, hoje);
  const evs = estado.eventos.filter((e) => (e.tipo === 'pesagem' || (e.tipo === 'desmama' && numPeso(e.pesoDesmama) > 0)) && e.data === data);
  const porAnimal = new Map();
  evs.forEach((e) => {
    const sb = ehSemBrinco(e);
    const brinco = sb ? '' : String(e.tipo === 'desmama' ? e.brincoBezerro : e.brinco || '').trim();
    const k = e.tipo === 'desmama' ? `d:${brinco}` : chavePesagem(e);
    if (!porAnimal.has(k)) porAnimal.set(k, { brinco, sb, lista: [] });
    porAnimal.get(k).lista.push(e);
  });
  const linhas = [];
  porAnimal.forEach(({ brinco, sb, lista }) => {
    const f = sb ? { mesmaData: [] } : fichaAnimal(estado, brinco, data, crias);
    const vezes = lista.length;
    lista.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')).forEach((e) => {
      const peso = numPeso(e.tipo === 'desmama' ? e.pesoDesmama : e.peso);
      const ant = f.pesoAnterior;
      const dias = ant ? diasEntre(ant.data, data) : null;
      linhas.push({
        brinco: sb ? 'SB' : brinco || '—', sexo: f.sexo || '—', idade: f.idade ? f.idade.texto : '—', nasc: f.nascData ? formatarDataBR(f.nascData) : '—',
        mae: f.maeBrinco || '—', peso, pesoTxt: `${String(peso).replace('.', ',')} kg`,
        anterior: ant ? `${String(ant.peso).replace('.', ',')} kg em ${formatarDataBR(ant.data)}` : 'primeira pesagem',
        ganho: ant && dias > 0 ? `${((peso - ant.peso) / dias).toFixed(2).replace('.', ',')} kg/dia` : '—',
        obs: sb ? `Sem brinco${sinalSemBrinco(e) ? `: ${sinalSemBrinco(e)}` : ''}` : [e.tipo === 'desmama' ? 'Desmama' : '', vezes > 1 ? `PESADO ${vezes}x NESTA DATA` : ''].filter(Boolean).join(' · '),
        vezes, sb,
      });
    });
  });
  linhas.sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), 'pt-BR', { numeric: true }));
  const pesos = linhas.map((l) => l.peso).filter((p) => p > 0);
  const media = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null);
  const fmtMedia = (arr) => { const v = media(arr); return v === null ? '—' : `${v.toFixed(1).replace('.', ',')} kg`; };
  const dup = [...new Set(linhas.filter((l) => l.vezes > 1).map((l) => l.brinco))];
  return {
    titulo: `Pesagem de ${formatarDataBR(data)}`,
    resumo: [
      { rotulo: 'Pesagens', valor: linhas.length },
      { rotulo: 'Animais', valor: porAnimal.size },
      { rotulo: 'Peso total', valor: `${pesos.reduce((s, x) => s + x, 0).toLocaleString('pt-BR')} kg` },
      { rotulo: 'Peso médio', valor: fmtMedia(pesos) },
      { rotulo: 'Média dos machos', valor: fmtMedia(linhas.filter((l) => l.sexo === 'Macho').map((l) => l.peso)) },
      { rotulo: 'Média das fêmeas', valor: fmtMedia(linhas.filter((l) => l.sexo === 'Fêmea').map((l) => l.peso)) },
      { rotulo: 'Pesados 2x nesta data', valor: dup.length ? dup.join(', ') : 'nenhum' },
      { rotulo: 'Sem brinco', valor: linhas.filter((l) => l.sb).length },
    ],
    secoes: [{
      titulo: 'Animais pesados',
      nota: dup.length ? `Atenção: ${dup.join(', ')} aparece(m) mais de uma vez nesta data. Verifique a duplicidade.` : '',
      colunas: [
        { k: 'brinco', label: 'Brinco', mono: true }, { k: 'sexo', label: 'Sexo' }, { k: 'idade', label: 'Idade' }, { k: 'nasc', label: 'Nascimento', mono: true },
        { k: 'mae', label: 'Mãe', mono: true }, { k: 'pesoTxt', label: 'Peso', align: 'right', mono: true }, { k: 'anterior', label: 'Peso anterior' },
        { k: 'ganho', label: 'Ganho', align: 'right', mono: true }, { k: 'obs', label: 'Obs.' },
      ],
      linhas,
    }],
  };
}

// Aplica sobre os dados lidos da planilha o que ainda está na fila do celular (não chegou na planilha).
// Assim o que foi lançado sem internet continua aparecendo depois de recarregar.
export function aplicarPendentes(dados, itensFila) {
  let { matrizes, touros, eventos, config, protocolos } = dados;
  const idsEv = new Set(eventos.map((e) => e.id));
  const addEv = (tipo, ev) => { if (!ev || !ev.id || idsEv.has(ev.id)) return; idsEv.add(ev.id); eventos = [...eventos, { ...ev, tipo: ev.tipo || tipo }]; };
  const upM = (m) => { if (!m || !m.id) return; matrizes = matrizes.some((x) => x.id === m.id) ? matrizes.map((x) => (x.id === m.id ? { ...x, ...m } : x)) : [...matrizes, m]; };
  (itensFila || []).forEach(({ payload: p }) => {
    if (!p) return;
    if (p.action === 'appendEvento') addEv(p.tipo, p.evento);
    else if (p.action === 'appendEventos') (p.itens || []).forEach((it) => addEv(it.tipo, it.evento));
    else if (p.action === 'upsertMatriz') upM(p.matriz);
    else if (p.action === 'upsertMatrizes') (p.matrizes || []).forEach(upM);
    else if (p.action === 'appendTouro') { if (p.touro && !touros.some((t) => t.id === p.touro.id)) touros = [...touros, p.touro]; }
    else if (p.action === 'upsertTouros') (p.touros || []).forEach((t) => { touros = touros.some((x) => x.id === t.id) ? touros.map((x) => (x.id === t.id ? { ...x, ...t } : x)) : [...touros, t]; });
    else if (p.action === 'upsertProtocolos') {
      (p.protocolos || []).forEach((pr) => {
        const lista = protocolos || [];
        protocolos = lista.some((x) => x.id === pr.id) ? lista.map((x) => (x.id === pr.id ? { ...x, ...pr } : x)) : [...lista, pr];
      });
    }
    else if (p.action === 'setConfig') config = { ...(config || {}), ...(p.config || {}) };
    else if (p.action === 'atualizarCampos') {
      const mapa = new Map((p.itens || []).map((it) => [it.id, it.campos]));
      eventos = eventos.map((e) => (mapa.has(e.id) && e.tipo === p.tipo ? { ...e, ...mapa.get(e.id) } : e));
    }
  });
  return { ...dados, matrizes, touros, eventos, config, protocolos };
}
