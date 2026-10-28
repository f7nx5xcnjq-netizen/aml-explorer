const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.AML_CHROMIUM_EXECUTABLE?{executablePath:process.env.AML_CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']}: {})});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url());});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 await page.waitForSelector('[data-strategy="quiz_front"]');
 const state=id=>page.locator('[data-strategy="'+id+'"]');
 assert.match(await state('quiz_front').getAttribute('class'),/match/);
 assert.match(await state('mido_front').getAttribute('class'),/match/);
 await page.selectOption('#flt3','tkd');
 assert.match(await state('quiz_front').getAttribute('class'),/outside/);
 assert.match(await state('mido_front').getAttribute('class'),/match/);
 await page.selectOption('#status','rr');
 await page.selectOption('#retestedFlt3AtRelapse','yes');
 await page.check('[data-prior="quizartinib"]');
 assert.match(await state('gilteritinib_rr_flt3').getAttribute('class'),/match/);
 assert.ok((await state('gilteritinib_rr_flt3').innerText()).includes('Gilteritinib'));
 // All original mutation checkboxes are still selectable and wired to the profile.
 const molecular=page.locator('summary').filter({hasText:'MRD e co-mutazioni'});
 await molecular.click();
 for(const k of ['tp53','npm1','dnmt3a','runx1','asxl1','ptpn11','idh1','idh2','rasMapk']){
  await page.check('[data-bool="'+k+'"]');assert.equal(await page.isChecked('[data-bool="'+k+'"]'),true);
 }
 assert.match(await state('gilteritinib_rr_flt3').getAttribute('class'),/match/);
 await page.uncheck('[data-compare="gilteritinib_rr_flt3"]');
 assert.equal(await page.locator('#comparison').getByRole('cell',{name:/^Gilteritinib \/ Xospata/}).count(),0);
 await page.check('[data-compare="gilteritinib_rr_flt3"]');
 assert.ok(await page.locator('#comparison').getByRole('cell',{name:/^Gilteritinib \/ Xospata/}).count()>0);
 await page.selectOption('#flt3','wt');
 assert.match(await state('gilteritinib_rr_flt3').getAttribute('class'),/outside/);
 assert.equal(await page.locator('#comparison').getByRole('cell',{name:/^Gilteritinib \/ Xospata/}).count(),0);
 await page.selectOption('#status','post_hsct_cr1');
 await page.selectOption('#baselineFlt3','itd');
 await page.selectOption('#mrd','positive');
 await page.selectOption('#mrdMarker','flt3_itd');
 await page.selectOption('#mrdTiming','peri_hsct');
 assert.match(await state('gil_maintenance').getAttribute('class'),/match/);
 assert.ok((await state('gil_maintenance').textContent()).includes('sottogruppo MRD+'));
 await page.selectOption('#mrdMarker','npm1');
 assert.ok((await state('gil_maintenance').textContent()).includes('non è intercambiabile'));
 await page.click('#reset');
 await page.selectOption('#intensiveFit','no');
 assert.match(await state('triplet_front').getAttribute('class'),/match/);
 assert.ok((await state('triplet_front').innerText()).includes('SPERIMENTALE'));
 assert.ok((await state('lacewing').innerText()).includes('OS NON SIGNIFICATIVA'));
 await page.fill('#age','17');await page.locator('#age').dispatchEvent('change');
 assert.equal(await page.locator('#errors').isVisible(),true);
 assert.equal(await page.locator('#strategies .strategy').count(),0);
 await page.click('#reset');
 assert.equal(await page.locator('#errors').isVisible(),false);
 await page.screenshot({path:'/tmp/aml-explorer-desktop.png',fullPage:false});
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});
  const dimensions=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth}));
  assert.ok(dimensions.body<=dimensions.viewport,JSON.stringify(dimensions));
 }
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'/tmp/aml-explorer-mobile.png',fullPage:false});
 await page.selectOption('#status','rr');await page.selectOption('#retestedFlt3AtRelapse','yes');
 await page.check('[data-prior="quizartinib"]');
 await state('gilteritinib_rr_flt3').scrollIntoViewIfNeeded();
 await page.screenshot({path:'/tmp/aml-explorer-mobile-rr.png',fullPage:false});
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
 console.log('Browser smoke passed: desktop + 390/320 px, quiz → gilteritinib, mutation controls, MRD, compare, reset, validation, no network or JS errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
