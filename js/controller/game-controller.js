window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const {
    BASE_VOLUME_PERCENT,
    CELEBRATION_MS,
    DEFAULT_LIBRARY,
    FADE_IN_MS,
    FADE_OUT_MS
  } = ns.config;
  const { GameModel, createDefaultSettings, sanitizeWords, stripAccents } = ns.model;
  const { ImageService, SpeechService } = ns.services;
  const { GameView } = ns.view;

  class GameController {
    constructor(){
      this.model = new GameModel();
      this.view = new GameView();
      this.imageService = new ImageService();
      this.imageService.setCacheEnabled(this.model.settings.enableImageCache === true);
      this.view.setImageService(this.imageService);
      this.speechService = new SpeechService();
      this.celebrationTimers = [];
      this.celebrationActive = false;
      this.currentImageRequest = 0;
      this.audioFadeFrame = 0;
      this.wordAnnouncementTimer = 0;
      this.audioContext = null;
      this.musicGainNode = null;
      this.audioUnlocked = false;
      this.celebrationRunId = 0;
      this.activeMusicRunId = 0;
      this.wordReadyForInput = false;
      this.defaultCelebrationAudioSrc = this.view.audio ? (this.view.audio.getAttribute("src") || this.view.audio.src || "") : "";

      document.addEventListener("click", this.unlockAudioFromPointerOnce, { once: true });
      document.addEventListener("keydown", this.unlockAudioFromKeyboardOnce, { once: true });
    }

    enableSpeech(){
      this.model.speechEnabled = true;
      this.speechService.enable();
    }

    unlockAudio = (options = {}) => {
      const wasUnlocked = this.audioUnlocked;
      this.audioUnlocked = true;
      this.enableSpeech();
      this.view.hideAudioStartPrompt();
      document.removeEventListener("click", this.unlockAudioFromPointerOnce);
      document.removeEventListener("keydown", this.unlockAudioFromKeyboardOnce);
      this.resumeAudioContext();
      if(options.announceCurrentWord && !wasUnlocked && this.model.currentEntry && this.wordReadyForInput){
        this.scheduleWordAnnouncement(this.model.currentEntry.word, 0);
      }
    };

    unlockAudioFromPointerOnce = () => {
      this.unlockAudio({ announceCurrentWord: true });
    };

    unlockAudioFromKeyboardOnce = () => {
      this.unlockAudio({ announceCurrentWord: false });
    };

    init(){
      this.enableSpeech();
      this.bindEvents();
      this.applyAudioSettings();
      this.view.applyColorTheme(this.model.settings);
      this.view.applyThemeOptions(this.model.settings);
      this.view.applyLetterSize(this.model.settings);
      this.view.applyPictureLayout(this.model.settings);
      this.view.applyPicturePanelSize(this.model.settings);
      this.view.showSettingsTransferStatus("");
      this.newWord();
      if(this.shouldShowAudioStartPrompt()){
        this.view.showAudioStartPrompt();
      }
    }

    applySettings(nextSettings, options = {}){
      const saved = this.model.updateSettings(nextSettings);
      if(!saved){
        this.view.showSettingsTransferStatus(ns.config.t("ui.settingsTransferErrorSave"));
      }
      this.imageService.setCacheEnabled(this.model.settings.enableImageCache === true);
      this.applyAudioSettings();
      this.view.applyColorTheme(this.model.settings);
      this.view.applyThemeOptions(this.model.settings);
      this.view.applyLetterSize(this.model.settings);
      this.view.applyPictureLayout(this.model.settings);
      this.view.applyPicturePanelSize(this.model.settings);
      if(options.refreshWord !== false){
        this.newWord();
      }
      return saved;
    }

    exportSettings(){
      const payload = {
        app: "tastiera-parlante",
        exportedAt: new Date().toISOString(),
        settings: this.model.settings
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tastiera-parlante-config.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      this.view.showSettingsTransferStatus(ns.config.t("ui.settingsTransferSuccessExport"));
    }

    async importSettingsFromFile(file){
      if(!file) return;

      try{
        const content = await file.text();
        const parsed = JSON.parse(content);
        const importedSettings = parsed && typeof parsed === "object" && parsed.settings ? parsed.settings : parsed;
        const saved = this.applySettings(importedSettings, { refreshWord: true });
        this.view.fillSettingsEditor(this.model.settings);
        this.view.showSettingsTransferStatus(saved ? ns.config.t("ui.settingsTransferSuccessImport") : ns.config.t("ui.settingsTransferErrorSave"));
      }catch{
        this.view.showSettingsTransferStatus(ns.config.t("ui.settingsTransferErrorImport"));
      }

      if(this.view.importSettingsInput){
        this.view.importSettingsInput.value = "";
      }
    }

    setupMusicGain(){
      this.audioContext = null;
      this.musicGainNode = null;
    }

    resumeAudioContext(){
      this.setupMusicGain();
    }

    shouldShowAudioStartPrompt(){
      const userAgent = navigator.userAgent || "";
      const isChrome = /\bChrome\//.test(userAgent) && !/\bEdg\//.test(userAgent) && !/\bOPR\//.test(userAgent);
      return isChrome && !(navigator.userActivation && navigator.userActivation.hasBeenActive);
    }

    getSpeechOutputVolume(){
      return Math.min(this.model.settings.speechVolume / BASE_VOLUME_PERCENT, 1);
    }

    getMusicOutputVolume(){
      return this.model.settings.celebrationMusicVolume / BASE_VOLUME_PERCENT;
    }

    getCelebrationStartDelay(){
      return Number(this.model.settings.celebrationStartDelayMs) || 0;
    }

    setMusicLevel(level){
      const safeLevel = Math.max(Number(level) || 0, 0);
      if(this.musicGainNode){
        this.musicGainNode.gain.value = safeLevel;
        this.view.audio.volume = 1;
        return;
      }
      this.view.audio.volume = Math.min(safeLevel, 1);
    }

    applyAudioSettings(){
      this.speechService.setVolume(this.getSpeechOutputVolume());
    }

    bindEvents(){
      if(this.view.audioStartButton){
        this.view.audioStartButton.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          this.unlockAudio({ announceCurrentWord: true });
        });
      }

      this.view.setupButton.addEventListener("click", () => {
        const challenge = this.model.prepareChallenge();
        this.view.showChallenge(challenge);
        this.view.openOverlay(this.view.lockOverlay);
        this.view.focusChallenge();
      });

      this.view.closeLock.addEventListener("click", () => {
        this.view.closeOverlay(this.view.lockOverlay);
      });

      this.view.lockForm.addEventListener("submit", event => {
        event.preventDefault();
        if(!this.model.verifyChallenge(this.view.challengeInput.value)){
          this.view.showChallengeError();
          return;
        }

        this.view.closeOverlay(this.view.lockOverlay);
        this.view.fillSettingsEditor(this.model.settings);
        this.view.showSettingsTransferStatus("");
        this.view.openOverlay(this.view.settingsOverlay);
      });

      this.view.saveSettings.addEventListener("click", () => {
        const nextSettings = this.view.readSettingsEditor(createDefaultSettings, sanitizeWords, DEFAULT_LIBRARY);
        const saved = this.applySettings(nextSettings, { refreshWord: true });
        if(saved){
          this.view.closeOverlay(this.view.settingsOverlay);
        }
      });

      this.view.resetSettings.addEventListener("click", () => {
        const saved = this.model.resetSettings();
        this.imageService.setCacheEnabled(this.model.settings.enableImageCache === true);
        this.applyAudioSettings();
        this.view.applyColorTheme(this.model.settings);
        this.view.applyThemeOptions(this.model.settings);
        this.view.applyLetterSize(this.model.settings);
        this.view.applyPictureLayout(this.model.settings);
        this.view.applyPicturePanelSize(this.model.settings);
        this.view.fillSettingsEditor(this.model.settings);
        this.view.showSettingsTransferStatus(saved ? "" : ns.config.t("ui.settingsTransferErrorSave"));
      });

      this.view.closeSettings.addEventListener("click", () => {
        this.view.closeOverlay(this.view.settingsOverlay);
      });

      if(this.view.exportSettingsButton){
        this.view.exportSettingsButton.addEventListener("click", () => this.exportSettings());
      }

      if(this.view.importSettingsButton){
        this.view.importSettingsButton.addEventListener("click", () => this.view.triggerImportSettingsPicker());
      }

      if(this.view.importSettingsInput){
        this.view.importSettingsInput.addEventListener("change", event => {
          const input = event.target;
          const file = input && input.files ? input.files[0] : null;
          this.importSettingsFromFile(file);
        });
      }

      window.addEventListener("click", this.onCelebrationClick, true);
      window.addEventListener("keydown", this.onKeyDown);
      window.addEventListener("resize", () => this.view.resizeCanvas());
    }

    onCelebrationClick = (event) => {
      if(!this.celebrationActive || this.view.isSetupOpen() || !this.model.settings.allowCelebrationSkip) return;
      event.preventDefault();
      event.stopPropagation();
      this.skipCelebration();
    };

    onKeyDown = (event) => {
      if(!this.audioUnlocked){
        this.unlockAudio();
      }

      if(
        this.celebrationActive &&
        this.model.settings.allowCelebrationSkip &&
        (event.code === "Space" || event.key === " " || event.key === "Spacebar")
      ){
        event.preventDefault();
        this.skipCelebration();
        return;
      }

      if(this.view.isSetupOpen()) return;
      if(!this.wordReadyForInput) return;
      if(!this.model.currentEntry || this.model.currentIndex >= this.model.normalizedWord.length) return;

      const pressed = event.key;
      if(!/^[a-zàèéìòù]$/i.test(pressed)) return;

      const base = stripAccents(pressed).toUpperCase();
      this.speechService.speakLetter(base);

      const result = this.model.recordKey(pressed);
      if(!result.accepted) return;

      this.view.renderTypedBar(
        this.model.wordLayout,
        this.model.insertedLetters,
        this.model.currentIndex,
        this.model.settings
      );

      if(!result.completed){
        return;
      }

      this.speechService.speakWord(this.model.currentEntry.word);
      if(!this.model.settings.enableCelebration){
        const nextWordTimer = setTimeout(() => {
          this.newWord();
        }, this.getCelebrationStartDelay());
        this.celebrationTimers.push(nextWordTimer);
        return;
      }
      this.celebrate();
    };

    clearCelebrationTimers(){
      for(const timer of this.celebrationTimers){
        clearTimeout(timer);
      }
      this.celebrationTimers = [];
    }

    clearAudioFade(){
      if(this.audioFadeFrame){
        cancelAnimationFrame(this.audioFadeFrame);
        this.audioFadeFrame = 0;
      }
    }

    clearWordAnnouncement(){
      if(!this.wordAnnouncementTimer) return;
      clearTimeout(this.wordAnnouncementTimer);
      this.wordAnnouncementTimer = 0;
    }

    scheduleWordAnnouncement(word, delay = 120){
      this.clearWordAnnouncement();
      this.wordAnnouncementTimer = setTimeout(() => {
        this.wordAnnouncementTimer = 0;
        this.speechService.speakWord(word);
      }, delay);
    }

    fadeVolume(from, to, duration, done){
      const start = performance.now();
      this.clearAudioFade();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        this.setMusicLevel(from + (to - from) * progress);
        if(progress < 1){
          this.audioFadeFrame = requestAnimationFrame(tick);
          return;
        }
        this.audioFadeFrame = 0;
        if(done) done();
      };
      this.audioFadeFrame = requestAnimationFrame(tick);
    }

    waitForAudioReady(audio){
      if(audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA){
        return Promise.resolve();
      }

      return new Promise(resolve => {
        const onReady = () => {
          audio.removeEventListener("loadedmetadata", onReady);
          audio.removeEventListener("canplay", onReady);
          resolve();
        };

        audio.addEventListener("loadedmetadata", onReady, { once: true });
        audio.addEventListener("canplay", onReady, { once: true });
        audio.addEventListener("error", onReady, { once: true });
        audio.load();
      });
    }

    stopMusic(runId = null){
      if(runId !== null && this.activeMusicRunId !== runId) return;
      const audio = this.view.audio;
      this.clearAudioFade();
      audio.pause();
      this.setMusicLevel(0);
      this.activeMusicRunId = 0;
    }

    getWordCelebrationOverride(){
      const entry = this.model.currentEntry;
      if(!entry || entry.category === "famiglia") return null;
      const key = ns.model.wordImageKey(entry.category, entry.word);
      const override = this.model.settings.wordOverrides ? this.model.settings.wordOverrides[key] : null;
      return override && override.celebration ? override.celebration : null;
    }

    async getEffectiveWordCelebrationConfig(){
      const override = this.getWordCelebrationOverride();
      if(
        !override ||
        override.enabled !== true ||
        !override.audioSrc ||
        override.fxMode !== "sticker" ||
        !override.fxStickerSrc
      ){
        return {
          audioSrc: this.defaultCelebrationAudioSrc,
          audioMode: "default",
          fx: { mode: "default" }
        };
      }

      const fx = await this.view.prepareCelebrationFxConfig({
        mode: "sticker",
        stickerSrc: override.fxStickerSrc
      });
      if(fx.mode !== "sticker"){
        return {
          audioSrc: this.defaultCelebrationAudioSrc,
          audioMode: "default",
          fx: { mode: "default" }
        };
      }

      return {
        audioSrc: override.audioSrc,
        audioMode: "custom",
        fx
      };
    }

    configureCelebrationAudioSource(audioSrc){
      const audio = this.view.audio;
      const nextSrc = audioSrc || this.defaultCelebrationAudioSrc;
      const currentSrc = audio.getAttribute("src") || audio.src || "";
      if(currentSrc === nextSrc) return;
      audio.pause();
      audio.setAttribute("src", nextSrc);
      audio.load();
    }

    async playMusic(runId, celebrationConfig){
      const audio = this.view.audio;
      if(runId !== this.celebrationRunId) return;
      this.configureCelebrationAudioSource(celebrationConfig && celebrationConfig.audioSrc ? celebrationConfig.audioSrc : this.defaultCelebrationAudioSrc);
      await this.waitForAudioReady(audio);
      if(runId !== this.celebrationRunId) return;

      const isDefaultClip = !celebrationConfig || celebrationConfig.audioMode !== "custom";
      const hasDuration = Number.isFinite(audio.duration) && audio.duration > 0;
      const clipSeconds = hasDuration ? Math.min(CELEBRATION_MS / 1000, audio.duration) : 0;
      const maxStart = hasDuration ? Math.max(audio.duration - clipSeconds, 0) : 0;
      const start = isDefaultClip && hasDuration ? Math.random() * maxStart : 0;

      this.resumeAudioContext();
      audio.pause();
      try{
        audio.currentTime = start;
      }catch{
        audio.currentTime = 0;
      }
      this.setMusicLevel(0);
      this.activeMusicRunId = runId;
      try{
        await audio.play();
      }catch{
        if(this.activeMusicRunId === runId){
          this.activeMusicRunId = 0;
        }
        return;
      }
      if(runId !== this.celebrationRunId){
        this.stopMusic(runId);
        return;
      }
      this.fadeVolume(0, this.getMusicOutputVolume(), FADE_IN_MS);

      const fadeOutDelay = Math.max(CELEBRATION_MS - FADE_OUT_MS, 0);
      const fadeOutTimer = setTimeout(() => {
        if(runId !== this.celebrationRunId) return;
        const currentLevel = this.musicGainNode ? this.musicGainNode.gain.value : audio.volume;
        this.fadeVolume(currentLevel, 0, FADE_OUT_MS, () => {
          if(runId !== this.celebrationRunId) return;
          audio.pause();
          if(this.activeMusicRunId === runId){
            this.activeMusicRunId = 0;
          }
        });
      }, fadeOutDelay);
      this.celebrationTimers.push(fadeOutTimer);
    }

    celebrate(){
      this.clearCelebrationTimers();
      this.celebrationActive = true;
      const runId = ++this.celebrationRunId;
      const celebrationDelay = this.getCelebrationStartDelay();
      const musicTimer = setTimeout(async () => {
        if(runId !== this.celebrationRunId) return;
        const celebrationConfig = await this.getEffectiveWordCelebrationConfig();
        if(runId !== this.celebrationRunId) return;
        await this.playMusic(runId, celebrationConfig);
        if(runId !== this.celebrationRunId) return;
        this.view.startCelebrationFx(celebrationConfig.fx);
        const nextWordTimer = setTimeout(() => {
          if(runId !== this.celebrationRunId) return;
          this.finishCelebration();
        }, CELEBRATION_MS);
        this.celebrationTimers.push(nextWordTimer);
      }, celebrationDelay);
      this.celebrationTimers.push(musicTimer);
    }

    skipCelebration(){
      if(!this.celebrationActive) return;
      this.finishCelebration();
    }

    finishCelebration(){
      this.celebrationActive = false;
      this.celebrationRunId++;
      this.newWord();
    }

    async renderPicture(entry){
      const requestId = ++this.currentImageRequest;
      return this.view.renderPicture(entry, this.model.settings, this.imageService, requestId, () => this.currentImageRequest);
    }

    waitForVisualUpdate(){
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
    }

    async newWord(){
      this.celebrationRunId++;
      this.celebrationActive = false;
      this.wordReadyForInput = false;
      this.clearCelebrationTimers();
      this.clearAudioFade();
      this.clearWordAnnouncement();
      this.view.stopCelebrationFx();
      this.stopMusic();
      this.view.clearWordAndTypedBar();

      const entry = this.model.pickNextWord();
      const imageResult = await this.renderPicture(entry);
      if(imageResult === "stale" || this.model.currentEntry !== entry) return;
      if(imageResult !== "disabled"){
        await this.waitForVisualUpdate();
        if(imageResult === "stale" || this.model.currentEntry !== entry) return;
      }

      this.view.renderWord(entry, this.model.wordLayout, this.model.settings);
      this.view.renderTypedBar(
        this.model.wordLayout,
        this.model.insertedLetters,
        this.model.currentIndex,
        this.model.settings
      );
      this.wordReadyForInput = true;
      this.scheduleWordAnnouncement(entry.word);
    }
  }

  ns.controller = ns.controller || {};
  ns.controller.GameController = GameController;
})(window.GiocoTastiera);
