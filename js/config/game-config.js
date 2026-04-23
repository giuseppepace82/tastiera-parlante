window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const CATEGORY_ORDER = ["famiglia", "animali", "cibo", "divertimento", "colori", "mezzi", "natura"];
  const DEFAULT_LOCALE = "it";

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
        picturePositionTitle: "Posizione immagine",
        picturePositionSide: "Laterale",
        picturePositionBottom: "Sotto le parole",
        familyInlineNote: "Per ogni voce della famiglia puoi scegliere una foto dal dispositivo. Se non imposti una foto, verrà usato l'SVG generico.",
        familyPicturesChoose: "Scegli foto",
        familyPicturesChange: "Cambia foto",
        familyPicturesRemove: "Rimuovi",
        familyPicturesSaved: "Foto locale salvata nel browser",
        familyPicturesFallback: "Nessuna foto: SVG generico",
        familyPicturesEmpty: "Aggiungi prima almeno una voce nella categoria famiglia.",
        settingsNoteHtml: "Nella categoria famiglia puoi personalizzare le voci e associare a ciascuna una foto locale dal dispositivo. Se una foto non è presente, viene usato l'SVG generico in <code>assets/famiglia/generico.svg</code>. Le altre immagini vengono cercate sul web in tempo reale.",
        save: "Salva",
        resetBaseline: "Ripristina base",
        imageSourceArasaac: "Pittogramma • ARASAAC • {term} • ID {id}",
        imageSourceWikipedia: "Web • Wikipedia • {title} • {width}x{height}",
        imageSourceLocalFamily: "Foto locale • Famiglia",
        imageSourceFallbackFamily: "SVG generico • Famiglia"
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

  ns.config = {
    CATEGORY_ORDER,
    DEFAULT_LOCALE,
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
    MUSIC_START_DELAY_MS: 2000,
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
