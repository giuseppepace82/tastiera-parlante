# 🎮 Tastiera Parlante – Contesto per Codex

## 📌 Obiettivo
Questo progetto è un gioco educativo per bambini sviluppato in HTML + JavaScript.

Scopo:
- Aiutare il bambino a imparare le lettere
- Associare suono + lettera
- Comporre parole guidate

Target prioritario:
- bambini e ragazzini con difficoltà nel linguaggio e nella comunicazione
- utenti non verbali o con comunicazione verbale limitata
- utilizzo in contesti educativi, familiari e terapeutici

Utenti secondari:
- genitori
- terapisti
- educatori

Il focus NON è la performance ma:
- semplicità
- chiarezza
- UX per bambini
- supporto visivo e comunicativo
- prevedibilità del comportamento

---

## 🧠 Funzionamento del gioco

1. Viene scelta una parola casuale da un array
2. La parola viene mostrata in alto (MAIUSCOLA, con accenti)
3. Sotto viene mostrato il pannello di composizione della parola, con una casella per ogni lettera
4. Il bambino digita lettere sulla tastiera

### Regole:
- Lettera corretta:
  - viene inserita nella casella corrispondente del pannello di composizione
  - viene pronunciata
- Lettera sbagliata:
  - viene pronunciata
  - NON viene inserita

Supporti opzionali attuali:
- la prossima lettera da digitare può essere evidenziata visivamente
- la dimensione delle lettere e delle caselle è configurabile da setup

Quando la parola è completa:
1. viene pronunciata tutta la parola
2. dopo un breve ritardo parte una celebrazione visiva + musicale
3. viene caricata una nuova parola al termine della celebrazione
4. la parola completata resta visibile fino al caricamento della successiva

---

## 🎨 Regole grafiche

### Colori:
- Vocali → Fucsia (#FF00FF)
- Consonanti → Verde (#32CD32)

Applicato a:
- lettere parola
- caselle del pannello di composizione
- lettera digitata

### UI:
- Tutto in MAIUSCOLO
- Casella attiva → bordo GIALLO
- Prossima lettera attesa → evidenziazione opzionale su lettera in alto + casella corrispondente nel pannello `typed`
- Layout perfettamente allineato (grid)
- immagine guida opzionale
- layout immagine configurabile:
  - laterale
  - sotto alle parole
- le parole che contengono spazi devono andare a capo nel punto dello spazio sia nella parola mostrata sia nel pannello di composizione
- durante il cambio immagine deve essere mostrato uno spinner
- il pannello lettere può essere scalato da setup
- il pannello di gioco e il pannello immagine devono restare visivamente allineati in altezza nel layout desktop

---

## 🔊 Audio

### Sintesi vocale:
- Web Speech API
- lingua: italiano
- velocità lenta e chiara

### Regole:
- Le parole → pronuncia italiana lenta e comprensibile
- Le lettere → pronuncia italiana chiara, leggermente più rapida rispetto alle parole
- usare preferibilmente una voce italiana disponibile sul dispositivo/browser
- il volume del parlato è configurabile da setup ed è ulteriormente amplificato rispetto al livello base scelto
- all’avvio della pagina la parola corrente deve essere annunciata subito, senza richiedere un click preliminare sulla pagina, compatibilmente con i limiti del browser

### Modalità fonetica:
Attivabile via toggle UI

Esempi:
- B → "b"
- R → "r"
- S → "sss"

---

## 🎵 Musica

File:

- `assets/sounds/musichetta_gioco_1.mp3`

Regole attuali:
- al completamento della parola la musichetta parte dopo un ritardo configurabile da setup
- la clip musicale dura 6 secondi
- la clip viene presa da un punto casuale del brano
- applicare dissolvenza audio in entrata e uscita

---

## 🧩 Immagini e PECS

Scopo:
- supportare il riconoscimento visivo della parola
- aiutare utenti con comunicazione aumentativa/alternativa
- privilegiare pittogrammi o immagini facilmente interpretabili

Regole attuali:
- la categoria `famiglia` usa immagini locali da `assets/famiglia`
- le altre categorie usano recupero realtime dal web
- sorgente primaria: `ARASAAC`, preferita perché più adatta a pittogrammi/AAC/PECS-like
- fallback secondario: `Wikipedia/Wikimedia`
- quando una parola è ambigua, la ricerca deve includere anche la categoria
  - esempio: `RISO` categoria `CIBO` non deve essere interpretato come sorriso/risata
- se un’immagine non si carica, il sistema deve tentare automaticamente altri candidati prima di mostrare fallback o errore
- per le categorie personalizzate, nelle ricerche realtime il nome della categoria deve essere usato come contesto semantico aggiuntivo
- per ogni parola non `famiglia` è possibile scegliere dal setup una specifica immagine web da usare come candidata prioritaria
- la selezione immagini per parola è raccolta in accordion chiusi di default
- nel picker immagini è possibile sfogliare più pagine di risultati recuperati dal web
- lo zoom dell’immagine è configurato sulla singola immagine selezionata, non come impostazione globale

---

## ⚙️ Setup

La funzionalità di setup è pensata per:
- genitori
- terapisti
- educatori

Accesso:
- icona setup in alto a destra
- accesso protetto tramite risoluzione di una piccola somma numerica

Funzioni attuali del setup:
- il setup è organizzato in sezioni funzionali:
  - Audio
  - Pannello lettere
  - Immagini
  - Cerimonia
  - Categorie
- sezione Audio:
  - regolare il volume del parlato
  - regolare il volume della musica della cerimonia
- sezione Pannello lettere:
  - regolare la dimensione di lettere e caselle
  - attivare o disattivare l’evidenziazione della prossima lettera da digitare
- sezione Immagini:
  - attivare o disattivare la visualizzazione dell’immagine guida
  - scegliere la posizione dell’immagine:
    - laterale
    - sotto alle parole
  - per ogni parola non `famiglia`, aprire un picker immagini web
  - scegliere o ripristinare la selezione automatica dell’immagine per singola parola
  - regolare lo zoom della singola immagine selezionata
- sezione Cerimonia:
  - attivare o disattivare la cerimonia finale
  - attivare o disattivare l’interruzione della cerimonia tramite click o barra spaziatrice
  - regolare il tempo di attesa prima dell’avvio della cerimonia
- sezione Categorie:
  - attivare o disattivare singole categorie baseline
  - modificare l’elenco delle parole per categoria
  - aggiungere nuove categorie personalizzate
  - rimuovere categorie personalizzate
  - ripristinare una baseline predefinita di parole

CTA attuali nel setup categorie:
- aggiunta categoria personalizzata tramite icona `+`
- rimozione categoria personalizzata tramite icona cestino

Categorie baseline attuali:
- famiglia
- animali
- cibo
- divertimento
- colori
- mezzi
- natura

Categorie personalizzate:
- possono essere create da setup
- hanno nome modificabile, flag di attivazione e lista parole dedicata
- sono persistite in `localStorage`
- entrano nel pool di selezione delle parole come le categorie baseline

Persistenza:
- le impostazioni vengono salvate in `localStorage`

---

## 🏗️ Stato Tecnico Attuale

Architettura frontend:
- `index.html` contiene la view principale, markup e CSS
- il JavaScript è separato in file distinti con responsabilità diverse

Struttura attuale:
- `js/config/game-config.js`
- `js/model/game-model.js`
- `js/view/game-view.js`
- `js/controller/game-controller.js`
- `js/services/image-service.js`
- `js/services/speech-service.js`
- `js/app.js`

Separazione delle responsabilità:
- `model`:
  - stato del gioco
  - impostazioni
  - utilità pure su parole e lettere
- `view`:
  - rendering DOM
  - overlay setup
  - rendering immagine
  - canvas per celebrazione
- `controller`:
  - orchestrazione del flusso di gioco
  - eventi tastiera
  - coordinamento tra model, view e services
- `services`:
  - recupero immagini realtime
  - gestione sintesi vocale

Nota tecnica importante:
- il caricamento JS è basato su script classici separati, non su ES modules
- evitare di riportare logica applicativa inline dentro `index.html`
- le configurazioni UI del setup devono riflettere sempre la struttura funzionale reale del gioco, non solo lo stato tecnico del codice
- il pannello di composizione attivo è `#typed`; il vecchio contenitore `#boxes` non fa più parte della UI

---

## 🎉 Celebrazione

Al completamento corretto della parola:
- viene pronunciata la parola completa
- parte la musichetta finale
- parte una celebrazione grafica sincronizzata
- la parola completata resta visibile fino alla successiva

Elementi grafici della celebrazione:
- coriandoli
- elementi volanti variabili a tema casuale:
  - palloncini
  - stelle
  - panda
  - orsetti

Durata:
- sincronizzata con la musichetta finale
- dissolvenza visiva verso la fine

---

## 🧭 Linee Guida di Sviluppo

Quando modifichi il progetto:
- preserva la semplicità d’uso per bambini e ragazzi con difficoltà comunicative
- considera sempre il valore del supporto visivo e della prevedibilità
- privilegia interazioni chiare, lente e coerenti
- mantieni la separazione tra view, model, controller e services
- non degradare la leggibilità con refactor solo “tecnici” senza beneficio reale per UX o manutenzione
