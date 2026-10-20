// src/app.jsx
import React25, { useState as useState24, useEffect as useEffect11, useMemo as useMemo21, useRef as useRef9 } from "react";
import { createRoot } from "react-dom/client";
import {
  Plus as Plus8,
  CalendarClock,
  List,
  LayoutDashboard,
  FileText,
  Lock as Lock2,
  Unlock,
  Loader2 as Loader213,
  ChevronDown as ChevronDown2,
  Baby,
  CloudOff,
  AlertTriangle,
  RefreshCw as RefreshCw2,
  Trash2 as Trash26,
  Syringe as Syringe2
} from "lucide-react";

// src/logica.js
var VERSAO_APP = "10.3 (20/10/26)";
var VERSAO_MINIMA_SCRIPT = 12;
var PERIODO_GESTACAO_DIAS = 285;
var TIPOS_FUNCIONARIO = ["nascimento", "desmama", "insumo", "descarte", "pesagem", "morte"];
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
  { id: "morte", label: "Morte" },
  { id: "manejo", label: "Manejo" }
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
    const ativa2 = mortes.find(morteAtiva);
    if (ativa2 && m.status !== "Morta") return { ...m, status: "Morta", dataBaixa: m.dataBaixa || ativa2.data || "", motivoBaixa: m.motivoBaixa || `Morte: ${ativa2.causa || ""}` };
    if (!ativa2 && m.status === "Morta") return { ...m, status: mortes[mortes.length - 1].statusAnterior || "Vazia", dataBaixa: "", motivoBaixa: "" };
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
function origemDaCria(nasc, eventos, touros, protocolos) {
  const informado = nomeTouroEvento(nasc, touros);
  if (informado) return { origem: "Informado", pai: informado, iatfData: "", rotulo: informado };
  if (!nasc.matrizId) return { origem: "Sem m\xE3e", pai: "", iatfData: "", rotulo: "M\xE3e n\xE3o informada" };
  if (!nasc.data) return { origem: "Monta", pai: "Monta natural", iatfData: "", rotulo: "Monta natural" };
  const [min, max] = JANELA_IATF_DIAS;
  const dias = (d) => Math.round((new Date(nasc.data) - new Date(d)) / 864e5);
  const candidatos = (eventos || []).filter((e2) => e2.tipo === "iatf" && e2.matrizId === nasc.matrizId && e2.data && dias(e2.data) >= min && dias(e2.data) <= max);
  if (!candidatos.length) return origemPelaMonta(nasc, touros, protocolos) || { origem: "Monta", pai: "Monta natural", iatfData: "", rotulo: "Monta natural" };
  candidatos.sort((a, b) => Math.abs(dias(a.data) - PERIODO_GESTACAO_DIAS) - Math.abs(dias(b.data) - PERIODO_GESTACAO_DIAS));
  const e = candidatos[0];
  const nome = nomeTouroEvento(e, touros);
  if (/repasse|monta/i.test(e.tipoServico || "")) {
    return { origem: "Monta", pai: nome || "Monta natural", iatfData: e.data, rotulo: nome ? `Monta \xB7 ${nome}` : "Monta natural" };
  }
  return { origem: "IATF", pai: nome, iatfData: e.data, rotulo: nome ? `IATF \xB7 ${nome}` : "IATF \xB7 touro n\xE3o informado" };
}
function origemPelaMonta(nasc, touros, protocolos) {
  if (!protocolos || !protocolos.length) return null;
  const concepcao = addDias(nasc.data, -PERIODO_GESTACAO_DIAS);
  const montas = protocolos.filter((p) => p.tipo === "Monta" && p.dataInicio && (p.animais || []).includes(nasc.matrizId) && concepcao >= addDias(p.dataInicio, -20) && concepcao <= addDias(p.dataFim || addDias(p.dataInicio, 90), 20)).sort((a, b) => (b.dataInicio || "").localeCompare(a.dataInicio || ""));
  if (!montas.length) return null;
  const nomes = (montas[0].touros || []).map((id) => {
    const t = (touros || []).find((x) => x.id === id);
    return t ? t.nome : "";
  }).filter(Boolean);
  const pai = nomes.length ? nomes.join(" ou ") : "Monta natural";
  return { origem: "Monta", pai, iatfData: "", rotulo: nomes.length ? `Monta \xB7 ${pai}` : `Monta (${montas[0].nome})` };
}
var semAcento = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");
var chave = (s) => semAcento(s).toLowerCase().trim();
var LOTE_NOVILHAS = "NOVILHAS";
var chaveLote = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
function mesmoLote(a, b) {
  return chaveLote(a) === chaveLote(b);
}
function padronizarLote(texto, matrizes) {
  const t = String(texto ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (mesmoLote(t, LOTE_NOVILHAS)) return LOTE_NOVILHAS;
  const ex = (matrizes || []).map((m) => String(m.lote ?? "").trim()).find((l) => l && mesmoLote(l, t));
  return ex || t;
}
function lotesExistentes(matrizes) {
  const cont = /* @__PURE__ */ new Map();
  (matrizes || []).filter((m) => m.status !== "Vendida" && m.status !== "Morta").forEach((m) => {
    const l = padronizarLote(m.lote, matrizes);
    if (!l) return;
    cont.set(l, (cont.get(l) || 0) + 1);
  });
  return [...cont.entries()].map(([lote, n]) => ({ lote, n })).sort((a, b) => b.n - a.n || a.lote.localeCompare(b.lote, "pt-BR"));
}
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
  const vazio2 = (c) => !form[c.key] || typeof form[c.key] === "string" && !form[c.key].trim();
  return (CAMPOS[tipo] || []).filter((c) => c.required && (!c.showIf || c.showIf(form)) && vazio2(c));
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
      lote: padronizarLote(form.lote, matrizes),
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
          lote: padronizarLote(LOTE_NOVILHAS, matrizes),
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
  const lista3 = eventos.filter((e) => e.tipo === "nascimento" && e.resultadoParto !== "Natimorto" && mesmoBrinco(e.brincoBezerro, brinco)).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  if (!lista3.length) return null;
  return ate && lista3.find((e) => !e.data || e.data <= ate) || lista3[0];
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
      origem: origemDaCria(n, eventos, touros, estado.protocolos),
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
  const lista3 = crias || listarCrias(estado, hoje);
  const a = acharAnimal(estado, b);
  if (!a) return { brinco: b, achado: false };
  const cria = a.nasc ? lista3.find((x) => x.id === a.nasc.id) : null;
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
  const contar = (lista3) => {
    const v = lista3.filter((n) => n.resultadoParto !== "Natimorto");
    return {
      machos: v.filter((n) => n.sexo === "Macho").length,
      femeas: v.filter((n) => n.sexo === "F\xEAmea").length,
      semSexo: v.filter((n) => n.sexo !== "Macho" && n.sexo !== "F\xEAmea").length,
      natimortos: lista3.length - v.length,
      total: lista3.length
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
  const linhasPai = [...pais.entries()].sort((a, b) => b[1].length - a[1].length).map(([nome, lista3]) => ({ pai: nome, ...contar(lista3) }));
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
  const contar = (lista3) => {
    const prenhes = lista3.filter((x) => x.r === "Prenhe").length;
    const vazias = lista3.filter((x) => x.r === "Vazia").length;
    const sem = lista3.length - prenhes - vazias;
    return { total: lista3.length, prenhes, vazias, sem, taxa: prenhes + vazias ? `${Math.round(prenhes / (prenhes + vazias) * 100)}%` : "\u2014" };
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
    return [...mapa.entries()].sort((a, b) => b[1].length - a[1].length).map(([k, lista3]) => ({
      chave: k,
      total: lista3.length,
      cheias: lista3.filter((m) => m.status === "Cheia").length,
      vazias: lista3.filter((m) => m.status === "Vazia").length,
      descarte: lista3.filter((m) => m.status === "Descarte").length
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
  const contar = (lista3) => ({
    total: lista3.length,
    crias: lista3.filter((x) => grupo(x.e) === "Cria").length,
    novilhas: lista3.filter((x) => grupo(x.e) === "Novilha").length,
    matrizes: lista3.filter((x) => grupo(x.e) === "Matriz").length,
    outros: lista3.filter((x) => grupo(x.e) === "Outros").length
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
  const nomeTouro2 = (e) => nomeTouroEvento(e, touros);
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
      "Pai": nomeTouro2(e),
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
      "Touro/S\xEAmen": nomeTouro2(e),
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
  porAnimal.forEach(({ brinco, lista: lista3 }) => {
    const f = fichaAnimal(estado, brinco, data, crias);
    const vezes = lista3.length;
    lista3.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || "")).forEach((e) => {
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
  let { matrizes, touros, eventos, config, protocolos } = dados;
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
    } else if (p.action === "upsertTouros") (p.touros || []).forEach((t) => {
      touros = touros.some((x) => x.id === t.id) ? touros.map((x) => x.id === t.id ? { ...x, ...t } : x) : [...touros, t];
    });
    else if (p.action === "upsertProtocolos") {
      (p.protocolos || []).forEach((pr) => {
        const lista3 = protocolos || [];
        protocolos = lista3.some((x) => x.id === pr.id) ? lista3.map((x) => x.id === pr.id ? { ...x, ...pr } : x) : [...lista3, pr];
      });
    } else if (p.action === "setConfig") config = { ...config || {}, ...p.config || {} };
    else if (p.action === "atualizarCampos") {
      const mapa = new Map((p.itens || []).map((it) => [it.id, it.campos]));
      eventos = eventos.map((e) => mapa.has(e.id) && e.tipo === p.tipo ? { ...e, ...mapa.get(e.id) } : e);
    }
  });
  return { ...dados, matrizes, touros, eventos, config, protocolos };
}

// src/manejoGeral.js
var ETAPA_GERAL = "Geral";
var MANEJOS_RAPIDOS = [
  { rotulo: "Pour-on no lombo", aplicacao: "Pour-on" },
  { rotulo: "Brinco mosquicida", aplicacao: "Brinco mosquicida" },
  { rotulo: "Verm\xEDfugo", aplicacao: "Verm\xEDfugo" },
  { rotulo: "Carrapaticida", aplicacao: "Carrapaticida" },
  { rotulo: "Vacina", aplicacao: "" },
  { rotulo: "Confer\xEAncia", aplicacao: "" }
];
var json = (v, padrao) => {
  if (Array.isArray(v)) return v;
  try {
    const x = JSON.parse(v || "");
    return x ?? padrao;
  } catch (e) {
    return padrao;
  }
};
var lista = (v) => String(v || "").split(",").map((x) => x.trim()).filter(Boolean);
var ordemBrinco = (a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true });
var ativa = (m) => m.status !== "Vendida" && m.status !== "Morta";
var ehManejoGeral = (e) => e && e.tipo === "manejo" && e.etapa === ETAPA_GERAL;
var foraDoLoteDe = (e) => json(e && e.foraDoLote, []);
var lotesParaManejo = (estado) => lotesExistentes(estado.matrizes);
function criasAoPe(estado, lote, hoje) {
  const maes = new Map(estado.matrizes.filter((m) => ativa(m) && mesmoLote(m.lote, lote)).map((m) => [m.id, m]));
  return listarCrias(estado, hoje).filter((c) => c.ativa && c.situacao === "mamando" && maes.has(c.matrizId));
}
var temCriasAoPe = (estado, lote, hoje) => !!lote && criasAoPe(estado, lote, hoje).length > 0;
function animaisDoLote(estado, lote, opcoes) {
  const op = opcoes || {};
  if (!lote) return [];
  const hoje = op.hoje || todayISO();
  const matrizes = estado.matrizes.filter((m) => ativa(m) && mesmoLote(m.lote, lote)).map((m) => ({
    id: m.id,
    brinco: String(m.brinco),
    tipo: "matriz",
    linha1: m.categoria || "Matriz",
    linha2: [String(m.status || "").toLowerCase(), m.raca].filter(Boolean).join(" \xB7 ")
  }));
  const crias = op.incluirCrias ? criasAoPe(estado, lote, hoje).map((c) => ({
    id: `c:${c.id}`,
    brinco: c.brinco || "s/ n\xBA",
    tipo: "cria",
    linha1: c.sexo === "F\xEAmea" ? "Bezerra ao p\xE9" : "Bezerro ao p\xE9",
    linha2: `m\xE3e ${c.maeBrinco || "?"}`
  })) : [];
  return [...matrizes, ...crias].sort((a, b) => ordemBrinco(a.brinco, b.brinco));
}
function animalForaDoLote(estado, lote, brinco, hoje) {
  const b = String(brinco ?? "").trim();
  if (!b) return null;
  const r = acharMatrizPorBrinco(estado.matrizes, b);
  if (r.matriz) {
    const m = r.matriz;
    const atual = padronizarLote(m.lote, estado.matrizes);
    if (!ativa(m)) {
      return { animal: m.id, brinco: String(m.brinco), tipo: "matriz", loteAtual: atual, obs: `Consta como ${m.status === "Morta" ? "MORTA" : "VENDIDA"} no cadastro`, mudar: "" };
    }
    if (mesmoLote(m.lote, lote)) return { animal: m.id, brinco: String(m.brinco), tipo: "matriz", loteAtual: atual, obs: "", mudar: "", doLote: true };
    return {
      animal: m.id,
      brinco: String(m.brinco),
      tipo: "matriz",
      loteAtual: atual,
      obs: `N\xE3o \xE9 do lote ${lote} (${atual ? `est\xE1 em ${atual}` : "sem lote no cadastro"})`,
      mudar: "pendente"
    };
  }
  const c = listarCrias(estado, hoje || todayISO()).find((x) => x.ativa && x.brinco && (x.brinco === b || /^\d+$/.test(b) && /^\d+$/.test(x.brinco) && Number(x.brinco) === Number(b)));
  if (c) {
    const mae = estado.matrizes.find((m) => m.id === c.matrizId);
    const loteMae = mae ? padronizarLote(mae.lote, estado.matrizes) : "";
    if (mae && mesmoLote(mae.lote, lote)) return { animal: `c:${c.id}`, brinco: c.brinco, tipo: "cria", loteAtual: loteMae, obs: `Cria ao p\xE9 deste lote (m\xE3e ${c.maeBrinco || "?"})`, mudar: "" };
    return {
      animal: `c:${c.id}`,
      brinco: c.brinco,
      tipo: "cria",
      loteAtual: loteMae,
      obs: `Cria de outro lote (m\xE3e ${c.maeBrinco || "?"}${loteMae ? ` em ${loteMae}` : ""})`,
      mudar: ""
    };
  }
  return { animal: "", brinco: b, tipo: "", loteAtual: "", obs: "Brinco n\xE3o cadastrado", mudar: "" };
}
function aplicarManejoGeral(estado, form, opcoes) {
  const op = opcoes || {};
  const now = op.now || (/* @__PURE__ */ new Date()).toISOString();
  const lote = padronizarLote(form.lote, estado.matrizes);
  const erros = [];
  if (!form.data) erros.push("Falta a data.");
  if (!lote) erros.push("Escolha ou digite o lote.");
  if (!String(form.descricao || "").trim()) erros.push("Escreva o manejo (o que est\xE1 sendo feito).");
  const esperados = [...new Set(form.esperados || [])];
  const marcados = [...new Set(form.marcados || [])].filter((id2) => esperados.includes(id2));
  const fora = (form.fora || []).filter((f) => f && f.brinco);
  if (!marcados.length && !fora.length) erros.push("Marque pelo menos um animal que passou no curral.");
  if (erros.length) return { erros };
  const aprovar = new Set(form.dono ? form.aprovar || [] : []);
  const foraFinal = fora.map((f) => {
    const x = { animal: f.animal || "", brinco: String(f.brinco), tipo: f.tipo || "", loteAtual: f.loteAtual || "", obs: f.obs || "", mudar: f.mudar || "" };
    if (x.mudar === "pendente" && form.dono) {
      x.mudar = aprovar.has(x.animal) ? "aprovada" : "recusada";
      x.decididoEm = now.slice(0, 10);
    }
    return x;
  });
  const presentes = [.../* @__PURE__ */ new Set([...marcados, ...foraFinal.map((f) => f.animal).filter(Boolean)])];
  const ausentes = esperados.filter((id2) => !marcados.includes(id2));
  const id = op.id || novoId();
  const manejo = {
    id,
    tipo: "manejo",
    data: form.data,
    protocoloId: "",
    etapa: ETAPA_GERAL,
    manejoRef: form.incluirCrias ? "com crias ao p\xE9" : "",
    responsavel: String(form.responsavel || "").trim(),
    descricao: String(form.descricao).trim(),
    aplicacoes: JSON.stringify((form.aplicacoes || []).filter((a) => a && a.tipo)),
    presentes: presentes.join(","),
    ausentes: ausentes.join(","),
    observacoes: String(form.observacoes || "").trim(),
    createdAt: now,
    lote,
    foraDoLote: JSON.stringify(foraFinal)
  };
  const matrizesAlteradas = foraFinal.filter((f) => f.mudar === "aprovada").map((f) => estado.matrizes.find((m) => m.id === f.animal)).filter(Boolean).map((m) => ({ ...m, lote }));
  const porId = new Map(matrizesAlteradas.map((m) => [m.id, m]));
  return {
    estado: { ...estado, eventos: [...estado.eventos, manejo], matrizes: estado.matrizes.map((m) => porId.get(m.id) || m) },
    eventosNovos: [manejo],
    matrizesAlteradas,
    erros: []
  };
}
function pendenciasLote(estado) {
  const out = [];
  estado.eventos.filter(ehManejoGeral).forEach((e) => {
    foraDoLoteDe(e).forEach((f, i) => {
      if (f.mudar !== "pendente") return;
      const m = estado.matrizes.find((x) => x.id === f.animal);
      if (!m || !ativa(m)) return;
      out.push({ manejoId: e.id, data: e.data, descricao: e.descricao, responsavel: e.responsavel, para: e.lote, idx: i, animal: f.animal, brinco: f.brinco, de: padronizarLote(m.lote, estado.matrizes), jaEsta: mesmoLote(m.lote, e.lote) });
    });
  });
  return out.sort((a, b) => (b.data || "").localeCompare(a.data || "") || ordemBrinco(a.brinco, b.brinco));
}
function decidirLote(estado, decisoes, opcoes) {
  const hoje = (opcoes && opcoes.now || (/* @__PURE__ */ new Date()).toISOString()).slice(0, 10);
  const porManejo = /* @__PURE__ */ new Map();
  (decisoes || []).forEach((d) => {
    if (!porManejo.has(d.manejoId)) porManejo.set(d.manejoId, /* @__PURE__ */ new Map());
    porManejo.get(d.manejoId).set(d.animal, !!d.aprovar);
  });
  const eventos = [];
  const matrizes = /* @__PURE__ */ new Map();
  let aprovadas = 0;
  let recusadas = 0;
  porManejo.forEach((dec, manejoId) => {
    const e = estado.eventos.find((x) => x.id === manejoId);
    if (!e) return;
    const fora = foraDoLoteDe(e).map((f) => {
      if (f.mudar !== "pendente" || !dec.has(f.animal)) return f;
      const ok = dec.get(f.animal);
      if (ok) {
        const m = matrizes.get(f.animal) || estado.matrizes.find((x) => x.id === f.animal);
        if (m) matrizes.set(m.id, { ...m, lote: e.lote });
        aprovadas++;
      } else recusadas++;
      return { ...f, mudar: ok ? "aprovada" : "recusada", decididoEm: hoje };
    });
    eventos.push({ tipo: "manejo", id: e.id, campos: { foraDoLote: JSON.stringify(fora) } });
  });
  return { mudancas: { eventos, matrizes: [...matrizes.values()] }, aprovadas, recusadas };
}
function listarManejosGerais(estado, ano) {
  return estado.eventos.filter(ehManejoGeral).filter((e) => !ano || String(e.data || "").slice(0, 4) === String(ano)).map((e) => conferencia(estado, e)).sort((a, b) => (b.data || "").localeCompare(a.data || "") || (b.manejo.createdAt || "").localeCompare(a.manejo.createdAt || ""));
}
function conferencia(estado, e) {
  const fora = foraDoLoteDe(e);
  const idsFora = new Set(fora.map((f) => f.animal).filter(Boolean));
  const presentes = lista(e.presentes);
  const conferidos = presentes.filter((id) => !idsFora.has(id));
  const ausentes = lista(e.ausentes);
  const nomes = nomesDosAnimais(estado);
  const nome = (id) => nomes.get(id) || { brinco: "?", tipo: "" };
  return {
    id: e.id,
    data: e.data,
    lote: e.lote || "",
    descricao: e.descricao || "",
    responsavel: e.responsavel || "",
    manejo: e,
    aplicacoes: json(e.aplicacoes, []),
    observacoes: e.observacoes || "",
    esperados: conferidos.length + ausentes.length,
    conferidos: conferidos.map((id) => ({ id, ...nome(id) })).sort((a, b) => ordemBrinco(a.brinco, b.brinco)),
    faltando: ausentes.map((id) => ({ id, ...nome(id) })).sort((a, b) => ordemBrinco(a.brinco, b.brinco)),
    fora: fora.slice().sort((a, b) => ordemBrinco(a.brinco, b.brinco))
  };
}
function nomesDosAnimais(estado) {
  const mapa = new Map(estado.matrizes.map((m) => [m.id, { brinco: String(m.brinco), tipo: m.categoria || "Matriz" }]));
  estado.eventos.filter((e) => e.tipo === "nascimento").forEach((n) => {
    mapa.set(`c:${n.id}`, { brinco: String(n.brincoBezerro ?? "").trim() || "s/ n\xBA", tipo: n.sexo === "F\xEAmea" ? "Bezerra" : "Bezerro" });
  });
  return mapa;
}
var textoMudar = (f) => f.mudar === "pendente" ? "mudar de lote: esperando o propriet\xE1rio" : f.mudar === "aprovada" ? "lote trocado (confirmado)" : f.mudar === "recusada" ? "continua no lote dela" : "";
function relatorioConferencia(estado, manejoId) {
  const e = estado.eventos.find((x) => x.id === manejoId);
  if (!e) return { titulo: "Manejo", resumo: [], secoes: [] };
  const c = conferencia(estado, e);
  const aps = c.aplicacoes.map((a) => [a.tipo, a.produto].filter(Boolean).join(" ")).join(", ");
  return {
    titulo: `Manejo ${formatarDataBR(c.data)} \xB7 lote ${c.lote}`,
    subtitulo: [c.descricao, aps ? `Produtos: ${aps}` : "", c.responsavel ? `Respons\xE1vel: ${c.responsavel}` : "", c.manejo.manejoRef, c.observacoes ? `Obs.: ${c.observacoes}` : ""].filter(Boolean).join(" \xB7 "),
    resumo: [
      { rotulo: "Esperados no lote", valor: c.esperados },
      { rotulo: "Conferidos", valor: c.conferidos.length },
      { rotulo: "Faltando", valor: c.faltando.length },
      { rotulo: "De outro lote ou sem cadastro", valor: c.fora.length }
    ],
    secoes: [
      { titulo: "Faltando (n\xE3o passaram no curral)", colunas: [{ k: "brinco", label: "Brinco", mono: true }, { k: "tipo", label: "Animal" }], linhas: c.faltando },
      { titulo: "De outro lote ou sem cadastro", colunas: [{ k: "brinco", label: "Brinco", mono: true }, { k: "obs", label: "Observa\xE7\xE3o" }, { k: "sit", label: "Lote" }], linhas: c.fora.map((f) => ({ ...f, sit: textoMudar(f) })) },
      { titulo: "Conferidos", colunas: [{ k: "brinco", label: "Brinco", mono: true }, { k: "tipo", label: "Animal" }], linhas: c.conferidos }
    ]
  };
}
function relatorioManejosGerais(estado, ano) {
  const l = listarManejosGerais(estado, ano);
  return {
    titulo: `Manejos gerais ${ano || ""}`.trim(),
    resumo: [
      { rotulo: "Manejos", valor: l.length },
      { rotulo: "Animais conferidos", valor: l.reduce((s, c) => s + c.conferidos.length, 0) },
      { rotulo: "Faltas", valor: l.reduce((s, c) => s + c.faltando.length, 0) },
      { rotulo: "De outro lote", valor: l.reduce((s, c) => s + c.fora.length, 0) }
    ],
    secoes: [{
      titulo: "Manejos",
      colunas: [
        { k: "data", label: "Data", mono: true },
        { k: "lote", label: "Lote" },
        { k: "descricao", label: "Manejo" },
        { k: "esp", label: "Esperados", align: "right", mono: true },
        { k: "conf", label: "Conferidos", align: "right", mono: true },
        { k: "falt", label: "Faltando", align: "right", mono: true },
        { k: "faltam", label: "Quem faltou" },
        { k: "fora", label: "De fora", align: "right", mono: true }
      ],
      linhas: l.map((c) => ({
        data: formatarDataBR(c.data),
        lote: c.lote,
        descricao: c.descricao,
        esp: c.esperados,
        conf: c.conferidos.length,
        falt: c.faltando.length,
        faltam: c.faltando.map((x) => x.brinco).join(", "),
        fora: c.fora.length
      }))
    }]
  };
}
function faltasRepetidas(estado, lote) {
  const l = listarManejosGerais(estado).filter((c) => mesmoLote(c.lote, lote)).slice(0, 3);
  if (l.length < 2) return [];
  const [a, b] = l;
  const emB = new Set(b.faltando.map((x) => x.id));
  return a.faltando.filter((x) => emB.has(x.id));
}

// src/manejo.js
var TIPOS_APLICACAO = ["Vacina reprodutiva", "Refor\xE7o Lepto", "Verm\xEDfugo", "Fortificante", "Estimulante", "Brucelose", "Horm\xF4nio", "Pour-on", "Brinco mosquicida", "Carrapaticida", "Outra"];
var MOTIVOS_DESCARTE = ["Vazia repetida", "Idade", "Problema de \xFAbere", "Problema de casco", "Baixa produ\xE7\xE3o", "Doen\xE7a", "Outro"];
var TIPOS_TOURO = ["S\xEAmen", "Touro vivo"];
var TIPOS_SEMEN = ["Convencional", "Sexado f\xEAmea", "Sexado macho"];
var ORIGENS_TOURO = ["Comprado", "Nascido na fazenda", "Emprestado"];
var DIAS_MIN_POS_PARTO_PADRAO = 35;
var DIAS_REPASSE_DEPOIS_IA = 17;
var DIAS_MONTA_PADRAO = 90;
var MODELOS_IATF = {
  "3 manejos": [
    { id: "D0", dias: 0, descricao: "Colocar o implante de progesterona e aplicar o estradiol", medicamentos: "Implante, benzoato de estradiol" },
    { id: "D8", dias: 8, descricao: "Retirar o implante e aplicar os horm\xF4nios", medicamentos: "eCG, prostaglandina, cipionato de estradiol" },
    { id: "D10", dias: 10, descricao: "Insemina\xE7\xE3o", medicamentos: "", ia: true }
  ],
  "4 manejos": [
    { id: "D0", dias: 0, descricao: "Colocar o implante de progesterona e aplicar o estradiol", medicamentos: "Implante, benzoato de estradiol" },
    { id: "D7", dias: 7, descricao: "Aplicar prostaglandina", medicamentos: "Prostaglandina" },
    { id: "D9", dias: 9, descricao: "Retirar o implante e aplicar os horm\xF4nios", medicamentos: "eCG, cipionato de estradiol" },
    { id: "D11", dias: 11, descricao: "Insemina\xE7\xE3o", medicamentos: "", ia: true }
  ]
};
var MANEJO_ENTRADA_MONTA = { id: "ENTRADA", dias: 0, descricao: "Entrada no lote dos touros", medicamentos: "Vacina reprodutiva, estimulante" };
var CALENDARIO_PADRAO = [
  { id: "reprodutiva", nome: "Vacina reprodutiva", tipo: "ciclo", publico: "matrizes", ativo: true },
  { id: "lepto", nome: "Refor\xE7o Lepto", tipo: "prenhez", meses: 6, publico: "cheias", ativo: true },
  { id: "brucelose", nome: "Brucelose", tipo: "idade", publico: "bezerras", idadeMin: 3, idadeMax: 8, unica: true, ativo: true }
];
var lista2 = (v) => Array.isArray(v) ? v.map(String) : String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
var json2 = (v, padrao) => {
  if (Array.isArray(v) || v && typeof v === "object") return v;
  try {
    const r = JSON.parse(v);
    return r ?? padrao;
  } catch (e) {
    return padrao;
  }
};
var num = (v) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return isNaN(n) ? null : n;
};
var ordemBrinco2 = (a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true });
function normalizarTouro(t) {
  const tipo = t.tipo || (t.doses || t.custoDose || t.partida ? "S\xEAmen" : "");
  return { ...t, tipo, situacao: t.situacao || "Ativo" };
}
function estoqueSemen(t, eventos) {
  const usadas = eventos.filter((e) => e.tipo === "iatf" && e.touroId === t.id).length;
  const compradas = parseInt(t.doses, 10) || 0;
  const ajuste = parseInt(t.ajusteDoses, 10) || 0;
  return { compradas, usadas, ajuste, restantes: compradas + ajuste - usadas };
}
function andrologicoVencido(t, hoje) {
  if (t.tipo !== "Touro vivo") return false;
  if (!t.andrologicoData) return true;
  return diasEntre(t.andrologicoData, hoje || todayISO()) > 365;
}
var semensDisponiveis = (estado) => estado.touros.filter((t) => t.tipo !== "Touro vivo" && t.situacao !== "Inativo");
var tourosVivos = (estado) => estado.touros.filter((t) => t.tipo === "Touro vivo" && t.situacao !== "Inativo");
var nomeTouro = (estado, id) => {
  const t = estado.touros.find((x) => x.id === id);
  return t ? t.nome : "";
};
function validarTouro(t) {
  const erros = [];
  if (!String(t.nome || "").trim()) erros.push("Falta o nome.");
  if (!t.tipo) erros.push("Escolha se \xE9 s\xEAmen ou touro vivo.");
  return erros;
}
var CAMPOS_NUMERO_TOURO = ["doses", "ajusteDoses", "custoDose", "valorCompra", "pesoAtual", "circEscrotal"];
function prepararTouro(t, existente) {
  const agora = (/* @__PURE__ */ new Date()).toISOString();
  const out = { ...existente || {}, ...t, id: existente && existente.id || t.id || novoId(), createdAt: existente && existente.createdAt || agora, atualizadoEm: agora };
  CAMPOS_NUMERO_TOURO.forEach((k) => {
    if (out[k] !== void 0 && out[k] !== "") {
      const n = num(out[k]);
      out[k] = n === null ? "" : n;
    }
  });
  out.nome = String(out.nome || "").trim();
  return out;
}
function normalizarProtocolo(p) {
  return {
    ...p,
    tipo: p.tipo || "IATF",
    status: p.status || "Ativo",
    dataInicio: String(p.dataInicio || "").slice(0, 10),
    dataFim: String(p.dataFim || "").slice(0, 10),
    manejos: json2(p.manejos, []),
    animais: lista2(p.animais),
    touros: lista2(p.touros)
  };
}
function protocoloParaPlanilha(p) {
  return { ...p, manejos: JSON.stringify(p.manejos || []), animais: (p.animais || []).join(","), touros: (p.touros || []).join(",") };
}
var manejoIA = (p) => (p.manejos || []).find((m) => m.ia) || null;
var dataDoManejo = (p, m) => p.dataInicio ? addDias(p.dataInicio, parseInt(m.dias, 10) || 0) : "";
var dataIA = (p) => {
  const m = manejoIA(p);
  return m ? dataDoManejo(p, m) : "";
};
function fimDaMonta(p) {
  return p.dataFim || (p.dataInicio ? addDias(p.dataInicio, DIAS_MONTA_PADRAO) : "");
}
function manejosFeitos(estado, protocoloId) {
  return estado.eventos.filter((e) => e.tipo === "manejo" && e.protocoloId === protocoloId);
}
function agendaProtocolo(estado, p, hoje) {
  hoje = hoje || todayISO();
  const feitos = manejosFeitos(estado, p.id);
  return (p.manejos || []).map((m) => {
    const data = dataDoManejo(p, m);
    const feitosDele = feitos.filter((f) => f.manejoRef === m.id);
    const presentes = new Set(feitosDele.flatMap((f) => lista2(f.presentes)));
    return { ...m, data, feito: feitosDele.length > 0, feitos: feitosDele, presentes: presentes.size, atrasado: !feitosDele.length && data && data < hoje, hoje: data === hoje };
  });
}
function proximoManejo(estado, p, hoje) {
  return agendaProtocolo(estado, p, hoje).find((m) => !m.feito) || null;
}
function validarProtocolo(estado, p) {
  const erros = [];
  const avisos = [];
  if (!String(p.nome || "").trim()) erros.push("D\xEA um nome ao protocolo.");
  if (!p.dataInicio) erros.push(p.tipo === "Monta" ? "Falta a data de entrada na monta." : "Falta a data do D0.");
  if (!(p.animais || []).length) erros.push("Coloque pelo menos um animal.");
  if (p.tipo === "IATF" && !manejoIA(p)) erros.push("Marque qual manejo \xE9 a insemina\xE7\xE3o.");
  if (p.tipo === "Monta" && !(p.touros || []).length) avisos.push("Nenhum touro escolhido para o lote.");
  const dias = (p.manejos || []).map((m) => parseInt(m.dias, 10));
  if (dias.some((d) => isNaN(d) || d < 0)) erros.push("Os dias dos manejos precisam ser n\xFAmeros (0, 7, 9...).");
  if (new Set((p.manejos || []).map((m) => m.id)).size !== (p.manejos || []).length) erros.push("Dois manejos com o mesmo nome (ex.: D0).");
  return { erros, avisos };
}
function prepararProtocolo(p, existente) {
  const agora = (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...existente || {},
    ...p,
    id: existente && existente.id || p.id || novoId(),
    dataFim: p.tipo === "Monta" ? p.dataFim || (p.dataInicio ? addDias(p.dataInicio, DIAS_MONTA_PADRAO) : "") : p.dataFim || "",
    custoTotal: p.custoTotal === "" || p.custoTotal === void 0 ? "" : num(p.custoTotal) ?? "",
    createdAt: existente && existente.createdAt || agora,
    atualizadoEm: agora
  };
}
function montaDeRepasse(estado, p, opcoes) {
  const op = opcoes || {};
  const ia = dataIA(p) || p.dataInicio;
  const entrada = op.dataEntrada || addDias(ia, DIAS_REPASSE_DEPOIS_IA);
  const vivas = new Set(estado.matrizes.filter((m) => m.status !== "Morta" && m.status !== "Vendida" && m.status !== "Descarte").map((m) => m.id));
  return {
    tipo: "Monta",
    nome: `Repasse de ${p.nome}`,
    dataInicio: entrada,
    dataFim: addDias(entrada, op.dias || DIAS_MONTA_PADRAO),
    status: "Ativo",
    touros: op.touros || [],
    animais: (p.animais || []).filter((id) => vivas.has(id)),
    origemId: p.id,
    manejos: [{ ...MANEJO_ENTRADA_MONTA, medicamentos: "", descricao: "Entrada no lote dos touros (repasse)" }],
    semenPadrao: "",
    tecnico: "",
    custoTotal: "",
    custoObs: "",
    observacoes: ""
  };
}
function protocolosDoAnimal(estado, matrizId) {
  return (estado.protocolos || []).filter((p) => (p.animais || []).includes(matrizId)).sort((a, b) => (b.dataInicio || "").localeCompare(a.dataInicio || ""));
}
function partosDe(m, eventos) {
  return eventos.filter((e) => e.tipo === "nascimento" && e.matrizId === m.id).length + (parseInt(m.partosAnteriores, 10) || 0);
}
function ultimoServico(estado, matrizId, ate) {
  const iatfs = estado.eventos.filter((e) => e.tipo === "iatf" && e.matrizId === matrizId && e.data && (!ate || e.data <= ate)).sort((a, b) => b.data.localeCompare(a.data));
  const montas = protocolosDoAnimal(estado, matrizId).filter((p) => p.tipo === "Monta" && p.dataInicio && (!ate || p.dataInicio <= ate));
  const iatf = iatfs[0] || null;
  const monta = montas[0] || null;
  const descIatf = iatf ? `IATF ${formatarDataBR(iatf.data)}${nomeTouroEvento(iatf, estado.touros) ? ` \xB7 ${nomeTouroEvento(iatf, estado.touros)}` : ""}` : "";
  const touros = monta ? (monta.touros || []).map((id) => nomeTouro(estado, id)).filter(Boolean) : [];
  const descMonta = monta ? `Monta ${formatarDataBR(monta.dataInicio)} a ${formatarDataBR(fimDaMonta(monta))}${touros.length ? ` \xB7 ${touros.join(" ou ")}` : ""}` : "";
  let texto = "";
  if (iatf && monta) texto = monta.dataInicio > iatf.data ? `${descIatf}; depois ${descMonta}` : descIatf;
  else texto = descIatf || descMonta;
  return { iatf, monta, texto };
}
function infoVaca(estado, m, hoje) {
  hoje = hoje || todayISO();
  const ev = estado.eventos;
  const parto = ultimoPartoDe(m.id, ev);
  const diags = ev.filter((e) => e.tipo === "diagnostico" && e.matrizId === m.id && e.data).sort((a, b) => b.data.localeCompare(a.data));
  const serv = ultimoServico(estado, m.id);
  return {
    matriz: m,
    brinco: m.brinco,
    categoria: m.categoria || "",
    lote: m.lote || "",
    status: m.status,
    crias: partosDe(m, ev),
    ultimoParto: parto,
    diasParida: parto ? diasEntre(parto, hoje) : null,
    ultimoServico: serv,
    ultimoToque: diags[0] || null,
    vacina: situacaoVacinaVaca(estado, m, hoje),
    idade: m.dataNascimento ? idadeMesesDias(m.dataNascimento, hoje) : null
  };
}
function avisosParaProtocolo(estado, info, cfg, outroProtocoloAtivo) {
  const min = parseInt((cfg || {}).diasMinPosParto, 10) || DIAS_MIN_POS_PARTO_PADRAO;
  const a = [];
  if (info.status === "Cheia") a.push("Est\xE1 CHEIA");
  if (info.status === "Descarte") a.push("Marcada para descarte");
  if (info.diasParida !== null && info.diasParida < min) a.push(`Parida h\xE1 s\xF3 ${info.diasParida} dias`);
  if (outroProtocoloAtivo) a.push(`J\xE1 est\xE1 em ${outroProtocoloAtivo.nome}`);
  return a;
}
function aplicarManejo(estado, form, opcoes) {
  const op = opcoes || {};
  const now = op.now || (/* @__PURE__ */ new Date()).toISOString();
  const p = form.protocolo || null;
  const m = form.manejo || null;
  const presentes = [...new Set(form.presentes || [])];
  const erros = [];
  if (!form.data) erros.push("Falta a data.");
  if (!presentes.length) erros.push("Marque pelo menos um animal presente.");
  if (m && m.ia && form.responsavel === void 0) {
  }
  if (erros.length) return { erros };
  const ausentes = p ? (p.animais || []).filter((id) => !presentes.includes(id)) : [];
  const idManejo = op.id || novoId();
  const manejo = {
    id: idManejo,
    tipo: "manejo",
    data: form.data,
    protocoloId: p ? p.id : form.protocoloId || "",
    etapa: form.etapa || (m ? m.id : "Vacina\xE7\xE3o"),
    manejoRef: m ? m.id : form.manejoRef || "",
    responsavel: form.responsavel || "",
    descricao: form.descricao || (m ? m.descricao : ""),
    aplicacoes: JSON.stringify((form.aplicacoes || []).filter((x) => x && x.tipo)),
    presentes: presentes.join(","),
    ausentes: ausentes.join(","),
    observacoes: form.observacoes || "",
    createdAt: now
  };
  const eventosNovos = [manejo];
  if (p && m && m.ia) {
    presentes.forEach((matrizId, i) => {
      const parto = ultimoPartoDe(matrizId, estado.eventos);
      const anteriores = estado.eventos.filter((e) => e.tipo === "iatf" && e.matrizId === matrizId && (!parto || e.data > parto) && e.data < form.data).length;
      eventosNovos.push({
        id: `${idManejo}-ia${i}`,
        tipo: "iatf",
        data: form.data,
        matrizId,
        tipoServico: "IATF",
        numeroServico: anteriores === 0 ? "1\xAA" : anteriores === 1 ? "2\xAA" : "3\xAA ou mais",
        dataInicioProtocolo: p.dataInicio,
        touroId: form.semen && form.semen[matrizId] || form.semenPadrao || p.semenPadrao || "",
        touroOutro: "",
        tecnico: form.responsavel || p.tecnico || "",
        custo: "",
        observacoes: "",
        protocoloId: p.id,
        manejoRef: m.id,
        createdAt: now
      });
    });
  }
  return { estado: { ...estado, eventos: [...estado.eventos, ...eventosNovos] }, eventosNovos, erros: [] };
}
function acharNoProtocolo(estado, p, brinco) {
  const r = acharMatrizPorBrinco(estado.matrizes, brinco);
  if (!r.matriz) return { erro: `N\xE3o achei a vaca ${String(brinco).trim()}. Confira o n\xFAmero.` };
  if (p && !(p.animais || []).includes(r.matriz.id)) return { matriz: r.matriz, fora: true, erro: `A vaca ${r.matriz.brinco} n\xE3o est\xE1 no protocolo ${p.nome}. Verifique.` };
  return { matriz: r.matriz };
}
function elegiveisToque(estado) {
  return estado.matrizes.filter((m) => m.status !== "Vendida" && m.status !== "Morta" && (noPlantel(m) || m.categoria === "Novilha")).sort((a, b) => ordemBrinco2(a.brinco, b.brinco));
}
function concepcaoPeloToque(data, dg) {
  const n = parseInt(dg, 10);
  if (!data || isNaN(n)) return "";
  return addDias(data, -n);
}
function origemDaPrenhez(estado, matrizId, concepcao) {
  if (!concepcao) return null;
  const iatfs = estado.eventos.filter((e) => e.tipo === "iatf" && e.matrizId === matrizId && e.data && Math.abs(diasEntre(e.data, concepcao)) <= 12);
  if (iatfs.length) {
    iatfs.sort((a, b) => Math.abs(diasEntre(a.data, concepcao)) - Math.abs(diasEntre(b.data, concepcao)));
    const e = iatfs[0];
    const nome = nomeTouroEvento(e, estado.touros);
    if (!/repasse|monta/i.test(e.tipoServico || "")) return { origem: "IATF", data: e.data, iatf: e, pai: nome, rotulo: `IATF de ${formatarDataBR(e.data)}${nome ? ` \xB7 ${nome}` : ""}` };
  }
  const montas = protocolosDoAnimal(estado, matrizId).filter((p) => p.tipo === "Monta" && p.dataInicio && concepcao >= addDias(p.dataInicio, -5) && concepcao <= addDias(fimDaMonta(p), 5));
  if (montas.length) {
    const p = montas[0];
    const touros = (p.touros || []).map((id) => nomeTouro(estado, id)).filter(Boolean);
    return { origem: "Monta", protocolo: p, pai: touros.length ? `Monta: ${touros.join(" ou ")}` : "Monta natural", rotulo: `Monta (${p.nome})${touros.length ? ` \xB7 ${touros.join(" ou ")}` : ""}` };
  }
  return null;
}
function previsaoPeloToque(data, dg) {
  const c = concepcaoPeloToque(data, dg);
  return c ? addDias(c, PERIODO_GESTACAO_DIAS) : "";
}
function avisosToque(estado, m, marca, data, cfg) {
  const a = [];
  const parto = ultimoPartoDe(m.id, estado.eventos);
  const min = parseInt((cfg || {}).diasMinPosParto, 10) || DIAS_MIN_POS_PARTO_PADRAO;
  if (marca && marca.resultado === "Cheia") {
    const c = concepcaoPeloToque(data, marca.dg);
    if (marca.dg === "" || marca.dg === void 0 || marca.dg === null) a.push("Falta o n\xFAmero de dias de prenhez.");
    else if (parseInt(marca.dg, 10) > 290) a.push("Mais de 290 dias de prenhez: confira.");
    else if (c && parto && c <= parto) a.push(`Os dias de prenhez n\xE3o batem com o parto de ${formatarDataBR(parto)}. Confira.`);
    else if (c && !origemDaPrenhez(estado, m.id, c)) a.push("A prenhez n\xE3o bate com nenhuma IATF nem monta registrada.");
  }
  if (marca && marca.resultado === "Vazia" && m.status === "Cheia") a.push("Estava CHEIA e agora deu vazia: perda?");
  if (parto && diasEntre(parto, data) < min && (!marca || marca.resultado !== "Cheia")) a.push(`Parida h\xE1 s\xF3 ${diasEntre(parto, data)} dias.`);
  return a;
}
function aplicarToque(estado, sessao, marcas, opcoes) {
  const op = opcoes || {};
  const now = op.now || (/* @__PURE__ */ new Date()).toISOString();
  let atual = estado;
  const eventosParaGravar = [];
  const matrizesMap = /* @__PURE__ */ new Map();
  const aplicados = [];
  const rejeitados = [];
  marcas.forEach((mk, i) => {
    const m = atual.matrizes.find((x) => x.id === mk.matrizId);
    if (!m) {
      rejeitados.push({ marca: mk, motivo: "vaca n\xE3o encontrada" });
      return;
    }
    const resultado = mk.resultado === "Cheia" ? "Prenhe" : mk.resultado;
    const form = {
      matrizId: m.id,
      data: sessao.data,
      resultado,
      metodo: sessao.metodo || "Toque retal",
      dg: mk.resultado === "Cheia" ? mk.dg ?? "" : "",
      veterinario: sessao.veterinario || "",
      motivo: mk.resultado === "Descarte" ? mk.motivo || "Descarte no toque" : "",
      toqueId: sessao.id,
      apta: mk.apta || "",
      observacoes: mk.observacoes || ""
    };
    if (jaExiste("diagnostico", form, atual)) {
      rejeitados.push({ marca: mk, motivo: `a vaca ${m.brinco} j\xE1 tem toque em ${formatarDataBR(sessao.data)}` });
      return;
    }
    const r = aplicarLancamento(atual, "diagnostico", form, { id: `${sessao.id}-${m.id}`, now });
    atual = r.estado;
    r.eventosNovos.forEach((e) => eventosParaGravar.push({ tipo: e.tipo, evento: e }));
    r.matrizesAlteradas.forEach((x) => matrizesMap.set(x.id, x));
    if (mk.apta === "Sim" && m.categoria === "Novilha" && m.destino && m.destino !== "Matriz") {
      const nova = { ...matrizesMap.get(m.id) || atual.matrizes.find((x) => x.id === m.id), destino: "Matriz" };
      atual = { ...atual, matrizes: atual.matrizes.map((x) => x.id === m.id ? nova : x) };
      matrizesMap.set(m.id, nova);
    }
    aplicados.push({ marca: mk, matriz: m, indice: i });
  });
  if (aplicados.length) {
    const manejo = {
      id: `${sessao.id}-mj-${now.replace(/\D/g, "").slice(-9)}`,
      tipo: "manejo",
      data: sessao.data,
      protocoloId: "",
      etapa: "Toque",
      manejoRef: sessao.id,
      responsavel: sessao.veterinario || "",
      descricao: `Toque (${sessao.metodo || "Toque retal"})`,
      aplicacoes: JSON.stringify((sessao.aplicacoes || []).filter((x) => x && x.tipo)),
      presentes: aplicados.map((x) => x.matriz.id).join(","),
      ausentes: "",
      observacoes: sessao.observacoes || "",
      createdAt: now
    };
    atual = { ...atual, eventos: [...atual.eventos, manejo] };
    eventosParaGravar.push({ tipo: "manejo", evento: manejo });
  }
  return { estado: atual, eventosParaGravar, matrizesParaGravar: [...matrizesMap.values()], tourosParaGravar: [], aplicados, rejeitados };
}
function listarToques(estado) {
  const mapa = /* @__PURE__ */ new Map();
  estado.eventos.filter((e) => e.tipo === "diagnostico" && e.toqueId).forEach((e) => {
    if (!mapa.has(e.toqueId)) mapa.set(e.toqueId, { id: e.toqueId, data: e.data, veterinario: e.veterinario || "", diags: [] });
    mapa.get(e.toqueId).diags.push(e);
  });
  return [...mapa.values()].sort((a, b) => (b.data || "").localeCompare(a.data || ""));
}
function resumoToque(estado, toqueId) {
  const diags = estado.eventos.filter((e) => e.tipo === "diagnostico" && e.toqueId === toqueId);
  const data = diags[0] ? diags[0].data : "";
  const brincos = mapaBrincos(estado.matrizes);
  const matPorId = new Map(estado.matrizes.map((m) => [m.id, m]));
  const linhas = diags.map((d) => {
    const m = matPorId.get(d.matrizId) || {};
    const novilhaAval = d.apta === "Sim" || d.apta === "N\xE3o";
    const c = d.resultado === "Prenhe" ? concepcaoPeloToque(d.data, d.dg) : "";
    const ori = c ? origemDaPrenhez(estado, d.matrizId, c) : null;
    const serv = ultimoServico(estado, d.matrizId, d.data);
    let grupoProt = "Sem protocolo";
    if (ori && ori.origem === "IATF") {
      const p = (estado.protocolos || []).find((x) => x.id === ori.iatf.protocoloId);
      grupoProt = p ? p.nome : `IATF de ${formatarDataBR(ori.iatf.data)}`;
    } else if (ori && ori.origem === "Monta") grupoProt = ori.protocolo.nome;
    else if (serv.iatf && serv.iatf.protocoloId) {
      const p = (estado.protocolos || []).find((x) => x.id === serv.iatf.protocoloId);
      grupoProt = p ? p.nome : grupoProt;
    } else if (serv.monta) grupoProt = serv.monta.nome;
    else if (serv.iatf) grupoProt = `IATF de ${formatarDataBR(serv.iatf.data)}`;
    return {
      d,
      m,
      brinco: brincos[d.matrizId] || "?",
      categoria: m.categoria || "",
      lote: m.lote || "",
      novilhaAval,
      resultado: d.resultado === "Prenhe" ? "Cheia" : d.resultado,
      dg: d.dg,
      previsao: d.resultado === "Prenhe" ? previsaoPeloToque(d.data, d.dg) : "",
      origem: ori ? ori.rotulo : "",
      grupoProt,
      semen: ori && ori.origem === "IATF" ? ori.pai || "sem nome" : "",
      monta: ori && ori.origem === "Monta" ? ori.pai : ""
    };
  });
  const avaliadasPrenhez = linhas.filter((l) => !(l.novilhaAval && l.resultado !== "Cheia"));
  const taxa = (ls) => {
    const ch = ls.filter((l) => l.resultado === "Cheia").length;
    const tot = ls.filter((l) => l.resultado === "Cheia" || l.resultado === "Vazia").length;
    return { cheias: ch, total: tot, pct: tot ? Math.round(ch / tot * 100) : null };
  };
  const agrupar = (chaveFn, ls) => {
    const mp = /* @__PURE__ */ new Map();
    ls.forEach((l) => {
      const k = chaveFn(l) || "N\xE3o informado";
      if (!mp.has(k)) mp.set(k, []);
      mp.get(k).push(l);
    });
    return [...mp.entries()].map(([k, v]) => ({ chave: k, ...taxa(v) })).sort((a, b) => b.total - a.total);
  };
  const elegiveis = elegiveisToque(estado).filter((m) => !(m.dataBaixa && m.dataBaixa < data));
  const avaliados = new Set(diags.map((d) => d.matrizId));
  return {
    data,
    total: linhas.length,
    linhas,
    cheias: linhas.filter((l) => l.resultado === "Cheia").length,
    vazias: linhas.filter((l) => l.resultado === "Vazia" && !l.novilhaAval).length,
    descartes: linhas.filter((l) => l.resultado === "Descarte").length,
    aptas: linhas.filter((l) => l.d.apta === "Sim").length,
    naoAptas: linhas.filter((l) => l.d.apta === "N\xE3o").length,
    geral: taxa(avaliadasPrenhez),
    porProtocolo: agrupar((l) => l.grupoProt, avaliadasPrenhez),
    porSemen: agrupar((l) => l.semen, avaliadasPrenhez.filter((l) => l.semen)),
    porMonta: agrupar((l) => l.monta, avaliadasPrenhez.filter((l) => l.monta)),
    porLote: agrupar((l) => l.lote, avaliadasPrenhez),
    porCategoria: agrupar((l) => l.categoria, avaliadasPrenhez),
    ausentes: elegiveis.filter((m) => !avaliados.has(m.id)),
    vaziasIds: linhas.filter((l) => l.resultado === "Vazia" && !l.novilhaAval).map((l) => l.d.matrizId),
    aptasIds: linhas.filter((l) => l.d.apta === "Sim").map((l) => l.d.matrizId)
  };
}
function calendarioVacinas(cfg) {
  const salvo = json2((cfg || {}).calendarioVacinas, null);
  if (!Array.isArray(salvo) || !salvo.length) return CALENDARIO_PADRAO.map((r) => ({ ...r }));
  const ids = new Set(salvo.map((r) => r.id));
  return [...salvo, ...CALENDARIO_PADRAO.filter((r) => !ids.has(r.id))];
}
function aplicacoesPorAnimal(estado) {
  const mapa = /* @__PURE__ */ new Map();
  estado.eventos.filter((e) => e.tipo === "manejo").forEach((e) => {
    const aps = json2(e.aplicacoes, []);
    if (!aps.length) return;
    lista2(e.presentes).forEach((id) => {
      if (!mapa.has(id)) mapa.set(id, []);
      aps.forEach((a) => mapa.get(id).push({ data: e.data, tipo: a.tipo, produto: a.produto || "", manejoId: e.id, etapa: e.etapa }));
    });
  });
  mapa.forEach((l) => l.sort((a, b) => (a.data || "").localeCompare(b.data || "")));
  return mapa;
}
function concepcaoAtual(estado, m) {
  if (m.status !== "Cheia") return "";
  const prev = previsaoPartoInfo(m.id, estado.eventos);
  if (!prev || !prev.data) return "";
  return addDias(prev.data, -PERIODO_GESTACAO_DIAS);
}
function situacaoVacinaVaca(estado, m, hoje, cache) {
  hoje = hoje || todayISO();
  const aps = (cache || aplicacoesPorAnimal(estado)).get(m.id) || [];
  const parto = ultimoPartoDe(m.id, estado.eventos);
  const desde = parto || addDias(hoje, -365);
  const reprod = aps.filter((a) => a.tipo === "Vacina reprodutiva" && a.data >= desde);
  const out = { inicial: reprod.length ? reprod[reprod.length - 1].data : "", reforco: null, pendente: false, texto: "" };
  if (m.status === "Cheia") {
    const c = concepcaoAtual(estado, m);
    if (c) {
      const prazo = addMeses(c, 6);
      const feito = aps.filter((a) => a.tipo === "Refor\xE7o Lepto" && a.data >= c).pop();
      const dias = diasEntre(hoje, prazo);
      out.reforco = { concepcao: c, prazo, feito: feito ? feito.data : "", atrasoDias: !feito && dias < 0 ? -dias : 0, faltam: !feito && dias >= 0 ? dias : null };
    }
  }
  const partes = [];
  if (!out.inicial && m.status !== "Descarte") {
    partes.push("Sem vacina reprodutiva registrada");
    out.pendente = true;
  }
  if (out.reforco) {
    if (out.reforco.feito) partes.push(`Lepto em dia (refor\xE7o ${formatarDataBR(out.reforco.feito)})`);
    else if (out.reforco.atrasoDias) {
      partes.push(`Refor\xE7o Lepto ATRASADO h\xE1 ${out.reforco.atrasoDias} dias`);
      out.pendente = true;
    } else {
      partes.push(`Refor\xE7o Lepto em ${formatarDataBR(out.reforco.prazo)}`);
      if (out.reforco.faltam <= 30) out.pendente = true;
    }
  } else if (out.inicial) partes.push(`Vacina reprodutiva em ${formatarDataBR(out.inicial)}`);
  out.texto = partes.join(" \xB7 ");
  out.nivel = out.reforco && out.reforco.atrasoDias ? "atrasada" : out.pendente ? "pendente" : "ok";
  return out;
}
function pendenciasVacinas(estado, cfg, hoje) {
  hoje = hoje || todayISO();
  const cal = calendarioVacinas(cfg).filter((r) => r.ativo !== false);
  const cache = aplicacoesPorAnimal(estado);
  const out = [];
  const matrizes = estado.matrizes.filter((m) => m.status !== "Vendida" && m.status !== "Morta");
  const plantel = matrizes.filter(noPlantel);
  cal.forEach((r) => {
    if (r.id === "reprodutiva") {
      plantel.forEach((m) => {
        const s = situacaoVacinaVaca(estado, m, hoje, cache);
        if (!s.inicial && m.status !== "Descarte") out.push({ regra: r, animalId: m.id, brinco: m.brinco, tipo: m.categoria, situacao: "Sem registro neste ciclo", nivel: "pendente", confirmar: true, status: m.status });
      });
    } else if (r.id === "lepto") {
      plantel.filter((m) => m.status === "Cheia").forEach((m) => {
        const s = situacaoVacinaVaca(estado, m, hoje, cache);
        if (!s.reforco || s.reforco.feito) return;
        const faltam = s.reforco.faltam;
        if (s.reforco.atrasoDias) out.push({ regra: r, animalId: m.id, brinco: m.brinco, tipo: m.categoria, prazo: s.reforco.prazo, situacao: `Atrasado h\xE1 ${s.reforco.atrasoDias} dias`, nivel: "atrasada", status: m.status });
        else out.push({ regra: r, animalId: m.id, brinco: m.brinco, tipo: m.categoria, prazo: s.reforco.prazo, situacao: faltam <= 30 ? `Vence em ${faltam} dias` : `Em ${formatarDataBR(s.reforco.prazo)}`, nivel: faltam <= 30 ? "pendente" : "futura", status: m.status });
      });
    } else if (r.tipo === "idade") {
      const min = num(r.idadeMin) ?? 3;
      const max = num(r.idadeMax) ?? 8;
      listarCrias(estado, hoje).filter((c) => c.ativa && (r.publico !== "bezerras" || c.sexo === "F\xEAmea") && c.nascData).forEach((c) => {
        const id = c.novilha ? c.novilha.id : `c:${c.id}`;
        const feitas = [...cache.get(id) || [], ...cache.get(`c:${c.id}`) || []].filter((a) => a.tipo === r.nome || r.id === "brucelose" && a.tipo === "Brucelose");
        if (feitas.length && r.unica !== false) return;
        const ini = addMeses(c.nascData, min);
        const fim = addMeses(c.nascData, max);
        if (hoje < addDias(ini, -15)) return;
        const situacao = hoje > fim ? `Passou dos ${max} meses sem vacinar${r.id === "brucelose" ? " (usar RB51)" : ""}` : hoje < ini ? `Faz ${min} meses em ${formatarDataBR(ini)}` : `Vacinar at\xE9 ${formatarDataBR(fim)}`;
        out.push({ regra: r, animalId: id, brinco: c.brinco, tipo: c.sexo === "F\xEAmea" ? "Bezerra" : "Bezerro", prazo: fim, situacao, nivel: hoje > fim ? "atrasada" : hoje < ini ? "futura" : "pendente", mae: c.maeBrinco });
      });
    } else if (r.tipo === "periodo") {
      const meses = num(r.intervaloMeses) || 12;
      const alvo = r.publico === "cheias" ? plantel.filter((m) => m.status === "Cheia") : r.publico === "matrizes" ? plantel : matrizes;
      alvo.forEach((m) => {
        const ult = (cache.get(m.id) || []).filter((a) => a.tipo === r.nome).pop();
        const prazo = ult ? addMeses(ult.data, meses) : "";
        if (ult && diasEntre(hoje, prazo) > 30) return;
        out.push({ regra: r, animalId: m.id, brinco: m.brinco, tipo: m.categoria, prazo, situacao: !ult ? "Nunca registrada" : prazo < hoje ? `Venceu em ${formatarDataBR(prazo)}` : `Vence em ${formatarDataBR(prazo)}`, nivel: !ult || prazo < hoje ? "atrasada" : "pendente", status: m.status });
      });
    }
  });
  const peso = { atrasada: 0, pendente: 1, futura: 2 };
  return out.sort((a, b) => peso[a.nivel] - peso[b.nivel] || ordemBrinco2(a.brinco, b.brinco));
}
function manejoConfirmacaoVacina(matrizIds, data, tipo, opcoes) {
  const now = opcoes && opcoes.now || (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: `vac-${novoId()}`,
    tipo: "manejo",
    data,
    protocoloId: "",
    etapa: "Confirma\xE7\xE3o de vacina",
    manejoRef: "",
    responsavel: "",
    descricao: "Vacina j\xE1 aplicada, confirmada no app",
    aplicacoes: JSON.stringify([{ tipo: tipo || "Vacina reprodutiva" }]),
    presentes: matrizIds.join(","),
    ausentes: "",
    observacoes: "",
    createdAt: now
  };
}
function paiProvavel(estado, nasc) {
  if (!nasc || !nasc.matrizId || !nasc.data) return null;
  const c = addDias(nasc.data, -PERIODO_GESTACAO_DIAS);
  const iatfs = estado.eventos.filter((e) => e.tipo === "iatf" && e.matrizId === nasc.matrizId && e.data && !/repasse|monta/i.test(e.tipoServico || "")).filter((e) => {
    const d = diasEntre(e.data, nasc.data);
    return d >= 250 && d <= 320;
  });
  if (iatfs.length) return null;
  const montas = protocolosDoAnimal(estado, nasc.matrizId).filter((p3) => p3.tipo === "Monta" && p3.dataInicio && c >= addDias(p3.dataInicio, -20) && c <= addDias(fimDaMonta(p3), 20));
  if (!montas.length) return null;
  const p = montas[0];
  const touros = (p.touros || []).map((id) => nomeTouro(estado, id)).filter(Boolean);
  return { origem: "Monta", pai: touros.length ? touros.join(" ou ") : "Monta natural", rotulo: touros.length ? `Monta \xB7 ${touros.join(" ou ")}` : `Monta (${p.nome})`, protocolo: p };
}
var colsRel = (pares) => pares.map(([k, label, extra]) => ({ k, label, ...extra || {} }));
function relatorioVacasPorStatus(estado, status, hoje) {
  hoje = hoje || todayISO();
  const cache = aplicacoesPorAnimal(estado);
  const vacas = estado.matrizes.filter(noPlantel).filter((m) => !status || m.status === status).sort((a, b) => ordemBrinco2(a.brinco, b.brinco));
  const linhas = vacas.map((m) => {
    const i = infoVaca(estado, m, hoje);
    const prev = m.status === "Cheia" ? previsaoPartoInfo(m.id, estado.eventos) : null;
    const vac = situacaoVacinaVaca(estado, m, hoje, cache);
    return {
      brinco: m.brinco,
      categoria: m.categoria || "",
      lote: m.lote || "",
      status: m.status,
      crias: i.crias,
      ultimoParto: i.ultimoParto ? formatarDataBR(i.ultimoParto) : "\u2014",
      diasParida: i.diasParida ?? "\u2014",
      servico: i.ultimoServico.texto || "\u2014",
      toque: i.ultimoToque ? `${formatarDataBR(i.ultimoToque.data)} ${i.ultimoToque.resultado}${i.ultimoToque.dg ? ` (${i.ultimoToque.dg} d)` : ""}` : "\u2014",
      previsao: prev && prev.data ? formatarDataBR(prev.data) : "\u2014",
      vacina: vac.texto || "\u2014"
    };
  });
  const titulo = status === "Cheia" ? "Matrizes prenhas (cheias)" : status === "Vazia" ? "Matrizes vazias" : "Situa\xE7\xE3o das matrizes";
  const base = [["brinco", "Brinco", { mono: true }], ["categoria", "Categoria"], ["lote", "Lote"], ["crias", "Crias", { align: "right", mono: true }], ["ultimoParto", "\xDAltimo parto", { mono: true }]];
  const colunas = status === "Cheia" ? colsRel([...base, ["toque", "Toque"], ["previsao", "Previs\xE3o de parto", { mono: true }], ["servico", "Servi\xE7o"], ["vacina", "Vacina"]]) : status === "Vazia" ? colsRel([...base, ["diasParida", "Dias parida", { align: "right", mono: true }], ["servico", "\xDAltimo servi\xE7o"], ["toque", "\xDAltimo toque"], ["vacina", "Vacina"]]) : colsRel([...base.slice(0, 3), ["status", "Situa\xE7\xE3o"], ...base.slice(3), ["toque", "\xDAltimo toque"], ["previsao", "Previs\xE3o", { mono: true }]]);
  return {
    titulo,
    resumo: [
      { rotulo: "Matrizes", valor: linhas.length },
      ...status ? [] : [{ rotulo: "Cheias", valor: vacas.filter((m) => m.status === "Cheia").length }, { rotulo: "Vazias", valor: vacas.filter((m) => m.status === "Vazia").length }, { rotulo: "Descarte", valor: vacas.filter((m) => m.status === "Descarte").length }],
      { rotulo: "Vacina pendente", valor: vacas.filter((m) => situacaoVacinaVaca(estado, m, hoje, cache).pendente).length }
    ],
    secoes: [{ titulo: "Vaca por vaca (ordem de brinco)", colunas, linhas }]
  };
}
function relatorioCriasPorSexo(estado, ano, hoje) {
  hoje = hoje || todayISO();
  const crias = listarCrias(estado, hoje).filter((c) => ano === "todos" || anoDe(c.nascData) === ano);
  const linhaDe = (c) => ({
    brinco: c.brinco || "\u2014",
    nasc: c.nascData ? formatarDataBR(c.nascData) : "\u2014",
    mes: c.nascData ? c.nascData.slice(5, 7) + "/" + c.nascData.slice(2, 4) : "\u2014",
    idade: c.nascData ? (idadeMesesDias(c.nascData, hoje) || {}).texto || "\u2014" : "\u2014",
    mae: c.maeBrinco || "\u2014",
    pai: (paiProvavel(estado, c.nasc) || {}).rotulo || c.origem.rotulo || "\u2014",
    peso: c.pesoAtual ? `${c.pesoAtual} kg` : "\u2014",
    pesoData: c.pesoData ? formatarDataBR(c.pesoData) : "\u2014",
    situacao: c.situacao
  });
  const cols = colsRel([["brinco", "Brinco", { mono: true }], ["nasc", "Nascimento", { mono: true }], ["idade", "Idade"], ["mae", "M\xE3e", { mono: true }], ["pai", "Origem / pai"], ["peso", "\xDAltimo peso", { align: "right", mono: true }], ["pesoData", "Pesado em", { mono: true }], ["situacao", "Situa\xE7\xE3o"]]);
  const por = (sx) => crias.filter((c) => c.sexo === sx).sort((a, b) => ordemBrinco2(a.brinco, b.brinco)).map(linhaDe);
  const f = por("F\xEAmea");
  const m = por("Macho");
  return {
    titulo: `Crias por sexo \xB7 ${ano === "todos" ? "todos os anos" : ano}`,
    resumo: [{ rotulo: "Crias", valor: crias.length }, { rotulo: "F\xEAmeas", valor: f.length }, { rotulo: "Machos", valor: m.length }, { rotulo: "Ainda no rebanho", valor: crias.filter((c) => c.ativa).length }],
    secoes: [{ titulo: "F\xEAmeas (ordem num\xE9rica)", colunas: cols, linhas: f }, { titulo: "Machos (ordem num\xE9rica)", colunas: cols, linhas: m }]
  };
}
function relatorioDescartes(estado, ano) {
  const brincos = mapaBrincos(estado.matrizes);
  const desc = estado.eventos.filter((e) => e.tipo === "descarte" && (ano === "todos" || anoDe(e.data) === ano)).sort((a, b) => (a.data || "").localeCompare(b.data || ""));
  const marcadas = estado.matrizes.filter((m) => m.status === "Descarte").sort((a, b) => ordemBrinco2(a.brinco, b.brinco));
  return {
    titulo: `Descartes \xB7 ${ano === "todos" ? "todos os anos" : ano}`,
    resumo: [{ rotulo: "Descartes lan\xE7ados", valor: desc.length }, { rotulo: "Vacas marcadas para descarte hoje", valor: marcadas.length }],
    secoes: [
      { titulo: "Vacas marcadas para descarte (ainda na fazenda)", colunas: colsRel([["brinco", "Brinco", { mono: true }], ["categoria", "Categoria"], ["lote", "Lote"], ["crias", "Crias", { align: "right" }]]), linhas: marcadas.map((m) => ({ brinco: m.brinco, categoria: m.categoria || "", lote: m.lote || "", crias: partosDe(m, estado.eventos) })) },
      { titulo: "Lan\xE7amentos de descarte", colunas: colsRel([["data", "Data", { mono: true }], ["brinco", "Vaca", { mono: true }], ["motivo", "Motivo"]]), linhas: desc.map((e) => ({ data: formatarDataBR(e.data), brinco: brincos[e.matrizId] || "?", motivo: e.motivo || "\u2014" })) }
    ]
  };
}
function relatorioPesagens(estado, ano, hoje) {
  const pes = estado.eventos.filter((e) => e.tipo === "pesagem" && (ano === "todos" || anoDe(e.data) === ano));
  const porData = /* @__PURE__ */ new Map();
  pes.forEach((e) => {
    if (!porData.has(e.data)) porData.set(e.data, []);
    porData.get(e.data).push(e);
  });
  const linhas = [...porData.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([d, l]) => {
    const pesos = l.map((e) => parseFloat(e.peso)).filter((x) => x > 0);
    const chaves = l.map((e) => e.criaId || e.matrizId || e.brinco);
    const dup = chaves.filter((k, i) => chaves.indexOf(k) !== i).length;
    return { data: formatarDataBR(d), qtd: l.length, total: `${pesos.reduce((s, x) => s + x, 0)} kg`, media: pesos.length ? `${(pesos.reduce((s, x) => s + x, 0) / pesos.length).toFixed(1).replace(".", ",")} kg` : "\u2014", dup: dup ? `${dup} pesado(s) 2x` : "" };
  });
  return {
    titulo: `Pesagens \xB7 ${ano === "todos" ? "todos os anos" : ano}`,
    resumo: [{ rotulo: "Dias de pesagem", valor: linhas.length }, { rotulo: "Pesagens", valor: pes.length }],
    secoes: [{ titulo: "Por dia (para o PDF de um dia, use a tela Pesar)", colunas: colsRel([["data", "Data", { mono: true }], ["qtd", "Animais", { align: "right" }], ["total", "Peso total", { align: "right", mono: true }], ["media", "M\xE9dia", { align: "right", mono: true }], ["dup", "Aten\xE7\xE3o"]]), linhas }]
  };
}
function relatorioVacinas(estado, cfg, hoje) {
  const pend = pendenciasVacinas(estado, cfg, hoje).filter((p) => p.nivel !== "futura");
  const futuras = pendenciasVacinas(estado, cfg, hoje).filter((p) => p.nivel === "futura");
  const cols = colsRel([["vacina", "Vacina"], ["brinco", "Animal", { mono: true }], ["tipo", "Tipo"], ["situacao", "Situa\xE7\xE3o"], ["prazo", "Prazo", { mono: true }]]);
  const lin = (p) => ({ vacina: p.regra.nome, brinco: p.brinco, tipo: p.tipo || "", situacao: p.situacao, prazo: p.prazo ? formatarDataBR(p.prazo) : "\u2014" });
  return {
    titulo: "Vacinas pendentes",
    resumo: [{ rotulo: "Pendentes agora", valor: pend.length }, { rotulo: "Atrasadas", valor: pend.filter((p) => p.nivel === "atrasada").length }, { rotulo: "Pr\xF3ximas (mais de 30 dias)", valor: futuras.length }],
    secoes: [{ titulo: "Para vacinar agora", colunas: cols, linhas: pend.map(lin) }, { titulo: "Pr\xF3ximas", colunas: cols, linhas: futuras.map(lin) }]
  };
}
function relatorioToque(estado, toqueId) {
  const r = resumoToque(estado, toqueId);
  const tx = (t) => t.pct === null ? "\u2014" : `${t.pct}% (${t.cheias} de ${t.total})`;
  const grupo = (titulo, ls) => ({ titulo, colunas: colsRel([["chave", "Grupo"], ["cheias", "Cheias", { align: "right" }], ["total", "Avaliadas", { align: "right" }], ["taxa", "Prenhez", { align: "right" }]]), linhas: ls.map((g) => ({ ...g, taxa: tx(g) })) });
  return {
    titulo: `Toque de ${formatarDataBR(r.data)}`,
    resumo: [
      { rotulo: "Avaliadas", valor: r.total },
      { rotulo: "Taxa de prenhez", valor: tx(r.geral) },
      { rotulo: "Cheias", valor: r.cheias },
      { rotulo: "Vazias", valor: r.vazias },
      { rotulo: "Descarte", valor: r.descartes },
      { rotulo: "Novilhas aptas", valor: r.aptas },
      { rotulo: "Novilhas n\xE3o aptas", valor: r.naoAptas },
      { rotulo: "N\xE3o passaram no toque", valor: r.ausentes.length }
    ],
    secoes: [
      grupo("Por protocolo (IATF ou monta)", r.porProtocolo),
      grupo("Por s\xEAmen", r.porSemen),
      grupo("Por touro da monta", r.porMonta),
      grupo("Por lote", r.porLote),
      grupo("Por categoria", r.porCategoria),
      {
        titulo: "Vaca por vaca",
        colunas: colsRel([["brinco", "Brinco", { mono: true }], ["categoria", "Categoria"], ["lote", "Lote"], ["resultado", "Resultado"], ["dg", "Dias", { align: "right" }], ["previsao", "Previs\xE3o", { mono: true }], ["origem", "Origem"], ["obs", "Obs."]]),
        linhas: r.linhas.slice().sort((a, b) => ordemBrinco2(a.brinco, b.brinco)).map((l) => ({ brinco: l.brinco, categoria: l.categoria, lote: l.lote, resultado: l.novilhaAval && l.resultado !== "Cheia" ? l.d.apta === "Sim" ? "Apta" : "N\xE3o apta" : l.resultado, dg: l.dg || "", previsao: l.previsao ? formatarDataBR(l.previsao) : "", origem: l.origem, obs: [l.d.motivo, l.d.observacoes].filter(Boolean).join(" \xB7 ") }))
      },
      { titulo: "N\xE3o passaram no toque", colunas: colsRel([["brinco", "Brinco", { mono: true }], ["categoria", "Categoria"], ["lote", "Lote"], ["status", "Situa\xE7\xE3o"]]), linhas: r.ausentes.map((m) => ({ brinco: m.brinco, categoria: m.categoria || "", lote: m.lote || "", status: m.status })) }
    ]
  };
}
function relatorioProtocolo(estado, p, hoje) {
  const ag = agendaProtocolo(estado, p, hoje);
  const brincos = mapaBrincos(estado.matrizes);
  const presentesPor = /* @__PURE__ */ new Map();
  ag.forEach((m) => m.feitos.forEach((f) => lista2(f.presentes).forEach((id) => {
    if (!presentesPor.has(id)) presentesPor.set(id, /* @__PURE__ */ new Set());
    presentesPor.get(id).add(m.id);
  })));
  const iaPor = new Map(estado.eventos.filter((e) => e.tipo === "iatf" && e.protocoloId === p.id).map((e) => [e.matrizId, e]));
  const touros = (p.touros || []).map((id) => nomeTouro(estado, id)).filter(Boolean);
  return {
    titulo: `${p.tipo === "Monta" ? "Monta" : "Protocolo IATF"}: ${p.nome}`,
    subtitulo: p.tipo === "Monta" ? `De ${formatarDataBR(p.dataInicio)} a ${formatarDataBR(fimDaMonta(p))}${touros.length ? ` \xB7 touros: ${touros.join(", ")}` : ""}` : `D0 em ${formatarDataBR(p.dataInicio)} \xB7 IA em ${formatarDataBR(dataIA(p))}${p.semenPadrao ? ` \xB7 s\xEAmen: ${nomeTouro(estado, p.semenPadrao)}` : ""}`,
    resumo: [{ rotulo: "Animais", valor: (p.animais || []).length }, { rotulo: "Manejos feitos", valor: `${ag.filter((m) => m.feito).length} de ${ag.length}` }, { rotulo: "Inseminadas", valor: iaPor.size }],
    secoes: [
      { titulo: "Manejos", colunas: colsRel([["id", "Dia"], ["data", "Data", { mono: true }], ["descricao", "O que fazer"], ["medicamentos", "Medicamentos"], ["feito", "Feito"]]), linhas: ag.map((m) => ({ id: m.id, data: formatarDataBR(m.data), descricao: m.descricao, medicamentos: m.medicamentos || "", feito: m.feito ? `sim (${m.presentes} animais)` : m.atrasado ? "ATRASADO" : "n\xE3o" })) },
      { titulo: "Animais", colunas: colsRel([["brinco", "Brinco", { mono: true }], ["manejos", "Passou em"], ["semen", "S\xEAmen"]]), linhas: (p.animais || []).map((id) => ({ brinco: brincos[id] || "?", manejos: [...presentesPor.get(id) || []].join(", ") || "\u2014", semen: iaPor.has(id) ? nomeTouroEvento(iaPor.get(id), estado.touros) || "\u2014" : "\u2014" })).sort((a, b) => ordemBrinco2(a.brinco, b.brinco)) }
    ]
  };
}
function relatorioTouros(estado, hoje, comValores) {
  const ts = estado.touros.slice().sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt-BR"));
  const sem = ts.filter((t) => t.tipo !== "Touro vivo").map((t) => {
    const e = estoqueSemen(t, estado.eventos);
    return { nome: t.nome, raca: t.raca || "", central: t.fornecedor || "", partida: t.partida || "", tipoSemen: t.tipoSemen || "", doses: e.compradas, usadas: e.usadas, restantes: e.restantes, custo: comValores && t.custoDose ? `R$ ${t.custoDose}` : "" };
  });
  const vivos = ts.filter((t) => t.tipo === "Touro vivo").map((t) => ({ nome: t.nome, brinco: t.brinco || "", raca: t.raca || "", idade: t.dataNascimento ? (idadeMesesDias(t.dataNascimento, hoje) || {}).texto : "\u2014", origem: t.origem || "", andro: t.andrologicoData ? `${formatarDataBR(t.andrologicoData)} ${t.andrologicoResultado || ""}${andrologicoVencido(t, hoje) ? " (vencido)" : ""}` : "sem exame", lote: t.lote || "", situacao: t.situacao || "Ativo" }));
  const colsS = [["nome", "S\xEAmen"], ["raca", "Ra\xE7a"], ["central", "Central"], ["partida", "Partida"], ["tipoSemen", "Tipo"], ["doses", "Doses", { align: "right" }], ["usadas", "Usadas", { align: "right" }], ["restantes", "Restam", { align: "right" }]];
  if (comValores) colsS.push(["custo", "Custo/dose", { align: "right" }]);
  return {
    titulo: "Touros e s\xEAmen",
    resumo: [{ rotulo: "S\xEAmens", valor: sem.length }, { rotulo: "Touros vivos", valor: vivos.length }, { rotulo: "Exame androl\xF3gico vencido", valor: ts.filter((t) => andrologicoVencido(t, hoje)).length }],
    secoes: [{ titulo: "S\xEAmen", colunas: colsRel(colsS), linhas: sem }, { titulo: "Touros vivos", colunas: colsRel([["nome", "Touro"], ["brinco", "Brinco", { mono: true }], ["raca", "Ra\xE7a"], ["idade", "Idade"], ["origem", "Origem"], ["andro", "Androl\xF3gico"], ["lote", "Lote"], ["situacao", "Situa\xE7\xE3o"]]), linhas: vivos }]
  };
}
function normalizarTudo(data) {
  const d = normalizarDados(data);
  return { ...d, touros: (d.touros || []).map(normalizarTouro), protocolos: (data.protocolos || []).map(normalizarProtocolo) };
}
function aplicarPendentesTudo(dados, itens2) {
  const r = aplicarPendentes(dados, itens2);
  return { ...r, touros: (r.touros || []).map(normalizarTouro), protocolos: (r.protocolos || []).map(normalizarProtocolo) };
}
var RELATORIOS_APP = [
  { id: "crias-sexo", titulo: "Crias por sexo", curto: "Crias", porAno: true, todos: true },
  { id: "vazias", titulo: "Matrizes vazias", curto: "Vazias", porAno: false, todos: true },
  { id: "prenhas", titulo: "Matrizes prenhas", curto: "Prenhas", porAno: false, todos: true },
  { id: "situacao2", titulo: "Situa\xE7\xE3o das matrizes", curto: "Situa\xE7\xE3o", porAno: false, todos: true },
  { id: "previsao", titulo: "Previs\xE3o de parto", curto: "Parto", porAno: false, todos: true },
  { id: "toque", titulo: "\xDAltimo toque", curto: "Toque", porAno: false, todos: true },
  { id: "iatf", titulo: "IATF", curto: "IATF", porAno: true, todos: true },
  { id: "vacinas", titulo: "Vacinas pendentes", curto: "Vacinas", porAno: false, todos: true },
  { id: "pesagens", titulo: "Pesagens", curto: "Pesagens", porAno: true, todos: true },
  { id: "crias", titulo: "Crias e pesos", curto: "Pesos", porAno: true, todos: true },
  { id: "descartes", titulo: "Descartes", curto: "Descartes", porAno: true, todos: true },
  { id: "mortes", titulo: "Mortalidade", curto: "Mortes", porAno: true, todos: true },
  { id: "vendas", titulo: "Vendas por peso", curto: "Vendas", porAno: true, todos: true },
  { id: "touros", titulo: "Touros e s\xEAmen", curto: "Touros", porAno: false, todos: true },
  { id: "manejos", titulo: "Manejos gerais", curto: "Manejos", porAno: true, todos: true },
  { id: "nascimentos", titulo: "Nascimentos por sexo", curto: "Nascimentos", porAno: true, todos: false },
  { id: "melhores", titulo: "Melhores vacas em prenhez", curto: "Melhores vacas", porAno: true, todos: false }
];
var ehValor = (txt2) => /R\$|valor|receita|custo|pre[cç]o|r\$\/kg/i.test(String(txt2 || ""));
function semValores(rel) {
  return {
    ...rel,
    resumo: (rel.resumo || []).filter((r) => !ehValor(r.rotulo)),
    secoes: (rel.secoes || []).map((s) => ({ ...s, colunas: s.colunas.filter((c) => !ehValor(c.label) && c.k !== "vkg" && c.k !== "total" && c.k !== "valor") }))
  };
}
function montarRelatorioApp(id, dados, ano, hoje, opcoes) {
  const dono = !!(opcoes && opcoes.dono);
  let rel;
  if (id === "crias-sexo") rel = relatorioCriasPorSexo(dados, ano, hoje);
  else if (id === "vazias") rel = relatorioVacasPorStatus(dados, "Vazia", hoje);
  else if (id === "prenhas") rel = relatorioVacasPorStatus(dados, "Cheia", hoje);
  else if (id === "situacao2") rel = relatorioVacasPorStatus(dados, "", hoje);
  else if (id === "toque") {
    const t = listarToques(dados)[0];
    rel = t ? relatorioToque(dados, t.id) : { titulo: "\xDAltimo toque", resumo: [{ rotulo: "Toques feitos no app", valor: 0 }], secoes: [] };
  } else if (id === "vacinas") rel = relatorioVacinas(dados, dados.config, hoje);
  else if (id === "pesagens") rel = relatorioPesagens(dados, ano, hoje);
  else if (id === "descartes") rel = relatorioDescartes(dados, ano);
  else if (id === "touros") rel = relatorioTouros(dados, hoje, dono);
  else if (id === "manejos") rel = relatorioManejosGerais(dados, ano);
  else if (id === "mortes") rel = relatorioMortes(dados, ano);
  else if (id === "vendas") rel = relatorioVendas(dados, ano);
  else if (id === "crias") rel = relatorioCrias(dados, dados.config, ano, hoje);
  else rel = montarRelatorio(id, dados, ano, hoje);
  return dono ? rel : semValores(rel);
}

// src/telas/Manejo.jsx
import React8, { useState as useState8 } from "react";

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
  const lista3 = useMemo(() => {
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
        if (e.key === "Enter" && lista3.length) {
          onChange(lista3[0].id);
          setQ("");
        }
      }
    }
  ), aberto && q.trim() && /* @__PURE__ */ React.createElement("div", { className: "sug", role: "listbox" }, lista3.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "empty", style: { padding: 14 } }, "Nenhuma matriz com esse brinco."), lista3.map((m) => /* @__PURE__ */ React.createElement("button", { key: m.id, role: "option", onClick: () => {
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

// src/telas/Protocolos.jsx
import React4, { useMemo as useMemo4, useState as useState4 } from "react";
import { Plus as Plus2, Trash2 as Trash22, Save as Save2, ArrowLeft as ArrowLeft2, FileDown, Loader2 as Loader22, Pencil } from "lucide-react";

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

// src/telas/ManejoComum.jsx
import React2, { useMemo as useMemo2, useRef as useRef2, useState as useState2 } from "react";
import { Plus, Trash2, Search, Check as Check2 } from "lucide-react";
var ROTULO = { display: "block", font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 6 };
var Rotulo = ({ children }) => /* @__PURE__ */ React2.createElement("span", { className: "lbl", style: ROTULO }, children);
function AplicacoesEditor({ valor, onChange, extras }) {
  const itens2 = valor || [];
  const tipos = [...TIPOS_APLICACAO.filter((t) => t !== "Outra"), ...(extras || []).filter((t) => !TIPOS_APLICACAO.includes(t)), "Outra"];
  const mudar = (i, campo, v) => onChange(itens2.map((x, j) => j === i ? { ...x, [campo]: v } : x));
  return /* @__PURE__ */ React2.createElement("div", { className: "fld", "data-testid": "aplicacoes" }, /* @__PURE__ */ React2.createElement(Rotulo, null, "Vacinas e medicamentos aplicados"), itens2.length === 0 && /* @__PURE__ */ React2.createElement("p", { className: "sub", style: { margin: "0 0 8px" } }, "Nenhum. Se vai aplicar vacina, verm\xEDfugo ou outro produto em todos, coloque aqui."), itens2.map((a, i) => /* @__PURE__ */ React2.createElement("div", { key: i, className: "apl-lin" }, /* @__PURE__ */ React2.createElement("select", { "aria-label": "Tipo de aplica\xE7\xE3o", value: a.tipo || "", onChange: (e) => mudar(i, "tipo", e.target.value) }, /* @__PURE__ */ React2.createElement("option", { value: "" }, "Escolha"), tipos.map((t) => /* @__PURE__ */ React2.createElement("option", { key: t, value: t }, t))), /* @__PURE__ */ React2.createElement("input", { "aria-label": "Produto", placeholder: "Produto (opcional)", value: a.produto || "", onChange: (e) => mudar(i, "produto", e.target.value) }), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "x-peq", "aria-label": "Tirar esta aplica\xE7\xE3o", onClick: () => onChange(itens2.filter((_, j) => j !== i)) }, /* @__PURE__ */ React2.createElement(Trash2, { size: 16 })))), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "btn quiet sm", onClick: () => onChange([...itens2, { tipo: "", produto: "" }]) }, /* @__PURE__ */ React2.createElement(Plus, { size: 15 }), " Aplica\xE7\xE3o"));
}
function ListaMarcar({ itens: itens2, marcados, onToggle, onDigitarFora, extraDaLinha, rotuloContador }) {
  const [q, setQ] = useState2("");
  const [msg, setMsg] = useState2("");
  const refs = useRef2({});
  const total = itens2.length;
  const n = itens2.filter((x) => marcados.has(x.id)).length;
  const filtrados = useMemo2(() => {
    const t = q.trim();
    if (!t) return itens2;
    return itens2.filter((x) => String(x.brinco).startsWith(t));
  }, [itens2, q]);
  function marcarDigitado() {
    const t = q.trim();
    if (!t) return;
    const achado = itens2.find((x) => String(x.brinco) === t || /^\d+$/.test(t) && /^\d+$/.test(String(x.brinco)) && Number(x.brinco) === Number(t));
    if (achado) {
      if (!marcados.has(achado.id)) onToggle(achado.id);
      setMsg(`${achado.brinco} marcada.`);
      setQ("");
      return;
    }
    setMsg(onDigitarFora ? onDigitarFora(t) : `O brinco ${t} n\xE3o est\xE1 nesta lista. Verifique.`);
  }
  return /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("div", { className: "contador", "data-testid": "contador" }, n, " de ", total, " ", rotuloContador || "presentes"), /* @__PURE__ */ React2.createElement("label", { className: "search", style: { marginTop: 8 } }, /* @__PURE__ */ React2.createElement(Search, null), /* @__PURE__ */ React2.createElement(
    "input",
    {
      inputMode: "numeric",
      placeholder: "Digite o brinco e tecle Enter para marcar",
      "aria-label": "Brinco para marcar",
      value: q,
      onChange: (e) => {
        setQ(e.target.value);
        setMsg("");
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          marcarDigitado();
        }
      }
    }
  )), msg && /* @__PURE__ */ React2.createElement("div", { className: `hint ${/não está|Não achei|Verifique|Atenção|Escolha o lote|já está/.test(msg) ? "late" : "good"}`, role: "status", "data-testid": "msg-marcar", style: { margin: "6px 2px", fontSize: 13.5 } }, msg), /* @__PURE__ */ React2.createElement("div", { className: "marcar", "data-testid": "lista-marcar" }, filtrados.map((x) => {
    const on = marcados.has(x.id);
    return /* @__PURE__ */ React2.createElement("div", { key: x.id, className: `marca-lin${on ? " on" : ""}`, ref: (el) => {
      refs.current[x.id] = el;
    } }, /* @__PURE__ */ React2.createElement("button", { type: "button", className: "marca-bt", "aria-pressed": on, "aria-label": `${on ? "Desmarcar" : "Marcar"} ${x.brinco}`, onClick: () => onToggle(x.id) }, /* @__PURE__ */ React2.createElement("span", { className: "caixa" }, on ? /* @__PURE__ */ React2.createElement(Check2, { size: 18 }) : null), /* @__PURE__ */ React2.createElement("span", { className: "b" }, x.brinco), /* @__PURE__ */ React2.createElement("span", { className: "two" }, /* @__PURE__ */ React2.createElement("b", null, x.linha1), /* @__PURE__ */ React2.createElement("span", null, x.linha2), x.avisos && x.avisos.length ? /* @__PURE__ */ React2.createElement("span", { className: "late" }, x.avisos.join(" \xB7 ")) : null)), on && extraDaLinha ? /* @__PURE__ */ React2.createElement("div", { className: "marca-extra" }, extraDaLinha(x)) : null);
  }), filtrados.length === 0 && /* @__PURE__ */ React2.createElement("div", { className: "empty" }, "Nenhum animal com esse n\xFAmero nesta lista.")));
}

// src/telas/ManejoCurral.jsx
import React3, { useEffect as useEffect2, useMemo as useMemo3, useState as useState3 } from "react";
import { Save, ArrowLeft, Loader2 } from "lucide-react";

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

// src/telas/ManejoCurral.jsx
function aplicacoesDoTexto(txt2) {
  const t = String(txt2 || "").toLowerCase();
  const out = [];
  if (/vacina reprod|reprodutiva/.test(t)) out.push({ tipo: "Vacina reprodutiva", produto: "" });
  if (/lepto/.test(t) && !/reprodutiva/.test(t)) out.push({ tipo: "Refor\xE7o Lepto", produto: "" });
  if (/verm/.test(t)) out.push({ tipo: "Verm\xEDfugo", produto: "" });
  if (/estimulante/.test(t)) out.push({ tipo: "Estimulante", produto: "" });
  if (/fortificante|vitamina|modificador/.test(t)) out.push({ tipo: "Fortificante", produto: "" });
  return out;
}
function ManejoCurral({
  dados,
  hoje,
  protocolo,
  manejo,
  itensAvulsos,
  etapa,
  titulo,
  aplicacoesIniciais,
  modoTeste,
  onGravarLote,
  onVoltar
}) {
  const p = protocolo || null;
  const ehIA = !!(manejo && manejo.ia);
  const chave2 = `rascunho-manejo-${p ? p.id : "avulso"}-${manejo ? manejo.id : etapa || "vac"}`;
  const rasc = useMemo3(() => lerLocal(chave2, null), [chave2]);
  const dataPlanejada = p && manejo ? manejo.data : "";
  const [data, setData] = useState3(rasc && rasc.data || (dataPlanejada && dataPlanejada <= hoje ? dataPlanejada : hoje));
  const [responsavel, setResponsavel] = useState3(rasc && rasc.responsavel || p && p.tecnico || "");
  const [descricao, setDescricao] = useState3(rasc && rasc.descricao || (manejo ? manejo.descricao : "") || "");
  const [aplicacoes, setAplicacoes] = useState3(rasc && rasc.aplicacoes || aplicacoesIniciais || (manejo ? aplicacoesDoTexto(manejo.medicamentos) : []));
  const [semenPadrao, setSemenPadrao] = useState3(rasc && rasc.semenPadrao || p && p.semenPadrao || "");
  const [semen, setSemen] = useState3(rasc && rasc.semen || {});
  const [marcados, setMarcados] = useState3(() => new Set(rasc && rasc.marcados || []));
  const [obs, setObs] = useState3(rasc && rasc.obs || "");
  const [erro, setErro] = useState3("");
  const [ok, setOk] = useState3("");
  const [gravando, setGravando] = useState3(false);
  useEffect2(() => {
    if (ok) return;
    gravarNoCelular(chave2, { data, responsavel, descricao, aplicacoes, semenPadrao, semen, marcados: [...marcados], obs });
  }, [chave2, data, responsavel, descricao, aplicacoes, semenPadrao, semen, marcados, obs, ok]);
  const jaInseminadas = useMemo3(() => new Set(p ? dados.eventos.filter((e) => e.tipo === "iatf" && e.protocoloId === p.id).map((e) => e.matrizId) : []), [dados.eventos, p]);
  const semens = semensDisponiveis(dados);
  const itens2 = useMemo3(() => {
    if (itensAvulsos) return itensAvulsos;
    const porId = new Map(dados.matrizes.map((m) => [m.id, m]));
    return (p ? p.animais : []).map((id) => {
      const m = porId.get(id);
      if (!m) return { id, brinco: "?", linha1: "animal n\xE3o encontrado", linha2: "" };
      const parto = ultimoPartoDe(m.id, dados.eventos);
      const av = [];
      if (m.status === "Morta" || m.status === "Vendida") av.push(m.status === "Morta" ? "MORREU" : "VENDIDA");
      if (ehIA && jaInseminadas.has(m.id)) av.push("j\xE1 inseminada neste protocolo");
      return {
        id,
        brinco: m.brinco,
        linha1: [m.categoria, m.lote].filter(Boolean).join(" \xB7 ") || "\u2014",
        linha2: `${partosDe(m, dados.eventos)} cria(s)${parto ? ` \xB7 parto ${formatarDataBR(parto)} (${diasEntre(parto, data || hoje)} d)` : ""}`,
        avisos: av
      };
    }).sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), "pt-BR", { numeric: true }));
  }, [itensAvulsos, p, dados, ehIA, jaInseminadas, data, hoje]);
  function toggle(id) {
    setOk("");
    setErro("");
    setMarcados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function fora(brinco) {
    if (!p) return `O brinco ${brinco} n\xE3o est\xE1 nesta lista. Verifique.`;
    const r = acharNoProtocolo(dados, p, brinco);
    return r.erro || `O brinco ${brinco} n\xE3o est\xE1 nesta lista. Verifique.`;
  }
  async function gravar() {
    if (gravando) return;
    const presentes = [...marcados].filter((id) => !(ehIA && jaInseminadas.has(id)));
    if (ehIA && !semenPadrao && presentes.some((id) => !semen[id])) {
      setErro("Escolha o s\xEAmen no alto (ou em cada vaca marcada).");
      return;
    }
    const r = aplicarManejo(dados, {
      protocolo: p,
      manejo,
      data,
      responsavel,
      descricao,
      aplicacoes: aplicacoes.filter((a) => a.tipo),
      presentes,
      semen,
      semenPadrao,
      observacoes: obs,
      etapa: etapa || (manejo ? manejo.id : "Vacina\xE7\xE3o")
    });
    if (r.erros && r.erros.length) {
      setErro(r.erros.join(" "));
      return;
    }
    setGravando(true);
    const res = await onGravarLote({
      estado: r.estado,
      eventosParaGravar: r.eventosNovos.map((e) => ({ tipo: e.tipo, evento: e })),
      matrizesParaGravar: [],
      tourosParaGravar: []
    }, `${titulo || (manejo ? `manejo ${manejo.id}` : "vacina\xE7\xE3o")}: ${presentes.length} animal(is)`);
    setGravando(false);
    if (!res.ok) {
      setErro(res.msg);
      return;
    }
    apagarLocal(chave2);
    const ias = r.eventosNovos.filter((e) => e.tipo === "iatf").length;
    setOk(`Gravado: ${presentes.length} animal(is) presentes${ias ? `, ${ias} insemina\xE7\xE3o(\xF5es) lan\xE7ada(s)` : ""}.${res.offline ? " Sem internet: ficou no celular e vai para a planilha quando a internet voltar." : ""}${modoTeste ? " (modo teste: s\xF3 na tela)" : ""}`);
    setMarcados(/* @__PURE__ */ new Set());
  }
  const semenOpcoes = /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("option", { value: "" }, "Escolha o s\xEAmen"), semens.map((t) => {
    const e = estoqueSemen(t, dados.eventos);
    return /* @__PURE__ */ React3.createElement("option", { key: t.id, value: t.id }, t.nome, t.raca ? ` \xB7 ${t.raca}` : "", e.compradas ? ` (${e.restantes} doses)` : "");
  }));
  return /* @__PURE__ */ React3.createElement("section", { className: "sheet pad", "data-testid": "manejo-curral" }, /* @__PURE__ */ React3.createElement("button", { className: "btn quiet sm", onClick: onVoltar, style: { marginBottom: 10 } }, /* @__PURE__ */ React3.createElement(ArrowLeft, { size: 15 }), " Voltar"), /* @__PURE__ */ React3.createElement("h2", { className: "h2", style: { marginTop: 0 } }, titulo || (manejo ? `${manejo.id} \xB7 ${p ? p.nome : ""}` : "Vacina\xE7\xE3o")), manejo && p && /* @__PURE__ */ React3.createElement("p", { className: "sub", style: { marginTop: 0 } }, "Planejado para ", formatarDataBR(manejo.data), manejo.medicamentos ? ` \xB7 ${manejo.medicamentos}` : ""), manejo && manejo.feito && /* @__PURE__ */ React3.createElement(Aviso, { tipo: "info" }, "Este manejo j\xE1 foi feito (", manejo.feitos.map((f) => `${formatarDataBR(f.data)}, ${String(f.presentes || "").split(",").filter(Boolean).length} animais`).join("; "), "). Gravar de novo cria outro registro: use s\xF3 para as que faltaram."), /* @__PURE__ */ React3.createElement("div", { className: "grid2" }, /* @__PURE__ */ React3.createElement("div", { className: "fld" }, /* @__PURE__ */ React3.createElement("label", { htmlFor: "mj-data" }, "Data"), /* @__PURE__ */ React3.createElement("input", { id: "mj-data", type: "date", value: data, onChange: (e) => setData(e.target.value) })), /* @__PURE__ */ React3.createElement("div", { className: "fld" }, /* @__PURE__ */ React3.createElement("label", { htmlFor: "mj-resp" }, ehIA ? "T\xE9cnico (inseminador)" : "Respons\xE1vel"), /* @__PURE__ */ React3.createElement("input", { id: "mj-resp", value: responsavel, onChange: (e) => setResponsavel(e.target.value) }))), ehIA && /* @__PURE__ */ React3.createElement("div", { className: "fld" }, /* @__PURE__ */ React3.createElement("label", { htmlFor: "mj-semen" }, "S\xEAmen (vale para todas; d\xE1 para trocar em cada vaca)"), /* @__PURE__ */ React3.createElement("select", { id: "mj-semen", value: semenPadrao, onChange: (e) => setSemenPadrao(e.target.value) }, semenOpcoes)), /* @__PURE__ */ React3.createElement("div", { className: "fld" }, /* @__PURE__ */ React3.createElement("label", { htmlFor: "mj-desc" }, "Descri\xE7\xE3o do manejo"), /* @__PURE__ */ React3.createElement("input", { id: "mj-desc", value: descricao, onChange: (e) => setDescricao(e.target.value) })), /* @__PURE__ */ React3.createElement(AplicacoesEditor, { valor: aplicacoes, onChange: setAplicacoes }), /* @__PURE__ */ React3.createElement(Rotulo, null, "Animais: toque em quem passou"), /* @__PURE__ */ React3.createElement(
    ListaMarcar,
    {
      itens: itens2,
      marcados,
      onToggle: toggle,
      onDigitarFora: fora,
      extraDaLinha: ehIA ? (x) => /* @__PURE__ */ React3.createElement("select", { "aria-label": `S\xEAmen da vaca ${x.brinco}`, value: semen[x.id] || "", onChange: (e) => setSemen((s) => ({ ...s, [x.id]: e.target.value })) }, /* @__PURE__ */ React3.createElement("option", { value: "" }, semenPadrao ? `Mesmo do alto` : "Escolha o s\xEAmen"), semens.map((t) => /* @__PURE__ */ React3.createElement("option", { key: t.id, value: t.id }, t.nome))) : null
    }
  ), /* @__PURE__ */ React3.createElement("div", { className: "fld", style: { marginTop: 12 } }, /* @__PURE__ */ React3.createElement("label", { htmlFor: "mj-obs" }, "Observa\xE7\xE3o"), /* @__PURE__ */ React3.createElement("input", { id: "mj-obs", value: obs, onChange: (e) => setObs(e.target.value) })), erro && /* @__PURE__ */ React3.createElement(Aviso, null, erro), ok && /* @__PURE__ */ React3.createElement(Aviso, { tipo: "ok" }, ok), /* @__PURE__ */ React3.createElement("button", { className: "btn wide", style: { marginTop: 8 }, onClick: gravar, disabled: gravando || marcados.size === 0 }, gravando ? /* @__PURE__ */ React3.createElement(Loader2, { size: 18, className: "spin" }) : /* @__PURE__ */ React3.createElement(Save, { size: 18 }), " Gravar ", marcados.size, " presente(s)"));
}

// src/telas/Protocolos.jsx
var ativos = (dados) => (dados.protocolos || []).filter((p) => p.status !== "Encerrado");
function Lista({ dados, hoje, ownerMode, onAbrir, onNovo }) {
  const [verEncerrados, setVerEncerrados] = useState4(false);
  const lista3 = (dados.protocolos || []).filter((p) => verEncerrados || p.status !== "Encerrado").sort((a, b) => (b.dataInicio || "").localeCompare(a.dataInicio || ""));
  return /* @__PURE__ */ React4.createElement("section", null, ownerMode && /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 } }, /* @__PURE__ */ React4.createElement("button", { className: "btn sm", onClick: () => onNovo("IATF") }, /* @__PURE__ */ React4.createElement(Plus2, { size: 15 }), " Novo protocolo de IATF"), /* @__PURE__ */ React4.createElement("button", { className: "btn ghost sm", onClick: () => onNovo("Monta") }, /* @__PURE__ */ React4.createElement(Plus2, { size: 15 }), " Novo lote de monta")), lista3.length === 0 && /* @__PURE__ */ React4.createElement("div", { className: "sheet" }, /* @__PURE__ */ React4.createElement("div", { className: "empty" }, "Nenhum protocolo ", verEncerrados ? "" : "ativo ", "ainda.", ownerMode ? " Crie um nos bot\xF5es acima." : " O propriet\xE1rio cria os protocolos.")), lista3.map((p) => {
    const prox = proximoManejo(dados, p, hoje);
    const touros = (p.touros || []).map((id) => nomeTouro(dados, id)).filter(Boolean);
    return /* @__PURE__ */ React4.createElement("button", { key: p.id, className: "card-prot", onClick: () => onAbrir(p.id), "data-testid": `prot-${p.nome}` }, /* @__PURE__ */ React4.createElement("b", null, p.nome), " ", /* @__PURE__ */ React4.createElement("span", { className: "mut", style: { fontSize: 12.5 } }, "\xB7 ", p.tipo === "Monta" ? "Monta" : "IATF", p.status === "Encerrado" ? " \xB7 encerrado" : ""), /* @__PURE__ */ React4.createElement("div", { className: "l2" }, p.tipo === "Monta" ? `De ${formatarDataBR(p.dataInicio)} a ${formatarDataBR(fimDaMonta(p))}${touros.length ? ` \xB7 ${touros.join(", ")}` : ""}` : `D0 ${formatarDataBR(p.dataInicio)} \xB7 IA ${formatarDataBR(dataIA(p))}${p.semenPadrao ? ` \xB7 ${nomeTouro(dados, p.semenPadrao)}` : ""}`, ` \xB7 ${(p.animais || []).length} animais`), prox ? /* @__PURE__ */ React4.createElement("div", { className: "prox", style: { color: prox.atrasado ? "var(--late)" : prox.hoje ? "var(--green)" : void 0 } }, "Pr\xF3ximo: ", prox.id, " em ", formatarDataBR(prox.data), prox.hoje ? " (hoje)" : prox.atrasado ? " (atrasado)" : "") : /* @__PURE__ */ React4.createElement("div", { className: "prox", style: { color: "var(--green)" } }, "Todos os manejos feitos"));
  }), /* @__PURE__ */ React4.createElement("button", { className: "btn quiet sm", onClick: () => setVerEncerrados((v) => !v) }, verEncerrados ? "Esconder encerrados" : "Ver tamb\xE9m os encerrados"));
}
function Detalhe({ dados, hoje, p, ownerMode, onVoltar, onFazer, onEditar, onSalvarProtocolo, onNovoRepasse }) {
  const ag = agendaProtocolo(dados, p, hoje);
  const [pdf, setPdf] = useState4(false);
  const [confEncerrar, setConfEncerrar] = useState4(false);
  const rel = relatorioProtocolo(dados, p, hoje);
  const touros = (p.touros || []).map((id) => nomeTouro(dados, id)).filter(Boolean);
  async function baixar() {
    setPdf(true);
    try {
      await baixarPDF(rel);
    } catch (e) {
      console.error(e);
    }
    setPdf(false);
  }
  return /* @__PURE__ */ React4.createElement("section", { className: "sheet pad", "data-testid": "detalhe-protocolo" }, /* @__PURE__ */ React4.createElement("button", { className: "btn quiet sm", onClick: onVoltar, style: { marginBottom: 10 } }, /* @__PURE__ */ React4.createElement(ArrowLeft2, { size: 15 }), " Protocolos"), /* @__PURE__ */ React4.createElement("h2", { className: "h2", style: { marginTop: 0 } }, p.nome, /* @__PURE__ */ React4.createElement("small", null, p.tipo === "Monta" ? "monta" : "IATF", p.status === "Encerrado" ? " \xB7 encerrado" : "")), p.tipo === "Monta" ? /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(Lead, { rotulo: "Per\xEDodo", valor: `${formatarDataBR(p.dataInicio)} a ${formatarDataBR(fimDaMonta(p))}` }), /* @__PURE__ */ React4.createElement(Lead, { rotulo: "Touros do lote", valor: touros.join(", ") || "nenhum escolhido" })) : /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(Lead, { rotulo: "D0", valor: formatarDataBR(p.dataInicio) }), /* @__PURE__ */ React4.createElement(Lead, { rotulo: "Insemina\xE7\xE3o", valor: formatarDataBR(dataIA(p)) }), /* @__PURE__ */ React4.createElement(Lead, { rotulo: "S\xEAmen", valor: p.semenPadrao ? nomeTouro(dados, p.semenPadrao) : "escolher no dia" }), p.tecnico && /* @__PURE__ */ React4.createElement(Lead, { rotulo: "T\xE9cnico", valor: p.tecnico })), /* @__PURE__ */ React4.createElement(Lead, { rotulo: "Animais", valor: (p.animais || []).length }), ownerMode && p.custoTotal ? /* @__PURE__ */ React4.createElement(Lead, { rotulo: "Custo", valor: `R$ ${p.custoTotal}${p.custoObs ? ` (${p.custoObs})` : ""}` }) : null, /* @__PURE__ */ React4.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Manejos"), ag.map((m) => /* @__PURE__ */ React4.createElement("div", { className: "manejo-lin", key: m.id }, /* @__PURE__ */ React4.createElement("span", { className: "d" }, m.id), /* @__PURE__ */ React4.createElement("span", { className: "m mut", style: { font: "500 13.5px var(--mono)" } }, formatarDataBR(m.data)), /* @__PURE__ */ React4.createElement("span", { style: { lineHeight: 1.35 } }, m.descricao, m.medicamentos ? /* @__PURE__ */ React4.createElement("span", { className: "mut", style: { display: "block", fontSize: 12.5 } }, m.medicamentos) : null, /* @__PURE__ */ React4.createElement("span", { style: { display: "block", fontSize: 12.5, color: m.feito ? "var(--green)" : m.atrasado ? "var(--late)" : "var(--mut)" } }, m.feito ? `feito \xB7 ${m.presentes} animais` : m.atrasado ? "atrasado" : m.hoje ? "\xE9 hoje" : "a fazer")), p.status !== "Encerrado" && /* @__PURE__ */ React4.createElement("button", { className: `btn sm${m.feito ? " quiet" : ""}`, onClick: () => onFazer(m) }, m.feito ? "De novo" : "Fazer"))), /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 } }, /* @__PURE__ */ React4.createElement("button", { className: "btn ghost sm", onClick: baixar, disabled: pdf }, pdf ? /* @__PURE__ */ React4.createElement(Loader22, { size: 15, className: "spin" }) : /* @__PURE__ */ React4.createElement(FileDown, { size: 15 }), " PDF do protocolo"), ownerMode && /* @__PURE__ */ React4.createElement("button", { className: "btn quiet sm", onClick: onEditar }, /* @__PURE__ */ React4.createElement(Pencil, { size: 15 }), " Editar"), ownerMode && p.tipo === "IATF" && p.status !== "Encerrado" && /* @__PURE__ */ React4.createElement("button", { className: "btn quiet sm", onClick: onNovoRepasse }, "Mandar para o repasse (monta)"), ownerMode && p.status !== "Encerrado" && (confEncerrar ? /* @__PURE__ */ React4.createElement("button", { className: "btn sm", style: { background: "var(--late)", borderColor: "var(--late)" }, onClick: () => {
    onSalvarProtocolo({ ...p, status: "Encerrado" });
    setConfEncerrar(false);
  } }, "Confirmar encerrar") : /* @__PURE__ */ React4.createElement("button", { className: "btn quiet sm", onClick: () => setConfEncerrar(true) }, "Encerrar"))), /* @__PURE__ */ React4.createElement(SecaoRelatorio, { secao: rel.secoes[1] }));
}
function FormProtocolo({ dados, hoje, inicial: inicial2, onSalvar, onCancelar }) {
  const [f, setF] = useState4(() => ({
    tipo: "IATF",
    nome: "",
    dataInicio: "",
    status: "Ativo",
    manejos: MODELOS_IATF["3 manejos"].map((m) => ({ ...m })),
    animais: [],
    touros: [],
    semenPadrao: "",
    tecnico: "",
    custoTotal: "",
    custoObs: "",
    observacoes: "",
    diasMonta: DIAS_MONTA_PADRAO,
    ...inicial2 || {}
  }));
  const [erro, setErro] = useState4("");
  const [aviso, setAviso] = useState4("");
  const [busca, setBusca] = useState4("");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const monta = f.tipo === "Monta";
  const outros = ativos(dados).filter((p) => p.id !== f.id);
  const outroDe = (id) => outros.find((p) => (p.animais || []).includes(id));
  const infos = useMemo4(() => {
    const porId = new Map(dados.matrizes.map((m) => [m.id, m]));
    return f.animais.map((id) => {
      const m = porId.get(id);
      return m ? { id, m, i: infoVaca(dados, m, hoje) } : { id, m: null };
    }).sort((a, b) => String(a.m ? a.m.brinco : "").localeCompare(String(b.m ? b.m.brinco : ""), "pt-BR", { numeric: true }));
  }, [f.animais, dados, hoje]);
  const sugestoes = useMemo4(() => {
    const t = busca.trim();
    if (!t) return [];
    return dados.matrizes.filter((m) => m.status !== "Vendida" && m.status !== "Morta" && String(m.brinco).startsWith(t) && !f.animais.includes(m.id)).slice(0, 6).map((m) => ({ m, i: infoVaca(dados, m, hoje) }));
  }, [busca, dados, hoje, f.animais]);
  const add = (ids) => setF((x) => ({ ...x, animais: [.../* @__PURE__ */ new Set([...x.animais, ...ids])] }));
  const vazias = dados.matrizes.filter((m) => noPlantel(m) && m.status === "Vazia").map((m) => m.id);
  const ultToque = listarToques(dados)[0];
  const doToque = ultToque ? resumoToque(dados, ultToque.id) : null;
  function trocarModelo(nome) {
    set("manejos", MODELOS_IATF[nome].map((m) => ({ ...m })));
  }
  function trocarTipo(t) {
    setF((x) => ({ ...x, tipo: t, manejos: t === "Monta" ? [{ ...MANEJO_ENTRADA_MONTA }] : MODELOS_IATF["3 manejos"].map((m) => ({ ...m })) }));
  }
  const mudaManejo = (i, k, v) => set("manejos", f.manejos.map((m, j) => j === i ? { ...m, [k]: v } : k === "ia" && v ? { ...m, ia: false } : m));
  function salvar2() {
    const p = { ...f, dataFim: monta ? addDias(f.dataInicio || hoje, parseInt(f.diasMonta, 10) || DIAS_MONTA_PADRAO) : "" };
    delete p.diasMonta;
    p.manejos = p.manejos.map((m) => ({ ...m, dias: parseInt(m.dias, 10), id: String(m.id || "").trim() || `D${m.dias}` }));
    const v = validarProtocolo(dados, p);
    if (v.erros.length) {
      setErro(v.erros.join(" "));
      return;
    }
    setErro("");
    setAviso(v.avisos.join(" "));
    onSalvar(prepararProtocolo(p, inicial2 && inicial2.id ? inicial2 : null));
  }
  return /* @__PURE__ */ React4.createElement("section", { className: "sheet pad", "data-testid": "form-protocolo" }, /* @__PURE__ */ React4.createElement("button", { className: "btn quiet sm", onClick: onCancelar, style: { marginBottom: 10 } }, /* @__PURE__ */ React4.createElement(ArrowLeft2, { size: 15 }), " Cancelar"), /* @__PURE__ */ React4.createElement("h2", { className: "h2", style: { marginTop: 0 } }, inicial2 && inicial2.id ? "Editar" : "Novo", " ", monta ? "lote de monta" : "protocolo de IATF"), !(inicial2 && inicial2.id) && /* @__PURE__ */ React4.createElement("div", { className: "seg", style: { marginBottom: 12 } }, /* @__PURE__ */ React4.createElement("button", { type: "button", "aria-pressed": !monta, onClick: () => trocarTipo("IATF") }, "IATF"), /* @__PURE__ */ React4.createElement("button", { type: "button", "aria-pressed": monta, onClick: () => trocarTipo("Monta") }, "Monta (touro)")), /* @__PURE__ */ React4.createElement("div", { className: "grid2" }, /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement("label", { htmlFor: "pr-nome" }, "Nome"), /* @__PURE__ */ React4.createElement("input", { id: "pr-nome", value: f.nome, placeholder: monta ? "Ex.: Monta Dez/26 lote 2" : "Ex.: IATF Nov/26", onChange: (e) => set("nome", e.target.value) })), /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement("label", { htmlFor: "pr-data" }, monta ? "Entrada no lote" : "Data do D0"), /* @__PURE__ */ React4.createElement("input", { id: "pr-data", type: "date", value: f.dataInicio, onChange: (e) => set("dataInicio", e.target.value) }))), monta ? /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement("label", { htmlFor: "pr-dias" }, "Dias com os touros"), /* @__PURE__ */ React4.createElement("input", { id: "pr-dias", type: "number", value: f.diasMonta, onChange: (e) => set("diasMonta", e.target.value) }), f.dataInicio && /* @__PURE__ */ React4.createElement("div", { className: "hint" }, "Sai do lote em ", formatarDataBR(addDias(f.dataInicio, parseInt(f.diasMonta, 10) || DIAS_MONTA_PADRAO)))), /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement(Rotulo, null, "Touros do lote (pode ser mais de um)"), tourosVivos(dados).length === 0 && /* @__PURE__ */ React4.createElement("p", { className: "sub", style: { margin: 0 } }, "Nenhum touro vivo cadastrado. Cadastre em Rebanho > Touros."), /* @__PURE__ */ React4.createElement("div", { className: "pills" }, tourosVivos(dados).map((t) => {
    const on = f.touros.includes(t.id);
    return /* @__PURE__ */ React4.createElement("button", { key: t.id, type: "button", "aria-pressed": on, onClick: () => set("touros", on ? f.touros.filter((x) => x !== t.id) : [...f.touros, t.id]) }, t.nome);
  })))) : /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement("div", { className: "grid2" }, /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement("label", { htmlFor: "pr-semen" }, "S\xEAmen (padr\xE3o)"), /* @__PURE__ */ React4.createElement("select", { id: "pr-semen", value: f.semenPadrao, onChange: (e) => set("semenPadrao", e.target.value) }, /* @__PURE__ */ React4.createElement("option", { value: "" }, "Escolher no dia da IA"), semensDisponiveis(dados).map((t) => {
    const e = estoqueSemen(t, dados.eventos);
    return /* @__PURE__ */ React4.createElement("option", { key: t.id, value: t.id }, t.nome, e.compradas ? ` (${e.restantes} doses)` : "");
  }))), /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement("label", { htmlFor: "pr-tec" }, "T\xE9cnico"), /* @__PURE__ */ React4.createElement("input", { id: "pr-tec", value: f.tecnico, onChange: (e) => set("tecnico", e.target.value) }))), /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement(Rotulo, null, "Modelo"), /* @__PURE__ */ React4.createElement("div", { className: "seg" }, Object.keys(MODELOS_IATF).map((n) => /* @__PURE__ */ React4.createElement("button", { key: n, type: "button", onClick: () => trocarModelo(n) }, n))))), /* @__PURE__ */ React4.createElement(Rotulo, null, "Manejos (dia, nome, o que fazer e medicamentos)"), f.manejos.map((m, i) => /* @__PURE__ */ React4.createElement("div", { key: i, className: "manejo-ed" }, /* @__PURE__ */ React4.createElement("input", { "aria-label": "Dia (n\xFAmero)", placeholder: "Dia", type: "number", value: m.dias, onChange: (e) => mudaManejo(i, "dias", e.target.value) }), /* @__PURE__ */ React4.createElement("input", { "aria-label": "Nome do manejo", value: m.id, onChange: (e) => mudaManejo(i, "id", e.target.value) }), /* @__PURE__ */ React4.createElement("div", { style: { display: "grid", gap: 6 } }, /* @__PURE__ */ React4.createElement("input", { "aria-label": "O que fazer", value: m.descricao, onChange: (e) => mudaManejo(i, "descricao", e.target.value) }), /* @__PURE__ */ React4.createElement("input", { "aria-label": "Medicamentos", placeholder: "Medicamentos", value: m.medicamentos || "", onChange: (e) => mudaManejo(i, "medicamentos", e.target.value) }), !monta && /* @__PURE__ */ React4.createElement("label", { style: { fontSize: 13, display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React4.createElement("input", { type: "radio", name: "ia", checked: !!m.ia, onChange: () => mudaManejo(i, "ia", true), style: { width: 18, minHeight: 18 } }), " Este \xE9 o dia da insemina\xE7\xE3o")), /* @__PURE__ */ React4.createElement("button", { type: "button", className: "x-peq", "aria-label": "Tirar este manejo", onClick: () => set("manejos", f.manejos.filter((_, j) => j !== i)) }, /* @__PURE__ */ React4.createElement(Trash22, { size: 16 })))), /* @__PURE__ */ React4.createElement("button", { type: "button", className: "btn quiet sm", onClick: () => set("manejos", [...f.manejos, { id: "", dias: "", descricao: "", medicamentos: "" }]) }, /* @__PURE__ */ React4.createElement(Plus2, { size: 15 }), " Manejo"), /* @__PURE__ */ React4.createElement("p", { className: "sub" }, "Os manejos v\xEAm de um modelo: ajuste os dias e os produtos conforme o veterin\xE1rio. O refor\xE7o da Lepto das que ficarem cheias \xE9 avisado sozinho (tela Vacinas)."), /* @__PURE__ */ React4.createElement("div", { className: "grid2" }, /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement("label", { htmlFor: "pr-custo" }, "Custo total (opcional, R$)"), /* @__PURE__ */ React4.createElement("input", { id: "pr-custo", inputMode: "decimal", value: f.custoTotal, onChange: (e) => set("custoTotal", e.target.value) })), /* @__PURE__ */ React4.createElement("div", { className: "fld" }, /* @__PURE__ */ React4.createElement("label", { htmlFor: "pr-custo-obs" }, "Do que \xE9 o custo (opcional)"), /* @__PURE__ */ React4.createElement("input", { id: "pr-custo-obs", value: f.custoObs, onChange: (e) => set("custoObs", e.target.value) }))), /* @__PURE__ */ React4.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Animais", /* @__PURE__ */ React4.createElement("small", null, f.animais.length)), /* @__PURE__ */ React4.createElement("div", { className: "pills" }, /* @__PURE__ */ React4.createElement("button", { type: "button", onClick: () => add(vazias.filter((id) => !outroDe(id))) }, "+ Todas as vazias (", vazias.filter((id) => !outroDe(id)).length, ")"), doToque && /* @__PURE__ */ React4.createElement("button", { type: "button", onClick: () => add([...doToque.vaziasIds, ...doToque.aptasIds].filter((id) => !outroDe(id))) }, "+ Vazias e novilhas aptas do toque de ", formatarDataBR(doToque.data), " (", doToque.vaziasIds.length + doToque.aptasIds.length, ")"), f.animais.length > 0 && /* @__PURE__ */ React4.createElement("button", { type: "button", onClick: () => set("animais", []) }, "Limpar lista")), /* @__PURE__ */ React4.createElement("div", { className: "fld", style: { position: "relative" } }, /* @__PURE__ */ React4.createElement("label", { htmlFor: "pr-busca" }, "Colocar vaca pelo brinco"), /* @__PURE__ */ React4.createElement(
    "input",
    {
      id: "pr-busca",
      inputMode: "numeric",
      autoComplete: "off",
      value: busca,
      onChange: (e) => setBusca(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const r = acharMatrizPorBrinco(dados.matrizes, busca);
          if (r.matriz) {
            add([r.matriz.id]);
            setBusca("");
          }
        }
      }
    }
  ), sugestoes.length > 0 && /* @__PURE__ */ React4.createElement("div", { className: "marcar", "data-testid": "sugestoes-protocolo" }, sugestoes.map(({ m, i }) => /* @__PURE__ */ React4.createElement("div", { key: m.id, className: "marca-lin" }, /* @__PURE__ */ React4.createElement("button", { type: "button", className: "marca-bt", onClick: () => {
    add([m.id]);
    setBusca("");
  } }, /* @__PURE__ */ React4.createElement("span", { className: "caixa" }, /* @__PURE__ */ React4.createElement(Plus2, { size: 16 })), /* @__PURE__ */ React4.createElement("span", { className: "b" }, m.brinco), /* @__PURE__ */ React4.createElement("span", { className: "two" }, /* @__PURE__ */ React4.createElement("b", null, m.categoria, " \xB7 ", m.status), /* @__PURE__ */ React4.createElement("span", null, "\xDAltimo parto: ", i.ultimoParto ? `${formatarDataBR(i.ultimoParto)} (${i.diasParida} d)` : "nenhum", " \xB7 \xDAltima IATF: ", i.ultimoServico.iatf ? formatarDataBR(i.ultimoServico.iatf.data) : "nenhuma"))))))), /* @__PURE__ */ React4.createElement("div", { className: "marcar", "data-testid": "animais-protocolo" }, infos.length === 0 && /* @__PURE__ */ React4.createElement("div", { className: "empty" }, "Nenhum animal ainda."), infos.map(({ id, m, i }) => {
    const av = m ? avisosParaProtocolo(dados, i, dados.config, outroDe(id)) : ["n\xE3o encontrado"];
    return /* @__PURE__ */ React4.createElement("div", { key: id, className: "marca-lin" }, /* @__PURE__ */ React4.createElement("div", { className: "marca-bt", style: { gridTemplateColumns: "80px minmax(0,1fr) 40px" } }, /* @__PURE__ */ React4.createElement("span", { className: "b" }, m ? m.brinco : "?"), /* @__PURE__ */ React4.createElement("span", { className: "two" }, /* @__PURE__ */ React4.createElement("b", null, m ? `${m.categoria || ""} \xB7 ${i.crias} cria(s)` : ""), m && /* @__PURE__ */ React4.createElement("span", null, "\xDAltimo parto: ", i.ultimoParto ? `${formatarDataBR(i.ultimoParto)} (${i.diasParida} d)` : "nenhum", " \xB7 \xDAltima IATF: ", i.ultimoServico.iatf ? formatarDataBR(i.ultimoServico.iatf.data) : "nenhuma"), m && i.ultimoToque && /* @__PURE__ */ React4.createElement("span", null, "\xDAltimo toque: ", formatarDataBR(i.ultimoToque.data), " ", i.ultimoToque.resultado), av.length > 0 && /* @__PURE__ */ React4.createElement("span", { className: "late" }, av.join(" \xB7 "))), /* @__PURE__ */ React4.createElement("button", { type: "button", className: "x-peq", "aria-label": `Tirar ${m ? m.brinco : id}`, onClick: () => set("animais", f.animais.filter((x) => x !== id)) }, /* @__PURE__ */ React4.createElement(Trash22, { size: 16 }))));
  })), erro && /* @__PURE__ */ React4.createElement(Aviso, null, erro), aviso && /* @__PURE__ */ React4.createElement(Aviso, { tipo: "info" }, aviso), /* @__PURE__ */ React4.createElement("button", { className: "btn wide", style: { marginTop: 12 }, onClick: salvar2 }, /* @__PURE__ */ React4.createElement(Save2, { size: 18 }), " Salvar ", monta ? "lote de monta" : "protocolo"));
}
function Protocolos({ dados, hoje, ownerMode, modoTeste, onSalvarProtocolo, onGravarLote, abrirNovo, onNovoConsumido }) {
  const [view, setView] = useState4({ tela: "lista" });
  const [msg, setMsg] = useState4("");
  React4.useEffect(() => {
    if (abrirNovo && ownerMode) {
      setView({ tela: "form", inicial: abrirNovo });
      if (onNovoConsumido) onNovoConsumido();
    }
  }, [abrirNovo]);
  const p = view.id ? (dados.protocolos || []).find((x) => x.id === view.id) : null;
  function salvar2(prot) {
    const r = onSalvarProtocolo(prot);
    setMsg(r || `Protocolo "${prot.nome}" salvo.`);
    setView({ tela: "detalhe", id: prot.id });
  }
  if (view.tela === "form" && ownerMode) {
    return /* @__PURE__ */ React4.createElement(FormProtocolo, { dados, hoje, inicial: view.inicial, onSalvar: salvar2, onCancelar: () => setView(view.inicial && view.inicial.id ? { tela: "detalhe", id: view.inicial.id } : { tela: "lista" }) });
  }
  if (view.tela === "fazer" && p) {
    const m = agendaProtocolo(dados, p, hoje).find((x) => x.id === view.manejoId);
    return /* @__PURE__ */ React4.createElement(ManejoCurral, { key: `${p.id}-${view.manejoId}`, dados, hoje, protocolo: p, manejo: m, modoTeste, onGravarLote, onVoltar: () => setView({ tela: "detalhe", id: p.id }), titulo: `${m.id} \xB7 ${p.nome}` });
  }
  if (view.tela === "detalhe" && p) {
    return /* @__PURE__ */ React4.createElement(React4.Fragment, null, msg && /* @__PURE__ */ React4.createElement(Aviso, { tipo: "ok", onClose: () => setMsg("") }, msg), /* @__PURE__ */ React4.createElement(
      Detalhe,
      {
        dados,
        hoje,
        p,
        ownerMode,
        onVoltar: () => {
          setMsg("");
          setView({ tela: "lista" });
        },
        onFazer: (m) => {
          setMsg("");
          setView({ tela: "fazer", id: p.id, manejoId: m.id });
        },
        onEditar: () => setView({ tela: "form", inicial: { ...p, diasMonta: p.tipo === "Monta" && p.dataFim && p.dataInicio ? Math.round((new Date(p.dataFim) - new Date(p.dataInicio)) / 864e5) : DIAS_MONTA_PADRAO } }),
        onSalvarProtocolo: (x) => {
          onSalvarProtocolo(prepararProtocolo(x, p));
          setMsg("Protocolo encerrado.");
        },
        onNovoRepasse: () => setView({ tela: "form", inicial: { ...montaDeRepasse(dados, p, {}), diasMonta: DIAS_MONTA_PADRAO } })
      }
    ));
  }
  return /* @__PURE__ */ React4.createElement(Lista, { dados, hoje, ownerMode, onAbrir: (id) => setView({ tela: "detalhe", id }), onNovo: (tipo) => setView({ tela: "form", inicial: tipo === "Monta" ? { tipo: "Monta", manejos: [{ ...MANEJO_ENTRADA_MONTA }] } : void 0 }) });
}

// src/telas/Toque.jsx
import React5, { useEffect as useEffect3, useMemo as useMemo5, useRef as useRef3, useState as useState5 } from "react";
import { Save as Save3, Loader2 as Loader23, FileDown as FileDown2, Search as Search2, ClipboardList } from "lucide-react";
var CHAVE = "toque-sessao-v1";
function Linha({ dados, m, info, marca, data, cfg, onMarcar, gravada }) {
  const novilha = m.categoria === "Novilha" && info.crias === 0;
  const res = marca ? marca.resultado : "";
  const avs = avisosToque(dados, m, marca, data, cfg);
  const c = marca && res === "Cheia" ? concepcaoPeloToque(data, marca.dg) : "";
  const ori = c ? origemDaPrenhez(dados, m.id, c) : null;
  const classe = res === "Cheia" ? "cheia" : res === "Vazia" ? "vazia" : res === "Descarte" ? "descarte" : res === "Ausente" ? "ausente" : "";
  const prevAnt = m.status === "Cheia" ? previsaoPartoInfo(m.id, dados.eventos) : null;
  const set = (x) => onMarcar(m.id, x);
  const bt = (rotulo, valor, cls, extra) => /* @__PURE__ */ React5.createElement(
    "button",
    {
      type: "button",
      className: cls,
      "aria-pressed": res === valor && (!extra || marca.apta === extra.apta),
      disabled: gravada,
      onClick: () => set(res === valor && (!extra || marca.apta === extra.apta) ? null : { ...marca || {}, resultado: valor, apta: "", ...extra || {} })
    },
    rotulo
  );
  return /* @__PURE__ */ React5.createElement("div", { className: `toque-lin ${classe}`, "data-testid": `toque-${m.brinco}` }, /* @__PURE__ */ React5.createElement("div", { className: "cab" }, /* @__PURE__ */ React5.createElement("span", { className: "b" }, m.brinco), /* @__PURE__ */ React5.createElement("span", { style: { fontWeight: 600 } }, m.categoria || ""), /* @__PURE__ */ React5.createElement("span", { className: "mut", style: { fontSize: 13 } }, [m.lote, m.status].filter(Boolean).join(" \xB7 ")), gravada && /* @__PURE__ */ React5.createElement("span", { className: "vac-tag ok" }, "gravado")), /* @__PURE__ */ React5.createElement("div", { className: "info" }, /* @__PURE__ */ React5.createElement("b", null, info.crias), " cria(s) \xB7 \xFAltimo parto ", /* @__PURE__ */ React5.createElement("b", null, info.ultimoParto ? `${formatarDataBR(info.ultimoParto)} (${info.diasParida} d)` : "nenhum"), /* @__PURE__ */ React5.createElement("br", null), info.ultimoServico.texto ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, "Servi\xE7o: ", /* @__PURE__ */ React5.createElement("b", null, info.ultimoServico.texto)) : "Sem IATF nem monta registrada", info.ultimoToque ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement("br", null), "\xDAltimo toque: ", formatarDataBR(info.ultimoToque.data), " ", info.ultimoToque.resultado, info.ultimoToque.dg ? ` (${info.ultimoToque.dg} dias)` : "", prevAnt && prevAnt.data ? ` \xB7 parto previsto ${formatarDataBR(prevAnt.data)}` : "") : null, info.vacina && info.vacina.texto ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement("br", null), /* @__PURE__ */ React5.createElement("span", { className: `vac-tag ${info.vacina.nivel}` }, info.vacina.texto)) : null), /* @__PURE__ */ React5.createElement("div", { className: "res-bts" }, novilha ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, bt("Apta", "Vazia", "cheia", { apta: "Sim" }), bt("N\xE3o apta", "Vazia", "vazia", { apta: "N\xE3o" }), bt("Cheia", "Cheia", "cheia"), bt("Vazia", "Vazia", "vazia", { apta: "" }), bt("Descarte", "Descarte", "descarte")) : /* @__PURE__ */ React5.createElement(React5.Fragment, null, bt("Cheia", "Cheia", "cheia"), bt("Vazia", "Vazia", "vazia"), bt("Descarte", "Descarte", "descarte")), bt("Ausente", "Ausente", "aus")), marca && res === "Cheia" && /* @__PURE__ */ React5.createElement("div", { className: "mais" }, /* @__PURE__ */ React5.createElement("input", { "aria-label": `Dias de prenhez da ${m.brinco}`, inputMode: "numeric", placeholder: "Dias", value: marca.dg ?? "", disabled: gravada, onChange: (e) => set({ ...marca, dg: e.target.value.replace(/\D/g, "") }) }), /* @__PURE__ */ React5.createElement("input", { "aria-label": `Observa\xE7\xE3o da ${m.brinco}`, placeholder: "Observa\xE7\xE3o", value: marca.observacoes || "", disabled: gravada, onChange: (e) => set({ ...marca, observacoes: e.target.value }) })), marca && res === "Descarte" && /* @__PURE__ */ React5.createElement("div", { className: "mais" }, /* @__PURE__ */ React5.createElement("select", { "aria-label": `Motivo do descarte da ${m.brinco}`, value: marca.motivo || "", disabled: gravada, onChange: (e) => set({ ...marca, motivo: e.target.value }) }, /* @__PURE__ */ React5.createElement("option", { value: "" }, "Motivo"), MOTIVOS_DESCARTE.map((x) => /* @__PURE__ */ React5.createElement("option", { key: x }, x))), /* @__PURE__ */ React5.createElement("input", { "aria-label": `Observa\xE7\xE3o da ${m.brinco}`, placeholder: "Observa\xE7\xE3o", value: marca.observacoes || "", disabled: gravada, onChange: (e) => set({ ...marca, observacoes: e.target.value }) })), marca && res === "Vazia" && /* @__PURE__ */ React5.createElement("div", { className: "mais", style: { gridTemplateColumns: "1fr" } }, /* @__PURE__ */ React5.createElement("input", { "aria-label": `Observa\xE7\xE3o da ${m.brinco}`, placeholder: "Observa\xE7\xE3o (opcional)", value: marca.observacoes || "", disabled: gravada, onChange: (e) => set({ ...marca, observacoes: e.target.value }) })), c && marca.dg !== "" && /* @__PURE__ */ React5.createElement("div", { className: "calc" }, "Concep\xE7\xE3o ", formatarDataBR(c), " \xB7 parto previsto ", formatarDataBR(previsaoPeloToque(data, marca.dg)), ori ? ` \xB7 ${ori.rotulo}` : ""), avs.length > 0 && /* @__PURE__ */ React5.createElement("div", { className: "avs" }, avs.join(" \xB7 ")));
}
function ResumoToque({ dados, toqueId, ownerMode, onMontarProtocolo, onVoltar }) {
  const rel = useMemo5(() => relatorioToque(dados, toqueId), [dados, toqueId]);
  const r = useMemo5(() => resumoToque(dados, toqueId), [dados, toqueId]);
  const [pdf, setPdf] = useState5(false);
  return /* @__PURE__ */ React5.createElement("section", { className: "sheet pad", "data-testid": "resumo-toque" }, /* @__PURE__ */ React5.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rel.titulo), /* @__PURE__ */ React5.createElement(Kpis, { itens: rel.resumo }), /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" } }, /* @__PURE__ */ React5.createElement("button", { className: "btn ghost sm", disabled: pdf, onClick: async () => {
    setPdf(true);
    try {
      await baixarPDF(rel);
    } catch (e) {
      console.error(e);
    }
    setPdf(false);
  } }, pdf ? /* @__PURE__ */ React5.createElement(Loader23, { size: 15, className: "spin" }) : /* @__PURE__ */ React5.createElement(FileDown2, { size: 15 }), " PDF do toque"), ownerMode ? /* @__PURE__ */ React5.createElement("button", { className: "btn sm", onClick: () => onMontarProtocolo([...r.vaziasIds, ...r.aptasIds]) }, /* @__PURE__ */ React5.createElement(ClipboardList, { size: 15 }), " Montar protocolo com vazias e novilhas aptas (", r.vaziasIds.length + r.aptasIds.length, ")") : /* @__PURE__ */ React5.createElement("span", { className: "sub", style: { alignSelf: "center" } }, "O propriet\xE1rio monta o pr\xF3ximo protocolo com as vazias e as novilhas aptas."), onVoltar && /* @__PURE__ */ React5.createElement("button", { className: "btn quiet sm", onClick: onVoltar }, "Voltar")), rel.secoes.map((s) => /* @__PURE__ */ React5.createElement(SecaoRelatorio, { key: s.titulo, secao: s })));
}
function Toque({ dados, hoje, ownerMode, modoTeste, onGravarLote, onMontarProtocolo }) {
  const [sessao, setSessao] = useState5(() => lerLocal(CHAVE, null));
  const [cab, setCab] = useState5({ data: hoje, veterinario: "", metodo: "Toque retal", aplicacoes: [], observacoes: "" });
  const [filtro, setFiltro] = useState5("faltam");
  const [busca, setBusca] = useState5("");
  const [msg, setMsg] = useState5(null);
  const [gravando, setGravando] = useState5(false);
  const [verResumo, setVerResumo] = useState5(null);
  const [confEncerrar, setConfEncerrar] = useState5(false);
  const topo = useRef3(null);
  useEffect3(() => {
    if (sessao) gravarNoCelular(CHAVE, sessao);
    else apagarLocal(CHAVE);
  }, [sessao]);
  const eleg = useMemo5(() => elegiveisToque(dados), [dados]);
  const infos = useMemo5(() => new Map(eleg.map((m) => [m.id, infoVaca(dados, m, sessao ? sessao.data : hoje)])), [eleg, dados, sessao && sessao.data, hoje]);
  const toques = useMemo5(() => listarToques(dados), [dados]);
  if (verResumo) return /* @__PURE__ */ React5.createElement(ResumoToque, { dados, toqueId: verResumo, ownerMode, onMontarProtocolo, onVoltar: () => setVerResumo(null) });
  if (!sessao) {
    return /* @__PURE__ */ React5.createElement("section", { className: "sheet pad", "data-testid": "toque-inicio" }, /* @__PURE__ */ React5.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Toque geral"), /* @__PURE__ */ React5.createElement("p", { className: "sub", style: { marginTop: 0 } }, "Preencha o cabe\xE7alho e comece. Aparecem todas as matrizes e novilhas (", eleg.length, ") com o hist\xF3rico de cada uma. As marca\xE7\xF5es ficam guardadas neste celular at\xE9 gravar."), /* @__PURE__ */ React5.createElement("div", { className: "grid2" }, /* @__PURE__ */ React5.createElement("div", { className: "fld" }, /* @__PURE__ */ React5.createElement("label", { htmlFor: "tq-data" }, "Data do toque"), /* @__PURE__ */ React5.createElement("input", { id: "tq-data", type: "date", value: cab.data, onChange: (e) => setCab({ ...cab, data: e.target.value }) })), /* @__PURE__ */ React5.createElement("div", { className: "fld" }, /* @__PURE__ */ React5.createElement("label", { htmlFor: "tq-vet" }, "Veterin\xE1rio"), /* @__PURE__ */ React5.createElement("input", { id: "tq-vet", value: cab.veterinario, onChange: (e) => setCab({ ...cab, veterinario: e.target.value }) }))), /* @__PURE__ */ React5.createElement("div", { className: "seg", style: { marginBottom: 12 } }, ["Toque retal", "Ultrassom"].map((x) => /* @__PURE__ */ React5.createElement("button", { key: x, type: "button", "aria-pressed": cab.metodo === x, onClick: () => setCab({ ...cab, metodo: x }) }, x))), /* @__PURE__ */ React5.createElement(AplicacoesEditor, { valor: cab.aplicacoes, onChange: (a) => setCab({ ...cab, aplicacoes: a }) }), /* @__PURE__ */ React5.createElement("button", { className: "btn wide", onClick: () => setSessao({ ...cab, id: `tq-${novoId()}`, marcas: {}, gravadas: [] }), disabled: !cab.data }, "Come\xE7ar o toque"), toques.length > 0 && /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Toques j\xE1 feitos"), toques.map((t2) => /* @__PURE__ */ React5.createElement("button", { key: t2.id, className: "card-prot", onClick: () => setVerResumo(t2.id) }, /* @__PURE__ */ React5.createElement("b", null, "Toque de ", formatarDataBR(t2.data)), /* @__PURE__ */ React5.createElement("div", { className: "l2" }, t2.diags.length, " avaliadas", t2.veterinario ? ` \xB7 ${t2.veterinario}` : "")))));
  }
  const marcas = sessao.marcas || {};
  const gravadas = new Set(sessao.gravadas || []);
  const naoGravadas = Object.entries(marcas).filter(([id, mk]) => mk && !gravadas.has(id) && mk.resultado !== "Ausente");
  const avaliadas = Object.values(marcas).filter((mk) => mk && mk.resultado).length;
  const contagem = (r) => Object.values(marcas).filter((mk) => mk && mk.resultado === r).length;
  function marcar(id, mk) {
    setMsg(null);
    setSessao((s) => ({ ...s, marcas: { ...s.marcas, [id]: mk } }));
  }
  const t = busca.trim();
  const lista3 = eleg.filter((m) => {
    if (t) return String(m.brinco).startsWith(t);
    const mk = marcas[m.id];
    if (filtro === "faltam") return !mk || !mk.resultado;
    if (filtro === "cheias") return mk && mk.resultado === "Cheia";
    if (filtro === "vazias") return mk && mk.resultado === "Vazia";
    if (filtro === "novilhas") return m.categoria === "Novilha";
    return true;
  });
  async function gravar() {
    if (gravando) return;
    const semDias = naoGravadas.filter(([, mk]) => mk.resultado === "Cheia" && (mk.dg === "" || mk.dg === void 0));
    if (semDias.length) {
      setMsg({ tipo: "erro", texto: `Faltam os dias de prenhez de ${semDias.length} vaca(s) cheia(s): ${semDias.map(([id]) => (dados.matrizes.find((m) => m.id === id) || {}).brinco).join(", ")}.` });
      return;
    }
    const lista22 = naoGravadas.map(([matrizId, mk]) => ({ matrizId, ...mk }));
    const r = aplicarToque(dados, sessao, lista22);
    if (!r.aplicados.length) {
      setMsg({ tipo: "erro", texto: r.rejeitados.map((x) => x.motivo).join(" ") || "Nada para gravar." });
      return;
    }
    setGravando(true);
    const res = await onGravarLote(r, `toque: ${r.aplicados.length} vaca(s)`);
    setGravando(false);
    if (!res.ok) {
      setMsg({ tipo: "erro", texto: res.msg });
      return;
    }
    const ids = r.aplicados.map((a) => a.matriz.id);
    const recusadas = r.rejeitados.map((x) => x.marca.matrizId);
    setSessao((s) => ({ ...s, gravadas: [.../* @__PURE__ */ new Set([...s.gravadas || [], ...ids, ...recusadas])] }));
    setMsg({ tipo: "ok", texto: `${ids.length} avalia\xE7\xE3o(\xF5es) gravada(s).${r.rejeitados.length ? ` N\xE3o gravadas: ${r.rejeitados.map((x) => x.motivo).join("; ")}.` : ""}${res.offline ? " Sem internet: ficou no celular e vai para a planilha quando a internet voltar." : ""}${modoTeste ? " (modo teste: s\xF3 na tela)" : ""}` });
  }
  function encerrar() {
    const id = sessao.id;
    setSessao(null);
    setConfEncerrar(false);
    if ((sessao.gravadas || []).length) setVerResumo(id);
  }
  return /* @__PURE__ */ React5.createElement("section", { "data-testid": "toque-sessao" }, /* @__PURE__ */ React5.createElement("div", { className: "sheet pad", ref: topo }, /* @__PURE__ */ React5.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Toque de ", formatarDataBR(sessao.data), /* @__PURE__ */ React5.createElement("small", null, sessao.veterinario || "sem veterin\xE1rio", " \xB7 ", sessao.metodo)), /* @__PURE__ */ React5.createElement("div", { className: "bar-sum", style: { padding: 0, border: "none" }, "data-testid": "placar-toque" }, /* @__PURE__ */ React5.createElement("span", { className: "mut" }, avaliadas, " de ", eleg.length, " avaliadas"), /* @__PURE__ */ React5.createElement("span", { className: "good" }, contagem("Cheia"), " cheias"), /* @__PURE__ */ React5.createElement("span", { className: "soon" }, contagem("Vazia"), " vazias"), /* @__PURE__ */ React5.createElement("span", { className: "late" }, contagem("Descarte"), " descarte"), /* @__PURE__ */ React5.createElement("span", { className: "mut" }, gravadas.size, " gravadas")), /* @__PURE__ */ React5.createElement("div", { className: "pills" }, [["faltam", "Faltam"], ["todas", "Todas"], ["cheias", "Cheias"], ["vazias", "Vazias"], ["novilhas", "Novilhas"]].map(([id, r]) => /* @__PURE__ */ React5.createElement("button", { key: id, type: "button", "aria-pressed": filtro === id && !t, onClick: () => {
    setFiltro(id);
    setBusca("");
  } }, r))), /* @__PURE__ */ React5.createElement("label", { className: "search", style: { border: "1px solid var(--line)", borderRadius: 6 } }, /* @__PURE__ */ React5.createElement(Search2, null), /* @__PURE__ */ React5.createElement("input", { inputMode: "numeric", placeholder: "Digite o brinco da vaca no brete", "aria-label": "Buscar brinco no toque", value: busca, onChange: (e) => setBusca(e.target.value) }))), /* @__PURE__ */ React5.createElement("div", { className: "sheet", style: { marginTop: 10 } }, lista3.length === 0 && /* @__PURE__ */ React5.createElement("div", { className: "empty" }, t ? `Nenhuma vaca com o brinco ${t} no toque.` : filtro === "faltam" ? "Todas avaliadas." : "Nada aqui."), lista3.map((m) => /* @__PURE__ */ React5.createElement(Linha, { key: m.id, dados, m, info: infos.get(m.id), marca: marcas[m.id], data: sessao.data, cfg: dados.config, onMarcar: marcar, gravada: gravadas.has(m.id) }))), /* @__PURE__ */ React5.createElement("div", { className: "sheet pad", style: { marginTop: 10, position: "sticky", bottom: 70, zIndex: 5 } }, msg && /* @__PURE__ */ React5.createElement(Aviso, { tipo: msg.tipo === "erro" ? void 0 : "ok" }, msg.texto), /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React5.createElement("button", { className: "btn", style: { flex: "1 1 200px" }, onClick: gravar, disabled: gravando || naoGravadas.length === 0 }, gravando ? /* @__PURE__ */ React5.createElement(Loader23, { size: 18, className: "spin" }) : /* @__PURE__ */ React5.createElement(Save3, { size: 18 }), " Gravar ", naoGravadas.length, " avalia\xE7\xE3o(\xF5es)"), confEncerrar ? /* @__PURE__ */ React5.createElement("button", { className: "btn quiet", onClick: encerrar }, naoGravadas.length ? `Encerrar sem gravar ${naoGravadas.length}` : "Confirmar encerrar") : /* @__PURE__ */ React5.createElement("button", { className: "btn quiet", onClick: () => setConfEncerrar(true) }, "Encerrar toque"))));
}

// src/telas/Vacinas.jsx
import React6, { useMemo as useMemo6, useState as useState6 } from "react";
import { Syringe, FileDown as FileDown3, Loader2 as Loader24, Plus as Plus3, Trash2 as Trash23, Save as Save4 } from "lucide-react";
var NIVEL = { atrasada: "atrasada", pendente: "pendente", futura: "ok" };
function Calendario({ dados, onSalvarConfig, onFechar }) {
  const [regras, setRegras] = useState6(() => calendarioVacinas(dados.config));
  const [diasMin, setDiasMin] = useState6(String((dados.config || {}).diasMinPosParto || DIAS_MIN_POS_PARTO_PADRAO));
  const [ok, setOk] = useState6("");
  const mudar = (i, k, v) => setRegras((rs) => rs.map((r, j) => j === i ? { ...r, [k]: v } : r));
  function salvar2() {
    onSalvarConfig({ calendarioVacinas: JSON.stringify(regras.filter((r) => String(r.nome || "").trim())), diasMinPosParto: parseInt(diasMin, 10) || DIAS_MIN_POS_PARTO_PADRAO });
    setOk("Calend\xE1rio salvo.");
  }
  return /* @__PURE__ */ React6.createElement("section", { className: "sheet pad", "data-testid": "calendario-vacinas" }, /* @__PURE__ */ React6.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Calend\xE1rio de vacinas"), regras.map((r, i) => /* @__PURE__ */ React6.createElement("div", { key: r.id, style: { borderBottom: "1px solid var(--line2)", padding: "10px 0" } }, /* @__PURE__ */ React6.createElement("label", { style: { display: "flex", gap: 8, alignItems: "center", fontWeight: 600 } }, /* @__PURE__ */ React6.createElement("input", { type: "checkbox", checked: r.ativo !== false, onChange: (e) => mudar(i, "ativo", e.target.checked), style: { width: 20, minHeight: 20 } }), r.tipo === "periodo" ? /* @__PURE__ */ React6.createElement("input", { "aria-label": "Nome da vacina", value: r.nome, onChange: (e) => mudar(i, "nome", e.target.value) }) : r.nome), /* @__PURE__ */ React6.createElement("div", { className: "sub", style: { margin: "4px 0 0 28px" } }, r.id === "reprodutiva" && "Matrizes: uma dose por ciclo (depois do parto). Vaca sem registro aparece para confirmar.", r.id === "lepto" && /* @__PURE__ */ React6.createElement(React6.Fragment, null, "Vaca cheia: refor\xE7o aos ", /* @__PURE__ */ React6.createElement("input", { "aria-label": "Meses de prenhez", style: { width: 60, minHeight: 34, display: "inline-block" }, value: r.meses, onChange: (e) => mudar(i, "meses", e.target.value) }), " meses de prenhez (obrigat\xF3rio)."), r.tipo === "idade" && /* @__PURE__ */ React6.createElement(React6.Fragment, null, "Bezerras de ", /* @__PURE__ */ React6.createElement("input", { "aria-label": "Idade m\xEDnima (meses)", style: { width: 54, minHeight: 34, display: "inline-block" }, value: r.idadeMin, onChange: (e) => mudar(i, "idadeMin", e.target.value) }), " a ", /* @__PURE__ */ React6.createElement("input", { "aria-label": "Idade m\xE1xima (meses)", style: { width: 54, minHeight: 34, display: "inline-block" }, value: r.idadeMax, onChange: (e) => mudar(i, "idadeMax", e.target.value) }), " meses, uma vez na vida."), r.tipo === "periodo" && /* @__PURE__ */ React6.createElement("span", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 6 } }, "Para ", /* @__PURE__ */ React6.createElement("select", { "aria-label": "Para quem", value: r.publico, onChange: (e) => mudar(i, "publico", e.target.value), style: { width: "auto", minHeight: 36 } }, /* @__PURE__ */ React6.createElement("option", { value: "matrizes" }, "matrizes"), /* @__PURE__ */ React6.createElement("option", { value: "cheias" }, "vacas cheias"), /* @__PURE__ */ React6.createElement("option", { value: "todos" }, "todas as vacas e novilhas")), "a cada ", /* @__PURE__ */ React6.createElement("input", { "aria-label": "Intervalo em meses", style: { width: 60, minHeight: 34 }, value: r.intervaloMeses, onChange: (e) => mudar(i, "intervaloMeses", e.target.value) }), " meses", /* @__PURE__ */ React6.createElement("button", { type: "button", className: "x-peq", "aria-label": "Tirar esta vacina", onClick: () => setRegras((rs) => rs.filter((_, j) => j !== i)) }, /* @__PURE__ */ React6.createElement(Trash23, { size: 16 })))))), /* @__PURE__ */ React6.createElement("button", { type: "button", className: "btn quiet sm", style: { marginTop: 10 }, onClick: () => setRegras((rs) => [...rs, { id: `v${Date.now()}`, nome: "", tipo: "periodo", publico: "matrizes", intervaloMeses: 12, ativo: true }]) }, /* @__PURE__ */ React6.createElement(Plus3, { size: 15 }), " Vacina peri\xF3dica (ex.: clostridioses, raiva)"), /* @__PURE__ */ React6.createElement("div", { className: "fld", style: { marginTop: 14 } }, /* @__PURE__ */ React6.createElement("label", { htmlFor: "dias-min" }, "Dias m\xEDnimos de parida para entrar no protocolo"), /* @__PURE__ */ React6.createElement("input", { id: "dias-min", type: "number", value: diasMin, onChange: (e) => setDiasMin(e.target.value) })), ok && /* @__PURE__ */ React6.createElement(Aviso, { tipo: "ok" }, ok), /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React6.createElement("button", { className: "btn", onClick: salvar2 }, /* @__PURE__ */ React6.createElement(Save4, { size: 17 }), " Salvar calend\xE1rio"), /* @__PURE__ */ React6.createElement("button", { className: "btn quiet", onClick: onFechar }, "Voltar")));
}
function Vacinas({ dados, hoje, ownerMode, modoTeste, onGravarLote, onSalvarConfig }) {
  const [vacinando, setVacinando] = useState6(null);
  const [calendario, setCalendario] = useState6(false);
  const [conf, setConf] = useState6({});
  const [msg, setMsg] = useState6("");
  const [pdf, setPdf] = useState6(false);
  const [verFuturas, setVerFuturas] = useState6(false);
  const pend = useMemo6(() => pendenciasVacinas(dados, dados.config, hoje), [dados, hoje]);
  const grupos = useMemo6(() => {
    const mp = /* @__PURE__ */ new Map();
    pend.filter((p) => verFuturas || p.nivel !== "futura").forEach((p) => {
      if (!mp.has(p.regra.id)) mp.set(p.regra.id, { regra: p.regra, itens: [] });
      mp.get(p.regra.id).itens.push(p);
    });
    return [...mp.values()];
  }, [pend, verFuturas]);
  if (calendario && ownerMode) return /* @__PURE__ */ React6.createElement(Calendario, { dados, onSalvarConfig, onFechar: () => setCalendario(false) });
  if (vacinando) {
    return /* @__PURE__ */ React6.createElement(ManejoCurral, { key: vacinando.titulo, dados, hoje, itensAvulsos: vacinando.itens, etapa: "Vacina\xE7\xE3o", titulo: vacinando.titulo, aplicacoesIniciais: vacinando.aplicacoes, modoTeste, onGravarLote, onVoltar: () => setVacinando(null) });
  }
  const tipoAplicacao = (regra) => regra.id === "reprodutiva" ? "Vacina reprodutiva" : regra.id === "lepto" ? "Refor\xE7o Lepto" : regra.id === "brucelose" ? "Brucelose" : regra.nome;
  function vacinar(g) {
    setVacinando({
      titulo: `Vacina\xE7\xE3o: ${g.regra.nome}`,
      itens: g.itens.map((p) => ({ id: p.animalId, brinco: p.brinco, linha1: [p.tipo, p.mae ? `m\xE3e ${p.mae}` : ""].filter(Boolean).join(" \xB7 "), linha2: p.situacao })),
      aplicacoes: [{ tipo: tipoAplicacao(g.regra), produto: "" }]
    });
  }
  function vacinacaoAvulsa() {
    const vacas = dados.matrizes.filter((m) => m.status !== "Vendida" && m.status !== "Morta" && (noPlantel(m) || m.categoria === "Novilha")).map((m) => ({ id: m.id, brinco: m.brinco, linha1: [m.categoria, m.lote].filter(Boolean).join(" \xB7 "), linha2: m.status }));
    const crias = listarCrias(dados, hoje).filter((c) => c.ativa && !c.novilha).map((c) => ({ id: `c:${c.id}`, brinco: c.brinco, linha1: c.sexo === "F\xEAmea" ? "Bezerra" : "Bezerro", linha2: `m\xE3e ${c.maeBrinco || "?"}` }));
    setVacinando({ titulo: "Vacina\xE7\xE3o avulsa", itens: [...vacas, ...crias].sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), "pt-BR", { numeric: true })), aplicacoes: [] });
  }
  async function confirmar(p, foi) {
    if (!foi) {
      setConf((c) => ({ ...c, [p.animalId]: void 0 }));
      setMsg(`Vaca ${p.brinco}: continua pendente. Vacine e registre em "Vacinar estes".`);
      return;
    }
    const data = conf[p.animalId] || hoje;
    const ev = manejoConfirmacaoVacina([p.animalId], data);
    const r = await onGravarLote({ estado: { ...dados, eventos: [...dados.eventos, ev] }, eventosParaGravar: [{ tipo: "manejo", evento: ev }], matrizesParaGravar: [], tourosParaGravar: [] }, `vacina confirmada ${p.brinco}`);
    setMsg(r.ok ? `Vaca ${p.brinco}: vacina reprodutiva registrada em ${formatarDataBR(data)}.` : r.msg);
  }
  return /* @__PURE__ */ React6.createElement("section", { "data-testid": "tela-vacinas" }, /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 } }, /* @__PURE__ */ React6.createElement("button", { className: "btn sm", onClick: vacinacaoAvulsa }, /* @__PURE__ */ React6.createElement(Syringe, { size: 15 }), " Vacina\xE7\xE3o avulsa (escolher animais)"), /* @__PURE__ */ React6.createElement("button", { className: "btn ghost sm", disabled: pdf, onClick: async () => {
    setPdf(true);
    try {
      await baixarPDF(relatorioVacinas(dados, dados.config, hoje));
    } catch (e) {
      console.error(e);
    }
    setPdf(false);
  } }, pdf ? /* @__PURE__ */ React6.createElement(Loader24, { size: 15, className: "spin" }) : /* @__PURE__ */ React6.createElement(FileDown3, { size: 15 }), " PDF das pend\xEAncias"), ownerMode && /* @__PURE__ */ React6.createElement("button", { className: "btn quiet sm", onClick: () => setCalendario(true) }, "Calend\xE1rio de vacinas"), /* @__PURE__ */ React6.createElement("button", { className: "btn quiet sm", onClick: () => setVerFuturas((v) => !v) }, verFuturas ? "S\xF3 as de agora" : "Ver tamb\xE9m as pr\xF3ximas")), msg && /* @__PURE__ */ React6.createElement(Aviso, { tipo: "ok", onClose: () => setMsg("") }, msg), grupos.length === 0 && /* @__PURE__ */ React6.createElement("div", { className: "sheet" }, /* @__PURE__ */ React6.createElement("div", { className: "empty" }, "Nenhuma vacina pendente agora.")), grupos.map((g) => /* @__PURE__ */ React6.createElement("div", { className: "grp-vac", key: g.regra.id, "data-testid": `grupo-${g.regra.id}` }, /* @__PURE__ */ React6.createElement("header", null, /* @__PURE__ */ React6.createElement("b", null, g.regra.nome, /* @__PURE__ */ React6.createElement("span", { className: "mut", style: { fontSize: 13, fontWeight: 500 } }, " \xB7 ", g.itens.length, " animal(is)")), /* @__PURE__ */ React6.createElement("button", { className: "btn sm", onClick: () => vacinar(g) }, /* @__PURE__ */ React6.createElement(Syringe, { size: 15 }), " Vacinar estes")), g.itens.map((p) => /* @__PURE__ */ React6.createElement("div", { key: `${g.regra.id}-${p.animalId}`, className: "led-r", style: { "--cols": "72px minmax(0,1fr)", minHeight: 54 } }, /* @__PURE__ */ React6.createElement("span", { className: "b" }, p.brinco), /* @__PURE__ */ React6.createElement("span", { className: "two" }, /* @__PURE__ */ React6.createElement("b", { style: { fontSize: 14 } }, [p.tipo, p.status].filter(Boolean).join(" \xB7 ")), /* @__PURE__ */ React6.createElement("span", { className: `vac-tag ${NIVEL[p.nivel]}`, style: { whiteSpace: "normal" } }, p.situacao), p.confirmar && /* @__PURE__ */ React6.createElement("span", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 6, color: "var(--tx)" } }, "Foi vacinada?", /* @__PURE__ */ React6.createElement("input", { type: "date", "aria-label": `Data da vacina da ${p.brinco}`, value: conf[p.animalId] || hoje, onChange: (e) => setConf((c) => ({ ...c, [p.animalId]: e.target.value })), style: { width: "auto", minHeight: 34 } }), /* @__PURE__ */ React6.createElement("button", { className: "btn sm", style: { minHeight: 34 }, onClick: () => confirmar(p, true) }, "Sim"), /* @__PURE__ */ React6.createElement("button", { className: "btn quiet sm", style: { minHeight: 34 }, onClick: () => confirmar(p, false) }, "N\xE3o"))))))));
}

// src/telas/ManejoGeral.jsx
import React7, { useEffect as useEffect4, useMemo as useMemo7, useState as useState7 } from "react";
import { Save as Save5, Loader2 as Loader25, FileDown as FileDown4, Plus as Plus4, X as X2, Check as Check3, ArrowLeft as ArrowLeft3, ClipboardCheck } from "lucide-react";
var CHAVE2 = "rascunho-manejo-geral-v1";
var OUTRO = "__outro__";
var vazio = (hoje) => ({ data: hoje, lote: "", loteDigitado: "", descricao: "", responsavel: "", aplicacoes: [], incluirCrias: null, marcados: [], fora: [], aprovar: [], obs: "" });
function Conferencia({ dados, manejoId, msg, onVoltar }) {
  const rel = useMemo7(() => relatorioConferencia(dados, manejoId), [dados, manejoId]);
  const e = dados.eventos.find((x) => x.id === manejoId);
  const rep = useMemo7(() => e ? faltasRepetidas(dados, e.lote) : [], [dados, e]);
  const [pdf, setPdf] = useState7(false);
  return /* @__PURE__ */ React7.createElement("section", { className: "sheet pad", "data-testid": "conferencia" }, /* @__PURE__ */ React7.createElement("button", { className: "btn quiet sm", onClick: onVoltar, style: { marginBottom: 10 } }, /* @__PURE__ */ React7.createElement(ArrowLeft3, { size: 15 }), " Voltar"), msg && /* @__PURE__ */ React7.createElement(Aviso, { tipo: "ok" }, msg), /* @__PURE__ */ React7.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rel.titulo), rel.subtitulo && /* @__PURE__ */ React7.createElement("p", { className: "sub", style: { marginTop: 0 } }, rel.subtitulo), /* @__PURE__ */ React7.createElement(Kpis, { itens: rel.resumo }), rep.length > 0 && /* @__PURE__ */ React7.createElement(Aviso, null, "Faltaram tamb\xE9m no manejo anterior deste lote: ", /* @__PURE__ */ React7.createElement("b", null, rep.map((x) => x.brinco).join(", ")), ". Vale procurar."), /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" } }, /* @__PURE__ */ React7.createElement("button", { className: "btn ghost sm", disabled: pdf, onClick: async () => {
    setPdf(true);
    try {
      await baixarPDF(rel);
    } catch (err) {
      console.error(err);
    }
    setPdf(false);
  } }, pdf ? /* @__PURE__ */ React7.createElement(Loader25, { size: 15, className: "spin" }) : /* @__PURE__ */ React7.createElement(FileDown4, { size: 15 }), " PDF da confer\xEAncia")), rel.secoes.filter((s) => s.linhas.length).map((s) => /* @__PURE__ */ React7.createElement(SecaoRelatorio, { key: s.titulo, secao: s })));
}
function PendenciasLote({ dados, onDecidirLote }) {
  const pend = useMemo7(() => pendenciasLote(dados), [dados]);
  const [msg, setMsg] = useState7("");
  if (!pend.length && !msg) return null;
  const decidir = (itens2, aprovar) => {
    const r = onDecidirLote(itens2.map((p) => ({ manejoId: p.manejoId, animal: p.animal, aprovar })));
    setMsg(r || "");
  };
  return /* @__PURE__ */ React7.createElement("section", { className: "sheet pad", "data-testid": "pendencias-lote", style: { marginBottom: 12 } }, /* @__PURE__ */ React7.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Mudan\xE7as de lote para confirmar", /* @__PURE__ */ React7.createElement("small", null, pend.length)), msg && /* @__PURE__ */ React7.createElement(Aviso, { tipo: "ok", onClose: () => setMsg("") }, msg), pend.map((p) => /* @__PURE__ */ React7.createElement("div", { key: `${p.manejoId}-${p.animal}`, className: "pend-lote", "data-testid": `pend-${p.brinco}` }, /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement("b", { className: "b" }, p.brinco), /* @__PURE__ */ React7.createElement("div", { className: "l2" }, p.de || "sem lote", " \u2192 ", /* @__PURE__ */ React7.createElement("b", null, p.para)), /* @__PURE__ */ React7.createElement("div", { className: "l3" }, formatarDataBR(p.data), " \xB7 ", p.descricao, p.responsavel ? ` \xB7 ${p.responsavel}` : "")), /* @__PURE__ */ React7.createElement("div", { className: "pend-bts" }, /* @__PURE__ */ React7.createElement("button", { className: "btn sm", onClick: () => decidir([p], true), "aria-label": `Confirmar mudan\xE7a de lote da ${p.brinco}` }, /* @__PURE__ */ React7.createElement(Check3, { size: 15 }), " Mudar"), /* @__PURE__ */ React7.createElement("button", { className: "btn quiet sm", onClick: () => decidir([p], false), "aria-label": `Recusar mudan\xE7a de lote da ${p.brinco}` }, /* @__PURE__ */ React7.createElement(X2, { size: 15 }), " N\xE3o")))), pend.length > 1 && /* @__PURE__ */ React7.createElement("button", { className: "btn ghost sm", style: { marginTop: 10 }, onClick: () => decidir(pend, true) }, "Confirmar todas (", pend.length, ")"));
}
function ManejoGeral({ dados, hoje, ownerMode, modoTeste, scriptDesatualizado, onGravarLote, onDecidirLote }) {
  const [f, setF] = useState7(() => ({ ...vazio(hoje), ...lerLocal(CHAVE2, null) || {} }));
  const [tela, setTela] = useState7(() => lerLocal(CHAVE2, null) ? "form" : "inicio");
  const [ver, setVer] = useState7(null);
  const [erro, setErro] = useState7("");
  const [gravando, setGravando] = useState7(false);
  useEffect4(() => {
    if (tela === "form") gravarNoCelular(CHAVE2, f);
  }, [f, tela]);
  const set = (k, v) => {
    setErro("");
    setF((x) => ({ ...x, [k]: v }));
  };
  const lotes = useMemo7(() => lotesParaManejo(dados), [dados]);
  const lote = f.lote === OUTRO ? padronizarLote(f.loteDigitado, dados.matrizes) : f.lote;
  const comCrias = !!lote && temCriasAoPe(dados, lote, hoje);
  const incluirCrias = f.incluirCrias === null ? comCrias : f.incluirCrias && comCrias;
  const itens2 = useMemo7(() => animaisDoLote(dados, lote, { hoje, incluirCrias }), [dados, lote, hoje, incluirCrias]);
  const marcados = useMemo7(() => new Set(f.marcados), [f.marcados]);
  const feitos = useMemo7(() => listarManejosGerais(dados), [dados]);
  if (ver) return /* @__PURE__ */ React7.createElement(Conferencia, { dados, manejoId: ver.id, msg: ver.msg, onVoltar: () => setVer(null) });
  if (tela === "inicio") {
    return /* @__PURE__ */ React7.createElement(React7.Fragment, null, ownerMode && /* @__PURE__ */ React7.createElement(PendenciasLote, { dados, onDecidirLote }), /* @__PURE__ */ React7.createElement("section", { className: "sheet pad", "data-testid": "geral-inicio" }, /* @__PURE__ */ React7.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Manejo geral"), /* @__PURE__ */ React7.createElement("p", { className: "sub", style: { marginTop: 0 } }, "Pour-on, brinco mosquicida, verm\xEDfugo, vacina ou s\xF3 confer\xEAncia. Escolha o lote, marque quem passou no curral e o app mostra quem faltou e quem veio de outro lote."), scriptDesatualizado && /* @__PURE__ */ React7.createElement(Aviso, null, "A planilha ainda n\xE3o aceita o manejo geral (precisa do script 13). ", ownerMode ? "Implante a vers\xE3o nova do script." : "Avise o propriet\xE1rio."), /* @__PURE__ */ React7.createElement("button", { className: "btn wide", onClick: () => {
      setF(vazio(hoje));
      setTela("form");
    }, disabled: scriptDesatualizado }, /* @__PURE__ */ React7.createElement(Plus4, { size: 17 }), " Novo manejo"), feitos.length > 0 && /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Manejos feitos", /* @__PURE__ */ React7.createElement("small", null, feitos.length)), feitos.slice(0, 30).map((c) => /* @__PURE__ */ React7.createElement("button", { key: c.id, className: "card-prot", onClick: () => setVer({ id: c.id }), "data-testid": `manejo-${c.id}` }, /* @__PURE__ */ React7.createElement("b", null, formatarDataBR(c.data), " \xB7 ", c.descricao), /* @__PURE__ */ React7.createElement("div", { className: "l2" }, "Lote ", c.lote, " \xB7 ", c.conferidos.length, " de ", c.esperados, " conferidos", c.faltando.length ? ` \xB7 ${c.faltando.length} faltando` : "", c.fora.length ? ` \xB7 ${c.fora.length} de fora` : "", c.responsavel ? ` \xB7 ${c.responsavel}` : ""))))));
  }
  function toggle(id) {
    set("marcados", marcados.has(id) ? f.marcados.filter((x) => x !== id) : [...f.marcados, id]);
  }
  function digitarFora(brinco) {
    if (!lote) return "Escolha o lote primeiro.";
    const b = String(brinco).trim();
    if (f.fora.some((x) => x.brinco === b)) return `${b} j\xE1 est\xE1 na lista de fora do lote.`;
    const r = animalForaDoLote(dados, lote, b, hoje);
    setF((x) => ({ ...x, fora: [...x.fora, r], aprovar: r.mudar === "pendente" ? [...x.aprovar, r.animal] : x.aprovar }));
    return `Aten\xE7\xE3o: ${b}. ${r.obs}. Inclu\xEDdo com essa observa\xE7\xE3o.`;
  }
  function rapido(m) {
    const ja = f.descricao.trim();
    const desc = ja.toLowerCase().includes(m.rotulo.toLowerCase()) ? ja : ja ? `${ja} + ${m.rotulo}` : m.rotulo;
    const aps = m.aplicacao && !f.aplicacoes.some((a) => a.tipo === m.aplicacao) ? [...f.aplicacoes, { tipo: m.aplicacao, produto: "" }] : f.aplicacoes;
    setF((x) => ({ ...x, descricao: desc, aplicacoes: aps }));
  }
  async function gravar() {
    if (gravando) return;
    const r = aplicarManejoGeral(dados, {
      data: f.data,
      lote,
      descricao: f.descricao,
      responsavel: f.responsavel,
      aplicacoes: f.aplicacoes,
      esperados: itens2.map((x) => x.id),
      marcados: f.marcados,
      fora: f.fora,
      observacoes: f.obs,
      incluirCrias,
      dono: ownerMode,
      aprovar: f.aprovar
    });
    if (r.erros && r.erros.length) {
      setErro(r.erros.join(" "));
      return;
    }
    setGravando(true);
    const e = r.eventosNovos[0];
    const res = await onGravarLote(
      { estado: r.estado, eventosParaGravar: [{ tipo: "manejo", evento: e }], matrizesParaGravar: r.matrizesAlteradas, tourosParaGravar: [] },
      `manejo ${f.descricao}: lote ${lote}`
    );
    setGravando(false);
    if (!res.ok) {
      setErro(res.msg);
      return;
    }
    apagarLocal(CHAVE2);
    const pend = r.eventosNovos[0] ? JSON.parse(e.foraDoLote).filter((x) => x.mudar === "pendente").length : 0;
    const msg = [
      "Manejo gravado.",
      r.matrizesAlteradas.length ? `${r.matrizesAlteradas.length} animal(is) mudado(s) para o lote ${lote}.` : "",
      pend ? `${pend} mudan\xE7a(s) de lote esperando o propriet\xE1rio confirmar.` : "",
      res.offline ? "Sem internet: ficou no celular e vai para a planilha quando a internet voltar." : "",
      modoTeste ? "(modo teste: s\xF3 na tela)" : ""
    ].filter(Boolean).join(" ");
    setF(vazio(hoje));
    setTela("inicio");
    setVer({ id: e.id, msg });
  }
  const nMarc = itens2.filter((x) => marcados.has(x.id)).length;
  const total = nMarc + f.fora.length;
  return /* @__PURE__ */ React7.createElement("section", { className: "sheet pad", "data-testid": "geral-form" }, /* @__PURE__ */ React7.createElement("button", { className: "btn quiet sm", onClick: () => setTela("inicio"), style: { marginBottom: 10 } }, /* @__PURE__ */ React7.createElement(ArrowLeft3, { size: 15 }), " Voltar (o rascunho fica guardado)"), /* @__PURE__ */ React7.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Novo manejo"), scriptDesatualizado && /* @__PURE__ */ React7.createElement(Aviso, null, "A planilha ainda n\xE3o aceita o manejo geral (precisa do script 13)."), /* @__PURE__ */ React7.createElement("div", { className: "grid2" }, /* @__PURE__ */ React7.createElement("div", { className: "fld" }, /* @__PURE__ */ React7.createElement("label", { htmlFor: "mg-data" }, "Data"), /* @__PURE__ */ React7.createElement("input", { id: "mg-data", type: "date", value: f.data, onChange: (e) => set("data", e.target.value) })), /* @__PURE__ */ React7.createElement("div", { className: "fld" }, /* @__PURE__ */ React7.createElement("label", { htmlFor: "mg-lote" }, "Lote"), /* @__PURE__ */ React7.createElement("select", { id: "mg-lote", value: f.lote, onChange: (e) => setF((x) => ({ ...x, lote: e.target.value, marcados: [], fora: [], aprovar: [], incluirCrias: null })) }, /* @__PURE__ */ React7.createElement("option", { value: "" }, "Escolha o lote"), lotes.map((l) => /* @__PURE__ */ React7.createElement("option", { key: l.lote, value: l.lote }, l.lote, " (", l.n, ")")), /* @__PURE__ */ React7.createElement("option", { value: OUTRO }, "Outro lote (digitar)")))), f.lote === OUTRO && /* @__PURE__ */ React7.createElement("div", { className: "fld" }, /* @__PURE__ */ React7.createElement("label", { htmlFor: "mg-lote-novo" }, "Nome do lote"), /* @__PURE__ */ React7.createElement("input", { id: "mg-lote-novo", value: f.loteDigitado, onChange: (e) => setF((x) => ({ ...x, loteDigitado: e.target.value, marcados: [], fora: [], aprovar: [] })), placeholder: "Ex.: Pasto da grota" })), /* @__PURE__ */ React7.createElement("div", { className: "fld" }, /* @__PURE__ */ React7.createElement("label", { htmlFor: "mg-desc" }, "Manejo (o que est\xE1 sendo feito)"), /* @__PURE__ */ React7.createElement("div", { className: "pills", style: { marginTop: 0 } }, MANEJOS_RAPIDOS.map((m) => /* @__PURE__ */ React7.createElement("button", { key: m.rotulo, type: "button", "aria-pressed": f.descricao.toLowerCase().includes(m.rotulo.toLowerCase()), onClick: () => rapido(m) }, m.rotulo))), /* @__PURE__ */ React7.createElement("input", { id: "mg-desc", value: f.descricao, onChange: (e) => set("descricao", e.target.value), placeholder: "Ex.: Pour-on no lombo e confer\xEAncia" })), /* @__PURE__ */ React7.createElement("div", { className: "fld" }, /* @__PURE__ */ React7.createElement("label", { htmlFor: "mg-resp" }, "Respons\xE1vel"), /* @__PURE__ */ React7.createElement("input", { id: "mg-resp", value: f.responsavel, onChange: (e) => set("responsavel", e.target.value) })), /* @__PURE__ */ React7.createElement(AplicacoesEditor, { valor: f.aplicacoes, onChange: (a) => set("aplicacoes", a) }), lote && /* @__PURE__ */ React7.createElement(React7.Fragment, null, comCrias && /* @__PURE__ */ React7.createElement("label", { className: "chk", style: { display: "flex", gap: 8, alignItems: "center", margin: "4px 0 10px" } }, /* @__PURE__ */ React7.createElement("input", { type: "checkbox", checked: incluirCrias, onChange: (e) => set("incluirCrias", e.target.checked), "data-testid": "incluir-crias" }), "Incluir as crias ao p\xE9 (bezerros mamando das vacas deste lote)"), /* @__PURE__ */ React7.createElement(Rotulo, null, "Animais do lote ", lote, ": toque em quem passou"), itens2.length === 0 && /* @__PURE__ */ React7.createElement("p", { className: "sub" }, 'Nenhum animal cadastrado neste lote. Digite os brincos que passarem: eles entram como "de fora" e podem mudar para este lote.'), /* @__PURE__ */ React7.createElement(ListaMarcar, { itens: itens2, marcados, onToggle: toggle, onDigitarFora: digitarFora, rotuloContador: "conferidos" }), f.fora.length > 0 && /* @__PURE__ */ React7.createElement("div", { className: "fora-lote", "data-testid": "fora-lote" }, /* @__PURE__ */ React7.createElement(Rotulo, null, "De outro lote ou sem cadastro (", f.fora.length, ")"), f.fora.map((x, i) => /* @__PURE__ */ React7.createElement("div", { key: x.brinco, className: "fora-lin" }, /* @__PURE__ */ React7.createElement("div", { className: "fora-top" }, /* @__PURE__ */ React7.createElement("b", { className: "b" }, x.brinco), /* @__PURE__ */ React7.createElement("span", { className: "late" }, x.obs), /* @__PURE__ */ React7.createElement("button", { type: "button", className: "x-peq", "aria-label": `Tirar ${x.brinco}`, onClick: () => setF((s) => ({ ...s, fora: s.fora.filter((_, j) => j !== i), aprovar: s.aprovar.filter((a) => a !== x.animal) })) }, /* @__PURE__ */ React7.createElement(X2, { size: 16 }))), x.mudar === "pendente" && (ownerMode ? /* @__PURE__ */ React7.createElement("label", { className: "chk", style: { display: "flex", gap: 8, alignItems: "center", fontSize: 14 } }, /* @__PURE__ */ React7.createElement(
    "input",
    {
      type: "checkbox",
      checked: f.aprovar.includes(x.animal),
      "aria-label": `Mudar ${x.brinco} para o lote ${lote}`,
      onChange: (e) => set("aprovar", e.target.checked ? [...f.aprovar, x.animal] : f.aprovar.filter((a) => a !== x.animal))
    }
  ), "Mudar para o lote ", lote) : /* @__PURE__ */ React7.createElement("div", { className: "sub", style: { fontSize: 13 } }, "A mudan\xE7a para o lote ", lote, " vai para o propriet\xE1rio confirmar.")))))), /* @__PURE__ */ React7.createElement("div", { className: "fld", style: { marginTop: 12 } }, /* @__PURE__ */ React7.createElement("label", { htmlFor: "mg-obs" }, "Observa\xE7\xE3o"), /* @__PURE__ */ React7.createElement("input", { id: "mg-obs", value: f.obs, onChange: (e) => set("obs", e.target.value) })), erro && /* @__PURE__ */ React7.createElement(Aviso, null, erro), /* @__PURE__ */ React7.createElement("button", { className: "btn wide", style: { marginTop: 8 }, onClick: gravar, disabled: gravando || total === 0 || scriptDesatualizado }, gravando ? /* @__PURE__ */ React7.createElement(Loader25, { size: 18, className: "spin" }) : /* @__PURE__ */ React7.createElement(Save5, { size: 18 }), " Gravar manejo (", nMarc, " de ", itens2.length, f.fora.length ? ` + ${f.fora.length} de fora` : "", ")"), lote && itens2.length > nMarc && nMarc > 0 && /* @__PURE__ */ React7.createElement("p", { className: "sub", style: { textAlign: "center" } }, /* @__PURE__ */ React7.createElement(ClipboardCheck, { size: 14, style: { verticalAlign: -2 } }), " ", itens2.length - nMarc, " ainda n\xE3o marcado(s): ao gravar, entram como faltando."));
}

// src/telas/Manejo.jsx
function Manejo({ dados, hoje, ownerMode, modoTeste, onGravarLote, onSalvarProtocolo, onSalvarConfig, scriptAntes13, onDecidirLote }) {
  const [aba, setAba] = useState8("protocolos");
  const [novo, setNovo] = useState8(null);
  const [volta, setVolta] = useState8(0);
  const pend = pendenciasVacinas(dados, dados.config, hoje).filter((p) => p.nivel !== "futura").length;
  const ativos2 = (dados.protocolos || []).filter((p) => p.status !== "Encerrado").length;
  const pendLote = ownerMode ? pendenciasLote(dados).length : 0;
  return /* @__PURE__ */ React8.createElement("div", { className: "wrap" }, /* @__PURE__ */ React8.createElement("div", { className: "head" }, /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("small", null, "Curral"), /* @__PURE__ */ React8.createElement("h1", null, "Manejo"))), /* @__PURE__ */ React8.createElement(
    IndexTabs,
    {
      rotulo: "Manejo",
      value: aba,
      onChange: (a) => {
        setAba(a);
        setVolta((n) => n + 1);
      },
      tabs: [{ id: "protocolos", label: "Protocolos", count: ativos2 }, { id: "toque", label: "Toque" }, { id: "vacinas", label: "Vacinas", count: pend }, { id: "geral", label: "Geral", count: pendLote || void 0 }]
    }
  ), aba === "protocolos" && /* @__PURE__ */ React8.createElement(Protocolos, { key: `p${volta}`, dados, hoje, ownerMode, modoTeste, onSalvarProtocolo, onGravarLote, abrirNovo: novo, onNovoConsumido: () => setNovo(null) }), aba === "toque" && /* @__PURE__ */ React8.createElement(
    Toque,
    {
      key: `t${volta}`,
      dados,
      hoje,
      ownerMode,
      modoTeste,
      onGravarLote,
      onMontarProtocolo: (ids) => {
        setNovo({ tipo: "IATF", animais: ids, nome: "" });
        setAba("protocolos");
        setVolta((n) => n + 1);
      }
    }
  ), aba === "geral" && /* @__PURE__ */ React8.createElement(ManejoGeral, { key: `g${volta}`, dados, hoje, ownerMode, modoTeste, scriptDesatualizado: !!scriptAntes13, onGravarLote, onDecidirLote }), aba === "vacinas" && /* @__PURE__ */ React8.createElement(Vacinas, { key: `v${volta}`, dados, hoje, ownerMode, modoTeste, onGravarLote, onSalvarConfig }));
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
.apl-lin{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 40px;gap:8px;align-items:center;margin-bottom:8px}
.apl-lin select,.apl-lin input{min-height:44px}
.contador{font:600 13px var(--mono);letter-spacing:.04em;color:var(--amber);text-transform:uppercase;margin-top:6px}
.marcar{border:1px solid var(--line);border-radius:8px;overflow:hidden;margin-top:10px;background:var(--s1)}
.marca-lin{border-bottom:1px solid var(--line2);border-left:4px solid transparent}
.marca-lin.on{border-left-color:var(--green);background:rgba(141,187,120,.08)}
.marca-bt{display:grid;grid-template-columns:32px 80px minmax(0,1fr);gap:10px;align-items:center;width:100%;min-height:58px;padding:6px 12px;background:transparent;border:none;color:inherit;text-align:left}
.marca-bt .caixa{width:28px;height:28px;border-radius:6px;border:2px solid var(--line);display:grid;place-items:center;color:#1B140A}
.marca-lin.on .caixa{background:var(--green);border-color:var(--green)}
.marca-bt .b{font:600 18px var(--mono)}
.marca-bt .two{display:flex;flex-direction:column;line-height:1.3;min-width:0}
.marca-bt .two b{font-size:14.5px;font-weight:600}
.marca-bt .two span{font-size:12.5px;color:var(--mut)}
.marca-bt .two span.late{color:var(--late)}
.marca-extra{padding:0 12px 10px 56px}
.marca-extra select{min-height:40px}
.pills{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
.pills button{min-height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--line);background:var(--bg);color:var(--tx);font:600 13px var(--body)}
.pills button[aria-pressed=true]{border-color:var(--amber);color:var(--amber);background:var(--amber-bg)}
.toque-lin{border-bottom:1px solid var(--line2);padding:10px 14px;border-left:4px solid transparent}
.toque-lin.cheia{border-left-color:var(--green)}
.toque-lin.vazia{border-left-color:var(--amber)}
.toque-lin.descarte{border-left-color:var(--late)}
.toque-lin.ausente{opacity:.6}
.toque-lin .cab{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.toque-lin .cab .b{font:600 22px var(--mono)}
.toque-lin .info{font-size:12.8px;color:var(--mut);line-height:1.45;margin-top:2px}
.toque-lin .info b{color:var(--tx);font-weight:600}
.res-bts{display:grid;grid-template-columns:repeat(auto-fit,minmax(78px,1fr));gap:6px;margin-top:8px}
.res-bts button{min-height:46px;border-radius:6px;border:1.5px solid var(--line);background:var(--bg);color:var(--tx);font:700 14px var(--body)}
.res-bts button.cheia[aria-pressed=true]{background:var(--green);border-color:var(--green);color:#10200F}
.res-bts button.vazia[aria-pressed=true]{background:var(--amber);border-color:var(--amber);color:#1B140A}
.res-bts button.descarte[aria-pressed=true]{background:var(--late);border-color:var(--late);color:#250C06}
.res-bts button.aus[aria-pressed=true]{background:var(--s2);border-color:var(--mut)}
.toque-lin .mais{display:grid;grid-template-columns:110px minmax(0,1fr);gap:8px;margin-top:8px;align-items:center}
.toque-lin .mais input,.toque-lin .mais select{min-height:42px}
.toque-lin .calc{font-size:12.8px;color:var(--green);margin-top:6px;line-height:1.4}
.toque-lin .avs{font-size:12.8px;color:var(--late);margin-top:6px}
.pend-lote{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line2)}
.pend-lote .b{font:600 17px var(--mono)}
.pend-lote .l2{font-size:14px;margin-top:2px}
.pend-lote .l3{font-size:12.5px;color:var(--mut);margin-top:2px}
.pend-bts{display:flex;gap:6px;flex:none}
.fora-lote{margin-top:14px;padding:10px 12px;border:1px solid var(--late);border-radius:8px;background:var(--late-bg)}
.fora-lin{padding:6px 0;border-bottom:1px solid var(--line2)}
.fora-lin:last-child{border-bottom:none}
.fora-top{display:grid;grid-template-columns:70px minmax(0,1fr) 32px;gap:8px;align-items:center}
.fora-top .b{font:600 16px var(--mono)}
.fora-top .late{font-size:13.5px}
.chk input{width:20px;height:20px;accent-color:var(--amber)}
.card-prot{display:block;width:100%;text-align:left;background:var(--s1);border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin-bottom:10px;color:inherit}
.card-prot b{font:600 17px var(--body)}
.card-prot .l2{font-size:13px;color:var(--mut);margin-top:3px;line-height:1.45}
.card-prot .prox{font:600 12.5px var(--mono);color:var(--amber);margin-top:6px;text-transform:uppercase;letter-spacing:.04em}
.manejo-lin{display:grid;grid-template-columns:62px 92px minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line2);font-size:14px}
.manejo-lin .d{font:600 15px var(--mono);color:var(--amber)}
.manejo-ed{display:grid;grid-template-columns:76px minmax(0,1fr) 40px;gap:6px;align-items:start;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--line2)}
.manejo-ed>div{grid-column:1/-1;grid-row:2}
.manejo-ed input,.manejo-ed textarea{min-height:42px}
.manejo-ed textarea{grid-column:3/4;min-height:42px}
.vac-tag{display:inline-block;font:600 11.5px var(--body);padding:2px 7px;border-radius:4px;margin-top:4px}
.vac-tag.ok{background:rgba(141,187,120,.15);color:var(--green)}
.vac-tag.pendente{background:var(--amber-bg);color:var(--amber)}
.vac-tag.atrasada{background:var(--late-bg);color:var(--late)}
.grp-vac{border:1px solid var(--line);border-radius:8px;margin-bottom:14px;overflow:hidden;background:var(--s1)}
.grp-vac>header{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;background:var(--s2);flex-wrap:wrap}
.grp-vac>header b{font:600 16px var(--body)}



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
.toque-lin input,.toque-lin select,.apl-lin input,.apl-lin select,.manejo-ed input,.marca-extra select,.grp-vac input,.grp-vac select,.vac-conf input,.detalhe input[type=date],[data-testid=calendario-vacinas] input:not([type=checkbox]),[data-testid=calendario-vacinas] select{width:100%;padding:8px 10px;border-radius:6px;border:1px solid var(--line);background:var(--bg);font-size:16px;color:var(--tx)}
.grp-vac input[type=date],.detalhe input[type=date]{width:auto;font-family:var(--mono);font-size:14px}
.vac-tag.ok{background:rgba(141,187,120,.15)!important;color:var(--green)!important}
.vac-tag.pendente{background:var(--amber-bg)!important;color:var(--amber)!important}
.vac-tag.atrasada{background:var(--late-bg)!important;color:var(--late)!important}
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

.cols-reb{--cols:70px minmax(0,1fr) 74px 50px}
@media (min-width:700px){.cols-reb{--cols:90px minmax(0,1fr) 120px 100px}}
.led-r.cols-reb{padding-top:9px;padding-bottom:9px}
.reb-lista{display:flex;flex-direction:column;font:500 12px/17px var(--mono);white-space:nowrap}
.led-r .reb-lista.r{align-items:flex-end;font:600 12px/17px var(--mono)}
.reb-lista .mut{font-weight:400}
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
  morte: "Morte",
  manejo: "Manejo"
};
var rotuloEvento = (tipo) => (TIPOS_EVENTO.find((t) => t.id === tipo) || {}).label || tipo;
var ORDEM_LANCAR = ["nascimento", "morte", "desmama", "descarte", "insumo", "iatf", "diagnostico", "recria", "cadastro"];
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
  } else if (e.tipo === "manejo" && e.etapa === "Geral") {
    if (e.descricao) partes.push(e.descricao);
    if (e.lote) partes.push(`lote ${e.lote}`);
    const n = String(e.presentes || "").split(",").filter(Boolean).length;
    if (n) partes.push(`${n} animal(is)`);
  } else if (e.tipo === "manejo") {
    if (e.etapa) partes.push(e.etapa);
    const n = String(e.presentes || "").split(",").filter(Boolean).length;
    if (n) partes.push(`${n} animal(is)`);
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
import React13, { useState as useState12, useEffect as useEffect6, useMemo as useMemo10, useRef as useRef5 } from "react";
import { Save as Save8, Check as Check5, Loader2 as Loader29 } from "lucide-react";

// src/telas/FichaRapida.jsx
import React9 from "react";
function FichaRapida({ ficha, digitado, ocultarSemPeso }) {
  if (!digitado || !String(digitado).trim()) return null;
  if (!ficha || !ficha.achado) {
    if (String(digitado).trim().length < 3) return null;
    return /* @__PURE__ */ React9.createElement("div", { className: "ficha-rapida ruim", "data-testid": "ficha-rapida", role: "status" }, "Brinco ", String(digitado).trim(), " n\xE3o encontrado (cria ou novilha). Confira o n\xFAmero.");
  }
  if (ficha.jaMorto) {
    return /* @__PURE__ */ React9.createElement("div", { className: "ficha-rapida ruim", "data-testid": "ficha-rapida", role: "status" }, /* @__PURE__ */ React9.createElement("b", null, ficha.brinco), " \xB7 Este animal morreu", ficha.mortoEm ? ` em ${formatarDataBR(ficha.mortoEm)}` : "", ". N\xE3o d\xE1 para pesar.");
  }
  if (ficha.jaVendido) {
    return /* @__PURE__ */ React9.createElement("div", { className: "ficha-rapida ruim", "data-testid": "ficha-rapida", role: "status" }, /* @__PURE__ */ React9.createElement("b", null, ficha.brinco), " \xB7 Este animal j\xE1 foi vendido", ficha.vendidoEm ? ` em ${formatarDataBR(ficha.vendidoEm)}` : "", ".");
  }
  const tipo = ficha.categoria && ficha.categoria !== "Cria" ? ficha.categoria : ficha.sexo === "F\xEAmea" ? "Bezerra" : ficha.sexo === "Macho" ? "Bezerro" : "Cria";
  return /* @__PURE__ */ React9.createElement("div", { className: `ficha-rapida${ficha.mesmaData && ficha.mesmaData.length ? " atencao" : ""}`, "data-testid": "ficha-rapida", role: "status" }, /* @__PURE__ */ React9.createElement("div", null, /* @__PURE__ */ React9.createElement("b", null, ficha.brinco), " \xB7 ", tipo, ficha.sexo && tipo !== "Bezerro" && tipo !== "Bezerra" ? ` \xB7 ${ficha.sexo}` : ""), /* @__PURE__ */ React9.createElement("div", { className: "lin" }, /* @__PURE__ */ React9.createElement("span", null, "Idade ", /* @__PURE__ */ React9.createElement("b", null, ficha.idade ? ficha.idade.texto : "?")), /* @__PURE__ */ React9.createElement("span", null, "Nasceu ", /* @__PURE__ */ React9.createElement("b", null, ficha.nascData ? formatarDataBR(ficha.nascData) : "?")), /* @__PURE__ */ React9.createElement("span", null, "M\xE3e ", /* @__PURE__ */ React9.createElement("b", null, ficha.maeBrinco || "\u2014"))), !ocultarSemPeso && /* @__PURE__ */ React9.createElement("div", { className: "lin" }, ficha.ultimoPeso ? /* @__PURE__ */ React9.createElement("span", null, "\xDAltimo peso ", /* @__PURE__ */ React9.createElement("b", null, fmtKg(ficha.ultimoPeso.peso)), " em ", formatarDataBR(ficha.ultimoPeso.data)) : /* @__PURE__ */ React9.createElement("span", null, /* @__PURE__ */ React9.createElement("b", null, "Ainda n\xE3o foi pesado")), ficha.desmamaData ? /* @__PURE__ */ React9.createElement("span", null, "Desmama em ", /* @__PURE__ */ React9.createElement("b", null, formatarDataBR(ficha.desmamaData))) : null));
}

// src/telas/Lote.jsx
import React10, { useState as useState9 } from "react";
import { ClipboardPaste, Check as Check4, Loader2 as Loader26 } from "lucide-react";
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
  const [texto, setTexto] = useState9("");
  const [erro, setErro] = useState9("");
  const [prev, setPrev] = useState9(null);
  const [gravando, setGravando] = useState9(false);
  const [feito, setFeito] = useState9("");
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
  return /* @__PURE__ */ React10.createElement("div", null, /* @__PURE__ */ React10.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Lote por foto"), /* @__PURE__ */ React10.createElement("p", { className: "sub" }, "Tire a foto da folha do manejo e mande para o Claude no chat. Ele devolve um bloco de texto com os lan\xE7amentos. Cole aqui, confira o que vai mudar em cada vaca e s\xF3 ent\xE3o grave."), /* @__PURE__ */ React10.createElement("div", { className: "fld" }, /* @__PURE__ */ React10.createElement("label", { htmlFor: "lote-texto" }, "Bloco de lan\xE7amentos"), /* @__PURE__ */ React10.createElement("textarea", { id: "lote-texto", value: texto, onChange: (e) => setTexto(e.target.value), placeholder: '[ { "tipo": "nascimento", "matriz": "3012", "data": "10/10/26", "sexo": "F" } ]', spellCheck: false })), /* @__PURE__ */ React10.createElement("button", { className: "btn wide quiet", onClick: conferir }, /* @__PURE__ */ React10.createElement(ClipboardPaste, { size: 18 }), " Conferir antes de gravar"), erro && /* @__PURE__ */ React10.createElement(Aviso, null, erro), feito && /* @__PURE__ */ React10.createElement(Aviso, { tipo: "ok" }, feito, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), prev && /* @__PURE__ */ React10.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React10.createElement("h2", { className: "h2" }, "Confer\xEAncia", /* @__PURE__ */ React10.createElement("small", null, prev.aplicados.length, " para gravar \xB7 ", prev.rejeitados.length, " com problema")), prev.aplicados.length > 0 && /* @__PURE__ */ React10.createElement("div", { className: "sheet", "data-testid": "lote-aplicados" }, prev.aplicados.map((a) => /* @__PURE__ */ React10.createElement("div", { className: "lote-item", key: a.indice, "data-testid": "lote-item" }, /* @__PURE__ */ React10.createElement("span", { className: "n" }, a.indice + 1), /* @__PURE__ */ React10.createElement("div", { className: "txt" }, /* @__PURE__ */ React10.createElement("b", null, descreverEvento(a.eventos[0], prev.estado)), /* @__PURE__ */ React10.createElement("span", null, mudancas(a, dados) || "sem mudan\xE7a no cadastro da vaca")), /* @__PURE__ */ React10.createElement("span", { className: "m mut" }, formatarDataBR(a.eventos[0].data))))), prev.avisos.length > 0 && /* @__PURE__ */ React10.createElement(Aviso, { tipo: "info" }, /* @__PURE__ */ React10.createElement("b", null, "Aten\xE7\xE3o:"), /* @__PURE__ */ React10.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 } }, prev.avisos.map((a, i) => /* @__PURE__ */ React10.createElement("li", { key: i }, "linha ", a.indice + 1, ": ", a.aviso)))), prev.rejeitados.length > 0 && /* @__PURE__ */ React10.createElement(Aviso, null, /* @__PURE__ */ React10.createElement("b", null, "N\xE3o v\xE3o ser gravados:"), /* @__PURE__ */ React10.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 }, "data-testid": "lote-rejeitados" }, prev.rejeitados.map((r, i) => /* @__PURE__ */ React10.createElement("li", { key: i }, "linha ", r.indice + 1, ": ", r.motivo)))), /* @__PURE__ */ React10.createElement("button", { className: "btn wide", disabled: gravando || prev.aplicados.length === 0, onClick: gravar, style: { marginTop: 10 } }, gravando ? /* @__PURE__ */ React10.createElement(Loader26, { size: 18, className: "spin" }) : /* @__PURE__ */ React10.createElement(Check4, { size: 18 }), gravando ? "Gravando..." : `Gravar ${prev.aplicados.length} lan\xE7amento(s)`)));
}

// src/telas/Morte.jsx
import React11, { useMemo as useMemo8, useState as useState10, useRef as useRef4, useEffect as useEffect5 } from "react";
import { Save as Save6, Loader2 as Loader27, Undo2 } from "lucide-react";
var campoDef = (k) => CAMPOS.morte.find((c) => c.key === k);
var inicial = (brinco, hoje) => ({ brinco: brinco || "", data: hoje, causa: "", tipoAnimal: "", observacoes: "" });
function FormMorte({ dados, hoje, brincoFixo, onRegistrar, modoTeste, aoTerminar }) {
  const [form, setForm] = useState10(() => inicial(brincoFixo, hoje));
  const [erro, setErro] = useState10("");
  const [confirmar, setConfirmar] = useState10(false);
  const [salvando, setSalvando] = useState10(false);
  const [msg, setMsg] = useState10("");
  const timer2 = useRef4(null);
  useEffect5(() => () => clearTimeout(timer2.current), []);
  const info = useMemo8(() => infoAnimalMorte(dados, form.brinco), [dados, form.brinco]);
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
  return /* @__PURE__ */ React11.createElement("div", null, /* @__PURE__ */ React11.createElement("div", { className: "fld" }, /* @__PURE__ */ React11.createElement("label", { htmlFor: "morte-brinco" }, "Brinco do animal"), /* @__PURE__ */ React11.createElement(
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
  ), !temBrinco && /* @__PURE__ */ React11.createElement("div", { className: "hint" }, "Deixe em branco se o animal n\xE3o tem n\xFAmero (touro, boi, bezerro sem brinco). A\xED escolha que animal \xE9."), temBrinco && info.achado && !info.jaMorto && !info.jaVendido && /* @__PURE__ */ React11.createElement("div", { className: "hint", "data-testid": "morte-achei" }, "Achei: ", info.descricao), temBrinco && info.achado && info.jaMorto && /* @__PURE__ */ React11.createElement("div", { className: "hint late" }, "Este animal j\xE1 est\xE1 registrado como morto", info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : "", "."), temBrinco && info.achado && !info.jaMorto && info.jaVendido && /* @__PURE__ */ React11.createElement("div", { className: "hint late" }, "Este animal j\xE1 foi vendido", info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : "", "."), temBrinco && !info.achado && /* @__PURE__ */ React11.createElement("div", { className: "hint late", "data-testid": "morte-nao-achei" }, "N\xE3o achei o n\xFAmero ", form.brinco.trim(), " no sistema. Se o n\xFAmero est\xE1 certo, escolha que animal \xE9 abaixo para registrar assim mesmo.")), /* @__PURE__ */ React11.createElement("div", { className: "grid2" }, /* @__PURE__ */ React11.createElement(Campo, { campo: campoDef("data"), value: form.data, onChange: mudar, matrizes: [], touros: [] }), /* @__PURE__ */ React11.createElement(Campo, { campo: campoDef("causa"), value: form.causa, onChange: mudar, matrizes: [], touros: [] })), !info.achado && /* @__PURE__ */ React11.createElement(Campo, { campo: { ...campoDef("tipoAnimal"), label: "Que animal \xE9", required: true }, value: form.tipoAnimal, onChange: mudar, matrizes: [], touros: [] }), /* @__PURE__ */ React11.createElement(Campo, { campo: { ...campoDef("observacoes"), label: "Observa\xE7\xE3o (livre)" }, value: form.observacoes, onChange: mudar, matrizes: [], touros: [] }), erro && /* @__PURE__ */ React11.createElement(Aviso, null, erro), confirmar && info.matriz && /* @__PURE__ */ React11.createElement(Aviso, { tipo: "info" }, "Vai registrar a morte de ", /* @__PURE__ */ React11.createElement("b", null, info.descricao), ". ", info.matriz.status === "Cheia" ? "Ela estava cheia e " : "Ela ", "sai da lista de vacas e da previs\xE3o de parto. Confirma?", /* @__PURE__ */ React11.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React11.createElement("button", { className: "btn sm", onClick: () => salvar2(true), disabled: salvando }, "Confirmar morte"), /* @__PURE__ */ React11.createElement("button", { className: "btn quiet sm", onClick: () => setConfirmar(false) }, "Voltar"))), msg && /* @__PURE__ */ React11.createElement(Aviso, { tipo: "ok" }, msg, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), /* @__PURE__ */ React11.createElement("button", { className: "btn wide", onClick: () => salvar2(false), disabled: salvando, style: { marginTop: 6 } }, salvando ? /* @__PURE__ */ React11.createElement(Loader27, { size: 18, className: "spin" }) : /* @__PURE__ */ React11.createElement(Save6, { size: 18 }), " ", salvando ? "Gravando..." : "Registrar morte"));
}
function ModalMorte({ item, onEditar, onAnular, onFechar, onFeito }) {
  const e = item.e;
  const semCadastro = !e.criaId && !e.matrizId;
  const [form, setForm] = useState10({ data: e.data || "", causa: e.causa || "", observacoes: e.observacoes || "", tipoAnimal: e.tipoAnimal || "", brinco: e.brinco || "" });
  const [erro, setErro] = useState10("");
  const [anular, setAnular] = useState10(false);
  const [gravando, setGravando] = useState10(false);
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
  return /* @__PURE__ */ React11.createElement(Modal, { titulo: `Morte \xB7 ${item.animal}`, onClose: onFechar, rotulo: "Corrigir morte" }, /* @__PURE__ */ React11.createElement(Lead, { rotulo: "Animal", valor: item.animal }), item.mae && /* @__PURE__ */ React11.createElement(Lead, { rotulo: "M\xE3e", valor: item.mae }), /* @__PURE__ */ React11.createElement(Lead, { rotulo: "Lote", valor: item.lote }), !item.ativa ? /* @__PURE__ */ React11.createElement("p", { className: "sub", style: { marginTop: 12 } }, "Esta morte foi anulada (lan\xE7amento errado). Ela n\xE3o conta nos relat\xF3rios. Se o animal realmente morreu, lance a morte de novo.") : /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement("div", { style: { marginTop: 14 } }, /* @__PURE__ */ React11.createElement("div", { className: "grid2" }, /* @__PURE__ */ React11.createElement(Campo, { campo: CAMPOS.morte.find((c) => c.key === "data"), value: form.data, onChange: mudar, matrizes: [], touros: [] }), /* @__PURE__ */ React11.createElement(Campo, { campo: CAMPOS.morte.find((c) => c.key === "causa"), value: form.causa, onChange: mudar, matrizes: [], touros: [] })), semCadastro && /* @__PURE__ */ React11.createElement("div", { className: "grid2" }, /* @__PURE__ */ React11.createElement(Campo, { campo: { ...CAMPOS.morte.find((c) => c.key === "tipoAnimal"), required: true }, value: form.tipoAnimal, onChange: mudar, matrizes: [], touros: [] }), /* @__PURE__ */ React11.createElement(Campo, { campo: CAMPOS.morte.find((c) => c.key === "brinco"), value: form.brinco, onChange: mudar, matrizes: [], touros: [] })), /* @__PURE__ */ React11.createElement(Campo, { campo: { ...CAMPOS.morte.find((c) => c.key === "observacoes"), label: "Observa\xE7\xE3o (livre)" }, value: form.observacoes, onChange: mudar, matrizes: [], touros: [] })), erro && /* @__PURE__ */ React11.createElement(Aviso, null, erro), anular && /* @__PURE__ */ React11.createElement(Aviso, { tipo: "info" }, "Anular quando a morte foi lan\xE7ada no animal errado ou por engano.", " ", e.matrizId ? `A vaca volta ao status de antes (${e.statusAnterior || "Vazia"}).` : "O animal volta a contar no rebanho.", " A linha fica guardada na planilha, marcada como anulada.", /* @__PURE__ */ React11.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React11.createElement("button", { className: "btn sm", onClick: confirmarAnular, disabled: gravando }, "Sim, anular esta morte"), /* @__PURE__ */ React11.createElement("button", { className: "btn quiet sm", onClick: () => setAnular(false) }, "N\xE3o"))), /* @__PURE__ */ React11.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React11.createElement("button", { className: "btn", style: { flex: 1 }, onClick: salvar2, disabled: gravando }, gravando ? /* @__PURE__ */ React11.createElement(Loader27, { size: 17, className: "spin" }) : /* @__PURE__ */ React11.createElement(Save6, { size: 17 }), " Salvar corre\xE7\xE3o"), /* @__PURE__ */ React11.createElement("button", { className: "btn quiet", onClick: () => setAnular(true), disabled: gravando }, /* @__PURE__ */ React11.createElement(Undo2, { size: 17 }), " Anular"))));
}
function ListaMortes({ dados, ownerMode, onEditar, onAnular }) {
  const [aberta, setAberta] = useState10(null);
  const [aviso, setAviso] = useState10("");
  const todas = useMemo8(() => listarMortes(dados), [dados]);
  const lista3 = ownerMode ? todas : todas.filter((x) => x.ativa).slice(0, 6);
  const item = aberta ? todas.find((x) => x.e.id === aberta) : null;
  return /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement("h2", { className: "h2" }, ownerMode ? "Mortes lan\xE7adas" : "\xDAltimas mortes lan\xE7adas", /* @__PURE__ */ React11.createElement("small", null, ownerMode ? `${todas.filter((x) => x.ativa).length} ativa(s) \xB7 toque para corrigir` : "")), aviso && /* @__PURE__ */ React11.createElement(Aviso, { tipo: "ok", onClose: () => setAviso("") }, aviso), /* @__PURE__ */ React11.createElement("div", { className: "sheet", "data-testid": "lista-mortes" }, lista3.length === 0 ? /* @__PURE__ */ React11.createElement("div", { className: "empty" }, "Nenhuma morte lan\xE7ada.") : lista3.map((x) => {
    const corpo = /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement("span", { className: "two", style: { minWidth: 0 } }, /* @__PURE__ */ React11.createElement("b", null, x.animal, !x.ativa ? " \xB7 anulada" : ""), /* @__PURE__ */ React11.createElement("span", null, [x.e.causa, x.mae ? `m\xE3e ${x.mae}` : "", x.e.observacoes].filter(Boolean).join(" \xB7 "))), /* @__PURE__ */ React11.createElement("span", { className: "m mut" }, formatarDataBR(x.e.data)));
    return ownerMode ? /* @__PURE__ */ React11.createElement("button", { className: "led-r", key: x.e.id, style: { "--cols": "minmax(0,1fr) auto", minHeight: 56, opacity: x.ativa ? 1 : 0.55 }, onClick: () => setAberta(x.e.id), "aria-label": `Abrir morte de ${x.animal}` }, corpo) : /* @__PURE__ */ React11.createElement("div", { className: "led-r", key: x.e.id, style: { "--cols": "minmax(0,1fr) auto", minHeight: 56 } }, corpo);
  })), item && /* @__PURE__ */ React11.createElement(ModalMorte, { key: item.e.id, item, onEditar, onAnular, onFechar: () => setAberta(null), onFeito: setAviso }));
}

// src/telas/Nascimentos.jsx
import React12, { useMemo as useMemo9, useState as useState11 } from "react";
import { Search as Search3, Save as Save7, Loader2 as Loader28 } from "lucide-react";
var CHAVES_EDICAO = ["matrizId", "data", "resultadoParto", "sexo", "brincoBezerro", "pelagem", "tipoParto", "observacoes"];
var faltaNoNascimento = (e) => [!e.matrizId && "m\xE3e", !e.sexo && "sexo", !String(e.brincoBezerro ?? "").trim() && "brinco"].filter(Boolean);
function ModalNascimento({ nasc, dados, onEditar, onFechar, onFeito }) {
  const [form, setForm] = useState11(() => Object.fromEntries(CHAVES_EDICAO.map((k) => [k, nasc[k] ?? ""])));
  const [erro, setErro] = useState11("");
  const [gravando, setGravando] = useState11(false);
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
  return /* @__PURE__ */ React12.createElement(Modal, { titulo, onClose: onFechar, rotulo: "Corrigir nascimento" }, /* @__PURE__ */ React12.createElement("p", { className: "sub", style: { marginTop: 0 } }, "Lan\xE7ado em ", nasc.createdAt ? formatarDataBR(String(nasc.createdAt).slice(0, 10)) : "\u2014", ". M\xE3e, sexo e brinco n\xE3o podem ser apagados, s\xF3 trocados. Mudar o brinco leva junto as pesagens, a desmama e a novilha dessa cria."), /* @__PURE__ */ React12.createElement("div", { className: "grid2" }, CAMPOS.nascimento.filter((c) => CHAVES_EDICAO.includes(c.key)).map((c) => /* @__PURE__ */ React12.createElement("div", { key: c.key, style: c.type === "matriz" || c.key === "observacoes" ? { gridColumn: "1 / -1" } : void 0 }, /* @__PURE__ */ React12.createElement(Campo, { campo: c, value: form[c.key], onChange: mudar, matrizes: dados.matrizes, touros: dados.touros })))), erro && /* @__PURE__ */ React12.createElement(Aviso, null, erro), /* @__PURE__ */ React12.createElement("button", { className: "btn wide", onClick: salvar2, disabled: gravando }, gravando ? /* @__PURE__ */ React12.createElement(Loader28, { size: 17, className: "spin" }) : /* @__PURE__ */ React12.createElement(Save7, { size: 17 }), " Salvar corre\xE7\xE3o"));
}
function ListaNascimentos({ dados, onEditar }) {
  const [busca, setBusca] = useState11("");
  const [filtro, setFiltro] = useState11("todos");
  const [aberto, setAberto] = useState11(null);
  const [aviso, setAviso] = useState11("");
  const brincos = useMemo9(() => mapaBrincos(dados.matrizes), [dados.matrizes]);
  const todos = useMemo9(
    () => dados.eventos.filter((e) => e.tipo === "nascimento").sort((a, b) => (b.data || "").localeCompare(a.data || "") || (b.createdAt || "").localeCompare(a.createdAt || "")),
    [dados.eventos]
  );
  const faltando = todos.filter((e) => faltaNoNascimento(e).length > 0);
  const lista3 = useMemo9(() => {
    const q = busca.trim().toLowerCase();
    return (filtro === "faltando" ? faltando : todos).filter((e) => !q || String(e.brincoBezerro).toLowerCase().includes(q) || String(brincos[e.matrizId] || "").toLowerCase().includes(q));
  }, [todos, faltando, filtro, busca, brincos]);
  const mostradas = lista3.slice(0, 40);
  const nasc = aberto ? todos.find((e) => e.id === aberto) : null;
  return /* @__PURE__ */ React12.createElement(React12.Fragment, null, /* @__PURE__ */ React12.createElement("h2", { className: "h2" }, "Nascimentos lan\xE7ados", /* @__PURE__ */ React12.createElement("small", null, todos.length, " no total \xB7 toque para corrigir")), aviso && /* @__PURE__ */ React12.createElement(Aviso, { tipo: "ok", onClose: () => setAviso("") }, aviso), /* @__PURE__ */ React12.createElement("div", { className: "sheet" }, /* @__PURE__ */ React12.createElement("label", { className: "search" }, /* @__PURE__ */ React12.createElement(Search3, null), /* @__PURE__ */ React12.createElement("input", { placeholder: "Buscar pelo brinco da cria ou da m\xE3e", "aria-label": "Buscar nascimento", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React12.createElement("div", { className: "filtros" }, /* @__PURE__ */ React12.createElement("div", { className: "seg", role: "group", "aria-label": "Filtrar nascimentos" }, /* @__PURE__ */ React12.createElement("button", { "aria-pressed": filtro === "todos", onClick: () => setFiltro("todos") }, "Todos ", todos.length), /* @__PURE__ */ React12.createElement("button", { "aria-pressed": filtro === "faltando", onClick: () => setFiltro("faltando") }, "Faltando dados ", faltando.length))), mostradas.length === 0 && /* @__PURE__ */ React12.createElement("div", { className: "empty" }, filtro === "faltando" ? "Nenhum nascimento com dado faltando." : "Nenhum nascimento encontrado."), mostradas.map((e) => {
    const falta = faltaNoNascimento(e);
    return /* @__PURE__ */ React12.createElement("button", { key: e.id, className: "led-r", style: { "--cols": "minmax(0,1fr) auto", minHeight: 56 }, onClick: () => setAberto(e.id), "aria-label": `Corrigir nascimento ${e.brincoBezerro || "sem n\xFAmero"}` }, /* @__PURE__ */ React12.createElement("span", { className: "two", style: { minWidth: 0 } }, /* @__PURE__ */ React12.createElement("b", null, e.brincoBezerro ? `Cria ${e.brincoBezerro}` : "Cria sem n\xFAmero", " \xB7 ", e.sexo || "sexo ?", e.resultadoParto === "Natimorto" ? " \xB7 natimorto" : ""), /* @__PURE__ */ React12.createElement("span", null, "m\xE3e ", brincos[e.matrizId] || "?", falta.length ? ` \xB7 falta: ${falta.join(", ")}` : "")), /* @__PURE__ */ React12.createElement("span", { className: "m mut" }, formatarDataBR(e.data)));
  }), lista3.length > mostradas.length && /* @__PURE__ */ React12.createElement("div", { className: "empty", style: { fontSize: 13 } }, "Mostrando os ", mostradas.length, " mais recentes de ", lista3.length, ". Use a busca para achar os outros.")), nasc && /* @__PURE__ */ React12.createElement(ModalNascimento, { key: nasc.id, nasc, dados, onEditar, onFechar: () => setAberto(null), onFeito: setAviso }));
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
  const [tipo, setTipo] = useState12("nascimento");
  const [form, setForm] = useState12(() => formularioInicial("nascimento", hoje));
  const [erro, setErro] = useState12("");
  const [dup, setDup] = useState12(false);
  const [salvo, setSalvo] = useState12("");
  const [travado, setTravado] = useState12(false);
  const timer2 = useRef5(null);
  const timerTrava = useRef5(null);
  useEffect6(() => () => {
    clearTimeout(timer2.current);
    clearTimeout(timerTrava.current);
  }, []);
  useEffect6(() => {
    if (!preset) return;
    setTipo(preset.tipo);
    setForm({ ...formularioInicial(preset.tipo, hoje), matrizId: preset.matrizId || "" });
    setErro("");
    setDup(false);
    setSalvo("");
  }, [preset && preset.n]);
  useEffect6(() => {
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
  const fichaDesmama = useMemo10(
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
  const ultimos = useMemo10(() => {
    const nasc = dados.eventos.filter((e) => e.tipo === "nascimento" && e.brincoBezerro);
    const recente = (sexo) => nasc.filter((e) => e.sexo === sexo).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0];
    return { Macho: recente("Macho"), "F\xEAmea": recente("F\xEAmea") };
  }, [dados.eventos]);
  const recentes = useMemo10(
    () => [...dados.eventos].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 6),
    [dados.eventos]
  );
  const campos = (CAMPOS[tipo] || []).filter((c) => (!c.showIf || c.showIf(form)) && !(tipo === "desmama" && c.key === "idadeDias"));
  const semMatrizes = dados.matrizes.length === 0 && tipo !== "cadastro";
  return /* @__PURE__ */ React13.createElement("div", { className: "wrap" }, /* @__PURE__ */ React13.createElement("div", { className: "head" }, /* @__PURE__ */ React13.createElement("div", null, /* @__PURE__ */ React13.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React13.createElement("h1", null, "Lan\xE7ar"))), /* @__PURE__ */ React13.createElement(IndexTabs, { tabs: abas, value: tipo, onChange: trocarTipo, rotulo: "Tipo de lan\xE7amento" }), /* @__PURE__ */ React13.createElement("div", { className: "sheet pad" }, tipo === "lote" ? /* @__PURE__ */ React13.createElement(LoteFoto, { dados, hoje, onGravarLote, modoTeste }) : tipo === "morte" ? /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rotuloEvento(tipo)), /* @__PURE__ */ React13.createElement("p", { className: "sub", style: { marginTop: 0 } }, "Vale para qualquer animal: cria, novilha, vaca, touro ou animal sem cadastro. A vaca que morre sai da lista de vacas."), /* @__PURE__ */ React13.createElement(FormMorte, { dados, hoje, onRegistrar: onRegistrarMorte, modoTeste })) : /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rotuloEvento(tipo)), semMatrizes && /* @__PURE__ */ React13.createElement(Aviso, { tipo: "info" }, ownerMode ? 'Cadastre pelo menos uma matriz em "Nova matriz" para poder lig\xE1-la aos outros lan\xE7amentos.' : "Ainda n\xE3o h\xE1 matrizes no sistema. Fale com o propriet\xE1rio."), tipo === "nascimento" && (ultimos.Macho || ultimos["F\xEAmea"]) && /* @__PURE__ */ React13.createElement("div", { style: { marginBottom: 16 } }, ["F\xEAmea", "Macho"].map((sx) => ultimos[sx] ? /* @__PURE__ */ React13.createElement(Lead, { key: sx, rotulo: sx === "Macho" ? "\xDAltimo macho" : "\xDAltima f\xEAmea", valor: `${ultimos[sx].brincoBezerro} \xB7 ${formatarDataBR(ultimos[sx].data)}` }) : null)), /* @__PURE__ */ React13.createElement("div", { className: "grid2" }, campos.map((c) => /* @__PURE__ */ React13.createElement("div", { key: c.key, style: c.type === "matriz" || c.key === "observacoes" || c.key === "motivo" ? { gridColumn: "1 / -1" } : void 0 }, /* @__PURE__ */ React13.createElement(Campo, { campo: c, value: form[c.key], onChange: atualizar, matrizes: dados.matrizes, touros: dados.touros }), tipo === "desmama" && c.key === "brincoBezerro" && /* @__PURE__ */ React13.createElement(FichaRapida, { ficha: fichaDesmama, digitado: form.brincoBezerro }))), tipo === "desmama" && /* @__PURE__ */ React13.createElement("div", { className: "fld", style: { gridColumn: "1 / -1" }, role: "group", "aria-label": "Idade na desmama" }, /* @__PURE__ */ React13.createElement("span", { className: "lbl", style: { display: "block", font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 6 } }, "Idade na desmama"), /* @__PURE__ */ React13.createElement("div", { className: "idade-md" }, /* @__PURE__ */ React13.createElement("div", { className: "fld", style: { margin: 0 } }, /* @__PURE__ */ React13.createElement("label", { htmlFor: "idade-meses" }, "Meses"), /* @__PURE__ */ React13.createElement("input", { id: "idade-meses", type: "number", inputMode: "numeric", min: "0", value: idadeMeses, onChange: (e) => editarIdade("m", e.target.value) })), /* @__PURE__ */ React13.createElement("div", { className: "fld", style: { margin: 0 } }, /* @__PURE__ */ React13.createElement("label", { htmlFor: "idade-dias" }, "Dias"), /* @__PURE__ */ React13.createElement("input", { id: "idade-dias", type: "number", inputMode: "numeric", min: "0", value: idadeDiasTxt, onChange: (e) => editarIdade("d", e.target.value) }))), /* @__PURE__ */ React13.createElement("div", { className: "hint", style: { fontSize: 12.5, color: "var(--mut)", marginTop: 4 }, "data-testid": "hint-idade" }, form._idadeManual ? /* @__PURE__ */ React13.createElement(React13.Fragment, null, "Idade digitada \xE0 m\xE3o.", idadeAuto ? /* @__PURE__ */ React13.createElement(React13.Fragment, null, " Pelo nascimento seria ", idadeAuto.texto, ". ", /* @__PURE__ */ React13.createElement("button", { type: "button", className: "btn quiet sm", style: { minHeight: 30, marginLeft: 6 }, onClick: () => setForm((f) => ({ ...f, _idadeManual: false, _meses: "", _dias: "" })) }, "Usar a calculada")) : null) : idadeAuto ? `Calculada pelo nascimento (${formatarDataBR(fichaDesmama.nascData)}) at\xE9 a data da desmama. Pode alterar se precisar.` : "Digite o brinco da cria para calcular a idade, ou preencha \xE0 m\xE3o."))), erro && /* @__PURE__ */ React13.createElement(Aviso, null, erro), dup && /* @__PURE__ */ React13.createElement(Aviso, { tipo: "info" }, "Esse lan\xE7amento parece j\xE1 existir (mesma vaca e mesma data). Confira antes de salvar de novo.", /* @__PURE__ */ React13.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React13.createElement("button", { className: "btn sm", onClick: () => salvar2(true), disabled: travado }, "Salvar mesmo assim"), /* @__PURE__ */ React13.createElement("button", { className: "btn quiet sm", onClick: () => setDup(false) }, "Cancelar"))), salvo && /* @__PURE__ */ React13.createElement(Aviso, { tipo: "ok" }, salvo, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), /* @__PURE__ */ React13.createElement("button", { className: "btn wide", onClick: () => salvar2(false), disabled: travado, style: { marginTop: 6 } }, /* @__PURE__ */ React13.createElement(Save8, { size: 18 }), " Salvar registro"))), tipo === "morte" && /* @__PURE__ */ React13.createElement(ListaMortes, { dados, ownerMode, onEditar: onEditarMorte, onAnular: onAnularMorte }), tipo === "nascimento" && ownerMode && /* @__PURE__ */ React13.createElement(ListaNascimentos, { dados, onEditar: onEditarNascimento }), tipo !== "lote" && tipo !== "morte" && !(tipo === "nascimento" && ownerMode) && /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement("h2", { className: "h2" }, "\xDAltimos lan\xE7amentos"), /* @__PURE__ */ React13.createElement("div", { className: "sheet" }, recentes.length === 0 ? /* @__PURE__ */ React13.createElement("div", { className: "empty" }, "Nada lan\xE7ado ainda.") : recentes.map((e) => /* @__PURE__ */ React13.createElement("div", { className: "led-r", key: e.id, style: { "--cols": "1fr auto", minHeight: 48 } }, /* @__PURE__ */ React13.createElement("span", { style: { fontSize: 14.5 } }, descreverEvento(e, dados)), /* @__PURE__ */ React13.createElement("span", { className: "m mut" }, formatarDataBR(e.data)))))));
}

// src/telas/Parto.jsx
import React14, { useMemo as useMemo11, useState as useState13 } from "react";
import { Search as Search4 } from "lucide-react";
function textoDias(dias) {
  if (dias === null || dias === void 0) return { t: "\u2014", c: "mut" };
  if (dias < 0) return { t: `\u2212${Math.abs(dias)}`, c: "late" };
  if (dias === 0) return { t: "hoje", c: "late" };
  if (dias <= 15) return { t: `+${dias}`, c: "soon" };
  return { t: `+${dias}`, c: "good" };
}
function Calculo({ info }) {
  if (!info) return null;
  if (info.origem === "toque") return /* @__PURE__ */ React14.createElement(React14.Fragment, null, "C\xE1lculo: toque de ", /* @__PURE__ */ React14.createElement("b", null, formatarDataBR(info.base)), " com ", /* @__PURE__ */ React14.createElement("b", null, info.dg), " dias de gesta\xE7\xE3o, completando ", PERIODO_GESTACAO_DIAS, " dias.");
  if (info.origem === "iatf") return /* @__PURE__ */ React14.createElement(React14.Fragment, null, "C\xE1lculo: IATF de ", /* @__PURE__ */ React14.createElement("b", null, formatarDataBR(info.base)), " mais ", PERIODO_GESTACAO_DIAS, " dias.");
  return /* @__PURE__ */ React14.createElement(React14.Fragment, null, "Toque de ", /* @__PURE__ */ React14.createElement("b", null, formatarDataBR(info.base)), " sem os dias de gesta\xE7\xE3o (DG) anotados: n\xE3o d\xE1 para calcular a data.");
}
function VacinaCheia({ m, sit, hoje, dados, onGravarLote }) {
  const [data, setData] = useState13(hoje);
  const [msg, setMsg] = useState13("");
  async function confirmar(tipo) {
    const ev = manejoConfirmacaoVacina([m.id], data, tipo);
    const r = await onGravarLote({ estado: { ...dados, eventos: [...dados.eventos, ev] }, eventosParaGravar: [{ tipo: "manejo", evento: ev }], matrizesParaGravar: [], tourosParaGravar: [] }, `vacina ${m.brinco}`);
    setMsg(r.ok ? "Registrado." : r.msg);
  }
  const pedeInicial = !sit.inicial;
  const pedeReforco = sit.reforco && !sit.reforco.feito && (sit.reforco.atrasoDias || sit.reforco.faltam <= 30);
  const pergunta = (texto, tipo) => /* @__PURE__ */ React14.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 8, color: "var(--tx)" } }, texto, /* @__PURE__ */ React14.createElement("input", { type: "date", "aria-label": `Data: ${tipo}`, value: data, onChange: (e) => setData(e.target.value), style: { width: "auto", minHeight: 34 } }), /* @__PURE__ */ React14.createElement("button", { className: "btn sm", style: { minHeight: 34 }, onClick: () => confirmar(tipo) }, "Sim"), /* @__PURE__ */ React14.createElement("button", { className: "btn quiet sm", style: { minHeight: 34 }, onClick: () => setMsg("Continua pendente. Vacine em Manejo > Vacinas.") }, "N\xE3o"));
  return /* @__PURE__ */ React14.createElement("div", { style: { marginTop: 8 }, "data-testid": `vacina-${m.brinco}` }, /* @__PURE__ */ React14.createElement("span", { className: `vac-tag ${sit.nivel}` }, sit.texto || "Sem vacina registrada"), pedeReforco && onGravarLote && pergunta("J\xE1 tomou o refor\xE7o da Lepto?", "Refor\xE7o Lepto"), pedeInicial && onGravarLote && pergunta("Foi vacinada (vacina reprodutiva)?", "Vacina reprodutiva"), msg && /* @__PURE__ */ React14.createElement("div", { className: "hint", style: { marginTop: 4 } }, msg));
}
function Parto({ dados, hoje, onLancar, onGravarLote }) {
  const [aba, setAba] = useState13("Cheia");
  const [busca, setBusca] = useState13("");
  const [aberta, setAberta] = useState13(null);
  const todasCheias = useMemo11(() => linhasPrevisao(dados.matrizes, dados.eventos, "Cheia", hoje, ""), [dados, hoje]);
  const nVazias = dados.matrizes.filter((m) => m.status === "Vazia").length;
  const linhas = useMemo11(() => linhasPrevisao(dados.matrizes, dados.eventos, aba, hoje, busca), [dados, aba, hoje, busca]);
  const atrasadas = todasCheias.filter((l) => l.dias !== null && l.dias < 0).length;
  const porVir = todasCheias.filter((l) => l.dias !== null && l.dias >= 0).length;
  const semPrev = todasCheias.filter((l) => l.dias === null).length;
  const vaziasSemParto = useMemo11(() => linhasPrevisao(dados.matrizes, dados.eventos, "Vazia", hoje, "").filter((l) => !l.ultimoParto).length, [dados, hoje]);
  const cols = "84px minmax(0,1fr) 78px 54px";
  const cacheVac = useMemo11(() => aplicacoesPorAnimal(dados), [dados]);
  const vacinaDe = (m) => situacaoVacinaVaca(dados, m, hoje, cacheVac);
  const pendVac = aba === "Cheia" ? todasCheias.filter((l) => vacinaDe(l.matriz).pendente).length : 0;
  return /* @__PURE__ */ React14.createElement("div", { className: "wrap" }, /* @__PURE__ */ React14.createElement("div", { className: "head" }, /* @__PURE__ */ React14.createElement("div", null, /* @__PURE__ */ React14.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React14.createElement("h1", null, "Previs\xE3o de parto"))), /* @__PURE__ */ React14.createElement(
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
  ), /* @__PURE__ */ React14.createElement("section", { className: "sheet" }, /* @__PURE__ */ React14.createElement("label", { className: "search" }, /* @__PURE__ */ React14.createElement(Search4, null), /* @__PURE__ */ React14.createElement("input", { placeholder: "Buscar pelo brinco", "aria-label": "Buscar pelo brinco", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React14.createElement("div", { className: "bar-sum" }, aba === "Cheia" ? /* @__PURE__ */ React14.createElement(React14.Fragment, null, /* @__PURE__ */ React14.createElement("span", { className: "late" }, atrasadas, " atrasadas"), /* @__PURE__ */ React14.createElement("span", { className: "good" }, porVir, " por vir"), semPrev > 0 && /* @__PURE__ */ React14.createElement("span", { className: "mut" }, semPrev, " sem previs\xE3o"), pendVac > 0 && /* @__PURE__ */ React14.createElement("span", { className: "late" }, pendVac, " com vacina pendente")) : /* @__PURE__ */ React14.createElement(React14.Fragment, null, /* @__PURE__ */ React14.createElement("span", { className: "soon" }, nVazias, " vazias"), vaziasSemParto > 0 && /* @__PURE__ */ React14.createElement("span", { className: "mut" }, vaziasSemParto, " sem parto lan\xE7ado"))), /* @__PURE__ */ React14.createElement("div", { className: "led-h", style: { "--cols": cols } }, /* @__PURE__ */ React14.createElement("span", null, "Brinco"), /* @__PURE__ */ React14.createElement("span", null, "Categoria"), /* @__PURE__ */ React14.createElement("span", null, aba === "Cheia" ? "Previs\xE3o" : "\xDAlt. parto"), /* @__PURE__ */ React14.createElement("span", { className: "r" }, aba === "Cheia" ? "Dias" : "H\xE1 (d)")), linhas.length === 0 && /* @__PURE__ */ React14.createElement("div", { className: "empty" }, busca ? "Nenhuma matriz com esse brinco aqui." : `Nenhuma matriz ${aba === "Cheia" ? "cheia" : "vazia"}.`), linhas.map((l) => {
    const m = l.matriz;
    const dd = aba === "Cheia" ? textoDias(l.dias) : { t: l.diasDesdeParto === null ? "\u2014" : String(l.diasDesdeParto), c: "mut" };
    const data = aba === "Cheia" ? l.previsao : l.ultimoParto;
    const aberto = aberta === m.id;
    return /* @__PURE__ */ React14.createElement(React14.Fragment, { key: m.id }, /* @__PURE__ */ React14.createElement("button", { className: "led-r", style: { "--cols": cols }, "aria-expanded": aberto, onClick: () => setAberta(aberto ? null : m.id) }, /* @__PURE__ */ React14.createElement("span", { className: "b" }, m.brinco), /* @__PURE__ */ React14.createElement("span", { className: "two" }, /* @__PURE__ */ React14.createElement("b", null, m.categoria), /* @__PURE__ */ React14.createElement("span", null, [m.raca, m.lote].filter(Boolean).join(" \xB7 ") || "\u2014"), aba === "Cheia" && (() => {
      const v = vacinaDe(m);
      return v.pendente ? /* @__PURE__ */ React14.createElement("span", { style: { color: v.nivel === "atrasada" ? "var(--late)" : "var(--amber)" } }, v.reforco && v.reforco.atrasoDias ? "Lepto atrasada" : !v.inicial ? "vacina pendente" : "refor\xE7o Lepto em breve") : null;
    })()), /* @__PURE__ */ React14.createElement("span", { className: "m" }, data ? formatarDataBR(data) : "\u2014"), /* @__PURE__ */ React14.createElement("span", { className: `r ${dd.c}` }, dd.t)), aberto && /* @__PURE__ */ React14.createElement("div", { className: "detalhe" }, aba === "Cheia" && /* @__PURE__ */ React14.createElement("div", null, /* @__PURE__ */ React14.createElement(Calculo, { info: l.info })), aba === "Cheia" && /* @__PURE__ */ React14.createElement(VacinaCheia, { key: m.id, m, sit: vacinaDe(m), hoje, dados, onGravarLote }), l.ultimoParto ? /* @__PURE__ */ React14.createElement("div", null, "\xDAltimo parto: ", /* @__PURE__ */ React14.createElement("b", null, formatarDataBR(l.ultimoParto)), l.numeroCria ? ` (cria ${l.numeroCria})` : "") : /* @__PURE__ */ React14.createElement("div", null, "Nenhum parto lan\xE7ado para esta vaca."), aba === "Cheia" && l.dias !== null && l.dias < 0 && /* @__PURE__ */ React14.createElement("div", { className: "late", style: { marginTop: 4 } }, "A data prevista j\xE1 passou h\xE1 ", Math.abs(l.dias), " dia(s). Confira se ela j\xE1 pariu."), /* @__PURE__ */ React14.createElement("div", { style: { marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" } }, aba === "Cheia" ? /* @__PURE__ */ React14.createElement("button", { className: "btn sm", onClick: () => onLancar("nascimento", m.id) }, "Lan\xE7ar nascimento desta vaca") : null)));
  })), /* @__PURE__ */ React14.createElement("p", { className: "sub", style: { marginTop: 14 } }, "Dias negativos: a data prevista j\xE1 passou. Confira se a vaca pariu e lance o nascimento. A previs\xE3o olha o hist\xF3rico inteiro da vaca, n\xE3o s\xF3 o ano escolhido."));
}

// src/telas/Crias.jsx
import React20, { useState as useState19, useMemo as useMemo17, useEffect as useEffect10 } from "react";

// src/telas/CriasLista.jsx
import React15, { useMemo as useMemo12, useState as useState14, useRef as useRef6, useEffect as useEffect7 } from "react";
import { Search as Search5, Scale, ShoppingCart } from "lucide-react";
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
  const [peso, setPeso] = useState14("");
  const [data, setData] = useState14(hoje);
  const [confirma, setConfirma] = useState14("");
  const [msg, setMsg] = useState14("");
  const [erro, setErro] = useState14("");
  const [travado, setTravado] = useState14(false);
  const [desmData, setDesmData] = useState14(hoje);
  const [desmPeso, setDesmPeso] = useState14("");
  const [registrandoMorte, setRegistrandoMorte] = useState14(false);
  const [editNasc, setEditNasc] = useState14(false);
  const [editMorte, setEditMorte] = useState14(false);
  const timer2 = useRef6(null);
  useEffect7(() => () => clearTimeout(timer2.current), []);
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
  return /* @__PURE__ */ React15.createElement(Modal, { titulo: `Cria ${c.brinco || "sem n\xFAmero"}`, onClose: onFechar, rotulo: `Cria ${c.brinco || "sem n\xFAmero"}` }, /* @__PURE__ */ React15.createElement("div", { style: { marginBottom: 6 } }, /* @__PURE__ */ React15.createElement("span", { className: `pill ${corSituacao(c.situacao)}` }, rotuloSituacao(c)), c.orfa && /* @__PURE__ */ React15.createElement("span", { className: "pill alerta", style: { marginLeft: 6 } }, "\xD3rf\xE3")), c.orfa && /* @__PURE__ */ React15.createElement(Aviso, { tipo: "info" }, "Cria \xF3rf\xE3: a m\xE3e ", c.maeBrinco || "?", " morreu", c.maeMortaData ? ` em ${formatarDataBR(c.maeMortaData)}` : "", ". A cria continua normal; os funcion\xE1rios cuidam dela at\xE9 se virar sozinha."), /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Sexo", valor: c.sexo || "\u2014" }), /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Nascimento", valor: `${formatarDataBR(c.nascData)} \xB7 ${fmtIdade(c.idadeDias)}` }), /* @__PURE__ */ React15.createElement(Lead, { rotulo: "M\xE3e", valor: c.maeBrinco ? `${c.maeBrinco}${c.maeMorta ? " (morreu)" : ""}` : "n\xE3o informada" }), /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Origem / pai", valor: c.origem.rotulo }), c.origem.iatfData && /* @__PURE__ */ React15.createElement(Lead, { rotulo: "IATF da m\xE3e", valor: formatarDataBR(c.origem.iatfData) }), c.pelagem && /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Pelagem", valor: c.pelagem }), /* @__PURE__ */ React15.createElement(Lead, { rotulo: "\xDAltimo peso", valor: c.pesoAtual === null ? "sem pesagem" : `${fmtKg(c.pesoAtual)} em ${formatarDataBR(c.pesoData)}` }), /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Ganho recente", valor: fmtGmd(c.gmd) }), c.desmamaData && /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Desmama", valor: formatarDataBR(c.desmamaData) }), c.situacao === "vendido" && /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Baixa (venda)", valor: c.vendaData ? formatarDataBR(c.vendaData) : "vendida" }), c.situacao === "morto" && /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Morte", valor: `${c.mortoData ? formatarDataBR(c.mortoData) : "sem data"} \xB7 ${c.causaMorte || "causa n\xE3o informada"}`, cor: "var(--late)" }), morte && morte.e.observacoes && /* @__PURE__ */ React15.createElement(Lead, { rotulo: "Observa\xE7\xE3o", valor: morte.e.observacoes }), /* @__PURE__ */ React15.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Pesagens", /* @__PURE__ */ React15.createElement("small", null, c.pontos.length, " registro(s)")), hist.length === 0 ? /* @__PURE__ */ React15.createElement("p", { className: "sub" }, "Nenhuma pesagem ainda.") : /* @__PURE__ */ React15.createElement("ul", { className: "hist", "data-testid": "pesagens" }, hist.map((p) => /* @__PURE__ */ React15.createElement("li", { key: p.id }, /* @__PURE__ */ React15.createElement("span", null, fmtKg(p.peso), p.fonte !== "Pesagem" ? ` \xB7 ${p.fonte.toLowerCase()}` : ""), /* @__PURE__ */ React15.createElement("span", null, formatarDataBR(p.data))))), c.ativa && /* @__PURE__ */ React15.createElement("div", { className: "rapido", style: { marginTop: 14 } }, /* @__PURE__ */ React15.createElement("div", { className: "grid2" }, /* @__PURE__ */ React15.createElement("div", { className: "fld" }, /* @__PURE__ */ React15.createElement("label", { htmlFor: "ficha-peso" }, "Peso (kg)"), /* @__PURE__ */ React15.createElement("input", { id: "ficha-peso", type: "number", inputMode: "decimal", value: peso, onChange: (e) => {
    setPeso(e.target.value);
    setConfirma("");
    setErro("");
  }, onKeyDown: (e) => {
    if (e.key === "Enter") registrar(false);
  } })), /* @__PURE__ */ React15.createElement("div", { className: "fld" }, /* @__PURE__ */ React15.createElement("label", { htmlFor: "ficha-data" }, "Data"), /* @__PURE__ */ React15.createElement("input", { id: "ficha-data", type: "date", value: data, onChange: (e) => {
    setData(e.target.value);
    setConfirma("");
  } }))), confirma && /* @__PURE__ */ React15.createElement(Aviso, { tipo: "info" }, confirma, /* @__PURE__ */ React15.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React15.createElement("button", { className: "btn sm", onClick: () => registrar(true), disabled: travado }, "Lan\xE7ar mesmo assim"))), /* @__PURE__ */ React15.createElement("button", { className: "btn wide", onClick: () => registrar(false), disabled: travado }, /* @__PURE__ */ React15.createElement(Scale, { size: 18 }), " Registrar peso")), erro && /* @__PURE__ */ React15.createElement(Aviso, null, erro), msg && /* @__PURE__ */ React15.createElement(Aviso, { tipo: "ok" }, msg), podeDesmamar && /* @__PURE__ */ React15.createElement("div", { className: "rapido" }, /* @__PURE__ */ React15.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Desmama (propriet\xE1rio)"), /* @__PURE__ */ React15.createElement("div", { className: "grid2" }, /* @__PURE__ */ React15.createElement("div", { className: "fld" }, /* @__PURE__ */ React15.createElement("label", { htmlFor: "desm-data" }, "Data da desmama"), /* @__PURE__ */ React15.createElement("input", { id: "desm-data", type: "date", value: desmData, onChange: (e) => setDesmData(e.target.value) })), /* @__PURE__ */ React15.createElement("div", { className: "fld" }, /* @__PURE__ */ React15.createElement("label", { htmlFor: "desm-peso" }, "Peso na desmama (kg)"), /* @__PURE__ */ React15.createElement("input", { id: "desm-peso", type: "number", inputMode: "decimal", value: desmPeso, onChange: (e) => setDesmPeso(e.target.value) }))), /* @__PURE__ */ React15.createElement("button", { className: "btn quiet wide", onClick: desmamar, disabled: travado }, "Desmamar", c.sexo === "F\xEAmea" ? " e levar para as novilhas" : "")), ownerMode && c.situacao === "mamando" && !c.brinco && /* @__PURE__ */ React15.createElement("p", { className: "sub" }, "Para desmamar esta cria, primeiro ela precisa de um n\xFAmero (brinco) no lan\xE7amento do nascimento."), ownerMode && c.novilha && c.ativa && /* @__PURE__ */ React15.createElement("div", { className: "rapido" }, /* @__PURE__ */ React15.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Destino da novilha"), /* @__PURE__ */ React15.createElement("div", { className: "seg", role: "group", "aria-label": "Destino da novilha" }, DESTINOS_NOVILHA.map((d) => /* @__PURE__ */ React15.createElement("button", { key: d, "aria-pressed": c.novilha.destino === d, onClick: () => onSalvarMatriz(definirDestinoNovilha(c.novilha, d)) }, d)))), c.ativa && c.brinco && /* @__PURE__ */ React15.createElement("div", { style: { marginTop: 8 } }, !registrandoMorte ? /* @__PURE__ */ React15.createElement("button", { className: "btn quiet wide", onClick: () => setRegistrandoMorte(true) }, "Registrar morte desta cria") : /* @__PURE__ */ React15.createElement("div", { className: "rapido" }, /* @__PURE__ */ React15.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Morte da cria ", c.brinco), /* @__PURE__ */ React15.createElement(FormMorte, { dados, hoje, brincoFixo: c.brinco, onRegistrar: onRegistrarMorte, modoTeste, aoTerminar: (r) => {
    setRegistrandoMorte(false);
    setMsg(r.msg);
  } }), /* @__PURE__ */ React15.createElement("button", { className: "btn quiet sm", style: { marginTop: 8 }, onClick: () => setRegistrandoMorte(false) }, "Cancelar"))), ownerMode && c.ativa && c.situacao !== "matriz" && /* @__PURE__ */ React15.createElement("button", { className: "btn ghost wide", style: { marginTop: 8 }, onClick: () => {
    onFechar();
    onVender([c.brinco]);
  }, disabled: !c.brinco }, /* @__PURE__ */ React15.createElement(ShoppingCart, { size: 18 }), " Vender ", c.sexo === "F\xEAmea" ? "esta cria" : "este animal"), ownerMode && /* @__PURE__ */ React15.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 } }, /* @__PURE__ */ React15.createElement("button", { className: "btn quiet", style: { flex: 1 }, onClick: () => setEditNasc(true) }, "Corrigir nascimento"), morte && /* @__PURE__ */ React15.createElement("button", { className: "btn quiet", style: { flex: 1 }, onClick: () => setEditMorte(true) }, "Corrigir ou anular a morte")), editNasc && /* @__PURE__ */ React15.createElement(ModalNascimento, { nasc: c.nasc, dados, onEditar: onEditarNascimento, onFechar: () => setEditNasc(false), onFeito: setMsg }), editMorte && morte && /* @__PURE__ */ React15.createElement(ModalMorte, { item: morte, onEditar: onEditarMorte, onAnular: onAnularMorte, onFechar: () => setEditMorte(false), onFeito: setMsg }));
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
  const [sexo, setSexo] = useState14("todos");
  const [sit, setSit] = useState14("rebanho");
  const [busca, setBusca] = useState14("");
  const [ordem, setOrdem] = useState14("nova");
  const [aberta, setAberta] = useState14(null);
  const porSituacao = useMemo12(() => crias.filter((c) => sit === "todas" ? true : sit === "rebanho" ? NO_REBANHO.includes(c.situacao) : sit === "orfa" ? c.orfa : c.situacao === sit), [crias, sit]);
  const lista3 = useMemo12(() => {
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
  const semPeso = lista3.filter((c) => c.ativa && c.pesoAtual === null).length;
  return /* @__PURE__ */ React15.createElement("section", { className: "sheet" }, /* @__PURE__ */ React15.createElement("label", { className: "search" }, /* @__PURE__ */ React15.createElement(Search5, null), /* @__PURE__ */ React15.createElement("input", { placeholder: "Buscar pelo brinco da cria ou da m\xE3e", "aria-label": "Buscar cria", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React15.createElement("div", { className: "filtros" }, /* @__PURE__ */ React15.createElement("div", { className: "seg", role: "group", "aria-label": "Filtrar por sexo" }, [["todos", "Todas"], ["Macho", "Machos"], ["F\xEAmea", "F\xEAmeas"]].map(([id, rot]) => /* @__PURE__ */ React15.createElement("button", { key: id, "aria-pressed": sexo === id, onClick: () => setSexo(id) }, rot, " ", conta(id))))), /* @__PURE__ */ React15.createElement("div", { className: "filtros" }, /* @__PURE__ */ React15.createElement("select", { "aria-label": "Situa\xE7\xE3o", value: sit, onChange: (e) => setSit(e.target.value) }, FILTROS_SIT.map(([id, rot]) => /* @__PURE__ */ React15.createElement("option", { key: id, value: id }, rot))), /* @__PURE__ */ React15.createElement("select", { "aria-label": "Ordem", value: ordem, onChange: (e) => setOrdem(e.target.value) }, ORDENS.map(([id, rot]) => /* @__PURE__ */ React15.createElement("option", { key: id, value: id }, rot)))), /* @__PURE__ */ React15.createElement("div", { className: "bar-sum" }, /* @__PURE__ */ React15.createElement("span", null, lista3.length, " cria(s)"), /* @__PURE__ */ React15.createElement("span", null, semPeso, " sem pesagem")), /* @__PURE__ */ React15.createElement("div", { className: "led-h cols-cria" }, /* @__PURE__ */ React15.createElement("span", null, "Brinco"), /* @__PURE__ */ React15.createElement("span", null, "Cria \xB7 m\xE3e \xB7 origem"), /* @__PURE__ */ React15.createElement("span", { className: "r" }, "Peso"), /* @__PURE__ */ React15.createElement("span", { className: "hide-s" }, "Situa\xE7\xE3o"), /* @__PURE__ */ React15.createElement("span", { className: "hide-s" }, "Pesada em")), lista3.length === 0 && /* @__PURE__ */ React15.createElement("div", { className: "empty" }, "Nenhuma cria neste filtro."), lista3.map((c) => /* @__PURE__ */ React15.createElement("button", { key: c.id, className: "led-r cols-cria", onClick: () => setAberta(c.id), "aria-label": `Abrir cria ${c.brinco || "sem n\xFAmero"}` }, /* @__PURE__ */ React15.createElement("span", { className: "b" }, c.brinco || "\u2014"), /* @__PURE__ */ React15.createElement("span", { className: "two" }, /* @__PURE__ */ React15.createElement("b", null, c.sexo || "Sexo ?", " \xB7 ", fmtIdade(c.idadeDias), c.orfa ? " \xB7 \xF3rf\xE3" : ""), /* @__PURE__ */ React15.createElement("span", null, "m\xE3e ", c.maeBrinco || "?", c.maeMorta ? " (morreu)" : "", " \xB7 ", c.origem.rotulo)), /* @__PURE__ */ React15.createElement("span", { className: "r" }, c.pesoAtual === null ? /* @__PURE__ */ React15.createElement("span", { className: "mut" }, "\u2014") : fmtKg(c.pesoAtual), c.gmd !== null && /* @__PURE__ */ React15.createElement("div", { style: { font: "500 11.5px var(--body)", color: "var(--mut)" } }, fmtGmd(c.gmd))), /* @__PURE__ */ React15.createElement("span", { className: "hide-s" }, /* @__PURE__ */ React15.createElement("span", { className: `pill ${corSituacao(c.situacao)}` }, rotuloSituacao(c)), c.orfa && /* @__PURE__ */ React15.createElement("span", { className: "pill alerta", style: { marginLeft: 4 } }, "\xD3rf\xE3")), /* @__PURE__ */ React15.createElement("span", { className: "hide-s m mut" }, c.pesoData ? formatarDataBR(c.pesoData) : "\u2014"))), ficha && /* @__PURE__ */ React15.createElement(
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
import React16, { useMemo as useMemo13, useRef as useRef7, useState as useState15, useEffect as useEffect8 } from "react";
import { Plus as Plus5, Trash2 as Trash24, Save as Save9, Loader2 as Loader210, ClipboardPaste as ClipboardPaste2, FileDown as FileDown5 } from "lucide-react";
var mesmo = (a, b) => String(a).trim() === String(b).trim() || /^\d+$/.test(String(a).trim()) && /^\d+$/.test(String(b).trim()) && Number(a) === Number(b);
var lerRascunho = () => {
  const r = lerLocal(CHAVE_RASCUNHO_PESAR, null);
  return r && Array.isArray(r.linhas) ? r : null;
};
function Pesar({ dados, hoje, crias, ownerMode, modoTeste, onGravarLote }) {
  const rascunho0 = useRef7(lerRascunho());
  const [data, setData] = useState15(() => rascunho0.current && rascunho0.current.linhas.length && rascunho0.current.data || hoje);
  const [modo, setModo] = useState15(() => rascunho0.current && rascunho0.current.linhas.length && ownerMode && rascunho0.current.modo || "pesagem");
  const [brinco, setBrinco] = useState15("");
  const [pesoTxt, setPesoTxt] = useState15("");
  const [linhas, setLinhas] = useState15(() => rascunho0.current ? rascunho0.current.linhas.map((l) => ({ ...l, info: null })) : []);
  const [confDup, setConfDup] = useState15(null);
  const [gerandoPdf, setGerandoPdf] = useState15(false);
  const [erro, setErro] = useState15(null);
  const [resultado, setResultado] = useState15(null);
  const [gravando, setGravando] = useState15(false);
  const [travado, setTravado] = useState15(false);
  const [colar, setColar] = useState15("");
  const brincoRef = useRef7(null);
  const pesoRef = useRef7(null);
  const timer2 = useRef7(null);
  useEffect8(() => () => clearTimeout(timer2.current), []);
  useEffect8(() => {
    if (linhas.length) gravarNoCelular(CHAVE_RASCUNHO_PESAR, { data, modo, linhas: linhas.map(({ info, ...l }) => l), guardadoEm: (/* @__PURE__ */ new Date()).toISOString() });
    else apagarLocal(CHAVE_RASCUNHO_PESAR);
  }, [linhas, data, modo]);
  const infos = useMemo13(() => {
    const mapa = /* @__PURE__ */ new Map();
    linhas.forEach((l) => mapa.set(l.k, fichaAnimal(dados, l.brinco, data || hoje, crias)));
    return mapa;
  }, [linhas, dados, data, hoje, crias]);
  const infoDigitado = useMemo13(() => brinco.trim() ? fichaAnimal(dados, brinco, data || hoje, crias) : null, [brinco, dados, data, hoje, crias]);
  const doDia = useMemo13(() => data ? relatorioPesagemDia(dados, data, hoje) : null, [dados, data, hoje]);
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
  return /* @__PURE__ */ React16.createElement("section", { className: "sheet pad" }, /* @__PURE__ */ React16.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Pesar"), /* @__PURE__ */ React16.createElement("p", { className: "sub" }, "Escolha a data, digite o brinco e o peso de cada animal e grave tudo de uma vez. Serve para crias e para novilhas."), /* @__PURE__ */ React16.createElement("div", { className: "grid2" }, /* @__PURE__ */ React16.createElement("div", { className: "fld" }, /* @__PURE__ */ React16.createElement("label", { htmlFor: "pesar-data" }, "Data da pesagem"), /* @__PURE__ */ React16.createElement("input", { id: "pesar-data", type: "date", value: data, onChange: (e) => setData(e.target.value) })), ownerMode && /* @__PURE__ */ React16.createElement("div", { className: "fld", role: "group", "aria-label": "Tipo de pesagem" }, /* @__PURE__ */ React16.createElement("span", { className: "lbl", style: { display: "block", font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 6 } }, "O que \xE9 esta pesagem"), /* @__PURE__ */ React16.createElement("div", { className: "seg" }, /* @__PURE__ */ React16.createElement("button", { type: "button", "aria-pressed": modo === "pesagem", onClick: () => {
    setModo("pesagem");
    setResultado(null);
  } }, "S\xF3 pesar"), /* @__PURE__ */ React16.createElement("button", { type: "button", "aria-pressed": modo === "desmama", onClick: () => {
    setModo("desmama");
    setResultado(null);
  } }, "Desmama")))), modo === "desmama" && /* @__PURE__ */ React16.createElement(Aviso, { tipo: "info" }, 'Modo desmama: cada peso vira o peso da desmama. As f\xEAmeas passam para o lote de novilhas (destino "a definir").'), /* @__PURE__ */ React16.createElement("div", { className: "linha-add" }, /* @__PURE__ */ React16.createElement("div", { className: "fld" }, /* @__PURE__ */ React16.createElement("label", { htmlFor: "pesar-brinco" }, "Brinco"), /* @__PURE__ */ React16.createElement(
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
  )), /* @__PURE__ */ React16.createElement("div", { className: "fld" }, /* @__PURE__ */ React16.createElement("label", { htmlFor: "pesar-peso" }, "Peso (kg)"), /* @__PURE__ */ React16.createElement(
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
  )), /* @__PURE__ */ React16.createElement("button", { className: "btn", onClick: adicionar, "aria-label": "Adicionar \xE0 lista" }, /* @__PURE__ */ React16.createElement(Plus5, { size: 20 }))), /* @__PURE__ */ React16.createElement("div", { style: { minHeight: 8 } }, /* @__PURE__ */ React16.createElement(FichaRapida, { ficha: infoDigitado, digitado: brinco })), confDup && /* @__PURE__ */ React16.createElement(Aviso, { tipo: "info" }, /* @__PURE__ */ React16.createElement("div", { "data-testid": "aviso-duplicado" }, /* @__PURE__ */ React16.createElement("b", null, confDup.linha.brinco), " j\xE1 foi pesado em ", formatarDataBR(data), " com ", confDup.mesmaData.map((x) => fmtKg(x.peso)).join(" e "), ". Verifique a duplicidade.", " ", "Se lan\xE7ar mesmo assim, ele fica com os dois pesos nesta data (", confDup.mesmaData.map((x) => fmtKg(x.peso)).join(", "), " e ", fmtKg(confDup.linha.peso), "), marcado como pesado 2x."), /* @__PURE__ */ React16.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React16.createElement("button", { className: "btn quiet sm", onClick: () => confirmarDup(false) }, "Cancelar"), /* @__PURE__ */ React16.createElement("button", { className: "btn sm", onClick: () => confirmarDup(true) }, "Lan\xE7ar mesmo assim"))), erro && /* @__PURE__ */ React16.createElement(Aviso, null, erro.texto, erro.itens && /* @__PURE__ */ React16.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 } }, erro.itens.map((t, i) => /* @__PURE__ */ React16.createElement("li", { key: i }, t)))), /* @__PURE__ */ React16.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Na lista", /* @__PURE__ */ React16.createElement("small", null, linhas.length, " animal(is)", linhas.length ? ` \xB7 ${fmtKg(total)} no total` : "")), linhas.length === 0 ? /* @__PURE__ */ React16.createElement("p", { className: "sub" }, "Nenhum animal na lista ainda.") : /* @__PURE__ */ React16.createElement("div", { "data-testid": "lista-pesar" }, linhas.map((l) => {
    const info = infos.get(l.k) || { pontos: [], mesmaData: [] };
    const aviso = info.achado ? avisoDePeso((info.pontos || []).filter((p) => p.data !== data), l.peso, data) : "Brinco n\xE3o encontrado.";
    const ant = info.pesoAnterior;
    const dif = ant ? l.peso - ant.peso : null;
    const outros = modo === "pesagem" ? info.mesmaData || [] : [];
    const desc = [info.sexo, info.idade ? info.idade.texto : "", info.maeBrinco ? `m\xE3e ${info.maeBrinco}` : ""].filter(Boolean).join(" \xB7 ");
    return /* @__PURE__ */ React16.createElement("div", { className: "item-lin", key: l.k, "data-testid": `linha-${l.brinco}` }, /* @__PURE__ */ React16.createElement("div", { className: "t" }, /* @__PURE__ */ React16.createElement("b", null, l.brinco, outros.length ? /* @__PURE__ */ React16.createElement("span", { className: "tag2x" }, outros.length + 1, "x") : null), /* @__PURE__ */ React16.createElement("span", null, desc, dif !== null ? ` \xB7 ${dif >= 0 ? "+" : ""}${fmtKg(dif)} desde ${formatarDataBR(ant.data)}` : " \xB7 primeira pesagem"), outros.length > 0 && /* @__PURE__ */ React16.createElement("span", { style: { color: "var(--amber)" } }, "J\xE1 pesado nesta data com ", outros.map((x) => fmtKg(x.peso)).join(" e "), ".", l.forcar ? " Vai gravar os dois pesos (2x)." : " Verifique a duplicidade.", !l.forcar && /* @__PURE__ */ React16.createElement("button", { className: "btn quiet sm", style: { marginLeft: 8, minHeight: 32 }, onClick: () => setLinhas((ls) => ls.map((x) => x.k === l.k ? { ...x, forcar: true } : x)) }, "Lan\xE7ar mesmo assim")), aviso && /* @__PURE__ */ React16.createElement("span", { style: { color: "var(--amber)" } }, aviso)), /* @__PURE__ */ React16.createElement("div", { className: "p" }, fmtKg(l.peso)), /* @__PURE__ */ React16.createElement("button", { className: "x-peq", onClick: () => setLinhas((ls) => ls.filter((x) => x.k !== l.k)), "aria-label": `Tirar ${l.brinco} da lista` }, /* @__PURE__ */ React16.createElement(Trash24, { size: 17 })));
  })), /* @__PURE__ */ React16.createElement("button", { className: "btn wide", style: { marginTop: 12 }, onClick: gravar, disabled: gravando || travado || linhas.length === 0 }, gravando ? /* @__PURE__ */ React16.createElement(Loader210, { size: 18, className: "spin" }) : /* @__PURE__ */ React16.createElement(Save9, { size: 18 }), gravando ? "Gravando..." : modo === "desmama" ? `Gravar ${linhas.length} desmama(s)` : `Gravar ${linhas.length} pesagem(ns)`), resultado && /* @__PURE__ */ React16.createElement(Aviso, { tipo: "ok" }, resultado.modo === "desmama" ? `${resultado.qtd} desmama(s) gravada(s)` : `${resultado.qtd} pesagem(ns) gravada(s)`, resultado.novilhas > 0 ? `; ${resultado.novilhas} novilha(s) entraram no lote de novilhas` : "", ".", resultado.offline ? " Sem internet: ficou guardado neste celular e vai para a planilha quando a internet voltar." : "", modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : "", resultado.rejeitados.length > 0 && /* @__PURE__ */ React16.createElement(React16.Fragment, null, /* @__PURE__ */ React16.createElement("div", { style: { marginTop: 6 } }, "N\xE3o gravadas (continuam na lista):"), /* @__PURE__ */ React16.createElement("ul", { style: { margin: "4px 0 0", paddingLeft: 18 } }, resultado.rejeitados.map((t, i) => /* @__PURE__ */ React16.createElement("li", { key: i }, t))))), /* @__PURE__ */ React16.createElement("div", { className: "sheet", style: { marginTop: 16, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" } }, /* @__PURE__ */ React16.createElement("span", { style: { fontSize: 14 }, "data-testid": "resumo-dia" }, doDia && doDia.secoes[0].linhas.length ? /* @__PURE__ */ React16.createElement(React16.Fragment, null, "J\xE1 gravados em ", /* @__PURE__ */ React16.createElement("b", null, formatarDataBR(data)), ": ", doDia.resumo[0].valor, " pesagem(ns), m\xE9dia ", doDia.resumo[3].valor, doDia.resumo[6].valor !== "nenhum" ? /* @__PURE__ */ React16.createElement(React16.Fragment, null, ", ", /* @__PURE__ */ React16.createElement("b", { style: { color: "var(--amber)" } }, "2x: ", doDia.resumo[6].valor)) : null) : /* @__PURE__ */ React16.createElement(React16.Fragment, null, "Nada gravado em ", data ? formatarDataBR(data) : "esta data", " ainda.")), /* @__PURE__ */ React16.createElement("button", { className: "btn ghost sm", onClick: pdfDoDia, disabled: !doDia || !doDia.secoes[0].linhas.length || gerandoPdf }, gerandoPdf ? /* @__PURE__ */ React16.createElement(Loader210, { size: 16, className: "spin" }) : /* @__PURE__ */ React16.createElement(FileDown5, { size: 16 }), " PDF da pesagem")), /* @__PURE__ */ React16.createElement("details", { className: "ferr noprint" }, /* @__PURE__ */ React16.createElement("summary", null, /* @__PURE__ */ React16.createElement(ClipboardPaste2, { size: 15, style: { marginRight: 8 } }), " Colar uma lista pronta"), /* @__PURE__ */ React16.createElement("div", { className: "in2", style: { display: "block" } }, /* @__PURE__ */ React16.createElement("p", { className: "sub" }, "Um animal por linha: o brinco e o peso (ex.: 6532 245). Depois toque em adicionar e confira a lista antes de gravar."), /* @__PURE__ */ React16.createElement("div", { className: "fld" }, /* @__PURE__ */ React16.createElement("label", { htmlFor: "pesar-colar" }, "Lista"), /* @__PURE__ */ React16.createElement("textarea", { id: "pesar-colar", style: { minHeight: 120 }, value: colar, onChange: (e) => setColar(e.target.value), placeholder: "6532 245\n6533 250,5", spellCheck: false })), /* @__PURE__ */ React16.createElement("button", { className: "btn quiet", onClick: adicionarColado, disabled: !colar.trim() }, "Adicionar \xE0 lista"))));
}

// src/telas/CriasParaVender.jsx
import React17, { useMemo as useMemo14, useState as useState16 } from "react";
import { ShoppingCart as ShoppingCart2, Save as Save10 } from "lucide-react";
var txt = (v) => v === null || v === void 0 ? "" : String(v);
function ParaVender({ crias, dados, onSalvarConfig, onVender, modoTeste, hoje }) {
  const cfg = useMemo14(() => configCompleta(dados.config), [dados.config]);
  const [metaPeso, setMetaPeso] = useState16(txt(cfg.metaPesoMacho));
  const [metaQtd, setMetaQtd] = useState16(txt(cfg.metaQtdMacho));
  const [pesoMatriz, setPesoMatriz] = useState16(txt(cfg.pesoMatriz));
  const [salvo, setSalvo] = useState16("");
  const [erro, setErro] = useState16("");
  const [valorKg, setValorKg] = useState16("");
  const [filtro, setFiltro] = useState16(cfg.metaPesoMacho ? "prontos" : "todos");
  const [marcados, setMarcados] = useState16(() => /* @__PURE__ */ new Set());
  const an = useMemo14(() => analiseMachos(crias, dados.config), [crias, dados.config]);
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
  return /* @__PURE__ */ React17.createElement("section", { className: "sheet pad" }, /* @__PURE__ */ React17.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Para vender"), /* @__PURE__ */ React17.createElement("p", { className: "sub" }, "Defina o peso alvo e a quantidade para negociar. A tela mostra quais machos j\xE1 est\xE3o no peso e quando os outros devem chegar."), /* @__PURE__ */ React17.createElement("div", { className: "rapido" }, /* @__PURE__ */ React17.createElement("div", { className: "grid2" }, /* @__PURE__ */ React17.createElement("div", { className: "fld" }, /* @__PURE__ */ React17.createElement("label", { htmlFor: "meta-peso" }, "Peso alvo dos machos (kg)"), /* @__PURE__ */ React17.createElement("input", { id: "meta-peso", type: "text", inputMode: "decimal", value: metaPeso, onChange: (e) => {
    setMetaPeso(e.target.value);
    setSalvo("");
  }, placeholder: "ex.: 250" })), /* @__PURE__ */ React17.createElement("div", { className: "fld" }, /* @__PURE__ */ React17.createElement("label", { htmlFor: "meta-qtd" }, "Quantidade para negociar"), /* @__PURE__ */ React17.createElement("input", { id: "meta-qtd", type: "text", inputMode: "numeric", value: metaQtd, onChange: (e) => {
    setMetaQtd(e.target.value);
    setSalvo("");
  }, placeholder: "ex.: 30" }))), /* @__PURE__ */ React17.createElement("div", { className: "fld" }, /* @__PURE__ */ React17.createElement("label", { htmlFor: "meta-matriz" }, "Peso para a novilha virar matriz (kg)"), /* @__PURE__ */ React17.createElement("input", { id: "meta-matriz", type: "text", inputMode: "decimal", value: pesoMatriz, onChange: (e) => {
    setPesoMatriz(e.target.value);
    setSalvo("");
  } })), /* @__PURE__ */ React17.createElement("button", { className: "btn quiet", onClick: salvarMetas }, /* @__PURE__ */ React17.createElement(Save10, { size: 17 }), " Salvar metas"), salvo && /* @__PURE__ */ React17.createElement(Aviso, { tipo: "ok" }, salvo, modoTeste ? " (modo teste: s\xF3 na tela)" : ""), erro && /* @__PURE__ */ React17.createElement(Aviso, null, erro)), /* @__PURE__ */ React17.createElement(Kpis, { itens: [
    { rotulo: "Machos no rebanho", valor: an.total, sub: `${an.semPeso} sem pesagem` },
    { rotulo: "Peso m\xE9dio", valor: an.pesoMedio === null ? "\u2014" : fmtKg(an.pesoMedio), pequeno: true },
    { rotulo: an.cfg.metaPesoMacho ? `No peso (${fmtNum(an.cfg.metaPesoMacho, 0)} kg ou mais)` : "No peso alvo", valor: an.cfg.metaPesoMacho ? an.prontos : "\u2014", cor: an.prontos ? "var(--green)" : void 0, sub: an.cfg.metaQtdMacho ? `meta ${an.cfg.metaQtdMacho} \xB7 faltam ${an.faltamQtd}` : void 0 },
    { rotulo: "Chegam ao peso", valor: an.cfg.metaPesoMacho ? `${an.prox30} em 30d` : "\u2014", pequeno: true, sub: an.cfg.metaPesoMacho ? `${an.prox60} em 60 dias` : "defina o peso alvo" }
  ] }), !an.cfg.metaPesoMacho && /* @__PURE__ */ React17.createElement(Aviso, { tipo: "info" }, "Digite o peso alvo acima e salve para ver quais machos j\xE1 est\xE3o prontos."), projecao && /* @__PURE__ */ React17.createElement("p", { className: "sub", style: { marginTop: 10 } }, projecao), an.prontos > 0 && /* @__PURE__ */ React17.createElement("div", { className: "rapido", style: { marginTop: 12 } }, /* @__PURE__ */ React17.createElement("div", { className: "grid2" }, /* @__PURE__ */ React17.createElement("div", { className: "fld" }, /* @__PURE__ */ React17.createElement("label", { htmlFor: "vkg-est" }, "Valor do kg para uma estimativa (R$)"), /* @__PURE__ */ React17.createElement("input", { id: "vkg-est", type: "text", inputMode: "decimal", value: valorKg, onChange: (e) => setValorKg(e.target.value), placeholder: "ex.: 12,50" })), /* @__PURE__ */ React17.createElement("div", { className: "fld" }, /* @__PURE__ */ React17.createElement("span", { className: "lbl", style: { display: "block", font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 6 } }, "Prontos hoje"), /* @__PURE__ */ React17.createElement("div", { style: { fontSize: 15, lineHeight: 1.4 } }, /* @__PURE__ */ React17.createElement("b", null, an.prontos), " animais \xB7 ", /* @__PURE__ */ React17.createElement("b", null, fmtKg(an.kgProntos)), " (m\xE9dia ", fmtKg(an.pesoMedioProntos), ")", vkg > 0 && /* @__PURE__ */ React17.createElement("div", null, "\u2248 ", /* @__PURE__ */ React17.createElement("b", null, fmtBRL(an.kgProntos * vkg)), " (estimativa)"))))), /* @__PURE__ */ React17.createElement("div", { className: "seg", style: { margin: "16px 0 10px" }, role: "group", "aria-label": "Quais machos mostrar" }, /* @__PURE__ */ React17.createElement("button", { "aria-pressed": filtro === "prontos", onClick: () => setFiltro("prontos") }, "Prontos ", an.prontos), /* @__PURE__ */ React17.createElement("button", { "aria-pressed": filtro === "todos", onClick: () => setFiltro("todos") }, "Todos ", an.total), /* @__PURE__ */ React17.createElement("button", { "aria-pressed": filtro === "semPeso", onClick: () => setFiltro("semPeso") }, "Sem peso ", an.semPeso)), /* @__PURE__ */ React17.createElement("div", { className: "sheet", style: { boxShadow: "none", borderRadius: 8 } }, /* @__PURE__ */ React17.createElement("div", { className: "bar-sum" }, /* @__PURE__ */ React17.createElement("span", null, linhas.length, " macho(s)"), /* @__PURE__ */ React17.createElement("span", null, escolhidos.length, " marcado(s)")), linhas.length === 0 && /* @__PURE__ */ React17.createElement("div", { className: "empty" }, filtro === "prontos" ? "Nenhum macho no peso alvo ainda." : "Nenhum macho neste filtro."), linhas.map((l) => {
    const c = l.cria;
    const faltam = an.cfg.metaPesoMacho && c.pesoAtual !== null && !l.pronto ? an.cfg.metaPesoMacho - c.pesoAtual : null;
    const status = c.pesoAtual === null ? "sem pesagem" : l.pronto ? "no peso" : `faltam ${fmtNum(faltam, 1)} kg${l.dias ? ` \xB7 ~${l.dias} dias` : ""}`;
    return /* @__PURE__ */ React17.createElement("div", { className: "sel-row cols-vender", key: c.id }, /* @__PURE__ */ React17.createElement("input", { type: "checkbox", className: "chk", checked: marcados.has(c.id), onChange: () => alternar(c.id), "aria-label": `Marcar ${c.brinco || "cria sem n\xFAmero"}`, disabled: !c.brinco }), /* @__PURE__ */ React17.createElement("span", { className: "b", style: { font: "600 17px var(--mono)" } }, c.brinco || "\u2014"), /* @__PURE__ */ React17.createElement("span", { className: "two", style: { display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 } }, /* @__PURE__ */ React17.createElement("b", { style: { fontWeight: 600, fontSize: 15 } }, fmtIdade(c.idadeDias)), /* @__PURE__ */ React17.createElement("span", { style: { color: l.pronto ? "var(--green)" : "var(--mut)" } }, "m\xE3e ", c.maeBrinco || "?", " \xB7 ", status)), /* @__PURE__ */ React17.createElement("span", { className: "r", style: { textAlign: "right", font: "600 15px var(--mono)" } }, c.pesoAtual === null ? "\u2014" : fmtKg(c.pesoAtual)), /* @__PURE__ */ React17.createElement("span", { className: "hide-s" }, /* @__PURE__ */ React17.createElement("span", { className: `pill ${l.pronto ? "pronto" : c.pesoAtual === null ? "fora" : "falta"}` }, l.pronto ? "pronto" : c.pesoAtual === null ? "sem peso" : "em ganho")), /* @__PURE__ */ React17.createElement("span", { className: "hide-s m mut" }, fmtGmd(c.gmd)));
  })), /* @__PURE__ */ React17.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 } }, /* @__PURE__ */ React17.createElement("button", { className: "btn quiet sm", onClick: marcarProntos, disabled: !prontos.length }, "Marcar todos os prontos"), /* @__PURE__ */ React17.createElement("button", { className: "btn quiet sm", onClick: () => setMarcados(/* @__PURE__ */ new Set()), disabled: !marcados.size }, "Limpar"), /* @__PURE__ */ React17.createElement("button", { className: "btn", style: { marginLeft: "auto" }, disabled: !escolhidos.length, onClick: () => onVender(escolhidos.filter((l) => l.cria.brinco).map((l) => l.cria.brinco)) }, /* @__PURE__ */ React17.createElement(ShoppingCart2, { size: 18 }), " Vender ", escolhidos.length ? `os ${escolhidos.length} marcados` : "marcados")), semNumero > 0 && /* @__PURE__ */ React17.createElement("p", { className: "sub" }, semNumero, " marcado(s) sem n\xFAmero de brinco ficam de fora da venda."));
}

// src/telas/CriasVendas.jsx
import React18, { useEffect as useEffect9, useMemo as useMemo15, useRef as useRef8, useState as useState17 } from "react";
import { Plus as Plus6, Trash2 as Trash25, ShoppingCart as ShoppingCart3, Loader2 as Loader211, ChevronDown, ChevronUp, Scale as Scale2 } from "lucide-react";
var contador = 0;
var novaLinha = (extra) => ({ k: `l${Date.now()}-${++contador}`, brinco: "", tipoAnimal: "", peso: "", tipoManual: false, ...extra });
function LinhaVenda({ n, linha, dados, hoje, crias, onMudar, onTirar, onEnterPeso }) {
  const info = useMemo15(
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
  return /* @__PURE__ */ React18.createElement("div", { className: "vlin", "data-testid": "linha-venda" }, /* @__PURE__ */ React18.createElement("div", { className: "l1" }, /* @__PURE__ */ React18.createElement("div", { className: "fld f-b" }, /* @__PURE__ */ React18.createElement("label", { htmlFor: `v-b-${linha.k}` }, "N\xFAmero ", n), /* @__PURE__ */ React18.createElement(
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
  )), /* @__PURE__ */ React18.createElement("div", { className: "fld f-p" }, /* @__PURE__ */ React18.createElement("label", { htmlFor: `v-p-${linha.k}` }, "Peso (kg) ", n), /* @__PURE__ */ React18.createElement(
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
  )), /* @__PURE__ */ React18.createElement("button", { type: "button", className: "x-peq f-x", onClick: () => onTirar(linha.k), "aria-label": `Tirar a linha ${n}` }, /* @__PURE__ */ React18.createElement(Trash25, { size: 17 }))), /* @__PURE__ */ React18.createElement("div", { className: "l2" }, /* @__PURE__ */ React18.createElement("div", { className: "fld f-t" }, /* @__PURE__ */ React18.createElement("label", { htmlFor: `v-t-${linha.k}` }, "Tipo de animal ", n), /* @__PURE__ */ React18.createElement("select", { id: `v-t-${linha.k}`, value: linha.tipoAnimal, onChange: (e) => onMudar(linha.k, "tipoAnimal", e.target.value) }, /* @__PURE__ */ React18.createElement("option", { value: "" }, "Escolha o tipo"), TIPOS_ANIMAL_VENDA.map((t) => /* @__PURE__ */ React18.createElement("option", { key: t, value: t }, t))))), texto && /* @__PURE__ */ React18.createElement("div", { className: `info${ruim ? " ruim" : ""}` }, texto));
}
function Historico({ dados }) {
  const vendas = useMemo15(() => listarVendas(dados), [dados]);
  const [abertas, setAbertas] = useState17(() => /* @__PURE__ */ new Set());
  const alternar = (id) => setAbertas((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });
  if (!vendas.length) return /* @__PURE__ */ React18.createElement("div", { className: "empty" }, "Nenhuma venda registrada ainda.");
  return /* @__PURE__ */ React18.createElement("div", { className: "sheet", "data-testid": "historico-vendas" }, vendas.map(({ venda, itens: itens2 }) => {
    const aberta = abertas.has(venda.id);
    const Seta = aberta ? ChevronUp : ChevronDown;
    return /* @__PURE__ */ React18.createElement("div", { className: "venda-hist", key: venda.id }, /* @__PURE__ */ React18.createElement("button", { type: "button", onClick: () => alternar(venda.id), "aria-expanded": aberta }, /* @__PURE__ */ React18.createElement("span", { className: "m mut", style: { fontSize: 13 } }, formatarDataBR(venda.data)), /* @__PURE__ */ React18.createElement("span", { style: { display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 } }, /* @__PURE__ */ React18.createElement("b", { style: { fontWeight: 600, fontSize: 15 } }, venda.comprador || "Sem comprador"), /* @__PURE__ */ React18.createElement("span", { style: { fontSize: 13, color: "var(--mut)" } }, venda.animais || `${venda.qtd || "?"} animais`, venda.pesoTotal ? ` \xB7 ${fmtKg(Number(venda.pesoTotal))}` : "")), /* @__PURE__ */ React18.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6, font: "600 15px var(--mono)" } }, venda.valorTotal ? fmtBRL(Number(venda.valorTotal)) : "\u2014", " ", /* @__PURE__ */ React18.createElement(Seta, { size: 16 }))), aberta && /* @__PURE__ */ React18.createElement("div", { className: "itens" }, itens2.length === 0 ? /* @__PURE__ */ React18.createElement("p", { className: "sub", style: { margin: 0 } }, "Venda antiga, sem a lista de animais.") : itens2.map((i) => /* @__PURE__ */ React18.createElement("div", { className: "item-lin", key: i.id }, /* @__PURE__ */ React18.createElement("div", { className: "t" }, /* @__PURE__ */ React18.createElement("b", null, i.brinco || "sem n\xFAmero"), /* @__PURE__ */ React18.createElement("span", null, i.tipoAnimal)), /* @__PURE__ */ React18.createElement("div", { className: "p" }, fmtKg(Number(i.peso))))), venda.valorKg ? /* @__PURE__ */ React18.createElement("p", { className: "sub", style: { margin: "8px 0 0" } }, "Valor do kg: ", fmtBRL(Number(venda.valorKg)), venda.frete ? ` \xB7 frete ${fmtBRL(Number(venda.frete))}` : "") : null));
  }));
}
function Vendas({ dados, hoje, crias, preset, onVender, modoTeste }) {
  const [data, setData] = useState17(hoje);
  const [comprador, setComprador] = useState17("");
  const [valorKg, setValorKg] = useState17("");
  const [frete, setFrete] = useState17("");
  const [linhas, setLinhas] = useState17(() => [novaLinha()]);
  const [erros, setErros] = useState17([]);
  const [confirmando, setConfirmando] = useState17(null);
  const [gravando, setGravando] = useState17(false);
  const [erroGravar, setErroGravar] = useState17("");
  const [resultado, setResultado] = useState17("");
  const [travado, setTravado] = useState17(false);
  const timer2 = useRef8(null);
  useEffect9(() => () => clearTimeout(timer2.current), []);
  useEffect9(() => {
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
  const tot = useMemo15(() => totaisVenda(itensForm, valorKg, frete), [linhas, valorKg, frete]);
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
  return /* @__PURE__ */ React18.createElement("section", { className: "sheet pad" }, /* @__PURE__ */ React18.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Vender por peso"), /* @__PURE__ */ React18.createElement("p", { className: "sub" }, "Informe o comprador e o valor do kg. Embaixo, uma linha para cada animal: o n\xFAmero, o tipo e o peso. Pode vender tamb\xE9m vacas de descarte e vacas velhas. Cada animal vendido sai do rebanho."), /* @__PURE__ */ React18.createElement("div", { className: "grid2" }, /* @__PURE__ */ React18.createElement("div", { className: "fld" }, /* @__PURE__ */ React18.createElement("label", { htmlFor: "venda-data" }, "Data da venda"), /* @__PURE__ */ React18.createElement("input", { id: "venda-data", type: "date", value: data, onChange: (e) => {
    setData(e.target.value);
    setErros([]);
  } })), /* @__PURE__ */ React18.createElement("div", { className: "fld" }, /* @__PURE__ */ React18.createElement("label", { htmlFor: "venda-comprador" }, "Comprador"), /* @__PURE__ */ React18.createElement("input", { id: "venda-comprador", type: "text", autoComplete: "off", value: comprador, onChange: (e) => {
    setComprador(e.target.value);
    setErros([]);
  } })), /* @__PURE__ */ React18.createElement("div", { className: "fld" }, /* @__PURE__ */ React18.createElement("label", { htmlFor: "venda-valor" }, "Valor do kg (R$)"), /* @__PURE__ */ React18.createElement("input", { id: "venda-valor", type: "text", inputMode: "decimal", autoComplete: "off", value: valorKg, onChange: (e) => {
    setValorKg(e.target.value);
    setErros([]);
  }, placeholder: "ex.: 12,50" })), /* @__PURE__ */ React18.createElement("div", { className: "fld" }, /* @__PURE__ */ React18.createElement("label", { htmlFor: "venda-frete" }, "Frete (R$, se houver)"), /* @__PURE__ */ React18.createElement("input", { id: "venda-frete", type: "text", inputMode: "decimal", autoComplete: "off", value: frete, onChange: (e) => setFrete(e.target.value) }))), /* @__PURE__ */ React18.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Animais da venda", /* @__PURE__ */ React18.createElement("small", null, tot.qtd, " com peso")), linhas.map((l, i) => /* @__PURE__ */ React18.createElement(LinhaVenda, { key: l.k, n: i + 1, linha: l, dados, hoje, crias, onMudar: mudarLinha, onTirar: tirarLinha, onEnterPeso: enterNoPeso })), /* @__PURE__ */ React18.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React18.createElement("button", { type: "button", className: "btn quiet", onClick: adicionarLinha }, /* @__PURE__ */ React18.createElement(Plus6, { size: 18 }), " Adicionar animal"), semPeso > 0 && /* @__PURE__ */ React18.createElement("button", { type: "button", className: "btn quiet", onClick: preencherPesos }, /* @__PURE__ */ React18.createElement(Scale2, { size: 18 }), " Usar o \xFAltimo peso dos ", semPeso, " sem peso")), /* @__PURE__ */ React18.createElement("div", { className: "totais", "data-testid": "totais-venda" }, /* @__PURE__ */ React18.createElement("div", { className: "grande" }, tot.valor > 0 ? fmtBRL(tot.valor) : "R$ \u2014"), /* @__PURE__ */ React18.createElement("div", { style: { fontSize: 14.5, lineHeight: 1.5 } }, /* @__PURE__ */ React18.createElement("b", null, tot.qtd), " animal(is) \xB7 ", /* @__PURE__ */ React18.createElement("b", null, fmtKg(tot.kg)), tot.qtd ? ` (m\xE9dia ${fmtKg(tot.kgMedio)})` : "", tot.frete > 0 && /* @__PURE__ */ React18.createElement(React18.Fragment, null, " \xB7 frete ", fmtBRL(tot.frete), " \xB7 l\xEDquido ", /* @__PURE__ */ React18.createElement("b", null, fmtBRL(tot.liquido)))), tot.porTipo.length > 0 && /* @__PURE__ */ React18.createElement("div", { style: { fontSize: 13.5, color: "var(--mut)", marginTop: 4 } }, tot.porTipo.map((t) => `${t.qtd} ${t.tipo} (${fmtKg(t.kg)})`).join(" \xB7 "))), erros.length > 0 && /* @__PURE__ */ React18.createElement(Aviso, null, "Falta ajustar:", /* @__PURE__ */ React18.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 } }, erros.map((t, i) => /* @__PURE__ */ React18.createElement("li", { key: i }, t)))), resultado && /* @__PURE__ */ React18.createElement(Aviso, { tipo: "ok" }, resultado, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), /* @__PURE__ */ React18.createElement("button", { className: "btn wide", onClick: conferir, disabled: travado || gravando }, /* @__PURE__ */ React18.createElement(ShoppingCart3, { size: 18 }), " Conferir e vender"), /* @__PURE__ */ React18.createElement("h3", { className: "h2", style: { fontSize: 18, marginTop: 28 } }, "Vendas anteriores"), /* @__PURE__ */ React18.createElement(Historico, { dados }), confirmando && /* @__PURE__ */ React18.createElement(Modal, { titulo: "Confirmar a venda", onClose: () => {
    if (!gravando) {
      setConfirmando(null);
      setErroGravar("");
    }
  } }, /* @__PURE__ */ React18.createElement("div", { "data-testid": "confirmar-venda" }, /* @__PURE__ */ React18.createElement("p", { style: { margin: "0 0 6px", fontSize: 15.5, lineHeight: 1.5 } }, /* @__PURE__ */ React18.createElement("b", null, confirmando.tot.qtd), " animal(is) para ", /* @__PURE__ */ React18.createElement("b", null, confirmando.form.comprador.trim()), " em ", formatarDataBR(confirmando.form.data), "."), /* @__PURE__ */ React18.createElement("div", { className: "totais", style: { marginTop: 6 } }, /* @__PURE__ */ React18.createElement("div", { className: "grande" }, fmtBRL(confirmando.tot.valor)), /* @__PURE__ */ React18.createElement("div", { style: { fontSize: 14.5, lineHeight: 1.5 } }, fmtKg(confirmando.tot.kg), " (m\xE9dia ", fmtKg(confirmando.tot.kgMedio), ") a ", fmtBRL(numPeso(confirmando.form.valorKg)), " o kg", confirmando.tot.frete > 0 && /* @__PURE__ */ React18.createElement(React18.Fragment, null, " \xB7 frete ", fmtBRL(confirmando.tot.frete), " \xB7 l\xEDquido ", fmtBRL(confirmando.tot.liquido))), /* @__PURE__ */ React18.createElement("div", { style: { fontSize: 13.5, color: "var(--mut)", marginTop: 4 } }, confirmando.tot.porTipo.map((t) => `${t.qtd} ${t.tipo}`).join(" \xB7 "))), confirmando.avisos.length > 0 && /* @__PURE__ */ React18.createElement(Aviso, { tipo: "info" }, /* @__PURE__ */ React18.createElement("ul", { style: { margin: 0, paddingLeft: 18 } }, confirmando.avisos.map((t, i) => /* @__PURE__ */ React18.createElement("li", { key: i }, t)))), /* @__PURE__ */ React18.createElement("p", { className: "sub" }, "Os animais com n\xFAmero cadastrado saem do rebanho ao confirmar."), erroGravar && /* @__PURE__ */ React18.createElement(Aviso, null, erroGravar), /* @__PURE__ */ React18.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React18.createElement("button", { className: "btn", onClick: confirmar, disabled: gravando }, gravando ? /* @__PURE__ */ React18.createElement(Loader211, { size: 18, className: "spin" }) : /* @__PURE__ */ React18.createElement(ShoppingCart3, { size: 18 }), " ", gravando ? "Gravando..." : "Confirmar venda"), /* @__PURE__ */ React18.createElement("button", { className: "btn quiet", onClick: () => {
    setConfirmando(null);
    setErroGravar("");
  }, disabled: gravando }, "Voltar")))));
}

// src/telas/CriasNovilhas.jsx
import React19, { useMemo as useMemo16, useState as useState18 } from "react";
import { ShoppingCart as ShoppingCart4 } from "lucide-react";
var ROTULO_DESTINO = { "A definir": "A definir", Matriz: "Virar matriz", Venda: "Para venda" };
var FILTROS = [["aptas", "Aptas"], ["todas", "Todas"], ["A definir", "A definir"], ["Matriz", "Matriz"], ["Venda", "Venda"]];
function FichaNovilha({ n, cfg, onDestino, onVender, onFechar }) {
  const hist = [...n.pontos].reverse();
  const status = n.pesoAtual === null ? "sem pesagem" : n.apta ? `apta (${fmtNum(cfg.pesoMatriz, 0)} kg ou mais)` : `faltam ${fmtNum(n.faltam, 1)} kg${n.diasParaApta ? ` \xB7 ~${n.diasParaApta} dias` : ""}`;
  return /* @__PURE__ */ React19.createElement(Modal, { titulo: `Novilha ${n.brinco}`, onClose: onFechar, rotulo: `Novilha ${n.brinco}` }, /* @__PURE__ */ React19.createElement(Lead, { rotulo: "Nascimento", valor: n.nascData ? `${formatarDataBR(n.nascData)} \xB7 ${fmtIdade(n.idadeDias)}` : "\u2014" }), /* @__PURE__ */ React19.createElement(Lead, { rotulo: "\xDAltimo peso", valor: n.pesoAtual === null ? "sem pesagem" : `${fmtKg(n.pesoAtual)} em ${formatarDataBR(n.pesoData)}` }), /* @__PURE__ */ React19.createElement(Lead, { rotulo: "Ganho recente", valor: fmtGmd(n.gmd) }), /* @__PURE__ */ React19.createElement(Lead, { rotulo: "Para virar matriz", valor: status, cor: n.apta ? "var(--green)" : void 0 }), /* @__PURE__ */ React19.createElement(Lead, { rotulo: "Destino", valor: ROTULO_DESTINO[n.destino] || n.destino }), /* @__PURE__ */ React19.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Pesagens", /* @__PURE__ */ React19.createElement("small", null, n.pontos.length, " registro(s)")), hist.length === 0 ? /* @__PURE__ */ React19.createElement("p", { className: "sub" }, "Nenhuma pesagem ainda.") : /* @__PURE__ */ React19.createElement("ul", { className: "hist", "data-testid": "pesagens-novilha" }, hist.map((p) => /* @__PURE__ */ React19.createElement("li", { key: p.id }, /* @__PURE__ */ React19.createElement("span", null, fmtKg(p.peso), p.fonte !== "Pesagem" ? ` \xB7 ${p.fonte.toLowerCase()}` : ""), /* @__PURE__ */ React19.createElement("span", null, formatarDataBR(p.data))))), /* @__PURE__ */ React19.createElement("div", { className: "rapido", style: { marginTop: 14 } }, /* @__PURE__ */ React19.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Destino desta novilha"), /* @__PURE__ */ React19.createElement("div", { className: "seg", role: "group", "aria-label": "Destino da novilha" }, DESTINOS_NOVILHA.map((d) => /* @__PURE__ */ React19.createElement("button", { key: d, type: "button", "aria-pressed": n.destino === d, onClick: () => onDestino([n], d) }, ROTULO_DESTINO[d])))), /* @__PURE__ */ React19.createElement("button", { className: "btn wide", onClick: () => onVender([n.brinco]) }, /* @__PURE__ */ React19.createElement(ShoppingCart4, { size: 18 }), " Vender esta novilha"));
}
function Novilhas({ dados, hoje, onSalvarMatriz, onVender }) {
  const cfg = useMemo16(() => configCompleta(dados.config), [dados.config]);
  const lista3 = useMemo16(() => listarNovilhas(dados, dados.config, hoje), [dados, hoje]);
  const [filtro, setFiltro] = useState18("todas");
  const [marcadas, setMarcadas] = useState18(() => /* @__PURE__ */ new Set());
  const [aberta, setAberta] = useState18(null);
  const [msg, setMsg] = useState18("");
  const aptas = lista3.filter((n) => n.apta);
  const pesadas = lista3.filter((n) => n.pesoAtual !== null);
  const pesoMedio = pesadas.length ? pesadas.reduce((s, n) => s + n.pesoAtual, 0) / pesadas.length : null;
  const semPeso = lista3.length - pesadas.length;
  const mostradas = lista3.filter((n) => filtro === "todas" ? true : filtro === "aptas" ? n.apta : n.destino === filtro);
  const escolhidas = lista3.filter((n) => marcadas.has(n.matriz.id));
  const fichaAberta = aberta ? lista3.find((n) => n.matriz.id === aberta) || null : null;
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
  return /* @__PURE__ */ React19.createElement("section", { className: "sheet pad" }, /* @__PURE__ */ React19.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Novilhas"), /* @__PURE__ */ React19.createElement("p", { className: "sub" }, "F\xEAmeas desmamadas em recria. A partir de ", fmtNum(cfg.pesoMatriz, 0), " kg a novilha est\xE1 apta a virar matriz. Voc\xEA decide o destino de cada uma. (Para mudar o peso de corte, use a aba Para vender.)"), /* @__PURE__ */ React19.createElement(Kpis, { itens: [
    { rotulo: "Novilhas no lote", valor: lista3.length, sub: `${semPeso} sem pesagem` },
    { rotulo: `Aptas (${fmtNum(cfg.pesoMatriz, 0)} kg ou mais)`, valor: aptas.length, cor: aptas.length ? "var(--green)" : void 0 },
    { rotulo: "Peso m\xE9dio", valor: pesoMedio === null ? "\u2014" : fmtKg(pesoMedio), pequeno: true },
    { rotulo: "Destino", valor: `${lista3.filter((n) => n.destino === "Matriz").length} matriz`, pequeno: true, sub: `${lista3.filter((n) => n.destino === "Venda").length} venda \xB7 ${lista3.filter((n) => n.destino === "A definir").length} a definir` }
  ] }), lista3.length === 0 && /* @__PURE__ */ React19.createElement(Aviso, { tipo: "info" }, "Ainda n\xE3o h\xE1 novilhas no lote. Elas entram aqui quando uma f\xEAmea \xE9 desmamada (aba Pesar, modo Desmama)."), lista3.length > 0 && /* @__PURE__ */ React19.createElement(React19.Fragment, null, /* @__PURE__ */ React19.createElement("div", { className: "seg", style: { margin: "16px 0 10px", flexWrap: "wrap" }, role: "group", "aria-label": "Quais novilhas mostrar" }, FILTROS.map(([id, rot]) => /* @__PURE__ */ React19.createElement("button", { key: id, type: "button", "aria-pressed": filtro === id, onClick: () => setFiltro(id), style: { minWidth: 86 } }, rot, " ", id === "aptas" ? aptas.length : id === "todas" ? lista3.length : lista3.filter((n) => n.destino === id).length))), /* @__PURE__ */ React19.createElement("div", { className: "sheet", style: { boxShadow: "none", borderRadius: 8 } }, /* @__PURE__ */ React19.createElement("div", { className: "bar-sum" }, /* @__PURE__ */ React19.createElement("span", null, mostradas.length, " novilha(s)"), /* @__PURE__ */ React19.createElement("span", null, escolhidas.length, " marcada(s)")), mostradas.length === 0 && /* @__PURE__ */ React19.createElement("div", { className: "empty" }, "Nenhuma novilha neste filtro."), mostradas.map((n) => {
    const status = n.pesoAtual === null ? "sem pesagem" : n.apta ? "apta para matriz" : `faltam ${fmtNum(n.faltam, 1)} kg${n.diasParaApta ? ` \xB7 ~${n.diasParaApta} dias` : ""}`;
    return /* @__PURE__ */ React19.createElement("div", { className: "sel-row cols-nov", key: n.matriz.id }, /* @__PURE__ */ React19.createElement("input", { type: "checkbox", className: "chk", checked: marcadas.has(n.matriz.id), onChange: () => alternar(n.matriz.id), "aria-label": `Marcar a novilha ${n.brinco}` }), /* @__PURE__ */ React19.createElement(
      "button",
      {
        type: "button",
        onClick: () => setAberta(n.matriz.id),
        "aria-label": `Abrir a novilha ${n.brinco}`,
        style: { background: "transparent", border: "none", textAlign: "left", font: "600 17px var(--mono)", minHeight: 48, padding: 0, color: "inherit" }
      },
      n.brinco
    ), /* @__PURE__ */ React19.createElement("span", { style: { display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 } }, /* @__PURE__ */ React19.createElement("b", { style: { fontWeight: 600, fontSize: 15 } }, fmtIdade(n.idadeDias)), /* @__PURE__ */ React19.createElement("span", { style: { color: n.apta ? "var(--green)" : "var(--mut)" } }, ROTULO_DESTINO[n.destino] || n.destino, " \xB7 ", status)), /* @__PURE__ */ React19.createElement("span", { className: "r", style: { textAlign: "right", font: "600 15px var(--mono)" } }, n.pesoAtual === null ? "\u2014" : fmtKg(n.pesoAtual)), /* @__PURE__ */ React19.createElement("span", { className: "hide-s" }, /* @__PURE__ */ React19.createElement("span", { className: `pill ${n.apta ? "pronto" : n.pesoAtual === null ? "fora" : "falta"}` }, n.apta ? "apta" : n.pesoAtual === null ? "sem peso" : "em ganho")), /* @__PURE__ */ React19.createElement("span", { className: "hide-s m mut" }, fmtGmd(n.gmd)));
  })), /* @__PURE__ */ React19.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 } }, /* @__PURE__ */ React19.createElement("button", { type: "button", className: "btn quiet sm", onClick: marcarAptas, disabled: !aptas.length }, "Marcar as aptas"), /* @__PURE__ */ React19.createElement("button", { type: "button", className: "btn quiet sm", onClick: () => setMarcadas(/* @__PURE__ */ new Set()), disabled: !marcadas.size }, "Limpar")), /* @__PURE__ */ React19.createElement("div", { className: "rapido", style: { marginTop: 12 } }, /* @__PURE__ */ React19.createElement("div", { className: "lbl", style: { font: "600 11.5px var(--mono)", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 8 } }, "Destino das ", escolhidas.length, " marcada(s)"), /* @__PURE__ */ React19.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, DESTINOS_NOVILHA.map((d) => /* @__PURE__ */ React19.createElement("button", { key: d, type: "button", className: "btn quiet", disabled: !escolhidas.length, onClick: () => destinoPara(escolhidas, d) }, ROTULO_DESTINO[d])), /* @__PURE__ */ React19.createElement("button", { type: "button", className: "btn", disabled: !escolhidas.length, onClick: () => venderNovilhas(escolhidas.map((n) => n.brinco)) }, /* @__PURE__ */ React19.createElement(ShoppingCart4, { size: 18 }), " Vender marcadas")))), msg && /* @__PURE__ */ React19.createElement(Aviso, { tipo: "ok", onClose: () => setMsg("") }, msg), fichaAberta && /* @__PURE__ */ React19.createElement(FichaNovilha, { n: fichaAberta, cfg, onDestino: destinoPara, onVender: venderNovilhas, onFechar: () => setAberta(null) }));
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
  const [aba, setAba] = useState19("lista");
  const [vendaPreset, setVendaPreset] = useState19(null);
  const [vendasAberta, setVendasAberta] = useState19(false);
  const crias = useMemo17(() => listarCrias(dados, hoje), [dados, hoje]);
  const abas = [
    { id: "lista", label: "Crias" },
    { id: "pesar", label: "Pesar" },
    ...ownerMode ? [{ id: "vender", label: "Para vender" }, { id: "novilhas", label: "Novilhas" }, { id: "vendas", label: "Vendas" }] : []
  ];
  useEffect10(() => {
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
  return /* @__PURE__ */ React20.createElement("div", { className: "wrap" }, /* @__PURE__ */ React20.createElement("div", { className: "head" }, /* @__PURE__ */ React20.createElement("div", null, /* @__PURE__ */ React20.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React20.createElement("h1", null, "Crias"))), /* @__PURE__ */ React20.createElement(IndexTabs, { tabs: abas, value: aba, onChange: mudarAba, rotulo: "Crias" }), aba === "lista" && /* @__PURE__ */ React20.createElement(
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
  ), aba === "pesar" && /* @__PURE__ */ React20.createElement(Pesar, { dados, hoje, crias, ownerMode, modoTeste, onGravarLote }), aba === "vender" && ownerMode && /* @__PURE__ */ React20.createElement(ParaVender, { crias, dados, hoje, onSalvarConfig, onVender: irParaVenda, modoTeste }), aba === "novilhas" && ownerMode && /* @__PURE__ */ React20.createElement(Novilhas, { dados, hoje, onSalvarMatriz, onVender: irParaVenda }), ownerMode && vendasAberta && /* @__PURE__ */ React20.createElement("div", { hidden: aba !== "vendas" }, /* @__PURE__ */ React20.createElement(Vendas, { dados, hoje, crias, preset: vendaPreset, onVender, modoTeste })));
}

// src/telas/Rebanho.jsx
import React22, { useMemo as useMemo18, useState as useState21 } from "react";
import { Search as Search6, Lock, Save as Save12 } from "lucide-react";

// src/telas/Touros.jsx
import React21, { useState as useState20 } from "react";
import { Plus as Plus7, Save as Save11 } from "lucide-react";
var CAMPOS_SEMEN = [
  ["fornecedor", "Central / fornecedor"],
  ["codigoCentral", "C\xF3digo do touro na central"],
  ["partida", "Partida (lote da palheta)"],
  ["tipoSemen", "Tipo de s\xEAmen", TIPOS_SEMEN],
  ["doses", "Doses compradas", "num"],
  ["ajusteDoses", "Ajuste de doses (perdidas: use negativo)", "num"],
  ["dataCompra", "Data da compra", "date"],
  ["custoDose", "Custo por dose (R$)", "num", true],
  ["notaFiscal", "Nota fiscal", "txt", true],
  ["botijao", "Botij\xE3o"],
  ["caneca", "Caneca"],
  ["facilidadeParto", "Bom para novilha (parto f\xE1cil)?", ["Sim", "N\xE3o", "N\xE3o sei"]],
  ["registro", "Registro geneal\xF3gico (RGD)"],
  ["deps", "DEPs / avalia\xE7\xE3o gen\xE9tica (resumo ou link do cat\xE1logo)"]
];
var CAMPOS_VIVO = [
  ["brinco", "Brinco / n\xFAmero"],
  ["dataNascimento", "Data de nascimento", "date"],
  ["origem", "Origem", ORIGENS_TOURO],
  ["vendedor", "Comprado de"],
  ["dataCompra", "Data da compra", "date"],
  ["valorCompra", "Valor da compra (R$)", "num", true],
  ["registro", "Registro geneal\xF3gico (RGD)"],
  ["pai", "Pai"],
  ["mae", "M\xE3e"],
  ["lote", "Lote / pasto onde est\xE1"],
  ["pesoAtual", "Peso (kg)", "num"],
  ["andrologicoData", "Exame androl\xF3gico: data", "date"],
  ["andrologicoResultado", "Resultado do exame", ["Apto", "Apto com restri\xE7\xE3o", "Inapto"]],
  ["circEscrotal", "Circunfer\xEAncia escrotal (cm)", "num"],
  ["andrologicoVet", "Veterin\xE1rio do exame"]
];
function FormTouro({ inicial: inicial2, onSalvar, onFechar }) {
  const [f, setF] = useState20(() => ({ tipo: "", situacao: "Ativo", ...inicial2 || {} }));
  const [erro, setErro] = useState20("");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const campos = f.tipo === "S\xEAmen" ? CAMPOS_SEMEN : f.tipo === "Touro vivo" ? CAMPOS_VIVO : [];
  function salvar2() {
    const e = validarTouro(f);
    if (e.length) {
      setErro(e.join(" "));
      return;
    }
    onSalvar(prepararTouro(f, inicial2 && inicial2.id ? inicial2 : null));
  }
  return /* @__PURE__ */ React21.createElement(Modal, { titulo: inicial2 && inicial2.id ? `Alterar ${inicial2.nome}` : "Cadastrar touro ou s\xEAmen", onClose: onFechar }, /* @__PURE__ */ React21.createElement("div", { "data-testid": "form-touro" }, /* @__PURE__ */ React21.createElement(Rotulo, null, "\xC9 s\xEAmen ou touro vivo?"), /* @__PURE__ */ React21.createElement("div", { className: "seg", style: { marginBottom: 12 } }, TIPOS_TOURO.map((t) => /* @__PURE__ */ React21.createElement("button", { key: t, type: "button", "aria-pressed": f.tipo === t, onClick: () => set("tipo", t) }, t))), /* @__PURE__ */ React21.createElement("div", { className: "grid2" }, /* @__PURE__ */ React21.createElement("div", { className: "fld" }, /* @__PURE__ */ React21.createElement("label", { htmlFor: "tr-nome" }, "Nome *"), /* @__PURE__ */ React21.createElement("input", { id: "tr-nome", value: f.nome || "", onChange: (e) => set("nome", e.target.value) })), /* @__PURE__ */ React21.createElement("div", { className: "fld" }, /* @__PURE__ */ React21.createElement("label", { htmlFor: "tr-raca" }, "Ra\xE7a"), /* @__PURE__ */ React21.createElement("input", { id: "tr-raca", value: f.raca || "", onChange: (e) => set("raca", e.target.value) })), campos.map(([k, rot, tipo]) => /* @__PURE__ */ React21.createElement("div", { className: "fld", key: k }, /* @__PURE__ */ React21.createElement("label", { htmlFor: `tr-${k}` }, rot), Array.isArray(tipo) ? /* @__PURE__ */ React21.createElement("select", { id: `tr-${k}`, value: f[k] || "", onChange: (e) => set(k, e.target.value) }, /* @__PURE__ */ React21.createElement("option", { value: "" }, "\u2014"), tipo.map((o) => /* @__PURE__ */ React21.createElement("option", { key: o }, o))) : /* @__PURE__ */ React21.createElement("input", { id: `tr-${k}`, type: tipo === "date" ? "date" : "text", inputMode: tipo === "num" ? "decimal" : void 0, value: f[k] ?? "", onChange: (e) => set(k, e.target.value) }))), f.tipo && /* @__PURE__ */ React21.createElement("div", { className: "fld" }, /* @__PURE__ */ React21.createElement("label", { htmlFor: "tr-sit" }, "Situa\xE7\xE3o"), /* @__PURE__ */ React21.createElement("select", { id: "tr-sit", value: f.situacao || "Ativo", onChange: (e) => set("situacao", e.target.value) }, /* @__PURE__ */ React21.createElement("option", null, "Ativo"), /* @__PURE__ */ React21.createElement("option", null, "Inativo"))), f.situacao === "Inativo" && /* @__PURE__ */ React21.createElement(React21.Fragment, null, /* @__PURE__ */ React21.createElement("div", { className: "fld" }, /* @__PURE__ */ React21.createElement("label", { htmlFor: "tr-saida" }, "Data da sa\xEDda"), /* @__PURE__ */ React21.createElement("input", { id: "tr-saida", type: "date", value: f.dataSaida || "", onChange: (e) => set("dataSaida", e.target.value) })), /* @__PURE__ */ React21.createElement("div", { className: "fld" }, /* @__PURE__ */ React21.createElement("label", { htmlFor: "tr-mot" }, "Motivo da sa\xEDda"), /* @__PURE__ */ React21.createElement("input", { id: "tr-mot", value: f.motivoSaida || "", onChange: (e) => set("motivoSaida", e.target.value) })))), /* @__PURE__ */ React21.createElement("div", { className: "fld" }, /* @__PURE__ */ React21.createElement("label", { htmlFor: "tr-obs" }, "Observa\xE7\xF5es"), /* @__PURE__ */ React21.createElement("input", { id: "tr-obs", value: f.observacoes || "", onChange: (e) => set("observacoes", e.target.value) })), erro && /* @__PURE__ */ React21.createElement(Aviso, null, erro), /* @__PURE__ */ React21.createElement("button", { className: "btn wide", onClick: salvar2 }, /* @__PURE__ */ React21.createElement(Save11, { size: 18 }), " Salvar")));
}
function Ficha({ t, dados, ownerMode, onAlterar, onFechar }) {
  const hoje = todayISO();
  const e = estoqueSemen(t, dados.eventos);
  const filhos = dados.eventos.filter((x) => x.tipo === "iatf" && x.touroId === t.id).length;
  const campos = (t.tipo === "Touro vivo" ? CAMPOS_VIVO : CAMPOS_SEMEN).filter(([, , , dinheiro]) => ownerMode || !dinheiro);
  return /* @__PURE__ */ React21.createElement(Modal, { titulo: t.nome, onClose: onFechar }, /* @__PURE__ */ React21.createElement(Lead, { rotulo: "Tipo", valor: t.tipo || "n\xE3o informado" }), /* @__PURE__ */ React21.createElement(Lead, { rotulo: "Ra\xE7a", valor: t.raca || "\u2014" }), /* @__PURE__ */ React21.createElement(Lead, { rotulo: "Situa\xE7\xE3o", valor: t.situacao || "Ativo" }), t.tipo !== "Touro vivo" && /* @__PURE__ */ React21.createElement(Lead, { rotulo: "Doses", valor: `${e.restantes} restam (${e.usadas} usadas de ${e.compradas}${e.ajuste ? `, ajuste ${e.ajuste}` : ""})` }), t.tipo === "Touro vivo" && t.dataNascimento && /* @__PURE__ */ React21.createElement(Lead, { rotulo: "Idade", valor: (idadeMesesDias(t.dataNascimento, hoje) || {}).texto || "\u2014" }), t.tipo === "Touro vivo" && /* @__PURE__ */ React21.createElement(Lead, { rotulo: "Androl\xF3gico", valor: t.andrologicoData ? `${formatarDataBR(t.andrologicoData)} ${t.andrologicoResultado || ""}${andrologicoVencido(t, hoje) ? " (vencido)" : ""}` : "sem exame", cor: andrologicoVencido(t, hoje) ? "var(--late)" : void 0 }), campos.filter(([k]) => t[k] !== void 0 && t[k] !== "" && !["dataNascimento", "andrologicoData", "andrologicoResultado"].includes(k)).map(([k, rot, tipo]) => /* @__PURE__ */ React21.createElement(Lead, { key: k, rotulo: rot, valor: tipo === "date" ? formatarDataBR(t[k]) : String(t[k]) })), filhos > 0 && /* @__PURE__ */ React21.createElement(Lead, { rotulo: "Insemina\xE7\xF5es com ele", valor: filhos }), t.observacoes && /* @__PURE__ */ React21.createElement("p", { className: "sub" }, t.observacoes), ownerMode && /* @__PURE__ */ React21.createElement("button", { className: "btn wide", style: { marginTop: 14 }, onClick: onAlterar }, "Alterar cadastro"));
}
function Touros({ dados, ownerMode, onSalvarTouro }) {
  const [tipo, setTipo] = useState20("todos");
  const [aberto, setAberto] = useState20(null);
  const [editando, setEditando] = useState20(null);
  const [msg, setMsg] = useState20("");
  const hoje = todayISO();
  const lista3 = dados.touros.filter((t2) => tipo === "todos" || (tipo === "vivo" ? t2.tipo === "Touro vivo" : t2.tipo !== "Touro vivo")).sort((a, b) => (a.situacao === "Inativo") - (b.situacao === "Inativo") || String(a.nome).localeCompare(String(b.nome), "pt-BR"));
  const t = aberto ? dados.touros.find((x) => x.id === aberto) : null;
  return /* @__PURE__ */ React21.createElement("section", { "data-testid": "touros" }, /* @__PURE__ */ React21.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 } }, /* @__PURE__ */ React21.createElement("div", { className: "pills", style: { margin: 0 } }, [["todos", "Todos"], ["semen", "S\xEAmen"], ["vivo", "Touros vivos"]].map(([id, r]) => /* @__PURE__ */ React21.createElement("button", { key: id, "aria-pressed": tipo === id, onClick: () => setTipo(id) }, r))), ownerMode && /* @__PURE__ */ React21.createElement("button", { className: "btn sm", onClick: () => setEditando({}) }, /* @__PURE__ */ React21.createElement(Plus7, { size: 15 }), " Cadastrar touro ou s\xEAmen")), msg && /* @__PURE__ */ React21.createElement(Aviso, { tipo: "ok", onClose: () => setMsg("") }, msg), /* @__PURE__ */ React21.createElement("div", { className: "sheet" }, lista3.length === 0 && /* @__PURE__ */ React21.createElement("div", { className: "empty" }, "Nenhum cadastrado aqui.", ownerMode ? ' Use "Cadastrar touro ou s\xEAmen".' : ""), lista3.map((x) => {
    const e = estoqueSemen(x, dados.eventos);
    const venc = andrologicoVencido(x, hoje);
    return /* @__PURE__ */ React21.createElement("button", { key: x.id, className: "led-r", style: { "--cols": "minmax(0,1fr) auto", minHeight: 62, opacity: x.situacao === "Inativo" ? 0.55 : 1 }, onClick: () => setAberto(x.id), "aria-label": `Abrir ${x.nome}` }, /* @__PURE__ */ React21.createElement("span", { className: "two" }, /* @__PURE__ */ React21.createElement("b", null, x.nome), /* @__PURE__ */ React21.createElement("span", null, [x.tipo || "tipo n\xE3o informado", x.raca, x.tipo === "Touro vivo" ? x.brinco && `brinco ${x.brinco}` : x.fornecedor, x.partida && `partida ${x.partida}`].filter(Boolean).join(" \xB7 ")), venc && /* @__PURE__ */ React21.createElement("span", { className: "late" }, "Exame androl\xF3gico ", x.andrologicoData ? "vencido" : "n\xE3o registrado")), x.tipo !== "Touro vivo" && e.compradas > 0 && /* @__PURE__ */ React21.createElement("span", { className: "r", style: { color: e.restantes <= 0 ? "var(--late)" : e.restantes <= 5 ? "var(--amber)" : "var(--green)" } }, e.restantes, " dose(s)", ownerMode && /* @__PURE__ */ React21.createElement("div", { style: { font: "500 11.5px var(--body)", color: "var(--mut)" } }, e.usadas, " de ", e.compradas, x.custoDose ? ` \xB7 ${fmtBRL(parseFloat(x.custoDose))}` : "")));
  })), t && !editando && /* @__PURE__ */ React21.createElement(Ficha, { t, dados, ownerMode, onFechar: () => setAberto(null), onAlterar: () => setEditando(t) }), editando && ownerMode && /* @__PURE__ */ React21.createElement(FormTouro, { inicial: editando, onFechar: () => setEditando(null), onSalvar: (novo) => {
    onSalvarTouro(novo);
    setEditando(null);
    setAberto(null);
    setMsg(`${novo.nome} salvo.`);
  } }));
}

// src/telas/Rebanho.jsx
function VacinasDaVaca({ m, dados }) {
  const aps = (aplicacoesPorAnimal(dados).get(m.id) || []).slice().reverse();
  const prots = protocolosDoAnimal(dados, m.id);
  const sit = situacaoVacinaVaca(dados, m);
  return /* @__PURE__ */ React22.createElement(React22.Fragment, null, sit.texto && /* @__PURE__ */ React22.createElement("div", { style: { margin: "6px 0" } }, /* @__PURE__ */ React22.createElement("span", { className: `vac-tag ${sit.nivel}` }, sit.texto)), prots.length > 0 && /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Protocolos", valor: prots.slice(0, 3).map((p) => p.nome).join(", ") }), aps.length > 0 && /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Vacinas e medicamentos", /* @__PURE__ */ React22.createElement("small", null, aps.length)), /* @__PURE__ */ React22.createElement("ul", { className: "hist", "data-testid": "vacinas-vaca" }, aps.slice(0, 12).map((a, i) => /* @__PURE__ */ React22.createElement("li", { key: i }, /* @__PURE__ */ React22.createElement("span", null, a.tipo, a.produto ? ` \xB7 ${a.produto}` : "", a.etapa ? ` (${a.etapa})` : ""), /* @__PURE__ */ React22.createElement("span", null, formatarDataBR(a.data)))))));
}
function ModalMatriz({ m, dados, ownerMode, onSalvar, onFechar }) {
  const [edit, setEdit] = useState21(false);
  const [form, setForm] = useState21({ ...m });
  const hist = useMemo18(
    () => dados.eventos.filter((e) => e.matrizId === m.id || e.tipo === "manejo" && String(e.presentes || "").split(",").includes(m.id)).sort((a, b) => (b.data || "").localeCompare(a.data || "")),
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
      lote: padronizarLote(form.lote, dados.matrizes.filter((x) => x.id !== m.id)),
      dataNascimento: form.dataNascimento || "",
      partosAnteriores: parseInt(form.partosAnteriores, 10) || 0,
      status: form.status
    });
    onFechar();
  }
  return /* @__PURE__ */ React22.createElement(Modal, { titulo: `Matriz ${m.brinco}`, onClose: onFechar, rotulo: `Matriz ${m.brinco}` }, !edit ? /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement("div", { style: { marginBottom: 6 } }, /* @__PURE__ */ React22.createElement(Tag, { status: m.status })), /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Categoria", valor: m.categoria || "\u2014" }), m.destino && /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Destino da novilha", valor: m.destino === "Matriz" ? "virar matriz" : m.destino === "Venda" ? "venda" : "a definir" }), m.status === "Vendida" && /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Baixa", valor: `Vendida${m.dataBaixa ? ` em ${formatarDataBR(m.dataBaixa)}` : ""}`, cor: "var(--mut)" }), m.status === "Morta" && /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Baixa", valor: `${m.motivoBaixa || "Morta"}${m.dataBaixa ? ` em ${formatarDataBR(m.dataBaixa)}` : ""}`, cor: "var(--late)" }), /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Ra\xE7a", valor: m.raca || "\u2014" }), /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Lote / piquete", valor: m.lote || "\u2014" }), /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Nascimento", valor: m.dataNascimento ? formatarDataBR(m.dataNascimento) : "\u2014" }), /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Partos na fazenda", valor: partos }), /* @__PURE__ */ React22.createElement(Lead, { rotulo: "Partos antes de entrar", valor: m.partosAnteriores || 0 }), /* @__PURE__ */ React22.createElement(Lead, { rotulo: "\xDAltimo parto", valor: ult ? `${formatarDataBR(ult)}${cria ? ` (cria ${cria})` : ""}` : "\u2014" }), /* @__PURE__ */ React22.createElement(VacinasDaVaca, { m, dados }), /* @__PURE__ */ React22.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Hist\xF3rico", /* @__PURE__ */ React22.createElement("small", null, hist.length, " lan\xE7amento(s)")), hist.length === 0 ? /* @__PURE__ */ React22.createElement("p", { className: "sub" }, "Nada lan\xE7ado para esta vaca ainda.") : /* @__PURE__ */ React22.createElement("ul", { className: "hist", "data-testid": "historico" }, hist.map((e) => /* @__PURE__ */ React22.createElement("li", { key: e.id }, /* @__PURE__ */ React22.createElement("span", null, descreverEvento(e, dados).replace(/ · (mãe|vaca) \S+/, "").replace(/ · \d+ animal\(is\)/, "")), /* @__PURE__ */ React22.createElement("span", null, formatarDataBR(e.data))))), m.status === "Vendida" || m.status === "Morta" ? /* @__PURE__ */ React22.createElement("p", { className: "sub", style: { marginTop: 16 } }, m.status === "Morta" ? "Animal morto: o cadastro fica guardado s\xF3 para consulta. Para corrigir a morte, use Lan\xE7ar > Morte (com a senha)." : "Animal vendido: o cadastro fica guardado s\xF3 para consulta.") : ownerMode ? /* @__PURE__ */ React22.createElement("button", { className: "btn wide", style: { marginTop: 16 }, onClick: () => setEdit(true) }, "Alterar cadastro") : /* @__PURE__ */ React22.createElement("p", { className: "sub", style: { marginTop: 16, display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React22.createElement(Lock, { size: 15, style: { flex: "none" } }), " S\xF3 o propriet\xE1rio altera o cadastro. Use o cadeado e a senha.")) : /* @__PURE__ */ React22.createElement(React22.Fragment, null, CAMPOS_EDICAO_MATRIZ.map((c) => /* @__PURE__ */ React22.createElement(Campo, { key: c.key, campo: c, value: form[c.key], onChange: (k, v) => setForm((f) => ({ ...f, [k]: v })), matrizes: [], touros: [] })), /* @__PURE__ */ React22.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React22.createElement("button", { className: "btn", style: { flex: 1 }, onClick: salvar2 }, /* @__PURE__ */ React22.createElement(Save12, { size: 17 }), " Salvar altera\xE7\xF5es"), /* @__PURE__ */ React22.createElement("button", { className: "btn quiet", onClick: () => setEdit(false) }, "Cancelar"))));
}
var COR_SITUACAO = { Cheia: "var(--green)", Vazia: "var(--amber)", Descarte: "var(--late)", Morta: "var(--late)" };
function Rebanho({ dados, ownerMode, onSalvarMatriz, onSalvarTouro }) {
  const [aba, setAba] = useState21("matrizes");
  const [filtro, setFiltro] = useState21("todos");
  const [busca, setBusca] = useState21("");
  const [aberta, setAberta] = useState21(null);
  const lista3 = useMemo18(() => {
    const q = busca.trim().toLowerCase();
    return dados.matrizes.filter((m) => (filtro === "todos" ? m.status !== "Vendida" && m.status !== "Morta" : m.status === filtro) && (!q || String(m.brinco).toLowerCase().includes(q))).slice().sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), "pt-BR", { numeric: true }));
  }, [dados.matrizes, filtro, busca]);
  const partosPorVaca = useMemo18(() => {
    const mapa = /* @__PURE__ */ new Map();
    dados.eventos.forEach((e) => {
      if (e.tipo !== "nascimento" || !e.matrizId || !e.data) return;
      if (!mapa.has(e.matrizId)) mapa.set(e.matrizId, []);
      mapa.get(e.matrizId).push(e);
    });
    mapa.forEach((l) => l.sort((a, b) => b.data.localeCompare(a.data) || String(a.brincoBezerro || "").localeCompare(String(b.brincoBezerro || ""), "pt-BR", { numeric: true })));
    return mapa;
  }, [dados.eventos]);
  const aberto = aberta ? dados.matrizes.find((m) => m.id === aberta) : null;
  const contar = (s) => dados.matrizes.filter((m) => m.status === s).length;
  const totalNoRebanho = dados.matrizes.filter((m) => m.status !== "Vendida" && m.status !== "Morta").length;
  return /* @__PURE__ */ React22.createElement("div", { className: "wrap" }, /* @__PURE__ */ React22.createElement("div", { className: "head" }, /* @__PURE__ */ React22.createElement("div", null, /* @__PURE__ */ React22.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React22.createElement("h1", null, "Rebanho"))), /* @__PURE__ */ React22.createElement(
    IndexTabs,
    {
      rotulo: "Cadastros",
      value: aba,
      onChange: setAba,
      tabs: [{ id: "matrizes", label: "Matrizes", count: totalNoRebanho }, { id: "touros", label: "Touros", count: dados.touros.length }]
    }
  ), aba === "matrizes" && /* @__PURE__ */ React22.createElement("section", { className: "sheet" }, /* @__PURE__ */ React22.createElement("label", { className: "search" }, /* @__PURE__ */ React22.createElement(Search6, null), /* @__PURE__ */ React22.createElement("input", { placeholder: "Buscar pelo brinco", "aria-label": "Buscar pelo brinco", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React22.createElement("div", { style: { padding: "10px 16px", borderBottom: "1px solid var(--line)" } }, /* @__PURE__ */ React22.createElement("div", { className: "seg", style: { flexWrap: "wrap" }, role: "group", "aria-label": "Filtrar por situa\xE7\xE3o" }, [["todos", "Todas"], ["Cheia", `Cheias ${contar("Cheia")}`], ["Vazia", `Vazias ${contar("Vazia")}`], ["Descarte", `Descarte ${contar("Descarte")}`], ...contar("Vendida") ? [["Vendida", `Vendidas ${contar("Vendida")}`]] : [], ...contar("Morta") ? [["Morta", `Mortas ${contar("Morta")}`]] : []].map(([id, rot]) => /* @__PURE__ */ React22.createElement("button", { key: id, "aria-pressed": filtro === id, onClick: () => setFiltro(id), style: { minHeight: 40, fontSize: 13, flex: "1 0 auto" } }, rot)))), /* @__PURE__ */ React22.createElement("div", { className: "led-h cols-reb" }, /* @__PURE__ */ React22.createElement("span", null, "Brinco"), /* @__PURE__ */ React22.createElement("span", null, "Categoria"), /* @__PURE__ */ React22.createElement("span", null, "Partos"), /* @__PURE__ */ React22.createElement("span", { className: "r" }, "Crias")), lista3.length === 0 && /* @__PURE__ */ React22.createElement("div", { className: "empty" }, "Nenhuma matriz encontrada."), lista3.map((m) => {
    const ps = partosPorVaca.get(m.id) || [];
    const antes = parseInt(m.partosAnteriores, 10) || 0;
    const recria = m.destino && m.status !== "Vendida" && m.status !== "Morta";
    return /* @__PURE__ */ React22.createElement("button", { key: m.id, className: "led-r cols-reb", onClick: () => setAberta(m.id), "aria-label": `Abrir matriz ${m.brinco}`, "data-testid": `reb-${m.brinco}` }, /* @__PURE__ */ React22.createElement("span", { className: "b" }, m.brinco), /* @__PURE__ */ React22.createElement("span", { className: "two" }, /* @__PURE__ */ React22.createElement("b", null, m.categoria), /* @__PURE__ */ React22.createElement("span", null, /* @__PURE__ */ React22.createElement("span", { style: { color: COR_SITUACAO[m.status] || "var(--mut)" } }, String(m.status || "").toLowerCase()), recria ? ` \xB7 recria, ${m.destino === "Matriz" ? "virar matriz" : m.destino.toLowerCase()}` : m.raca ? ` \xB7 ${m.raca}` : "")), /* @__PURE__ */ React22.createElement("span", { className: "reb-lista", "data-testid": "reb-partos" }, ps.length === 0 && !antes && /* @__PURE__ */ React22.createElement("span", { className: "mut" }, "\u2014"), ps.map((e) => /* @__PURE__ */ React22.createElement("span", { key: e.id }, formatarDataBR(e.data))), antes > 0 && /* @__PURE__ */ React22.createElement("span", { className: "mut", title: "Partos antes de entrar na fazenda" }, "+", antes, " antes")), /* @__PURE__ */ React22.createElement("span", { className: "reb-lista r", "data-testid": "reb-crias" }, ps.length === 0 && !antes && /* @__PURE__ */ React22.createElement("span", { className: "mut" }, "\u2014"), ps.map((e) => /* @__PURE__ */ React22.createElement("span", { key: e.id, className: e.brincoBezerro ? "" : "mut" }, e.brincoBezerro || "s/ n\xBA")), antes > 0 && /* @__PURE__ */ React22.createElement("span", null, "\xA0")));
  })), aba === "touros" && /* @__PURE__ */ React22.createElement(Touros, { dados, ownerMode, onSalvarTouro }), !ownerMode && /* @__PURE__ */ React22.createElement("p", { className: "sub", style: { marginTop: 14, display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React22.createElement(Lock, { size: 15, style: { flex: "none" } }), " Modo funcion\xE1rio: aqui voc\xEA consulta. Alterar cadastro \xE9 s\xF3 com a senha do propriet\xE1rio."), aberto && /* @__PURE__ */ React22.createElement(ModalMatriz, { key: aberto.id, m: aberto, dados, ownerMode, onSalvar: onSalvarMatriz, onFechar: () => setAberta(null) }));
}

// src/telas/Painel.jsx
import React23, { useMemo as useMemo19, useState as useState22 } from "react";
import { Download, RefreshCw } from "lucide-react";
function Painel({ anoSel, dados, ano, hoje, go, onExcel, onSync, onRecarregar, modoTeste, sincronizando }) {
  const [confirmar, setConfirmar] = useState22(false);
  const evsAno = useMemo19(() => filtrarPorAno(dados.eventos, ano), [dados.eventos, ano]);
  const k = useMemo19(() => calcularKPIs(dados.matrizes, evsAno), [dados.matrizes, evsAno]);
  const cheias = useMemo19(() => linhasPrevisao(dados.matrizes, dados.eventos, "Cheia", hoje, ""), [dados, hoje]);
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
  const crias = useMemo19(() => listarCrias(dados, hoje), [dados, hoje]);
  const criasAtivas = crias.filter((c) => c.ativa);
  const criasSemPeso = criasAtivas.filter((c) => c.pesoAtual === null).length;
  const orfas = criasAtivas.filter((c) => c.orfa).length;
  const machos = useMemo19(() => analiseMachos(crias, dados.config), [crias, dados.config]);
  const novilhas = useMemo19(() => listarNovilhas(dados, dados.config, hoje), [dados, hoje]);
  const novilhasAptas = novilhas.filter((n) => n.apta).length;
  const duplicados = Object.values(brincos).filter((n) => n > 1).length;
  const porMes = useMemo19(() => {
    const mapa = {};
    evsAno.filter((e) => e.tipo === "nascimento" && e.data).forEach((e) => {
      const kk = e.data.slice(0, 7);
      mapa[kk] = (mapa[kk] || 0) + 1;
    });
    return Object.entries(mapa).sort().slice(-12);
  }, [evsAno]);
  const maxMes = Math.max(1, ...porMes.map(([, n]) => n));
  const recentes = useMemo19(
    () => [...dados.eventos].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 8),
    [dados.eventos]
  );
  const ativos2 = k.cheias + k.vazias;
  const pc = (n) => ativos2 ? n / ativos2 * 100 : 0;
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
  return /* @__PURE__ */ React23.createElement("div", { className: "wrap" }, /* @__PURE__ */ React23.createElement("div", { className: "head" }, /* @__PURE__ */ React23.createElement("div", null, /* @__PURE__ */ React23.createElement("small", null, "Propriet\xE1rio \xB7 ", rot), /* @__PURE__ */ React23.createElement("h1", null, "Painel")), /* @__PURE__ */ React23.createElement("div", { className: "acts noprint" }, anoSel, /* @__PURE__ */ React23.createElement("button", { className: "btn ghost sm", onClick: onExcel }, /* @__PURE__ */ React23.createElement(Download, { size: 16 }), " Excel de ", rot))), /* @__PURE__ */ React23.createElement("h2", { className: "h2", style: { marginTop: 4 } }, "Rebanho hoje", /* @__PURE__ */ React23.createElement("small", null, formatarDataBR(hoje))), /* @__PURE__ */ React23.createElement(Kpis, { itens: [
    { rotulo: "Matrizes", valor: k.total },
    { rotulo: "Cheias", valor: k.cheias, cor: "var(--green)", sub: `${pc(k.cheias).toFixed(0)}% das ativas` },
    { rotulo: "Vazias", valor: k.vazias, cor: "var(--amber)", sub: `${pc(k.vazias).toFixed(0)}% das ativas` },
    { rotulo: "Descarte", valor: k.descartes, cor: "var(--late)" }
  ] }), /* @__PURE__ */ React23.createElement("div", { className: "panel", style: { marginTop: 12 } }, /* @__PURE__ */ React23.createElement("div", { className: "sbar", role: "img", "aria-label": `${k.cheias} cheias, ${k.vazias} vazias, ${k.descartes} em descarte` }, /* @__PURE__ */ React23.createElement("i", { style: { width: `${k.total ? k.cheias / k.total * 100 : 0}%`, background: "var(--green)" } }), /* @__PURE__ */ React23.createElement("i", { style: { width: `${k.total ? k.vazias / k.total * 100 : 0}%`, background: "var(--amber)" } }), /* @__PURE__ */ React23.createElement("i", { style: { width: `${k.total ? k.descartes / k.total * 100 : 0}%`, background: "var(--late)" } })), /* @__PURE__ */ React23.createElement("div", { className: "legend" }, /* @__PURE__ */ React23.createElement("span", { style: { "--c": "var(--green)" } }, "Cheias"), /* @__PURE__ */ React23.createElement("span", { style: { "--c": "var(--amber)" } }, "Vazias"), /* @__PURE__ */ React23.createElement("span", { style: { "--c": "var(--late)" } }, "Descarte")), /* @__PURE__ */ React23.createElement(Lead, { rotulo: "Partos previstos nos pr\xF3ximos 30 dias", valor: sinal, onClick: () => go("parto") }), /* @__PURE__ */ React23.createElement(Lead, { rotulo: "Novilhas em recria", valor: k.emRecria })), /* @__PURE__ */ React23.createElement("h2", { className: "h2" }, "Crias e novilhas", /* @__PURE__ */ React23.createElement("small", null, "hoje")), /* @__PURE__ */ React23.createElement(Kpis, { itens: [
    { rotulo: "Crias no rebanho", valor: criasAtivas.length, sub: `${criasAtivas.filter((c) => c.sexo === "Macho").length} machos \xB7 ${criasAtivas.filter((c) => c.sexo === "F\xEAmea").length} f\xEAmeas` },
    { rotulo: machos.cfg.metaPesoMacho ? `Machos com ${machos.cfg.metaPesoMacho} kg ou mais` : "Machos no peso alvo", valor: machos.cfg.metaPesoMacho ? machos.prontos : "\u2014", cor: machos.prontos ? "var(--green)" : void 0, sub: machos.cfg.metaQtdMacho ? `meta ${machos.cfg.metaQtdMacho}` : "defina a meta em Crias" },
    { rotulo: `Novilhas aptas (${novilhas.length ? "de " + novilhas.length : "nenhuma no lote"})`, valor: novilhasAptas, cor: novilhasAptas ? "var(--green)" : void 0 },
    { rotulo: "Sem pesagem", valor: criasSemPeso, cor: criasSemPeso ? "var(--amber)" : void 0, sub: "crias no rebanho" }
  ] }), /* @__PURE__ */ React23.createElement("h2", { className: "h2" }, "Movimento de ", rot), /* @__PURE__ */ React23.createElement(Kpis, { itens: [
    { rotulo: "Nascimentos", valor: k.nascimentos + k.natimortos, sub: `${k.machos} machos \xB7 ${k.femeas} f\xEAmeas` },
    { rotulo: "IATF / coberturas", valor: k.iatfs },
    { rotulo: "Toques", valor: k.diagnosticos, sub: k.diagnosticos ? `${k.taxaPrenhez.toFixed(0)}% prenhes` : "nenhum no per\xEDodo" },
    { rotulo: "Desmamas", valor: k.desmamas, sub: k.desmamas ? `peso m\xE9dio ${k.pesoMedioDesmama.toFixed(0)} kg` : "nenhuma no per\xEDodo" },
    { rotulo: "Mortes", valor: k.mortes, cor: k.mortes ? "var(--late)" : void 0, sub: k.mortes ? `${k.mortesCrias} crias \xB7 ${k.mortes - k.mortesCrias} outros` : "nenhuma no per\xEDodo" }
  ] }), /* @__PURE__ */ React23.createElement("div", { className: "cols2", style: { marginTop: 16 } }, /* @__PURE__ */ React23.createElement("div", { className: "panel" }, /* @__PURE__ */ React23.createElement("h3", null, "Nascimentos por m\xEAs"), porMes.length === 0 ? /* @__PURE__ */ React23.createElement("p", { className: "sub" }, "Nenhum nascimento lan\xE7ado em ", rot, ".") : /* @__PURE__ */ React23.createElement("div", { className: "mbars", role: "img", "aria-label": "Nascimentos por m\xEAs" }, porMes.map(([mes, n]) => /* @__PURE__ */ React23.createElement("div", { className: "c", key: mes }, /* @__PURE__ */ React23.createElement("b", null, n), /* @__PURE__ */ React23.createElement("i", { style: { height: `${n / maxMes * 100}%` } }), /* @__PURE__ */ React23.createElement("span", null, mesCurto(mes))))), /* @__PURE__ */ React23.createElement(Lead, { rotulo: "Perda ao nascer (natimortos)", valor: `${k.taxaPerda.toFixed(0)}% \xB7 ${k.natimortos}`, cor: k.taxaPerda > 5 ? "var(--late)" : void 0 })), /* @__PURE__ */ React23.createElement("div", { className: "panel" }, /* @__PURE__ */ React23.createElement("h3", null, "A conferir"), pendencias.length === 0 ? /* @__PURE__ */ React23.createElement("p", { className: "sub" }, "Nada pendente. Tudo em ordem.") : pendencias.map((p) => /* @__PURE__ */ React23.createElement(Lead, { key: p.rotulo, rotulo: p.rotulo, valor: p.valor, onClick: p.onClick, cor: p.cor })))), /* @__PURE__ */ React23.createElement("h2", { className: "h2" }, "Dinheiro de ", rot), /* @__PURE__ */ React23.createElement(Kpis, { itens: [
    { rotulo: "Vendas", valor: fmtBRL(k.receitaTotal), pequeno: true },
    { rotulo: "Custos", valor: fmtBRL(k.custoTotal), pequeno: true, sub: "IATF, toque, insumo e frete" },
    { rotulo: "Custo por bezerro", valor: fmtBRL(k.custoPorBezerro), pequeno: true, cor: "var(--amber)" },
    { rotulo: "Margem", valor: fmtBRL(k.margem), pequeno: true, cor: k.margem >= 0 ? "var(--green)" : "var(--late)" }
  ] }), k.receitaTotal === 0 && k.custoTotal === 0 && /* @__PURE__ */ React23.createElement("p", { className: "sub", style: { marginTop: 8 } }, "Ainda n\xE3o h\xE1 vendas ou custos lan\xE7ados em ", rot, "."), /* @__PURE__ */ React23.createElement("h2", { className: "h2" }, "Atividade recente"), /* @__PURE__ */ React23.createElement("div", { className: "sheet" }, recentes.length === 0 ? /* @__PURE__ */ React23.createElement("div", { className: "empty" }, "Nada lan\xE7ado ainda.") : recentes.map((e) => /* @__PURE__ */ React23.createElement("div", { className: "led-r", key: e.id, style: { "--cols": "1fr auto", minHeight: 48 } }, /* @__PURE__ */ React23.createElement("span", { style: { fontSize: 14.5 } }, descreverEvento(e, dados)), /* @__PURE__ */ React23.createElement("span", { className: "m mut" }, formatarDataBR(e.data))))), /* @__PURE__ */ React23.createElement("details", { className: "ferr noprint" }, /* @__PURE__ */ React23.createElement("summary", null, "Ferramentas avan\xE7adas"), /* @__PURE__ */ React23.createElement("div", { className: "in2" }, /* @__PURE__ */ React23.createElement("button", { className: "btn quiet sm", onClick: onRecarregar }, /* @__PURE__ */ React23.createElement(RefreshCw, { size: 15 }), " Recarregar dados da planilha"), /* @__PURE__ */ React23.createElement("button", { className: "btn quiet sm", onClick: () => setConfirmar(true), disabled: sincronizando }, /* @__PURE__ */ React23.createElement(RefreshCw, { size: 15 }), " Sincronizar planilha agora")), confirmar && /* @__PURE__ */ React23.createElement(Aviso, { tipo: "info" }, "Isso regrava a planilha inteira com o que est\xE1 na tela (nada se perde; atualiza f\xF3rmulas, formata\xE7\xE3o e a aba Resumo). ", modoTeste ? "No modo teste n\xE3o faz nada de verdade." : "Pode levar alguns segundos.", /* @__PURE__ */ React23.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8 } }, /* @__PURE__ */ React23.createElement("button", { className: "btn sm", onClick: async () => {
    setConfirmar(false);
    await onSync();
  } }, "Confirmar"), /* @__PURE__ */ React23.createElement("button", { className: "btn quiet sm", onClick: () => setConfirmar(false) }, "Cancelar")))));
}

// src/telas/Relatorios.jsx
import React24, { useMemo as useMemo20, useState as useState23 } from "react";
import { Printer, Download as Download2, FileDown as FileDown6, Loader2 as Loader212 } from "lucide-react";
function Relatorios({ anoSel, dados, ano, hoje, ownerMode, onExcel, onExcelRelatorio }) {
  const lista3 = RELATORIOS_APP.filter((r) => ownerMode || r.todos);
  const [aba, setAba] = useState23(lista3[0].id);
  const [tipoPlan, setTipoPlan] = useState23("matrizes");
  const [gerando, setGerando] = useState23(false);
  const [erroPdf, setErroPdf] = useState23("");
  const abas = [...lista3.map((r) => ({ id: r.id, label: r.curto })), ...ownerMode ? [{ id: "planilha", label: "Planilha" }] : []];
  const def = lista3.find((r) => r.id === aba) || (aba === "planilha" ? null : lista3[0]);
  const rel = useMemo20(() => def ? montarRelatorioApp(def.id, dados, ano, hoje, { dono: ownerMode }) : null, [def && def.id, dados, ano, hoje, ownerMode]);
  const evsAno = useMemo20(() => filtrarPorAno(dados.eventos, ano), [dados.eventos, ano]);
  const linhasPlan = useMemo20(
    () => aba === "planilha" && ownerMode ? linhasPlanilha(tipoPlan, { matrizes: dados.matrizes, touros: dados.touros, eventos: evsAno, todosEventos: dados.eventos }) : [],
    [aba, tipoPlan, dados, evsAno, ownerMode]
  );
  async function pdf() {
    if (!rel || gerando) return;
    setGerando(true);
    setErroPdf("");
    try {
      await baixarPDF({ ...rel, subtitulo: rel.subtitulo || (def.porAno ? `Ano de gest\xE3o: ${rotuloAno(ano)}` : "Situa\xE7\xE3o de hoje") });
    } catch (e) {
      console.error(e);
      setErroPdf("N\xE3o consegui gerar o PDF agora. Abra o app uma vez com internet e tente de novo.");
    }
    setGerando(false);
  }
  return /* @__PURE__ */ React24.createElement("div", { className: "wrap" }, /* @__PURE__ */ React24.createElement("div", { className: "head" }, /* @__PURE__ */ React24.createElement("div", null, /* @__PURE__ */ React24.createElement("small", null, ownerMode ? "Propriet\xE1rio" : "Funcion\xE1rio", " \xB7 ", rotuloAno(ano)), /* @__PURE__ */ React24.createElement("h1", null, aba === "planilha" ? "Planilha" : "Relat\xF3rios")), /* @__PURE__ */ React24.createElement("div", { className: "acts noprint" }, anoSel, def && /* @__PURE__ */ React24.createElement("button", { className: "btn sm", onClick: pdf, disabled: gerando }, gerando ? /* @__PURE__ */ React24.createElement(Loader212, { size: 16, className: "spin" }) : /* @__PURE__ */ React24.createElement(FileDown6, { size: 16 }), " PDF"), def && /* @__PURE__ */ React24.createElement("button", { className: "btn quiet sm", onClick: () => window.print() }, /* @__PURE__ */ React24.createElement(Printer, { size: 16 }), " Imprimir"), def && ownerMode && /* @__PURE__ */ React24.createElement("button", { className: "btn ghost sm", onClick: () => onExcelRelatorio(rel) }, /* @__PURE__ */ React24.createElement(Download2, { size: 16 }), " Excel"), aba === "planilha" && ownerMode && /* @__PURE__ */ React24.createElement("button", { className: "btn ghost sm", onClick: onExcel }, /* @__PURE__ */ React24.createElement(Download2, { size: 16 }), " Excel completo de ", rotuloAno(ano)))), erroPdf && /* @__PURE__ */ React24.createElement("p", { className: "late", role: "alert" }, erroPdf), /* @__PURE__ */ React24.createElement(IndexTabs, { tabs: abas, value: aba, onChange: setAba, rotulo: "Relat\xF3rios" }), /* @__PURE__ */ React24.createElement("div", { className: "sheet pad" }, def && rel && /* @__PURE__ */ React24.createElement(React24.Fragment, null, /* @__PURE__ */ React24.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rel.titulo), rel.subtitulo && /* @__PURE__ */ React24.createElement("p", { className: "sub" }, rel.subtitulo), !def.porAno && /* @__PURE__ */ React24.createElement("p", { className: "sub" }, "Este relat\xF3rio mostra a situa\xE7\xE3o de hoje e n\xE3o muda com o ano escolhido."), /* @__PURE__ */ React24.createElement(Kpis, { itens: rel.resumo.map((r) => ({ rotulo: r.rotulo, valor: r.valor })) }), rel.secoes.map((s) => /* @__PURE__ */ React24.createElement(SecaoRelatorio, { key: s.titulo, secao: s }))), aba === "planilha" && ownerMode && /* @__PURE__ */ React24.createElement(React24.Fragment, null, /* @__PURE__ */ React24.createElement("p", { className: "sub" }, "Os dados brutos de cada aba, como est\xE3o na planilha. Os lan\xE7amentos mostram s\xF3 ", rotuloAno(ano), "; matrizes e touros aparecem inteiros."), /* @__PURE__ */ React24.createElement("div", { className: "seg", style: { flexWrap: "wrap", marginBottom: 14 }, role: "group", "aria-label": "Aba da planilha" }, ABAS_EXCEL.map(([nome, tipo]) => /* @__PURE__ */ React24.createElement("button", { key: tipo, "aria-pressed": tipoPlan === tipo, onClick: () => setTipoPlan(tipo), style: { flex: "0 0 auto", minHeight: 40, fontSize: 13 } }, nome))), /* @__PURE__ */ React24.createElement(TabelaLinhas, { rows: linhasPlan }))));
}

// src/app.jsx
var OWNER_PIN = typeof __PIN_TESTE__ !== "undefined" ? __PIN_TESTE__ : "1537";
var VAZIO = { matrizes: [], touros: [], eventos: [], config: {}, protocolos: [] };
function Marca() {
  return /* @__PURE__ */ React25.createElement("div", { className: "brand" }, /* @__PURE__ */ React25.createElement("small", null, "Fazenda Ibira\xE7u"), /* @__PURE__ */ React25.createElement("b", null, "Gest\xE3o da Pecu\xE1ria"));
}
function SeletorAno({ ano, anos, onChange }) {
  return /* @__PURE__ */ React25.createElement("label", { className: "chip", title: "Ano de gest\xE3o" }, /* @__PURE__ */ React25.createElement("span", { className: "sr" }, "Ano de gest\xE3o"), /* @__PURE__ */ React25.createElement("span", { "aria-hidden": "true" }, "ANO"), /* @__PURE__ */ React25.createElement("select", { "aria-label": "Ano de gest\xE3o", value: String(ano), onChange: (e) => onChange(e.target.value === "todos" ? "todos" : Number(e.target.value)) }, anos.map((a) => /* @__PURE__ */ React25.createElement("option", { key: a, value: a }, a)), /* @__PURE__ */ React25.createElement("option", { value: "todos" }, "Todos")), /* @__PURE__ */ React25.createElement(ChevronDown2, { size: 14, "aria-hidden": "true" }));
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
    return /* @__PURE__ */ React25.createElement("button", { className: "chip fila-off", onClick, "data-testid": "chip-fila" }, /* @__PURE__ */ React25.createElement(CloudOff, { size: 14 }), " ", est.pendentes, " no celular");
  }
  if (est.erroPlanilha) {
    return /* @__PURE__ */ React25.createElement("button", { className: "chip fila-erro", onClick, "data-testid": "chip-fila" }, /* @__PURE__ */ React25.createElement(AlertTriangle, { size: 14 }), " erro ao gravar");
  }
  return /* @__PURE__ */ React25.createElement("button", { className: "chip", onClick, "data-testid": "chip-fila" }, /* @__PURE__ */ React25.createElement(Loader213, { size: 14, className: "spin" }), " gravando ", est.pendentes);
}
function GestaoPecuaria() {
  const [tab, setTab] = useState24("lancar");
  const [dados, setDados] = useState24(VAZIO);
  const dadosRef = useRef9(VAZIO);
  const [loading, setLoading] = useState24(true);
  const [aviso, setAviso] = useState24(null);
  const [versaoScript, setVersaoScript] = useState24(null);
  const [ownerMode, setOwnerMode] = useState24(false);
  const [pinAberto, setPinAberto] = useState24(false);
  const [pin, setPin] = useState24("");
  const [pinErro, setPinErro] = useState24(false);
  const [hoje, setHoje] = useState24(todayISO());
  const [ano, setAno] = useState24(() => anoDe(todayISO()));
  const [filaEst, setFilaEst] = useState24(estadoFila());
  const [filaAberta, setFilaAberta] = useState24(false);
  const [descartarUid, setDescartarUid] = useState24(null);
  const [sincronizando, setSincronizando] = useState24(false);
  const [preset, setPreset] = useState24(null);
  const [atualizadoEm, setAtualizadoEm] = useState24(null);
  const [doCelular, setDoCelular] = useState24(false);
  const versaoRef = useRef9(null);
  const timerCopia = useRef9(null);
  const pendentes = filaEst.pendentes;
  useEffect11(() => assinarFila(setFilaEst), []);
  useEffect11(() => {
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
  useEffect11(() => {
    const f = () => setHoje(todayISO());
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);
  useEffect11(() => {
    carregar();
  }, []);
  async function carregar() {
    setAviso(null);
    const copia = lerLocal(CHAVE_DADOS, null);
    const temCopia = !!(copia && copia.dados && Array.isArray(copia.dados.matrizes));
    if (temCopia && dadosRef.current === VAZIO) {
      const comFila = aplicarPendentesTudo({ protocolos: [], ...copia.dados }, estadoFila().itens);
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
      const novos = aplicarPendentesTudo(normalizarTudo(data), extra);
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
          setAviso({ tipo: "info", texto: `Modo teste: a planilha ainda est\xE1 na vers\xE3o ${v || "antiga"} do script. As telas novas j\xE1 funcionam aqui; protocolos, manejos e touros s\xF3 ser\xE3o gravados depois que o script v${VERSAO_MINIMA_SCRIPT} for publicado.` });
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
  const MSG_SCRIPT_12 = "O script da planilha est\xE1 desatualizado e n\xE3o aceita protocolos, manejos e touros. Avise o respons\xE1vel pelo sistema.";
  const MSG_SCRIPT_13 = "A planilha ainda n\xE3o aceita o manejo geral (precisa do script 13). Avise o propriet\xE1rio.";
  function salvarProtocolo(p) {
    if (scriptAntes(12)) return MSG_SCRIPT_12;
    const d = dadosRef.current;
    const lista3 = d.protocolos || [];
    commit({ ...d, protocolos: lista3.some((x) => x.id === p.id) ? lista3.map((x) => x.id === p.id ? p : x) : [...lista3, p] });
    enfileirar([{ action: "upsertProtocolos", protocolos: [protocoloParaPlanilha(p)] }], `protocolo ${p.nome}`);
    return `Protocolo "${p.nome}" salvo.${notaFila()}`;
  }
  function salvarTouro(t) {
    if (scriptAntes(12)) return MSG_SCRIPT_12;
    const d = dadosRef.current;
    commit({ ...d, touros: d.touros.some((x) => x.id === t.id) ? d.touros.map((x) => x.id === t.id ? t : x) : [...d.touros, t] });
    enfileirar([{ action: "upsertTouros", touros: [t] }], `touro ${t.nome}`);
    return null;
  }
  async function gravarManejo(res, rotulo) {
    if (scriptAntes(12)) return { ok: false, msg: MSG_SCRIPT_12 };
    if (scriptAntes(13) && res.eventosParaGravar.some((x) => x.tipo === "manejo" && x.evento.etapa === "Geral")) return { ok: false, msg: MSG_SCRIPT_13 };
    return gravarLote(res, rotulo);
  }
  function decidirMudancaLote(decisoes) {
    if (scriptAntes(13)) return MSG_SCRIPT_13;
    const r = decidirLote(dadosRef.current, decisoes);
    if (!r.mudancas.eventos.length) return "Nada para confirmar.";
    gravarCorrecao(r, "confirma\xE7\xE3o de lote");
    return [r.aprovadas ? `${r.aprovadas} animal(is) mudado(s) de lote.` : "", r.recusadas ? `${r.recusadas} continua(m) no lote de antes.` : ""].filter(Boolean).join(" ") + notaFila();
  }
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
      await postar({ action: "syncAll", matrizes: d.matrizes, touros: d.touros, eventos: d.eventos, protocolos: (d.protocolos || []).map(protocoloParaPlanilha), resumo });
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
    if (tab === "painel") setTab("lancar");
  }
  function mudarTab(t) {
    setPreset(null);
    setTab(t);
  }
  function lancarDaVaca(tipo, matrizId) {
    setPreset({ tipo, matrizId, n: Date.now() });
    setTab("lancar");
  }
  const anos = useMemo21(() => anosDisponiveis(dados.eventos, hoje), [dados.eventos, hoje]);
  const itensNav = [
    ownerMode && { id: "painel", label: "Painel", Icon: LayoutDashboard },
    { id: "lancar", label: "Lan\xE7ar", Icon: Plus8 },
    { id: "manejo", label: "Manejo", Icon: Syringe2 },
    { id: "parto", label: "Parto", Icon: CalendarClock },
    { id: "crias", label: "Crias", Icon: Baby },
    { id: "rebanho", label: "Rebanho", Icon: List },
    { id: "relatorios", label: "Relat\xF3rios", Icon: FileText }
  ].filter(Boolean);
  const anoSel = /* @__PURE__ */ React25.createElement(SeletorAno, { ano, anos, onChange: setAno });
  const botaoDono = ownerMode ? /* @__PURE__ */ React25.createElement("button", { className: "chip on", onClick: sairDoModoDono, "aria-label": "Sair do modo propriet\xE1rio", title: "Voltar para o modo funcion\xE1rio" }, /* @__PURE__ */ React25.createElement(Unlock, { size: 15 }), " DONO") : /* @__PURE__ */ React25.createElement("button", { className: "chip lock", onClick: () => {
    setPinAberto(true);
    setPin("");
    setPinErro(false);
  }, "aria-label": "Entrar como propriet\xE1rio", title: "Entrar como propriet\xE1rio" }, /* @__PURE__ */ React25.createElement(Lock2, { size: 16 }));
  if (loading) {
    return /* @__PURE__ */ React25.createElement("div", { className: "app" }, /* @__PURE__ */ React25.createElement("style", null, CSS), /* @__PURE__ */ React25.createElement("div", { className: "main" }, /* @__PURE__ */ React25.createElement("div", { className: "loading" }, /* @__PURE__ */ React25.createElement(Loader213, { size: 20, className: "spin" }), " Abrindo o livro do rebanho...")));
  }
  return /* @__PURE__ */ React25.createElement("div", { className: "app" }, /* @__PURE__ */ React25.createElement("style", null, CSS), /* @__PURE__ */ React25.createElement("aside", { className: "side" }, /* @__PURE__ */ React25.createElement(Marca, null), /* @__PURE__ */ React25.createElement("nav", { "aria-label": "Telas" }, itensNav.map(({ id, label, Icon }) => /* @__PURE__ */ React25.createElement("button", { key: id, "aria-current": tab === id ? "page" : void 0, onClick: () => mudarTab(id) }, /* @__PURE__ */ React25.createElement(Icon, null), " ", label))), /* @__PURE__ */ React25.createElement("div", { className: "foot" }, botaoDono)), /* @__PURE__ */ React25.createElement("div", { className: "main" }, MODO_TESTE && /* @__PURE__ */ React25.createElement("div", { className: "banner-teste", role: "status" }, /* @__PURE__ */ React25.createElement("b", null, "MODO TESTE"), /* @__PURE__ */ React25.createElement("span", null, "L\xEA os dados reais da planilha, mas N\xC3O grava nada nela. O que voc\xEA lan\xE7ar aqui some ao recarregar com internet."), /* @__PURE__ */ React25.createElement("button", { onClick: carregar }, "Recarregar dados")), /* @__PURE__ */ React25.createElement("header", { className: "topbar" }, /* @__PURE__ */ React25.createElement("div", { className: "in" }, /* @__PURE__ */ React25.createElement(Marca, null), /* @__PURE__ */ React25.createElement(ChipFila, { est: filaEst, onClick: () => setFilaAberta(true) }), botaoDono)), pendentes > 0 && /* @__PURE__ */ React25.createElement("span", { className: "sr", role: "status" }, filaEst.semInternet ? `${pendentes} lan\xE7amento(s) guardado(s) no celular esperando internet` : "Gravando na planilha"), pendentes > 0 && /* @__PURE__ */ React25.createElement("div", { className: "lado-fila" }, /* @__PURE__ */ React25.createElement(ChipFila, { est: filaEst, onClick: () => setFilaAberta(true) })), aviso && /* @__PURE__ */ React25.createElement("div", { className: "wrap" }, /* @__PURE__ */ React25.createElement(Aviso, { tipo: aviso.tipo === "erro" ? void 0 : aviso.tipo, onClose: () => setAviso(null) }, aviso.texto)), tab === "lancar" && /* @__PURE__ */ React25.createElement(
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
  ), tab === "manejo" && /* @__PURE__ */ React25.createElement(Manejo, { dados, hoje, ownerMode, modoTeste: MODO_TESTE, onGravarLote: gravarManejo, onSalvarProtocolo: salvarProtocolo, onSalvarConfig: salvarConfig, scriptAntes13: scriptAntes(13), onDecidirLote: decidirMudancaLote }), tab === "parto" && /* @__PURE__ */ React25.createElement(Parto, { dados, hoje, onLancar: lancarDaVaca, onGravarLote: gravarManejo }), tab === "crias" && /* @__PURE__ */ React25.createElement(
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
  ), tab === "rebanho" && /* @__PURE__ */ React25.createElement(Rebanho, { dados, ownerMode, onSalvarMatriz: salvarMatriz, onSalvarTouro: salvarTouro }), tab === "painel" && ownerMode && /* @__PURE__ */ React25.createElement(
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
  ), tab === "relatorios" && /* @__PURE__ */ React25.createElement(
    Relatorios,
    {
      anoSel,
      dados,
      ano,
      hoje,
      ownerMode,
      onExcel: () => exportarExcel(dadosRef.current, ano, hoje),
      onExcelRelatorio: (rel) => exportarRelatorioExcel(rel, ano, hoje)
    }
  ), /* @__PURE__ */ React25.createElement("div", { className: "foot-note" }, "Fazenda Ibira\xE7u \xB7 app ", VERSAO_APP, " \xB7 planilha ", versaoScript ? `v${versaoScript}` : "vers\xE3o antiga", MODO_TESTE ? " \xB7 TESTE" : "", atualizadoEm ? ` \xB7 dados de ${quandoTxt(atualizadoEm)}${doCelular ? " (guardados no celular)" : ""}` : "")), /* @__PURE__ */ React25.createElement("nav", { className: `bnav${itensNav.length > 5 ? " mini" : ""}`, "aria-label": "Telas (celular)" }, itensNav.map(({ id, label, Icon }) => /* @__PURE__ */ React25.createElement("button", { key: id, "aria-current": tab === id ? "page" : void 0, onClick: () => mudarTab(id) }, /* @__PURE__ */ React25.createElement(Icon, null), " ", label))), filaAberta && /* @__PURE__ */ React25.createElement(Modal, { titulo: "Lan\xE7amentos guardados no celular", onClose: () => {
    setFilaAberta(false);
    setDescartarUid(null);
  } }, filaEst.pendentes === 0 ? /* @__PURE__ */ React25.createElement("p", { className: "sub", style: { marginTop: 0 } }, "Tudo j\xE1 chegou na planilha. Nada esperando.") : /* @__PURE__ */ React25.createElement(React25.Fragment, null, /* @__PURE__ */ React25.createElement("p", { className: "sub", style: { marginTop: 0 } }, filaEst.semInternet ? "Sem internet. Estes lan\xE7amentos est\xE3o guardados neste celular e v\xE3o sozinhos para a planilha quando a internet voltar. N\xE3o feche o app pela metade de um lan\xE7amento, mas pode fechar e abrir \xE0 vontade: nada se perde." : filaEst.erroPlanilha ? `A planilha recusou um lan\xE7amento: ${filaEst.erroPlanilha}. Os outros esperam na fila, na ordem.` : "Enviando para a planilha..."), /* @__PURE__ */ React25.createElement("div", { className: "sheet", "data-testid": "lista-fila" }, filaEst.itens.map((it) => /* @__PURE__ */ React25.createElement("div", { className: "led-r", key: it.uid, style: { "--cols": ownerMode ? "1fr auto auto" : "1fr auto", minHeight: 48 } }, /* @__PURE__ */ React25.createElement("span", { style: { fontSize: 14 } }, it.rotulo || it.payload.action, it.erro ? /* @__PURE__ */ React25.createElement("small", { style: { display: "block", color: it.rede ? "var(--amber)" : "var(--late)" } }, it.rede ? "esperando internet" : it.erro) : null), /* @__PURE__ */ React25.createElement("span", { className: "m mut" }, quandoTxt(it.criadoEm)), ownerMode && (descartarUid === it.uid ? /* @__PURE__ */ React25.createElement("button", { className: "btn sm", style: { background: "var(--late)" }, onClick: () => {
    descartar(it.uid);
    setDescartarUid(null);
  } }, "Confirmar") : /* @__PURE__ */ React25.createElement("button", { className: "x-peq", "aria-label": "Descartar este lan\xE7amento da fila", title: "Descartar (s\xF3 se a planilha recusa sempre)", onClick: () => setDescartarUid(it.uid) }, /* @__PURE__ */ React25.createElement(Trash26, { size: 16 })))))), ownerMode && descartarUid && /* @__PURE__ */ React25.createElement(Aviso, null, "Descartar tira esse lan\xE7amento da fila e ele N\xC3O vai para a planilha (continua na tela at\xE9 recarregar). Use s\xF3 se a planilha recusa sempre.")), /* @__PURE__ */ React25.createElement("button", { className: "btn wide", style: { marginTop: 12 }, onClick: () => enviar(), disabled: filaEst.enviando || filaEst.pendentes === 0 }, filaEst.enviando ? /* @__PURE__ */ React25.createElement(Loader213, { size: 18, className: "spin" }) : /* @__PURE__ */ React25.createElement(RefreshCw2, { size: 18 }), " Tentar enviar agora")), pinAberto && !ownerMode && /* @__PURE__ */ React25.createElement(Modal, { titulo: "\xC1rea do propriet\xE1rio", onClose: () => setPinAberto(false) }, /* @__PURE__ */ React25.createElement("form", { onSubmit: (e) => {
    e.preventDefault();
    tentarEntrar();
  } }, /* @__PURE__ */ React25.createElement("div", { className: "fld" }, /* @__PURE__ */ React25.createElement("label", { htmlFor: "pin" }, "Senha (PIN)"), /* @__PURE__ */ React25.createElement("input", { id: "pin", type: "password", inputMode: "numeric", autoComplete: "off", autoFocus: true, value: pin, onChange: (e) => {
    setPin(e.target.value);
    setPinErro(false);
  } }), pinErro && /* @__PURE__ */ React25.createElement("div", { className: "hint late", role: "alert" }, "Senha incorreta.")), /* @__PURE__ */ React25.createElement("button", { type: "submit", className: "btn wide" }, "Entrar"))));
}
createRoot(document.getElementById("root")).render(/* @__PURE__ */ React25.createElement(GestaoPecuaria, null));
