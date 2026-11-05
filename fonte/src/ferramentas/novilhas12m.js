// Ferramenta (05/11/26, pedido do Pandolfi): toda cria fêmea com mais de 12 meses que está na fazenda vira Novilha no cadastro.
// Bezerra fica só a que tem até 12 meses. Usa as mesmas regras do app (listarCrias, inventário, idNovilha).
import { indiceRebanho, racaDoHistorico } from '../ficha.js';
import { idNovilha, padronizarLote, diasEntre } from '../logica.js';
import { analisarInventario } from '../inventario.js';

export function planoNovilhas12m(dados, hoje, agora) {
  const ix = indiceRebanho(dados, hoje);
  const inv = analisarInventario(ix);
  const porK = new Map(inv.animais.map((l) => [l.k, l]));
  const vistasConfirmar = new Set(inv.confirmadas.map((c) => c.id));
  const now = agora || new Date().toISOString();
  const out = { matrizes: [], pulados: [], porSituacao: {} };
  ix.crias.forEach((c) => {
    if (c.novilha || c.sexo !== 'Fêmea' || !c.nascData || diasEntre(c.nascData, hoje) <= 365) return;
    const naFazenda = c.situacao === 'mamando' || c.situacao === 'desmamado' || (c.situacao === 'confirmar' && vistasConfirmar.has(c.id));
    if (!naFazenda) return;
    const brinco = String(c.brinco || '').trim();
    if (!brinco) { out.pulados.push({ brinco: 's/ nº', nasc: c.nascData, motivo: 'sem brinco' }); return; }
    const dup = dados.matrizes.find((m) => String(m.brinco).trim() === brinco && m.status !== 'Vendida' && m.status !== 'Morta');
    if (dup) { out.pulados.push({ brinco, nasc: c.nascData, motivo: `já existe matriz ativa ${dup.brinco} (${dup.categoria})` }); return; }
    const l = porK.get(`c:${c.id}`);
    const lote = padronizarLote((l && l.loteConferido) || 'NOVILHAS', dados.matrizes);
    out.porSituacao[c.situacao] = (out.porSituacao[c.situacao] || 0) + 1;
    out.matrizes.push({
      id: idNovilha(c.id), brinco: /^\d+$/.test(brinco) ? Number(brinco) : brinco, categoria: 'Novilha', raca: racaDoHistorico(c.nasc) || '', lote,
      dataNascimento: c.nascData, partosAnteriores: 0, status: 'Vazia', destino: '', dataBaixa: '', motivoBaixa: '', createdAt: now,
      _info: `${c.situacao} · ${Math.floor(diasEntre(c.nascData, hoje) / 30.44)} m · mãe ${c.maeBrinco || '?'}`,
    });
  });
  return out;
}
