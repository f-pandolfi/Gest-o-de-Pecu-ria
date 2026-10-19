// Monta testes/saida/site: o site de verdade (site9) + bibliotecas locais no lugar do esm.sh (o teste roda sem internet)
import { build } from 'esbuild';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const OUT = 'testes/saida/site';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(`${OUT}/vendor`, { recursive: true });
fs.mkdirSync('testes/saida/tmp', { recursive: true });

// Um pacote só (uma única cópia do React) e um arquivo pequeno por nome do importmap reexportando dele
fs.writeFileSync('testes/saida/tmp/todos.js', "import * as R from 'react';\nimport * as RDC from 'react-dom/client';\nimport * as LUC from 'lucide-react';\nimport * as X from 'xlsx';\nexport { R, RDC, LUC, X };\n");
await build({ bundle: true, format: 'esm', target: 'es2020', logLevel: 'error', define: { 'process.env.NODE_ENV': '"production"' }, entryPoints: ['testes/saida/tmp/todos.js'], outfile: `${OUT}/vendor/todos.js` });
const nomes = (m) => Object.keys(require(m)).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k) && k !== 'default');
const embrulho = (ns, chaves, comDefault) => `import { ${ns} } from './todos.js';\n${comDefault ? `export default (${ns}.default || ${ns});\n` : ''}export const { ${chaves.join(', ')} } = ${ns};\n`;
fs.writeFileSync(`${OUT}/vendor/react.js`, embrulho('R', nomes('react'), true));
fs.writeFileSync(`${OUT}/vendor/react-dom-client.js`, embrulho('RDC', nomes('react-dom/client'), true));
fs.writeFileSync(`${OUT}/vendor/lucide-react.js`, embrulho('LUC', nomes('lucide-react'), false));
fs.writeFileSync(`${OUT}/vendor/xlsx.js`, embrulho('X', nomes('xlsx'), false));
for (const f of ['app.js', 'logica.js', 'pdf.js', 'sw.js']) fs.copyFileSync(`site9/${f}`, `${OUT}/${f}`);
const modo = process.argv[2] || 'producao';
let html = fs.readFileSync('../teste/index.html.v95', 'utf8');
if (modo === 'producao') html = html.replace(/<!-- MODO TESTE[^\n]*\n<script>window.MODO_TESTE = true;<\/script>\n/, '');
html = html.replace(/<link[^>]*fonts[^>]*>\n/g, '')
  .replace(/"react": "[^"]+"/, '"react": "./vendor/react.js"')
  .replace(/"react-dom": "[^"]+",\n/, '')
  .replace(/"react-dom\/client": "[^"]+"/, '"react-dom/client": "./vendor/react-dom-client.js"')
  .replace(/"lucide-react": "[^"]+"/, '"lucide-react": "./vendor/lucide-react.js"')
  .replace(/"xlsx": "[^"]+"/, '"xlsx": "./vendor/xlsx.js"')
  .replace('<div id="root"></div>', '<div id="root"></div>\n<script>window.__URL_PLANILHA__ = location.origin + "/exec";</script>');
fs.writeFileSync(`${OUT}/index.html`, html);
console.log('site de teste pronto em', OUT, `(${modo})`);
