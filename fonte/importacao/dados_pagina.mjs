import fs from 'fs';
const R = '/home/claude/gest-o-de-pecu-ria/fonte/src/';
const L = await import(R + 'logica.js'); const M = await import(R + 'manejo.js');
const S = '/tmp/claude-0/-home-claude/4f53c2e6-6a68-5889-8da9-bf6cc363c86f/scratchpad/';
const bruto = JSON.parse(fs.readFileSync(S + 'planilha/getall.json'));
const hist = JSON.parse(fs.readFileSync(S + 'import/historico.json'));
const pes = JSON.parse(fs.readFileSync(S + 'import/pesagem_1010.json'));
const mjs = JSON.parse(fs.readFileSync(S + 'import/manejos_1010.json'));
const conf = JSON.parse(fs.readFileSync(S + 'import/conferencia.json'));
const est = M.normalizarTudo({ ...bruto, eventos: [...bruto.eventos, ...hist, ...pes, ...mjs] });
const brincos = L.mapaBrincos(est.matrizes);
const crias = L.listarCrias(est, '2026-10-22');
const porId = new Map(crias.map((c) => [c.id, c]));
const nasc = hist.map((e) => { const h = L.situacaoHistorica(e); const c = porId.get(e.id); return {
  b: e.brincoBezerro || '(sem nº)', d: e.data, s: e.sexo === 'Macho' ? 'M' : 'F', mae: e.matrizId ? brincos[e.matrizId] : (h.maeFora || ''), maeApp: !!e.matrizId,
  sit: h.sit, quando: h.data, pai: e.touroOutro || '', obs: e.observacoes.split(' · ').slice(2).filter((x) => !/^raça/.test(x) && !/^mãe /.test(x)).join(' · '), raca: (/raça (\S+)/.exec(e.observacoes) || [])[1] || '' }; });
const pesag = pes.map((e) => { const c = porId.get(e.criaId); return { b: e.brinco || 'SB', kg: e.peso, sb: !e.criaId, sinal: e.criaId ? '' : e.observacoes.replace(/^SEM BRINCO:?\s*/, ''), nasc: c ? c.nascData : '', mae: c ? c.maeBrinco : '', obs: e.criaId ? (e.observacoes || '').replace(/ ?· ?folha Bezerros 10.10.2026|folha Bezerros 10.10.2026/, '') : '', gmd: c ? +((e.peso - 30) / L.diasEntre(c.nascData, '2026-10-10')).toFixed(2) : null, idade: c ? (L.idadeMesesDias(c.nascData, '2026-10-10') || {}).texto : '' }; });
const man = mjs.map((m) => ({ desc: m.descricao, aps: JSON.parse(m.aplicacoes).map((a) => [a.tipo, a.produto].filter(Boolean).join(' ')).join(' + '), n: m.presentes.split(',').length,
  animais: m.presentes.split(',').map((id) => id.startsWith('c:') ? (porId.get(id.slice(2)) || {}).brinco : brincos[id]).sort((a, b) => String(a).localeCompare(String(b), 'pt-BR', { numeric: true })) }));
const cows = conf.cow.map((b) => { const m = est.matrizes.find((x) => String(x.brinco) === b); return { b, cat: m.categoria, lote: m.lote, status: m.status, dn: m.dataNascimento, partos: est.eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === m.id).map((e) => e.data).sort() }; });
const p19 = est.eventos.filter((e) => e.tipo === 'pesagem' && e.data === '2026-10-19').map((e) => ({ b: String(e.brinco), kg: e.peso, kg1010: (pes.find((x) => x.criaId === e.criaId) || {}).peso || null, nasc: (porId.get(e.criaId) || {}).nascData }));
fs.writeFileSync(S + 'import/pagina_dados.json', JSON.stringify({ nasc, pesag, man, cows, p19, conf: { machoNovilha: conf.macho_no_cadastro_de_matrizes.map((r) => ({ b: r.cria, d: r.iso, cat: r.categoria, lote: r.lote, mae: r.vaca })), duvida: conf.duvida_5_ou_6.map((r) => ({ b: r.cria, d: r.iso, mae: r.vaca })), maeEstranha: conf.mae_estranha.map((r) => ({ b: r.cria, d: r.iso, mae: r.vaca, s: r.sexo })), rep: conf.numero_repetido_planilha.map((r) => ({ b: r.cria, d: r.iso, mae: r.vaca })), semData: conf.matriz_sem_data_ligada.map((r) => ({ b: r.cria, d: r.iso, cat: r.categoria })) } }));
console.log('ok', nasc.length, pesag.length, man.length, cows.length, p19.length);
