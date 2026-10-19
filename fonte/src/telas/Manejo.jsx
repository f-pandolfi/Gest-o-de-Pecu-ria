// Tela "Manejo" (curral): Protocolos (IATF e monta), Toque geral e Vacinas. Funcionário lança; o dono cria protocolos.
import React, { useState } from 'react';
import { IndexTabs } from '../ui.jsx';
import Protocolos from './Protocolos.jsx';
import Toque from './Toque.jsx';
import Vacinas from './Vacinas.jsx';
import { pendenciasVacinas } from '../manejo.js';

export default function Manejo({ dados, hoje, ownerMode, modoTeste, onGravarLote, onSalvarProtocolo, onSalvarConfig }) {
  const [aba, setAba] = useState('protocolos');
  const [novo, setNovo] = useState(null);
  const [volta, setVolta] = useState(0); // tocar de novo na aba volta para o começo dela
  const pend = pendenciasVacinas(dados, dados.config, hoje).filter((p) => p.nivel !== 'futura').length;
  const ativos = (dados.protocolos || []).filter((p) => p.status !== 'Encerrado').length;
  return (
    <div className="wrap">
      <div className="head"><div><small>Curral</small><h1>Manejo</h1></div></div>
      <IndexTabs
        rotulo="Manejo" value={aba} onChange={(a) => { setAba(a); setVolta((n) => n + 1); }}
        tabs={[{ id: 'protocolos', label: 'Protocolos', count: ativos }, { id: 'toque', label: 'Toque' }, { id: 'vacinas', label: 'Vacinas', count: pend }]}
      />
      {aba === 'protocolos' && (
        <Protocolos key={`p${volta}`} dados={dados} hoje={hoje} ownerMode={ownerMode} modoTeste={modoTeste} onSalvarProtocolo={onSalvarProtocolo} onGravarLote={onGravarLote} abrirNovo={novo} onNovoConsumido={() => setNovo(null)} />
      )}
      {aba === 'toque' && (
        <Toque key={`t${volta}`} dados={dados} hoje={hoje} ownerMode={ownerMode} modoTeste={modoTeste} onGravarLote={onGravarLote}
          onMontarProtocolo={(ids) => { setNovo({ tipo: 'IATF', animais: ids, nome: '' }); setAba('protocolos'); setVolta((n) => n + 1); }} />
      )}
      {aba === 'vacinas' && <Vacinas key={`v${volta}`} dados={dados} hoje={hoje} ownerMode={ownerMode} modoTeste={modoTeste} onGravarLote={onGravarLote} onSalvarConfig={onSalvarConfig} />}
    </div>
  );
}
