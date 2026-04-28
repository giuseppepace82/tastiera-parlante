window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const CATEGORY_ORDER = ["famiglia", "animali", "cibo", "divertimento", "colori", "mezzi", "natura"];
  const DEFAULT_LOCALE = "it";
  const DEFAULT_COLOR_THEME = "sun";
  const DEFAULT_IMAGE_CACHE_ENABLED = false;
  const DEFAULT_IMAGE_PICKER_SOURCES = ["arasaac", "wikipedia", "wikimedia"];

  const I18N = {
    it: {
      categories: {
        famiglia: "Famiglia",
        animali: "Animali",
        cibo: "Cibo",
        divertimento: "Divertimento",
        colori: "Colori",
        mezzi: "Mezzi",
        natura: "Natura"
      },
      ui: {
        title: "Tastiera parlante",
        subtitle: "Lettere, suoni e parole da completare",
        audioStartAriaLabel: "Avvia audio",
        setupButtonAriaLabel: "Apri setup",
        wordAriaLabel: "Parola da leggere",
        boxesAriaLabel: "Caselle della parola",
        pictureGuide: "Immagine guida",
        pictureCategoryTitle: "Immagine • {category}",
        pictureSourceRealtime: "Web in tempo reale",
        pictureSearching: "Ricerca in corso",
        pictureDisabled: "Immagine disattivata",
        pictureNotFound: "Immagine non trovata",
        pictureUnavailable: "Immagine non disponibile",
        noImageAvailable: "Nessuna immagine disponibile",
        noFallbackAvailable: "Nessun fallback disponibile",
        connectionError: "Errore di connessione",
        pictureAlt: "Immagine guida per {word}",
        lockTitle: "Setup",
        lockIntro: "Per entrare risolvi la somma.",
        challengeLabel: "Quanto fa {a} + {b}?",
        challengePlaceholder: "Scrivi il risultato",
        enter: "Entra",
        close: "Chiudi",
        invalidCode: "Codice non corretto",
        settingsTitle: "Setup parole",
        settingsIntro: "Attiva le categorie che vuoi usare e modifica le parole. Le parole possono essere separate da virgole o righe nuove.",
        showPicture: "Mostra immagine guida",
        enableImageCache: "Attiva cache immagini",
        enableCelebration: "Attiva cerimonia finale",
        allowCelebrationSkip: "Interrompi la cerimonia con click o barra spaziatrice",
        highlightExpectedLetter: "Evidenzia la prossima lettera da digitare",
        audioTitle: "Audio",
        letterPanelTitle: "Pannello lettere",
        imagesTitle: "Immagini",
        celebrationTitle: "Cerimonia",
        speechVolume: "Volume parlato",
        celebrationMusicVolume: "Volume musica cerimonia",
        celebrationDelay: "Attesa prima della cerimonia",
        letterSize: "Dimensione lettere",
        colorThemeTitle: "Tema colori",
        colorThemeSun: "Sole",
        colorThemeOcean: "Mare",
        colorThemeMeadow: "Prato",
        pictureZoom: "Zoom immagine",
        picturePositionTitle: "Posizione immagine",
        picturePositionSide: "Laterale",
        picturePositionBottom: "Sotto le parole",
        configurationTitle: "Configurazioni",
        exportSettings: "Esporta configurazione",
        importSettings: "Importa configurazione",
        importSettingsHint: "Importa o esporta le impostazioni del gioco in formato JSON.",
        settingsTransferSuccessExport: "Configurazione esportata",
        settingsTransferSuccessImport: "Configurazione importata",
        settingsTransferErrorImport: "File configurazione non valido",
        categoriesTitle: "Categorie",
        addCategoryPlaceholder: "Nome nuova categoria",
        addCategory: "Aggiungi categoria",
        removeCategory: "Rimuovi categoria",
        customCategoryName: "Nome categoria",
        customCategoryWords: "Parole della categoria",
        wordImagesTitle: "Immagini per parola",
        selectWordImage: "Scegli immagine",
        changeWordImage: "Cambia immagine",
        clearWordImage: "Ripristina automatico",
        wordImageAutomatic: "Selezione automatica",
        wordImageSelected: "Immagine scelta dal setup",
        imagePickerTitle: "Seleziona immagine",
        imagePickerIntro: "Scegli l'immagine da usare per questa parola.",
        imagePickerSearchLabel: "Chiave di ricerca",
        imagePickerSearchPlaceholder: "Parola da cercare",
        imagePickerSearch: "Cerca immagini",
        imagePickerUpload: "Carica dal dispositivo",
        imagePickerSourcesLabel: "Sorgenti immagini",
        imagePickerSourceArasaac: "ARASAAC",
        imagePickerSourceWikipedia: "Wikipedia",
        imagePickerSourceWikimedia: "Wikimedia Commons",
        imagePickerNoSourceSelected: "Seleziona almeno una sorgente immagini",
        imagePickerUploadError: "Immagine locale non valida",
        imagePickerLoading: "Caricamento immagini in corso",
        imagePickerEmpty: "Nessuna immagine disponibile per questa parola",
        imagePickerUseAutomatic: "Usa selezione automatica",
        imagePickerPrevious: "Immagini precedenti",
        imagePickerNext: "Altre immagini",
        imagePickerBack: "Torna al setup",
        familyInlineNote: "Per ogni voce della famiglia puoi scegliere una foto dal dispositivo. Se non imposti una foto, verrà usato l'SVG generico.",
        familyPicturesChoose: "Scegli foto",
        familyPicturesChange: "Cambia foto",
        familyPicturesRemove: "Rimuovi",
        familyPicturesSaved: "Foto locale salvata nel browser",
        familyPicturesFallback: "Nessuna foto: SVG generico",
        familyPicturesEmpty: "Aggiungi prima almeno una voce nella categoria famiglia.",
        settingsNoteHtml: "Nella categoria famiglia puoi personalizzare le voci e associare a ciascuna una foto locale dal dispositivo. Se una foto non è presente, viene usato l'SVG generico in <code>assets/famiglia/generico.svg</code>. Le altre immagini vengono cercate sul web in tempo reale. Puoi anche aggiungere categorie personalizzate dal setup.",
        save: "Salva",
        resetBaseline: "Ripristina base",
        imageSourceArasaac: "Pittogramma • ARASAAC • {term} • ID {id}",
        imageSourceWikipedia: "Web • Wikipedia • {title} • {width}x{height}",
        imageSourceWikimedia: "Web • Wikimedia Commons • {title}",
        imageSourceUploadedWord: "Immagine locale • Setup",
        imageSourceLocalFamily: "Foto locale • Famiglia",
        imageSourceFallbackFamily: "SVG generico • Famiglia",
        imageSourcePreferred: "Scelta nel setup • {source}"
      }
    }
  };

  let currentLocale = DEFAULT_LOCALE;

  function resolveKey(source, key){
    return key.split(".").reduce((value, segment) => {
      if(value && typeof value === "object" && segment in value){
        return value[segment];
      }
      return undefined;
    }, source);
  }

  function interpolate(template, params){
    return String(template).replace(/\{(\w+)\}/g, (match, token) => {
      if(Object.prototype.hasOwnProperty.call(params, token)){
        return String(params[token]);
      }
      return match;
    });
  }

  function t(key, params = {}){
    const locales = [currentLocale, DEFAULT_LOCALE];
    for(const locale of locales){
      const bundle = I18N[locale];
      const resolved = resolveKey(bundle, key);
      if(typeof resolved === "string"){
        return interpolate(resolved, params);
      }
    }
    return key;
  }

  function setLocale(locale){
    if(I18N[locale]){
      currentLocale = locale;
    }
    return currentLocale;
  }

  function getCategoryLabel(category){
    return t(`categories.${category}`);
  }

  const COLOR_THEMES = {
    sun: {
      bodyGlowTop: "rgba(255,255,255,0.9)",
      bodyGlowBottom: "rgba(255,212,71,0.55)",
      bodyGradientStart: "#fff8dc",
      bodyGradientEnd: "#fff2bd",
      subtitleInk: "#7b6642",
      pillBg: "rgba(255,255,255,0.8)",
      pillBorder: "rgba(122,102,66,0.18)",
      setupButtonStart: "#fffef9",
      setupButtonEnd: "#ffe8a1",
      panelBg: "rgba(255,253,247,0.88)",
      panelBorder: "rgba(255,212,71,0.42)",
      frameBorder: "rgba(255,140,66,0.35)",
      frameStart: "#fffef7",
      frameEnd: "#fff7d8",
      placeholderInk: "#7b6642",
      spinnerTrack: "rgba(255,212,71,0.28)",
      spinnerHead: "#ff8c42",
      supportInk: "#8f6c2f",
      mutedInk: "#7f6640",
      titleInk: "#5d4720",
      expectedRing: "rgba(255,212,71,0.95)",
      expectedShadow: "rgba(255,140,66,0.28)",
      typedBg: "#fff",
      typedInner: "rgba(122,102,66,0.06)",
      typedActiveBorder: "#ffd447",
      typedExpectedRing: "rgba(255,212,71,0.26)",
      typedWrapStart: "rgba(255,255,255,0.86)",
      typedWrapEnd: "rgba(255,248,220,0.92)",
      typedWrapBorder: "rgba(255,212,71,0.6)",
      overlayBg: "rgba(47,42,31,0.36)",
      modalBg: "#fffdf7",
      modalShadow: "0 24px 70px rgba(32,23,9,0.28)",
      sectionBorder: "rgba(255,212,71,0.42)",
      sectionStart: "rgba(255,255,255,0.82)",
      sectionEnd: "rgba(255,247,216,0.92)",
      primaryStart: "#ffd447",
      primaryEnd: "#ffb347",
      primaryInk: "#4a3510",
      secondaryBg: "#fff5d2",
      secondaryInk: "#765725",
      surfaceBorder: "rgba(240,213,139,0.95)",
      surfaceBg: "#fffdf6",
      inputBg: "#fff",
      dangerInk: "#a1413d"
    },
    ocean: {
      bodyGlowTop: "rgba(255,255,255,0.92)",
      bodyGlowBottom: "rgba(79,184,255,0.4)",
      bodyGradientStart: "#f2fbff",
      bodyGradientEnd: "#d7f1ff",
      subtitleInk: "#4a6d82",
      pillBg: "rgba(255,255,255,0.84)",
      pillBorder: "rgba(76,132,164,0.2)",
      setupButtonStart: "#fbfeff",
      setupButtonEnd: "#b9e9ff",
      panelBg: "rgba(245,252,255,0.9)",
      panelBorder: "rgba(115,193,224,0.46)",
      frameBorder: "rgba(46,150,199,0.35)",
      frameStart: "#fafdff",
      frameEnd: "#d9f2ff",
      placeholderInk: "#4a6d82",
      spinnerTrack: "rgba(115,193,224,0.26)",
      spinnerHead: "#2e96c7",
      supportInk: "#2f7da6",
      mutedInk: "#547086",
      titleInk: "#24556f",
      expectedRing: "rgba(105,206,242,0.95)",
      expectedShadow: "rgba(46,150,199,0.28)",
      typedBg: "#ffffff",
      typedInner: "rgba(66,124,156,0.08)",
      typedActiveBorder: "#5fd0ff",
      typedExpectedRing: "rgba(105,206,242,0.28)",
      typedWrapStart: "rgba(255,255,255,0.9)",
      typedWrapEnd: "rgba(227,247,255,0.95)",
      typedWrapBorder: "rgba(115,193,224,0.58)",
      overlayBg: "rgba(26,55,74,0.34)",
      modalBg: "#fafdff",
      modalShadow: "0 24px 70px rgba(28,66,91,0.24)",
      sectionBorder: "rgba(115,193,224,0.42)",
      sectionStart: "rgba(255,255,255,0.84)",
      sectionEnd: "rgba(227,247,255,0.94)",
      primaryStart: "#89dbff",
      primaryEnd: "#4fb8ff",
      primaryInk: "#17384d",
      secondaryBg: "#e2f6ff",
      secondaryInk: "#285c78",
      surfaceBorder: "rgba(157,215,237,0.95)",
      surfaceBg: "#f6fcff",
      inputBg: "#ffffff",
      dangerInk: "#b24d5f"
    },
    meadow: {
      bodyGlowTop: "rgba(255,255,255,0.9)",
      bodyGlowBottom: "rgba(129,213,91,0.38)",
      bodyGradientStart: "#fbfff0",
      bodyGradientEnd: "#e0f6cc",
      subtitleInk: "#5e7141",
      pillBg: "rgba(255,255,255,0.82)",
      pillBorder: "rgba(111,144,80,0.18)",
      setupButtonStart: "#fdfff7",
      setupButtonEnd: "#c9ef9e",
      panelBg: "rgba(251,255,245,0.9)",
      panelBorder: "rgba(170,218,98,0.46)",
      frameBorder: "rgba(118,186,72,0.35)",
      frameStart: "#fdfff9",
      frameEnd: "#eaf9d8",
      placeholderInk: "#5e7141",
      spinnerTrack: "rgba(170,218,98,0.26)",
      spinnerHead: "#76ba48",
      supportInk: "#6b8a2b",
      mutedInk: "#6c7752",
      titleInk: "#476127",
      expectedRing: "rgba(190,230,92,0.96)",
      expectedShadow: "rgba(118,186,72,0.28)",
      typedBg: "#ffffff",
      typedInner: "rgba(114,145,71,0.08)",
      typedActiveBorder: "#c5ea62",
      typedExpectedRing: "rgba(190,230,92,0.28)",
      typedWrapStart: "rgba(255,255,255,0.88)",
      typedWrapEnd: "rgba(243,252,224,0.94)",
      typedWrapBorder: "rgba(170,218,98,0.56)",
      overlayBg: "rgba(46,70,32,0.3)",
      modalBg: "#fdfff9",
      modalShadow: "0 24px 70px rgba(54,82,27,0.22)",
      sectionBorder: "rgba(170,218,98,0.42)",
      sectionStart: "rgba(255,255,255,0.84)",
      sectionEnd: "rgba(240,251,219,0.94)",
      primaryStart: "#d3f06d",
      primaryEnd: "#86d06e",
      primaryInk: "#284118",
      secondaryBg: "#eff9db",
      secondaryInk: "#557128",
      surfaceBorder: "rgba(198,226,141,0.95)",
      surfaceBg: "#fbfff5",
      inputBg: "#ffffff",
      dangerInk: "#b95b4a"
    }
  };

  ns.config = {
    CATEGORY_ORDER,
    DEFAULT_LOCALE,
    DEFAULT_COLOR_THEME,
    DEFAULT_IMAGE_CACHE_ENABLED,
    DEFAULT_IMAGE_PICKER_SOURCES,
    COLOR_THEMES,
    I18N,
    getLocale: () => currentLocale,
    setLocale,
    t,
    getCategoryLabel,

    DEFAULT_LIBRARY: {
      famiglia: ["Mamma", "Papà", "Nonna", "Nonno", "Zia"],
      animali: ["Gatto", "Cane", "Pesce", "Orso", "Lupo"],
      cibo: ["Mela", "Pane", "Pera", "Pizza", "Riso"],
      divertimento: ["Palla", "Bici", "Lego", "Libro", "Gioco"],
      colori: ["Rosso", "Blu", "Verde", "Giallo", "Rosa"],
      mezzi: ["Auto", "Bus", "Treno", "Aereo", "Barca"],
      natura: ["Sole", "Luna", "Fiore", "Mare", "Nuvola"]
    },

    DEFAULT_ENABLED: {
      famiglia: true,
      animali: true,
      cibo: true,
      divertimento: true,
      colori: false,
      mezzi: false,
      natura: false
    },

    IMAGE_QUERY_MAP: {
      animali: { gatto: "gatto", cane: "cane", pesce: "pesce", orso: "orso", lupo: "lupo" },
      cibo: { mela: "mela", pane: "pane", pera: "pera", pizza: "pizza", riso: "riso alimento" },
      divertimento: { palla: "pallone", bici: "bicicletta", lego: "mattoncini lego", libro: "libro", gioco: "giocattolo" },
      colori: { rosso: "rosso", blu: "blu", verde: "verde", giallo: "giallo", rosa: "rosa" },
      mezzi: { auto: "automobile", bus: "autobus", treno: "treno", aereo: "aeroplano", barca: "barca" },
      natura: { sole: "sole", luna: "luna", fiore: "fiore", mare: "mare", nuvola: "nuvola" }
    },

    FAMILY_FALLBACK_IMAGE: "assets/famiglia/generico.svg",

    STORAGE_KEY: "tastiera-parlante-settings-v3",
    IMAGE_CACHE_STORAGE_KEY: "tastiera-parlante-image-cache-v1",
    MAX_PERSISTED_IMAGE_CACHE_ENTRIES: 48,
    BASE_VOLUME_PERCENT: 70,
    MAX_VOLUME_PERCENT: 100,
    DEFAULT_LETTER_SIZE_PERCENT: 100,
    MIN_LETTER_SIZE_PERCENT: 75,
    MAX_LETTER_SIZE_PERCENT: 140,
    LETTER_SIZE_STEP_PERCENT: 5,
    DEFAULT_PICTURE_ZOOM_PERCENT: 100,
    MIN_PICTURE_ZOOM_PERCENT: 0,
    MAX_PICTURE_ZOOM_PERCENT: 150,
    PICTURE_ZOOM_STEP_PERCENT: 5,
    SPEECH_VOLUME_BOOST: 1.35,
    MUSIC_START_DELAY_MS: 2000,
    MIN_CELEBRATION_DELAY_MS: 0,
    MAX_CELEBRATION_DELAY_MS: 5000,
    CELEBRATION_DELAY_STEP_MS: 250,
    CELEBRATION_MS: 6000,
    FADE_IN_MS: 800,
    FADE_OUT_MS: 1000,
    MAX_REMOTE_IMAGE_CANDIDATES: 6,
    ARASAAC_IMAGE_SIZE: 500,

    LETTER_NAMES_IT: {
      A: "a",
      B: "bi",
      C: "ci",
      D: "di",
      E: "e",
      F: "effe",
      G: "gi",
      H: "acca",
      I: "i",
      J: "i lunga",
      K: "cappa",
      L: "elle",
      M: "emme",
      N: "enne",
      O: "o",
      P: "pi",
      Q: "cu",
      R: "erre",
      S: "esse",
      T: "ti",
      U: "u",
      V: "vi",
      W: "doppia vi",
      X: "ics",
      Y: "ipsilon",
      Z: "zeta",
      "À": "a",
      "È": "e",
      "É": "e",
      "Ì": "i",
      "Ò": "o",
      "Ù": "u"
    }
  };
})(window.GiocoTastiera);
