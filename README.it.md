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
- temi colore globali con interfaccia sempre a gradiente
- area setup protetta da una semplice somma numerica
- categorie di parole modificabili
- categorie personalizzate aggiungibili e rimovibili dal setup
- foto locali della famiglia configurabili dal setup
- fallback su SVG generico locale per la categoria famiglia
- ricerca realtime delle immagini per le altre categorie
- picker immagini integrato nella stessa modale setup
- ricerca immagini con chiave personalizzata
- varianti automatiche per query composte
- upload dal dispositivo per l’immagine di una singola parola non famiglia
- ARASAAC come sorgente visiva primaria
- Wikipedia/Wikimedia come fallback
- cache immagini persistente opzionale
- esportazione configurazione in JSON
- importazione configurazione da JSON
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
- Configurazioni
- Categorie

Dal setup è possibile:

- regolare il volume del parlato
- regolare il volume della musica della cerimonia
- modificare la dimensione di lettere e caselle
- attivare o disattivare l’evidenziazione della prossima lettera da digitare
- scegliere un tema colori globale
- attivare o disattivare l’immagine guida
- attivare o disattivare la cache immagini
- scegliere la posizione dell’immagine: laterale o sotto
- aprire un picker immagini web per ogni parola non famiglia
- cercare immagini con una query personalizzata per parola
- mantenere la scelta automatica, impostare un’immagine web preferita o caricare un’immagine locale
- regolare lo zoom dell’immagine selezionata per singola parola
- attivare o disattivare la cerimonia finale
- attivare o disattivare l’interruzione della cerimonia con click o barra spaziatrice
- regolare il tempo di attesa prima della cerimonia
- esportare la configurazione corrente in JSON
- importare una configurazione JSON
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
- Il picker immagini resta dentro la modale setup e non apre una seconda modale sovrapposta.
- Per le parole non famiglia è possibile anche caricare un’immagine locale dal dispositivo.
- Il picker immagini accetta una chiave di ricerca personalizzata e prova anche varianti automatiche per query multi-parola.
- Se attivata, la cache immagini viene salvata in `localStorage`.
- Le configurazioni importate vengono normalizzate prima di essere applicate.
- Le immagini locali caricate per parole non famiglia sono incluse in export/import tramite `preferredWordImages`.
- Anche il nome delle categorie personalizzate viene usato come contesto per la ricerca immagini realtime.
- Se manca una foto famiglia, l’app usa `assets/famiglia/generico.svg`.
- La musichetta della cerimonia attende che l’audio sia pronto prima di avviare il fade-in.
- L’interfaccia è volutamente semplice, visiva e prevedibile.
