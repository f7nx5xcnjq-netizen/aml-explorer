(function(root){
  'use strict';
  const data=typeof module==='object'&&module.exports?require('./evidence.js'):root.AMLEvidence;
  const statuses={frontline:'Nuova diagnosi',frontline_primary_resistant:'Resistenza primaria',rr:'Recidiva / refrattaria pre-HSCT',post_hsct_relapse:'Recidiva post-HSCT',remission:'CR dopo consolidamento, senza HSCT',post_hsct_cr1:'CR1 dopo allo-HSCT'};
  const defaults={age:65,status:'frontline',subtype:'de_novo',flt3:'itd',baselineFlt3:'unknown',intensiveFit:'yes',transplantFit:'unknown',retestedFlt3AtRelapse:'unknown',frontlineRegimen:'unknown',priorFlt3i:[],priorVen:'unknown',mrd:'unknown',mrdMarker:'unknown',mrdTiming:'unknown',mrdCoverage:'unknown',qtc:'',longQt:'unknown',interactions:'unknown',tp53:false,npm1:false,dnmt3a:false,runx1:false,asxl1:false,ptpn11:false,idh1:false,idh2:false,rasMapk:false,d835:false,f691:false};
  const mutations=['tp53','npm1','dnmt3a','runx1','asxl1','ptpn11','idh1','idh2','rasMapk','d835','f691'];
  const isRR=p=>['frontline_primary_resistant','rr','post_hsct_relapse'].includes(p.status);
  const inRemission=p=>['remission','post_hsct_cr1'].includes(p.status);
  const isITD=value=>['itd','both'].includes(value);
  const isMutated=value=>['itd','tkd','both'].includes(value);
  function normalize(input={}){return {...defaults,...input,priorFlt3i:input.priorFlt3i===undefined?[]:Array.isArray(input.priorFlt3i)?[...input.priorFlt3i]:input.priorFlt3i};}
  function validate(p){
    const errors=[];
    if(p.age===''||p.age==null||!Number.isInteger(Number(p.age))||Number(p.age)<18||Number(p.age)>120)errors.push('Inserire un’età adulta valida (18–120 anni); il motore non copre la pediatria.');
    const enums={status:Object.keys(statuses),subtype:['de_novo','saml','taml','amlmrc','unknown'],flt3:['wt','itd','tkd','both','unknown'],baselineFlt3:['wt','itd','tkd','both','unknown'],intensiveFit:['yes','no','unknown'],transplantFit:['yes','no','unknown'],retestedFlt3AtRelapse:['yes','no','unknown'],frontlineRegimen:['quizartinib','midostaurin','other','unknown'],priorVen:['yes','no','unknown'],mrd:['positive','negative','unknown'],mrdMarker:['flt3_itd','npm1','flow','other','unknown'],mrdTiming:['peri_hsct','other','unknown'],mrdCoverage:['both','single','unknown'],longQt:['yes','no','unknown'],interactions:['yes','no','unknown']};
    for(const [key,values] of Object.entries(enums))if(!values.includes(p[key]))errors.push('Valore non valido: '+key);
    if(!Array.isArray(p.priorFlt3i)||p.priorFlt3i.some(v=>!['quizartinib','midostaurin','gilteritinib','sorafenib','other'].includes(v)))errors.push('Esposizione FLT3i non valida.');
    for(const k of mutations)if(typeof p[k]!=='boolean')errors.push('Indicatore molecolare non valido: '+k);
    if(p.qtc!==''&&(!Number.isFinite(Number(p.qtc))||Number(p.qtc)<200||Number(p.qtc)>800))errors.push('QTcF non valido (200–800 ms) oppure lasciare il campo vuoto.');
    if(!inRemission(p)&&p.d835&&!['tkd','both','unknown'].includes(p.flt3))errors.push('D835 selezionata: il risultato FLT3 attuale deve includere TKD, oppure restare sconosciuto.');
    if(!inRemission(p)&&p.f691&&p.flt3==='wt')errors.push('F691L selezionata e FLT3 attuale wild type: verificare la coerenza del referto.');
    if(p.status==='frontline'&&((Array.isArray(p.priorFlt3i)&&p.priorFlt3i.length)||p.priorVen==='yes'))errors.push('Nuova diagnosi non trattata con esposizione AML pregressa: correggere lo scenario o la storia terapeutica.');
    return errors;
  }
  function evaluateStrategy(t,p){
    const excluded=[],pending=[],reasons=[],cautions=[];
    const check=(condition,yes,no,unknown=false)=>{if(unknown)pending.push(no);else if(condition)reasons.push(yes);else excluded.push(no);};
    check(t.states.includes(p.status),'Setting incluso nel ramo.','Setting diverso dalla popolazione di questo ramo.');
    if(t.fit)check(p.intensiveFit===t.fit,t.fit==='yes'?'Fitness intensiva dichiarata.':'Non candidabilità a intensiva dichiarata.',t.fit==='yes'?'Richiede fitness a intensiva.':'Ramo per non candidabili a intensiva.',p.intensiveFit==='unknown');
    if(t.flt3)check(t.flt3==='itd'?isITD(p.flt3):isMutated(p.flt3),'Bersaglio FLT3 attuale compatibile.',t.flt3==='itd'?'Richiede FLT3-ITD; TKD isolata non sufficiente.':'Richiede FLT3-mutazione attuale documentata.',p.flt3==='unknown');
    if(t.retest)check(p.retestedFlt3AtRelapse==='yes','Risultato FLT3 riferito all’episodio R/R corrente.','Confermare il test FLT3 nell’episodio R/R corrente.',p.retestedFlt3AtRelapse!=='yes');
    if(t.baseline)check(t.baseline==='itd'?isITD(p.baselineFlt3):isMutated(p.baselineFlt3),'Genotipo alla diagnosi compatibile con il mantenimento.',t.baseline==='itd'?'Serve FLT3-ITD documentata alla diagnosi.':'Serve FLT3-mutazione documentata alla diagnosi.',p.baselineFlt3==='unknown');
    if(t.subtypes)check(t.subtypes.includes(p.subtype),'Sottotipo coerente con indicazione EMA.','Richiede t-AML o AML-MRC verificata; sAML generica non basta.',p.subtype==='unknown'||p.subtype==='saml');
    if(t.regimen)check(p.frontlineRegimen===t.regimen,'Continuazione dello stesso schema di prima linea.','Confermare induzione/consolidamento con '+t.regimen+'.',p.frontlineRegimen==='unknown');
    if(t.trialAge&&(Number(p.age)<t.trialAge[0]||Number(p.age)>t.trialAge[1]))cautions.push('Età fuori dall’intervallo '+t.trialAge.join('–')+' anni del trial: non è un’esclusione automatica dall’indicazione EMA adulta.');
    if(t.id.startsWith('quiz_')){
      if(p.longQt==='yes')pending.push('QT lungo congenito: controindicazione RCP a quizartinib; non interpretare il ramo come opzione attivabile.');
      if(p.longQt==='unknown')cautions.push('Anamnesi di QT lungo congenito non documentata.');
      if(p.qtc==='')cautions.push('QTcF non inserito: il controllo di sicurezza è incompleto.');
      else if(Number(p.qtc)>450)cautions.push('QTcF >450 ms: RCP non consente l’avvio di quizartinib. Questo avviso non è una regola di sospensione di terapia già in corso; consultare RCP.');
      if(p.qtc!==''&&Number(p.qtc)>450&&t.id!=='quiz_continue')pending.push('Valutazione sicurezza necessaria prima di qualunque avvio di quizartinib.');
      if((!inRemission(p)&&p.flt3==='both')||p.d835)cautions.push('TKD/activation loop: possibile resistenza a un FLT3-inibitore tipo II; interpretare la variante, non equiparare ITD+TKD a ITD isolata.');
    }
    if(t.flt3i){
      cautions.push('Revisione specialistica di ECG, elettroliti, interazioni e funzione d’organo; il filtro non certifica eleggibilità clinica.');
      if(p.f691)cautions.push('F691L: segnale di resistenza; nessuna risposta garantita cambiando FLT3-inibitore.');
      if(p.rasMapk||p.ptpn11)cautions.push('RAS/MAPK/PTPN11: possibile bypass del bersaglio; nessuna penalità percentuale o esclusione automatica.');
    }
    if(t.id.includes('gil')||t.id.startsWith('triplet')||t.id==='lacewing')cautions.push('Gilteritinib: considerare anche sindrome da differenziazione, QT e altre precauzioni del RCP.');
    if(t.ven)cautions.push('Valutare mielosoppressione, infezioni, TLS e interazioni; gli esiti non sono probabilità individuali.');
    if(p.interactions!=='no'&&(t.flt3i||t.ven))cautions.push('Interazioni CYP3A / farmaci che prolungano QT da verificare; nessun calcolo di dose nel motore.');
    if(isRR(p)&&p.priorFlt3i.length&&t.flt3i)cautions.push('Esposizione pregressa a FLT3i: il risultato medio del trial non stima questa specifica sequenza.');
    if(t.id==='gilteritinib_rr_flt3'&&p.priorFlt3i.includes('quizartinib')){reasons.push('Il precedente quizartinib non esclude gilteritinib nella ricaduta FLT3-mutata.');cautions.push('Dopo quizartinib: attività su alcune varianti TKD soprattutto preclinica; nessuna efficacia clinica prospettica per singola variante assunta.');}
    if(isRR(p)&&p.priorVen==='yes'&&t.ven)cautions.push('Pregresso VEN: non assumere la stessa efficacia in un ritrattamento o dopo fallimento.');
    if(t.id==='ven_based_piccini'&&isITD(p.flt3))cautions.push('Piccini: segnale sfavorevole su EFS nel sottogruppo ITD; osservazionale, non confronto con gilteritinib.');
    if(t.id==='gil_maintenance'){
      if(p.mrd==='unknown'||p.mrdMarker!=='flt3_itd'||p.mrdTiming!=='peri_hsct')cautions.push('MORPHO: manca una MRD FLT3-ITD peri-HSCT interpretabile; MRD NPM1/flow non è intercambiabile con quel test.');
      else if(p.mrd==='negative'&&p.mrdCoverage!=='both')cautions.push('MRD negativa su campionamento peri-HSCT incompleto: non assegnare il paziente al sottogruppo MORPHO senza MRD pre e post.');
      else cautions.push(p.mrd==='positive'?'MORPHO: profilo vicino al sottogruppo MRD+ con segnale di beneficio RFS; richiede assay e contesto comparabili.':'MORPHO: nessun beneficio dimostrato nel sottogruppo senza MRD rilevabile; non equivale a prova di assenza di beneficio individuale.');
    }
    if(t.id==='quiz_continue'&&p.status==='post_hsct_cr1')cautions.push('Ripresa post-HSCT prevista nel RCP a condizioni ematologiche/GVHD specifiche; non è un nuovo mantenimento intercambiabile con altri FLT3i.');
    const contextRefs=t.flt3i?['resistance','ras']:[];
    if(t.id==='gil_maintenance')contextRefs.push('morphoMrd');
    return {...t,contextRefs,state:excluded.length?'outside':pending.length?'pending':'match',reasons,excluded,pending,cautions};
  }
  function insights(p){
    const notes=[];
    const add=(text,refs=[])=>notes.push({text,refs});
    const fitness={yes:'fit',no:'non fit',unknown:'da definire'};
    add('Matrice 2×2: intensiva '+fitness[p.intensiveFit]+' / HSCT '+fitness[p.transplantFit]+'. Sono valutazioni distinte; l’età non sostituisce nessuna delle due.',['eln']);
    if(!inRemission(p)){
      if(p.transplantFit==='yes')add('Percorso HSCT: discutere obiettivo di remissione, rischio, MRD e fattibilità; nessuna percentuale personale di accesso al trapianto.',['eln']);
      else if(p.transplantFit==='no')add('HSCT non previsto nel profilo attuale: questo non esclude automaticamente la chemioterapia intensiva.',['eln']);
      else add('Fitness HSCT mancante: il percorso di consolidamento non è determinabile.',['eln']);
    }else add('Remissione e recidiva post-HSCT sono rami separati. Il mantenimento usa il genotipo alla diagnosi; FLT3 non rilevabile oggi non cancella il genotipo storico.',['morpho','emaQuiz']);
    if(isRR(p)){
      add('R/R: documentare FLT3 sull’episodio attuale e riesaminare il profilo molecolare. “Non ritestato” significa informazione mancante, non FLT3 negativo.',['emaGil','ras']);
      if(p.flt3==='wt'&&p.retestedFlt3AtRelapse==='yes'&&isMutated(p.baselineFlt3))add('Possibile perdita del bersaglio FLT3 rispetto alla diagnosi: i rami target della malattia attiva non sono pertinenti. Non riciclare il genotipo iniziale.',['ras','tripletFollow']);
      if(p.priorFlt3i.length)add('Sequenza registrata: '+p.priorFlt3i.join(', ')+'. Retesting e meccanismo di resistenza prevalgono su una successione automatica dei farmaci.',['resistance','ras']);
    }
    if(p.npm1)add('NPM1: integrare monitoraggio molecolare dedicato. La co-mutazione non assegna punti a un farmaco né annulla il contesto FLT3.',['eln']);
    if(p.tp53)add('TP53: contesto prognostico complesso; nessuna penalità numerica arbitraria. Nel RWE italiano con gilteritinib è associata a esiti inferiori, senza dimostrare una scelta alternativa superiore.',['cairoli']);
    if(p.dnmt3a||p.asxl1||p.runx1)add('DNMT3A / ASXL1 / RUNX1: dati di contesto; nessuna classifica automatica. Il rischio ELN non è calcolato senza citogenetica e pannello completo; non usare la sola persistenza DTA come prova di MRD leucemica.',['eln']);
    if(p.idh1)add('IDH1: verificare la variante. Ivosidenib + AZA ha indicazione EMA in nuova diagnosi IDH1 R132 non candidabile a induzione standard; nessuna priorità dedotta in caso di co-mutazione FLT3.',['emaIdh1']);
    if(p.idh2)add('IDH2: segnalazione per revisione specialistica; accesso e indicazioni dipendono dalla giurisdizione. Nessun ramo IDH2 attivato automaticamente.',['eln']);
    if(p.mrd!=='unknown')add('MRD '+(p.mrd==='positive'?'positiva':'negativa')+': interpretare con marcatore, sensibilità e momento del prelievo. Il motore non decide automaticamente HSCT o farmaco.',['eln','morphoMrd']);
    if(p.d835||p.f691||p.rasMapk||p.ptpn11)add('Resistenze: distinguere dati preclinici, correlazioni cliniche e prove comparative. Non derivare probabilità o dosaggi da IC50.',['resistance','ras']);
    add('NPM1/menin, nuovi FLT3i e altri bersagli non sono trasformati in opzioni automatiche senza una fonte e un’indicazione verificata per quello specifico contesto.');
    return notes;
  }
  function evaluate(input={}){
    const profile=normalize(input),errors=validate(profile);
    if(errors.length)return {profile,errors,strategies:[],insights:[]};
    return {profile,errors:[],strategies:data.strategies.map(t=>evaluateStrategy(t,profile)),insights:insights(profile)};
  }
  const api={defaults,statuses,mutations,isRR,inRemission,normalize,validate,evaluate};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.AMLEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
