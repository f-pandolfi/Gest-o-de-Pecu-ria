// Gera o site em site9/: app.js (app inteiro, módulo ES), logica.js (só as regras, usado também pela integração por foto),
// pdf.js (gerador de PDF, carregado só quando pedem um PDF) e sw.js (guarda o app no celular para abrir sem internet).
import { build } from 'esbuild';
import fs from 'fs';
fs.mkdirSync('site9', { recursive: true });
await build({
  entryPoints: ['src/app.jsx'], bundle: true, format: 'esm', outfile: 'site9/app.js',
  external: ['react', 'react-dom/client', 'lucide-react', 'xlsx'],
  jsx: 'transform', target: 'es2020', loader: { '.js': 'jsx' }, logLevel: 'info', legalComments: 'none',
});
await build({
  entryPoints: ['src/pdf.js'], bundle: true, format: 'esm', outfile: 'site9/pdf.js', minify: true,
  target: 'es2020', logLevel: 'info', legalComments: 'none',
  // partes opcionais do jsPDF que o app não usa (HTML, SVG, comprimir imagem)
  external: ['html2canvas', 'dompurify', 'canvg'],
});
fs.copyFileSync('src/logica.js', 'site9/logica.js');
fs.copyFileSync('src/sw.js', 'site9/sw.js');
for (const f of ['app.js', 'pdf.js', 'sw.js']) console.log(f, fs.statSync(`site9/${f}`).size, 'bytes');
