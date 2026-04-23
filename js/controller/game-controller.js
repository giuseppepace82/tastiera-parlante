window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const {
    CELEBRATION_MS,
    DEFAULT_LIBRARY,
    FADE_IN_MS,
    FADE_OUT_MS,
    MUSIC_START_DELAY_MS
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
      this.currentImageRequest = 0;

      document.addEventListener("click", this.enableSpeechOnce, { once: true });
      document.addEventListener("keydown", this.enableSpeechOnce, { once: true });
    }

    enableSpeechOnce = () => {
      this.model.speechEnabled = true;
      this.speechService.enable();
    };

    init(){
      this.bindEvents();
      this.view.renderTypedBar(this.model.insertedLetters);
      this.view.applyPictureLayout(this.model.settings);
      this.newWord();
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
        this.view.applyPictureLayout(this.model.settings);
        this.view.closeOverlay(this.view.settingsOverlay);
        this.newWord();
      });

      this.view.resetSettings.addEventListener("click", () => {
        this.model.resetSettings();
        this.view.applyPictureLayout(this.model.settings);
        this.view.fillSettingsEditor(this.model.settings);
      });

      this.view.closeSettings.addEventListener("click", () => {
        this.view.closeOverlay(this.view.settingsOverlay);
      });

      window.addEventListener("keydown", this.onKeyDown);
      window.addEventListener("resize", () => this.view.resizeCanvas());
    }

    onKeyDown = (event) => {
      if(this.view.isSetupOpen()) return;
      if(!this.model.currentEntry || this.model.currentIndex >= this.model.normalizedWord.length) return;

      const pressed = event.key;
      if(!/^[a-zàèéìòù]$/i.test(pressed)) return;

      const base = stripAccents(pressed).toUpperCase();
      this.speechService.speakLetter(base);

      const result = this.model.recordKey(pressed);
      if(!result.accepted) return;

      this.view.renderTypedBar(this.model.insertedLetters);
      this.view.markCorrectLetter(result.currentIndex - 1, result.visibleLetter, result.base);

      if(!result.completed){
        this.view.highlightNextBox(result.currentIndex);
        return;
      }

      this.model.clearInsertedLetters();
      this.view.renderTypedBar(this.model.insertedLetters);
      this.speechService.speakWord(this.model.currentEntry.word);
      this.celebrate();
    };

    clearCelebrationTimers(){
      for(const timer of this.celebrationTimers){
        clearTimeout(timer);
      }
      this.celebrationTimers = [];
    }

    fadeVolume(from, to, duration, done){
      const audio = this.view.audio;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        audio.volume = from + (to - from) * progress;
        if(progress < 1){
          requestAnimationFrame(tick);
          return;
        }
        if(done) done();
      };
      requestAnimationFrame(tick);
    }

    playMusic(){
      const audio = this.view.audio;
      const hasDuration = Number.isFinite(audio.duration) && audio.duration > 0;
      const clipSeconds = hasDuration ? Math.min(CELEBRATION_MS / 1000, audio.duration) : 0;
      const maxStart = hasDuration ? Math.max(audio.duration - clipSeconds, 0) : 0;
      const start = hasDuration ? Math.random() * maxStart : 0;

      audio.pause();
      audio.currentTime = start;
      audio.volume = 0;
      audio.play().catch(() => {});
      this.fadeVolume(0, 1, FADE_IN_MS);

      const fadeOutDelay = Math.max(CELEBRATION_MS - FADE_OUT_MS, 0);
      const fadeOutTimer = setTimeout(() => {
        this.fadeVolume(audio.volume, 0, FADE_OUT_MS, () => {
          audio.pause();
        });
      }, fadeOutDelay);
      this.celebrationTimers.push(fadeOutTimer);
    }

    celebrate(){
      this.clearCelebrationTimers();
      const musicTimer = setTimeout(() => {
        this.playMusic();
        this.view.startCelebrationFx();
      }, MUSIC_START_DELAY_MS);

      const nextWordTimer = setTimeout(() => {
        this.view.stopCelebrationFx();
        this.newWord();
      }, MUSIC_START_DELAY_MS + CELEBRATION_MS);

      this.celebrationTimers.push(musicTimer, nextWordTimer);
    }

    async renderPicture(entry){
      const requestId = ++this.currentImageRequest;
      await this.view.renderPicture(entry, this.model.settings, this.imageService, requestId, () => this.currentImageRequest);
    }

    newWord(){
      this.clearCelebrationTimers();
      this.view.stopCelebrationFx();
      this.view.audio.pause();
      this.view.audio.volume = 0;

      const entry = this.model.pickNextWord();
      this.view.renderTypedBar(this.model.insertedLetters);
      this.view.renderWord(entry);
      this.renderPicture(entry);
      this.speechService.speakWord(entry.word);
    }
  }

  ns.controller = ns.controller || {};
  ns.controller.GameController = GameController;
})(window.GiocoTastiera);
