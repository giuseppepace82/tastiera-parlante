window.GiocoTastiera = window.GiocoTastiera || {};

window.GiocoTastiera.config = {
  CATEGORY_ORDER: ["famiglia", "animali", "cibo", "divertimento", "colori", "mezzi", "natura"],

  CATEGORY_LABELS: {
    famiglia: "Famiglia",
    animali: "Animali",
    cibo: "Cibo",
    divertimento: "Divertimento",
    colori: "Colori",
    mezzi: "Mezzi",
    natura: "Natura"
  },

  DEFAULT_LIBRARY: {
    famiglia: ["Leo", "Elisa", "Mamma", "Lory", "Papà"],
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

  FAMILY_IMAGE_MAP: {
    leo: "assets/famiglia/leo.svg",
    elisa: "assets/famiglia/elisa.svg",
    mamma: "assets/famiglia/mamma.svg",
    lory: "assets/famiglia/lory.svg",
    papa: "assets/famiglia/papa.svg"
  },

  STORAGE_KEY: "gioco-tastiera-settings-v2",
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
