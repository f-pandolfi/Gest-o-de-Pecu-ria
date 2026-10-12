// src/app.jsx
import React8, { useState as useState8, useEffect as useEffect3, useMemo as useMemo7, useRef as useRef3 } from "react";
import { createRoot } from "react-dom/client";
import {
  Plus,
  CalendarClock,
  List,
  LayoutDashboard,
  FileText,
  Lock as Lock2,
  Unlock,
  Loader2 as Loader23,
  ChevronDown
} from "lucide-react";

// src/logica.js
var VERSAO_APP = "9.2 (12/10/26)";
var VERSAO_MINIMA_SCRIPT = 7;
var PERIODO_GESTACAO_DIAS = 285;
var TIPOS_FUNCIONARIO = ["nascimento", "desmama", "iatf", "insumo", "descarte"];
var TIPOS_EVENTO = [
  { id: "cadastro", label: "Nova Matriz" },
  { id: "touro", label: "Touro / S\xEAmen" },
  { id: "iatf", label: "Insemina\xE7\xE3o (IATF)" },
  { id: "diagnostico", label: "Diagn\xF3stico (Toque)" },
  { id: "nascimento", label: "Nascimento" },
  { id: "desmama", label: "Desmama" },
  { id: "recria", label: "Recria (pesagem)" },
  { id: "venda", label: "Venda" },
  { id: "insumo", label: "Sal / Medicamento" },
  { id: "descarte", label: "Descarte" }
];
var CAMPOS_EDICAO_MATRIZ = [
  { key: "brinco", label: "Brinco / ID", type: "text", required: true },
  { key: "categoria", label: "Categoria", type: "select", options: ["Novilha", "Prim\xEDpara", "Mult\xEDpara", "Vaca"] },
  { key: "raca", label: "Ra\xE7a", type: "text" },
  { key: "lote", label: "Lote / piquete", type: "text" },
  { key: "dataNascimento", label: "Data de nascimento", type: "date" },
  { key: "partosAnteriores", label: "Partos antes de entrar na fazenda", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["Vazia", "Cheia", "Descarte"] }
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
    { key: "matrizId", label: "Matriz (m\xE3e)", type: "matriz" },
    { key: "data", label: "Data do nascimento", type: "date", required: true },
    { key: "resultadoParto", label: "Resultado", type: "select", options: ["Vivo", "Natimorto"], required: true, default: "Vivo" },
    { key: "sexo", label: "Sexo", type: "select", options: ["F\xEAmea", "Macho"] },
    { key: "brincoBezerro", label: "Brinco do bezerro (sugerido automaticamente)", type: "text" },
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
function parseDataFlex(txt, hoje) {
  hoje = hoje || todayISO();
  if (txt === null || txt === void 0) return "";
  const s = String(txt).trim();
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
    dataNascimento: normalizarDataISO(m.dataNascimento)
  }));
  const eventos = (data.eventos || []).map((e) => ({
    ...e,
    data: normalizarDataISO(e.data),
    dataInicioProtocolo: normalizarDataISO(e.dataInicioProtocolo),
    brincoBezerro: e.brincoBezerro === void 0 || e.brincoBezerro === null ? "" : String(e.brincoBezerro)
  }));
  return { matrizes, touros: data.touros || [], eventos };
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
  let seq = max + 1;
  if (seq >= 500) {
    seq = 1;
    while (usados.has(seq)) seq++;
  }
  return String(ano * 1e3 + base + seq);
}
function linhasPrevisao(matrizes, eventos, status, hoje, busca) {
  hoje = hoje || todayISO();
  const q = (busca || "").toLowerCase();
  return matrizes.filter((m) => m.status === status).filter((m) => !q || String(m.brinco).toLowerCase().includes(q)).map((m) => {
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
function calcularKPIs(matrizes, eventos) {
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
  const emRecria = matrizes.filter((m) => m.categoria === "Novilha" && m.status !== "Descarte").length;
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
    diagnosticos: diagnosticos.length
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
    ["Novilhas em recria (hoje)", kpis.emRecria],
    ["Taxa de prenhez do ano (%)", kpis.taxaPrenhez.toFixed(1)],
    ["", ""],
    ["Nascimentos", kpis.nascimentos],
    ["Natimortos", kpis.natimortos],
    ["Taxa de perda ao nascer (%)", kpis.taxaPerda.toFixed(1)],
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
  const falta = (CAMPOS[tipo] || []).filter((c) => c.required && (!c.showIf || c.showIf(form)) && !form[c.key]);
  if (tipo === "nascimento" && !form.matrizId && !form.sexo && !String(form.brincoBezerro ?? "").trim()) {
    falta.push({ key: "__identificacao", label: "M\xE3e, sexo ou brinco da cria (pelo menos um)" });
  }
  return falta;
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
  } else {
    const novoEvento = { id, tipo, ...form, createdAt: now };
    ev = [...eventos, novoEvento];
    out.eventosNovos.push(novoEvento);
  }
  return { estado: { matrizes: m, touros: t, eventos: ev }, ...out };
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
    if (item.peso) f.pesoDesmama = item.peso;
    if (item.idadeDias) f.idadeDias = item.idadeDias;
  } else if (tipo === "descarte") {
    if (item.motivo) f.motivo = item.motivo;
  } else if (tipo === "recria") {
    if (item.peso) f.pesoAtual = item.peso;
    if (item.apta) f.aptaReproducao = item.apta;
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
  if (tipo === "desmama") return eventos.some((e) => e.tipo === "desmama" && e.brincoBezerro === form.brincoBezerro && e.data === form.data);
  if (tipo === "nascimento") {
    return eventos.some((e) => e.tipo === "nascimento" && e.data === form.data && (form.matrizId && e.matrizId === form.matrizId || form.brincoBezerro && e.brincoBezerro === form.brincoBezerro));
  }
  if (tipo === "diagnostico") return eventos.some((e) => e.tipo === "diagnostico" && e.matrizId === form.matrizId && e.data === form.data);
  if (["iatf", "descarte", "recria"].includes(tipo)) return eventos.some((e) => e.tipo === tipo && e.matrizId === form.matrizId && e.data === form.data);
  return false;
}
function aplicarLote(estado, itens, opcoes) {
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
  itens.forEach((item, indice) => {
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
    if (!item.forcar && jaExiste(item.tipo, form, atual)) {
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
  const itens = doAno.map((e) => ({ e, r: resultadoDe(e) }));
  const contar = (lista) => {
    const prenhes = lista.filter((x) => x.r === "Prenhe").length;
    const vazias = lista.filter((x) => x.r === "Vazia").length;
    const sem = lista.length - prenhes - vazias;
    return { total: lista.length, prenhes, vazias, sem, taxa: prenhes + vazias ? `${Math.round(prenhes / (prenhes + vazias) * 100)}%` : "\u2014" };
  };
  const agrupar = (chaveFn) => {
    const mapa = /* @__PURE__ */ new Map();
    itens.forEach((x) => {
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
  const total = contar(itens);
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
function relatorioSituacaoVacas(matrizes, eventos, hoje) {
  hoje = hoje || todayISO();
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
var RELATORIOS = [
  { id: "previsao", titulo: "Previs\xE3o de parto", porAno: false },
  { id: "nascimentos", titulo: "Nascimentos por sexo", porAno: true },
  { id: "melhores", titulo: "Melhores vacas em prenhez", porAno: true },
  { id: "iatf", titulo: "IATF", porAno: true },
  { id: "situacao", titulo: "Situa\xE7\xE3o das vacas", porAno: false }
];
function montarRelatorio(id, { matrizes, touros, eventos }, ano, hoje) {
  if (id === "previsao") return relatorioPrevisaoParto(matrizes, eventos, hoje);
  if (id === "nascimentos") return relatorioNascimentos(matrizes, eventos, touros, ano);
  if (id === "melhores") return relatorioMelhoresVacas(matrizes, eventos, ano);
  if (id === "iatf") return relatorioIATF(matrizes, eventos, touros, ano);
  return relatorioSituacaoVacas(matrizes, eventos, hoje);
}
function linhasPlanilha(tipo, { matrizes, touros, eventos }) {
  const brincoMap = mapaBrincos(matrizes);
  const nomeTouro = (e) => nomeTouroEvento(e, touros);
  if (tipo === "matrizes") {
    return matrizes.map((m) => ({
      "Brinco": m.brinco,
      "Categoria": m.categoria,
      "Ra\xE7a": m.raca || "",
      "Lote": m.lote || "",
      "Data Nasc.": formatarDataBR(m.dataNascimento) || "",
      "Status": m.status,
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
      "Peso Total (kg)": e.pesoTotal || "",
      "Valor Arroba (R$)": e.valorArroba || "",
      "Valor Total (R$)": e.valorTotal || "",
      "Frete/Comiss\xE3o (R$)": e.frete || "",
      "Comprador": e.comprador || ""
    }));
  }
  if (tipo === "insumo") {
    return evs.map((e) => ({ "Data": formatarDataBR(e.data), "Produto": e.produto || "", "Quantidade": e.quantidade || "", "Unidade": e.unidade || "", "Custo (R$)": e.custo || "", "Categoria Animal": e.categoriaAnimal || "" }));
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
  ["Nascimentos", "nascimento"],
  ["Desmama", "desmama"],
  ["Recria", "recria"],
  ["IATF", "iatf"],
  ["Diagn\xF3sticos", "diagnostico"],
  ["Vendas", "venda"],
  ["Insumos", "insumo"],
  ["Descartes", "descarte"],
  ["Touros", "touros"]
];

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

.bnav{position:fixed;left:0;right:0;bottom:0;z-index:30;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;height:calc(64px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:var(--s1);border-top:1px solid var(--line)}
.bnav button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:none;background:transparent;color:var(--mut);font:600 10.5px var(--mono);letter-spacing:.07em;text-transform:uppercase;border-top:3px solid transparent;margin-top:-1px;min-width:0}
.bnav button[aria-current=page]{color:var(--amber);border-top-color:var(--amber);background:var(--bg)}
.bnav svg{width:21px;height:21px}

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
if (typeof window !== "undefined") window.__gravacoesSimuladas = window.__gravacoesSimuladas || [];
async function lerTudo() {
  const res = await fetch(`${SHEETS_API_URL}?action=getAll`);
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}
async function postar(payload) {
  if (MODO_TESTE) {
    window.__gravacoesSimuladas.push(payload);
    await new Promise((r) => setTimeout(r, 150));
    return { ok: true, simulado: true };
  }
  const res = await fetch(SHEETS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("a planilha n\xE3o respondeu direito");
  }
  if (data && data.error) throw new Error(data.error);
  return data;
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
    const linhas = linhasPlanilha(tipo, { matrizes, touros, eventos: evs });
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
var corStatus = (s) => s === "Cheia" ? "var(--green)" : s === "Vazia" ? "var(--amber)" : "var(--late)";
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
function Kpis({ itens }) {
  return /* @__PURE__ */ React.createElement("div", { className: "kpis" }, itens.map((k) => /* @__PURE__ */ React.createElement("div", { className: "kpi", key: k.rotulo }, /* @__PURE__ */ React.createElement("small", null, k.rotulo), /* @__PURE__ */ React.createElement("b", { style: { ...k.cor ? { color: k.cor } : null, ...k.pequeno ? { fontSize: 22 } : null } }, k.valor), k.sub ? /* @__PURE__ */ React.createElement("span", null, k.sub) : null)));
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
    const base = matrizes.filter((m) => m.status !== "Descarte" && (!filtro || filtro(m)));
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
  venda: "Venda",
  insumo: "Insumo",
  descarte: "Descarte"
};
var rotuloEvento = (tipo) => (TIPOS_EVENTO.find((t) => t.id === tipo) || {}).label || tipo;
var ORDEM_LANCAR = ["nascimento", "iatf", "diagnostico", "desmama", "recria", "descarte", "insumo", "venda", "cadastro", "touro"];
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
  } else if (e.tipo === "venda") {
    if (e.animais) partes.push(e.animais);
    if (e.valorTotal) partes.push(`R$ ${e.valorTotal}`);
  } else if (e.tipo === "insumo") {
    if (e.produto) partes.push(e.produto);
    if (e.quantidade) partes.push(`${e.quantidade} ${e.unidade || ""}`.trim());
  } else if (mae) {
    partes.push(`vaca ${mae}`);
  }
  return [rotuloEvento(e.tipo), ...partes].join(" \xB7 ");
}
var fmtBRL = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// src/telas/Lancar.jsx
import React3, { useState as useState3, useEffect as useEffect2, useMemo as useMemo2, useRef as useRef2 } from "react";
import { Save, Check as Check3, Loader2 as Loader22 } from "lucide-react";

// src/telas/Lote.jsx
import React2, { useState as useState2 } from "react";
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
  const itens = Array.isArray(obj) ? obj : obj && Array.isArray(obj.itens) ? obj.itens : null;
  if (!itens) return { erro: "O texto colado n\xE3o tem uma lista de lan\xE7amentos." };
  if (itens.length === 0) return { erro: "A lista est\xE1 vazia." };
  if (itens.length > 200) return { erro: "Muitos lan\xE7amentos de uma vez (mais de 200). Divida em partes." };
  if (itens.some((i) => !i || typeof i !== "object" || !i.tipo)) return { erro: 'Algum item n\xE3o tem o campo "tipo".' };
  return { itens };
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
  return /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("h2", { className: "h2", style: { marginTop: 0 } }, "Lote por foto"), /* @__PURE__ */ React2.createElement("p", { className: "sub" }, "Tire a foto da folha do manejo e mande para o Claude no chat. Ele devolve um bloco de texto com os lan\xE7amentos. Cole aqui, confira o que vai mudar em cada vaca e s\xF3 ent\xE3o grave."), /* @__PURE__ */ React2.createElement("div", { className: "fld" }, /* @__PURE__ */ React2.createElement("label", { htmlFor: "lote-texto" }, "Bloco de lan\xE7amentos"), /* @__PURE__ */ React2.createElement("textarea", { id: "lote-texto", value: texto, onChange: (e) => setTexto(e.target.value), placeholder: '[ { "tipo": "nascimento", "matriz": "3012", "data": "10/10/26", "sexo": "F" } ]', spellCheck: false })), /* @__PURE__ */ React2.createElement("button", { className: "btn wide quiet", onClick: conferir }, /* @__PURE__ */ React2.createElement(ClipboardPaste, { size: 18 }), " Conferir antes de gravar"), erro && /* @__PURE__ */ React2.createElement(Aviso, null, erro), feito && /* @__PURE__ */ React2.createElement(Aviso, { tipo: "ok" }, feito, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), prev && /* @__PURE__ */ React2.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React2.createElement("h2", { className: "h2" }, "Confer\xEAncia", /* @__PURE__ */ React2.createElement("small", null, prev.aplicados.length, " para gravar \xB7 ", prev.rejeitados.length, " com problema")), prev.aplicados.length > 0 && /* @__PURE__ */ React2.createElement("div", { className: "sheet", "data-testid": "lote-aplicados" }, prev.aplicados.map((a) => /* @__PURE__ */ React2.createElement("div", { className: "lote-item", key: a.indice, "data-testid": "lote-item" }, /* @__PURE__ */ React2.createElement("span", { className: "n" }, a.indice + 1), /* @__PURE__ */ React2.createElement("div", { className: "txt" }, /* @__PURE__ */ React2.createElement("b", null, descreverEvento(a.eventos[0], prev.estado)), /* @__PURE__ */ React2.createElement("span", null, mudancas(a, dados) || "sem mudan\xE7a no cadastro da vaca")), /* @__PURE__ */ React2.createElement("span", { className: "m mut" }, formatarDataBR(a.eventos[0].data))))), prev.avisos.length > 0 && /* @__PURE__ */ React2.createElement(Aviso, { tipo: "info" }, /* @__PURE__ */ React2.createElement("b", null, "Aten\xE7\xE3o:"), /* @__PURE__ */ React2.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 } }, prev.avisos.map((a, i) => /* @__PURE__ */ React2.createElement("li", { key: i }, "linha ", a.indice + 1, ": ", a.aviso)))), prev.rejeitados.length > 0 && /* @__PURE__ */ React2.createElement(Aviso, null, /* @__PURE__ */ React2.createElement("b", null, "N\xE3o v\xE3o ser gravados:"), /* @__PURE__ */ React2.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 }, "data-testid": "lote-rejeitados" }, prev.rejeitados.map((r, i) => /* @__PURE__ */ React2.createElement("li", { key: i }, "linha ", r.indice + 1, ": ", r.motivo)))), /* @__PURE__ */ React2.createElement("button", { className: "btn wide", disabled: gravando || prev.aplicados.length === 0, onClick: gravar, style: { marginTop: 10 } }, gravando ? /* @__PURE__ */ React2.createElement(Loader2, { size: 18, className: "spin" }) : /* @__PURE__ */ React2.createElement(Check2, { size: 18 }), gravando ? "Gravando..." : `Gravar ${prev.aplicados.length} lan\xE7amento(s)`)));
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
function Lancar({ dados, hoje, ownerMode, preset, onSalvar, onGravarLote, modoTeste }) {
  const tiposVisiveis = ORDEM_LANCAR.filter((id) => ownerMode || TIPOS_FUNCIONARIO.includes(id));
  const abas = [
    ...tiposVisiveis.map((id) => ({ id, label: ROTULO_CURTO[id] })),
    ...ownerMode ? [{ id: "lote", label: "Lote por foto" }] : []
  ];
  const [tipo, setTipo] = useState3("nascimento");
  const [form, setForm] = useState3(() => formularioInicial("nascimento", hoje));
  const [erro, setErro] = useState3("");
  const [dup, setDup] = useState3(false);
  const [salvo, setSalvo] = useState3("");
  const [travado, setTravado] = useState3(false);
  const timer = useRef2(null);
  const timerTrava = useRef2(null);
  useEffect2(() => () => {
    clearTimeout(timer.current);
    clearTimeout(timerTrava.current);
  }, []);
  useEffect2(() => {
    if (!preset) return;
    setTipo(preset.tipo);
    setForm({ ...formularioInicial(preset.tipo, hoje), matrizId: preset.matrizId || "" });
    setErro("");
    setDup(false);
    setSalvo("");
  }, [preset && preset.n]);
  useEffect2(() => {
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
  function salvar(forcar) {
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
    const { _sug, ...limpo } = form;
    const msg = onSalvar(tipo, limpo);
    setSalvo(msg);
    setForm(formularioInicial(tipo, hoje));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSalvo(""), 6e3);
    setTravado(true);
    clearTimeout(timerTrava.current);
    timerTrava.current = setTimeout(() => setTravado(false), 1500);
  }
  const ultimos = useMemo2(() => {
    const nasc = dados.eventos.filter((e) => e.tipo === "nascimento" && e.brincoBezerro);
    const recente = (sexo) => nasc.filter((e) => e.sexo === sexo).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0];
    return { Macho: recente("Macho"), "F\xEAmea": recente("F\xEAmea") };
  }, [dados.eventos]);
  const recentes = useMemo2(
    () => [...dados.eventos].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 6),
    [dados.eventos]
  );
  const campos = (CAMPOS[tipo] || []).filter((c) => !c.showIf || c.showIf(form));
  const semMatrizes = dados.matrizes.length === 0 && tipo !== "cadastro";
  return /* @__PURE__ */ React3.createElement("div", { className: "wrap" }, /* @__PURE__ */ React3.createElement("div", { className: "head" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React3.createElement("h1", null, "Lan\xE7ar"))), /* @__PURE__ */ React3.createElement(IndexTabs, { tabs: abas, value: tipo, onChange: trocarTipo, rotulo: "Tipo de lan\xE7amento" }), /* @__PURE__ */ React3.createElement("div", { className: "sheet pad" }, tipo === "lote" ? /* @__PURE__ */ React3.createElement(LoteFoto, { dados, hoje, onGravarLote, modoTeste }) : /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rotuloEvento(tipo)), semMatrizes && /* @__PURE__ */ React3.createElement(Aviso, { tipo: "info" }, ownerMode ? 'Cadastre pelo menos uma matriz em "Nova matriz" para poder lig\xE1-la aos outros lan\xE7amentos.' : "Ainda n\xE3o h\xE1 matrizes no sistema. Fale com o propriet\xE1rio."), tipo === "nascimento" && (ultimos.Macho || ultimos["F\xEAmea"]) && /* @__PURE__ */ React3.createElement("div", { style: { marginBottom: 16 } }, ["F\xEAmea", "Macho"].map((sx) => ultimos[sx] ? /* @__PURE__ */ React3.createElement(Lead, { key: sx, rotulo: sx === "Macho" ? "\xDAltimo macho" : "\xDAltima f\xEAmea", valor: `${ultimos[sx].brincoBezerro} \xB7 ${formatarDataBR(ultimos[sx].data)}` }) : null)), /* @__PURE__ */ React3.createElement("div", { className: "grid2" }, campos.map((c) => /* @__PURE__ */ React3.createElement("div", { key: c.key, style: c.type === "matriz" || c.key === "observacoes" || c.key === "motivo" ? { gridColumn: "1 / -1" } : void 0 }, /* @__PURE__ */ React3.createElement(Campo, { campo: c, value: form[c.key], onChange: atualizar, matrizes: dados.matrizes, touros: dados.touros })))), erro && /* @__PURE__ */ React3.createElement(Aviso, null, erro), dup && /* @__PURE__ */ React3.createElement(Aviso, { tipo: "info" }, "Esse lan\xE7amento parece j\xE1 existir (mesma vaca e mesma data). Confira antes de salvar de novo.", /* @__PURE__ */ React3.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React3.createElement("button", { className: "btn sm", onClick: () => salvar(true), disabled: travado }, "Salvar mesmo assim"), /* @__PURE__ */ React3.createElement("button", { className: "btn quiet sm", onClick: () => setDup(false) }, "Cancelar"))), salvo && /* @__PURE__ */ React3.createElement(Aviso, { tipo: "ok" }, salvo, modoTeste ? " (modo teste: s\xF3 na tela, nada foi para a planilha)" : ""), /* @__PURE__ */ React3.createElement("button", { className: "btn wide", onClick: () => salvar(false), disabled: travado, style: { marginTop: 6 } }, /* @__PURE__ */ React3.createElement(Save, { size: 18 }), " Salvar registro"))), tipo !== "lote" && /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement("h2", { className: "h2" }, "\xDAltimos lan\xE7amentos"), /* @__PURE__ */ React3.createElement("div", { className: "sheet" }, recentes.length === 0 ? /* @__PURE__ */ React3.createElement("div", { className: "empty" }, "Nada lan\xE7ado ainda.") : recentes.map((e) => /* @__PURE__ */ React3.createElement("div", { className: "led-r", key: e.id, style: { "--cols": "1fr auto", minHeight: 48 } }, /* @__PURE__ */ React3.createElement("span", { style: { fontSize: 14.5 } }, descreverEvento(e, dados)), /* @__PURE__ */ React3.createElement("span", { className: "m mut" }, formatarDataBR(e.data)))))));
}

// src/telas/Parto.jsx
import React4, { useMemo as useMemo3, useState as useState4 } from "react";
import { Search } from "lucide-react";
function textoDias(dias) {
  if (dias === null || dias === void 0) return { t: "\u2014", c: "mut" };
  if (dias < 0) return { t: `\u2212${Math.abs(dias)}`, c: "late" };
  if (dias === 0) return { t: "hoje", c: "late" };
  if (dias <= 15) return { t: `+${dias}`, c: "soon" };
  return { t: `+${dias}`, c: "good" };
}
function Calculo({ info }) {
  if (!info) return null;
  if (info.origem === "toque") return /* @__PURE__ */ React4.createElement(React4.Fragment, null, "C\xE1lculo: toque de ", /* @__PURE__ */ React4.createElement("b", null, formatarDataBR(info.base)), " com ", /* @__PURE__ */ React4.createElement("b", null, info.dg), " dias de gesta\xE7\xE3o, completando ", PERIODO_GESTACAO_DIAS, " dias.");
  if (info.origem === "iatf") return /* @__PURE__ */ React4.createElement(React4.Fragment, null, "C\xE1lculo: IATF de ", /* @__PURE__ */ React4.createElement("b", null, formatarDataBR(info.base)), " mais ", PERIODO_GESTACAO_DIAS, " dias.");
  return /* @__PURE__ */ React4.createElement(React4.Fragment, null, "Toque de ", /* @__PURE__ */ React4.createElement("b", null, formatarDataBR(info.base)), " sem os dias de gesta\xE7\xE3o (DG) anotados: n\xE3o d\xE1 para calcular a data.");
}
function Parto({ dados, hoje, onLancar }) {
  const [aba, setAba] = useState4("Cheia");
  const [busca, setBusca] = useState4("");
  const [aberta, setAberta] = useState4(null);
  const todasCheias = useMemo3(() => linhasPrevisao(dados.matrizes, dados.eventos, "Cheia", hoje, ""), [dados, hoje]);
  const nVazias = dados.matrizes.filter((m) => m.status === "Vazia").length;
  const linhas = useMemo3(() => linhasPrevisao(dados.matrizes, dados.eventos, aba, hoje, busca), [dados, aba, hoje, busca]);
  const atrasadas = todasCheias.filter((l) => l.dias !== null && l.dias < 0).length;
  const porVir = todasCheias.filter((l) => l.dias !== null && l.dias >= 0).length;
  const semPrev = todasCheias.filter((l) => l.dias === null).length;
  const vaziasSemParto = useMemo3(() => linhasPrevisao(dados.matrizes, dados.eventos, "Vazia", hoje, "").filter((l) => !l.ultimoParto).length, [dados, hoje]);
  const cols = "84px minmax(0,1fr) 78px 54px";
  return /* @__PURE__ */ React4.createElement("div", { className: "wrap" }, /* @__PURE__ */ React4.createElement("div", { className: "head" }, /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React4.createElement("h1", null, "Previs\xE3o de parto"))), /* @__PURE__ */ React4.createElement(
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
  ), /* @__PURE__ */ React4.createElement("section", { className: "sheet" }, /* @__PURE__ */ React4.createElement("label", { className: "search" }, /* @__PURE__ */ React4.createElement(Search, null), /* @__PURE__ */ React4.createElement("input", { placeholder: "Buscar pelo brinco", "aria-label": "Buscar pelo brinco", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React4.createElement("div", { className: "bar-sum" }, aba === "Cheia" ? /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement("span", { className: "late" }, atrasadas, " atrasadas"), /* @__PURE__ */ React4.createElement("span", { className: "good" }, porVir, " por vir"), semPrev > 0 && /* @__PURE__ */ React4.createElement("span", { className: "mut" }, semPrev, " sem previs\xE3o")) : /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement("span", { className: "soon" }, nVazias, " vazias"), vaziasSemParto > 0 && /* @__PURE__ */ React4.createElement("span", { className: "mut" }, vaziasSemParto, " sem parto lan\xE7ado"))), /* @__PURE__ */ React4.createElement("div", { className: "led-h", style: { "--cols": cols } }, /* @__PURE__ */ React4.createElement("span", null, "Brinco"), /* @__PURE__ */ React4.createElement("span", null, "Categoria"), /* @__PURE__ */ React4.createElement("span", null, aba === "Cheia" ? "Previs\xE3o" : "\xDAlt. parto"), /* @__PURE__ */ React4.createElement("span", { className: "r" }, aba === "Cheia" ? "Dias" : "H\xE1 (d)")), linhas.length === 0 && /* @__PURE__ */ React4.createElement("div", { className: "empty" }, busca ? "Nenhuma matriz com esse brinco aqui." : `Nenhuma matriz ${aba === "Cheia" ? "cheia" : "vazia"}.`), linhas.map((l) => {
    const m = l.matriz;
    const dd = aba === "Cheia" ? textoDias(l.dias) : { t: l.diasDesdeParto === null ? "\u2014" : String(l.diasDesdeParto), c: "mut" };
    const data = aba === "Cheia" ? l.previsao : l.ultimoParto;
    const aberto = aberta === m.id;
    return /* @__PURE__ */ React4.createElement(React4.Fragment, { key: m.id }, /* @__PURE__ */ React4.createElement("button", { className: "led-r", style: { "--cols": cols }, "aria-expanded": aberto, onClick: () => setAberta(aberto ? null : m.id) }, /* @__PURE__ */ React4.createElement("span", { className: "b" }, m.brinco), /* @__PURE__ */ React4.createElement("span", { className: "two" }, /* @__PURE__ */ React4.createElement("b", null, m.categoria), /* @__PURE__ */ React4.createElement("span", null, [m.raca, m.lote].filter(Boolean).join(" \xB7 ") || "\u2014")), /* @__PURE__ */ React4.createElement("span", { className: "m" }, data ? formatarDataBR(data) : "\u2014"), /* @__PURE__ */ React4.createElement("span", { className: `r ${dd.c}` }, dd.t)), aberto && /* @__PURE__ */ React4.createElement("div", { className: "detalhe" }, aba === "Cheia" && /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement(Calculo, { info: l.info })), l.ultimoParto ? /* @__PURE__ */ React4.createElement("div", null, "\xDAltimo parto: ", /* @__PURE__ */ React4.createElement("b", null, formatarDataBR(l.ultimoParto)), l.numeroCria ? ` (cria ${l.numeroCria})` : "") : /* @__PURE__ */ React4.createElement("div", null, "Nenhum parto lan\xE7ado para esta vaca."), aba === "Cheia" && l.dias !== null && l.dias < 0 && /* @__PURE__ */ React4.createElement("div", { className: "late", style: { marginTop: 4 } }, "A data prevista j\xE1 passou h\xE1 ", Math.abs(l.dias), " dia(s). Confira se ela j\xE1 pariu."), /* @__PURE__ */ React4.createElement("div", { style: { marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" } }, aba === "Cheia" ? /* @__PURE__ */ React4.createElement("button", { className: "btn sm", onClick: () => onLancar("nascimento", m.id) }, "Lan\xE7ar nascimento desta vaca") : /* @__PURE__ */ React4.createElement("button", { className: "btn sm", onClick: () => onLancar("iatf", m.id) }, "Lan\xE7ar IATF desta vaca"))));
  })), /* @__PURE__ */ React4.createElement("p", { className: "sub", style: { marginTop: 14 } }, "Dias negativos: a data prevista j\xE1 passou. Confira se a vaca pariu e lance o nascimento. A previs\xE3o olha o hist\xF3rico inteiro da vaca, n\xE3o s\xF3 o ano escolhido."));
}

// src/telas/Rebanho.jsx
import React5, { useMemo as useMemo4, useState as useState5 } from "react";
import { Search as Search2, Lock, Save as Save2 } from "lucide-react";
function ModalMatriz({ m, dados, ownerMode, onSalvar, onFechar }) {
  const [edit, setEdit] = useState5(false);
  const [form, setForm] = useState5({ ...m });
  const hist = useMemo4(
    () => dados.eventos.filter((e) => e.matrizId === m.id).sort((a, b) => (b.data || "").localeCompare(a.data || "")),
    [dados.eventos, m.id]
  );
  const partos = dados.eventos.filter((e) => e.tipo === "nascimento" && e.matrizId === m.id).length;
  const ult = ultimoPartoDe(m.id, dados.eventos);
  const cria = numeroCriaUltimoParto(m.id, dados.eventos);
  function salvar() {
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
  return /* @__PURE__ */ React5.createElement(Modal, { titulo: `Matriz ${m.brinco}`, onClose: onFechar, rotulo: `Matriz ${m.brinco}` }, !edit ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement("div", { style: { marginBottom: 6 } }, /* @__PURE__ */ React5.createElement(Tag, { status: m.status })), /* @__PURE__ */ React5.createElement(Lead, { rotulo: "Categoria", valor: m.categoria || "\u2014" }), /* @__PURE__ */ React5.createElement(Lead, { rotulo: "Ra\xE7a", valor: m.raca || "\u2014" }), /* @__PURE__ */ React5.createElement(Lead, { rotulo: "Lote / piquete", valor: m.lote || "\u2014" }), /* @__PURE__ */ React5.createElement(Lead, { rotulo: "Nascimento", valor: m.dataNascimento ? formatarDataBR(m.dataNascimento) : "\u2014" }), /* @__PURE__ */ React5.createElement(Lead, { rotulo: "Partos na fazenda", valor: partos }), /* @__PURE__ */ React5.createElement(Lead, { rotulo: "Partos antes de entrar", valor: m.partosAnteriores || 0 }), /* @__PURE__ */ React5.createElement(Lead, { rotulo: "\xDAltimo parto", valor: ult ? `${formatarDataBR(ult)}${cria ? ` (cria ${cria})` : ""}` : "\u2014" }), /* @__PURE__ */ React5.createElement("h3", { className: "h2", style: { fontSize: 18 } }, "Hist\xF3rico", /* @__PURE__ */ React5.createElement("small", null, hist.length, " lan\xE7amento(s)")), hist.length === 0 ? /* @__PURE__ */ React5.createElement("p", { className: "sub" }, "Nada lan\xE7ado para esta vaca ainda.") : /* @__PURE__ */ React5.createElement("ul", { className: "hist", "data-testid": "historico" }, hist.map((e) => /* @__PURE__ */ React5.createElement("li", { key: e.id }, /* @__PURE__ */ React5.createElement("span", null, descreverEvento(e, dados).replace(/ · (mãe|vaca) \S+/, "")), /* @__PURE__ */ React5.createElement("span", null, formatarDataBR(e.data))))), ownerMode ? /* @__PURE__ */ React5.createElement("button", { className: "btn wide", style: { marginTop: 16 }, onClick: () => setEdit(true) }, "Alterar cadastro") : /* @__PURE__ */ React5.createElement("p", { className: "sub", style: { marginTop: 16, display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React5.createElement(Lock, { size: 15, style: { flex: "none" } }), " S\xF3 o propriet\xE1rio altera o cadastro. Use o cadeado e a senha.")) : /* @__PURE__ */ React5.createElement(React5.Fragment, null, CAMPOS_EDICAO_MATRIZ.map((c) => /* @__PURE__ */ React5.createElement(Campo, { key: c.key, campo: c, value: form[c.key], onChange: (k, v) => setForm((f) => ({ ...f, [k]: v })), matrizes: [], touros: [] })), /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React5.createElement("button", { className: "btn", style: { flex: 1 }, onClick: salvar }, /* @__PURE__ */ React5.createElement(Save2, { size: 17 }), " Salvar altera\xE7\xF5es"), /* @__PURE__ */ React5.createElement("button", { className: "btn quiet", onClick: () => setEdit(false) }, "Cancelar"))));
}
function Rebanho({ dados, ownerMode, onSalvarMatriz }) {
  const [aba, setAba] = useState5("matrizes");
  const [filtro, setFiltro] = useState5("todos");
  const [busca, setBusca] = useState5("");
  const [aberta, setAberta] = useState5(null);
  const lista = useMemo4(() => {
    const q = busca.trim().toLowerCase();
    return dados.matrizes.filter((m) => (filtro === "todos" || m.status === filtro) && (!q || String(m.brinco).toLowerCase().includes(q))).slice().sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), "pt-BR", { numeric: true }));
  }, [dados.matrizes, filtro, busca]);
  const aberto = aberta ? dados.matrizes.find((m) => m.id === aberta) : null;
  const contar = (s) => dados.matrizes.filter((m) => m.status === s).length;
  return /* @__PURE__ */ React5.createElement("div", { className: "wrap" }, /* @__PURE__ */ React5.createElement("div", { className: "head" }, /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("small", null, "Livro do rebanho"), /* @__PURE__ */ React5.createElement("h1", null, "Rebanho"))), /* @__PURE__ */ React5.createElement(
    IndexTabs,
    {
      rotulo: "Cadastros",
      value: aba,
      onChange: setAba,
      tabs: [{ id: "matrizes", label: "Matrizes", count: dados.matrizes.length }, { id: "touros", label: "Touros", count: dados.touros.length }]
    }
  ), aba === "matrizes" && /* @__PURE__ */ React5.createElement("section", { className: "sheet" }, /* @__PURE__ */ React5.createElement("label", { className: "search" }, /* @__PURE__ */ React5.createElement(Search2, null), /* @__PURE__ */ React5.createElement("input", { placeholder: "Buscar pelo brinco", "aria-label": "Buscar pelo brinco", value: busca, onChange: (e) => setBusca(e.target.value) })), /* @__PURE__ */ React5.createElement("div", { style: { padding: "10px 16px", borderBottom: "1px solid var(--line)" } }, /* @__PURE__ */ React5.createElement("div", { className: "seg", role: "group", "aria-label": "Filtrar por situa\xE7\xE3o" }, [["todos", "Todas"], ["Cheia", `Cheias ${contar("Cheia")}`], ["Vazia", `Vazias ${contar("Vazia")}`], ["Descarte", `Descarte ${contar("Descarte")}`]].map(([id, rot]) => /* @__PURE__ */ React5.createElement("button", { key: id, "aria-pressed": filtro === id, onClick: () => setFiltro(id), style: { minHeight: 40, fontSize: 13 } }, rot)))), /* @__PURE__ */ React5.createElement("div", { className: "led-h cols-reb" }, /* @__PURE__ */ React5.createElement("span", null, "Brinco"), /* @__PURE__ */ React5.createElement("span", null, "Categoria"), /* @__PURE__ */ React5.createElement("span", null, "Situa\xE7\xE3o"), /* @__PURE__ */ React5.createElement("span", { className: "hide-s" }, "Lote"), /* @__PURE__ */ React5.createElement("span", { className: "hide-s" }, "\xDAlt. parto")), lista.length === 0 && /* @__PURE__ */ React5.createElement("div", { className: "empty" }, "Nenhuma matriz encontrada."), lista.map((m) => {
    const ult = ultimoPartoDe(m.id, dados.eventos);
    return /* @__PURE__ */ React5.createElement("button", { key: m.id, className: "led-r cols-reb", onClick: () => setAberta(m.id), "aria-label": `Abrir matriz ${m.brinco}` }, /* @__PURE__ */ React5.createElement("span", { className: "b" }, m.brinco), /* @__PURE__ */ React5.createElement("span", { className: "two" }, /* @__PURE__ */ React5.createElement("b", null, m.categoria), /* @__PURE__ */ React5.createElement("span", null, m.raca || "\u2014")), /* @__PURE__ */ React5.createElement("span", null, /* @__PURE__ */ React5.createElement(Tag, { status: m.status })), /* @__PURE__ */ React5.createElement("span", { className: "hide-s m mut" }, m.lote || "\u2014"), /* @__PURE__ */ React5.createElement("span", { className: "hide-s m mut" }, ult ? formatarDataBR(ult) : "\u2014"));
  })), aba === "touros" && /* @__PURE__ */ React5.createElement("section", { className: "sheet" }, dados.touros.length === 0 ? /* @__PURE__ */ React5.createElement("div", { className: "empty" }, "Nenhum touro / s\xEAmen cadastrado ainda.", ownerMode ? " Cadastre em Lan\xE7ar \u2192 Touro / s\xEAmen." : "", /* @__PURE__ */ React5.createElement("div", { style: { marginTop: 6, fontSize: 13 } }, 'Enquanto n\xE3o houver cadastro, os relat\xF3rios mostram o pai como "n\xE3o informado".')) : dados.touros.map((t) => {
    const usadas = dados.eventos.filter((e) => e.tipo === "iatf" && e.touroId === t.id).length;
    const adq = parseInt(t.doses, 10) || 0;
    const rest = adq - usadas;
    return /* @__PURE__ */ React5.createElement("div", { className: "led-r", key: t.id, style: { "--cols": ownerMode ? "minmax(0,1fr) auto" : "1fr", minHeight: 64 } }, /* @__PURE__ */ React5.createElement("span", { className: "two" }, /* @__PURE__ */ React5.createElement("b", null, t.nome), /* @__PURE__ */ React5.createElement("span", null, [t.raca, t.fornecedor, t.anoAquisicao].filter(Boolean).join(" \xB7 "))), ownerMode && adq > 0 && /* @__PURE__ */ React5.createElement("span", { className: "r", style: { color: rest <= 0 ? "var(--late)" : rest <= 5 ? "var(--amber)" : "var(--green)" } }, rest, " dose(s)", /* @__PURE__ */ React5.createElement("div", { style: { font: "500 11.5px var(--body)", color: "var(--mut)" } }, usadas, " de ", adq, t.custoDose ? ` \xB7 ${fmtBRL(t.custoDose)}` : "")));
  })), !ownerMode && /* @__PURE__ */ React5.createElement("p", { className: "sub", style: { marginTop: 14, display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React5.createElement(Lock, { size: 15, style: { flex: "none" } }), " Modo funcion\xE1rio: aqui voc\xEA consulta. Alterar cadastro \xE9 s\xF3 com a senha do propriet\xE1rio."), aberto && /* @__PURE__ */ React5.createElement(ModalMatriz, { key: aberto.id, m: aberto, dados, ownerMode, onSalvar: onSalvarMatriz, onFechar: () => setAberta(null) }));
}

// src/telas/Painel.jsx
import React6, { useMemo as useMemo5, useState as useState6 } from "react";
import { Download, RefreshCw } from "lucide-react";
function Painel({ anoSel, dados, ano, hoje, go, onExcel, onSync, onRecarregar, modoTeste, sincronizando }) {
  const [confirmar, setConfirmar] = useState6(false);
  const evsAno = useMemo5(() => filtrarPorAno(dados.eventos, ano), [dados.eventos, ano]);
  const k = useMemo5(() => calcularKPIs(dados.matrizes, evsAno), [dados.matrizes, evsAno]);
  const cheias = useMemo5(() => linhasPrevisao(dados.matrizes, dados.eventos, "Cheia", hoje, ""), [dados, hoje]);
  const atrasadas = cheias.filter((l) => l.dias !== null && l.dias < 0).length;
  const semPrev = cheias.filter((l) => l.dias === null).length;
  const sinal = cheias.filter((l) => l.dias !== null && l.dias >= 0 && l.dias <= 30).length;
  const nascSemMae = evsAno.filter((e) => e.tipo === "nascimento" && !e.matrizId).length;
  const semRacaLote = dados.matrizes.filter((m) => m.status !== "Descarte" && (!m.raca || !m.lote)).length;
  const brincos = {};
  dados.matrizes.forEach((m) => {
    brincos[m.brinco] = (brincos[m.brinco] || 0) + 1;
  });
  const duplicados = Object.values(brincos).filter((n) => n > 1).length;
  const porMes = useMemo5(() => {
    const mapa = {};
    evsAno.filter((e) => e.tipo === "nascimento" && e.data).forEach((e) => {
      const kk = e.data.slice(0, 7);
      mapa[kk] = (mapa[kk] || 0) + 1;
    });
    return Object.entries(mapa).sort().slice(-12);
  }, [evsAno]);
  const maxMes = Math.max(1, ...porMes.map(([, n]) => n));
  const recentes = useMemo5(
    () => [...dados.eventos].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 8),
    [dados.eventos]
  );
  const ativos = k.cheias + k.vazias;
  const pc = (n) => ativos ? n / ativos * 100 : 0;
  const rot = rotuloAno(ano);
  const pendencias = [
    atrasadas > 0 && { rotulo: "Previs\xF5es de parto j\xE1 vencidas (conferir se pariram)", valor: atrasadas, onClick: () => go("parto"), cor: "var(--late)" },
    semPrev > 0 && { rotulo: "Cheias sem previs\xE3o calculada", valor: semPrev, onClick: () => go("parto") },
    nascSemMae > 0 && { rotulo: `Nascimentos de ${rot} sem a m\xE3e informada`, valor: nascSemMae },
    semRacaLote > 0 && { rotulo: "Matrizes sem ra\xE7a ou lote no cadastro", valor: semRacaLote, onClick: () => go("rebanho") },
    duplicados > 0 && { rotulo: "Brincos repetidos no cadastro", valor: duplicados, cor: "var(--late)" }
  ].filter(Boolean);
  return /* @__PURE__ */ React6.createElement("div", { className: "wrap" }, /* @__PURE__ */ React6.createElement("div", { className: "head" }, /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("small", null, "Propriet\xE1rio \xB7 ", rot), /* @__PURE__ */ React6.createElement("h1", null, "Painel")), /* @__PURE__ */ React6.createElement("div", { className: "acts noprint" }, anoSel, /* @__PURE__ */ React6.createElement("button", { className: "btn ghost sm", onClick: onExcel }, /* @__PURE__ */ React6.createElement(Download, { size: 16 }), " Excel de ", rot))), /* @__PURE__ */ React6.createElement("h2", { className: "h2", style: { marginTop: 4 } }, "Rebanho hoje", /* @__PURE__ */ React6.createElement("small", null, formatarDataBR(hoje))), /* @__PURE__ */ React6.createElement(Kpis, { itens: [
    { rotulo: "Matrizes", valor: k.total },
    { rotulo: "Cheias", valor: k.cheias, cor: "var(--green)", sub: `${pc(k.cheias).toFixed(0)}% das ativas` },
    { rotulo: "Vazias", valor: k.vazias, cor: "var(--amber)", sub: `${pc(k.vazias).toFixed(0)}% das ativas` },
    { rotulo: "Descarte", valor: k.descartes, cor: "var(--late)" }
  ] }), /* @__PURE__ */ React6.createElement("div", { className: "panel", style: { marginTop: 12 } }, /* @__PURE__ */ React6.createElement("div", { className: "sbar", role: "img", "aria-label": `${k.cheias} cheias, ${k.vazias} vazias, ${k.descartes} em descarte` }, /* @__PURE__ */ React6.createElement("i", { style: { width: `${k.total ? k.cheias / k.total * 100 : 0}%`, background: "var(--green)" } }), /* @__PURE__ */ React6.createElement("i", { style: { width: `${k.total ? k.vazias / k.total * 100 : 0}%`, background: "var(--amber)" } }), /* @__PURE__ */ React6.createElement("i", { style: { width: `${k.total ? k.descartes / k.total * 100 : 0}%`, background: "var(--late)" } })), /* @__PURE__ */ React6.createElement("div", { className: "legend" }, /* @__PURE__ */ React6.createElement("span", { style: { "--c": "var(--green)" } }, "Cheias"), /* @__PURE__ */ React6.createElement("span", { style: { "--c": "var(--amber)" } }, "Vazias"), /* @__PURE__ */ React6.createElement("span", { style: { "--c": "var(--late)" } }, "Descarte")), /* @__PURE__ */ React6.createElement(Lead, { rotulo: "Partos previstos nos pr\xF3ximos 30 dias", valor: sinal, onClick: () => go("parto") }), /* @__PURE__ */ React6.createElement(Lead, { rotulo: "Novilhas em recria", valor: k.emRecria })), /* @__PURE__ */ React6.createElement("h2", { className: "h2" }, "Movimento de ", rot), /* @__PURE__ */ React6.createElement(Kpis, { itens: [
    { rotulo: "Nascimentos", valor: k.nascimentos + k.natimortos, sub: `${k.machos} machos \xB7 ${k.femeas} f\xEAmeas` },
    { rotulo: "IATF / coberturas", valor: k.iatfs },
    { rotulo: "Toques", valor: k.diagnosticos, sub: k.diagnosticos ? `${k.taxaPrenhez.toFixed(0)}% prenhes` : "nenhum no per\xEDodo" },
    { rotulo: "Desmamas", valor: k.desmamas, sub: k.desmamas ? `peso m\xE9dio ${k.pesoMedioDesmama.toFixed(0)} kg` : "nenhuma no per\xEDodo" }
  ] }), /* @__PURE__ */ React6.createElement("div", { className: "cols2", style: { marginTop: 16 } }, /* @__PURE__ */ React6.createElement("div", { className: "panel" }, /* @__PURE__ */ React6.createElement("h3", null, "Nascimentos por m\xEAs"), porMes.length === 0 ? /* @__PURE__ */ React6.createElement("p", { className: "sub" }, "Nenhum nascimento lan\xE7ado em ", rot, ".") : /* @__PURE__ */ React6.createElement("div", { className: "mbars", role: "img", "aria-label": "Nascimentos por m\xEAs" }, porMes.map(([mes, n]) => /* @__PURE__ */ React6.createElement("div", { className: "c", key: mes }, /* @__PURE__ */ React6.createElement("b", null, n), /* @__PURE__ */ React6.createElement("i", { style: { height: `${n / maxMes * 100}%` } }), /* @__PURE__ */ React6.createElement("span", null, mesCurto(mes))))), /* @__PURE__ */ React6.createElement(Lead, { rotulo: "Perda ao nascer (natimortos)", valor: `${k.taxaPerda.toFixed(0)}% \xB7 ${k.natimortos}`, cor: k.taxaPerda > 5 ? "var(--late)" : void 0 })), /* @__PURE__ */ React6.createElement("div", { className: "panel" }, /* @__PURE__ */ React6.createElement("h3", null, "A conferir"), pendencias.length === 0 ? /* @__PURE__ */ React6.createElement("p", { className: "sub" }, "Nada pendente. Tudo em ordem.") : pendencias.map((p) => /* @__PURE__ */ React6.createElement(Lead, { key: p.rotulo, rotulo: p.rotulo, valor: p.valor, onClick: p.onClick, cor: p.cor })))), /* @__PURE__ */ React6.createElement("h2", { className: "h2" }, "Dinheiro de ", rot), /* @__PURE__ */ React6.createElement(Kpis, { itens: [
    { rotulo: "Vendas", valor: fmtBRL(k.receitaTotal), pequeno: true },
    { rotulo: "Custos", valor: fmtBRL(k.custoTotal), pequeno: true, sub: "IATF, toque, insumo e frete" },
    { rotulo: "Custo por bezerro", valor: fmtBRL(k.custoPorBezerro), pequeno: true, cor: "var(--amber)" },
    { rotulo: "Margem", valor: fmtBRL(k.margem), pequeno: true, cor: k.margem >= 0 ? "var(--green)" : "var(--late)" }
  ] }), k.receitaTotal === 0 && k.custoTotal === 0 && /* @__PURE__ */ React6.createElement("p", { className: "sub", style: { marginTop: 8 } }, "Ainda n\xE3o h\xE1 vendas ou custos lan\xE7ados em ", rot, "."), /* @__PURE__ */ React6.createElement("h2", { className: "h2" }, "Atividade recente"), /* @__PURE__ */ React6.createElement("div", { className: "sheet" }, recentes.length === 0 ? /* @__PURE__ */ React6.createElement("div", { className: "empty" }, "Nada lan\xE7ado ainda.") : recentes.map((e) => /* @__PURE__ */ React6.createElement("div", { className: "led-r", key: e.id, style: { "--cols": "1fr auto", minHeight: 48 } }, /* @__PURE__ */ React6.createElement("span", { style: { fontSize: 14.5 } }, descreverEvento(e, dados)), /* @__PURE__ */ React6.createElement("span", { className: "m mut" }, formatarDataBR(e.data))))), /* @__PURE__ */ React6.createElement("details", { className: "ferr noprint" }, /* @__PURE__ */ React6.createElement("summary", null, "Ferramentas avan\xE7adas"), /* @__PURE__ */ React6.createElement("div", { className: "in2" }, /* @__PURE__ */ React6.createElement("button", { className: "btn quiet sm", onClick: onRecarregar }, /* @__PURE__ */ React6.createElement(RefreshCw, { size: 15 }), " Recarregar dados da planilha"), /* @__PURE__ */ React6.createElement("button", { className: "btn quiet sm", onClick: () => setConfirmar(true), disabled: sincronizando }, /* @__PURE__ */ React6.createElement(RefreshCw, { size: 15 }), " Sincronizar planilha agora")), confirmar && /* @__PURE__ */ React6.createElement(Aviso, { tipo: "info" }, "Isso regrava a planilha inteira com o que est\xE1 na tela (nada se perde; atualiza f\xF3rmulas, formata\xE7\xE3o e a aba Resumo). ", modoTeste ? "No modo teste n\xE3o faz nada de verdade." : "Pode levar alguns segundos.", /* @__PURE__ */ React6.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8 } }, /* @__PURE__ */ React6.createElement("button", { className: "btn sm", onClick: async () => {
    setConfirmar(false);
    await onSync();
  } }, "Confirmar"), /* @__PURE__ */ React6.createElement("button", { className: "btn quiet sm", onClick: () => setConfirmar(false) }, "Cancelar")))));
}

// src/telas/Relatorios.jsx
import React7, { useMemo as useMemo6, useState as useState7 } from "react";
import { Printer, Download as Download2 } from "lucide-react";
var NOMES_CURTOS = { previsao: "Parto", nascimentos: "Nascimentos", melhores: "Melhores vacas", iatf: "IATF", situacao: "Situa\xE7\xE3o" };
function Relatorios({ anoSel, dados, ano, hoje, onExcel, onExcelRelatorio }) {
  const [aba, setAba] = useState7("previsao");
  const [tipoPlan, setTipoPlan] = useState7("matrizes");
  const abas = [...RELATORIOS.map((r) => ({ id: r.id, label: NOMES_CURTOS[r.id] || r.titulo })), { id: "planilha", label: "Planilha" }];
  const def = RELATORIOS.find((r) => r.id === aba);
  const rel = useMemo6(() => def ? montarRelatorio(aba, dados, ano, hoje) : null, [aba, dados, ano, hoje]);
  const evsAno = useMemo6(() => filtrarPorAno(dados.eventos, ano), [dados.eventos, ano]);
  const linhasPlan = useMemo6(
    () => aba === "planilha" ? linhasPlanilha(tipoPlan, { matrizes: dados.matrizes, touros: dados.touros, eventos: evsAno }) : [],
    [aba, tipoPlan, dados, evsAno]
  );
  return /* @__PURE__ */ React7.createElement("div", { className: "wrap" }, /* @__PURE__ */ React7.createElement("div", { className: "head" }, /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement("small", null, "Propriet\xE1rio \xB7 ", rotuloAno(ano)), /* @__PURE__ */ React7.createElement("h1", null, aba === "planilha" ? "Planilha" : "Relat\xF3rios")), /* @__PURE__ */ React7.createElement("div", { className: "acts noprint" }, anoSel, def && /* @__PURE__ */ React7.createElement("button", { className: "btn quiet sm", onClick: () => window.print() }, /* @__PURE__ */ React7.createElement(Printer, { size: 16 }), " Imprimir"), def && /* @__PURE__ */ React7.createElement("button", { className: "btn ghost sm", onClick: () => onExcelRelatorio(rel) }, /* @__PURE__ */ React7.createElement(Download2, { size: 16 }), " Excel deste relat\xF3rio"), aba === "planilha" && /* @__PURE__ */ React7.createElement("button", { className: "btn ghost sm", onClick: onExcel }, /* @__PURE__ */ React7.createElement(Download2, { size: 16 }), " Excel completo de ", rotuloAno(ano)))), /* @__PURE__ */ React7.createElement(IndexTabs, { tabs: abas, value: aba, onChange: setAba, rotulo: "Relat\xF3rios" }), /* @__PURE__ */ React7.createElement("div", { className: "sheet pad" }, def && rel && /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement("h2", { className: "h2", style: { marginTop: 0 } }, rel.titulo), !def.porAno && /* @__PURE__ */ React7.createElement("p", { className: "sub" }, "Este relat\xF3rio mostra a situa\xE7\xE3o de hoje e n\xE3o muda com o ano escolhido."), /* @__PURE__ */ React7.createElement(Kpis, { itens: rel.resumo.map((r) => ({ rotulo: r.rotulo, valor: r.valor })) }), rel.secoes.map((s) => /* @__PURE__ */ React7.createElement(SecaoRelatorio, { key: s.titulo, secao: s }))), aba === "planilha" && /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement("p", { className: "sub" }, "Os dados brutos de cada aba, como est\xE3o na planilha. Os lan\xE7amentos mostram s\xF3 ", rotuloAno(ano), "; matrizes e touros aparecem inteiros."), /* @__PURE__ */ React7.createElement("div", { className: "seg", style: { flexWrap: "wrap", marginBottom: 14 }, role: "group", "aria-label": "Aba da planilha" }, ABAS_EXCEL.map(([nome, tipo]) => /* @__PURE__ */ React7.createElement("button", { key: tipo, "aria-pressed": tipoPlan === tipo, onClick: () => setTipoPlan(tipo), style: { flex: "0 0 auto", minHeight: 40, fontSize: 13 } }, nome))), /* @__PURE__ */ React7.createElement(TabelaLinhas, { rows: linhasPlan }))));
}

// src/app.jsx
var OWNER_PIN = typeof __PIN_TESTE__ !== "undefined" ? __PIN_TESTE__ : "1537";
var VAZIO = { matrizes: [], touros: [], eventos: [] };
function Marca() {
  return /* @__PURE__ */ React8.createElement("div", { className: "brand" }, /* @__PURE__ */ React8.createElement("small", null, "Fazenda Ibira\xE7u"), /* @__PURE__ */ React8.createElement("b", null, "Gest\xE3o da Pecu\xE1ria"));
}
function SeletorAno({ ano, anos, onChange }) {
  return /* @__PURE__ */ React8.createElement("label", { className: "chip", title: "Ano de gest\xE3o" }, /* @__PURE__ */ React8.createElement("span", { className: "sr" }, "Ano de gest\xE3o"), /* @__PURE__ */ React8.createElement("span", { "aria-hidden": "true" }, "ANO"), /* @__PURE__ */ React8.createElement("select", { "aria-label": "Ano de gest\xE3o", value: String(ano), onChange: (e) => onChange(e.target.value === "todos" ? "todos" : Number(e.target.value)) }, anos.map((a) => /* @__PURE__ */ React8.createElement("option", { key: a, value: a }, a)), /* @__PURE__ */ React8.createElement("option", { value: "todos" }, "Todos")), /* @__PURE__ */ React8.createElement(ChevronDown, { size: 14, "aria-hidden": "true" }));
}
function GestaoPecuaria() {
  const [tab, setTab] = useState8("lancar");
  const [dados, setDados] = useState8(VAZIO);
  const dadosRef = useRef3(VAZIO);
  const [loading, setLoading] = useState8(true);
  const [aviso, setAviso] = useState8(null);
  const [versaoScript, setVersaoScript] = useState8(null);
  const [ownerMode, setOwnerMode] = useState8(false);
  const [pinAberto, setPinAberto] = useState8(false);
  const [pin, setPin] = useState8("");
  const [pinErro, setPinErro] = useState8(false);
  const [hoje, setHoje] = useState8(todayISO());
  const [ano, setAno] = useState8(() => anoDe(todayISO()));
  const [pendentes, setPendentes] = useState8(0);
  const [sincronizando, setSincronizando] = useState8(false);
  const [preset, setPreset] = useState8(null);
  const fila = useRef3(Promise.resolve());
  function commit(novo) {
    dadosRef.current = novo;
    setDados(novo);
  }
  useEffect3(() => {
    const f = () => setHoje(todayISO());
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);
  useEffect3(() => {
    carregar();
  }, []);
  async function carregar() {
    setLoading(true);
    setAviso(null);
    try {
      const data = await lerTudo();
      commit(normalizarDados(data));
      const v = Number(data.versao) || 0;
      setVersaoScript(v);
      if (v < VERSAO_MINIMA_SCRIPT) {
        setAviso({ tipo: "erro", texto: `ATEN\xC7\xC3O: o script da planilha est\xE1 desatualizado (vers\xE3o ${v || "antiga"}). O que voc\xEA lan\xE7ar aparece na tela, mas N\xC3O est\xE1 sendo gravado na planilha. Avise o respons\xE1vel pelo sistema.` });
      }
    } catch (e) {
      console.error("Erro ao carregar dados da planilha", e);
      setAviso({ tipo: "erro", texto: "N\xE3o consegui falar com a planilha agora. Verifique a internet e tente de novo. Os dados na tela podem estar desatualizados." });
    }
    setLoading(false);
  }
  async function gravar(payload, rotulo) {
    try {
      await postar(payload);
      return true;
    } catch (e) {
      console.error(`Erro ao gravar (${rotulo})`, e);
      setAviso({ tipo: "erro", texto: `N\xE3o consegui gravar na planilha (${rotulo}): ${e.message}. O registro aparece na tela, mas pode sumir ao recarregar. Tente salvar de novo.` });
      return false;
    }
  }
  function enfileirar(payload, rotulo) {
    setPendentes((n) => n + 1);
    fila.current = fila.current.then(() => gravar(payload, rotulo)).then(() => setPendentes((n) => n - 1));
  }
  function salvarLancamento(tipo, form) {
    const antes = dadosRef.current;
    const r = aplicarLancamento(antes, tipo, form);
    commit(r.estado);
    r.eventosNovos.forEach((e) => enfileirar({ action: "appendEvento", tipo: e.tipo, evento: e }, "lan\xE7amento"));
    r.matrizesAlteradas.forEach((m) => enfileirar({ action: "upsertMatriz", matriz: m }, "matriz"));
    r.tourosNovos.forEach((t) => enfileirar({ action: "appendTouro", touro: t }, "touro"));
    if (tipo === "cadastro") return `Matriz ${r.matrizesAlteradas[0].brinco} cadastrada.`;
    if (tipo === "touro") return `Touro ${r.tourosNovos[0].nome} cadastrado.`;
    const mudou = r.matrizesAlteradas.map((m) => {
      const a = antes.matrizes.find((x) => x.id === m.id);
      const partes = [];
      if (a && a.status !== m.status) partes.push(`${a.status} \u2192 ${m.status}`);
      if (a && a.categoria !== m.categoria) partes.push(`${a.categoria} \u2192 ${m.categoria}`);
      return partes.length ? `${m.brinco}: ${partes.join(", ")}` : "";
    }).filter(Boolean);
    return `Salvo: ${descreverEvento(r.eventosNovos[0], r.estado)}.${mudou.length ? ` Atualizado: ${mudou.join("; ")}.` : ""}`;
  }
  function salvarMatriz(m) {
    const d = dadosRef.current;
    commit({ ...d, matrizes: d.matrizes.map((x) => x.id === m.id ? m : x) });
    enfileirar({ action: "upsertMatriz", matriz: m }, "matriz");
  }
  async function gravarLote(res) {
    if (!MODO_TESTE && (versaoScript || 0) < 8) {
      return { ok: false, msg: "O script da planilha est\xE1 desatualizado e n\xE3o aceita lote. Avise o respons\xE1vel pelo sistema." };
    }
    try {
      const itens = res.eventosParaGravar;
      for (let i = 0; i < itens.length; i += 40) await postar({ action: "appendEventos", itens: itens.slice(i, i + 40) });
      if (res.matrizesParaGravar.length) await postar({ action: "upsertMatrizes", matrizes: res.matrizesParaGravar });
      for (const t of res.tourosParaGravar) await postar({ action: "appendTouro", touro: t });
    } catch (e) {
      console.error("Erro ao gravar lote", e);
      return { ok: false, msg: `N\xE3o consegui gravar tudo: ${e.message}. Use "Recarregar dados" nas ferramentas avan\xE7adas do Painel para ver o que chegou na planilha antes de tentar de novo, para n\xE3o duplicar.` };
    }
    commit(res.estado);
    return { ok: true, msg: `Gravados ${res.eventosParaGravar.length} lan\xE7amento(s) e ${res.matrizesParaGravar.length} matriz(es) atualizada(s).` };
  }
  async function sincronizarTudo() {
    setSincronizando(true);
    const d = dadosRef.current;
    const a = anoDe(hoje);
    const resumo = buildResumoRows(calcularKPIs(d.matrizes, filtrarPorAno(d.eventos, a)), a);
    const ok = await gravar({ action: "syncAll", matrizes: d.matrizes, touros: d.touros, eventos: d.eventos, resumo }, "sincroniza\xE7\xE3o completa");
    setSincronizando(false);
    if (ok) setAviso({ tipo: "ok", texto: `Planilha sincronizada${MODO_TESTE ? " (modo teste: simulado)" : ""}. A aba Resumo mostra o ano ${a}.` });
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
  const anos = useMemo7(() => anosDisponiveis(dados.eventos, hoje), [dados.eventos, hoje]);
  const itensNav = [
    ownerMode && { id: "painel", label: "Painel", Icon: LayoutDashboard },
    { id: "lancar", label: "Lan\xE7ar", Icon: Plus },
    { id: "parto", label: "Parto", Icon: CalendarClock },
    { id: "rebanho", label: "Rebanho", Icon: List },
    ownerMode && { id: "relatorios", label: "Relat\xF3rios", Icon: FileText }
  ].filter(Boolean);
  const anoSel = /* @__PURE__ */ React8.createElement(SeletorAno, { ano, anos, onChange: setAno });
  const botaoDono = ownerMode ? /* @__PURE__ */ React8.createElement("button", { className: "chip on", onClick: sairDoModoDono, "aria-label": "Sair do modo propriet\xE1rio", title: "Voltar para o modo funcion\xE1rio" }, /* @__PURE__ */ React8.createElement(Unlock, { size: 15 }), " DONO") : /* @__PURE__ */ React8.createElement("button", { className: "chip lock", onClick: () => {
    setPinAberto(true);
    setPin("");
    setPinErro(false);
  }, "aria-label": "Entrar como propriet\xE1rio", title: "Entrar como propriet\xE1rio" }, /* @__PURE__ */ React8.createElement(Lock2, { size: 16 }));
  if (loading) {
    return /* @__PURE__ */ React8.createElement("div", { className: "app" }, /* @__PURE__ */ React8.createElement("style", null, CSS), /* @__PURE__ */ React8.createElement("div", { className: "main" }, /* @__PURE__ */ React8.createElement("div", { className: "loading" }, /* @__PURE__ */ React8.createElement(Loader23, { size: 20, className: "spin" }), " Abrindo o livro do rebanho...")));
  }
  return /* @__PURE__ */ React8.createElement("div", { className: "app" }, /* @__PURE__ */ React8.createElement("style", null, CSS), /* @__PURE__ */ React8.createElement("aside", { className: "side" }, /* @__PURE__ */ React8.createElement(Marca, null), /* @__PURE__ */ React8.createElement("nav", { "aria-label": "Telas" }, itensNav.map(({ id, label, Icon }) => /* @__PURE__ */ React8.createElement("button", { key: id, "aria-current": tab === id ? "page" : void 0, onClick: () => mudarTab(id) }, /* @__PURE__ */ React8.createElement(Icon, null), " ", label))), /* @__PURE__ */ React8.createElement("div", { className: "foot" }, botaoDono)), /* @__PURE__ */ React8.createElement("div", { className: "main" }, MODO_TESTE && /* @__PURE__ */ React8.createElement("div", { className: "banner-teste", role: "status" }, /* @__PURE__ */ React8.createElement("b", null, "MODO TESTE"), /* @__PURE__ */ React8.createElement("span", null, "L\xEA os dados reais da planilha, mas N\xC3O grava nada nela. O que voc\xEA lan\xE7ar aqui some ao recarregar."), /* @__PURE__ */ React8.createElement("button", { onClick: carregar }, "Recarregar dados")), /* @__PURE__ */ React8.createElement("header", { className: "topbar" }, /* @__PURE__ */ React8.createElement("div", { className: "in" }, /* @__PURE__ */ React8.createElement(Marca, null), pendentes > 0 && /* @__PURE__ */ React8.createElement("span", { className: "chip", role: "status" }, /* @__PURE__ */ React8.createElement(Loader23, { size: 14, className: "spin" }), " gravando"), botaoDono)), pendentes > 0 && /* @__PURE__ */ React8.createElement("span", { className: "sr", role: "status" }, "Gravando na planilha"), aviso && /* @__PURE__ */ React8.createElement("div", { className: "wrap" }, /* @__PURE__ */ React8.createElement(Aviso, { tipo: aviso.tipo === "erro" ? void 0 : aviso.tipo, onClose: () => setAviso(null) }, aviso.texto)), tab === "lancar" && /* @__PURE__ */ React8.createElement(Lancar, { dados, hoje, ownerMode, preset, onSalvar: salvarLancamento, onGravarLote: gravarLote, modoTeste: MODO_TESTE }), tab === "parto" && /* @__PURE__ */ React8.createElement(Parto, { dados, hoje, onLancar: lancarDaVaca }), tab === "rebanho" && /* @__PURE__ */ React8.createElement(Rebanho, { dados, ownerMode, onSalvarMatriz: salvarMatriz }), tab === "painel" && ownerMode && /* @__PURE__ */ React8.createElement(
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
  ), tab === "relatorios" && ownerMode && /* @__PURE__ */ React8.createElement(
    Relatorios,
    {
      anoSel,
      dados,
      ano,
      hoje,
      onExcel: () => exportarExcel(dadosRef.current, ano, hoje),
      onExcelRelatorio: (rel) => exportarRelatorioExcel(rel, ano, hoje)
    }
  ), /* @__PURE__ */ React8.createElement("div", { className: "foot-note" }, "Fazenda Ibira\xE7u \xB7 app ", VERSAO_APP, " \xB7 planilha ", versaoScript ? `v${versaoScript}` : "vers\xE3o antiga", MODO_TESTE ? " \xB7 TESTE" : "")), /* @__PURE__ */ React8.createElement("nav", { className: "bnav", "aria-label": "Telas (celular)" }, itensNav.map(({ id, label, Icon }) => /* @__PURE__ */ React8.createElement("button", { key: id, "aria-current": tab === id ? "page" : void 0, onClick: () => mudarTab(id) }, /* @__PURE__ */ React8.createElement(Icon, null), " ", label))), pinAberto && !ownerMode && /* @__PURE__ */ React8.createElement(Modal, { titulo: "\xC1rea do propriet\xE1rio", onClose: () => setPinAberto(false) }, /* @__PURE__ */ React8.createElement("form", { onSubmit: (e) => {
    e.preventDefault();
    tentarEntrar();
  } }, /* @__PURE__ */ React8.createElement("div", { className: "fld" }, /* @__PURE__ */ React8.createElement("label", { htmlFor: "pin" }, "Senha (PIN)"), /* @__PURE__ */ React8.createElement("input", { id: "pin", type: "password", inputMode: "numeric", autoComplete: "off", autoFocus: true, value: pin, onChange: (e) => {
    setPin(e.target.value);
    setPinErro(false);
  } }), pinErro && /* @__PURE__ */ React8.createElement("div", { className: "hint late", role: "alert" }, "Senha incorreta.")), /* @__PURE__ */ React8.createElement("button", { type: "submit", className: "btn wide" }, "Entrar"))));
}
createRoot(document.getElementById("root")).render(/* @__PURE__ */ React8.createElement(GestaoPecuaria, null));
