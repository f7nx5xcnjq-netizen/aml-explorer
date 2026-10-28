# Revisione delle evidenze e regole · 28 ottobre 2026

Base del lavoro: `3a60c674529c5e034db807b5b4e6782db2af7845`. Sono stati ripresi i temi delle discussioni precedenti e verificati tramite fonti primarie e documenti EMA. Le precedenti risposte dell’assistente non sono considerate fonti scientifiche. Nessun nuovo valore è stimato o ricostruito per colmare dati mancanti.

## Matrice di implementazione

| Tema | Fonte verificata | Uso nel motore / limite |
|---|---|---|
| Quizartinib frontline | [QuANTUM-First](https://pubmed.ncbi.nlm.nih.gov/37116523/), [RCP EMA](https://www.ema.europa.eu/en/documents/product-information/vanflyta-epar-product-information_en.pdf) | ITD, non TKD isolata; intensiva; continuazione legata al percorso iniziale. L’effetto dell’intera strategia non dimostra quello del solo mantenimento. |
| Midostaurina | [RATIFY](https://pubmed.ncbi.nlm.nih.gov/28644114/), [EMA](https://www.ema.europa.eu/en/medicines/human/EPAR/rydapt) | FLT3-mutata upfront; intervallo d’età del trial distinto dall’indicazione adulta. Nessuna gerarchia vs quizartinib. |
| Gilteritinib R/R | [ADMIRAL](https://pubmed.ncbi.nlm.nih.gov/31665578/), [follow-up](https://pubmed.ncbi.nlm.nih.gov/35081255/), [EMA](https://www.ema.europa.eu/en/medicines/human/EPAR/xospata) | FLT3 attuale documentata. Nessuna restrizione automatica per precedente quizartinib, midostaurina o altro FLT3i. |
| Sequenza quizartinib → gilteritinib | [Varianti FLT3](https://pubmed.ncbi.nlm.nih.gov/32040554/), [RAS/evoluzione clonale](https://pubmed.ncbi.nlm.nih.gov/31088841/) | Ramo R/R consentito quando FLT3 rimane mutata; avvisi sul meccanismo. Nessuna efficacia clinica prospettica per specifica variante dedotta da saggi preclinici; nessun aumento di dose suggerito. |
| RWE italiano | [Cairoli 2025](https://pubmed.ncbi.nlm.nih.gov/40839405/) | Coorte e sottogruppi separati; denominatore del bridge esplicitato. Associazioni prognostiche non trasformate in regole prescrittive. |
| AZA/VEN | [VIALE-A](https://pubmed.ncbi.nlm.nih.gov/32786187/), [FLT3 pooled analysis](https://pubmed.ncbi.nlm.nih.gov/35063965/), [EMA](https://www.ema.europa.eu/en/medicines/human/EPAR/venclyxto) | Nuova diagnosi non fit a intensiva; risultati globali e sottogruppi distinti. Non attribuire OS globale a un paziente ITD. |
| VEN R/R | [Piccini 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8070927/) | Off-label nel setting; segnale ITD non esteso a TKD. La MRD è riportata tra i CCR, non tra tutti i trattati. |
| Tripletto | [Report 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11095865/), [follow-up 2026](https://pubmed.ncbi.nlm.nih.gov/42200455/) | Sperimentale; frontline e R/R separati. Il follow-up non costituisce una nuova coorte indipendente. |
| GIL/AZA | [LACEWING finale 2026](https://haematologica.org/article/view/14388) | Scheda separata con risultato OS non significativo. Non promossa in base a ORR o sottogruppi esplorativi. |
| Quizartinib R/R | [QuANTUM-R](https://pubmed.ncbi.nlm.nih.gov/31175001/) | Evidenza RCT storica distinta dall’indicazione EMA di Vanflyta. |
| Post-HSCT CR1 | [MORPHO](https://pubmed.ncbi.nlm.nih.gov/38471061/), [analisi MRD](https://pubmed.ncbi.nlm.nih.gov/39775763/) | RFS globale non significativa; lettura MRD contestuale. Marcatore NPM1/flow non sostituisce FLT3-ITD; negatività di un solo tempo non equivale a negatività peri-HSCT completa. |
| Sorafenib | [SORMAIN](https://pubmed.ncbi.nlm.nih.gov/32673171/), [fase III follow-up](https://doi.org/10.1016/S2352-3026(23)00117-5), [EMA](https://www.ema.europa.eu/en/medicines/human/EPAR/nexavar) | Evidenze in mantenimento dopo HSCT; indicazione AML non presente nel documento EMA consultato. |
| CPX-351 | [RCT](https://pubmed.ncbi.nlm.nih.gov/30024784/), [EMA](https://www.ema.europa.eu/en/medicines/human/EPAR/vyxeos-liposomal) | Nuova diagnosi t-AML/AML-MRC, non qualunque sAML e non R/R automaticamente. Nessuna combinazione FLT3i inventata. |
| Fitness, rischio, MRD | [ELN 2022](https://pubmed.ncbi.nlm.nih.gov/35797463/) | Intensiva e HSCT separati; nessuna classe ELN assegnata con informazioni incomplete e nessun peso allelico usato come scorciatoia. |
| IDH1 | [EMA Tibsovo](https://www.ema.europa.eu/en/medicines/human/EPAR/tibsovo) | Nota sulla necessità di variante R132 e contesto corretto, senza priorità automatica rispetto a FLT3. |

## Correzioni scientifiche rispetto al vecchio motore

1. Rimosse probabilità di scelta costruite con incrementi arbitrari e ranking Xospata predefinito.
2. Rimossa la categoria aggregata “probabilità di successo”: CR, CR/CRh, CR/CRi, CCR, ORR, MRD e HSCT mantengono le definizioni di ciascuna fonte.
3. Nessuna media o confronto di superiorità tra ADMIRAL, Piccini, VIALE-A, QuANTUM-First e RATIFY.
4. Rimossa penalità VEN applicata a ogni FLT3-mutazione sulla base del solo segnale ITD di Piccini.
5. Il retest R/R incompleto non è biologicamente equivalente a FLT3 wild type.
6. Rimossi i flag di recidiva che potevano contraddire il menu clinico. Un unico scenario alimenta schede e percorso.
7. Età, MRD, storia e fitness HSCT hanno ora ruoli espliciti; non sono covariate di una previsione non validata.
8. La selezione NPM1 o altre co-mutazioni non aggiunge punti a gilteritinib o sottrae punti a CPX-351.

## Discrepanze e dati non importati

- **Piccini**: OS NPM1mut/FLT3-ITD+ pari a 2,3 mesi nel testo e 2,03 nella tabella 2. Esposte entrambe come discrepanza, senza scegliere un numero per l’algoritmo. Il bridge è descritto sul sottogruppo con intento al trapianto; non è una probabilità per tutti i pazienti.
- **CPX-351**: il precedente oggetto univa esiti da coorti/follow-up differenti. Questa versione presenta il RCT verificato, senza ricostruire un profilo sintetico dagli altri studi. I valori precedenti restano nella storia Git.
- **Perrone 2026**: identificato [PMID 41914434](https://pubmed.ncbi.nlm.nih.gov/41914434/); metanalisi su HMA/VEN in pazienti giovani, non utilizzata come prova prospettica specifica per FLT3 né per autorizzare automaticamente HMA/VEN nei fit.
- **NPM1/menin, IDH2 e nuovi FLT3i**: annotati come aree non implementate senza fonte/setting/regolatorio verificati. La presenza di un bersaglio non genera un consiglio terapeutico.
- **ITD length, VAF e allelic ratio**: non introdotti come pesi predittivi non validati. Nessuna vecchia soglia ELN 2017 applicata a una classificazione moderna incompleta.
- **AIFA**: rimborsabilità e condizioni di accesso italiane non verificate; la classificazione visualizzata riguarda EMA/UE.
- Non sono stati recuperati integralmente tutti gli allegati storici: i risultati utilizzati provengono dai riferimenti primari verificati in questa revisione. La copertura non è sistematica o esaustiva.

## Criteri di accettazione

- Quizartinib non compare come ramo EMA frontline nella TKD isolata.
- Gilteritinib resta pertinente in R/R FLT3-mutata confermata **dopo quizartinib**; F691L e RAS/MAPK aggiungono cautela, non un divieto automatico.
- Genotipo storico ITD non riattiva target della malattia attiva quando il ritest è WT.
- Mantenimento in CR1 e recidiva dopo HSCT non condividono lo stesso ramo.
- Non usare MRD NPM1 o solo una MRD negativa pre-HSCT come prova del sottogruppo MORPHO MRD− peri-HSCT.
- Tripletto R/R non eredita la risposta della coorte frontline; LACEWING non viene promosso a standard.
- Fonti verificabili e limiti sempre consultabili. Nessun numero generato dal profilo.
