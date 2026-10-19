// src/app.jsx
import React17, { useState as useState16, useEffect as useEffect8, useMemo as useMemo15, useRef as useRef7 } from "react";
import { createRoot } from "react-dom/client";
import {
  Plus as Plus3,
  CalendarClock,
  List,
  LayoutDashboard,
  FileText,
  Lock as Lock2,
  Unlock,
  Loader2 as Loader28,
  ChevronDown as ChevronDown2,
  Baby,
  CloudOff,
  AlertTriangle,
  RefreshCw as RefreshCw2,
  Trash2 as Trash23
} from "lucide-react";

// src/logica.js
var VERSAO_APP = "9.5 (19/10/26)";
var VERSAO_MINIMA_SCRIPT = 10;
var PERIODO_GESTACAO_DIAS = 285;
var TIPOS_FUNCIONARIO = ["nascimento", "desmama", "iatf", "insumo", "descarte", "pesagem", "morte"];
var CAUSAS_MORTE = ["Doen\xE7a", "Acidente", "Picada de cobra", "Raio", "Parto dif\xEDcil", "N\xE3o sabe", "Outra"];
var TIPOS_ANIMAL_MORTE = ["Cria", "Novilha", "Matriz", "Touro", "Boi", "Outro"];
var TIPOS_EVENTO = [
  { id: "cadastro", label: "Nova Matriz" },
  { id: "touro", label: "Touro / S\xEAmen" },
  { id: "iatf", label: "Insemina\xE7\xE3o (IATF)" },
  { id: "diagnostico", label: "Diagn\xF3stico (Toque)" },
  { id: "nascimento", label: "Nascimento" },
  { id: "desmama", label: "Desmama" },
  { id: "recria", label: "Recria (pesagem)" },
  { id: "pesagem", label: "Pesagem" },
  { id: "venda", label: "Venda" },
  { id: "vendaitem", label: "Animal vendido" },
  { id: "insumo", label: "Sal / Medicamento" },
  { id: "descarte", label: "Descarte" },
  { id: "morte", label: "Morte" }
];
var CAMPOS_EDICAO_MATRIZ = [
  { key: "brinco", label: "Brinco / ID", type: "text", required: true },
  { key: "categoria", label: "Categoria", type: "select", options: ["Novilha", "Prim\xEDpara", "Mult\xEDpara", "Vaca"] },
  { key: "raca", label: "Ra\xE7a", type: "text" },
  { key: "lote", label: "Lote / piquete", type: "text" },
  { key: "dataNascimento", label: "Data de nascimento", type: "date" },
  { key: "partosAnteriores", label: "Partos antes de entrar na fazenda", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["Vazia", "Cheia", "Descarte", "Vendida"] }
];
var CAMPOS = {
  cadastro: [
    { key: "brinco", label: "Brinco / ID", type: "text", required: true },
    { key: "categoria", label: "Categoria", type: "select", options: ["Novilha", "Prim\xEDpara", "Mult\xEDpara", "Vaca"] },
    { key: "raca", label: "Ra\xE7a", type: "text" },
    { key: "lote", label: "Lote / piquete", type: "text" },
    { key: "dataNascimento", label: "Data de nascimento", type: "date" },
    { key: "partosAnteriores", label: "Partos antes de entrar na fazenda", type: "number" },
    { key: "statusInicial", label: "Status inicial", type: "select", options: ["Vazia", "Cheia"] }
  ],
  touro: [
    { key: "nome", label: "Nome do touro / s\xEAmen", type: "text", required: true },
    { key: "raca", label: "Ra\xE7a", type: "text", required: true },
    { key: "fornecedor", label: "Central / fornecedor", type: "text" },
    { key: "anoAquisicao", label: "Ano de aquisi\xE7\xE3o", type: "number" },
    { key: "doses", label: "Doses adquiridas", type: "number" },
    { key: "custoDose", label: "Custo por dose (R$)", type: "number" },
    { key: "observacoes", label: "Observa\xE7\xF5es", type: "text" }
  ],
  iatf: [
    { key: "matrizId", label: "Matriz", type: "matriz", required: true },
    { key: "tipoServico", label: "Tipo", type: "select", options: ["IATF", "Repasse (monta natural)"] },
    { key: "numeroServico", label: "N\xBA da tentativa", type: "select", options: ["1\xAA", "2\xAA", "3\xAA ou mais"] },
    { key: "data", label: "Data da IA / cobertura", type: "date", required: true },
    { key: "dataInicioProtocolo", label: "In\xEDcio do protocolo", type: "date" },
    { key: "touroId", label: "S\xEAmen / touro", type: "touro" },
    { key: "touroOutro", label: "Nome (n\xE3o cadastrado)", type: "text", showIf: (f) => f.touroId === "__outro__" },
    { key: "tecnico", label: "T\xE9cnico", type: "text" },
    { key: "custo", label: "Custo (R$)", type: "number" },
    { key: "observacoes", label: "Observa\xE7\xF5es", type: "text" }
  ],
  diagnostico: [
    { key: "matrizId", label: "Matriz", type: "matriz", required: true },
    { key: "data", label: "Data do exame", type: "date", required: true },
    { key: "resultado", label: "Resultado", type: "select", options: ["Prenhe", "Vazia", "Descarte"], required: true },
    { key: "metodo", label: "M\xE9todo", type: "select", options: ["Toque retal", "Ultrassom"] },
    { key: "dg", label: "DG (dias de gesta\xE7\xE3o)", type: "number" },
    { key: "motivo", label: "Motivo do descarte", type: "text", showIf: (f) => f.resultado === "Descarte" },
    { key: "veterinario", label: "Veterin\xE1rio", type: "text" },
    { key: "custo", label: "Custo (R$)", type: "number" }
  ],
  nascimento: [
    { key: "matrizId", label: "Matriz (m\xE3e)", type: "matriz", required: true },
    { key: "data", label: "Data do nascimento", type: "date", required: true },
    { key: "resultadoParto", label: "Resultado", type: "select", options: ["Vivo", "Natimorto"], required: true, default: "Vivo" },
    { key: "sexo", label: "Sexo", type: "select", options: ["F\xEAmea", "Macho"], required: true },
    { key: "brincoBezerro", label: "Brinco do bezerro (sugerido automaticamente)", type: "text", required: true },
    { key: "pelagem", label: "Pelagem", type: "text" },
    // Sem campo "Pai": a origem da cria (IATF ou monta) e o pai são deduzidos depois, cruzando o parto
    // com o IATF da mãe (ver origemDaCria). Sem IATF compatível, a cria é de monta natural.
    { key: "tipoParto", label: "Tipo de parto", type: "select", options: ["Normal", "Dist\xF3cico (com dificuldade)"], default: "Normal" },
    { key: "observacoes", label: "Observa\xE7\xF5es", type: "text" }
  ],
  desmama: [
    { key: "brincoBezerro", label: "Brinco do bezerro", type: "text", required: true },
    { key: "data", label: "Data da desmama", type: "date", required: true },
    { key: "pesoDesmama", label: "Peso na desmama (kg)", type: "number" },
    { key: "idadeDias", label: "Idade (dias)", type: "number" }
  ],
  recria: [
    { key: "matrizId", label: "Novilha", type: "matriz", required: true },
    { key: "data", label: "Data da pesagem", type: "date", required: true },
    { key: "pesoAtual", label: "Peso atual (kg)", type: "number" },
    { key: "aptaReproducao", label: "Apta para reprodu\xE7\xE3o?", type: "select", options: ["Ainda n\xE3o", "Sim, apta"] },
    { key: "observacoes", label: "Observa\xE7\xF5es", type: "text" }
  ],
  // Pesagem de cria ou novilha. O animal é achado pelo brinco (ver acharAnimal); a tela de Crias também manda criaId/matrizId.
  pesagem: [
    { key: "brinco", label: "Brinco do animal", type: "text", required: true },
    { key: "data", label: "Data da pesagem", type: "date", required: true },
    { key: "peso", label: "Peso (kg)", type: "number", required: true },
    { key: "observacoes", label: "Observa\xE7\xF5es", type: "text" }
  ],
  venda: [
    { key: "data", label: "Data da venda", type: "date", required: true },
    { key: "categoria", label: "Categoria do animal", type: "select", options: ["Bezerro(a) (mamando)", "Novilha (recria)", "Boi/Boiadinho (engorda)", "Vaca de descarte"] },
    { key: "animais", label: "Animais (descri\xE7\xE3o/qtd)", type: "text" },
    { key: "pesoTotal", label: "Peso total (kg)", type: "number" },
    { key: "valorArroba", label: "Valor por arroba (R$)", type: "number" },
    { key: "valorTotal", label: "Valor total da venda (R$)", type: "number", required: true },
    { key: "frete", label: "Frete / comiss\xE3o (R$)", type: "number" },
    { key: "comprador", label: "Comprador", type: "text" }
  ],
  insumo: [
    { key: "data", label: "Data", type: "date", required: true },
    { key: "produto", label: "Produto", type: "select", options: ["Sal Mineral", "Medicamento", "Vacina", "Outro"] },
    { key: "quantidade", label: "Quantidade", type: "number" },
    { key: "unidade", label: "Unidade", type: "select", options: ["kg", "L", "un", "dose"] },
    { key: "custo", label: "Custo (R$)", type: "number" },
    { key: "categoriaAnimal", label: "Categoria de animal", type: "text" }
  ],
  descarte: [
    { key: "matrizId", label: "Matriz", type: "matriz", required: true },
    { key: "data", label: "Data", type: "date", required: true },
    { key: "motivo", label: "Motivo", type: "text" }
  ],
  // Morte de qualquer animal. O animal é achado pelo brinco (cria, novilha ou matriz); sem cadastro, escolhe-se o tipo (ver validarMorte).
  morte: [
    { key: "brinco", label: "Brinco do animal", type: "text" },
    { key: "data", label: "Data da morte", type: "date", required: true },
    { key: "causa", label: "Causa", type: "select", options: CAUSAS_MORTE, required: true },
    { key: "tipoAnimal", label: "Que animal \xE9", type: "select", options: TIPOS_ANIMAL_MORTE },
    { key: "observacoes", label: "Observa\xE7\xE3o", type: "text" }
  ]
};
var p2 = (n) => String(n).padStart(2, "0");
function todayISO() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}
function paraUTC(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
function addDias(dataISO, dias) {
  return new Date(paraUTC(dataISO) + dias * 864e5).toISOString().slice(0, 10);
}
function diasEntre(deISO, ateISO) {
  return Math.round((paraUTC(ateISO) - paraUTC(deISO)) / 864e5);
}
function normalizarDataISO(v) {
  if (v === null || v === void 0 || v === "") return "";
  if (typeof v !== "string") return String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
    const t = new Date(v).getTime();
    if (!isNaN(t)) return new Date(t - 3 * 3600 * 1e3).toISOString().slice(0, 10);
  }
  return v;
}
function formatarDataBR(iso) {
  if (!iso || typeof iso !== "string") return iso || "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const [, ano, mes, dia] = m;
  return `${dia}/${mes}/${ano.slice(2)}`;
}
var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function mesCurto(aaaamm) {
  const [a, m] = String(aaaamm).split("-");
  return `${MESES[parseInt(m, 10) - 1] || m}/${String(a).slice(2)}`;
}
function parseDataFlex(txt2, hoje) {
  hoje = hoje || todayISO();
  if (txt2 === null || txt2 === void 0) return "";
  const s = String(txt2).trim();
  if (!s) return "";
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  let ano;
  let mes;
  let dia;
  if (m) {
    ano = +m[1];
    mes = +m[2];
    dia = +m[3];
  } else {
    m = s.match(/^(\d{1,2})[/.\-](\d{1,2})(?:[/.\-](\d{2}|\d{4}))?$/);
    if (!m) return "";
    dia = +m[1];
    mes = +m[2];
    if (m[3]) ano = m[3].length === 2 ? 2e3 + +m[3] : +m[3];
    else {
      ano = parseInt(hoje.slice(0, 4), 10);
      const cand = `${ano}-${p2(mes)}-${p2(dia)}`;
      if (!isNaN(paraUTC(cand)) && diasEntre(hoje, cand) > 60) ano -= 1;
    }
  }
  const iso = `${ano}-${p2(mes)}-${p2(dia)}`;
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return "";
  return iso;
}
function anoDe(iso) {
  const m = /^(\d{4})-/.exec(iso || "");
  return m ? parseInt(m[1], 10) : null;
}
function anosDisponiveis(eventos, hoje) {
  const set = /* @__PURE__ */ new Set([anoDe(hoje || todayISO())]);
  eventos.forEach((e) => {
    const a = anoDe(e.data);
    if (a) set.add(a);
  });
  return [...set].sort((a, b) => b - a);
}
function filtrarPorAno(eventos, ano) {
  if (ano === "todos" || ano === null || ano === void 0) return eventos;
  return eventos.filter((e) => anoDe(e.data) === ano);
}
function rotuloAno(ano) {
  return ano === "todos" ? "todos os anos" : String(ano);
}
function normalizarDados(data) {
  const matrizes = (data.matrizes || []).map((m) => ({
    ...m,
    brinco: String(m.brinco ?? ""),
    dataNascimento: normalizarDataISO(m.dataNascimento),
    dataBaixa: normalizarDataISO(m.dataBaixa)
  }));
  const eventos = (data.eventos || []).map((e) => ({
    ...e,
    data: normalizarDataISO(e.data),
    dataInicioProtocolo: normalizarDataISO(e.dataInicioProtocolo),
    brincoBezerro: e.brincoBezerro === void 0 || e.brincoBezerro === null ? "" : String(e.brincoBezerro)
  }));
  return { matrizes: reconciliarMortes(matrizes, eventos), touros: data.touros || [], eventos, config: data.config && typeof data.config === "object" ? data.config : {} };
}
function reconciliarMortes(matrizes, eventos) {
  const porMatriz = /* @__PURE__ */ new Map();
  eventos.forEach((e) => {
    if (e.tipo === "morte" && e.matrizId) {
      if (!porMatriz.has(e.matrizId)) porMatriz.set(e.matrizId, []);
      porMatriz.get(e.matrizId).push(e);
    }
  });
  if (!porMatriz.size) return matrizes;
  return matrizes.map((m) => {
    const mortes = porMatriz.get(m.id);
    if (!mortes) return m;
    const ativa = mortes.find(morteAtiva);
    if (ativa && m.status !== "Morta") return { ...m, status: "Morta", dataBaixa: m.dataBaixa || ativa.data || "", motivoBaixa: m.motivoBaixa || `Morte: ${ativa.causa || ""}` };
    if (!ativa && m.status === "Morta") return { ...m, status: mortes[mortes.length - 1].statusAnterior || "Vazia", dataBaixa: "", motivoBaixa: "" };
    return m;
  });
}
function ultimoPartoDe(matrizId, eventos) {
  const nascs = eventos.filter((e) => e.tipo === "nascimento" && e.matrizId === matrizId && e.data);
  if (!nascs.length) return "";
  return nascs.reduce((max, e) => e.data > max ? e.data : max, nascs[0].data);
}
function numeroCriaUltimoParto(matrizId, eventos) {
  const nascs = eventos.filter((e) => e.tipo === "nascimento" && e.matrizId === matrizId && e.data);
  if (!nascs.length) return "";
  const maisRecente = nascs.reduce((max, e) => e.data > max.data ? e : max, nascs[0]);
  return maisRecente.brincoBezerro || "";
}
function previsaoPartoInfo(matrizId, eventos) {
  const ultimo = ultimoPartoDe(matrizId, eventos);
  const valida = (d) => d && (!ultimo || d > ultimo);
  const diagsPrenhe = eventos.filter((e) => e.tipo === "diagnostico" && e.matrizId === matrizId && e.resultado === "Prenhe" && valida(e.data)).sort((a, b) => b.data.localeCompare(a.data));
  const comDG = diagsPrenhe.filter((e) => e.dg !== "" && e.dg !== null && e.dg !== void 0 && !isNaN(parseInt(e.dg, 10)));
  if (comDG.length) {
    const dg = parseInt(comDG[0].dg, 10);
    return { data: addDias(addDias(comDG[0].data, -dg), PERIODO_GESTACAO_DIAS), origem: "toque", base: comDG[0].data, dg };
  }
  const iatfs = eventos.filter((e) => e.tipo === "iatf" && e.matrizId === matrizId && valida(e.data)).sort((a, b) => b.data.localeCompare(a.data));
  if (iatfs.length) return { data: addDias(iatfs[0].data, PERIODO_GESTACAO_DIAS), origem: "iatf", base: iatfs[0].data };
  if (diagsPrenhe.length) return { data: "", origem: "toque-sem-dg", base: diagsPrenhe[0].data };
  return null;
}
function sugerirBrincoBezerro(data, sexo, eventos) {
  if (!data || !sexo) return "";
  const ano = parseInt(data.slice(0, 4), 10) % 10;
  const base = sexo === "Macho" ? 500 : 0;
  const usados = /* @__PURE__ */ new Set();
  eventos.filter((e) => e.tipo === "nascimento" && e.brincoBezerro).forEach((e) => {
    const n = parseInt(e.brincoBezerro, 10);
    if (!isNaN(n) && Math.floor(n / 1e3) === ano) {
      const resto = n % 1e3;
      if (resto >= base && resto < base + 500) usados.add(resto - base);
    }
  });
  let max = 0;
  usados.forEach((x) => {
    if (x > max) max = x;
  });
  let seq2 = max + 1;
  if (seq2 >= 500) {
    seq2 = 1;
    while (usados.has(seq2)) seq2++;
  }
  return String(ano * 1e3 + base + seq2);
}
function linhasPrevisao(matrizes, eventos, status, hoje, busca) {
  hoje = hoje || todayISO();
  const q = (busca || "").toLowerCase();
  return matrizes.filter((m) => m.status === status && noPlantel(m)).filter((m) => !q || String(m.brinco).toLowerCase().includes(q)).map((m) => {
    const info = status === "Cheia" ? previsaoPartoInfo(m.id, eventos) : null;
    const previsao = info ? info.data : "";
    const ultimoParto = ultimoPartoDe(m.id, eventos);
    return {
      matriz: m,
      info,
      previsao,
      dias: previsao ? diasEntre(hoje, previsao) : null,
      ultimoParto,
      diasDesdeParto: ultimoParto ? diasEntre(ultimoParto, hoje) : null,
      numeroCria: numeroCriaUltimoParto(m.id, eventos)
    };
  }).sort((a, b) => {
    if (status === "Cheia") {
      if (!a.previsao) return 1;
      if (!b.previsao) return -1;
      return a.previsao.localeCompare(b.previsao);
    }
    if (!a.ultimoParto) return 1;
    if (!b.ultimoParto) return -1;
    return b.ultimoParto.localeCompare(a.ultimoParto);
  });
}
function calcularKPIs(todasMatrizes, eventos) {
  const matrizes = todasMatrizes.filter(noPlantel);
  const vendidas = todasMatrizes.filter((m) => m.status === "Vendida").length;
  const mortas = todasMatrizes.filter((m) => m.status === "Morta").length;
  const mortesAtivas = eventos.filter(morteAtiva);
  const cheias = matrizes.filter((m) => m.status === "Cheia").length;
  const vazias = matrizes.filter((m) => m.status === "Vazia").length;
  const descartes = matrizes.filter((m) => m.status === "Descarte").length;
  const diagnosticos = eventos.filter((e) => e.tipo === "diagnostico");
  const taxaPrenhez = diagnosticos.length ? diagnosticos.filter((d) => d.resultado === "Prenhe").length / diagnosticos.length * 100 : 0;
  const nascimentosTodos = eventos.filter((e) => e.tipo === "nascimento");
  const natimortos = nascimentosTodos.filter((n) => n.resultadoParto === "Natimorto").length;
  const nascimentos = nascimentosTodos.filter((n) => n.resultadoParto !== "Natimorto");
  const taxaPerda = nascimentosTodos.length ? natimortos / nascimentosTodos.length * 100 : 0;
  const desmamas = eventos.filter((e) => e.tipo === "desmama");
  const taxaDesmama = nascimentos.length ? desmamas.length / nascimentos.length * 100 : 0;
  const emRecria = todasMatrizes.filter((m) => m.status !== "Vendida" && m.status !== "Morta" && m.categoria === "Novilha" && m.status !== "Descarte").length;
  const vendas = eventos.filter((e) => e.tipo === "venda");
  const receitaTotal = vendas.reduce((s, v) => s + (parseFloat(v.valorTotal) || 0), 0);
  const custoFrete = vendas.reduce((s, v) => s + (parseFloat(v.frete) || 0), 0);
  const iatfs = eventos.filter((e) => e.tipo === "iatf");
  const custoIatf = iatfs.reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const custoDiag = diagnosticos.reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const custoInsumo = eventos.filter((e) => e.tipo === "insumo").reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const custoTotal = custoIatf + custoDiag + custoInsumo + custoFrete;
  const custoPorBezerro = nascimentos.length ? custoTotal / nascimentos.length : 0;
  const margem = receitaTotal - custoTotal;
  const machos = nascimentos.filter((n) => n.sexo === "Macho").length;
  const femeas = nascimentos.filter((n) => n.sexo === "F\xEAmea").length;
  const pesoMedioDesmama = desmamas.length ? desmamas.reduce((s, d) => s + (parseFloat(d.pesoDesmama) || 0), 0) / desmamas.length : 0;
  return {
    total: matrizes.length,
    cheias,
    vazias,
    descartes,
    taxaPrenhez,
    nascimentos: nascimentos.length,
    natimortos,
    taxaPerda,
    desmamas: desmamas.length,
    taxaDesmama,
    emRecria,
    receitaTotal,
    custoTotal,
    custoPorBezerro,
    margem,
    machos,
    femeas,
    pesoMedioDesmama,
    iatfs: iatfs.length,
    diagnosticos: diagnosticos.length,
    vendidas,
    mortas,
    mortes: mortesAtivas.length,
    mortesCrias: mortesAtivas.filter((e) => e.tipoAnimal === "Cria").length
  };
}
function buildResumoRows(kpis, ano) {
  return [
    ["Ano de gest\xE3o", ano === "todos" || !ano ? "todos os anos" : String(ano)],
    ["", ""],
    ["Total de matrizes (hoje)", kpis.total],
    ["Cheias (hoje)", kpis.cheias],
    ["Vazias (hoje)", kpis.vazias],
    ["Descarte (hoje)", kpis.descartes],
    ["Matrizes vendidas (baixa)", kpis.vendidas || 0],
    ["Matrizes mortas (baixa)", kpis.mortas || 0],
    ["Novilhas em recria (hoje)", kpis.emRecria],
    ["Taxa de prenhez do ano (%)", kpis.taxaPrenhez.toFixed(1)],
    ["", ""],
    ["Nascimentos", kpis.nascimentos],
    ["Natimortos", kpis.natimortos],
    ["Taxa de perda ao nascer (%)", kpis.taxaPerda.toFixed(1)],
    ["Mortes de animais (ano)", kpis.mortes || 0],
    ["Mortes de crias (ano)", kpis.mortesCrias || 0],
    ["Nascimentos: machos", kpis.machos],
    ["Nascimentos: f\xEAmeas", kpis.femeas],
    ["Desmamas", kpis.desmamas],
    ["Taxa de desmama (%)", kpis.taxaDesmama.toFixed(1)],
    ["Peso m\xE9dio na desmama (kg)", kpis.pesoMedioDesmama.toFixed(1)],
    ["", ""],
    ["Receita total de vendas (R$)", kpis.receitaTotal.toFixed(2)],
    ["Custo total (R$)", kpis.custoTotal.toFixed(2)],
    ["Custo por bezerro (R$)", kpis.custoPorBezerro.toFixed(2)],
    ["Margem (R$)", kpis.margem.toFixed(2)]
  ];
}
function mapaBrincos(matrizes) {
  return Object.fromEntries(matrizes.map((m) => [m.id, m.brinco]));
}
function nomeTouroEvento(e, touros) {
  if (e.touroId === "__outro__") return e.touroOutro || "";
  const t = (touros || []).find((x) => x.id === e.touroId);
  return t && t.nome || e.touroOutro || "";
}
var JANELA_IATF_DIAS = [250, 320];
function origemDaCria(nasc, eventos, touros) {
  const informado = nomeTouroEvento(nasc, touros);
  if (informado) return { origem: "Informado", pai: informado, iatfData: "", rotulo: informado };
  if (!nasc.matrizId) return { origem: "Sem m\xE3e", pai: "", iatfData: "", rotulo: "M\xE3e n\xE3o informada" };
  if (!nasc.data) return { origem: "Monta", pai: "Monta natural", iatfData: "", rotulo: "Monta natural" };
  const [min, max] = JANELA_IATF_DIAS;
  const dias = (d) => Math.round((new Date(nasc.data) - new Date(d)) / 864e5);
  const candidatos = (eventos || []).filter((e2) => e2.tipo === "iatf" && e2.matrizId === nasc.matrizId && e2.data && dias(e2.data) >= min && dias(e2.data) <= max);
  if (!candidatos.length) return { origem: "Monta", pai: "Monta natural", iatfData: "", rotulo: "Monta natural" };
  candidatos.sort((a, b) => Math.abs(dias(a.data) - PERIODO_GESTACAO_DIAS) - Math.abs(dias(b.data) - PERIODO_GESTACAO_DIAS));
  const e = candidatos[0];
  const nome = nomeTouroEvento(e, touros);
  if (/repasse|monta/i.test(e.tipoServico || "")) {
    return { origem: "Monta", pai: nome || "Monta natural", iatfData: e.data, rotulo: nome ? `Monta \xB7 ${nome}` : "Monta natural" };
  }
  return { origem: "IATF", pai: nome, iatfData: e.data, rotulo: nome ? `IATF \xB7 ${nome}` : "IATF \xB7 touro n\xE3o informado" };
}
var semAcento = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");
var chave = (s) => semAcento(s).toLowerCase().trim();
function acharMatrizPorBrinco(matrizes, brinco) {
  const b = String(brinco ?? "").trim();
  if (!b) return { erro: "brinco da matriz em branco" };
  let achadas = matrizes.filter((m) => String(m.brinco).trim() === b);
  if (!achadas.length && /^\d+$/.test(b)) achadas = matrizes.filter((m) => /^\d+$/.test(String(m.brinco)) && Number(m.brinco) === Number(b));
  if (achadas.length === 1) return { matriz: achadas[0] };
  if (achadas.length > 1) return { erro: `brinco ${b} aparece em mais de uma matriz` };
  return { erro: `matriz ${b} n\xE3o encontrada` };
}
function novoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function camposFaltando(tipo, form) {
  const vazio = (c) => !form[c.key] || typeof form[c.key] === "string" && !form[c.key].trim();
  return (CAMPOS[tipo] || []).filter((c) => c.required && (!c.showIf || c.showIf(form)) && vazio(c));
}
function aplicarLancamento(estado, tipo, form, opcoes) {
  const op = opcoes || {};
  const id = op.id || novoId();
  const now = op.now || (/* @__PURE__ */ new Date()).toISOString();
  const { matrizes, touros, eventos } = estado;
  const out = { eventosNovos: [], matrizesAlteradas: [], tourosNovos: [] };
  let m = matrizes;
  let t = touros;
  let ev = eventos;
  if (tipo === "cadastro") {
    const nova = {
      id,
      brinco: form.brinco,
      categoria: form.categoria || "Novilha",
      raca: form.raca || "",
      lote: form.lote || "",
      dataNascimento: form.dataNascimento || "",
      partosAnteriores: parseInt(form.partosAnteriores) || 0,
      status: form.statusInicial || "Vazia",
      createdAt: now
    };
    m = [...matrizes, nova];
    out.matrizesAlteradas.push(nova);
  } else if (tipo === "touro") {
    const novo = {
      id,
      nome: form.nome,
      raca: form.raca,
      fornecedor: form.fornecedor || "",
      anoAquisicao: form.anoAquisicao || "",
      doses: parseInt(form.doses) || 0,
      custoDose: parseFloat(form.custoDose) || 0,
      observacoes: form.observacoes || "",
      createdAt: now
    };
    t = [...touros, novo];
    out.tourosNovos.push(novo);
  } else if (tipo === "descarte") {
    m = matrizes.map((x) => x.id === form.matrizId ? { ...x, status: "Descarte" } : x);
    const novoEvento = { id, tipo: "descarte", ...form, createdAt: now };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
    const alt = m.find((x) => x.id === form.matrizId);
    if (alt) out.matrizesAlteradas.push(alt);
  } else if (tipo === "diagnostico") {
    const novoStatus = form.resultado === "Prenhe" ? "Cheia" : form.resultado === "Descarte" ? "Descarte" : "Vazia";
    m = matrizes.map((x) => x.id === form.matrizId ? { ...x, status: novoStatus } : x);
    out.eventosNovos.push({ id, tipo: "diagnostico", ...form, createdAt: now });
    if (form.resultado === "Descarte") {
      out.eventosNovos.push({
        id: `${id}-desc`,
        tipo: "descarte",
        matrizId: form.matrizId,
        data: form.data,
        motivo: form.motivo || "Identificado no diagn\xF3stico veterin\xE1rio",
        origemDiagnostico: true,
        createdAt: now
      });
    }
    ev = [...eventos, ...out.eventosNovos];
    const alt = m.find((x) => x.id === form.matrizId);
    if (alt) out.matrizesAlteradas.push(alt);
  } else if (tipo === "nascimento") {
    const novoEvento = { id, tipo: "nascimento", ...form, createdAt: now };
    const eventosNext = [...eventos, novoEvento];
    if (form.matrizId) {
      const partosNaFazenda = eventosNext.filter((e) => e.tipo === "nascimento" && e.matrizId === form.matrizId).length;
      m = matrizes.map((x) => {
        if (x.id !== form.matrizId) return x;
        let categoria = x.categoria;
        if (categoria === "Novilha" && partosNaFazenda >= 1) categoria = "Prim\xEDpara";
        else if (categoria === "Prim\xEDpara" && partosNaFazenda >= 2) categoria = "Mult\xEDpara";
        const atualizada = { ...x, categoria, status: x.status === "Cheia" ? "Vazia" : x.status };
        out.matrizesAlteradas.push(atualizada);
        return atualizada;
      });
    }
    ev = eventosNext;
    out.eventosNovos.push(novoEvento);
  } else if (tipo === "desmama") {
    const nasc = acharCriaPorBrinco(eventos, form.brincoBezerro, form.data);
    const idade = nasc && nasc.data && form.data ? diasEntre(nasc.data, form.data) : "";
    const novoEvento = { id, tipo: "desmama", ...form, idadeDias: form.idadeDias || (idade !== "" && idade >= 0 ? idade : ""), createdAt: now };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
    if (nasc && nasc.sexo === "F\xEAmea") {
      const idNov = idNovilha(nasc.id);
      const jaTem = matrizes.some((x) => x.id === idNov || String(x.brinco).trim() === String(nasc.brincoBezerro).trim());
      if (!jaTem) {
        const nova = {
          id: idNov,
          brinco: String(nasc.brincoBezerro).trim(),
          categoria: "Novilha",
          raca: "",
          lote: "Novilhas",
          dataNascimento: nasc.data || "",
          partosAnteriores: 0,
          status: "Vazia",
          destino: "A definir",
          dataBaixa: "",
          motivoBaixa: "",
          createdAt: now
        };
        m = [...matrizes, nova];
        out.matrizesAlteradas.push(nova);
      }
    }
  } else if (tipo === "morte") {
    const info = infoAnimalMorte(estado, form.brinco);
    const novoEvento = {
      id,
      tipo: "morte",
      data: form.data,
      tipoAnimal: info.achado ? info.tipoAnimal : form.tipoAnimal || "Outro",
      criaId: info.criaId || "",
      matrizId: info.matrizId || "",
      brinco: info.achado ? info.brinco : String(form.brinco ?? "").trim(),
      causa: form.causa,
      observacoes: form.observacoes || "",
      statusAnterior: info.matriz ? info.matriz.status : "",
      anulada: "",
      createdAt: now
    };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
    if (info.matriz) {
      const morta = { ...info.matriz, status: "Morta", dataBaixa: form.data, motivoBaixa: `Morte: ${form.causa}` };
      m = matrizes.map((x) => x.id === morta.id ? morta : x);
      out.matrizesAlteradas.push(morta);
    }
  } else if (tipo === "pesagem") {
    const a = acharAnimal(estado, form.brinco);
    const matrizId = a && a.matriz && a.matriz.id || form.matrizId || "";
    const criaId = a && a.nasc && a.nasc.id || form.criaId || "";
    const brinco = String(form.brinco || a && a.nasc && a.nasc.brincoBezerro || a && a.matriz && a.matriz.brinco || "").trim();
    const novoEvento = {
      id,
      tipo: "pesagem",
      data: form.data,
      criaId,
      matrizId,
      brinco,
      peso: numPeso(form.peso),
      observacoes: form.observacoes || "",
      createdAt: now
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
function normSexo(v) {
  const s = chave(v);
  if (["m", "macho", "boi", "bezerro", "garrote"].includes(s)) return "Macho";
  if (["f", "femea", "bezerra", "novilha"].includes(s)) return "F\xEAmea";
  return "";
}
function normResultadoDiag(v) {
  const s = chave(v);
  if (["prenhe", "prenha", "p", "+", "positivo", "cheia", "gestante"].includes(s)) return "Prenhe";
  if (["vazia", "v", "-", "negativo", "falhada", "falhou"].includes(s)) return "Vazia";
  if (["descarte", "d", "descartar"].includes(s)) return "Descarte";
  return "";
}
function normResultadoParto(v) {
  const s = chave(v);
  if (!s || ["vivo", "viva", "v", "nasceu vivo"].includes(s)) return "Vivo";
  if (["natimorto", "morto", "morta", "n", "nasceu morto"].includes(s)) return "Natimorto";
  return "";
}
function acharTouro(touros, nome) {
  const k = chave(nome);
  if (!k) return null;
  return touros.find((t) => chave(t.nome) === k) || touros.find((t) => chave(t.nome).includes(k)) || null;
}
function itemParaFormulario(item, estado, hoje) {
  const tipo = item.tipo;
  if (!CAMPOS[tipo]) return { erro: `tipo desconhecido: ${tipo}` };
  const f = {};
  const data = parseDataFlex(item.data, hoje);
  const comData = !["cadastro", "touro", "desmama"].includes(tipo) || tipo === "desmama";
  if (comData) {
    if (!data) return { erro: `data inv\xE1lida ou em branco (${item.data ?? ""})` };
    f.data = data;
  }
  const exigeMatriz = ["iatf", "diagnostico", "descarte", "recria"].includes(tipo);
  if (exigeMatriz || tipo === "nascimento" && item.matriz) {
    const r = acharMatrizPorBrinco(estado.matrizes, item.matriz);
    if (r.erro) return { erro: r.erro };
    f.matrizId = r.matriz.id;
    f._matrizBrinco = r.matriz.brinco;
  }
  if (tipo === "nascimento") {
    f.resultadoParto = normResultadoParto(item.resultado);
    if (!f.resultadoParto) return { erro: `resultado do parto n\xE3o entendido (${item.resultado})` };
    if (item.sexo) {
      f.sexo = normSexo(item.sexo);
      if (!f.sexo) return { erro: `sexo n\xE3o entendido (${item.sexo})` };
    }
    if (item.pelagem) f.pelagem = item.pelagem;
    f.tipoParto = item.tipoParto || "Normal";
    if (item.obs) f.observacoes = item.obs;
    if (item.brincoCria) f.brincoBezerro = String(item.brincoCria).trim();
  } else if (tipo === "diagnostico") {
    f.resultado = normResultadoDiag(item.resultado);
    if (!f.resultado) return { erro: `resultado do toque n\xE3o entendido (${item.resultado})` };
    if (item.dg !== void 0 && item.dg !== "" && item.dg !== null) {
      const dg = parseInt(item.dg, 10);
      if (isNaN(dg) || dg < 0 || dg > 300) return { erro: `DG fora do normal (${item.dg})` };
      f.dg = dg;
    }
    if (item.metodo) f.metodo = item.metodo;
    if (item.veterinario) f.veterinario = item.veterinario;
    if (item.motivo) f.motivo = item.motivo;
    if (item.custo) f.custo = item.custo;
  } else if (tipo === "iatf") {
    f.tipoServico = item.tipoServico || "IATF";
    if (item.tentativa) f.numeroServico = item.tentativa;
    const ini = parseDataFlex(item.inicioProtocolo, hoje);
    if (ini) f.dataInicioProtocolo = ini;
    if (item.touro) {
      const t = acharTouro(estado.touros, item.touro);
      if (t) f.touroId = t.id;
      else {
        f.touroId = "__outro__";
        f.touroOutro = String(item.touro);
      }
    }
    if (item.tecnico) f.tecnico = item.tecnico;
    if (item.custo) f.custo = item.custo;
    if (item.obs) f.observacoes = item.obs;
  } else if (tipo === "desmama") {
    if (!item.brincoCria) return { erro: "brinco da cria em branco" };
    f.brincoBezerro = String(item.brincoCria).trim();
    const imd = infoAnimalMorte(estado, f.brincoBezerro);
    if (imd.jaMorto) return { erro: `cria ${f.brincoBezerro} morreu${imd.mortoEm ? ` em ${formatarDataBR(imd.mortoEm)}` : ""}; n\xE3o d\xE1 para desmamar` };
    if (item.peso) f.pesoDesmama = item.peso;
    if (item.idadeDias) f.idadeDias = item.idadeDias;
  } else if (tipo === "descarte") {
    if (item.motivo) f.motivo = item.motivo;
  } else if (tipo === "recria") {
    if (item.peso) f.pesoAtual = item.peso;
    if (item.apta) f.aptaReproducao = item.apta;
    if (item.obs) f.observacoes = item.obs;
  } else if (tipo === "pesagem") {
    const b = String(item.brincoCria ?? item.brinco ?? "").trim();
    if (!b) return { erro: "brinco do animal em branco" };
    if (!acharAnimal(estado, b)) return { erro: `animal ${b} n\xE3o encontrado (nem cria, nem matriz)` };
    const im = infoAnimalMorte(estado, b);
    if (im.jaMorto) return { erro: `animal ${b} morreu${im.mortoEm ? ` em ${formatarDataBR(im.mortoEm)}` : ""}; n\xE3o d\xE1 para lan\xE7ar peso` };
    const p = numPeso(item.peso);
    if (isNaN(p) || p <= 0) return { erro: `peso inv\xE1lido (${item.peso ?? ""})` };
    f.brinco = b;
    f.peso = p;
    if (item.obs) f.observacoes = item.obs;
  } else if (tipo === "morte") {
    const b = String(item.brincoCria ?? item.brinco ?? "").trim();
    if (b) f.brinco = b;
    f.causa = normCausaMorte(item.causa);
    if (!f.causa) return { erro: `causa da morte n\xE3o entendida (${item.causa ?? ""})` };
    if (item.tipoAnimal) {
      f.tipoAnimal = normTipoAnimalMorte(item.tipoAnimal);
      if (!f.tipoAnimal) return { erro: `tipo de animal n\xE3o entendido (${item.tipoAnimal})` };
    }
    if (item.obs) f.observacoes = item.obs;
  } else if (tipo === "insumo") {
    ["produto", "quantidade", "unidade", "custo", "categoriaAnimal"].forEach((k) => {
      if (item[k] !== void 0 && item[k] !== "") f[k] = item[k];
    });
  } else if (tipo === "venda") {
    ["categoria", "animais", "pesoTotal", "valorArroba", "valorTotal", "frete", "comprador"].forEach((k) => {
      if (item[k] !== void 0 && item[k] !== "") f[k] = item[k];
    });
  } else if (tipo === "cadastro") {
    if (!String(item.brinco ?? "").trim()) return { erro: "brinco em branco" };
    f.brinco = String(item.brinco).trim();
    ["categoria", "raca", "lote", "partosAnteriores"].forEach((k) => {
      if (item[k] !== void 0 && item[k] !== "") f[k] = item[k];
    });
    const dn = parseDataFlex(item.dataNascimento, hoje);
    if (dn) f.dataNascimento = dn;
    if (item.status) f.statusInicial = item.status;
  }
  return { form: f };
}
function jaExiste(tipo, form, estado) {
  const { eventos, matrizes } = estado;
  if (tipo === "cadastro") return matrizes.some((m) => String(m.brinco).trim() === String(form.brinco).trim());
  if (tipo === "desmama") {
    const nasc = acharCriaPorBrinco(eventos, form.brincoBezerro, form.data);
    return eventos.some((e) => e.tipo === "desmama" && String(e.brincoBezerro).trim() === String(form.brincoBezerro).trim() && (e.data === form.data || nasc && nasc.data && e.data >= nasc.data && diasEntre(nasc.data, e.data) < 1100));
  }
  if (tipo === "pesagem") {
    const a = acharAnimal(estado, form.brinco);
    const crId = a && a.nasc && a.nasc.id || form.criaId;
    const mzId = a && a.matriz && a.matriz.id || form.matrizId;
    return eventos.some((e) => e.tipo === "pesagem" && e.data === form.data && (crId && e.criaId === crId || mzId && e.matrizId === mzId || !crId && !mzId && String(e.brinco) === String(form.brinco)));
  }
  if (tipo === "nascimento") {
    return eventos.some((e) => e.tipo === "nascimento" && e.data === form.data && (form.matrizId && e.matrizId === form.matrizId || form.brincoBezerro && e.brincoBezerro === form.brincoBezerro));
  }
  if (tipo === "morte") {
    const info = infoAnimalMorte(estado, form.brinco);
    return info.achado && info.jaMorto;
  }
  if (tipo === "diagnostico") return eventos.some((e) => e.tipo === "diagnostico" && e.matrizId === form.matrizId && e.data === form.data);
  if (["iatf", "descarte", "recria"].includes(tipo)) return eventos.some((e) => e.tipo === tipo && e.matrizId === form.matrizId && e.data === form.data);
  return false;
}
function aplicarLote(estado, itens2, opcoes) {
  const op = opcoes || {};
  const hoje = op.hoje || todayISO();
  const now = op.now || (/* @__PURE__ */ new Date()).toISOString();
  let atual = estado;
  const aplicados = [];
  const rejeitados = [];
  const avisos = [];
  const eventosParaGravar = [];
  const matrizesMap = /* @__PURE__ */ new Map();
  const tourosParaGravar = [];
  itens2.forEach((item, indice) => {
    const conv = itemParaFormulario(item, atual, hoje);
    if (conv.erro) {
      rejeitados.push({ indice, item, motivo: conv.erro });
      return;
    }
    const form = conv.form;
    const brincoMae = form._matrizBrinco;
    delete form._matrizBrinco;
    if (item.tipo === "nascimento" && form.sexo && !form.brincoBezerro) {
      const sug = sugerirBrincoBezerro(form.data, form.sexo, atual.eventos);
      if (sug) {
        form.brincoBezerro = sug;
        avisos.push({ indice, aviso: `brinco da cria sugerido: ${sug}` });
      }
    }
    const faltando = camposFaltando(item.tipo, form);
    if (faltando.length) {
      rejeitados.push({ indice, item, motivo: `faltou: ${faltando.map((c) => c.label).join(", ")}` });
      return;
    }
    if (item.tipo === "morte") {
      const v = validarMorte(atual, form, hoje);
      if (v.erros.length) {
        rejeitados.push({ indice, item, motivo: v.erros.join(" ") });
        return;
      }
      v.avisos.forEach((aviso) => avisos.push({ indice, aviso }));
    } else if (!item.forcar && jaExiste(item.tipo, form, atual)) {
      rejeitados.push({ indice, item, motivo: "esse lan\xE7amento j\xE1 existe (mesma matriz/cria e data)" });
      return;
    }
    if (item.tipo === "nascimento" && form.matrizId) {
      const m0 = atual.matrizes.find((x) => x.id === form.matrizId);
      if (m0 && m0.status !== "Cheia") avisos.push({ indice, aviso: `matriz ${m0.brinco} estava ${m0.status}, n\xE3o Cheia; confira se o toque dela foi lan\xE7ado` });
    }
    const r = aplicarLancamento(atual, item.tipo, form, { id: novoId(), now });
    atual = r.estado;
    r.eventosNovos.forEach((e) => eventosParaGravar.push({ tipo: e.tipo, evento: e }));
    r.matrizesAlteradas.forEach((m) => matrizesMap.set(m.id, m));
    r.tourosNovos.forEach((t) => tourosParaGravar.push(t));
    aplicados.push({ indice, item, mae: brincoMae || "", form, eventos: r.eventosNovos, matrizes: r.matrizesAlteradas });
  });
  return {
    estado: atual,
    aplicados,
    rejeitados,
    avisos,
    eventosParaGravar,
    matrizesParaGravar: [...matrizesMap.values()],
    tourosParaGravar
  };
}
var PESO_MATRIZ_PADRAO = 280;
var KG_POR_ARROBA = 15;
var DESTINOS_NOVILHA = ["A definir", "Matriz", "Venda"];
var noPlantel = (m) => m.status !== "Vendida" && m.status !== "Morta" && !(m.categoria === "Novilha" && (m.destino === "A definir" || m.destino === "Venda"));
var TIPOS_ANIMAL_VENDA = ["Bezerro", "Bezerra", "Garrote", "Novilha", "Vaca de descarte", "Vaca velha", "Vaca", "Boi", "Touro", "Outro"];
var idNovilha = (nascId) => `cria-${nascId}`;
function numPeso(v) {
  if (typeof v === "number") return v;
  if (v === null || v === void 0) return NaN;
  const s = String(v).trim().replace(",", ".");
  return s === "" ? NaN : Number(s);
}
var arred = (n, casas) => {
  const f = 10 ** (casas === void 0 ? 1 : casas);
  return Math.round(n * f) / f;
};
function configCompleta(cfg) {
  const c = cfg || {};
  const pos = (v) => {
    const x = numPeso(v);
    return isNaN(x) || x <= 0 ? null : x;
  };
  return { pesoMatriz: pos(c.pesoMatriz) || PESO_MATRIZ_PADRAO, metaPesoMacho: pos(c.metaPesoMacho), metaQtdMacho: pos(c.metaQtdMacho) };
}
var mesmoBrinco = (a, b) => {
  const x = String(a ?? "").trim();
  const y = String(b ?? "").trim();
  if (!x || !y) return false;
  return x === y || /^\d+$/.test(x) && /^\d+$/.test(y) && Number(x) === Number(y);
};
function acharCriaPorBrinco(eventos, brinco, ate) {
  const lista = eventos.filter((e) => e.tipo === "nascimento" && e.resultadoParto !== "Natimorto" && mesmoBrinco(e.brincoBezerro, brinco)).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  if (!lista.length) return null;
  return ate && lista.find((e) => !e.data || e.data <= ate) || lista[0];
}
function acharAnimal(estado, brinco) {
  const b = String(brinco ?? "").trim();
  if (!b) return null;
  const nasc = acharCriaPorBrinco(estado.eventos, b);
  if (nasc) {
    const matriz = estado.matrizes.find((m) => m.id === idNovilha(nasc.id)) || null;
    return { tipo: matriz ? "matriz" : "cria", nasc, matriz };
  }
  const r = acharMatrizPorBrinco(estado.matrizes, b);
  if (r.matriz) return { tipo: "matriz", nasc: null, matriz: r.matriz };
  return null;
}
function ganhoDiario(pontos) {
  if (!pontos || pontos.length < 2) return null;
  const ult = pontos[pontos.length - 1];
  for (let i = pontos.length - 2; i >= 0; i--) {
    const d = diasEntre(pontos[i].data, ult.data);
    if (d >= 7) return (ult.peso - pontos[i].peso) / d;
  }
  return null;
}
function mapaListas(itens2, chaveFn) {
  const mapa = /* @__PURE__ */ new Map();
  itens2.forEach((e) => {
    const k = chaveFn(e);
    if (k === void 0 || k === null || k === "") return;
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(e);
  });
  return mapa;
}
function indicesDeEventos(eventos) {
  return {
    pesPorCria: mapaListas(eventos.filter((e) => e.tipo === "pesagem"), (e) => e.criaId),
    pesPorMatriz: mapaListas(eventos.filter((e) => e.tipo === "pesagem" || e.tipo === "recria"), (e) => e.matrizId),
    desmamas: mapaListas(eventos.filter((e) => e.tipo === "desmama"), (e) => String(e.brincoBezerro ?? "").trim()),
    vendaPorCria: mapaListas(eventos.filter((e) => e.tipo === "vendaitem"), (e) => e.criaId),
    vendaPorMatriz: mapaListas(eventos.filter((e) => e.tipo === "vendaitem"), (e) => e.matrizId),
    mortePorCria: mapaListas(eventos.filter(morteAtiva), (e) => e.criaId),
    mortePorMatriz: mapaListas(eventos.filter(morteAtiva), (e) => e.matrizId)
  };
}
function pontosDePeso(idx, { nasc, matriz }) {
  const vistos = /* @__PURE__ */ new Set();
  const pts = [];
  const add = (id, data, peso, fonte) => {
    const p = numPeso(peso);
    if (!data || isNaN(p) || p <= 0 || vistos.has(id)) return;
    vistos.add(id);
    pts.push({ id, data, peso: p, fonte });
  };
  if (nasc) {
    add(`${nasc.id}-nascer`, nasc.data, nasc.pesoNascer, "Nascimento");
    (idx.pesPorCria.get(nasc.id) || []).forEach((e) => add(e.id, e.data, e.peso, "Pesagem"));
    const brinco = String(nasc.brincoBezerro ?? "").trim();
    const d = (idx.desmamas.get(brinco) || []).filter((x) => x.data >= nasc.data && diasEntre(nasc.data, x.data) < 1100).sort((a, b) => a.data.localeCompare(b.data))[0];
    if (d) add(d.id, d.data, d.pesoDesmama, "Desmama");
  }
  if (matriz) (idx.pesPorMatriz.get(matriz.id) || []).forEach((e) => add(e.id, e.data, e.tipo === "recria" ? e.pesoAtual : e.peso, e.tipo === "recria" ? "Recria" : "Pesagem"));
  pts.sort((a, b) => a.data.localeCompare(b.data) || a.id.localeCompare(b.id));
  const porData = /* @__PURE__ */ new Map();
  pts.filter((x) => x.fonte === "Pesagem").forEach((x) => porData.set(x.data, (porData.get(x.data) || 0) + 1));
  pts.forEach((x) => {
    if (x.fonte === "Pesagem" && porData.get(x.data) > 1) x.vezes = porData.get(x.data);
  });
  return pts;
}
function rotuloSituacao(c) {
  const f = c.sexo === "F\xEAmea";
  return { mamando: "Mamando", desmamado: f ? "Desmamada" : "Desmamado", novilha: "Novilha", matriz: "Virou matriz", vendido: f ? "Vendida" : "Vendido", morto: f ? "Morta" : "Morto" }[c.situacao] || c.situacao;
}
function listarCrias(estado, hoje) {
  hoje = hoje || todayISO();
  const { matrizes, eventos, touros } = estado;
  const idx = indicesDeEventos(eventos);
  const brincos = mapaBrincos(matrizes);
  const matrizPorId = new Map(matrizes.map((m) => [m.id, m]));
  return eventos.filter((e) => e.tipo === "nascimento" && e.resultadoParto !== "Natimorto").map((n) => {
    const novilha = matrizPorId.get(idNovilha(n.id)) || null;
    const pontos = pontosDePeso(idx, { nasc: n, matriz: novilha });
    const ultimo = pontos.length ? pontos[pontos.length - 1] : null;
    const brinco = String(n.brincoBezerro ?? "").trim();
    const desm = (idx.desmamas.get(brinco) || []).filter((x) => x.data >= n.data && diasEntre(n.data, x.data) < 1100).sort((a, b) => a.data.localeCompare(b.data))[0] || null;
    const itensVenda = [...idx.vendaPorCria.get(n.id) || [], ...novilha ? idx.vendaPorMatriz.get(novilha.id) || [] : []];
    const mortes = [...idx.mortePorCria.get(n.id) || [], ...novilha ? idx.mortePorMatriz.get(novilha.id) || [] : []];
    const morte = mortes[0] || null;
    let situacao = "mamando";
    if (morte || novilha && novilha.status === "Morta") situacao = "morto";
    else if (itensVenda.length || novilha && novilha.status === "Vendida") situacao = "vendido";
    else if (novilha) situacao = novilha.destino === "Matriz" ? "matriz" : "novilha";
    else if (desm) situacao = "desmamado";
    const baixa = itensVenda[0] || null;
    const mae = n.matrizId ? matrizPorId.get(n.matrizId) || null : null;
    const maeMorta = !!(mae && mae.status === "Morta");
    return {
      id: n.id,
      nasc: n,
      brinco,
      sexo: n.sexo || "",
      nascData: n.data,
      idadeDias: n.data ? diasEntre(n.data, hoje) : null,
      matrizId: n.matrizId || "",
      maeBrinco: n.matrizId ? brincos[n.matrizId] || "?" : "",
      origem: origemDaCria(n, eventos, touros),
      pelagem: n.pelagem || "",
      pontos,
      pesoAtual: ultimo ? ultimo.peso : null,
      pesoData: ultimo ? ultimo.data : "",
      diasDesdePeso: ultimo ? diasEntre(ultimo.data, hoje) : null,
      gmd: ganhoDiario(pontos),
      situacao,
      desmamaData: desm ? desm.data : "",
      novilha,
      vendaData: baixa ? baixa.data : novilha && novilha.dataBaixa || "",
      ativa: situacao !== "vendido" && situacao !== "morto",
      mortoData: morte ? morte.data : novilha && novilha.status === "Morta" && novilha.dataBaixa || "",
      causaMorte: morte ? morte.causa : "",
      maeMorta,
      maeMortaData: maeMorta ? mae.dataBaixa || "" : "",
      orfa: maeMorta && situacao === "mamando"
    };
  }).sort((a, b) => (b.nascData || "").localeCompare(a.nascData || "") || String(b.brinco).localeCompare(String(a.brinco), "pt-BR", { numeric: true }));
}
function listarNovilhas(estado, cfg, hoje) {
  hoje = hoje || todayISO();
  const c = configCompleta(cfg);
  const { matrizes, eventos } = estado;
  const idx = indicesDeEventos(eventos);
  const nascPorId = new Map(eventos.filter((e) => e.tipo === "nascimento").map((e) => [idNovilha(e.id), e]));
  return matrizes.filter((m) => m.categoria === "Novilha" && DESTINOS_NOVILHA.includes(m.destino) && m.status !== "Vendida" && m.status !== "Morta" && m.status !== "Descarte").map((m) => {
    const nasc = nascPorId.get(m.id) || null;
    const pontos = pontosDePeso(idx, { nasc, matriz: m });
    const ultimo = pontos.length ? pontos[pontos.length - 1] : null;
    const gmd = ganhoDiario(pontos);
    const peso = ultimo ? ultimo.peso : null;
    const nascData = m.dataNascimento || nasc && nasc.data || "";
    const apta = peso !== null && peso >= c.pesoMatriz;
    const faltam = peso !== null && !apta ? arred(c.pesoMatriz - peso) : null;
    return {
      matriz: m,
      brinco: m.brinco,
      nascData,
      idadeDias: nascData ? diasEntre(nascData, hoje) : null,
      destino: m.destino,
      pontos,
      pesoAtual: peso,
      pesoData: ultimo ? ultimo.data : "",
      gmd,
      apta,
      faltam,
      diasParaApta: faltam !== null && gmd > 0 ? Math.ceil(faltam / gmd) : null,
      diasDesdePeso: ultimo ? diasEntre(ultimo.data, hoje) : null
    };
  }).sort((a, b) => (b.pesoAtual ?? -1) - (a.pesoAtual ?? -1) || String(a.brinco).localeCompare(String(b.brinco), "pt-BR", { numeric: true }));
}
function analiseMachos(crias, cfg) {
  const c = configCompleta(cfg);
  const machos = crias.filter((x) => x.sexo === "Macho" && (x.situacao === "mamando" || x.situacao === "desmamado"));
  const comPeso = machos.filter((x) => x.pesoAtual !== null);
  const diasAteAlvo = (x) => {
    if (!c.metaPesoMacho || x.pesoAtual === null) return null;
    if (x.pesoAtual >= c.metaPesoMacho) return 0;
    return x.gmd > 0 ? Math.ceil((c.metaPesoMacho - x.pesoAtual) / x.gmd) : null;
  };
  const linhas = machos.map((x) => ({ cria: x, dias: diasAteAlvo(x), pronto: !!c.metaPesoMacho && x.pesoAtual !== null && x.pesoAtual >= c.metaPesoMacho })).sort((a, b) => (b.cria.pesoAtual ?? -1) - (a.cria.pesoAtual ?? -1) || String(a.cria.brinco).localeCompare(String(b.cria.brinco), "pt-BR", { numeric: true }));
  const prontos = linhas.filter((l) => l.pronto);
  const prox = (n) => linhas.filter((l) => !l.pronto && l.dias !== null && l.dias <= n).length;
  const kgProntos = prontos.reduce((s, l) => s + l.cria.pesoAtual, 0);
  let diasParaMetaQtd = null;
  if (c.metaPesoMacho && c.metaQtdMacho) {
    const ordem = linhas.filter((l) => l.dias !== null).map((l) => l.dias).sort((a, b) => a - b);
    if (ordem.length >= c.metaQtdMacho) diasParaMetaQtd = ordem[c.metaQtdMacho - 1];
  }
  return {
    cfg: c,
    linhas,
    total: machos.length,
    semPeso: machos.length - comPeso.length,
    prontos: prontos.length,
    faltamQtd: c.metaQtdMacho ? Math.max(0, c.metaQtdMacho - prontos.length) : null,
    metaQtdAtingida: c.metaQtdMacho ? prontos.length >= c.metaQtdMacho : null,
    kgProntos: arred(kgProntos),
    pesoMedioProntos: prontos.length ? arred(kgProntos / prontos.length) : null,
    pesoMedio: comPeso.length ? arred(comPeso.reduce((s, x) => s + x.pesoAtual, 0) / comPeso.length) : null,
    prox30: prox(30),
    prox60: prox(60),
    diasParaMetaQtd
  };
}
function avisoDePeso(pontos, peso, data) {
  const p = numPeso(peso);
  if (isNaN(p) || p <= 0) return "Peso inv\xE1lido.";
  if (p < 15 || p > 1200) return `${p} kg parece fora do normal. Confira se o peso est\xE1 certo.`;
  const antes = (pontos || []).filter((x) => x.data <= data && x.fonte !== "Nascimento").pop();
  if (antes) {
    const d = diasEntre(antes.data, data);
    if (d > 0 && p < antes.peso - 5) return `Este peso (${p} kg) \xE9 menor que o anterior (${antes.peso} kg em ${formatarDataBR(antes.data)}). Confira.`;
    if (d >= 1 && p - antes.peso > 15 && (p - antes.peso) / d > 2.5) return `Ganho de ${arred((p - antes.peso) / d, 2)} kg por dia desde ${formatarDataBR(antes.data)}: muito alto. Confira o peso.`;
  }
  return "";
}
function lerListaPesos(texto) {
  const itens2 = [];
  const erros = [];
  String(texto || "").split(/\r?\n/).forEach((linha) => {
    const t = linha.trim();
    if (!t) return;
    const m = t.match(/^(\S+?)(?:\s*[;:=\t]\s*|\s+|\s*,\s+)(\d+(?:[.,]\d+)?)\s*(?:kg)?$/i);
    if (!m) {
      erros.push(t);
      return;
    }
    const peso = numPeso(m[2]);
    if (!(peso > 0)) {
      erros.push(t);
      return;
    }
    itens2.push({ brinco: m[1], peso });
  });
  return { itens: itens2, erros };
}
function infoAnimalVenda(estado, brinco, hoje, crias) {
  const b = String(brinco ?? "").trim();
  if (!b) return { brinco: "", achado: false };
  const lista = crias || listarCrias(estado, hoje);
  const a = acharAnimal(estado, b);
  if (!a) return { brinco: b, achado: false };
  const cria = a.nasc ? lista.find((x) => x.id === a.nasc.id) : null;
  if (a.tipo === "cria" && cria) {
    return {
      brinco: b,
      achado: true,
      origem: "cria",
      criaId: cria.id,
      matrizId: "",
      sexo: cria.sexo,
      tipoSugerido: cria.sexo === "F\xEAmea" ? "Bezerra" : "Bezerro",
      pesoUltimo: cria.pesoAtual,
      pesoData: cria.pesoData,
      jaVendido: cria.situacao === "vendido",
      vendidoEm: cria.vendaData,
      jaMorto: cria.situacao === "morto",
      mortoEm: cria.mortoData,
      descricao: `${cria.sexo || "Cria"} \xB7 ${cria.idadeDias ?? "?"} dias`,
      pontos: cria.pontos
    };
  }
  const m = a.matriz;
  const pts = pontosDePeso(indicesDeEventos(estado.eventos), { nasc: a.nasc, matriz: m });
  const ult = pts.length ? pts[pts.length - 1] : null;
  const nov = m.categoria === "Novilha";
  const itemVendido = estado.eventos.find((e) => e.tipo === "vendaitem" && e.matrizId === m.id) || null;
  return {
    brinco: b,
    achado: true,
    origem: "matriz",
    criaId: a.nasc ? a.nasc.id : "",
    matrizId: m.id,
    sexo: "F\xEAmea",
    tipoSugerido: m.status === "Descarte" ? "Vaca de descarte" : nov ? "Novilha" : "Vaca",
    pesoUltimo: ult ? ult.peso : null,
    pesoData: ult ? ult.data : "",
    jaVendido: m.status === "Vendida" || !!itemVendido,
    vendidoEm: m.dataBaixa || itemVendido && itemVendido.data || "",
    jaMorto: m.status === "Morta",
    mortoEm: m.status === "Morta" ? m.dataBaixa || "" : "",
    descricao: `${m.categoria || "Matriz"}${m.raca ? " \xB7 " + m.raca : ""} \xB7 ${m.status}`,
    pontos: pts
  };
}
function totaisVenda(itens2, valorKg, frete) {
  const validos = (itens2 || []).filter((i) => numPeso(i.peso) > 0);
  const kg = validos.reduce((s, i) => s + numPeso(i.peso), 0);
  const vkg = numPeso(valorKg);
  const valor = vkg > 0 ? arred(kg * vkg, 2) : 0;
  const fr = numPeso(frete) > 0 ? numPeso(frete) : 0;
  const porTipo = /* @__PURE__ */ new Map();
  validos.forEach((i) => {
    const t = i.tipoAnimal || "Sem tipo";
    const x = porTipo.get(t) || { tipo: t, qtd: 0, kg: 0 };
    x.qtd += 1;
    x.kg = arred(x.kg + numPeso(i.peso));
    porTipo.set(t, x);
  });
  return {
    qtd: validos.length,
    kg: arred(kg),
    kgMedio: validos.length ? arred(kg / validos.length) : 0,
    valor,
    frete: fr,
    liquido: arred(valor - fr, 2),
    porTipo: [...porTipo.values()]
  };
}
function validarVenda(estado, form, hoje) {
  const erros = [];
  const avisos = [];
  const crias = listarCrias(estado, hoje);
  if (!form.data) erros.push("Falta a data da venda.");
  if (!String(form.comprador || "").trim()) erros.push("Falta o comprador.");
  if (!(numPeso(form.valorKg) > 0)) erros.push("Falta o valor do kg.");
  const itens2 = (form.itens || []).filter((i) => String(i.brinco ?? "").trim() || String(i.peso ?? "").trim());
  if (!itens2.length) erros.push("Coloque pelo menos um animal na venda.");
  const vistos = /* @__PURE__ */ new Set();
  const linhas = itens2.map((i, n) => {
    const pos = `Linha ${n + 1}`;
    const info = infoAnimalVenda(estado, i.brinco, hoje, crias);
    const peso = numPeso(i.peso);
    if (!(peso > 0)) erros.push(`${pos}${info.brinco ? ` (${info.brinco})` : ""}: falta o peso.`);
    if (!i.tipoAnimal) erros.push(`${pos}${info.brinco ? ` (${info.brinco})` : ""}: falta o tipo de animal.`);
    if (info.brinco) {
      if (vistos.has(info.brinco)) erros.push(`${pos}: o animal ${info.brinco} aparece duas vezes.`);
      vistos.add(info.brinco);
      if (!info.achado) avisos.push(`${pos}: o n\xFAmero ${info.brinco} n\xE3o est\xE1 no sistema. A venda \xE9 registrada, mas sem dar baixa em ningu\xE9m.`);
      else if (info.jaMorto) erros.push(`${pos}: o animal ${info.brinco} morreu${info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : ""}.`);
      else if (info.jaVendido) erros.push(`${pos}: o animal ${info.brinco} j\xE1 foi vendido${info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ""}.`);
    } else if (peso > 0) {
      avisos.push(`${pos}: sem n\xFAmero do animal. A venda \xE9 registrada, mas sem dar baixa em ningu\xE9m.`);
    }
    return { ...i, info, peso };
  });
  return { erros, avisos, linhas };
}
function aplicarVenda(estado, form, opcoes) {
  const op = opcoes || {};
  const hoje = op.hoje || todayISO();
  const now = op.now || (/* @__PURE__ */ new Date()).toISOString();
  const vendaId = op.id || novoId();
  const v = validarVenda(estado, form, hoje);
  if (v.erros.length) return { erro: v.erros.join(" "), erros: v.erros };
  const vkg = numPeso(form.valorKg);
  const tot = totaisVenda(v.linhas.map((l) => ({ tipoAnimal: l.tipoAnimal, peso: l.peso })), vkg, form.frete);
  const resumoTipos = tot.porTipo.map((t) => `${t.qtd} ${t.tipo}`).join(", ");
  const venda = {
    id: vendaId,
    tipo: "venda",
    data: form.data,
    categoria: "Venda por peso",
    animais: `${tot.qtd} animais: ${resumoTipos}`,
    qtd: tot.qtd,
    pesoTotal: tot.kg,
    valorKg: vkg,
    valorArroba: arred(vkg * KG_POR_ARROBA, 2),
    valorTotal: tot.valor,
    frete: tot.frete || "",
    comprador: String(form.comprador).trim(),
    createdAt: now
  };
  const itens2 = v.linhas.map((l, i) => ({
    id: `${vendaId}-${i + 1}`,
    tipo: "vendaitem",
    vendaId,
    data: form.data,
    brinco: l.info.brinco || "",
    tipoAnimal: l.tipoAnimal,
    peso: l.peso,
    valorKg: vkg,
    valor: arred(l.peso * vkg, 2),
    criaId: l.info.criaId || "",
    matrizId: l.info.matrizId || "",
    comprador: venda.comprador,
    createdAt: now
  }));
  const idsBaixa = new Set(itens2.filter((i) => i.matrizId).map((i) => i.matrizId));
  const alteradas = [];
  const matrizes = estado.matrizes.map((m) => {
    if (!idsBaixa.has(m.id)) return m;
    const nova = { ...m, status: "Vendida", destino: "Venda", dataBaixa: form.data, motivoBaixa: "Venda" };
    alteradas.push(nova);
    return nova;
  });
  return {
    estado: { ...estado, matrizes, eventos: [...estado.eventos, venda, ...itens2] },
    eventosNovos: [venda, ...itens2],
    matrizesAlteradas: alteradas,
    venda,
    itens: itens2,
    totais: tot,
    avisos: v.avisos
  };
}
function listarVendas(estado) {
  const itens2 = mapaListas(estado.eventos.filter((e) => e.tipo === "vendaitem"), (e) => e.vendaId);
  return estado.eventos.filter((e) => e.tipo === "venda").map((v) => ({ venda: v, itens: itens2.get(v.id) || [] })).sort((a, b) => (b.venda.data || "").localeCompare(a.venda.data || "") || (b.venda.createdAt || "").localeCompare(a.venda.createdAt || ""));
}
function definirDestinoNovilha(matriz, destino) {
  if (!DESTINOS_NOVILHA.includes(destino)) throw new Error(`destino inv\xE1lido: ${destino}`);
  return { ...matriz, destino };
}
var morteAtiva = (e) => e.tipo === "morte" && String(e.anulada ?? "").trim().toLowerCase() !== "sim";
function normCausaMorte(v) {
  const s = chave(v);
  if (!s) return "";
  const exata = CAUSAS_MORTE.find((c) => chave(c) === s);
  if (exata) return exata;
  if (/cobra/.test(s)) return "Picada de cobra";
  if (/raio|trovao/.test(s)) return "Raio";
  if (/parto/.test(s)) return "Parto dif\xEDcil";
  if (/^(nao sabe|nao se sabe|desconhecida|ignorada)/.test(s)) return "N\xE3o sabe";
  if (/^doenc|^doente/.test(s)) return "Doen\xE7a";
  if (/^acident/.test(s)) return "Acidente";
  if (/^outr/.test(s)) return "Outra";
  return "";
}
function normTipoAnimalMorte(v) {
  const s = chave(v);
  if (!s) return "";
  const exata = TIPOS_ANIMAL_MORTE.find((t) => chave(t) === s);
  if (exata) return exata;
  if (/^(bezerr|cria)/.test(s)) return "Cria";
  if (/^(vaca|matriz)/.test(s)) return "Matriz";
  if (/^(garrote|boi)/.test(s)) return "Boi";
  if (/^novilh/.test(s)) return "Novilha";
  if (/^(touro|reprodutor)/.test(s)) return "Touro";
  if (/^outr/.test(s)) return "Outro";
  return "";
}
function infoAnimalMorte(estado, brinco) {
  const b = String(brinco ?? "").trim();
  if (!b) return { brinco: "", achado: false };
  const a = acharAnimal(estado, b);
  if (!a) return { brinco: b, achado: false };
  const { nasc, matriz } = a;
  const doAnimal = (e) => nasc && e.criaId === nasc.id || matriz && e.matrizId === matriz.id;
  const mortes = estado.eventos.filter((e) => morteAtiva(e) && doAnimal(e));
  const vendas = estado.eventos.filter((e) => e.tipo === "vendaitem" && doAnimal(e));
  const maeBrinco = nasc && nasc.matrizId ? mapaBrincos(estado.matrizes)[nasc.matrizId] || "" : "";
  const tipoAnimal = matriz ? matriz.categoria === "Novilha" ? "Novilha" : "Matriz" : "Cria";
  const descricao = matriz && !nasc ? `${matriz.categoria || "Matriz"} ${b} \xB7 ${matriz.status}` : `${tipoAnimal} ${b} \xB7 ${nasc && nasc.sexo || "sexo ?"}${maeBrinco ? ` \xB7 m\xE3e ${maeBrinco}` : ""}`;
  return {
    brinco: b,
    achado: true,
    tipoAnimal,
    descricao,
    nasc: nasc || null,
    matriz: matriz || null,
    criaId: nasc ? nasc.id : "",
    matrizId: matriz ? matriz.id : "",
    nascData: nasc && nasc.data || matriz && matriz.dataNascimento || "",
    jaMorto: mortes.length > 0 || !!matriz && matriz.status === "Morta",
    mortoEm: mortes[0] && mortes[0].data || matriz && matriz.status === "Morta" && matriz.dataBaixa || "",
    jaVendido: vendas.length > 0 || !!matriz && matriz.status === "Vendida",
    vendidoEm: vendas[0] && vendas[0].data || matriz && matriz.status === "Vendida" && matriz.dataBaixa || ""
  };
}
function validarMorte(estado, form, hoje) {
  const erros = [];
  const avisos = [];
  hoje = hoje || todayISO();
  const brinco = String(form.brinco ?? "").trim();
  const info = infoAnimalMorte(estado, brinco);
  if (!form.data) erros.push("Falta a data da morte.");
  else if (form.data > hoje) erros.push("A data da morte n\xE3o pode ser no futuro.");
  if (!form.causa) erros.push("Falta a causa da morte.");
  else if (!CAUSAS_MORTE.includes(form.causa)) erros.push(`Causa n\xE3o reconhecida (${form.causa}).`);
  if (info.achado) {
    if (info.jaMorto) erros.push(`O animal ${brinco} j\xE1 est\xE1 registrado como morto${info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : ""}.`);
    else if (info.jaVendido) erros.push(`O animal ${brinco} j\xE1 foi vendido${info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ""}.`);
    if (form.data && info.nascData && form.data < info.nascData) erros.push(`A data da morte (${formatarDataBR(form.data)}) \xE9 antes do nascimento do animal (${formatarDataBR(info.nascData)}).`);
  } else {
    if (!form.tipoAnimal) erros.push(brinco ? `O n\xFAmero ${brinco} n\xE3o est\xE1 no sistema. Escolha que animal \xE9 para registrar assim mesmo.` : "Sem n\xFAmero: escolha que animal \xE9.");
    else if (!TIPOS_ANIMAL_MORTE.includes(form.tipoAnimal)) erros.push(`Tipo de animal n\xE3o reconhecido (${form.tipoAnimal}).`);
    else if (brinco) avisos.push(`O n\xFAmero ${brinco} n\xE3o est\xE1 no sistema: a morte \xE9 registrada, mas sem dar baixa em ningu\xE9m.`);
  }
  return { erros, avisos, info };
}
function loteDaMorte(estado, e) {
  const matriz = e.matrizId ? estado.matrizes.find((m) => m.id === e.matrizId) : null;
  if (matriz) return matriz.lote || "Sem lote";
  if (e.criaId) {
    const nasc = estado.eventos.find((x) => x.id === e.criaId);
    const mae = nasc && nasc.matrizId ? estado.matrizes.find((m) => m.id === nasc.matrizId) : null;
    return mae ? mae.lote || "Sem lote" : "Sem lote";
  }
  return "Sem cadastro";
}
var rotuloAnimalMorte = (e) => `${e.tipoAnimal || "Animal"}${e.brinco ? ` ${e.brinco}` : " (sem n\xFAmero)"}`;
function listarMortes(estado) {
  const brincos = mapaBrincos(estado.matrizes);
  return estado.eventos.filter((e) => e.tipo === "morte").map((e) => {
    const nasc = e.criaId ? estado.eventos.find((x) => x.id === e.criaId) : null;
    return {
      e,
      ativa: morteAtiva(e),
      animal: rotuloAnimalMorte(e),
      lote: loteDaMorte(estado, e),
      mae: nasc && nasc.matrizId ? brincos[nasc.matrizId] || "" : ""
    };
  }).sort((a, b) => (b.e.data || "").localeCompare(a.e.data || "") || (b.e.createdAt || "").localeCompare(a.e.createdAt || ""));
}
function postsDeMudancas(mudancas2) {
  const posts = [];
  const porTipo = /* @__PURE__ */ new Map();
  (mudancas2.eventos || []).forEach((m) => {
    if (!porTipo.has(m.tipo)) porTipo.set(m.tipo, []);
    porTipo.get(m.tipo).push({ id: m.id, campos: m.campos });
  });
  porTipo.forEach((itens2, tipo) => posts.push({ action: "atualizarCampos", tipo, itens: itens2 }));
  if ((mudancas2.matrizes || []).length) posts.push({ action: "upsertMatrizes", matrizes: mudancas2.matrizes });
  return posts;
}
function aplicarMudancasNoEstado(estado, mudancas2) {
  const camposPorId = new Map(mudancas2.eventos.map((m) => [m.id, m.campos]));
  const matPorId = new Map(mudancas2.matrizes.map((m) => [m.id, m]));
  return {
    ...estado,
    eventos: estado.eventos.map((e) => camposPorId.has(e.id) ? { ...e, ...camposPorId.get(e.id) } : e),
    matrizes: estado.matrizes.map((m) => matPorId.get(m.id) || m)
  };
}
var CAMPOS_EDITAVEIS_NASCIMENTO = ["data", "matrizId", "resultadoParto", "sexo", "brincoBezerro", "pelagem", "tipoParto", "observacoes"];
function editarNascimento(estado, id, campos) {
  const nasc = estado.eventos.find((e) => e.id === id && e.tipo === "nascimento");
  if (!nasc) return { erro: "N\xE3o achei esse nascimento." };
  const novo = { ...nasc };
  CAMPOS_EDITAVEIS_NASCIMENTO.forEach((k) => {
    if (campos[k] !== void 0) novo[k] = typeof campos[k] === "string" ? campos[k].trim() : campos[k];
  });
  const mudou = CAMPOS_EDITAVEIS_NASCIMENTO.filter((k) => String(novo[k] ?? "") !== String(nasc[k] ?? ""));
  if (!mudou.length) return { erro: "Nada foi alterado." };
  const erros = [];
  const avisos = [];
  if (!novo.data) erros.push("Falta a data do nascimento.");
  if (!["Vivo", "Natimorto"].includes(novo.resultadoParto)) erros.push("Falta o resultado do parto (vivo ou natimorto).");
  if (novo.sexo && !["Macho", "F\xEAmea"].includes(novo.sexo)) erros.push("Sexo inv\xE1lido.");
  [["matrizId", "a m\xE3e"], ["sexo", "o sexo"], ["brincoBezerro", "o brinco da cria"]].forEach(([k, rot]) => {
    if (String(nasc[k] ?? "").trim() && !String(novo[k] ?? "").trim()) erros.push(`N\xE3o d\xE1 para apagar ${rot}; troque por outro valor.`);
  });
  if (novo.matrizId && !estado.matrizes.some((m) => m.id === novo.matrizId)) erros.push("A m\xE3e escolhida n\xE3o est\xE1 no cadastro.");
  const antigo = String(nasc.brincoBezerro ?? "").trim();
  const novoB = String(novo.brincoBezerro ?? "").trim();
  if (mudou.includes("brincoBezerro") && novoB) {
    const outro = estado.eventos.find((e) => e.tipo === "nascimento" && e.id !== id && mesmoBrinco(e.brincoBezerro, novoB) && e.data && novo.data && Math.abs(diasEntre(e.data, novo.data)) < 1100);
    if (outro) erros.push(`O brinco ${novoB} j\xE1 \xE9 de outra cria (nascida em ${formatarDataBR(outro.data)}).`);
  }
  const ligadoA = (e) => e.criaId === id;
  const idNov = idNovilha(id);
  const pesagens = estado.eventos.filter((e) => e.tipo === "pesagem" && ligadoA(e));
  const vendas = estado.eventos.filter((e) => e.tipo === "vendaitem" && ligadoA(e));
  const mortes = estado.eventos.filter((e) => e.tipo === "morte" && ligadoA(e));
  const desmama = antigo ? estado.eventos.filter((e) => e.tipo === "desmama" && mesmoBrinco(e.brincoBezerro, antigo) && e.data && nasc.data && e.data >= nasc.data && diasEntre(nasc.data, e.data) < 1100).sort((a, b) => a.data.localeCompare(b.data))[0] || null : null;
  const novilha = estado.matrizes.find((m) => m.id === idNov) || null;
  if (mudou.includes("resultadoParto") && novo.resultadoParto === "Natimorto" && (pesagens.length || vendas.length || mortes.length || desmama || novilha)) {
    erros.push("Esta cria j\xE1 tem pesagem, desmama, venda ou morte lan\xE7ada; n\xE3o d\xE1 para virar natimorto.");
  }
  if (mudou.includes("sexo") && (desmama || novilha)) {
    erros.push("Esta cria j\xE1 foi desmamada; trocar o sexo agora deixaria o rebanho inconsistente (a novilha \xE9 criada na desmama).");
  }
  if (erros.length) return { erro: erros.join(" "), erros };
  const eventosMud = [{ tipo: "nascimento", id, campos: Object.fromEntries(mudou.map((k) => [k, novo[k] ?? ""])) }];
  const matrizesMud = [];
  if (mudou.includes("brincoBezerro") && antigo && novoB) {
    pesagens.forEach((e) => eventosMud.push({ tipo: "pesagem", id: e.id, campos: { brinco: novoB } }));
    vendas.forEach((e) => eventosMud.push({ tipo: "vendaitem", id: e.id, campos: { brinco: novoB } }));
    mortes.forEach((e) => eventosMud.push({ tipo: "morte", id: e.id, campos: { brinco: novoB } }));
    if (desmama) eventosMud.push({ tipo: "desmama", id: desmama.id, campos: { brincoBezerro: novoB } });
    if (novilha) matrizesMud.push({ ...novilha, brinco: novoB });
  }
  if (mudou.includes("matrizId")) avisos.push("A m\xE3e foi trocada, mas a categoria e o status das vacas n\xE3o foram recalculados. Confira em Rebanho se precisar.");
  if (mudou.includes("sexo") && String(nasc.sexo ?? "").trim() && !mudou.includes("brincoBezerro")) avisos.push("O brinco da cria n\xE3o foi mudado junto com o sexo. Confira se a numera\xE7\xE3o continua certa.");
  if (!String(novo.matrizId ?? "").trim()) avisos.push("Ainda falta informar a m\xE3e.");
  if (!String(novo.sexo ?? "").trim()) avisos.push("Ainda falta informar o sexo.");
  if (!novoB) avisos.push("Ainda falta informar o brinco da cria.");
  const mudancas2 = { eventos: eventosMud, matrizes: matrizesMud };
  const novoEstado = aplicarMudancasNoEstado(estado, mudancas2);
  return { estado: novoEstado, evento: novoEstado.eventos.find((e) => e.id === id), mudancas: mudancas2, avisos };
}
function editarMorte(estado, id, campos, hoje) {
  const ev = estado.eventos.find((e) => e.id === id && e.tipo === "morte");
  if (!ev) return { erro: "N\xE3o achei essa morte." };
  if (!morteAtiva(ev)) return { erro: "Esta morte j\xE1 foi anulada." };
  const semCadastro = !ev.criaId && !ev.matrizId;
  const permitidos = ["data", "causa", "observacoes", ...semCadastro ? ["tipoAnimal", "brinco"] : []];
  const novo = { ...ev };
  permitidos.forEach((k) => {
    if (campos[k] !== void 0) novo[k] = typeof campos[k] === "string" ? campos[k].trim() : campos[k];
  });
  const mudou = permitidos.filter((k) => String(novo[k] ?? "") !== String(ev[k] ?? ""));
  if (!mudou.length) return { erro: "Nada foi alterado." };
  const erros = [];
  hoje = hoje || todayISO();
  if (!novo.data) erros.push("Falta a data da morte.");
  else if (novo.data > hoje) erros.push("A data da morte n\xE3o pode ser no futuro.");
  if (!CAUSAS_MORTE.includes(novo.causa)) erros.push("Falta a causa da morte.");
  if (semCadastro) {
    if (novo.tipoAnimal && !TIPOS_ANIMAL_MORTE.includes(novo.tipoAnimal)) erros.push("Tipo de animal inv\xE1lido.");
    if (!novo.tipoAnimal) erros.push("Escolha que animal \xE9.");
    if (mudou.includes("brinco") && String(novo.brinco ?? "").trim() && acharAnimal(estado, novo.brinco)) {
      erros.push(`O n\xFAmero ${novo.brinco} est\xE1 cadastrado. Anule esta morte e lance de novo para o animal certo.`);
    }
  } else {
    const nasc = ev.criaId ? estado.eventos.find((x) => x.id === ev.criaId) : null;
    const nascData = nasc && nasc.data || "";
    if (novo.data && nascData && novo.data < nascData) erros.push(`A data da morte \xE9 antes do nascimento do animal (${formatarDataBR(nascData)}).`);
  }
  if (erros.length) return { erro: erros.join(" "), erros };
  const eventosMud = [{ tipo: "morte", id, campos: Object.fromEntries(mudou.map((k) => [k, novo[k] ?? ""])) }];
  const matrizesMud = [];
  const matriz = ev.matrizId ? estado.matrizes.find((m) => m.id === ev.matrizId) : null;
  if (matriz && matriz.status === "Morta" && (mudou.includes("data") || mudou.includes("causa"))) {
    matrizesMud.push({ ...matriz, dataBaixa: novo.data, motivoBaixa: `Morte: ${novo.causa}` });
  }
  const mudancas2 = { eventos: eventosMud, matrizes: matrizesMud };
  const novoEstado = aplicarMudancasNoEstado(estado, mudancas2);
  return { estado: novoEstado, evento: novoEstado.eventos.find((e) => e.id === id), mudancas: mudancas2, avisos: [] };
}
function anularMorte(estado, id) {
  const ev = estado.eventos.find((e) => e.id === id && e.tipo === "morte");
  if (!ev) return { erro: "N\xE3o achei essa morte." };
  if (!morteAtiva(ev)) return { erro: "Esta morte j\xE1 foi anulada." };
  const matriz = ev.matrizId ? estado.matrizes.find((m) => m.id === ev.matrizId) : null;
  const matrizesMud = [];
  if (matriz && matriz.status === "Morta") matrizesMud.push({ ...matriz, status: ev.statusAnterior || "Vazia", dataBaixa: "", motivoBaixa: "" });
  const mudancas2 = { eventos: [{ tipo: "morte", id, campos: { anulada: "Sim" } }], matrizes: matrizesMud };
  const novoEstado = aplicarMudancasNoEstado(estado, mudancas2);
  return { estado: novoEstado, evento: novoEstado.eventos.find((e) => e.id === id), mudancas: mudancas2, avisos: [] };
}
var listaBrincos = (arr) => arr.join(", ");
function relatorioPrevisaoParto(matrizes, eventos, hoje) {
  hoje = hoje || todayISO();
  const cheias = linhasPrevisao(matrizes, eventos, "Cheia", hoje, "");
  const atrasadas = cheias.filter((l) => l.dias !== null && l.dias < 0);
  const futuras = cheias.filter((l) => l.dias !== null && l.dias >= 0);
  const semPrev = cheias.filter((l) => l.dias === null);
  const porMes = /* @__PURE__ */ new Map();
  futuras.forEach((l) => {
    const k = l.previsao.slice(0, 7);
    if (!porMes.has(k)) porMes.set(k, []);
    porMes.get(k).push(l.matriz.brinco);
  });
  const linhasMes = [];
  if (atrasadas.length) linhasMes.push({ periodo: "Atrasadas", qtd: atrasadas.length, brincos: listaBrincos(atrasadas.map((l) => l.matriz.brinco)) });
  [...porMes.keys()].sort().forEach((k) => linhasMes.push({ periodo: mesCurto(k), qtd: porMes.get(k).length, brincos: listaBrincos(porMes.get(k)) }));
  if (semPrev.length) linhasMes.push({ periodo: "Sem previs\xE3o", qtd: semPrev.length, brincos: listaBrincos(semPrev.map((l) => l.matriz.brinco)) });
  const prox30 = futuras.filter((l) => l.dias <= 30).length;
  return {
    titulo: "Previs\xE3o de parto",
    resumo: [
      { rotulo: "Cheias", valor: cheias.length },
      { rotulo: "Atrasadas", valor: atrasadas.length },
      { rotulo: "Pr\xF3ximos 30 dias", valor: prox30 },
      { rotulo: "Sem previs\xE3o calculada", valor: semPrev.length }
    ],
    secoes: [
      {
        titulo: "Partos previstos por m\xEAs",
        nota: `C\xE1lculo: toque menos os dias de gesta\xE7\xE3o (DG) mais ${PERIODO_GESTACAO_DIAS} dias; sem DG, a IATF mais recente mais ${PERIODO_GESTACAO_DIAS}. "Atrasadas" s\xE3o as que j\xE1 passaram da data: confira se pariram.`,
        colunas: [{ k: "periodo", label: "Per\xEDodo" }, { k: "qtd", label: "Vacas", align: "right", mono: true }, { k: "brincos", label: "Brincos", mono: true }],
        linhas: linhasMes
      },
      {
        titulo: "Vaca por vaca",
        colunas: [
          { k: "brinco", label: "Brinco", mono: true },
          { k: "categoria", label: "Categoria" },
          { k: "previsao", label: "Previs\xE3o", mono: true },
          { k: "dias", label: "Dias", align: "right", mono: true }
        ],
        linhas: cheias.map((l) => ({
          brinco: l.matriz.brinco,
          categoria: [l.matriz.categoria, l.matriz.raca].filter(Boolean).join(" \xB7 "),
          previsao: l.previsao ? formatarDataBR(l.previsao) : "\u2014",
          dias: l.dias === null ? "\u2014" : l.dias
        }))
      }
    ]
  };
}
function relatorioNascimentos(matrizes, eventos, touros, ano) {
  const nascs = filtrarPorAno(eventos, ano).filter((e) => e.tipo === "nascimento");
  const mapa = mapaBrincos(matrizes);
  const vivos = nascs.filter((n) => n.resultadoParto !== "Natimorto");
  const machos = vivos.filter((n) => n.sexo === "Macho").length;
  const femeas = vivos.filter((n) => n.sexo === "F\xEAmea").length;
  const semSexo = vivos.length - machos - femeas;
  const natimortos = nascs.length - vivos.length;
  const contar = (lista) => {
    const v = lista.filter((n) => n.resultadoParto !== "Natimorto");
    return {
      machos: v.filter((n) => n.sexo === "Macho").length,
      femeas: v.filter((n) => n.sexo === "F\xEAmea").length,
      semSexo: v.filter((n) => n.sexo !== "Macho" && n.sexo !== "F\xEAmea").length,
      natimortos: lista.length - v.length,
      total: lista.length
    };
  };
  const meses = /* @__PURE__ */ new Map();
  nascs.forEach((n) => {
    const k = (n.data || "").slice(0, 7) || "sem-data";
    if (!meses.has(k)) meses.set(k, []);
    meses.get(k).push(n);
  });
  const linhasMes = [...meses.keys()].sort().map((k) => ({ periodo: k === "sem-data" ? "Sem data" : mesCurto(k), ...contar(meses.get(k)) }));
  if (linhasMes.length) linhasMes.push({ periodo: "Total", ...contar(nascs) });
  const pais = /* @__PURE__ */ new Map();
  nascs.forEach((n) => {
    const nome = origemDaCria(n, eventos, touros).rotulo;
    if (!pais.has(nome)) pais.set(nome, []);
    pais.get(nome).push(n);
  });
  const linhasPai = [...pais.entries()].sort((a, b) => b[1].length - a[1].length).map(([nome, lista]) => ({ pai: nome, ...contar(lista) }));
  const colSexo = [
    { k: "machos", label: "Machos", align: "right", mono: true },
    { k: "femeas", label: "F\xEAmeas", align: "right", mono: true },
    { k: "semSexo", label: "Sem sexo", align: "right", mono: true },
    { k: "natimortos", label: "Natim.", align: "right", mono: true },
    { k: "total", label: "Total", align: "right", mono: true }
  ];
  const pct = (x, base) => base ? `${Math.round(x / base * 100)}%` : "\u2014";
  return {
    titulo: `Nascimentos por sexo \xB7 ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: "Nascimentos", valor: nascs.length },
      { rotulo: "Machos", valor: `${machos} (${pct(machos, machos + femeas)})` },
      { rotulo: "F\xEAmeas", valor: `${femeas} (${pct(femeas, machos + femeas)})` },
      { rotulo: "Natimortos", valor: natimortos },
      { rotulo: "Vivos sem sexo anotado", valor: semSexo }
    ],
    secoes: [
      { titulo: "Por m\xEAs", colunas: [{ k: "periodo", label: "M\xEAs" }, ...colSexo], linhas: linhasMes },
      {
        titulo: "Por origem e pai (IATF ou monta)",
        nota: "O pai sai do cruzamento do parto com o IATF da m\xE3e (de 250 a 320 dias antes). Sem IATF compat\xEDvel, a cria \xE9 de monta natural.",
        colunas: [{ k: "pai", label: "Origem / pai" }, ...colSexo],
        linhas: linhasPai
      },
      {
        titulo: "Lan\xE7amentos",
        colunas: [
          { k: "data", label: "Data", mono: true },
          { k: "mae", label: "M\xE3e", mono: true },
          { k: "cria", label: "Cria", mono: true },
          { k: "sexo", label: "Sexo" },
          { k: "resultado", label: "Resultado" }
        ],
        linhas: [...nascs].sort((a, b) => (b.data || "").localeCompare(a.data || "")).map((n) => ({
          data: formatarDataBR(n.data),
          mae: mapa[n.matrizId] || "\u2014",
          cria: n.brincoBezerro || "\u2014",
          sexo: n.sexo || "\u2014",
          resultado: n.resultadoParto || ""
        }))
      }
    ]
  };
}
function gestacoesDe(matrizId, eventos) {
  const diags = eventos.filter((e) => e.tipo === "diagnostico" && e.matrizId === matrizId && e.resultado === "Prenhe" && e.data).sort((a, b) => a.data.localeCompare(b.data));
  const partos = eventos.filter((e) => e.tipo === "nascimento" && e.matrizId === matrizId && e.data).map((e) => e.data).sort();
  const iatfs = eventos.filter((e) => e.tipo === "iatf" && e.matrizId === matrizId && e.data).map((e) => e.data).sort();
  const grupos = [];
  diags.forEach((d) => {
    const g = grupos[grupos.length - 1];
    const mesmaGestacao = g && diasEntre(g.ultima, d.data) <= 150 && !partos.some((p) => p > g.ultima && p <= d.data);
    if (mesmaGestacao) {
      g.diags.push(d);
      g.ultima = d.data;
    } else grupos.push({ diags: [d], primeira: d.data, ultima: d.data });
  });
  return grupos.map((g) => {
    const comDG = [...g.diags].reverse().find((d) => d.dg !== "" && d.dg !== null && d.dg !== void 0 && !isNaN(parseInt(d.dg, 10)));
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
  const v = nums.filter((n) => n !== null && n !== void 0 && !isNaN(n));
  return v.length ? Math.round(v.reduce((s, n) => s + n, 0) / v.length) : null;
}
function relatorioMelhoresVacas(matrizes, eventos, ano) {
  const noPeriodo = (d) => ano === "todos" || anoDe(d) === ano;
  const linhas = matrizes.map((m) => {
    const servicos = eventos.filter((e) => e.tipo === "iatf" && e.matrizId === m.id && noPeriodo(e.data)).length;
    const gest = gestacoesDe(m.id, eventos).filter((g) => noPeriodo(g.primeira));
    const partos = eventos.filter((e) => e.tipo === "nascimento" && e.matrizId === m.id && noPeriodo(e.data)).length;
    const datasPartos = eventos.filter((e) => e.tipo === "nascimento" && e.matrizId === m.id && e.data).map((e) => e.data).sort();
    const intervalos = [];
    for (let i = 1; i < datasPartos.length; i++) {
      const d = diasEntre(datasPartos[i - 1], datasPartos[i]);
      if (d > 200 && d < 900) intervalos.push(d);
    }
    const prenhezes = gest.length;
    return {
      m,
      servicos,
      prenhezes,
      partos,
      taxa: servicos ? Math.min(100, Math.round(prenhezes / servicos * 100)) : null,
      diasAbertos: mediaOuNull(gest.map((g) => g.diasAbertos)),
      ipp: mediaOuNull(intervalos)
    };
  }).filter((l) => l.servicos > 0 || l.prenhezes > 0);
  linhas.sort((a, b) => b.prenhezes - a.prenhezes || (b.taxa ?? -1) - (a.taxa ?? -1) || (a.diasAbertos ?? 9999) - (b.diasAbertos ?? 9999) || String(a.m.brinco).localeCompare(String(b.m.brinco), "pt-BR", { numeric: true }));
  const colunas = [
    { k: "pos", label: "#", align: "right", mono: true },
    { k: "brinco", label: "Brinco", mono: true },
    { k: "servicos", label: "IATF", align: "right", mono: true },
    { k: "prenhezes", label: "Prenhez", align: "right", mono: true },
    { k: "taxa", label: "Taxa", align: "right", mono: true },
    { k: "diasAbertos", label: "Dias abertos", align: "right", mono: true },
    { k: "ipp", label: "Interv. partos", align: "right", mono: true },
    { k: "partos", label: "Partos", align: "right", mono: true }
  ];
  const fmt = (l, i) => ({
    pos: i + 1,
    brinco: l.m.brinco,
    servicos: l.servicos,
    prenhezes: l.prenhezes,
    taxa: l.taxa === null ? "\u2014" : `${l.taxa}%`,
    diasAbertos: l.diasAbertos === null ? "\u2014" : l.diasAbertos,
    ipp: l.ipp === null ? "\u2014" : l.ipp,
    partos: l.partos
  });
  const comPrenhez = linhas.filter((l) => l.prenhezes > 0);
  const observar = linhas.filter((l) => l.servicos >= 2 && l.prenhezes === 0);
  return {
    titulo: `Melhores vacas em prenhez \xB7 ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: "Vacas com IATF ou toque no per\xEDodo", valor: linhas.length },
      { rotulo: "Com prenhez confirmada", valor: comPrenhez.length },
      { rotulo: "Para observar (2+ IATF, sem prenhez)", valor: observar.length }
    ],
    secoes: [
      {
        titulo: "Ranking",
        nota: 'Ordem: mais prenhezes, depois melhor taxa (prenhez por IATF), depois menos dias abertos (do parto at\xE9 a concep\xE7\xE3o). "Interv. partos" usa todo o hist\xF3rico lan\xE7ado. Tra\xE7o (\u2014) = faltou informa\xE7\xE3o para calcular.',
        colunas,
        linhas: comPrenhez.slice(0, 25).map(fmt)
      },
      {
        titulo: "Para observar",
        nota: "Duas ou mais IATF no per\xEDodo e nenhuma prenhez confirmada. Vale rever com o veterin\xE1rio.",
        colunas: colunas.filter((c) => ["pos", "brinco", "servicos", "prenhezes", "partos"].includes(c.k)),
        linhas: observar.map(fmt)
      }
    ]
  };
}
function relatorioIATF(matrizes, eventos, touros, ano) {
  const todas = eventos.filter((e) => e.tipo === "iatf" && e.data);
  const doAno = filtrarPorAno(todas, ano);
  const resultadoDe = (iatf) => {
    const proximas = todas.filter((x) => x.matrizId === iatf.matrizId && x.data > iatf.data).map((x) => x.data).sort();
    const limite = proximas.length ? proximas[0] : addDias(iatf.data, 150);
    const diags = eventos.filter((e) => e.tipo === "diagnostico" && e.matrizId === iatf.matrizId && e.data > iatf.data && e.data <= limite).sort((a, b) => a.data.localeCompare(b.data));
    if (diags.some((d) => d.resultado === "Prenhe")) return "Prenhe";
    if (diags.length) return "Vazia";
    return "Sem diagn\xF3stico";
  };
  const itens2 = doAno.map((e) => ({ e, r: resultadoDe(e) }));
  const contar = (lista) => {
    const prenhes = lista.filter((x) => x.r === "Prenhe").length;
    const vazias = lista.filter((x) => x.r === "Vazia").length;
    const sem = lista.length - prenhes - vazias;
    return { total: lista.length, prenhes, vazias, sem, taxa: prenhes + vazias ? `${Math.round(prenhes / (prenhes + vazias) * 100)}%` : "\u2014" };
  };
  const agrupar = (chaveFn) => {
    const mapa = /* @__PURE__ */ new Map();
    itens2.forEach((x) => {
      const k = chaveFn(x.e);
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k).push(x);
    });
    return mapa;
  };
  const cols = [
    { k: "total", label: "IATF", align: "right", mono: true },
    { k: "prenhes", label: "Prenhes", align: "right", mono: true },
    { k: "vazias", label: "Vazias", align: "right", mono: true },
    { k: "sem", label: "Sem diag.", align: "right", mono: true },
    { k: "taxa", label: "Taxa", align: "right", mono: true }
  ];
  const porData = agrupar((e) => e.data);
  const porTent = agrupar((e) => e.numeroServico || "N\xE3o informada");
  const porTouro = agrupar((e) => nomeTouroEvento(e, touros) || "Touro/s\xEAmen n\xE3o informado");
  const porTipo = agrupar((e) => e.tipoServico || "IATF");
  const total = contar(itens2);
  const custo = doAno.reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  return {
    titulo: `IATF \xB7 ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: "IATF / coberturas", valor: total.total },
      { rotulo: "Prenhes", valor: total.prenhes },
      { rotulo: "Vazias", valor: total.vazias },
      { rotulo: "Sem diagn\xF3stico ainda", valor: total.sem },
      { rotulo: "Taxa de prenhez (diagnosticadas)", valor: total.taxa },
      ...custo > 0 ? [{ rotulo: "Custo lan\xE7ado (R$)", valor: custo.toFixed(2) }] : []
    ],
    secoes: [
      {
        titulo: "Por data (lote de IATF)",
        nota: "Resultado = o que o toque seguinte registrou para aquela vaca (at\xE9 a pr\xF3xima IATF dela, no m\xE1ximo 150 dias).",
        colunas: [{ k: "chave", label: "Data", mono: true }, ...cols],
        linhas: [...porData.keys()].sort().map((k) => ({ chave: formatarDataBR(k), ...contar(porData.get(k)) }))
      },
      { titulo: "Por tentativa", colunas: [{ k: "chave", label: "Tentativa" }, ...cols], linhas: [...porTent.keys()].sort().map((k) => ({ chave: k, ...contar(porTent.get(k)) })) },
      { titulo: "Por touro / s\xEAmen", colunas: [{ k: "chave", label: "Touro / s\xEAmen" }, ...cols], linhas: [...porTouro.keys()].sort().map((k) => ({ chave: k, ...contar(porTouro.get(k)) })) },
      { titulo: "Por tipo de servi\xE7o", colunas: [{ k: "chave", label: "Tipo" }, ...cols], linhas: [...porTipo.keys()].sort().map((k) => ({ chave: k, ...contar(porTipo.get(k)) })) }
    ]
  };
}
function relatorioSituacaoVacas(todasMatrizes, eventos, hoje) {
  hoje = hoje || todayISO();
  const matrizes = todasMatrizes.filter(noPlantel);
  const brincosDe = (arr) => listaBrincos(arr.map((m) => m.brinco));
  const contarPor = (campo, vazioRotulo) => {
    const mapa = /* @__PURE__ */ new Map();
    matrizes.forEach((m) => {
      const k = m[campo] || vazioRotulo;
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k).push(m);
    });
    return [...mapa.entries()].sort((a, b) => b[1].length - a[1].length).map(([k, lista]) => ({
      chave: k,
      total: lista.length,
      cheias: lista.filter((m) => m.status === "Cheia").length,
      vazias: lista.filter((m) => m.status === "Vazia").length,
      descarte: lista.filter((m) => m.status === "Descarte").length
    }));
  };
  const cols = [
    { k: "total", label: "Total", align: "right", mono: true },
    { k: "cheias", label: "Cheias", align: "right", mono: true },
    { k: "vazias", label: "Vazias", align: "right", mono: true },
    { k: "descarte", label: "Descarte", align: "right", mono: true }
  ];
  const cheias = matrizes.filter((m) => m.status === "Cheia");
  const vazias = matrizes.filter((m) => m.status === "Vazia");
  const descarte = matrizes.filter((m) => m.status === "Descarte");
  const prev = (m) => previsaoPartoInfo(m.id, eventos);
  const cheiasEmDia = cheias.filter((m) => {
    const p = prev(m);
    return p && p.data && diasEntre(hoje, p.data) >= 0;
  });
  const cheiasAtrasadas = cheias.filter((m) => {
    const p = prev(m);
    return p && p.data && diasEntre(hoje, p.data) < 0;
  });
  const cheiasSemPrev = cheias.filter((m) => {
    const p = prev(m);
    return !p || !p.data;
  });
  const diasDesdeParto = (m) => {
    const u = ultimoPartoDe(m.id, eventos);
    return u ? diasEntre(u, hoje) : null;
  };
  const vaziasRecentes = vazias.filter((m) => {
    const d = diasDesdeParto(m);
    return d !== null && d <= 60;
  });
  const vaziasACobrir = vazias.filter((m) => {
    const d = diasDesdeParto(m);
    return d !== null && d > 60;
  });
  const vaziasSemParto = vazias.filter((m) => diasDesdeParto(m) === null);
  const semHistorico = matrizes.filter((m) => m.status !== "Descarte" && !eventos.some((e) => (e.tipo === "iatf" || e.tipo === "diagnostico") && e.matrizId === m.id));
  const bucket = (rotulo, arr) => ({ situacao: rotulo, qtd: arr.length, brincos: brincosDe(arr) });
  return {
    titulo: "Situa\xE7\xE3o das vacas \xB7 hoje",
    resumo: [
      { rotulo: "Matrizes", valor: matrizes.length },
      { rotulo: "Cheias", valor: cheias.length },
      { rotulo: "Vazias", valor: vazias.length },
      { rotulo: "Descarte", valor: descarte.length },
      { rotulo: "Sem IATF nem toque lan\xE7ados", valor: semHistorico.length }
    ],
    secoes: [
      {
        titulo: "Situa\xE7\xE3o reprodutiva",
        nota: 'Vazia "a cobrir" = mais de 60 dias desde o \xFAltimo parto lan\xE7ado. Vazia sem parto lan\xE7ado = a vaca n\xE3o tem nascimento registrado no sistema.',
        colunas: [{ k: "situacao", label: "Situa\xE7\xE3o" }, { k: "qtd", label: "Vacas", align: "right", mono: true }, { k: "brincos", label: "Brincos", mono: true }],
        linhas: [
          bucket("Cheia, parto no prazo", cheiasEmDia),
          bucket("Cheia, parto atrasado (conferir)", cheiasAtrasadas),
          bucket("Cheia, sem previs\xE3o calculada", cheiasSemPrev),
          bucket("Vazia, parto recente (at\xE9 60 dias)", vaziasRecentes),
          bucket("Vazia, a cobrir (mais de 60 dias do parto)", vaziasACobrir),
          bucket("Vazia, sem parto lan\xE7ado", vaziasSemParto),
          bucket("Descarte", descarte)
        ]
      },
      { titulo: "Por categoria", colunas: [{ k: "chave", label: "Categoria" }, ...cols], linhas: contarPor("categoria", "Sem categoria") },
      { titulo: "Por ra\xE7a", colunas: [{ k: "chave", label: "Ra\xE7a" }, ...cols], linhas: contarPor("raca", "Ra\xE7a n\xE3o informada") },
      { titulo: "Por lote", colunas: [{ k: "chave", label: "Lote" }, ...cols], linhas: contarPor("lote", "Sem lote") }
    ]
  };
}
var idadeTxt = (dias) => dias === null || dias === void 0 ? "\u2014" : dias < 60 ? `${dias} d` : `${arred(dias / 30.4, 1)} m`;
var kg1 = (n) => n === null || n === void 0 ? "\u2014" : String(arred(n, 1));
var gmdTxt = (g) => g === null || g === void 0 ? "\u2014" : `${arred(g, 2)}`;
function relatorioCrias(estado, cfg, ano, hoje) {
  hoje = hoje || todayISO();
  const crias = listarCrias(estado, hoje).filter((c) => ano === "todos" || anoDe(c.nascData) === ano);
  const sit = ["mamando", "desmamado", "novilha", "matriz", "vendido", "morto"];
  const linhasSit = ["Macho", "F\xEAmea", ""].map((sx) => {
    const l = crias.filter((c) => (c.sexo || "") === sx);
    const o = { sexo: sx || "Sem sexo", total: l.length };
    sit.forEach((k) => {
      o[k] = l.filter((c) => c.situacao === k).length;
    });
    return o;
  }).filter((o) => o.total > 0);
  if (linhasSit.length) {
    const t = { sexo: "Total", total: crias.length };
    sit.forEach((k) => {
      t[k] = crias.filter((c) => c.situacao === k).length;
    });
    linhasSit.push(t);
  }
  const faixas = [["0 a 90 dias", 0, 90], ["91 a 180 dias", 91, 180], ["181 a 270 dias", 181, 270], ["271 a 365 dias", 271, 365], ["mais de 365 dias", 366, 99999]];
  const ativas = crias.filter((c) => c.ativa && c.pesoAtual !== null && c.idadeDias !== null);
  const linhasFaixa = faixas.map(([rot, a, b]) => {
    const l = ativas.filter((c) => c.idadeDias >= a && c.idadeDias <= b);
    const med = (sx) => {
      const x = l.filter((c) => c.sexo === sx);
      return x.length ? `${kg1(x.reduce((s, c) => s + c.pesoAtual, 0) / x.length)} (${x.length})` : "\u2014";
    };
    return { faixa: rot, machos: med("Macho"), femeas: med("F\xEAmea") };
  });
  const an = analiseMachos(listarCrias(estado, hoje), cfg);
  const nov = listarNovilhas(estado, cfg, hoje);
  const comPeso = crias.filter((c) => c.ativa && c.pesoAtual !== null).length;
  return {
    titulo: `Crias e pesos \xB7 ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: "Crias vivas (nascimentos)", valor: crias.length },
      { rotulo: "Ainda no rebanho", valor: crias.filter((c) => c.ativa).length },
      { rotulo: "Com pelo menos uma pesagem", valor: comPeso },
      { rotulo: an.cfg.metaPesoMacho ? `Machos a partir de ${an.cfg.metaPesoMacho} kg` : "Machos no peso alvo", valor: an.cfg.metaPesoMacho ? an.prontos : "meta n\xE3o definida" },
      { rotulo: `Novilhas a partir de ${an.cfg.pesoMatriz} kg`, valor: nov.filter((n) => n.apta).length }
    ],
    secoes: [
      {
        titulo: "Situa\xE7\xE3o das crias",
        colunas: [
          { k: "sexo", label: "Sexo" },
          { k: "mamando", label: "Mamando", align: "right", mono: true },
          { k: "desmamado", label: "Desmam.", align: "right", mono: true },
          { k: "novilha", label: "Novilhas", align: "right", mono: true },
          { k: "matriz", label: "Matriz", align: "right", mono: true },
          { k: "vendido", label: "Vendidas", align: "right", mono: true },
          { k: "morto", label: "Mortas", align: "right", mono: true },
          { k: "total", label: "Total", align: "right", mono: true }
        ],
        linhas: linhasSit
      },
      {
        titulo: "Peso m\xE9dio por idade (\xFAltimo peso de cada cria no rebanho)",
        nota: "Em cada c\xE9lula: peso m\xE9dio em kg e, entre par\xEAnteses, quantos animais pesados entram na m\xE9dia.",
        colunas: [{ k: "faixa", label: "Idade" }, { k: "machos", label: "Machos", align: "right", mono: true }, { k: "femeas", label: "F\xEAmeas", align: "right", mono: true }],
        linhas: linhasFaixa
      },
      {
        titulo: "Machos para venda",
        nota: an.cfg.metaPesoMacho ? `Peso alvo ${an.cfg.metaPesoMacho} kg${an.cfg.metaQtdMacho ? ` \xB7 quantidade alvo ${an.cfg.metaQtdMacho}` : ""}. "Dias" \xE9 uma proje\xE7\xE3o pelo ganho di\xE1rio recente.` : "Defina o peso alvo em Crias > Para vender.",
        colunas: [
          { k: "brinco", label: "Brinco", mono: true },
          { k: "idade", label: "Idade", align: "right", mono: true },
          { k: "peso", label: "Peso (kg)", align: "right", mono: true },
          { k: "gmd", label: "kg/dia", align: "right", mono: true },
          { k: "dias", label: "Dias p/ alvo", align: "right", mono: true },
          { k: "mae", label: "M\xE3e", mono: true }
        ],
        linhas: an.linhas.map((l) => ({
          brinco: l.cria.brinco || "\u2014",
          idade: idadeTxt(l.cria.idadeDias),
          peso: kg1(l.cria.pesoAtual),
          gmd: gmdTxt(l.cria.gmd),
          dias: l.pronto ? "pronto" : l.dias === null ? "\u2014" : l.dias,
          mae: l.cria.maeBrinco || "\u2014"
        }))
      },
      {
        titulo: "Novilhas em recria",
        nota: `A partir de ${an.cfg.pesoMatriz} kg a novilha est\xE1 apta a virar matriz.`,
        colunas: [
          { k: "brinco", label: "Brinco", mono: true },
          { k: "idade", label: "Idade", align: "right", mono: true },
          { k: "peso", label: "Peso (kg)", align: "right", mono: true },
          { k: "gmd", label: "kg/dia", align: "right", mono: true },
          { k: "apta", label: "Situa\xE7\xE3o" },
          { k: "destino", label: "Destino" }
        ],
        linhas: nov.map((n) => ({
          brinco: n.brinco,
          idade: idadeTxt(n.idadeDias),
          peso: kg1(n.pesoAtual),
          gmd: gmdTxt(n.gmd),
          apta: n.pesoAtual === null ? "sem peso" : n.apta ? "apta" : `faltam ${n.faltam} kg`,
          destino: n.destino
        }))
      }
    ]
  };
}
function relatorioVendas(estado, ano) {
  const vendas = listarVendas(estado).filter((v) => ano === "todos" || anoDe(v.venda.data) === ano);
  const todosItens = vendas.flatMap((v) => v.itens);
  const kgItens = todosItens.reduce((s, i) => s + (numPeso(i.peso) || 0), 0);
  const receita = vendas.reduce((s, v) => s + (parseFloat(v.venda.valorTotal) || 0), 0);
  const kgVendas = vendas.reduce((s, v) => s + (parseFloat(v.venda.pesoTotal) || 0), 0);
  const agrupar = (chaveFn) => {
    const mapa = /* @__PURE__ */ new Map();
    todosItens.forEach((i) => {
      const k = chaveFn(i) || "N\xE3o informado";
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k).push(i);
    });
    return [...mapa.entries()].map(([k, l]) => ({
      chave: k,
      qtd: l.length,
      kg: kg1(l.reduce((s, i) => s + (numPeso(i.peso) || 0), 0)),
      valor: arred(l.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0), 2).toFixed(2)
    }));
  };
  const colAgr = [{ k: "qtd", label: "Animais", align: "right", mono: true }, { k: "kg", label: "Kg", align: "right", mono: true }, { k: "valor", label: "Valor (R$)", align: "right", mono: true }];
  return {
    titulo: `Vendas por peso \xB7 ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: "Vendas", valor: vendas.length },
      { rotulo: "Animais vendidos (com n\xFAmero)", valor: todosItens.length },
      { rotulo: "Peso vendido (kg)", valor: kg1(kgVendas || kgItens) },
      { rotulo: "Receita (R$)", valor: receita.toFixed(2) },
      { rotulo: "Valor m\xE9dio do kg (R$)", valor: kgVendas ? (receita / kgVendas).toFixed(2) : "\u2014" }
    ],
    secoes: [
      { titulo: "Por tipo de animal", colunas: [{ k: "chave", label: "Tipo" }, ...colAgr], linhas: agrupar((i) => i.tipoAnimal).sort((a, b) => b.qtd - a.qtd) },
      { titulo: "Por comprador", colunas: [{ k: "chave", label: "Comprador" }, ...colAgr], linhas: agrupar((i) => i.comprador).sort((a, b) => b.qtd - a.qtd) },
      {
        titulo: "Vendas",
        colunas: [
          { k: "data", label: "Data", mono: true },
          { k: "comprador", label: "Comprador" },
          { k: "qtd", label: "Animais", align: "right", mono: true },
          { k: "kg", label: "Kg", align: "right", mono: true },
          { k: "vkg", label: "R$/kg", align: "right", mono: true },
          { k: "total", label: "Total (R$)", align: "right", mono: true }
        ],
        linhas: vendas.map(({ venda: v, itens: itens2 }) => ({
          data: formatarDataBR(v.data),
          comprador: v.comprador || "\u2014",
          qtd: v.qtd || itens2.length || "\u2014",
          kg: v.pesoTotal ? kg1(parseFloat(v.pesoTotal)) : "\u2014",
          vkg: v.valorKg ? Number(v.valorKg).toFixed(2) : "\u2014",
          total: v.valorTotal ? Number(v.valorTotal).toFixed(2) : "\u2014"
        }))
      }
    ]
  };
}
function relatorioMortes(estado, ano) {
  const { eventos } = estado;
  const noAno = (d) => ano === "todos" || anoDe(d) === ano;
  const mortes = listarMortes(estado).filter((x) => x.ativa && noAno(x.e.data));
  const grupo = (e) => ["Cria", "Novilha", "Matriz"].includes(e.tipoAnimal) ? e.tipoAnimal : "Outros";
  const nascs = eventos.filter((e) => e.tipo === "nascimento" && noAno(e.data));
  const vivos = nascs.filter((e) => e.resultadoParto !== "Natimorto").length;
  const criasMortas = mortes.filter((x) => grupo(x.e) === "Cria").length;
  const contar = (lista) => ({
    total: lista.length,
    crias: lista.filter((x) => grupo(x.e) === "Cria").length,
    novilhas: lista.filter((x) => grupo(x.e) === "Novilha").length,
    matrizes: lista.filter((x) => grupo(x.e) === "Matriz").length,
    outros: lista.filter((x) => grupo(x.e) === "Outros").length
  });
  const colGrupo = [
    { k: "total", label: "Total", align: "right", mono: true },
    { k: "crias", label: "Crias", align: "right", mono: true },
    { k: "novilhas", label: "Novilhas", align: "right", mono: true },
    { k: "matrizes", label: "Matrizes", align: "right", mono: true },
    { k: "outros", label: "Outros", align: "right", mono: true }
  ];
  const agrupar = (chaveFn) => {
    const mapa = /* @__PURE__ */ new Map();
    mortes.forEach((x) => {
      const k = chaveFn(x) || "N\xE3o informado";
      if (!mapa.has(k)) mapa.set(k, []);
      mapa.get(k).push(x);
    });
    return mapa;
  };
  const comTotal = (mapa, ordenar) => {
    const linhas = [...mapa.entries()].map(([k, l]) => ({ chave: k, ...contar(l) }));
    linhas.sort(ordenar || ((a, b) => b.total - a.total || String(a.chave).localeCompare(String(b.chave), "pt-BR")));
    if (linhas.length) linhas.push({ chave: "Total", ...contar(mortes) });
    return linhas;
  };
  const porCausa = agrupar((x) => x.e.causa);
  const topCausa = [...porCausa.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const pct = criasMortas && vivos ? `${Math.round(criasMortas / vivos * 100)}% (${criasMortas} de ${vivos})` : vivos ? `0% (0 de ${vivos})` : "\u2014";
  return {
    titulo: `Mortalidade \xB7 ${rotuloAno(ano)}`,
    resumo: [
      { rotulo: "Mortes lan\xE7adas", valor: mortes.length },
      { rotulo: "Crias", valor: criasMortas },
      { rotulo: "Novilhas e matrizes", valor: mortes.filter((x) => ["Novilha", "Matriz"].includes(grupo(x.e))).length },
      { rotulo: "Outros animais", valor: mortes.filter((x) => grupo(x.e) === "Outros").length },
      { rotulo: "Crias mortas / nascidas vivas", valor: pct },
      { rotulo: "Natimortos (lan\xE7ados no nascimento)", valor: nascs.length - vivos },
      { rotulo: "Causa mais frequente", valor: topCausa ? `${topCausa[0]} (${topCausa[1].length})` : "\u2014" }
    ],
    secoes: [
      {
        titulo: "Por causa",
        nota: "Conta s\xF3 as mortes lan\xE7adas na aba Morte (anuladas n\xE3o entram). Natimortos ficam no lan\xE7amento de nascimento.",
        colunas: [{ k: "chave", label: "Causa" }, ...colGrupo],
        linhas: comTotal(porCausa)
      },
      {
        titulo: "Por tipo de animal",
        colunas: [{ k: "chave", label: "Animal" }, { k: "total", label: "Mortes", align: "right", mono: true }],
        linhas: [...agrupar((x) => x.e.tipoAnimal).entries()].map(([k, l]) => ({ chave: k, total: l.length })).sort((a, b) => b.total - a.total)
      },
      {
        titulo: "Por m\xEAs",
        colunas: [{ k: "chave", label: "M\xEAs" }, ...colGrupo],
        linhas: (() => {
          const mapa = agrupar((x) => (x.e.data || "").slice(0, 7) || "sem-data");
          const linhas = [...mapa.keys()].sort().map((k) => ({ chave: k === "sem-data" ? "Sem data" : mesCurto(k), ...contar(mapa.get(k)) }));
          if (linhas.length) linhas.push({ chave: "Total", ...contar(mortes) });
          return linhas;
        })()
      },
      {
        titulo: "Por lote",
        nota: 'Para cria, vale o lote da m\xE3e. Animal sem cadastro aparece como "Sem cadastro".',
        colunas: [{ k: "chave", label: "Lote" }, ...colGrupo],
        linhas: comTotal(agrupar((x) => x.lote))
      },
      {
        titulo: "Lan\xE7amentos",
        colunas: [
          { k: "data", label: "Data", mono: true },
          { k: "animal", label: "Animal" },
          { k: "causa", label: "Causa" },
          { k: "lote", label: "Lote" },
          { k: "mae", label: "M\xE3e", mono: true },
          { k: "obs", label: "Observa\xE7\xE3o" }
        ],
        linhas: mortes.map((x) => ({
          data: formatarDataBR(x.e.data),
          animal: x.animal,
          causa: x.e.causa || "\u2014",
          lote: x.lote,
          mae: x.mae || "\u2014",
          obs: x.e.observacoes || ""
        }))
      }
    ]
  };
}
var RELATORIOS = [
  { id: "previsao", titulo: "Previs\xE3o de parto", porAno: false },
  { id: "nascimentos", titulo: "Nascimentos por sexo", porAno: true },
  { id: "melhores", titulo: "Melhores vacas em prenhez", porAno: true },
  { id: "iatf", titulo: "IATF", porAno: true },
  { id: "situacao", titulo: "Situa\xE7\xE3o das vacas", porAno: false },
  { id: "crias", titulo: "Crias e pesos", porAno: true },
  { id: "vendas", titulo: "Vendas por peso", porAno: true },
  { id: "mortes", titulo: "Mortalidade", porAno: true }
];
function montarRelatorio(id, { matrizes, touros, eventos, config }, ano, hoje) {
  if (id === "crias") return relatorioCrias({ matrizes, touros, eventos }, config, ano, hoje);
  if (id === "vendas") return relatorioVendas({ matrizes, touros, eventos }, ano);
  if (id === "mortes") return relatorioMortes({ matrizes, touros, eventos }, ano);
  if (id === "previsao") return relatorioPrevisaoParto(matrizes, eventos, hoje);
  if (id === "nascimentos") return relatorioNascimentos(matrizes, eventos, touros, ano);
  if (id === "melhores") return relatorioMelhoresVacas(matrizes, eventos, ano);
  if (id === "iatf") return relatorioIATF(matrizes, eventos, touros, ano);
  return relatorioSituacaoVacas(matrizes, eventos, hoje);
}
function linhasPlanilha(tipo, { matrizes, touros, eventos, config, todosEventos }) {
  const brincoMap = mapaBrincos(matrizes);
  const nomeTouro = (e) => nomeTouroEvento(e, touros);
  if (tipo === "crias") {
    return listarCrias({ matrizes, touros, eventos: todosEventos || eventos }).map((c) => ({
      "Brinco": c.brinco,
      "Sexo": c.sexo,
      "Nascimento": formatarDataBR(c.nascData),
      "Idade (dias)": c.idadeDias ?? "",
      "M\xE3e": c.maeBrinco,
      "Origem / pai": c.origem.rotulo,
      "Situa\xE7\xE3o": rotuloSituacao(c),
      "\xDAltimo peso (kg)": c.pesoAtual ?? "",
      "Data do peso": formatarDataBR(c.pesoData),
      "Ganho (kg/dia)": c.gmd === null ? "" : arred(c.gmd, 2),
      "Desmama": formatarDataBR(c.desmamaData),
      "Baixa (venda)": formatarDataBR(c.vendaData),
      "Morte em": formatarDataBR(c.mortoData),
      "Causa da morte": c.causaMorte || "",
      "\xD3rf\xE3 (m\xE3e morreu)": c.orfa ? "Sim" : ""
    }));
  }
  if (tipo === "pesagem") {
    return eventos.filter((e) => e.tipo === "pesagem").map((e) => ({
      "Data": formatarDataBR(e.data),
      "Brinco": e.brinco || "",
      "Peso (kg)": e.peso,
      "Observa\xE7\xF5es": e.observacoes || ""
    }));
  }
  if (tipo === "vendaitem") {
    return eventos.filter((e) => e.tipo === "vendaitem").map((e) => ({
      "Data": formatarDataBR(e.data),
      "N\xFAmero": e.brinco || "",
      "Tipo de animal": e.tipoAnimal || "",
      "Peso (kg)": e.peso,
      "R$/kg": e.valorKg,
      "Valor (R$)": e.valor,
      "Comprador": e.comprador || ""
    }));
  }
  if (tipo === "matrizes") {
    return matrizes.map((m) => ({
      "Brinco": m.brinco,
      "Categoria": m.categoria,
      "Ra\xE7a": m.raca || "",
      "Lote": m.lote || "",
      "Data Nasc.": formatarDataBR(m.dataNascimento) || "",
      "Status": m.status,
      "Destino": m.destino || "",
      "Baixa em": formatarDataBR(m.dataBaixa) || "",
      "Partos (Fazenda)": eventos.filter((e) => e.tipo === "nascimento" && e.matrizId === m.id).length,
      "Partos Ant.": m.partosAnteriores || 0,
      "\xDAltimo Parto": formatarDataBR(ultimoPartoDe(m.id, eventos)) || "",
      "N\xBA Cria": numeroCriaUltimoParto(m.id, eventos)
    }));
  }
  if (tipo === "touros") {
    return touros.map((t) => {
      const usadas = eventos.filter((e) => e.tipo === "iatf" && e.touroId === t.id).length;
      const adquiridas = parseInt(t.doses) || 0;
      return {
        "Nome": t.nome,
        "Ra\xE7a": t.raca,
        "Fornecedor": t.fornecedor || "",
        "Ano": t.anoAquisicao || "",
        "Doses Adq.": adquiridas,
        "Doses Usadas": usadas,
        "Doses Rest.": adquiridas ? adquiridas - usadas : "",
        "Custo/Dose (R$)": t.custoDose || "",
        "Observa\xE7\xF5es": t.observacoes || ""
      };
    });
  }
  const evs = eventos.filter((e) => e.tipo === tipo);
  if (tipo === "nascimento") {
    return evs.map((e) => ({
      "Data": formatarDataBR(e.data),
      "Matriz": brincoMap[e.matrizId] || "",
      "Resultado": e.resultadoParto || "",
      "Sexo": e.sexo || "",
      "Peso (kg)": e.pesoNascer || "",
      "Brinco Bezerro": e.brincoBezerro || "",
      "Pelagem": e.pelagem || "",
      "Pai": nomeTouro(e),
      "Tipo Parto": e.tipoParto || "",
      "Observa\xE7\xF5es": e.observacoes || ""
    }));
  }
  if (tipo === "desmama") {
    return evs.map((e) => ({ "Data": formatarDataBR(e.data), "Brinco Bezerro": e.brincoBezerro || "", "Peso (kg)": e.pesoDesmama || "", "Idade (dias)": e.idadeDias || "" }));
  }
  if (tipo === "recria") {
    return evs.map((e) => ({ "Data": formatarDataBR(e.data), "Novilha": brincoMap[e.matrizId] || "", "Peso Atual (kg)": e.pesoAtual || "", "Apta Reprodu\xE7\xE3o": e.aptaReproducao || "", "Observa\xE7\xF5es": e.observacoes || "" }));
  }
  if (tipo === "iatf") {
    return evs.map((e) => ({
      "Data": formatarDataBR(e.data),
      "Matriz": brincoMap[e.matrizId] || "",
      "Tipo": e.tipoServico || "",
      "N\xBA Tent.": e.numeroServico || "",
      "In\xEDcio Protocolo": formatarDataBR(e.dataInicioProtocolo) || "",
      "Touro/S\xEAmen": nomeTouro(e),
      "T\xE9cnico": e.tecnico || "",
      "Custo (R$)": e.custo || "",
      "Observa\xE7\xF5es": e.observacoes || ""
    }));
  }
  if (tipo === "diagnostico") {
    return evs.map((e) => ({
      "Data": formatarDataBR(e.data),
      "Matriz": brincoMap[e.matrizId] || "",
      "Resultado": e.resultado || "",
      "M\xE9todo": e.metodo || "",
      "DG (dias)": e.dg || "",
      "Veterin\xE1rio": e.veterinario || "",
      "Custo (R$)": e.custo || "",
      "Motivo (se descarte)": e.motivo || ""
    }));
  }
  if (tipo === "venda") {
    return evs.map((e) => ({
      "Data": formatarDataBR(e.data),
      "Categoria": e.categoria || "",
      "Animais": e.animais || "",
      "Qtd": e.qtd || "",
      "Peso Total (kg)": e.pesoTotal || "",
      "Valor kg (R$)": e.valorKg || "",
      "Valor Arroba (R$)": e.valorArroba || "",
      "Valor Total (R$)": e.valorTotal || "",
      "Frete/Comiss\xE3o (R$)": e.frete || "",
      "Comprador": e.comprador || ""
    }));
  }
  if (tipo === "insumo") {
    return evs.map((e) => ({ "Data": formatarDataBR(e.data), "Produto": e.produto || "", "Quantidade": e.quantidade || "", "Unidade": e.unidade || "", "Custo (R$)": e.custo || "", "Categoria Animal": e.categoriaAnimal || "" }));
  }
  if (tipo === "morte") {
    return evs.map((e) => ({
      "Data": formatarDataBR(e.data),
      "Animal": e.tipoAnimal || "",
      "Brinco": e.brinco || "",
      "Causa": e.causa || "",
      "Observa\xE7\xE3o": e.observacoes || "",
      "Status anterior": e.statusAnterior || "",
      "Anulada": e.anulada || ""
    }));
  }
  if (tipo === "descarte") {
    return evs.map((e) => ({
      "Data": formatarDataBR(e.data),
      "Matriz": brincoMap[e.matrizId] || "",
      "Motivo": e.motivo || "",
      "Origem": e.origemDiagnostico ? "Diagn\xF3stico veterin\xE1rio" : "Lan\xE7amento manual"
    }));
  }
  return [];
}
var ABAS_EXCEL = [
  ["Matrizes", "matrizes"],
  ["Crias", "crias"],
  ["Nascimentos", "nascimento"],
  ["Pesagens", "pesagem"],
  ["Desmama", "desmama"],
  ["Recria", "recria"],
  ["IATF", "iatf"],
  ["Diagn\xF3sticos", "diagnostico"],
  ["Vendas", "venda"],
  ["Animais vendidos", "vendaitem"],
  ["Insumos", "insumo"],
  ["Descartes", "descarte"],
  ["Mortes", "morte"],
  ["Touros", "touros"]
];
function idadeMesesDias(nascISO, refISO) {
  if (!nascISO || !refISO || refISO < nascISO) return null;
  const [y1, m1, d1] = nascISO.split("-").map(Number);
  const [y2, m2, d2] = refISO.split("-").map(Number);
  let meses = (y2 - y1) * 12 + (m2 - m1);
  if (d2 < d1) meses -= 1;
  const base = addMeses(nascISO, meses);
  const dias = diasEntre(base, refISO);
  return { meses, dias, totalDias: diasEntre(nascISO, refISO), texto: textoMesesDias(meses, dias) };
}
function textoMesesDias(meses, dias) {
  const m = meses === 1 ? "1 m\xEAs" : `${meses} meses`;
  const d = dias === 1 ? "1 dia" : `${dias} dias`;
  if (!meses) return d;
  if (!dias) return m;
  return `${m} e ${d}`;
}
function addMeses(iso, meses) {
  const [y, m, d] = iso.split("-").map(Number);
  const alvo = new Date(Date.UTC(y, m - 1 + meses, 1));
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimo));
  return alvo.toISOString().slice(0, 10);
}
function diasDeMesesDias(nascISO, meses, dias) {
  const m = parseInt(meses, 10) || 0;
  const d = parseInt(dias, 10) || 0;
  if (nascISO) return diasEntre(nascISO, addDias(addMeses(nascISO, m), d));
  return m * 30 + d;
}
function fichaAnimal(estado, brinco, ref, crias) {
  const info = infoAnimalVenda(estado, brinco, ref, crias);
  if (!info.achado) return { ...info, mesmaData: [] };
  const a = acharAnimal(estado, brinco);
  const nasc = a && a.nasc;
  const m = a && a.matriz;
  const nascData = nasc && nasc.data || m && m.dataNascimento || "";
  const maeId = nasc && nasc.matrizId;
  const mae = maeId ? estado.matrizes.find((x) => x.id === maeId) : null;
  const pesagens = (info.pontos || []).filter((p) => p.fonte === "Pesagem");
  const anteriores = (info.pontos || []).filter((p) => p.data < ref && p.fonte !== "Nascimento");
  const desm = nasc ? estado.eventos.find((e) => e.tipo === "desmama" && mesmoBrinco(e.brincoBezerro, nasc.brincoBezerro) && e.data >= nasc.data) : null;
  return {
    ...info,
    sexo: info.sexo || nasc && nasc.sexo || "",
    categoria: m ? m.categoria : "Cria",
    nascData,
    idade: nascData ? idadeMesesDias(nascData, ref) : null,
    maeBrinco: mae ? String(mae.brinco) : maeId ? "?" : "",
    jaPesado: (info.pontos || []).some((p) => p.fonte !== "Nascimento"),
    ultimoPeso: (() => {
      const l = (info.pontos || []).filter((p) => p.fonte !== "Nascimento");
      return l.length ? l[l.length - 1] : null;
    })(),
    pesoAnterior: anteriores.length ? anteriores[anteriores.length - 1] : null,
    mesmaData: pesagens.filter((p) => p.data === ref),
    desmamaData: desm ? desm.data : ""
  };
}
function relatorioPesagemDia(estado, data, hoje) {
  const crias = listarCrias(estado, hoje);
  const evs = estado.eventos.filter((e) => (e.tipo === "pesagem" || e.tipo === "desmama" && numPeso(e.pesoDesmama) > 0) && e.data === data);
  const porAnimal = /* @__PURE__ */ new Map();
  evs.forEach((e) => {
    const brinco = String(e.tipo === "desmama" ? e.brincoBezerro : e.brinco || "").trim();
    const k = e.criaId || e.matrizId || brinco;
    if (!porAnimal.has(k)) porAnimal.set(k, { brinco, lista: [] });
    porAnimal.get(k).lista.push(e);
  });
  const linhas = [];
  porAnimal.forEach(({ brinco, lista }) => {
    const f = fichaAnimal(estado, brinco, data, crias);
    const vezes = lista.length;
    lista.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || "")).forEach((e) => {
      const peso = numPeso(e.tipo === "desmama" ? e.pesoDesmama : e.peso);
      const ant = f.pesoAnterior;
      const dias = ant ? diasEntre(ant.data, data) : null;
      linhas.push({
        brinco: brinco || "\u2014",
        sexo: f.sexo || "\u2014",
        idade: f.idade ? f.idade.texto : "\u2014",
        nasc: f.nascData ? formatarDataBR(f.nascData) : "\u2014",
        mae: f.maeBrinco || "\u2014",
        peso,
        pesoTxt: `${String(peso).replace(".", ",")} kg`,
        anterior: ant ? `${String(ant.peso).replace(".", ",")} kg em ${formatarDataBR(ant.data)}` : "primeira pesagem",
        ganho: ant && dias > 0 ? `${((peso - ant.peso) / dias).toFixed(2).replace(".", ",")} kg/dia` : "\u2014",
        obs: [e.tipo === "desmama" ? "Desmama" : "", vezes > 1 ? `PESADO ${vezes}x NESTA DATA` : ""].filter(Boolean).join(" \xB7 "),
        vezes
      });
    });
  });
  linhas.sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), "pt-BR", { numeric: true }));
  const pesos = linhas.map((l) => l.peso).filter((p) => p > 0);
  const media = (arr) => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null;
  const fmtMedia = (arr) => {
    const v = media(arr);
    return v === null ? "\u2014" : `${v.toFixed(1).replace(".", ",")} kg`;
  };
  const dup = [...new Set(linhas.filter((l) => l.vezes > 1).map((l) => l.brinco))];
  return {
    titulo: `Pesagem de ${formatarDataBR(data)}`,
    resumo: [
      { rotulo: "Pesagens", valor: linhas.length },
      { rotulo: "Animais", valor: porAnimal.size },
      { rotulo: "Peso total", valor: `${pesos.reduce((s, x) => s + x, 0).toLocaleString("pt-BR")} kg` },
      { rotulo: "Peso m\xE9dio", valor: fmtMedia(pesos) },
      { rotulo: "M\xE9dia dos machos", valor: fmtMedia(linhas.filter((l) => l.sexo === "Macho").map((l) => l.peso)) },
      { rotulo: "M\xE9dia das f\xEAmeas", valor: fmtMedia(linhas.filter((l) => l.sexo === "F\xEAmea").map((l) => l.peso)) },
      { rotulo: "Pesados 2x nesta data", valor: dup.length ? dup.join(", ") : "nenhum" }
    ],
    secoes: [{
      titulo: "Animais pesados",
      nota: dup.length ? `Aten\xE7\xE3o: ${dup.join(", ")} aparece(m) mais de uma vez nesta data. Verifique a duplicidade.` : "",
      colunas: [
        { k: "brinco", label: "Brinco", mono: true },
        { k: "sexo", label: "Sexo" },
        { k: "idade", label: "Idade" },
        { k: "nasc", label: "Nascimento", mono: true },
        { k: "mae", label: "M\xE3e", mono: true },
        { k: "pesoTxt", label: "Peso", align: "right", mono: true },
        { k: "anterior", label: "Peso anterior" },
        { k: "ganho", label: "Ganho", align: "right", mono: true },
        { k: "obs", label: "Obs." }
      ],
      linhas
    }]
  };
}
function aplicarPendentes(dados, itensFila) {
  let { matrizes, touros, eventos, config } = dados;
  const idsEv = new Set(eventos.map((e) => e.id));
  const addEv = (tipo, ev) => {
    if (!ev || !ev.id || idsEv.has(ev.id)) return;
    idsEv.add(ev.id);
    eventos = [...eventos, { ...ev, tipo: ev.tipo || tipo }];
  };
  const upM = (m) => {
    if (!m || !m.id) return;
    matrizes = matrizes.some((x) => x.id === m.id) ? matrizes.map((x) => x.id === m.id ? { ...x, ...m } : x) : [...matrizes, m];
  };
  (itensFila || []).forEach(({ payload: p }) => {
    if (!p) return;
    if (p.action === "appendEvento") addEv(p.tipo, p.evento);
    else if (p.action === "appendEventos") (p.itens || []).forEach((it) => addEv(it.tipo, it.evento));
    else if (p.action === "upsertMatriz") upM(p.matriz);
    else if (p.action === "upsertMatrizes") (p.matrizes || []).forEach(upM);
    else if (p.action === "appendTouro") {
      if (p.touro && !touros.some((t) => t.id === p.touro.id)) touros = [...touros, p.touro];
    } else if (p.action === "setConfig") config = { ...config || {}, ...p.config || {} };
    else if (p.action === "atualizarCampos") {
      const mapa = new Map((p.itens || []).map((it) => [it.id, it.campos]));
      eventos = eventos.map((e) => mapa.has(e.id) && e.tipo === p.tipo ? { ...e, ...mapa.get(e.id) } : e);
    }
  });
  return { ...dados, matrizes, touros, eventos, config };
}

// src/estilos.js
var CSS = `
:root{
  --bg:#131B16; --s1:#1C2620; --s2:#243029; --line:#33423A; --line2:#2B382F;
  --tx:#EFEADD; --mut:#A9B5AA; --amber:#E0A458; --amber-bg:rgba(224,164,88,.14);
  --green:#8DBB78; --late:#F0937A; --late-bg:rgba(240,147,122,.14); --blue:#8FB4C9;
  --disp:'Newsreader',Georgia,'Times New Roman',serif;
  --body:'Instrument Sans',system-ui,-apple-system,'Segoe UI',sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--tx);font-family:var(--body);-webkit-text-size-adjust:100%}
button,input,select,textarea{font-family:inherit;color:inherit}
button{cursor:pointer}
button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:2px solid var(--amber);outline-offset:2px}
.num{font-family:var(--mono);font-variant-numeric:tabular-nums}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* ---- estrutura ---- */
.app{min-height:100vh;display:flex}
.side{display:none}
.main{flex:1;min-width:0;padding-bottom:calc(84px + env(safe-area-inset-bottom))}
.wrap{max-width:1000px;margin:0 auto;padding:0 16px}
.topbar{position:sticky;top:0;z-index:20;background:rgba(19,27,22,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.topbar .in{max-width:1000px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:10px}
.brand{display:flex;flex-direction:column;line-height:1.05;min-width:0;flex:1}
.brand small{font:600 10.5px var(--mono);letter-spacing:.14em;color:var(--amber);text-transform:uppercase}
.brand b{font:600 21px var(--disp);letter-spacing:.005em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 10px;border-radius:6px;border:1px solid var(--line);background:var(--s1);color:var(--tx);font:600 12.5px var(--mono);letter-spacing:.04em}
.chip select{appearance:none;-webkit-appearance:none;background:transparent;border:none;font:600 12.5px var(--mono);color:inherit;padding:0 2px;height:100%;cursor:pointer}
.chip select option{background:var(--s1);color:var(--tx)}
.chip.lock{width:40px;justify-content:center;padding:0}
.chip.on{border-color:var(--amber);color:var(--amber)}
.chip.fila-off{border-color:var(--amber);color:var(--amber);background:var(--amber-bg)}
.chip.fila-erro{border-color:var(--late);color:var(--late);background:var(--late-bg)}
.lado-fila{display:none}
@media (min-width:900px){.lado-fila{display:flex;justify-content:flex-end;max-width:1000px;margin:12px auto 0;padding:0 16px}}
.ficha-rapida{border:1px solid var(--line);border-left:3px solid var(--green);border-radius:6px;background:var(--s2);padding:9px 12px;margin:8px 0 12px;font-size:13.5px;line-height:1.5}
.ficha-rapida b{font:600 15px var(--mono)}
.ficha-rapida .lin{display:flex;flex-wrap:wrap;gap:4px 14px;color:var(--mut)}
.ficha-rapida .lin span b{font:600 13.5px var(--body);color:var(--tx)}
.ficha-rapida.ruim{border-left-color:var(--late)}
.ficha-rapida.atencao{border-left-color:var(--amber)}
.tag2x{display:inline-block;font:700 11px var(--mono) !important;padding:1px 6px;border-radius:4px;background:var(--amber);color:#1B140A !important;margin-left:6px;vertical-align:middle;letter-spacing:.03em}
.idade-md{display:grid;grid-template-columns:1fr 1fr;gap:10px}


.bnav{position:fixed;left:0;right:0;bottom:0;z-index:30;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;height:calc(64px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:var(--s1);border-top:1px solid var(--line)}
.bnav button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:none;background:transparent;color:var(--mut);font:600 10.5px var(--mono);letter-spacing:.07em;text-transform:uppercase;border-top:3px solid transparent;margin-top:-1px;min-width:0}
.bnav button[aria-current=page]{color:var(--amber);border-top-color:var(--amber);background:var(--bg)}
.bnav svg{width:21px;height:21px}
.bnav.mini button{font-size:9.5px;letter-spacing:.02em}
.sel-row .two b{white-space:nowrap}
.sel-row .two span{font-size:13px;line-height:1.25}

.banner-teste{background:var(--amber);color:#1B140A;font:600 12.5px var(--body);padding:8px 16px;display:flex;gap:10px;align-items:center;justify-content:center;text-align:center;flex-wrap:wrap}
.banner-teste button{border:1.5px solid #1B140A;background:transparent;border-radius:5px;padding:3px 10px;font:600 12px var(--mono);color:#1B140A}
.aviso{display:flex;gap:10px;align-items:flex-start;background:var(--late-bg);border:1px solid var(--late);border-radius:8px;padding:10px 12px;margin:14px 0;font-size:14px;line-height:1.4}
.aviso.info{background:var(--amber-bg);border-color:var(--amber)}
.aviso.ok{background:rgba(141,187,120,.12);border-color:var(--green)}
.aviso button.x{margin-left:auto;background:none;border:none;color:var(--mut);padding:2px}

@media (min-width:900px){
  .side{display:flex;flex-direction:column;width:244px;flex:none;position:sticky;top:0;height:100vh;padding:22px 16px;background:var(--s1);border-right:1px solid var(--line);gap:6px}
  .side .brand{margin-bottom:18px;padding:0 6px;flex:none}
  .side .brand b{font-size:25px;white-space:normal}
  .side nav{display:flex;flex-direction:column;gap:2px}
  .side nav button{display:flex;align-items:center;gap:12px;height:46px;padding:0 12px;border:none;border-left:3px solid transparent;border-radius:0 6px 6px 0;background:transparent;color:var(--mut);font:600 14px var(--body);text-align:left}
  .side nav button svg{width:19px;height:19px;flex:none}
  .side nav button:hover{background:var(--s2);color:var(--tx)}
  .side nav button[aria-current=page]{background:var(--s2);color:var(--amber);border-left-color:var(--amber)}
  .side .foot{margin-top:auto;display:flex;flex-direction:column;gap:8px}
  .side .chip{height:42px;width:100%;justify-content:space-between}
  .bnav{display:none}
  .topbar{display:none}
  .main{padding-bottom:48px}
  .wrap{padding:0 28px}
}

/* ---- t\xEDtulos de tela ---- */
.head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px;padding:22px 0 14px}
.head small{display:block;white-space:nowrap;font:600 11px var(--mono);letter-spacing:.14em;color:var(--amber);text-transform:uppercase;margin-bottom:4px}
.head h1{margin:0;font:600 34px/1 var(--disp);letter-spacing:-.005em}
.head .acts{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;align-items:center;margin-left:auto}
.sub{color:var(--mut);font-size:14px;line-height:1.45;margin:0 2px 14px}
.h2{font:600 21px var(--disp);margin:26px 0 10px;display:flex;align-items:baseline;gap:10px}
.h2 small{font:500 12px var(--mono);color:var(--mut);letter-spacing:.04em}

/* ---- abas de \xEDndice (caderno) ---- */
.itabs{display:flex;gap:4px;overflow-x:auto;margin-bottom:-1px;position:relative;z-index:1;scrollbar-width:none;padding-top:2px}
.itabs::-webkit-scrollbar{display:none}
.itab{flex:none;height:44px;padding:0 16px;border:1px solid var(--line);border-bottom:none;border-radius:8px 8px 0 0;background:var(--bg);color:var(--mut);font:600 12px var(--mono);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.itab[aria-selected=true]{background:var(--s1);color:var(--amber);box-shadow:inset 0 3px 0 var(--amber);height:46px;margin-top:-2px}
.sheet{border:1px solid var(--line);border-radius:0 8px 8px 8px;background:var(--s1);box-shadow:4px 4px 0 rgba(0,0,0,.28)}
.sheet.pad{padding:16px}
@media (min-width:600px){.sheet.pad{padding:22px}}

/* ---- formul\xE1rios ---- */
.fld{margin-bottom:14px}
.fld>label,.fld>.lbl{display:block;font:600 11.5px var(--mono);letter-spacing:.07em;text-transform:uppercase;color:var(--mut);margin-bottom:6px}
.fld .req{color:var(--amber)}
.in,.fld input,.fld select,.fld textarea{width:100%;min-height:48px;padding:10px 12px;border-radius:6px;border:1px solid var(--line);background:var(--bg);font-size:16px;color:var(--tx)}
.fld input[type=date]{font-family:var(--mono)}
.fld textarea{min-height:200px;font:13px/1.45 var(--mono);resize:vertical}
.fld .hint{font-size:12.5px;color:var(--mut);margin-top:5px}
.grid2{display:grid;gap:0 14px}
@media (min-width:640px){.grid2{grid-template-columns:1fr 1fr}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 20px;border-radius:6px;border:1.5px solid var(--amber);background:var(--amber);color:#1B140A;font:700 15px var(--body)}
.btn.wide{width:100%}
.btn.ghost{background:transparent;color:var(--amber)}
.btn.quiet{background:var(--s2);border-color:var(--line);color:var(--tx)}
.btn.sm{min-height:38px;padding:0 12px;font-size:13px}
.btn.ok{background:var(--green);border-color:var(--green)}
.btn:disabled{opacity:.55;cursor:default}
.spin{animation:giro 1s linear infinite}
@keyframes giro{to{transform:rotate(360deg)}}


/* escolha r\xE1pida (at\xE9 3 op\xE7\xF5es) */
.seg{display:flex;gap:6px}
.seg button{flex:1;min-height:48px;padding:6px 8px;border:1px solid var(--line);background:var(--bg);border-radius:6px;font:600 15px var(--body);color:var(--tx)}
.seg button[aria-pressed=true]{background:var(--amber-bg);border-color:var(--amber);color:var(--amber)}

/* seletor de matriz com busca */
.picker{position:relative}
.picker .sug{position:absolute;left:0;right:0;top:100%;z-index:15;margin-top:2px;background:var(--s2);border:1px solid var(--line);border-radius:6px;max-height:280px;overflow:auto;box-shadow:0 8px 22px rgba(0,0,0,.45)}
.picker .sug button{display:flex;width:100%;justify-content:space-between;align-items:center;gap:10px;min-height:48px;padding:6px 12px;border:none;border-bottom:1px solid var(--line2);background:transparent;text-align:left}
.picker .sug button:hover,.picker .sug button.act{background:var(--s1)}
.picker .sel{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:48px;padding:6px 12px;border-radius:6px;border:1px solid var(--amber);background:var(--amber-bg)}
.picker .sel b{font:600 19px var(--mono)}

/* ---- livro-caixa (linhas de caderno) ---- */
.led-h,.led-r{display:grid;grid-template-columns:var(--cols);gap:8px;align-items:center;padding:0 16px}
.led-h{padding-top:9px;padding-bottom:9px;border-bottom:1px solid var(--line);font:600 10.5px var(--mono);letter-spacing:.08em;color:var(--mut);text-transform:uppercase}
.led-r{min-height:60px;padding-top:6px;padding-bottom:6px;border-bottom:1px solid var(--line2);width:100%;background:transparent;border-left:none;border-right:none;border-top:none;text-align:left;color:inherit}
button.led-r:hover{background:var(--s2)}
.led-r .b{font:600 17px var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.led-r .two{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.led-r .two b{font-weight:600;font-size:15px}
.led-r .two span{font-size:13px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.led-r .m{font:500 14px var(--mono)}
.led-r .r{text-align:right;font:600 15px var(--mono)}
.led-h .r{text-align:right}

.cols-reb{--cols:84px minmax(0,1fr) 84px}
@media (min-width:700px){.cols-reb{--cols:84px minmax(0,1fr) 110px 120px 110px}}
.late{color:var(--late)} .soon{color:var(--amber)} .good{color:var(--green)} .mut{color:var(--mut)}
.hide-s{display:none}
@media (min-width:700px){.hide-s{display:block}}
.bar-sum{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--line);background:var(--bg);font:600 11px var(--mono);letter-spacing:.08em;text-transform:uppercase}
.search{display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid var(--line)}
.search svg{width:19px;height:19px;color:var(--mut);flex:none}
.search input{flex:1;min-width:0;height:52px;border:none;background:transparent;font-size:18px;outline:none}
.empty{padding:34px 16px;text-align:center;color:var(--mut);font-size:14.5px}
.detalhe{padding:12px 16px 16px;background:var(--bg);border-bottom:1px solid var(--line2);font-size:14px;line-height:1.5;color:var(--mut)}
.detalhe b{color:var(--tx)}
.tag{display:inline-block;padding:2px 9px;border-radius:20px;font:600 11px var(--mono);letter-spacing:.05em;text-transform:uppercase;border:1px solid currentColor}

/* ---- sum\xE1rio com pontinhos ---- */
.lead{display:flex;align-items:baseline;gap:8px;padding:7px 0;font-size:15px}
.lead i{flex:1;border-bottom:2px dotted var(--line);min-width:12px;transform:translateY(-3px)}
.lead b{font:600 16px var(--mono);white-space:nowrap}
.lead.big b{font:600 22px var(--disp)}
.lead button{background:none;border:none;padding:0;color:var(--tx);text-align:left;font:inherit;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}

/* ---- indicadores ---- */
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.kpi{background:var(--s1);border:1px solid var(--line);border-radius:8px;padding:13px 14px;min-width:0}
.kpi small{display:block;font:600 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-bottom:5px}
.kpi b{display:block;font:600 30px/1.05 var(--disp)}
.kpi span{display:block;font-size:12.5px;color:var(--mut);margin-top:3px}
.panel{background:var(--s1);border:1px solid var(--line);border-radius:8px;padding:16px;margin-bottom:16px}
.panel h3{margin:0 0 8px;font:600 19px var(--disp)}
.sbar{display:flex;height:16px;border-radius:3px;overflow:hidden;background:var(--s2);margin:8px 0 6px}
.sbar i{display:block;height:100%}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--mut)}
.legend span::before{content:'';display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;background:var(--c)}
.mbars{display:flex;align-items:flex-end;gap:8px;height:150px;padding-top:8px}
.mbars .c{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px;min-width:0}
.mbars .c i{display:block;width:100%;max-width:46px;background:var(--amber);border-radius:3px 3px 0 0;min-height:2px}
.mbars .c b{font:600 12px var(--mono)}
.mbars .c span{font:500 10.5px var(--mono);color:var(--mut)}
.cols2{display:grid;gap:16px}
@media (min-width:860px){.cols2{grid-template-columns:1fr 1fr}}

/* ---- tabelas (relat\xF3rios / planilha) ---- */
.tbwrap{overflow-x:auto;border:1px solid var(--line);border-radius:8px;background:var(--s1)}
table.tb{border-collapse:collapse;width:100%;font-size:14px}
table.tb th{position:sticky;top:0;background:var(--bg);padding:9px 12px;text-align:left;font:600 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--mut);border-bottom:1px solid var(--line);white-space:nowrap}
table.tb td{padding:8px 12px;border-bottom:1px solid var(--line2);white-space:nowrap;vertical-align:top}
table.tb td.wrapt{white-space:normal;min-width:230px}
table.tb tr:nth-child(even) td{background:rgba(255,255,255,.015)}
table.tb .r{text-align:right}
table.tb .mono{font-family:var(--mono);font-variant-numeric:tabular-nums}
.nota{font-size:13px;color:var(--mut);margin:6px 2px 10px}

/* confer\xEAncia do lote por foto */
.lote-item{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:10px;align-items:start;padding:11px 14px;border-bottom:1px solid var(--line2)}
.lote-item:last-child{border-bottom:none}
.lote-item .n{font:600 13px var(--mono);color:var(--amber);padding-top:2px}
.lote-item .txt{display:flex;flex-direction:column;gap:2px;min-width:0}
.lote-item .txt b{font-weight:600;font-size:14.5px;line-height:1.3}
.lote-item .txt span{font-size:13px;color:var(--mut);line-height:1.35}
.lote-item .m{font:500 13px var(--mono);padding-top:2px;white-space:nowrap}

/* ---- janela (modal) ---- */
.ov{position:fixed;inset:0;z-index:50;background:rgba(5,9,7,.72);display:flex;align-items:flex-end;justify-content:center}
.ov .box{width:100%;max-width:560px;max-height:92vh;overflow:auto;background:var(--s1);border:1px solid var(--line);border-radius:14px 14px 0 0;padding:18px 18px calc(22px + env(safe-area-inset-bottom))}
@media (min-width:640px){.ov{align-items:center}.ov .box{border-radius:12px}}
.ov .top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.ov h2{margin:0;font:600 26px var(--disp)}
.ov .x{width:44px;height:44px;border:none;background:var(--s2);border-radius:6px;display:flex;align-items:center;justify-content:center}
.hist{list-style:none;margin:0;padding:0}
.hist li{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dotted var(--line);font-size:14px}
.hist li span:last-child{font-family:var(--mono);color:var(--mut);white-space:nowrap}

details.ferr{margin-top:22px;border:1px dashed var(--line);border-radius:8px;padding:0 14px}
details.ferr summary{min-height:48px;display:flex;align-items:center;cursor:pointer;color:var(--mut);font:600 12px var(--mono);letter-spacing:.08em;text-transform:uppercase}
details.ferr .in2{padding:4px 0 16px;display:flex;flex-wrap:wrap;gap:8px}
.foot-note{margin:30px 0 8px;text-align:center;font:500 11px var(--mono);color:var(--mut);opacity:.75;letter-spacing:.04em}

.loading{display:flex;align-items:center;justify-content:center;gap:10px;min-height:60vh;color:var(--mut);font:500 14px var(--mono)}

/* ---- crias, pesagem e venda ---- */
.cols-cria{--cols:64px minmax(0,1fr) 84px}
.cols-cria .two b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (min-width:700px){.cols-cria{--cols:84px minmax(0,1.1fr) 110px 110px 130px}}
.filtros{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line)}
.filtros select{min-height:40px;padding:0 10px;border-radius:6px;border:1px solid var(--line);background:var(--bg);font-size:14px}
.filtros .seg{flex:1 1 220px}
.filtros .seg button{min-height:40px;font-size:13px}
.pill{display:inline-block;padding:1px 8px;border-radius:20px;font:600 11px var(--mono);letter-spacing:.04em;border:1px solid currentColor;white-space:nowrap}
.pill.pronto{color:var(--green)} .pill.falta{color:var(--amber)} .pill.fora{color:var(--mut)} .pill.alerta{color:var(--late)}
.chk{width:26px;height:26px;accent-color:var(--amber);flex:none}
.sel-row{display:grid;grid-template-columns:34px var(--cols);gap:8px;align-items:center;padding:0 8px 0 8px;border-bottom:1px solid var(--line2);min-height:60px;background:transparent}
.sel-row:hover{background:var(--s2)}
.sel-row .led-r{border:none;padding:0;min-height:58px;background:transparent}
.cols-vender{--cols:56px minmax(0,1fr) 68px}
@media (min-width:700px){.cols-vender{--cols:80px minmax(0,1fr) 100px 100px 150px}}
.cols-nov{--cols:56px minmax(0,1fr) 68px}
@media (min-width:700px){.cols-nov{--cols:84px minmax(0,1fr) 100px 100px 150px}}
.cmp{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));margin:10px 0}
.linha-add{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px;align-items:end}
.linha-add .fld{margin-bottom:0}
.rapido{border:1px solid var(--line);border-radius:8px;background:var(--bg);padding:12px;margin-bottom:12px}
.item-lin{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line2)}
.item-lin:last-child{border-bottom:none}
.item-lin .t{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.25}
.item-lin .t b{font:600 17px var(--mono)}
.item-lin .t span{font-size:13px;color:var(--mut)}
.item-lin .p{font:600 17px var(--mono);white-space:nowrap}
.x-peq{width:40px;height:40px;border:1px solid var(--line);background:var(--s2);border-radius:6px;display:flex;align-items:center;justify-content:center;flex:none}
.vlin{border:1px solid var(--line);border-radius:8px;background:var(--bg);padding:10px;margin-bottom:10px}
.vlin .l1{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 44px;gap:8px;align-items:end}
.vlin .l2{margin-top:8px}
.vlin .fld{margin-bottom:0}
.vlin .info{font-size:12.5px;color:var(--mut);margin-top:6px;line-height:1.35}
.vlin .info.ruim{color:var(--late)}
@media (min-width:700px){
  .vlin{display:grid;grid-template-columns:130px 220px 140px 44px;gap:8px;align-items:end}
  .vlin .l1,.vlin .l2{display:contents}
  .vlin .f-b{order:1}.vlin .f-t{order:2}.vlin .f-p{order:3}.vlin .f-x{order:4}
  .vlin .info{order:5;grid-column:1 / -1;margin-top:2px}
}
.totais{border:1px solid var(--amber);border-radius:8px;background:var(--amber-bg);padding:12px 14px;margin:12px 0}
.totais .grande{font:600 28px var(--disp)}
.venda-hist{border-bottom:1px solid var(--line2)}
.venda-hist>button{display:grid;grid-template-columns:70px minmax(0,1fr) auto;gap:10px;align-items:center;width:100%;min-height:60px;padding:6px 16px;background:transparent;border:none;text-align:left;color:inherit}
.venda-hist>button:hover{background:var(--s2)}
.venda-hist .itens{padding:4px 16px 12px;background:var(--bg)}

@media print{
  :root{--bg:#fff;--s1:#fff;--s2:#f3f3f3;--line:#999;--line2:#ccc;--tx:#000;--mut:#444;--amber:#7a4a00;--green:#1d5c1d;--late:#a02020}
  .side,.bnav,.topbar,.noprint,.itabs,.banner-teste,details.ferr{display:none!important}
  .sheet,.panel,.tbwrap,.kpis{box-shadow:none;break-inside:avoid}
  .main{padding:0}
}
`;

// src/api.js
var SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbyDBTMVGJGeBj92qtiIRfrzZciWyzgP8mvDx8inCjdvVBb2Erm5laJyuuiwx8YjJQlI/exec";
var MODO_TESTE = typeof window !== "undefined" && window.MODO_TESTE === true;
var URL_API = typeof window !== "undefined" && window.__URL_PLANILHA__ || SHEETS_API_URL;
if (typeof window !== "undefined") window.__gravacoesSimuladas = window.__gravacoesSimuladas || [];
function erroDeRede(msg) {
  const e = new Error(msg);
  e.rede = true;
  return e;
}
async function buscar(url, opcoes, limiteMs) {
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), limiteMs) : null;
  try {
    return await fetch(url, { ...opcoes || {}, ...ctl ? { signal: ctl.signal } : {} });
  } catch (e) {
    throw erroDeRede(e && e.name === "AbortError" ? "a internet est\xE1 lenta demais (sem resposta)" : "sem internet");
  } finally {
    if (t) clearTimeout(t);
  }
}
async function lerTudo() {
  const res = await buscar(`${URL_API}?action=getAll`, void 0, 3e4);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw erroDeRede("a planilha n\xE3o respondeu direito");
  }
  if (data && data.error) throw new Error(data.error);
  return data;
}
async function postar(payload) {
  if (MODO_TESTE) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) throw erroDeRede("sem internet");
    window.__gravacoesSimuladas.push(payload);
    await new Promise((r) => setTimeout(r, 150));
    return { ok: true, simulado: true };
  }
  const res = await buscar(URL_API, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }, 45e3);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    throw erroDeRede("a planilha n\xE3o respondeu direito");
  }
  if (data && data.error) throw new Error(data.error);
  return data;
}

// src/fila.js
var PREFIXO = MODO_TESTE ? "gp-teste-" : "gp-";
var CHAVE_FILA = `${PREFIXO}fila-v1`;
var CHAVE_DADOS = `${PREFIXO}dados-v1`;
var CHAVE_RASCUNHO_PESAR = `${PREFIXO}rascunho-pesar-v1`;
function ler(chave2, padrao) {
  try {
    const t = localStorage.getItem(chave2);
    return t ? JSON.parse(t) : padrao;
  } catch (e) {
    return padrao;
  }
}
function gravarLocal(chave2, valor) {
  try {
    localStorage.setItem(chave2, JSON.stringify(valor));
    return true;
  } catch (e) {
    console.error("N\xE3o consegui guardar no celular", e);
    return false;
  }
}
var lerLocal = ler;
var gravarNoCelular = gravarLocal;
function apagarLocal(chave2) {
  try {
    localStorage.removeItem(chave2);
  } catch (e) {
  }
}
var itens = ler(CHAVE_FILA, []);
var enviando = false;
var timer = null;
var ouvintes = /* @__PURE__ */ new Set();
var enviadosRecentes = [];
function enviadosDesde(ms) {
  return enviadosRecentes.filter((x) => x.quando >= ms).map((x) => ({ payload: x.payload }));
}
function salvar() {
  gravarLocal(CHAVE_FILA, itens);
}
function avisar() {
  const est = estadoFila();
  ouvintes.forEach((fn) => fn(est));
}
function estadoFila() {
  const comErro = itens.find((i) => i.erro);
  return {
    itens: itens.slice(),
    pendentes: itens.length,
    enviando,
    semInternet: !!(comErro && comErro.rede) || typeof navigator !== "undefined" && navigator.onLine === false && itens.length > 0,
    erroPlanilha: comErro && !comErro.rede ? comErro.erro : ""
  };
}
function assinarFila(fn) {
  ouvintes.add(fn);
  fn(estadoFila());
  return () => ouvintes.delete(fn);
}
var seq = 0;
function enfileirar(payloads, rotulo) {
  const agora = (/* @__PURE__ */ new Date()).toISOString();
  (payloads || []).forEach((p) => {
    seq += 1;
    itens.push({ uid: `${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 6)}`, payload: p, rotulo: rotulo || "", criadoEm: agora, tentativas: 0, erro: "", rede: false });
  });
  salvar();
  avisar();
  enviar();
}
function agendar(ms) {
  clearTimeout(timer);
  timer = setTimeout(() => enviar(), ms);
}
async function enviar() {
  if (enviando || itens.length === 0) return estadoFila();
  enviando = true;
  avisar();
  try {
    while (itens.length) {
      const it = itens[0];
      try {
        await postar(it.payload);
        itens = itens.filter((x) => x.uid !== it.uid);
        enviadosRecentes.push({ quando: Date.now(), payload: it.payload });
        if (enviadosRecentes.length > 200) enviadosRecentes.splice(0, enviadosRecentes.length - 200);
        salvar();
        avisar();
      } catch (e) {
        it.tentativas += 1;
        it.erro = e.message || "erro";
        it.rede = !!e.rede;
        it.ultimaTentativa = (/* @__PURE__ */ new Date()).toISOString();
        salvar();
        agendar(it.rede ? 2e4 : 6e4);
        break;
      }
    }
  } finally {
    enviando = false;
    avisar();
  }
  return estadoFila();
}
function descartar(uid) {
  itens = itens.filter((x) => x.uid !== uid);
  salvar();
  avisar();
  enviar();
}
if (typeof window !== "undefined") {
  window.addEventListener("online", () => enviar());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") enviar();
  });
  window.__fila = { estadoFila, enviar };
}

// src/excel.js
import * as XLSX from "xlsx";
var nomeAba = (s) => String(s).replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Aba";
var semAcento2 = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9_-]+/g, "_");
function exportarExcel({ matrizes, touros, eventos }, ano, hoje) {
  const evs = filtrarPorAno(eventos, ano);
  const wb = XLSX.utils.book_new();
  const kpis = calcularKPIs(matrizes, evs);
  const resumo = [["Relat\xF3rio Fazenda Ibira\xE7u", ""], ["Gerado em", hoje], ...buildResumoRows(kpis, ano)];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), "Resumo");
  ABAS_EXCEL.forEach(([nome, tipo]) => {
    const linhas = linhasPlanilha(tipo, { matrizes, touros, eventos: evs, todosEventos: eventos });
    XLSX.utils.book_append_sheet(wb, linhas.length ? XLSX.utils.json_to_sheet(linhas) : XLSX.utils.aoa_to_sheet([["Sem registros"]]), nomeAba(nome));
  });
  const arquivo = `Fazenda_Ibiracu_${ano === "todos" ? "todos_os_anos" : ano}_${hoje}.xlsx`;
  XLSX.writeFile(wb, arquivo);
  return arquivo;
}
function exportarRelatorioExcel(rel, ano, hoje) {
  const wb = XLSX.utils.book_new();
  const topo = [[rel.titulo, ""], ["Gerado em", hoje], ["Ano de gest\xE3o", rotuloAno(ano)], ["", ""], ...rel.resumo.map((r) => [r.rotulo, r.valor])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(topo), "Resumo");
  const usados = /* @__PURE__ */ new Set(["Resumo"]);
  rel.secoes.forEach((s) => {
    let nome = nomeAba(s.titulo);
    let n = 2;
    while (usados.has(nome)) {
      nome = nomeAba(`${s.titulo} ${n++}`);
    }
    usados.add(nome);
    const aoa = [s.colunas.map((c) => c.label), ...s.linhas.map((l) => s.colunas.map((c) => l[c.k] === void 0 ? "" : l[c.k]))];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), nome);
  });
  const arquivo = `${semAcento2(rel.titulo)}_${hoje}.xlsx`;
  XLSX.writeFile(wb, arquivo);
  return arquivo;
}

// src/ui.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { X, AlertCircle, Info, Check } from "lucide-react";
var corStatus = (s) => s === "Cheia" ? "var(--green)" : s === "Vazia" ? "var(--amber)" : s === "Vendida" || s === "Morta" ? "var(--mut)" : "var(--late)";
function Tag({ status }) {
  return /* @__PURE__ */ React.createElement("span", { className: "tag", style: { color: corStatus(status) } }, status);
}
function IndexTabs({ tabs, value, onChange, rotulo }) {
  return /* @__PURE__ */ React.createElement("div", { className: "itabs", role: "tablist", "aria-label": rotulo }, tabs.map((t) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: t.id,
      role: "tab",
      "aria-selected": value === t.id,
      className: "itab",
      onClick: () => onChange(t.id)
    },
    t.label,
    t.count !== void 0 ? ` \xB7 ${t.count}` : ""
  )));
}
function Aviso({ tipo, children, onClose }) {
  const Icon = tipo === "ok" ? Check : tipo === "info" ? Info : AlertCircle;
  const cor = tipo === "ok" ? "var(--green)" : tipo === "info" ? "var(--amber)" : "var(--late)";
  return /* @__PURE__ */ React.createElement("div", { className: `aviso ${tipo || ""}`, role: tipo === "ok" || tipo === "info" ? "status" : "alert" }, /* @__PURE__ */ React.createElement(Icon, { size: 18, color: cor, style: { flex: "none", marginTop: 1 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, children), onClose && /* @__PURE__ */ React.createElement("button", { className: "x", onClick: onClose, "aria-label": "Fechar aviso" }, /* @__PURE__ */ React.createElement(X, { size: 16 })));
}
function Kpis({ itens: itens2 }) {
  return /* @__PURE__ */ React.createElement("div", { className: "kpis" }, itens2.map((k) => /* @__PURE__ */ React.createElement("div", { className: "kpi", key: k.rotulo }, /* @__PURE__ */ React.createElement("small", null, k.rotulo), /* @__PURE__ */ React.createElement("b", { style: { ...k.cor ? { color: k.cor } : null, ...k.pequeno ? { fontSize: 22 } : null } }, k.valor), k.sub ? /* @__PURE__ */ React.createElement("span", null, k.sub) : null)));
}
function Lead({ rotulo, valor, onClick, big, cor }) {
  return /* @__PURE__ */ React.createElement("div", { className: `lead${big ? " big" : ""}` }, onClick ? /* @__PURE__ */ React.createElement("button", { onClick }, rotulo) : /* @__PURE__ */ React.createElement("span", null, rotulo), /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("b", { style: cor ? { color: cor } : void 0 }, valor));
}
function Modal({ titulo, onClose, children, rotulo }) {
  const ref = useRef(null);
  const fechar = useRef(onClose);
  fechar.current = onClose;
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") fechar.current();
    };
    window.addEventListener("keydown", onKey);
    const caixa = ref.current;
    if (caixa && !caixa.contains(document.activeElement)) caixa.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "ov", onMouseDown: (e) => {
    if (e.target === e.currentTarget) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { className: "box", role: "dialog", "aria-modal": "true", "aria-label": rotulo || titulo, ref, tabIndex: -1 }, /* @__PURE__ */ React.createElement("div", { className: "top" }, /* @__PURE__ */ React.createElement("h2", null, titulo), /* @__PURE__ */ React.createElement("button", { className: "x", onClick: onClose, "aria-label": "Fechar" }, /* @__PURE__ */ React.createElement(X, { size: 20 }))), children));
}
function MatrizPicker({ value, onChange, matrizes, filtro, rotulo }) {
  const [q, setQ] = useState("");
  const [aberto, setAberto] = useState(false);
  const sel = matrizes.find((m) => m.id === value);
  const lista = useMemo(() => {
    const base = matrizes.filter((m) => m.status !== "Descarte" && m.status !== "Vendida" && m.status !== "Morta" && (!filtro || filtro(m)));
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const comeca = base.filter((m) => String(m.brinco).toLowerCase().startsWith(t));
    const contem = base.filter((m) => !String(m.brinco).toLowerCase().startsWith(t) && String(m.brinco).toLowerCase().includes(t));
    return [...comeca, ...contem].slice(0, 8);
  }, [matrizes, filtro, q]);
  if (sel) {
    return /* @__PURE__ */ React.createElement("div", { className: "picker" }, /* @__PURE__ */ React.createElement("div", { className: "sel", "data-testid": "matriz-escolhida" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("b", null, sel.brinco), /* @__PURE__ */ React.createElement("span", { className: "mut", style: { fontSize: 13.5 } }, [sel.categoria, sel.raca, sel.lote].filter(Boolean).join(" \xB7 ")), /* @__PURE__ */ React.createElement(Tag, { status: sel.status })), /* @__PURE__ */ React.createElement("button", { className: "btn quiet sm", onClick: () => {
      onChange("");
      setQ("");
    } }, "Trocar")));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "picker" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      autoComplete: "off",
      autoCapitalize: "off",
      "aria-label": rotulo || "Brinco da matriz",
      placeholder: "Digite o brinco da vaca",
      value: q,
      onChange: (e) => {
        setQ(e.target.value);
        setAberto(true);
      },
      onFocus: () => setAberto(true),
      onKeyDown: (e) => {
        if (e.key === "Enter" && lista.length) {
          onChange(lista[0].id);
          setQ("");
        }
      }
    }
  ), aberto && q.trim() && /* @__PURE__ */ React.createElement("div", { className: "sug", role: "listbox" }, lista.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "empty", style: { padding: 14 } }, "Nenhuma matriz com esse brinco."), lista.map((m) => /* @__PURE__ */ React.createElement("button", { key: m.id, role: "option", onClick: () => {
    onChange(m.id);
    setQ("");
    setAberto(false);
  } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 } }, /* @__PURE__ */ React.createElement("b", { className: "num", style: { fontSize: 18 } }, m.brinco), /* @__PURE__ */ React.createElement("span", { className: "mut", style: { fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, [m.categoria, m.raca].filter(Boolean).join(" \xB7 "))), /* @__PURE__ */ React.createElement(Tag, { status: m.status })))));
}
function Campo({ campo, value, onChange, matrizes, touros }) {
  const id = `f-${campo.key}`;
  const rotulo = /* @__PURE__ */ React.createElement(React.Fragment, null, campo.label, campo.required ? /* @__PURE__ */ React.createElement("span", { className: "req" }, " *") : null);
  if (campo.type === "select" && campo.options.length <= 3) {
    return /* @__PURE__ */ React.createElement("div", { className: "fld", role: "group", "aria-label": campo.label }, /* @__PURE__ */ React.createElement("span", { className: "lbl", style: { display: "block", font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 6 } }, rotulo), /* @__PURE__ */ React.createElement("div", { className: "seg" }, campo.options.map((o) => /* @__PURE__ */ React.createElement("button", { key: o, type: "button", "aria-pressed": value === o, onClick: () => onChange(campo.key, value === o && !campo.required ? "" : o) }, o))));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "fld" }, /* @__PURE__ */ React.createElement("label", { htmlFor: id }, rotulo), campo.type === "select" && /* @__PURE__ */ React.createElement("select", { id, value: value || "", onChange: (e) => onChange(campo.key, e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione"), campo.options.map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, o))), campo.type === "matriz" && /* @__PURE__ */ React.createElement(MatrizPicker, { value, onChange: (v) => onChange(campo.key, v), matrizes, rotulo: campo.label }), campo.type === "touro" && /* @__PURE__ */ React.createElement("select", { id, value: value || "", onChange: (e) => onChange(campo.key, e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione"), touros.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.nome, t.raca ? ` \u2014 ${t.raca}` : "")), /* @__PURE__ */ React.createElement("option", { value: "__outro__" }, "Outro / n\xE3o cadastrado")), (campo.type === "text" || campo.type === "number" || campo.type === "date") && /* @__PURE__ */ React.createElement(
    "input",
    {
      id,
      type: campo.type,
      inputMode: campo.type === "number" ? "decimal" : void 0,
      value: value || "",
      onChange: (e) => onChange(campo.key, e.target.value)
    }
  ));
}
var vazioTxt = (v) => v === "" || v === null || v === void 0 ? "\u2014" : String(v);
function SecaoRelatorio({ secao }) {
  return /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, secao.titulo, /* @__PURE__ */ React.createElement("small", null, secao.linhas.length, " linha(s)")), secao.nota ? /* @__PURE__ */ React.createElement("p", { className: "nota" }, secao.nota) : null, secao.linhas.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "tbwrap" }, /* @__PURE__ */ React.createElement("div", { className: "empty" }, "Nada para mostrar neste per\xEDodo.")) : /* @__PURE__ */ React.createElement("div", { className: "tbwrap" }, /* @__PURE__ */ React.createElement("table", { className: "tb" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, secao.colunas.map((c) => /* @__PURE__ */ React.createElement("th", { key: c.k, className: c.align === "right" ? "r" : "" }, c.label)))), /* @__PURE__ */ React.createElement("tbody", null, secao.linhas.map((l, i) => {
    const total = String(l[secao.colunas[0].k]) === "Total";
    return /* @__PURE__ */ React.createElement("tr", { key: i }, secao.colunas.map((c) => /* @__PURE__ */ React.createElement(
      "td",
      {
        key: c.k,
        className: `${c.align === "right" ? "r " : ""}${c.mono ? "mono " : ""}${c.k === "brincos" ? "wrapt" : ""}`,
        style: total ? { fontWeight: 700, color: "var(--amber)" } : void 0
      },
      vazioTxt(l[c.k])
    )));
  })))));
}
function TabelaLinhas({ rows }) {
  if (!rows || rows.length === 0) {
    return /* @__PURE__ */ React.createElement("div", { className: "tbwrap" }, /* @__PURE__ */ React.createElement("div", { className: "empty" }, "Nenhum registro neste per\xEDodo."));
  }
  const headers = Object.keys(rows[0]);
  return /* @__PURE__ */ React.createElement("div", { className: "tbwrap" }, /* @__PURE__ */ React.createElement("table", { className: "tb" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, headers.map((h) => /* @__PURE__ */ React.createElement("th", { key: h }, h)))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, headers.map((h) => /* @__PURE__ */ React.createElement("td", { key: h }, String(r[h] ?? ""))))))));
}

// src/util.js
var ROTULO_CURTO = {
  cadastro: "Nova matriz",
  touro: "Touro / s\xEAmen",
  iatf: "IATF",
  diagnostico: "Toque",
  nascimento: "Nascimento",
  desmama: "Desmama",
  recria: "Recria",
  pesagem: "Peso",
  venda: "Venda",
  vendaitem: "Animal vendido",
  insumo: "Insumo",
  descarte: "Descarte",
  morte: "Morte"
};
var rotuloEvento = (tipo) => (TIPOS_EVENTO.find((t) => t.id === tipo) || {}).label || tipo;
var ORDEM_LANCAR = ["nascimento", "morte", "iatf", "diagnostico", "desmama", "recria", "descarte", "insumo", "cadastro", "touro"];
function descreverEvento(e, dados) {
  const brincos = mapaBrincos(dados.matrizes);
  const mae = e.matrizId ? brincos[e.matrizId] || "?" : "";
  const partes = [];
  if (e.tipo === "nascimento") {
    if (mae) partes.push(`m\xE3e ${mae}`);
    if (e.brincoBezerro) partes.push(`cria ${e.brincoBezerro}`);
    if (e.sexo) partes.push(e.sexo === "Macho" ? "macho" : "f\xEAmea");
    if (e.resultadoParto === "Natimorto") partes.push("natimorto");
  } else if (e.tipo === "diagnostico") {
    if (mae) partes.push(`vaca ${mae}`);
    if (e.resultado) partes.push(e.resultado.toLowerCase());
    if (e.dg) partes.push(`DG ${e.dg}`);
  } else if (e.tipo === "iatf") {
    if (mae) partes.push(`vaca ${mae}`);
    const t = nomeTouroEvento(e, dados.touros);
    if (t) partes.push(t);
  } else if (e.tipo === "desmama") {
    if (e.brincoBezerro) partes.push(`cria ${e.brincoBezerro}`);
    if (e.pesoDesmama) partes.push(`${e.pesoDesmama} kg`);
  } else if (e.tipo === "pesagem") {
    if (e.brinco) partes.push(`animal ${e.brinco}`);
    if (e.peso) partes.push(`${fmtKg(e.peso)}`);
  } else if (e.tipo === "vendaitem") {
    if (e.brinco) partes.push(`animal ${e.brinco}`);
    if (e.tipoAnimal) partes.push(e.tipoAnimal);
    if (e.peso) partes.push(`${fmtKg(e.peso)}`);
  } else if (e.tipo === "venda") {
    if (e.animais) partes.push(e.animais);
    if (e.valorTotal) partes.push(fmtBRL(parseFloat(e.valorTotal)));
  } else if (e.tipo === "morte") {
    if (e.tipoAnimal) partes.push(e.brinco ? `${e.tipoAnimal.toLowerCase()} ${e.brinco}` : `${e.tipoAnimal.toLowerCase()} sem n\xFAmero`);
    if (e.causa) partes.push(e.causa.toLowerCase());
    if (String(e.anulada ?? "").trim().toLowerCase() === "sim") partes.push("anulada");
  } else if (e.tipo === "insumo") {
    if (e.produto) partes.push(e.produto);
    if (e.quantidade) partes.push(`${e.quantidade} ${e.unidade || ""}`.trim());
  } else if (mae) {
    partes.push(`vaca ${mae}`);
  }
  return [rotuloEvento(e.tipo), ...partes].join(" \xB7 ");
}
var fmtBRL = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
var fmtKg = (n) => {
  const x = Number(n);
  if (n === null || n === void 0 || n === "" || isNaN(x)) return "\u2014";
  return `${(Math.round(x * 10) / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`;
};
var fmtNum = (n, casas) => n === null || n === void 0 || isNaN(n) ? "\u2014" : Number(n).toLocaleString("pt-BR", { maximumFractionDigits: casas === void 0 ? 1 : casas, minimumFractionDigits: 0 });
var fmtIdade = (dias) => dias === null || dias === void 0 ? "\u2014" : dias < 60 ? `${dias} dias` : `${fmtNum(dias / 30.4, 1)} meses`;
var fmtGmd = (g) => g === null || g === void 0 ? "\u2014" : `${fmtNum(g, 2)} kg/dia`;

// src/telas/Lancar.jsx
import React6, { useState as useState5, useEffect as useEffect3, useMemo as useMemo4, useRef as useRef3 } from "react";
import { Save as Save3, Check as Check3, Loader2 as Loader24 } from "lucide-react";

// src/telas/FichaRapida.jsx
import React2 from "react";
function FichaRapida({ ficha, digitado, ocultarSemPeso }) {
  if (!digitado || !String(digitado).trim()) return null;
  if (!ficha || !ficha.achado) {
    if (String(digitado).trim().length < 3) return null;
    return /* @__PURE__ */ React2.createElement("div", { className: "ficha-rapida ruim", "data-testid": "ficha-rapida", role: "status" }, "Brinco ", String(digitado).trim(), " n\xE3o encontrado (cria ou novilha). Confira o n\xFAmero.");
  }
  if (ficha.jaMorto) {
    return /* @__PURE__ */ React2.createElement("div", { className: "ficha-rapida ruim", "data-testid": "ficha-rapida", role: "status" }, /* @__PURE__ */ React2.createElement("b", null, ficha.brinco), " \xB7 Este animal morreu", ficha.mortoEm ? ` em ${formatarDataBR(ficha.mortoEm)}` : "", ". N\xE3o d\xE1 para pesar.");
  }
  if (ficha.jaVendido) {
    return /* @__PURE__ */ React2.createElement("div", { className: "ficha-rapida ruim", "data-testid": "ficha-rapida", role: "status" }, /* @__PURE__ */ React2.createElement("b", null, ficha.brinco), " \xB7 Este animal j\xE1 foi vendido", ficha.vendidoEm ? ` em ${formatarDataBR(ficha.vendidoEm)}` : "", ".");
  }
  const tipo = ficha.categoria && ficha.categoria !== "Cria" ? ficha.categoria : ficha.sexo === "F\xEAmea" ? "Bezerra" : ficha.sexo === "Macho" ? "Bezerro" : "Cria";
  return /* @__PURE__ */ React2.createElement("div", { className: `ficha-rapida${ficha.mesmaData && ficha.mesmaData.length ? " atencao" : ""}`, "data-testid": "ficha-rapida", role: "status" }, /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("b", null, ficha.brinco), " \xB7 ", tipo, ficha.sexo && tipo !== "Bezerro" && tipo !== "Bezerra" ? ` \xB7 ${ficha.sexo}` : ""), /* @__PURE__ */ React2.createElement("div", { className: "lin" }, /* @__PURE__ */ React2.createElement("span", null, "Idade ", /* @__PURE__ */ React2.createElement("b", null, ficha.idade ? ficha.idade.texto : "?")), /* @__PURE__ */ React2.createElement("span", null, "Nasceu ", /* @__PURE__ */ React2.createElement("b", null, ficha.nascData ? formatarDataBR(ficha.nascData) : "?")), /* @__PURE__ */ React2.createElement("span", null, "M\xE3e ", /* @__PURE__ */ React2.createElement("b", null, ficha.maeBrinco || "\u2014"))), !ocultarSemPeso && /* @__PURE__ */ React2.createElement("div", { className: "lin" }, ficha.ultimoPeso ? /* @__PURE__ */ React2.createElement("span", null, "\xDAltimo peso ", /* @__PURE__ */ React2.createElement("b", null, fmtKg(ficha.ultimoPeso.peso)), " em ", formatarDataBR(ficha.ultimoPeso.data)) : /* @__PURE__ */ React2.createElement("span", null, /* @__PURE__ */ React2.createElement("b", null, "Ainda n\xE3o foi pesado")), ficha.desmamaData ? /* @__PURE__ */ React2.createElement("span", null, "Desmama em ", /* @__PURE__ */ React2.createElement("b", null, formatarDataBR(ficha.desmamaData))) : null));
}

// src/telas/Lote.jsx
import React3, { useState as useState2 } from "react";
import { ClipboardPaste, Check as Check2, Loader2 } from "lucide-react";
function lerBlocoLote(texto) {
  let t = String(texto || "").trim();
  if (!t) return { erro: "Cole o texto que o Claude devolveu." };
  t = t.replace(/^```[a-zA-Z]*\s*/m, "").replace(/```\s*$/m, "").trim();
  let obj;
  try {
    obj = JSON.parse(t);
  } catch (e) {
    return { erro: "N\xE3o consegui ler o texto colado. Cole o bloco inteiro, do primeiro [ at\xE9 o \xFAltimo ]." };
  }
  const itens2 = Array.isArray(obj) ? obj : obj && Array.isArray(obj.itens) ? obj.itens : null;
  if (!itens2) return { erro: "O texto colado n\xE3o tem uma lista de lan\xE7amentos." };
  if (itens2.length === 0) return { erro: "A lista est\xE1 vazia." };
  if (itens2.length > 200) return { erro: "Muitos lan\xE7amentos de uma vez (mais de 200). Divida em partes." };
  if (itens2.some((i) => !i || typeof i !== "object" || !i.tipo)) return { erro: 'Algum item n\xE3o tem o campo "tipo".' };
  return { itens: itens2 };
}
function mudancas(aplicado, dados) {
  const partes = [];
  aplicado.matrizes.forEach((m) => {
    const antes = dados.matrizes.find((x) => x.id === m.id);
    if (!antes) {
      partes.push(`nova matriz ${m.brinco} (${m.status})`);
      return;
    }
    if (antes.status !== m.status) partes.push(`${m.brinco}: ${antes.status} \u2192 ${m.status}`);
    if (antes.categoria !== m.categoria) partes.push(`${m.brinco}: ${antes.categoria} \u2192 ${m.categoria}`);
  });
  return partes.join(" \xB7 ");
}
function LoteFoto({ dados, hoje, onGravarLote, modoTeste }) {
  const [texto, setTexto] = useState2("");
  const [erro, setErro] = useState2("");
  const [prev, setPrev] = useState2(null);
  const [gravando, setGravando] = useState2(false);
  const [feito, setFeito] = useState2("");
  function conferir() {
    setFeito("");
    const r = lerBlocoLote(texto);
    if (r.erro) {
      setErro(r.erro);
      setPrev(null);
      return;
    }
    setErro("");
    setPrev(aplicarLote(dados, r.itens, { hoje }));
  }
  async function gravar() {
    if (!prev || prev.aplicados.length === 0) return;
    setGravando(true);
    const r = await onGravarLote(prev);
    setGravando(false);
    if (r.ok) {
      setFeito(r.msg);
      setPrev(null);
      setTexto("");
    } else setErro(r.msg);
  }
  return /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Lote por foto"), /* @__PURE__ */ React3.createElement("p", { className: "sub" }, "Tire a foto da folha do manejo e mande para o Claude no chat. Ele devolve um bloco de texto com os lan\xE7amentos. Cole aqui, confira o que vai mudar em cada vaca e s\xF3 ent\xE3o grave."), /* @__PURE__ */ React3.createElement("div", { className: "fld" }, /* @__PURE__ */ React3.createElement("label", { htmlFor: "lote-texto" }, "Bloco de lan\xE7amentos"), /* @__PURE__ */ React3.createElement("textarea", { id: "lote-texto", value: texto, onChange: (e) => setTexto(e.target.value), placeholder: '[ { "tipo": "nascimento", "matriz": "3012", "data": "10/10/26", "sexo": "F" } ]', spellCheck: false })), /* @__PURE__ */ React3.createElement("button", { className: "btn wide quiet", onClick: conferir }, /* @__PURE__ */ React3.createElement(ClipboardPaste, { size: 18 }), " Conferir antes de gravar"), erro && /* @__PURE__ */ React3.createElement(Aviso, null, erro), feito && /* @__PURE__ */ React3.createElement(Aviso, { tipo: "ok" }, feito, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), prev && /* @__PURE__ */ React3.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React3.createElement("h2", { className: "h2" }, "Confer\xEAncia", /* @__PURE__ */ React3.createElement("small", null, prev.aplicados.length, " para gravar \xB7 ", prev.rejeitados.length, " com problema")), prev.aplicados.length > 0 && /* @__PURE__ */ React3.createElement("div", { className: "sheet", "data-testid": "lote-aplicados" }, prev.aplicados.map((a) => /* @__PURE__ */ React3.createElement("div", { className: "lote-item", key: a.indice, "data-testid": "lote-item" }, /* @__PURE__ */ React3.createElement("span", { className: "n" }, a.indice + 1), /* @__PURE__ */ React3.createElement("div", { className: "txt" }, /* @__PURE__ */ React3.createElement("b", null, descreverEvento(a.eventos[0], prev.estado)), /* @__PURE__ */ React3.createElement("span", null, mudancas(a, dados) || "sem mudan\xE7a no cadastro da vaca")), /* @__PURE__ */ React3.createElement("span", { className: "m mut" }, formatarDataBR(a.eventos[0].data))))), prev.avisos.length > 0 && /* @__PURE__ */ React3.createElement(Aviso, { tipo: "info" }, /* @__PURE__ */ React3.createElement("b", null, "Aten\xE7\xE3o:"), /* @__PURE__ */ React3.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 } }, prev.avisos.map((a, i) => /* @__PURE__ */ React3.createElement("li", { key: i }, "linha ", a.indice + 1, ": ", a.aviso)))), prev.rejeitados.length > 0 && /* @__PURE__ */ React3.createElement(Aviso, null, /* @__PURE__ */ React3.createElement("b", null, "N\xE3o v\xE3o ser gravados:"), /* @__PURE__ */ React3.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 }, "data-testid": "lote-rejeitados" }, prev.rejeitados.map((r, i) => /* @__PURE__ */ React3.createElement("li", { key: i }, "linha ", r.indice + 1, ": ", r.motivo)))), /* @__PURE__ */ React3.createElement("button", { className: "btn wide", disabled: gravando || prev.aplicados.length === 0, onClick: gravar, style: { marginTop: 10 } }, gravando ? /* @__PURE__ */ React3.createElement(Loader2, { size: 18, className: "spin" }) : /* @__PURE__ */ React3.createElement(Check2, { size: 18 }), gravando ? "Gravando..." : `Gravar ${prev.aplicados.length} lan\xE7amento(s)`)));
}

// src/telas/Morte.jsx
import React4, { useMemo as useMemo2, useState as useState3, useRef as useRef2, useEffect as useEffect2 } from "react";
import { Save, Loader2 as Loader22, Undo2 } from "lucide-react";
var campoDef = (k) => CAMPOS.morte.find((c) => c.key === k);
var inicial = (brinco, hoje) => ({ brinco: brinco || "", data: hoje, causa: "", tipoAnimal: "", observacoes: "" });
function FormMorte({ dados, hoje, brincoFixo, onRegistrar, modoTeste, aoTerminar }) {
  const [form, setForm] = useState3(() => inicial(brincoFixo, hoje));
  const [erro, setErro] = useState3("");
  const [confirmar, setConfirmar] = useState3(false);
  const [salvando, setSalvando] = useState3(false);
  const [msg, setMsg] = useState3("");
  const timer2 = useRef2(null);
  useEffect2(() => () => clearTimeout(timer2.current), []);
  const info = useMemo2(() => infoAnimalMorte(dados, form.brinco), [dados, form.brinco]);
  const temBrinco = !!form.brinco.trim();
  function mudar(chave2, valor) {
    setForm((f) => ({ ...f, [chave2]: valor }));
    setErro("");
    setConfirmar(false);
    setMsg("");
  }
  async function salvar2(confirmado) {
    if (salvando) return;
    const f = { ...form, brinco: form.brinco.trim(), tipoAnimal: info.achado ? "" : form.tipoAnimal };
    const v = validarMorte(dados, f, hoje);
    if (v.erros.length) {
      setErro(v.erros.join(" "));
      setConfirmar(false);
      return;
    }
    if (info.matriz && !confirmado) {
      setConfirmar(true);
      setErro("");
      return;
    }
    setErro("");
    setConfirmar(false);
    setSalvando(true);
    const r = await onRegistrar(f);
    setSalvando(false);
    if (!r.ok) {
      setErro(r.msg);
      return;
    }
    setMsg(r.msg);
    setForm(inicial(brincoFixo, hoje));
    clearTimeout(timer2.current);
    timer2.current = setTimeout(() => setMsg(""), 12e3);
    if (aoTerminar) aoTerminar(r);
  }
  return /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement("label", { htmlFor: "morte-brinco" }, "Brinco do animal"), /* @__PURE__ */ React4.createElement(
    "input",
    {
      id: "morte-brinco",
      type: "text",
      autoComplete: "off",
      autoCapitalize: "off",
      disabled: !!brincoFixo,
      value: form.brinco,
      onChange: (e) => mudar("brinco", e.target.value),
      placeholder: "Digite o n\xFAmero do brinco (cria, novilha ou vaca)"
    }
  ), !temBrinco && /* @__PURE__ */ React4.createElement("div", { className: "hint" }, "Deixe em branco se o animal n\xE3o tem n\xFAmero (touro, boi, bezerro sem brinco). A\xED escolha que animal \xE9."), temBrinco && info.achado && !info.jaMorto && !info.jaVendido && /* @__PURE__ */ React4.createElement("div", { className: "hint", "data-testid": "morte-achei" }, "Achei: ", info.descricao), temBrinco && info.achado && info.jaMorto && /* @__PURE__ */ React4.createElement("div", { className: "hint late" }, "Este animal j\xE1 est\xE1 registrado como morto", info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : "", "."), temBrinco && info.achado && !info.jaMorto && info.jaVendido && /* @__PURE__ */ React4.createElement("div", { className: "hint late" }, "Este animal j\xE1 foi vendido", info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : "", "."), temBrinco && !info.achado && /* @__PURE__ */ React4.createElement("div", { className: "hint late", "data-testid": "morte-nao-achei" }, "N\xE3o achei o n\xFAmero ", form.brinco.trim(), " no sistema. Se o n\xFAmero est\xE1 certo, escolha que animal \xE9 abaixo para registrar assim mesmo.")), /* @__PURE__ */ React4.createElement("div", { className: "grid2" }, /* @__PURE__ */ React4.createElement(Campo, { campo: campoDef("data"), value: form.data, onChange: mudar, matrizes: [], touros: [] }), /* @__PURE__ */ React4.createElement(Campo, { campo: campoDef("causa"), value: form.causa, onChange: mudar, matrizes: [], touros: [] })), !info.achado && /* @__PURE__ */ React4.createElement(Campo, { campo: { ...campoDef("tipoAnimal"), label: "Que animal \xE9", required: true }, value: form.tipoAnimal, onChange: mudar, matrizes: [], touros: [] }), /* @__PURE__ */ React4.createElement(Campo, { campo: { ...campoDef("observacoes"), label: "Observa\xE7\xE3o (livre)" }, value: form.observacoes, onChange: mudar, matrizes: [], touros: [] }), erro && /* @__PURE__ */ React4.createElement(Aviso, null, erro), confirmar && info.matriz && /* @__PURE__ */ React4.createElement(Aviso, { tipo: "info" }, "Vai registrar a morte de ", /* @__PURE__ */ React4.createElement("b", null, info.descricao), ". ", info.matriz.status === "Cheia" ? "Ela estava cheia e " : "Ela ", "sai da lista de vacas e da previs\xE3o de parto. Confirma?", /* @__PURE__ */ React4.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React4.createElement("button", { className: "btn sm", onClick: () => salvar2(true), disabled: salvando }, "Confirmar morte"), /* @__PURE__ */ React4.createElement("button", { className: "btn quiet sm", onClick: () => setConfirmar(false) }, "Voltar"))), msg && /* @__PURE__ */ React4.createElement(Aviso, { tipo: "ok" }, msg, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), /* @__PURE__ */ React4.createElement("button", { className: "btn wide", onClick: () => salvar2(false), disabled: salvando, style: { marginTop: 6 } }, salvando ? /* @__PURE__ */ React4.createElement(Loader22, { size: 18, className: "spin" }) : /* @__PURE__ */ React4.createElement(Save, { size: 18 }), " ", salvando ? "Gravando..." : "Registrar morte"));
}
function ModalMorte({ item, onEditar, onAnular, onFechar, onFeito }) {
  const e = item.e;
  const semCadastro = !e.criaId && !e.matrizId;
  const [form, setForm] = useState3({ data: e.data || "", causa: e.causa || "", observacoes: e.observacoes || "", tipoAnimal: e.tipoAnimal || "", brinco: e.brinco || "" });
  const [erro, setErro] = useState3("");
  const [anular, setAnular] = useState3(false);
  const [gravando, setGravando] = useState3(false);
  const mudar = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErro("");
  };
  async function salvar2() {
    if (gravando) return;
    setGravando(true);
    const campos = { data: form.data, causa: form.causa, observacoes: form.observacoes, ...semCadastro ? { tipoAnimal: form.tipoAnimal, brinco: form.brinco } : {} };
    const r = await onEditar(e.id, campos);
    setGravando(false);
    if (!r.ok) {
      setErro(r.msg);
      return;
    }
    onFeito(r.msg);
    onFechar();
  }
  async function confirmarAnular() {
    if (gravando) return;
    setGravando(true);
    const r = await onAnular(e.id);
    setGravando(false);
    if (!r.ok) {
      setErro(r.msg);
      setAnular(false);
      return;
    }
    onFeito(r.msg);
    onFechar();
  }
  return /* @__PURE__ */ React4.createElement(Modal, { titulo: `Morte \xB7 ${item.animal}`, onClose: onFechar, rotulo: "Corrigir morte" }, /* @__PURE__ */ React4.createElement(Lead, { rotulo: "Animal", valor: item.animal }), item.mae && /* @__PURE__ */ React4.createElement(Lead, { rotulo: "M\xE3e", valor: item.mae }), /* @__PURE__ */ React4.createElement(Lead, { rotulo: "Lote", valor: item.lote }), !item.ativa ? /* @__PURE__ */ React4.createElement("p", { className: "sub", style: { marginTop: 12 } }, "Esta morte foi anulada (lan\xE7amento errado). Ela n\xE3o conta nos relat\xF3rios. Se o animal realmente morreu, lance a morte de novo.") : /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement("div", { style: { marginTop: 14 } }, /* @__PURE__ */ React4.createElement("div", { className: "grid2" }, /* @__PURE__ */ React4.createElement(Campo, { campo: CAMPOS.morte.find((c) => c.key === "data"), value: form.data, onChange: mudar, matrizes: [], touros: [] }), /* @__PURE__ */ React4.createElement(Campo, { campo: CAMPOS.morte.find((c) => c.key === "causa"), value: form.causa, onChange: mudar, matrizes: [], touros: [] })), semCadastro && /* @__PURE__ */ React4.createElement("div", { className: "grid2" }, /* @__PURE__ */ React4.createElement(Campo, { campo: { ...CAMPOS.morte.find((c) => c.key === "tipoAnimal"), required: true }, value: form.tipoAnimal, onChange: mudar, matrizes: [], touros: [] }), /* @__PURE__ */ React4.createElement(Campo, { campo: CAMPOS.morte.find((c) => c.key === "brinco"), value: form.brinco, onChange: mudar, matrizes: [], touros: [] })), /* @__PURE__ */ React4.createElement(Campo, { campo: { ...CAMPOS.morte.find((c) => c.key === "observacoes"), label: "Observa\xE7\xE3o (livre)" }, value: form.observacoes, onChange: mudar, matrizes: [], touros: [] })), erro && /* @__PURE__ */ React4.createElement(Aviso, null, erro), anular && /* @__PURE__ */ React4.createElement(Aviso, { tipo: "info" }, "Anular quando a morte foi lan\xE7ada no animal errado ou por engano.", " ", e.matrizId ? `A vaca volta ao status de antes (${e.statusAnterior || "Vazia"}).` : "O animal volta a contar no rebanho.", " A linha fica guardada na planilha, marcada como anulada.", /* @__PURE__ */ React4.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React4.createElement("button", { className: "btn sm", onClick: confirmarAnular, disabled: gravando }, "Sim, anular esta morte"), /* @__PURE__ */ React4.createElement("button", { className: "btn quiet sm", onClick: () => setAnular(false) }, "N\xE3o"))), /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React4.createElement("button", { className: "btn", style: { flex: 1 }, onClick: salvar2, disabled: gravando }, gravando ? /* @__PURE__ */ React4.createElement(Loader22, { size: 17, className: "spin" }) : /* @__PURE__ */ React4.createElement(Save, { size: 17 }), " Salvar corre\xE7\xE3o"), /* @__PURE__ */ React4.createElement("button", { className: "btn quiet", onClick: () => setAnular(true), disabled: gravando }, /* @__PURE__ */ React4.createElement(Undo2, { size: 17 }), " Anular"))));
}
function ListaMortes({ dados, ownerMode, onEditar, onAnular }) {
  const [aberta, setAberta] = useState3(null);
  const [aviso, setAviso] = useState3("");
  const todas = useMemo2(() => listarMortes(dados), [dados]);
  const lista = ownerMode ? todas : todas.filter((x) => x.ativa).slice(0, 6);
  const item = aberta ? todas.find((x) => x.e.id === aberta) : null;
  return /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement("h2", { className: "h2" }, ownerMode ? "Mortes lan\xE7adas" : "\xDAltimas mortes lan\xE7adas", /* @__PURE__ */ React4.createElement("small", null, ownerMode ? `${todas.filter((x) => x.ativa).length} ativa(s) \xB7 toque para corrigir` : "")), aviso && /* @__PURE__ */ React4.createElement(Aviso, { tipo: "ok", onClose: () => setAviso("") }, aviso), /* @__PURE__ */ React4.createElement("div", { className: "sheet", "data-testid": "lista-mortes" }, lista.length === 0 ? /* @__PURE__ */ React4.createElement("div", { className: "empty" }, "Nenhuma morte lan\xE7ada.") : lista.map((x) => {
    const corpo = /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement("span", { className: "two", style: { minWidth: 0 } }, /* @__PURE__ */ React4.createElement("b", null, x.animal, !x.ativa ? " \xB7 anulada" : ""), /* @__PURE__ */ React4.createElement("span", null, [x.e.causa, x.mae ? `m\xE3e ${x.mae}` : "", x.e.observacoes].filter(Boolean).join(" \xB7 "))), /* @__PURE__ */ React4.createElement("span", { className: "m mut" }, formatarDataBR(x.e.data)));
    return ownerMode ? /* @__PURE__ */ React4.createElement("button", { className: "led-r", key: x.e.id, style: { "--cols": "minmax(0,1fr) auto", minHeight: 56, opacity: x.ativa ? 1 : 0.55 }, onClick: () => setAberta(x.e.id), "aria-label": `Abrir morte de ${x.animal}` }, corpo) : /* @__PURE__ */ React4.createElement("div", { className: "led-r", key: x.e.id, style: { "--cols": "minmax(0,1fr) auto", minHeight: 56 } }, corpo);
  })), item && /* @__PURE__ */ React4.createElement(ModalMorte, { key: item.e.id, item, onEditar, onAnular, onFechar: () => setAberta(null), onFeito: setAviso }));
}

// src/telas/Nascimentos.jsx
import React5, { useMemo as useMemo3, useState as useState4 } from "react";
import { Search, Save as Save2, Loader2 as Loader23 } from "lucide-react";
var CHAVES_EDICAO = ["matrizId", "data", "resultadoParto", "sexo", "brincoBezerro", "pelagem", "tipoParto", "observacoes"];
var faltaNoNascimento = (e) => [!e.matrizId && "m\xE3e", !e.sexo && "sexo", !String(e.brincoBezerro ?? "").trim() && "brinco"].filter(Boolean);
function ModalNascimento({ nasc, dados, onEditar, onFechar, onFeito }) {
  const [form, setForm] = useState4(() => Object.fromEntries(CHAVES_EDICAO.map((k) => [k, nasc[k] ?? ""])));
  const [erro, setErro] = useState4("");
  const [gravando, setGravando] = useState4(false);
  const mudar = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErro("");
  };
  async function salvar2() {
    if (gravando) return;
    setGravando(true);
    const r = await onEditar(nasc.id, form);
    setGravando(false);
    if (!r.ok) {
      setErro(r.msg);
      return;
    }
    onFeito(r.msg);
    onFechar();
  }
  const titulo = `Nascimento ${nasc.brincoBezerro ? `da cria ${nasc.brincoBezerro}` : "sem n\xFAmero"}`;
  return /* @__PURE__ */ React5.createElement(Modal, { titulo, onClose: onFechar, rotulo: "Corrigir nascimento" }, /* @__PURE__ */ React5.createElement("p", { className: "sub", style: { marginTop: 0 } }, "Lan\xE7ado em ", nasc.createdAt ? formatarDataBR(String(nasc.createdAt).slice(0, 10)) : "\u2014", ". M\xE3e, sexo e brinco n\xE3o podem ser apagados, s\xF3 trocados. Mudar o brinco leva junto as pesagens, a desmama e a novilha dessa cria."), /* @__PURE__ */ React5.createElement("div", { className: "grid2" }, CAMPOS.nascimento.filter((c) => CHAVES_EDICAO.includes(c.key)).map((c) => /* @__PURE__ */ React5.createElement("div", { key: c.key, style: c.type === "matriz" || c.key === "observacoes" ? { gridColumn: "1 / -1" } : void 0 }, /* @__PURE__ */ React5.createElement(Campo, { campo: c, value: form[c.key], onChange: mudar, matrizes: dados.matrizes, touros: dados.touros })))), erro && /* @__PURE__ */ React5.createElement(Aviso, null, erro), /* @__PURE__ */ React5.createElement("button", { className: "btn wide", onClick: salvar2, disabled: gravando }, gravando ? /* @__PURE__ */ React5.createElement(Loader23, { size: 17, className: "spin" }) : /* @__PURE__ */ React5.createElement(Save2, { size: 17 }), " Salvar corre\xE7\xE3o"));
}
function ListaNascimentos({ dados, onEditar }) {
  const [busca, setBusca] = useState4("");
  const [filtro, setFiltro] = useState4("todos");
  const [aberto, setAberto] = useState4(null);
  const [aviso, setAviso] = useState4("");
  const brincos = useMemo3(() => mapaBrincos(dados.matrizes), [dados.matrizes]);
  const todos = useMemo3(
    () => dados.eventos.filter((e) => e.tipo === "nascimento").sort((a, b) => (b.data || "").localeCompare(a.data || "") || (b.createdAt || "").localeCompare(a.createdAt || "")),
    [dados.eventos]
  );
  const faltando = todos.filter((e) => faltaNoNascimento(e).length > 0);
  const lista = useMemo3(() => {
    const q = busca.trim().toLowerCase();
    return (filtro === "faltando" ? faltando : todos).filter((e) => !q || String(e.brincoBezerro).toLowerCase().includes(q) || String(brincos[e.matrizId] || "").toLowerCase().includes(q));
  }, [todos, faltando, filtro, busca, brincos]);
  const mostradas = lista.slice(0, 40);
  const nasc = aberto ? todos.find((e) => e.id === aberto) : null;
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement("h2", { className: "h2" }, "Nascimentos lan\xE7ados", /* @__PURE__ */ React5.createElement("small", null, todos.length, " no total \xB7 toque para corrigir")), aviso && /* @__PURE__ */ React5.createElement(Aviso, { tipo: "ok", onClose: () => setAviso("") }, aviso), /* @__PURE__ */ React5.createElement("div", { className: "sheet" }, /* @__PURE__ */ React5.createElement("label", { className: "search" }, /* @__PURE__ */ React5.createElement(Search, null), /* @__PURE__ */ React5.createElement("input", { placeholder: "Buscar pelo brinco da cria ou da m\xE3e", "aria-label": "Buscar nascimento", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React5.createElement("div", { className: "filtros" }, /* @__PURE__ */ React5.createElement("div", { className: "seg", role: "group", "aria-label": "Filtrar nascimentos" }, /* @__PURE__ */ React5.createElement("button", { "aria-pressed": filtro === "todos", onClick: () => setFiltro("todos") }, "Todos ", todos.length), /* @__PURE__ */ React5.createElement("button", { "aria-pressed": filtro === "faltando", onClick: () => setFiltro("faltando") }, "Faltando dados ", faltando.length))), mostradas.length === 0 && /* @__PURE__ */ React5.createElement("div", { className: "empty" }, filtro === "faltando" ? "Nenhum nascimento com dado faltando." : "Nenhum nascimento encontrado."), mostradas.map((e) => {
    const falta = faltaNoNascimento(e);
    return /* @__PURE__ */ React5.createElement("button", { key: e.id, className: "led-r", style: { "--cols": "minmax(0,1fr) auto", minHeight: 56 }, onClick: () => setAberto(e.id), "aria-label": `Corrigir nascimento ${e.brincoBezerro || "sem n\xFAmero"}` }, /* @__PURE__ */ React5.createElement("span", { className: "two", style: { minWidth: 0 } }, /* @__PURE__ */ React5.createElement("b", null, e.brincoBezerro ? `Cria ${e.brincoBezerro}` : "Cria sem n\xFAmero", " \xB7 ", e.sexo || "sexo ?", e.resultadoParto === "Natimorto" ? " \xB7 natimorto" : ""), /* @__PURE__ */ React5.createElement("span", null, "m\xE3e ", brincos[e.matrizId] || "?", falta.length ? ` \xB7 falta: ${falta.join(", ")}` : "")), /* @__PURE__ */ React5.createElement("span", { className: "m mut" }, formatarDataBR(e.data)));
  }), lista.length > mostradas.length && /* @__PURE__ */ React5.createElement("div", { className: "empty", style: { fontSize: 13 } }, "Mostrando os ", mostradas.length, " mais recentes de ", lista.length, ". Use a busca para achar os outros.")), nasc && /* @__PURE__ */ React5.createElement(ModalNascimento, { key: nasc.id, nasc, dados, onEditar, onFechar: () => setAberto(null), onFeito: setAviso }));
}

// src/telas/Lancar.jsx
function formularioInicial(tipo, hoje) {
  const f = {};
  (CAMPOS[tipo] || []).forEach((c) => {
    if (c.default) f[c.key] = c.default;
    if (c.key === "data") f.data = hoje;
  });
  return f;
}
function Lancar({
  dados,
  hoje,
  ownerMode,
  preset,
  onSalvar,
  onGravarLote,
  modoTeste,
  onRegistrarMorte,
  onEditarNascimento,
  onEditarMorte,
  onAnularMorte
}) {
  const tiposVisiveis = ORDEM_LANCAR.filter((id) => ownerMode || TIPOS_FUNCIONARIO.includes(id));
  const abas = [
    ...tiposVisiveis.map((id) => ({ id, label: ROTULO_CURTO[id] })),
    ...ownerMode ? [{ id: "lote", label: "Lote por foto" }] : []
  ];
  const [tipo, setTipo] = useState5("nascimento");
  const [form, setForm] = useState5(() => formularioInicial("nascimento", hoje));
  const [erro, setErro] = useState5("");
  const [dup, setDup] = useState5(false);
  const [salvo, setSalvo] = useState5("");
  const [travado, setTravado] = useState5(false);
  const timer2 = useRef3(null);
  const timerTrava = useRef3(null);
  useEffect3(() => () => {
    clearTimeout(timer2.current);
    clearTimeout(timerTrava.current);
  }, []);
  useEffect3(() => {
    if (!preset) return;
    setTipo(preset.tipo);
    setForm({ ...formularioInicial(preset.tipo, hoje), matrizId: preset.matrizId || "" });
    setErro("");
    setDup(false);
    setSalvo("");
  }, [preset && preset.n]);
  useEffect3(() => {
    if (!abas.some((a) => a.id === tipo)) trocarTipo("nascimento");
  }, [ownerMode]);
  function trocarTipo(novo) {
    setTipo(novo);
    setForm(formularioInicial(novo, hoje));
    setErro("");
    setDup(false);
    setSalvo("");
  }
  function atualizar(chave2, valor) {
    setForm((f) => {
      const prox = { ...f, [chave2]: valor };
      if (tipo === "nascimento" && (chave2 === "sexo" || chave2 === "data")) {
        const automatico = !f.brincoBezerro || f.brincoBezerro === f._sug;
        if (automatico) {
          const sug = sugerirBrincoBezerro(prox.data, prox.sexo, dados.eventos);
          prox.brincoBezerro = sug || "";
          prox._sug = sug || "";
        }
      }
      return prox;
    });
  }
  const fichaDesmama = useMemo4(
    () => tipo === "desmama" && form.brincoBezerro && String(form.brincoBezerro).trim() ? fichaAnimal(dados, form.brincoBezerro, form.data || hoje) : null,
    [tipo, form.brincoBezerro, form.data, dados, hoje]
  );
  const idadeAuto = fichaDesmama && fichaDesmama.achado ? fichaDesmama.idade : null;
  const idadeMeses = form._idadeManual ? form._meses : idadeAuto ? String(idadeAuto.meses) : "";
  const idadeDiasTxt = form._idadeManual ? form._dias : idadeAuto ? String(idadeAuto.dias) : "";
  function editarIdade(chave2, valor) {
    setForm((f) => ({ ...f, _idadeManual: true, _meses: chave2 === "m" ? valor : f._idadeManual ? f._meses : idadeMeses, _dias: chave2 === "d" ? valor : f._idadeManual ? f._dias : idadeDiasTxt }));
  }
  function salvar2(forcar) {
    if (travado) return;
    const falt = camposFaltando(tipo, form);
    if (falt.length) {
      setErro(`Falta preencher: ${falt.map((c) => c.label).join(", ")}.`);
      setDup(false);
      return;
    }
    if (!forcar && jaExiste(tipo, form, dados)) {
      setDup(true);
      setErro("");
      return;
    }
    setErro("");
    setDup(false);
    const { _sug, _idadeManual, _meses, _dias, ...limpo } = form;
    if (tipo === "desmama") {
      const nascData = fichaDesmama && fichaDesmama.achado ? fichaDesmama.nascData : "";
      if (_idadeManual && (String(_meses || "").trim() || String(_dias || "").trim())) limpo.idadeDias = diasDeMesesDias(nascData, _meses, _dias);
      else if (idadeAuto) limpo.idadeDias = idadeAuto.totalDias;
      else delete limpo.idadeDias;
    }
    const msg = onSalvar(tipo, limpo);
    setSalvo(msg);
    setForm(formularioInicial(tipo, hoje));
    clearTimeout(timer2.current);
    timer2.current = setTimeout(() => setSalvo(""), 6e3);
    setTravado(true);
    clearTimeout(timerTrava.current);
    timerTrava.current = setTimeout(() => setTravado(false), 1500);
  }
  const ultimos = useMemo4(() => {
    const nasc = dados.eventos.filter((e) => e.tipo === "nascimento" && e.brincoBezerro);
    const recente = (sexo) => nasc.filter((e) => e.sexo === sexo).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0];
    return { Macho: recente("Macho"), "F\xEAmea": recente("F\xEAmea") };
  }, [dados.eventos]);
  const recentes = useMemo4(
    () => [...dados.eventos].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 6),
    [dados.eventos]
  );
  const campos = (CAMPOS[tipo] || []).filter((c) => (!c.showIf || c.showIf(form)) && !(tipo === "desmama" && c.key === "idadeDias"));
  const semMatrizes = dados.matrizes.length === 0 && tipo !== "cadastro";
  return /* @__PURE__ */ React6.createElement("div", { className: "wrap" }, /* @__PURE__ */ React6.createElement("div", { className: "head" }, /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React6.createElement("h1", null, "Lan\xE7ar"))), /* @__PURE__ */ React6.createElement(IndexTabs, { tabs: abas, value: tipo, onChange: trocarTipo, rotulo: "Tipo de lan\xE7amento" }), /* @__PURE__ */ React6.createElement("div", { className: "sheet pad" }, tipo === "lote" ? /* @__PURE__ */ React6.createElement(LoteFoto, { dados, hoje, onGravarLote, modoTeste }) : tipo === "morte" ? /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rotuloEvento(tipo)), /* @__PURE__ */ React6.createElement("p", { className: "sub", style: { marginTop: 0 } }, "Vale para qualquer animal: cria, novilha, vaca, touro ou animal sem cadastro. A vaca que morre sai da lista de vacas."), /* @__PURE__ */ React6.createElement(FormMorte, { dados, hoje, onRegistrar: onRegistrarMorte, modoTeste })) : /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rotuloEvento(tipo)), semMatrizes && /* @__PURE__ */ React6.createElement(Aviso, { tipo: "info" }, ownerMode ? 'Cadastre pelo menos uma matriz em "Nova matriz" para poder lig\xE1-la aos outros lan\xE7amentos.' : "Ainda n\xE3o h\xE1 matrizes no sistema. Fale com o propriet\xE1rio."), tipo === "nascimento" && (ultimos.Macho || ultimos["F\xEAmea"]) && /* @__PURE__ */ React6.createElement("div", { style: { marginBottom: 16 } }, ["F\xEAmea", "Macho"].map((sx) => ultimos[sx] ? /* @__PURE__ */ React6.createElement(Lead, { key: sx, rotulo: sx === "Macho" ? "\xDAltimo macho" : "\xDAltima f\xEAmea", valor: `${ultimos[sx].brincoBezerro} \xB7 ${formatarDataBR(ultimos[sx].data)}` }) : null)), /* @__PURE__ */ React6.createElement("div", { className: "grid2" }, campos.map((c) => /* @__PURE__ */ React6.createElement("div", { key: c.key, style: c.type === "matriz" || c.key === "observacoes" || c.key === "motivo" ? { gridColumn: "1 / -1" } : void 0 }, /* @__PURE__ */ React6.createElement(Campo, { campo: c, value: form[c.key], onChange: atualizar, matrizes: dados.matrizes, touros: dados.touros }), tipo === "desmama" && c.key === "brincoBezerro" && /* @__PURE__ */ React6.createElement(FichaRapida, { ficha: fichaDesmama, digitado: form.brincoBezerro }))), tipo === "desmama" && /* @__PURE__ */ React6.createElement("div", { className: "fld", style: { gridColumn: "1 / -1" }, role: "group", "aria-label": "Idade na desmama" }, /* @__PURE__ */ React6.createElement("span", { className: "lbl", style: { display: "block", font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 6 } }, "Idade na desmama"), /* @__PURE__ */ React6.createElement("div", { className: "idade-md" }, /* @__PURE__ */ React6.createElement("div", { className: "fld", style: { margin: 0 } }, /* @__PURE__ */ React6.createElement("label", { htmlFor: "idade-meses" }, "Meses"), /* @__PURE__ */ React6.createElement("input", { id: "idade-meses", type: "number", inputMode: "numeric", min: "0", value: idadeMeses, onChange: (e) => editarIdade("m", e.target.value) })), /* @__PURE__ */ React6.createElement("div", { className: "fld", style: { margin: 0 } }, /* @__PURE__ */ React6.createElement("label", { htmlFor: "idade-dias" }, "Dias"), /* @__PURE__ */ React6.createElement("input", { id: "idade-dias", type: "number", inputMode: "numeric", min: "0", value: idadeDiasTxt, onChange: (e) => editarIdade("d", e.target.value) }))), /* @__PURE__ */ React6.createElement("div", { className: "hint", style: { fontSize: 12.5, color: "var(--mut)", marginTop: 4 }, "data-testid": "hint-idade" }, form._idadeManual ? /* @__PURE__ */ React6.createElement(React6.Fragment, null, "Idade digitada \xE0 m\xE3o.", idadeAuto ? /* @__PURE__ */ React6.createElement(React6.Fragment, null, " Pelo nascimento seria ", idadeAuto.texto, ". ", /* @__PURE__ */ React6.createElement("button", { type: "button", className: "btn quiet sm", style: { minHeight: 30, marginLeft: 6 }, onClick: () => setForm((f) => ({ ...f, _idadeManual: false, _meses: "", _dias: "" })) }, "Usar a calculada")) : null) : idadeAuto ? `Calculada pelo nascimento (${formatarDataBR(fichaDesmama.nascData)}) at\xE9 a data da desmama. Pode alterar se precisar.` : "Digite o brinco da cria para calcular a idade, ou preencha \xE0 m\xE3o."))), erro && /* @__PURE__ */ React6.createElement(Aviso, null, erro), dup && /* @__PURE__ */ React6.createElement(Aviso, { tipo: "info" }, "Esse lan\xE7amento parece j\xE1 existir (mesma vaca e mesma data). Confira antes de salvar de novo.", /* @__PURE__ */ React6.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React6.createElement("button", { className: "btn sm", onClick: () => salvar2(true), disabled: travado }, "Salvar mesmo assim"), /* @__PURE__ */ React6.createElement("button", { className: "btn quiet sm", onClick: () => setDup(false) }, "Cancelar"))), salvo && /* @__PURE__ */ React6.createElement(Aviso, { tipo: "ok" }, salvo, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), /* @__PURE__ */ React6.createElement("button", { className: "btn wide", onClick: () => salvar2(false), disabled: travado, style: { marginTop: 6 } }, /* @__PURE__ */ React6.createElement(Save3, { size: 18 }), " Salvar registro"))), tipo === "morte" && /* @__PURE__ */ React6.createElement(ListaMortes, { dados, ownerMode, onEditar: onEditarMorte, onAnular: onAnularMorte }), tipo === "nascimento" && ownerMode && /* @__PURE__ */ React6.createElement(ListaNascimentos, { dados, onEditar: onEditarNascimento }), tipo !== "lote" && tipo !== "morte" && !(tipo === "nascimento" && ownerMode) && /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("h2", { className: "h2" }, "\xDAltimos lan\xE7amentos"), /* @__PURE__ */ React6.createElement("div", { className: "sheet" }, recentes.length === 0 ? /* @__PURE__ */ React6.createElement("div", { className: "empty" }, "Nada lan\xE7ado ainda.") : recentes.map((e) => /* @__PURE__ */ React6.createElement("div", { className: "led-r", key: e.id, style: { "--cols": "1fr auto", minHeight: 48 } }, /* @__PURE__ */ React6.createElement("span", { style: { fontSize: 14.5 } }, descreverEvento(e, dados)), /* @__PURE__ */ React6.createElement("span", { className: "m mut" }, formatarDataBR(e.data)))))));
}

// src/telas/Parto.jsx
import React7, { useMemo as useMemo5, useState as useState6 } from "react";
import { Search as Search2 } from "lucide-react";
function textoDias(dias) {
  if (dias === null || dias === void 0) return { t: "\u2014", c: "mut" };
  if (dias < 0) return { t: `\u2212${Math.abs(dias)}`, c: "late" };
  if (dias === 0) return { t: "hoje", c: "late" };
  if (dias <= 15) return { t: `+${dias}`, c: "soon" };
  return { t: `+${dias}`, c: "good" };
}
function Calculo({ info }) {
  if (!info) return null;
  if (info.origem === "toque") return /* @__PURE__ */ React7.createElement(React7.Fragment, null, "C\xE1lculo: toque de ", /* @__PURE__ */ React7.createElement("b", null, formatarDataBR(info.base)), " com ", /* @__PURE__ */ React7.createElement("b", null, info.dg), " dias de gesta\xE7\xE3o, completando ", PERIODO_GESTACAO_DIAS, " dias.");
  if (info.origem === "iatf") return /* @__PURE__ */ React7.createElement(React7.Fragment, null, "C\xE1lculo: IATF de ", /* @__PURE__ */ React7.createElement("b", null, formatarDataBR(info.base)), " mais ", PERIODO_GESTACAO_DIAS, " dias.");
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, "Toque de ", /* @__PURE__ */ React7.createElement("b", null, formatarDataBR(info.base)), " sem os dias de gesta\xE7\xE3o (DG) anotados: n\xE3o d\xE1 para calcular a data.");
}
function Parto({ dados, hoje, onLancar }) {
  const [aba, setAba] = useState6("Cheia");
  const [busca, setBusca] = useState6("");
  const [aberta, setAberta] = useState6(null);
  const todasCheias = useMemo5(() => linhasPrevisao(dados.matrizes, dados.eventos, "Cheia", hoje, ""), [dados, hoje]);
  const nVazias = dados.matrizes.filter((m) => m.status === "Vazia").length;
  const linhas = useMemo5(() => linhasPrevisao(dados.matrizes, dados.eventos, aba, hoje, busca), [dados, aba, hoje, busca]);
  const atrasadas = todasCheias.filter((l) => l.dias !== null && l.dias < 0).length;
  const porVir = todasCheias.filter((l) => l.dias !== null && l.dias >= 0).length;
  const semPrev = todasCheias.filter((l) => l.dias === null).length;
  const vaziasSemParto = useMemo5(() => linhasPrevisao(dados.matrizes, dados.eventos, "Vazia", hoje, "").filter((l) => !l.ultimoParto).length, [dados, hoje]);
  const cols = "84px minmax(0,1fr) 78px 54px";
  return /* @__PURE__ */ React7.createElement("div", { className: "wrap" }, /* @__PURE__ */ React7.createElement("div", { className: "head" }, /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React7.createElement("h1", null, "Previs\xE3o de parto"))), /* @__PURE__ */ React7.createElement(
    IndexTabs,
    {
      rotulo: "Situa\xE7\xE3o",
      value: aba,
      onChange: (v) => {
        setAba(v);
        setAberta(null);
      },
      tabs: [{ id: "Cheia", label: "Cheias", count: todasCheias.length }, { id: "Vazia", label: "Vazias", count: nVazias }]
    }
  ), /* @__PURE__ */ React7.createElement("section", { className: "sheet" }, /* @__PURE__ */ React7.createElement("label", { className: "search" }, /* @__PURE__ */ React7.createElement(Search2, null), /* @__PURE__ */ React7.createElement("input", { placeholder: "Buscar pelo brinco", "aria-label": "Buscar pelo brinco", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React7.createElement("div", { className: "bar-sum" }, aba === "Cheia" ? /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement("span", { className: "late" }, atrasadas, " atrasadas"), /* @__PURE__ */ React7.createElement("span", { className: "good" }, porVir, " por vir"), semPrev > 0 && /* @__PURE__ */ React7.createElement("span", { className: "mut" }, semPrev, " sem previs\xE3o")) : /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement("span", { className: "soon" }, nVazias, " vazias"), vaziasSemParto > 0 && /* @__PURE__ */ React7.createElement("span", { className: "mut" }, vaziasSemParto, " sem parto lan\xE7ado"))), /* @__PURE__ */ React7.createElement("div", { className: "led-h", style: { "--cols": cols } }, /* @__PURE__ */ React7.createElement("span", null, "Brinco"), /* @__PURE__ */ React7.createElement("span", null, "Categoria"), /* @__PURE__ */ React7.createElement("span", null, aba === "Cheia" ? "Previs\xE3o" : "\xDAlt. parto"), /* @__PURE__ */ React7.createElement("span", { className: "r" }, aba === "Cheia" ? "Dias" : "H\xE1 (d)")), linhas.length === 0 && /* @__PURE__ */ React7.createElement("div", { className: "empty" }, busca ? "Nenhuma matriz com esse brinco aqui." : `Nenhuma matriz ${aba === "Cheia" ? "cheia" : "vazia"}.`), linhas.map((l) => {
    const m = l.matriz;
    const dd = aba === "Cheia" ? textoDias(l.dias) : { t: l.diasDesdeParto === null ? "\u2014" : String(l.diasDesdeParto), c: "mut" };
    const data = aba === "Cheia" ? l.previsao : l.ultimoParto;
    const aberto = aberta === m.id;
    return /* @__PURE__ */ React7.createElement(React7.Fragment, { key: m.id }, /* @__PURE__ */ React7.createElement("button", { className: "led-r", style: { "--cols": cols }, "aria-expanded": aberto, onClick: () => setAberta(aberto ? null : m.id) }, /* @__PURE__ */ React7.createElement("span", { className: "b" }, m.brinco), /* @__PURE__ */ React7.createElement("span", { className: "two" }, /* @__PURE__ */ React7.createElement("b", null, m.categoria), /* @__PURE__ */ React7.createElement("span", null, [m.raca, m.lote].filter(Boolean).join(" \xB7 ") || "\u2014")), /* @__PURE__ */ React7.createElement("span", { className: "m" }, data ? formatarDataBR(data) : "\u2014"), /* @__PURE__ */ React7.createElement("span", { className: `r ${dd.c}` }, dd.t)), aberto && /* @__PURE__ */ React7.createElement("div", { className: "detalhe" }, aba === "Cheia" && /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement(Calculo, { info: l.info })), l.ultimoParto ? /* @__PURE__ */ React7.createElement("div", null, "\xDAltimo parto: ", /* @__PURE__ */ React7.createElement("b", null, formatarDataBR(l.ultimoParto)), l.numeroCria ? ` (cria ${l.numeroCria})` : "") : /* @__PURE__ */ React7.createElement("div", null, "Nenhum parto lan\xE7ado para esta vaca."), aba === "Cheia" && l.dias !== null && l.dias < 0 && /* @__PURE__ */ React7.createElement("div", { className: "late", style: { marginTop: 4 } }, "A data prevista j\xE1 passou h\xE1 ", Math.abs(l.dias), " dia(s). Confira se ela j\xE1 pariu."), /* @__PURE__ */ React7.createElement("div", { style: { marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" } }, aba === "Cheia" ? /* @__PURE__ */ React7.createElement("button", { className: "btn sm", onClick: () => onLancar("nascimento", m.id) }, "Lan\xE7ar nascimento desta vaca") : /* @__PURE__ */ React7.createElement("button", { className: "btn sm", onClick: () => onLancar("iatf", m.id) }, "Lan\xE7ar IATF desta vaca"))));
  })), /* @__PURE__ */ React7.createElement("p", { className: "sub", style: { marginTop: 14 } }, "Dias negativos: a data prevista j\xE1 passou. Confira se a vaca pariu e lance o nascimento. A previs\xE3o olha o hist\xF3rico inteiro da vaca, n\xE3o s\xF3 o ano escolhido."));
}

// src/telas/Crias.jsx
import React13, { useState as useState12, useMemo as useMemo11, useEffect as useEffect7 } from "react";

// src/telas/CriasLista.jsx
import React8, { useMemo as useMemo6, useState as useState7, useRef as useRef4, useEffect as useEffect4 } from "react";
import { Search as Search3, Scale, ShoppingCart } from "lucide-react";
var NO_REBANHO = ["mamando", "desmamado", "novilha"];
var FILTROS_SIT = [
  ["rebanho", "No rebanho"],
  ["mamando", "Mamando"],
  ["desmamado", "Desmamadas(os)"],
  ["novilha", "Novilhas"],
  ["matriz", "Viraram matriz"],
  ["vendido", "Vendidas(os)"],
  ["morto", "Mortas(os)"],
  ["orfa", "\xD3rf\xE3s (m\xE3e morreu)"],
  ["todas", "Todas"]
];
var ORDENS = [["nova", "Mais novas primeiro"], ["velha", "Mais velhas primeiro"], ["peso", "Mais pesadas"], ["ganho", "Maior ganho por dia"], ["brinco", "N\xFAmero do brinco"]];
var corSituacao = (s) => s === "vendido" || s === "morto" ? "fora" : s === "mamando" ? "falta" : "pronto";
function CriaFicha({
  c,
  dados,
  hoje,
  ownerMode,
  modoTeste,
  onLancar,
  onVender,
  onSalvarMatriz,
  onFechar,
  onRegistrarMorte,
  onEditarNascimento,
  onEditarMorte,
  onAnularMorte
}) {
  const [peso, setPeso] = useState7("");
  const [data, setData] = useState7(hoje);
  const [confirma, setConfirma] = useState7("");
  const [msg, setMsg] = useState7("");
  const [erro, setErro] = useState7("");
  const [travado, setTravado] = useState7(false);
  const [desmData, setDesmData] = useState7(hoje);
  const [desmPeso, setDesmPeso] = useState7("");
  const [registrandoMorte, setRegistrandoMorte] = useState7(false);
  const [editNasc, setEditNasc] = useState7(false);
  const [editMorte, setEditMorte] = useState7(false);
  const timer2 = useRef4(null);
  useEffect4(() => () => clearTimeout(timer2.current), []);
  function trava() {
    setTravado(true);
    clearTimeout(timer2.current);
    timer2.current = setTimeout(() => setTravado(false), 1500);
  }
  function registrar(forcar) {
    if (travado) return;
    const p = numPeso(peso);
    if (isNaN(p) || p <= 0) {
      setErro("Digite o peso em kg.");
      setConfirma("");
      return;
    }
    if (!data) {
      setErro("Escolha a data da pesagem.");
      return;
    }
    setErro("");
    const form = { brinco: c.brinco, criaId: c.id, data, peso: p };
    if (c.novilha) form.matrizId = c.novilha.id;
    if (!forcar) {
      if (jaExiste("pesagem", form, dados)) {
        setConfirma("Esta cria j\xE1 tem um peso lan\xE7ado nesta data. Confira antes de lan\xE7ar de novo.");
        return;
      }
      const av = avisoDePeso(c.pontos, p, data);
      if (av) {
        setConfirma(av);
        return;
      }
    }
    setConfirma("");
    setMsg(onLancar("pesagem", form));
    setPeso("");
    trava();
  }
  function desmamar() {
    if (travado) return;
    const p = numPeso(desmPeso);
    if (!desmData) {
      setErro("Escolha a data da desmama.");
      return;
    }
    setErro("");
    const form = { brincoBezerro: c.brinco, data: desmData };
    if (!isNaN(p) && p > 0) form.pesoDesmama = p;
    setMsg(onLancar("desmama", form));
    trava();
  }
  const podeDesmamar = ownerMode && c.situacao === "mamando" && c.brinco;
  const hist = [...c.pontos].reverse();
  const morte = c.situacao === "morto" ? listarMortes(dados).find((x) => x.ativa && x.e.criaId === c.id) || null : null;
  return /* @__PURE__ */ React8.createElement(Modal, { titulo: `Cria ${c.brinco || "sem n\xFAmero"}`, onClose: onFechar, rotulo: `Cria ${c.brinco || "sem n\xFAmero"}` }, /* @__PURE__ */ React8.createElement("div", { style: { marginBottom: 6 } }, /* @__PURE__ */ React8.createElement("span", { className: `pill ${corSituacao(c.situacao)}` }, rotuloSituacao(c)), c.orfa && /* @__PURE__ */ React8.createElement("span", { className: "pill alerta", style: { marginLeft: 6 } }, "\xD3rf\xE3")), c.orfa && /* @__PURE__ */ React8.createElement(Aviso, { tipo: "info" }, "Cria \xF3rf\xE3: a m\xE3e ", c.maeBrinco || "?", " morreu", c.maeMortaData ? ` em ${formatarDataBR(c.maeMortaData)}` : "", ". A cria continua normal; os funcion\xE1rios cuidam dela at\xE9 se virar sozinha."), /* @__PURE__ */ React8.createElement(Lead, { rotulo: "Sexo", valor: c.sexo || "\u2014" }), /* @__PURE__ */ React8.createElement(Lead, { rotulo: "Nascimento", valor: `${formatarDataBR(c.nascData)} \xB7 ${fmtIdade(c.idadeDias)}` }), /* @__PURE__ */ React8.createElement(Lead, { rotulo: "M\xE3e", valor: c.maeBrinco ? `${c.maeBrinco}${c.maeMorta ? " (morreu)" : ""}` : "n\xE3o informada" }), /* @__PURE__ */ React8.createElement(Lead, { rotulo: "Origem / pai", valor: c.origem.rotulo }), c.origem.iatfData && /* @__PURE__ */ React8.createElement(Lead, { rotulo: "IATF da m\xE3e", valor: formatarDataBR(c.origem.iatfData) }), c.pelagem && /* @__PURE__ */ React8.createElement(Lead, { rotulo: "Pelagem", valor: c.pelagem }), /* @__PURE__ */ React8.createElement(Lead, { rotulo: "\xDAltimo peso", valor: c.pesoAtual === null ? "sem pesagem" : `${fmtKg(c.pesoAtual)} em ${formatarDataBR(c.pesoData)}` }), /* @__PURE__ */ React8.createElement(Lead, { rotulo: "Ganho recente", valor: fmtGmd(c.gmd) }), c.desmamaData && /* @__PURE__ */ React8.createElement(Lead, { rotulo: "Desmama", valor: formatarDataBR(c.desmamaData) }), c.situacao === "vendido" && /* @__PURE__ */ React8.createElement(Lead, { rotulo: "Baixa (venda)", valor: c.vendaData ? formatarDataBR(c.vendaData) : "vendida" }), c.situacao === "morto" && /* @__PURE__ */ React8.createElement(Lead, { rotulo: "Morte", valor: `${c.mortoData ? formatarDataBR(c.mortoData) : "sem data"} \xB7 ${c.causaMorte || "causa n\xE3o informada"}`, cor: "var(--late)" }), morte && morte.e.observacoes && /* @__PURE__ */ React8.createElement(Lead, { rotulo: "Observa\xE7\xE3o", valor: morte.e.observacoes }), /* @__PURE__ */ React8.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Pesagens", /* @__PURE__ */ React8.createElement("small", null, c.pontos.length, " registro(s)")), hist.length === 0 ? /* @__PURE__ */ React8.createElement("p", { className: "sub" }, "Nenhuma pesagem ainda.") : /* @__PURE__ */ React8.createElement("ul", { className: "hist", "data-testid": "pesagens" }, hist.map((p) => /* @__PURE__ */ React8.createElement("li", { key: p.id }, /* @__PURE__ */ React8.createElement("span", null, fmtKg(p.peso), p.fonte !== "Pesagem" ? ` \xB7 ${p.fonte.toLowerCase()}` : ""), /* @__PURE__ */ React8.createElement("span", null, formatarDataBR(p.data))))), c.ativa && /* @__PURE__ */ React8.createElement("div", { className: "rapido", style: { marginTop: 14 } }, /* @__PURE__ */ React8.createElement("div", { className: "grid2" }, /* @__PURE__ */ React8.createElement("div", { className: "fld" }, /* @__PURE__ */ React8.createElement("label", { htmlFor: "ficha-peso" }, "Peso (kg)"), /* @__PURE__ */ React8.createElement("input", { id: "ficha-peso", type: "number", inputMode: "decimal", value: peso, onChange: (e) => {
    setPeso(e.target.value);
    setConfirma("");
    setErro("");
  }, onKeyDown: (e) => {
    if (e.key === "Enter") registrar(false);
  } })), /* @__PURE__ */ React8.createElement("div", { className: "fld" }, /* @__PURE__ */ React8.createElement("label", { htmlFor: "ficha-data" }, "Data"), /* @__PURE__ */ React8.createElement("input", { id: "ficha-data", type: "date", value: data, onChange: (e) => {
    setData(e.target.value);
    setConfirma("");
  } }))), confirma && /* @__PURE__ */ React8.createElement(Aviso, { tipo: "info" }, confirma, /* @__PURE__ */ React8.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React8.createElement("button", { className: "btn sm", onClick: () => registrar(true), disabled: travado }, "Lan\xE7ar mesmo assim"))), /* @__PURE__ */ React8.createElement("button", { className: "btn wide", onClick: () => registrar(false), disabled: travado }, /* @__PURE__ */ React8.createElement(Scale, { size: 18 }), " Registrar peso")), erro && /* @__PURE__ */ React8.createElement(Aviso, null, erro), msg && /* @__PURE__ */ React8.createElement(Aviso, { tipo: "ok" }, msg), podeDesmamar && /* @__PURE__ */ React8.createElement("div", { className: "rapido" }, /* @__PURE__ */ React8.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Desmama (propriet\xE1rio)"), /* @__PURE__ */ React8.createElement("div", { className: "grid2" }, /* @__PURE__ */ React8.createElement("div", { className: "fld" }, /* @__PURE__ */ React8.createElement("label", { htmlFor: "desm-data" }, "Data da desmama"), /* @__PURE__ */ React8.createElement("input", { id: "desm-data", type: "date", value: desmData, onChange: (e) => setDesmData(e.target.value) })), /* @__PURE__ */ React8.createElement("div", { className: "fld" }, /* @__PURE__ */ React8.createElement("label", { htmlFor: "desm-peso" }, "Peso na desmama (kg)"), /* @__PURE__ */ React8.createElement("input", { id: "desm-peso", type: "number", inputMode: "decimal", value: desmPeso, onChange: (e) => setDesmPeso(e.target.value) }))), /* @__PURE__ */ React8.createElement("button", { className: "btn quiet wide", onClick: desmamar, disabled: travado }, "Desmamar", c.sexo === "F\xEAmea" ? " e levar para as novilhas" : "")), ownerMode && c.situacao === "mamando" && !c.brinco && /* @__PURE__ */ React8.createElement("p", { className: "sub" }, "Para desmamar esta cria, primeiro ela precisa de um n\xFAmero (brinco) no lan\xE7amento do nascimento."), ownerMode && c.novilha && c.ativa && /* @__PURE__ */ React8.createElement("div", { className: "rapido" }, /* @__PURE__ */ React8.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Destino da novilha"), /* @__PURE__ */ React8.createElement("div", { className: "seg", role: "group", "aria-label": "Destino da novilha" }, DESTINOS_NOVILHA.map((d) => /* @__PURE__ */ React8.createElement("button", { key: d, "aria-pressed": c.novilha.destino === d, onClick: () => onSalvarMatriz(definirDestinoNovilha(c.novilha, d)) }, d)))), c.ativa && c.brinco && /* @__PURE__ */ React8.createElement("div", { style: { marginTop: 8 } }, !registrandoMorte ? /* @__PURE__ */ React8.createElement("button", { className: "btn quiet wide", onClick: () => setRegistrandoMorte(true) }, "Registrar morte desta cria") : /* @__PURE__ */ React8.createElement("div", { className: "rapido" }, /* @__PURE__ */ React8.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Morte da cria ", c.brinco), /* @__PURE__ */ React8.createElement(FormMorte, { dados, hoje, brincoFixo: c.brinco, onRegistrar: onRegistrarMorte, modoTeste, aoTerminar: (r) => {
    setRegistrandoMorte(false);
    setMsg(r.msg);
  } }), /* @__PURE__ */ React8.createElement("button", { className: "btn quiet sm", style: { marginTop: 8 }, onClick: () => setRegistrandoMorte(false) }, "Cancelar"))), ownerMode && c.ativa && c.situacao !== "matriz" && /* @__PURE__ */ React8.createElement("button", { className: "btn ghost wide", style: { marginTop: 8 }, onClick: () => {
    onFechar();
    onVender([c.brinco]);
  }, disabled: !c.brinco }, /* @__PURE__ */ React8.createElement(ShoppingCart, { size: 18 }), " Vender ", c.sexo === "F\xEAmea" ? "esta cria" : "este animal"), ownerMode && /* @__PURE__ */ React8.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 } }, /* @__PURE__ */ React8.createElement("button", { className: "btn quiet", style: { flex: 1 }, onClick: () => setEditNasc(true) }, "Corrigir nascimento"), morte && /* @__PURE__ */ React8.createElement("button", { className: "btn quiet", style: { flex: 1 }, onClick: () => setEditMorte(true) }, "Corrigir ou anular a morte")), editNasc && /* @__PURE__ */ React8.createElement(ModalNascimento, { nasc: c.nasc, dados, onEditar: onEditarNascimento, onFechar: () => setEditNasc(false), onFeito: setMsg }), editMorte && morte && /* @__PURE__ */ React8.createElement(ModalMorte, { item: morte, onEditar: onEditarMorte, onAnular: onAnularMorte, onFechar: () => setEditMorte(false), onFeito: setMsg }));
}
function ListaCrias({
  crias,
  dados,
  hoje,
  ownerMode,
  modoTeste,
  onLancar,
  onVender,
  onSalvarMatriz,
  onRegistrarMorte,
  onEditarNascimento,
  onEditarMorte,
  onAnularMorte
}) {
  const [sexo, setSexo] = useState7("todos");
  const [sit, setSit] = useState7("rebanho");
  const [busca, setBusca] = useState7("");
  const [ordem, setOrdem] = useState7("nova");
  const [aberta, setAberta] = useState7(null);
  const porSituacao = useMemo6(() => crias.filter((c) => sit === "todas" ? true : sit === "rebanho" ? NO_REBANHO.includes(c.situacao) : sit === "orfa" ? c.orfa : c.situacao === sit), [crias, sit]);
  const lista = useMemo6(() => {
    const q = busca.trim().toLowerCase();
    const l = porSituacao.filter((c) => sexo === "todos" || c.sexo === sexo).filter((c) => !q || String(c.brinco).toLowerCase().includes(q) || String(c.maeBrinco).toLowerCase().includes(q));
    const brincoCmp = (a, b) => String(a.brinco).localeCompare(String(b.brinco), "pt-BR", { numeric: true });
    const ord = {
      nova: (a, b) => (b.nascData || "").localeCompare(a.nascData || "") || brincoCmp(a, b),
      velha: (a, b) => (a.nascData || "").localeCompare(b.nascData || "") || brincoCmp(a, b),
      peso: (a, b) => (b.pesoAtual ?? -1) - (a.pesoAtual ?? -1) || brincoCmp(a, b),
      ganho: (a, b) => (b.gmd ?? -99) - (a.gmd ?? -99) || brincoCmp(a, b),
      brinco: brincoCmp
    }[ordem];
    return l.slice().sort(ord);
  }, [porSituacao, sexo, busca, ordem]);
  const conta = (sx) => porSituacao.filter((c) => sx === "todos" || c.sexo === sx).length;
  const ficha = aberta ? crias.find((c) => c.id === aberta) : null;
  const semPeso = lista.filter((c) => c.ativa && c.pesoAtual === null).length;
  return /* @__PURE__ */ React8.createElement("section", { className: "sheet" }, /* @__PURE__ */ React8.createElement("label", { className: "search" }, /* @__PURE__ */ React8.createElement(Search3, null), /* @__PURE__ */ React8.createElement("input", { placeholder: "Buscar pelo brinco da cria ou da m\xE3e", "aria-label": "Buscar cria", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React8.createElement("div", { className: "filtros" }, /* @__PURE__ */ React8.createElement("div", { className: "seg", role: "group", "aria-label": "Filtrar por sexo" }, [["todos", "Todas"], ["Macho", "Machos"], ["F\xEAmea", "F\xEAmeas"]].map(([id, rot]) => /* @__PURE__ */ React8.createElement("button", { key: id, "aria-pressed": sexo === id, onClick: () => setSexo(id) }, rot, " ", conta(id))))), /* @__PURE__ */ React8.createElement("div", { className: "filtros" }, /* @__PURE__ */ React8.createElement("select", { "aria-label": "Situa\xE7\xE3o", value: sit, onChange: (e) => setSit(e.target.value) }, FILTROS_SIT.map(([id, rot]) => /* @__PURE__ */ React8.createElement("option", { key: id, value: id }, rot))), /* @__PURE__ */ React8.createElement("select", { "aria-label": "Ordem", value: ordem, onChange: (e) => setOrdem(e.target.value) }, ORDENS.map(([id, rot]) => /* @__PURE__ */ React8.createElement("option", { key: id, value: id }, rot)))), /* @__PURE__ */ React8.createElement("div", { className: "bar-sum" }, /* @__PURE__ */ React8.createElement("span", null, lista.length, " cria(s)"), /* @__PURE__ */ React8.createElement("span", null, semPeso, " sem pesagem")), /* @__PURE__ */ React8.createElement("div", { className: "led-h cols-cria" }, /* @__PURE__ */ React8.createElement("span", null, "Brinco"), /* @__PURE__ */ React8.createElement("span", null, "Cria \xB7 m\xE3e \xB7 origem"), /* @__PURE__ */ React8.createElement("span", { className: "r" }, "Peso"), /* @__PURE__ */ React8.createElement("span", { className: "hide-s" }, "Situa\xE7\xE3o"), /* @__PURE__ */ React8.createElement("span", { className: "hide-s" }, "Pesada em")), lista.length === 0 && /* @__PURE__ */ React8.createElement("div", { className: "empty" }, "Nenhuma cria neste filtro."), lista.map((c) => /* @__PURE__ */ React8.createElement("button", { key: c.id, className: "led-r cols-cria", onClick: () => setAberta(c.id), "aria-label": `Abrir cria ${c.brinco || "sem n\xFAmero"}` }, /* @__PURE__ */ React8.createElement("span", { className: "b" }, c.brinco || "\u2014"), /* @__PURE__ */ React8.createElement("span", { className: "two" }, /* @__PURE__ */ React8.createElement("b", null, c.sexo || "Sexo ?", " \xB7 ", fmtIdade(c.idadeDias), c.orfa ? " \xB7 \xF3rf\xE3" : ""), /* @__PURE__ */ React8.createElement("span", null, "m\xE3e ", c.maeBrinco || "?", c.maeMorta ? " (morreu)" : "", " \xB7 ", c.origem.rotulo)), /* @__PURE__ */ React8.createElement("span", { className: "r" }, c.pesoAtual === null ? /* @__PURE__ */ React8.createElement("span", { className: "mut" }, "\u2014") : fmtKg(c.pesoAtual), c.gmd !== null && /* @__PURE__ */ React8.createElement("div", { style: { font: "500 11.5px var(--body)", color: "var(--mut)" } }, fmtGmd(c.gmd))), /* @__PURE__ */ React8.createElement("span", { className: "hide-s" }, /* @__PURE__ */ React8.createElement("span", { className: `pill ${corSituacao(c.situacao)}` }, rotuloSituacao(c)), c.orfa && /* @__PURE__ */ React8.createElement("span", { className: "pill alerta", style: { marginLeft: 4 } }, "\xD3rf\xE3")), /* @__PURE__ */ React8.createElement("span", { className: "hide-s m mut" }, c.pesoData ? formatarDataBR(c.pesoData) : "\u2014"))), ficha && /* @__PURE__ */ React8.createElement(
    CriaFicha,
    {
      key: ficha.id,
      c: ficha,
      dados,
      hoje,
      ownerMode,
      modoTeste,
      onLancar,
      onVender,
      onSalvarMatriz,
      onRegistrarMorte,
      onEditarNascimento,
      onEditarMorte,
      onAnularMorte,
      onFechar: () => setAberta(null)
    }
  ));
}

// src/telas/CriasPesar.jsx
import React9, { useMemo as useMemo7, useRef as useRef5, useState as useState8, useEffect as useEffect5 } from "react";
import { Plus, Trash2, Save as Save4, Loader2 as Loader25, ClipboardPaste as ClipboardPaste2, FileDown } from "lucide-react";

// src/pdfloader.js
var VERSAO_ARQ = VERSAO_APP.split(" ")[0];
async function baixarPDF(rel, opcoes) {
  const url = new URL(`./pdf.js?v=${VERSAO_ARQ}`, import.meta.url).href;
  const mod = await import(
    /* @vite-ignore */
    url
  );
  return mod.gerarPDF(rel, opcoes);
}

// src/telas/CriasPesar.jsx
var mesmo = (a, b) => String(a).trim() === String(b).trim() || /^\d+$/.test(String(a).trim()) && /^\d+$/.test(String(b).trim()) && Number(a) === Number(b);
var lerRascunho = () => {
  const r = lerLocal(CHAVE_RASCUNHO_PESAR, null);
  return r && Array.isArray(r.linhas) ? r : null;
};
function Pesar({ dados, hoje, crias, ownerMode, modoTeste, onGravarLote }) {
  const rascunho0 = useRef5(lerRascunho());
  const [data, setData] = useState8(() => rascunho0.current && rascunho0.current.linhas.length && rascunho0.current.data || hoje);
  const [modo, setModo] = useState8(() => rascunho0.current && rascunho0.current.linhas.length && ownerMode && rascunho0.current.modo || "pesagem");
  const [brinco, setBrinco] = useState8("");
  const [pesoTxt, setPesoTxt] = useState8("");
  const [linhas, setLinhas] = useState8(() => rascunho0.current ? rascunho0.current.linhas.map((l) => ({ ...l, info: null })) : []);
  const [confDup, setConfDup] = useState8(null);
  const [gerandoPdf, setGerandoPdf] = useState8(false);
  const [erro, setErro] = useState8(null);
  const [resultado, setResultado] = useState8(null);
  const [gravando, setGravando] = useState8(false);
  const [travado, setTravado] = useState8(false);
  const [colar, setColar] = useState8("");
  const brincoRef = useRef5(null);
  const pesoRef = useRef5(null);
  const timer2 = useRef5(null);
  useEffect5(() => () => clearTimeout(timer2.current), []);
  useEffect5(() => {
    if (linhas.length) gravarNoCelular(CHAVE_RASCUNHO_PESAR, { data, modo, linhas: linhas.map(({ info, ...l }) => l), guardadoEm: (/* @__PURE__ */ new Date()).toISOString() });
    else apagarLocal(CHAVE_RASCUNHO_PESAR);
  }, [linhas, data, modo]);
  const infos = useMemo7(() => {
    const mapa = /* @__PURE__ */ new Map();
    linhas.forEach((l) => mapa.set(l.k, fichaAnimal(dados, l.brinco, data || hoje, crias)));
    return mapa;
  }, [linhas, dados, data, hoje, crias]);
  const infoDigitado = useMemo7(() => brinco.trim() ? fichaAnimal(dados, brinco, data || hoje, crias) : null, [brinco, dados, data, hoje, crias]);
  const doDia = useMemo7(() => data ? relatorioPesagemDia(dados, data, hoje) : null, [dados, data, hoje]);
  function preparar(b, p, jaNaLista) {
    const brincoTxt = String(b).trim();
    if (!brincoTxt) return { erro: "Digite o brinco do animal." };
    if (isNaN(p) || p <= 0) return { erro: `Digite o peso de ${brincoTxt}.` };
    const info = infoAnimalVenda(dados, brincoTxt, hoje, crias);
    if (!info.achado) return { erro: `N\xE3o achei o brinco ${brincoTxt}. Confira o n\xFAmero (cria ou novilha).` };
    if (info.jaMorto) return { erro: `O animal ${brincoTxt} morreu${info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : ""}.` };
    if (info.jaVendido) return { erro: `O animal ${brincoTxt} j\xE1 foi vendido${info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ""}.` };
    const naLista = jaNaLista.find((l) => mesmo(l.brinco, brincoTxt));
    if (naLista) return { erro: `O brinco ${brincoTxt} j\xE1 est\xE1 na lista com ${fmtKg(naLista.peso)}. Verifique a duplicidade.` };
    const linha = { k: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, brinco: info.brinco, peso: p };
    if (modo === "pesagem" && data) {
      const f = fichaAnimal(dados, info.brinco, data, crias);
      if (f.mesmaData.length) return { linha, mesmaData: f.mesmaData };
    }
    return { linha };
  }
  function limparDigitacao() {
    setBrinco("");
    setPesoTxt("");
    if (brincoRef.current) brincoRef.current.focus();
  }
  function adicionar() {
    const r = preparar(brinco, numPeso(pesoTxt), linhas);
    if (r.erro) {
      setErro({ texto: r.erro });
      return;
    }
    setErro(null);
    setResultado(null);
    if (r.mesmaData) {
      setConfDup({ linha: r.linha, mesmaData: r.mesmaData });
      return;
    }
    setLinhas((ls) => [...ls, r.linha]);
    limparDigitacao();
  }
  function confirmarDup(sim) {
    if (sim && confDup) setLinhas((ls) => [...ls, { ...confDup.linha, forcar: true }]);
    setConfDup(null);
    limparDigitacao();
  }
  async function pdfDoDia() {
    if (!doDia || gerandoPdf) return;
    setGerandoPdf(true);
    try {
      await baixarPDF(doDia, { arquivo: `pesagem-${data}.pdf` });
    } catch (e) {
      console.error("Erro ao gerar PDF", e);
      setErro({ texto: "N\xE3o consegui gerar o PDF agora. Abra o app uma vez com internet (para guardar o gerador de PDF no celular) e tente de novo." });
    }
    setGerandoPdf(false);
  }
  function adicionarColado() {
    const { itens: itens2, erros } = lerListaPesos(colar);
    const novas = [];
    const sobras = [...erros];
    const problemas = erros.map((t) => `N\xE3o entendi a linha "${t}". Use o brinco e o peso, por exemplo: 6532 245`);
    itens2.forEach((it) => {
      const r = preparar(it.brinco, it.peso, [...linhas, ...novas]);
      if (r.erro) {
        problemas.push(r.erro);
        sobras.push(`${it.brinco} ${it.peso}`);
        return;
      }
      if (r.mesmaData) {
        problemas.push(`${it.brinco} j\xE1 foi pesado em ${formatarDataBR(data)} com ${r.mesmaData.map((x) => fmtKg(x.peso)).join(" e ")}. Verifique a duplicidade (para lan\xE7ar mesmo assim, digite ele na linha de cima).`);
        sobras.push(`${it.brinco} ${it.peso}`);
        return;
      }
      novas.push(r.linha);
    });
    if (novas.length) setLinhas((ls) => [...ls, ...novas]);
    setResultado(null);
    setErro(problemas.length ? { texto: `${novas.length} animal(is) adicionado(s). N\xE3o entraram:`, itens: problemas } : null);
    setColar(sobras.join("\n"));
  }
  async function gravar() {
    if (gravando || travado || linhas.length === 0) return;
    if (!data) {
      setErro({ texto: "Escolha a data da pesagem." });
      return;
    }
    const itens2 = linhas.map((l) => ({ tipo: modo, brincoCria: l.brinco, data, peso: l.peso, ...l.forcar && modo === "pesagem" ? { forcar: true } : {} }));
    const res = aplicarLote(dados, itens2, { hoje });
    if (res.aplicados.length === 0) {
      setErro({ texto: "Nada foi gravado:", itens: res.rejeitados.map((r2) => `${itens2[r2.indice].brincoCria}: ${r2.motivo}`) });
      return;
    }
    setGravando(true);
    setErro(null);
    const r = await onGravarLote(res, modo === "desmama" ? `desmama de ${res.aplicados.length}` : `pesagem de ${res.aplicados.length}`);
    setGravando(false);
    if (!r.ok) {
      setErro({ texto: r.msg });
      return;
    }
    const okIdx = new Set(res.aplicados.map((a) => a.indice));
    setLinhas((ls) => ls.filter((_, i) => !okIdx.has(i)));
    setResultado({
      qtd: res.aplicados.length,
      novilhas: res.matrizesParaGravar.length,
      modo,
      offline: !!r.offline,
      rejeitados: res.rejeitados.map((x) => `${itens2[x.indice].brincoCria}: ${x.motivo}`)
    });
    setTravado(true);
    clearTimeout(timer2.current);
    timer2.current = setTimeout(() => setTravado(false), 1500);
  }
  const total = linhas.reduce((s, l) => s + l.peso, 0);
  return /* @__PURE__ */ React9.createElement("section", { className: "sheet pad" }, /* @__PURE__ */ React9.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Pesar"), /* @__PURE__ */ React9.createElement("p", { className: "sub" }, "Escolha a data, digite o brinco e o peso de cada animal e grave tudo de uma vez. Serve para crias e para novilhas."), /* @__PURE__ */ React9.createElement("div", { className: "grid2" }, /* @__PURE__ */ React9.createElement("div", { className: "fld" }, /* @__PURE__ */ React9.createElement("label", { htmlFor: "pesar-data" }, "Data da pesagem"), /* @__PURE__ */ React9.createElement("input", { id: "pesar-data", type: "date", value: data, onChange: (e) => setData(e.target.value) })), ownerMode && /* @__PURE__ */ React9.createElement("div", { className: "fld", role: "group", "aria-label": "Tipo de pesagem" }, /* @__PURE__ */ React9.createElement("span", { className: "lbl", style: { display: "block", font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 6 } }, "O que \xE9 esta pesagem"), /* @__PURE__ */ React9.createElement("div", { className: "seg" }, /* @__PURE__ */ React9.createElement("button", { type: "button", "aria-pressed": modo === "pesagem", onClick: () => {
    setModo("pesagem");
    setResultado(null);
  } }, "S\xF3 pesar"), /* @__PURE__ */ React9.createElement("button", { type: "button", "aria-pressed": modo === "desmama", onClick: () => {
    setModo("desmama");
    setResultado(null);
  } }, "Desmama")))), modo === "desmama" && /* @__PURE__ */ React9.createElement(Aviso, { tipo: "info" }, 'Modo desmama: cada peso vira o peso da desmama. As f\xEAmeas passam para o lote de novilhas (destino "a definir").'), /* @__PURE__ */ React9.createElement("div", { className: "linha-add" }, /* @__PURE__ */ React9.createElement("div", { className: "fld" }, /* @__PURE__ */ React9.createElement("label", { htmlFor: "pesar-brinco" }, "Brinco"), /* @__PURE__ */ React9.createElement(
    "input",
    {
      id: "pesar-brinco",
      ref: brincoRef,
      type: "text",
      inputMode: "numeric",
      autoComplete: "off",
      value: brinco,
      onChange: (e) => {
        setBrinco(e.target.value);
        setErro(null);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (pesoRef.current) pesoRef.current.focus();
        }
      }
    }
  )), /* @__PURE__ */ React9.createElement("div", { className: "fld" }, /* @__PURE__ */ React9.createElement("label", { htmlFor: "pesar-peso" }, "Peso (kg)"), /* @__PURE__ */ React9.createElement(
    "input",
    {
      id: "pesar-peso",
      ref: pesoRef,
      type: "text",
      inputMode: "decimal",
      autoComplete: "off",
      value: pesoTxt,
      onChange: (e) => {
        setPesoTxt(e.target.value);
        setErro(null);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          adicionar();
        }
      }
    }
  )), /* @__PURE__ */ React9.createElement("button", { className: "btn", onClick: adicionar, "aria-label": "Adicionar \xE0 lista" }, /* @__PURE__ */ React9.createElement(Plus, { size: 20 }))), /* @__PURE__ */ React9.createElement("div", { style: { minHeight: 8 } }, /* @__PURE__ */ React9.createElement(FichaRapida, { ficha: infoDigitado, digitado: brinco })), confDup && /* @__PURE__ */ React9.createElement(Aviso, { tipo: "info" }, /* @__PURE__ */ React9.createElement("div", { "data-testid": "aviso-duplicado" }, /* @__PURE__ */ React9.createElement("b", null, confDup.linha.brinco), " j\xE1 foi pesado em ", formatarDataBR(data), " com ", confDup.mesmaData.map((x) => fmtKg(x.peso)).join(" e "), ". Verifique a duplicidade.", " ", "Se lan\xE7ar mesmo assim, ele fica com os dois pesos nesta data (", confDup.mesmaData.map((x) => fmtKg(x.peso)).join(", "), " e ", fmtKg(confDup.linha.peso), "), marcado como pesado 2x."), /* @__PURE__ */ React9.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React9.createElement("button", { className: "btn quiet sm", onClick: () => confirmarDup(false) }, "Cancelar"), /* @__PURE__ */ React9.createElement("button", { className: "btn sm", onClick: () => confirmarDup(true) }, "Lan\xE7ar mesmo assim"))), erro && /* @__PURE__ */ React9.createElement(Aviso, null, erro.texto, erro.itens && /* @__PURE__ */ React9.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 } }, erro.itens.map((t, i) => /* @__PURE__ */ React9.createElement("li", { key: i }, t)))), /* @__PURE__ */ React9.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Na lista", /* @__PURE__ */ React9.createElement("small", null, linhas.length, " animal(is)", linhas.length ? ` \xB7 ${fmtKg(total)} no total` : "")), linhas.length === 0 ? /* @__PURE__ */ React9.createElement("p", { className: "sub" }, "Nenhum animal na lista ainda.") : /* @__PURE__ */ React9.createElement("div", { "data-testid": "lista-pesar" }, linhas.map((l) => {
    const info = infos.get(l.k) || { pontos: [], mesmaData: [] };
    const aviso = info.achado ? avisoDePeso((info.pontos || []).filter((p) => p.data !== data), l.peso, data) : "Brinco n\xE3o encontrado.";
    const ant = info.pesoAnterior;
    const dif = ant ? l.peso - ant.peso : null;
    const outros = modo === "pesagem" ? info.mesmaData || [] : [];
    const desc = [info.sexo, info.idade ? info.idade.texto : "", info.maeBrinco ? `m\xE3e ${info.maeBrinco}` : ""].filter(Boolean).join(" \xB7 ");
    return /* @__PURE__ */ React9.createElement("div", { className: "item-lin", key: l.k, "data-testid": `linha-${l.brinco}` }, /* @__PURE__ */ React9.createElement("div", { className: "t" }, /* @__PURE__ */ React9.createElement("b", null, l.brinco, outros.length ? /* @__PURE__ */ React9.createElement("span", { className: "tag2x" }, outros.length + 1, "x") : null), /* @__PURE__ */ React9.createElement("span", null, desc, dif !== null ? ` \xB7 ${dif >= 0 ? "+" : ""}${fmtKg(dif)} desde ${formatarDataBR(ant.data)}` : " \xB7 primeira pesagem"), outros.length > 0 && /* @__PURE__ */ React9.createElement("span", { style: { color: "var(--amber)" } }, "J\xE1 pesado nesta data com ", outros.map((x) => fmtKg(x.peso)).join(" e "), ".", l.forcar ? " Vai gravar os dois pesos (2x)." : " Verifique a duplicidade.", !l.forcar && /* @__PURE__ */ React9.createElement("button", { className: "btn quiet sm", style: { marginLeft: 8, minHeight: 32 }, onClick: () => setLinhas((ls) => ls.map((x) => x.k === l.k ? { ...x, forcar: true } : x)) }, "Lan\xE7ar mesmo assim")), aviso && /* @__PURE__ */ React9.createElement("span", { style: { color: "var(--amber)" } }, aviso)), /* @__PURE__ */ React9.createElement("div", { className: "p" }, fmtKg(l.peso)), /* @__PURE__ */ React9.createElement("button", { className: "x-peq", onClick: () => setLinhas((ls) => ls.filter((x) => x.k !== l.k)), "aria-label": `Tirar ${l.brinco} da lista` }, /* @__PURE__ */ React9.createElement(Trash2, { size: 17 })));
  })), /* @__PURE__ */ React9.createElement("button", { className: "btn wide", style: { marginTop: 12 }, onClick: gravar, disabled: gravando || travado || linhas.length === 0 }, gravando ? /* @__PURE__ */ React9.createElement(Loader25, { size: 18, className: "spin" }) : /* @__PURE__ */ React9.createElement(Save4, { size: 18 }), gravando ? "Gravando..." : modo === "desmama" ? `Gravar ${linhas.length} desmama(s)` : `Gravar ${linhas.length} pesagem(ns)`), resultado && /* @__PURE__ */ React9.createElement(Aviso, { tipo: "ok" }, resultado.modo === "desmama" ? `${resultado.qtd} desmama(s) gravada(s)` : `${resultado.qtd} pesagem(ns) gravada(s)`, resultado.novilhas > 0 ? `; ${resultado.novilhas} novilha(s) entraram no lote de novilhas` : "", ".", resultado.offline ? " Sem internet: ficou guardado neste celular e vai para a planilha quando a internet voltar." : "", modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : "", resultado.rejeitados.length > 0 && /* @__PURE__ */ React9.createElement(React9.Fragment, null, /* @__PURE__ */ React9.createElement("div", { style: { marginTop: 6 } }, "N\xE3o gravadas (continuam na lista):"), /* @__PURE__ */ React9.createElement("ul", { style: { margin: "4px 0 0", paddingLeft: 18 } }, resultado.rejeitados.map((t, i) => /* @__PURE__ */ React9.createElement("li", { key: i }, t))))), /* @__PURE__ */ React9.createElement("div", { className: "sheet", style: { marginTop: 16, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" } }, /* @__PURE__ */ React9.createElement("span", { style: { fontSize: 14 }, "data-testid": "resumo-dia" }, doDia && doDia.secoes[0].linhas.length ? /* @__PURE__ */ React9.createElement(React9.Fragment, null, "J\xE1 gravados em ", /* @__PURE__ */ React9.createElement("b", null, formatarDataBR(data)), ": ", doDia.resumo[0].valor, " pesagem(ns), m\xE9dia ", doDia.resumo[3].valor, doDia.resumo[6].valor !== "nenhum" ? /* @__PURE__ */ React9.createElement(React9.Fragment, null, ", ", /* @__PURE__ */ React9.createElement("b", { style: { color: "var(--amber)" } }, "2x: ", doDia.resumo[6].valor)) : null) : /* @__PURE__ */ React9.createElement(React9.Fragment, null, "Nada gravado em ", data ? formatarDataBR(data) : "esta data", " ainda.")), /* @__PURE__ */ React9.createElement("button", { className: "btn ghost sm", onClick: pdfDoDia, disabled: !doDia || !doDia.secoes[0].linhas.length || gerandoPdf }, gerandoPdf ? /* @__PURE__ */ React9.createElement(Loader25, { size: 16, className: "spin" }) : /* @__PURE__ */ React9.createElement(FileDown, { size: 16 }), " PDF da pesagem")), /* @__PURE__ */ React9.createElement("details", { className: "ferr noprint" }, /* @__PURE__ */ React9.createElement("summary", null, /* @__PURE__ */ React9.createElement(ClipboardPaste2, { size: 15, style: { marginRight: 8 } }), " Colar uma lista pronta"), /* @__PURE__ */ React9.createElement("div", { className: "in2", style: { display: "block" } }, /* @__PURE__ */ React9.createElement("p", { className: "sub" }, "Um animal por linha: o brinco e o peso (ex.: 6532 245). Depois toque em adicionar e confira a lista antes de gravar."), /* @__PURE__ */ React9.createElement("div", { className: "fld" }, /* @__PURE__ */ React9.createElement("label", { htmlFor: "pesar-colar" }, "Lista"), /* @__PURE__ */ React9.createElement("textarea", { id: "pesar-colar", style: { minHeight: 120 }, value: colar, onChange: (e) => setColar(e.target.value), placeholder: "6532 245\n6533 250,5", spellCheck: false })), /* @__PURE__ */ React9.createElement("button", { className: "btn quiet", onClick: adicionarColado, disabled: !colar.trim() }, "Adicionar \xE0 lista"))));
}

// src/telas/CriasParaVender.jsx
import React10, { useMemo as useMemo8, useState as useState9 } from "react";
import { ShoppingCart as ShoppingCart2, Save as Save5 } from "lucide-react";
var txt = (v) => v === null || v === void 0 ? "" : String(v);
function ParaVender({ crias, dados, onSalvarConfig, onVender, modoTeste, hoje }) {
  const cfg = useMemo8(() => configCompleta(dados.config), [dados.config]);
  const [metaPeso, setMetaPeso] = useState9(txt(cfg.metaPesoMacho));
  const [metaQtd, setMetaQtd] = useState9(txt(cfg.metaQtdMacho));
  const [pesoMatriz, setPesoMatriz] = useState9(txt(cfg.pesoMatriz));
  const [salvo, setSalvo] = useState9("");
  const [erro, setErro] = useState9("");
  const [valorKg, setValorKg] = useState9("");
  const [filtro, setFiltro] = useState9(cfg.metaPesoMacho ? "prontos" : "todos");
  const [marcados, setMarcados] = useState9(() => /* @__PURE__ */ new Set());
  const an = useMemo8(() => analiseMachos(crias, dados.config), [crias, dados.config]);
  function salvarMetas() {
    const mp = metaPeso.trim() === "" ? "" : numPeso(metaPeso);
    const mq = metaQtd.trim() === "" ? "" : numPeso(metaQtd);
    const pm = pesoMatriz.trim() === "" ? "" : numPeso(pesoMatriz);
    if ([mp, mq, pm].some((x) => x !== "" && (isNaN(x) || x <= 0))) {
      setErro("Use s\xF3 n\xFAmeros maiores que zero, ou deixe o campo em branco.");
      setSalvo("");
      return;
    }
    setErro("");
    onSalvarConfig({ metaPesoMacho: mp, metaQtdMacho: mq, pesoMatriz: pm === "" ? 280 : pm });
    setSalvo("Metas salvas.");
    if (mp !== "" && filtro === "todos") setFiltro("prontos");
  }
  const linhas = an.linhas.filter((l) => filtro === "prontos" ? l.pronto : filtro === "semPeso" ? l.cria.pesoAtual === null : true);
  const prontos = an.linhas.filter((l) => l.pronto);
  const vkg = numPeso(valorKg);
  function alternar(id) {
    setMarcados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function marcarProntos() {
    setMarcados(new Set(prontos.map((l) => l.cria.id)));
  }
  const escolhidos = an.linhas.filter((l) => marcados.has(l.cria.id));
  const semNumero = escolhidos.filter((l) => !l.cria.brinco).length;
  let projecao = null;
  if (an.cfg.metaPesoMacho && an.cfg.metaQtdMacho) {
    if (an.metaQtdAtingida) projecao = `A meta de ${an.cfg.metaQtdMacho} machos no peso j\xE1 foi atingida: h\xE1 ${an.prontos} prontos.`;
    else if (an.diasParaMetaQtd !== null) projecao = `No ritmo de ganho atual, a meta de ${an.cfg.metaQtdMacho} machos no peso de ${fmtKg(an.cfg.metaPesoMacho)} deve ser atingida em cerca de ${an.diasParaMetaQtd} dias (por volta de ${formatarDataBR(addDias(hoje, an.diasParaMetaQtd))}).`;
    else projecao = "Ainda n\xE3o d\xE1 para projetar quando a meta ser\xE1 atingida: faltam pesagens para calcular o ganho de peso.";
  }
  return /* @__PURE__ */ React10.createElement("section", { className: "sheet pad" }, /* @__PURE__ */ React10.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Para vender"), /* @__PURE__ */ React10.createElement("p", { className: "sub" }, "Defina o peso alvo e a quantidade para negociar. A tela mostra quais machos j\xE1 est\xE3o no peso e quando os outros devem chegar."), /* @__PURE__ */ React10.createElement("div", { className: "rapido" }, /* @__PURE__ */ React10.createElement("div", { className: "grid2" }, /* @__PURE__ */ React10.createElement("div", { className: "fld" }, /* @__PURE__ */ React10.createElement("label", { htmlFor: "meta-peso" }, "Peso alvo dos machos (kg)"), /* @__PURE__ */ React10.createElement("input", { id: "meta-peso", type: "text", inputMode: "decimal", value: metaPeso, onChange: (e) => {
    setMetaPeso(e.target.value);
    setSalvo("");
  }, placeholder: "ex.: 250" })), /* @__PURE__ */ React10.createElement("div", { className: "fld" }, /* @__PURE__ */ React10.createElement("label", { htmlFor: "meta-qtd" }, "Quantidade para negociar"), /* @__PURE__ */ React10.createElement("input", { id: "meta-qtd", type: "text", inputMode: "numeric", value: metaQtd, onChange: (e) => {
    setMetaQtd(e.target.value);
    setSalvo("");
  }, placeholder: "ex.: 30" }))), /* @__PURE__ */ React10.createElement("div", { className: "fld" }, /* @__PURE__ */ React10.createElement("label", { htmlFor: "meta-matriz" }, "Peso para a novilha virar matriz (kg)"), /* @__PURE__ */ React10.createElement("input", { id: "meta-matriz", type: "text", inputMode: "decimal", value: pesoMatriz, onChange: (e) => {
    setPesoMatriz(e.target.value);
    setSalvo("");
  } })), /* @__PURE__ */ React10.createElement("button", { className: "btn quiet", onClick: salvarMetas }, /* @__PURE__ */ React10.createElement(Save5, { size: 17 }), " Salvar metas"), salvo && /* @__PURE__ */ React10.createElement(Aviso, { tipo: "ok" }, salvo, modoTeste ? " (modo teste: s\xF3 na tela)" : ""), erro && /* @__PURE__ */ React10.createElement(Aviso, null, erro)), /* @__PURE__ */ React10.createElement(Kpis, { itens: [
    { rotulo: "Machos no rebanho", valor: an.total, sub: `${an.semPeso} sem pesagem` },
    { rotulo: "Peso m\xE9dio", valor: an.pesoMedio === null ? "\u2014" : fmtKg(an.pesoMedio), pequeno: true },
    { rotulo: an.cfg.metaPesoMacho ? `No peso (${fmtNum(an.cfg.metaPesoMacho, 0)} kg ou mais)` : "No peso alvo", valor: an.cfg.metaPesoMacho ? an.prontos : "\u2014", cor: an.prontos ? "var(--green)" : void 0, sub: an.cfg.metaQtdMacho ? `meta ${an.cfg.metaQtdMacho} \xB7 faltam ${an.faltamQtd}` : void 0 },
    { rotulo: "Chegam ao peso", valor: an.cfg.metaPesoMacho ? `${an.prox30} em 30d` : "\u2014", pequeno: true, sub: an.cfg.metaPesoMacho ? `${an.prox60} em 60 dias` : "defina o peso alvo" }
  ] }), !an.cfg.metaPesoMacho && /* @__PURE__ */ React10.createElement(Aviso, { tipo: "info" }, "Digite o peso alvo acima e salve para ver quais machos j\xE1 est\xE3o prontos."), projecao && /* @__PURE__ */ React10.createElement("p", { className: "sub", style: { marginTop: 10 } }, projecao), an.prontos > 0 && /* @__PURE__ */ React10.createElement("div", { className: "rapido", style: { marginTop: 12 } }, /* @__PURE__ */ React10.createElement("div", { className: "grid2" }, /* @__PURE__ */ React10.createElement("div", { className: "fld" }, /* @__PURE__ */ React10.createElement("label", { htmlFor: "vkg-est" }, "Valor do kg para uma estimativa (R$)"), /* @__PURE__ */ React10.createElement("input", { id: "vkg-est", type: "text", inputMode: "decimal", value: valorKg, onChange: (e) => setValorKg(e.target.value), placeholder: "ex.: 12,50" })), /* @__PURE__ */ React10.createElement("div", { className: "fld" }, /* @__PURE__ */ React10.createElement("span", { className: "lbl", style: { display: "block", font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 6 } }, "Prontos hoje"), /* @__PURE__ */ React10.createElement("div", { style: { fontSize: 15, lineHeight: 1.4 } }, /* @__PURE__ */ React10.createElement("b", null, an.prontos), " animais \xB7 ", /* @__PURE__ */ React10.createElement("b", null, fmtKg(an.kgProntos)), " (m\xE9dia ", fmtKg(an.pesoMedioProntos), ")", vkg > 0 && /* @__PURE__ */ React10.createElement("div", null, "\u2248 ", /* @__PURE__ */ React10.createElement("b", null, fmtBRL(an.kgProntos * vkg)), " (estimativa)"))))), /* @__PURE__ */ React10.createElement("div", { className: "seg", style: { margin: "16px 0 10px" }, role: "group", "aria-label": "Quais machos mostrar" }, /* @__PURE__ */ React10.createElement("button", { "aria-pressed": filtro === "prontos", onClick: () => setFiltro("prontos") }, "Prontos ", an.prontos), /* @__PURE__ */ React10.createElement("button", { "aria-pressed": filtro === "todos", onClick: () => setFiltro("todos") }, "Todos ", an.total), /* @__PURE__ */ React10.createElement("button", { "aria-pressed": filtro === "semPeso", onClick: () => setFiltro("semPeso") }, "Sem peso ", an.semPeso)), /* @__PURE__ */ React10.createElement("div", { className: "sheet", style: { boxShadow: "none", borderRadius: 8 } }, /* @__PURE__ */ React10.createElement("div", { className: "bar-sum" }, /* @__PURE__ */ React10.createElement("span", null, linhas.length, " macho(s)"), /* @__PURE__ */ React10.createElement("span", null, escolhidos.length, " marcado(s)")), linhas.length === 0 && /* @__PURE__ */ React10.createElement("div", { className: "empty" }, filtro === "prontos" ? "Nenhum macho no peso alvo ainda." : "Nenhum macho neste filtro."), linhas.map((l) => {
    const c = l.cria;
    const faltam = an.cfg.metaPesoMacho && c.pesoAtual !== null && !l.pronto ? an.cfg.metaPesoMacho - c.pesoAtual : null;
    const status = c.pesoAtual === null ? "sem pesagem" : l.pronto ? "no peso" : `faltam ${fmtNum(faltam, 1)} kg${l.dias ? ` \xB7 ~${l.dias} dias` : ""}`;
    return /* @__PURE__ */ React10.createElement("div", { className: "sel-row cols-vender", key: c.id }, /* @__PURE__ */ React10.createElement("input", { type: "checkbox", className: "chk", checked: marcados.has(c.id), onChange: () => alternar(c.id), "aria-label": `Marcar ${c.brinco || "cria sem n\xFAmero"}`, disabled: !c.brinco }), /* @__PURE__ */ React10.createElement("span", { className: "b", style: { font: "600 17px var(--mono)" } }, c.brinco || "\u2014"), /* @__PURE__ */ React10.createElement("span", { className: "two", style: { display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 } }, /* @__PURE__ */ React10.createElement("b", { style: { fontWeight: 600, fontSize: 15 } }, fmtIdade(c.idadeDias)), /* @__PURE__ */ React10.createElement("span", { style: { color: l.pronto ? "var(--green)" : "var(--mut)" } }, "m\xE3e ", c.maeBrinco || "?", " \xB7 ", status)), /* @__PURE__ */ React10.createElement("span", { className: "r", style: { textAlign: "right", font: "600 15px var(--mono)" } }, c.pesoAtual === null ? "\u2014" : fmtKg(c.pesoAtual)), /* @__PURE__ */ React10.createElement("span", { className: "hide-s" }, /* @__PURE__ */ React10.createElement("span", { className: `pill ${l.pronto ? "pronto" : c.pesoAtual === null ? "fora" : "falta"}` }, l.pronto ? "pronto" : c.pesoAtual === null ? "sem peso" : "em ganho")), /* @__PURE__ */ React10.createElement("span", { className: "hide-s m mut" }, fmtGmd(c.gmd)));
  })), /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 } }, /* @__PURE__ */ React10.createElement("button", { className: "btn quiet sm", onClick: marcarProntos, disabled: !prontos.length }, "Marcar todos os prontos"), /* @__PURE__ */ React10.createElement("button", { className: "btn quiet sm", onClick: () => setMarcados(/* @__PURE__ */ new Set()), disabled: !marcados.size }, "Limpar"), /* @__PURE__ */ React10.createElement("button", { className: "btn", style: { marginLeft: "auto" }, disabled: !escolhidos.length, onClick: () => onVender(escolhidos.filter((l) => l.cria.brinco).map((l) => l.cria.brinco)) }, /* @__PURE__ */ React10.createElement(ShoppingCart2, { size: 18 }), " Vender ", escolhidos.length ? `os ${escolhidos.length} marcados` : "marcados")), semNumero > 0 && /* @__PURE__ */ React10.createElement("p", { className: "sub" }, semNumero, " marcado(s) sem n\xFAmero de brinco ficam de fora da venda."));
}

// src/telas/CriasVendas.jsx
import React11, { useEffect as useEffect6, useMemo as useMemo9, useRef as useRef6, useState as useState10 } from "react";
import { Plus as Plus2, Trash2 as Trash22, ShoppingCart as ShoppingCart3, Loader2 as Loader26, ChevronDown, ChevronUp, Scale as Scale2 } from "lucide-react";
var contador = 0;
var novaLinha = (extra) => ({ k: `l${Date.now()}-${++contador}`, brinco: "", tipoAnimal: "", peso: "", tipoManual: false, ...extra });
function LinhaVenda({ n, linha, dados, hoje, crias, onMudar, onTirar, onEnterPeso }) {
  const info = useMemo9(
    () => linha.brinco.trim() ? infoAnimalVenda(dados, linha.brinco, hoje, crias) : null,
    [linha.brinco, dados, hoje, crias]
  );
  const ruim = info && (!info.achado || info.jaVendido);
  let texto = "";
  if (info && info.achado && !info.jaVendido) {
    texto = `${info.descricao}${info.pesoUltimo ? ` \xB7 \xFAltimo peso ${fmtKg(info.pesoUltimo)} em ${formatarDataBR(info.pesoData)}` : " \xB7 sem pesagem"}`;
  } else if (info && info.achado && info.jaVendido) {
    texto = `Este animal j\xE1 foi vendido${info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ""}.`;
  } else if (info && linha.brinco.trim().length >= 3) {
    texto = "N\xFAmero n\xE3o encontrado no sistema: a venda \xE9 registrada, mas sem dar baixa em ningu\xE9m.";
  }
  return /* @__PURE__ */ React11.createElement("div", { className: "vlin", "data-testid": "linha-venda" }, /* @__PURE__ */ React11.createElement("div", { className: "l1" }, /* @__PURE__ */ React11.createElement("div", { className: "fld f-b" }, /* @__PURE__ */ React11.createElement("label", { htmlFor: `v-b-${linha.k}` }, "N\xFAmero ", n), /* @__PURE__ */ React11.createElement(
    "input",
    {
      id: `v-b-${linha.k}`,
      type: "text",
      inputMode: "numeric",
      autoComplete: "off",
      autoFocus: !!linha.auto,
      value: linha.brinco,
      onChange: (e) => onMudar(linha.k, "brinco", e.target.value)
    }
  )), /* @__PURE__ */ React11.createElement("div", { className: "fld f-p" }, /* @__PURE__ */ React11.createElement("label", { htmlFor: `v-p-${linha.k}` }, "Peso (kg) ", n), /* @__PURE__ */ React11.createElement(
    "input",
    {
      id: `v-p-${linha.k}`,
      type: "text",
      inputMode: "decimal",
      autoComplete: "off",
      value: linha.peso,
      placeholder: info && info.achado && info.pesoUltimo ? String(info.pesoUltimo).replace(".", ",") : "",
      onChange: (e) => onMudar(linha.k, "peso", e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnterPeso(linha.k);
        }
      }
    }
  )), /* @__PURE__ */ React11.createElement("button", { type: "button", className: "x-peq f-x", onClick: () => onTirar(linha.k), "aria-label": `Tirar a linha ${n}` }, /* @__PURE__ */ React11.createElement(Trash22, { size: 17 }))), /* @__PURE__ */ React11.createElement("div", { className: "l2" }, /* @__PURE__ */ React11.createElement("div", { className: "fld f-t" }, /* @__PURE__ */ React11.createElement("label", { htmlFor: `v-t-${linha.k}` }, "Tipo de animal ", n), /* @__PURE__ */ React11.createElement("select", { id: `v-t-${linha.k}`, value: linha.tipoAnimal, onChange: (e) => onMudar(linha.k, "tipoAnimal", e.target.value) }, /* @__PURE__ */ React11.createElement("option", { value: "" }, "Escolha o tipo"), TIPOS_ANIMAL_VENDA.map((t) => /* @__PURE__ */ React11.createElement("option", { key: t, value: t }, t))))), texto && /* @__PURE__ */ React11.createElement("div", { className: `info${ruim ? " ruim" : ""}` }, texto));
}
function Historico({ dados }) {
  const vendas = useMemo9(() => listarVendas(dados), [dados]);
  const [abertas, setAbertas] = useState10(() => /* @__PURE__ */ new Set());
  const alternar = (id) => setAbertas((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });
  if (!vendas.length) return /* @__PURE__ */ React11.createElement("div", { className: "empty" }, "Nenhuma venda registrada ainda.");
  return /* @__PURE__ */ React11.createElement("div", { className: "sheet", "data-testid": "historico-vendas" }, vendas.map(({ venda, itens: itens2 }) => {
    const aberta = abertas.has(venda.id);
    const Seta = aberta ? ChevronUp : ChevronDown;
    return /* @__PURE__ */ React11.createElement("div", { className: "venda-hist", key: venda.id }, /* @__PURE__ */ React11.createElement("button", { type: "button", onClick: () => alternar(venda.id), "aria-expanded": aberta }, /* @__PURE__ */ React11.createElement("span", { className: "m mut", style: { fontSize: 13 } }, formatarDataBR(venda.data)), /* @__PURE__ */ React11.createElement("span", { style: { display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 } }, /* @__PURE__ */ React11.createElement("b", { style: { fontWeight: 600, fontSize: 15 } }, venda.comprador || "Sem comprador"), /* @__PURE__ */ React11.createElement("span", { style: { fontSize: 13, color: "var(--mut)" } }, venda.animais || `${venda.qtd || "?"} animais`, venda.pesoTotal ? ` \xB7 ${fmtKg(Number(venda.pesoTotal))}` : "")), /* @__PURE__ */ React11.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6, font: "600 15px var(--mono)" } }, venda.valorTotal ? fmtBRL(Number(venda.valorTotal)) : "\u2014", " ", /* @__PURE__ */ React11.createElement(Seta, { size: 16 }))), aberta && /* @__PURE__ */ React11.createElement("div", { className: "itens" }, itens2.length === 0 ? /* @__PURE__ */ React11.createElement("p", { className: "sub", style: { margin: 0 } }, "Venda antiga, sem a lista de animais.") : itens2.map((i) => /* @__PURE__ */ React11.createElement("div", { className: "item-lin", key: i.id }, /* @__PURE__ */ React11.createElement("div", { className: "t" }, /* @__PURE__ */ React11.createElement("b", null, i.brinco || "sem n\xFAmero"), /* @__PURE__ */ React11.createElement("span", null, i.tipoAnimal)), /* @__PURE__ */ React11.createElement("div", { className: "p" }, fmtKg(Number(i.peso))))), venda.valorKg ? /* @__PURE__ */ React11.createElement("p", { className: "sub", style: { margin: "8px 0 0" } }, "Valor do kg: ", fmtBRL(Number(venda.valorKg)), venda.frete ? ` \xB7 frete ${fmtBRL(Number(venda.frete))}` : "") : null));
  }));
}
function Vendas({ dados, hoje, crias, preset, onVender, modoTeste }) {
  const [data, setData] = useState10(hoje);
  const [comprador, setComprador] = useState10("");
  const [valorKg, setValorKg] = useState10("");
  const [frete, setFrete] = useState10("");
  const [linhas, setLinhas] = useState10(() => [novaLinha()]);
  const [erros, setErros] = useState10([]);
  const [confirmando, setConfirmando] = useState10(null);
  const [gravando, setGravando] = useState10(false);
  const [erroGravar, setErroGravar] = useState10("");
  const [resultado, setResultado] = useState10("");
  const [travado, setTravado] = useState10(false);
  const timer2 = useRef6(null);
  useEffect6(() => () => clearTimeout(timer2.current), []);
  useEffect6(() => {
    if (!preset || !preset.brincos || !preset.brincos.length) return;
    setLinhas((atuais) => {
      const comConteudo = atuais.filter((l) => l.brinco.trim() || l.peso.trim());
      const ja = new Set(comConteudo.map((l) => l.brinco.trim()));
      const novas = preset.brincos.filter((b) => !ja.has(String(b).trim())).map((b) => {
        const info = infoAnimalVenda(dados, b, hoje, crias);
        return novaLinha({ brinco: String(b).trim(), tipoAnimal: info.achado && !info.jaVendido ? info.tipoSugerido : "" });
      });
      const todas = [...comConteudo, ...novas];
      return todas.length ? todas : [novaLinha()];
    });
    setErros([]);
    setResultado("");
  }, [preset && preset.n]);
  function mudarLinha(k, campo, valor) {
    setLinhas((ls) => ls.map((l) => {
      if (l.k !== k) return l;
      const nova = { ...l, [campo]: valor };
      if (campo === "tipoAnimal") nova.tipoManual = true;
      if (campo === "brinco" && !l.tipoManual) {
        const info = valor.trim() ? infoAnimalVenda(dados, valor, hoje, crias) : null;
        nova.tipoAnimal = info && info.achado && !info.jaVendido ? info.tipoSugerido : "";
      }
      return nova;
    }));
    setErros([]);
    setResultado("");
  }
  function tirarLinha(k) {
    setLinhas((ls) => {
      const r = ls.filter((l) => l.k !== k);
      return r.length ? r : [novaLinha()];
    });
  }
  function adicionarLinha() {
    setLinhas((ls) => [...ls, novaLinha({ auto: true })]);
  }
  function enterNoPeso(k) {
    setLinhas((ls) => {
      const ultima = ls[ls.length - 1];
      if (ultima && ultima.k === k && ultima.peso.trim()) return [...ls, novaLinha({ auto: true })];
      return ls;
    });
  }
  function preencherPesos() {
    setLinhas((ls) => ls.map((l) => {
      if (l.peso.trim() || !l.brinco.trim()) return l;
      const info = infoAnimalVenda(dados, l.brinco, hoje, crias);
      return info.achado && info.pesoUltimo ? { ...l, peso: String(info.pesoUltimo).replace(".", ",") } : l;
    }));
    setErros([]);
  }
  const itensForm = linhas.map((l) => ({ brinco: l.brinco, tipoAnimal: l.tipoAnimal, peso: l.peso }));
  const tot = useMemo9(() => totaisVenda(itensForm, valorKg, frete), [linhas, valorKg, frete]);
  const semPeso = linhas.filter((l) => l.brinco.trim() && !l.peso.trim()).length;
  function conferir() {
    if (travado || gravando) return;
    setResultado("");
    setErroGravar("");
    const form = { data, comprador, valorKg, frete, itens: itensForm };
    const v = validarVenda(dados, form, hoje);
    if (v.erros.length) {
      setErros(v.erros);
      return;
    }
    setErros([]);
    setConfirmando({ form, tot: totaisVenda(v.linhas.map((l) => ({ tipoAnimal: l.tipoAnimal, peso: l.peso })), valorKg, frete), avisos: v.avisos });
  }
  async function confirmar() {
    if (gravando || !confirmando) return;
    setGravando(true);
    setErroGravar("");
    const r = await onVender(confirmando.form);
    setGravando(false);
    if (!r.ok) {
      setErroGravar(r.msg);
      return;
    }
    setConfirmando(null);
    setResultado(r.msg);
    setLinhas([novaLinha()]);
    setComprador("");
    setValorKg("");
    setFrete("");
    setTravado(true);
    clearTimeout(timer2.current);
    timer2.current = setTimeout(() => setTravado(false), 1500);
  }
  return /* @__PURE__ */ React11.createElement("section", { className: "sheet pad" }, /* @__PURE__ */ React11.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Vender por peso"), /* @__PURE__ */ React11.createElement("p", { className: "sub" }, "Informe o comprador e o valor do kg. Embaixo, uma linha para cada animal: o n\xFAmero, o tipo e o peso. Pode vender tamb\xE9m vacas de descarte e vacas velhas. Cada animal vendido sai do rebanho."), /* @__PURE__ */ React11.createElement("div", { className: "grid2" }, /* @__PURE__ */ React11.createElement("div", { className: "fld" }, /* @__PURE__ */ React11.createElement("label", { htmlFor: "venda-data" }, "Data da venda"), /* @__PURE__ */ React11.createElement("input", { id: "venda-data", type: "date", value: data, onChange: (e) => {
    setData(e.target.value);
    setErros([]);
  } })), /* @__PURE__ */ React11.createElement("div", { className: "fld" }, /* @__PURE__ */ React11.createElement("label", { htmlFor: "venda-comprador" }, "Comprador"), /* @__PURE__ */ React11.createElement("input", { id: "venda-comprador", type: "text", autoComplete: "off", value: comprador, onChange: (e) => {
    setComprador(e.target.value);
    setErros([]);
  } })), /* @__PURE__ */ React11.createElement("div", { className: "fld" }, /* @__PURE__ */ React11.createElement("label", { htmlFor: "venda-valor" }, "Valor do kg (R$)"), /* @__PURE__ */ React11.createElement("input", { id: "venda-valor", type: "text", inputMode: "decimal", autoComplete: "off", value: valorKg, onChange: (e) => {
    setValorKg(e.target.value);
    setErros([]);
  }, placeholder: "ex.: 12,50" })), /* @__PURE__ */ React11.createElement("div", { className: "fld" }, /* @__PURE__ */ React11.createElement("label", { htmlFor: "venda-frete" }, "Frete (R$, se houver)"), /* @__PURE__ */ React11.createElement("input", { id: "venda-frete", type: "text", inputMode: "decimal", autoComplete: "off", value: frete, onChange: (e) => setFrete(e.target.value) }))), /* @__PURE__ */ React11.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Animais da venda", /* @__PURE__ */ React11.createElement("small", null, tot.qtd, " com peso")), linhas.map((l, i) => /* @__PURE__ */ React11.createElement(LinhaVenda, { key: l.k, n: i + 1, linha: l, dados, hoje, crias, onMudar: mudarLinha, onTirar: tirarLinha, onEnterPeso: enterNoPeso })), /* @__PURE__ */ React11.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React11.createElement("button", { type: "button", className: "btn quiet", onClick: adicionarLinha }, /* @__PURE__ */ React11.createElement(Plus2, { size: 18 }), " Adicionar animal"), semPeso > 0 && /* @__PURE__ */ React11.createElement("button", { type: "button", className: "btn quiet", onClick: preencherPesos }, /* @__PURE__ */ React11.createElement(Scale2, { size: 18 }), " Usar o \xFAltimo peso dos ", semPeso, " sem peso")), /* @__PURE__ */ React11.createElement("div", { className: "totais", "data-testid": "totais-venda" }, /* @__PURE__ */ React11.createElement("div", { className: "grande" }, tot.valor > 0 ? fmtBRL(tot.valor) : "R$ \u2014"), /* @__PURE__ */ React11.createElement("div", { style: { fontSize: 14.5, lineHeight: 1.5 } }, /* @__PURE__ */ React11.createElement("b", null, tot.qtd), " animal(is) \xB7 ", /* @__PURE__ */ React11.createElement("b", null, fmtKg(tot.kg)), tot.qtd ? ` (m\xE9dia ${fmtKg(tot.kgMedio)})` : "", tot.frete > 0 && /* @__PURE__ */ React11.createElement(React11.Fragment, null, " \xB7 frete ", fmtBRL(tot.frete), " \xB7 l\xEDquido ", /* @__PURE__ */ React11.createElement("b", null, fmtBRL(tot.liquido)))), tot.porTipo.length > 0 && /* @__PURE__ */ React11.createElement("div", { style: { fontSize: 13.5, color: "var(--mut)", marginTop: 4 } }, tot.porTipo.map((t) => `${t.qtd} ${t.tipo} (${fmtKg(t.kg)})`).join(" \xB7 "))), erros.length > 0 && /* @__PURE__ */ React11.createElement(Aviso, null, "Falta ajustar:", /* @__PURE__ */ React11.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 } }, erros.map((t, i) => /* @__PURE__ */ React11.createElement("li", { key: i }, t)))), resultado && /* @__PURE__ */ React11.createElement(Aviso, { tipo: "ok" }, resultado, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), /* @__PURE__ */ React11.createElement("button", { className: "btn wide", onClick: conferir, disabled: travado || gravando }, /* @__PURE__ */ React11.createElement(ShoppingCart3, { size: 18 }), " Conferir e vender"), /* @__PURE__ */ React11.createElement("h3", { className: "h2", style: { fontSize: 18, marginTop: 28 } }, "Vendas anteriores"), /* @__PURE__ */ React11.createElement(Historico, { dados }), confirmando && /* @__PURE__ */ React11.createElement(Modal, { titulo: "Confirmar a venda", onClose: () => {
    if (!gravando) {
      setConfirmando(null);
      setErroGravar("");
    }
  } }, /* @__PURE__ */ React11.createElement("div", { "data-testid": "confirmar-venda" }, /* @__PURE__ */ React11.createElement("p", { style: { margin: "0 0 6px", fontSize: 15.5, lineHeight: 1.5 } }, /* @__PURE__ */ React11.createElement("b", null, confirmando.tot.qtd), " animal(is) para ", /* @__PURE__ */ React11.createElement("b", null, confirmando.form.comprador.trim()), " em ", formatarDataBR(confirmando.form.data), "."), /* @__PURE__ */ React11.createElement("div", { className: "totais", style: { marginTop: 6 } }, /* @__PURE__ */ React11.createElement("div", { className: "grande" }, fmtBRL(confirmando.tot.valor)), /* @__PURE__ */ React11.createElement("div", { style: { fontSize: 14.5, lineHeight: 1.5 } }, fmtKg(confirmando.tot.kg), " (m\xE9dia ", fmtKg(confirmando.tot.kgMedio), ") a ", fmtBRL(numPeso(confirmando.form.valorKg)), " o kg", confirmando.tot.frete > 0 && /* @__PURE__ */ React11.createElement(React11.Fragment, null, " \xB7 frete ", fmtBRL(confirmando.tot.frete), " \xB7 l\xEDquido ", fmtBRL(confirmando.tot.liquido))), /* @__PURE__ */ React11.createElement("div", { style: { fontSize: 13.5, color: "var(--mut)", marginTop: 4 } }, confirmando.tot.porTipo.map((t) => `${t.qtd} ${t.tipo}`).join(" \xB7 "))), confirmando.avisos.length > 0 && /* @__PURE__ */ React11.createElement(Aviso, { tipo: "info" }, /* @__PURE__ */ React11.createElement("ul", { style: { margin: 0, paddingLeft: 18 } }, confirmando.avisos.map((t, i) => /* @__PURE__ */ React11.createElement("li", { key: i }, t)))), /* @__PURE__ */ React11.createElement("p", { className: "sub" }, "Os animais com n\xFAmero cadastrado saem do rebanho ao confirmar."), erroGravar && /* @__PURE__ */ React11.createElement(Aviso, null, erroGravar), /* @__PURE__ */ React11.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React11.createElement("button", { className: "btn", onClick: confirmar, disabled: gravando }, gravando ? /* @__PURE__ */ React11.createElement(Loader26, { size: 18, className: "spin" }) : /* @__PURE__ */ React11.createElement(ShoppingCart3, { size: 18 }), " ", gravando ? "Gravando..." : "Confirmar venda"), /* @__PURE__ */ React11.createElement("button", { className: "btn quiet", onClick: () => {
    setConfirmando(null);
    setErroGravar("");
  }, disabled: gravando }, "Voltar")))));
}

// src/telas/CriasNovilhas.jsx
import React12, { useMemo as useMemo10, useState as useState11 } from "react";
import { ShoppingCart as ShoppingCart4 } from "lucide-react";
var ROTULO_DESTINO = { "A definir": "A definir", Matriz: "Virar matriz", Venda: "Para venda" };
var FILTROS = [["aptas", "Aptas"], ["todas", "Todas"], ["A definir", "A definir"], ["Matriz", "Matriz"], ["Venda", "Venda"]];
function FichaNovilha({ n, cfg, onDestino, onVender, onFechar }) {
  const hist = [...n.pontos].reverse();
  const status = n.pesoAtual === null ? "sem pesagem" : n.apta ? `apta (${fmtNum(cfg.pesoMatriz, 0)} kg ou mais)` : `faltam ${fmtNum(n.faltam, 1)} kg${n.diasParaApta ? ` \xB7 ~${n.diasParaApta} dias` : ""}`;
  return /* @__PURE__ */ React12.createElement(Modal, { titulo: `Novilha ${n.brinco}`, onClose: onFechar, rotulo: `Novilha ${n.brinco}` }, /* @__PURE__ */ React12.createElement(Lead, { rotulo: "Nascimento", valor: n.nascData ? `${formatarDataBR(n.nascData)} \xB7 ${fmtIdade(n.idadeDias)}` : "\u2014" }), /* @__PURE__ */ React12.createElement(Lead, { rotulo: "\xDAltimo peso", valor: n.pesoAtual === null ? "sem pesagem" : `${fmtKg(n.pesoAtual)} em ${formatarDataBR(n.pesoData)}` }), /* @__PURE__ */ React12.createElement(Lead, { rotulo: "Ganho recente", valor: fmtGmd(n.gmd) }), /* @__PURE__ */ React12.createElement(Lead, { rotulo: "Para virar matriz", valor: status, cor: n.apta ? "var(--green)" : void 0 }), /* @__PURE__ */ React12.createElement(Lead, { rotulo: "Destino", valor: ROTULO_DESTINO[n.destino] || n.destino }), /* @__PURE__ */ React12.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Pesagens", /* @__PURE__ */ React12.createElement("small", null, n.pontos.length, " registro(s)")), hist.length === 0 ? /* @__PURE__ */ React12.createElement("p", { className: "sub" }, "Nenhuma pesagem ainda.") : /* @__PURE__ */ React12.createElement("ul", { className: "hist", "data-testid": "pesagens-novilha" }, hist.map((p) => /* @__PURE__ */ React12.createElement("li", { key: p.id }, /* @__PURE__ */ React12.createElement("span", null, fmtKg(p.peso), p.fonte !== "Pesagem" ? ` \xB7 ${p.fonte.toLowerCase()}` : ""), /* @__PURE__ */ React12.createElement("span", null, formatarDataBR(p.data))))), /* @__PURE__ */ React12.createElement("div", { className: "rapido", style: { marginTop: 14 } }, /* @__PURE__ */ React12.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Destino desta novilha"), /* @__PURE__ */ React12.createElement("div", { className: "seg", role: "group", "aria-label": "Destino da novilha" }, DESTINOS_NOVILHA.map((d) => /* @__PURE__ */ React12.createElement("button", { key: d, type: "button", "aria-pressed": n.destino === d, onClick: () => onDestino([n], d) }, ROTULO_DESTINO[d])))), /* @__PURE__ */ React12.createElement("button", { className: "btn wide", onClick: () => onVender([n.brinco]) }, /* @__PURE__ */ React12.createElement(ShoppingCart4, { size: 18 }), " Vender esta novilha"));
}
function Novilhas({ dados, hoje, onSalvarMatriz, onVender }) {
  const cfg = useMemo10(() => configCompleta(dados.config), [dados.config]);
  const lista = useMemo10(() => listarNovilhas(dados, dados.config, hoje), [dados, hoje]);
  const [filtro, setFiltro] = useState11("todas");
  const [marcadas, setMarcadas] = useState11(() => /* @__PURE__ */ new Set());
  const [aberta, setAberta] = useState11(null);
  const [msg, setMsg] = useState11("");
  const aptas = lista.filter((n) => n.apta);
  const pesadas = lista.filter((n) => n.pesoAtual !== null);
  const pesoMedio = pesadas.length ? pesadas.reduce((s, n) => s + n.pesoAtual, 0) / pesadas.length : null;
  const semPeso = lista.length - pesadas.length;
  const mostradas = lista.filter((n) => filtro === "todas" ? true : filtro === "aptas" ? n.apta : n.destino === filtro);
  const escolhidas = lista.filter((n) => marcadas.has(n.matriz.id));
  const fichaAberta = aberta ? lista.find((n) => n.matriz.id === aberta) || null : null;
  function alternar(id) {
    setMarcadas((s) => {
      const x = new Set(s);
      if (x.has(id)) x.delete(id);
      else x.add(id);
      return x;
    });
  }
  function marcarAptas() {
    setMarcadas(new Set(aptas.map((n) => n.matriz.id)));
  }
  function destinoPara(novilhas, destino) {
    const mudar = novilhas.filter((n) => n.destino !== destino);
    mudar.forEach((n) => onSalvarMatriz(definirDestinoNovilha(n.matriz, destino)));
    setMsg(mudar.length ? `${mudar.length} novilha(s) com destino "${ROTULO_DESTINO[destino]}": ${mudar.map((n) => n.brinco).join(", ")}.` : `Todas j\xE1 estavam com o destino "${ROTULO_DESTINO[destino]}".`);
    setMarcadas(/* @__PURE__ */ new Set());
  }
  function venderNovilhas(brincos) {
    setAberta(null);
    onVender(brincos.filter(Boolean));
  }
  return /* @__PURE__ */ React12.createElement("section", { className: "sheet pad" }, /* @__PURE__ */ React12.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Novilhas"), /* @__PURE__ */ React12.createElement("p", { className: "sub" }, "F\xEAmeas desmamadas em recria. A partir de ", fmtNum(cfg.pesoMatriz, 0), " kg a novilha est\xE1 apta a virar matriz. Voc\xEA decide o destino de cada uma. (Para mudar o peso de corte, use a aba Para vender.)"), /* @__PURE__ */ React12.createElement(Kpis, { itens: [
    { rotulo: "Novilhas no lote", valor: lista.length, sub: `${semPeso} sem pesagem` },
    { rotulo: `Aptas (${fmtNum(cfg.pesoMatriz, 0)} kg ou mais)`, valor: aptas.length, cor: aptas.length ? "var(--green)" : void 0 },
    { rotulo: "Peso m\xE9dio", valor: pesoMedio === null ? "\u2014" : fmtKg(pesoMedio), pequeno: true },
    { rotulo: "Destino", valor: `${lista.filter((n) => n.destino === "Matriz").length} matriz`, pequeno: true, sub: `${lista.filter((n) => n.destino === "Venda").length} venda \xB7 ${lista.filter((n) => n.destino === "A definir").length} a definir` }
  ] }), lista.length === 0 && /* @__PURE__ */ React12.createElement(Aviso, { tipo: "info" }, "Ainda n\xE3o h\xE1 novilhas no lote. Elas entram aqui quando uma f\xEAmea \xE9 desmamada (aba Pesar, modo Desmama)."), lista.length > 0 && /* @__PURE__ */ React12.createElement(React12.Fragment, null, /* @__PURE__ */ React12.createElement("div", { className: "seg", style: { margin: "16px 0 10px", flexWrap: "wrap" }, role: "group", "aria-label": "Quais novilhas mostrar" }, FILTROS.map(([id, rot]) => /* @__PURE__ */ React12.createElement("button", { key: id, type: "button", "aria-pressed": filtro === id, onClick: () => setFiltro(id), style: { minWidth: 86 } }, rot, " ", id === "aptas" ? aptas.length : id === "todas" ? lista.length : lista.filter((n) => n.destino === id).length))), /* @__PURE__ */ React12.createElement("div", { className: "sheet", style: { boxShadow: "none", borderRadius: 8 } }, /* @__PURE__ */ React12.createElement("div", { className: "bar-sum" }, /* @__PURE__ */ React12.createElement("span", null, mostradas.length, " novilha(s)"), /* @__PURE__ */ React12.createElement("span", null, escolhidas.length, " marcada(s)")), mostradas.length === 0 && /* @__PURE__ */ React12.createElement("div", { className: "empty" }, "Nenhuma novilha neste filtro."), mostradas.map((n) => {
    const status = n.pesoAtual === null ? "sem pesagem" : n.apta ? "apta para matriz" : `faltam ${fmtNum(n.faltam, 1)} kg${n.diasParaApta ? ` \xB7 ~${n.diasParaApta} dias` : ""}`;
    return /* @__PURE__ */ React12.createElement("div", { className: "sel-row cols-nov", key: n.matriz.id }, /* @__PURE__ */ React12.createElement("input", { type: "checkbox", className: "chk", checked: marcadas.has(n.matriz.id), onChange: () => alternar(n.matriz.id), "aria-label": `Marcar a novilha ${n.brinco}` }), /* @__PURE__ */ React12.createElement(
      "button",
      {
        type: "button",
        onClick: () => setAberta(n.matriz.id),
        "aria-label": `Abrir a novilha ${n.brinco}`,
        style: { background: "transparent", border: "none", textAlign: "left", font: "600 17px var(--mono)", minHeight: 48, padding: 0, color: "inherit" }
      },
      n.brinco
    ), /* @__PURE__ */ React12.createElement("span", { style: { display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 } }, /* @__PURE__ */ React12.createElement("b", { style: { fontWeight: 600, fontSize: 15 } }, fmtIdade(n.idadeDias)), /* @__PURE__ */ React12.createElement("span", { style: { color: n.apta ? "var(--green)" : "var(--mut)" } }, ROTULO_DESTINO[n.destino] || n.destino, " \xB7 ", status)), /* @__PURE__ */ React12.createElement("span", { className: "r", style: { textAlign: "right", font: "600 15px var(--mono)" } }, n.pesoAtual === null ? "\u2014" : fmtKg(n.pesoAtual)), /* @__PURE__ */ React12.createElement("span", { className: "hide-s" }, /* @__PURE__ */ React12.createElement("span", { className: `pill ${n.apta ? "pronto" : n.pesoAtual === null ? "fora" : "falta"}` }, n.apta ? "apta" : n.pesoAtual === null ? "sem peso" : "em ganho")), /* @__PURE__ */ React12.createElement("span", { className: "hide-s m mut" }, fmtGmd(n.gmd)));
  })), /* @__PURE__ */ React12.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 } }, /* @__PURE__ */ React12.createElement("button", { type: "button", className: "btn quiet sm", onClick: marcarAptas, disabled: !aptas.length }, "Marcar as aptas"), /* @__PURE__ */ React12.createElement("button", { type: "button", className: "btn quiet sm", onClick: () => setMarcadas(/* @__PURE__ */ new Set()), disabled: !marcadas.size }, "Limpar")), /* @__PURE__ */ React12.createElement("div", { className: "rapido", style: { marginTop: 12 } }, /* @__PURE__ */ React12.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Destino das ", escolhidas.length, " marcada(s)"), /* @__PURE__ */ React12.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, DESTINOS_NOVILHA.map((d) => /* @__PURE__ */ React12.createElement("button", { key: d, type: "button", className: "btn quiet", disabled: !escolhidas.length, onClick: () => destinoPara(escolhidas, d) }, ROTULO_DESTINO[d])), /* @__PURE__ */ React12.createElement("button", { type: "button", className: "btn", disabled: !escolhidas.length, onClick: () => venderNovilhas(escolhidas.map((n) => n.brinco)) }, /* @__PURE__ */ React12.createElement(ShoppingCart4, { size: 18 }), " Vender marcadas")))), msg && /* @__PURE__ */ React12.createElement(Aviso, { tipo: "ok", onClose: () => setMsg("") }, msg), fichaAberta && /* @__PURE__ */ React12.createElement(FichaNovilha, { n: fichaAberta, cfg, onDestino: destinoPara, onVender: venderNovilhas, onFechar: () => setAberta(null) }));
}

// src/telas/Crias.jsx
function Crias({
  dados,
  hoje,
  ownerMode,
  modoTeste,
  onLancar,
  onGravarLote,
  onVender,
  onSalvarMatriz,
  onSalvarConfig,
  onRegistrarMorte,
  onEditarNascimento,
  onEditarMorte,
  onAnularMorte
}) {
  const [aba, setAba] = useState12("lista");
  const [vendaPreset, setVendaPreset] = useState12(null);
  const [vendasAberta, setVendasAberta] = useState12(false);
  const crias = useMemo11(() => listarCrias(dados, hoje), [dados, hoje]);
  const abas = [
    { id: "lista", label: "Crias" },
    { id: "pesar", label: "Pesar" },
    ...ownerMode ? [{ id: "vender", label: "Para vender" }, { id: "novilhas", label: "Novilhas" }, { id: "vendas", label: "Vendas" }] : []
  ];
  useEffect7(() => {
    if (!abas.some((a) => a.id === aba)) setAba("lista");
    if (!ownerMode) setVendasAberta(false);
  }, [ownerMode]);
  function irParaVenda(brincos) {
    setVendaPreset({ brincos, n: Date.now() });
    setVendasAberta(true);
    setAba("vendas");
  }
  function mudarAba(id) {
    if (id === "vendas") setVendasAberta(true);
    setAba(id);
  }
  return /* @__PURE__ */ React13.createElement("div", { className: "wrap" }, /* @__PURE__ */ React13.createElement("div", { className: "head" }, /* @__PURE__ */ React13.createElement("div", null, /* @__PURE__ */ React13.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React13.createElement("h1", null, "Crias"))), /* @__PURE__ */ React13.createElement(IndexTabs, { tabs: abas, value: aba, onChange: mudarAba, rotulo: "Crias" }), aba === "lista" && /* @__PURE__ */ React13.createElement(
    ListaCrias,
    {
      crias,
      dados,
      hoje,
      ownerMode,
      modoTeste,
      onLancar,
      onVender: irParaVenda,
      onSalvarMatriz,
      onRegistrarMorte,
      onEditarNascimento,
      onEditarMorte,
      onAnularMorte
    }
  ), aba === "pesar" && /* @__PURE__ */ React13.createElement(Pesar, { dados, hoje, crias, ownerMode, modoTeste, onGravarLote }), aba === "vender" && ownerMode && /* @__PURE__ */ React13.createElement(ParaVender, { crias, dados, hoje, onSalvarConfig, onVender: irParaVenda, modoTeste }), aba === "novilhas" && ownerMode && /* @__PURE__ */ React13.createElement(Novilhas, { dados, hoje, onSalvarMatriz, onVender: irParaVenda }), ownerMode && vendasAberta && /* @__PURE__ */ React13.createElement("div", { hidden: aba !== "vendas" }, /* @__PURE__ */ React13.createElement(Vendas, { dados, hoje, crias, preset: vendaPreset, onVender, modoTeste })));
}

// src/telas/Rebanho.jsx
import React14, { useMemo as useMemo12, useState as useState13 } from "react";
import { Search as Search4, Lock, Save as Save6 } from "lucide-react";
function ModalMatriz({ m, dados, ownerMode, onSalvar, onFechar }) {
  const [edit, setEdit] = useState13(false);
  const [form, setForm] = useState13({ ...m });
  const hist = useMemo12(
    () => dados.eventos.filter((e) => e.matrizId === m.id).sort((a, b) => (b.data || "").localeCompare(a.data || "")),
    [dados.eventos, m.id]
  );
  const partos = dados.eventos.filter((e) => e.tipo === "nascimento" && e.matrizId === m.id).length;
  const ult = ultimoPartoDe(m.id, dados.eventos);
  const cria = numeroCriaUltimoParto(m.id, dados.eventos);
  function salvar2() {
    if (!String(form.brinco || "").trim()) return;
    onSalvar({
      ...m,
      brinco: String(form.brinco).trim(),
      categoria: form.categoria,
      raca: form.raca || "",
      lote: form.lote || "",
      dataNascimento: form.dataNascimento || "",
      partosAnteriores: parseInt(form.partosAnteriores, 10) || 0,
      status: form.status
    });
    onFechar();
  }
  return /* @__PURE__ */ React14.createElement(Modal, { titulo: `Matriz ${m.brinco}`, onClose: onFechar, rotulo: `Matriz ${m.brinco}` }, !edit ? /* @__PURE__ */ React14.createElement(React14.Fragment, null, /* @__PURE__ */ React14.createElement("div", { style: { marginBottom: 6 } }, /* @__PURE__ */ React14.createElement(Tag, { status: m.status })), /* @__PURE__ */ React14.createElement(Lead, { rotulo: "Categoria", valor: m.categoria || "\u2014" }), m.destino && /* @__PURE__ */ React14.createElement(Lead, { rotulo: "Destino da novilha", valor: m.destino === "Matriz" ? "virar matriz" : m.destino === "Venda" ? "venda" : "a definir" }), m.status === "Vendida" && /* @__PURE__ */ React14.createElement(Lead, { rotulo: "Baixa", valor: `Vendida${m.dataBaixa ? ` em ${formatarDataBR(m.dataBaixa)}` : ""}`, cor: "var(--mut)" }), m.status === "Morta" && /* @__PURE__ */ React14.createElement(Lead, { rotulo: "Baixa", valor: `${m.motivoBaixa || "Morta"}${m.dataBaixa ? ` em ${formatarDataBR(m.dataBaixa)}` : ""}`, cor: "var(--late)" }), /* @__PURE__ */ React14.createElement(Lead, { rotulo: "Ra\xE7a", valor: m.raca || "\u2014" }), /* @__PURE__ */ React14.createElement(Lead, { rotulo: "Lote / piquete", valor: m.lote || "\u2014" }), /* @__PURE__ */ React14.createElement(Lead, { rotulo: "Nascimento", valor: m.dataNascimento ? formatarDataBR(m.dataNascimento) : "\u2014" }), /* @__PURE__ */ React14.createElement(Lead, { rotulo: "Partos na fazenda", valor: partos }), /* @__PURE__ */ React14.createElement(Lead, { rotulo: "Partos antes de entrar", valor: m.partosAnteriores || 0 }), /* @__PURE__ */ React14.createElement(Lead, { rotulo: "\xDAltimo parto", valor: ult ? `${formatarDataBR(ult)}${cria ? ` (cria ${cria})` : ""}` : "\u2014" }), /* @__PURE__ */ React14.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Hist\xF3rico", /* @__PURE__ */ React14.createElement("small", null, hist.length, " lan\xE7amento(s)")), hist.length === 0 ? /* @__PURE__ */ React14.createElement("p", { className: "sub" }, "Nada lan\xE7ado para esta vaca ainda.") : /* @__PURE__ */ React14.createElement("ul", { className: "hist", "data-testid": "historico" }, hist.map((e) => /* @__PURE__ */ React14.createElement("li", { key: e.id }, /* @__PURE__ */ React14.createElement("span", null, descreverEvento(e, dados).replace(/ · (mãe|vaca) \S+/, "")), /* @__PURE__ */ React14.createElement("span", null, formatarDataBR(e.data))))), m.status === "Vendida" || m.status === "Morta" ? /* @__PURE__ */ React14.createElement("p", { className: "sub", style: { marginTop: 16 } }, m.status === "Morta" ? "Animal morto: o cadastro fica guardado s\xF3 para consulta. Para corrigir a morte, use Lan\xE7ar > Morte (com a senha)." : "Animal vendido: o cadastro fica guardado s\xF3 para consulta.") : ownerMode ? /* @__PURE__ */ React14.createElement("button", { className: "btn wide", style: { marginTop: 16 }, onClick: () => setEdit(true) }, "Alterar cadastro") : /* @__PURE__ */ React14.createElement("p", { className: "sub", style: { marginTop: 16, display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React14.createElement(Lock, { size: 15, style: { flex: "none" } }), " S\xF3 o propriet\xE1rio altera o cadastro. Use o cadeado e a senha.")) : /* @__PURE__ */ React14.createElement(React14.Fragment, null, CAMPOS_EDICAO_MATRIZ.map((c) => /* @__PURE__ */ React14.createElement(Campo, { key: c.key, campo: c, value: form[c.key], onChange: (k, v) => setForm((f) => ({ ...f, [k]: v })), matrizes: [], touros: [] })), /* @__PURE__ */ React14.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React14.createElement("button", { className: "btn", style: { flex: 1 }, onClick: salvar2 }, /* @__PURE__ */ React14.createElement(Save6, { size: 17 }), " Salvar altera\xE7\xF5es"), /* @__PURE__ */ React14.createElement("button", { className: "btn quiet", onClick: () => setEdit(false) }, "Cancelar"))));
}
function Rebanho({ dados, ownerMode, onSalvarMatriz }) {
  const [aba, setAba] = useState13("matrizes");
  const [filtro, setFiltro] = useState13("todos");
  const [busca, setBusca] = useState13("");
  const [aberta, setAberta] = useState13(null);
  const lista = useMemo12(() => {
    const q = busca.trim().toLowerCase();
    return dados.matrizes.filter((m) => (filtro === "todos" ? m.status !== "Vendida" && m.status !== "Morta" : m.status === filtro) && (!q || String(m.brinco).toLowerCase().includes(q))).slice().sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), "pt-BR", { numeric: true }));
  }, [dados.matrizes, filtro, busca]);
  const aberto = aberta ? dados.matrizes.find((m) => m.id === aberta) : null;
  const contar = (s) => dados.matrizes.filter((m) => m.status === s).length;
  const totalNoRebanho = dados.matrizes.filter((m) => m.status !== "Vendida" && m.status !== "Morta").length;
  return /* @__PURE__ */ React14.createElement("div", { className: "wrap" }, /* @__PURE__ */ React14.createElement("div", { className: "head" }, /* @__PURE__ */ React14.createElement("div", null, /* @__PURE__ */ React14.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React14.createElement("h1", null, "Rebanho"))), /* @__PURE__ */ React14.createElement(
    IndexTabs,
    {
      rotulo: "Cadastros",
      value: aba,
      onChange: setAba,
      tabs: [{ id: "matrizes", label: "Matrizes", count: totalNoRebanho }, { id: "touros", label: "Touros", count: dados.touros.length }]
    }
  ), aba === "matrizes" && /* @__PURE__ */ React14.createElement("section", { className: "sheet" }, /* @__PURE__ */ React14.createElement("label", { className: "search" }, /* @__PURE__ */ React14.createElement(Search4, null), /* @__PURE__ */ React14.createElement("input", { placeholder: "Buscar pelo brinco", "aria-label": "Buscar pelo brinco", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React14.createElement("div", { style: { padding: "10px 16px", borderBottom: "1px solid var(--line)" } }, /* @__PURE__ */ React14.createElement("div", { className: "seg", style: { flexWrap: "wrap" }, role: "group", "aria-label": "Filtrar por situa\xE7\xE3o" }, [["todos", "Todas"], ["Cheia", `Cheias ${contar("Cheia")}`], ["Vazia", `Vazias ${contar("Vazia")}`], ["Descarte", `Descarte ${contar("Descarte")}`], ...contar("Vendida") ? [["Vendida", `Vendidas ${contar("Vendida")}`]] : [], ...contar("Morta") ? [["Morta", `Mortas ${contar("Morta")}`]] : []].map(([id, rot]) => /* @__PURE__ */ React14.createElement("button", { key: id, "aria-pressed": filtro === id, onClick: () => setFiltro(id), style: { minHeight: 40, fontSize: 13, flex: "1 0 auto" } }, rot)))), /* @__PURE__ */ React14.createElement("div", { className: "led-h cols-reb" }, /* @__PURE__ */ React14.createElement("span", null, "Brinco"), /* @__PURE__ */ React14.createElement("span", null, "Categoria"), /* @__PURE__ */ React14.createElement("span", null, "Situa\xE7\xE3o"), /* @__PURE__ */ React14.createElement("span", { className: "hide-s" }, "Lote"), /* @__PURE__ */ React14.createElement("span", { className: "hide-s" }, "\xDAlt. parto")), lista.length === 0 && /* @__PURE__ */ React14.createElement("div", { className: "empty" }, "Nenhuma matriz encontrada."), lista.map((m) => {
    const ult = ultimoPartoDe(m.id, dados.eventos);
    return /* @__PURE__ */ React14.createElement("button", { key: m.id, className: "led-r cols-reb", onClick: () => setAberta(m.id), "aria-label": `Abrir matriz ${m.brinco}` }, /* @__PURE__ */ React14.createElement("span", { className: "b" }, m.brinco), /* @__PURE__ */ React14.createElement("span", { className: "two" }, /* @__PURE__ */ React14.createElement("b", null, m.categoria), /* @__PURE__ */ React14.createElement("span", null, m.destino && m.status !== "Vendida" && m.status !== "Morta" ? `recria \xB7 ${m.destino === "Matriz" ? "virar matriz" : m.destino.toLowerCase()}` : m.raca || "\u2014")), /* @__PURE__ */ React14.createElement("span", null, /* @__PURE__ */ React14.createElement(Tag, { status: m.status })), /* @__PURE__ */ React14.createElement("span", { className: "hide-s m mut" }, m.lote || "\u2014"), /* @__PURE__ */ React14.createElement("span", { className: "hide-s m mut" }, ult ? formatarDataBR(ult) : "\u2014"));
  })), aba === "touros" && /* @__PURE__ */ React14.createElement("section", { className: "sheet" }, dados.touros.length === 0 ? /* @__PURE__ */ React14.createElement("div", { className: "empty" }, "Nenhum touro / s\xEAmen cadastrado ainda.", ownerMode ? " Cadastre em Lan\xE7ar \u2192 Touro / s\xEAmen." : "", /* @__PURE__ */ React14.createElement("div", { style: { marginTop: 6, fontSize: 13 } }, 'Enquanto n\xE3o houver cadastro, os relat\xF3rios mostram o pai como "n\xE3o informado".')) : dados.touros.map((t) => {
    const usadas = dados.eventos.filter((e) => e.tipo === "iatf" && e.touroId === t.id).length;
    const adq = parseInt(t.doses, 10) || 0;
    const rest = adq - usadas;
    return /* @__PURE__ */ React14.createElement("div", { className: "led-r", key: t.id, style: { "--cols": ownerMode ? "minmax(0,1fr) auto" : "1fr", minHeight: 64 } }, /* @__PURE__ */ React14.createElement("span", { className: "two" }, /* @__PURE__ */ React14.createElement("b", null, t.nome), /* @__PURE__ */ React14.createElement("span", null, [t.raca, t.fornecedor, t.anoAquisicao].filter(Boolean).join(" \xB7 "))), ownerMode && adq > 0 && /* @__PURE__ */ React14.createElement("span", { className: "r", style: { color: rest <= 0 ? "var(--late)" : rest <= 5 ? "var(--amber)" : "var(--green)" } }, rest, " dose(s)", /* @__PURE__ */ React14.createElement("div", { style: { font: "500 11.5px var(--body)", color: "var(--mut)" } }, usadas, " de ", adq, t.custoDose ? ` \xB7 ${fmtBRL(t.custoDose)}` : "")));
  })), !ownerMode && /* @__PURE__ */ React14.createElement("p", { className: "sub", style: { marginTop: 14, display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React14.createElement(Lock, { size: 15, style: { flex: "none" } }), " Modo funcion\xE1rio: aqui voc\xEA consulta. Alterar cadastro \xE9 s\xF3 com a senha do propriet\xE1rio."), aberto && /* @__PURE__ */ React14.createElement(ModalMatriz, { key: aberto.id, m: aberto, dados, ownerMode, onSalvar: onSalvarMatriz, onFechar: () => setAberta(null) }));
}

// src/telas/Painel.jsx
import React15, { useMemo as useMemo13, useState as useState14 } from "react";
import { Download, RefreshCw } from "lucide-react";
function Painel({ anoSel, dados, ano, hoje, go, onExcel, onSync, onRecarregar, modoTeste, sincronizando }) {
  const [confirmar, setConfirmar] = useState14(false);
  const evsAno = useMemo13(() => filtrarPorAno(dados.eventos, ano), [dados.eventos, ano]);
  const k = useMemo13(() => calcularKPIs(dados.matrizes, evsAno), [dados.matrizes, evsAno]);
  const cheias = useMemo13(() => linhasPrevisao(dados.matrizes, dados.eventos, "Cheia", hoje, ""), [dados, hoje]);
  const atrasadas = cheias.filter((l) => l.dias !== null && l.dias < 0).length;
  const semPrev = cheias.filter((l) => l.dias === null).length;
  const sinal = cheias.filter((l) => l.dias !== null && l.dias >= 0 && l.dias <= 30).length;
  const nascIncompletos = evsAno.filter((e) => e.tipo === "nascimento" && (!e.matrizId || !e.sexo || !String(e.brincoBezerro ?? "").trim())).length;
  const plantel = dados.matrizes.filter(noPlantel);
  const semRacaLote = plantel.filter((m) => m.status !== "Descarte" && (!m.raca || !m.lote)).length;
  const brincos = {};
  plantel.forEach((m) => {
    brincos[m.brinco] = (brincos[m.brinco] || 0) + 1;
  });
  const crias = useMemo13(() => listarCrias(dados, hoje), [dados, hoje]);
  const criasAtivas = crias.filter((c) => c.ativa);
  const criasSemPeso = criasAtivas.filter((c) => c.pesoAtual === null).length;
  const orfas = criasAtivas.filter((c) => c.orfa).length;
  const machos = useMemo13(() => analiseMachos(crias, dados.config), [crias, dados.config]);
  const novilhas = useMemo13(() => listarNovilhas(dados, dados.config, hoje), [dados, hoje]);
  const novilhasAptas = novilhas.filter((n) => n.apta).length;
  const duplicados = Object.values(brincos).filter((n) => n > 1).length;
  const porMes = useMemo13(() => {
    const mapa = {};
    evsAno.filter((e) => e.tipo === "nascimento" && e.data).forEach((e) => {
      const kk = e.data.slice(0, 7);
      mapa[kk] = (mapa[kk] || 0) + 1;
    });
    return Object.entries(mapa).sort().slice(-12);
  }, [evsAno]);
  const maxMes = Math.max(1, ...porMes.map(([, n]) => n));
  const recentes = useMemo13(
    () => [...dados.eventos].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 8),
    [dados.eventos]
  );
  const ativos = k.cheias + k.vazias;
  const pc = (n) => ativos ? n / ativos * 100 : 0;
  const rot = rotuloAno(ano);
  const pendencias = [
    atrasadas > 0 && { rotulo: "Previs\xF5es de parto j\xE1 vencidas (conferir se pariram)", valor: atrasadas, onClick: () => go("parto"), cor: "var(--late)" },
    semPrev > 0 && { rotulo: "Cheias sem previs\xE3o calculada", valor: semPrev, onClick: () => go("parto") },
    nascIncompletos > 0 && { rotulo: `Nascimentos de ${rot} com m\xE3e, sexo ou brinco faltando (corrigir em Lan\xE7ar)`, valor: nascIncompletos, onClick: () => go("lancar") },
    orfas > 0 && { rotulo: "Crias \xF3rf\xE3s (a m\xE3e morreu) ainda mamando", valor: orfas, onClick: () => go("crias"), cor: "var(--amber)" },
    criasSemPeso > 0 && { rotulo: "Crias no rebanho ainda sem nenhuma pesagem", valor: criasSemPeso, onClick: () => go("crias") },
    semRacaLote > 0 && { rotulo: "Matrizes sem ra\xE7a ou lote no cadastro", valor: semRacaLote, onClick: () => go("rebanho") },
    duplicados > 0 && { rotulo: "Brincos repetidos no cadastro", valor: duplicados, cor: "var(--late)" }
  ].filter(Boolean);
  return /* @__PURE__ */ React15.createElement("div", { className: "wrap" }, /* @__PURE__ */ React15.createElement("div", { className: "head" }, /* @__PURE__ */ React15.createElement("div", null, /* @__PURE__ */ React15.createElement("small", null, "Propriet\xE1rio \xB7 ", rot), /* @__PURE__ */ React15.createElement("h1", null, "Painel")), /* @__PURE__ */ React15.createElement("div", { className: "acts noprint" }, anoSel, /* @__PURE__ */ React15.createElement("button", { className: "btn ghost sm", onClick: onExcel }, /* @__PURE__ */ React15.createElement(Download, { size: 16 }), " Excel de ", rot))), /* @__PURE__ */ React15.createElement("h2", { className: "h2", style: { marginTop: 4 } }, "Rebanho hoje", /* @__PURE__ */ React15.createElement("small", null, formatarDataBR(hoje))), /* @__PURE__ */ React15.createElement(Kpis, { itens: [
    { rotulo: "Matrizes", valor: k.total },
    { rotulo: "Cheias", valor: k.cheias, cor: "var(--green)", sub: `${pc(k.cheias).toFixed(0)}% das ativas` },
    { rotulo: "Vazias", valor: k.vazias, cor: "var(--amber)", sub: `${pc(k.vazias).toFixed(0)}% das ativas` },
    { rotulo: "Descarte", valor: k.descartes, cor: "var(--late)" }
  ] }), /* @__PURE__ */ React15.createElement("div", { className: "panel", style: { marginTop: 12 } }, /* @__PURE__ */ React15.createElement("div", { className: "sbar", role: "img", "aria-label": `${k.cheias} cheias, ${k.vazias} vazias, ${k.descartes} em descarte` }, /* @__PURE__ */ React15.createElement("i", { style: { width: `${k.total ? k.cheias / k.total * 100 : 0}%`, background: "var(--green)" } }), /* @__PURE__ */ React15.createElement("i", { style: { width: `${k.total ? k.vazias / k.total * 100 : 0}%`, background: "var(--amber)" } }), /* @__PURE__ */ React15.createElement("i", { style: { width: `${k.total ? k.descartes / k.total * 100 : 0}%`, background: "var(--late)" } })), /* @__PURE__ */ React15.createElement("div", { className: "legend" }, /* @__PURE__ */ React15.createElement("span", { style: { "--c": "var(--green)" } }, "Cheias"), /* @__PURE__ */ React15.createElement("span", { style: { "--c": "var(--amber)" } }, "Vazias"), /* @__PURE__ */ React15.createElement("span", { style: { "--c": "var(--late)" } }, "Descarte")), /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Partos previstos nos pr\xF3ximos 30 dias", valor: sinal, onClick: () => go("parto") }), /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Novilhas em recria", valor: k.emRecria })), /* @__PURE__ */ React15.createElement("h2", { className: "h2" }, "Crias e novilhas", /* @__PURE__ */ React15.createElement("small", null, "hoje")), /* @__PURE__ */ React15.createElement(Kpis, { itens: [
    { rotulo: "Crias no rebanho", valor: criasAtivas.length, sub: `${criasAtivas.filter((c) => c.sexo === "Macho").length} machos \xB7 ${criasAtivas.filter((c) => c.sexo === "F\xEAmea").length} f\xEAmeas` },
    { rotulo: machos.cfg.metaPesoMacho ? `Machos com ${machos.cfg.metaPesoMacho} kg ou mais` : "Machos no peso alvo", valor: machos.cfg.metaPesoMacho ? machos.prontos : "\u2014", cor: machos.prontos ? "var(--green)" : void 0, sub: machos.cfg.metaQtdMacho ? `meta ${machos.cfg.metaQtdMacho}` : "defina a meta em Crias" },
    { rotulo: `Novilhas aptas (${novilhas.length ? "de " + novilhas.length : "nenhuma no lote"})`, valor: novilhasAptas, cor: novilhasAptas ? "var(--green)" : void 0 },
    { rotulo: "Sem pesagem", valor: criasSemPeso, cor: criasSemPeso ? "var(--amber)" : void 0, sub: "crias no rebanho" }
  ] }), /* @__PURE__ */ React15.createElement("h2", { className: "h2" }, "Movimento de ", rot), /* @__PURE__ */ React15.createElement(Kpis, { itens: [
    { rotulo: "Nascimentos", valor: k.nascimentos + k.natimortos, sub: `${k.machos} machos \xB7 ${k.femeas} f\xEAmeas` },
    { rotulo: "IATF / coberturas", valor: k.iatfs },
    { rotulo: "Toques", valor: k.diagnosticos, sub: k.diagnosticos ? `${k.taxaPrenhez.toFixed(0)}% prenhes` : "nenhum no per\xEDodo" },
    { rotulo: "Desmamas", valor: k.desmamas, sub: k.desmamas ? `peso m\xE9dio ${k.pesoMedioDesmama.toFixed(0)} kg` : "nenhuma no per\xEDodo" },
    { rotulo: "Mortes", valor: k.mortes, cor: k.mortes ? "var(--late)" : void 0, sub: k.mortes ? `${k.mortesCrias} crias \xB7 ${k.mortes - k.mortesCrias} outros` : "nenhuma no per\xEDodo" }
  ] }), /* @__PURE__ */ React15.createElement("div", { className: "cols2", style: { marginTop: 16 } }, /* @__PURE__ */ React15.createElement("div", { className: "panel" }, /* @__PURE__ */ React15.createElement("h3", null, "Nascimentos por m\xEAs"), porMes.length === 0 ? /* @__PURE__ */ React15.createElement("p", { className: "sub" }, "Nenhum nascimento lan\xE7ado em ", rot, ".") : /* @__PURE__ */ React15.createElement("div", { className: "mbars", role: "img", "aria-label": "Nascimentos por m\xEAs" }, porMes.map(([mes, n]) => /* @__PURE__ */ React15.createElement("div", { className: "c", key: mes }, /* @__PURE__ */ React15.createElement("b", null, n), /* @__PURE__ */ React15.createElement("i", { style: { height: `${n / maxMes * 100}%` } }), /* @__PURE__ */ React15.createElement("span", null, mesCurto(mes))))), /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Perda ao nascer (natimortos)", valor: `${k.taxaPerda.toFixed(0)}% \xB7 ${k.natimortos}`, cor: k.taxaPerda > 5 ? "var(--late)" : void 0 })), /* @__PURE__ */ React15.createElement("div", { className: "panel" }, /* @__PURE__ */ React15.createElement("h3", null, "A conferir"), pendencias.length === 0 ? /* @__PURE__ */ React15.createElement("p", { className: "sub" }, "Nada pendente. Tudo em ordem.") : pendencias.map((p) => /* @__PURE__ */ React15.createElement(Lead, { key: p.rotulo, rotulo: p.rotulo, valor: p.valor, onClick: p.onClick, cor: p.cor })))), /* @__PURE__ */ React15.createElement("h2", { className: "h2" }, "Dinheiro de ", rot), /* @__PURE__ */ React15.createElement(Kpis, { itens: [
    { rotulo: "Vendas", valor: fmtBRL(k.receitaTotal), pequeno: true },
    { rotulo: "Custos", valor: fmtBRL(k.custoTotal), pequeno: true, sub: "IATF, toque, insumo e frete" },
    { rotulo: "Custo por bezerro", valor: fmtBRL(k.custoPorBezerro), pequeno: true, cor: "var(--amber)" },
    { rotulo: "Margem", valor: fmtBRL(k.margem), pequeno: true, cor: k.margem >= 0 ? "var(--green)" : "var(--late)" }
  ] }), k.receitaTotal === 0 && k.custoTotal === 0 && /* @__PURE__ */ React15.createElement("p", { className: "sub", style: { marginTop: 8 } }, "Ainda n\xE3o h\xE1 vendas ou custos lan\xE7ados em ", rot, "."), /* @__PURE__ */ React15.createElement("h2", { className: "h2" }, "Atividade recente"), /* @__PURE__ */ React15.createElement("div", { className: "sheet" }, recentes.length === 0 ? /* @__PURE__ */ React15.createElement("div", { className: "empty" }, "Nada lan\xE7ado ainda.") : recentes.map((e) => /* @__PURE__ */ React15.createElement("div", { className: "led-r", key: e.id, style: { "--cols": "1fr auto", minHeight: 48 } }, /* @__PURE__ */ React15.createElement("span", { style: { fontSize: 14.5 } }, descreverEvento(e, dados)), /* @__PURE__ */ React15.createElement("span", { className: "m mut" }, formatarDataBR(e.data))))), /* @__PURE__ */ React15.createElement("details", { className: "ferr noprint" }, /* @__PURE__ */ React15.createElement("summary", null, "Ferramentas avan\xE7adas"), /* @__PURE__ */ React15.createElement("div", { className: "in2" }, /* @__PURE__ */ React15.createElement("button", { className: "btn quiet sm", onClick: onRecarregar }, /* @__PURE__ */ React15.createElement(RefreshCw, { size: 15 }), " Recarregar dados da planilha"), /* @__PURE__ */ React15.createElement("button", { className: "btn quiet sm", onClick: () => setConfirmar(true), disabled: sincronizando }, /* @__PURE__ */ React15.createElement(RefreshCw, { size: 15 }), " Sincronizar planilha agora")), confirmar && /* @__PURE__ */ React15.createElement(Aviso, { tipo: "info" }, "Isso regrava a planilha inteira com o que est\xE1 na tela (nada se perde; atualiza f\xF3rmulas, formata\xE7\xE3o e a aba Resumo). ", modoTeste ? "No modo teste n\xE3o faz nada de verdade." : "Pode levar alguns segundos.", /* @__PURE__ */ React15.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8 } }, /* @__PURE__ */ React15.createElement("button", { className: "btn sm", onClick: async () => {
    setConfirmar(false);
    await onSync();
  } }, "Confirmar"), /* @__PURE__ */ React15.createElement("button", { className: "btn quiet sm", onClick: () => setConfirmar(false) }, "Cancelar")))));
}

// src/telas/Relatorios.jsx
import React16, { useMemo as useMemo14, useState as useState15 } from "react";
import { Printer, Download as Download2, FileDown as FileDown2, Loader2 as Loader27 } from "lucide-react";
var NOMES_CURTOS = { previsao: "Parto", nascimentos: "Nascimentos", melhores: "Melhores vacas", iatf: "IATF", situacao: "Situa\xE7\xE3o", crias: "Crias", vendas: "Vendas", mortes: "Mortes" };
function Relatorios({ anoSel, dados, ano, hoje, onExcel, onExcelRelatorio }) {
  const [aba, setAba] = useState15("previsao");
  const [tipoPlan, setTipoPlan] = useState15("matrizes");
  const [gerando, setGerando] = useState15(false);
  const [erroPdf, setErroPdf] = useState15("");
  async function pdf() {
    if (!rel || gerando) return;
    setGerando(true);
    setErroPdf("");
    try {
      await baixarPDF({ ...rel, subtitulo: def && !def.porAno ? "Situa\xE7\xE3o de hoje" : `Ano de gest\xE3o: ${rotuloAno(ano)}` });
    } catch (e) {
      console.error(e);
      setErroPdf("N\xE3o consegui gerar o PDF agora. Tente de novo com internet.");
    }
    setGerando(false);
  }
  const abas = [...RELATORIOS.map((r) => ({ id: r.id, label: NOMES_CURTOS[r.id] || r.titulo })), { id: "planilha", label: "Planilha" }];
  const def = RELATORIOS.find((r) => r.id === aba);
  const rel = useMemo14(() => def ? montarRelatorio(aba, dados, ano, hoje) : null, [aba, dados, ano, hoje]);
  const evsAno = useMemo14(() => filtrarPorAno(dados.eventos, ano), [dados.eventos, ano]);
  const linhasPlan = useMemo14(
    () => aba === "planilha" ? linhasPlanilha(tipoPlan, { matrizes: dados.matrizes, touros: dados.touros, eventos: evsAno, todosEventos: dados.eventos }) : [],
    [aba, tipoPlan, dados, evsAno]
  );
  return /* @__PURE__ */ React16.createElement("div", { className: "wrap" }, /* @__PURE__ */ React16.createElement("div", { className: "head" }, /* @__PURE__ */ React16.createElement("div", null, /* @__PURE__ */ React16.createElement("small", null, "Propriet\xE1rio \xB7 ", rotuloAno(ano)), /* @__PURE__ */ React16.createElement("h1", null, aba === "planilha" ? "Planilha" : "Relat\xF3rios")), /* @__PURE__ */ React16.createElement("div", { className: "acts noprint" }, anoSel, def && /* @__PURE__ */ React16.createElement("button", { className: "btn sm", onClick: pdf, disabled: gerando }, gerando ? /* @__PURE__ */ React16.createElement(Loader27, { size: 16, className: "spin" }) : /* @__PURE__ */ React16.createElement(FileDown2, { size: 16 }), " PDF"), def && /* @__PURE__ */ React16.createElement("button", { className: "btn quiet sm", onClick: () => window.print() }, /* @__PURE__ */ React16.createElement(Printer, { size: 16 }), " Imprimir"), def && /* @__PURE__ */ React16.createElement("button", { className: "btn ghost sm", onClick: () => onExcelRelatorio(rel) }, /* @__PURE__ */ React16.createElement(Download2, { size: 16 }), " Excel deste relat\xF3rio"), aba === "planilha" && /* @__PURE__ */ React16.createElement("button", { className: "btn ghost sm", onClick: onExcel }, /* @__PURE__ */ React16.createElement(Download2, { size: 16 }), " Excel completo de ", rotuloAno(ano)))), erroPdf && /* @__PURE__ */ React16.createElement("p", { className: "late", role: "alert" }, erroPdf), /* @__PURE__ */ React16.createElement(IndexTabs, { tabs: abas, value: aba, onChange: setAba, rotulo: "Relat\xF3rios" }), /* @__PURE__ */ React16.createElement("div", { className: "sheet pad" }, def && rel && /* @__PURE__ */ React16.createElement(React16.Fragment, null, /* @__PURE__ */ React16.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rel.titulo), !def.porAno && /* @__PURE__ */ React16.createElement("p", { className: "sub" }, "Este relat\xF3rio mostra a situa\xE7\xE3o de hoje e n\xE3o muda com o ano escolhido."), /* @__PURE__ */ React16.createElement(Kpis, { itens: rel.resumo.map((r) => ({ rotulo: r.rotulo, valor: r.valor })) }), rel.secoes.map((s) => /* @__PURE__ */ React16.createElement(SecaoRelatorio, { key: s.titulo, secao: s }))), aba === "planilha" && /* @__PURE__ */ React16.createElement(React16.Fragment, null, /* @__PURE__ */ React16.createElement("p", { className: "sub" }, "Os dados brutos de cada aba, como est\xE3o na planilha. Os lan\xE7amentos mostram s\xF3 ", rotuloAno(ano), "; matrizes e touros aparecem inteiros."), /* @__PURE__ */ React16.createElement("div", { className: "seg", style: { flexWrap: "wrap", marginBottom: 14 }, role: "group", "aria-label": "Aba da planilha" }, ABAS_EXCEL.map(([nome, tipo]) => /* @__PURE__ */ React16.createElement("button", { key: tipo, "aria-pressed": tipoPlan === tipo, onClick: () => setTipoPlan(tipo), style: { flex: "0 0 auto", minHeight: 40, fontSize: 13 } }, nome))), /* @__PURE__ */ React16.createElement(TabelaLinhas, { rows: linhasPlan }))));
}

// src/app.jsx
var OWNER_PIN = typeof __PIN_TESTE__ !== "undefined" ? __PIN_TESTE__ : "1537";
var VAZIO = { matrizes: [], touros: [], eventos: [], config: {} };
function Marca() {
  return /* @__PURE__ */ React17.createElement("div", { className: "brand" }, /* @__PURE__ */ React17.createElement("small", null, "Fazenda Ibira\xE7u"), /* @__PURE__ */ React17.createElement("b", null, "Gest\xE3o da Pecu\xE1ria"));
}
function SeletorAno({ ano, anos, onChange }) {
  return /* @__PURE__ */ React17.createElement("label", { className: "chip", title: "Ano de gest\xE3o" }, /* @__PURE__ */ React17.createElement("span", { className: "sr" }, "Ano de gest\xE3o"), /* @__PURE__ */ React17.createElement("span", { "aria-hidden": "true" }, "ANO"), /* @__PURE__ */ React17.createElement("select", { "aria-label": "Ano de gest\xE3o", value: String(ano), onChange: (e) => onChange(e.target.value === "todos" ? "todos" : Number(e.target.value)) }, anos.map((a) => /* @__PURE__ */ React17.createElement("option", { key: a, value: a }, a)), /* @__PURE__ */ React17.createElement("option", { value: "todos" }, "Todos")), /* @__PURE__ */ React17.createElement(ChevronDown2, { size: 14, "aria-hidden": "true" }));
}
function quandoTxt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} \xE0s ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function ChipFila({ est, onClick }) {
  if (!est.pendentes) return null;
  if (est.semInternet) {
    return /* @__PURE__ */ React17.createElement("button", { className: "chip fila-off", onClick, "data-testid": "chip-fila" }, /* @__PURE__ */ React17.createElement(CloudOff, { size: 14 }), " ", est.pendentes, " no celular");
  }
  if (est.erroPlanilha) {
    return /* @__PURE__ */ React17.createElement("button", { className: "chip fila-erro", onClick, "data-testid": "chip-fila" }, /* @__PURE__ */ React17.createElement(AlertTriangle, { size: 14 }), " erro ao gravar");
  }
  return /* @__PURE__ */ React17.createElement("button", { className: "chip", onClick, "data-testid": "chip-fila" }, /* @__PURE__ */ React17.createElement(Loader28, { size: 14, className: "spin" }), " gravando ", est.pendentes);
}
function GestaoPecuaria() {
  const [tab, setTab] = useState16("lancar");
  const [dados, setDados] = useState16(VAZIO);
  const dadosRef = useRef7(VAZIO);
  const [loading, setLoading] = useState16(true);
  const [aviso, setAviso] = useState16(null);
  const [versaoScript, setVersaoScript] = useState16(null);
  const [ownerMode, setOwnerMode] = useState16(false);
  const [pinAberto, setPinAberto] = useState16(false);
  const [pin, setPin] = useState16("");
  const [pinErro, setPinErro] = useState16(false);
  const [hoje, setHoje] = useState16(todayISO());
  const [ano, setAno] = useState16(() => anoDe(todayISO()));
  const [filaEst, setFilaEst] = useState16(estadoFila());
  const [filaAberta, setFilaAberta] = useState16(false);
  const [descartarUid, setDescartarUid] = useState16(null);
  const [sincronizando, setSincronizando] = useState16(false);
  const [preset, setPreset] = useState16(null);
  const [atualizadoEm, setAtualizadoEm] = useState16(null);
  const [doCelular, setDoCelular] = useState16(false);
  const versaoRef = useRef7(null);
  const timerCopia = useRef7(null);
  const pendentes = filaEst.pendentes;
  useEffect8(() => assinarFila(setFilaEst), []);
  useEffect8(() => {
    const agora = () => {
      if (dadosRef.current !== VAZIO) {
        clearTimeout(timerCopia.current);
        guardarCopia();
      }
    };
    const vis = () => {
      if (document.visibilityState === "hidden") agora();
    };
    window.addEventListener("pagehide", agora);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("pagehide", agora);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  function commit(novo) {
    dadosRef.current = novo;
    setDados(novo);
    clearTimeout(timerCopia.current);
    timerCopia.current = setTimeout(guardarCopia, 400);
  }
  function guardarCopia(quando) {
    const anterior = lerLocal(CHAVE_DADOS, null);
    gravarNoCelular(CHAVE_DADOS, {
      dados: dadosRef.current,
      versao: versaoRef.current,
      atualizadoEm: quando || anterior && anterior.atualizadoEm || null,
      guardadoEm: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  function definirVersao(v) {
    versaoRef.current = v;
    setVersaoScript(v);
  }
  useEffect8(() => {
    const f = () => setHoje(todayISO());
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);
  useEffect8(() => {
    carregar();
  }, []);
  async function carregar() {
    setAviso(null);
    const copia = lerLocal(CHAVE_DADOS, null);
    const temCopia = !!(copia && copia.dados && Array.isArray(copia.dados.matrizes));
    if (temCopia && dadosRef.current === VAZIO) {
      const comFila = aplicarPendentes(copia.dados, estadoFila().itens);
      dadosRef.current = comFila;
      setDados(comFila);
      definirVersao(copia.versao || null);
      setAtualizadoEm(copia.atualizadoEm || null);
      setDoCelular(true);
      setLoading(false);
    } else if (!temCopia && dadosRef.current === VAZIO) {
      setLoading(true);
    }
    const inicio = Date.now();
    try {
      await enviar();
      const data = await lerTudo();
      const extra = [...enviadosDesde(inicio), ...estadoFila().itens];
      const novos = aplicarPendentes(normalizarDados(data), extra);
      const v = Number(data.versao) || 0;
      definirVersao(v);
      commit(novos);
      const agora = (/* @__PURE__ */ new Date()).toISOString();
      setAtualizadoEm(agora);
      setDoCelular(false);
      clearTimeout(timerCopia.current);
      guardarCopia(agora);
      if (v < VERSAO_MINIMA_SCRIPT) {
        if (MODO_TESTE) {
          setAviso({ tipo: "info", texto: `Modo teste: a planilha ainda est\xE1 na vers\xE3o ${v || "antiga"} do script. As telas novas j\xE1 funcionam, mas o registro de mortes s\xF3 ser\xE1 gravado depois que o script v${VERSAO_MINIMA_SCRIPT} for publicado.` });
        } else {
          setAviso({ tipo: "erro", texto: `ATEN\xC7\xC3O: o script da planilha est\xE1 desatualizado (vers\xE3o ${v || "antiga"}). O que voc\xEA lan\xE7ar aparece na tela, mas N\xC3O est\xE1 sendo gravado na planilha. Avise o respons\xE1vel pelo sistema.` });
        }
      }
    } catch (e) {
      console.error("Erro ao carregar dados da planilha", e);
      const copiaAgora = lerLocal(CHAVE_DADOS, null);
      if (copiaAgora && copiaAgora.dados) {
        setDoCelular(true);
        setAviso({
          tipo: "info",
          texto: `Sem internet agora. Voc\xEA est\xE1 vendo os dados guardados neste celular${copiaAgora.atualizadoEm ? ` (planilha lida em ${quandoTxt(copiaAgora.atualizadoEm)})` : ""}. Pode lan\xE7ar normalmente: fica guardado aqui e vai para a planilha quando a internet voltar.`
        });
      } else {
        setAviso({ tipo: "erro", texto: "N\xE3o consegui falar com a planilha agora e este celular ainda n\xE3o tem os dados guardados. Abra o app uma vez com internet." });
      }
    }
    setLoading(false);
  }
  const semInternet = () => typeof navigator !== "undefined" && navigator.onLine === false;
  const NOTA_FILA = " Sem internet: ficou guardado neste celular e vai para a planilha quando a internet voltar.";
  const notaFila = () => semInternet() ? NOTA_FILA : "";
  function salvarLancamento(tipo, form) {
    const antes = dadosRef.current;
    const r = aplicarLancamento(antes, tipo, form);
    commit(r.estado);
    enfileirar([
      ...r.eventosNovos.map((e) => ({ action: "appendEvento", tipo: e.tipo, evento: e })),
      ...r.matrizesAlteradas.map((m) => ({ action: "upsertMatriz", matriz: m })),
      ...r.tourosNovos.map((t) => ({ action: "appendTouro", touro: t }))
    ], tipo === "cadastro" ? "nova matriz" : tipo === "touro" ? "touro" : `lan\xE7amento: ${tipo}`);
    if (tipo === "cadastro") return `Matriz ${r.matrizesAlteradas[0].brinco} cadastrada.${notaFila()}`;
    if (tipo === "touro") return `Touro ${r.tourosNovos[0].nome} cadastrado.${notaFila()}`;
    const mudou = r.matrizesAlteradas.map((m) => {
      const a = antes.matrizes.find((x) => x.id === m.id);
      const partes = [];
      if (a && a.status !== m.status) partes.push(`${a.status} \u2192 ${m.status}`);
      if (a && a.categoria !== m.categoria) partes.push(`${a.categoria} \u2192 ${m.categoria}`);
      return partes.length ? `${m.brinco}: ${partes.join(", ")}` : "";
    }).filter(Boolean);
    return `Salvo: ${descreverEvento(r.eventosNovos[0], r.estado)}.${mudou.length ? ` Atualizado: ${mudou.join("; ")}.` : ""}${notaFila()}`;
  }
  function salvarMatriz(m) {
    const d = dadosRef.current;
    commit({ ...d, matrizes: d.matrizes.map((x) => x.id === m.id ? m : x) });
    enfileirar([{ action: "upsertMatriz", matriz: m }], `matriz ${m.brinco}`);
  }
  function salvarConfig(parcial) {
    const d = dadosRef.current;
    commit({ ...d, config: { ...d.config || {}, ...parcial } });
    enfileirar([{ action: "setConfig", config: parcial }], "metas");
  }
  const scriptAntes = (v) => !MODO_TESTE && versaoScript !== null && (versaoScript || 0) < v;
  function postsDeLote(eventos, matrizes, touros) {
    const posts = [];
    for (let i = 0; i < eventos.length; i += 40) posts.push({ action: "appendEventos", itens: eventos.slice(i, i + 40) });
    if (matrizes.length) posts.push({ action: "upsertMatrizes", matrizes });
    (touros || []).forEach((t) => posts.push({ action: "appendTouro", touro: t }));
    return posts;
  }
  async function registrarVenda(form) {
    if (scriptAntes(9)) return { ok: false, msg: "O script da planilha est\xE1 desatualizado e n\xE3o aceita vendas. Avise o respons\xE1vel pelo sistema." };
    const r = aplicarVenda(dadosRef.current, form, { hoje });
    if (r.erro) return { ok: false, msg: r.erro };
    commit(r.estado);
    enfileirar(postsDeLote(r.eventosNovos.map((e) => ({ tipo: e.tipo, evento: e })), r.matrizesAlteradas), "venda");
    const baixas = r.itens.filter((i) => i.criaId || i.matrizId).length;
    return {
      ok: true,
      msg: `Venda gravada: ${r.totais.qtd} animal(is), ${fmtKg(r.totais.kg)}, ${fmtBRL(r.totais.valor)}.${baixas ? ` ${baixas} sa\xEDram do rebanho.` : ""}${r.avisos.length ? ` Aten\xE7\xE3o: ${r.avisos.join(" ")}` : ""}${notaFila()}`
    };
  }
  async function gravarLote(res, rotulo) {
    if (scriptAntes(9)) return { ok: false, msg: "O script da planilha est\xE1 desatualizado e n\xE3o aceita lote. Avise o respons\xE1vel pelo sistema." };
    if (scriptAntes(10) && res.eventosParaGravar.some((x) => x.tipo === "morte")) {
      return { ok: false, msg: "O script da planilha est\xE1 desatualizado e n\xE3o aceita mortes. Avise o respons\xE1vel pelo sistema." };
    }
    commit(res.estado);
    enfileirar(postsDeLote(res.eventosParaGravar, res.matrizesParaGravar, res.tourosParaGravar), rotulo || "lote");
    return { ok: true, offline: semInternet(), msg: `Gravados ${res.eventosParaGravar.length} lan\xE7amento(s) e ${res.matrizesParaGravar.length} matriz(es) atualizada(s).${notaFila()}` };
  }
  const MSG_SCRIPT_MORTE = "O script da planilha est\xE1 desatualizado e n\xE3o aceita mortes. Avise o respons\xE1vel pelo sistema.";
  async function registrarMorte(form) {
    if (scriptAntes(10)) return { ok: false, msg: MSG_SCRIPT_MORTE };
    const v = validarMorte(dadosRef.current, form, hoje);
    if (v.erros.length) return { ok: false, msg: v.erros.join(" ") };
    const r = aplicarLancamento(dadosRef.current, "morte", form);
    const ev = r.eventosNovos[0];
    commit(r.estado);
    enfileirar([
      { action: "appendEvento", tipo: "morte", evento: ev },
      ...r.matrizesAlteradas.length ? [{ action: "upsertMatrizes", matrizes: r.matrizesAlteradas }] : []
    ], `morte ${ev.brinco || ""}`.trim());
    const morta = r.matrizesAlteradas[0];
    const orfas = morta ? listarCrias(r.estado, hoje).filter((c) => c.orfa && c.matrizId === morta.id) : [];
    const partes = [`Morte registrada: ${descreverEvento(ev, r.estado)}.`];
    if (morta) partes.push(`A matriz ${morta.brinco} saiu da lista de vacas.`);
    if (orfas.length) partes.push(`Aten\xE7\xE3o: ${orfas.length === 1 ? "a cria" : "as crias"} ${orfas.map((c) => c.brinco || "sem n\xFAmero").join(", ")} ficou(aram) \xF3rf\xE3(s). Os funcion\xE1rios continuam criando.`);
    if (v.avisos.length) partes.push(v.avisos.join(" "));
    return { ok: true, msg: partes.join(" ") + notaFila() };
  }
  function gravarCorrecao(r, rotulo) {
    commit(aplicarMudancasNoEstado(dadosRef.current, r.mudancas));
    enfileirar(postsDeMudancas(r.mudancas), rotulo);
    return null;
  }
  async function corrigirNascimento(id, campos) {
    const r = editarNascimento(dadosRef.current, id, campos);
    if (r.erro) return { ok: false, msg: r.erro };
    if (scriptAntes(10) && r.mudancas.eventos.some((m) => m.tipo === "morte")) return { ok: false, msg: MSG_SCRIPT_MORTE };
    gravarCorrecao(r, "corre\xE7\xE3o de nascimento");
    const ligados = r.mudancas.eventos.length - 1 + r.mudancas.matrizes.length;
    const partes = [`Nascimento corrigido: ${descreverEvento(r.evento, dadosRef.current)}.`];
    if (ligados > 0) partes.push(`Tamb\xE9m acertei ${ligados} registro(s) ligados a essa cria.`);
    if (r.avisos.length) partes.push(`Aten\xE7\xE3o: ${r.avisos.join(" ")}`);
    return { ok: true, msg: partes.join(" ") + notaFila() };
  }
  async function corrigirMorte(id, campos) {
    if (scriptAntes(10)) return { ok: false, msg: MSG_SCRIPT_MORTE };
    const r = editarMorte(dadosRef.current, id, campos, hoje);
    if (r.erro) return { ok: false, msg: r.erro };
    gravarCorrecao(r, "corre\xE7\xE3o de morte");
    return { ok: true, msg: `Morte corrigida: ${descreverEvento(r.evento, dadosRef.current)}.${notaFila()}` };
  }
  async function anularUmaMorte(id) {
    if (scriptAntes(10)) return { ok: false, msg: MSG_SCRIPT_MORTE };
    const r = anularMorte(dadosRef.current, id);
    if (r.erro) return { ok: false, msg: r.erro };
    gravarCorrecao(r, "anula\xE7\xE3o de morte");
    const m = r.mudancas.matrizes[0];
    return { ok: true, msg: `Morte anulada.${m ? ` A matriz ${m.brinco} voltou a ${m.status}.` : " O animal voltou a contar no rebanho."}${notaFila()}` };
  }
  async function sincronizarTudo() {
    if (pendentes > 0 || doCelular) {
      setAviso({ tipo: "erro", texto: 'Antes de sincronizar, \xE9 preciso internet e nenhum lan\xE7amento esperando na fila. Toque em "Recarregar dados" com internet e tente de novo.' });
      return;
    }
    setSincronizando(true);
    const d = dadosRef.current;
    const a = anoDe(hoje);
    const resumo = buildResumoRows(calcularKPIs(d.matrizes, filtrarPorAno(d.eventos, a)), a);
    try {
      await postar({ action: "syncAll", matrizes: d.matrizes, touros: d.touros, eventos: d.eventos, resumo });
      setAviso({ tipo: "ok", texto: `Planilha sincronizada${MODO_TESTE ? " (modo teste: simulado)" : ""}. A aba Resumo mostra o ano ${a}.` });
    } catch (e) {
      setAviso({ tipo: "erro", texto: `N\xE3o consegui sincronizar: ${e.message}.` });
    }
    setSincronizando(false);
  }
  function tentarEntrar() {
    if (pin === OWNER_PIN) {
      setOwnerMode(true);
      setPinAberto(false);
      setPin("");
      setPinErro(false);
      setTab("painel");
    } else {
      setPinErro(true);
    }
  }
  function sairDoModoDono() {
    setOwnerMode(false);
    if (tab === "painel" || tab === "relatorios") setTab("lancar");
  }
  function mudarTab(t) {
    setPreset(null);
    setTab(t);
  }
  function lancarDaVaca(tipo, matrizId) {
    setPreset({ tipo, matrizId, n: Date.now() });
    setTab("lancar");
  }
  const anos = useMemo15(() => anosDisponiveis(dados.eventos, hoje), [dados.eventos, hoje]);
  const itensNav = [
    ownerMode && { id: "painel", label: "Painel", Icon: LayoutDashboard },
    { id: "lancar", label: "Lan\xE7ar", Icon: Plus3 },
    { id: "parto", label: "Parto", Icon: CalendarClock },
    { id: "crias", label: "Crias", Icon: Baby },
    { id: "rebanho", label: "Rebanho", Icon: List },
    ownerMode && { id: "relatorios", label: "Relat\xF3rios", Icon: FileText }
  ].filter(Boolean);
  const anoSel = /* @__PURE__ */ React17.createElement(SeletorAno, { ano, anos, onChange: setAno });
  const botaoDono = ownerMode ? /* @__PURE__ */ React17.createElement("button", { className: "chip on", onClick: sairDoModoDono, "aria-label": "Sair do modo propriet\xE1rio", title: "Voltar para o modo funcion\xE1rio" }, /* @__PURE__ */ React17.createElement(Unlock, { size: 15 }), " DONO") : /* @__PURE__ */ React17.createElement("button", { className: "chip lock", onClick: () => {
    setPinAberto(true);
    setPin("");
    setPinErro(false);
  }, "aria-label": "Entrar como propriet\xE1rio", title: "Entrar como propriet\xE1rio" }, /* @__PURE__ */ React17.createElement(Lock2, { size: 16 }));
  if (loading) {
    return /* @__PURE__ */ React17.createElement("div", { className: "app" }, /* @__PURE__ */ React17.createElement("style", null, CSS), /* @__PURE__ */ React17.createElement("div", { className: "main" }, /* @__PURE__ */ React17.createElement("div", { className: "loading" }, /* @__PURE__ */ React17.createElement(Loader28, { size: 20, className: "spin" }), " Abrindo o livro do rebanho...")));
  }
  return /* @__PURE__ */ React17.createElement("div", { className: "app" }, /* @__PURE__ */ React17.createElement("style", null, CSS), /* @__PURE__ */ React17.createElement("aside", { className: "side" }, /* @__PURE__ */ React17.createElement(Marca, null), /* @__PURE__ */ React17.createElement("nav", { "aria-label": "Telas" }, itensNav.map(({ id, label, Icon }) => /* @__PURE__ */ React17.createElement("button", { key: id, "aria-current": tab === id ? "page" : void 0, onClick: () => mudarTab(id) }, /* @__PURE__ */ React17.createElement(Icon, null), " ", label))), /* @__PURE__ */ React17.createElement("div", { className: "foot" }, botaoDono)), /* @__PURE__ */ React17.createElement("div", { className: "main" }, MODO_TESTE && /* @__PURE__ */ React17.createElement("div", { className: "banner-teste", role: "status" }, /* @__PURE__ */ React17.createElement("b", null, "MODO TESTE"), /* @__PURE__ */ React17.createElement("span", null, "L\xEA os dados reais da planilha, mas N\xC3O grava nada nela. O que voc\xEA lan\xE7ar aqui some ao recarregar com internet."), /* @__PURE__ */ React17.createElement("button", { onClick: carregar }, "Recarregar dados")), /* @__PURE__ */ React17.createElement("header", { className: "topbar" }, /* @__PURE__ */ React17.createElement("div", { className: "in" }, /* @__PURE__ */ React17.createElement(Marca, null), /* @__PURE__ */ React17.createElement(ChipFila, { est: filaEst, onClick: () => setFilaAberta(true) }), botaoDono)), pendentes > 0 && /* @__PURE__ */ React17.createElement("span", { className: "sr", role: "status" }, filaEst.semInternet ? `${pendentes} lan\xE7amento(s) guardado(s) no celular esperando internet` : "Gravando na planilha"), pendentes > 0 && /* @__PURE__ */ React17.createElement("div", { className: "lado-fila" }, /* @__PURE__ */ React17.createElement(ChipFila, { est: filaEst, onClick: () => setFilaAberta(true) })), aviso && /* @__PURE__ */ React17.createElement("div", { className: "wrap" }, /* @__PURE__ */ React17.createElement(Aviso, { tipo: aviso.tipo === "erro" ? void 0 : aviso.tipo, onClose: () => setAviso(null) }, aviso.texto)), tab === "lancar" && /* @__PURE__ */ React17.createElement(
    Lancar,
    {
      dados,
      hoje,
      ownerMode,
      preset,
      onSalvar: salvarLancamento,
      onGravarLote: gravarLote,
      modoTeste: MODO_TESTE,
      onRegistrarMorte: registrarMorte,
      onEditarNascimento: corrigirNascimento,
      onEditarMorte: corrigirMorte,
      onAnularMorte: anularUmaMorte
    }
  ), tab === "parto" && /* @__PURE__ */ React17.createElement(Parto, { dados, hoje, onLancar: lancarDaVaca }), tab === "crias" && /* @__PURE__ */ React17.createElement(
    Crias,
    {
      dados,
      hoje,
      ownerMode,
      modoTeste: MODO_TESTE,
      onLancar: salvarLancamento,
      onGravarLote: gravarLote,
      onVender: registrarVenda,
      onSalvarMatriz: salvarMatriz,
      onSalvarConfig: salvarConfig,
      onRegistrarMorte: registrarMorte,
      onEditarNascimento: corrigirNascimento,
      onEditarMorte: corrigirMorte,
      onAnularMorte: anularUmaMorte
    }
  ), tab === "rebanho" && /* @__PURE__ */ React17.createElement(Rebanho, { dados, ownerMode, onSalvarMatriz: salvarMatriz }), tab === "painel" && ownerMode && /* @__PURE__ */ React17.createElement(
    Painel,
    {
      anoSel,
      dados,
      ano,
      hoje,
      go: mudarTab,
      modoTeste: MODO_TESTE,
      sincronizando,
      onExcel: () => exportarExcel(dadosRef.current, ano, hoje),
      onSync: sincronizarTudo,
      onRecarregar: carregar
    }
  ), tab === "relatorios" && ownerMode && /* @__PURE__ */ React17.createElement(
    Relatorios,
    {
      anoSel,
      dados,
      ano,
      hoje,
      onExcel: () => exportarExcel(dadosRef.current, ano, hoje),
      onExcelRelatorio: (rel) => exportarRelatorioExcel(rel, ano, hoje)
    }
  ), /* @__PURE__ */ React17.createElement("div", { className: "foot-note" }, "Fazenda Ibira\xE7u \xB7 app ", VERSAO_APP, " \xB7 planilha ", versaoScript ? `v${versaoScript}` : "vers\xE3o antiga", MODO_TESTE ? " \xB7 TESTE" : "", atualizadoEm ? ` \xB7 dados de ${quandoTxt(atualizadoEm)}${doCelular ? " (guardados no celular)" : ""}` : "")), /* @__PURE__ */ React17.createElement("nav", { className: `bnav${itensNav.length > 5 ? " mini" : ""}`, "aria-label": "Telas (celular)" }, itensNav.map(({ id, label, Icon }) => /* @__PURE__ */ React17.createElement("button", { key: id, "aria-current": tab === id ? "page" : void 0, onClick: () => mudarTab(id) }, /* @__PURE__ */ React17.createElement(Icon, null), " ", label))), filaAberta && /* @__PURE__ */ React17.createElement(Modal, { titulo: "Lan\xE7amentos guardados no celular", onClose: () => {
    setFilaAberta(false);
    setDescartarUid(null);
  } }, filaEst.pendentes === 0 ? /* @__PURE__ */ React17.createElement("p", { className: "sub", style: { marginTop: 0 } }, "Tudo j\xE1 chegou na planilha. Nada esperando.") : /* @__PURE__ */ React17.createElement(React17.Fragment, null, /* @__PURE__ */ React17.createElement("p", { className: "sub", style: { marginTop: 0 } }, filaEst.semInternet ? "Sem internet. Estes lan\xE7amentos est\xE3o guardados neste celular e v\xE3o sozinhos para a planilha quando a internet voltar. N\xE3o feche o app pela metade de um lan\xE7amento, mas pode fechar e abrir \xE0 vontade: nada se perde." : filaEst.erroPlanilha ? `A planilha recusou um lan\xE7amento: ${filaEst.erroPlanilha}. Os outros esperam na fila, na ordem.` : "Enviando para a planilha..."), /* @__PURE__ */ React17.createElement("div", { className: "sheet", "data-testid": "lista-fila" }, filaEst.itens.map((it) => /* @__PURE__ */ React17.createElement("div", { className: "led-r", key: it.uid, style: { "--cols": ownerMode ? "1fr auto auto" : "1fr auto", minHeight: 48 } }, /* @__PURE__ */ React17.createElement("span", { style: { fontSize: 14 } }, it.rotulo || it.payload.action, it.erro ? /* @__PURE__ */ React17.createElement("small", { style: { display: "block", color: it.rede ? "var(--amber)" : "var(--late)" } }, it.rede ? "esperando internet" : it.erro) : null), /* @__PURE__ */ React17.createElement("span", { className: "m mut" }, quandoTxt(it.criadoEm)), ownerMode && (descartarUid === it.uid ? /* @__PURE__ */ React17.createElement("button", { className: "btn sm", style: { background: "var(--late)" }, onClick: () => {
    descartar(it.uid);
    setDescartarUid(null);
  } }, "Confirmar") : /* @__PURE__ */ React17.createElement("button", { className: "x-peq", "aria-label": "Descartar este lan\xE7amento da fila", title: "Descartar (s\xF3 se a planilha recusa sempre)", onClick: () => setDescartarUid(it.uid) }, /* @__PURE__ */ React17.createElement(Trash23, { size: 16 })))))), ownerMode && descartarUid && /* @__PURE__ */ React17.createElement(Aviso, null, "Descartar tira esse lan\xE7amento da fila e ele N\xC3O vai para a planilha (continua na tela at\xE9 recarregar). Use s\xF3 se a planilha recusa sempre.")), /* @__PURE__ */ React17.createElement("button", { className: "btn wide", style: { marginTop: 12 }, onClick: () => enviar(), disabled: filaEst.enviando || filaEst.pendentes === 0 }, filaEst.enviando ? /* @__PURE__ */ React17.createElement(Loader28, { size: 18, className: "spin" }) : /* @__PURE__ */ React17.createElement(RefreshCw2, { size: 18 }), " Tentar enviar agora")), pinAberto && !ownerMode && /* @__PURE__ */ React17.createElement(Modal, { titulo: "\xC1rea do propriet\xE1rio", onClose: () => setPinAberto(false) }, /* @__PURE__ */ React17.createElement("form", { onSubmit: (e) => {
    e.preventDefault();
    tentarEntrar();
  } }, /* @__PURE__ */ React17.createElement("div", { className: "fld" }, /* @__PURE__ */ React17.createElement("label", { htmlFor: "pin" }, "Senha (PIN)"), /* @__PURE__ */ React17.createElement("input", { id: "pin", type: "password", inputMode: "numeric", autoComplete: "off", autoFocus: true, value: pin, onChange: (e) => {
    setPin(e.target.value);
    setPinErro(false);
  } }), pinErro && /* @__PURE__ */ React17.createElement("div", { className: "hint late", role: "alert" }, "Senha incorreta.")), /* @__PURE__ */ React17.createElement("button", { type: "submit", className: "btn wide" }, "Entrar"))));
}
createRoot(document.getElementById("root")).render(/* @__PURE__ */ React17.createElement(GestaoPecuaria, null));
