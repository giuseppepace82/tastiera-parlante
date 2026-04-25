window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const { LETTER_NAMES_IT, SPEECH_VOLUME_BOOST } = ns.config;
  const { stripAccents } = ns.model;

  class SpeechService {
    constructor(){
      this.speechEnabled = false;
      this.italianVoice = null;
      this.volume = 1;
      this.loadItalianVoice = this.loadItalianVoice.bind(this);
      this.loadItalianVoice();
      speechSynthesis.addEventListener("voiceschanged", this.loadItalianVoice);
    }

    enable(){
      this.speechEnabled = true;
    }

    setVolume(volume){
      const parsed = Number(volume);
      this.volume = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 1;
    }

    loadItalianVoice(){
      const voices = speechSynthesis.getVoices();
      const italianVoices = voices.filter(voice => /^it([-_]|$)/i.test(voice.lang));
      const preferredNames = [
        "neural",
        "natural",
        "premium",
        "enhanced",
        "google",
        "microsoft",
        "alice",
        "elsa",
        "isabella",
        "luca",
        "cosimo",
        "fabiola",
        "italiano"
      ];

      const scored = italianVoices
        .map(voice => {
          const name = voice.name.toLowerCase();
          let score = 0;
          if(/^it-it$/i.test(voice.lang)) score += 5;
          if(voice.default) score += 2;
          if(voice.localService) score += 1;
          for(const keyword of preferredNames){
            if(name.includes(keyword)) score += 3;
          }
          return { voice, score };
        })
        .sort((a, b) => b.score - a.score);

      this.italianVoice = scored.length ? scored[0].voice : null;
    }

    speak(text, options = {}){
      if(!this.speechEnabled) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || "it-IT";
      if(this.italianVoice) utterance.voice = this.italianVoice;
      const requestedVolume = Number(options.volume ?? this.volume);
      const boostedVolume = requestedVolume * SPEECH_VOLUME_BOOST;
      utterance.volume = Math.min(Math.max(boostedVolume, 0), 1);
      utterance.rate = options.rate ?? 0.72;
      utterance.pitch = options.pitch ?? 0.95;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }

    speakLetter(letter){
      const text = LETTER_NAMES_IT[letter] || LETTER_NAMES_IT[stripAccents(letter)] || letter.toLowerCase();
      this.speak(`${text} .`, { rate: 0.62, pitch: 0.92 });
    }

    speakWord(word){
      this.speak(`${word} .`, { rate: 0.58, pitch: 0.93 });
    }
  }

  ns.services = ns.services || {};
  ns.services.SpeechService = SpeechService;
})(window.GiocoTastiera);
