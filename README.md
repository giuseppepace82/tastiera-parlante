# Tastiera Parlante

[Versione italiana](./README.it.md)

Tastiera Parlante is an educational keyboard game built with HTML, CSS, and JavaScript.

It is designed to help children practice letters, sounds, and guided word completion, with a special focus on children and teens with speech, language, and communication difficulties, including non-verbal users.

## Main Goals

- support letter recognition
- connect sound and written symbol
- guide word completion with a simple, predictable flow
- provide visual support through images and pictograms
- keep the interaction accessible for parents, therapists, and educators

## How It Works

1. The game selects a word from the enabled categories.
2. The word is shown in uppercase.
3. Empty boxes appear below the word.
4. The child types letters on the keyboard.
5. Correct letters are inserted and pronounced.
6. Incorrect letters are pronounced but not inserted.
7. When the word is completed, the full word is spoken and a short celebration starts.

## Current Features

- Italian speech synthesis for letters and words
- slower word pronunciation for better clarity
- optional guide image shown next to the word or below it
- setup area protected by a simple arithmetic challenge
- editable word categories
- local family photos configurable from setup
- generic local SVG fallback for family entries
- realtime image search for other categories
- ARASAAC as primary visual source
- Wikipedia/Wikimedia as fallback
- music and celebration effects after correct completion

## Categories

The default word library includes:

- family
- animals
- food
- fun
- colors
- vehicles
- nature

## Setup

The setup is intended for adults, especially:

- parents
- therapists
- educators

From setup, it is possible to:

- enable or disable guide images
- choose image position: side or bottom
- enable or disable categories
- edit the word list for each category
- assign a local family photo to each family word
- restore the default baseline word library

Settings are stored in the browser through `localStorage`.

## Technical Structure

The project uses classic browser scripts and is organized with a simple MVC-style separation:

- `index.html`
- `js/config/game-config.js`
- `js/model/game-model.js`
- `js/view/game-view.js`
- `js/controller/game-controller.js`
- `js/services/image-service.js`
- `js/services/speech-service.js`
- `js/app.js`

## Running the Project

No build step is required.

Open `index.html` in a browser.

For speech synthesis and live image loading, a modern browser is recommended.

## Notes

- Family images are handled locally.
- Other category images are fetched in realtime.
- If a family image is missing, the app uses `assets/famiglia/generico.svg`.
- The interface is intentionally simple and highly visual.
