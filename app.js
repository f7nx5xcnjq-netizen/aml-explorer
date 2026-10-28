/* Browser-only presentation; clinical scenario logic lives in engine.js. */
(function(){
  'use strict';
  const E=window.AMLEngine,D=window.AMLEvidence;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const yn=[['unknown','Da definire'],['yes','Sì'],['no','No']];
  const flt3=[['unknown','Sconosciuto / non documentato'],['wt','Nessuna mutazione FLT3 rilevata'],['itd','FLT3-ITD'],['tkd','FLT3-TKD'],['both','FLT3-ITD + TKD']];
  const fields=[
    ['coreFields','age','Età (anni)',null],
    ['coreFields','status','Scenario clinico',Object.entries(E.statuses)],
    ['coreFields','subtype','Sottotipo documentato',[['de_novo','De novo'],['saml','sAML non ulteriormente classificata'],['taml','t-AML'],['amlmrc','AML-MRC verificata'],['unknown','Sconosciuto']]],
    ['coreFields','flt3','FLT3 attuale · episodio in esame',flt3],
    ['coreFields','intensiveFit','Fit a chemioterapia intensiva',yn],
    ['coreFields','transplantFit','Fit a HSCT · valutazione distinta',yn],
    ['biologyFields','baselineFlt3','FLT3 alla diagnosi',flt3],
    ['biologyFields','retestedFlt3AtRelapse','FLT3 testato nell’episodio R/R attuale?',yn],
    ['biologyFields','frontlineRegimen','Schema di induzione/consolidamento',[['unknown','Non documentato'],['quizartinib','Chemioterapia + quizartinib'],['midostaurin','Chemioterapia + midostaurina'],['other','Altro schema']]],
    ['biologyFields','priorVen','Venetoclax già ricevuto per AML?',yn],
    ['mrdFields','mrd','MRD', [['unknown','Sconosciuta'],['positive','Positiva'],['negative','Negativa']]],
    ['mrdFields','mrdMarker','Marcatore / metodo MRD',[['unknown','Non documentato'],['flt3_itd','FLT3-ITD · assay sensibile'],['npm1','NPM1'],['flow','Citofluorimetria'],['other','Altro']]],
    ['mrdFields','mrdTiming','Momento MRD',[['unknown','Non documentato'],['peri_hsct','Peri-HSCT (pre e/o post)'],['other','Altro momento']]],
    ['mrdFields','mrdCoverage','Copertura MRD peri-HSCT',[['unknown','Non documentata'],['single','Solo pre oppure solo post-HSCT'],['both','Pre e post-HSCT entrambi valutati']]],
    ['safetyFields','qtc','QTcF (ms) · vuoto se non noto',null],
    ['safetyFields','longQt','QT lungo congenito documentato?',yn],
    ['safetyFields','interactions','Interazioni CYP3A / QT presenti o da verificare?',yn]
  ];
  for(const [container,id,label,options] of fields){
    const node=document.createElement('div');node.className='field';node.id=id+'Field';
    node.innerHTML='<label for="'+id+'">'+esc(label)+'</label>'+(options?'<select id="'+id+'">'+options.map(([v,l])=>'<option value="'+v+'">'+esc(l)+'</option>').join('')+'</select>':'<input id="'+id+'" type="number" step="1" min="'+(id==='age'?18:200)+'" max="'+(id==='age'?120:800)+'">');
    $(container).append(node);
  }
  const mutLabels={tp53:'TP53',npm1:'NPM1',dnmt3a:'DNMT3A',runx1:'RUNX1',asxl1:'ASXL1',ptpn11:'PTPN11',idh1:'IDH1',idh2:'IDH2',rasMapk:'RAS/MAPK',d835:'FLT3 D835',f691:'FLT3 F691L'};
  $('mutationChecks').innerHTML=E.mutations.map(k=>'<label><input type="checkbox" data-bool="'+k+'">'+mutLabels[k]+'</label>').join('');
  const prior={quizartinib:'Quizartinib',midostaurin:'Midostaurina',gilteritinib:'Gilteritinib',sorafenib:'Sorafenib',other:'Altro FLT3i'};
  $('priorChecks').innerHTML=Object.entries(prior).map(([k,v])=>'<label><input type="checkbox" data-prior="'+k+'">'+v+'</label>').join('');
  const groups={label:'Indicazione EMA / percorso autorizzato',offlabel:'Evidenze fuori indicazione EMA nel setting',research:'Combinazioni sperimentali',negative:'Evidenza senza beneficio OS dimostrato',context:'Altri contesti di salvataggio'};
  const stateLabels={match:'Pertinente allo scenario',pending:'Da verificare',outside:'Non pertinente'};
  let omitted=new Set(),lastResult;
  function refs(ids){return '<div class="refs">'+[...new Set(ids)].map(id=>'<a href="'+esc(D.sources[id].url)+'" target="_blank" rel="noopener noreferrer">'+esc(D.sources[id].label)+'</a>').join('')+'</div>';}
  function list(items,cls=''){return items.length?'<ul class="'+cls+'">'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'';}
  function studyHTML(id){const s=D.studies[id];return '<article class="study"><h4>'+esc(D.sources[s.source].label)+'</h4><div>'+esc(s.design)+'</div><p>'+esc(s.population)+'</p><dl>'+s.endpoints.map(([k,v])=>'<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>').join('')+'</dl><p class="limit">'+esc(s.limit)+'</p>'+refs([s.source])+'</article>';}
  function card(t){return '<article class="strategy '+t.state+'" data-strategy="'+t.id+'"><div class="badges"><span class="badge '+t.state+'">'+stateLabels[t.state]+'</span><span class="badge '+t.group+'">'+({label:'EMA',offlabel:'OFF-LABEL UE',research:'SPERIMENTALE',negative:'OS NON SIGNIFICATIVA',context:'CONTESTO'}[t.group])+'</span></div><h3>'+esc(t.name)+'</h3><p class="regulatory">'+esc(t.regulatory)+'</p>'+refs(t.regRefs)+list(t.state==='outside'?t.excluded:[...t.reasons,...t.pending])+(t.state==='match'?'<label class="compare-select"><input type="checkbox" data-compare="'+t.id+'" '+(!omitted.has(t.id)?'checked':'')+'>Nel confronto descrittivo</label>':'')+(t.state!=='outside'?'<details><summary>Limiti e controlli ('+t.cautions.length+')</summary>'+list(t.cautions,'warnings')+refs(t.contextRefs)+'</details>':'')+'<details><summary>Evidenze e risultati ('+t.studies.length+')</summary>'+(t.studies.length?t.studies.map(studyHTML).join(''):'<p class="hint">Nessuna stima numerica verificata caricata per questo regime. Non equiparare la sua risposta a quella di altri schemi salvage.</p>')+'</details></article>';}
  function read(){const p={};for(const [,id] of fields)p[id]=$(id).value;for(const k of E.mutations)p[k]=document.querySelector('[data-bool="'+k+'"]').checked;p.priorFlt3i=[...document.querySelectorAll('[data-prior]:checked')].map(el=>el.dataset.prior);return p;}
  function renderComparison(){
    const selected=lastResult.strategies.filter(t=>t.state==='match'&&!omitted.has(t.id));
    $('comparison').innerHTML=selected.length?'<div class="table-scroll" role="region" aria-label="Tabella degli studi selezionati" tabindex="0"><table><thead><tr><th>Ramo / categoria</th><th>Studio e popolazione</th><th>Endpoint riportati</th><th>Limite interpretativo</th></tr></thead><tbody>'+selected.map(t=>t.studies.length?t.studies.map(id=>{const s=D.studies[id];return '<tr><td>'+esc(t.name)+'<small>'+esc(t.regulatory)+'</small></td><td>'+refs([s.source])+'<p>'+esc(s.design)+'</p>'+esc(s.population)+'</td><td>'+s.endpoints.map(([k,v])=>'<p><strong>'+esc(k)+':</strong> '+esc(v)+'</p>').join('')+'</td><td>'+esc(s.limit)+'</td></tr>';}).join(''):'<tr><td>'+esc(t.name)+'</td><td colspan="3">Dati numerici non disponibili nel dataset.</td></tr>').join('')+'</tbody></table></div>':'<p class="hint">Nessun ramo selezionato e pertinente. Completa il profilo oppure seleziona una scheda.</p>';
  }
  function render(){
    const p=read();lastResult=E.evaluate(p);
    $('retestedFlt3AtRelapseField').hidden=!E.isRR(p);
    $('frontlineRegimenField').hidden=!E.inRemission(p);
    $('errors').hidden=!lastResult.errors.length;$('errors').innerHTML=list(lastResult.errors);
    $('scenarioTitle').textContent=E.statuses[p.status]||'Profilo da verificare';
    $('insights').innerHTML=lastResult.insights.map(n=>'<div class="insight">'+esc(n.text)+refs(n.refs)+'</div>').join('');
    $('resultCount').textContent=lastResult.strategies.filter(t=>t.state==='match').length+' pertinenti · '+lastResult.strategies.filter(t=>t.state==='pending').length+' da verificare';
    $('strategies').innerHTML=Object.entries(groups).map(([key,label])=>{const ts=lastResult.strategies.filter(t=>t.group===key&&t.state!=='outside');return ts.length?'<section class="group"><h3 class="group-title">'+label+'</h3><div class="cards">'+ts.map(card).join('')+'</div></section>':'';}).join('');
    const excluded=lastResult.strategies.filter(t=>t.state==='outside');
    $('excludedTitle').textContent='Rami non pertinenti ('+excluded.length+') · vedi perché';
    $('excludedStrategies').innerHTML='<div class="cards">'+excluded.map(card).join('')+'</div>';
    renderComparison();
  }
  function reset(){for(const [,id] of fields)$(id).value=E.defaults[id];document.querySelectorAll('[data-bool],[data-prior]').forEach(el=>el.checked=false);omitted=new Set();render();}
  $('profileForm').addEventListener('submit',ev=>ev.preventDefault());
  $('profileForm').addEventListener('change',render);
  $('strategies').addEventListener('change',ev=>{const id=ev.target.dataset.compare;if(!id)return;ev.target.checked?omitted.delete(id):omitted.add(id);renderComparison();});
  $('reset').addEventListener('click',reset);
  $('bibliography').innerHTML='<ol class="bibliography">'+Object.values(D.sources).map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.label)+'</a></li>').join('')+'</ol>';
  reset();
})();
