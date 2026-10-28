const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine.js'),D=require('../evidence.js');
const result=p=>E.evaluate(p);
const branch=(p,id)=>result(p).strategies.find(t=>t.id===id);
const rr={status:'rr',flt3:'itd',retestedFlt3AtRelapse:'yes'};

test('frontline ITD fit: quizartinib and midostaurin, no gilteritinib R/R',()=>{
 for(const id of ['quiz_front','mido_front'])assert.equal(branch({},id).state,'match');
 assert.equal(branch({},'gilteritinib_rr_flt3').state,'outside');
 assert.equal(branch({},'ven_aza_unfit').state,'outside');
});
test('TKD isolated does not activate quizartinib but retains midostaurin',()=>{
 assert.equal(branch({flt3:'tkd'},'quiz_front').state,'outside');
 assert.equal(branch({flt3:'tkd'},'mido_front').state,'match');
});
test('all R/R settings use one rule and current FLT3 confirmation',()=>{
 for(const status of ['rr','frontline_primary_resistant','post_hsct_relapse'])for(const flt3 of ['itd','tkd','both']){
   assert.equal(branch({...rr,status,flt3},'gilteritinib_rr_flt3').state,'match');
   for(const retestedFlt3AtRelapse of ['no','unknown'])assert.equal(branch({...rr,status,flt3,retestedFlt3AtRelapse},'gilteritinib_rr_flt3').state,'pending');
 }
});
test('gilteritinib after quizartinib relapse: prior exposure never blocks the branch',()=>{
 for(const flt3 of ['itd','tkd','both']){
  const t=branch({...rr,flt3,priorFlt3i:['quizartinib']},'gilteritinib_rr_flt3');
  assert.equal(t.state,'match');assert.equal(t.group,'label');
  assert.ok(t.cautions.some(s=>s.includes('Dopo quizartinib')));
 }
});
test('D835 and F691L after quizartinib produce caution without invented exclusion',()=>{
 const t=branch({...rr,flt3:'both',d835:true,f691:true,priorFlt3i:['quizartinib']},'gilteritinib_rr_flt3');
 assert.equal(t.state,'match');assert.ok(t.cautions.some(s=>s.includes('F691L')));
 assert.ok(result({...rr,flt3:'itd',d835:true}).errors.length);
});
test('loss of FLT3 at relapse: historical ITD does not activate target branches',()=>{
 const p={...rr,flt3:'wt',baselineFlt3:'itd',priorFlt3i:['quizartinib']};
 for(const id of ['gilteritinib_rr_flt3','quiz_rr','triplet_rr'])assert.equal(branch(p,id).state,'outside');
 assert.ok(result(p).insights.some(n=>n.text.includes('perdita del bersaglio')));
 assert.equal(branch({...p,flt3:'unknown'},'gilteritinib_rr_flt3').state,'pending');
});
test('legacy relapse flags cannot contradict the authoritative scenario',()=>{
 const p={status:'frontline',relapseAfterFirstLine:true,resistantToFirstLine:true,retestedFlt3AtRelapse:'yes'};
 assert.equal(E.isRR(p),false);assert.equal(branch(p,'gilteritinib_rr_flt3').state,'outside');
});
test('2x2 fitness: transplant fitness does not determine intensive options',()=>{
 for(const transplantFit of ['yes','no','unknown']){
  assert.equal(branch({transplantFit,intensiveFit:'yes'},'quiz_front').state,'match');
  assert.equal(branch({transplantFit,intensiveFit:'no'},'ven_aza_unfit').state,'match');
  assert.ok(result({transplantFit}).insights.some(n=>n.text.includes('HSCT')));
 }
 assert.equal(branch({intensiveFit:'unknown'},'quiz_front').state,'pending');
 assert.equal(branch({intensiveFit:'unknown'},'ven_aza_unfit').state,'pending');
});
test('post-HSCT CR1 uses baseline genotype, distinct from active relapse',()=>{
 const p={status:'post_hsct_cr1',flt3:'wt',baselineFlt3:'itd'};
 assert.equal(branch(p,'gil_maintenance').state,'match');
 assert.equal(branch(p,'sor_maintenance').state,'match');
 assert.equal(branch(p,'gilteritinib_rr_flt3').state,'outside');
 assert.equal(branch({...rr,status:'post_hsct_relapse'},'gil_maintenance').state,'outside');
 assert.equal(branch({...p,baselineFlt3:'unknown'},'gil_maintenance').state,'pending');
 assert.equal(branch({...p,baselineFlt3:'tkd'},'gil_maintenance').state,'outside');
});
test('MORPHO requires FLT3-ITD MRD at the right time to interpret subgroup',()=>{
 const p={status:'post_hsct_cr1',baselineFlt3:'itd',mrd:'positive',mrdMarker:'flt3_itd',mrdTiming:'peri_hsct',mrdCoverage:'both'};
 assert.ok(branch(p,'gil_maintenance').cautions.some(s=>s.includes('sottogruppo MRD+')));
 assert.ok(branch({...p,mrd:'negative'},'gil_maintenance').cautions.some(s=>s.includes('nessun beneficio dimostrato')));
 assert.ok(branch({...p,mrdMarker:'npm1'},'gil_maintenance').cautions.some(s=>s.includes('non è intercambiabile')));
 assert.ok(branch({...p,mrd:'negative',mrdCoverage:'single'},'gil_maintenance').cautions.some(s=>s.includes('incompleto')));
 assert.ok(branch({...p,mrdTiming:'other'},'gil_maintenance').cautions.some(s=>s.includes('non è intercambiabile')));
});
test('continuation is only tied to the documented frontline regimen',()=>{
 const p={status:'remission',baselineFlt3:'itd',frontlineRegimen:'quizartinib'};
 assert.equal(branch(p,'quiz_continue').state,'match');assert.equal(branch(p,'mido_continue').state,'outside');
 assert.equal(branch({...p,frontlineRegimen:'unknown'},'quiz_continue').state,'pending');
 assert.equal(branch({...p,status:'post_hsct_cr1'},'mido_continue').state,'outside');
});
test('CPX351 is not silently applied to R/R or all secondary AML',()=>{
 assert.equal(branch({subtype:'taml'},'cpx351').state,'match');
 assert.equal(branch({subtype:'saml'},'cpx351').state,'pending');
 assert.equal(branch({...rr,subtype:'taml'},'cpx351').state,'outside');
});
test('safety distinguishes initiation, ongoing therapy, and missing data',()=>{
 assert.equal(branch({qtc:451},'quiz_front').state,'pending');
 assert.equal(branch({qtc:450},'quiz_front').state,'match');
 assert.equal(branch({longQt:'yes'},'quiz_front').state,'pending');
 assert.ok(branch({qtc:''},'quiz_front').cautions.some(x=>x.includes('incompleto')));
 assert.ok(branch({status:'remission',baselineFlt3:'itd',frontlineRegimen:'quizartinib',qtc:470},'quiz_continue').cautions.some(x=>x.includes('non è una regola di sospensione')));
});
test('adult indication is not narrowed to trial age range; invalid profiles fail closed',()=>{
 assert.equal(branch({age:80},'quiz_front').state,'match');
 assert.ok(branch({age:80},'quiz_front').cautions.some(x=>x.includes('Età fuori')));
 for(const age of ['',null,'abc',17,130,65.5])assert.equal(result({age}).strategies.length,0);
 for(const bad of [{status:'x'},{flt3:'x'},{npm1:'yes'},{qtc:900},{priorFlt3i:['x']},{priorFlt3i:'quizartinib'},{priorFlt3i:null},{priorVen:'yes'}])assert.ok(result(bad).errors.length);
});
test('co-mutations do not change compatibility through arbitrary weights',()=>{
 const base=result(rr).strategies.map(t=>[t.id,t.state]);
 for(const k of ['tp53','npm1','dnmt3a','runx1','asxl1','ptpn11','idh1','idh2','rasMapk']){
  assert.deepEqual(result({...rr,[k]:true}).strategies.map(t=>[t.id,t.state]),base);
 }
});
test('Piccini ITD warning is not transferred to isolated TKD',()=>{
 assert.ok(branch(rr,'ven_based_piccini').cautions.some(x=>x.includes('Piccini:')));
 assert.ok(!branch({...rr,flt3:'tkd'},'ven_based_piccini').cautions.some(x=>x.includes('Piccini:')));
 assert.ok(D.studies.piccini.limit.includes('2,3')&&D.studies.piccini.limit.includes('2,03'));
});
test('nonrandomized triplet cohorts and negative LACEWING remain separate',()=>{
 assert.equal(branch({intensiveFit:'no'},'triplet_front').group,'research');
 assert.equal(branch(rr,'triplet_rr').group,'research');
 assert.equal(branch({intensiveFit:'no'},'lacewing').group,'negative');
 assert.ok(D.studies.tripletFront.endpoints.some(x=>x[1]==='96%'));
 assert.ok(D.studies.tripletRr.endpoints.some(x=>x[1]==='27%'));
 assert.ok(D.studies.lacewing.endpoints.some(x=>x[1].includes('p=0,182')));
});
test('all study and regulatory links resolve in the curated registry; no invented metrics',()=>{
 assert.equal(new Set(D.strategies.map(t=>t.id)).size,D.strategies.length);
 for(const t of D.strategies){assert.ok(t.regRefs.length);for(const ref of t.regRefs)assert.ok(D.sources[ref]);for(const id of t.studies)assert.ok(D.studies[id]);}
 for(const s of Object.values(D.studies)){assert.ok(D.sources[s.source]);assert.ok(s.population&&s.design&&s.limit);assert.ok(s.endpoints.length);}
 for(const s of Object.values(D.sources))assert.ok(new URL(s.url).protocol==='https:');
 assert.ok(!JSON.stringify(result(rr)).includes('simulatedChoicePct'));
});
test('exhaustive categorical matrix is deterministic and does not mutate inputs',()=>{
 let n=0;
 for(const status of Object.keys(E.statuses))for(const flt3 of ['wt','itd','tkd','both','unknown'])for(const intensiveFit of ['yes','no','unknown'])for(const transplantFit of ['yes','no','unknown'])for(const retestedFlt3AtRelapse of ['yes','no','unknown']){
  const p=Object.freeze({status,flt3,intensiveFit,transplantFit,retestedFlt3AtRelapse});
  const r=result(p);assert.equal(r.errors.length,0);assert.deepEqual(r,result(p));
  for(const t of r.strategies){assert.ok(['match','pending','outside'].includes(t.state));if(t.state==='match')assert.equal(t.excluded.length+t.pending.length,0);}
  n++;
 }
 assert.equal(n,810);
});
