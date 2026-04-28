window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const {
    ARASAAC_IMAGE_SIZE,
    DEFAULT_IMAGE_PICKER_SOURCES,
    IMAGE_CACHE_STORAGE_KEY,
    FAMILY_FALLBACK_IMAGE,
    IMAGE_QUERY_MAP,
    MAX_PERSISTED_IMAGE_CACHE_ENTRIES,
    MAX_REMOTE_IMAGE_CANDIDATES,
    getCategoryLabel,
    t
  } = ns.config;
  const { familyPictureKey, slugify, stripAccents, wordImageKey } = ns.model;

  class ImageService {
    constructor(){
      this.imageCache = new Map();
      this.cacheEnabled = false;
    }

    static get QUERY_STOP_WORDS(){
      return new Set([
        "a", "ad", "al", "alla", "alle", "allo", "ai", "agli",
        "con", "col", "coi",
        "da", "dal", "dalla", "dalle", "dallo", "dai", "dagli",
        "de", "del", "della", "delle", "dello", "dei", "degli",
        "di",
        "e", "ed",
        "il", "lo", "la", "i", "gli", "le",
        "in", "nel", "nella", "nelle", "nello", "nei", "negli",
        "o", "od",
        "per",
        "su", "sul", "sulla", "sulle", "sullo", "sui", "sugli",
        "tra", "fra",
        "un", "uno", "una"
      ]);
    }

    normalizeUrl(url){
      if(!url) return "";
      return url.startsWith("//") ? `https:${url}` : url;
    }

    sanitizeCandidates(candidates){
      return (Array.isArray(candidates) ? candidates : [])
        .filter(candidate => candidate && typeof candidate.src === "string" && candidate.src)
        .map(candidate => ({
          src: candidate.src,
          source: typeof candidate.source === "string" ? candidate.source : "",
          sourceKind: typeof candidate.sourceKind === "string" ? candidate.sourceKind : ""
        }));
    }

    readPersistedCache(){
      if(!this.cacheEnabled) return {};

      try{
        const raw = JSON.parse(localStorage.getItem(IMAGE_CACHE_STORAGE_KEY));
        return raw && typeof raw === "object" ? raw : {};
      }catch{
        return {};
      }
    }

    writePersistedCache(store){
      if(!this.cacheEnabled) return;

      try{
        localStorage.setItem(IMAGE_CACHE_STORAGE_KEY, JSON.stringify(store));
      }catch{
      }
    }

    setCacheEnabled(enabled){
      this.cacheEnabled = enabled === true;
      this.imageCache.clear();

      if(!this.cacheEnabled){
        try{
          localStorage.removeItem(IMAGE_CACHE_STORAGE_KEY);
        }catch{
        }
        return;
      }

      const persisted = this.readPersistedCache();
      for(const [key, value] of Object.entries(persisted)){
        if(value && Array.isArray(value.candidates)){
          this.imageCache.set(key, this.sanitizeCandidates(value.candidates));
        }
      }
    }

    normalizeSelectedSources(sourceIds){
      const allowed = new Set(["arasaac", "wikipedia", "wikimedia"]);
      const base = Array.isArray(sourceIds) ? sourceIds : DEFAULT_IMAGE_PICKER_SOURCES;
      return [...new Set(
        base
          .map(sourceId => String(sourceId || "").trim().toLowerCase())
          .filter(sourceId => allowed.has(sourceId))
      )];
    }

    persistImageCacheEntry(cacheKey, candidates){
      if(!this.cacheEnabled) return;

      const store = this.readPersistedCache();
      store[cacheKey] = {
        updatedAt: Date.now(),
        candidates: this.sanitizeCandidates(candidates)
      };

      const orderedKeys = Object.keys(store).sort((left, right) => {
        const leftTs = Number(store[left] && store[left].updatedAt) || 0;
        const rightTs = Number(store[right] && store[right].updatedAt) || 0;
        return rightTs - leftTs;
      });

      for(const key of orderedKeys.slice(MAX_PERSISTED_IMAGE_CACHE_ENTRIES)){
        delete store[key];
      }

      this.writePersistedCache(store);
    }

    buildArasaacImageUrl(id){
      return `https://static.arasaac.org/pictograms/${id}/${id}_${ARASAAC_IMAGE_SIZE}.png`;
    }

    normalizeSearchTerm(entry, searchQuery = ""){
      const customQuery = String(searchQuery || "").trim();
      if(customQuery){
        return customQuery;
      }

      const searchKey = slugify(entry.word).replace(/-/g, "");
      return (IMAGE_QUERY_MAP[entry.category] && IMAGE_QUERY_MAP[entry.category][searchKey]) || entry.word;
    }

    getDefaultSearchQuery(entry){
      return this.normalizeSearchTerm(entry);
    }

    buildSearchVariants(baseTerm){
      const cleaned = String(baseTerm || "")
        .trim()
        .replace(/\s+/g, " ");
      if(!cleaned) return [];

      const normalized = stripAccents(cleaned)
        .toLowerCase()
        .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

      const normalizedTokens = normalized ? normalized.split(" ").filter(Boolean) : [];
      const originalTokens = cleaned.split(" ").filter(Boolean);
      const meaningfulOriginalTokens = originalTokens.filter((token, index) => {
        const normalizedToken = normalizedTokens[index];
        return normalizedToken && !ImageService.QUERY_STOP_WORDS.has(normalizedToken);
      });

      const variants = [
        cleaned,
        meaningfulOriginalTokens.join(" "),
        originalTokens.join(" "),
        meaningfulOriginalTokens.slice(0, 2).join(" "),
        ...meaningfulOriginalTokens,
        ...originalTokens
      ];

      return [...new Set(
        variants
          .map(value => String(value || "").trim().replace(/\s+/g, " "))
          .filter(Boolean)
      )];
    }

    buildSearchTerms(entry, searchQuery = ""){
      const baseTerm = this.normalizeSearchTerm(entry, searchQuery);
      const categoryLabel = String(entry.categoryLabel || getCategoryLabel(entry.category) || "").toLowerCase();
      const variants = this.buildSearchVariants(baseTerm);
      const terms = [];

      for(const variant of variants){
        terms.push(variant);
        if(categoryLabel){
          const variantLower = stripAccents(variant).toLowerCase();
          const categoryLower = stripAccents(categoryLabel).toLowerCase();
          if(!variantLower.includes(categoryLower)){
            terms.push(`${variant} ${categoryLabel}`);
          }
        }
      }

      return [...new Set(terms.map(value => value.trim()).filter(Boolean))];
    }

    buildArasaacCandidates(items, searchTerm){
      return items
        .map(item => ({
          src: this.buildArasaacImageUrl(item._id),
          source: t("ui.imageSourceArasaac", { term: searchTerm.toUpperCase(), id: item._id }),
          sourceKind: "arasaac"
        }));
    }

    async fetchArasaacImages(entry, searchQuery = ""){
      const searchTerms = this.buildSearchTerms(entry, searchQuery);

      for(const searchTerm of searchTerms){
        const endpoint = `https://api.arasaac.org/api/pictograms/it/search/${encodeURIComponent(searchTerm)}`;
        const response = await fetch(endpoint);
        if(!response.ok){
          continue;
        }

        const payload = await response.json();
        const items = Array.isArray(payload) ? payload : [];
        if(items.length){
          return this.buildArasaacCandidates(items, searchTerm);
        }
      }

      return [];
    }

    async fetchWikipediaImages(entry, searchQuery = ""){
      const searchTerms = this.buildSearchTerms(entry, searchQuery);

      for(const searchTerm of searchTerms){
        const searchEndpoint = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srlimit=18&format=json&origin=*`;
        const searchResponse = await fetch(searchEndpoint);
        if(!searchResponse.ok){
          continue;
        }

        const searchPayload = await searchResponse.json();
        const pages = searchPayload.query && searchPayload.query.search ? searchPayload.query.search : [];
        const candidates = [];

        for(const page of pages){
          const imageEndpoint = `https://it.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=original|name&titles=${encodeURIComponent(page.title)}&format=json&origin=*`;
          const imageResponse = await fetch(imageEndpoint);
          if(!imageResponse.ok) continue;

          const imagePayload = await imageResponse.json();
          const resolvedPage = Object.values(imagePayload.query && imagePayload.query.pages ? imagePayload.query.pages : {})
            .find(item => item.original && item.original.source);
          if(!resolvedPage) continue;

          candidates.push({
            src: this.normalizeUrl(resolvedPage.original.source),
            source: t("ui.imageSourceWikipedia", {
              title: page.title.toUpperCase(),
              width: resolvedPage.original.width,
              height: resolvedPage.original.height
            }),
            sourceKind: "wikipedia"
          });
        }

        if(candidates.length){
          return candidates;
        }
      }

      return [];
    }

    async fetchWikimediaCommonsImages(entry, searchQuery = ""){
      const searchTerms = this.buildSearchTerms(entry, searchQuery);

      for(const searchTerm of searchTerms){
        const searchEndpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrnamespace=6&gsrlimit=18&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
        const searchResponse = await fetch(searchEndpoint);
        if(!searchResponse.ok){
          continue;
        }

        const searchPayload = await searchResponse.json();
        const pages = Object.values(searchPayload.query && searchPayload.query.pages ? searchPayload.query.pages : {});
        const candidates = [];

        for(const page of pages){
          const imageInfo = Array.isArray(page.imageinfo) ? page.imageinfo[0] : null;
          const src = this.normalizeUrl(
            (imageInfo && (imageInfo.thumburl || imageInfo.url)) || ""
          );
          if(!src) continue;

          candidates.push({
            src,
            source: t("ui.imageSourceWikimedia", {
              title: String(page.title || "").replace(/^File:/i, "").toUpperCase()
            }),
            sourceKind: "wikimedia"
          });
        }

        if(candidates.length){
          return candidates;
        }
      }

      return [];
    }

    async fetchRealtimeImage(entry, searchQuery = "", sourceIds = DEFAULT_IMAGE_PICKER_SOURCES){
      const selectedSources = this.normalizeSelectedSources(sourceIds);
      const cacheKey = `${entry.category}:${entry.word}:${String(searchQuery || "").trim().toLowerCase() || "__default__"}:${selectedSources.join(",") || "__none__"}`;
      if(this.cacheEnabled && this.imageCache.has(cacheKey)) return this.imageCache.get(cacheKey);

      const candidates = [];

      if(selectedSources.includes("arasaac")){
        try{
          candidates.push(...await this.fetchArasaacImages(entry, searchQuery));
        }catch{
        }
      }

      if(selectedSources.includes("wikipedia")){
        try{
          candidates.push(...await this.fetchWikipediaImages(entry, searchQuery));
        }catch{
        }
      }

      if(selectedSources.includes("wikimedia")){
        try{
          candidates.push(...await this.fetchWikimediaCommonsImages(entry, searchQuery));
        }catch{
        }
      }

      const deduped = [];
      const seen = new Set();
      for(const candidate of candidates){
        if(!candidate || !candidate.src || seen.has(candidate.src)) continue;
        seen.add(candidate.src);
        deduped.push(candidate);
      }

      if(this.cacheEnabled){
        this.imageCache.set(cacheKey, deduped);
        this.persistImageCacheEntry(cacheKey, deduped);
      }
      return deduped;
    }

    async fetchRealtimeImagePage(entry, page = 0, searchQuery = "", sourceIds = DEFAULT_IMAGE_PICKER_SOURCES){
      const selectedSources = this.normalizeSelectedSources(sourceIds);
      const catalog = await this.fetchRealtimeImage(entry, searchQuery, selectedSources);
      const safePage = Math.max(Number(page) || 0, 0);
      const start = safePage * MAX_REMOTE_IMAGE_CANDIDATES;
      const end = start + MAX_REMOTE_IMAGE_CANDIDATES;
      return {
        candidates: catalog.slice(start, end),
        hasPrevious: safePage > 0,
        hasNext: end < catalog.length,
        page: safePage,
        notice: ""
      };
    }

    async resolveImageCandidates(entry, settings){
      if(entry.category === "famiglia"){
        const key = familyPictureKey(entry.word);
        const localPhoto = settings && settings.familyPictures ? settings.familyPictures[key] : "";
        const candidates = [];

        if(localPhoto){
          candidates.push({ src: localPhoto, source: t("ui.imageSourceLocalFamily"), sourceKind: "local" });
        }

        candidates.push({ src: FAMILY_FALLBACK_IMAGE, source: t("ui.imageSourceFallbackFamily"), sourceKind: "fallback" });
        return candidates;
      }

      const preferredKey = wordImageKey(entry.category, entry.word);
      const preferredOverride = settings && settings.wordOverrides ? settings.wordOverrides[preferredKey] : null;
      const preferredImage = preferredOverride && preferredOverride.image ? preferredOverride.image : null;
      const candidates = await this.fetchRealtimeImage(entry);
      if(!preferredImage || !preferredImage.src){
        return candidates;
      }

      const prioritized = [{
        src: preferredImage.src,
        source: t("ui.imageSourcePreferred", { source: preferredImage.source || t("ui.wordImageSelected") }),
        sourceKind: preferredImage.sourceKind || "preferred",
        zoomPercent: preferredImage.zoomPercent
      }];

      for(const candidate of candidates){
        if(candidate && candidate.src && candidate.src !== preferredImage.src){
          prioritized.push(candidate);
        }
      }

      return prioritized;
    }

    preloadImage(src){
      return new Promise((resolve, reject) => {
        const probe = new Image();
        probe.onload = () => resolve(src);
        probe.onerror = () => reject(new Error("image-error"));
        probe.src = src;
      });
    }
  }

  ns.services = ns.services || {};
  ns.services.ImageService = ImageService;
})(window.GiocoTastiera);
