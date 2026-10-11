// Gera site9/app.js (app inteiro, módulo ES) e site9/logica.js (só as regras, usado também pela integração por foto)
import { build } from 'esbuild';
import fs from 'fs';
fs.mkdirSync('site9', { recursive: true });
await build({
  entryPoints: ['src/app.jsx'], bundle: true, format: 'esm', outfile: 'site9/app.js',
  external: ['react', 'react-dom/client', 'lucide-react', 'xlsx'],
  jsx: 'transform', target: 'es2020', loader: { '.js': 'jsx' }, logLevel: 'info', legalComments: 'none',
});
fs.copyFileSync('src/logica.js', 'site9/logica.js');
console.log('ok', fs.statSync('site9/app.js').size, 'bytes');
