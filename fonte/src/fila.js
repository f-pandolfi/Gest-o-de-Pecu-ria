// Fila de gravações guardada no próprio celular (v9.5).
// Todo lançamento entra primeiro aqui (memória permanente do aparelho) e depois vai para a planilha, um de cada vez, na ordem.
// Sem internet ele fica guardado e é reenviado sozinho quando a internet volta (e sempre que o app abre).
// A planilha (script v11) ignora linha com id repetido, então reenviar algo que já tinha chegado não duplica.
import { postar, MODO_TESTE } from './api.js';

const PREFIXO = MODO_TESTE ? 'gp-teste-' : 'gp-';
export const CHAVE_FILA = `${PREFIXO}fila-v1`;
export const CHAVE_DADOS = `${PREFIXO}dados-v1`;
export const CHAVE_RASCUNHO_PESAR = `${PREFIXO}rascunho-pesar-v1`;

function ler(chave, padrao) {
  try { const t = localStorage.getItem(chave); return t ? JSON.parse(t) : padrao; } catch (e) { return padrao; }
}
function gravarLocal(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); return true; } catch (e) { console.error('Não consegui guardar no celular', e); return false; }
}
export const lerLocal = ler;
export const gravarNoCelular = gravarLocal;
export function apagarLocal(chave) { try { localStorage.removeItem(chave); } catch (e) { /* nada */ } }

let itens = ler(CHAVE_FILA, []);
let enviando = false;
let timer = null;
const ouvintes = new Set();
const enviadosRecentes = []; // o que chegou na planilha nesta sessão (para não sumir da tela se chegou durante uma releitura)
export function enviadosDesde(ms) { return enviadosRecentes.filter((x) => x.quando >= ms).map((x) => ({ payload: x.payload })); }

function salvar() { gravarLocal(CHAVE_FILA, itens); }
function avisar() { const est = estadoFila(); ouvintes.forEach((fn) => fn(est)); }

export function estadoFila() {
  const comErro = itens.find((i) => i.erro);
  return {
    itens: itens.slice(),
    pendentes: itens.length,
    enviando,
    semInternet: !!(comErro && comErro.rede) || (typeof navigator !== 'undefined' && navigator.onLine === false && itens.length > 0),
    erroPlanilha: comErro && !comErro.rede ? comErro.erro : '',
  };
}

export function assinarFila(fn) { ouvintes.add(fn); fn(estadoFila()); return () => ouvintes.delete(fn); }

let seq = 0;
// payloads: lista de comandos para a planilha (na ordem). rotulo: o que é, para mostrar na lista de pendentes.
export function enfileirar(payloads, rotulo) {
  const agora = new Date().toISOString();
  (payloads || []).forEach((p) => {
    seq += 1;
    itens.push({ uid: `${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 6)}`, payload: p, rotulo: rotulo || '', criadoEm: agora, tentativas: 0, erro: '', rede: false });
  });
  salvar(); avisar();
  enviar();
}

function agendar(ms) {
  clearTimeout(timer);
  timer = setTimeout(() => enviar(), ms);
}

// Manda o que está na fila, um de cada vez. Para no primeiro que falhar (a ordem importa: matriz depois do evento etc.).
export async function enviar() {
  if (enviando || itens.length === 0) return estadoFila();
  enviando = true; avisar();
  try {
    while (itens.length) {
      const it = itens[0];
      try {
        await postar(it.payload);
        itens = itens.filter((x) => x.uid !== it.uid);
        enviadosRecentes.push({ quando: Date.now(), payload: it.payload });
        if (enviadosRecentes.length > 200) enviadosRecentes.splice(0, enviadosRecentes.length - 200);
        salvar(); avisar();
      } catch (e) {
        it.tentativas += 1; it.erro = e.message || 'erro'; it.rede = !!e.rede; it.ultimaTentativa = new Date().toISOString();
        salvar();
        agendar(it.rede ? 20000 : 60000);
        break;
      }
    }
  } finally {
    enviando = false; avisar();
  }
  return estadoFila();
}

// Só o proprietário: tira da fila um item que a planilha recusa sempre (senão ele trava os outros).
export function descartar(uid) {
  itens = itens.filter((x) => x.uid !== uid);
  salvar(); avisar();
  enviar();
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => enviar());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') enviar(); });
  window.__fila = { estadoFila, enviar }; // para os testes automáticos
}
