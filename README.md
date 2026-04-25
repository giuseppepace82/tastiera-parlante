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
4. The full word is spoken as soon as it appears.
5. An optional visual hint can highlight the next expected letter.
6. The child types letters on the keyboard.
7. Correct letters are inserted and pronounced.
8. Incorrect letters are pronounced but not inserted.
9. When the word is completed, the full word is spoken and a short celebration starts after a configurable delay.

## Current Features

- Italian speech synthesis for letters and words
- slower word pronunciation for better clarity
- boosted spoken output volume, configurable from setup
- optional guide image shown next to the word or below it
- configurable letter and box size
- optional highlight for the next expected letter
- setup area protected by a simple arithmetic challenge
- editable word categories
- custom categories that can be added and removed from setup
- local family photos configurable from setup
- generic local SVG fallback for family entries
- realtime image search for other categories
- ARASAAC as primary visual source
- Wikipedia/Wikimedia as fallback
- music and celebration effects after correct completion
- configurable celebration delay
- optional celebration skip via click or space bar

## Categories

The default word library includes:

- family
- animals
- food
- fun
- colors
- vehicles
- nature

Additional custom categories can be created from setup.

## Setup

The setup is intended for adults, especially:

- parents
- therapists
- educators

The setup is currently organized into sections:

- Audio
- Letter Panel
- Images
- Celebration
- Categories

From setup, it is possible to:

- adjust speech volume
- adjust celebration music volume
- change letter and box size
- enable or disable highlight for the next expected letter
- enable or disable guide images
- choose image position: side or bottom
- enable or disable celebration
- enable or disable celebration skip via click or space bar
- adjust the delay before celebration starts
- enable or disable default categories
- edit the word list for each default category
- add custom categories
- remove custom categories
- assign a local family photo to each family word
- restore the default baseline word library

Category actions use icon CTAs:

- `+` adds a custom category
- trash removes a custom category

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
- Custom categories are also used as semantic context for realtime image searches.
- If a family image is missing, the app uses `assets/famiglia/generico.svg`.
- The interface is intentionally simple and highly visual.
