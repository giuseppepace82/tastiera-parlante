window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const { CATEGORY_ORDER, CELEBRATION_MS, getCategoryLabel, getLocale, t } = ns.config;
  const { colorForChar, familyPictureKey, sanitizeWords: sanitizeWordList, stripAccents } = ns.model;

  class GameView {
    constructor(){
      this.wordDiv = document.getElementById("word");
      this.boxDiv = document.getElementById("boxes");
      this.typedDiv = document.getElementById("typed");
      this.audio = document.getElementById("music");
      this.layout = document.querySelector(".layout");
      this.pictureCard = document.getElementById("pictureCard");
      this.pictureTitle = document.getElementById("pictureTitle");
      this.pictureSource = document.getElementById("pictureSource");
      this.pictureSpinner = document.getElementById("pictureSpinner");
      this.pictureFrame = document.getElementById("pictureFrame");
      this.picturePlaceholder = document.getElementById("picturePlaceholder");
      this.pictureImage = document.getElementById("pictureImage");
      this.setupButton = document.getElementById("setupButton");
      this.lockOverlay = document.getElementById("lockOverlay");
      this.settingsOverlay = document.getElementById("settingsOverlay");
      this.challengeLabel = document.getElementById("challengeLabel");
      this.challengeInput = document.getElementById("challengeInput");
      this.challengeHint = document.getElementById("challengeHint");
      this.lockForm = document.getElementById("lockForm");
      this.closeLock = document.getElementById("closeLock");
      this.settingsGrid = document.getElementById("settingsGrid");
      this.showPictureToggle = document.getElementById("showPictureToggle");
      this.picturePositionSide = document.getElementById("picturePositionSide");
      this.picturePositionBottom = document.getElementById("picturePositionBottom");
      this.saveSettings = document.getElementById("saveSettings");
      this.resetSettings = document.getElementById("resetSettings");
      this.closeSettings = document.getElementById("closeSettings");
      this.fxCanvas = document.getElementById("fx");
      this.fxCtx = this.fxCanvas.getContext("2d");
      this.fxState = null;
      this.familyPictureDrafts = {};
      this.familyWordsInput = null;
      this.familyPicturesEditor = null;

      this.buildSettingsEditor();
      this.applyI18n();
      this.resizeCanvas();
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

    buildSettingsEditor(){
      this.settingsGrid.innerHTML = "";
      for(const category of CATEGORY_ORDER){
        const card = document.createElement("section");
        card.className = "settings-card";
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
          `;
        this.settingsGrid.appendChild(card);
      }

      this.familyWordsInput = this.settingsGrid.querySelector('[data-words="famiglia"]');
      this.familyPicturesEditor = this.settingsGrid.querySelector("[data-family-pictures]");
      if(this.familyWordsInput){
        this.familyWordsInput.addEventListener("input", () => this.syncFamilyPicturesEditor());
      }
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

    renderTypedBar(insertedLetters){
      this.typedDiv.innerHTML = "";
      for(const letter of insertedLetters){
        const chip = document.createElement("div");
        chip.className = "typed-chip";
        chip.style.background = colorForChar(stripAccents(letter));
        chip.textContent = letter;
        this.typedDiv.appendChild(chip);
      }
    }

    renderWord(entry){
      const displayWord = entry.word.toUpperCase();
      const normalizedWord = stripAccents(displayWord);
      this.wordDiv.innerHTML = "";
      this.boxDiv.innerHTML = "";

      for(let i = 0; i < displayWord.length; i++){
        const visibleLetter = displayWord[i];
        const normalizedLetter = normalizedWord[i];

        const letter = document.createElement("div");
        letter.className = "letter";
        letter.style.background = colorForChar(normalizedLetter);
        letter.textContent = visibleLetter;
        this.wordDiv.appendChild(letter);

        const box = document.createElement("div");
        box.className = "box";
        if(i === 0) box.classList.add("active");
        this.boxDiv.appendChild(box);
      }
    }

    markCorrectLetter(index, visibleLetter, base){
      const currentBox = this.boxDiv.children[index];
      if(!currentBox) return;
      currentBox.textContent = visibleLetter;
      currentBox.style.background = colorForChar(base);
      currentBox.style.color = "#fff";
      currentBox.classList.remove("active");
    }

    highlightNextBox(index){
      const nextBox = this.boxDiv.children[index];
      if(nextBox) nextBox.classList.add("active");
    }

    setPictureLoading(isLoading){
      this.pictureFrame.classList.toggle("loading", isLoading);
      this.pictureSpinner.classList.toggle("visible", isLoading);
    }

    showPicturePlaceholder(text, source, isLoading = false){
      this.pictureCard.classList.remove("picture-hidden");
      this.setPictureLoading(isLoading);
      this.pictureImage.hidden = true;
      this.pictureImage.removeAttribute("src");
      this.picturePlaceholder.hidden = !text;
      this.picturePlaceholder.textContent = text;
      this.pictureSource.textContent = source || "";
    }

    hidePictureCard(){
      this.pictureCard.classList.add("picture-hidden");
      this.setPictureLoading(false);
      this.picturePlaceholder.hidden = false;
      this.picturePlaceholder.textContent = t("ui.pictureDisabled");
      this.pictureImage.hidden = true;
      this.pictureImage.removeAttribute("src");
      this.pictureSource.textContent = "";
    }

    async renderPicture(entry, settings, imageService, requestId, getRequestId){
      this.pictureTitle.textContent = t("ui.pictureCategoryTitle", { category: getCategoryLabel(entry.category) });
      if(!settings.showPicture){
        this.hidePictureCard();
        return;
      }

      this.showPicturePlaceholder("", t("ui.pictureSearching"), true);

      try{
        const candidates = await imageService.resolveImageCandidates(entry, settings);
        if(requestId !== getRequestId()) return;

        if(!candidates.length){
          this.showPicturePlaceholder(t("ui.pictureNotFound"), t("ui.noImageAvailable"));
          return;
        }

        for(const image of candidates){
          try{
            await imageService.preloadImage(image.src);
            if(requestId !== getRequestId()) return;
            this.pictureCard.classList.remove("picture-hidden");
            this.setPictureLoading(false);
            this.picturePlaceholder.hidden = true;
            this.pictureImage.hidden = false;
            this.pictureImage.alt = t("ui.pictureAlt", { word: entry.word });
            this.pictureImage.src = image.src;
            this.pictureSource.textContent = image.source;
            return;
          }catch{
          }
        }

        this.showPicturePlaceholder(t("ui.pictureNotFound"), t("ui.noFallbackAvailable"));
      }catch{
        if(requestId !== getRequestId()) return;
        this.showPicturePlaceholder(t("ui.pictureUnavailable"), t("ui.connectionError"));
      }
    }

    fillSettingsEditor(settings){
      this.familyPictureDrafts = Object.assign({}, settings.familyPictures || {});
      this.showPictureToggle.checked = settings.showPicture;
      this.picturePositionSide.checked = settings.picturePosition !== "bottom";
      this.picturePositionBottom.checked = settings.picturePosition === "bottom";
      for(const category of CATEGORY_ORDER){
        const enabledInput = this.settingsGrid.querySelector(`[data-enabled="${category}"]`);
        const wordsInput = this.settingsGrid.querySelector(`[data-words="${category}"]`);
        if(enabledInput) enabledInput.checked = settings.enabledCategories[category];
        if(wordsInput) wordsInput.value = settings.categories[category].join(", ");
      }
      this.syncFamilyPicturesEditor();
    }

    readSettingsEditor(defaultSettingsFactory, sanitizeWords, defaultLibrary){
      const next = defaultSettingsFactory();
      next.showPicture = this.showPictureToggle.checked;
      next.picturePosition = this.picturePositionBottom.checked ? "bottom" : "side";

      for(const category of CATEGORY_ORDER){
        const enabledInput = this.settingsGrid.querySelector(`[data-enabled="${category}"]`);
        const wordsInput = this.settingsGrid.querySelector(`[data-words="${category}"]`);
        next.enabledCategories[category] = Boolean(enabledInput && enabledInput.checked);
        next.categories[category] = sanitizeWords(wordsInput ? wordsInput.value : defaultLibrary[category]);
      }

      if(!CATEGORY_ORDER.some(category => next.enabledCategories[category] && next.categories[category].length)){
        next.enabledCategories.famiglia = true;
        next.categories.famiglia = sanitizeWords(defaultLibrary.famiglia);
      }

      next.familyPictures = this.readFamilyPictures(next.categories.famiglia);

      return next;
    }

    openOverlay(overlay){
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
    }

    closeOverlay(overlay){
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
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
        color: colors[index % colors.length]
      }));
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

      this.drawFace(x, y, friend.radius * 0.82, alpha, "#c98b52", "#8a5a31");
    }

    pickCelebrationTheme(){
      const themes = ["balloon", "star", "panda", "bear"];
      return themes[Math.floor(Math.random() * themes.length)];
    }

    startCelebrationFx(){
      this.stopCelebrationFx();
      const theme = this.pickCelebrationTheme();
      this.fxState = {
        start: performance.now(),
        duration: CELEBRATION_MS,
        confetti: this.createConfetti(),
        friends: this.createCelebrationFriends(theme),
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
