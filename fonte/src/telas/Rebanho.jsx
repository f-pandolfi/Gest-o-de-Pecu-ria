// Tela "Rebanho": cadastros de matrizes e touros. Funcionário só consulta; o proprietário altera (com a senha).
import React, { useMemo, useState } from 'react';
import { Search, Lock, Save } from 'lucide-react';
import {
  CAMPOS_EDICAO_MATRIZ, formatarDataBR, ultimoPartoDe, numeroCriaUltimoParto,
} from '../logica.js';
import { IndexTabs, Modal, Tag, Campo, Lead, Aviso } from '../ui.jsx';
import { descreverEvento } from '../util.js';
import Touros from './Touros.jsx';
import { aplicacoesPorAnimal, protocolosDoAnimal, situacaoVacinaVaca } from '../manejo.js';

// Vacinas e protocolos da vaca (ficha)
function VacinasDaVaca({ m, dados }) {
  const aps = (aplicacoesPorAnimal(dados).get(m.id) || []).slice().reverse();
  const prots = protocolosDoAnimal(dados, m.id);
  const sit = situacaoVacinaVaca(dados, m);
  return (
    <>
      {sit.texto && <div style={{ margin: '6px 0' }}><span className={`vac-tag ${sit.nivel}`}>{sit.texto}</span></div>}
      {prots.length > 0 && <Lead rotulo="Protocolos" valor={prots.slice(0, 3).map((p) => p.nome).join(', ')} />}
      {aps.length > 0 && (
        <>
          <h3 className="h2" style={{ fontSize: 18 }}>Vacinas e medicamentos<small>{aps.length}</small></h3>
          <ul className="hist" data-testid="vacinas-vaca">
            {aps.slice(0, 12).map((a, i) => <li key={i}><span>{a.tipo}{a.produto ? ` · ${a.produto}` : ''}{a.etapa ? ` (${a.etapa})` : ''}</span><span>{formatarDataBR(a.data)}</span></li>)}
          </ul>
        </>
      )}
    </>
  );
}

function ModalMatriz({ m, dados, ownerMode, onSalvar, onFechar }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ ...m });
  const hist = useMemo(
    () => dados.eventos.filter((e) => e.matrizId === m.id).sort((a, b) => (b.data || '').localeCompare(a.data || '')),
    [dados.eventos, m.id],
  );
  const partos = dados.eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === m.id).length;
  const ult = ultimoPartoDe(m.id, dados.eventos);
  const cria = numeroCriaUltimoParto(m.id, dados.eventos);

  function salvar() {
    if (!String(form.brinco || '').trim()) return;
    onSalvar({
      ...m,
      brinco: String(form.brinco).trim(), categoria: form.categoria, raca: form.raca || '', lote: form.lote || '',
      dataNascimento: form.dataNascimento || '', partosAnteriores: parseInt(form.partosAnteriores, 10) || 0, status: form.status,
    });
    onFechar();
  }

  return (
    <Modal titulo={`Matriz ${m.brinco}`} onClose={onFechar} rotulo={`Matriz ${m.brinco}`}>
      {!edit ? (
        <>
          <div style={{ marginBottom: 6 }}><Tag status={m.status} /></div>
          <Lead rotulo="Categoria" valor={m.categoria || '—'} />
          {m.destino && <Lead rotulo="Destino da novilha" valor={m.destino === 'Matriz' ? 'virar matriz' : m.destino === 'Venda' ? 'venda' : 'a definir'} />}
          {m.status === 'Vendida' && <Lead rotulo="Baixa" valor={`Vendida${m.dataBaixa ? ` em ${formatarDataBR(m.dataBaixa)}` : ''}`} cor="var(--mut)" />}
          {m.status === 'Morta' && <Lead rotulo="Baixa" valor={`${m.motivoBaixa || 'Morta'}${m.dataBaixa ? ` em ${formatarDataBR(m.dataBaixa)}` : ''}`} cor="var(--late)" />}
          <Lead rotulo="Raça" valor={m.raca || '—'} />
          <Lead rotulo="Lote / piquete" valor={m.lote || '—'} />
          <Lead rotulo="Nascimento" valor={m.dataNascimento ? formatarDataBR(m.dataNascimento) : '—'} />
          <Lead rotulo="Partos na fazenda" valor={partos} />
          <Lead rotulo="Partos antes de entrar" valor={m.partosAnteriores || 0} />
          <Lead rotulo="Último parto" valor={ult ? `${formatarDataBR(ult)}${cria ? ` (cria ${cria})` : ''}` : '—'} />

          <VacinasDaVaca m={m} dados={dados} />
          <h3 className="h2" style={{ fontSize: 18 }}>Histórico<small>{hist.length} lançamento(s)</small></h3>
          {hist.length === 0 ? <p className="sub">Nada lançado para esta vaca ainda.</p> : (
            <ul className="hist" data-testid="historico">
              {hist.map((e) => (
                <li key={e.id}><span>{descreverEvento(e, dados).replace(/ · (mãe|vaca) \S+/, '')}</span><span>{formatarDataBR(e.data)}</span></li>
              ))}
            </ul>
          )}

          {m.status === 'Vendida' || m.status === 'Morta' ? (
            <p className="sub" style={{ marginTop: 16 }}>{m.status === 'Morta' ? 'Animal morto: o cadastro fica guardado só para consulta. Para corrigir a morte, use Lançar > Morte (com a senha).' : 'Animal vendido: o cadastro fica guardado só para consulta.'}</p>
          ) : ownerMode ? (
            <button className="btn wide" style={{ marginTop: 16 }} onClick={() => setEdit(true)}>Alterar cadastro</button>
          ) : (
            <p className="sub" style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Lock size={15} style={{ flex: 'none' }} /> Só o proprietário altera o cadastro. Use o cadeado e a senha.
            </p>
          )}
        </>
      ) : (
        <>
          {CAMPOS_EDICAO_MATRIZ.map((c) => (
            <Campo key={c.key} campo={c} value={form[c.key]} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} matrizes={[]} touros={[]} />
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={salvar}><Save size={17} /> Salvar alterações</button>
            <button className="btn quiet" onClick={() => setEdit(false)}>Cancelar</button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default function Rebanho({ dados, ownerMode, onSalvarMatriz, onSalvarTouro }) {
  const [aba, setAba] = useState('matrizes');
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState(null);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return dados.matrizes
      .filter((m) => (filtro === 'todos' ? m.status !== 'Vendida' && m.status !== 'Morta' : m.status === filtro) && (!q || String(m.brinco).toLowerCase().includes(q)))
      .slice()
      .sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), 'pt-BR', { numeric: true }));
  }, [dados.matrizes, filtro, busca]);

  const aberto = aberta ? dados.matrizes.find((m) => m.id === aberta) : null;
  const contar = (s) => dados.matrizes.filter((m) => m.status === s).length;
  const totalNoRebanho = dados.matrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta').length;

  return (
    <div className="wrap">
      <div className="head">
        <div><small>Livro do rebanho</small><h1>Rebanho</h1></div>
      </div>

      <IndexTabs
        rotulo="Cadastros"
        value={aba}
        onChange={setAba}
        tabs={[{ id: 'matrizes', label: 'Matrizes', count: totalNoRebanho }, { id: 'touros', label: 'Touros', count: dados.touros.length }]}
      />

      {aba === 'matrizes' && (
        <section className="sheet">
          <label className="search">
            <Search />
            <input placeholder="Buscar pelo brinco" aria-label="Buscar pelo brinco" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </label>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)' }}>
            <div className="seg" style={{ flexWrap: 'wrap' }} role="group" aria-label="Filtrar por situação">
              {[['todos', 'Todas'], ['Cheia', `Cheias ${contar('Cheia')}`], ['Vazia', `Vazias ${contar('Vazia')}`], ['Descarte', `Descarte ${contar('Descarte')}`], ...(contar('Vendida') ? [['Vendida', `Vendidas ${contar('Vendida')}`]] : []), ...(contar('Morta') ? [['Morta', `Mortas ${contar('Morta')}`]] : [])].map(([id, rot]) => (
                <button key={id} aria-pressed={filtro === id} onClick={() => setFiltro(id)} style={{ minHeight: 40, fontSize: 13, flex: '1 0 auto' }}>{rot}</button>
              ))}
            </div>
          </div>
          <div className="led-h cols-reb">
            <span>Brinco</span><span>Categoria</span><span>Situação</span>
            <span className="hide-s">Lote</span><span className="hide-s">Últ. parto</span>
          </div>
          {lista.length === 0 && <div className="empty">Nenhuma matriz encontrada.</div>}
          {lista.map((m) => {
            const ult = ultimoPartoDe(m.id, dados.eventos);
            return (
              <button key={m.id} className="led-r cols-reb" onClick={() => setAberta(m.id)} aria-label={`Abrir matriz ${m.brinco}`}>
                <span className="b">{m.brinco}</span>
                <span className="two"><b>{m.categoria}</b><span>{m.destino && m.status !== 'Vendida' && m.status !== 'Morta' ? `recria · ${m.destino === 'Matriz' ? 'virar matriz' : m.destino.toLowerCase()}` : (m.raca || '—')}</span></span>
                <span><Tag status={m.status} /></span>
                <span className="hide-s m mut">{m.lote || '—'}</span>
                <span className="hide-s m mut">{ult ? formatarDataBR(ult) : '—'}</span>
              </button>
            );
          })}
        </section>
      )}

      {aba === 'touros' && <Touros dados={dados} ownerMode={ownerMode} onSalvarTouro={onSalvarTouro} />}

      {!ownerMode && (
        <p className="sub" style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Lock size={15} style={{ flex: 'none' }} /> Modo funcionário: aqui você consulta. Alterar cadastro é só com a senha do proprietário.
        </p>
      )}

      {aberto && (
        <ModalMatriz key={aberto.id} m={aberto} dados={dados} ownerMode={ownerMode} onSalvar={onSalvarMatriz} onFechar={() => setAberta(null)} />
      )}
    </div>
  );
}
