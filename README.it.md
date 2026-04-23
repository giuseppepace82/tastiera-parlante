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
4. Il bambino digita le lettere sulla tastiera.
5. Le lettere corrette vengono inserite e pronunciate.
6. Le lettere errate vengono pronunciate ma non inserite.
7. Quando la parola è completata, viene pronunciata per intero e parte una breve celebrazione.

## Funzionalità Attuali

- sintesi vocale in italiano per lettere e parole
- pronuncia delle parole più lenta per maggiore chiarezza
- immagine guida opzionale laterale o sotto la parola
- area setup protetta da una semplice somma numerica
- categorie di parole modificabili
- foto locali della famiglia configurabili dal setup
- fallback su SVG generico locale per la categoria famiglia
- ricerca realtime delle immagini per le altre categorie
- ARASAAC come sorgente visiva primaria
- Wikipedia/Wikimedia come fallback
- musichetta ed effetti di celebrazione al completamento corretto

## Categorie

La libreria base include:

- famiglia
- animali
- cibo
- divertimento
- colori
- mezzi
- natura

## Setup

Il setup è pensato per adulti, in particolare:

- genitori
- terapisti
- educatori

Dal setup è possibile:

- attivare o disattivare l’immagine guida
- scegliere la posizione dell’immagine: laterale o sotto
- attivare o disattivare le categorie
- modificare l’elenco delle parole per ogni categoria
- associare una foto locale a ogni parola della categoria famiglia
- ripristinare la libreria base predefinita

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
- Se manca una foto famiglia, l’app usa `assets/famiglia/generico.svg`.
- L’interfaccia è volutamente semplice, visiva e prevedibile.
