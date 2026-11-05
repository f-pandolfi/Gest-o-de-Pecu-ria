// Tela "Rebanho" (v11): todos os animais da fazenda (matrizes, crias, touros e bois). Toque abre a ficha.
// Funcionário consulta; o proprietário altera cadastros (com a senha).
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Lock, Save, Plus } from 'lucide-react';
import {
  CAMPOS_EDICAO_MATRIZ, formatarDataBR, ultimoPartoDe, numeroCriaUltimoParto, padronizarLote, partosPorMatriz,
} from '../logica.js';
import { IndexTabs, Modal, Tag, Campo, Lead, Aviso } from '../ui.jsx';
import { descreverEvento } from '../util.js';
import Touros from './Touros.jsx';
import { useFicha, ListaAnimais } from './Ficha.jsx';
import { boisDe, boiAtivo, naFazenda, CATEGORIAS_BOI, categoriaBoi, opcoesAtuais, TIPO_BOI } from '../ficha.js';
import { todayISO, novoId } from '../logica.js';
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

export function ModalMatriz({ m, dados, ownerMode, onSalvar, onFechar, editarDireto }) {
  const [edit, setEdit] = useState(!!editarDireto);
  const [form, setForm] = useState({ ...m });
  const hist = useMemo(
    () => dados.eventos.filter((e) => e.matrizId === m.id || (e.tipo === 'manejo' && String(e.presentes || '').split(',').includes(m.id)))
      .sort((a, b) => (b.data || '').localeCompare(a.data || '')),
    [dados.eventos, m.id],
  );
  const partos = dados.eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === m.id).length;
  const ult = ultimoPartoDe(m.id, dados.eventos);
  const cria = numeroCriaUltimoParto(m.id, dados.eventos);

  function salvar() {
    if (!String(form.brinco || '').trim()) return;
    onSalvar({
      ...m,
      brinco: String(form.brinco).trim(), categoria: form.categoria, raca: form.raca || '', lote: padronizarLote(form.lote, dados.matrizes.filter((x) => x.id !== m.id)),
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
                <li key={e.id}><span>{descreverEvento(e, dados).replace(/ · (mãe|vaca) \S+/, '').replace(/ · \d+ animal\(is\)/, '')}</span><span>{formatarDataBR(e.data)}</span></li>
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


// Cadastro de boi (fica na aba Touros da planilha com tipo "Boi": não aparece como reprodutor)
export function ModalBoi({ boi, dados, onSalvar, onFechar }) {
  const novo = !boi;
  const [f, setF] = useState(() => (boi ? { ...boi, categoria: categoriaBoi(boi) } : { categoria: 'Boi', brinco: '', raca: '', origem: 'Comprado', dataCompra: todayISO(), pesoAtual: '', vendedor: '', valorCompra: '', lote: '', observacoes: '', dataNascimento: '' }));
  const [erro, setErro] = useState('');
  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErro(''); };
  function salvar() {
    const b = String(f.brinco || '').trim();
    if (!b) return setErro('Informe o brinco.');
    const repetido = boisDe(dados).some((x) => x.id !== (boi && boi.id) && String(x.brinco).trim() === b && boiAtivo(x));
    if (repetido) return setErro(`Já existe um boi com o brinco ${b} na fazenda.`);
    const agora = new Date().toISOString();
    const t = {
      ...(boi || { id: `boi-${novoId()}`, createdAt: agora, doses: '', custoDose: '' }),
      tipo: TIPO_BOI, nome: `${f.categoria} ${b}`, brinco: b, raca: f.raca || '', origem: f.origem || '', dataCompra: f.dataCompra || '', pesoAtual: f.pesoAtual || '',
      vendedor: f.vendedor || '', valorCompra: f.valorCompra || '', lote: f.lote || '', observacoes: f.observacoes || '', dataNascimento: f.dataNascimento || '',
      dataSaida: f.dataSaida || '', motivoSaida: f.motivoSaida || '', situacao: f.dataSaida ? 'Saiu' : 'Ativo', atualizadoEm: agora,
    };
    const msg = onSalvar(t);
    if (msg) return setErro(msg);
    onFechar();
  }
  const lotes = opcoesAtuais('lotes', ''); const racas = opcoesAtuais('racas', '');
  const inp = (k, rot, tipo = 'text', extra) => (
    <div className="fld"><label htmlFor={`boi-${k}`}>{rot}</label><input id={`boi-${k}`} type={tipo} inputMode={tipo === 'number' ? 'decimal' : undefined} value={f[k] || ''} onChange={(e) => set(k, e.target.value)} {...extra} /></div>
  );
  return (
    <Modal titulo={novo ? 'Cadastrar boi' : `Boi ${boi.brinco}`} onClose={onFechar}>
      <div className="fld" role="group" aria-label="Categoria"><span className="lbl" style={{ display: 'block', font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 6 }}>Categoria</span>
        <div className="seg">{CATEGORIAS_BOI.map((c) => <button key={c} type="button" aria-pressed={f.categoria === c} onClick={() => set('categoria', c)}>{c}</button>)}</div></div>
      {inp('brinco', 'Brinco *', 'text', { inputMode: 'numeric', autoFocus: novo })}
      {inp('raca', 'Raça', 'text', { list: 'boi-racas' })}<datalist id="boi-racas">{racas.map((x) => <option key={x} value={x} />)}</datalist>
      <div className="fld" role="group" aria-label="Origem"><span className="lbl" style={{ display: 'block', font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 6 }}>Origem</span>
        <div className="seg">{['Comprado', 'Nascido na fazenda'].map((c) => <button key={c} type="button" aria-pressed={f.origem === c} onClick={() => set('origem', c)}>{c}</button>)}</div></div>
      {inp('dataCompra', f.origem === 'Nascido na fazenda' ? 'Data de entrada no lote' : 'Data de entrada (compra)', 'date')}
      {inp('dataNascimento', 'Nascimento (se souber)', 'date')}
      {inp('pesoAtual', 'Peso de entrada (kg)', 'number')}
      {f.origem === 'Comprado' && inp('vendedor', 'Vendedor')}
      {f.origem === 'Comprado' && inp('valorCompra', 'Valor da compra (R$)', 'number')}
      {inp('lote', 'Lote / pasto', 'text', { list: 'boi-lotes' })}<datalist id="boi-lotes">{lotes.map((x) => <option key={x} value={x} />)}</datalist>
      {inp('observacoes', 'Observação')}
      {!novo && <>{inp('dataSaida', 'Saída (venda, morte) em', 'date')}{f.dataSaida && inp('motivoSaida', 'Motivo da saída')}</>}
      {erro && <Aviso>{erro}</Aviso>}
      <button className="btn wide" onClick={salvar}><Save size={17} /> {novo ? 'Cadastrar' : 'Salvar alterações'}</button>
    </Modal>
  );
}

const STATUS_MATRIZ = [['todos', 'Todas'], ['Cheia', 'Cheias'], ['Vazia', 'Vazias'], ['Descarte', 'Descarte'], ['Vendida', 'Vendidas'], ['Morta', 'Mortas']];

export default function Rebanho({ dados, hoje, ownerMode, onSalvarTouro, onNovasMatrizes }) {
  const { ix, abrir } = useFicha();
  const [aba, setAba] = useState('todos');
  const [busca, setBusca] = useState('');
  const [reb, setReb] = useState('todos');
  const [stat, setStat] = useState('todos');
  const [fc, setFc] = useState('fazenda');
  const [sexo, setSexo] = useState('');
  const [ano, setAno] = useState(String(hoje).slice(0, 4));
  const [boiAberto, setBoiAberto] = useState(null); // 'novo' ou boi
  const [verSaiu, setVerSaiu] = useState(false);
  useEffect(() => setBusca(''), [aba]);

  const plantel = useMemo(() => dados.matrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta'), [dados.matrizes]);
  const vacas = plantel.filter((m) => m.categoria !== 'Novilha');
  const novs = plantel.filter((m) => m.categoria === 'Novilha');
  const bezerros = ix ? ix.crias.filter(naFazenda) : [];
  const confirmar = ix ? ix.crias.filter((c) => !c.novilha && c.situacao === 'confirmar') : [];
  const touros = (dados.touros || []).filter((t) => String(t.tipo || '').toLowerCase() !== 'boi');
  const bois = boisDe(dados);
  const boisAtivos = bois.filter(boiAtivo);
  const q = busca.trim();
  const fb = (b) => !q || String(b ?? '').startsWith(q);
  const ordem = (a, b) => String(a.brinco).localeCompare(String(b.brinco), 'pt-BR', { numeric: true });
  const anos = useMemo(() => (ix ? [...new Set(ix.crias.map((c) => (c.nascData || '').slice(0, 4)).filter(Boolean))].sort().reverse() : []), [ix]);

  let chaves = [];
  if (aba === 'todos') {
    if (reb === 'todos' || reb === 'vacas') chaves.push(...vacas.filter((m) => fb(m.brinco)).sort(ordem).map((m) => `m:${m.id}`));
    if (reb === 'todos' || reb === 'novilhas') chaves.push(...novs.filter((m) => fb(m.brinco)).sort(ordem).map((m) => `m:${m.id}`));
    if (reb === 'todos' || reb === 'bezerros') chaves.push(...bezerros.filter((c) => fb(c.brinco)).map((c) => `c:${c.id}`));
    if (reb === 'todos' || reb === 'bois') chaves.push(...boisAtivos.filter((t) => fb(t.brinco)).sort(ordem).map((t) => `t:${t.id}`));
    if (reb === 'todos' || reb === 'touros') chaves.push(...touros.filter((t) => fb(t.brinco) || String(t.nome || '').toLowerCase().includes(q.toLowerCase())).map((t) => `t:${t.id}`));
  } else if (aba === 'matrizes') {
    chaves = dados.matrizes.filter((m) => (stat === 'todos' ? m.status !== 'Vendida' && m.status !== 'Morta' : m.status === stat) && fb(m.brinco)).sort(ordem).map((m) => `m:${m.id}`);
  } else if (aba === 'crias' && ix) {
    let l = ix.crias.filter((c) => !c.novilha || fc === 'todas');
    if (fc === 'fazenda') l = l.filter((c) => c.situacao === 'mamando' || c.situacao === 'desmamado');
    if (fc === 'confirmar') l = l.filter((c) => c.situacao === 'confirmar');
    if (fc === 'vendidas') l = l.filter((c) => c.situacao === 'vendido');
    if (fc === 'mortas') l = l.filter((c) => c.situacao === 'morto');
    if (sexo) l = l.filter((c) => c.sexo === sexo);
    if (ano && fc !== 'fazenda') l = l.filter((c) => (c.nascData || '').startsWith(ano));
    chaves = l.filter((c) => fb(c.brinco)).map((c) => (c.novilha ? `m:${c.novilha.id}` : `c:${c.id}`));
  } else if (aba === 'bois') {
    chaves = (verSaiu ? bois : boisAtivos).filter((t) => fb(t.brinco)).sort(ordem).map((t) => `t:${t.id}`);
  }
  const contar = (s) => dados.matrizes.filter((m) => m.status === s).length;
  const Chip = ({ on, onClick, children }) => <button className={`fx-cp${on ? ' on' : ''}`} aria-pressed={on} onClick={onClick}>{children}</button>;

  return (
    <div className="wrap">
      <div className="head"><div><small>Livro do rebanho</small><h1>Rebanho</h1></div></div>
      <p className="sub" style={{ marginTop: -6 }}>Todos os animais da fazenda. Toque em qualquer um para abrir a ficha.</p>

      <div className="fx-resumo" data-testid="resumo-rebanho">
        <button className="fx-kpi" onClick={() => { setAba('todos'); setReb('vacas'); }}><small>Vacas</small><b>{vacas.length}</b><i>{vacas.filter((m) => m.status === 'Cheia').length} cheias</i></button>
        <button className="fx-kpi" onClick={() => { setAba('todos'); setReb('novilhas'); }}><small>Novilhas</small><b>{novs.length}</b></button>
        <button className="fx-kpi" onClick={() => { setAba('todos'); setReb('bezerros'); }}><small>Bezerros(as) na fazenda</small><b>{bezerros.length}</b><i>{bezerros.filter((c) => c.sexo === 'Macho').length}M · {bezerros.filter((c) => c.sexo === 'Fêmea').length}F</i></button>
        <button className="fx-kpi" onClick={() => setAba('bois')}><small>Bois</small><b>{boisAtivos.length}</b></button>
        <button className="fx-kpi" onClick={() => setAba('touros')}><small>Touros / sêmen</small><b>{touros.length}</b></button>
        {confirmar.length > 0 && <button className="fx-kpi" onClick={() => { setAba('crias'); setFc('confirmar'); }}><small>Crias a confirmar</small><b style={{ color: 'var(--amber)' }}>{confirmar.length}</b></button>}
      </div>

      <IndexTabs
        rotulo="Rebanho" value={aba} onChange={setAba}
        tabs={[
          { id: 'todos', label: 'Todos', count: plantel.length + bezerros.length + boisAtivos.length + touros.length },
          { id: 'matrizes', label: 'Matrizes', count: plantel.length },
          { id: 'crias', label: 'Crias', count: ix ? ix.crias.length : 0 },
          { id: 'touros', label: 'Touros', count: touros.length },
          { id: 'bois', label: 'Bois', count: boisAtivos.length },
        ]}
      />

      {aba !== 'touros' && (
        <label className="search fx-search">
          <Search />
          <input placeholder="Filtrar pelo brinco" aria-label="Filtrar pelo brinco" inputMode="numeric" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
      )}

      {aba === 'todos' && (
        <div className="fx-chips">
          {[['todos', 'Todos'], ['vacas', 'Vacas', vacas.length], ['novilhas', 'Novilhas', novs.length], ['bezerros', 'Bezerros(as)', bezerros.length], ['bois', 'Bois', boisAtivos.length], ['touros', 'Touros', touros.length]].map(([v, t, n]) => (
            <Chip key={v} on={reb === v} onClick={() => setReb(v)}>{t}{n !== undefined && <b>{n}</b>}</Chip>
          ))}
        </div>
      )}
      {aba === 'matrizes' && (
        <div className="fx-chips">
          {STATUS_MATRIZ.filter(([v]) => v === 'todos' || contar(v) > 0 || v === 'Descarte').map(([v, t]) => <Chip key={v} on={stat === v} onClick={() => setStat(v)}>{t}{v !== 'todos' && <b>{contar(v)}</b>}</Chip>)}
        </div>
      )}
      {aba === 'crias' && (
        <>
          <div className="fx-chips">{[['fazenda', 'Na fazenda'], ['confirmar', 'A confirmar'], ['vendidas', 'Vendidas'], ['mortas', 'Mortas'], ['todas', 'Todas']].map(([v, t]) => <Chip key={v} on={fc === v} onClick={() => setFc(v)}>{t}</Chip>)}</div>
          <div className="fx-chips">
            {[['', 'Machos e fêmeas'], ['Macho', 'Machos'], ['Fêmea', 'Fêmeas']].map(([v, t]) => <Chip key={v} on={sexo === v} onClick={() => setSexo(v)}>{t}</Chip>)}
            {fc !== 'fazenda' && anos.map((a) => <Chip key={a} on={ano === a} onClick={() => setAno(ano === a ? '' : a)}>{a}</Chip>)}
          </div>
        </>
      )}
      {aba === 'bois' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {ownerMode && <button className="btn" onClick={() => setBoiAberto('novo')} data-testid="cadastrar-boi"><Plus size={17} /> Cadastrar boi</button>}
          {bois.length > boisAtivos.length && <Chip on={verSaiu} onClick={() => setVerSaiu(!verSaiu)}>Mostrar os que saíram</Chip>}
        </div>
      )}

      {aba === 'touros' ? <Touros dados={dados} ownerMode={ownerMode} onSalvarTouro={onSalvarTouro} /> : (
        <ListaAnimais chaves={chaves} vazio={aba === 'bois' ? (ownerMode ? 'Nenhum boi cadastrado ainda. Toque em "Cadastrar boi".' : 'Nenhum boi cadastrado ainda.') : undefined} />
      )}

      {!ownerMode && (
        <p className="sub" style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Lock size={15} style={{ flex: 'none' }} /> Modo funcionário: aqui você consulta. Alterar cadastro é só com a senha do proprietário.
        </p>
      )}
      {boiAberto && <ModalBoi boi={boiAberto === 'novo' ? null : boiAberto} dados={dados} onSalvar={onSalvarTouro} onFechar={() => setBoiAberto(null)} />}
    </div>
  );
}
