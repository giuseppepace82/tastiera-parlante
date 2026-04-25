window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const {
    CATEGORY_ORDER,
    CELEBRATION_MS,
    CELEBRATION_DELAY_STEP_MS,
    CELEBRATION_DURATION_STEP_MS,
    COLOR_THEMES,
    DEFAULT_COLOR_THEME,
    DEFAULT_IMAGE_PICKER_SOURCES,
    DEFAULT_LETTER_SIZE_PERCENT,
    DEFAULT_PICTURE_PANEL_SIZE_PERCENT,
    DEFAULT_PICTURE_ZOOM_PERCENT,
    GAMEPLAY_KEYBOARD_CONSONANTS,
    GAMEPLAY_KEYBOARD_VOWELS,
    LETTER_SIZE_STEP_PERCENT,
    MAX_CELEBRATION_DELAY_MS,
    MAX_CELEBRATION_DURATION_MS,
    MAX_LETTER_SIZE_PERCENT,
    MAX_PICTURE_PANEL_SIZE_PERCENT,
    MAX_PICTURE_ZOOM_PERCENT,
    MAX_VOLUME_PERCENT,
    MIN_LETTER_SIZE_PERCENT,
    MIN_PICTURE_PANEL_SIZE_PERCENT,
    MIN_PICTURE_ZOOM_PERCENT,
    MIN_CELEBRATION_DELAY_MS,
    MIN_CELEBRATION_DURATION_MS,
    PICTURE_PANEL_SIZE_STEP_PERCENT,
    PICTURE_ZOOM_STEP_PERCENT,
    getCategoryLabel,
    getLocale,
    t
  } = ns.config;
  const { colorForChar, familyPictureKey, sanitizeWords: sanitizeWordList, stripAccents, wordImageKey } = ns.model;

  class GameView {
    constructor(){
      this.wordDiv = document.getElementById("word");
      this.typedDiv = document.getElementById("typed");
      this.audio = document.getElementById("music");
      this.audioStartOverlay = document.getElementById("audioStartOverlay");
      this.audioStartButton = document.getElementById("audioStartButton");
      this.layout = document.querySelector(".layout");
      this.pictureCard = document.getElementById("pictureCard");
      this.pictureTitle = document.getElementById("pictureTitle");
      this.pictureSource = document.getElementById("pictureSource");
      this.pictureSpinner = document.getElementById("pictureSpinner");
      this.pictureFrame = document.getElementById("pictureFrame");
      this.pictureInfoButton = document.getElementById("pictureInfoButton");
      this.pictureInfoTooltip = document.getElementById("pictureInfoTooltip");
      this.picturePlaceholder = document.getElementById("picturePlaceholder");
      this.pictureImage = document.getElementById("pictureImage");
      this.gameplayKeyboard = document.getElementById("gameplayKeyboard");
      this.vowelKeyboardGrid = document.getElementById("vowelKeyboardGrid");
      this.consonantKeyboardGrid = document.getElementById("consonantKeyboardGrid");
      this.celebrationSkipButton = document.getElementById("celebrationSkipButton");
      this.setupButton = document.getElementById("setupButton");
      this.lockOverlay = document.getElementById("lockOverlay");
      this.settingsOverlay = document.getElementById("settingsOverlay");
      this.settingsModal = this.settingsOverlay ? this.settingsOverlay.querySelector(".modal") : null;
      this.settingsMainView = document.getElementById("settingsMainView");
      this.imagePickerView = document.getElementById("imagePickerView");
      this.imagePickerTitle = document.getElementById("imagePickerTitle");
      this.imagePickerIntro = document.getElementById("imagePickerIntro");
      this.imagePickerSearchInput = document.getElementById("imagePickerSearchInput");
      this.imagePickerSearchButton = document.getElementById("imagePickerSearchButton");
      this.imagePickerUploadButton = document.getElementById("imagePickerUploadButton");
      this.imagePickerUploadInput = document.getElementById("imagePickerUploadInput");
      this.imagePickerSourceInputs = Array.from(document.querySelectorAll("[data-image-picker-source]"));
      this.imagePickerStatus = document.getElementById("imagePickerStatus");
      this.imagePickerGrid = document.getElementById("imagePickerGrid");
      this.imagePickerAutomatic = document.getElementById("imagePickerAutomatic");
      this.imagePickerPrevious = document.getElementById("imagePickerPrevious");
      this.imagePickerNext = document.getElementById("imagePickerNext");
      this.closeImagePicker = document.getElementById("closeImagePicker");
      this.challengeLabel = document.getElementById("challengeLabel");
      this.challengeInput = document.getElementById("challengeInput");
      this.challengeHint = document.getElementById("challengeHint");
      this.lockForm = document.getElementById("lockForm");
      this.closeLock = document.getElementById("closeLock");
      this.settingsGrid = document.getElementById("settingsGrid");
      this.showPictureToggle = document.getElementById("showPictureToggle");
      this.enableImageCacheToggle = document.getElementById("enableImageCacheToggle");
      this.enableCelebrationToggle = document.getElementById("enableCelebrationToggle");
      this.allowCelebrationSkipToggle = document.getElementById("allowCelebrationSkipToggle");
      this.highlightExpectedLetterToggle = document.getElementById("highlightExpectedLetterToggle");
      this.showThemeDecorationsToggle = document.getElementById("showThemeDecorationsToggle");
      this.colorThemeInputs = Array.from(document.querySelectorAll('input[name="colorTheme"]'));
      this.themeStyleInputs = Array.from(document.querySelectorAll('input[name="themeStyle"]'));
      this.letterSizeRange = document.getElementById("letterSizeRange");
      this.letterSizeValue = document.getElementById("letterSizeValue");
      this.picturePanelSizeRange = document.getElementById("picturePanelSizeRange");
      this.picturePanelSizeValue = document.getElementById("picturePanelSizeValue");
      this.speechVolumeRange = document.getElementById("speechVolumeRange");
      this.speechVolumeValue = document.getElementById("speechVolumeValue");
      this.celebrationMusicVolumeRange = document.getElementById("celebrationMusicVolumeRange");
      this.celebrationMusicVolumeValue = document.getElementById("celebrationMusicVolumeValue");
      this.celebrationDelayRange = document.getElementById("celebrationDelayRange");
      this.celebrationDelayValue = document.getElementById("celebrationDelayValue");
      this.celebrationDurationRange = document.getElementById("celebrationDurationRange");
      this.celebrationDurationValue = document.getElementById("celebrationDurationValue");
      this.picturePositionSide = document.getElementById("picturePositionSide");
      this.picturePositionBottom = document.getElementById("picturePositionBottom");
      this.customCategoryNameInput = document.getElementById("customCategoryNameInput");
      this.addCategoryButton = document.getElementById("addCategoryButton");
      this.installAppButton = document.getElementById("installAppButton");
      this.installHint = document.getElementById("installHint");
      this.exportSettingsButton = document.getElementById("exportSettingsButton");
      this.importSettingsButton = document.getElementById("importSettingsButton");
      this.importSettingsInput = document.getElementById("importSettingsInput");
      this.settingsTransferStatus = document.getElementById("settingsTransferStatus");
      this.saveSettings = document.getElementById("saveSettings");
      this.resetSettings = document.getElementById("resetSettings");
      this.closeSettings = document.getElementById("closeSettings");
      this.touchStartOverlay = document.getElementById("touchStartOverlay");
      this.touchStartButton = document.getElementById("touchStartButton");
      this.fxCanvas = document.getElementById("fx");
      this.fxCtx = this.fxCanvas.getContext("2d");
      this.fxState = null;
      this.familyPictureDrafts = {};
      this.wordOverridesDraft = {};
      this.selectedWordConfigByCategory = {};
      this.customCategoryDrafts = [];
      this.familyWordsInput = null;
      this.familyPicturesEditor = null;
      this.imageService = null;
      this.currentImagePickerEntry = null;
      this.currentImagePickerSearchQuery = "";
      this.currentImagePickerSources = [...DEFAULT_IMAGE_PICKER_SOURCES];
      this.imagePickerRequestId = 0;
      this.currentImagePickerPage = 0;
      this.imagePickerReturnScrollTop = 0;
      this.deviceMode = { isTouchPrimary: false, isTabletLayout: false, isPortrait: false };
      this.boundKeyboardHandler = null;
      this.keyboardButtons = new Map();

      this.buildSettingsEditor();
      this.buildGameplayKeyboard();
      this.applyI18n();
      this.bindSettingsInputs();
      this.resizeCanvas();
    }

    bindSettingsInputs(){
      if(this.letterSizeRange){
        this.letterSizeRange.addEventListener("input", () => {
          this.updatePercentLabel(this.letterSizeRange, this.letterSizeValue);
        });
      }

      if(this.picturePanelSizeRange){
        this.picturePanelSizeRange.addEventListener("input", () => {
          this.updatePercentLabel(this.picturePanelSizeRange, this.picturePanelSizeValue);
        });
      }

      if(this.speechVolumeRange){
        this.speechVolumeRange.addEventListener("input", () => {
          this.updateVolumeLabel(this.speechVolumeRange, this.speechVolumeValue);
        });
      }

      if(this.celebrationMusicVolumeRange){
        this.celebrationMusicVolumeRange.addEventListener("input", () => {
          this.updateVolumeLabel(this.celebrationMusicVolumeRange, this.celebrationMusicVolumeValue);
        });
      }

      if(this.celebrationDelayRange){
        this.celebrationDelayRange.addEventListener("input", () => {
          this.updateDelayLabel(this.celebrationDelayRange, this.celebrationDelayValue);
        });
      }

      if(this.celebrationDurationRange){
        this.celebrationDurationRange.addEventListener("input", () => {
          this.updateDelayLabel(this.celebrationDurationRange, this.celebrationDurationValue);
        });
      }

      if(this.addCategoryButton){
        this.addCategoryButton.addEventListener("click", () => {
          this.addCustomCategory();
        });
      }

      if(this.customCategoryNameInput){
        this.customCategoryNameInput.addEventListener("keydown", event => {
          if(event.key !== "Enter") return;
          event.preventDefault();
          this.addCustomCategory();
        });
      }

      if(this.imagePickerAutomatic){
        this.imagePickerAutomatic.addEventListener("click", () => this.clearCurrentWordImageSelection());
      }

      if(this.imagePickerPrevious){
        this.imagePickerPrevious.addEventListener("click", () => this.changeImagePickerPage(-1));
      }

      if(this.imagePickerNext){
        this.imagePickerNext.addEventListener("click", () => this.changeImagePickerPage(1));
      }

      if(this.imagePickerSearchButton){
        this.imagePickerSearchButton.addEventListener("click", () => this.searchImagePicker());
      }

      if(this.imagePickerUploadButton){
        this.imagePickerUploadButton.addEventListener("click", () => {
          if(this.imagePickerUploadInput){
            this.imagePickerUploadInput.click();
          }
        });
      }

      if(this.imagePickerUploadInput){
        this.imagePickerUploadInput.addEventListener("change", async event => {
          const input = event.target;
          const file = input && input.files ? input.files[0] : null;
          await this.applyImagePickerUpload(file);
          input.value = "";
        });
      }

      if(this.imagePickerSearchInput){
        this.imagePickerSearchInput.addEventListener("keydown", event => {
          if(event.key !== "Enter") return;
          event.preventDefault();
          this.searchImagePicker();
        });
      }

      for(const input of this.imagePickerSourceInputs){
        input.addEventListener("change", () => this.searchImagePicker());
      }

      if(this.closeImagePicker){
        this.closeImagePicker.addEventListener("click", () => this.closeWordImagePicker());
      }
    }

    buildGameplayKeyboard(){
      if(this.vowelKeyboardGrid){
        this.renderKeyboardGroup(this.vowelKeyboardGrid, GAMEPLAY_KEYBOARD_VOWELS, "vowel");
      }
      if(this.consonantKeyboardGrid){
        this.renderKeyboardGroup(this.consonantKeyboardGrid, GAMEPLAY_KEYBOARD_CONSONANTS, "consonant");
      }
    }

    renderKeyboardGroup(container, letters, variant){
      container.innerHTML = "";
      for(const letter of letters){
        const button = document.createElement("button");
        button.type = "button";
        button.className = `key-button ${variant}`;
        button.dataset.letter = letter;
        button.textContent = letter;
        container.appendChild(button);
        this.keyboardButtons.set(letter, button);
      }
    }

    bindGameplayKeyboard(handler){
      this.boundKeyboardHandler = handler;
      for(const button of this.keyboardButtons.values()){
        button.addEventListener("click", () => {
          if(typeof this.boundKeyboardHandler === "function"){
            this.boundKeyboardHandler(button.dataset.letter || "");
          }
        });
      }
    }

    setDeviceMode(deviceMode = {}){
      this.deviceMode = {
        isTouchPrimary: deviceMode.isTouchPrimary === true,
        isTabletLayout: deviceMode.isTabletLayout === true,
        isPortrait: deviceMode.isPortrait === true
      };

      document.body.classList.toggle("touch-primary", this.deviceMode.isTouchPrimary);
      document.body.classList.toggle("tablet-layout", this.deviceMode.isTabletLayout);
      document.body.classList.toggle("portrait-layout", this.deviceMode.isPortrait);
      this.applyResponsiveGameLayout(this.deviceMode);
    }

    applyResponsiveGameLayout(deviceMode = this.deviceMode){
      const useKeyboard = Boolean(deviceMode && deviceMode.isTouchPrimary);
      if(this.gameplayKeyboard){
        this.gameplayKeyboard.hidden = !useKeyboard;
        this.gameplayKeyboard.classList.toggle("visible", useKeyboard);
      }
      if(this.celebrationSkipButton){
        this.celebrationSkipButton.classList.toggle("visible", false);
      }
      this.updateOverlayViewportHeight();
    }

    setGameplayKeyboardEnabled(enabled){
      for(const button of this.keyboardButtons.values()){
        button.disabled = enabled === false;
      }
    }

    setCelebrationSkipVisible(visible){
      if(!this.celebrationSkipButton) return;
      this.celebrationSkipButton.classList.toggle("visible", visible === true);
    }

    bindCelebrationSkip(handler){
      if(!this.celebrationSkipButton) return;
      this.celebrationSkipButton.addEventListener("click", () => {
        if(typeof handler === "function"){
          handler();
        }
      });
    }

    setKeyboardExpectedLetter(letter, enabled = true){
      for(const button of this.keyboardButtons.values()){
        button.classList.remove("expected");
      }
      if(!enabled || !letter) return;
      const nextButton = this.keyboardButtons.get(stripAccents(letter).toUpperCase());
      if(nextButton){
        nextButton.classList.add("expected");
      }
    }

    flashKeyboardKey(letter, state){
      const target = this.keyboardButtons.get(stripAccents(letter).toUpperCase());
      if(!target) return;

      const className = state === "wrong" ? "wrong" : "pressed";
      target.classList.remove(className);
      void target.offsetWidth;
      target.classList.add(className);
      window.setTimeout(() => target.classList.remove(className), state === "wrong" ? 320 : 160);
    }

    showTouchStartGate(){
      if(!this.touchStartOverlay) return;
      this.touchStartOverlay.classList.add("open");
      this.touchStartOverlay.setAttribute("aria-hidden", "false");
    }

    hideTouchStartGate(){
      if(!this.touchStartOverlay) return;
      this.touchStartOverlay.classList.remove("open");
      this.touchStartOverlay.setAttribute("aria-hidden", "true");
    }

    bindTouchStart(handler){
      if(!this.touchStartButton) return;
      this.touchStartButton.addEventListener("click", () => {
        if(typeof handler === "function"){
          handler();
        }
      });
    }

    setInstallAvailability(canInstall, isIosLike){
      if(this.installAppButton){
        this.installAppButton.disabled = !canInstall;
      }
      if(this.installHint){
        this.installHint.textContent = isIosLike
          ? t("ui.installIosHint")
          : (canInstall ? "" : t("ui.installUnavailable"));
      }
    }

    bindInstallPrompt(handler){
      if(!this.installAppButton) return;
      this.installAppButton.addEventListener("click", () => {
        if(typeof handler === "function"){
          handler();
        }
      });
    }

    updateOverlayViewportHeight(){
      const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty("--overlay-viewport-height", `${Math.round(viewportHeight - 16)}px`);
    }

    setImageService(imageService){
      this.imageService = imageService;
    }

    updateVolumeLabel(input, output){
      if(!input || !output) return;
      output.textContent = `${input.value}%`;
    }

    updatePercentLabel(input, output){
      if(!input || !output) return;
      output.textContent = `${input.value}%`;
    }

    updateDelayLabel(input, output){
      if(!input || !output) return;
      const parsed = Number(input.value);
      const value = Number.isFinite(parsed) ? parsed : 0;
      output.textContent = `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 2)} s`;
    }

    showSettingsTransferStatus(message){
      if(!this.settingsTransferStatus) return;
      this.settingsTransferStatus.textContent = message || "";
    }

    triggerImportSettingsPicker(){
      if(!this.importSettingsInput) return;
      this.importSettingsInput.click();
    }

    readImagePickerSources(){
      return this.imagePickerSourceInputs
        .filter(input => input.checked)
        .map(input => input.dataset.imagePickerSource)
        .filter(Boolean);
    }

    fillImagePickerSources(sources){
      const selected = new Set(Array.isArray(sources) ? sources : DEFAULT_IMAGE_PICKER_SOURCES);
      for(const input of this.imagePickerSourceInputs){
        input.checked = selected.has(input.dataset.imagePickerSource);
      }
    }

    resolveCurrentImagePickerQuery(){
      if(!this.currentImagePickerEntry || !this.imageService) return "";

      const rawValue = this.imagePickerSearchInput ? this.imagePickerSearchInput.value.trim() : "";
      return rawValue || this.imageService.getDefaultSearchQuery(this.currentImagePickerEntry);
    }

    getWordOverrideDraft(category, word){
      const key = wordImageKey(category, word);
      if(!this.wordOverridesDraft[key] || typeof this.wordOverridesDraft[key] !== "object"){
        this.wordOverridesDraft[key] = {};
      }
      return this.wordOverridesDraft[key];
    }

    getWordImageSelection(category, word){
      const draft = this.wordOverridesDraft[wordImageKey(category, word)];
      return draft && draft.image ? draft.image : null;
    }

    getWordCelebrationSelection(category, word){
      const draft = this.wordOverridesDraft[wordImageKey(category, word)];
      return draft && draft.celebration ? draft.celebration : null;
    }

    cleanupWordOverride(category, word){
      const key = wordImageKey(category, word);
      this.cleanupWordOverrideByKey(key);
    }

    cleanupWordOverrideByKey(key){
      const draft = this.wordOverridesDraft[key];
      if(!draft) return;
      const hasImage = Boolean(draft.image && draft.image.src);
      const hasCelebration = Boolean(
        draft.celebration &&
        (
          draft.celebration.enabled ||
          draft.celebration.audioSrc ||
          draft.celebration.fxStickerSrc
        )
      );
      if(!hasImage && !hasCelebration){
        delete this.wordOverridesDraft[key];
      }
    }

    updateWordCelebrationStatus(category, word){
      const celebration = this.getWordCelebrationSelection(category, word);
      const key = wordImageKey(category, word);
      const audioStatus = this.settingsGrid.querySelector(`[data-word-celebration-audio-status="${key}"]`);
      const stickerStatus = this.settingsGrid.querySelector(`[data-word-celebration-sticker-status="${key}"]`);
      const audioButton = this.settingsGrid.querySelector(`[data-word-celebration-audio-button="${key}"]`);
      const audioRemove = this.settingsGrid.querySelector(`[data-word-celebration-audio-remove="${key}"]`);
      const stickerButton = this.settingsGrid.querySelector(`[data-word-celebration-sticker-button="${key}"]`);
      const stickerRemove = this.settingsGrid.querySelector(`[data-word-celebration-sticker-remove="${key}"]`);
      const toggle = this.settingsGrid.querySelector(`[data-word-celebration-toggle="${key}"]`);
      const controls = this.settingsGrid.querySelector(`[data-word-celebration-controls="${key}"]`);
      const enabled = Boolean(celebration && celebration.enabled);
      const hasAudio = Boolean(celebration && celebration.audioSrc);
      const hasSticker = Boolean(celebration && celebration.fxStickerSrc);
      const audioVolumeValue = celebration && Number.isFinite(Number(celebration.audioVolume))
        ? this.volumeToSlider(celebration.audioVolume)
        : this.volumeToSlider(70);
      const durationValue = celebration && Number.isFinite(Number(celebration.durationMs))
        ? this.durationToSlider(celebration.durationMs)
        : this.durationToSlider(CELEBRATION_MS);

      if(toggle){
        toggle.checked = enabled;
      }
      if(controls){
        controls.hidden = !enabled;
      }
      if(audioStatus){
        audioStatus.textContent = hasAudio
          ? `${t("ui.wordCelebrationAudioReady")} • ${celebration.audioLabel || t("ui.wordCelebrationLocalAudio")}`
          : t("ui.wordCelebrationAudioMissing");
      }
      if(stickerStatus){
        stickerStatus.textContent = hasSticker
          ? t("ui.wordCelebrationStickerReady")
          : t("ui.wordCelebrationStickerMissing");
      }
      if(audioButton){
        audioButton.textContent = hasAudio ? t("ui.wordCelebrationAudioChange") : t("ui.wordCelebrationAudioUpload");
      }
      if(audioRemove){
        audioRemove.disabled = !hasAudio;
      }
      if(stickerButton){
        stickerButton.textContent = hasSticker ? t("ui.wordCelebrationStickerChange") : t("ui.wordCelebrationStickerUpload");
      }
      if(stickerRemove){
        stickerRemove.disabled = !hasSticker;
      }
      const volumeInput = this.settingsGrid.querySelector(`[data-word-celebration-audio-volume="${key}"]`);
      const volumeOutput = this.settingsGrid.querySelector(`[data-word-celebration-audio-volume-value="${key}"]`);
      if(volumeInput){
        volumeInput.value = audioVolumeValue;
        volumeInput.disabled = !enabled;
      }
      if(volumeOutput){
        volumeOutput.textContent = `${audioVolumeValue}%`;
      }
      const durationInput = this.settingsGrid.querySelector(`[data-word-celebration-duration="${key}"]`);
      const durationOutput = this.settingsGrid.querySelector(`[data-word-celebration-duration-value="${key}"]`);
      if(durationInput){
        durationInput.value = durationValue;
        durationInput.disabled = !enabled;
      }
      if(durationOutput){
        durationOutput.textContent = `${(Number(durationValue) / 1000).toFixed(Number(durationValue) % 1000 === 0 ? 0 : 2)} s`;
      }
    }

    volumeToSlider(volume){
      const parsed = Number(volume);
      const safe = Number.isFinite(parsed) ? parsed : 0;
      return String(Math.min(Math.max(Math.round(safe), 0), MAX_VOLUME_PERCENT));
    }

    sliderToVolume(input, fallback = 70){
      if(!input) return fallback;
      const parsed = Number(input.value);
      if(!Number.isFinite(parsed)) return fallback;
      return Math.min(Math.max(parsed, 0), MAX_VOLUME_PERCENT);
    }

    letterSizeToSlider(value){
      const parsed = Number(value);
      const safe = Number.isFinite(parsed) ? parsed : DEFAULT_LETTER_SIZE_PERCENT;
      const clamped = Math.min(Math.max(safe, MIN_LETTER_SIZE_PERCENT), MAX_LETTER_SIZE_PERCENT);
      return String(Math.round(clamped / LETTER_SIZE_STEP_PERCENT) * LETTER_SIZE_STEP_PERCENT);
    }

    sliderToLetterSize(input, fallback = DEFAULT_LETTER_SIZE_PERCENT){
      if(!input) return fallback;
      const parsed = Number(input.value);
      if(!Number.isFinite(parsed)) return fallback;
      const clamped = Math.min(Math.max(parsed, MIN_LETTER_SIZE_PERCENT), MAX_LETTER_SIZE_PERCENT);
      return Math.round(clamped / LETTER_SIZE_STEP_PERCENT) * LETTER_SIZE_STEP_PERCENT;
    }

    picturePanelSizeToSlider(value){
      const parsed = Number(value);
      const safe = Number.isFinite(parsed) ? parsed : DEFAULT_PICTURE_PANEL_SIZE_PERCENT;
      const clamped = Math.min(Math.max(safe, MIN_PICTURE_PANEL_SIZE_PERCENT), MAX_PICTURE_PANEL_SIZE_PERCENT);
      return String(Math.round(clamped / PICTURE_PANEL_SIZE_STEP_PERCENT) * PICTURE_PANEL_SIZE_STEP_PERCENT);
    }

    sliderToPicturePanelSize(input, fallback = DEFAULT_PICTURE_PANEL_SIZE_PERCENT){
      if(!input) return fallback;
      const parsed = Number(input.value);
      if(!Number.isFinite(parsed)) return fallback;
      const clamped = Math.min(Math.max(parsed, MIN_PICTURE_PANEL_SIZE_PERCENT), MAX_PICTURE_PANEL_SIZE_PERCENT);
      return Math.round(clamped / PICTURE_PANEL_SIZE_STEP_PERCENT) * PICTURE_PANEL_SIZE_STEP_PERCENT;
    }

    pictureZoomToSlider(value){
      const parsed = Number(value);
      const safe = Number.isFinite(parsed) ? parsed : DEFAULT_PICTURE_ZOOM_PERCENT;
      const clamped = Math.min(Math.max(safe, MIN_PICTURE_ZOOM_PERCENT), MAX_PICTURE_ZOOM_PERCENT);
      return String(Math.round(clamped / PICTURE_ZOOM_STEP_PERCENT) * PICTURE_ZOOM_STEP_PERCENT);
    }

    sliderToPictureZoom(input, fallback = DEFAULT_PICTURE_ZOOM_PERCENT){
      if(!input) return fallback;
      const parsed = Number(input.value);
      if(!Number.isFinite(parsed)) return fallback;
      const clamped = Math.min(Math.max(parsed, MIN_PICTURE_ZOOM_PERCENT), MAX_PICTURE_ZOOM_PERCENT);
      return Math.round(clamped / PICTURE_ZOOM_STEP_PERCENT) * PICTURE_ZOOM_STEP_PERCENT;
    }

    updateWordImageZoom(input){
      if(!input) return;

      const category = input.dataset.wordImageZoomCategory;
      const word = input.dataset.wordImageZoomWord;
      if(!category || !word) return;

      const key = wordImageKey(category, word);
      const current = this.getWordImageSelection(category, word);
      if(!current || !current.src) return;

      const zoomPercent = this.sliderToPictureZoom(input, current.zoomPercent);
      current.zoomPercent = zoomPercent;

      const output = input.parentElement ? input.parentElement.querySelector("[data-word-image-zoom-value]") : null;
      if(output){
        output.textContent = `${zoomPercent}%`;
      }
    }

    delayToSlider(delay){
      const parsed = Number(delay);
      const safe = Number.isFinite(parsed) ? parsed : MIN_CELEBRATION_DELAY_MS;
      const clamped = Math.min(Math.max(safe, MIN_CELEBRATION_DELAY_MS), MAX_CELEBRATION_DELAY_MS);
      return String(Math.round(clamped / CELEBRATION_DELAY_STEP_MS) * CELEBRATION_DELAY_STEP_MS);
    }

    sliderToDelay(input, fallback){
      if(!input) return fallback;
      const parsed = Number(input.value);
      if(!Number.isFinite(parsed)) return fallback;
      const clamped = Math.min(Math.max(parsed, MIN_CELEBRATION_DELAY_MS), MAX_CELEBRATION_DELAY_MS);
      return Math.round(clamped / CELEBRATION_DELAY_STEP_MS) * CELEBRATION_DELAY_STEP_MS;
    }

    durationToSlider(duration){
      const parsed = Number(duration);
      const safe = Number.isFinite(parsed) ? parsed : CELEBRATION_MS;
      const clamped = Math.min(Math.max(safe, MIN_CELEBRATION_DURATION_MS), MAX_CELEBRATION_DURATION_MS);
      return String(Math.round(clamped / CELEBRATION_DURATION_STEP_MS) * CELEBRATION_DURATION_STEP_MS);
    }

    sliderToDuration(input, fallback = CELEBRATION_MS){
      if(!input) return fallback;
      const parsed = Number(input.value);
      if(!Number.isFinite(parsed)) return fallback;
      const clamped = Math.min(Math.max(parsed, MIN_CELEBRATION_DURATION_MS), MAX_CELEBRATION_DURATION_MS);
      return Math.round(clamped / CELEBRATION_DURATION_STEP_MS) * CELEBRATION_DURATION_STEP_MS;
    }

    applyI18n(){
      document.documentElement.lang = getLocale();

      document.querySelectorAll("[data-i18n]").forEach(element => {
        element.textContent = t(element.dataset.i18n);
      });

      document.querySelectorAll("[data-i18n-html]").forEach(element => {
        element.innerHTML = t(element.dataset.i18nHtml);
      });

      document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        element.placeholder = t(element.dataset.i18nPlaceholder);
      });

      document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
        element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
      });

      this.challengeLabel.textContent = t("ui.challengeLabel", { a: 3, b: 4 });
    }

    buildCategoryCard(category, options = {}){
      const card = document.createElement("section");
      card.className = `settings-card${options.isCustom ? " custom-category-card" : ""}`;

      if(options.isCustom){
        card.dataset.customCategory = "true";
        card.dataset.customId = category.id;
        const header = document.createElement("header");
        const label = document.createElement("label");

        const toggleRow = document.createElement("span");
        toggleRow.className = "custom-category-checkbox";

        const enabledInput = document.createElement("input");
        enabledInput.type = "checkbox";
        enabledInput.dataset.customEnabled = category.id;
        enabledInput.checked = category.enabled !== false;

        const toggleText = document.createElement("span");
        toggleText.textContent = t("ui.customCategoryName");

        toggleRow.append(enabledInput, toggleText);

        const labelInput = document.createElement("input");
        labelInput.type = "text";
        labelInput.dataset.customLabel = category.id;
        labelInput.maxLength = 32;
        labelInput.placeholder = t("ui.customCategoryName");
        labelInput.value = category.label || "";

        label.append(toggleRow, labelInput);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "secondary icon-cta custom-remove-button";
        removeButton.dataset.removeCustom = category.id;
        removeButton.textContent = "🗑";
        removeButton.setAttribute("aria-label", t("ui.removeCategory"));
        removeButton.title = t("ui.removeCategory");

        const wordsInput = document.createElement("textarea");
        wordsInput.dataset.customWords = category.id;
        wordsInput.spellcheck = false;
        wordsInput.placeholder = t("ui.customCategoryWords");
        wordsInput.value = Array.isArray(category.words) ? category.words.join(", ") : "";

        const wordImages = document.createElement("details");
        wordImages.className = "word-images-accordion";
        wordImages.dataset.wordImagesAccordion = category.id;

        const summary = document.createElement("summary");
        summary.textContent = t("ui.wordImagesTitle");

        const wordImagesBody = document.createElement("div");
        wordImagesBody.dataset.wordImages = category.id;
        wordImagesBody.className = "word-images-editor";

        header.append(label, removeButton);
        wordImages.append(summary, wordImagesBody);
        card.append(header, wordsInput, wordImages);
        return card;
      }

      card.innerHTML = category === "famiglia"
        ? `
          <header>
            <label>
              <input type="checkbox" data-enabled="${category}">
              ${getCategoryLabel(category)}
            </label>
          </header>
          <textarea data-words="${category}" spellcheck="false"></textarea>
          <p class="settings-inline-note">${t("ui.familyInlineNote")}</p>
          <div class="family-pictures-editor" data-family-pictures></div>
        `
        : `
          <header>
            <label>
              <input type="checkbox" data-enabled="${category}">
              ${getCategoryLabel(category)}
            </label>
          </header>
          <textarea data-words="${category}" spellcheck="false"></textarea>
          <details class="word-images-accordion" data-word-images-accordion="${category}">
            <summary>${t("ui.wordImagesTitle")}</summary>
            <div class="word-images-editor" data-word-images="${category}"></div>
          </details>
        `;
      return card;
    }

    ensureSelectedWordForCategory(category, words){
      const safeWords = Array.isArray(words) ? words : [];
      if(!safeWords.length){
        delete this.selectedWordConfigByCategory[category];
        return "";
      }

      const selected = this.selectedWordConfigByCategory[category];
      if(selected && safeWords.includes(selected)){
        return selected;
      }

      this.selectedWordConfigByCategory[category] = safeWords[0];
      return safeWords[0];
    }

    renderWordConfigPicker(editor, category, words){
      editor.innerHTML = "";
      if(!editor) return "";

      const safeWords = Array.isArray(words) ? words : [];
      if(!safeWords.length){
        const empty = document.createElement("div");
        empty.className = "word-config-empty";
        empty.textContent = t("ui.wordConfigEmpty");
        editor.appendChild(empty);
        delete this.selectedWordConfigByCategory[category];
        return "";
      }

      const selectedWord = this.ensureSelectedWordForCategory(category, safeWords);
      const picker = document.createElement("div");
      picker.className = "word-config-picker";

      const label = document.createElement("label");
      label.htmlFor = `word-config-select-${category}`;

      const title = document.createElement("span");
      title.textContent = t("ui.wordConfigSelectLabel");

      const select = document.createElement("select");
      select.id = `word-config-select-${category}`;
      select.dataset.wordConfigSelect = category;

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = t("ui.wordConfigSelectPlaceholder");
      placeholder.hidden = true;
      picker.appendChild(label);
      label.append(title, select);

      for(const word of safeWords){
        const option = document.createElement("option");
        option.value = word;
        option.textContent = word.toUpperCase();
        select.appendChild(option);
      }

      select.value = selectedWord;
      editor.appendChild(picker);
      return selectedWord;
    }

    buildSingleWordConfigRow(category, categoryLabel, word){
      const key = wordImageKey(category, word);
      const selected = this.getWordImageSelection(category, word);
      const celebration = this.getWordCelebrationSelection(category, word);
      const celebrationEnabled = Boolean(celebration && celebration.enabled);
      const hasCelebrationAudio = Boolean(celebration && celebration.audioSrc);
      const hasCelebrationSticker = Boolean(celebration && celebration.fxStickerSrc);
      const celebrationAudioVolume = celebration && Number.isFinite(Number(celebration.audioVolume))
        ? Number(celebration.audioVolume)
        : 70;
      const celebrationDuration = celebration && Number.isFinite(Number(celebration.durationMs))
        ? Number(celebration.durationMs)
        : CELEBRATION_MS;

      const row = document.createElement("div");
      row.className = "word-image-row";

      const name = document.createElement("div");
      name.className = "word-image-name";
      name.textContent = word.toUpperCase();

      const actions = document.createElement("div");
      actions.className = "word-image-actions";

      const choose = document.createElement("button");
      choose.type = "button";
      choose.className = "secondary";
      choose.dataset.selectWordImage = category;
      choose.dataset.word = word;
      choose.dataset.categoryLabel = categoryLabel || getCategoryLabel(category);
      choose.textContent = selected ? t("ui.changeWordImage") : t("ui.selectWordImage");

      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "secondary";
      clear.dataset.clearWordImage = category;
      clear.dataset.word = word;
      clear.disabled = !selected;
      clear.textContent = t("ui.clearWordImage");

      actions.append(choose, clear);

      const status = document.createElement("div");
      status.className = "word-image-status";
      status.textContent = selected ? t("ui.wordImageSelected") : t("ui.wordImageAutomatic");

      const imageSection = document.createElement("section");
      imageSection.className = "word-config-block";

      const imageSectionTitle = document.createElement("div");
      imageSectionTitle.className = "word-config-title";
      imageSectionTitle.textContent = t("ui.wordImageSectionTitle");

      imageSection.append(imageSectionTitle, actions, status);

      if(selected){
        const zoomControl = document.createElement("div");
        zoomControl.className = "slider-control word-image-zoom-control";

        const zoomLabel = document.createElement("label");
        zoomLabel.htmlFor = `word-image-zoom-${key}`;

        const zoomTitle = document.createElement("span");
        zoomTitle.textContent = t("ui.pictureZoom");

        const zoomValue = document.createElement("span");
        zoomValue.className = "slider-value";
        zoomValue.dataset.wordImageZoomValue = "true";
        zoomValue.textContent = `${this.pictureZoomToSlider(selected.zoomPercent)}%`;

        zoomLabel.append(zoomTitle, zoomValue);

        const zoomInput = document.createElement("input");
        zoomInput.type = "range";
        zoomInput.id = `word-image-zoom-${key}`;
        zoomInput.min = String(MIN_PICTURE_ZOOM_PERCENT);
        zoomInput.max = String(MAX_PICTURE_ZOOM_PERCENT);
        zoomInput.step = String(PICTURE_ZOOM_STEP_PERCENT);
        zoomInput.value = this.pictureZoomToSlider(selected.zoomPercent);
        zoomInput.dataset.wordImageZoom = "true";
        zoomInput.dataset.wordImageZoomCategory = category;
        zoomInput.dataset.wordImageZoomWord = word;

        zoomControl.append(zoomLabel, zoomInput);
        imageSection.appendChild(zoomControl);
      }

      const celebrationSection = document.createElement("section");
      celebrationSection.className = "word-config-block word-celebration-block";

      const celebrationTitle = document.createElement("div");
      celebrationTitle.className = "word-config-title";
      celebrationTitle.textContent = t("ui.wordCelebrationSectionTitle");

      const celebrationToggleRow = document.createElement("label");
      celebrationToggleRow.className = "switch-row";
      const celebrationToggle = document.createElement("input");
      celebrationToggle.type = "checkbox";
      celebrationToggle.dataset.wordCelebrationToggle = key;
      celebrationToggle.checked = celebrationEnabled;
      const celebrationToggleText = document.createElement("span");
      celebrationToggleText.textContent = t("ui.wordCelebrationToggle");
      celebrationToggleRow.append(celebrationToggle, celebrationToggleText);

      const celebrationControls = document.createElement("div");
      celebrationControls.className = "word-celebration-controls";
      celebrationControls.dataset.wordCelebrationControls = key;
      celebrationControls.hidden = !celebrationEnabled;

      const audioRow = document.createElement("div");
      audioRow.className = "word-image-actions";
      const audioButton = document.createElement("button");
      audioButton.type = "button";
      audioButton.className = "secondary";
      audioButton.dataset.wordCelebrationAudioButton = key;
      audioButton.textContent = hasCelebrationAudio ? t("ui.wordCelebrationAudioChange") : t("ui.wordCelebrationAudioUpload");
      const audioRemove = document.createElement("button");
      audioRemove.type = "button";
      audioRemove.className = "secondary";
      audioRemove.dataset.wordCelebrationAudioRemove = key;
      audioRemove.disabled = !hasCelebrationAudio;
      audioRemove.textContent = t("ui.wordCelebrationAudioRemove");
      const audioInput = document.createElement("input");
      audioInput.type = "file";
      audioInput.accept = "audio/*";
      audioInput.hidden = true;
      audioInput.dataset.wordCelebrationAudioInput = key;
      audioRow.append(audioButton, audioRemove, audioInput);

      const audioStatus = document.createElement("div");
      audioStatus.className = "word-image-status";
      audioStatus.dataset.wordCelebrationAudioStatus = key;
      audioStatus.textContent = hasCelebrationAudio
        ? `${t("ui.wordCelebrationAudioReady")} • ${celebration.audioLabel || t("ui.wordCelebrationLocalAudio")}`
        : t("ui.wordCelebrationAudioMissing");

      const audioVolumeControl = document.createElement("div");
      audioVolumeControl.className = "slider-control word-image-zoom-control";
      const audioVolumeLabel = document.createElement("label");
      audioVolumeLabel.htmlFor = `word-celebration-audio-volume-${key}`;
      const audioVolumeTitle = document.createElement("span");
      audioVolumeTitle.textContent = t("ui.wordCelebrationAudioVolume");
      const audioVolumeValue = document.createElement("span");
      audioVolumeValue.className = "slider-value";
      audioVolumeValue.dataset.wordCelebrationAudioVolumeValue = key;
      audioVolumeValue.textContent = `${this.volumeToSlider(celebrationAudioVolume)}%`;
      audioVolumeLabel.append(audioVolumeTitle, audioVolumeValue);
      const audioVolumeInput = document.createElement("input");
      audioVolumeInput.type = "range";
      audioVolumeInput.id = `word-celebration-audio-volume-${key}`;
      audioVolumeInput.min = "0";
      audioVolumeInput.max = "100";
      audioVolumeInput.step = "5";
      audioVolumeInput.value = this.volumeToSlider(celebrationAudioVolume);
      audioVolumeInput.disabled = !celebrationEnabled;
      audioVolumeInput.dataset.wordCelebrationAudioVolume = key;
      audioVolumeControl.append(audioVolumeLabel, audioVolumeInput);

      const durationControl = document.createElement("div");
      durationControl.className = "slider-control word-image-zoom-control";
      const durationLabel = document.createElement("label");
      durationLabel.htmlFor = `word-celebration-duration-${key}`;
      const durationTitle = document.createElement("span");
      durationTitle.textContent = t("ui.wordCelebrationDuration");
      const durationValue = document.createElement("span");
      durationValue.className = "slider-value";
      durationValue.dataset.wordCelebrationDurationValue = key;
      durationValue.textContent = `${(celebrationDuration / 1000).toFixed(celebrationDuration % 1000 === 0 ? 0 : 2)} s`;
      durationLabel.append(durationTitle, durationValue);
      const durationInput = document.createElement("input");
      durationInput.type = "range";
      durationInput.id = `word-celebration-duration-${key}`;
      durationInput.min = String(MIN_CELEBRATION_DURATION_MS);
      durationInput.max = String(MAX_CELEBRATION_DURATION_MS);
      durationInput.step = String(CELEBRATION_DURATION_STEP_MS);
      durationInput.value = this.durationToSlider(celebrationDuration);
      durationInput.disabled = !celebrationEnabled;
      durationInput.dataset.wordCelebrationDuration = key;
      durationControl.append(durationLabel, durationInput);

      const stickerRow = document.createElement("div");
      stickerRow.className = "word-image-actions";
      const stickerButton = document.createElement("button");
      stickerButton.type = "button";
      stickerButton.className = "secondary";
      stickerButton.dataset.wordCelebrationStickerButton = key;
      stickerButton.textContent = hasCelebrationSticker ? t("ui.wordCelebrationStickerChange") : t("ui.wordCelebrationStickerUpload");
      const stickerRemove = document.createElement("button");
      stickerRemove.type = "button";
      stickerRemove.className = "secondary";
      stickerRemove.dataset.wordCelebrationStickerRemove = key;
      stickerRemove.disabled = !hasCelebrationSticker;
      stickerRemove.textContent = t("ui.wordCelebrationStickerRemove");
      const stickerInput = document.createElement("input");
      stickerInput.type = "file";
      stickerInput.accept = "image/*";
      stickerInput.hidden = true;
      stickerInput.dataset.wordCelebrationStickerInput = key;
      stickerRow.append(stickerButton, stickerRemove, stickerInput);

      const stickerStatus = document.createElement("div");
      stickerStatus.className = "word-image-status";
      stickerStatus.dataset.wordCelebrationStickerStatus = key;
      stickerStatus.textContent = hasCelebrationSticker
        ? t("ui.wordCelebrationStickerReady")
        : t("ui.wordCelebrationStickerMissing");

      const celebrationNote = document.createElement("div");
      celebrationNote.className = "word-image-status";
      celebrationNote.textContent = t("ui.wordCelebrationFallbackNote");

      celebrationControls.append(audioRow, audioStatus, audioVolumeControl, durationControl, stickerRow, stickerStatus, celebrationNote);
      celebrationSection.append(celebrationTitle, celebrationToggleRow, celebrationControls);

      row.append(name, imageSection, celebrationSection);
      return row;
    }

    buildSettingsEditor(){
      this.settingsGrid.innerHTML = "";
      for(const category of CATEGORY_ORDER){
        const card = this.buildCategoryCard(category);
        this.settingsGrid.appendChild(card);
      }

      this.familyWordsInput = this.settingsGrid.querySelector('[data-words="famiglia"]');
      this.familyPicturesEditor = this.settingsGrid.querySelector("[data-family-pictures]");
      if(this.familyWordsInput){
        this.familyWordsInput.addEventListener("input", () => this.syncFamilyPicturesEditor());
      }

      this.settingsGrid.addEventListener("click", event => {
        const button = event.target.closest("[data-remove-custom]");
        if(!button) return;
        this.removeCustomCategory(button.dataset.removeCustom);
      });

      this.settingsGrid.addEventListener("click", event => {
        const chooseButton = event.target.closest("[data-select-word-image]");
        if(chooseButton){
          this.openWordImagePicker(chooseButton.dataset.selectWordImage, chooseButton.dataset.word, chooseButton.dataset.categoryLabel);
          return;
        }

        const clearButton = event.target.closest("[data-clear-word-image]");
        if(clearButton){
          this.clearWordImageSelection(clearButton.dataset.clearWordImage, clearButton.dataset.word);
          return;
        }

        const audioButton = event.target.closest("[data-word-celebration-audio-button]");
        if(audioButton){
          const input = this.settingsGrid.querySelector(`[data-word-celebration-audio-input="${audioButton.dataset.wordCelebrationAudioButton}"]`);
          if(input) input.click();
          return;
        }

        const audioRemove = event.target.closest("[data-word-celebration-audio-remove]");
        if(audioRemove){
          this.clearWordCelebrationAudio(audioRemove.dataset.wordCelebrationAudioRemove);
          return;
        }

        const stickerButton = event.target.closest("[data-word-celebration-sticker-button]");
        if(stickerButton){
          const input = this.settingsGrid.querySelector(`[data-word-celebration-sticker-input="${stickerButton.dataset.wordCelebrationStickerButton}"]`);
          if(input) input.click();
          return;
        }

        const stickerRemove = event.target.closest("[data-word-celebration-sticker-remove]");
        if(stickerRemove){
          this.clearWordCelebrationSticker(stickerRemove.dataset.wordCelebrationStickerRemove);
        }
      });

      this.settingsGrid.addEventListener("input", event => {
        const target = event.target;
        if(target.matches("[data-words]")){
          this.renderWordImagesEditor(target.dataset.words, getCategoryLabel(target.dataset.words), sanitizeWordList(target.value));
          return;
        }

        if(target.matches("[data-custom-words]")){
          const categoryId = target.dataset.customWords;
          const labelInput = this.settingsGrid.querySelector(`[data-custom-label="${categoryId}"]`);
          this.renderWordImagesEditor(categoryId, labelInput ? labelInput.value.trim() : "", sanitizeWordList(target.value));
          return;
        }

        if(target.matches("[data-custom-label]")){
          const categoryId = target.dataset.customLabel;
          const wordsInput = this.settingsGrid.querySelector(`[data-custom-words="${categoryId}"]`);
          this.renderWordImagesEditor(categoryId, target.value.trim(), sanitizeWordList(wordsInput ? wordsInput.value : ""));
          return;
        }

        if(target.matches("[data-word-config-select]")){
          this.selectedWordConfigByCategory[target.dataset.wordConfigSelect] = target.value;
          const wordsInput = this.settingsGrid.querySelector(`[data-words="${target.dataset.wordConfigSelect}"]`);
          if(wordsInput){
            this.renderWordImagesEditor(
              target.dataset.wordConfigSelect,
              getCategoryLabel(target.dataset.wordConfigSelect),
              sanitizeWordList(wordsInput.value)
            );
            return;
          }

          const customWordsInput = this.settingsGrid.querySelector(`[data-custom-words="${target.dataset.wordConfigSelect}"]`);
          const customLabelInput = this.settingsGrid.querySelector(`[data-custom-label="${target.dataset.wordConfigSelect}"]`);
          this.renderWordImagesEditor(
            target.dataset.wordConfigSelect,
            customLabelInput ? customLabelInput.value.trim() : "",
            sanitizeWordList(customWordsInput ? customWordsInput.value : "")
          );
          return;
        }

        if(target.matches("[data-word-image-zoom]")){
          this.updateWordImageZoom(target);
          return;
        }

        if(target.matches("[data-word-celebration-toggle]")){
          this.toggleWordCelebration(target.dataset.wordCelebrationToggle, target.checked);
          return;
        }

        if(target.matches("[data-word-celebration-audio-volume]")){
          this.updateWordCelebrationAudioVolume(target);
          return;
        }

        if(target.matches("[data-word-celebration-duration]")){
          this.updateWordCelebrationDuration(target);
        }
      });

      this.settingsGrid.addEventListener("change", async event => {
        const target = event.target;
        if(target.matches("[data-word-celebration-audio-input]")){
          const file = target.files && target.files[0] ? target.files[0] : null;
          await this.applyWordCelebrationAudioUpload(target.dataset.wordCelebrationAudioInput, file);
          target.value = "";
          return;
        }

        if(target.matches("[data-word-celebration-sticker-input]")){
          const file = target.files && target.files[0] ? target.files[0] : null;
          await this.applyWordCelebrationStickerUpload(target.dataset.wordCelebrationStickerInput, file);
          target.value = "";
        }
      });
    }

    setImagePickerLoading(isLoading, message = ""){
      if(this.imagePickerGrid) this.imagePickerGrid.innerHTML = "";
      if(this.imagePickerStatus) this.imagePickerStatus.textContent = message;
      if(this.imagePickerPrevious) this.imagePickerPrevious.disabled = true;
      if(this.imagePickerNext) this.imagePickerNext.disabled = true;
    }

    renderImagePickerCandidates(entry, response){
      const { candidates, hasPrevious, hasNext, notice } = response;
      if(!this.imagePickerGrid) return;
      this.imagePickerGrid.innerHTML = "";
      this.imagePickerStatus.textContent = candidates.length
        ? (notice || "")
        : [notice, t("ui.imagePickerEmpty")].filter(Boolean).join(" • ");
      if(this.imagePickerPrevious) this.imagePickerPrevious.disabled = !hasPrevious;
      if(this.imagePickerNext) this.imagePickerNext.disabled = !hasNext;

      for(const candidate of candidates){
        const button = document.createElement("button");
        button.type = "button";
        button.className = "image-choice-card";
        button.addEventListener("click", () => {
          const key = wordImageKey(entry.category, entry.word);
          const draft = this.getWordOverrideDraft(entry.category, entry.word);
          const existing = draft.image;
          draft.image = {
            src: candidate.src,
            source: candidate.source,
            sourceKind: candidate.sourceKind || "preferred",
            zoomPercent: existing && existing.src === candidate.src
              ? this.sliderToPictureZoom({ value: existing.zoomPercent }, DEFAULT_PICTURE_ZOOM_PERCENT)
              : DEFAULT_PICTURE_ZOOM_PERCENT
          };
          this.refreshWordImageEditors();
          this.closeWordImagePicker();
        });

        const preview = document.createElement("img");
        preview.src = candidate.src;
        preview.alt = `${entry.word} ${candidate.source || ""}`.trim();

        const caption = document.createElement("div");
        caption.className = "image-choice-source";
        caption.textContent = candidate.source || t("ui.wordImageSelected");

        button.append(preview, caption);
        this.imagePickerGrid.appendChild(button);
      }
    }

    async applyImagePickerUpload(file){
      if(!file || !this.currentImagePickerEntry) return;

      try{
        const src = await this.readLocalImage(file);
        const key = wordImageKey(this.currentImagePickerEntry.category, this.currentImagePickerEntry.word);
        const draft = this.getWordOverrideDraft(this.currentImagePickerEntry.category, this.currentImagePickerEntry.word);
        const existing = draft.image;
        draft.image = {
          src,
          source: t("ui.imageSourceUploadedWord"),
          sourceKind: "upload",
          zoomPercent: existing && existing.src === src
            ? this.sliderToPictureZoom({ value: existing.zoomPercent }, DEFAULT_PICTURE_ZOOM_PERCENT)
            : DEFAULT_PICTURE_ZOOM_PERCENT
        };
        this.refreshWordImageEditors();
        this.closeWordImagePicker();
      }catch{
        this.setImagePickerLoading(false, t("ui.imagePickerUploadError"));
      }
    }

    async loadImagePickerPage(page){
      if(!this.imageService || !this.currentImagePickerEntry) return;

      if(!this.currentImagePickerSources.length){
        this.setImagePickerLoading(false, t("ui.imagePickerNoSourceSelected"));
        return;
      }

      this.currentImagePickerPage = Math.max(page, 0);
      const requestId = this.imagePickerRequestId;
      this.setImagePickerLoading(true, t("ui.imagePickerLoading"));

      try{
        const response = await this.imageService.fetchRealtimeImagePage(
          this.currentImagePickerEntry,
          this.currentImagePickerPage,
          this.currentImagePickerSearchQuery,
          this.currentImagePickerSources
        );
        if(requestId !== this.imagePickerRequestId) return;
        this.setImagePickerLoading(false);
        this.renderImagePickerCandidates(this.currentImagePickerEntry, response);
      }catch{
        if(requestId !== this.imagePickerRequestId) return;
        this.setImagePickerLoading(false, t("ui.imagePickerEmpty"));
      }
    }

    showImagePickerView(){
      if(this.settingsModal){
        this.imagePickerReturnScrollTop = this.settingsModal.scrollTop;
      }
      if(this.settingsMainView){
        this.settingsMainView.hidden = true;
      }
      if(this.imagePickerView){
        this.imagePickerView.hidden = false;
      }
      if(this.settingsModal){
        this.settingsModal.scrollTop = 0;
      }
      if(this.imagePickerSearchInput){
        this.imagePickerSearchInput.focus();
        this.imagePickerSearchInput.select();
      }
    }

    showSettingsMainView(restoreScroll = true){
      if(this.settingsMainView){
        this.settingsMainView.hidden = false;
      }
      if(this.imagePickerView){
        this.imagePickerView.hidden = true;
      }
      if(restoreScroll && this.settingsModal){
        this.settingsModal.scrollTop = this.imagePickerReturnScrollTop;
      }
    }

    async openWordImagePicker(category, word, categoryLabel){
      if(!this.imageService) return;

      const entry = { category, categoryLabel, word };
      this.currentImagePickerEntry = entry;
      this.currentImagePickerSearchQuery = this.imageService.getDefaultSearchQuery(entry);
      this.currentImagePickerSources = [...DEFAULT_IMAGE_PICKER_SOURCES];
      this.imagePickerRequestId += 1;
      this.currentImagePickerPage = 0;

      this.imagePickerTitle.textContent = `${t("ui.imagePickerTitle")} • ${word.toUpperCase()}`;
      this.imagePickerIntro.textContent = t("ui.imagePickerIntro");
      if(this.imagePickerSearchInput){
        this.imagePickerSearchInput.value = this.currentImagePickerSearchQuery;
      }
      this.fillImagePickerSources(this.currentImagePickerSources);
      this.showImagePickerView();
      this.loadImagePickerPage(0);
    }

    changeImagePickerPage(delta){
      if(!this.currentImagePickerEntry) return;
      this.loadImagePickerPage(this.currentImagePickerPage + delta);
    }

    searchImagePicker(){
      if(!this.currentImagePickerEntry || !this.imageService) return;

      this.currentImagePickerSearchQuery = this.resolveCurrentImagePickerQuery();
      this.currentImagePickerSources = this.readImagePickerSources();
      if(this.imagePickerSearchInput){
        this.imagePickerSearchInput.value = this.currentImagePickerSearchQuery;
      }
      this.imagePickerRequestId += 1;
      this.loadImagePickerPage(0);
    }

    closeWordImagePicker(){
      this.currentImagePickerEntry = null;
      this.currentImagePickerSearchQuery = "";
      this.currentImagePickerSources = [...DEFAULT_IMAGE_PICKER_SOURCES];
      this.imagePickerRequestId += 1;
      this.currentImagePickerPage = 0;
      if(this.imagePickerUploadInput){
        this.imagePickerUploadInput.value = "";
      }
      this.setImagePickerLoading(false);
      this.showSettingsMainView();
    }

    clearCurrentWordImageSelection(){
      if(!this.currentImagePickerEntry) return;
      this.clearWordImageSelection(this.currentImagePickerEntry.category, this.currentImagePickerEntry.word);
      this.closeWordImagePicker();
    }

    clearWordImageSelection(category, word){
      const draft = this.getWordOverrideDraft(category, word);
      delete draft.image;
      this.cleanupWordOverride(category, word);
      this.refreshWordImageEditors();
    }

    toggleWordCelebration(key, enabled){
      const draft = this.wordOverridesDraft[key] || (this.wordOverridesDraft[key] = {});
      const celebration = draft.celebration || {
        enabled: false,
        audioSrc: "",
        audioLabel: "",
        audioVolume: 70,
        durationMs: CELEBRATION_MS,
        fxStickerSrc: "",
        fxMode: "default"
      };
      celebration.enabled = enabled === true;
      celebration.fxMode = celebration.fxStickerSrc ? "sticker" : "default";
      draft.celebration = celebration;
      this.cleanupWordOverrideByKey(key);
      this.updateWordCelebrationStatusByKey(key);
    }

    updateWordCelebrationAudioVolume(input){
      if(!input) return;
      const key = input.dataset.wordCelebrationAudioVolume;
      if(!key) return;
      const draft = this.wordOverridesDraft[key] || (this.wordOverridesDraft[key] = {});
      const celebration = draft.celebration || {
        enabled: true,
        audioSrc: "",
        audioLabel: "",
        audioVolume: 70,
        durationMs: CELEBRATION_MS,
        fxStickerSrc: "",
        fxMode: "default"
      };
      celebration.audioVolume = this.sliderToVolume(input, celebration.audioVolume || 70);
      draft.celebration = celebration;
      const output = this.settingsGrid.querySelector(`[data-word-celebration-audio-volume-value="${key}"]`);
      if(output){
        output.textContent = `${this.volumeToSlider(celebration.audioVolume)}%`;
      }
    }

    updateWordCelebrationDuration(input){
      if(!input) return;
      const key = input.dataset.wordCelebrationDuration;
      if(!key) return;
      const draft = this.wordOverridesDraft[key] || (this.wordOverridesDraft[key] = {});
      const celebration = draft.celebration || {
        enabled: true,
        audioSrc: "",
        audioLabel: "",
        audioVolume: 70,
        durationMs: CELEBRATION_MS,
        fxStickerSrc: "",
        fxMode: "default"
      };
      celebration.durationMs = this.sliderToDuration(input, celebration.durationMs || CELEBRATION_MS);
      draft.celebration = celebration;
      const output = this.settingsGrid.querySelector(`[data-word-celebration-duration-value="${key}"]`);
      if(output){
        output.textContent = `${(celebration.durationMs / 1000).toFixed(celebration.durationMs % 1000 === 0 ? 0 : 2)} s`;
      }
    }

    updateWordCelebrationStatusByKey(key){
      const [category, word] = String(key || "").split(":");
      if(!category || !word) return;
      this.updateWordCelebrationStatus(category, word);
    }

    clearWordCelebrationAudio(key){
      const draft = this.wordOverridesDraft[key];
      if(!draft || !draft.celebration) return;
      draft.celebration.audioSrc = "";
      draft.celebration.audioLabel = "";
      this.cleanupWordOverrideByKey(key);
      this.updateWordCelebrationStatusByKey(key);
    }

    clearWordCelebrationSticker(key){
      const draft = this.wordOverridesDraft[key];
      if(!draft || !draft.celebration) return;
      draft.celebration.fxStickerSrc = "";
      draft.celebration.fxMode = "default";
      this.cleanupWordOverrideByKey(key);
      this.updateWordCelebrationStatusByKey(key);
    }

    async readLocalAudio(file){
      if(!file || !(file.type || "").startsWith("audio/")){
        throw new Error("invalid-audio");
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if(typeof reader.result === "string" && reader.result.startsWith("data:audio/")){
            resolve(reader.result);
            return;
          }
          reject(new Error("invalid-audio"));
        };
        reader.onerror = () => reject(new Error("file-read-error"));
        reader.readAsDataURL(file);
      });
    }

    async applyWordCelebrationAudioUpload(key, file){
      if(!key || !file) return;
      try{
        const src = await this.readLocalAudio(file);
        const draft = this.wordOverridesDraft[key] || (this.wordOverridesDraft[key] = {});
        const celebration = draft.celebration || { enabled: true, audioSrc: "", audioLabel: "", audioVolume: 70, durationMs: CELEBRATION_MS, fxStickerSrc: "", fxMode: "default" };
        celebration.enabled = true;
        celebration.audioSrc = src;
        celebration.audioLabel = file.name || t("ui.wordCelebrationLocalAudio");
        draft.celebration = celebration;
        this.updateWordCelebrationStatusByKey(key);
      }catch{
        this.showSettingsTransferStatus(t("ui.wordCelebrationUploadError"));
      }
    }

    async applyWordCelebrationStickerUpload(key, file){
      if(!key || !file) return;
      try{
        const src = await this.readLocalImage(file);
        const draft = this.wordOverridesDraft[key] || (this.wordOverridesDraft[key] = {});
        const celebration = draft.celebration || { enabled: true, audioSrc: "", audioLabel: "", audioVolume: 70, durationMs: CELEBRATION_MS, fxStickerSrc: "", fxMode: "default" };
        celebration.enabled = true;
        celebration.fxStickerSrc = src;
        celebration.fxMode = "sticker";
        draft.celebration = celebration;
        this.updateWordCelebrationStatusByKey(key);
      }catch{
        this.showSettingsTransferStatus(t("ui.wordCelebrationUploadError"));
      }
    }

    renderWordImagesEditor(category, categoryLabel, words){
      const editor = this.settingsGrid.querySelector(`[data-word-images="${category}"]`);
      if(!editor) return;

      if(category === "famiglia") return;
      const selectedWord = this.renderWordConfigPicker(editor, category, words);
      if(!selectedWord) return;
      editor.appendChild(this.buildSingleWordConfigRow(category, categoryLabel, selectedWord));
    }

    refreshWordImageEditors(){
      const validKeys = new Set();
      for(const category of CATEGORY_ORDER){
        const wordsInput = this.settingsGrid.querySelector(`[data-words="${category}"]`);
        const words = sanitizeWordList(wordsInput ? wordsInput.value : []);
        if(category !== "famiglia"){
          for(const word of words){
            validKeys.add(wordImageKey(category, word));
          }
        }
        this.renderWordImagesEditor(category, getCategoryLabel(category), words);
      }

      for(const card of this.settingsGrid.querySelectorAll("[data-custom-category]")){
        const categoryId = card.dataset.customId;
        const labelInput = card.querySelector(`[data-custom-label="${categoryId}"]`);
        const wordsInput = card.querySelector(`[data-custom-words="${categoryId}"]`);
        const words = sanitizeWordList(wordsInput ? wordsInput.value : []);
        for(const word of words){
          validKeys.add(wordImageKey(categoryId, word));
        }
        this.renderWordImagesEditor(
          categoryId,
          labelInput ? labelInput.value.trim() : "",
          words
        );
      }

      for(const key of Object.keys(this.wordOverridesDraft)){
        if(!validKeys.has(key)){
          delete this.wordOverridesDraft[key];
        }
      }
    }

    readCustomCategoriesFromEditor(){
      return Array.from(this.settingsGrid.querySelectorAll("[data-custom-category]"))
        .map(card => {
          const id = card.dataset.customId;
          const labelInput = card.querySelector(`[data-custom-label="${id}"]`);
          const enabledInput = card.querySelector(`[data-custom-enabled="${id}"]`);
          const wordsInput = card.querySelector(`[data-custom-words="${id}"]`);
          return {
            id,
            label: labelInput ? labelInput.value.trim() : "",
            enabled: Boolean(enabledInput && enabledInput.checked),
            words: sanitizeWordList(wordsInput ? wordsInput.value : "")
          };
        })
        .filter(category => category.label);
    }

    renderCustomCategoryCards(categories){
      this.settingsGrid.querySelectorAll("[data-custom-category]").forEach(card => card.remove());

      for(const category of categories){
        const card = this.buildCategoryCard(category, { isCustom: true });
        this.settingsGrid.appendChild(card);
      }

      this.refreshWordImageEditors();
    }

    syncCustomCategoryDrafts(){
      this.customCategoryDrafts = this.readCustomCategoriesFromEditor();
    }

    createCustomCategoryId(label){
      const base = stripAccents(String(label || "categoria"))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "categoria";

      let candidate = `custom-${base}`;
      let index = 2;
      const usedIds = new Set(CATEGORY_ORDER.concat(this.customCategoryDrafts.map(category => category.id)));
      while(usedIds.has(candidate)){
        candidate = `custom-${base}-${index}`;
        index += 1;
      }
      return candidate;
    }

    addCustomCategory(){
      const label = this.customCategoryNameInput ? this.customCategoryNameInput.value.trim() : "";
      if(!label) return;

      this.syncCustomCategoryDrafts();
      this.customCategoryDrafts.push({
        id: this.createCustomCategoryId(label),
        label,
        enabled: true,
        words: []
      });
      this.renderCustomCategoryCards(this.customCategoryDrafts);
      if(this.customCategoryNameInput){
        this.customCategoryNameInput.value = "";
        this.customCategoryNameInput.focus();
      }
    }

    removeCustomCategory(id){
      this.syncCustomCategoryDrafts();
      this.customCategoryDrafts = this.customCategoryDrafts.filter(category => category.id !== id);
      for(const key of Object.keys(this.wordOverridesDraft)){
        if(key.startsWith(`${id.toLowerCase()}:`)){
          delete this.wordOverridesDraft[key];
        }
      }
      this.renderCustomCategoryCards(this.customCategoryDrafts);
    }

    readLocalImage(file){
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if(typeof reader.result === "string"){
            resolve(reader.result);
            return;
          }
          reject(new Error("invalid-image"));
        };
        reader.onerror = () => reject(new Error("file-read-error"));
        reader.readAsDataURL(file);
      });
    }

    getFamilyWordsFromEditor(){
      return sanitizeWordList(this.familyWordsInput ? this.familyWordsInput.value : []);
    }

    readFamilyPictures(words){
      const next = {};
      for(const word of words){
        const key = familyPictureKey(word);
        const image = this.familyPictureDrafts[key];
        if(typeof image === "string" && image.startsWith("data:image/")){
          next[key] = image;
        }
      }
      return next;
    }

    syncFamilyPicturesEditor(){
      this.renderFamilyPicturesEditor(this.getFamilyWordsFromEditor());
    }

    renderFamilyPicturesEditor(words){
      if(!this.familyPicturesEditor) return;

      const nextDrafts = {};
      this.familyPicturesEditor.innerHTML = "";

      for(const word of words){
        const key = familyPictureKey(word);
        if(this.familyPictureDrafts[key]){
          nextDrafts[key] = this.familyPictureDrafts[key];
        }

        const row = document.createElement("div");
        row.className = "family-picture-row";

        const label = document.createElement("div");
        label.className = "family-picture-name";
        label.textContent = word.toUpperCase();

        const actions = document.createElement("div");
        actions.className = "family-picture-actions";

        const upload = document.createElement("label");
        upload.className = "secondary family-upload";
        upload.textContent = nextDrafts[key] ? t("ui.familyPicturesChange") : t("ui.familyPicturesChoose");

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.hidden = true;
        fileInput.addEventListener("change", async () => {
          const file = fileInput.files && fileInput.files[0];
          if(!file) return;

          try{
            this.familyPictureDrafts[key] = await this.readLocalImage(file);
            this.renderFamilyPicturesEditor(this.getFamilyWordsFromEditor());
          }catch{
          }
        });

        upload.appendChild(fileInput);
        actions.appendChild(upload);

        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "secondary";
        clear.textContent = t("ui.familyPicturesRemove");
        clear.disabled = !nextDrafts[key];
        clear.addEventListener("click", () => {
          delete this.familyPictureDrafts[key];
          this.renderFamilyPicturesEditor(this.getFamilyWordsFromEditor());
        });
        actions.appendChild(clear);

        const status = document.createElement("div");
        status.className = "family-picture-status";
        status.textContent = nextDrafts[key]
          ? t("ui.familyPicturesSaved")
          : t("ui.familyPicturesFallback");

        row.append(label, actions, status);
        this.familyPicturesEditor.appendChild(row);
      }

      if(!words.length){
        const empty = document.createElement("div");
        empty.className = "family-picture-empty";
        empty.textContent = t("ui.familyPicturesEmpty");
        this.familyPicturesEditor.appendChild(empty);
      }

      this.familyPictureDrafts = nextDrafts;
    }

    applyPictureLayout(settings){
      this.layout.classList.toggle("picture-bottom", settings.picturePosition === "bottom");
    }

    applyPicturePanelSize(settings){
      const scale = (Number(settings && settings.picturePanelSizePercent) || DEFAULT_PICTURE_PANEL_SIZE_PERCENT) / 100;
      document.documentElement.style.setProperty("--picture-panel-scale", String(scale));
    }

    applyLetterSize(settings){
      const scale = (Number(settings && settings.letterSizePercent) || DEFAULT_LETTER_SIZE_PERCENT) / 100;
      document.documentElement.style.setProperty("--letter-scale", String(scale));
    }

    applyColorTheme(settings){
      const themeId = settings && typeof settings.colorTheme === "string" && COLOR_THEMES[settings.colorTheme]
        ? settings.colorTheme
        : DEFAULT_COLOR_THEME;
      const theme = COLOR_THEMES[themeId] || COLOR_THEMES[DEFAULT_COLOR_THEME];
      if(!theme) return;

      document.documentElement.dataset.colorTheme = themeId;
      for(const [token, value] of Object.entries(theme)){
        document.documentElement.style.setProperty(`--${token.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}`, value);
      }
    }

    applyThemeOptions(settings){
      const themeStyle = settings && settings.themeStyle === "bold" ? "bold" : "soft";
      const decorationsEnabled = !settings || settings.showThemeDecorations !== false;
      document.documentElement.dataset.themeStyle = themeStyle;
      document.documentElement.dataset.themeDecorations = decorationsEnabled ? "on" : "off";
    }

    renderTypedBar(wordLayout, insertedLetters, currentIndex, settings){
      this.typedDiv.innerHTML = "";

      const slots = wordLayout && Array.isArray(wordLayout.slots) ? wordLayout.slots : [];
      const typedLetters = Array.isArray(insertedLetters) ? insertedLetters : [];

      for(const slot of slots){
        if(slot.kind === "break"){
          const typedBreak = document.createElement("div");
          typedBreak.className = "word-break";
          this.typedDiv.appendChild(typedBreak);
          continue;
        }

        const chip = document.createElement("div");
        chip.className = "typed-chip";
        chip.dataset.playableIndex = String(slot.playableIndex);

        const letter = typedLetters[slot.playableIndex];
        if(letter){
          chip.textContent = letter;
          chip.style.background = colorForChar(stripAccents(letter));
          chip.style.color = "#fff";
          chip.classList.add("filled");
        }else{
          chip.textContent = "";
          chip.style.background = "";
          chip.style.color = "";
        }

        if(slot.playableIndex === currentIndex){
          chip.classList.add("active");
        }

        this.typedDiv.appendChild(chip);
      }

      this.updateExpectedLetterHighlight(currentIndex, settings && settings.highlightExpectedLetter !== false);
    }

    updateExpectedLetterHighlight(index, enabled){
      const letters = this.wordDiv.children;
      const boxes = this.typedDiv.children;

      for(const letter of letters){
        letter.classList.remove("expected");
      }

      for(const box of boxes){
        box.classList.remove("expected");
      }

      this.setKeyboardExpectedLetter("", false);
      if(!enabled) return;

      const nextLetter = this.wordDiv.querySelector(`[data-playable-index="${index}"]`);
      const nextBox = this.typedDiv.querySelector(`[data-playable-index="${index}"]`);
      if(nextLetter) nextLetter.classList.add("expected");
      if(nextBox) nextBox.classList.add("expected");

      const nextLetterText = nextLetter ? nextLetter.textContent : "";
      this.setKeyboardExpectedLetter(nextLetterText, enabled);
    }

    renderWord(entry, wordLayout, settings){
      this.wordDiv.innerHTML = "";

      const slots = wordLayout && Array.isArray(wordLayout.slots) ? wordLayout.slots : [];
      for(const slot of slots){
        if(slot.kind === "break"){
          const wordBreak = document.createElement("div");
          wordBreak.className = "word-break";
          this.wordDiv.appendChild(wordBreak);
          continue;
        }

        const letter = document.createElement("div");
        letter.className = "letter";
        letter.dataset.playableIndex = String(slot.playableIndex);
        letter.style.background = colorForChar(slot.base);
        letter.textContent = slot.visibleLetter;
        this.wordDiv.appendChild(letter);
      }

      this.updateExpectedLetterHighlight(0, settings && settings.highlightExpectedLetter !== false);
    }

    clearWordAndTypedBar(){
      this.wordDiv.innerHTML = "";
      this.typedDiv.innerHTML = "";
    }

    setPictureLoading(isLoading){
      this.pictureCard.classList.toggle("loading", isLoading);
      this.pictureFrame.classList.toggle("loading", isLoading);
      this.pictureSpinner.classList.toggle("visible", isLoading);
    }

    setPictureInfo(source, enabled = false){
      if(this.pictureInfoTooltip){
        this.pictureInfoTooltip.textContent = enabled ? String(source || "") : "";
        this.pictureInfoTooltip.hidden = !enabled;
      }
      if(this.pictureInfoButton){
        this.pictureInfoButton.hidden = !enabled;
      }
      this.pictureSource.textContent = source || "";
    }

    showPicturePlaceholder(text, source, isLoading = false){
      this.pictureCard.classList.remove("picture-hidden");
      this.setPictureLoading(isLoading);
      this.pictureImage.hidden = true;
      this.pictureImage.removeAttribute("src");
      this.pictureImage.alt = "";
      this.pictureImage.style.transform = "scale(1)";
      this.picturePlaceholder.hidden = !text;
      this.picturePlaceholder.textContent = text;
      this.setPictureInfo(source, false);
    }

    hidePictureCard(){
      this.pictureCard.classList.add("picture-hidden");
      this.setPictureLoading(false);
      this.picturePlaceholder.hidden = false;
      this.picturePlaceholder.textContent = t("ui.pictureDisabled");
      this.pictureImage.hidden = true;
      this.pictureImage.removeAttribute("src");
      this.pictureImage.alt = "";
      this.pictureImage.style.transform = "scale(1)";
      this.setPictureInfo("", false);
    }

    async renderPicture(entry, settings, imageService, requestId, getRequestId){
      this.pictureTitle.textContent = String(entry.categoryLabel || getCategoryLabel(entry.category) || "").toUpperCase();
      if(!settings.showPicture){
        this.hidePictureCard();
        return "disabled";
      }

      this.showPicturePlaceholder("", t("ui.pictureSearching"), true);

      try{
        const candidates = await imageService.resolveImageCandidates(entry, settings);
        if(requestId !== getRequestId()) return "stale";

        if(!candidates.length){
          this.showPicturePlaceholder(t("ui.pictureNotFound"), t("ui.noImageAvailable"));
          return "placeholder";
        }

        for(const image of candidates){
          try{
            await imageService.preloadImage(image.src);
            if(requestId !== getRequestId()) return "stale";
            this.pictureCard.classList.remove("picture-hidden");
            this.setPictureLoading(false);
            this.picturePlaceholder.hidden = true;
            this.pictureImage.hidden = false;
            this.pictureImage.alt = "";
            this.pictureImage.src = image.src;
            const zoomPercent = Number.isFinite(Number(image.zoomPercent))
              ? Number(image.zoomPercent)
              : DEFAULT_PICTURE_ZOOM_PERCENT;
            this.pictureImage.style.transform = `scale(${zoomPercent / 100})`;
            this.setPictureInfo(image.source, Boolean(image.source));
            return "shown";
          }catch{
          }
        }

        this.showPicturePlaceholder(t("ui.pictureNotFound"), t("ui.noFallbackAvailable"));
        return "placeholder";
      }catch{
        if(requestId !== getRequestId()) return "stale";
        this.showPicturePlaceholder(t("ui.pictureUnavailable"), t("ui.connectionError"));
        return "placeholder";
      }
    }

    fillSettingsEditor(settings){
      this.currentImagePickerEntry = null;
      this.currentImagePickerSearchQuery = "";
      this.currentImagePickerPage = 0;
      this.showSettingsMainView(false);
      this.setImagePickerLoading(false);
      this.selectedWordConfigByCategory = {};
      this.familyPictureDrafts = Object.assign({}, settings.familyPictures || {});
      this.wordOverridesDraft = Object.fromEntries(
        Object.entries(settings.wordOverrides || {}).map(([key, value]) => [
          key,
          {
            image: value && value.image ? Object.assign({}, value.image) : undefined,
            celebration: value && value.celebration ? Object.assign({}, value.celebration) : undefined
          }
        ])
      );
      this.customCategoryDrafts = Array.isArray(settings.customCategories)
        ? settings.customCategories.map(category => ({
          id: category.id,
          label: category.label,
          enabled: category.enabled !== false,
          words: Array.isArray(category.words) ? [...category.words] : []
        }))
        : [];
      this.showPictureToggle.checked = settings.showPicture;
      this.enableImageCacheToggle.checked = settings.enableImageCache === true;
      this.enableCelebrationToggle.checked = settings.enableCelebration !== false;
      this.allowCelebrationSkipToggle.checked = settings.allowCelebrationSkip !== false;
      this.highlightExpectedLetterToggle.checked = settings.highlightExpectedLetter !== false;
      if(this.showThemeDecorationsToggle){
        this.showThemeDecorationsToggle.checked = settings.showThemeDecorations !== false;
      }
      for(const input of this.colorThemeInputs){
        input.checked = input.value === (settings.colorTheme || DEFAULT_COLOR_THEME);
      }
      for(const input of this.themeStyleInputs){
        input.checked = input.value === (settings.themeStyle === "bold" ? "bold" : "soft");
      }
      this.letterSizeRange.value = this.letterSizeToSlider(settings.letterSizePercent);
      if(this.picturePanelSizeRange){
        this.picturePanelSizeRange.value = this.picturePanelSizeToSlider(settings.picturePanelSizePercent);
        this.updatePercentLabel(this.picturePanelSizeRange, this.picturePanelSizeValue);
      }
      this.speechVolumeRange.value = this.volumeToSlider(settings.speechVolume);
      this.celebrationMusicVolumeRange.value = this.volumeToSlider(settings.celebrationMusicVolume);
      this.celebrationDelayRange.value = this.delayToSlider(settings.celebrationStartDelayMs);
      this.celebrationDurationRange.value = this.durationToSlider(settings.celebrationDurationMs);
      this.updatePercentLabel(this.letterSizeRange, this.letterSizeValue);
      this.updateVolumeLabel(this.speechVolumeRange, this.speechVolumeValue);
      this.updateVolumeLabel(this.celebrationMusicVolumeRange, this.celebrationMusicVolumeValue);
      this.updateDelayLabel(this.celebrationDelayRange, this.celebrationDelayValue);
      this.updateDelayLabel(this.celebrationDurationRange, this.celebrationDurationValue);
      this.picturePositionSide.checked = settings.picturePosition !== "bottom";
      this.picturePositionBottom.checked = settings.picturePosition === "bottom";
      for(const category of CATEGORY_ORDER){
        const enabledInput = this.settingsGrid.querySelector(`[data-enabled="${category}"]`);
        const wordsInput = this.settingsGrid.querySelector(`[data-words="${category}"]`);
        if(enabledInput) enabledInput.checked = settings.enabledCategories[category];
        if(wordsInput) wordsInput.value = settings.categories[category].join(", ");
      }
      this.renderCustomCategoryCards(this.customCategoryDrafts);
      if(this.customCategoryNameInput) this.customCategoryNameInput.value = "";
      this.syncFamilyPicturesEditor();
      this.refreshWordImageEditors();
    }

    readSettingsEditor(defaultSettingsFactory, sanitizeWords, defaultLibrary){
      const next = defaultSettingsFactory();
      next.showPicture = this.showPictureToggle.checked;
      next.enableImageCache = Boolean(this.enableImageCacheToggle && this.enableImageCacheToggle.checked);
      next.enableCelebration = this.enableCelebrationToggle.checked;
      next.allowCelebrationSkip = this.allowCelebrationSkipToggle.checked;
      next.highlightExpectedLetter = this.highlightExpectedLetterToggle.checked;
      next.showThemeDecorations = !(this.showThemeDecorationsToggle && !this.showThemeDecorationsToggle.checked);
      const selectedColorTheme = this.colorThemeInputs.find(input => input.checked);
      next.colorTheme = selectedColorTheme && COLOR_THEMES[selectedColorTheme.value]
        ? selectedColorTheme.value
        : DEFAULT_COLOR_THEME;
      const selectedThemeStyle = this.themeStyleInputs.find(input => input.checked);
      next.themeStyle = selectedThemeStyle && selectedThemeStyle.value === "bold" ? "bold" : "soft";
      next.letterSizePercent = this.sliderToLetterSize(this.letterSizeRange, next.letterSizePercent);
      next.picturePanelSizePercent = this.sliderToPicturePanelSize(this.picturePanelSizeRange, next.picturePanelSizePercent);
      next.speechVolume = this.sliderToVolume(this.speechVolumeRange, next.speechVolume);
      next.celebrationMusicVolume = this.sliderToVolume(this.celebrationMusicVolumeRange, next.celebrationMusicVolume);
      next.celebrationStartDelayMs = this.sliderToDelay(this.celebrationDelayRange, next.celebrationStartDelayMs);
      next.celebrationDurationMs = this.sliderToDuration(this.celebrationDurationRange, next.celebrationDurationMs);
      next.picturePosition = this.picturePositionBottom.checked ? "bottom" : "side";

      for(const category of CATEGORY_ORDER){
        const enabledInput = this.settingsGrid.querySelector(`[data-enabled="${category}"]`);
        const wordsInput = this.settingsGrid.querySelector(`[data-words="${category}"]`);
        next.enabledCategories[category] = Boolean(enabledInput && enabledInput.checked);
        next.categories[category] = sanitizeWords(wordsInput ? wordsInput.value : defaultLibrary[category]);
      }

      next.customCategories = this.readCustomCategoriesFromEditor();

      if(!CATEGORY_ORDER.some(category => next.enabledCategories[category] && next.categories[category].length)){
        if(next.customCategories.some(category => category.enabled && category.words.length)){
          next.enabledCategories.famiglia = false;
        }else{
          next.enabledCategories.famiglia = true;
          next.categories.famiglia = sanitizeWords(defaultLibrary.famiglia);
        }
      }

      next.familyPictures = this.readFamilyPictures(next.categories.famiglia);
      next.wordOverrides = {};

      for(const category of CATEGORY_ORDER){
        if(category === "famiglia") continue;
        for(const word of next.categories[category]){
          const key = wordImageKey(category, word);
          const draft = this.wordOverridesDraft[key];
          if(draft && (draft.image || draft.celebration)){
            next.wordOverrides[key] = {};
            if(draft.image && draft.image.src){
              next.wordOverrides[key].image = Object.assign({}, draft.image);
            }
            if(draft.celebration && (draft.celebration.enabled || draft.celebration.audioSrc || draft.celebration.fxStickerSrc)){
              next.wordOverrides[key].celebration = Object.assign({}, draft.celebration);
            }
            if(!next.wordOverrides[key].image && !next.wordOverrides[key].celebration){
              delete next.wordOverrides[key];
            }
          }
        }
      }

      for(const category of next.customCategories){
        for(const word of category.words){
          const key = wordImageKey(category.id, word);
          const draft = this.wordOverridesDraft[key];
          if(draft && (draft.image || draft.celebration)){
            next.wordOverrides[key] = {};
            if(draft.image && draft.image.src){
              next.wordOverrides[key].image = Object.assign({}, draft.image);
            }
            if(draft.celebration && (draft.celebration.enabled || draft.celebration.audioSrc || draft.celebration.fxStickerSrc)){
              next.wordOverrides[key].celebration = Object.assign({}, draft.celebration);
            }
            if(!next.wordOverrides[key].image && !next.wordOverrides[key].celebration){
              delete next.wordOverrides[key];
            }
          }
        }
      }

      return next;
    }

    openOverlay(overlay){
      this.updateOverlayViewportHeight();
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
    }

    closeOverlay(overlay){
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }

    showAudioStartPrompt(){
      if(!this.audioStartOverlay) return;
      this.openOverlay(this.audioStartOverlay);
      if(this.audioStartButton){
        this.audioStartButton.focus();
      }
    }

    hideAudioStartPrompt(){
      if(!this.audioStartOverlay) return;
      this.closeOverlay(this.audioStartOverlay);
    }

    isSetupOpen(){
      return this.lockOverlay.classList.contains("open") || this.settingsOverlay.classList.contains("open");
    }

    showChallenge(challenge){
      this.challengeLabel.textContent = t("ui.challengeLabel", { a: challenge.a, b: challenge.b });
      this.challengeInput.value = "";
      this.challengeHint.textContent = "";
    }

    showChallengeError(){
      this.challengeHint.textContent = t("ui.invalidCode");
      this.challengeInput.select();
    }

    focusChallenge(){
      this.challengeInput.focus();
    }

    resizeCanvas(){
      this.fxCanvas.width = window.innerWidth;
      this.fxCanvas.height = window.innerHeight;
      this.updateOverlayViewportHeight();
    }

    createConfetti(){
      const colors = ["#ff00ff", "#32cd32", "#ffd447", "#ff8c42", "#42c8ff"];
      return Array.from({ length: 90 }, () => ({
        x: Math.random() * this.fxCanvas.width,
        y: -20 - Math.random() * this.fxCanvas.height * 0.2,
        size: 8 + Math.random() * 12,
        vy: 2 + Math.random() * 3.4,
        vx: -1.5 + Math.random() * 3,
        rotation: Math.random() * Math.PI,
        vr: -0.12 + Math.random() * 0.24,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    }

    createCelebrationFriends(theme){
      const colors = ["#ff4fbf", "#4fd26f", "#ffcf3f", "#ff7a45", "#58b8ff"];
      return Array.from({ length: 10 }, (_, index) => ({
        theme,
        x: (this.fxCanvas.width / 11) * (index + 1),
        y: this.fxCanvas.height + 70 + Math.random() * 120,
        radius: 18 + Math.random() * 14,
        speed: 0.9 + Math.random() * 0.8,
        sway: 12 + Math.random() * 18,
        seed: Math.random() * Math.PI * 2,
        color: colors[index % colors.length],
        scale: 0.8 + Math.random() * 0.5
      }));
    }

    loadImageAsset(src){
      return new Promise((resolve, reject) => {
        if(!src){
          reject(new Error("missing-image"));
          return;
        }
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("image-error"));
        image.src = src;
      });
    }

    async prepareCelebrationFxConfig(config){
      if(!config || config.mode !== "sticker" || !config.stickerSrc){
        return { mode: "default" };
      }

      try{
        const stickerImage = await this.loadImageAsset(config.stickerSrc);
        return {
          mode: "sticker",
          stickerSrc: config.stickerSrc,
          stickerImage
        };
      }catch{
        return { mode: "default" };
      }
    }

    stopCelebrationFx(){
      if(this.fxState && this.fxState.raf){
        cancelAnimationFrame(this.fxState.raf);
      }
      this.fxState = null;
      this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
    }

    drawStar(x, y, radius, alpha, color){
      this.fxCtx.save();
      this.fxCtx.globalAlpha = alpha;
      this.fxCtx.fillStyle = color;
      this.fxCtx.beginPath();
      for(let i = 0; i < 10; i++){
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const size = i % 2 === 0 ? radius : radius * 0.45;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if(i === 0) this.fxCtx.moveTo(px, py);
        else this.fxCtx.lineTo(px, py);
      }
      this.fxCtx.closePath();
      this.fxCtx.fill();
      this.fxCtx.restore();
    }

    drawFace(x, y, radius, alpha, faceColor, earColor){
      this.fxCtx.save();
      this.fxCtx.globalAlpha = alpha;
      this.fxCtx.fillStyle = earColor;
      this.fxCtx.beginPath();
      this.fxCtx.arc(x - radius * 0.52, y - radius * 0.62, radius * 0.34, 0, Math.PI * 2);
      this.fxCtx.arc(x + radius * 0.52, y - radius * 0.62, radius * 0.34, 0, Math.PI * 2);
      this.fxCtx.fill();

      this.fxCtx.fillStyle = faceColor;
      this.fxCtx.beginPath();
      this.fxCtx.arc(x, y, radius, 0, Math.PI * 2);
      this.fxCtx.fill();

      this.fxCtx.fillStyle = "#1e1e1e";
      this.fxCtx.beginPath();
      this.fxCtx.arc(x - radius * 0.34, y - radius * 0.12, radius * 0.16, 0, Math.PI * 2);
      this.fxCtx.arc(x + radius * 0.34, y - radius * 0.12, radius * 0.16, 0, Math.PI * 2);
      this.fxCtx.fill();

      this.fxCtx.fillStyle = "#fff";
      this.fxCtx.beginPath();
      this.fxCtx.arc(x - radius * 0.35, y - radius * 0.15, radius * 0.07, 0, Math.PI * 2);
      this.fxCtx.arc(x + radius * 0.33, y - radius * 0.15, radius * 0.07, 0, Math.PI * 2);
      this.fxCtx.fill();

      this.fxCtx.fillStyle = "#f7d0c9";
      this.fxCtx.beginPath();
      this.fxCtx.ellipse(x, y + radius * 0.24, radius * 0.24, radius * 0.18, 0, 0, Math.PI * 2);
      this.fxCtx.fill();

      this.fxCtx.strokeStyle = "#5a3d27";
      this.fxCtx.lineWidth = 2;
      this.fxCtx.beginPath();
      this.fxCtx.arc(x, y + radius * 0.24, radius * 0.1, 0, Math.PI);
      this.fxCtx.stroke();
      this.fxCtx.restore();
    }

    drawCelebrationFriend(friend, time, alpha){
      const sway = Math.sin(time / 500 + friend.seed) * friend.sway;
      const x = friend.x + sway;
      const y = friend.y;

      if(friend.theme === "balloon"){
        this.fxCtx.save();
        this.fxCtx.globalAlpha = alpha;
        this.fxCtx.strokeStyle = "rgba(120,90,35,0.55)";
        this.fxCtx.lineWidth = 2;
        this.fxCtx.beginPath();
        this.fxCtx.moveTo(x, y + friend.radius);
        this.fxCtx.quadraticCurveTo(x - 8, y + friend.radius + 24, x + 4, y + friend.radius + 54);
        this.fxCtx.stroke();

        this.fxCtx.fillStyle = friend.color;
        this.fxCtx.beginPath();
        this.fxCtx.ellipse(x, y, friend.radius * 0.88, friend.radius, 0, 0, Math.PI * 2);
        this.fxCtx.fill();

        this.fxCtx.fillStyle = "rgba(255,255,255,0.35)";
        this.fxCtx.beginPath();
        this.fxCtx.ellipse(x - friend.radius * 0.24, y - friend.radius * 0.2, friend.radius * 0.18, friend.radius * 0.3, 0, 0, Math.PI * 2);
        this.fxCtx.fill();
        this.fxCtx.restore();
        return;
      }

      if(friend.theme === "star"){
        this.drawStar(x, y, friend.radius, alpha, friend.color);
        return;
      }

      if(friend.theme === "panda"){
        this.drawFace(x, y, friend.radius * 0.82, alpha, "#ffffff", "#1f1f1f");
        return;
      }

      if(friend.theme === "sticker" && friend.image){
        const size = friend.radius * 2.4 * (friend.scale || 1);
        this.fxCtx.save();
        this.fxCtx.globalAlpha = alpha;
        this.fxCtx.translate(x, y);
        this.fxCtx.rotate(Math.sin(time / 420 + friend.seed) * 0.16);
        this.fxCtx.drawImage(friend.image, -size / 2, -size / 2, size, size);
        this.fxCtx.restore();
        return;
      }

      this.drawFace(x, y, friend.radius * 0.82, alpha, "#c98b52", "#8a5a31");
    }

    pickCelebrationTheme(){
      const themes = ["balloon", "star", "panda", "bear"];
      return themes[Math.floor(Math.random() * themes.length)];
    }

    startCelebrationFx(config = null, durationMs = CELEBRATION_MS){
      this.stopCelebrationFx();
      const theme = config && config.mode === "sticker" ? "sticker" : this.pickCelebrationTheme();
      this.fxState = {
        start: performance.now(),
        duration: Number(durationMs) > 0 ? Number(durationMs) : CELEBRATION_MS,
        confetti: this.createConfetti(),
        friends: this.createCelebrationFriends(theme).map(friend => (
          theme === "sticker"
            ? Object.assign({}, friend, { image: config && config.stickerImage ? config.stickerImage : null })
            : friend
        )),
        raf: 0
      };

      const frame = (now) => {
        if(!this.fxState) return;
        const elapsed = now - this.fxState.start;
        const progress = Math.min(elapsed / this.fxState.duration, 1);
        const alpha = progress < 0.76 ? 1 : 1 - ((progress - 0.76) / 0.24);

        this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

        for(const piece of this.fxState.confetti){
          piece.x += piece.vx;
          piece.y += piece.vy;
          piece.rotation += piece.vr;

          this.fxCtx.save();
          this.fxCtx.globalAlpha = Math.max(alpha, 0);
          this.fxCtx.translate(piece.x, piece.y);
          this.fxCtx.rotate(piece.rotation);
          this.fxCtx.fillStyle = piece.color;
          this.fxCtx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62);
          this.fxCtx.restore();
        }

        for(const friend of this.fxState.friends){
          friend.y -= friend.speed;
          this.drawCelebrationFriend(friend, now, Math.max(alpha, 0));
        }

        if(progress >= 1){
          this.stopCelebrationFx();
          return;
        }

        this.fxState.raf = requestAnimationFrame(frame);
      };

      this.fxState.raf = requestAnimationFrame(frame);
    }
  }

  ns.view = ns.view || {};
  ns.view.GameView = GameView;
})(window.GiocoTastiera);
