// Conversa com a planilha (Apps Script). Em MODO TESTE nada é enviado: só lê.
export const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbyDBTMVGJGeBj92qtiIRfrzZciWyzgP8mvDx8inCjdvVBb2Erm5laJyuuiwx8YjJQlI/exec';

// A página de teste define window.MODO_TESTE = true antes de carregar o app.
export const MODO_TESTE = typeof window !== 'undefined' && window.MODO_TESTE === true;

// Nos testes automáticos a página pode trocar o endereço da planilha por um simulador local.
const URL_API = (typeof window !== 'undefined' && window.__URL_PLANILHA__) || SHEETS_API_URL;

// No modo teste guardamos aqui o que SERIA gravado (serve para conferir nos testes automáticos).
if (typeof window !== 'undefined') window.__gravacoesSimuladas = window.__gravacoesSimuladas || [];

// Erro de rede (sem internet, internet caindo, demora demais): o lançamento fica na fila e é reenviado depois.
function erroDeRede(msg) { const e = new Error(msg); e.rede = true; return e; }

async function buscar(url, opcoes, limiteMs) {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), limiteMs) : null;
  try {
    return await fetch(url, { ...(opcoes || {}), ...(ctl ? { signal: ctl.signal } : {}) });
  } catch (e) {
    throw erroDeRede(e && e.name === 'AbortError' ? 'a internet está lenta demais (sem resposta)' : 'sem internet');
  } finally {
    if (t) clearTimeout(t);
  }
}

export async function lerTudo() {
  const res = await buscar(`${URL_API}?action=getAll`, undefined, 30000);
  let data;
  try { data = await res.json(); } catch (e) { throw erroDeRede('a planilha não respondeu direito'); }
  if (data && data.error) throw new Error(data.error);
  return data;
}

// Envia uma gravação e CONFERE a resposta (um erro devolvido pela planilha não pode passar despercebido)
export async function postar(payload) {
  if (MODO_TESTE) {
    // simula a falta de internet para dar para testar a fila no modo teste
    if (typeof navigator !== 'undefined' && navigator.onLine === false) throw erroDeRede('sem internet');
    window.__gravacoesSimuladas.push(payload);
    await new Promise((r) => setTimeout(r, 150));
    return { ok: true, simulado: true };
  }
  const res = await buscar(URL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }, 45000);
  let data = null;
  try { data = await res.json(); } catch (e) { throw erroDeRede('a planilha não respondeu direito'); }
  if (data && data.error) throw new Error(data.error);
  return data;
}
