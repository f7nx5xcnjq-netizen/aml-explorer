/* Curated evidence: values are study-level observations, never patient predictions. */
(function (root) {
  'use strict';
  const sources = {
    emaQuiz: {label:'EMA · Vanflyta / RCP',url:'https://www.ema.europa.eu/en/documents/product-information/vanflyta-epar-product-information_en.pdf'},
    emaMido: {label:'EMA · Rydapt',url:'https://www.ema.europa.eu/en/medicines/human/EPAR/rydapt'},
    emaGil: {label:'EMA · Xospata',url:'https://www.ema.europa.eu/en/medicines/human/EPAR/xospata'},
    emaVen: {label:'EMA · Venclyxto',url:'https://www.ema.europa.eu/en/medicines/human/EPAR/venclyxto'},
    emaCpx: {label:'EMA · Vyxeos liposomal',url:'https://www.ema.europa.eu/en/medicines/human/EPAR/vyxeos-liposomal'},
    emaSor: {label:'EMA · Nexavar',url:'https://www.ema.europa.eu/en/medicines/human/EPAR/nexavar'},
    quantumFirst: {label:'Erba et al. · QuANTUM-First · Lancet 2023',url:'https://pubmed.ncbi.nlm.nih.gov/37116523/'},
    ratify: {label:'Stone et al. · RATIFY · NEJM 2017',url:'https://pubmed.ncbi.nlm.nih.gov/28644114/'},
    admiral: {label:'Perl et al. · ADMIRAL · NEJM 2019',url:'https://pubmed.ncbi.nlm.nih.gov/31665578/'},
    admiralFollow: {label:'ADMIRAL follow-up · Blood 2022',url:'https://pubmed.ncbi.nlm.nih.gov/35081255/'},
    quantumR: {label:'Cortes et al. · QuANTUM-R · Lancet Oncology 2019',url:'https://pubmed.ncbi.nlm.nih.gov/31175001/'},
    viale: {label:'DiNardo et al. · VIALE-A · NEJM 2020',url:'https://pubmed.ncbi.nlm.nih.gov/32786187/'},
    piccini: {label:'Piccini et al. · J Clin Med 2021 · 10:1684',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8070927/'},
    cairoli: {label:'Cairoli et al. · Cancer 2025 · e70055',url:'https://pubmed.ncbi.nlm.nih.gov/40839405/'},
    triplet: {label:'Short et al. · AZA/VEN/GIL · JCO 2024',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11095865/'},
    tripletFollow: {label:'AZA/VEN/GIL · follow-up 2026',url:'https://pubmed.ncbi.nlm.nih.gov/42200455/'},
    lacewing: {label:'Wang et al. · LACEWING finale · Haematologica 2026',url:'https://haematologica.org/article/view/14388'},
    morpho: {label:'Levis et al. · MORPHO · JCO 2024',url:'https://pubmed.ncbi.nlm.nih.gov/38471061/'},
    morphoMrd: {label:'Levis et al. · MRD/MORPHO · Blood 2025',url:'https://pubmed.ncbi.nlm.nih.gov/39775763/'},
    sormain: {label:'Burchert et al. · SORMAIN · JCO 2020',url:'https://pubmed.ncbi.nlm.nih.gov/32673171/'},
    sorPhase3: {label:'Xuan et al. · follow-up fase III · Lancet Haematology 2023',url:'https://doi.org/10.1016/S2352-3026(23)00117-5'},
    cpx: {label:'Lancet et al. · CPX-351 fase III · JCO 2018',url:'https://pubmed.ncbi.nlm.nih.gov/30024784/'},
    eln: {label:'Döhner et al. · ELN 2022',url:'https://pubmed.ncbi.nlm.nih.gov/35797463/'},
    resistance: {label:'Smith et al. · varianti FLT3 e gilteritinib · Blood Advances 2020',url:'https://pubmed.ncbi.nlm.nih.gov/32040554/'},
    ras: {label:'McMahon et al. · evoluzione clonale / RAS · Cancer Discovery 2019',url:'https://pubmed.ncbi.nlm.nih.gov/31088841/'},
    perrone: {label:'Perrone et al. · metanalisi HMA/VEN nei giovani · Cancer 2026',url:'https://pubmed.ncbi.nlm.nih.gov/41914434/'}
  };
  sources.emaIdh1={label:'EMA · Tibsovo',url:'https://www.ema.europa.eu/en/medicines/human/EPAR/tibsovo'};
  sources.venFlt3={label:'Konopleva et al. · analisi FLT3 AZA/VEN · CCR 2022',url:'https://pubmed.ncbi.nlm.nih.gov/35063965/'};
  const studies = {
    quantumFirst:{source:'quantumFirst',design:'RCT fase III',population:'539 adulti, 18–75 anni, nuova diagnosi FLT3-ITD; chemioterapia ± quizartinib, possibile HSCT e continuazione.',endpoints:[['OS mediana','31,9 vs 15,1 mesi'],['HR morte','0,78; IC95% 0,62–0,98; p=0,032']],limit:'Beneficio dell’intera strategia. Non isola l’effetto del mantenimento; nessun confronto diretto con midostaurina.'},
    ratify:{source:'ratify',design:'RCT fase III',population:'717 adulti, 18–59 anni, nuova diagnosi FLT3-mutata (ITD o TKD); chemioterapia ± midostaurina.',endpoints:[['HR morte','0,78; IC95% 0,63–0,96'],['OS a 4 anni','51,4% vs 44,3%']],limit:'Età dello studio distinta dall’indicazione EMA nell’adulto; nessuna superiorità dimostrata rispetto a quizartinib.'},
    admiral:{source:'admiral',design:'RCT fase III',population:'371 adulti AML R/R FLT3-mutata; gilteritinib vs chemioterapia di salvataggio.',endpoints:[['OS mediana','9,3 vs 5,6 mesi'],['HR morte','0,64; IC95% 0,49–0,83'],['CR/CRh','34,0% vs 15,3%']],limit:'Dati della popolazione randomizzata, non stime dopo una specifica sequenza quizartinib → gilteritinib.'},
    admiralFollow:{source:'admiralFollow',design:'Follow-up RCT',population:'Stessa coorte ADMIRAL; follow-up mediano di sopravvivenza 37,1 mesi.',endpoints:[['OS a 2 anni','20,6% vs 14,2%']],limit:'Non è una seconda coorte indipendente.'},
    cairoli:{source:'cairoli',design:'Osservazionale italiano',population:'205 pazienti AML R/R FLT3-mutata; expanded access.',endpoints:[['OS mediana · intera coorte','11,0 mesi'],['HSCT · gruppo con intento di bridge','60/124 (48%)'],['OS mediana · recidiva post-HSCT (n=46)','11,1 mesi']],limit:'Selezione clinica e sottogruppi differenti; il denominatore del bridge non è 205. Non confrontare indirettamente con Piccini.'},
    quantumR:{source:'quantumR',design:'RCT fase III',population:'367 adulti FLT3-ITD R/R; prima CR composita ≤6 mesi o refrattarietà; quizartinib vs salvage.',endpoints:[['OS mediana','6,2 vs 4,7 mesi'],['HR morte','0,76; IC95% 0,58–0,98']],limit:'Evidenza storica in R/R; l’indicazione EMA di Vanflyta è nella nuova diagnosi, non questa monoterapia R/R.'},
    viale:{source:'viale',design:'RCT fase III',population:'431 pazienti con AML non trattata, non candidabili a intensiva; AZA/VEN vs AZA/placebo.',endpoints:[['OS mediana','14,7 vs 9,6 mesi'],['CR/CRi','66,4% vs 28,3%'],['CR','36,7% vs 17,9%']],limit:'Popolazione globale, non risultato specifico FLT3-mutato. CR e CR/CRi sono endpoint diversi.'},
    venFlt3:{source:'venFlt3',design:'Analisi aggregata di sottogruppi',population:'FLT3-mutati valutabili: 42 AZA/VEN e 22 AZA; trial fase III + fase Ib, nuova diagnosi non fit a intensiva.',endpoints:[['CR/CRi · FLT3-mutati','67% vs 36%'],['OS mediana · FLT3-mutati','12,5 vs 8,6 mesi'],['OS mediana · AZA/VEN ITD / TKD','9,9 / 19,2 mesi']],limit:'Analisi esplorativa e piccoli sottogruppi; dati aggregati, non nuovo RCT. Nessuna penalità TKD derivata da Piccini.'},
    piccini:{source:'piccini',design:'Retrospettivo monocentrico',population:'47 pazienti AML R/R trattati con VEN + AZA/DAC/LDAC.',endpoints:[['CCR','26/47 (55%)'],['MRD negativa · soli CCR','16/26 (61%)'],['OS / EFS mediane · coorte','10,7 / 4,5 mesi'],['Bridge-HSCT · intento al trapianto','54% del sottogruppo'],['EFS mediana · FLT3-ITD+ vs ITD−','2,6 vs 6,2 mesi; p=0,033']],limit:'Segnale ITD esplorativo: non estendere a TKD né usarlo per penalità numeriche. OS NPM1mut/ITD+: testo 2,3 mesi, tabella 2,03; discrepanza esplicita, nessun valore univoco adottato.'},
    tripletFront:{source:'tripletFollow',design:'Fase II, singolo braccio · follow-up',population:'30 pazienti di nuova diagnosi FLT3-mutata non fit a intensiva; stessa coorte frontline del report 2024.',endpoints:[['CR/CRi','96%'],['OS / RFS mediane','29,7 / 23,4 mesi'],['HSCT in CR1','14/30 (47%)']],limit:'Sperimentale; nessun confronto randomizzato con AZA/VEN o intensiva. Perdita FLT3 in 6/9 recidive valutate, non nel 67% di tutti i trattati.'},
    tripletRr:{source:'triplet',design:'Fase I/II, singolo braccio',population:'Coorte R/R FLT3-mutata: 22 pazienti; distinta dai 30 frontline.',endpoints:[['CR/CRi · R/R','27%'],['MLFS aggiuntiva · R/R','41%']],limit:'Non trasferire il 96% frontline al setting R/R. Combinazione sperimentale; mielosoppressione e infezioni richiedono gestione specialistica.'},
    lacewing:{source:'lacewing',design:'RCT fase III · analisi finale 2026',population:'Nuova diagnosi FLT3-mutata non fit a intensiva; confronto GIL/AZA vs AZA.',endpoints:[['OS mediana','9,82 vs 9,23 mesi; p=0,182'],['ORR','70,2% vs 36,8%']],limit:'Nessun vantaggio OS statisticamente significativo. Risposta e sottogruppi esplorativi non giustificano una priorità terapeutica; non è il tripletto AZA/VEN/GIL.'},
    morpho:{source:'morpho',design:'RCT fase III',population:'356 adulti FLT3-ITD in CR1 dopo allo-HSCT; gilteritinib vs placebo.',endpoints:[['RFS · popolazione globale','HR 0,679; IC95% 0,459–1,005; p=0,0518'],['RFS · MRD FLT3-ITD peri-HSCT rilevabile','HR 0,515; IC95% 0,316–0,838']],limit:'Endpoint primario globale non significativo. Segnale in sottogruppo prespecificato MRD+; MRD− senza beneficio dimostrato. Non è lo scenario recidiva post-HSCT.'},
    sormain:{source:'sormain',design:'RCT fase II',population:'83 adulti FLT3-ITD in remissione dopo allo-HSCT; sorafenib vs placebo.',endpoints:[['RFS a 24 mesi','85,0% vs 53,3%']],limit:'Uso fuori indicazione EMA AML; non equivale a confronto con altri FLT3-inibitori.'},
    sorPhase3:{source:'sorPhase3',design:'RCT fase III · follow-up',population:'202 pazienti FLT3-ITD dopo allo-HSCT; sorafenib vs nessun mantenimento.',endpoints:[['OS a 5 anni','72,0% vs 55,9%'],['Incidenza cumulativa di ricaduta a 5 anni','15,0% vs 36,3%']],limit:'Endpoint e orizzonte propri dello studio; non applicare a recidiva attiva o TKD isolata.'},
    cpx:{source:'cpx',design:'RCT fase III',population:'309 pazienti, 60–75 anni, nuova diagnosi AML secondaria/ad alto rischio; CPX-351 vs 7+3.',endpoints:[['OS mediana','9,56 vs 5,95 mesi'],['Remissione complessiva','47,7% vs 33,3%']],limit:'Non studio specifico FLT3. Nessuna aggiunta automatica di FLT3-inibitore o indicazione R/R dedotta da questo trial.'}
  };
  const rr=['frontline_primary_resistant','rr','post_hsct_relapse'];
  const strategies=[
    {id:'quiz_front',name:'Quizartinib + chemioterapia',group:'label',regulatory:'Indicazione EMA · nuova diagnosi FLT3-ITD',regRefs:['emaQuiz'],states:['frontline'],flt3:'itd',fit:'yes',studies:['quantumFirst'],trialAge:[18,75],flt3i:true},
    {id:'mido_front',name:'Midostaurina + chemioterapia',group:'label',regulatory:'Indicazione EMA · nuova diagnosi FLT3-mutata',regRefs:['emaMido'],states:['frontline'],flt3:'mutated',fit:'yes',studies:['ratify'],trialAge:[18,59],flt3i:true},
    {id:'gilteritinib_rr_flt3',name:'Gilteritinib / Xospata',group:'label',regulatory:'Indicazione EMA · monoterapia R/R FLT3-mutata',regRefs:['emaGil'],states:rr,flt3:'mutated',retest:true,studies:['admiral','admiralFollow','cairoli'],flt3i:true},
    {id:'ven_aza_unfit',name:'Azacitidina + venetoclax',group:'label',regulatory:'Indicazione EMA · nuova diagnosi non fit a intensiva',regRefs:['emaVen'],states:['frontline'],fit:'no',studies:['viale','venFlt3'],ven:true},
    {id:'cpx351',name:'CPX-351 / Vyxeos',group:'label',regulatory:'Indicazione EMA · nuova diagnosi t-AML / AML-MRC',regRefs:['emaCpx'],states:['frontline'],fit:'yes',subtypes:['taml','amlmrc'],studies:['cpx'],trialAge:[60,75]},
    {id:'quiz_continue',name:'Quizartinib · continuazione / mantenimento',group:'label',regulatory:'Percorso EMA · dopo induzione/consolidamento con quizartinib',regRefs:['emaQuiz'],states:['remission','post_hsct_cr1'],baseline:'itd',regimen:'quizartinib',studies:['quantumFirst'],flt3i:true},
    {id:'mido_continue',name:'Midostaurina · mantenimento senza HSCT',group:'label',regulatory:'Percorso EMA · risposta completa dopo schema con midostaurina',regRefs:['emaMido'],states:['remission'],baseline:'mutated',regimen:'midostaurin',studies:['ratify'],flt3i:true},
    {id:'ven_based_piccini',name:'VEN-based · Piccini R/R',group:'offlabel',regulatory:'Fuori indicazione EMA VEN nella AML R/R',regRefs:['emaVen'],states:rr,studies:['piccini'],ven:true},
    {id:'quiz_rr',name:'Quizartinib · QuANTUM-R',group:'offlabel',regulatory:'Fuori indicazione EMA in questo setting R/R',regRefs:['emaQuiz'],states:rr,flt3:'itd',retest:true,studies:['quantumR'],flt3i:true},
    {id:'gil_maintenance',name:'Gilteritinib · mantenimento post-HSCT',group:'offlabel',regulatory:'Fuori indicazione EMA · mantenimento in CR1',regRefs:['emaGil'],states:['post_hsct_cr1'],baseline:'itd',studies:['morpho'],flt3i:true},
    {id:'sor_maintenance',name:'Sorafenib · mantenimento post-HSCT',group:'offlabel',regulatory:'Fuori indicazione EMA AML',regRefs:['emaSor'],states:['post_hsct_cr1'],baseline:'itd',studies:['sormain','sorPhase3'],flt3i:true},
    {id:'triplet_front',name:'Azacitidina + venetoclax + gilteritinib',group:'research',regulatory:'Combinazione sperimentale · nuova diagnosi',regRefs:['emaGil','emaVen'],states:['frontline'],flt3:'mutated',fit:'no',studies:['tripletFront'],flt3i:true,ven:true},
    {id:'triplet_rr',name:'Azacitidina + venetoclax + gilteritinib · R/R',group:'research',regulatory:'Combinazione sperimentale · R/R',regRefs:['emaGil','emaVen'],states:rr,flt3:'mutated',retest:true,studies:['tripletRr'],flt3i:true,ven:true},
    {id:'lacewing',name:'Gilteritinib + azacitidina · LACEWING',group:'negative',regulatory:'Sperimentale · nessun beneficio OS dimostrato',regRefs:['emaGil'],states:['frontline'],flt3:'mutated',fit:'no',studies:['lacewing'],flt3i:true},
    {id:'flag_ida',name:'FLAG-IDA / salvataggio intensivo',group:'context',regulatory:'Contesto di salvataggio · non una previsione di risposta',regRefs:['eln'],states:rr,fit:'yes',studies:[]}
  ];
  const api={version:'2.0.0',reviewedAt:'2026-10-28',sources,studies,strategies};
  if(typeof module==='object'&&module.exports) module.exports=api; else root.AMLEvidence=api;
})(typeof globalThis!=='undefined'?globalThis:this);
