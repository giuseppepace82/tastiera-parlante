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
      this.deviceMode = this.detectDeviceMode();
      this.deferredInstallPrompt = null;
      this.touchStartCompleted = !this.deviceMode.isTouchPrimary;

      this.setupMusicGain();

      if(!this.deviceMode.isTouchPrimary){
        document.addEventListener("click", this.resumeAudioContextOnce, { once: true });
        document.addEventListener("keydown", this.resumeAudioContextOnce, { once: true });
      }
    }

    enableSpeech = () => {
      this.model.speechEnabled = true;
      this.speechService.enable();
      this.resumeAudioContext();
    };

    resumeAudioContextOnce = () => {
      this.enableSpeech();
    };

    init(){
      this.view.setDeviceMode(this.deviceMode);
      if(this.touchStartCompleted){
        this.enableSpeech();
      }else{
        this.view.showTouchStartGate();
      }
      this.bindEvents();
      this.registerPwa();
      this.applyAudioSettings();
      this.view.applyColorTheme(this.model.settings);
      this.view.applyLetterSize(this.model.settings);
      this.view.applyPictureLayout(this.model.settings);
      this.view.showSettingsTransferStatus("");
      this.newWord();
    }

    detectDeviceMode(){
      const coarsePointer = window.matchMedia ? window.matchMedia("(pointer: coarse)").matches : false;
      const narrowScreen = Math.min(window.innerWidth, window.innerHeight) <= 1024;
      const touchPoints = Number(navigator.maxTouchPoints) || 0;
      const isTouchPrimary = coarsePointer || touchPoints > 0;
      const isTabletLayout = isTouchPrimary || narrowScreen;
      return {
        isTouchPrimary,
        isTabletLayout,
        isPortrait: window.innerHeight > window.innerWidth
      };
    }

    refreshDeviceMode = () => {
      this.deviceMode = this.detectDeviceMode();
      this.view.setDeviceMode(this.deviceMode);
      this.updateGameplayInputAvailability();
      this.view.setInstallAvailability(Boolean(this.deferredInstallPrompt), this.isIosLikeDevice());
    };

    isIosLikeDevice(){
      const platform = `${navigator.platform || ""} ${navigator.userAgent || ""}`.toLowerCase();
      return /iphone|ipad|ipod|mac/.test(platform) && (Number(navigator.maxTouchPoints) || 0) > 0;
    }

    async registerPwa(){
      if("serviceWorker" in navigator){
        navigator.serviceWorker.register("sw.js").catch(() => {});
      }
      this.view.setInstallAvailability(false, this.isIosLikeDevice());
    }

    applySettings(nextSettings, options = {}){
      this.model.updateSettings(nextSettings);
      this.imageService.setCacheEnabled(this.model.settings.enableImageCache === true);
      this.applyAudioSettings();
      this.view.applyColorTheme(this.model.settings);
      this.view.applyLetterSize(this.model.settings);
      this.view.applyPictureLayout(this.model.settings);
      if(options.refreshWord !== false){
        this.newWord();
      }
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
        this.applySettings(importedSettings, { refreshWord: true });
        this.view.fillSettingsEditor(this.model.settings);
        this.view.showSettingsTransferStatus(ns.config.t("ui.settingsTransferSuccessImport"));
      }catch{
        this.view.showSettingsTransferStatus(ns.config.t("ui.settingsTransferErrorImport"));
      }

      if(this.view.importSettingsInput){
        this.view.importSettingsInput.value = "";
      }
    }

    setupMusicGain(){
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if(!AudioContextClass) return;

      try{
        this.audioContext = new AudioContextClass();
        const sourceNode = this.audioContext.createMediaElementSource(this.view.audio);
        this.musicGainNode = this.audioContext.createGain();
        this.musicGainNode.gain.value = 0;
        sourceNode.connect(this.musicGainNode);
        this.musicGainNode.connect(this.audioContext.destination);
        this.view.audio.volume = 1;
      }catch{
        this.audioContext = null;
        this.musicGainNode = null;
      }
    }

    resumeAudioContext(){
      if(this.audioContext && this.audioContext.state === "suspended"){
        this.audioContext.resume().catch(() => {});
      }
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
      this.view.bindGameplayKeyboard(letter => this.onTouchKeyboardPress(letter));
      this.view.bindCelebrationSkip(() => {
        if(this.celebrationActive && this.model.settings.allowCelebrationSkip){
          this.skipCelebration();
        }
      });
      this.view.bindTouchStart(() => this.completeTouchStart());
      this.view.bindInstallPrompt(() => this.promptInstall());

      this.view.setupButton.addEventListener("click", () => {
        const challenge = this.model.prepareChallenge();
        this.view.showChallenge(challenge);
        this.view.openOverlay(this.view.lockOverlay);
        this.updateGameplayInputAvailability();
        this.view.focusChallenge();
      });

      this.view.closeLock.addEventListener("click", () => {
        this.view.closeOverlay(this.view.lockOverlay);
        this.updateGameplayInputAvailability();
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
        this.updateGameplayInputAvailability();
      });

      this.view.saveSettings.addEventListener("click", () => {
        const nextSettings = this.view.readSettingsEditor(createDefaultSettings, sanitizeWords, DEFAULT_LIBRARY);
        this.applySettings(nextSettings, { refreshWord: true });
        this.view.closeOverlay(this.view.settingsOverlay);
        this.updateGameplayInputAvailability();
      });

      this.view.resetSettings.addEventListener("click", () => {
        this.model.resetSettings();
        this.imageService.setCacheEnabled(this.model.settings.enableImageCache === true);
        this.applyAudioSettings();
        this.view.applyColorTheme(this.model.settings);
        this.view.applyLetterSize(this.model.settings);
        this.view.applyPictureLayout(this.model.settings);
        this.view.fillSettingsEditor(this.model.settings);
        this.view.showSettingsTransferStatus("");
      });

      this.view.closeSettings.addEventListener("click", () => {
        this.view.closeOverlay(this.view.settingsOverlay);
        this.updateGameplayInputAvailability();
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
      window.addEventListener("resize", () => {
        this.view.resizeCanvas();
        this.refreshDeviceMode();
      });
      if(window.visualViewport){
        window.visualViewport.addEventListener("resize", this.refreshDeviceMode);
      }
      window.addEventListener("beforeinstallprompt", event => {
        event.preventDefault();
        this.deferredInstallPrompt = event;
        this.view.setInstallAvailability(true, this.isIosLikeDevice());
      });
      window.addEventListener("appinstalled", () => {
        this.deferredInstallPrompt = null;
        this.view.setInstallAvailability(false, this.isIosLikeDevice());
      });
    }

    onCelebrationClick = (event) => {
      if(!this.celebrationActive || this.view.isSetupOpen() || !this.model.settings.allowCelebrationSkip) return;
      event.preventDefault();
      event.stopPropagation();
      this.skipCelebration();
    };

    onKeyDown = (event) => {
      if(
        this.celebrationActive &&
        this.model.settings.allowCelebrationSkip &&
        (event.code === "Space" || event.key === " " || event.key === "Spacebar")
      ){
        event.preventDefault();
        this.skipCelebration();
        return;
      }

      this.handleGameplayInput(event.key, "hardware");
    };

    onTouchKeyboardPress(letter){
      this.handleGameplayInput(letter, "touch");
    }

    handleGameplayInput(rawKey, origin){
      if(this.view.isSetupOpen()) return;
      if(this.celebrationActive) return;
      if(!this.touchStartCompleted && origin === "touch") return;
      if(!this.model.currentEntry || this.model.currentIndex >= this.model.normalizedWord.length) return;

      const pressed = String(rawKey || "");
      if(!/^[a-zàèéìòù]$/i.test(pressed)) return;

      const base = stripAccents(pressed).toUpperCase();
      this.speechService.speakLetter(base);
      this.view.flashKeyboardKey(base, "pressed");

      const result = this.model.recordKey(pressed);
      if(!result.accepted){
        this.view.flashKeyboardKey(base, "wrong");
        return;
      }

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
    }

    completeTouchStart(){
      this.touchStartCompleted = true;
      this.enableSpeech();
      this.view.hideTouchStartGate();
      this.updateGameplayInputAvailability();
      if(this.model.currentEntry){
        this.scheduleWordAnnouncement(this.model.currentEntry.word, 20);
      }
    }

    updateGameplayInputAvailability(){
      const enabled = this.touchStartCompleted && !this.celebrationActive && !this.view.isSetupOpen();
      this.view.setGameplayKeyboardEnabled(enabled);
      this.view.setCelebrationSkipVisible(enabled === false && this.celebrationActive && this.model.settings.allowCelebrationSkip);
    }

    async promptInstall(){
      if(!this.deferredInstallPrompt) return;
      this.deferredInstallPrompt.prompt();
      try{
        await this.deferredInstallPrompt.userChoice;
      }catch{
      }
      this.deferredInstallPrompt = null;
      this.view.setInstallAvailability(false, this.isIosLikeDevice());
    }

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
      if(audio.readyState >= HTMLMediaElement.HAVE_METADATA){
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
        audio.load();
      });
    }

    async playMusic(){
      const audio = this.view.audio;
      await this.waitForAudioReady(audio);

      const hasDuration = Number.isFinite(audio.duration) && audio.duration > 0;
      const clipSeconds = hasDuration ? Math.min(CELEBRATION_MS / 1000, audio.duration) : 0;
      const maxStart = hasDuration ? Math.max(audio.duration - clipSeconds, 0) : 0;
      const start = hasDuration ? Math.random() * maxStart : 0;

      this.resumeAudioContext();
      audio.pause();
      try{
        audio.currentTime = start;
      }catch{
        audio.currentTime = 0;
      }
      this.setMusicLevel(0);
      try{
        await audio.play();
      }catch{
        return;
      }
      this.fadeVolume(0, this.getMusicOutputVolume(), FADE_IN_MS);

      const fadeOutDelay = Math.max(CELEBRATION_MS - FADE_OUT_MS, 0);
      const fadeOutTimer = setTimeout(() => {
        const currentLevel = this.musicGainNode ? this.musicGainNode.gain.value : audio.volume;
        this.fadeVolume(currentLevel, 0, FADE_OUT_MS, () => {
          audio.pause();
        });
      }, fadeOutDelay);
      this.celebrationTimers.push(fadeOutTimer);
    }

    celebrate(){
      this.clearCelebrationTimers();
      this.celebrationActive = true;
      this.updateGameplayInputAvailability();
      const celebrationDelay = this.getCelebrationStartDelay();
      const musicTimer = setTimeout(() => {
        this.playMusic();
        this.view.startCelebrationFx();
      }, celebrationDelay);

      const nextWordTimer = setTimeout(() => {
        this.finishCelebration();
      }, celebrationDelay + CELEBRATION_MS);

      this.celebrationTimers.push(musicTimer, nextWordTimer);
    }

    skipCelebration(){
      if(!this.celebrationActive) return;
      this.finishCelebration();
    }

    finishCelebration(){
      this.celebrationActive = false;
      this.updateGameplayInputAvailability();
      this.newWord();
    }

    async renderPicture(entry){
      const requestId = ++this.currentImageRequest;
      await this.view.renderPicture(entry, this.model.settings, this.imageService, requestId, () => this.currentImageRequest);
    }

    newWord(){
      this.celebrationActive = false;
      this.clearCelebrationTimers();
      this.clearAudioFade();
      this.clearWordAnnouncement();
      this.view.stopCelebrationFx();
      this.view.audio.pause();
      this.setMusicLevel(0);

      const entry = this.model.pickNextWord();
      this.view.renderWord(entry, this.model.wordLayout, this.model.settings);
      this.view.renderTypedBar(
        this.model.wordLayout,
        this.model.insertedLetters,
        this.model.currentIndex,
        this.model.settings
      );
      this.updateGameplayInputAvailability();
      this.renderPicture(entry);
      if(this.touchStartCompleted){
        this.scheduleWordAnnouncement(entry.word);
      }
    }
  }

  ns.controller = ns.controller || {};
  ns.controller.GameController = GameController;
})(window.GiocoTastiera);
