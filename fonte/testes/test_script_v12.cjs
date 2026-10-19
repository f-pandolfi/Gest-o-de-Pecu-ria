// Script v12 no simulador: migração de uma planilha v11 (sem perder nada), protocolos, manejos, touros, config.
const assert = require('assert');
const path = require('path');
const { carregarScript } = require('./simulador.cjs');
const { dadosExemplo } = require('./dados_exemplo.cjs');
let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };

const v11 = carregarScript(path.join(__dirname, '..', 'Code_v11.gs'));
v11.post({ action: 'syncAll', ...dadosExemplo(), forcar: true });
v11.post({ action: 'appendEvento', tipo: 'iatf', evento: { id: 'i1', data: '2026-01-10', matrizId: 'm20', tipoServico: 'IATF', touroId: 't1', tecnico: 'Zé', custo: 30 } });
const antes = v11.get();
const v12 = carregarScript(path.join(__dirname, '..', 'Code_v12.gs'), { ss: v11.ss, abas: v11.abas });

t('v12 responde versão 12 e lê a planilha da v11 inteira (sem perder nada)', () => {
  const r = v12.post({ action: 'repararPlanilha' });
  assert.ok(r.ok, JSON.stringify(r));
  const g = v12.get();
  assert.strictEqual(g.versao, 12);
  assert.strictEqual(g.matrizes.length, antes.matrizes.length);
  assert.strictEqual(g.eventos.length, antes.eventos.length);
  assert.strictEqual(g.touros.length, 2); assert.strictEqual(g.touros[0].nome, 'Faraó');
  assert.deepStrictEqual(g.protocolos, []);
  const i1 = g.eventos.find((e) => e.id === 'i1');
  assert.strictEqual(i1.tecnico, 'Zé'); assert.strictEqual(i1.custo, 30); assert.strictEqual(i1.data, '2026-01-10');
});

t('colunas antigas continuam no mesmo lugar (fórmulas da aba Matrizes)', () => {
  const cab = (aba) => v12.ss.getSheetByName(aba).getRange(1, 1, 1, 14).getValues()[0];
  const d = cab('Diagnosticos'); assert.deepStrictEqual(d.slice(0, 6), ['id', 'data', 'matrizId', 'resultado', 'metodo', 'dg']);
  assert.deepStrictEqual(d.slice(10, 13), ['toqueId', 'apta', 'observacoes']);
  const i = cab('IATF'); assert.deepStrictEqual(i.slice(0, 3), ['id', 'data', 'matrizId']);
  const n = cab('Nascimentos'); assert.deepStrictEqual(n.slice(0, 3), ['id', 'data', 'matrizId']);
});

t('touro: editar (upsertTouros) e cadastrar sêmen com campos novos', () => {
  const g = v12.get();
  const faraó = { ...g.touros[0], tipo: 'Touro vivo', brinco: '900', dataNascimento: '2022-05-01', andrologicoData: '2026-09-01', andrologicoResultado: 'Apto', circEscrotal: 36 };
  const semen = { id: 's1', nome: 'Sêmen X', raca: 'Angus', tipo: 'Sêmen', codigoCentral: '29AN123', partida: 'P55', tipoSemen: 'Sexado fêmea', doses: 50, custoDose: 45, dataCompra: '2026-08-10', botijao: 'B1', caneca: '3' };
  v12.post({ action: 'upsertTouros', touros: [faraó, semen] });
  const g2 = v12.get();
  assert.strictEqual(g2.touros.length, 3);
  const f = g2.touros.find((x) => x.id === faraó.id);
  assert.strictEqual(f.tipo, 'Touro vivo'); assert.strictEqual(f.andrologicoData, '2026-09-01'); assert.strictEqual(f.nome, 'Faraó');
  const s = g2.touros.find((x) => x.id === 's1');
  assert.strictEqual(s.partida, 'P55'); assert.strictEqual(s.dataCompra, '2026-08-10'); assert.strictEqual(s.doses, 50);
});

t('protocolo: gravar e atualizar pelo id', () => {
  const p = { id: 'pr1', tipo: 'IATF', nome: 'IATF Nov/26', dataInicio: '2026-11-03', status: 'Ativo', manejos: JSON.stringify([{ id: 'D0', dias: 0 }]), animais: 'm1,m2,m3', semenPadrao: 's1', createdAt: '2026-10-19T12:00:00Z' };
  v12.post({ action: 'upsertProtocolos', protocolos: [p] });
  v12.post({ action: 'upsertProtocolos', protocolos: [{ ...p, animais: 'm1,m2,m3,m4', custoTotal: 1500 }] });
  const g = v12.get();
  assert.strictEqual(g.protocolos.length, 1);
  assert.strictEqual(g.protocolos[0].animais, 'm1,m2,m3,m4'); assert.strictEqual(g.protocolos[0].dataInicio, '2026-11-03');
  assert.strictEqual(JSON.parse(g.protocolos[0].manejos)[0].id, 'D0');
});

t('manejo, IATF com protocolo e toque com campos novos', () => {
  v12.post({ action: 'appendEventos', itens: [
    { tipo: 'manejo', evento: { id: 'mj1', data: '2026-11-03', protocoloId: 'pr1', etapa: 'D0', responsavel: 'Zé', aplicacoes: '[{"tipo":"Vacina reprodutiva"}]', presentes: 'm1,m2', ausentes: 'm3' } },
    { tipo: 'iatf', evento: { id: 'i2', data: '2026-11-13', matrizId: 'm1', tipoServico: 'IATF', protocoloId: 'pr1', manejoRef: 'IA', touroId: 's1', tecnico: 'Zé' } },
    { tipo: 'diagnostico', evento: { id: 'dg9', data: '2026-11-20', matrizId: 'm2', resultado: 'Vazia', toqueId: 'tq1', apta: 'Sim', observacoes: 'magra' } },
  ] });
  const g = v12.get();
  const mj = g.eventos.find((e) => e.id === 'mj1');
  assert.strictEqual(mj.tipo, 'manejo'); assert.strictEqual(mj.presentes, 'm1,m2');
  assert.strictEqual(g.eventos.find((e) => e.id === 'i2').protocoloId, 'pr1');
  const dg = g.eventos.find((e) => e.id === 'dg9'); assert.strictEqual(dg.toqueId, 'tq1'); assert.strictEqual(dg.apta, 'Sim');
  // reenvio não duplica (regra da v11 continua)
  v12.post({ action: 'appendEventos', itens: [{ tipo: 'manejo', evento: { id: 'mj1', data: '2026-11-03' } }] });
  assert.strictEqual(v12.get().eventos.filter((e) => e.id === 'mj1').length, 1);
});

t('config aceita calendário de vacinas e dias mínimos de parida', () => {
  const r = v12.post({ action: 'setConfig', config: { calendarioVacinas: '[{"id":"bruc"}]', diasMinPosParto: 35, qualquer: 1 } });
  assert.strictEqual(r.gravadas, 2);
  const c = v12.get().config; assert.strictEqual(c.diasMinPosParto, 35); assert.strictEqual(c.calendarioVacinas, '[{"id":"bruc"}]');
});

t('syncAll preserva protocolos quando não vem a lista, e grava quando vem', () => {
  const g = v12.get();
  v12.post({ action: 'syncAll', matrizes: g.matrizes, touros: g.touros, eventos: g.eventos });
  assert.strictEqual(v12.get().protocolos.length, 1);
  assert.strictEqual(v12.get().eventos.length, g.eventos.length);
});

console.log(`script v12: ${ok} testes passaram`);
