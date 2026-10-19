// Servidor dos testes de navegador: entrega o site (testes/saida/site) e simula a planilha (Code_v11.gs no simulador).
// Controles para os testes: GET /__estado (o que está na planilha), POST /__reset, POST /__perderResposta (a próxima
// gravação chega na planilha mas a resposta "se perde", como internet caindo no meio), POST /__erroProximo (a planilha recusa).
const http = require('http');
const fs = require('fs');
const path = require('path');
const { carregarScript } = require('./simulador.cjs');
const { dadosExemplo } = require('./dados_exemplo.cjs');

const PORTA = Number(process.argv[2] || 8765);
const SITE = path.join(__dirname, 'saida', 'site');
const GS = path.join(__dirname, '..', process.argv[3] || 'Code_v11.gs');
let gs; let perder = 0; let erroProximo = 0; let posts = [];
function reset() {
  gs = carregarScript(GS);
  gs.post({ action: 'syncAll', ...dadosExemplo(), forcar: true });
  perder = 0; erroProximo = 0; posts = [];
}
reset();

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const cors = { 'Access-Control-Allow-Origin': '*' };

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORTA}`);
  let corpo = '';
  req.on('data', (c) => { corpo += c; });
  req.on('end', () => {
    if (url.pathname === '/exec') {
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
        return res.end(JSON.stringify(gs.get(url.searchParams.get('action'))));
      }
      const body = JSON.parse(corpo);
      posts.push(body);
      if (erroProximo > 0) { erroProximo--; res.writeHead(200, { 'Content-Type': 'application/json', ...cors }); return res.end(JSON.stringify({ error: 'erro de teste da planilha' })); }
      const r = gs.post(body);
      if (perder > 0) { perder--; res.socket.destroy(); return undefined; } // gravou, mas a resposta não chega
      res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
      return res.end(JSON.stringify(r));
    }
    if (url.pathname === '/__estado') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ ...gs.get(), posts })); }
    if (url.pathname === '/__reset') { reset(); res.writeHead(200); return res.end('ok'); }
    if (url.pathname === '/__perderResposta') { perder = Number(url.searchParams.get('n') || 1); res.writeHead(200); return res.end('ok'); }
    if (url.pathname === '/__erroProximo') { erroProximo = Number(url.searchParams.get('n') || 1); res.writeHead(200); return res.end('ok'); }
    const arq = path.join(SITE, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname));
    if (!arq.startsWith(SITE) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.writeHead(404); return res.end('nao achei'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    return res.end(fs.readFileSync(arq));
  });
}).listen(PORTA, () => console.log(`servidor de teste em http://localhost:${PORTA} (${path.basename(GS)})`));
