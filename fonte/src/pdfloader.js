// Carrega o gerador de PDF (pdf.js, arquivo separado) só quando alguém pede um PDF.
// O service worker guarda o pdf.js no celular, então funciona também sem internet.
import { VERSAO_APP } from './logica.js';

const VERSAO_ARQ = VERSAO_APP.split(' ')[0];

export async function baixarPDF(rel, opcoes) {
  const url = new URL(`./pdf.js?v=${VERSAO_ARQ}`, import.meta.url).href;
  const mod = await import(/* @vite-ignore */ url);
  return mod.gerarPDF(rel, opcoes);
}
