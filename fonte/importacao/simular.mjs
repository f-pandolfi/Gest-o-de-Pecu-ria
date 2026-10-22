// Simulação: dados reais da planilha + importação do histórico, rodando as regras do app.
import fs from 'fs';
const R = '/home/claude/gest-o-de-pecu-ria/fonte/src/';
const L = await import(R + 'logica.js'); const M = await import(R + 'manejo.js');
const S = '/tmp/claude-0/-home-claude/4f53c2e6-6a68-5889-8da9-bf6cc363c86f/scratchpad/';
const bruto = JSON.parse(fs.readFileSync(S + 'planilha/getall.json'));
const hist = JSON.parse(fs.readFileSync(S + 'import/historico.json'));
const HOJE = '2026-10-22';
const antes = M.normalizarTudo(bruto);
const depois = M.normalizarTudo({ ...bruto, eventos: [...bruto.eventos, ...hist] });
const cont = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const ca = L.listarCrias(antes, HOJE), cd = L.listarCrias(depois, HOJE);
console.log('crias antes', ca.length, cont(ca, (c) => c.situacao));
console.log('crias depois', cd.length, cont(cd, (c) => c.situacao));
// crias de 2026 não podem mudar
const muda = ca.filter((c) => { const d = cd.find((x) => x.id === c.id); return JSON.stringify([c.situacao, c.pesoAtual, c.maeBrinco, c.brinco]) !== JSON.stringify([d.situacao, d.pesoAtual, d.maeBrinco, d.brinco]); });
console.log('crias de 2026 que mudaram:', muda.map((c) => c.brinco));
// acharAnimal: matrizes continuam sendo achadas como matriz
const errados = depois.matrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta').filter((m) => { const a = L.acharAnimal(depois, m.brinco); return !a || a.tipo !== 'matriz' || a.matriz.id !== m.id; });
console.log('matrizes que o brinco não acha mais como matriz:', errados.map((m) => m.brinco));
const crias2026 = ca.filter((c) => c.brinco).filter((c) => { const a = L.acharAnimal(depois, c.brinco); return !a || (a.nasc && a.nasc.id) !== c.id; });
console.log('crias 2026 que o brinco não acha mais:', crias2026.map((c) => c.brinco));
// vacinas
const pa = M.pendenciasVacinas(antes, antes.config, HOJE), pd = M.pendenciasVacinas(depois, depois.config, HOJE);
console.log('pendências de vacina antes/depois', pa.length, pd.length, cont(pa, (p) => p.regra.id), cont(pd, (p) => p.regra.id));
// partos por vaca e último parto
const vivas = depois.matrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta');
const comParto = (est) => vivas.filter((m) => L.ultimoPartoDe(m.id, est.eventos)).length;
console.log('matrizes com parto antes/depois', comParto(antes), comParto(depois));
const ex = ['2020', '3005', '4049', '1001', '22158'].map((b) => { const m = depois.matrizes.find((x) => String(x.brinco) === b); if (!m) return b + ' -'; const ps = depois.eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === m.id).map((e) => `${e.data} ${e.brincoBezerro}`).sort(); return `${b}: ${ps.join(', ')}`; });
console.log(ex.join('\n'));
// parto e previsão (aba Parto) — previsões de cheias não podem mudar
const prev = (est) => vivas.filter((m) => m.status === 'Cheia').map((m) => [m.brinco, (L.previsaoPartoInfo(m.id, est.eventos) || {}).data]);
console.log('previsões de parto diferentes:', prev(antes).filter((p, i) => p[1] !== prev(depois)[i][1]));
// relatórios por ano funcionam
for (const id of ['crias-sexo', 'nascimentos', 'melhores', 'situacao2', 'vazias']) for (const ano of [2023, 2024, 2025, 2026]) { try { const r = M.montarRelatorioApp(id, depois, ano, HOJE, { dono: true }); if (ano === 2025) console.log('rel', id, ano, JSON.stringify(r.resumo).slice(0, 180)); } catch (e) { console.log('ERRO rel', id, ano, e.message); } }
// nascimentos "faltando dados"
const { faltaNoNascimento } = { faltaNoNascimento: (e) => [!e.matrizId && !(L.situacaoHistorica(e) || {}).maeFora && 'mãe', !e.sexo && 'sexo', !String(e.brincoBezerro ?? '').trim() && 'brinco'].filter(Boolean) };
console.log('nascimentos faltando dados antes/depois', antes.eventos.filter((e) => e.tipo === 'nascimento' && faltaNoNascimento(e).length).length, depois.eventos.filter((e) => e.tipo === 'nascimento' && faltaNoNascimento(e).length).map((e) => e.brincoBezerro || e.id));
// para vender (machos)
console.log('machos à venda (Para vender):', L.listarCrias(depois, HOJE).filter((c) => c.sexo === 'Macho' && (c.situacao === 'mamando' || c.situacao === 'desmamado')).length, 'antes', ca.filter((c) => c.sexo === 'Macho' && (c.situacao === 'mamando' || c.situacao === 'desmamado')).length);
console.log('ficha 4626:', JSON.stringify(L.fichaAnimal(depois, '4626', HOJE)).slice(0, 300));
console.log('ficha 3005:', JSON.stringify((({ achado, origem, categoria, nascData, maeBrinco }) => ({ achado, origem, categoria, nascData, maeBrinco }))(L.fichaAnimal(depois, '3005', HOJE))));
console.log('ficha 4049:', JSON.stringify((({ achado, origem, categoria, nascData, maeBrinco }) => ({ achado, origem, categoria, nascData, maeBrinco }))(L.fichaAnimal(depois, '4049', HOJE))));
