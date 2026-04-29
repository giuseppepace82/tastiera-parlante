window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const {
    BASE_VOLUME_PERCENT,
    CELEBRATION_DELAY_STEP_MS,
    CELEBRATION_DURATION_STEP_MS,
    CATEGORY_ORDER,
    DEFAULT_LETTER_SIZE_PERCENT,
    DEFAULT_PICTURE_ZOOM_PERCENT,
    DEFAULT_ENABLED,
    DEFAULT_COLOR_THEME,
    DEFAULT_IMAGE_CACHE_ENABLED,
    DEFAULT_LIBRARY,
    COLOR_THEMES,
    LETTER_SIZE_STEP_PERCENT,
    DEFAULT_PICTURE_PANEL_SIZE_PERCENT,
    MIN_PICTURE_PANEL_SIZE_PERCENT,
    MAX_PICTURE_PANEL_SIZE_PERCENT,
    PICTURE_PANEL_SIZE_STEP_PERCENT,
    MAX_CELEBRATION_DELAY_MS,
    MAX_CELEBRATION_DURATION_MS,
    MAX_LETTER_SIZE_PERCENT,
    MAX_PICTURE_ZOOM_PERCENT,
    MAX_VOLUME_PERCENT,
    MIN_LETTER_SIZE_PERCENT,
    MIN_PICTURE_ZOOM_PERCENT,
    MIN_CELEBRATION_DELAY_MS,
    MIN_CELEBRATION_DURATION_MS,
    PICTURE_ZOOM_STEP_PERCENT,
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

  function familyPictureKey(value){
    return slugify(value).replace(/-/g, "");
  }

  function wordImageKey(category, word){
    return `${slugify(category)}:${slugify(word)}`;
  }

  function normalizeFamilyPictures(rawPictures, familyWords){
    const next = {};
    const allowedKeys = new Set(familyWords.map(familyPictureKey).filter(Boolean));
    if(!rawPictures || typeof rawPictures !== "object") return next;

    for(const [rawKey, rawValue] of Object.entries(rawPictures)){
      const key = familyPictureKey(rawKey);
      if(!allowedKeys.has(key)) continue;
      if(typeof rawValue !== "string" || !rawValue.startsWith("data:image/")) continue;
      next[key] = rawValue;
    }

    return next;
  }

  function normalizePreferredWordImages(rawImages, availableEntries){
    const next = {};
    if(!rawImages || typeof rawImages !== "object") return next;

    const allowedKeys = new Set(
      availableEntries
        .filter(entry => entry.category !== "famiglia")
        .map(entry => wordImageKey(entry.category, entry.word))
    );

    for(const [key, value] of Object.entries(rawImages)){
      if(!allowedKeys.has(key)) continue;
      if(!value || typeof value !== "object") continue;
      if(typeof value.src !== "string" || !value.src) continue;

      next[key] = {
        src: value.src,
        source: typeof value.source === "string" ? value.source : "",
        sourceKind: typeof value.sourceKind === "string" ? value.sourceKind : "preferred",
        zoomPercent: normalizePictureZoomPercent(value.zoomPercent)
      };
    }

    return next;
  }

  function normalizeWordCelebrationOverride(rawCelebration){
    if(!rawCelebration || typeof rawCelebration !== "object") return null;

    const enabled = rawCelebration.enabled === true;
    const audioSrc = typeof rawCelebration.audioSrc === "string" && rawCelebration.audioSrc.startsWith("data:audio/")
      ? rawCelebration.audioSrc
      : "";
    const audioLabel = typeof rawCelebration.audioLabel === "string" ? rawCelebration.audioLabel : "";
    const fxStickerSrc = typeof rawCelebration.fxStickerSrc === "string" && rawCelebration.fxStickerSrc.startsWith("data:image/")
      ? rawCelebration.fxStickerSrc
      : "";
    const fxMode = rawCelebration.fxMode === "sticker" ? "sticker" : "default";
    const audioVolume = normalizeStoredVolume(rawCelebration.audioVolume, BASE_VOLUME_PERCENT);
    const durationMs = normalizeCelebrationDuration(rawCelebration.durationMs);

    if(!enabled && !audioSrc && !fxStickerSrc){
      return null;
    }

    return {
      enabled,
      audioSrc,
      audioLabel,
      audioVolume,
      durationMs,
      fxStickerSrc,
      fxMode
    };
  }

  function normalizeWordOverrides(rawOverrides, availableEntries, legacyImages){
    const next = {};
    const allowedKeys = new Set(
      availableEntries
        .filter(entry => entry.category !== "famiglia")
        .map(entry => wordImageKey(entry.category, entry.word))
    );

    const writeImageOverride = (key, value) => {
      if(!allowedKeys.has(key)) return;
      if(!value || typeof value !== "object") return;
      if(typeof value.src !== "string" || !value.src) return;

      const target = next[key] || {};
      target.image = {
        src: value.src,
        source: typeof value.source === "string" ? value.source : "",
        sourceKind: typeof value.sourceKind === "string" ? value.sourceKind : "preferred",
        zoomPercent: normalizePictureZoomPercent(value.zoomPercent)
      };
      next[key] = target;
    };

    for(const [key, value] of Object.entries(legacyImages || {})){
      writeImageOverride(key, value);
    }

    if(rawOverrides && typeof rawOverrides === "object"){
      for(const [key, value] of Object.entries(rawOverrides)){
        if(!allowedKeys.has(key) || !value || typeof value !== "object") continue;
        const target = {};
        if(value.image){
          writeImageOverride(key, value.image);
          if(next[key] && next[key].image){
            target.image = next[key].image;
          }
        }else if(
          typeof value.src === "string" &&
          value.src
        ){
          writeImageOverride(key, value);
          if(next[key] && next[key].image){
            target.image = next[key].image;
          }
        }else if(next[key] && next[key].image){
          target.image = next[key].image;
        }

        const celebration = normalizeWordCelebrationOverride(value.celebration);
        if(celebration){
          target.celebration = celebration;
        }

        if(target.image || target.celebration){
          next[key] = target;
        }
      }
    }

    return next;
  }

  function isVowel(char){
    return "AEIOU".includes(char);
  }

  function colorForChar(char){
    return isVowel(char) ? "#FF00FF" : "#32CD32";
  }

  function normalizeVolumePercent(value, fallback = BASE_VOLUME_PERCENT){
    const parsed = Number(value);
    if(!Number.isFinite(parsed)) return fallback;
    return Math.min(Math.max(parsed, 0), MAX_VOLUME_PERCENT);
  }

  function normalizeStoredVolume(value, fallback = BASE_VOLUME_PERCENT){
    const parsed = Number(value);
    if(!Number.isFinite(parsed)) return fallback;

    if(parsed <= 1){
      return normalizeVolumePercent((parsed * BASE_VOLUME_PERCENT), fallback);
    }

    return normalizeVolumePercent(parsed, fallback);
  }

  function normalizeCelebrationDelay(value){
    const parsed = Number(value);
    if(!Number.isFinite(parsed)) return ns.config.MUSIC_START_DELAY_MS;
    const clamped = Math.min(Math.max(parsed, MIN_CELEBRATION_DELAY_MS), MAX_CELEBRATION_DELAY_MS);
    return Math.round(clamped / CELEBRATION_DELAY_STEP_MS) * CELEBRATION_DELAY_STEP_MS;
  }

  function normalizeCelebrationDuration(value){
    const parsed = Number(value);
    if(!Number.isFinite(parsed)) return ns.config.CELEBRATION_MS;
    const clamped = Math.min(Math.max(parsed, MIN_CELEBRATION_DURATION_MS), MAX_CELEBRATION_DURATION_MS);
    return Math.round(clamped / CELEBRATION_DURATION_STEP_MS) * CELEBRATION_DURATION_STEP_MS;
  }

  function normalizeLetterSizePercent(value){
    const parsed = Number(value);
    if(!Number.isFinite(parsed)) return DEFAULT_LETTER_SIZE_PERCENT;
    const clamped = Math.min(Math.max(parsed, MIN_LETTER_SIZE_PERCENT), MAX_LETTER_SIZE_PERCENT);
    return Math.round(clamped / LETTER_SIZE_STEP_PERCENT) * LETTER_SIZE_STEP_PERCENT;
  }

  function normalizePictureZoomPercent(value){
    const parsed = Number(value);
    if(!Number.isFinite(parsed)) return DEFAULT_PICTURE_ZOOM_PERCENT;
    const clamped = Math.min(Math.max(parsed, MIN_PICTURE_ZOOM_PERCENT), MAX_PICTURE_ZOOM_PERCENT);
    return Math.round(clamped / PICTURE_ZOOM_STEP_PERCENT) * PICTURE_ZOOM_STEP_PERCENT;
  }

  function normalizePicturePanelSizePercent(value){
    const parsed = Number(value);
    if(!Number.isFinite(parsed)) return DEFAULT_PICTURE_PANEL_SIZE_PERCENT;
    const clamped = Math.min(Math.max(parsed, MIN_PICTURE_PANEL_SIZE_PERCENT), MAX_PICTURE_PANEL_SIZE_PERCENT);
    return Math.round(clamped / PICTURE_PANEL_SIZE_STEP_PERCENT) * PICTURE_PANEL_SIZE_STEP_PERCENT;
  }

  function buildWordLayout(word){
    const displayWord = String(word || "").toUpperCase();
    const normalizedDisplayWord = stripAccents(displayWord);
    const slots = [];
    const playableLetters = [];

    for(let index = 0; index < displayWord.length; index += 1){
      const visibleLetter = displayWord[index];
      const normalizedLetter = normalizedDisplayWord[index];

      if(visibleLetter === " "){
        slots.push({ kind: "break" });
        continue;
      }

      const playableIndex = playableLetters.length;
      const letterData = { visibleLetter, base: normalizedLetter, playableIndex };
      playableLetters.push(letterData);
      slots.push({ kind: "letter", ...letterData });
    }

    return {
      displayWord,
      slots,
      playableLetters,
      normalizedWord: playableLetters.map(letter => letter.base).join("")
    };
  }

  function normalizeCustomCategories(rawCategories){
    if(!Array.isArray(rawCategories)) return [];

    const normalized = [];
    const usedIds = new Set(CATEGORY_ORDER);

    for(const rawCategory of rawCategories){
      if(!rawCategory || typeof rawCategory !== "object") continue;

      const label = String(rawCategory.label || rawCategory.name || "").trim();
      if(!label) continue;

      let baseId = slugify(label);
      if(!baseId) baseId = "categoria";

      let id = String(rawCategory.id || baseId).trim();
      id = slugify(id) || baseId;
      if(CATEGORY_ORDER.includes(id)) id = `custom-${id}`;

      let suffix = 2;
      let uniqueId = id;
      while(usedIds.has(uniqueId)){
        uniqueId = `${id}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(uniqueId);

      normalized.push({
        id: uniqueId,
        label,
        enabled: rawCategory.enabled !== false,
        words: sanitizeWords(rawCategory.words)
      });
    }

    return normalized;
  }

  function createDefaultSettings(){
    return {
      showPicture: true,
      enableImageCache: DEFAULT_IMAGE_CACHE_ENABLED,
      enableCelebration: true,
      allowCelebrationSkip: true,
      highlightExpectedLetter: true,
      colorTheme: DEFAULT_COLOR_THEME,
      themeStyle: "soft",
      showThemeDecorations: true,
      letterSizePercent: DEFAULT_LETTER_SIZE_PERCENT,
      picturePanelSizePercent: DEFAULT_PICTURE_PANEL_SIZE_PERCENT,
      speechVolume: BASE_VOLUME_PERCENT,
      celebrationMusicVolume: BASE_VOLUME_PERCENT,
      celebrationStartDelayMs: ns.config.MUSIC_START_DELAY_MS,
      celebrationDurationMs: ns.config.CELEBRATION_MS,
      picturePosition: "side",
      enabledCategories: deepClone(DEFAULT_ENABLED),
      categories: deepClone(DEFAULT_LIBRARY),
      customCategories: [],
      wordOverrides: {},
      familyPictures: {}
    };
  }

  function normalizeSettings(raw){
    const next = createDefaultSettings();
    if(raw && typeof raw === "object"){
      next.showPicture = raw.showPicture !== false;
      next.enableImageCache = raw.enableImageCache === true;
      next.enableCelebration = raw.enableCelebration !== false;
      next.allowCelebrationSkip = raw.allowCelebrationSkip !== false;
      next.highlightExpectedLetter = raw.highlightExpectedLetter !== false;
      if(typeof raw.colorTheme === "string" && COLOR_THEMES[raw.colorTheme]){
        next.colorTheme = raw.colorTheme;
      }
      if(raw.themeStyle === "soft" || raw.themeStyle === "bold"){
        next.themeStyle = raw.themeStyle;
      }
      next.showThemeDecorations = raw.showThemeDecorations !== false;
      next.letterSizePercent = normalizeLetterSizePercent(raw.letterSizePercent);
      next.picturePanelSizePercent = normalizePicturePanelSizePercent(raw.picturePanelSizePercent);
      next.speechVolume = normalizeStoredVolume(raw.speechVolume, BASE_VOLUME_PERCENT);
      next.celebrationMusicVolume = normalizeStoredVolume(raw.celebrationMusicVolume, BASE_VOLUME_PERCENT);
      next.celebrationStartDelayMs = normalizeCelebrationDelay(raw.celebrationStartDelayMs);
      next.celebrationDurationMs = normalizeCelebrationDuration(raw.celebrationDurationMs);
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

      next.customCategories = normalizeCustomCategories(raw.customCategories);
      const availableEntries = [];
      for(const category of CATEGORY_ORDER){
        for(const word of next.categories[category]){
          availableEntries.push({ category, word });
        }
      }
      for(const category of next.customCategories){
        for(const word of category.words){
          availableEntries.push({ category: category.id, word });
        }
      }
      next.wordOverrides = normalizeWordOverrides(raw.wordOverrides, availableEntries, normalizePreferredWordImages(raw.preferredWordImages, availableEntries));
      next.familyPictures = normalizeFamilyPictures(raw.familyPictures, next.categories.famiglia);
    }

    if(
      !CATEGORY_ORDER.some(key => next.enabledCategories[key] && next.categories[key].length) &&
      !next.customCategories.some(category => category.enabled && category.words.length)
    ){
      next.enabledCategories.famiglia = true;
    }

    return next;
  }

  class GameModel {
    constructor(){
      this.settings = this.loadSettings();
      this.currentEntry = null;
      this.wordLayout = buildWordLayout("");
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
      try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        return true;
      }catch{
        return false;
      }
    }

    resetSettings(){
      this.settings = createDefaultSettings();
      return this.saveSettings();
    }

    updateSettings(nextSettings){
      this.settings = normalizeSettings(nextSettings);
      return this.saveSettings();
    }

    buildWordPool(){
      const pool = [];
      for(const category of CATEGORY_ORDER){
        if(!this.settings.enabledCategories[category]) continue;
        for(const word of sanitizeWords(this.settings.categories[category])){
          pool.push({ category, categoryLabel: ns.config.getCategoryLabel(category), word });
        }
      }
      for(const category of this.settings.customCategories){
        if(!category.enabled) continue;
        for(const word of sanitizeWords(category.words)){
          pool.push({ category: category.id, categoryLabel: category.label, word, isCustomCategory: true });
        }
      }
      return pool;
    }

    startNewWord(selection){
      this.currentEntry = selection;
      this.lastWordKey = `${selection.category}:${selection.word}`;
      this.currentIndex = 0;
      this.insertedLetters = [];
      this.wordLayout = buildWordLayout(selection.word);
      this.normalizedWord = this.wordLayout.normalizedWord;
      return selection;
    }

    pickNextWord(){
      const pool = this.buildWordPool();
      const fallbackWord = DEFAULT_LIBRARY.famiglia[0] || DEFAULT_LIBRARY.animali[0] || "Mamma";
      const fallbackPool = pool.length ? pool : [{ category: "famiglia", word: fallbackWord }];
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

      const visibleLetter = this.wordLayout.playableLetters[this.currentIndex].visibleLetter;
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
    familyPictureKey,
    wordImageKey,
    colorForChar,
    buildWordLayout
  };
})(window.GiocoTastiera);
