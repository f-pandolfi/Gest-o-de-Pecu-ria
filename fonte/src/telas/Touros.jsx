// Touros e sêmen (aba de Rebanho). Todos consultam; o dono cadastra e altera.
// Sêmen: central, código, partida, tipo (convencional/sexado), doses, compra, botijão e caneca, facilidade de parto, DEPs.
// Touro vivo: brinco, nascimento, origem, registro, pais, lote, peso e exame andrológico.
import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { formatarDataBR, idadeMesesDias, todayISO } from '../logica.js';
import {
  TIPOS_TOURO, TIPOS_SEMEN, ORIGENS_TOURO, estoqueSemen, andrologicoVencido, validarTouro, prepararTouro,
} from '../manejo.js';
import { Modal, Aviso, Lead } from '../ui.jsx';
import { fmtBRL } from '../util.js';
import { Rotulo } from './ManejoComum.jsx';

const CAMPOS_SEMEN = [
  ['fornecedor', 'Central / fornecedor'], ['codigoCentral', 'Código do touro na central'], ['partida', 'Partida (lote da palheta)'],
  ['tipoSemen', 'Tipo de sêmen', TIPOS_SEMEN], ['doses', 'Doses compradas', 'num'], ['ajusteDoses', 'Ajuste de doses (perdidas: use negativo)', 'num'],
  ['dataCompra', 'Data da compra', 'date'], ['custoDose', 'Custo por dose (R$)', 'num', true], ['notaFiscal', 'Nota fiscal', 'txt', true],
  ['botijao', 'Botijão'], ['caneca', 'Caneca'], ['facilidadeParto', 'Bom para novilha (parto fácil)?', ['Sim', 'Não', 'Não sei']],
  ['registro', 'Registro genealógico (RGD)'], ['deps', 'DEPs / avaliação genética (resumo ou link do catálogo)'],
];
const CAMPOS_VIVO = [
  ['brinco', 'Brinco / número'], ['dataNascimento', 'Data de nascimento', 'date'], ['origem', 'Origem', ORIGENS_TOURO],
  ['vendedor', 'Comprado de'], ['dataCompra', 'Data da compra', 'date'], ['valorCompra', 'Valor da compra (R$)', 'num', true],
  ['registro', 'Registro genealógico (RGD)'], ['pai', 'Pai'], ['mae', 'Mãe'], ['lote', 'Lote / pasto onde está'], ['pesoAtual', 'Peso (kg)', 'num'],
  ['andrologicoData', 'Exame andrológico: data', 'date'], ['andrologicoResultado', 'Resultado do exame', ['Apto', 'Apto com restrição', 'Inapto']],
  ['circEscrotal', 'Circunferência escrotal (cm)', 'num'], ['andrologicoVet', 'Veterinário do exame'],
];

function FormTouro({ inicial, onSalvar, onFechar }) {
  const [f, setF] = useState(() => ({ tipo: '', situacao: 'Ativo', ...(inicial || {}) }));
  const [erro, setErro] = useState('');
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const campos = f.tipo === 'Sêmen' ? CAMPOS_SEMEN : f.tipo === 'Touro vivo' ? CAMPOS_VIVO : [];
  function salvar() {
    const e = validarTouro(f);
    if (e.length) { setErro(e.join(' ')); return; }
    onSalvar(prepararTouro(f, inicial && inicial.id ? inicial : null));
  }
  return (
    <Modal titulo={inicial && inicial.id ? `Alterar ${inicial.nome}` : 'Cadastrar touro ou sêmen'} onClose={onFechar}>
      <div data-testid="form-touro">
        <Rotulo>É sêmen ou touro vivo?</Rotulo>
        <div className="seg" style={{ marginBottom: 12 }}>
          {TIPOS_TOURO.map((t) => <button key={t} type="button" aria-pressed={f.tipo === t} onClick={() => set('tipo', t)}>{t}</button>)}
        </div>
        <div className="grid2">
          <div className="fld"><label htmlFor="tr-nome">Nome *</label><input id="tr-nome" value={f.nome || ''} onChange={(e) => set('nome', e.target.value)} /></div>
          <div className="fld"><label htmlFor="tr-raca">Raça</label><input id="tr-raca" value={f.raca || ''} onChange={(e) => set('raca', e.target.value)} /></div>
          {campos.map(([k, rot, tipo]) => (
            <div className="fld" key={k}>
              <label htmlFor={`tr-${k}`}>{rot}</label>
              {Array.isArray(tipo) ? (
                <select id={`tr-${k}`} value={f[k] || ''} onChange={(e) => set(k, e.target.value)}><option value="">—</option>{tipo.map((o) => <option key={o}>{o}</option>)}</select>
              ) : (
                <input id={`tr-${k}`} type={tipo === 'date' ? 'date' : 'text'} inputMode={tipo === 'num' ? 'decimal' : undefined} value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} />
              )}
            </div>
          ))}
          {f.tipo && (
            <div className="fld"><label htmlFor="tr-sit">Situação</label>
              <select id="tr-sit" value={f.situacao || 'Ativo'} onChange={(e) => set('situacao', e.target.value)}><option>Ativo</option><option>Inativo</option></select></div>
          )}
          {f.situacao === 'Inativo' && (
            <>
              <div className="fld"><label htmlFor="tr-saida">Data da saída</label><input id="tr-saida" type="date" value={f.dataSaida || ''} onChange={(e) => set('dataSaida', e.target.value)} /></div>
              <div className="fld"><label htmlFor="tr-mot">Motivo da saída</label><input id="tr-mot" value={f.motivoSaida || ''} onChange={(e) => set('motivoSaida', e.target.value)} /></div>
            </>
          )}
        </div>
        <div className="fld"><label htmlFor="tr-obs">Observações</label><input id="tr-obs" value={f.observacoes || ''} onChange={(e) => set('observacoes', e.target.value)} /></div>
        {erro && <Aviso>{erro}</Aviso>}
        <button className="btn wide" onClick={salvar}><Save size={18} /> Salvar</button>
      </div>
    </Modal>
  );
}

function Ficha({ t, dados, ownerMode, onAlterar, onFechar }) {
  const hoje = todayISO();
  const e = estoqueSemen(t, dados.eventos);
  const filhos = dados.eventos.filter((x) => x.tipo === 'iatf' && x.touroId === t.id).length;
  const campos = (t.tipo === 'Touro vivo' ? CAMPOS_VIVO : CAMPOS_SEMEN).filter(([, , , dinheiro]) => ownerMode || !dinheiro);
  return (
    <Modal titulo={t.nome} onClose={onFechar}>
      <Lead rotulo="Tipo" valor={t.tipo || 'não informado'} />
      <Lead rotulo="Raça" valor={t.raca || '—'} />
      <Lead rotulo="Situação" valor={t.situacao || 'Ativo'} />
      {t.tipo !== 'Touro vivo' && <Lead rotulo="Doses" valor={`${e.restantes} restam (${e.usadas} usadas de ${e.compradas}${e.ajuste ? `, ajuste ${e.ajuste}` : ''})`} />}
      {t.tipo === 'Touro vivo' && t.dataNascimento && <Lead rotulo="Idade" valor={(idadeMesesDias(t.dataNascimento, hoje) || {}).texto || '—'} />}
      {t.tipo === 'Touro vivo' && <Lead rotulo="Andrológico" valor={t.andrologicoData ? `${formatarDataBR(t.andrologicoData)} ${t.andrologicoResultado || ''}${andrologicoVencido(t, hoje) ? ' (vencido)' : ''}` : 'sem exame'} cor={andrologicoVencido(t, hoje) ? 'var(--late)' : undefined} />}
      {campos.filter(([k]) => t[k] !== undefined && t[k] !== '' && !['dataNascimento', 'andrologicoData', 'andrologicoResultado'].includes(k)).map(([k, rot, tipo]) => (
        <Lead key={k} rotulo={rot} valor={tipo === 'date' ? formatarDataBR(t[k]) : String(t[k])} />
      ))}
      {filhos > 0 && <Lead rotulo="Inseminações com ele" valor={filhos} />}
      {t.observacoes && <p className="sub">{t.observacoes}</p>}
      {ownerMode && <button className="btn wide" style={{ marginTop: 14 }} onClick={onAlterar}>Alterar cadastro</button>}
    </Modal>
  );
}

export default function Touros({ dados, ownerMode, onSalvarTouro }) {
  const [tipo, setTipo] = useState('todos');
  const [aberto, setAberto] = useState(null);
  const [editando, setEditando] = useState(null);
  const [msg, setMsg] = useState('');
  const hoje = todayISO();
  const lista = dados.touros.filter((t) => tipo === 'todos' || (tipo === 'vivo' ? t.tipo === 'Touro vivo' : t.tipo !== 'Touro vivo'))
    .sort((a, b) => (a.situacao === 'Inativo') - (b.situacao === 'Inativo') || String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
  const t = aberto ? dados.touros.find((x) => x.id === aberto) : null;
  return (
    <section data-testid="touros">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <div className="pills" style={{ margin: 0 }}>
          {[['todos', 'Todos'], ['semen', 'Sêmen'], ['vivo', 'Touros vivos']].map(([id, r]) => <button key={id} aria-pressed={tipo === id} onClick={() => setTipo(id)}>{r}</button>)}
        </div>
        {ownerMode && <button className="btn sm" onClick={() => setEditando({})}><Plus size={15} /> Cadastrar touro ou sêmen</button>}
      </div>
      {msg && <Aviso tipo="ok" onClose={() => setMsg('')}>{msg}</Aviso>}
      <div className="sheet">
        {lista.length === 0 && <div className="empty">Nenhum cadastrado aqui.{ownerMode ? ' Use "Cadastrar touro ou sêmen".' : ''}</div>}
        {lista.map((x) => {
          const e = estoqueSemen(x, dados.eventos);
          const venc = andrologicoVencido(x, hoje);
          return (
            <button key={x.id} className="led-r" style={{ '--cols': 'minmax(0,1fr) auto', minHeight: 62, opacity: x.situacao === 'Inativo' ? 0.55 : 1 }} onClick={() => setAberto(x.id)} aria-label={`Abrir ${x.nome}`}>
              <span className="two">
                <b>{x.nome}</b>
                <span>{[x.tipo || 'tipo não informado', x.raca, x.tipo === 'Touro vivo' ? x.brinco && `brinco ${x.brinco}` : x.fornecedor, x.partida && `partida ${x.partida}`].filter(Boolean).join(' · ')}</span>
                {venc && <span className="late">Exame andrológico {x.andrologicoData ? 'vencido' : 'não registrado'}</span>}
              </span>
              {x.tipo !== 'Touro vivo' && e.compradas > 0 && (
                <span className="r" style={{ color: e.restantes <= 0 ? 'var(--late)' : e.restantes <= 5 ? 'var(--amber)' : 'var(--green)' }}>
                  {e.restantes} dose(s)
                  {ownerMode && <div style={{ font: '500 11.5px var(--body)', color: 'var(--mut)' }}>{e.usadas} de {e.compradas}{x.custoDose ? ` · ${fmtBRL(parseFloat(x.custoDose))}` : ''}</div>}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {t && !editando && <Ficha t={t} dados={dados} ownerMode={ownerMode} onFechar={() => setAberto(null)} onAlterar={() => setEditando(t)} />}
      {editando && ownerMode && (
        <FormTouro inicial={editando} onFechar={() => setEditando(null)} onSalvar={(novo) => { onSalvarTouro(novo); setEditando(null); setAberto(null); setMsg(`${novo.nome} salvo.`); }} />
      )}
    </section>
  );
}
