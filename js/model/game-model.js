window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const {
    CATEGORY_ORDER,
    DEFAULT_ENABLED,
    DEFAULT_LIBRARY,
    STORAGE_KEY
  } = ns.config;

  function deepClone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function stripAccents(value){
    return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  }

  function slugify(value){
    return stripAccents(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function sanitizeWords(value){
    const list = Array.isArray(value)
      ? value
      : String(value || "").split(/[\n,;]+/);

    const cleaned = list
      .map(word => String(word).trim())
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

    return Array.from(new Set(cleaned));
  }

  function isVowel(char){
    return "AEIOU".includes(char);
  }

  function colorForChar(char){
    return isVowel(char) ? "#FF00FF" : "#32CD32";
  }

  function createDefaultSettings(){
    return {
      showPicture: true,
      picturePosition: "side",
      enabledCategories: deepClone(DEFAULT_ENABLED),
      categories: deepClone(DEFAULT_LIBRARY)
    };
  }

  function normalizeSettings(raw){
    const next = createDefaultSettings();
    if(raw && typeof raw === "object"){
      next.showPicture = raw.showPicture !== false;
      if(raw.picturePosition === "bottom" || raw.picturePosition === "side"){
        next.picturePosition = raw.picturePosition;
      }
      for(const key of CATEGORY_ORDER){
        if(raw.enabledCategories && typeof raw.enabledCategories[key] === "boolean"){
          next.enabledCategories[key] = raw.enabledCategories[key];
        }
        if(raw.categories && raw.categories[key]){
          next.categories[key] = sanitizeWords(raw.categories[key]);
        }
      }
    }

    if(!CATEGORY_ORDER.some(key => next.enabledCategories[key] && next.categories[key].length)){
      next.enabledCategories.famiglia = true;
    }

    return next;
  }

  class GameModel {
    constructor(){
      this.settings = this.loadSettings();
      this.currentEntry = null;
      this.normalizedWord = "";
      this.currentIndex = 0;
      this.insertedLetters = [];
      this.lastWordKey = null;
      this.speechEnabled = false;
      this.setupChallenge = { a: 0, b: 0, answer: 0 };
    }

    loadSettings(){
      try{
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return normalizeSettings(raw);
      }catch{
        return createDefaultSettings();
      }
    }

    saveSettings(){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    }

    resetSettings(){
      this.settings = createDefaultSettings();
      this.saveSettings();
      return this.settings;
    }

    updateSettings(nextSettings){
      this.settings = normalizeSettings(nextSettings);
      this.saveSettings();
      return this.settings;
    }

    buildWordPool(){
      const pool = [];
      for(const category of CATEGORY_ORDER){
        if(!this.settings.enabledCategories[category]) continue;
        for(const word of sanitizeWords(this.settings.categories[category])){
          pool.push({ category, word });
        }
      }
      return pool;
    }

    startNewWord(selection){
      this.currentEntry = selection;
      this.lastWordKey = `${selection.category}:${selection.word}`;
      this.currentIndex = 0;
      this.insertedLetters = [];
      this.normalizedWord = stripAccents(selection.word.toUpperCase());
      return selection;
    }

    pickNextWord(){
      const pool = this.buildWordPool();
      const fallbackPool = pool.length ? pool : [{ category: "famiglia", word: "Mamma" }];
      let selection = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];

      if(fallbackPool.length > 1){
        while(`${selection.category}:${selection.word}` === this.lastWordKey){
          selection = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
        }
      }

      return this.startNewWord(selection);
    }

    recordKey(key){
      if(!this.currentEntry || this.currentIndex >= this.normalizedWord.length){
        return { accepted: false, reason: "inactive" };
      }

      const base = stripAccents(key).toUpperCase();
      const expected = this.normalizedWord[this.currentIndex];
      if(base !== expected){
        return { accepted: false, reason: "wrong", base };
      }

      const visibleLetter = this.currentEntry.word.toUpperCase()[this.currentIndex];
      this.insertedLetters.push(visibleLetter);
      this.currentIndex += 1;

      return {
        accepted: true,
        completed: this.currentIndex >= this.normalizedWord.length,
        base,
        visibleLetter,
        insertedLetters: [...this.insertedLetters],
        currentIndex: this.currentIndex
      };
    }

    clearInsertedLetters(){
      this.insertedLetters = [];
    }

    prepareChallenge(){
      const a = 2 + Math.floor(Math.random() * 7);
      const b = 1 + Math.floor(Math.random() * 7);
      this.setupChallenge = { a, b, answer: a + b };
      return this.setupChallenge;
    }

    verifyChallenge(value){
      return Number.parseInt(value, 10) === this.setupChallenge.answer;
    }
  }

  ns.model = {
    GameModel,
    createDefaultSettings,
    sanitizeWords,
    stripAccents,
    slugify,
    colorForChar
  };
})(window.GiocoTastiera);
