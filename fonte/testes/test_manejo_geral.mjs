// Regras do manejo geral (app 10.5): lote padronizado, relação do lote com crias ao pé, animal de fora com observação,
// mudança de lote só com o proprietário, conferência, relatórios, vacinas na ficha.
import assert from 'assert';
import { createRequire } from 'module';
import * as L from '../src/logica.js';
import * as M from '../src/manejo.js';
import * as G from '../src/manejoGeral.js';
const require = createRequire(import.meta.url);
const { dadosExemplo } = require('./dados_exemplo.cjs');
let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };
const HOJE = '2026-10-20';
const base = () => M.normalizarTudo({ ...dadosExemplo(), protocolos: [], config: {} });

t('lote: "Novilhas", "novilhas " e "NOVILHAS" viram NOVILHAS; outro nome usa a escrita que já existe', () => {
  const ms = [{ lote: 'Paridas', status: 'Vazia' }, { lote: 'NOVILHAS', status: 'Vazia' }];
  assert.strictEqual(L.padronizarLote('Novilhas', ms), 'NOVILHAS');
  assert.strictEqual(L.padronizarLote(' novilhas ', []), 'NOVILHAS');
  assert.strictEqual(L.padronizarLote('PARIDAS', ms), 'Paridas');
  assert.strictEqual(L.padronizarLote('  Pasto  da  Grota ', ms), 'Pasto da Grota');
  assert.strictEqual(L.padronizarLote('', ms), '');
  assert.deepStrictEqual(L.lotesExistentes([...ms, { lote: 'paridas', status: 'Cheia' }, { lote: 'Paridas', status: 'Vendida' }]), [{ lote: 'Paridas', n: 2 }, { lote: 'NOVILHAS', n: 1 }]);
});

t('desmama de fêmea manda a novilha para o lote NOVILHAS', () => {
  const d = base();
  const nasc = d.eventos.find((e) => e.tipo === 'nascimento' && e.sexo === 'Fêmea' && e.brincoBezerro);
  const r = L.aplicarLancamento(d, 'desmama', { brincoBezerro: nasc.brincoBezerro, data: HOJE, peso: 180 });
  const nov = r.matrizesAlteradas.find((m) => m.categoria === 'Novilha');
  assert.ok(nov, 'virou novilha'); assert.strictEqual(nov.lote, 'NOVILHAS');
});

let d = base();
const loteP = 'Paridas';
t('relação do lote: matrizes do lote; com crias ao pé, entram os bezerros mamando das mães do lote', () => {
  const sem = G.animaisDoLote(d, 'paridas', { hoje: HOJE });
  const esperadas = d.matrizes.filter((m) => m.lote === 'Paridas' && m.status !== 'Vendida' && m.status !== 'Morta').length;
  assert.strictEqual(sem.length, esperadas); assert.ok(sem.every((x) => x.tipo === 'matriz'));
  assert.ok(G.temCriasAoPe(d, loteP, HOJE));
  const com = G.animaisDoLote(d, loteP, { hoje: HOJE, incluirCrias: true });
  const crias = com.filter((x) => x.tipo === 'cria');
  assert.ok(crias.length > 0 && crias.every((c) => c.id.startsWith('c:') && /mãe \d+/.test(c.linha2)));
  const maesP = new Set(d.matrizes.filter((m) => m.lote === 'Paridas').map((m) => m.id));
  crias.forEach((c) => assert.ok(maesP.has(d.eventos.find((e) => `c:${e.id}` === c.id).matrizId)));
});

t('brinco que não é do lote: entra com observação (outro lote, cria de outro lote, sem cadastro, vendida)', () => {
  const outra = d.matrizes.find((m) => m.lote === 'Solteiras');
  const f = G.animalForaDoLote(d, loteP, outra.brinco, HOJE);
  assert.strictEqual(f.animal, outra.id); assert.strictEqual(f.mudar, 'pendente');
  assert.strictEqual(f.obs, 'Não é do lote Paridas (está em Solteiras)');
  const sc = G.animalForaDoLote(d, loteP, '99999', HOJE);
  assert.strictEqual(sc.obs, 'Não está no banco de dados nem em nenhum lote'); assert.strictEqual(sc.semCadastro, true); assert.strictEqual(sc.animal, '');
  const nascS = d.eventos.find((e) => e.tipo === 'nascimento' && e.brincoBezerro && d.matrizes.find((m) => m.id === e.matrizId && m.lote === 'Solteiras'));
  if (nascS) {
    const c = G.animalForaDoLote(d, loteP, nascS.brincoBezerro, HOJE);
    assert.ok(/^Cria de outro lote \(mãe \d+ em Solteiras\)$/.test(c.obs), c.obs); assert.strictEqual(c.mudar, '');
  }
  const vend = { ...d.matrizes[1], status: 'Vendida' };
  const d2 = { ...d, matrizes: d.matrizes.map((m) => (m.id === vend.id ? vend : m)) };
  assert.ok(/VENDIDA/.test(G.animalForaDoLote(d2, 'Solteiras', vend.brinco, HOJE).obs));
});

let idFunc;
t('funcionário grava: conferência com faltando e de fora; a mudança de lote fica PENDENTE e o lote não muda', () => {
  const lista = G.animaisDoLote(d, loteP, { hoje: HOJE, incluirCrias: true });
  const marcados = lista.slice(2).map((x) => x.id); // os 2 primeiros faltaram
  const outra = d.matrizes.find((m) => m.lote === 'Solteiras');
  const fora = [G.animalForaDoLote(d, loteP, outra.brinco, HOJE), G.animalForaDoLote(d, loteP, '99999', HOJE)];
  const erro = G.aplicarManejoGeral(d, { data: HOJE, lote: loteP, descricao: '', esperados: [], marcados: [] });
  assert.deepStrictEqual(erro.erros, ['Escreva o manejo (o que está sendo feito).', 'Marque pelo menos um animal que passou no curral.']);
  const r = G.aplicarManejoGeral(d, {
    data: HOJE, lote: 'PARIDAS', descricao: 'Brinco mosquicida', responsavel: 'João', aplicacoes: [{ tipo: 'Brinco mosquicida', produto: 'X' }],
    esperados: lista.map((x) => x.id), marcados, fora, incluirCrias: true, dono: false, aprovar: [outra.id],
  }, { id: 'g1', now: '2026-10-20T10:00:00.000Z' });
  assert.deepStrictEqual(r.erros, []); assert.deepStrictEqual(r.matrizesAlteradas, []);
  const e = r.eventosNovos[0]; idFunc = e.id;
  assert.strictEqual(e.etapa, 'Geral'); assert.strictEqual(e.lote, 'Paridas'); assert.strictEqual(e.manejoRef, 'com crias ao pé');
  assert.ok(e.presentes.split(',').includes(outra.id));
  assert.strictEqual(e.ausentes.split(',').length, 2);
  assert.strictEqual(JSON.parse(e.foraDoLote)[0].mudar, 'pendente');
  d = r.estado;
  assert.strictEqual(d.matrizes.find((m) => m.id === outra.id).lote, 'Solteiras');
  const c = G.conferencia(d, e);
  assert.strictEqual(c.esperados, lista.length); assert.strictEqual(c.conferidos.length, lista.length - 2); assert.strictEqual(c.faltando.length, 2); assert.strictEqual(c.fora.length, 2); assert.strictEqual(c.semCadastro.length, 1);
  // o produto aparece nas aplicações do animal (ficha) — inclusive no de fora
  assert.ok((M.aplicacoesPorAnimal(d).get(outra.id) || []).some((a) => a.tipo === 'Brinco mosquicida'));
});

t('proprietário vê a pendência, confirma: o lote da matriz muda e o pedido fica "aprovada"', () => {
  const p = G.pendenciasLote(d);
  assert.strictEqual(p.length, 1); assert.strictEqual(p[0].para, 'Paridas'); assert.strictEqual(p[0].de, 'Solteiras');
  const r = G.decidirLote(d, [{ manejoId: p[0].manejoId, animal: p[0].animal, aprovar: true }], { now: '2026-10-21T08:00:00.000Z' });
  assert.strictEqual(r.aprovadas, 1);
  assert.strictEqual(r.mudancas.matrizes[0].lote, 'Paridas');
  const posts = L.postsDeMudancas(r.mudancas);
  assert.deepStrictEqual(posts.map((x) => x.action), ['atualizarCampos', 'upsertMatrizes']);
  d = L.aplicarMudancasNoEstado(d, r.mudancas);
  assert.strictEqual(G.pendenciasLote(d).length, 0);
  const f = G.foraDoLoteDe(d.eventos.find((e) => e.id === idFunc))[0];
  assert.strictEqual(f.mudar, 'aprovada'); assert.strictEqual(f.decididoEm, '2026-10-21');
});

t('proprietário gravando: confirma na hora as marcadas e recusa as desmarcadas', () => {
  const sols = d.matrizes.filter((m) => m.lote === 'Solteiras').slice(0, 2);
  const fora = sols.map((m) => G.animalForaDoLote(d, 'Leiteiras', m.brinco, HOJE));
  const r = G.aplicarManejoGeral(d, { data: HOJE, lote: 'Leiteiras', descricao: 'Conferência', esperados: [], marcados: [], fora, dono: true, aprovar: [sols[0].id] }, { id: 'g2' });
  assert.deepStrictEqual(r.erros, []);
  assert.deepStrictEqual(r.matrizesAlteradas.map((m) => [m.id, m.lote]), [[sols[0].id, 'Leiteiras']]);
  assert.deepStrictEqual(JSON.parse(r.eventosNovos[0].foraDoLote).map((x) => x.mudar), ['aprovada', 'recusada']);
  assert.strictEqual(G.pendenciasLote(r.estado).length, 0);
});

t('lista de manejos, relatório da conferência (PDF) e relatório do ano', () => {
  const l = G.listarManejosGerais(d, 2026);
  assert.strictEqual(l.length, 1); assert.strictEqual(l[0].lote, 'Paridas');
  const rel = G.relatorioConferencia(d, idFunc);
  assert.ok(rel.titulo.includes('20/10/26') && rel.titulo.includes('Paridas'), rel.titulo);
  assert.deepStrictEqual(rel.resumo.map((x) => x.valor), [l[0].esperados, l[0].conferidos.length, 2, 1, 1]);
  assert.ok(rel.secoes[2].linhas.some((x) => x.obs === 'Não está no banco de dados nem em nenhum lote'));
  assert.ok(rel.secoes[1].linhas.some((x) => /Matriz/.test(x.animalSit)));
  const ano = M.montarRelatorioApp('manejos', d, 2026, HOJE, { dono: false });
  assert.strictEqual(ano.secoes[0].linhas.length, 1); assert.strictEqual(ano.secoes[0].linhas[0].falt, 2);
  assert.ok(M.RELATORIOS_APP.find((x) => x.id === 'manejos').todos);
});

t('falta repetida: animal que faltou nos dois últimos manejos do lote', () => {
  const lista = G.animaisDoLote(d, loteP, { hoje: HOJE });
  const r = G.aplicarManejoGeral(d, { data: '2026-10-25', lote: loteP, descricao: 'Pour-on no lombo', esperados: lista.map((x) => x.id), marcados: lista.slice(1).map((x) => x.id) }, { id: 'g3' });
  const rep = G.faltasRepetidas(r.estado, loteP);
  assert.deepStrictEqual(rep.map((x) => x.id), [lista[0].id]);
});

// ---------------------------------------------------------------- 10.5: busca do brinco com a situação do animal
t('busca: cheia mostra a previsão de parto com data e dias; vazia mostra o último parto; baixa avisa', () => {
  const dd = base();
  const cheia = dd.matrizes.find((m) => m.status === 'Cheia' && m.lote === 'Solteiras');
  const [f] = G.buscarAnimais(dd, 'Paridas', cheia.brinco, HOJE);
  assert.strictEqual(f.tipo, 'matriz'); assert.strictEqual(f.situacao.status, 'Cheia');
  // toque de 09/05/2026 com 120 dias => concepção 09/01 => parto 21/10/2026 (285 dias): amanhã, em relação a 20/10
  assert.strictEqual(f.situacao.previsao, '2026-10-21'); assert.strictEqual(f.situacao.dias, 1);
  assert.ok(/Cheia, parto previsto para 21\/10\/26 \(em 1 dia\)/.test(f.situacao.texto), f.situacao.texto);
  assert.strictEqual(f.situacao.nivel, 'soon');
  assert.strictEqual(f.mudar, 'pendente'); assert.ok(/Não é do lote Paridas \(está em Solteiras\)/.test(f.obs));
  const [g] = G.buscarAnimais(dd, 'Paridas', cheia.brinco, '2026-10-30');
  assert.strictEqual(g.situacao.nivel, 'late'); assert.ok(/já passou há 9 dias/.test(g.situacao.texto), g.situacao.texto);

  const paridaVazia = dd.matrizes.find((m) => m.id === 'm5'); // pariu em 12/03/2026 e está Vazia no exemplo
  const [v] = G.buscarAnimais(dd, 'Paridas', paridaVazia.brinco, HOJE);
  assert.strictEqual(v.situacao.status, 'Vazia'); assert.ok(/Vazia, último parto em 12\/03\/26 \(há 222 dias\)/.test(v.situacao.texto), v.situacao.texto);
  assert.ok(v.linhas.some((l) => /^Cria ao pé: 6501/.test(l)), v.linhas.join(' | '));

  const vend = { ...cheia, status: 'Vendida' };
  const d2 = { ...dd, matrizes: dd.matrizes.map((m) => (m.id === cheia.id ? vend : m)) };
  const [w] = G.buscarAnimais(d2, 'Paridas', cheia.brinco, HOJE);
  assert.strictEqual(w.ativo, false); assert.ok(/VENDIDA/.test(w.obs)); assert.strictEqual(w.mudar, '');
});

t('busca: lista do lote traz a situação em cada linha', () => {
  const lista = G.animaisDoLote(d, loteP, { hoje: HOJE });
  assert.ok(lista.every((x) => x.linha2 && /cheia|vazia/.test(x.linha2)), lista.map((x) => x.linha2).join(' | '));
  const cheiaNaLista = lista.find((x) => /^cheia · parto /.test(x.linha2));
  assert.ok(cheiaNaLista && /\(em \d+ d\)|atrasado|hoje/.test(cheiaNaLista.linha2), cheiaNaLista && cheiaNaLista.linha2);
});

t('busca: cria (mamando), brinco que não existe, brinco repetido e touro', () => {
  const dd = base();
  const [c] = G.buscarAnimais(dd, 'Solteiras', '6501', HOJE);
  assert.strictEqual(c.tipo, 'cria'); assert.strictEqual(c.animal, 'c:n1'); assert.ok(/Mamando|Desmamado/.test(c.situacao.texto), c.situacao.texto);
  assert.ok(c.linhas.some((l) => /^Mãe: 3005/.test(l)));
  assert.deepStrictEqual(G.buscarAnimais(dd, 'Paridas', '99999', HOJE), []);
  assert.strictEqual(G.fichaSemCadastro('99999').obs, G.OBS_SEM_CADASTRO);
  // dois animais com o mesmo brinco: mostra os dois (antes dizia "Brinco não cadastrado")
  const rep = { ...dd, matrizes: [...dd.matrizes, { ...dd.matrizes[0], id: 'mdup', lote: 'Leiteiras' }] };
  const duas = G.buscarAnimais(rep, 'Paridas', dd.matrizes[0].brinco, HOJE);
  assert.strictEqual(duas.length, 2); assert.deepStrictEqual(duas.map((x) => x.animal).sort(), [dd.matrizes[0].id, 'mdup'].sort());
  // número com zero na frente casa com o brinco
  assert.strictEqual(G.buscarAnimais(dd, 'Paridas', '03001', HOJE).length, 1);
  // touro vivo com brinco
  const dt = { ...dd, touros: [...dd.touros, { id: 'tv1', nome: 'Trovão', raca: 'Nelore', tipo: 'Touro vivo', brinco: '7001', lote: 'Paridas', situacao: 'Ativo' }] };
  const [tv] = G.buscarAnimais(dt, 'Solteiras', '7001', HOJE);
  assert.strictEqual(tv.tipo, 'touro'); assert.strictEqual(tv.animal, 'tv1'.replace(/^/, 't:')); assert.ok(/Touro de outro lote \(está em Paridas\)/.test(tv.obs), tv.obs);
  assert.ok(G.animaisDoLote(dt, 'Paridas', { hoje: HOJE }).some((x) => x.id === 't:tv1' && x.tipo === 'touro'));
  assert.ok(G.buscarAnimais(dt, 'Paridas', '7001', HOJE, { esperados: new Set(['t:tv1']) })[0].naLista);
});

t('lote novo (sem nenhum animal): grava só com brincos de fora e sem cadastro, com a situação e a observação anotadas', () => {
  const dd = base();
  const cheia = dd.matrizes.find((m) => m.status === 'Cheia' && m.lote === 'Solteiras');
  const inc = [{ brinco: cheia.brinco, animal: cheia.id }, { brinco: '88888', animal: '' }, { brinco: '88888', animal: '' }];
  const res = G.resolverInclusoes(dd, 'Pasto da Grota', inc, HOJE, { esperados: new Set() });
  assert.strictEqual(res.fora.length, 3); // a duplicata é tratada na tela; aqui o resolvedor só converte
  assert.strictEqual(res.fora[0].mudar, 'pendente'); assert.ok(/Cheia, parto previsto/.test(res.fora[0].sit));
  assert.strictEqual(res.fora[1].semCadastro, true); assert.strictEqual(res.fora[1].obs, G.OBS_SEM_CADASTRO);
  assert.strictEqual(G.animaisDoLote(dd, 'Pasto da Grota', { hoje: HOJE }).length, 0);
  const r = G.aplicarManejoGeral(dd, { data: HOJE, lote: 'Pasto da Grota', descricao: 'Conferência', esperados: [], marcados: [], fora: res.fora.slice(0, 2), dono: false, aprovar: [] }, { id: 'g9' });
  assert.deepStrictEqual(r.erros, []);
  const fora = JSON.parse(r.eventosNovos[0].foraDoLote);
  assert.strictEqual(fora[0].mudar, 'pendente'); assert.ok(fora[0].sit); assert.strictEqual(fora[1].semCadastro, true);
  assert.strictEqual(r.eventosNovos[0].presentes, cheia.id); // o sem cadastro não tem id: fica só no foraDoLote
  const c = G.conferencia(r.estado, r.eventosNovos[0]);
  assert.strictEqual(c.esperados, 0); assert.strictEqual(c.fora.length, 2); assert.strictEqual(c.semCadastro.length, 1);
  const rel = G.relatorioConferencia(r.estado, 'g9');
  assert.deepStrictEqual(rel.resumo.map((x) => x.valor), [0, 0, 0, 1, 1]);
});

t('lote muda depois de incluir: animal que passa a ser do lote vira marcado, não "de fora"', () => {
  const dd = base();
  const sol = dd.matrizes.find((m) => m.lote === 'Solteiras');
  const inc = [{ brinco: sol.brinco, animal: sol.id }];
  const emParidas = G.resolverInclusoes(dd, 'Paridas', inc, HOJE, { esperados: new Set() });
  assert.strictEqual(emParidas.fora.length, 1);
  const emSolteiras = G.resolverInclusoes(dd, 'Solteiras', inc, HOJE, { esperados: new Set(G.animaisDoLote(dd, 'Solteiras', { hoje: HOJE }).map((x) => x.id)) });
  assert.strictEqual(emSolteiras.fora.length, 0); assert.deepStrictEqual(emSolteiras.marcadosExtra, [sol.id]);
});

t('busca: brinco com letra e barra ("E5", "219/1413") acha mesmo digitado em minúscula', () => {
  const dd = base();
  const m1 = { ...dd.matrizes[5], id: 'mE5', brinco: 'E5', lote: 'Leiteiras' }; const m2 = { ...dd.matrizes[6], id: 'mB', brinco: '219/1413', lote: 'Leiteiras' };
  const d3 = { ...dd, matrizes: [...dd.matrizes, m1, m2] };
  assert.deepStrictEqual(G.buscarAnimais(d3, 'Paridas', 'e5', HOJE).map((x) => x.animal), ['mE5']);
  assert.deepStrictEqual(G.buscarAnimais(d3, 'Paridas', '219/1413', HOJE).map((x) => x.animal), ['mB']);
  assert.strictEqual(G.buscarAnimais(d3, 'Paridas', '219', HOJE).length, 0);
  assert.strictEqual(G.buscarAnimais(d3, 'Paridas', 'E5', HOJE)[0].mudar, 'pendente');
});


// ------------------------------------------------------------------ observação por brinco (app 10.6)
const montarComNotas = () => {
  const dd = base();
  const doLote = G.animaisDoLote(dd, 'Paridas', { hoje: HOJE });
  const [a, b, c] = doLote; // a: marcada com nota, b: marcada sem nota, c: NÃO marcada com nota
  const outra = dd.matrizes.find((m) => m.lote === 'Solteiras');
  const fOutra = G.itemFora(G.buscarAnimais(dd, 'Paridas', outra.brinco, HOJE)[0]);
  const fSem = G.itemFora(G.fichaSemCadastro('77777'));
  const r = G.aplicarManejoGeral(dd, {
    data: HOJE, lote: 'Paridas', descricao: 'Pour-on', esperados: doLote.map((x) => x.id), marcados: [a.id, b.id], fora: [fOutra, fSem], dono: false, aprovar: [],
    notas: { [a.id]: '  cadastrar a cria dela  ', [c.id]: 'não veio, procurar', [outra.id]: 'trocar para o lote Paridas', 'b:77777': 'brinco perdido, cadastrar', [b.id]: '   ' },
  }, { id: 'ng1' });
  return { dd, doLote, a, b, c, outra, r };
};

t('observação por brinco: grava junto no manejo (do lote, de fora, sem cadastro) sem contar como "de fora"', () => {
  const { r, a, b, c, outra, doLote } = montarComNotas();
  assert.deepStrictEqual(r.erros, []);
  const e = r.eventosNovos[0]; const lista = JSON.parse(e.foraDoLote);
  assert.strictEqual(lista.length, 4); // 2 de fora + 2 do lote com nota (a e c); b tinha nota em branco
  const por = (f) => lista.find((x) => (f.animal ? x.animal === f.animal : x.brinco === f.brinco));
  assert.strictEqual(por({ animal: a.id }).nota, 'cadastrar a cria dela'); assert.strictEqual(por({ animal: a.id }).doLote, true);
  assert.strictEqual(por({ animal: c.id }).nota, 'não veio, procurar');
  assert.strictEqual(por({ animal: outra.id }).nota, 'trocar para o lote Paridas'); assert.strictEqual(por({ animal: outra.id }).mudar, 'pendente');
  assert.strictEqual(por({ brinco: '77777' }).nota, 'brinco perdido, cadastrar'); assert.strictEqual(por({ brinco: '77777' }).semCadastro, true);
  assert.ok(!lista.some((x) => x.animal === b.id), 'nota em branco não grava nada');
  // quem passou e quem faltou não muda por causa da nota
  assert.ok(e.presentes.split(',').includes(a.id) && !e.presentes.split(',').includes(c.id));
  assert.ok(e.ausentes.split(',').includes(c.id));
  const cf = G.conferencia(r.estado, e);
  assert.strictEqual(cf.fora.length, 2); assert.strictEqual(cf.semCadastro.length, 1); assert.strictEqual(cf.notas.length, 4);
  assert.strictEqual(cf.esperados, doLote.length); assert.strictEqual(cf.faltando.length, doLote.length - 2);
  assert.strictEqual(cf.conferidos.length, 2);
  // a mudança de lote pendente continua só com o item de fora
  assert.deepStrictEqual(G.pendenciasLote(r.estado).map((p) => p.animal), [outra.id]);
});

t('observação por brinco: lista para o proprietário efetivar, marca como feita e desfaz', () => {
  const { r } = montarComNotas();
  const est = r.estado;
  const pend = G.pendenciasNotas(est);
  assert.strictEqual(pend.length, 4);
  const sem = pend.find((p) => p.brinco === '77777'); assert.strictEqual(sem.semCadastro, true); assert.strictEqual(sem.nota, 'brinco perdido, cadastrar');
  const doLoteNota = pend.find((p) => p.nota === 'cadastrar a cria dela'); assert.strictEqual(doLoteNota.semCadastro, false); assert.ok(doLoteNota.sit, 'traz a situação do animal no dia');
  // efetiva duas
  const ef = G.efetivarNotas(est, [sem, doLoteNota].map((p) => ({ manejoId: p.manejoId, idx: p.idx, feito: true })), { now: '2026-11-02T10:00:00Z' });
  assert.strictEqual(ef.n, 2); assert.strictEqual(ef.mudancas.eventos.length, 1); assert.deepStrictEqual(ef.mudancas.matrizes, []);
  const est2 = { ...est, eventos: est.eventos.map((e) => (e.id === 'ng1' ? { ...e, foraDoLote: ef.mudancas.eventos[0].campos.foraDoLote } : e)) };
  assert.strictEqual(G.pendenciasNotas(est2).length, 2);
  const lista2 = JSON.parse(est2.eventos.find((e) => e.id === 'ng1').foraDoLote);
  assert.strictEqual(lista2.find((x) => x.brinco === '77777').notaOk, '2026-11-02');
  assert.strictEqual(lista2.find((x) => x.brinco === '77777').nota, 'brinco perdido, cadastrar', 'a nota continua guardada');
  // nada mais mudou (mudança de lote pendente, sem cadastro...)
  assert.strictEqual(G.pendenciasLote(est2).length, 1);
  // desfazer
  const des = G.efetivarNotas(est2, [{ manejoId: 'ng1', idx: sem.idx, feito: false }]);
  const est3 = { ...est2, eventos: est2.eventos.map((e) => (e.id === 'ng1' ? { ...e, foraDoLote: des.mudancas.eventos[0].campos.foraDoLote } : e)) };
  assert.strictEqual(G.pendenciasNotas(est3).length, 3);
  assert.ok(!JSON.parse(est3.eventos.find((e) => e.id === 'ng1').foraDoLote).find((x) => x.brinco === '77777').notaOk);
  // manejo que não existe / decisão sem nota: não inventa nada
  assert.strictEqual(G.efetivarNotas(est, [{ manejoId: 'nao-existe', idx: 0, feito: true }]).mudancas.eventos.length, 0);
  assert.strictEqual(G.efetivarNotas(est, [{ manejoId: 'ng1', idx: 99, feito: true }]).n, 0);
});

t('observação por brinco: relatório da conferência traz a seção com a situação e se já foi efetivada', () => {
  const { r } = montarComNotas();
  let rel = G.relatorioConferencia(r.estado, 'ng1');
  const sec = rel.secoes.find((s) => s.titulo === 'Observações por brinco');
  assert.ok(sec); assert.strictEqual(sec.linhas.length, 4);
  assert.ok(sec.linhas.every((l) => l.efet === 'pendente'));
  assert.strictEqual(sec.linhas.find((l) => l.brinco === '77777').animalSit, 'Sem cadastro');
  assert.strictEqual(rel.resumo.find((k) => k.rotulo === 'Observações').valor, 4);
  const ef = G.efetivarNotas(r.estado, [{ manejoId: 'ng1', idx: G.pendenciasNotas(r.estado).find((p) => p.brinco === '77777').idx, feito: true }], { now: '2026-11-02T10:00:00Z' });
  const est2 = { ...r.estado, eventos: r.estado.eventos.map((e) => (e.id === 'ng1' ? { ...e, foraDoLote: ef.mudancas.eventos[0].campos.foraDoLote } : e)) };
  rel = G.relatorioConferencia(est2, 'ng1');
  assert.strictEqual(rel.secoes.find((s) => s.titulo === 'Observações por brinco').linhas.find((l) => l.brinco === '77777').efet, 'sim, 02/11/26');
  // sem nenhuma nota o relatório não ganha KPI nem linhas
  const semNota = G.aplicarManejoGeral(base(), { data: HOJE, lote: 'Paridas', descricao: 'x', esperados: ['a'], marcados: ['a'], fora: [] }, { id: 'ng2' });
  assert.deepStrictEqual(semNota.erros, []);
  const rel2 = G.relatorioConferencia(semNota.estado, 'ng2');
  assert.ok(!rel2.resumo.some((k) => k.rotulo === 'Observações')); assert.strictEqual(rel2.secoes.find((s) => s.titulo === 'Observações por brinco').linhas.length, 0);
});

t('observação por brinco: chave é o id do animal, ou "b:<brinco>" quando não tem cadastro', () => {
  assert.strictEqual(G.chaveNota({ animal: 'm1', brinco: '10' }), 'm1');
  assert.strictEqual(G.chaveNota({ animal: '', brinco: ' E5 ' }), 'b:E5');
  assert.strictEqual(G.chaveNota({ brinco: 99 }), 'b:99');
});

t('observação por brinco: manejos antigos (sem nota) seguem iguais', () => {
  const e = { id: 'v1', tipo: 'manejo', etapa: 'Geral', data: HOJE, lote: 'Paridas', descricao: 'Antigo', presentes: 'x', ausentes: '', foraDoLote: JSON.stringify([{ animal: '', brinco: '5', tipo: '', obs: 'Não está no banco de dados nem em nenhum lote', mudar: '' }]) };
  const est = { ...base(), eventos: [e] };
  assert.strictEqual(G.pendenciasNotas(est).length, 0);
  const c = G.conferencia(est, e); assert.strictEqual(c.fora.length, 1); assert.strictEqual(c.notas.length, 0);
});


// ------------------------------------------------------------------ editar e excluir manejo já gravado (app 10.7)
// Monta o que a tela monta ao salvar a edição (mesma ordem de ManejoGeral.jsx)
const formDaEdicao = (est, id, ajustar) => {
  const e = est.eventos.find((x) => x.id === id); const f = G.formDoManejo(est, e);
  if (ajustar) ajustar(f);
  const lote = f.lote;
  const itens = G.animaisDoLote(est, lote, { hoje: HOJE, incluirCrias: f.incluirCrias, extras: G.idsDoManejo(e) });
  const esperados = new Set(itens.map((x) => x.id));
  const incl = G.resolverInclusoes(est, lote, f.incluidos, HOJE, { esperados });
  const marcados = [...new Set([...f.marcados.filter((x) => esperados.has(x)), ...incl.marcadosExtra])];
  return { f, itens, form: { data: f.data, lote, descricao: f.descricao, responsavel: f.responsavel, aplicacoes: f.aplicacoes, esperados: itens.map((x) => x.id), marcados, fora: incl.fora, observacoes: f.obs, incluirCrias: f.incluirCrias, aprovar: f.aprovar, notas: f.notas } };
};
const manejoParaEditar = () => {
  const dd = base();
  const doLote = G.animaisDoLote(dd, 'Paridas', { hoje: HOJE });
  const [a, b, c] = doLote;
  const sols = dd.matrizes.filter((m) => m.lote === 'Solteiras').slice(0, 2);
  const fora = sols.map((m) => G.itemFora(G.buscarAnimais(dd, 'Paridas', m.brinco, HOJE)[0])).concat([G.itemFora(G.fichaSemCadastro('77777'))]);
  const r = G.aplicarManejoGeral(dd, {
    data: HOJE, lote: 'Paridas', descricao: 'Pour-on', responsavel: 'João', aplicacoes: [{ tipo: 'Pour-on', produto: 'Maximo' }], esperados: doLote.map((x) => x.id), marcados: [a.id, b.id], fora, dono: false, aprovar: [],
    notas: { [a.id]: 'cadastrar a cria', [sols[0].id]: 'trocar de lote', 'b:77777': 'brinco perdido' },
  }, { id: 'ed1', now: '2026-10-20T10:00:00Z' });
  // proprietário já efetivou a nota do brinco 77777
  const ef = G.efetivarNotas(r.estado, [{ manejoId: 'ed1', idx: G.pendenciasNotas(r.estado).find((p) => p.brinco === '77777').idx, feito: true }], { now: '2026-10-25T10:00:00Z' });
  const est = G.aplicarMudancas ? null : { ...r.estado, eventos: r.estado.eventos.map((e) => (e.id === 'ed1' ? { ...e, foraDoLote: ef.mudancas.eventos[0].campos.foraDoLote } : e)) };
  return { dd, est, doLote, a, b, c, sols };
};

t('editar: abrir e salvar sem mexer em nada diz "Nada foi alterado" (mesmo com a ordem dos campos diferente)', () => {
  const { est } = manejoParaEditar();
  const { form } = formDaEdicao(est, 'ed1');
  const r = G.editarManejoGeral(est, 'ed1', form, { now: '2026-11-01T10:00:00Z', dono: true });
  assert.deepStrictEqual(r.erros, ['Nada foi alterado.']);
});

t('editar: muda texto, desmarca um, marca outro, tira o sem cadastro e troca uma observação; mantém id, data de criação, pedido de lote pendente e nota já efetivada', () => {
  const { est, a, b, c, sols } = manejoParaEditar();
  const { form, f } = formDaEdicao(est, 'ed1', (f2) => {
    f2.descricao = 'Pour-on e vermífugo'; f2.marcados = f2.marcados.filter((x) => x !== b.id).concat([c.id]);
    f2.incluidos = f2.incluidos.filter((i) => i.brinco !== '77777'); delete f2.notas['b:77777'];
    f2.notas[a.id] = 'cadastrar a cria, tem bezerro sem brinco'; f2.notas[c.id] = 'não tem brinco auricular';
  });
  const r = G.editarManejoGeral(est, 'ed1', form, { now: '2026-11-01T10:00:00Z', dono: true });
  assert.deepStrictEqual(r.erros, []);
  const ev = r.evento;
  assert.strictEqual(ev.id, 'ed1'); assert.strictEqual(ev.createdAt, '2026-10-20T10:00:00Z'); assert.strictEqual(ev.etapa, 'Geral'); assert.strictEqual(ev.descricao, 'Pour-on e vermífugo');
  assert.ok(r.mudou.includes('descricao') && r.mudou.includes('presentes') && r.mudou.includes('foraDoLote') && r.mudou.includes('ausentes'));
  assert.ok(!r.mudou.includes('data') && !r.mudou.includes('lote') && !r.mudou.includes('responsavel'));
  assert.ok(ev.presentes.split(',').includes(c.id) && !ev.presentes.split(',').includes(b.id) && ev.ausentes.split(',').includes(b.id));
  const lista2 = JSON.parse(ev.foraDoLote);
  assert.ok(!lista2.some((x) => x.brinco === '77777'), 'sem cadastro saiu');
  assert.strictEqual(lista2.find((x) => x.animal === sols[0].id).mudar, 'pendente', 'pedido de lote continua pendente');
  assert.strictEqual(lista2.find((x) => x.animal === sols[0].id).nota, 'trocar de lote');
  assert.strictEqual(lista2.find((x) => x.animal === a.id).nota, 'cadastrar a cria, tem bezerro sem brinco'); assert.ok(!lista2.find((x) => x.animal === a.id).notaOk);
  assert.strictEqual(lista2.find((x) => x.animal === c.id).nota, 'não tem brinco auricular');
  assert.deepStrictEqual(r.mudancas.matrizes, []); assert.strictEqual(r.mudancas.eventos.length, 1);
  assert.deepStrictEqual(Object.keys(r.mudancas.eventos[0].campos).sort(), r.mudou.slice().sort());
  assert.strictEqual(r.estado.matrizes.find((m) => m.id === sols[0].id).lote, 'Solteiras');
  assert.strictEqual(r.estado.eventos.filter((x) => x.id === 'ed1').length, 1);
  // a nota que já estava efetivada continua efetivada quando o texto não muda
  const { form: form2 } = formDaEdicao(est, 'ed1', (f3) => { f3.descricao = 'Outro texto'; });
  const r2 = G.editarManejoGeral(est, 'ed1', form2, { dono: true });
  assert.strictEqual(JSON.parse(r2.evento.foraDoLote).find((x) => x.brinco === '77777').notaOk, '2026-10-25');
  // trocar o texto da nota efetivada volta para "pendente"
  const { form: form3 } = formDaEdicao(est, 'ed1', (f3) => { f3.notas['b:77777'] = 'brinco perdido, achei a vaca'; });
  const r3 = G.editarManejoGeral(est, 'ed1', form3, { dono: true });
  assert.ok(!JSON.parse(r3.evento.foraDoLote).find((x) => x.brinco === '77777').notaOk);
});

t('editar: proprietário aprova na edição um pedido que estava pendente; pedido já aprovado antes não mexe de novo no lote', () => {
  const { est, sols } = manejoParaEditar();
  const { form } = formDaEdicao(est, 'ed1', (f2) => { f2.aprovar = [sols[0].id]; });
  const r = G.editarManejoGeral(est, 'ed1', form, { now: '2026-11-01T10:00:00Z', dono: true });
  assert.deepStrictEqual(r.erros, []);
  assert.deepStrictEqual(r.mudancas.matrizes.map((m) => [m.id, m.lote]), [[sols[0].id, 'Paridas']]);
  const it = JSON.parse(r.evento.foraDoLote).find((x) => x.animal === sols[0].id); assert.strictEqual(it.mudar, 'aprovada'); assert.strictEqual(it.decididoEm, '2026-11-01');
  // depois a matriz foi para outro lote; editar o texto do manejo não traz ela de volta
  const est2 = { ...r.estado, matrizes: r.estado.matrizes.map((m) => (m.id === sols[0].id ? { ...m, lote: 'Leiteiras' } : m)) };
  const { form: form2 } = formDaEdicao(est2, 'ed1', (f3) => { f3.descricao = 'Texto novo'; });
  const r2 = G.editarManejoGeral(est2, 'ed1', form2, { dono: true });
  assert.deepStrictEqual(r2.erros, []); assert.deepStrictEqual(r2.mudancas.matrizes, []);
  assert.strictEqual(JSON.parse(r2.evento.foraDoLote).find((x) => x.animal === sols[0].id).mudar, 'aprovada');
});

t('editar: acrescenta brincos novos (de outro lote e sem cadastro) e muda o lote do manejo; quem foi anotado e hoje saiu do lote continua na lista', () => {
  const { est, a, sols, dd } = manejoParaEditar();
  // a matriz "a" foi vendida depois do manejo: continua na lista da edição
  const est2 = { ...est, matrizes: est.matrizes.map((m) => (m.id === a.id ? { ...m, lote: 'Leiteiras' } : m)) };
  const itens = G.animaisDoLote(est2, 'Paridas', { hoje: HOJE, extras: G.idsDoManejo(est2.eventos.find((x) => x.id === 'ed1')) });
  assert.ok(itens.some((x) => x.id === a.id), 'a continua listada'); assert.ok(/anotado neste manejo/.test(itens.find((x) => x.id === a.id).linha2));
  const { form } = formDaEdicao(est2, 'ed1', (f2) => { f2.incluidos = f2.incluidos.concat([{ brinco: '88888', animal: '' }]); f2.notas['b:88888'] = 'achado no curral'; });
  const r = G.editarManejoGeral(est2, 'ed1', form, { dono: true });
  assert.deepStrictEqual(r.erros, []);
  assert.ok(r.evento.presentes.split(',').includes(a.id), 'continua presente');
  assert.strictEqual(JSON.parse(r.evento.foraDoLote).find((x) => x.brinco === '88888').semCadastro, true);
  // trocar o lote: a lista passa a ser a do lote novo
  const outro = G.animaisDoLote(est2, 'Leiteiras', { hoje: HOJE });
  const rl = G.editarManejoGeral(est2, 'ed1', { ...form, lote: 'Leiteiras', esperados: outro.map((x) => x.id), marcados: [outro[0].id], fora: [] }, { dono: true });
  assert.deepStrictEqual(rl.erros, []); assert.strictEqual(rl.evento.lote, 'Leiteiras'); assert.ok(rl.mudou.includes('lote'));
  // validações: sem nenhum animal, não salva; manejo que não existe ou não é geral
  assert.ok(G.editarManejoGeral(est2, 'ed1', { ...form, marcados: [], fora: [] }, { dono: true }).erros.length > 0);
  assert.deepStrictEqual(G.editarManejoGeral(est2, 'nao-existe', form, { dono: true }).erros, ['Não achei esse manejo.']);
});

t('funcionário reabre o manejo: inclui mais brincos e observações e corrige observações gravadas, mas não muda o cabeçalho nem tira nada do que já foi gravado', () => {
  const { est, a, b, c, sols } = manejoParaEditar();
  const { form } = formDaEdicao(est, 'ed1', (f2) => {
    f2.marcados = f2.marcados.concat([c.id]); // marca mais um animal do lote
    f2.incluidos = f2.incluidos.concat([{ brinco: '55555', animal: '' }]); f2.notas['b:55555'] = 'outro brinco do curral';
    f2.notas[a.id] = 'cadastrar a cria (corrigido)'; f2.notas['b:77777'] = 'brinco perdido, mais um dado';
    f2.notas[c.id] = 'sem brinco auricular';
  });
  // tenta, por baixo dos panos, mexer no que não pode: mudar descrição, desmarcar, tirar brinco gravado, aprovar lote
  const sujo = { ...form, descricao: 'Mudei', lote: 'Leiteiras', data: '2020-01-01', marcados: form.marcados.filter((x) => x !== b.id), fora: form.fora.filter((x) => x.brinco !== '77777' && x.brinco !== sols[1].brinco), aprovar: [sols[0].id] };
  const r = G.editarManejoGeral(est, 'ed1', sujo, { now: '2026-11-01T10:00:00Z', dono: false });
  assert.deepStrictEqual(r.erros, []);
  const ev = r.evento; const antes = est.eventos.find((x) => x.id === 'ed1');
  assert.strictEqual(ev.descricao, 'Pour-on'); assert.strictEqual(ev.lote, 'Paridas'); assert.strictEqual(ev.data, antes.data); assert.strictEqual(ev.responsavel, 'João');
  assert.ok(ev.presentes.split(',').includes(b.id), 'quem já tinha passado continua'); assert.ok(ev.presentes.split(',').includes(c.id), 'o novo entrou');
  const lista2 = JSON.parse(ev.foraDoLote);
  assert.strictEqual(lista2.find((x) => x.brinco === '55555').semCadastro, true); assert.strictEqual(lista2.find((x) => x.brinco === '55555').nota, 'outro brinco do curral');
  assert.ok(lista2.some((x) => x.brinco === '77777'), 'brinco gravado não sai'); assert.ok(lista2.some((x) => x.animal === sols[1].id), 'brinco de fora gravado não sai');
  assert.strictEqual(lista2.find((x) => x.animal === sols[0].id).mudar, 'pendente', 'funcionário não decide mudança de lote');
  assert.strictEqual(r.mudancas.matrizes.length, 0);
  assert.strictEqual(lista2.find((x) => x.animal === a.id).nota, 'cadastrar a cria (corrigido)');
  const sc = lista2.find((x) => x.brinco === '77777'); assert.strictEqual(sc.nota, 'brinco perdido, mais um dado'); assert.ok(!sc.notaOk, 'nota mudou: volta para o proprietário efetivar');
  assert.deepStrictEqual(r.mudou.filter((k) => ['data', 'lote', 'descricao', 'responsavel', 'aplicacoes', 'observacoes', 'manejoRef'].includes(k)), []);
  // sem nenhuma novidade, "Nada foi alterado"
  const { form: igual } = formDaEdicao(est, 'ed1');
  assert.deepStrictEqual(G.editarManejoGeral(est, 'ed1', igual, { dono: false }).erros, ['Nada foi alterado.']);
  // funcionário apaga uma observação: sai só a observação
  const { form: semNota } = formDaEdicao(est, 'ed1', (f2) => { delete f2.notas[a.id]; });
  const r2 = G.editarManejoGeral(est, 'ed1', semNota, { dono: false });
  assert.ok(!JSON.parse(r2.evento.foraDoLote).some((x) => x.animal === a.id));
  assert.ok(r2.evento.presentes.split(',').includes(a.id));
});

t('excluir: tira o manejo, avisa o que se perde e gera a ação excluirEventos; manejo que não é geral não sai', () => {
  const { est, sols } = manejoParaEditar();
  const res = G.resumoExclusao(est, 'ed1');
  assert.strictEqual(res.pendentes, 2); assert.strictEqual(res.aprovadas, 0); assert.strictEqual(res.notasPendentes, 2); assert.strictEqual(res.lote, 'Paridas');
  const r = G.excluirManejoGeral(est, 'ed1');
  assert.ok(!r.estado.eventos.some((x) => x.id === 'ed1')); assert.deepStrictEqual(r.mudancas.excluir, [{ tipo: 'manejo', id: 'ed1' }]);
  assert.deepStrictEqual(L.postsDeMudancas(r.mudancas), [{ action: 'excluirEventos', tipo: 'manejo', ids: ['ed1'] }]);
  const novo = L.aplicarMudancasNoEstado(est, r.mudancas);
  assert.ok(!novo.eventos.some((x) => x.id === 'ed1')); assert.strictEqual(novo.eventos.length, est.eventos.length - 1); assert.strictEqual(novo.matrizes.length, est.matrizes.length);
  assert.strictEqual(G.pendenciasLote(novo).length, 0); assert.strictEqual(G.pendenciasNotas(novo).length, 0); assert.strictEqual(G.listarManejosGerais(novo).length, 0);
  assert.strictEqual(novo.matrizes.find((m) => m.id === sols[0].id).lote, 'Solteiras');
  assert.strictEqual(G.excluirManejoGeral(est, 'nao-existe').erro, 'Não achei esse manejo.');
  const prot = { id: 'pr1', tipo: 'manejo', etapa: 'D0', data: HOJE, presentes: 'm1' };
  assert.strictEqual(G.excluirManejoGeral({ ...est, eventos: [...est.eventos, prot] }, 'pr1').erro, 'Não achei esse manejo.');
  // mudanças só de edição continuam gerando só atualizarCampos
  assert.deepStrictEqual(L.postsDeMudancas({ eventos: [{ tipo: 'manejo', id: 'x', campos: { descricao: 'a' } }], matrizes: [] }).map((p) => p.action), ['atualizarCampos']);
});

t('excluir: avisa quantas mudanças de lote já confirmadas não voltam', () => {
  const { est, sols } = manejoParaEditar();
  const { form } = formDaEdicao(est, 'ed1', (f2) => { f2.aprovar = [sols[0].id]; });
  const r = G.editarManejoGeral(est, 'ed1', form, { now: '2026-11-01T10:00:00Z', dono: true });
  const res = G.resumoExclusao(r.estado, 'ed1');
  assert.strictEqual(res.aprovadas, 1); assert.strictEqual(res.pendentes, 1);
});

console.log(`manejo geral: ${ok} ok`);
