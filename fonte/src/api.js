// Conversa com a planilha (Apps Script). Em MODO TESTE nada é enviado: só lê.
export const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbyDBTMVGJGeBj92qtiIRfrzZciWyzgP8mvDx8inCjdvVBb2Erm5laJyuuiwx8YjJQlI/exec';

// A página de teste define window.MODO_TESTE = true antes de carregar o app.
export const MODO_TESTE = typeof window !== 'undefined' && window.MODO_TESTE === true;

// No modo teste guardamos aqui o que SERIA gravado (serve para conferir nos testes automáticos).
if (typeof window !== 'undefined') window.__gravacoesSimuladas = window.__gravacoesSimuladas || [];

export async function lerTudo() {
  const res = await fetch(`${SHEETS_API_URL}?action=getAll`);
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

// Envia uma gravação e CONFERE a resposta (um erro devolvido pela planilha não pode passar despercebido)
export async function postar(payload) {
  if (MODO_TESTE) {
    window.__gravacoesSimuladas.push(payload);
    await new Promise((r) => setTimeout(r, 150));
    return { ok: true, simulado: true };
  }
  const res = await fetch(SHEETS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  let data = null;
  try { data = await res.json(); } catch (e) { throw new Error('a planilha não respondeu direito'); }
  if (data && data.error) throw new Error(data.error);
  return data;
}
