window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const {
    CATEGORY_ORDER,
    CELEBRATION_MS,
    CELEBRATION_DELAY_STEP_MS,
    COLOR_THEMES,
    DEFAULT_COLOR_THEME,
    DEFAULT_IMAGE_PICKER_SOURCES,
    DEFAULT_LETTER_SIZE_PERCENT,
    DEFAULT_PICTURE_ZOOM_PERCENT,
    LETTER_SIZE_STEP_PERCENT,
    MAX_CELEBRATION_DELAY_MS,
    MAX_LETTER_SIZE_PERCENT,
    MAX_PICTURE_ZOOM_PERCENT,
    MAX_VOLUME_PERCENT,
    MIN_LETTER_SIZE_PERCENT,
    MIN_PICTURE_ZOOM_PERCENT,
    MIN_CELEBRATION_DELAY_MS,
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
      this.picturePlaceholder = document.getElementById("picturePlaceholder");
      this.pictureImage = document.getElementById("pictureImage");
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
      this.colorThemeInputs = Array.from(document.querySelectorAll('input[name="colorTheme"]'));
      this.letterSizeRange = document.getElementById("letterSizeRange");
      this.letterSizeValue = document.getElementById("letterSizeValue");
      this.speechVolumeRange = document.getElementById("speechVolumeRange");
      this.speechVolumeValue = document.getElementById("speechVolumeValue");
      this.celebrationMusicVolumeRange = document.getElementById("celebrationMusicVolumeRange");
      this.celebrationMusicVolumeValue = document.getElementById("celebrationMusicVolumeValue");
      this.celebrationDelayRange = document.getElementById("celebrationDelayRange");
      this.celebrationDelayValue = document.getElementById("celebrationDelayValue");
      this.picturePositionSide = document.getElementById("picturePositionSide");
      this.picturePositionBottom = document.getElementById("picturePositionBottom");
      this.customCategoryNameInput = document.getElementById("customCategoryNameInput");
      this.addCategoryButton = document.getElementById("addCategoryButton");
      this.exportSettingsButton = document.getElementById("exportSettingsButton");
      this.importSettingsButton = document.getElementById("importSettingsButton");
      this.importSettingsInput = document.getElementById("importSettingsInput");
      this.settingsTransferStatus = document.getElementById("settingsTransferStatus");
      this.saveSettings = document.getElementById("saveSettings");
      this.resetSettings = document.getElementById("resetSettings");
      this.closeSettings = document.getElementById("closeSettings");
      this.fxCanvas = document.getElementById("fx");
      this.fxCtx = this.fxCanvas.getContext("2d");
      this.fxState = null;
      this.familyPictureDrafts = {};
      this.preferredWordImagesDraft = {};
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

      this.buildSettingsEditor();
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
      const current = this.preferredWordImagesDraft[key];
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

        if(target.matches("[data-word-image-zoom]")){
          this.updateWordImageZoom(target);
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
          const existing = this.preferredWordImagesDraft[key];
          this.preferredWordImagesDraft[key] = {
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
        const existing = this.preferredWordImagesDraft[key];
        this.preferredWordImagesDraft[key] = {
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
      delete this.preferredWordImagesDraft[wordImageKey(category, word)];
      this.refreshWordImageEditors();
    }

    renderWordImagesEditor(category, categoryLabel, words){
      const editor = this.settingsGrid.querySelector(`[data-word-images="${category}"]`);
      if(!editor) return;

      editor.innerHTML = "";
      if(category === "famiglia") return;

      for(const word of words){
        const key = wordImageKey(category, word);
        const selected = this.preferredWordImagesDraft[key];

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

        row.append(name, actions, status);

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
          row.appendChild(zoomControl);
        }

        editor.appendChild(row);
      }
    }

    refreshWordImageEditors(){
      for(const category of CATEGORY_ORDER){
        const wordsInput = this.settingsGrid.querySelector(`[data-words="${category}"]`);
        this.renderWordImagesEditor(category, getCategoryLabel(category), sanitizeWordList(wordsInput ? wordsInput.value : []));
      }

      for(const card of this.settingsGrid.querySelectorAll("[data-custom-category]")){
        const categoryId = card.dataset.customId;
        const labelInput = card.querySelector(`[data-custom-label="${categoryId}"]`);
        const wordsInput = card.querySelector(`[data-custom-words="${categoryId}"]`);
        this.renderWordImagesEditor(
          categoryId,
          labelInput ? labelInput.value.trim() : "",
          sanitizeWordList(wordsInput ? wordsInput.value : [])
        );
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
      for(const key of Object.keys(this.preferredWordImagesDraft)){
        if(key.startsWith(`${id.toLowerCase()}:`)){
          delete this.preferredWordImagesDraft[key];
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

      if(!enabled) return;

      const nextLetter = this.wordDiv.querySelector(`[data-playable-index="${index}"]`);
      const nextBox = this.typedDiv.querySelector(`[data-playable-index="${index}"]`);
      if(nextLetter) nextLetter.classList.add("expected");
      if(nextBox) nextBox.classList.add("expected");
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

    showPicturePlaceholder(text, source, isLoading = false){
      this.pictureCard.classList.remove("picture-hidden");
      this.setPictureLoading(isLoading);
      this.pictureImage.hidden = true;
      this.pictureImage.removeAttribute("src");
      this.pictureImage.style.transform = "scale(1)";
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
      this.pictureImage.style.transform = "scale(1)";
      this.pictureSource.textContent = "";
    }

    async renderPicture(entry, settings, imageService, requestId, getRequestId){
      this.pictureTitle.textContent = t("ui.pictureCategoryTitle", { category: entry.categoryLabel || getCategoryLabel(entry.category) });
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
            this.pictureImage.alt = t("ui.pictureAlt", { word: entry.word });
            this.pictureImage.src = image.src;
            const zoomPercent = Number.isFinite(Number(image.zoomPercent))
              ? Number(image.zoomPercent)
              : DEFAULT_PICTURE_ZOOM_PERCENT;
            this.pictureImage.style.transform = `scale(${zoomPercent / 100})`;
            this.pictureSource.textContent = image.source;
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
      this.familyPictureDrafts = Object.assign({}, settings.familyPictures || {});
      this.preferredWordImagesDraft = Object.fromEntries(
        Object.entries(settings.preferredWordImages || {}).map(([key, value]) => [key, Object.assign({}, value)])
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
      for(const input of this.colorThemeInputs){
        input.checked = input.value === (settings.colorTheme || DEFAULT_COLOR_THEME);
      }
      this.letterSizeRange.value = this.letterSizeToSlider(settings.letterSizePercent);
      this.speechVolumeRange.value = this.volumeToSlider(settings.speechVolume);
      this.celebrationMusicVolumeRange.value = this.volumeToSlider(settings.celebrationMusicVolume);
      this.celebrationDelayRange.value = this.delayToSlider(settings.celebrationStartDelayMs);
      this.updatePercentLabel(this.letterSizeRange, this.letterSizeValue);
      this.updateVolumeLabel(this.speechVolumeRange, this.speechVolumeValue);
      this.updateVolumeLabel(this.celebrationMusicVolumeRange, this.celebrationMusicVolumeValue);
      this.updateDelayLabel(this.celebrationDelayRange, this.celebrationDelayValue);
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
      const selectedColorTheme = this.colorThemeInputs.find(input => input.checked);
      next.colorTheme = selectedColorTheme && COLOR_THEMES[selectedColorTheme.value]
        ? selectedColorTheme.value
        : DEFAULT_COLOR_THEME;
      next.letterSizePercent = this.sliderToLetterSize(this.letterSizeRange, next.letterSizePercent);
      next.speechVolume = this.sliderToVolume(this.speechVolumeRange, next.speechVolume);
      next.celebrationMusicVolume = this.sliderToVolume(this.celebrationMusicVolumeRange, next.celebrationMusicVolume);
      next.celebrationStartDelayMs = this.sliderToDelay(this.celebrationDelayRange, next.celebrationStartDelayMs);
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
      next.preferredWordImages = {};

      for(const category of CATEGORY_ORDER){
        if(category === "famiglia") continue;
        for(const word of next.categories[category]){
          const key = wordImageKey(category, word);
          if(this.preferredWordImagesDraft[key]){
            next.preferredWordImages[key] = Object.assign({}, this.preferredWordImagesDraft[key]);
          }
        }
      }

      for(const category of next.customCategories){
        for(const word of category.words){
          const key = wordImageKey(category.id, word);
          if(this.preferredWordImagesDraft[key]){
            next.preferredWordImages[key] = Object.assign({}, this.preferredWordImagesDraft[key]);
          }
        }
      }

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
