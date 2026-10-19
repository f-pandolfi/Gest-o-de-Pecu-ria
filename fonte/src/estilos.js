// Estilos do app (paleta "A": verde-escuro com âmbar; dados em formato de caderno/livro do "C").
// Tudo em classes + variáveis CSS; o celular usa menu embaixo, o computador usa menu lateral.
export const CSS = `
:root{
  --bg:#131B16; --s1:#1C2620; --s2:#243029; --line:#33423A; --line2:#2B382F;
  --tx:#EFEADD; --mut:#A9B5AA; --amber:#E0A458; --amber-bg:rgba(224,164,88,.14);
  --green:#8DBB78; --late:#F0937A; --late-bg:rgba(240,147,122,.14); --blue:#8FB4C9;
  --disp:'Newsreader',Georgia,'Times New Roman',serif;
  --body:'Instrument Sans',system-ui,-apple-system,'Segoe UI',sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--tx);font-family:var(--body);-webkit-text-size-adjust:100%}
button,input,select,textarea{font-family:inherit;color:inherit}
button{cursor:pointer}
button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:2px solid var(--amber);outline-offset:2px}
.num{font-family:var(--mono);font-variant-numeric:tabular-nums}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* ---- estrutura ---- */
.app{min-height:100vh;display:flex}
.side{display:none}
.main{flex:1;min-width:0;padding-bottom:calc(84px + env(safe-area-inset-bottom))}
.wrap{max-width:1000px;margin:0 auto;padding:0 16px}
.topbar{position:sticky;top:0;z-index:20;background:rgba(19,27,22,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.topbar .in{max-width:1000px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:10px}
.brand{display:flex;flex-direction:column;line-height:1.05;min-width:0;flex:1}
.brand small{font:600 10.5px var(--mono);letter-spacing:.14em;color:var(--amber);text-transform:uppercase}
.brand b{font:600 21px var(--disp);letter-spacing:.005em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 10px;border-radius:6px;border:1px solid var(--line);background:var(--s1);color:var(--tx);font:600 12.5px var(--mono);letter-spacing:.04em}
.chip select{appearance:none;-webkit-appearance:none;background:transparent;border:none;font:600 12.5px var(--mono);color:inherit;padding:0 2px;height:100%;cursor:pointer}
.chip select option{background:var(--s1);color:var(--tx)}
.chip.lock{width:40px;justify-content:center;padding:0}
.chip.on{border-color:var(--amber);color:var(--amber)}
.chip.fila-off{border-color:var(--amber);color:var(--amber);background:var(--amber-bg)}
.chip.fila-erro{border-color:var(--late);color:var(--late);background:var(--late-bg)}
.lado-fila{display:none}
@media (min-width:900px){.lado-fila{display:flex;justify-content:flex-end;max-width:1000px;margin:12px auto 0;padding:0 16px}}
.ficha-rapida{border:1px solid var(--line);border-left:3px solid var(--green);border-radius:6px;background:var(--s2);padding:9px 12px;margin:8px 0 12px;font-size:13.5px;line-height:1.5}
.ficha-rapida b{font:600 15px var(--mono)}
.ficha-rapida .lin{display:flex;flex-wrap:wrap;gap:4px 14px;color:var(--mut)}
.ficha-rapida .lin span b{font:600 13.5px var(--body);color:var(--tx)}
.ficha-rapida.ruim{border-left-color:var(--late)}
.ficha-rapida.atencao{border-left-color:var(--amber)}
.tag2x{display:inline-block;font:700 11px var(--mono) !important;padding:1px 6px;border-radius:4px;background:var(--amber);color:#1B140A !important;margin-left:6px;vertical-align:middle;letter-spacing:.03em}
.idade-md{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.apl-lin{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 40px;gap:8px;align-items:center;margin-bottom:8px}
.apl-lin select,.apl-lin input{min-height:44px}
.contador{font:600 13px var(--mono);letter-spacing:.04em;color:var(--amber);text-transform:uppercase;margin-top:6px}
.marcar{border:1px solid var(--line);border-radius:8px;overflow:hidden;margin-top:10px;background:var(--s1)}
.marca-lin{border-bottom:1px solid var(--line2);border-left:4px solid transparent}
.marca-lin.on{border-left-color:var(--green);background:rgba(141,187,120,.08)}
.marca-bt{display:grid;grid-template-columns:32px 80px minmax(0,1fr);gap:10px;align-items:center;width:100%;min-height:58px;padding:6px 12px;background:transparent;border:none;color:inherit;text-align:left}
.marca-bt .caixa{width:28px;height:28px;border-radius:6px;border:2px solid var(--line);display:grid;place-items:center;color:#1B140A}
.marca-lin.on .caixa{background:var(--green);border-color:var(--green)}
.marca-bt .b{font:600 18px var(--mono)}
.marca-bt .two{display:flex;flex-direction:column;line-height:1.3;min-width:0}
.marca-bt .two b{font-size:14.5px;font-weight:600}
.marca-bt .two span{font-size:12.5px;color:var(--mut)}
.marca-bt .two span.late{color:var(--late)}
.marca-extra{padding:0 12px 10px 56px}
.marca-extra select{min-height:40px}
.pills{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
.pills button{min-height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--line);background:var(--bg);color:var(--tx);font:600 13px var(--body)}
.pills button[aria-pressed=true]{border-color:var(--amber);color:var(--amber);background:var(--amber-bg)}
.toque-lin{border-bottom:1px solid var(--line2);padding:10px 14px;border-left:4px solid transparent}
.toque-lin.cheia{border-left-color:var(--green)}
.toque-lin.vazia{border-left-color:var(--amber)}
.toque-lin.descarte{border-left-color:var(--late)}
.toque-lin.ausente{opacity:.6}
.toque-lin .cab{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.toque-lin .cab .b{font:600 22px var(--mono)}
.toque-lin .info{font-size:12.8px;color:var(--mut);line-height:1.45;margin-top:2px}
.toque-lin .info b{color:var(--tx);font-weight:600}
.res-bts{display:grid;grid-template-columns:repeat(auto-fit,minmax(78px,1fr));gap:6px;margin-top:8px}
.res-bts button{min-height:46px;border-radius:6px;border:1.5px solid var(--line);background:var(--bg);color:var(--tx);font:700 14px var(--body)}
.res-bts button.cheia[aria-pressed=true]{background:var(--green);border-color:var(--green);color:#10200F}
.res-bts button.vazia[aria-pressed=true]{background:var(--amber);border-color:var(--amber);color:#1B140A}
.res-bts button.descarte[aria-pressed=true]{background:var(--late);border-color:var(--late);color:#250C06}
.res-bts button.aus[aria-pressed=true]{background:var(--s2);border-color:var(--mut)}
.toque-lin .mais{display:grid;grid-template-columns:110px minmax(0,1fr);gap:8px;margin-top:8px;align-items:center}
.toque-lin .mais input,.toque-lin .mais select{min-height:42px}
.toque-lin .calc{font-size:12.8px;color:var(--green);margin-top:6px;line-height:1.4}
.toque-lin .avs{font-size:12.8px;color:var(--late);margin-top:6px}
.card-prot{display:block;width:100%;text-align:left;background:var(--s1);border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin-bottom:10px;color:inherit}
.card-prot b{font:600 17px var(--body)}
.card-prot .l2{font-size:13px;color:var(--mut);margin-top:3px;line-height:1.45}
.card-prot .prox{font:600 12.5px var(--mono);color:var(--amber);margin-top:6px;text-transform:uppercase;letter-spacing:.04em}
.manejo-lin{display:grid;grid-template-columns:62px 92px minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line2);font-size:14px}
.manejo-lin .d{font:600 15px var(--mono);color:var(--amber)}
.manejo-ed{display:grid;grid-template-columns:76px minmax(0,1fr) 40px;gap:6px;align-items:start;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--line2)}
.manejo-ed>div{grid-column:1/-1;grid-row:2}
.manejo-ed input,.manejo-ed textarea{min-height:42px}
.manejo-ed textarea{grid-column:3/4;min-height:42px}
.vac-tag{display:inline-block;font:600 11.5px var(--body);padding:2px 7px;border-radius:4px;margin-top:4px}
.vac-tag.ok{background:rgba(141,187,120,.15);color:var(--green)}
.vac-tag.pendente{background:var(--amber-bg);color:var(--amber)}
.vac-tag.atrasada{background:var(--late-bg);color:var(--late)}
.grp-vac{border:1px solid var(--line);border-radius:8px;margin-bottom:14px;overflow:hidden;background:var(--s1)}
.grp-vac>header{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;background:var(--s2);flex-wrap:wrap}
.grp-vac>header b{font:600 16px var(--body)}



.bnav{position:fixed;left:0;right:0;bottom:0;z-index:30;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;height:calc(64px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:var(--s1);border-top:1px solid var(--line)}
.bnav button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:none;background:transparent;color:var(--mut);font:600 10.5px var(--mono);letter-spacing:.07em;text-transform:uppercase;border-top:3px solid transparent;margin-top:-1px;min-width:0}
.bnav button[aria-current=page]{color:var(--amber);border-top-color:var(--amber);background:var(--bg)}
.bnav svg{width:21px;height:21px}
.bnav.mini button{font-size:9.5px;letter-spacing:.02em}
.sel-row .two b{white-space:nowrap}
.sel-row .two span{font-size:13px;line-height:1.25}

.banner-teste{background:var(--amber);color:#1B140A;font:600 12.5px var(--body);padding:8px 16px;display:flex;gap:10px;align-items:center;justify-content:center;text-align:center;flex-wrap:wrap}
.banner-teste button{border:1.5px solid #1B140A;background:transparent;border-radius:5px;padding:3px 10px;font:600 12px var(--mono);color:#1B140A}
.aviso{display:flex;gap:10px;align-items:flex-start;background:var(--late-bg);border:1px solid var(--late);border-radius:8px;padding:10px 12px;margin:14px 0;font-size:14px;line-height:1.4}
.aviso.info{background:var(--amber-bg);border-color:var(--amber)}
.aviso.ok{background:rgba(141,187,120,.12);border-color:var(--green)}
.aviso button.x{margin-left:auto;background:none;border:none;color:var(--mut);padding:2px}

@media (min-width:900px){
  .side{display:flex;flex-direction:column;width:244px;flex:none;position:sticky;top:0;height:100vh;padding:22px 16px;background:var(--s1);border-right:1px solid var(--line);gap:6px}
  .side .brand{margin-bottom:18px;padding:0 6px;flex:none}
  .side .brand b{font-size:25px;white-space:normal}
  .side nav{display:flex;flex-direction:column;gap:2px}
  .side nav button{display:flex;align-items:center;gap:12px;height:46px;padding:0 12px;border:none;border-left:3px solid transparent;border-radius:0 6px 6px 0;background:transparent;color:var(--mut);font:600 14px var(--body);text-align:left}
  .side nav button svg{width:19px;height:19px;flex:none}
  .side nav button:hover{background:var(--s2);color:var(--tx)}
  .side nav button[aria-current=page]{background:var(--s2);color:var(--amber);border-left-color:var(--amber)}
  .side .foot{margin-top:auto;display:flex;flex-direction:column;gap:8px}
  .side .chip{height:42px;width:100%;justify-content:space-between}
  .bnav{display:none}
  .topbar{display:none}
  .main{padding-bottom:48px}
  .wrap{padding:0 28px}
}

/* ---- títulos de tela ---- */
.head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px;padding:22px 0 14px}
.head small{display:block;white-space:nowrap;font:600 11px var(--mono);letter-spacing:.14em;color:var(--amber);text-transform:uppercase;margin-bottom:4px}
.head h1{margin:0;font:600 34px/1 var(--disp);letter-spacing:-.005em}
.head .acts{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;align-items:center;margin-left:auto}
.sub{color:var(--mut);font-size:14px;line-height:1.45;margin:0 2px 14px}
.h2{font:600 21px var(--disp);margin:26px 0 10px;display:flex;align-items:baseline;gap:10px}
.h2 small{font:500 12px var(--mono);color:var(--mut);letter-spacing:.04em}

/* ---- abas de índice (caderno) ---- */
.itabs{display:flex;gap:4px;overflow-x:auto;margin-bottom:-1px;position:relative;z-index:1;scrollbar-width:none;padding-top:2px}
.itabs::-webkit-scrollbar{display:none}
.itab{flex:none;height:44px;padding:0 16px;border:1px solid var(--line);border-bottom:none;border-radius:8px 8px 0 0;background:var(--bg);color:var(--mut);font:600 12px var(--mono);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.itab[aria-selected=true]{background:var(--s1);color:var(--amber);box-shadow:inset 0 3px 0 var(--amber);height:46px;margin-top:-2px}
.sheet{border:1px solid var(--line);border-radius:0 8px 8px 8px;background:var(--s1);box-shadow:4px 4px 0 rgba(0,0,0,.28)}
.sheet.pad{padding:16px}
@media (min-width:600px){.sheet.pad{padding:22px}}

/* ---- formulários ---- */
.fld{margin-bottom:14px}
.fld>label,.fld>.lbl{display:block;font:600 11.5px var(--mono);letter-spacing:.07em;text-transform:uppercase;color:var(--mut);margin-bottom:6px}
.fld .req{color:var(--amber)}
.in,.fld input,.fld select,.fld textarea{width:100%;min-height:48px;padding:10px 12px;border-radius:6px;border:1px solid var(--line);background:var(--bg);font-size:16px;color:var(--tx)}
.fld input[type=date]{font-family:var(--mono)}
.toque-lin input,.toque-lin select,.apl-lin input,.apl-lin select,.manejo-ed input,.marca-extra select,.grp-vac input,.grp-vac select,.vac-conf input,.detalhe input[type=date],[data-testid=calendario-vacinas] input:not([type=checkbox]),[data-testid=calendario-vacinas] select{width:100%;padding:8px 10px;border-radius:6px;border:1px solid var(--line);background:var(--bg);font-size:16px;color:var(--tx)}
.grp-vac input[type=date],.detalhe input[type=date]{width:auto;font-family:var(--mono);font-size:14px}
.vac-tag.ok{background:rgba(141,187,120,.15)!important;color:var(--green)!important}
.vac-tag.pendente{background:var(--amber-bg)!important;color:var(--amber)!important}
.vac-tag.atrasada{background:var(--late-bg)!important;color:var(--late)!important}
.fld textarea{min-height:200px;font:13px/1.45 var(--mono);resize:vertical}
.fld .hint{font-size:12.5px;color:var(--mut);margin-top:5px}
.grid2{display:grid;gap:0 14px}
@media (min-width:640px){.grid2{grid-template-columns:1fr 1fr}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 20px;border-radius:6px;border:1.5px solid var(--amber);background:var(--amber);color:#1B140A;font:700 15px var(--body)}
.btn.wide{width:100%}
.btn.ghost{background:transparent;color:var(--amber)}
.btn.quiet{background:var(--s2);border-color:var(--line);color:var(--tx)}
.btn.sm{min-height:38px;padding:0 12px;font-size:13px}
.btn.ok{background:var(--green);border-color:var(--green)}
.btn:disabled{opacity:.55;cursor:default}
.spin{animation:giro 1s linear infinite}
@keyframes giro{to{transform:rotate(360deg)}}


/* escolha rápida (até 3 opções) */
.seg{display:flex;gap:6px}
.seg button{flex:1;min-height:48px;padding:6px 8px;border:1px solid var(--line);background:var(--bg);border-radius:6px;font:600 15px var(--body);color:var(--tx)}
.seg button[aria-pressed=true]{background:var(--amber-bg);border-color:var(--amber);color:var(--amber)}

/* seletor de matriz com busca */
.picker{position:relative}
.picker .sug{position:absolute;left:0;right:0;top:100%;z-index:15;margin-top:2px;background:var(--s2);border:1px solid var(--line);border-radius:6px;max-height:280px;overflow:auto;box-shadow:0 8px 22px rgba(0,0,0,.45)}
.picker .sug button{display:flex;width:100%;justify-content:space-between;align-items:center;gap:10px;min-height:48px;padding:6px 12px;border:none;border-bottom:1px solid var(--line2);background:transparent;text-align:left}
.picker .sug button:hover,.picker .sug button.act{background:var(--s1)}
.picker .sel{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:48px;padding:6px 12px;border-radius:6px;border:1px solid var(--amber);background:var(--amber-bg)}
.picker .sel b{font:600 19px var(--mono)}

/* ---- livro-caixa (linhas de caderno) ---- */
.led-h,.led-r{display:grid;grid-template-columns:var(--cols);gap:8px;align-items:center;padding:0 16px}
.led-h{padding-top:9px;padding-bottom:9px;border-bottom:1px solid var(--line);font:600 10.5px var(--mono);letter-spacing:.08em;color:var(--mut);text-transform:uppercase}
.led-r{min-height:60px;padding-top:6px;padding-bottom:6px;border-bottom:1px solid var(--line2);width:100%;background:transparent;border-left:none;border-right:none;border-top:none;text-align:left;color:inherit}
button.led-r:hover{background:var(--s2)}
.led-r .b{font:600 17px var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.led-r .two{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.led-r .two b{font-weight:600;font-size:15px}
.led-r .two span{font-size:13px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.led-r .m{font:500 14px var(--mono)}
.led-r .r{text-align:right;font:600 15px var(--mono)}
.led-h .r{text-align:right}

.cols-reb{--cols:70px minmax(0,1fr) 74px 50px}
@media (min-width:700px){.cols-reb{--cols:90px minmax(0,1fr) 120px 100px}}
.led-r.cols-reb{padding-top:9px;padding-bottom:9px}
.reb-lista{display:flex;flex-direction:column;font:500 12px/17px var(--mono);white-space:nowrap}
.led-r .reb-lista.r{align-items:flex-end;font:600 12px/17px var(--mono)}
.reb-lista .mut{font-weight:400}
.late{color:var(--late)} .soon{color:var(--amber)} .good{color:var(--green)} .mut{color:var(--mut)}
.hide-s{display:none}
@media (min-width:700px){.hide-s{display:block}}
.bar-sum{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--line);background:var(--bg);font:600 11px var(--mono);letter-spacing:.08em;text-transform:uppercase}
.search{display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid var(--line)}
.search svg{width:19px;height:19px;color:var(--mut);flex:none}
.search input{flex:1;min-width:0;height:52px;border:none;background:transparent;font-size:18px;outline:none}
.empty{padding:34px 16px;text-align:center;color:var(--mut);font-size:14.5px}
.detalhe{padding:12px 16px 16px;background:var(--bg);border-bottom:1px solid var(--line2);font-size:14px;line-height:1.5;color:var(--mut)}
.detalhe b{color:var(--tx)}
.tag{display:inline-block;padding:2px 9px;border-radius:20px;font:600 11px var(--mono);letter-spacing:.05em;text-transform:uppercase;border:1px solid currentColor}

/* ---- sumário com pontinhos ---- */
.lead{display:flex;align-items:baseline;gap:8px;padding:7px 0;font-size:15px}
.lead i{flex:1;border-bottom:2px dotted var(--line);min-width:12px;transform:translateY(-3px)}
.lead b{font:600 16px var(--mono);white-space:nowrap}
.lead.big b{font:600 22px var(--disp)}
.lead button{background:none;border:none;padding:0;color:var(--tx);text-align:left;font:inherit;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}

/* ---- indicadores ---- */
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.kpi{background:var(--s1);border:1px solid var(--line);border-radius:8px;padding:13px 14px;min-width:0}
.kpi small{display:block;font:600 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-bottom:5px}
.kpi b{display:block;font:600 30px/1.05 var(--disp)}
.kpi span{display:block;font-size:12.5px;color:var(--mut);margin-top:3px}
.panel{background:var(--s1);border:1px solid var(--line);border-radius:8px;padding:16px;margin-bottom:16px}
.panel h3{margin:0 0 8px;font:600 19px var(--disp)}
.sbar{display:flex;height:16px;border-radius:3px;overflow:hidden;background:var(--s2);margin:8px 0 6px}
.sbar i{display:block;height:100%}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--mut)}
.legend span::before{content:'';display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;background:var(--c)}
.mbars{display:flex;align-items:flex-end;gap:8px;height:150px;padding-top:8px}
.mbars .c{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px;min-width:0}
.mbars .c i{display:block;width:100%;max-width:46px;background:var(--amber);border-radius:3px 3px 0 0;min-height:2px}
.mbars .c b{font:600 12px var(--mono)}
.mbars .c span{font:500 10.5px var(--mono);color:var(--mut)}
.cols2{display:grid;gap:16px}
@media (min-width:860px){.cols2{grid-template-columns:1fr 1fr}}

/* ---- tabelas (relatórios / planilha) ---- */
.tbwrap{overflow-x:auto;border:1px solid var(--line);border-radius:8px;background:var(--s1)}
table.tb{border-collapse:collapse;width:100%;font-size:14px}
table.tb th{position:sticky;top:0;background:var(--bg);padding:9px 12px;text-align:left;font:600 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--mut);border-bottom:1px solid var(--line);white-space:nowrap}
table.tb td{padding:8px 12px;border-bottom:1px solid var(--line2);white-space:nowrap;vertical-align:top}
table.tb td.wrapt{white-space:normal;min-width:230px}
table.tb tr:nth-child(even) td{background:rgba(255,255,255,.015)}
table.tb .r{text-align:right}
table.tb .mono{font-family:var(--mono);font-variant-numeric:tabular-nums}
.nota{font-size:13px;color:var(--mut);margin:6px 2px 10px}

/* conferência do lote por foto */
.lote-item{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:10px;align-items:start;padding:11px 14px;border-bottom:1px solid var(--line2)}
.lote-item:last-child{border-bottom:none}
.lote-item .n{font:600 13px var(--mono);color:var(--amber);padding-top:2px}
.lote-item .txt{display:flex;flex-direction:column;gap:2px;min-width:0}
.lote-item .txt b{font-weight:600;font-size:14.5px;line-height:1.3}
.lote-item .txt span{font-size:13px;color:var(--mut);line-height:1.35}
.lote-item .m{font:500 13px var(--mono);padding-top:2px;white-space:nowrap}

/* ---- janela (modal) ---- */
.ov{position:fixed;inset:0;z-index:50;background:rgba(5,9,7,.72);display:flex;align-items:flex-end;justify-content:center}
.ov .box{width:100%;max-width:560px;max-height:92vh;overflow:auto;background:var(--s1);border:1px solid var(--line);border-radius:14px 14px 0 0;padding:18px 18px calc(22px + env(safe-area-inset-bottom))}
@media (min-width:640px){.ov{align-items:center}.ov .box{border-radius:12px}}
.ov .top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.ov h2{margin:0;font:600 26px var(--disp)}
.ov .x{width:44px;height:44px;border:none;background:var(--s2);border-radius:6px;display:flex;align-items:center;justify-content:center}
.hist{list-style:none;margin:0;padding:0}
.hist li{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dotted var(--line);font-size:14px}
.hist li span:last-child{font-family:var(--mono);color:var(--mut);white-space:nowrap}

details.ferr{margin-top:22px;border:1px dashed var(--line);border-radius:8px;padding:0 14px}
details.ferr summary{min-height:48px;display:flex;align-items:center;cursor:pointer;color:var(--mut);font:600 12px var(--mono);letter-spacing:.08em;text-transform:uppercase}
details.ferr .in2{padding:4px 0 16px;display:flex;flex-wrap:wrap;gap:8px}
.foot-note{margin:30px 0 8px;text-align:center;font:500 11px var(--mono);color:var(--mut);opacity:.75;letter-spacing:.04em}

.loading{display:flex;align-items:center;justify-content:center;gap:10px;min-height:60vh;color:var(--mut);font:500 14px var(--mono)}

/* ---- crias, pesagem e venda ---- */
.cols-cria{--cols:64px minmax(0,1fr) 84px}
.cols-cria .two b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (min-width:700px){.cols-cria{--cols:84px minmax(0,1.1fr) 110px 110px 130px}}
.filtros{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line)}
.filtros select{min-height:40px;padding:0 10px;border-radius:6px;border:1px solid var(--line);background:var(--bg);font-size:14px}
.filtros .seg{flex:1 1 220px}
.filtros .seg button{min-height:40px;font-size:13px}
.pill{display:inline-block;padding:1px 8px;border-radius:20px;font:600 11px var(--mono);letter-spacing:.04em;border:1px solid currentColor;white-space:nowrap}
.pill.pronto{color:var(--green)} .pill.falta{color:var(--amber)} .pill.fora{color:var(--mut)} .pill.alerta{color:var(--late)}
.chk{width:26px;height:26px;accent-color:var(--amber);flex:none}
.sel-row{display:grid;grid-template-columns:34px var(--cols);gap:8px;align-items:center;padding:0 8px 0 8px;border-bottom:1px solid var(--line2);min-height:60px;background:transparent}
.sel-row:hover{background:var(--s2)}
.sel-row .led-r{border:none;padding:0;min-height:58px;background:transparent}
.cols-vender{--cols:56px minmax(0,1fr) 68px}
@media (min-width:700px){.cols-vender{--cols:80px minmax(0,1fr) 100px 100px 150px}}
.cols-nov{--cols:56px minmax(0,1fr) 68px}
@media (min-width:700px){.cols-nov{--cols:84px minmax(0,1fr) 100px 100px 150px}}
.cmp{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));margin:10px 0}
.linha-add{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px;align-items:end}
.linha-add .fld{margin-bottom:0}
.rapido{border:1px solid var(--line);border-radius:8px;background:var(--bg);padding:12px;margin-bottom:12px}
.item-lin{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line2)}
.item-lin:last-child{border-bottom:none}
.item-lin .t{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.25}
.item-lin .t b{font:600 17px var(--mono)}
.item-lin .t span{font-size:13px;color:var(--mut)}
.item-lin .p{font:600 17px var(--mono);white-space:nowrap}
.x-peq{width:40px;height:40px;border:1px solid var(--line);background:var(--s2);border-radius:6px;display:flex;align-items:center;justify-content:center;flex:none}
.vlin{border:1px solid var(--line);border-radius:8px;background:var(--bg);padding:10px;margin-bottom:10px}
.vlin .l1{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 44px;gap:8px;align-items:end}
.vlin .l2{margin-top:8px}
.vlin .fld{margin-bottom:0}
.vlin .info{font-size:12.5px;color:var(--mut);margin-top:6px;line-height:1.35}
.vlin .info.ruim{color:var(--late)}
@media (min-width:700px){
  .vlin{display:grid;grid-template-columns:130px 220px 140px 44px;gap:8px;align-items:end}
  .vlin .l1,.vlin .l2{display:contents}
  .vlin .f-b{order:1}.vlin .f-t{order:2}.vlin .f-p{order:3}.vlin .f-x{order:4}
  .vlin .info{order:5;grid-column:1 / -1;margin-top:2px}
}
.totais{border:1px solid var(--amber);border-radius:8px;background:var(--amber-bg);padding:12px 14px;margin:12px 0}
.totais .grande{font:600 28px var(--disp)}
.venda-hist{border-bottom:1px solid var(--line2)}
.venda-hist>button{display:grid;grid-template-columns:70px minmax(0,1fr) auto;gap:10px;align-items:center;width:100%;min-height:60px;padding:6px 16px;background:transparent;border:none;text-align:left;color:inherit}
.venda-hist>button:hover{background:var(--s2)}
.venda-hist .itens{padding:4px 16px 12px;background:var(--bg)}

@media print{
  :root{--bg:#fff;--s1:#fff;--s2:#f3f3f3;--line:#999;--line2:#ccc;--tx:#000;--mut:#444;--amber:#7a4a00;--green:#1d5c1d;--late:#a02020}
  .side,.bnav,.topbar,.noprint,.itabs,.banner-teste,details.ferr{display:none!important}
  .sheet,.panel,.tbwrap,.kpis{box-shadow:none;break-inside:avoid}
  .main{padding:0}
}
`;
