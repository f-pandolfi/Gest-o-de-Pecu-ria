// Tela "Crias": acompanhamento das crias do nascimento até a desmama, a venda por peso e a escolha das novilhas.
// Funcionário: vê a lista e pesa. Proprietário (com a senha): também desmama, analisa a venda, vende e decide o destino das novilhas.
import React, { useState, useMemo, useEffect } from 'react';
import { listarCrias } from '../logica.js';
import { IndexTabs } from '../ui.jsx';
import ListaCrias from './CriasLista.jsx';
import Pesar from './CriasPesar.jsx';
import ParaVender from './CriasParaVender.jsx';
import Vendas from './CriasVendas.jsx';
import Novilhas from './CriasNovilhas.jsx';

export default function Crias({
  dados, hoje, ownerMode, modoTeste, onLancar, onGravarLote, onVender, onSalvarMatriz, onSalvarConfig,
}) {
  const [aba, setAba] = useState('lista');
  const [vendaPreset, setVendaPreset] = useState(null); // { brincos: [...], n } vindo de "Para vender" / "Novilhas" / ficha da cria
  const [vendasAberta, setVendasAberta] = useState(false); // a tela de vendas fica montada depois da 1ª visita, para não perder o que foi digitado ao trocar de aba
  const crias = useMemo(() => listarCrias(dados, hoje), [dados, hoje]);

  const abas = [
    { id: 'lista', label: 'Crias' },
    { id: 'pesar', label: 'Pesar' },
    ...(ownerMode ? [{ id: 'vender', label: 'Para vender' }, { id: 'novilhas', label: 'Novilhas' }, { id: 'vendas', label: 'Vendas' }] : []),
  ];

  // Se o app foi travado de novo (voltou a funcionário) numa aba do proprietário, volta para a lista
  useEffect(() => {
    if (!abas.some((a) => a.id === aba)) setAba('lista');
    if (!ownerMode) setVendasAberta(false);
  }, [ownerMode]); // eslint-disable-line react-hooks/exhaustive-deps

  function irParaVenda(brincos) {
    setVendaPreset({ brincos, n: Date.now() });
    setVendasAberta(true);
    setAba('vendas');
  }
  function mudarAba(id) {
    if (id === 'vendas') setVendasAberta(true);
    setAba(id);
  }

  return (
    <div className="wrap">
      <div className="head">
        <div><small>Livro do rebanho</small><h1>Crias</h1></div>
      </div>

      <IndexTabs tabs={abas} value={aba} onChange={mudarAba} rotulo="Crias" />

      {aba === 'lista' && (
        <ListaCrias crias={crias} dados={dados} hoje={hoje} ownerMode={ownerMode} onLancar={onLancar} onVender={irParaVenda} onSalvarMatriz={onSalvarMatriz} />
      )}
      {aba === 'pesar' && (
        <Pesar dados={dados} hoje={hoje} crias={crias} ownerMode={ownerMode} modoTeste={modoTeste} onGravarLote={onGravarLote} />
      )}
      {aba === 'vender' && ownerMode && (
        <ParaVender crias={crias} dados={dados} hoje={hoje} onSalvarConfig={onSalvarConfig} onVender={irParaVenda} modoTeste={modoTeste} />
      )}
      {aba === 'novilhas' && ownerMode && (
        <Novilhas dados={dados} hoje={hoje} onSalvarMatriz={onSalvarMatriz} onVender={irParaVenda} />
      )}
      {ownerMode && vendasAberta && (
        <div hidden={aba !== 'vendas'}>
          <Vendas dados={dados} hoje={hoje} crias={crias} preset={vendaPreset} onVender={onVender} modoTeste={modoTeste} />
        </div>
      )}
    </div>
  );
}
