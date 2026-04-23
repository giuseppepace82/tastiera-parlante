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
3. Sotto vengono mostrate caselle vuote (una per lettera)
4. Il bambino digita lettere sulla tastiera

### Regole:
- Lettera corretta:
  - viene inserita nella casella
  - viene pronunciata
- Lettera sbagliata:
  - viene pronunciata
  - NON viene inserita

Quando la parola è completa:
1. viene pronunciata tutta la parola
2. dopo un breve ritardo parte una celebrazione visiva + musicale
3. viene caricata una nuova parola al termine della celebrazione

---

## 🎨 Regole grafiche

### Colori:
- Vocali → Fucsia (#FF00FF)
- Consonanti → Verde (#32CD32)

Applicato a:
- lettere parola
- caselle
- lettera digitata

### UI:
- Tutto in MAIUSCOLO
- Casella attiva → bordo GIALLO
- Layout perfettamente allineato (grid)
- immagine guida opzionale
- layout immagine configurabile:
  - laterale
  - sotto alle parole
- durante il cambio immagine deve essere mostrato uno spinner

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
- al completamento della parola la musichetta parte dopo 2 secondi
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
- attivare o disattivare la visualizzazione dell’immagine guida
- scegliere la posizione dell’immagine:
  - laterale
  - sotto alle parole
- attivare o disattivare singole categorie di parole
- modificare l’elenco delle parole per categoria
- ripristinare una baseline predefinita di parole

Categorie baseline attuali:
- famiglia
- animali
- cibo
- divertimento
- colori
- mezzi
- natura

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

---

## 🎉 Celebrazione

Al completamento corretto della parola:
- si svuota la barra delle lettere inserite
- viene pronunciata la parola completa
- parte la musichetta finale
- parte una celebrazione grafica sincronizzata

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
