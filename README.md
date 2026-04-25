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
3. A composition panel appears below the word, with one box for each letter.
4. The full word is spoken as soon as it appears.
5. An optional visual hint can highlight the next expected letter.
6. The child types letters on the keyboard.
7. Correct letters are inserted and pronounced.
8. Incorrect letters are pronounced but not inserted.
9. When the word is completed, the full word is spoken and a short celebration starts after a configurable delay.
10. The completed word remains visible until the next word is loaded.

## Current Features

- Italian speech synthesis for letters and words
- slower word pronunciation for better clarity
- boosted spoken output volume, configurable from setup
- optional guide image shown next to the word or below it
- configurable letter and box size
- optional highlight for the next expected letter
- selectable global color themes with gradient-based UI
- words containing spaces wrap onto a new line at the space boundary
- setup area protected by a simple arithmetic challenge
- editable word categories
- custom categories that can be added and removed from setup
- local family photos configurable from setup
- generic local SVG fallback for family entries
- realtime image search for other categories
- single-modal image picker embedded inside setup
- per-word web image picker for non-family categories
- custom search query input inside the image picker
- automatic search variants for compound queries
- local device upload for a specific non-family word image
- per-word image zoom, stored on the selected image itself
- ARASAAC as primary visual source
- Wikipedia/Wikimedia as fallback
- optional persistent image cache
- settings export to JSON
- settings import from JSON
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
- Configuration
- Categories

From setup, it is possible to:

- adjust speech volume
- adjust celebration music volume
- change letter and box size
- enable or disable highlight for the next expected letter
- choose a global color theme
- enable or disable guide images
- enable or disable the image cache
- choose image position: side or bottom
- open a per-word image picker for non-family categories
- search images with a custom query for a specific word
- keep automatic image choice, select a preferred web image, or upload a local image for a specific word
- adjust zoom for each selected image independently
- enable or disable celebration
- enable or disable celebration skip via click or space bar
- adjust the delay before celebration starts
- export the current configuration as JSON
- import a JSON configuration
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
- The image picker stays inside the setup modal rather than opening a second modal.
- Preferred non-family images can be chosen from setup or uploaded from the device and are then used as the first candidate for that word.
- The image picker accepts a custom search key and also tries automatic variants for multi-word queries.
- If enabled, image search cache is persisted in `localStorage`.
- Imported settings are normalized before being applied.
- Uploaded non-family images are stored inside `preferredWordImages`, so they are included in export/import JSON files.
- Image zoom is configured per selected image, not globally.
- Custom categories are also used as semantic context for realtime image searches.
- If a family image is missing, the app uses `assets/famiglia/generico.svg`.
- Celebration music playback waits for the audio element to be ready before fade-in starts.
- The active composition panel is `#typed`; the old separate `boxes` panel is no longer used.
- The interface is intentionally simple and highly visual.
