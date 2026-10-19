// Tela "Lançar": uma ficha por tipo de lançamento (funcionário vê só os tipos permitidos).
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import {
  CAMPOS, TIPOS_FUNCIONARIO, camposFaltando, jaExiste, sugerirBrincoBezerro, formatarDataBR, fichaAnimal, diasDeMesesDias,
} from '../logica.js';
import FichaRapida from './FichaRapida.jsx';
import { IndexTabs, Campo, Aviso, Lead } from '../ui.jsx';
import { ROTULO_CURTO, ORDEM_LANCAR, rotuloEvento, descreverEvento } from '../util.js';
import LoteFoto from './Lote.jsx';
import { FormMorte, ListaMortes } from './Morte.jsx';
import { ListaNascimentos } from './Nascimentos.jsx';

function formularioInicial(tipo, hoje) {
  const f = {};
  (CAMPOS[tipo] || []).forEach((c) => {
    if (c.default) f[c.key] = c.default;
    if (c.key === 'data') f.data = hoje;
  });
  return f;
}

export default function Lancar({
  dados, hoje, ownerMode, preset, onSalvar, onGravarLote, modoTeste, onRegistrarMorte, onEditarNascimento, onEditarMorte, onAnularMorte,
}) {
  const tiposVisiveis = ORDEM_LANCAR.filter((id) => ownerMode || TIPOS_FUNCIONARIO.includes(id));
  const abas = [
    ...tiposVisiveis.map((id) => ({ id, label: ROTULO_CURTO[id] })),
    ...(ownerMode ? [{ id: 'lote', label: 'Lote por foto' }] : []),
  ];
  const [tipo, setTipo] = useState('nascimento');
  const [form, setForm] = useState(() => formularioInicial('nascimento', hoje));
  const [erro, setErro] = useState('');
  const [dup, setDup] = useState(false);
  const [salvo, setSalvo] = useState('');
  const [travado, setTravado] = useState(false); // logo depois de salvar o botão fica travado por um instante (evita toque duplo)
  const timer = useRef(null);
  const timerTrava = useRef(null);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(timerTrava.current); }, []);

  // Vindo da tela Parto ("Lançar nascimento desta vaca")
  useEffect(() => {
    if (!preset) return;
    setTipo(preset.tipo);
    setForm({ ...formularioInicial(preset.tipo, hoje), matrizId: preset.matrizId || '' });
    setErro(''); setDup(false); setSalvo('');
  }, [preset && preset.n]); // eslint-disable-line react-hooks/exhaustive-deps

  // Funcionário que bloqueou o app voltando de "proprietário": sai de abas que não existem mais
  useEffect(() => {
    if (!abas.some((a) => a.id === tipo)) trocarTipo('nascimento');
  }, [ownerMode]); // eslint-disable-line react-hooks/exhaustive-deps

  function trocarTipo(novo) {
    setTipo(novo);
    setForm(formularioInicial(novo, hoje));
    setErro(''); setDup(false); setSalvo('');
  }

  function atualizar(chave, valor) {
    setForm((f) => {
      const prox = { ...f, [chave]: valor };
      // brinco da cria: sugerido pela convenção da fazenda enquanto ninguém digitou outro
      if (tipo === 'nascimento' && (chave === 'sexo' || chave === 'data')) {
        const automatico = !f.brincoBezerro || f.brincoBezerro === f._sug;
        if (automatico) {
          const sug = sugerirBrincoBezerro(prox.data, prox.sexo, dados.eventos);
          prox.brincoBezerro = sug || '';
          prox._sug = sug || '';
        }
      }
      return prox;
    });
  }

  // Desmama: quem é a cria (mãe, nascimento) e a idade em meses e dias, calculada sozinha e editável
  const fichaDesmama = useMemo(
    () => (tipo === 'desmama' && form.brincoBezerro && String(form.brincoBezerro).trim() ? fichaAnimal(dados, form.brincoBezerro, form.data || hoje) : null),
    [tipo, form.brincoBezerro, form.data, dados, hoje],
  );
  const idadeAuto = fichaDesmama && fichaDesmama.achado ? fichaDesmama.idade : null;
  const idadeMeses = form._idadeManual ? form._meses : (idadeAuto ? String(idadeAuto.meses) : '');
  const idadeDiasTxt = form._idadeManual ? form._dias : (idadeAuto ? String(idadeAuto.dias) : '');
  function editarIdade(chave, valor) {
    setForm((f) => ({ ...f, _idadeManual: true, _meses: chave === 'm' ? valor : (f._idadeManual ? f._meses : idadeMeses), _dias: chave === 'd' ? valor : (f._idadeManual ? f._dias : idadeDiasTxt) }));
  }

  function salvar(forcar) {
    if (travado) return;
    const falt = camposFaltando(tipo, form);
    if (falt.length) { setErro(`Falta preencher: ${falt.map((c) => c.label).join(', ')}.`); setDup(false); return; }
    if (!forcar && jaExiste(tipo, form, dados)) { setDup(true); setErro(''); return; }
    setErro(''); setDup(false);
    const { _sug, _idadeManual, _meses, _dias, ...limpo } = form;
    if (tipo === 'desmama') {
      const nascData = fichaDesmama && fichaDesmama.achado ? fichaDesmama.nascData : '';
      if (_idadeManual && (String(_meses || '').trim() || String(_dias || '').trim())) limpo.idadeDias = diasDeMesesDias(nascData, _meses, _dias);
      else if (idadeAuto) limpo.idadeDias = idadeAuto.totalDias;
      else delete limpo.idadeDias;
    }
    const msg = onSalvar(tipo, limpo);
    setSalvo(msg);
    setForm(formularioInicial(tipo, hoje));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSalvo(''), 6000);
    setTravado(true);
    clearTimeout(timerTrava.current);
    timerTrava.current = setTimeout(() => setTravado(false), 1500);
  }

  const ultimos = useMemo(() => {
    const nasc = dados.eventos.filter((e) => e.tipo === 'nascimento' && e.brincoBezerro);
    const recente = (sexo) => nasc.filter((e) => e.sexo === sexo).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
    return { Macho: recente('Macho'), 'Fêmea': recente('Fêmea') };
  }, [dados.eventos]);

  const recentes = useMemo(
    () => [...dados.eventos].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 6),
    [dados.eventos],
  );

  const campos = (CAMPOS[tipo] || []).filter((c) => (!c.showIf || c.showIf(form)) && !(tipo === 'desmama' && c.key === 'idadeDias'));
  const semMatrizes = dados.matrizes.length === 0 && tipo !== 'cadastro';

  return (
    <div className="wrap">
      <div className="head">
        <div><small>Livro do rebanho</small><h1>Lançar</h1></div>
      </div>

      <IndexTabs tabs={abas} value={tipo} onChange={trocarTipo} rotulo="Tipo de lançamento" />
      <div className="sheet pad">
        {tipo === 'lote' ? (
          <LoteFoto dados={dados} hoje={hoje} onGravarLote={onGravarLote} modoTeste={modoTeste} />
        ) : tipo === 'morte' ? (
          <>
            <h2 className="h2" style={{ marginTop: 0 }}>{rotuloEvento(tipo)}</h2>
            <p className="sub" style={{ marginTop: 0 }}>Vale para qualquer animal: cria, novilha, vaca, touro ou animal sem cadastro. A vaca que morre sai da lista de vacas.</p>
            <FormMorte dados={dados} hoje={hoje} onRegistrar={onRegistrarMorte} modoTeste={modoTeste} />
          </>
        ) : (
          <>
            <h2 className="h2" style={{ marginTop: 0 }}>{rotuloEvento(tipo)}</h2>
            {semMatrizes && (
              <Aviso tipo="info">
                {ownerMode ? 'Cadastre pelo menos uma matriz em "Nova matriz" para poder ligá-la aos outros lançamentos.' : 'Ainda não há matrizes no sistema. Fale com o proprietário.'}
              </Aviso>
            )}
            {tipo === 'nascimento' && (ultimos.Macho || ultimos['Fêmea']) && (
              <div style={{ marginBottom: 16 }}>
                {['Fêmea', 'Macho'].map((sx) => (ultimos[sx] ? (
                  <Lead key={sx} rotulo={sx === 'Macho' ? 'Último macho' : 'Última fêmea'} valor={`${ultimos[sx].brincoBezerro} · ${formatarDataBR(ultimos[sx].data)}`} />
                ) : null))}
              </div>
            )}
            <div className="grid2">
              {campos.map((c) => (
                <div key={c.key} style={c.type === 'matriz' || c.key === 'observacoes' || c.key === 'motivo' ? { gridColumn: '1 / -1' } : undefined}>
                  <Campo campo={c} value={form[c.key]} onChange={atualizar} matrizes={dados.matrizes} touros={dados.touros} />
                  {tipo === 'desmama' && c.key === 'brincoBezerro' && <FichaRapida ficha={fichaDesmama} digitado={form.brincoBezerro} />}
                </div>
              ))}
              {tipo === 'desmama' && (
                <div className="fld" style={{ gridColumn: '1 / -1' }} role="group" aria-label="Idade na desmama">
                  <span className="lbl" style={{ display: 'block', font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 6 }}>Idade na desmama</span>
                  <div className="idade-md">
                    <div className="fld" style={{ margin: 0 }}>
                      <label htmlFor="idade-meses">Meses</label>
                      <input id="idade-meses" type="number" inputMode="numeric" min="0" value={idadeMeses} onChange={(e) => editarIdade('m', e.target.value)} />
                    </div>
                    <div className="fld" style={{ margin: 0 }}>
                      <label htmlFor="idade-dias">Dias</label>
                      <input id="idade-dias" type="number" inputMode="numeric" min="0" value={idadeDiasTxt} onChange={(e) => editarIdade('d', e.target.value)} />
                    </div>
                  </div>
                  <div className="hint" style={{ fontSize: 12.5, color: 'var(--mut)', marginTop: 4 }} data-testid="hint-idade">
                    {form._idadeManual
                      ? <>Idade digitada à mão.{idadeAuto ? <> Pelo nascimento seria {idadeAuto.texto}. <button type="button" className="btn quiet sm" style={{ minHeight: 30, marginLeft: 6 }} onClick={() => setForm((f) => ({ ...f, _idadeManual: false, _meses: '', _dias: '' }))}>Usar a calculada</button></> : null}</>
                      : idadeAuto ? `Calculada pelo nascimento (${formatarDataBR(fichaDesmama.nascData)}) até a data da desmama. Pode alterar se precisar.` : 'Digite o brinco da cria para calcular a idade, ou preencha à mão.'}
                  </div>
                </div>
              )}
            </div>

            {erro && <Aviso>{erro}</Aviso>}
            {dup && (
              <Aviso tipo="info">
                Esse lançamento parece já existir (mesma vaca e mesma data). Confira antes de salvar de novo.
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn sm" onClick={() => salvar(true)} disabled={travado}>Salvar mesmo assim</button>
                  <button className="btn quiet sm" onClick={() => setDup(false)}>Cancelar</button>
                </div>
              </Aviso>
            )}
            {salvo && <Aviso tipo="ok">{salvo}{modoTeste ? ' (modo teste: só na tela, nada foi para a planilha)' : ''}</Aviso>}

            <button className="btn wide" onClick={() => salvar(false)} disabled={travado} style={{ marginTop: 6 }}>
              <Save size={18} /> Salvar registro
            </button>
          </>
        )}
      </div>

      {tipo === 'morte' && <ListaMortes dados={dados} ownerMode={ownerMode} onEditar={onEditarMorte} onAnular={onAnularMorte} />}
      {tipo === 'nascimento' && ownerMode && <ListaNascimentos dados={dados} onEditar={onEditarNascimento} />}

      {tipo !== 'lote' && tipo !== 'morte' && !(tipo === 'nascimento' && ownerMode) && (
        <>
          <h2 className="h2">Últimos lançamentos</h2>
          <div className="sheet">
            {recentes.length === 0 ? <div className="empty">Nada lançado ainda.</div> : recentes.map((e) => (
              <div className="led-r" key={e.id} style={{ '--cols': '1fr auto', minHeight: 48 }}>
                <span style={{ fontSize: 14.5 }}>{descreverEvento(e, dados)}</span>
                <span className="m mut">{formatarDataBR(e.data)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
