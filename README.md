# AML Explorer · evidenze FLT3

Esploratore **didattico e non prescrittivo** di scenari AML. Versione 2.0.0; revisione delle fonti: **28 ottobre 2026**. Non validato come dispositivo medico o sistema di supporto a decisioni cliniche.

## Cosa cambia

Il precedente ranking percentuale era una funzione euristica non calibrata. È rimosso: il motore ora spiega la **pertinenza dell’evidenza** al profilo, senza stimare probabilità individuali o confrontare indirettamente trattamenti.

- Prima linea: chemioterapia + quizartinib per ITD; chemioterapia + midostaurina per FLT3-mutata; AZA/VEN nei non candidabili a intensiva; CPX-351 nel contesto documentato t-AML/AML-MRC.
- R/R: gilteritinib con FLT3 attuale documentata, **anche dopo quizartinib**. Esposizione pregressa e resistenze producono avvisi, non un’esclusione automatica. Il ritest non effettuato è dato mancante, non mutazione assente.
- VEN-based Piccini e QuANTUM-R restano distinguibili dalle indicazioni EMA del setting.
- Tripletto AZA/VEN/GIL: coorti frontline e R/R separate; LACEWING separato e segnalato per mancato beneficio OS significativo.
- Remissione senza HSCT e CR1 post-HSCT distinte dalla recidiva. Continuazione quizartinib solo dopo lo schema corrispondente; MORPHO e sorafenib in schede fuori indicazione EMA.
- Matrice fitness intensiva × fitness HSCT; genotipo attuale distinto da quello alla diagnosi; MRD con marcatore, tempo e copertura del campionamento; nove co-mutazioni originali più D835/F691L.
- Endpoints con studio, popolazione, denominatore quando verificato e limiti. Nessun indicatore generico di “successo”.

## Avvio

Aprire `index.html` in un browser: non serve una build né un server. In alternativa, dalla directory del progetto:

```sh
python3 -m http.server 8000
```

Aprire `http://localhost:8000`. GitHub Pages può servire gli stessi file statici. Il codice non usa servizi esterni, analytics, cookie o archiviazione del profilo. I link bibliografici aprono siti esterni soltanto su richiesta dell’utente.

## Test

Node.js >=20:

```sh
npm run check
npm test
```

I test della logica non hanno dipendenze. La matrice attraversa 810 combinazioni di scenario, FLT3, fitness e ritest, oltre ai casi mirati. Per il browser:

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:browser
```

È possibile usare un Chromium già presente impostando `AML_CHROMIUM_EXECUTABLE`. Il test browser copre desktop, 390 e 320 px, controlli mutazionali, ricaduta dopo quizartinib, perdita FLT3, MRD, confronto, reset, profili non validi, errori JavaScript e assenza di richieste di rete del motore. Le schermate diagnostiche sono temporanee in `/tmp`.

## File

| File | Responsabilità |
|---|---|
| `evidence.js` | Registro di fonti, studi, endpoint e rami regolatori |
| `engine.js` | Funzioni pure: validazione, pertinenza, dati mancanti e note |
| `app.js` | Form, schede, confronto e bibliografia |
| `index.html`, `styles.css` | Struttura accessibile e layout responsive |
| `tests/engine.test.cjs`, `tests/browser.cjs` | Regressioni logiche e UI |
| `docs/EVIDENCE_REVIEW.md` | Matrice fonti/regole, limiti e decisioni editoriali |

## Interpretazione degli stati

- **Pertinente allo scenario**: i criteri modellati coincidono. Non è una certificazione di appropriatezza o sicurezza.
- **Da verificare**: mancano dati necessari o vi è un controllo di sicurezza aperto.
- **Non pertinente**: setting o criteri modellati diversi. Il motivo rimane consultabile.

Questi stati sono indipendenti da **indicazione EMA**, **off-label**, **sperimentale** e **risultato negativo**. Un ramo sperimentale può essere pertinente allo scenario senza diventare uno standard terapeutico. L’ordine delle schede non è un ranking.

## Limiti importanti

Copertura mirata, non revisione sistematica di tutta la letteratura AML. Indicazioni EMA e accesso/rimborsabilità AIFA non sono intercambiabili; l’accesso italiano non è verificato. Nessuna dose, scelta individuale, stima di prognosi, classe ELN incompleta o soglia di fitness derivata dalla sola età. Il controllo di sicurezza è parziale. L’assenza di una mutazione spuntata non significa un test negativo.

Il motore non sostituisce RCP, linee guida aggiornate, referti completi o discussione multidisciplinare. Le fonti sono una fotografia datata, non si aggiornano automaticamente. Una modifica delle evidenze richiede revisione della fonte e test pertinenti prima della pubblicazione.
