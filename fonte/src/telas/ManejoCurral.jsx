// Fazer um manejo no curral: cabeçalho (data, técnico, descrição, vacinas) e embaixo os animais, DESMARCADOS;
// o funcionário marca quem passou. Serve para os manejos do protocolo (D0, D8, IA, entrada na monta) e para vacinação.
import React, { useEffect, useMemo, useState } from 'react';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { formatarDataBR, ultimoPartoDe, diasEntre } from '../logica.js';
import { aplicarManejo, acharNoProtocolo, semensDisponiveis, estoqueSemen, partosDe } from '../manejo.js';
import { Aviso } from '../ui.jsx';
import { AplicacoesEditor, ListaMarcar, Rotulo } from './ManejoComum.jsx';
import { lerLocal, gravarNoCelular, apagarLocal } from '../fila.js';

// Remédios escritos no protocolo que viram aplicação na ficha do animal
export function aplicacoesDoTexto(txt) {
  const t = String(txt || '').toLowerCase();
  const out = [];
  if (/vacina reprod|reprodutiva/.test(t)) out.push({ tipo: 'Vacina reprodutiva', produto: '' });
  if (/lepto/.test(t) && !/reprodutiva/.test(t)) out.push({ tipo: 'Reforço Lepto', produto: '' });
  if (/verm/.test(t)) out.push({ tipo: 'Vermífugo', produto: '' });
  if (/estimulante/.test(t)) out.push({ tipo: 'Estimulante', produto: '' });
  if (/fortificante|vitamina|modificador/.test(t)) out.push({ tipo: 'Fortificante', produto: '' });
  return out;
}

export default function ManejoCurral({
  dados, hoje, protocolo, manejo, itensAvulsos, etapa, titulo, aplicacoesIniciais, modoTeste, onGravarLote, onVoltar,
}) {
  const p = protocolo || null;
  const ehIA = !!(manejo && manejo.ia);
  const chave = `rascunho-manejo-${p ? p.id : 'avulso'}-${manejo ? manejo.id : etapa || 'vac'}`;
  const rasc = useMemo(() => lerLocal(chave, null), [chave]);
  const dataPlanejada = p && manejo ? manejo.data : '';
  const [data, setData] = useState((rasc && rasc.data) || (dataPlanejada && dataPlanejada <= hoje ? dataPlanejada : hoje));
  const [responsavel, setResponsavel] = useState((rasc && rasc.responsavel) || (p && p.tecnico) || '');
  const [descricao, setDescricao] = useState((rasc && rasc.descricao) || (manejo ? manejo.descricao : '') || '');
  const [aplicacoes, setAplicacoes] = useState((rasc && rasc.aplicacoes) || aplicacoesIniciais || (manejo ? aplicacoesDoTexto(manejo.medicamentos) : []));
  const [semenPadrao, setSemenPadrao] = useState((rasc && rasc.semenPadrao) || (p && p.semenPadrao) || '');
  const [semen, setSemen] = useState((rasc && rasc.semen) || {});
  const [marcados, setMarcados] = useState(() => new Set((rasc && rasc.marcados) || []));
  const [obs, setObs] = useState((rasc && rasc.obs) || '');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [gravando, setGravando] = useState(false);

  useEffect(() => {
    if (ok) return;
    gravarNoCelular(chave, { data, responsavel, descricao, aplicacoes, semenPadrao, semen, marcados: [...marcados], obs });
  }, [chave, data, responsavel, descricao, aplicacoes, semenPadrao, semen, marcados, obs, ok]);

  // vacas já inseminadas neste protocolo não recebem outra IATF
  const jaInseminadas = useMemo(() => new Set(p ? dados.eventos.filter((e) => e.tipo === 'iatf' && e.protocoloId === p.id).map((e) => e.matrizId) : []), [dados.eventos, p]);
  const semens = semensDisponiveis(dados);

  const itens = useMemo(() => {
    if (itensAvulsos) return itensAvulsos;
    const porId = new Map(dados.matrizes.map((m) => [m.id, m]));
    return (p ? p.animais : []).map((id) => {
      const m = porId.get(id);
      if (!m) return { id, brinco: '?', linha1: 'animal não encontrado', linha2: '' };
      const parto = ultimoPartoDe(m.id, dados.eventos);
      const av = [];
      if (m.status === 'Morta' || m.status === 'Vendida') av.push(m.status === 'Morta' ? 'MORREU' : 'VENDIDA');
      if (ehIA && jaInseminadas.has(m.id)) av.push('já inseminada neste protocolo');
      return {
        id, brinco: m.brinco, linha1: [m.categoria, m.lote].filter(Boolean).join(' · ') || '—',
        linha2: `${partosDe(m, dados.eventos)} cria(s)${parto ? ` · parto ${formatarDataBR(parto)} (${diasEntre(parto, data || hoje)} d)` : ''}`, avisos: av,
      };
    }).sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), 'pt-BR', { numeric: true }));
  }, [itensAvulsos, p, dados, ehIA, jaInseminadas, data, hoje]);

  function toggle(id) {
    setOk(''); setErro('');
    setMarcados((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function fora(brinco) {
    if (!p) return `O brinco ${brinco} não está nesta lista. Verifique.`;
    const r = acharNoProtocolo(dados, p, brinco);
    return r.erro || `O brinco ${brinco} não está nesta lista. Verifique.`;
  }

  async function gravar() {
    if (gravando) return;
    const presentes = [...marcados].filter((id) => !(ehIA && jaInseminadas.has(id)));
    if (ehIA && !semenPadrao && presentes.some((id) => !semen[id])) { setErro('Escolha o sêmen no alto (ou em cada vaca marcada).'); return; }
    const r = aplicarManejo(dados, {
      protocolo: p, manejo, data, responsavel, descricao, aplicacoes: aplicacoes.filter((a) => a.tipo), presentes, semen, semenPadrao,
      observacoes: obs, etapa: etapa || (manejo ? manejo.id : 'Vacinação'),
    });
    if (r.erros && r.erros.length) { setErro(r.erros.join(' ')); return; }
    setGravando(true);
    const res = await onGravarLote({
      estado: r.estado, eventosParaGravar: r.eventosNovos.map((e) => ({ tipo: e.tipo, evento: e })), matrizesParaGravar: [], tourosParaGravar: [],
    }, `${titulo || (manejo ? `manejo ${manejo.id}` : 'vacinação')}: ${presentes.length} animal(is)`);
    setGravando(false);
    if (!res.ok) { setErro(res.msg); return; }
    apagarLocal(chave);
    const ias = r.eventosNovos.filter((e) => e.tipo === 'iatf').length;
    setOk(`Gravado: ${presentes.length} animal(is) presentes${ias ? `, ${ias} inseminação(ões) lançada(s)` : ''}.${res.offline ? ' Sem internet: ficou no celular e vai para a planilha quando a internet voltar.' : ''}${modoTeste ? ' (modo teste: só na tela)' : ''}`);
    setMarcados(new Set());
  }

  const semenOpcoes = (
    <>
      <option value="">Escolha o sêmen</option>
      {semens.map((t) => { const e = estoqueSemen(t, dados.eventos); return <option key={t.id} value={t.id}>{t.nome}{t.raca ? ` · ${t.raca}` : ''}{e.compradas ? ` (${e.restantes} doses)` : ''}</option>; })}
    </>
  );

  return (
    <section className="sheet pad" data-testid="manejo-curral">
      <button className="btn quiet sm" onClick={onVoltar} style={{ marginBottom: 10 }}><ArrowLeft size={15} /> Voltar</button>
      <h2 className="h2" style={{ marginTop: 0 }}>{titulo || (manejo ? `${manejo.id} · ${p ? p.nome : ''}` : 'Vacinação')}</h2>
      {manejo && p && <p className="sub" style={{ marginTop: 0 }}>Planejado para {formatarDataBR(manejo.data)}{manejo.medicamentos ? ` · ${manejo.medicamentos}` : ''}</p>}
      {manejo && manejo.feito && <Aviso tipo="info">Este manejo já foi feito ({manejo.feitos.map((f) => `${formatarDataBR(f.data)}, ${String(f.presentes || '').split(',').filter(Boolean).length} animais`).join('; ')}). Gravar de novo cria outro registro: use só para as que faltaram.</Aviso>}

      <div className="grid2">
        <div className="fld"><label htmlFor="mj-data">Data</label><input id="mj-data" type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
        <div className="fld"><label htmlFor="mj-resp">{ehIA ? 'Técnico (inseminador)' : 'Responsável'}</label><input id="mj-resp" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} /></div>
      </div>
      {ehIA && (
        <div className="fld">
          <label htmlFor="mj-semen">Sêmen (vale para todas; dá para trocar em cada vaca)</label>
          <select id="mj-semen" value={semenPadrao} onChange={(e) => setSemenPadrao(e.target.value)}>{semenOpcoes}</select>
        </div>
      )}
      <div className="fld"><label htmlFor="mj-desc">Descrição do manejo</label><input id="mj-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} /></div>
      <AplicacoesEditor valor={aplicacoes} onChange={setAplicacoes} />

      <Rotulo>Animais: toque em quem passou</Rotulo>
      <ListaMarcar
        itens={itens} marcados={marcados} onToggle={toggle} onDigitarFora={fora}
        extraDaLinha={ehIA ? (x) => (
          <select aria-label={`Sêmen da vaca ${x.brinco}`} value={semen[x.id] || ''} onChange={(e) => setSemen((s) => ({ ...s, [x.id]: e.target.value }))}>
            <option value="">{semenPadrao ? `Mesmo do alto` : 'Escolha o sêmen'}</option>
            {semens.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        ) : null}
      />
      <div className="fld" style={{ marginTop: 12 }}><label htmlFor="mj-obs">Observação</label><input id="mj-obs" value={obs} onChange={(e) => setObs(e.target.value)} /></div>

      {erro && <Aviso>{erro}</Aviso>}
      {ok && <Aviso tipo="ok">{ok}</Aviso>}
      <button className="btn wide" style={{ marginTop: 8 }} onClick={gravar} disabled={gravando || marcados.size === 0}>
        {gravando ? <Loader2 size={18} className="spin" /> : <Save size={18} />} Gravar {marcados.size} presente(s)
      </button>
    </section>
  );
}
