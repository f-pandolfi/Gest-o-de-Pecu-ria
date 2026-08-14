import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plus, LayoutDashboard, List, Syringe, Stethoscope, Baby, TrendingUp, DollarSign, Package, Trash2, Save, ClipboardList, AlertCircle, Check, Loader2, Search, Sprout, RefreshCw, X, Dna, Lock, Unlock, Eye, EyeOff, Table, CalendarClock } from 'lucide-react';

// ---------- paleta ----------
const C = {
  bg: '#161F1A',
  surface: '#1F2A23',
  surfaceAlt: '#26332B',
  border: '#354237',
  text: '#EDE8DC',
  textMuted: '#95A296',
  accent: '#D4954A',
  accentSoft: 'rgba(212,149,74,0.15)',
  cheia: '#7FA86B',
  vazia: '#D4A63A',
  descarte: '#B5533C',
  danger: '#C15B48'
};

// PIN simples para desbloquear o modo Proprietário. Isso é uma trava de conveniência,
// não segurança de verdade (o código fica visível pra quem inspecionar a página) —
// mas é suficiente pra impedir que o funcionário abra sem querer as telas financeiras.
const OWNER_PIN = '1537';

// URL do Apps Script publicado, que lê/grava na planilha "Gestão Pecuária - Fazenda Ibiraçú"
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbyDBTMVGJGeBj92qtiIRfrzZciWyzgP8mvDx8inCjdvVBb2Erm5laJyuuiwx8YjJQlI/exec';

// Tipos de lançamento visíveis no modo Funcionário (restrito)
const TIPOS_FUNCIONARIO = ['nascimento', 'desmama', 'iatf', 'insumo', 'descarte'];

// Campos editáveis ao clicar numa matriz (modo proprietário) — cobre tudo do cadastro, com Status completo
const CAMPOS_EDICAO_MATRIZ = [{
  key: 'brinco',
  label: 'Brinco / ID',
  type: 'text',
  required: true
}, {
  key: 'categoria',
  label: 'Categoria',
  type: 'select',
  options: ['Novilha', 'Primípara', 'Multípara', 'Vaca']
}, {
  key: 'raca',
  label: 'Raça',
  type: 'text'
}, {
  key: 'lote',
  label: 'Lote / piquete',
  type: 'text'
}, {
  key: 'dataNascimento',
  label: 'Data de nascimento',
  type: 'date'
}, {
  key: 'partosAnteriores',
  label: 'Partos antes de entrar na fazenda',
  type: 'number'
}, {
  key: 'status',
  label: 'Status',
  type: 'select',
  options: ['Vazia', 'Cheia', 'Descarte']
}];

// Abas disponíveis na visão de Planilha
const PLANILHA_TIPOS = [{
  id: 'matrizes',
  label: 'Matrizes',
  icon: List
}, {
  id: 'nascimento',
  label: 'Nascimentos',
  icon: Baby
}, {
  id: 'desmama',
  label: 'Desmama',
  icon: TrendingUp
}, {
  id: 'recria',
  label: 'Recria',
  icon: Sprout
}, {
  id: 'iatf',
  label: 'IATF',
  icon: Syringe
}, {
  id: 'diagnostico',
  label: 'Diagnósticos',
  icon: Stethoscope
}, {
  id: 'venda',
  label: 'Vendas',
  icon: DollarSign
}, {
  id: 'insumo',
  label: 'Insumos',
  icon: Package
}, {
  id: 'descarte',
  label: 'Descartes',
  icon: Trash2
}, {
  id: 'touros',
  label: 'Touros',
  icon: Dna
}];
const TIPOS_EVENTO = [{
  id: 'cadastro',
  label: 'Nova Matriz',
  icon: Plus
}, {
  id: 'touro',
  label: 'Touro / Sêmen',
  icon: Dna
}, {
  id: 'iatf',
  label: 'Inseminação (IATF)',
  icon: Syringe
}, {
  id: 'diagnostico',
  label: 'Diagnóstico (Toque)',
  icon: Stethoscope
}, {
  id: 'nascimento',
  label: 'Nascimento',
  icon: Baby
}, {
  id: 'desmama',
  label: 'Desmama',
  icon: TrendingUp
}, {
  id: 'recria',
  label: 'Recria (pesagem)',
  icon: Sprout
}, {
  id: 'venda',
  label: 'Venda',
  icon: DollarSign
}, {
  id: 'insumo',
  label: 'Sal / Medicamento',
  icon: Package
}, {
  id: 'descarte',
  label: 'Descarte',
  icon: Trash2
}];
const CAMPOS = {
  cadastro: [{
    key: 'brinco',
    label: 'Brinco / ID',
    type: 'text',
    required: true
  }, {
    key: 'categoria',
    label: 'Categoria',
    type: 'select',
    options: ['Novilha', 'Primípara', 'Multípara', 'Vaca']
  }, {
    key: 'raca',
    label: 'Raça',
    type: 'text'
  }, {
    key: 'lote',
    label: 'Lote / piquete',
    type: 'text'
  }, {
    key: 'dataNascimento',
    label: 'Data de nascimento',
    type: 'date'
  }, {
    key: 'partosAnteriores',
    label: 'Partos antes de entrar na fazenda',
    type: 'number'
  }, {
    key: 'statusInicial',
    label: 'Status inicial',
    type: 'select',
    options: ['Vazia', 'Cheia']
  }],
  touro: [{
    key: 'nome',
    label: 'Nome do touro / sêmen',
    type: 'text',
    required: true
  }, {
    key: 'raca',
    label: 'Raça',
    type: 'text',
    required: true
  }, {
    key: 'fornecedor',
    label: 'Central / fornecedor',
    type: 'text'
  }, {
    key: 'anoAquisicao',
    label: 'Ano de aquisição',
    type: 'number'
  }, {
    key: 'doses',
    label: 'Doses adquiridas',
    type: 'number'
  }, {
    key: 'custoDose',
    label: 'Custo por dose (R$)',
    type: 'number'
  }, {
    key: 'observacoes',
    label: 'Observações',
    type: 'text'
  }],
  iatf: [{
    key: 'matrizId',
    label: 'Matriz',
    type: 'matriz',
    required: true
  }, {
    key: 'tipoServico',
    label: 'Tipo',
    type: 'select',
    options: ['IATF', 'Repasse (monta natural)']
  }, {
    key: 'numeroServico',
    label: 'Nº da tentativa',
    type: 'select',
    options: ['1ª', '2ª', '3ª ou mais']
  }, {
    key: 'data',
    label: 'Data da IA / cobertura',
    type: 'date',
    required: true
  }, {
    key: 'dataInicioProtocolo',
    label: 'Início do protocolo',
    type: 'date'
  }, {
    key: 'touroId',
    label: 'Sêmen / touro',
    type: 'touro'
  }, {
    key: 'touroOutro',
    label: 'Nome (não cadastrado)',
    type: 'text',
    showIf: f => f.touroId === '__outro__'
  }, {
    key: 'tecnico',
    label: 'Técnico',
    type: 'text'
  }, {
    key: 'custo',
    label: 'Custo (R$)',
    type: 'number'
  }, {
    key: 'observacoes',
    label: 'Observações',
    type: 'text'
  }],
  diagnostico: [{
    key: 'matrizId',
    label: 'Matriz',
    type: 'matriz',
    required: true
  }, {
    key: 'data',
    label: 'Data do exame',
    type: 'date',
    required: true
  }, {
    key: 'resultado',
    label: 'Resultado',
    type: 'select',
    options: ['Prenhe', 'Vazia', 'Descarte'],
    required: true
  }, {
    key: 'metodo',
    label: 'Método',
    type: 'select',
    options: ['Toque retal', 'Ultrassom']
  }, {
    key: 'dg',
    label: 'DG (dias de gestação)',
    type: 'number'
  }, {
    key: 'motivo',
    label: 'Motivo do descarte',
    type: 'text',
    showIf: f => f.resultado === 'Descarte'
  }, {
    key: 'veterinario',
    label: 'Veterinário',
    type: 'text'
  }, {
    key: 'custo',
    label: 'Custo (R$)',
    type: 'number'
  }],
  nascimento: [{
    key: 'matrizId',
    label: 'Matriz (mãe)',
    type: 'matriz'
  }, {
    key: 'data',
    label: 'Data do nascimento',
    type: 'date',
    required: true
  }, {
    key: 'resultadoParto',
    label: 'Resultado',
    type: 'select',
    options: ['Vivo', 'Natimorto'],
    required: true
  }, {
    key: 'sexo',
    label: 'Sexo',
    type: 'select',
    options: ['Macho', 'Fêmea']
  }, {
    key: 'pesoNascer',
    label: 'Peso ao nascer (kg)',
    type: 'number'
  }, {
    key: 'brincoBezerro',
    label: 'Brinco do bezerro (sugerido automaticamente)',
    type: 'text'
  }, {
    key: 'pelagem',
    label: 'Pelagem',
    type: 'text'
  }, {
    key: 'touroId',
    label: 'Pai (touro / sêmen)',
    type: 'touro'
  }, {
    key: 'touroOutro',
    label: 'Nome (não cadastrado)',
    type: 'text',
    showIf: f => f.touroId === '__outro__'
  }, {
    key: 'tipoParto',
    label: 'Tipo de parto',
    type: 'select',
    options: ['Normal', 'Distócico (com dificuldade)']
  }, {
    key: 'observacoes',
    label: 'Observações',
    type: 'text'
  }],
  desmama: [{
    key: 'brincoBezerro',
    label: 'Brinco do bezerro',
    type: 'text',
    required: true
  }, {
    key: 'data',
    label: 'Data da desmama',
    type: 'date',
    required: true
  }, {
    key: 'pesoDesmama',
    label: 'Peso na desmama (kg)',
    type: 'number'
  }, {
    key: 'idadeDias',
    label: 'Idade (dias)',
    type: 'number'
  }],
  recria: [{
    key: 'matrizId',
    label: 'Novilha',
    type: 'matriz',
    required: true
  }, {
    key: 'data',
    label: 'Data da pesagem',
    type: 'date',
    required: true
  }, {
    key: 'pesoAtual',
    label: 'Peso atual (kg)',
    type: 'number'
  }, {
    key: 'aptaReproducao',
    label: 'Apta para reprodução?',
    type: 'select',
    options: ['Ainda não', 'Sim, apta']
  }, {
    key: 'observacoes',
    label: 'Observações',
    type: 'text'
  }],
  venda: [{
    key: 'data',
    label: 'Data da venda',
    type: 'date',
    required: true
  }, {
    key: 'categoria',
    label: 'Categoria do animal',
    type: 'select',
    options: ['Bezerro(a) (mamando)', 'Novilha (recria)', 'Boi/Boiadinho (engorda)', 'Vaca de descarte']
  }, {
    key: 'animais',
    label: 'Animais (descrição/qtd)',
    type: 'text'
  }, {
    key: 'pesoTotal',
    label: 'Peso total (kg)',
    type: 'number'
  }, {
    key: 'valorArroba',
    label: 'Valor por arroba (R$)',
    type: 'number'
  }, {
    key: 'valorTotal',
    label: 'Valor total da venda (R$)',
    type: 'number',
    required: true
  }, {
    key: 'frete',
    label: 'Frete / comissão (R$)',
    type: 'number'
  }, {
    key: 'comprador',
    label: 'Comprador',
    type: 'text'
  }],
  insumo: [{
    key: 'data',
    label: 'Data',
    type: 'date',
    required: true
  }, {
    key: 'produto',
    label: 'Produto',
    type: 'select',
    options: ['Sal Mineral', 'Medicamento', 'Vacina', 'Outro']
  }, {
    key: 'quantidade',
    label: 'Quantidade',
    type: 'number'
  }, {
    key: 'unidade',
    label: 'Unidade',
    type: 'select',
    options: ['kg', 'L', 'un', 'dose']
  }, {
    key: 'custo',
    label: 'Custo (R$)',
    type: 'number'
  }, {
    key: 'categoriaAnimal',
    label: 'Categoria de animal',
    type: 'text'
  }],
  descarte: [{
    key: 'matrizId',
    label: 'Matriz',
    type: 'matriz',
    required: true
  }, {
    key: 'data',
    label: 'Data',
    type: 'date',
    required: true
  }, {
    key: 'motivo',
    label: 'Motivo',
    type: 'text'
  }]
};
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Formata data ISO (YYYY-MM-DD) para o padrão brasileiro DD/MM/AA
function formatarDataBR(iso) {
  if (!iso || typeof iso !== 'string') return iso || '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const [, ano, mes, dia] = m;
  return `${dia}/${mes}/${ano.slice(2)}`;
}

// Data (ISO) do parto mais recente daquela matriz, olhando os nascimentos já lançados
function ultimoPartoDe(matrizId, eventos) {
  const nascs = eventos.filter(e => e.tipo === 'nascimento' && e.matrizId === matrizId && e.data);
  if (!nascs.length) return '';
  return nascs.reduce((max, e) => e.data > max ? e.data : max, nascs[0].data);
}

// Número (brinco) da cria do último parto daquela matriz
function numeroCriaUltimoParto(matrizId, eventos) {
  const nascs = eventos.filter(e => e.tipo === 'nascimento' && e.matrizId === matrizId && e.data);
  if (!nascs.length) return '';
  const maisRecente = nascs.reduce((max, e) => e.data > max.data ? e : max, nascs[0]);
  return maisRecente.brincoBezerro || '';
}
const PERIODO_GESTACAO_DIAS = 285; // mesmo período usado na planilha original da fazenda

function addDias(dataISO, dias) {
  const d = new Date(dataISO + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

// Previsão de parto: prioriza diagnóstico com DG preenchido (mais preciso), senão usa a IATF mais recente
function previsaoPartoDe(matrizId, eventos) {
  const diags = eventos.filter(e => e.tipo === 'diagnostico' && e.matrizId === matrizId && e.resultado === 'Prenhe' && e.dg && e.data).sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  if (diags.length) {
    const dg = parseInt(diags[0].dg);
    if (!isNaN(dg)) {
      const concepcao = addDias(diags[0].data, -dg);
      return addDias(concepcao, PERIODO_GESTACAO_DIAS);
    }
  }
  const iatfs = eventos.filter(e => e.tipo === 'iatf' && e.matrizId === matrizId && e.data).sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  if (iatfs.length) return addDias(iatfs[0].data, PERIODO_GESTACAO_DIAS);
  return '';
}

// Sugere o próximo número de brinco de bezerro seguindo a convenção do produtor:
// 1º dígito = último dígito do ano · faixa 000-499 = fêmea, 500-999 = macho · resto = sequência
function sugerirBrincoBezerro(data, sexo, eventos) {
  if (!data || !sexo) return '';
  const ano = parseInt(data.slice(0, 4), 10) % 10;
  const base = sexo === 'Macho' ? 500 : 0;
  const usados = new Set();
  eventos.filter(e => e.tipo === 'nascimento' && e.brincoBezerro).forEach(e => {
    const n = parseInt(e.brincoBezerro, 10);
    if (!isNaN(n) && Math.floor(n / 1000) === ano) {
      const resto = n % 1000;
      if (resto >= base && resto < base + 500) usados.add(resto - base);
    }
  });
  let seq = 0;
  while (usados.has(seq)) seq++;
  return String(ano * 1000 + base + seq);
}

// ---------- componentes utilitários ----------
function Field({
  campo,
  value,
  onChange,
  matrizes,
  touros
}) {
  const base = {
    width: '100%',
    padding: '11px 12px',
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    background: C.surfaceAlt,
    color: C.text,
    fontSize: 15,
    outline: 'none'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      color: C.textMuted,
      marginBottom: 6
    }
  }, campo.label, campo.required ? ' *' : ''), campo.type === 'select' && /*#__PURE__*/React.createElement("select", {
    style: base,
    value: value || '',
    onChange: e => onChange(campo.key, e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), campo.options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o))), campo.type === 'matriz' && /*#__PURE__*/React.createElement("select", {
    style: base,
    value: value || '',
    onChange: e => onChange(campo.key, e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione a matriz"), matrizes.filter(m => m.status !== 'Descarte').map(m => /*#__PURE__*/React.createElement("option", {
    key: m.id,
    value: m.id
  }, m.brinco, " — ", m.status))), campo.type === 'touro' && /*#__PURE__*/React.createElement("select", {
    style: base,
    value: value || '',
    onChange: e => onChange(campo.key, e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione"), touros.map(t => /*#__PURE__*/React.createElement("option", {
    key: t.id,
    value: t.id
  }, t.nome, " — ", t.raca)), /*#__PURE__*/React.createElement("option", {
    value: "__outro__"
  }, "Outro / não cadastrado")), (campo.type === 'text' || campo.type === 'number' || campo.type === 'date') && /*#__PURE__*/React.createElement("input", {
    style: base,
    type: campo.type,
    inputMode: campo.type === 'number' ? 'decimal' : undefined,
    value: value || '',
    onChange: e => onChange(campo.key, e.target.value)
  }));
}
function StatCard({
  label,
  value,
  sub,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '16px 18px',
      flex: '1 1 150px',
      minWidth: 150
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.textMuted,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.4
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: color || C.text,
      fontFamily: 'Georgia, serif'
    }
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.textMuted,
      marginTop: 4
    }
  }, sub));
}
function SheetTable({
  rows
}) {
  if (!rows || rows.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        color: C.textMuted,
        fontSize: 13.5,
        padding: '30px 0',
        textAlign: 'center'
      }
    }, "Nenhum registro lançado ainda.");
  }
  const headers = Object.keys(rows[0]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto',
      border: `1px solid ${C.border}`,
      borderRadius: 12
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      width: '100%',
      fontSize: 12.5,
      minWidth: headers.length * 110
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, headers.map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      position: 'sticky',
      top: 0,
      background: C.surfaceAlt,
      color: C.textMuted,
      textAlign: 'left',
      padding: '9px 12px',
      borderBottom: `1px solid ${C.border}`,
      whiteSpace: 'nowrap',
      fontWeight: 700
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      background: i % 2 === 0 ? 'transparent' : C.surfaceAlt
    }
  }, headers.map(h => /*#__PURE__*/React.createElement("td", {
    key: h,
    style: {
      padding: '8px 12px',
      borderBottom: `1px solid ${C.border}`,
      whiteSpace: 'nowrap',
      color: C.text
    }
  }, String(r[h] ?? ''))))))));
}
function calcularKPIs(matrizes, eventos) {
  const cheias = matrizes.filter(m => m.status === 'Cheia').length;
  const vazias = matrizes.filter(m => m.status === 'Vazia').length;
  const descartes = matrizes.filter(m => m.status === 'Descarte').length;
  const diagnosticos = eventos.filter(e => e.tipo === 'diagnostico');
  const taxaPrenhez = diagnosticos.length ? diagnosticos.filter(d => d.resultado === 'Prenhe').length / diagnosticos.length * 100 : 0;
  const nascimentosTodos = eventos.filter(e => e.tipo === 'nascimento');
  const natimortos = nascimentosTodos.filter(n => n.resultadoParto === 'Natimorto').length;
  const nascimentos = nascimentosTodos.filter(n => n.resultadoParto !== 'Natimorto');
  const taxaPerda = nascimentosTodos.length ? natimortos / nascimentosTodos.length * 100 : 0;
  const desmamas = eventos.filter(e => e.tipo === 'desmama');
  const taxaDesmama = nascimentos.length ? desmamas.length / nascimentos.length * 100 : 0;
  const emRecria = matrizes.filter(m => m.categoria === 'Novilha' && m.status !== 'Descarte').length;
  const vendas = eventos.filter(e => e.tipo === 'venda');
  const receitaTotal = vendas.reduce((s, v) => s + (parseFloat(v.valorTotal) || 0), 0);
  const custoFrete = vendas.reduce((s, v) => s + (parseFloat(v.frete) || 0), 0);
  const custoIatf = eventos.filter(e => e.tipo === 'iatf').reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const custoDiag = diagnosticos.reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const custoInsumo = eventos.filter(e => e.tipo === 'insumo').reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const custoTotal = custoIatf + custoDiag + custoInsumo + custoFrete;
  const custoPorBezerro = nascimentos.length ? custoTotal / nascimentos.length : 0;
  const margem = receitaTotal - custoTotal;
  const pesoMedioNascer = nascimentos.length ? nascimentos.reduce((s, n) => s + (parseFloat(n.pesoNascer) || 0), 0) / nascimentos.length : 0;
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
    pesoMedioNascer,
    pesoMedioDesmama
  };
}
function buildResumoRows(kpis) {
  return [['Total de matrizes', kpis.total], ['Cheias', kpis.cheias], ['Vazias', kpis.vazias], ['Descarte', kpis.descartes], ['Novilhas em recria', kpis.emRecria], ['Taxa de prenhez (%)', kpis.taxaPrenhez.toFixed(1)], ['', ''], ['Nascimentos', kpis.nascimentos], ['Natimortos', kpis.natimortos], ['Taxa de perda ao nascer (%)', kpis.taxaPerda.toFixed(1)], ['Peso médio ao nascer (kg)', kpis.pesoMedioNascer.toFixed(1)], ['Desmamas', kpis.desmamas], ['Taxa de desmama (%)', kpis.taxaDesmama.toFixed(1)], ['Peso médio na desmama (kg)', kpis.pesoMedioDesmama.toFixed(1)], ['', ''], ['Receita total de vendas (R$)', kpis.receitaTotal.toFixed(2)], ['Custo total (R$)', kpis.custoTotal.toFixed(2)], ['Custo por bezerro (R$)', kpis.custoPorBezerro.toFixed(2)], ['Margem (R$)', kpis.margem.toFixed(2)]];
}
const fmtBRL = n => (n || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

// ---------- app principal ----------
export default function GestaoPecuaria() {
  const [tab, setTab] = useState('lancar');
  const [matrizes, setMatrizes] = useState([]);
  const [touros, setTouros] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoSelecionado, setTipoSelecionado] = useState('nascimento');
  const [form, setForm] = useState({
    data: todayISO()
  });
  const [saveStatus, setSaveStatus] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [buscaPrevisao, setBuscaPrevisao] = useState('');
  const [planilhaTipo, setPlanilhaTipo] = useState('matrizes');
  const [syncError, setSyncError] = useState(false);
  const [editandoMatriz, setEditandoMatriz] = useState(null);
  const [formEdicaoMatriz, setFormEdicaoMatriz] = useState({});
  const [confirmAction, setConfirmAction] = useState(null); // null | 'import' | 'clear'
  const [ownerMode, setOwnerMode] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState(false);
  const tiposVisiveis = ownerMode ? TIPOS_EVENTO : TIPOS_EVENTO.filter(t => TIPOS_FUNCIONARIO.includes(t.id));
  function tentarDesbloquear() {
    if (pinValue === OWNER_PIN) {
      setOwnerMode(true);
      setShowPinInput(false);
      setPinValue('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  }
  function bloquear() {
    setOwnerMode(false);
    if (tab !== 'lancar') setTab('lancar');
    if (!TIPOS_FUNCIONARIO.includes(tipoSelecionado)) setTipoSelecionado('nascimento');
  }
  useEffect(() => {
    loadAll();
  }, []);
  useEffect(() => {
    const campos = CAMPOS[tipoSelecionado] || [];
    const novo = {};
    if (campos.some(c => c.key === 'data')) novo.data = todayISO();
    setForm(novo);
  }, [tipoSelecionado]);
  async function loadAll() {
    setLoading(true);
    setSyncError(false);
    try {
      const res = await fetch(`${SHEETS_API_URL}?action=getAll`);
      const data = await res.json();
      setMatrizes(data.matrizes || []);
      setTouros(data.touros || []);
      setEventos(data.eventos || []);
    } catch (e) {
      console.error('Erro ao carregar dados da planilha', e);
      setSyncError(true);
    }
    setLoading(false);
  }
  async function syncToSheets(m, t, ev) {
    try {
      const resumo = buildResumoRows(calcularKPIs(m, ev));
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'syncAll',
          matrizes: m,
          touros: t,
          eventos: ev,
          resumo
        })
      });
      setSyncError(false);
    } catch (e) {
      console.error('Erro ao sincronizar com a planilha', e);
      setSyncError(true);
    }
  }

  // Gravações leves (uma linha só) — usadas no dia a dia, pra lançar rápido sem reescrever a planilha inteira
  async function syncEventoAppend(evento) {
    try {
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'appendEvento',
          tipo: evento.tipo,
          evento
        })
      });
      setSyncError(false);
    } catch (e) {
      console.error('Erro ao sincronizar evento', e);
      setSyncError(true);
    }
  }
  async function syncMatrizUpsert(matriz) {
    try {
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'upsertMatriz',
          matriz
        })
      });
      setSyncError(false);
    } catch (e) {
      console.error('Erro ao sincronizar matriz', e);
      setSyncError(true);
    }
  }
  async function syncTouroAppend(touro) {
    try {
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'appendTouro',
          touro
        })
      });
      setSyncError(false);
    } catch (e) {
      console.error('Erro ao sincronizar touro', e);
      setSyncError(true);
    }
  }
  async function persistAll(m, t, ev) {
    setMatrizes(m);
    setTouros(t);
    setEventos(ev);
    await syncToSheets(m, t, ev);
  }
  function updateField(key, value) {
    setForm(f => {
      const next = {
        ...f,
        [key]: value
      };
      if (tipoSelecionado === 'nascimento' && (key === 'sexo' || key === 'data') && !f.brincoBezerro) {
        const sugestao = sugerirBrincoBezerro(next.data, next.sexo, eventos);
        if (sugestao) next.brincoBezerro = sugestao;
      }
      return next;
    });
  }
  function abrirEdicaoMatriz(m) {
    setEditandoMatriz(m);
    setFormEdicaoMatriz({
      ...m
    });
  }
  function fecharEdicaoMatriz() {
    setEditandoMatriz(null);
    setFormEdicaoMatriz({});
  }
  function salvarEdicaoMatriz() {
    const atualizada = {
      ...editandoMatriz,
      brinco: formEdicaoMatriz.brinco,
      categoria: formEdicaoMatriz.categoria,
      raca: formEdicaoMatriz.raca || '',
      lote: formEdicaoMatriz.lote || '',
      dataNascimento: formEdicaoMatriz.dataNascimento || '',
      partosAnteriores: parseInt(formEdicaoMatriz.partosAnteriores) || 0,
      status: formEdicaoMatriz.status
    };
    setMatrizes(matrizes.map(m => m.id === atualizada.id ? atualizada : m));
    syncMatrizUpsert(atualizada);
    fecharEdicaoMatriz();
  }
  async function handleSalvar() {
    const campos = CAMPOS[tipoSelecionado];
    const faltando = campos.filter(c => c.required && (!c.showIf || c.showIf(form)) && !form[c.key]);
    if (faltando.length) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2500);
      return;
    }
    setSaveStatus('saving');
    const now = new Date().toISOString();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (tipoSelecionado === 'cadastro') {
      const nova = {
        id,
        brinco: form.brinco,
        categoria: form.categoria || 'Novilha',
        raca: form.raca || '',
        lote: form.lote || '',
        dataNascimento: form.dataNascimento || '',
        partosAnteriores: parseInt(form.partosAnteriores) || 0,
        status: form.statusInicial || 'Vazia',
        createdAt: now
      };
      setMatrizes([...matrizes, nova]);
      syncMatrizUpsert(nova);
    } else if (tipoSelecionado === 'touro') {
      const novo = {
        id,
        nome: form.nome,
        raca: form.raca,
        fornecedor: form.fornecedor || '',
        anoAquisicao: form.anoAquisicao || '',
        doses: parseInt(form.doses) || 0,
        custoDose: parseFloat(form.custoDose) || 0,
        observacoes: form.observacoes || '',
        createdAt: now
      };
      setTouros([...touros, novo]);
      syncTouroAppend(novo);
    } else if (tipoSelecionado === 'descarte') {
      const matrizesNext = matrizes.map(m => m.id === form.matrizId ? {
        ...m,
        status: 'Descarte'
      } : m);
      const novoEvento = {
        id,
        tipo: 'descarte',
        ...form,
        createdAt: now
      };
      setMatrizes(matrizesNext);
      setEventos([...eventos, novoEvento]);
      syncEventoAppend(novoEvento);
      const matrizAtualizada = matrizesNext.find(m => m.id === form.matrizId);
      if (matrizAtualizada) syncMatrizUpsert(matrizAtualizada);
    } else if (tipoSelecionado === 'diagnostico') {
      const novoStatus = form.resultado === 'Prenhe' ? 'Cheia' : form.resultado === 'Descarte' ? 'Descarte' : 'Vazia';
      const matrizesNext = matrizes.map(m => m.id === form.matrizId ? {
        ...m,
        status: novoStatus
      } : m);
      const eventosNovos = [{
        id,
        tipo: 'diagnostico',
        ...form,
        createdAt: now
      }];
      if (form.resultado === 'Descarte') {
        eventosNovos.push({
          id: `${id}-desc`,
          tipo: 'descarte',
          matrizId: form.matrizId,
          data: form.data,
          motivo: form.motivo || 'Identificado no diagnóstico veterinário',
          origemDiagnostico: true,
          createdAt: now
        });
      }
      setMatrizes(matrizesNext);
      setEventos([...eventos, ...eventosNovos]);
      eventosNovos.forEach(syncEventoAppend);
      const matrizAtualizada = matrizesNext.find(m => m.id === form.matrizId);
      if (matrizAtualizada) syncMatrizUpsert(matrizAtualizada);
    } else if (tipoSelecionado === 'nascimento') {
      const novoEvento = {
        id,
        tipo: 'nascimento',
        ...form,
        createdAt: now
      };
      const eventosNext = [...eventos, novoEvento];
      let matrizesNext = matrizes;
      let matrizAtualizada = null;
      if (form.matrizId) {
        const partosNaFazenda = eventosNext.filter(e => e.tipo === 'nascimento' && e.matrizId === form.matrizId).length;
        matrizesNext = matrizes.map(m => {
          if (m.id !== form.matrizId) return m;
          let categoria = m.categoria;
          if (categoria === 'Novilha' && partosNaFazenda >= 1) categoria = 'Primípara';else if (categoria === 'Primípara' && partosNaFazenda >= 2) categoria = 'Multípara';
          matrizAtualizada = {
            ...m,
            categoria
          };
          return matrizAtualizada;
        });
      }
      setMatrizes(matrizesNext);
      setEventos(eventosNext);
      syncEventoAppend(novoEvento);
      if (matrizAtualizada) syncMatrizUpsert(matrizAtualizada);
    } else {
      const novoEvento = {
        id,
        tipo: tipoSelecionado,
        ...form,
        createdAt: now
      };
      setEventos([...eventos, novoEvento]);
      syncEventoAppend(novoEvento);
    }
    setSaveStatus('saved');
    const campos2 = CAMPOS[tipoSelecionado] || [];
    const novo = {};
    if (campos2.some(c => c.key === 'data')) novo.data = todayISO();
    setForm(novo);
    setTimeout(() => setSaveStatus(null), 2000);
  }
  async function importarDadosReais() {
    const now = new Date().toISOString();
    const m = [{
      "id": "reb-2020",
      "brinco": "2020",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "2022-01-01",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2031",
      "brinco": "2031",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2022-01-11",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2026",
      "brinco": "2026",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "2022-01-13",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2033",
      "brinco": "2033",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2022-01-14",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2036",
      "brinco": "2036",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2022-01-17",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2025",
      "brinco": "2025",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "2022-01-21",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2024",
      "brinco": "2024",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2022-01-25",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3004",
      "brinco": "3004",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2022-12-28",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3005",
      "brinco": "3005",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-01-02",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3006",
      "brinco": "3006",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-01-04",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3008",
      "brinco": "3008",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-01-07",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3009",
      "brinco": "3009",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-01-09",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3012",
      "brinco": "3012",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-01-13",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3013",
      "brinco": "3013",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-01-14",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3014",
      "brinco": "3014",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Leiteiras",
      "dataNascimento": "2023-01-18",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3015",
      "brinco": "3015",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-01-18",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3016",
      "brinco": "3016",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-01-24",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3019",
      "brinco": "3019",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-03-03",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3021",
      "brinco": "3021",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-03-04",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3026",
      "brinco": "3026",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-03-11",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3028",
      "brinco": "3028",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-03-26",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3030",
      "brinco": "3030",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-03-28",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3033",
      "brinco": "3033",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-04-12",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3036",
      "brinco": "3036",
      "categoria": "Novilha",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "2023-08-02",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3037",
      "brinco": "3037",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-08-11",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3039",
      "brinco": "3039",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-08-20",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3040",
      "brinco": "3040",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-08-21",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3042",
      "brinco": "3042",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-08-23",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3045",
      "brinco": "3045",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-08-27",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3046",
      "brinco": "3046",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-08-28",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3047",
      "brinco": "3047",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-08-29",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3049",
      "brinco": "3049",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-08-29",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3052",
      "brinco": "3052",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-09-02",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3059",
      "brinco": "3059",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-10-04",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3065",
      "brinco": "3065",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-10-08",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3067",
      "brinco": "3067",
      "categoria": "Novilha",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "2023-10-10",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3068",
      "brinco": "3068",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-10-10",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3069",
      "brinco": "3069",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-10-12",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3070",
      "brinco": "3070",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-10-14",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3071",
      "brinco": "3071",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-10-14",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3077",
      "brinco": "3077",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-10-21",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3084",
      "brinco": "3084",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-10-27",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3087",
      "brinco": "3087",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-10-30",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3088",
      "brinco": "3088",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-11-01",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3091",
      "brinco": "3091",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-11-10",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3095",
      "brinco": "3095",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-11-14",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-3098",
      "brinco": "3098",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2023-11-22",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-4008",
      "brinco": "4008",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-01-20",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-4011",
      "brinco": "4011",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-01-22",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-4007",
      "brinco": "4007",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-01-25",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-4018",
      "brinco": "4018",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-02-10",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-4026",
      "brinco": "4026",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-03-08",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-4034",
      "brinco": "4034",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-04-29",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-4049",
      "brinco": "4049",
      "categoria": "Vaca",
      "raca": "Preta",
      "lote": "Leiteiras",
      "dataNascimento": "2024-09-03",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-4052",
      "brinco": "4052",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-09-20",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-4053",
      "brinco": "4053",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-09-27",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-4064",
      "brinco": "4064",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-10-22",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-4065",
      "brinco": "4065",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-10-23",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-4067",
      "brinco": "4067",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-10-25",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-4076",
      "brinco": "4076",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2024-11-16",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-5004",
      "brinco": "5004",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "2025-01-16",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-5557",
      "brinco": "5557",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Leiteiras",
      "dataNascimento": "2025-01-18",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5006",
      "brinco": "5006",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-01-21",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5008",
      "brinco": "5008",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-01-21",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5010",
      "brinco": "5010",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Novilhas",
      "dataNascimento": "2025-01-23",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5014",
      "brinco": "5014",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-01-24",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5016",
      "brinco": "5016",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Leiteiras",
      "dataNascimento": "2025-01-25",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5506",
      "brinco": "5506",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-01-26",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5507",
      "brinco": "5507",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-01-26",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5508",
      "brinco": "5508",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-01-26",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5035",
      "brinco": "5035",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-22",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5537",
      "brinco": "5537",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-23",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5538",
      "brinco": "5538",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-24",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5539",
      "brinco": "5539",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-26",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5541",
      "brinco": "5541",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-27",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5542",
      "brinco": "5542",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-27",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5038",
      "brinco": "5038",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-28",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5039",
      "brinco": "5039",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-28",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5040",
      "brinco": "5040",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-28",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5543",
      "brinco": "5543",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-28",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5036",
      "brinco": "5036",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-29",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5041",
      "brinco": "5041",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-03-29",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5043",
      "brinco": "5043",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-04-03",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5047",
      "brinco": "5047",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Leiteiras",
      "dataNascimento": "2025-04-21",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5049",
      "brinco": "5049",
      "categoria": "Novilha",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "2025-04-29",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-41",
      "brinco": "41",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-172",
      "brinco": "172",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-180",
      "brinco": "180",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-203",
      "brinco": "203",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-204",
      "brinco": "204",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-230",
      "brinco": "230",
      "categoria": "Vaca",
      "raca": "Gir",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-232",
      "brinco": "232",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-233",
      "brinco": "233",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-543",
      "brinco": "543",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-679",
      "brinco": "679",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-806",
      "brinco": "806",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1010",
      "brinco": "1010",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1011",
      "brinco": "1011",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1012",
      "brinco": "1012",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1014",
      "brinco": "1014",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1016",
      "brinco": "1016",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-1017",
      "brinco": "1017",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1021",
      "brinco": "1021",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-1027",
      "brinco": "1027",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1032",
      "brinco": "1032",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-1037",
      "brinco": "1037",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1057",
      "brinco": "1057",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1106",
      "brinco": "1106",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1111",
      "brinco": "1111",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-1115",
      "brinco": "1115",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1120",
      "brinco": "1120",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1194",
      "brinco": "1194",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1288",
      "brinco": "1288",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-1422",
      "brinco": "1422",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2021",
      "brinco": "2021",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2039",
      "brinco": "2039",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2040",
      "brinco": "2040",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2042",
      "brinco": "2042",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2046",
      "brinco": "2046",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2048",
      "brinco": "2048",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2050",
      "brinco": "2050",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2051",
      "brinco": "2051",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-3101",
      "brinco": "3101",
      "categoria": "Novilha",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2054",
      "brinco": "2054",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2060",
      "brinco": "2060",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2061",
      "brinco": "2061",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2070",
      "brinco": "2070",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2072",
      "brinco": "2072",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2074",
      "brinco": "2074",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2078",
      "brinco": "2078",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2081",
      "brinco": "2081",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2101",
      "brinco": "2101",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2116",
      "brinco": "2116",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-2118",
      "brinco": "2118",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-4080",
      "brinco": "4080",
      "categoria": "Novilha",
      "raca": "Sindi",
      "lote": "Novilhas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-2164",
      "brinco": "2164",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-5044",
      "brinco": "5044",
      "categoria": "Vaca",
      "raca": "Cruzada",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-6075",
      "brinco": "6075",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-7050",
      "brinco": "7050",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-7064",
      "brinco": "7064",
      "categoria": "Vaca",
      "raca": "",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-7068",
      "brinco": "7068",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-7081",
      "brinco": "7081",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-8001",
      "brinco": "8001",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-8002",
      "brinco": "8002",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-8005",
      "brinco": "8005",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-8008",
      "brinco": "8008",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22011",
      "brinco": "22011",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22013",
      "brinco": "22013",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22017",
      "brinco": "22017",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22019",
      "brinco": "22019",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22022",
      "brinco": "22022",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22023",
      "brinco": "22023",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22024",
      "brinco": "22024",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22028",
      "brinco": "22028",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22117",
      "brinco": "22117",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22152",
      "brinco": "22152",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22155",
      "brinco": "22155",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22156",
      "brinco": "22156",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22157",
      "brinco": "22157",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22158",
      "brinco": "22158",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22159",
      "brinco": "22159",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22163",
      "brinco": "22163",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22165",
      "brinco": "22165",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22166",
      "brinco": "22166",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22167",
      "brinco": "22167",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22168",
      "brinco": "22168",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22191",
      "brinco": "22191",
      "categoria": "Vaca",
      "raca": "Aberdeen",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22194",
      "brinco": "22194",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22196",
      "brinco": "22196",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22203",
      "brinco": "22203",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22205",
      "brinco": "22205",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22210",
      "brinco": "22210",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22212",
      "brinco": "22212",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22213",
      "brinco": "22213",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22220",
      "brinco": "22220",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22223",
      "brinco": "22223",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-22224",
      "brinco": "22224",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-22229",
      "brinco": "22229",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }, {
      "id": "reb-219/1413",
      "brinco": "219/1413",
      "categoria": "Vaca",
      "raca": "Nelore",
      "lote": "Paridas",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Vazia",
      "createdAt": now
    }, {
      "id": "reb-E5",
      "brinco": "E5",
      "categoria": "Vaca",
      "raca": "Gir",
      "lote": "Leiteiras",
      "dataNascimento": "",
      "partosAnteriores": 0,
      "status": "Cheia",
      "createdAt": now
    }];
    const ev = [{
      "id": "imp-1",
      "tipo": "nascimento",
      "data": "2026-01-24",
      "resultadoParto": "Natimorto",
      "sexo": "Macho",
      "brincoBezerro": "5012",
      "createdAt": now
    }, {
      "id": "imp-2",
      "tipo": "nascimento",
      "data": "2026-03-20",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6001",
      "matrizId": "reb-5044",
      "createdAt": now
    }, {
      "id": "imp-3",
      "tipo": "nascimento",
      "data": "2026-03-21",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6003",
      "matrizId": "reb-3045",
      "createdAt": now
    }, {
      "id": "imp-4",
      "tipo": "nascimento",
      "data": "2026-03-21",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6002",
      "createdAt": now
    }, {
      "id": "imp-5",
      "tipo": "nascimento",
      "data": "2026-03-22",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6004",
      "matrizId": "reb-3030",
      "createdAt": now
    }, {
      "id": "imp-6",
      "tipo": "nascimento",
      "data": "2026-03-24",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6005",
      "matrizId": "reb-7050",
      "createdAt": now
    }, {
      "id": "imp-7",
      "tipo": "nascimento",
      "data": "2026-03-27",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6006",
      "matrizId": "reb-2061",
      "createdAt": now
    }, {
      "id": "imp-8",
      "tipo": "nascimento",
      "data": "2026-03-27",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6007",
      "matrizId": "reb-172",
      "createdAt": now
    }, {
      "id": "imp-9",
      "tipo": "nascimento",
      "data": "2026-03-27",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6501",
      "matrizId": "reb-3005",
      "createdAt": now
    }, {
      "id": "imp-10",
      "tipo": "nascimento",
      "data": "2026-03-27",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6502",
      "matrizId": "reb-22024",
      "createdAt": now
    }, {
      "id": "imp-11",
      "tipo": "nascimento",
      "data": "2026-03-27",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6503",
      "matrizId": "reb-2054",
      "createdAt": now
    }, {
      "id": "imp-12",
      "tipo": "nascimento",
      "data": "2026-03-28",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6504",
      "matrizId": "reb-22152",
      "createdAt": now
    }, {
      "id": "imp-13",
      "tipo": "nascimento",
      "data": "2026-03-28",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6505",
      "matrizId": "reb-3019",
      "createdAt": now
    }, {
      "id": "imp-14",
      "tipo": "nascimento",
      "data": "2026-03-30",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6008",
      "matrizId": "reb-2051",
      "createdAt": now
    }, {
      "id": "imp-15",
      "tipo": "nascimento",
      "data": "2026-03-30",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6009",
      "matrizId": "reb-22023",
      "createdAt": now
    }, {
      "id": "imp-16",
      "tipo": "nascimento",
      "data": "2026-03-30",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6010",
      "matrizId": "reb-4053",
      "createdAt": now
    }, {
      "id": "imp-17",
      "tipo": "nascimento",
      "data": "2026-03-30",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6506",
      "matrizId": "reb-1194",
      "createdAt": now
    }, {
      "id": "imp-18",
      "tipo": "nascimento",
      "data": "2026-03-31",
      "resultadoParto": "Natimorto",
      "sexo": "Fêmea",
      "brincoBezerro": "6011",
      "matrizId": "reb-7081",
      "createdAt": now
    }, {
      "id": "imp-19",
      "tipo": "nascimento",
      "data": "2026-03-31",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6012",
      "matrizId": "reb-1422",
      "createdAt": now
    }, {
      "id": "imp-20",
      "tipo": "nascimento",
      "data": "2026-03-31",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6507",
      "matrizId": "reb-3008",
      "createdAt": now
    }, {
      "id": "imp-21",
      "tipo": "nascimento",
      "data": "2026-03-31",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6508",
      "createdAt": now
    }, {
      "id": "imp-22",
      "tipo": "nascimento",
      "data": "2026-03-31",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6509",
      "matrizId": "reb-22203",
      "createdAt": now
    }, {
      "id": "imp-23",
      "tipo": "nascimento",
      "data": "2026-03-31",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6510",
      "createdAt": now
    }, {
      "id": "imp-24",
      "tipo": "nascimento",
      "data": "2026-04-02",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6013",
      "matrizId": "reb-2040",
      "createdAt": now
    }, {
      "id": "imp-25",
      "tipo": "nascimento",
      "data": "2026-04-02",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6014",
      "matrizId": "reb-22163",
      "createdAt": now
    }, {
      "id": "imp-26",
      "tipo": "nascimento",
      "data": "2026-04-02",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6015",
      "matrizId": "reb-41",
      "createdAt": now
    }, {
      "id": "imp-27",
      "tipo": "nascimento",
      "data": "2026-04-02",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6511",
      "createdAt": now
    }, {
      "id": "imp-28",
      "tipo": "nascimento",
      "data": "2026-04-04",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6512",
      "matrizId": "reb-1120",
      "createdAt": now
    }, {
      "id": "imp-29",
      "tipo": "nascimento",
      "data": "2026-04-04",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6513",
      "matrizId": "reb-4065",
      "createdAt": now
    }, {
      "id": "imp-30",
      "tipo": "nascimento",
      "data": "2026-04-04",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6514",
      "matrizId": "reb-8002",
      "createdAt": now
    }, {
      "id": "imp-31",
      "tipo": "nascimento",
      "data": "2026-04-04",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6515",
      "matrizId": "reb-1288",
      "createdAt": now
    }, {
      "id": "imp-32",
      "tipo": "nascimento",
      "data": "2026-04-12",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6516",
      "matrizId": "reb-3004",
      "createdAt": now
    }, {
      "id": "imp-33",
      "tipo": "nascimento",
      "data": "2026-04-12",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6517",
      "matrizId": "reb-22205",
      "createdAt": now
    }, {
      "id": "imp-34",
      "tipo": "nascimento",
      "data": "2026-04-12",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6518",
      "matrizId": "reb-1106",
      "createdAt": now
    }, {
      "id": "imp-35",
      "tipo": "nascimento",
      "data": "2026-04-12",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6519",
      "matrizId": "reb-22168",
      "createdAt": now
    }, {
      "id": "imp-36",
      "tipo": "nascimento",
      "data": "2026-04-13",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6016",
      "matrizId": "reb-1011",
      "createdAt": now
    }, {
      "id": "imp-37",
      "tipo": "nascimento",
      "data": "2026-04-19",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6521",
      "matrizId": "reb-22158",
      "createdAt": now
    }, {
      "id": "imp-38",
      "tipo": "nascimento",
      "data": "2026-04-19",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6017",
      "matrizId": "reb-2036",
      "createdAt": now
    }, {
      "id": "imp-39",
      "tipo": "nascimento",
      "data": "2026-04-19",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6520",
      "matrizId": "reb-2081",
      "createdAt": now
    }, {
      "id": "imp-40",
      "tipo": "nascimento",
      "data": "2026-04-25",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6018",
      "createdAt": now
    }, {
      "id": "imp-41",
      "tipo": "nascimento",
      "data": "2026-05-09",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6522",
      "matrizId": "reb-2072",
      "createdAt": now
    }, {
      "id": "imp-42",
      "tipo": "nascimento",
      "data": "2026-05-17",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6019",
      "matrizId": "reb-8005",
      "createdAt": now
    }, {
      "id": "imp-43",
      "tipo": "nascimento",
      "data": "2026-05-20",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6020",
      "matrizId": "reb-543",
      "createdAt": now
    }, {
      "id": "imp-44",
      "tipo": "nascimento",
      "data": "2026-05-20",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6524",
      "matrizId": "reb-2039",
      "createdAt": now
    }, {
      "id": "imp-45",
      "tipo": "nascimento",
      "data": "2026-05-13",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6523",
      "matrizId": "reb-180",
      "createdAt": now
    }, {
      "id": "imp-46",
      "tipo": "nascimento",
      "data": "2026-05-26",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6525",
      "matrizId": "reb-3046",
      "createdAt": now
    }, {
      "id": "imp-47",
      "tipo": "nascimento",
      "data": "2026-04-27",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6021",
      "matrizId": "reb-3052",
      "createdAt": now
    }, {
      "id": "imp-48",
      "tipo": "nascimento",
      "data": "2026-05-25",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6526",
      "matrizId": "reb-22213",
      "createdAt": now
    }, {
      "id": "imp-49",
      "tipo": "nascimento",
      "data": "2026-05-26",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6022",
      "createdAt": now
    }, {
      "id": "imp-50",
      "tipo": "nascimento",
      "data": "2026-05-31",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6527",
      "matrizId": "reb-2042",
      "createdAt": now
    }, {
      "id": "imp-51",
      "tipo": "nascimento",
      "data": "2026-05-31",
      "resultadoParto": "Vivo",
      "sexo": "Fêmea",
      "brincoBezerro": "6023",
      "matrizId": "reb-3012",
      "createdAt": now
    }, {
      "id": "imp-52",
      "tipo": "nascimento",
      "data": "2026-05-31",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6528",
      "matrizId": "reb-4076",
      "createdAt": now
    }, {
      "id": "imp-53",
      "tipo": "nascimento",
      "data": "2026-06-02",
      "resultadoParto": "Vivo",
      "sexo": "Macho",
      "brincoBezerro": "6529",
      "matrizId": "reb-3037",
      "createdAt": now
    }, {
      "id": "imp-54",
      "tipo": "diagnostico",
      "matrizId": "reb-7064",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-55",
      "tipo": "diagnostico",
      "matrizId": "reb-22011",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-56",
      "tipo": "diagnostico",
      "matrizId": "reb-2101",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-57",
      "tipo": "diagnostico",
      "matrizId": "reb-543",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-58",
      "tipo": "diagnostico",
      "matrizId": "reb-3021",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-59",
      "tipo": "diagnostico",
      "matrizId": "reb-3013",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-60",
      "tipo": "diagnostico",
      "matrizId": "reb-22156",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-61",
      "tipo": "diagnostico",
      "matrizId": "reb-3046",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-62",
      "tipo": "diagnostico",
      "matrizId": "reb-22191",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-63",
      "tipo": "diagnostico",
      "matrizId": "reb-6075",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-64",
      "tipo": "diagnostico",
      "matrizId": "reb-3037",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-65",
      "tipo": "diagnostico",
      "matrizId": "reb-4076",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-66",
      "tipo": "diagnostico",
      "matrizId": "reb-22157",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-67",
      "tipo": "diagnostico",
      "matrizId": "reb-3065",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-68",
      "tipo": "diagnostico",
      "matrizId": "reb-22213",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-69",
      "tipo": "diagnostico",
      "matrizId": "reb-1021",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-70",
      "tipo": "diagnostico",
      "matrizId": "reb-22017",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-71",
      "tipo": "diagnostico",
      "matrizId": "reb-3026",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-72",
      "tipo": "diagnostico",
      "matrizId": "reb-3016",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-73",
      "tipo": "diagnostico",
      "matrizId": "reb-22220",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-74",
      "tipo": "diagnostico",
      "matrizId": "reb-8001",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-75",
      "tipo": "diagnostico",
      "matrizId": "reb-3042",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-76",
      "tipo": "diagnostico",
      "matrizId": "reb-3014",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-77",
      "tipo": "diagnostico",
      "matrizId": "reb-2039",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-78",
      "tipo": "diagnostico",
      "matrizId": "reb-22019",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-79",
      "tipo": "diagnostico",
      "matrizId": "reb-1016",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-80",
      "tipo": "diagnostico",
      "matrizId": "reb-2020",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-81",
      "tipo": "diagnostico",
      "matrizId": "reb-3009",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-82",
      "tipo": "diagnostico",
      "matrizId": "reb-3036",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-83",
      "tipo": "diagnostico",
      "matrizId": "reb-3052",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-84",
      "tipo": "diagnostico",
      "matrizId": "reb-230",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-85",
      "tipo": "diagnostico",
      "matrizId": "reb-22013",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-86",
      "tipo": "diagnostico",
      "matrizId": "reb-3012",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-87",
      "tipo": "diagnostico",
      "matrizId": "reb-4049",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-88",
      "tipo": "diagnostico",
      "matrizId": "reb-232",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-89",
      "tipo": "diagnostico",
      "matrizId": "reb-3069",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-90",
      "tipo": "diagnostico",
      "matrizId": "reb-22196",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-91",
      "tipo": "diagnostico",
      "matrizId": "reb-22223",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-92",
      "tipo": "diagnostico",
      "matrizId": "reb-3084",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-93",
      "tipo": "diagnostico",
      "matrizId": "reb-3068",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-94",
      "tipo": "diagnostico",
      "matrizId": "reb-8008",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-95",
      "tipo": "diagnostico",
      "matrizId": "reb-22229",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-96",
      "tipo": "diagnostico",
      "matrizId": "reb-22212",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-97",
      "tipo": "diagnostico",
      "matrizId": "reb-3033",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-98",
      "tipo": "diagnostico",
      "matrizId": "reb-2033",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-99",
      "tipo": "diagnostico",
      "matrizId": "reb-3077",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-100",
      "tipo": "diagnostico",
      "matrizId": "reb-3071",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-101",
      "tipo": "diagnostico",
      "matrizId": "reb-3095",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-102",
      "tipo": "diagnostico",
      "matrizId": "reb-3067",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-103",
      "tipo": "diagnostico",
      "matrizId": "reb-4008",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-104",
      "tipo": "diagnostico",
      "matrizId": "reb-1032",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-105",
      "tipo": "diagnostico",
      "matrizId": "reb-22166",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-106",
      "tipo": "diagnostico",
      "matrizId": "reb-2116",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-107",
      "tipo": "diagnostico",
      "matrizId": "reb-2118",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-108",
      "tipo": "diagnostico",
      "matrizId": "reb-2050",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-109",
      "tipo": "diagnostico",
      "matrizId": "reb-22165",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-110",
      "tipo": "diagnostico",
      "matrizId": "reb-3091",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-111",
      "tipo": "diagnostico",
      "matrizId": "reb-3087",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-112",
      "tipo": "diagnostico",
      "matrizId": "reb-3088",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-113",
      "tipo": "diagnostico",
      "matrizId": "reb-3101",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-114",
      "tipo": "diagnostico",
      "matrizId": "reb-3070",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-115",
      "tipo": "diagnostico",
      "matrizId": "reb-4034",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-116",
      "tipo": "diagnostico",
      "matrizId": "reb-3040",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-117",
      "tipo": "diagnostico",
      "matrizId": "reb-3059",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-118",
      "tipo": "diagnostico",
      "matrizId": "reb-3039",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-119",
      "tipo": "diagnostico",
      "matrizId": "reb-3049",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-120",
      "tipo": "diagnostico",
      "matrizId": "reb-22167",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-121",
      "tipo": "diagnostico",
      "matrizId": "reb-4026",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-122",
      "tipo": "diagnostico",
      "matrizId": "reb-180",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-123",
      "tipo": "diagnostico",
      "matrizId": "reb-2048",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-124",
      "tipo": "diagnostico",
      "matrizId": "reb-22210",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-125",
      "tipo": "diagnostico",
      "matrizId": "reb-1111",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-126",
      "tipo": "diagnostico",
      "matrizId": "reb-22028",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-127",
      "tipo": "diagnostico",
      "matrizId": "reb-22022",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-128",
      "tipo": "diagnostico",
      "matrizId": "reb-4011",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-129",
      "tipo": "diagnostico",
      "matrizId": "reb-2060",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-130",
      "tipo": "diagnostico",
      "matrizId": "reb-2024",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-131",
      "tipo": "diagnostico",
      "matrizId": "reb-2042",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-132",
      "tipo": "diagnostico",
      "matrizId": "reb-4007",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-133",
      "tipo": "diagnostico",
      "matrizId": "reb-2078",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-134",
      "tipo": "diagnostico",
      "matrizId": "reb-22194",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-135",
      "tipo": "diagnostico",
      "matrizId": "reb-233",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-136",
      "tipo": "diagnostico",
      "matrizId": "reb-22155",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-137",
      "tipo": "diagnostico",
      "matrizId": "reb-3098",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-138",
      "tipo": "diagnostico",
      "matrizId": "reb-5004",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-139",
      "tipo": "diagnostico",
      "matrizId": "reb-7068",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-140",
      "tipo": "diagnostico",
      "matrizId": "reb-3047",
      "data": "2026-05-09",
      "resultado": "Vazia",
      "createdAt": now
    }, {
      "id": "imp-141",
      "tipo": "diagnostico",
      "matrizId": "reb-3028",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-142",
      "tipo": "diagnostico",
      "matrizId": "reb-2070",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-143",
      "tipo": "diagnostico",
      "matrizId": "reb-E5",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-144",
      "tipo": "diagnostico",
      "matrizId": "reb-8005",
      "data": "2026-05-09",
      "resultado": "Prenhe",
      "createdAt": now
    }, {
      "id": "imp-145",
      "tipo": "iatf",
      "matrizId": "reb-1011",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-146",
      "tipo": "iatf",
      "matrizId": "reb-1106",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-147",
      "tipo": "iatf",
      "matrizId": "reb-1120",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-148",
      "tipo": "iatf",
      "matrizId": "reb-1194",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-149",
      "tipo": "iatf",
      "matrizId": "reb-1288",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-150",
      "tipo": "iatf",
      "matrizId": "reb-1422",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-151",
      "tipo": "iatf",
      "matrizId": "reb-172",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-152",
      "tipo": "iatf",
      "matrizId": "reb-2036",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-153",
      "tipo": "iatf",
      "matrizId": "reb-2040",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-154",
      "tipo": "iatf",
      "matrizId": "reb-2051",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-155",
      "tipo": "iatf",
      "matrizId": "reb-2054",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-156",
      "tipo": "iatf",
      "matrizId": "reb-2061",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-157",
      "tipo": "iatf",
      "matrizId": "reb-2072",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-158",
      "tipo": "iatf",
      "matrizId": "reb-2081",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-159",
      "tipo": "iatf",
      "matrizId": "reb-22011",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-160",
      "tipo": "iatf",
      "matrizId": "reb-22023",
      "tipoServico": "Repasse (monta natural)",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "Touro natural",
      "createdAt": now
    }, {
      "id": "imp-161",
      "tipo": "iatf",
      "matrizId": "reb-22024",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-162",
      "tipo": "iatf",
      "matrizId": "reb-22152",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-163",
      "tipo": "iatf",
      "matrizId": "reb-22163",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-164",
      "tipo": "iatf",
      "matrizId": "reb-22168",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-165",
      "tipo": "iatf",
      "matrizId": "reb-22203",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-166",
      "tipo": "iatf",
      "matrizId": "reb-22205",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "Com Implante",
      "createdAt": now
    }, {
      "id": "imp-167",
      "tipo": "iatf",
      "matrizId": "reb-22220",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-168",
      "tipo": "iatf",
      "matrizId": "reb-22224",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-169",
      "tipo": "iatf",
      "matrizId": "reb-232",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-170",
      "tipo": "iatf",
      "matrizId": "reb-3004",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-171",
      "tipo": "iatf",
      "matrizId": "reb-3005",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-172",
      "tipo": "iatf",
      "matrizId": "reb-3006",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "24 dias – Touro",
      "createdAt": now
    }, {
      "id": "imp-173",
      "tipo": "iatf",
      "matrizId": "reb-3008",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-174",
      "tipo": "iatf",
      "matrizId": "reb-3015",
      "tipoServico": "Repasse (monta natural)",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "Touro natural",
      "createdAt": now
    }, {
      "id": "imp-175",
      "tipo": "iatf",
      "matrizId": "reb-3016",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-176",
      "tipo": "iatf",
      "matrizId": "reb-3019",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-177",
      "tipo": "iatf",
      "matrizId": "reb-3030",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-178",
      "tipo": "iatf",
      "matrizId": "reb-3045",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-179",
      "tipo": "iatf",
      "matrizId": "reb-3047",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-180",
      "tipo": "iatf",
      "matrizId": "reb-3067",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-181",
      "tipo": "iatf",
      "matrizId": "reb-3070",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-182",
      "tipo": "iatf",
      "matrizId": "reb-3071",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-183",
      "tipo": "iatf",
      "matrizId": "reb-3084",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-184",
      "tipo": "iatf",
      "matrizId": "reb-3101",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-185",
      "tipo": "iatf",
      "matrizId": "reb-4008",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-186",
      "tipo": "iatf",
      "matrizId": "reb-4026",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-187",
      "tipo": "iatf",
      "matrizId": "reb-4034",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-188",
      "tipo": "iatf",
      "matrizId": "reb-4053",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-189",
      "tipo": "iatf",
      "matrizId": "reb-4065",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-190",
      "tipo": "iatf",
      "matrizId": "reb-5044",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-191",
      "tipo": "iatf",
      "matrizId": "reb-7050",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-192",
      "tipo": "iatf",
      "matrizId": "reb-7081",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }, {
      "id": "imp-193",
      "tipo": "iatf",
      "matrizId": "reb-8002",
      "tipoServico": "IATF",
      "data": "2026-05-30",
      "dataInicioProtocolo": "2026-05-19",
      "observacoes": "",
      "createdAt": now
    }];
    await persistAll(m, [], ev);
    setTab('dashboard');
  }
  async function seedDemo() {
    const now = new Date().toISOString();
    const m = [{
      id: 'demo-m1',
      brinco: '101',
      categoria: 'Multípara',
      raca: 'Nelore',
      lote: 'Piquete 3',
      dataNascimento: '2019-03-10',
      status: 'Cheia',
      createdAt: now
    }, {
      id: 'demo-m2',
      brinco: '102',
      categoria: 'Multípara',
      raca: 'Nelore',
      lote: 'Piquete 3',
      dataNascimento: '2018-05-22',
      status: 'Cheia',
      partosAnteriores: 1,
      createdAt: now
    }, {
      id: 'demo-m3',
      brinco: '103',
      categoria: 'Primípara',
      raca: 'Nelore',
      lote: 'Piquete 2',
      dataNascimento: '2021-01-15',
      status: 'Vazia',
      createdAt: now
    }, {
      id: 'demo-m4',
      brinco: '104',
      categoria: 'Multípara',
      raca: 'Nelore',
      lote: 'Piquete 3',
      dataNascimento: '2017-07-30',
      status: 'Descarte',
      createdAt: now
    }, {
      id: 'demo-m5',
      brinco: '105',
      categoria: 'Novilha',
      raca: 'Nelore',
      lote: 'Piquete 1',
      dataNascimento: '2023-02-01',
      status: 'Vazia',
      createdAt: now
    }, {
      id: 'demo-m6',
      brinco: '106',
      categoria: 'Novilha',
      raca: 'Nelore',
      lote: 'Piquete 1',
      dataNascimento: '2023-04-12',
      status: 'Vazia',
      createdAt: now
    }, {
      id: 'demo-m7',
      brinco: '107',
      categoria: 'Multípara',
      raca: 'Nelore',
      lote: 'Piquete 3',
      dataNascimento: '2016-09-05',
      status: 'Descarte',
      createdAt: now
    }, {
      id: 'demo-m8',
      brinco: '108',
      categoria: 'Primípara',
      raca: 'Nelore',
      lote: 'Piquete 2',
      dataNascimento: '2020-11-20',
      status: 'Cheia',
      createdAt: now
    }];
    const t = [{
      id: 'demo-t1',
      nome: 'Sêmen Nelore PO 88',
      raca: 'Nelore',
      fornecedor: 'Central Genética ABC',
      anoAquisicao: '2026',
      doses: 40,
      custoDose: 45,
      observacoes: '',
      createdAt: now
    }, {
      id: 'demo-t2',
      nome: 'Touro Angus 5',
      raca: 'Angus',
      fornecedor: 'Próprio - monta natural',
      anoAquisicao: '',
      doses: 0,
      custoDose: 0,
      observacoes: 'Touro de repasse do plantel',
      createdAt: now
    }, {
      id: 'demo-t3',
      nome: 'Sêmen Brangus 2',
      raca: 'Brangus',
      fornecedor: 'Central Genética XYZ',
      anoAquisicao: '2025',
      doses: 20,
      custoDose: 38,
      observacoes: '',
      createdAt: now
    }, {
      id: 'demo-t4',
      nome: 'Touro Nelore 12',
      raca: 'Nelore',
      fornecedor: 'Próprio - monta natural',
      anoAquisicao: '',
      doses: 0,
      custoDose: 0,
      observacoes: 'Touro de repasse do plantel',
      createdAt: now
    }];
    const ev = [{
      id: 'demo-e1',
      tipo: 'iatf',
      matrizId: 'demo-m1',
      tipoServico: 'IATF',
      numeroServico: '1ª',
      data: '2026-01-15',
      dataInicioProtocolo: '2026-01-06',
      touroId: 'demo-t1',
      tecnico: 'Dr. João',
      custo: '45',
      observacoes: 'Protocolo padrão, sem intercorrências',
      createdAt: now
    }, {
      id: 'demo-e2',
      tipo: 'iatf',
      matrizId: 'demo-m3',
      tipoServico: 'IATF',
      numeroServico: '1ª',
      data: '2026-01-15',
      dataInicioProtocolo: '2026-01-06',
      touroId: 'demo-t1',
      tecnico: 'Dr. João',
      custo: '45',
      createdAt: now
    }, {
      id: 'demo-e3',
      tipo: 'iatf',
      matrizId: 'demo-m4',
      tipoServico: 'Repasse (monta natural)',
      numeroServico: '2ª',
      data: '2026-01-20',
      touroId: 'demo-t4',
      tecnico: 'Dr. João',
      custo: '0',
      createdAt: now
    }, {
      id: 'demo-e4',
      tipo: 'iatf',
      matrizId: 'demo-m8',
      tipoServico: 'IATF',
      numeroServico: '1ª',
      data: '2026-01-15',
      dataInicioProtocolo: '2026-01-06',
      touroId: 'demo-t1',
      tecnico: 'Dr. João',
      custo: '45',
      createdAt: now
    }, {
      id: 'demo-e5',
      tipo: 'diagnostico',
      matrizId: 'demo-m1',
      data: '2026-02-20',
      resultado: 'Prenhe',
      metodo: 'Ultrassom',
      dg: '35',
      veterinario: 'Dr. Carlos',
      custo: '30',
      createdAt: now
    }, {
      id: 'demo-e6',
      tipo: 'diagnostico',
      matrizId: 'demo-m3',
      data: '2026-02-20',
      resultado: 'Vazia',
      metodo: 'Ultrassom',
      veterinario: 'Dr. Carlos',
      custo: '30',
      createdAt: now
    }, {
      id: 'demo-e7',
      tipo: 'diagnostico',
      matrizId: 'demo-m4',
      data: '2026-02-25',
      resultado: 'Descarte',
      metodo: 'Toque retal',
      motivo: 'Baixa fertilidade, não prenhou em duas tentativas',
      veterinario: 'Dr. Carlos',
      custo: '25',
      createdAt: now
    }, {
      id: 'demo-e7b',
      tipo: 'descarte',
      matrizId: 'demo-m4',
      data: '2026-02-25',
      motivo: 'Baixa fertilidade, não prenhou em duas tentativas',
      origemDiagnostico: true,
      createdAt: now
    }, {
      id: 'demo-e8',
      tipo: 'diagnostico',
      matrizId: 'demo-m8',
      data: '2026-02-20',
      resultado: 'Prenhe',
      metodo: 'Ultrassom',
      dg: '35',
      veterinario: 'Dr. Carlos',
      custo: '30',
      createdAt: now
    }, {
      id: 'demo-e9',
      tipo: 'nascimento',
      matrizId: 'demo-m2',
      data: '2025-09-15',
      resultadoParto: 'Vivo',
      sexo: 'Fêmea',
      pesoNascer: '32',
      brincoBezerro: '201',
      touroId: 'demo-t2',
      tipoParto: 'Normal',
      createdAt: now
    }, {
      id: 'demo-e10',
      tipo: 'nascimento',
      matrizId: 'demo-m4',
      data: '2025-10-02',
      resultadoParto: 'Natimorto',
      sexo: 'Macho',
      pesoNascer: '0',
      touroId: 'demo-t3',
      tipoParto: 'Distócico (com dificuldade)',
      observacoes: 'Parto difícil, bezerro não resistiu',
      createdAt: now
    }, {
      id: 'demo-e11',
      tipo: 'nascimento',
      matrizId: 'demo-m7',
      data: '2025-11-11',
      resultadoParto: 'Vivo',
      sexo: 'Macho',
      pesoNascer: '34',
      brincoBezerro: '202',
      touroId: 'demo-t2',
      tipoParto: 'Normal',
      createdAt: now
    }, {
      id: 'demo-e12',
      tipo: 'desmama',
      brincoBezerro: '201',
      data: '2026-04-20',
      pesoDesmama: '178',
      idadeDias: '217',
      createdAt: now
    }, {
      id: 'demo-e13',
      tipo: 'desmama',
      brincoBezerro: '202',
      data: '2026-05-25',
      pesoDesmama: '195',
      idadeDias: '195',
      createdAt: now
    }, {
      id: 'demo-e14',
      tipo: 'recria',
      matrizId: 'demo-m5',
      data: '2026-05-01',
      pesoAtual: '260',
      aptaReproducao: 'Ainda não',
      createdAt: now
    }, {
      id: 'demo-e15',
      tipo: 'recria',
      matrizId: 'demo-m6',
      data: '2026-05-01',
      pesoAtual: '310',
      aptaReproducao: 'Sim, apta',
      createdAt: now
    }, {
      id: 'demo-e16',
      tipo: 'venda',
      data: '2026-03-15',
      categoria: 'Vaca de descarte',
      animais: '1 vaca (107)',
      pesoTotal: '480',
      valorArroba: '260',
      valorTotal: '4160',
      frete: '150',
      comprador: 'Leilão Paragominas',
      createdAt: now
    }, {
      id: 'demo-e17',
      tipo: 'venda',
      data: '2026-06-01',
      categoria: 'Bezerro(a) (mamando)',
      animais: '2 bezerros (201, 202)',
      pesoTotal: '373',
      valorArroba: '280',
      valorTotal: '3480',
      frete: '120',
      comprador: 'Frigorífico Central',
      createdAt: now
    }, {
      id: 'demo-e18',
      tipo: 'insumo',
      data: '2026-01-10',
      produto: 'Sal Mineral',
      quantidade: '200',
      unidade: 'kg',
      custo: '850',
      categoriaAnimal: 'Matrizes',
      createdAt: now
    }, {
      id: 'demo-e19',
      tipo: 'insumo',
      data: '2026-03-05',
      produto: 'Vacina',
      quantidade: '12',
      unidade: 'dose',
      custo: '340',
      categoriaAnimal: 'Matrizes',
      createdAt: now
    }, {
      id: 'demo-e20',
      tipo: 'descarte',
      matrizId: 'demo-m7',
      data: '2026-02-20',
      motivo: 'Idade avançada / baixa fertilidade',
      createdAt: now
    }];
    await persistAll(m, t, ev);
    setTab('dashboard');
  }
  async function clearAll() {
    await persistAll([], [], []);
  }
  const brincoMap = useMemo(() => Object.fromEntries(matrizes.map(m => [m.id, m.brinco])), [matrizes]);
  const ultimosNascimentos = useMemo(() => {
    const nasc = eventos.filter(e => e.tipo === 'nascimento' && e.brincoBezerro);
    const maisRecente = sexo => nasc.filter(e => e.sexo === sexo).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
    return {
      Macho: maisRecente('Macho'),
      Fêmea: maisRecente('Fêmea')
    };
  }, [eventos]);
  const touroNomeMap = useMemo(() => Object.fromEntries(touros.map(t => [t.id, t.nome])), [touros]);
  const nomeTouroEvento = e => (e.touroId === '__outro__' ? e.touroOutro : touroNomeMap[e.touroId]) || '';
  const kpis = useMemo(() => calcularKPIs(matrizes, eventos), [matrizes, eventos]);
  const statusData = [{
    name: 'Cheias',
    value: kpis.cheias,
    color: C.cheia
  }, {
    name: 'Vazias',
    value: kpis.vazias,
    color: C.vazia
  }, {
    name: 'Descarte',
    value: kpis.descartes,
    color: C.descarte
  }].filter(d => d.value > 0);
  const nascimentosPorMes = useMemo(() => {
    const map = {};
    eventos.filter(e => e.tipo === 'nascimento').forEach(e => {
      const mes = (e.data || '').slice(0, 7);
      if (mes) map[mes] = (map[mes] || 0) + 1;
    });
    return Object.entries(map).sort().map(([mes, qtd]) => {
      const [ano, m] = mes.split('-');
      return {
        mes: `${m}/${ano.slice(2)}`,
        qtd
      };
    });
  }, [eventos]);
  const atividadeRecente = useMemo(() => [...eventos].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 8), [eventos]);
  const matrizesFiltradas = useMemo(() => matrizes.filter(m => (filtroStatus === 'todos' || m.status === filtroStatus) && (!busca || m.brinco.toLowerCase().includes(busca.toLowerCase()))), [matrizes, filtroStatus, busca]);
  const tabButtonStyle = active => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    background: active ? C.accent : 'transparent',
    color: active ? '#1B140A' : C.textMuted
  });
  const eventoLabel = tipo => TIPOS_EVENTO.find(t => t.id === tipo)?.label || tipo;
  function getSheetRows(tipo) {
    if (tipo === 'matrizes') {
      return matrizes.map(m => ({
        'Brinco': m.brinco,
        'Categoria': m.categoria,
        'Raça': m.raca || '',
        'Lote': m.lote || '',
        'Data Nasc.': formatarDataBR(m.dataNascimento) || '',
        'Status': m.status,
        'Partos (Fazenda)': eventos.filter(e => e.tipo === 'nascimento' && e.matrizId === m.id).length,
        'Partos Ant.': m.partosAnteriores || 0,
        'Último Parto': formatarDataBR(ultimoPartoDe(m.id, eventos)) || '',
        'Nº Cria': numeroCriaUltimoParto(m.id, eventos)
      }));
    }
    if (tipo === 'touros') {
      return touros.map(t => {
        const usadas = eventos.filter(e => e.tipo === 'iatf' && e.touroId === t.id).length;
        const adquiridas = parseInt(t.doses) || 0;
        return {
          'Nome': t.nome,
          'Raça': t.raca,
          'Fornecedor': t.fornecedor || '',
          'Ano': t.anoAquisicao || '',
          'Doses Adq.': adquiridas,
          'Doses Usadas': usadas,
          'Doses Rest.': adquiridas ? adquiridas - usadas : '',
          'Custo/Dose (R$)': t.custoDose || ''
        };
      });
    }
    const evs = eventos.filter(e => e.tipo === tipo);
    if (tipo === 'nascimento') {
      return evs.map(e => ({
        'Data': formatarDataBR(e.data),
        'Matriz': brincoMap[e.matrizId] || '',
        'Resultado': e.resultadoParto || '',
        'Sexo': e.sexo || '',
        'Peso (kg)': e.pesoNascer || '',
        'Brinco Bezerro': e.brincoBezerro || '',
        'Pelagem': e.pelagem || '',
        'Pai': nomeTouroEvento(e),
        'Tipo Parto': e.tipoParto || ''
      }));
    }
    if (tipo === 'desmama') {
      return evs.map(e => ({
        'Data': formatarDataBR(e.data),
        'Brinco Bezerro': e.brincoBezerro || '',
        'Peso (kg)': e.pesoDesmama || '',
        'Idade (dias)': e.idadeDias || ''
      }));
    }
    if (tipo === 'recria') {
      return evs.map(e => ({
        'Data': formatarDataBR(e.data),
        'Novilha': brincoMap[e.matrizId] || '',
        'Peso Atual (kg)': e.pesoAtual || '',
        'Apta Reprodução': e.aptaReproducao || ''
      }));
    }
    if (tipo === 'iatf') {
      return evs.map(e => ({
        'Data': formatarDataBR(e.data),
        'Matriz': brincoMap[e.matrizId] || '',
        'Tipo': e.tipoServico || '',
        'Nº Tent.': e.numeroServico || '',
        'Touro/Sêmen': nomeTouroEvento(e),
        'Técnico': e.tecnico || '',
        'Custo (R$)': e.custo || ''
      }));
    }
    if (tipo === 'diagnostico') {
      return evs.map(e => ({
        'Data': formatarDataBR(e.data),
        'Matriz': brincoMap[e.matrizId] || '',
        'Resultado': e.resultado || '',
        'Método': e.metodo || '',
        'DG (dias)': e.dg || '',
        'Veterinário': e.veterinario || '',
        'Custo (R$)': e.custo || ''
      }));
    }
    if (tipo === 'venda') {
      return evs.map(e => ({
        'Data': formatarDataBR(e.data),
        'Categoria': e.categoria || '',
        'Animais': e.animais || '',
        'Peso Total (kg)': e.pesoTotal || '',
        'Valor Total (R$)': e.valorTotal || '',
        'Frete (R$)': e.frete || '',
        'Comprador': e.comprador || ''
      }));
    }
    if (tipo === 'insumo') {
      return evs.map(e => ({
        'Data': formatarDataBR(e.data),
        'Produto': e.produto || '',
        'Quantidade': e.quantidade || '',
        'Unidade': e.unidade || '',
        'Custo (R$)': e.custo || '',
        'Categoria Animal': e.categoriaAnimal || ''
      }));
    }
    if (tipo === 'descarte') {
      return evs.map(e => ({
        'Data': formatarDataBR(e.data),
        'Matriz': brincoMap[e.matrizId] || '',
        'Motivo': e.motivo || ''
      }));
    }
    return [];
  }
  function exportarExcel() {
    const wb = XLSX.utils.book_new();
    const hoje = todayISO();

    // ---- Resumo ----
    const resumo = [['Relatório Fazenda Ibiraçu', ''], ['Gerado em', hoje], [''], ['Total de matrizes', kpis.total], ['Cheias', kpis.cheias], ['Vazias', kpis.vazias], ['Descarte', kpis.descartes], ['Novilhas em recria', kpis.emRecria], ['Taxa de prenhez (%)', kpis.taxaPrenhez.toFixed(1)], [''], ['Nascimentos', kpis.nascimentos], ['Natimortos', kpis.natimortos], ['Taxa de perda ao nascer (%)', kpis.taxaPerda.toFixed(1)], ['Peso médio ao nascer (kg)', kpis.pesoMedioNascer.toFixed(1)], ['Desmamas', kpis.desmamas], ['Taxa de desmama (%)', kpis.taxaDesmama.toFixed(1)], ['Peso médio na desmama (kg)', kpis.pesoMedioDesmama.toFixed(1)], [''], ['Receita total de vendas (R$)', kpis.receitaTotal.toFixed(2)], ['Custo total (IATF+diagnóstico+insumo+frete) (R$)', kpis.custoTotal.toFixed(2)], ['Custo por bezerro (R$)', kpis.custoPorBezerro.toFixed(2)], ['Margem (vendas - custos) (R$)', kpis.margem.toFixed(2)]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), 'Resumo');

    // ---- Matrizes ----
    const matrizesSheet = matrizes.map(m => ({
      'Brinco': m.brinco,
      'Categoria': m.categoria,
      'Raça': m.raca || '',
      'Lote': m.lote || '',
      'Data Nascimento': formatarDataBR(m.dataNascimento) || '',
      'Status': m.status,
      'Partos na Fazenda': eventos.filter(e => e.tipo === 'nascimento' && e.matrizId === m.id).length,
      'Último Parto': formatarDataBR(ultimoPartoDe(m.id, eventos)) || '',
      'Nº Cria (Último Parto)': numeroCriaUltimoParto(m.id, eventos),
      'Partos Anteriores': m.partosAnteriores || 0
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matrizesSheet), 'Matrizes');

    // ---- Nascimentos ----
    const nascSheet = eventos.filter(e => e.tipo === 'nascimento').map(e => ({
      'Data': formatarDataBR(e.data),
      'Matriz (mãe)': brincoMap[e.matrizId] || '',
      'Resultado': e.resultadoParto || '',
      'Sexo': e.sexo || '',
      'Peso ao Nascer (kg)': e.pesoNascer || '',
      'Brinco do Bezerro': e.brincoBezerro || '',
      'Pelagem': e.pelagem || '',
      'Pai (touro/sêmen)': nomeTouroEvento(e),
      'Tipo de Parto': e.tipoParto || '',
      'Observações': e.observacoes || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nascSheet), 'Nascimentos');

    // ---- Desmama ----
    const desmamaSheet = eventos.filter(e => e.tipo === 'desmama').map(e => ({
      'Data': formatarDataBR(e.data),
      'Brinco do Bezerro': e.brincoBezerro || '',
      'Peso na Desmama (kg)': e.pesoDesmama || '',
      'Idade (dias)': e.idadeDias || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(desmamaSheet), 'Desmama');

    // ---- Recria ----
    const recriaSheet = eventos.filter(e => e.tipo === 'recria').map(e => ({
      'Data': formatarDataBR(e.data),
      'Novilha': brincoMap[e.matrizId] || '',
      'Peso Atual (kg)': e.pesoAtual || '',
      'Apta para Reprodução': e.aptaReproducao || '',
      'Observações': e.observacoes || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recriaSheet), 'Recria');

    // ---- IATF ----
    const iatfSheet = eventos.filter(e => e.tipo === 'iatf').map(e => ({
      'Data': formatarDataBR(e.data),
      'Matriz': brincoMap[e.matrizId] || '',
      'Tipo': e.tipoServico || '',
      'Nº Tentativa': e.numeroServico || '',
      'Início Protocolo': formatarDataBR(e.dataInicioProtocolo) || '',
      'Touro/Sêmen': nomeTouroEvento(e),
      'Técnico': e.tecnico || '',
      'Custo (R$)': e.custo || '',
      'Observações': e.observacoes || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(iatfSheet), 'IATF');

    // ---- Diagnósticos ----
    const diagSheet = eventos.filter(e => e.tipo === 'diagnostico').map(e => ({
      'Data': formatarDataBR(e.data),
      'Matriz': brincoMap[e.matrizId] || '',
      'Resultado': e.resultado || '',
      'Método': e.metodo || '',
      'DG (dias)': e.dg || '',
      'Veterinário': e.veterinario || '',
      'Custo (R$)': e.custo || '',
      'Motivo (se descarte)': e.motivo || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(diagSheet), 'Diagnósticos');

    // ---- Vendas ----
    const vendaSheet = eventos.filter(e => e.tipo === 'venda').map(e => ({
      'Data': formatarDataBR(e.data),
      'Categoria': e.categoria || '',
      'Animais': e.animais || '',
      'Peso Total (kg)': e.pesoTotal || '',
      'Valor Arroba (R$)': e.valorArroba || '',
      'Valor Total (R$)': e.valorTotal || '',
      'Frete/Comissão (R$)': e.frete || '',
      'Comprador': e.comprador || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vendaSheet), 'Vendas');

    // ---- Insumos ----
    const insumoSheet = eventos.filter(e => e.tipo === 'insumo').map(e => ({
      'Data': formatarDataBR(e.data),
      'Produto': e.produto || '',
      'Quantidade': e.quantidade || '',
      'Unidade': e.unidade || '',
      'Custo (R$)': e.custo || '',
      'Categoria de Animal': e.categoriaAnimal || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(insumoSheet), 'Insumos');

    // ---- Descartes ----
    const descarteSheet = eventos.filter(e => e.tipo === 'descarte').map(e => ({
      'Data': formatarDataBR(e.data),
      'Matriz': brincoMap[e.matrizId] || '',
      'Motivo': e.motivo || '',
      'Origem': e.origemDiagnostico ? 'Diagnóstico veterinário' : 'Lançamento manual'
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(descarteSheet), 'Descartes');

    // ---- Touros ----
    const tourosSheet = touros.map(t => {
      const usadas = eventos.filter(e => e.tipo === 'iatf' && e.touroId === t.id).length;
      const adquiridas = parseInt(t.doses) || 0;
      return {
        'Nome': t.nome,
        'Raça': t.raca,
        'Fornecedor': t.fornecedor || '',
        'Ano Aquisição': t.anoAquisicao || '',
        'Doses Adquiridas': adquiridas,
        'Doses Usadas': usadas,
        'Doses Restantes': adquiridas ? adquiridas - usadas : '',
        'Custo/Dose (R$)': t.custoDose || '',
        'Observações': t.observacoes || ''
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tourosSheet), 'Touros');
    XLSX.writeFile(wb, `Relatorio_Fazenda_Ibiracu_${hoje}.xlsx`);
  }
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.bg,
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.textMuted
      }
    }, /*#__PURE__*/React.createElement(Loader2, {
      size: 20,
      style: {
        marginRight: 8
      },
      className: "animate-spin"
    }), " Carregando...");
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg,
      color: C.text,
      minHeight: '100%',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px 16px 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 880,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      letterSpacing: 1.5,
      color: C.accent,
      textTransform: 'uppercase',
      fontWeight: 700
    }
  }, "Fazenda Ibiraçu"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 26,
      margin: '2px 0 0',
      fontWeight: 700
    }
  }, "Gestão da Pecuária")), syncError && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'rgba(181,83,60,0.15)',
      border: `1px solid ${C.descarte}`,
      borderRadius: 10,
      padding: '10px 14px',
      marginBottom: 16,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(AlertCircle, {
    size: 16,
    color: C.descarte,
    style: {
      flexShrink: 0
    }
  }), "Não consegui falar com a planilha agora. Verifique sua internet e tente de novo — os dados na tela podem estar desatualizados."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 20,
      background: C.surface,
      padding: 6,
      borderRadius: 12,
      border: `1px solid ${C.border}`,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: tabButtonStyle(tab === 'lancar'),
    onClick: () => setTab('lancar')
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 16
  }), " Lançar"), /*#__PURE__*/React.createElement("button", {
    style: tabButtonStyle(tab === 'previsao'),
    onClick: () => setTab('previsao')
  }, /*#__PURE__*/React.createElement(CalendarClock, {
    size: 16
  }), " Previsão de Parto"), ownerMode && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    style: tabButtonStyle(tab === 'dashboard'),
    onClick: () => setTab('dashboard')
  }, /*#__PURE__*/React.createElement(LayoutDashboard, {
    size: 16
  }), " Dashboard"), /*#__PURE__*/React.createElement("button", {
    style: tabButtonStyle(tab === 'matrizes'),
    onClick: () => setTab('matrizes')
  }, /*#__PURE__*/React.createElement(List, {
    size: 16
  }), " Matrizes"), /*#__PURE__*/React.createElement("button", {
    style: tabButtonStyle(tab === 'touros'),
    onClick: () => setTab('touros')
  }, /*#__PURE__*/React.createElement(Dna, {
    size: 16
  }), " Touros"), /*#__PURE__*/React.createElement("button", {
    style: tabButtonStyle(tab === 'planilha'),
    onClick: () => setTab('planilha')
  }, /*#__PURE__*/React.createElement(Table, {
    size: 16
  }), " Planilha")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center'
    }
  }, ownerMode ? /*#__PURE__*/React.createElement("button", {
    onClick: bloquear,
    title: "Voltar para o modo funcionário",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '9px 12px',
      borderRadius: 10,
      border: 'none',
      background: 'transparent',
      color: C.textMuted,
      fontSize: 12.5,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Unlock, {
    size: 14
  }), " Proprietário") : /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowPinInput(v => !v),
    title: "Entrar como proprietário",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '9px 12px',
      borderRadius: 10,
      border: 'none',
      background: 'transparent',
      color: C.textMuted,
      fontSize: 12.5,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Lock, {
    size: 14
  })))), showPinInput && !ownerMode && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    inputMode: "numeric",
    placeholder: "PIN do proprietário",
    value: pinValue,
    onChange: e => {
      setPinValue(e.target.value);
      setPinError(false);
    },
    onKeyDown: e => {
      if (e.key === 'Enter') tentarDesbloquear();
    },
    style: {
      flex: 1,
      padding: '8px 10px',
      borderRadius: 8,
      border: `1px solid ${pinError ? C.danger : C.border}`,
      background: C.surfaceAlt,
      color: C.text,
      fontSize: 14
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: tentarDesbloquear,
    style: {
      padding: '8px 14px',
      borderRadius: 8,
      border: 'none',
      background: C.accent,
      color: '#1B140A',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer'
    }
  }, "Entrar"), pinError && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.danger
    }
  }, "PIN incorreto")), tab === 'lancar' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20
    }
  }, tiposVisiveis.map(t => {
    const Icon = t.icon;
    const active = tipoSelecionado === t.id;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => setTipoSelecionado(t.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 13px',
        borderRadius: 10,
        border: `1px solid ${active ? C.accent : C.border}`,
        cursor: 'pointer',
        fontSize: 13.5,
        background: active ? C.accentSoft : C.surface,
        color: active ? C.accent : C.text,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 15
    }), " ", t.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 20
    }
  }, matrizes.length === 0 && tipoSelecionado !== 'cadastro' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
      background: C.accentSoft,
      border: `1px solid ${C.accent}`,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
      fontSize: 13.5,
      color: C.text
    }
  }, /*#__PURE__*/React.createElement(AlertCircle, {
    size: 16,
    color: C.accent,
    style: {
      flexShrink: 0,
      marginTop: 1
    }
  }), ownerMode ? 'Cadastre pelo menos uma matriz primeiro em "Nova Matriz" para poder vinculá-la aos outros eventos.' : 'Ainda não há matrizes cadastradas no sistema. Fale com o proprietário.'), tipoSelecionado === 'nascimento' && (ultimosNascimentos.Macho || ultimosNascimentos.Fêmea) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 16,
      flexWrap: 'wrap'
    }
  }, ['Fêmea', 'Macho'].map(sexo => {
    const ev = ultimosNascimentos[sexo];
    if (!ev) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: sexo,
      style: {
        flex: '1 1 140px',
        background: C.surfaceAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '10px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.4
      }
    }, "Último ", sexo === 'Macho' ? 'macho' : 'fêmea', " lançado"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 700,
        fontFamily: 'Georgia, serif'
      }
    }, ev.brincoBezerro), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: C.textMuted
      }
    }, formatarDataBR(ev.data), ev.pelagem ? ` · ${ev.pelagem}` : ''));
  })), CAMPOS[tipoSelecionado].filter(campo => !campo.showIf || campo.showIf(form)).map(campo => /*#__PURE__*/React.createElement(Field, {
    key: campo.key,
    campo: campo,
    value: form[campo.key],
    onChange: updateField,
    matrizes: matrizes,
    touros: touros
  })), /*#__PURE__*/React.createElement("button", {
    onClick: handleSalvar,
    disabled: saveStatus === 'saving',
    style: {
      width: '100%',
      padding: '13px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      background: saveStatus === 'saved' ? C.cheia : C.accent,
      color: '#1B140A',
      fontWeight: 700,
      fontSize: 15,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 6
    }
  }, saveStatus === 'saving' && /*#__PURE__*/React.createElement(Loader2, {
    size: 17,
    className: "animate-spin"
  }), saveStatus === 'saved' && /*#__PURE__*/React.createElement(Check, {
    size: 17
  }), saveStatus !== 'saving' && saveStatus !== 'saved' && /*#__PURE__*/React.createElement(Save, {
    size: 17
  }), saveStatus === 'saved' ? 'Salvo!' : saveStatus === 'saving' ? 'Salvando...' : 'Salvar registro'), saveStatus === 'error' && /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.danger,
      fontSize: 13,
      marginTop: 8
    }
  }, "Preencha os campos obrigatórios (*) antes de salvar."))), tab === 'dashboard' && ownerMode && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: exportarExcel,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      borderRadius: 8,
      border: 'none',
      background: C.accent,
      color: '#1B140A',
      fontSize: 12.5,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(Save, {
    size: 13
  }), " Baixar relatório Excel"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmAction('import'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 12px',
      borderRadius: 8,
      border: `1px solid ${C.accent}`,
      background: C.accentSoft,
      color: C.accent,
      fontSize: 12.5,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(ClipboardList, {
    size: 13
  }), " Importar dados reais (REBANHO 2026)"), /*#__PURE__*/React.createElement("button", {
    onClick: seedDemo,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 12px',
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: C.surface,
      color: C.textMuted,
      fontSize: 12.5,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(RefreshCw, {
    size: 13
  }), " Carregar dados de exemplo"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmAction('clear'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 12px',
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: C.surface,
      color: C.textMuted,
      fontSize: 12.5,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(X, {
    size: 13
  }), " Limpar dados")), confirmAction && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      background: C.accentSoft,
      border: `1px solid ${C.accent}`,
      borderRadius: 10,
      padding: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(AlertCircle, {
    size: 17,
    color: C.accent,
    style: {
      flexShrink: 0,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      marginBottom: 10
    }
  }, confirmAction === 'import' ? 'Isso vai SUBSTITUIR os dados atuais pelos dados reais importados da planilha REBANHO - 2026.xlsx (180 matrizes + 193 eventos). Confirma?' : 'Isso vai apagar todos os dados lançados (inclusive reais, se houver). Confirma?'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (confirmAction === 'import') await importarDadosReais();else await clearAll();
      setConfirmAction(null);
    },
    style: {
      padding: '7px 14px',
      borderRadius: 8,
      border: 'none',
      background: C.accent,
      color: '#1B140A',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer'
    }
  }, "Confirmar"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmAction(null),
    style: {
      padding: '7px 14px',
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: 'transparent',
      color: C.textMuted,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer'
    }
  }, "Cancelar")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Matrizes",
    value: kpis.total,
    sub: `${kpis.cheias} cheias · ${kpis.vazias} vazias`
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Taxa de prenhez",
    value: `${kpis.taxaPrenhez.toFixed(0)}%`,
    color: C.cheia
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Nascimentos",
    value: kpis.nascimentos,
    sub: `peso médio ${kpis.pesoMedioNascer.toFixed(0)} kg`
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Taxa de perda ao nascer",
    value: `${kpis.taxaPerda.toFixed(0)}%`,
    sub: `${kpis.natimortos} natimorto(s)`,
    color: kpis.taxaPerda > 5 ? C.descarte : C.text
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Taxa de desmama",
    value: `${kpis.taxaDesmama.toFixed(0)}%`,
    sub: `peso médio ${kpis.pesoMedioDesmama.toFixed(0)} kg`
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Novilhas em recria",
    value: kpis.emRecria
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Custo por bezerro",
    value: fmtBRL(kpis.custoPorBezerro),
    color: C.vazia
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Margem (vendas - custos)",
    value: fmtBRL(kpis.margem),
    color: kpis.margem >= 0 ? C.cheia : C.descarte
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      flexWrap: 'wrap',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 260px',
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.textMuted,
      marginBottom: 10,
      fontWeight: 600
    }
  }, "Status do plantel"), statusData.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.textMuted,
      fontSize: 13,
      padding: '30px 0',
      textAlign: 'center'
    }
  }, "Sem matrizes cadastradas ainda") : /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 200
  }, /*#__PURE__*/React.createElement(PieChart, null, /*#__PURE__*/React.createElement(Pie, {
    data: statusData,
    dataKey: "value",
    nameKey: "name",
    innerRadius: 50,
    outerRadius: 80,
    paddingAngle: 3
  }, statusData.map((d, i) => /*#__PURE__*/React.createElement(Cell, {
    key: i,
    fill: d.color
  }))), /*#__PURE__*/React.createElement(Tooltip, {
    contentStyle: {
      background: C.surfaceAlt,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      color: C.text
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      justifyContent: 'center',
      marginTop: 6,
      flexWrap: 'wrap'
    }
  }, statusData.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12.5,
      color: C.textMuted
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 9,
      background: d.color,
      display: 'inline-block'
    }
  }), " ", d.name, " (", d.value, ")")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 260px',
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.textMuted,
      marginBottom: 10,
      fontWeight: 600
    }
  }, "Nascimentos por mês"), nascimentosPorMes.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.textMuted,
      fontSize: 13,
      padding: '30px 0',
      textAlign: 'center'
    }
  }, "Sem nascimentos lançados ainda") : /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 200
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: nascimentosPorMes
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    stroke: C.border,
    strokeDasharray: "3 3",
    vertical: false
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "mes",
    tick: {
      fill: C.textMuted,
      fontSize: 11
    },
    axisLine: {
      stroke: C.border
    },
    tickLine: false
  }), /*#__PURE__*/React.createElement(YAxis, {
    allowDecimals: false,
    tick: {
      fill: C.textMuted,
      fontSize: 11
    },
    axisLine: {
      stroke: C.border
    },
    tickLine: false
  }), /*#__PURE__*/React.createElement(Tooltip, {
    contentStyle: {
      background: C.surfaceAlt,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      color: C.text
    }
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "qtd",
    fill: C.accent,
    radius: [5, 5, 0, 0]
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.textMuted,
      marginBottom: 10,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(ClipboardList, {
    size: 15
  }), " Atividade recente"), atividadeRecente.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.textMuted,
      fontSize: 13,
      padding: '10px 0'
    }
  }, "Nenhum registro lançado ainda.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, atividadeRecente.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '9px 0',
      borderBottom: `1px solid ${C.border}`,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("span", null, eventoLabel(e.tipo), e.matrizId ? ` — ${brincoMap[e.matrizId] || '?'}` : '', (e.tipo === 'iatf' || e.tipo === 'nascimento') && nomeTouroEvento(e) ? ` (${nomeTouroEvento(e)})` : ''), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.textMuted
    }
  }, formatarDataBR(e.data))))))), tab === 'previsao' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Search, {
    size: 17,
    style: {
      position: 'absolute',
      left: 14,
      top: 15,
      color: C.textMuted
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Buscar por brinco...",
    value: buscaPrevisao,
    onChange: e => setBuscaPrevisao(e.target.value),
    style: {
      width: '100%',
      padding: '13px 14px 13px 40px',
      borderRadius: 12,
      border: `1px solid ${C.border}`,
      background: C.surfaceAlt,
      color: C.text,
      fontSize: 16
    }
  })), (() => {
    const hoje = todayISO();
    const lista = matrizes.filter(m => m.status === 'Cheia').filter(m => !buscaPrevisao || m.brinco.toLowerCase().includes(buscaPrevisao.toLowerCase())).map(m => ({
      matriz: m,
      previsao: previsaoPartoDe(m.id, eventos),
      ultimoParto: ultimoPartoDe(m.id, eventos),
      numeroCria: numeroCriaUltimoParto(m.id, eventos)
    })).sort((a, b) => {
      if (!a.previsao) return 1;
      if (!b.previsao) return -1;
      return a.previsao.localeCompare(b.previsao);
    });
    if (lista.length === 0) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          color: C.textMuted,
          fontSize: 14,
          padding: '30px 0',
          textAlign: 'center'
        }
      }, buscaPrevisao ? 'Nenhuma matriz cheia encontrada com esse brinco.' : 'Nenhuma matriz com status Cheia no momento.');
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, lista.map(({
      matriz: m,
      previsao,
      ultimoParto,
      numeroCria
    }) => {
      const diasRestantes = previsao ? Math.round((new Date(previsao + 'T00:00:00') - new Date(hoje + 'T00:00:00')) / 86400000) : null;
      let corPrazo = C.textMuted;
      let textoPrazo = 'sem previsão calculada';
      if (diasRestantes !== null) {
        if (diasRestantes < 0) {
          corPrazo = C.descarte;
          textoPrazo = `atrasado ${Math.abs(diasRestantes)} dia(s)`;
        } else if (diasRestantes === 0) {
          corPrazo = C.descarte;
          textoPrazo = 'hoje!';
        } else if (diasRestantes <= 15) {
          corPrazo = C.vazia;
          textoPrazo = `em ${diasRestantes} dia(s)`;
        } else {
          corPrazo = C.cheia;
          textoPrazo = `em ${diasRestantes} dia(s)`;
        }
      }
      return /*#__PURE__*/React.createElement("div", {
        key: m.id,
        style: {
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: '14px 16px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10,
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: 17
        }
      }, m.brinco), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          color: C.textMuted
        }
      }, m.categoria, m.raca ? ` · ${m.raca}` : '', m.lote ? ` · ${m.lote}` : '')), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'right'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 19,
          fontWeight: 700,
          fontFamily: 'Georgia, serif',
          color: C.accent
        }
      }, previsao ? formatarDataBR(previsao) : '—'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          fontWeight: 700,
          color: corPrazo
        }
      }, textoPrazo))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 14,
          marginTop: 8,
          flexWrap: 'wrap',
          fontSize: 12.5,
          color: C.textMuted
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          color: C.cheia,
          background: `${C.cheia}22`,
          padding: '3px 9px',
          borderRadius: 20
        }
      }, m.status), ultimoParto && /*#__PURE__*/React.createElement("span", null, "Último parto: ", formatarDataBR(ultimoParto), numeroCria ? ` (cria ${numeroCria})` : '')));
    }));
  })()), tab === 'matrizes' && ownerMode && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: '1 1 180px'
    }
  }, /*#__PURE__*/React.createElement(Search, {
    size: 15,
    style: {
      position: 'absolute',
      left: 11,
      top: 11,
      color: C.textMuted
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Buscar por brinco",
    value: busca,
    onChange: e => setBusca(e.target.value),
    style: {
      width: '100%',
      padding: '9px 12px 9px 32px',
      borderRadius: 10,
      border: `1px solid ${C.border}`,
      background: C.surfaceAlt,
      color: C.text,
      fontSize: 14
    }
  })), ['todos', 'Cheia', 'Vazia', 'Descarte'].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setFiltroStatus(s),
    style: {
      padding: '9px 13px',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      border: `1px solid ${filtroStatus === s ? C.accent : C.border}`,
      background: filtroStatus === s ? C.accentSoft : C.surface,
      color: filtroStatus === s ? C.accent : C.textMuted
    }
  }, s === 'todos' ? 'Todos' : s))), matrizesFiltradas.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.textMuted,
      fontSize: 14,
      padding: '30px 0',
      textAlign: 'center'
    }
  }, "Nenhuma matriz encontrada.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      overflow: 'hidden'
    }
  }, matrizesFiltradas.map((m, i) => {
    const cor = m.status === 'Cheia' ? C.cheia : m.status === 'Vazia' ? C.vazia : C.descarte;
    const partosFazenda = eventos.filter(e => e.tipo === 'nascimento' && e.matrizId === m.id).length;
    const partosAnt = parseInt(m.partosAnteriores) || 0;
    const partosLabel = partosAnt > 0 ? `${partosFazenda} parto(s) aqui · ${partosAnt} antes` : `${partosFazenda} parto(s) na fazenda`;
    const ultimoParto = formatarDataBR(ultimoPartoDe(m.id, eventos));
    const numeroCria = numeroCriaUltimoParto(m.id, eventos);
    return /*#__PURE__*/React.createElement("div", {
      key: m.id,
      onClick: ownerMode ? () => abrirEdicaoMatriz(m) : undefined,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '13px 16px',
        borderBottom: i < matrizesFiltradas.length - 1 ? `1px solid ${C.border}` : 'none',
        cursor: ownerMode ? 'pointer' : 'default'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 15,
        color: ownerMode ? C.accent : C.text
      }
    }, m.brinco), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: C.textMuted
      }
    }, m.categoria, m.dataNascimento ? ` · nasc. ${formatarDataBR(m.dataNascimento)}` : ''), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: C.textMuted
      }
    }, partosLabel, ultimoParto ? ` · último parto: ${ultimoParto}${numeroCria ? ` (cria ${numeroCria})` : ''}` : '')), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 700,
        color: cor,
        background: `${cor}22`,
        padding: '5px 10px',
        borderRadius: 20
      }
    }, m.status));
  })), ownerMode && editandoMatriz && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: 16
    },
    onClick: fecharEdicaoMatriz
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 20,
      maxWidth: 420,
      width: '100%',
      maxHeight: '85vh',
      overflowY: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      fontFamily: 'Georgia, serif'
    }
  }, "Editar matriz ", editandoMatriz.brinco), /*#__PURE__*/React.createElement("button", {
    onClick: fecharEdicaoMatriz,
    style: {
      background: 'transparent',
      border: 'none',
      color: C.textMuted,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(X, {
    size: 18
  }))), CAMPOS_EDICAO_MATRIZ.map(campo => /*#__PURE__*/React.createElement(Field, {
    key: campo.key,
    campo: campo,
    value: formEdicaoMatriz[campo.key],
    onChange: (k, v) => setFormEdicaoMatriz(f => ({
      ...f,
      [k]: v
    })),
    matrizes: matrizes,
    touros: touros
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: salvarEdicaoMatriz,
    style: {
      flex: 1,
      padding: '12px',
      borderRadius: 10,
      border: 'none',
      background: C.accent,
      color: '#1B140A',
      fontWeight: 700,
      fontSize: 14.5,
      cursor: 'pointer'
    }
  }, "Salvar alterações"), /*#__PURE__*/React.createElement("button", {
    onClick: fecharEdicaoMatriz,
    style: {
      padding: '12px 18px',
      borderRadius: 10,
      border: `1px solid ${C.border}`,
      background: 'transparent',
      color: C.textMuted,
      fontWeight: 600,
      fontSize: 14.5,
      cursor: 'pointer'
    }
  }, "Cancelar")))))), tab === 'touros' && ownerMode && /*#__PURE__*/React.createElement("div", null, touros.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.textMuted,
      fontSize: 14,
      padding: '30px 0',
      textAlign: 'center'
    }
  }, "Nenhum touro/sêmen cadastrado ainda.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, touros.map(t => {
    const usadas = eventos.filter(e => e.tipo === 'iatf' && e.touroId === t.id).length;
    const adquiridas = parseInt(t.doses) || 0;
    const restantes = adquiridas - usadas;
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      style: {
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '14px 16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 15
      }
    }, t.nome), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: C.textMuted
      }
    }, t.raca, t.fornecedor ? ` · ${t.fornecedor}` : '', t.anoAquisicao ? ` · ${t.anoAquisicao}` : ''), t.observacoes && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.textMuted,
        marginTop: 4
      }
    }, t.observacoes)), adquiridas > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 700,
        padding: '5px 10px',
        borderRadius: 20,
        color: restantes <= 0 ? C.descarte : restantes <= 5 ? C.vazia : C.cheia,
        background: `${restantes <= 0 ? C.descarte : restantes <= 5 ? C.vazia : C.cheia}22`
      }
    }, restantes, " dose(s) restante(s)")), adquiridas > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: C.textMuted,
        marginTop: 8
      }
    }, usadas, " usada(s) de ", adquiridas, " adquiridas", t.custoDose ? ` · ${fmtBRL(t.custoDose)}/dose` : ''));
  }))), tab === 'planilha' && ownerMode && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16
    }
  }, PLANILHA_TIPOS.map(t => {
    const Icon = t.icon;
    const active = planilhaTipo === t.id;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => setPlanilhaTipo(t.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 13px',
        borderRadius: 10,
        border: `1px solid ${active ? C.accent : C.border}`,
        cursor: 'pointer',
        fontSize: 13.5,
        background: active ? C.accentSoft : C.surface,
        color: active ? C.accent : C.text,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 15
    }), " ", t.label);
  })), /*#__PURE__*/React.createElement(SheetTable, {
    rows: getSheetRows(planilhaTipo)
  }))));
}

// ---------- montagem na página ----------
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(GestaoPecuaria));
