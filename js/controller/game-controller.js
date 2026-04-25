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
      this.speechService = new SpeechService();
      this.celebrationTimers = [];
      this.celebrationActive = false;
      this.currentImageRequest = 0;
      this.audioFadeFrame = 0;
      this.wordAnnouncementTimer = 0;
      this.audioContext = null;
      this.musicGainNode = null;

      this.setupMusicGain();

      document.addEventListener("click", this.resumeAudioContextOnce, { once: true });
      document.addEventListener("keydown", this.resumeAudioContextOnce, { once: true });
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
      this.enableSpeech();
      this.bindEvents();
      this.applyAudioSettings();
      this.view.applyLetterSize(this.model.settings);
      this.view.renderTypedBar(this.model.insertedLetters);
      this.view.applyPictureLayout(this.model.settings);
      this.newWord();
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
        this.view.openOverlay(this.view.settingsOverlay);
      });

      this.view.saveSettings.addEventListener("click", () => {
        const nextSettings = this.view.readSettingsEditor(createDefaultSettings, sanitizeWords, DEFAULT_LIBRARY);
        this.model.updateSettings(nextSettings);
        this.applyAudioSettings();
        this.view.applyLetterSize(this.model.settings);
        this.view.applyPictureLayout(this.model.settings);
        this.view.closeOverlay(this.view.settingsOverlay);
        this.newWord();
      });

      this.view.resetSettings.addEventListener("click", () => {
        this.model.resetSettings();
        this.applyAudioSettings();
        this.view.applyLetterSize(this.model.settings);
        this.view.applyPictureLayout(this.model.settings);
        this.view.fillSettingsEditor(this.model.settings);
      });

      this.view.closeSettings.addEventListener("click", () => {
        this.view.closeOverlay(this.view.settingsOverlay);
      });

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
      if(!this.model.currentEntry || this.model.currentIndex >= this.model.normalizedWord.length) return;

      const pressed = event.key;
      if(!/^[a-zàèéìòù]$/i.test(pressed)) return;

      const base = stripAccents(pressed).toUpperCase();
      this.speechService.speakLetter(base);

      const result = this.model.recordKey(pressed);
      if(!result.accepted) return;

      this.view.renderTypedBar(this.model.insertedLetters);
      this.view.markCorrectLetter(result.currentIndex - 1, result.visibleLetter, result.base, this.model.settings);

      if(!result.completed){
        this.view.highlightNextBox(result.currentIndex, this.model.settings);
        return;
      }

      this.model.clearInsertedLetters();
      this.view.renderTypedBar(this.model.insertedLetters);
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

    playMusic(){
      const audio = this.view.audio;
      const hasDuration = Number.isFinite(audio.duration) && audio.duration > 0;
      const clipSeconds = hasDuration ? Math.min(CELEBRATION_MS / 1000, audio.duration) : 0;
      const maxStart = hasDuration ? Math.max(audio.duration - clipSeconds, 0) : 0;
      const start = hasDuration ? Math.random() * maxStart : 0;

      this.resumeAudioContext();
      audio.pause();
      audio.currentTime = start;
      this.setMusicLevel(0);
      audio.play().catch(() => {});
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
      this.view.renderTypedBar(this.model.insertedLetters);
      this.view.renderWord(entry, this.model.settings);
      this.renderPicture(entry);
      this.scheduleWordAnnouncement(entry.word);
    }
  }

  ns.controller = ns.controller || {};
  ns.controller.GameController = GameController;
})(window.GiocoTastiera);
