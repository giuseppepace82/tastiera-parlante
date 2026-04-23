window.GiocoTastiera = window.GiocoTastiera || {};

(function(ns){
  const {
    CATEGORY_LABELS,
    ARASAAC_IMAGE_SIZE,
    FAMILY_FALLBACK_IMAGE,
    IMAGE_QUERY_MAP,
    MAX_REMOTE_IMAGE_CANDIDATES
  } = ns.config;
  const { familyPictureKey, slugify, stripAccents } = ns.model;

  class ImageService {
    constructor(){
      this.imageCache = new Map();
    }

    normalizeUrl(url){
      if(!url) return "";
      return url.startsWith("//") ? `https:${url}` : url;
    }

    buildArasaacImageUrl(id){
      return `https://static.arasaac.org/pictograms/${id}/${id}_${ARASAAC_IMAGE_SIZE}.png`;
    }

    normalizeSearchTerm(entry){
      const searchKey = slugify(entry.word).replace(/-/g, "");
      return (IMAGE_QUERY_MAP[entry.category] && IMAGE_QUERY_MAP[entry.category][searchKey]) || entry.word;
    }

    buildSearchTerms(entry){
      const baseTerm = this.normalizeSearchTerm(entry);
      const categoryLabel = (CATEGORY_LABELS[entry.category] || entry.category).toLowerCase();
      const terms = [
        baseTerm,
        baseTerm.includes(categoryLabel) ? "" : `${baseTerm} ${categoryLabel}`
      ];

      return [...new Set(terms.map(value => value.trim()).filter(Boolean))];
    }

    buildArasaacCandidates(items, searchTerm){
      return items
        .slice(0, MAX_REMOTE_IMAGE_CANDIDATES)
        .map(item => ({
          src: this.buildArasaacImageUrl(item._id),
          source: `PITTOGRAMMA • ARASAAC • ${searchTerm.toUpperCase()} • ID ${item._id}`,
          sourceKind: "arasaac"
        }));
    }

    async fetchArasaacImages(entry){
      const searchTerms = this.buildSearchTerms(entry);

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

    async fetchWikipediaImages(entry){
      const searchTerms = this.buildSearchTerms(entry);

      for(const searchTerm of searchTerms){
        const searchEndpoint = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srlimit=5&format=json&origin=*`;
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
            source: `WEB • WIKIPEDIA • ${page.title.toUpperCase()} • ${resolvedPage.original.width}×${resolvedPage.original.height}`,
            sourceKind: "wikimedia"
          });

          if(candidates.length >= MAX_REMOTE_IMAGE_CANDIDATES) break;
        }

        if(candidates.length){
          return candidates;
        }
      }

      return [];
    }

    async fetchRealtimeImage(entry){
      const cacheKey = `${entry.category}:${entry.word}`;
      if(this.imageCache.has(cacheKey)) return this.imageCache.get(cacheKey);

      const candidates = [];
      try{
        candidates.push(...await this.fetchArasaacImages(entry));
      }catch{
      }

      try{
        candidates.push(...await this.fetchWikipediaImages(entry));
      }catch{
      }

      const deduped = [];
      const seen = new Set();
      for(const candidate of candidates){
        if(!candidate || !candidate.src || seen.has(candidate.src)) continue;
        seen.add(candidate.src);
        deduped.push(candidate);
      }

      this.imageCache.set(cacheKey, deduped);
      return deduped;
    }

    async resolveImageCandidates(entry, settings){
      if(entry.category === "famiglia"){
        const key = familyPictureKey(entry.word);
        const localPhoto = settings && settings.familyPictures ? settings.familyPictures[key] : "";
        const candidates = [];

        if(localPhoto){
          candidates.push({ src: localPhoto, source: "FOTO LOCALE • FAMIGLIA", sourceKind: "local" });
        }

        candidates.push({ src: FAMILY_FALLBACK_IMAGE, source: "SVG GENERICO • FAMIGLIA", sourceKind: "fallback" });
        return candidates;
      }
      return this.fetchRealtimeImage(entry);
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
