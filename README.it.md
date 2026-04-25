# Tastiera Parlante

[English version](./README.md)

Tastiera Parlante è un gioco educativo da tastiera sviluppato in HTML, CSS e JavaScript.

È pensato per aiutare i bambini a esercitarsi con lettere, suoni e completamento guidato delle parole, con particolare attenzione a bambini e ragazzi con difficoltà nel linguaggio e nella comunicazione, inclusi utenti non verbali.

## Obiettivi Principali

- favorire il riconoscimento delle lettere
- associare suono e simbolo scritto
- guidare il completamento delle parole con un flusso semplice e prevedibile
- offrire supporto visivo tramite immagini e pittogrammi
- mantenere l’interazione accessibile per genitori, terapisti ed educatori

## Come Funziona

1. Il gioco seleziona una parola dalle categorie attive.
2. La parola viene mostrata in maiuscolo.
3. Sotto la parola compaiono caselle vuote.
4. La parola intera viene pronunciata appena compare.
5. Facoltativamente può essere evidenziata la prossima lettera attesa.
6. Il bambino digita le lettere sulla tastiera.
7. Le lettere corrette vengono inserite e pronunciate.
8. Le lettere errate vengono pronunciate ma non inserite.
9. Quando la parola è completata, viene pronunciata per intero e parte una breve celebrazione dopo un ritardo configurabile.

## Funzionalità Attuali

- sintesi vocale in italiano per lettere e parole
- pronuncia delle parole più lenta per maggiore chiarezza
- volume del parlato amplificato e configurabile dal setup
- immagine guida opzionale laterale o sotto la parola
- dimensione di lettere e caselle configurabile
- evidenziazione opzionale della prossima lettera da digitare
- area setup protetta da una semplice somma numerica
- categorie di parole modificabili
- categorie personalizzate aggiungibili e rimovibili dal setup
- foto locali della famiglia configurabili dal setup
- fallback su SVG generico locale per la categoria famiglia
- ricerca realtime delle immagini per le altre categorie
- ARASAAC come sorgente visiva primaria
- Wikipedia/Wikimedia come fallback
- musichetta ed effetti di celebrazione al completamento corretto
- ritardo della cerimonia configurabile
- interruzione opzionale della cerimonia con click o barra spaziatrice

## Categorie

La libreria base include:

- famiglia
- animali
- cibo
- divertimento
- colori
- mezzi
- natura

Dal setup è possibile creare anche categorie personalizzate.

## Setup

Il setup è pensato per adulti, in particolare:

- genitori
- terapisti
- educatori

Il setup è attualmente organizzato in sezioni:

- Audio
- Pannello lettere
- Immagini
- Cerimonia
- Categorie

Dal setup è possibile:

- regolare il volume del parlato
- regolare il volume della musica della cerimonia
- modificare la dimensione di lettere e caselle
- attivare o disattivare l’evidenziazione della prossima lettera da digitare
- attivare o disattivare l’immagine guida
- scegliere la posizione dell’immagine: laterale o sotto
- attivare o disattivare la cerimonia finale
- attivare o disattivare l’interruzione della cerimonia con click o barra spaziatrice
- regolare il tempo di attesa prima della cerimonia
- attivare o disattivare le categorie base
- modificare l’elenco delle parole per ogni categoria base
- aggiungere categorie personalizzate
- rimuovere categorie personalizzate
- associare una foto locale a ogni parola della categoria famiglia
- ripristinare la libreria base predefinita

Le azioni sulle categorie usano CTA a icona:

- `+` aggiunge una categoria personalizzata
- il cestino rimuove una categoria personalizzata

Le impostazioni vengono salvate nel browser tramite `localStorage`.

## Struttura Tecnica

Il progetto usa script browser classici ed è organizzato con una separazione semplice in stile MVC:

- `index.html`
- `js/config/game-config.js`
- `js/model/game-model.js`
- `js/view/game-view.js`
- `js/controller/game-controller.js`
- `js/services/image-service.js`
- `js/services/speech-service.js`
- `js/app.js`

## Avvio del Progetto

Non è richiesto alcun build step.

Apri `index.html` in un browser.

Per sintesi vocale e caricamento immagini realtime è consigliato un browser moderno.

## Note

- Le immagini della categoria famiglia sono gestite in locale.
- Le immagini delle altre categorie vengono cercate in tempo reale.
- Anche il nome delle categorie personalizzate viene usato come contesto per la ricerca immagini realtime.
- Se manca una foto famiglia, l’app usa `assets/famiglia/generico.svg`.
- L’interfaccia è volutamente semplice, visiva e prevedibile.
