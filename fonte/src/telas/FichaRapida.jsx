// Cartão que aparece ao digitar um brinco (Pesar e Desmama): quem é, idade em meses e dias, nascimento, mãe e último peso.
import React from 'react';
import { formatarDataBR } from '../logica.js';
import { fmtKg } from '../util.js';

export default function FichaRapida({ ficha, digitado, ocultarSemPeso }) {
  if (!digitado || !String(digitado).trim()) return null;
  if (!ficha || !ficha.achado) {
    if (String(digitado).trim().length < 3) return null;
    return <div className="ficha-rapida ruim" data-testid="ficha-rapida" role="status">Brinco {String(digitado).trim()} não encontrado (cria ou novilha). Confira o número.</div>;
  }
  if (ficha.jaMorto) {
    return <div className="ficha-rapida ruim" data-testid="ficha-rapida" role="status"><b>{ficha.brinco}</b> · Este animal morreu{ficha.mortoEm ? ` em ${formatarDataBR(ficha.mortoEm)}` : ''}. Não dá para pesar.</div>;
  }
  if (ficha.jaVendido) {
    return <div className="ficha-rapida ruim" data-testid="ficha-rapida" role="status"><b>{ficha.brinco}</b> · Este animal já foi vendido{ficha.vendidoEm ? ` em ${formatarDataBR(ficha.vendidoEm)}` : ''}.</div>;
  }
  const tipo = ficha.categoria && ficha.categoria !== 'Cria' ? ficha.categoria : (ficha.sexo === 'Fêmea' ? 'Bezerra' : ficha.sexo === 'Macho' ? 'Bezerro' : 'Cria');
  return (
    <div className={`ficha-rapida${ficha.mesmaData && ficha.mesmaData.length ? ' atencao' : ''}`} data-testid="ficha-rapida" role="status">
      <div><b>{ficha.brinco}</b> · {tipo}{ficha.sexo && tipo !== 'Bezerro' && tipo !== 'Bezerra' ? ` · ${ficha.sexo}` : ''}</div>
      <div className="lin">
        <span>Idade <b>{ficha.idade ? ficha.idade.texto : '?'}</b></span>
        <span>Nasceu <b>{ficha.nascData ? formatarDataBR(ficha.nascData) : '?'}</b></span>
        <span>Mãe <b>{ficha.maeBrinco || '—'}</b></span>
      </div>
      {!ocultarSemPeso && (
        <div className="lin">
          {ficha.ultimoPeso
            ? <span>Último peso <b>{fmtKg(ficha.ultimoPeso.peso)}</b> em {formatarDataBR(ficha.ultimoPeso.data)}</span>
            : <span><b>Ainda não foi pesado</b></span>}
          {ficha.desmamaData ? <span>Desmama em <b>{formatarDataBR(ficha.desmamaData)}</b></span> : null}
        </div>
      )}
    </div>
  );
}
