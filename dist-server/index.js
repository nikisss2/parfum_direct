// server/index.ts
import express from "express";
import compression from "compression";
import path4 from "path";
import fs4 from "fs";
import { fileURLToPath as fileURLToPath4 } from "url";
import { createHash } from "crypto";

// server/catalogStore.ts
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/imageResolver.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var ROOT = path.resolve(__dirname, "..");
var PUBLIC = path.join(ROOT, "public");
var PLACEHOLDER_IMAGE = "/assets/placeholder-product.svg";
function isGenericStock(url) {
  return !url || url.includes("unsplash.com") || url.includes("placeholder-product") || url.endsWith("/assets/placeholder-product.svg");
}
function cleanTitle(str) {
  return str.replace(/\[[^\]]*(?:аналог|мотив)[^\]]*\]/gi, "").replace(/\([^\)]*(?:аналог|мотив)[^\)]*\)/gi, "");
}
function normalizeHaystack(p) {
  const cleaned = `${p.brand} ${cleanTitle(p.name)}`;
  return cleaned.toLowerCase().replace(/ё/g, "\u0435").replace(/[^a-zа-я0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
}
function localIfExists(relative) {
  const clean = relative.startsWith("/") ? relative.slice(1) : relative;
  const full = path.join(PUBLIC, clean);
  return fs.existsSync(full) ? `/${clean}` : null;
}
var PRODUCT_RULES = [
  // === TOM FORD ===
  { must: ["tom ford", "black orchid"], file: "tom-ford-black-orchid.jpg" },
  { must: ["tom ford", "lost cherry"], file: "tom-ford-lost-cherry.jpg" },
  { must: ["tom ford", "tobacco vanille"], file: "tom-ford-tobacco-vanille.jpg" },
  { must: ["tom ford", "oud wood"], file: "tom-ford-oud-wood.jpg" },
  { must: ["tom ford", "tuscan leather"], file: "tom-ford-tuscan-leather.jpg" },
  { must: ["tom ford", "ombre leather"], file: "tom-ford-ombre-leather.jpg" },
  { must: ["tom ford", "bitter peach"], file: "tom-ford-bitter-peach.jpg" },
  { must: ["tom ford", "soleil blanc"], file: "tom-ford-soleil-blanc.jpg" },
  { must: ["tom ford", "neroli portofino"], file: "tom-ford-neroli-portofino.jpg" },
  { must: ["tom ford", "beau de jour"], file: "tom-ford-beau-de-jour.jpg" },
  { must: ["tom ford", "ebene fume"], file: "tom-ford-ebene-fume.jpg" },
  { must: ["tom ford", "rose prick"], file: "tom-ford-rose-prick.jpg" },
  { must: ["tom ford", "fabulous"], file: "tom-ford-fucking-fabulous.jpg" },
  { must: ["tom ford", "grey vetiver"], file: "tom-ford-grey-vetiver.jpg" },
  { must: ["tom ford", "noir extreme"], file: "tom-ford-noir-extreme.jpg" },
  // === VERSACE ===
  { must: ["versace", "flame"], file: "versace-eros-flame.jpg" },
  { must: ["versace", "eros"], exclude: ["flame"], file: "versace-eros.jpg" },
  { must: ["versace", "dylan blue"], file: "versace-dylan-blue.jpg" },
  { must: ["versace", "bright crystal"], file: "versace-bright-crystal.jpg" },
  { must: ["versace", "crystal noir"], file: "versace-crystal-noir.jpg" },
  { must: ["versace", "eau fraiche"], file: "versace-man-eau-fraiche.jpg" },
  { must: ["versace", "pour homme"], exclude: ["dylan"], file: "versace-pour-homme.jpg" },
  { must: ["versace", "versense"], file: "versace-versense.jpg" },
  { must: ["versace", "yellow diamond"], file: "versace-yellow-diamond.jpg" },
  // === BOSS / HUGO BOSS ===
  { must: ["boss", "bottled"], file: "boss-bottled.jpg" },
  { must: ["boss", "the scent"], file: "boss-the-scent.jpg" },
  { must: ["boss", "hugo men"], file: "boss-hugo-man.jpg" },
  { must: ["hugo boss hugo"], file: "boss-hugo-man.jpg" },
  { must: ["hugo man"], file: "boss-hugo-man.jpg" },
  { must: ["boss", "alive"], file: "boss-alive.jpg" },
  { must: ["boss", "femme"], file: "boss-femme.jpg" },
  { must: ["boss", "orange"], file: "boss-orange.jpg" },
  // === AFNAN ===
  { must: ["afnan", "9 pm"], file: "afnan-9pm.jpg" },
  { must: ["afnan", "9pm"], file: "afnan-9pm.jpg" },
  { must: ["afnan", "9 am"], file: "afnan-9am.jpg" },
  { must: ["afnan", "9am"], file: "afnan-9am.jpg" },
  { must: ["afnan", "supremacy silver"], file: "afnan-supremacy-silver.jpg" },
  { must: ["afnan", "not only intense"], file: "afnan-supremacy-noi.jpg" },
  { must: ["afnan", "in oud"], file: "afnan-supremacy-in-oud.jpg" },
  { must: ["afnan", "in heaven"], file: "afnan-supremacy-in-heaven.jpg" },
  { must: ["afnan", "rare carbon"], file: "afnan-rare-carbon.jpg" },
  { must: ["afnan", "turathi blue"], file: "afnan-turathi-blue.jpg" },
  // === ARMAF ===
  { must: ["armaf", "club de nuit"], anyOf: ["woman", "\u0436\u0435\u043D\u0441\u043A", "\u0436\u0435\u043D\u0449", "femme"], file: "armaf-club-de-nuit-woman.jpg" },
  { must: ["armaf"], anyOf: ["white imperiale", "imperiale", "imperial"], file: "arab-armaf-armaf-club-de-nuit-white-imperiale.jpg" },
  { must: ["armaf", "milestone"], file: "armaf-milestone.jpg" },
  { must: ["armaf", "sillage"], file: "armaf-sillage.jpg" },
  { must: ["armaf", "untold"], file: "armaf-untold.jpg" },
  { must: ["armaf", "iconic"], file: "armaf-iconic.jpg" },
  { must: ["armaf", "club de nuit"], exclude: ["woman", "\u0436\u0435\u043D\u0441\u043A", "\u0436\u0435\u043D\u0449", "femme", "white imperiale", "imperiale", "imperial", "milestone", "sillage", "untold", "iconic"], file: "armaf-club-de-nuit.jpg" },
  // === BURBERRY ===
  { must: ["burberry", "hero"], file: "burberry-hero.jpg" },
  { must: ["burberry", "goddess"], file: "burberry-goddess.jpg" },
  { must: ["burberry", "her"], exclude: ["hero", "other"], file: "burberry-her.jpg" },
  { must: ["burberry", "london"], file: "burberry-london.jpg" },
  { must: ["burberry", "brit"], file: "burberry-brit.jpg" },
  { must: ["burberry", "touch"], file: "burberry-touch.jpg" },
  { must: ["burberry", "weekend"], file: "burberry-weekend.jpg" },
  // === MANCERA ===
  { must: ["mancera", "cedrat boise"], file: "mancera-cedrat-boise.jpg" },
  { must: ["mancera", "red tobacco"], file: "mancera-red-tobacco.jpg" },
  { must: ["mancera", "roses vanille"], file: "mancera-roses-vanille.jpg" },
  { must: ["mancera", "instant crush"], file: "mancera-instant-crush.jpg" },
  { must: ["mancera", "amore caffe"], file: "mancera-amore-caffe.jpg" },
  { must: ["mancera", "tonka cola"], file: "mancera-tonka-cola.jpg" },
  { must: ["mancera", "hindu kush"], file: "mancera-hindu-kush.jpg" },
  { must: ["mancera", "holidays"], file: "mancera-holidays.jpg" },
  // === CLIVE CHRISTIAN ===
  { must: ["clive christian", "no 1"], file: "clive-christian-no1.jpg" },
  { must: ["clive christian", "1872"], file: "clive-christian-1872.jpg" },
  { must: ["clive christian", "crab apple"], file: "clive-christian-crab-apple.jpg" },
  { must: ["clive christian", "matsukita"], file: "clive-christian-matsukita.jpg" },
  { must: ["clive christian", "jump up"], file: "clive-christian-jump-up.jpg" },
  { must: ["clive christian", "woody leather"], file: "clive-christian-c-woody.jpg" },
  { must: ["clive christian", "x "], file: "clive-christian-x.jpg" },
  { must: ["clive christian", "x masculine"], file: "clive-christian-x.jpg" },
  { must: ["clive christian", "x feminine"], file: "clive-christian-x.jpg" },
  // === CHRISTIAN DIOR ===
  { must: ["sauvage", "elixir"], anyBrand: ["dior", "c dior", "c.dior"], file: "dior-sauvage-elixir.jpg" },
  { must: ["dior", "sauvage"], exclude: ["elixir"], file: "dior-sauvage.jpg" },
  { must: ["c dior", "sauvage"], exclude: ["elixir"], file: "dior-sauvage.jpg" },
  { must: ["dior", "homme"], file: "dior-homme.jpg" },
  { must: ["dior", "fahrenheit"], file: "dior-fahrenheit.jpg" },
  { must: ["dior", "j adore"], file: "dior-jadore.jpg" },
  { must: ["dior", "jadore"], file: "dior-jadore.jpg" },
  { must: ["dior", "miss dior"], file: "dior-miss-dior.jpg" },
  { must: ["dior", "poison"], file: "dior-hypnotic-poison.jpg" },
  // === PACO RABANNE ===
  { must: ["1 million", "royal"], anyBrand: ["rabanne", "paco rabanne"], file: "rabanne-1-million-royal.jpg" },
  { must: ["million", "royal"], anyBrand: ["rabanne", "paco rabanne"], file: "rabanne-1-million-royal.jpg" },
  { must: ["1 million", "elixir"], anyBrand: ["rabanne", "paco rabanne"], file: "rabanne-1-million-elixir.jpg" },
  { must: ["million", "elixir"], anyBrand: ["rabanne", "paco rabanne"], file: "rabanne-1-million-elixir.jpg" },
  { must: ["1 million", "lucky"], anyBrand: ["rabanne", "paco rabanne"], file: "rabanne-1-million-lucky.jpg" },
  { must: ["1 million", "golden oud"], anyBrand: ["rabanne", "paco rabanne"], file: "rabanne-1-million-golden-oud.jpg" },
  { must: ["1 million"], anyBrand: ["rabanne", "paco rabanne"], exclude: ["royal", "elixir", "lucky", "black", "golden", "prive", "intense"], file: "rabanne-1-million.jpg" },
  { must: ["million"], anyBrand: ["rabanne", "paco rabanne"], exclude: ["royal", "elixir", "lucky", "black", "golden", "prive", "intense"], file: "rabanne-1-million.jpg" },
  // === JEAN PAUL GAULTIER ===
  { must: ["le male", "elixir"], anyBrand: ["gaultier", "jean paul"], file: "jean-paul-gaultier-le-male-elixir.jpg" },
  { must: ["le male", "parfum"], anyBrand: ["gaultier", "jean paul"], file: "jean-paul-gaultier-le-male-le-parfum.jpg" },
  { must: ["le male"], anyBrand: ["gaultier", "jean paul"], exclude: ["elixir", "parfum", "ultra", "beau"], file: "jean-paul-gaultier-le-male.jpg" },
  // === THOMAS KOSMALA ===
  { must: ["thomas kosmala", "apres"], file: "thomas-kosmala-no4.jpg" },
  { must: ["thomas kosmala", "no 4"], exclude: ["candy", "sport"], file: "thomas-kosmala-no4.jpg" },
  { must: ["thomas kosmala", "candy"], file: "thomas-kosmala-candy.jpg" },
  { must: ["thomas kosmala", "desir du coeur"], file: "thomas-kosmala-no10.jpg" },
  { must: ["thomas kosmala", "no 10"], file: "thomas-kosmala-no10.jpg" },
  { must: ["thomas kosmala", "no10"], file: "thomas-kosmala-no10.jpg" },
  { must: ["thomas kosmala", "no 7"], file: "thomas-kosmala-no7.jpg" },
  { must: ["thomas kosmala", "le sel"], file: "thomas-kosmala-no7.jpg" },
  { must: ["thomas kosmala", "no 2"], file: "thomas-kosmala-no2.jpg" },
  { must: ["thomas kosmala", "seve nouvelle"], file: "thomas-kosmala-no2.jpg" },
  { must: ["thomas kosmala", "no 3"], file: "thomas-kosmala-no3.jpg" },
  { must: ["thomas kosmala", "crepuscule ardent"], file: "thomas-kosmala-no3.jpg" },
  // === CREED ===
  { must: ["absolu aventus"], file: "creed-absolu-aventus.jpg" },
  { must: ["creed", "absolu"], file: "creed-absolu-aventus.jpg" },
  { must: ["creed", "cologne"], anyOf: ["aventus", "cologne"], file: "creed-aventus-cologne.jpg" },
  { must: ["creed", "aventus for her"], file: "creed-aventus-for-her.jpg" },
  { must: ["creed", "aventus"], anyOf: ["for her", "\u0436\u0435\u043D\u0441\u043A", "\u0436\u0435\u043D\u0449", "femme"], file: "creed-aventus-for-her.jpg" },
  { must: ["creed", "aventus"], exclude: ["absolu", "cologne", "for her", "\u0436\u0435\u043D\u0441\u043A", "\u0436\u0435\u043D\u0449", "femme"], file: "creed-aventus.jpg" },
  { must: ["creed", "silver mountain"], file: "creed-silver-mountain.jpg" },
  { must: ["creed", "green irish tweed"], file: "creed-green-irish-tweed.jpg" },
  { must: ["creed", "millesime imperial"], file: "creed-millesime-imperial.jpg" },
  { must: ["creed", "virgin island"], file: "creed-virgin-island.jpg" },
  // === KILIAN ===
  { must: ["kilian", "good girl", "extreme"], file: "by-kilian-good-girl-gone-bad-extreme.jpg" },
  { must: ["kilian", "good girl", "fraiche"], file: "by-kilian-good-girl-gone-bad-eau-fraiche.jpg" },
  { must: ["kilian", "good girl"], exclude: ["extreme", "fraiche", "eau fraiche", "hair", "splash"], file: "by-kilian-good-girl-gone-bad.jpg" },
  { must: ["kilian", "angel", "rocks"], file: "by-kilian-angels-share-on-the-rocks.jpg" },
  { must: ["kilian", "angel", "paradis"], file: "by-kilian-angels-share-paradis.jpg" },
  { must: ["kilian", "angel"], exclude: ["rocks", "paradis", "feux"], file: "by-kilian-angels-share.jpg" },
  { must: ["kilian", "apple brandy", "rocks"], file: "by-kilian-apple-brandy-on-the-rocks.jpg" },
  { must: ["kilian", "apple brandy"], exclude: ["rocks"], file: "by-kilian-apple-brandy.jpg" },
  { must: ["kilian", "love", "extreme"], file: "by-kilian-love-don-t-be-shy-extreme.jpg" },
  { must: ["kilian", "black phantom"], file: "kilian-black-phantom.jpg" },
  { must: ["kilian", "don t be shy"], exclude: ["extreme", "fraiche"], file: "kilian-love-dont-be-shy.jpg" },
  { must: ["kilian", "back to black"], file: "by-kilian-back-to-black.jpg" },
  // === MAISON FRANCIS KURKDJIAN ===
  { must: ["baccarat"], file: "mfk-baccarat-540.jpg" },
  { must: ["grand soir"], file: "mfk-grand-soir.jpg" },
  { must: ["gentle fluidity"], file: "mfk-gentle-fluidity.jpg" },
  { must: ["satin mood"], file: "mfk-oud-satin-mood.jpg" },
  { must: ["silk mood"], file: "mfk-oud-silk-mood.jpg" },
  // === XERJOFF ===
  { must: ["xerjoff", "erba pura"], file: "xerjoff-erba-pura.jpg" },
  { must: ["erba pura"], anyBrand: ["xerjoff"], file: "xerjoff-erba-pura.jpg" },
  { must: ["xerjoff", "erba gold"], file: "xerjoff-erba-gold.jpg" },
  { must: ["xerjoff", "naxos"], file: "xerjoff-naxos.jpg" },
  { must: ["1861 naxos"], file: "xerjoff-naxos.jpg" },
  { must: ["xerjoff", "alexandria"], file: "xerjoff-alexandria-ii.jpg" },
  { must: ["lira"], anyBrand: ["xerjoff", "casamorati"], file: "xerjoff-casamorati-lira.jpg" },
  { must: ["dama bianca"], anyBrand: ["xerjoff", "casamorati"], file: "xerjoff-casamorati-dama-bianca.jpg" },
  { must: ["bouquet ideale"], anyBrand: ["xerjoff", "casamorati"], file: "xerjoff-casamorati-bouquet-ideale.jpg" },
  { must: ["italica"], anyBrand: ["xerjoff", "casamorati"], file: "xerjoff-casamorati-italica.jpg" },
  { must: ["mefisto", "gentiluomo"], anyBrand: ["xerjoff", "casamorati"], file: "xerjoff-casamorati-mefisto-gentiluomo.jpg" },
  { must: ["mefisto"], anyBrand: ["xerjoff", "casamorati"], exclude: ["gentiluomo"], file: "xerjoff-casamorati-mefisto.jpg" },
  { must: ["tony iommi"], file: "xerjoff-tony-iommi.jpg" },
  // === LATTAFA ===
  { must: ["lattafa", "khamrah", "qahwa"], file: "lattafa-perfumes-khamrah-qahwa.jpg" },
  { must: ["lattafa", "khamrah"], exclude: ["qahwa", "dukhan"], file: "lattafa-khamrah.jpg" },
  { must: ["lattafa", "asad", "zanzibar"], file: "lattafa-perfumes-asad-zanzibar.jpg" },
  { must: ["lattafa", "asad"], exclude: ["zanzibar"], file: "lattafa-asad.jpg" },
  { must: ["lattafa", "yara", "candy"], file: "lattafa-perfumes-yara-candy.jpg" },
  { must: ["lattafa", "yara", "tous"], file: "lattafa-perfumes-yara-tous.jpg" },
  { must: ["lattafa", "yara", "moi"], file: "lattafa-perfumes-yara-moi.jpg" },
  { must: ["lattafa", "yara"], exclude: ["candy", "tous", "moi"], file: "lattafa-yara.jpg" },
  { must: ["lattafa", "bade"], file: "lattafa-badee-al-oud.jpg" },
  // === MONTALE ===
  { must: ["montale", "arabians tonka"], file: "montale-arabians-tonka.jpg" },
  { must: ["montale", "chocolate greedy"], file: "montale-chocolate-greedy.jpg" },
  { must: ["montale", "intense cafe"], file: "montale-intense-cafe.jpg" },
  { must: ["montale", "roses musk"], file: "montale-roses-musk.jpg" },
  { must: ["montale", "black aoud"], file: "montale-black-aoud.jpg" },
  { must: ["montale", "soleil de capri"], file: "montale-soleil-de-capri.jpg" },
  { must: ["montale", "wild pears"], file: "montale-wild-pears.jpg" },
  // === INITIO ===
  { must: ["initio", "side effect"], file: "initio-side-effect.jpg" },
  { must: ["initio", "oud for greatness"], file: "initio-oud-for-greatness.jpg" },
  { must: ["initio", "musk therapy"], file: "initio-musk-therapy.jpg" },
  { must: ["initio", "atomic rose"], file: "initio-atomic-rose.jpg" },
  // === BYREDO ===
  { must: ["byredo", "bal d afrique"], file: "byredo-bal-dafrique.jpg" },
  { must: ["byredo", "blanche"], file: "byredo-blanche.jpg" },
  { must: ["byredo", "gypsy water"], file: "byredo-gypsy-water.jpg" },
  { must: ["byredo", "mojave ghost"], file: "byredo-mojave-ghost.jpg" },
  // === PARFUMS DE MARLY ===
  { must: ["marly", "layton"], file: "pdm-layton.jpg" },
  { must: ["marly", "delina"], file: "pdm-delina.jpg" },
  { must: ["marly", "althair"], file: "pdm-althair.jpg" },
  { must: ["marly", "pegasus", "exclusif"], file: "pdm-pegasus-exclusif.jpg" },
  { must: ["marly", "pegasus"], exclude: ["exclusif"], file: "pdm-pegasus.jpg" },
  { must: ["marly", "percival"], file: "pdm-percival.jpg" },
  { must: ["marly", "herod"], file: "pdm-herod.jpg" },
  { must: ["marly", "haltane"], file: "pdm-haltane.jpg" },
  { must: ["marly", "valaya"], file: "pdm-valaya.jpg" },
  // === CHANEL ===
  { must: ["chanel", "bleu"], file: "chanel-bleu.jpg" },
  { must: ["chanel", "no 5"], file: "chanel-no5.jpg" },
  { must: ["chanel", "no5"], file: "chanel-no5.jpg" },
  { must: ["chanel", "coco mademoiselle"], file: "chanel-coco-mademoiselle.jpg" },
  { must: ["chanel", "chance"], file: "chanel-chance.jpg" },
  { must: ["chanel", "allure homme sport"], file: "chanel-allure-homme-sport.jpg" },
  // === YVES SAINT LAURENT (YSL) ===
  { must: ["libre"], anyBrand: ["ysl", "saint laurent", "yves saint"], file: "ysl-libre.jpg" },
  { must: ["black opium"], anyBrand: ["ysl", "saint laurent", "yves saint"], file: "ysl-black-opium.jpg" },
  { must: ["la nuit de l homme"], file: "ysl-la-nuit.jpg" },
  { must: ["y "], anyBrand: ["ysl", "saint laurent", "yves saint"], file: "ysl-y.jpg" },
  // === AMOUAGE ===
  { must: ["guidance", "46"], anyBrand: ["amouage"], file: "amouage-guidance-46.jpg" },
  { must: ["amouage", "guidance", "46"], file: "amouage-guidance-46.jpg" },
  { must: ["guidance"], anyBrand: ["amouage"], exclude: ["46"], file: "amouage-guidance.jpg" },
  { must: ["amouage", "guidance"], exclude: ["46"], file: "amouage-guidance.jpg" },
  { must: ["interlude", "53"], anyBrand: ["amouage"], file: "amouage-interlude-53-man.jpg" },
  { must: ["interlude", "black iris"], anyBrand: ["amouage"], file: "amouage-interlude-black-iris.jpg" },
  { must: ["interlude", "woman"], anyBrand: ["amouage"], file: "amouage-interlude-woman.jpg" },
  { must: ["interlude"], anyBrand: ["amouage"], exclude: ["black iris", "black", "iris", "53", "woman"], file: "amouage-interlude-man.jpg" },
  { must: ["amouage", "interlude"], exclude: ["black iris", "black", "iris", "53", "woman"], file: "amouage-interlude-man.jpg" },
  { must: ["reflection", "45"], anyBrand: ["amouage"], file: "amouage-reflection-45-man.jpg" },
  { must: ["reflection", "woman"], anyBrand: ["amouage"], file: "amouage-reflection-woman.jpg" },
  { must: ["reflection"], anyBrand: ["amouage"], exclude: ["45", "woman"], file: "amouage-reflection-man.jpg" },
  { must: ["amouage", "reflection"], exclude: ["45", "woman"], file: "amouage-reflection-man.jpg" },
  // === FRENCH AVENUE ===
  { must: ["royal blend"], anyBrand: ["french avenue", "fragrance world"], file: "french-avenue-royal-blend.jpg" },
  { must: ["french avenue", "royal blend"], file: "french-avenue-royal-blend.jpg" },
  { must: ["after effect"], anyBrand: ["french avenue", "fragrance world"], file: "french-avenue-after-effect.jpg" },
  { must: ["french avenue", "after effect"], file: "french-avenue-after-effect.jpg" },
  // === MARC-ANTOINE BARROIS ===
  { must: ["ganymede", "extrait"], anyBrand: ["barrois", "marc antoine", "marc-antoine"], file: "barrois-ganymede-extrait.jpg" },
  { must: ["ganymede"], anyBrand: ["barrois", "marc antoine", "marc-antoine"], exclude: ["extrait"], file: "barrois-ganymede.jpg" },
  { must: ["barrois", "ganymede"], exclude: ["extrait"], file: "barrois-ganymede.jpg" },
  { must: ["b683", "extrait"], anyBrand: ["barrois", "marc antoine", "marc-antoine"], file: "barrois-b683-extrait.jpg" },
  { must: ["b683"], anyBrand: ["barrois", "marc antoine", "marc-antoine"], exclude: ["extrait"], file: "barrois-b683.jpg" }
];
function loadAllRules() {
  const jsonPath = path.join(ROOT, "scripts", "curated-image-rules.json");
  let list = [];
  if (fs.existsSync(jsonPath)) {
    try {
      list = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } catch {
      list = [];
    }
  }
  const all = [];
  for (const item of list) {
    all.push(item);
  }
  for (const item of PRODUCT_RULES) {
    all.push(item);
  }
  all.sort((a, b) => {
    const aCount = a.must?.length || 0;
    const bCount = b.must?.length || 0;
    if (bCount !== aCount) return bCount - aCount;
    const aHasEx = (a.exclude?.length || 0) > 0 ? 1 : 0;
    const bHasEx = (b.exclude?.length || 0) > 0 ? 1 : 0;
    if (aHasEx !== bHasEx) return aHasEx - bHasEx;
    const aLen = (a.must || []).join("").length;
    const bLen = (b.must || []).join("").length;
    return bLen - aLen;
  });
  return all;
}
var ALL_PRODUCT_RULES = loadAllRules();
function resolveProductImage(p) {
  const stored = p.images?.[0];
  if (stored && p.custom && !isGenericStock(stored)) return stored;
  if (stored && stored.startsWith("/assets/products/")) {
    const loc = localIfExists(stored);
    if (loc) return loc;
  }
  if (stored && !isGenericStock(stored) && !stored.startsWith("/assets/brands/")) {
    return stored;
  }
  const hay = normalizeHaystack(p);
  for (const rule of ALL_PRODUCT_RULES) {
    if (rule.anyBrand && !rule.anyBrand.some((b) => hay.includes(b))) {
      continue;
    }
    if (rule.anyOf && !rule.anyOf.some((k) => hay.includes(k))) {
      continue;
    }
    if (rule.exclude && rule.exclude.some((ex) => hay.includes(ex))) {
      continue;
    }
    if (rule.must.every((k) => hay.includes(k))) {
      const loc = localIfExists(`/assets/products/${rule.file}`);
      if (loc) return loc;
    }
  }
  return PLACEHOLDER_IMAGE;
}
function withResolvedImage(p) {
  const image = resolveProductImage(p);
  return { ...p, image, images: [image] };
}

// server/notesData.ts
var NOTE_RULES = [
  // === KILIAN ===
  {
    match: (b, n) => b.includes("kilian") && (n.includes("angel") || n.includes("share")),
    notes: {
      top: ["\u041A\u043E\u043D\u044C\u044F\u043A"],
      heart: ["\u041A\u043E\u0440\u0438\u0446\u0430", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0414\u0443\u0431", "\u0413\u0435\u0434\u0438\u043E\u043D"],
      base: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u041F\u0440\u0430\u043B\u0438\u043D\u0435", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u041C\u0438\u043D\u0434\u0430\u043B\u044C"],
      all: ["\u041A\u043E\u043D\u044C\u044F\u043A", "\u041A\u043E\u0440\u0438\u0446\u0430", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0414\u0443\u0431", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041F\u0440\u0430\u043B\u0438\u043D\u0435", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u041C\u0438\u043D\u0434\u0430\u043B\u044C"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("kilian") && n.includes("good girl"),
    notes: {
      top: ["\u041E\u0441\u043C\u0430\u043D\u0442\u0443\u0441", "\u0411\u0435\u043B\u044B\u0439 \u043F\u0435\u0440\u0441\u0438\u043A", "\u041D\u0435\u0440\u043E\u043B\u0438", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442"],
      heart: ["\u0418\u043D\u0434\u0438\u0439\u0441\u043A\u0430\u044F \u0442\u0443\u0431\u0435\u0440\u043E\u0437\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u041D\u0430\u0440\u0446\u0438\u0441\u0441", "\u041C\u0430\u0439\u0441\u043A\u0430\u044F \u0440\u043E\u0437\u0430"],
      base: ["\u0410\u043C\u0431\u0440\u0430", "\u0411\u0435\u043B\u044B\u0439 \u043A\u0435\u0434\u0440", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u041F\u0430\u0447\u0443\u043B\u0438"],
      all: ["\u041E\u0441\u043C\u0430\u043D\u0442\u0443\u0441", "\u041F\u0435\u0440\u0441\u0438\u043A", "\u041D\u0435\u0440\u043E\u043B\u0438", "\u0422\u0443\u0431\u0435\u0440\u043E\u0437\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u0420\u043E\u0437\u0430", "\u0410\u043C\u0431\u0440\u0430", "\u041A\u0435\u0434\u0440", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      family: ["\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("kilian") && n.includes("black phantom"),
    notes: {
      top: ["\u0420\u043E\u043C", "\u0421\u0430\u0445\u0430\u0440\u043D\u044B\u0439 \u0442\u0440\u043E\u0441\u0442\u043D\u0438\u043A"],
      heart: ["\u0422\u0435\u043C\u043D\u044B\u0439 \u0448\u043E\u043A\u043E\u043B\u0430\u0434", "\u041A\u043E\u0444\u0435", "\u041A\u0430\u0440\u0430\u043C\u0435\u043B\u044C", "\u041C\u0438\u043D\u0434\u0430\u043B\u044C"],
      base: ["\u0421\u0430\u043D\u0434\u0430\u043B", "\u0413\u0435\u043B\u0438\u043E\u0442\u0440\u043E\u043F"],
      all: ["\u0420\u043E\u043C", "\u0422\u0435\u043C\u043D\u044B\u0439 \u0448\u043E\u043A\u043E\u043B\u0430\u0434", "\u041A\u043E\u0444\u0435", "\u041A\u0430\u0440\u0430\u043C\u0435\u043B\u044C", "\u041C\u0438\u043D\u0434\u0430\u043B\u044C", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      family: ["\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435", "\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("kilian") && n.includes("shy"),
    notes: {
      top: ["\u041D\u0435\u0440\u043E\u043B\u0438", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0446", "\u041A\u043E\u0440\u0438\u0430\u043D\u0434\u0440"],
      heart: ["\u0426\u0432\u0435\u0442\u043E\u043A \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u0416\u0438\u043C\u043E\u043B\u043E\u0441\u0442\u044C", "\u0418\u0440\u0438\u0441"],
      base: ["\u0421\u0430\u0445\u0430\u0440", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041A\u0430\u0440\u0430\u043C\u0435\u043B\u044C", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0426\u0438\u0432\u0435\u0442"],
      all: ["\u041D\u0435\u0440\u043E\u043B\u0438", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0426\u0432\u0435\u0442\u043E\u043A \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041A\u0430\u0440\u0430\u043C\u0435\u043B\u044C", "\u041C\u0443\u0441\u043A\u0443\u0441"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435", "\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("kilian") && n.includes("apple brandy"),
    notes: {
      top: ["\u042F\u0431\u043B\u043E\u043A\u043E", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D"],
      heart: ["\u041A\u043E\u043D\u044C\u044F\u043A", "\u0411\u0440\u0435\u043D\u0434\u0438", "\u0420\u043E\u043C", "\u041C\u043E\u0445"],
      base: ["\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D", "\u0411\u0435\u043B\u044B\u0439 \u043A\u0435\u0434\u0440", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      all: ["\u042F\u0431\u043B\u043E\u043A\u043E", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041A\u043E\u043D\u044C\u044F\u043A", "\u0411\u0440\u0435\u043D\u0434\u0438", "\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D", "\u041A\u0435\u0434\u0440", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      family: ["\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("kilian") && n.includes("back to black"),
    notes: {
      top: ["\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u041A\u043E\u0440\u0438\u0430\u043D\u0434\u0440"],
      heart: ["\u041C\u0435\u0434", "\u0422\u0430\u0431\u0430\u043A", "\u0411\u0435\u043B\u044B\u0439 \u043A\u0435\u0434\u0440", "\u0420\u043E\u043C\u0430\u0448\u043A\u0430", "\u041C\u0430\u043B\u0438\u043D\u0430"],
      base: ["\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041C\u0438\u043D\u0434\u0430\u043B\u044C", "\u041B\u0430\u0431\u0434\u0430\u043D\u0443\u043C"],
      all: ["\u041C\u0435\u0434", "\u0422\u0430\u0431\u0430\u043A", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u041C\u0430\u043B\u0438\u043D\u0430", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0422\u0430\u0431\u0430\u0447\u043D\u044B\u0435", "\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435"]
    }
  },
  // === TOM FORD ===
  {
    match: (b, n) => b.includes("tom ford") && n.includes("lost cherry"),
    notes: {
      top: ["\u0427\u0435\u0440\u043D\u0430\u044F \u0432\u0438\u0448\u043D\u044F", "\u0412\u0438\u0448\u043D\u0435\u0432\u044B\u0439 \u043B\u0438\u043A\u0435\u0440", "\u0413\u043E\u0440\u044C\u043A\u0438\u0439 \u043C\u0438\u043D\u0434\u0430\u043B\u044C"],
      heart: ["\u0413\u0440\u0438\u043E\u0442", "\u0422\u0443\u0440\u0435\u0446\u043A\u0430\u044F \u0440\u043E\u0437\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D \u0441\u0430\u043C\u0431\u0430\u043A", "\u0421\u043B\u0438\u0432\u0430"],
      base: ["\u041F\u0435\u0440\u0443\u0430\u043D\u0441\u043A\u0438\u0439 \u0431\u0430\u043B\u044C\u0437\u0430\u043C", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u0411\u0435\u043B\u044B\u0439 \u043A\u0435\u0434\u0440", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      all: ["\u0412\u0438\u0448\u043D\u044F", "\u041C\u0438\u043D\u0434\u0430\u043B\u044C", "\u041B\u0438\u043A\u0435\u0440", "\u0421\u043B\u0438\u0432\u0430", "\u0420\u043E\u0437\u0430", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      family: ["\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435", "\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("tom ford") && n.includes("tobacco vanille"),
    notes: {
      top: ["\u041B\u0438\u0441\u0442 \u0442\u0430\u0431\u0430\u043A\u0430", "\u041F\u0440\u044F\u043D\u044B\u0435 \u0441\u043F\u0435\u0446\u0438\u0438"],
      heart: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u041A\u0430\u043A\u0430\u043E", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0426\u0432\u0435\u0442\u043E\u043A \u0442\u0430\u0431\u0430\u043A\u0430"],
      base: ["\u0421\u0443\u0445\u043E\u0444\u0440\u0443\u043A\u0442\u044B", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435 \u043D\u043E\u0442\u044B"],
      all: ["\u0422\u0430\u0431\u0430\u043A", "\u0421\u043F\u0435\u0446\u0438\u0438", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041A\u0430\u043A\u0430\u043E", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0421\u0443\u0445\u043E\u0444\u0440\u0443\u043A\u0442\u044B"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435", "\u0422\u0430\u0431\u0430\u0447\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("tom ford") && n.includes("bitter peach"),
    notes: {
      top: ["\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u043F\u0435\u0440\u0441\u0438\u043A", "\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0413\u0435\u043B\u0438\u043E\u0442\u0440\u043E\u043F"],
      heart: ["\u0420\u043E\u043C", "\u041A\u043E\u043D\u044C\u044F\u043A", "\u0414\u0430\u0432\u0430\u043D\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D"],
      base: ["\u041F\u0430\u0447\u0443\u043B\u0438", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u041B\u0430\u0431\u0434\u0430\u043D\u0443\u043C", "\u041A\u0430\u0448\u043C\u0435\u0440\u0430\u043D"],
      all: ["\u041F\u0435\u0440\u0441\u0438\u043A", "\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0420\u043E\u043C", "\u041A\u043E\u043D\u044C\u044F\u043A", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      family: ["\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435", "\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("tom ford") && n.includes("black orchid"),
    notes: {
      top: ["\u0427\u0435\u0440\u043D\u044B\u0439 \u0442\u0440\u044E\u0444\u0435\u043B\u044C", "\u0418\u043B\u0430\u043D\u0433-\u0438\u043B\u0430\u043D\u0433", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430"],
      heart: ["\u0427\u0435\u0440\u043D\u0430\u044F \u043E\u0440\u0445\u0438\u0434\u0435\u044F", "\u041F\u0440\u044F\u043D\u043E\u0441\u0442\u0438", "\u041B\u043E\u0442\u043E\u0441", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435 \u043D\u043E\u0442\u044B"],
      base: ["\u041F\u0430\u0447\u0443\u043B\u0438", "\u041B\u0430\u0434\u0430\u043D", "\u0422\u0435\u043C\u043D\u044B\u0439 \u0448\u043E\u043A\u043E\u043B\u0430\u0434", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      all: ["\u0422\u0440\u044E\u0444\u0435\u043B\u044C", "\u041E\u0440\u0445\u0438\u0434\u0435\u044F", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430", "\u0428\u043E\u043A\u043E\u043B\u0430\u0434", "\u041B\u0430\u0434\u0430\u043D", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("tom ford") && n.includes("oud wood"),
    notes: {
      top: ["\u0423\u0434 (\u0430\u0433\u0430\u0440\u043E\u0432\u043E\u0435 \u0434\u0435\u0440\u0435\u0432\u043E)", "\u0420\u043E\u0437\u043E\u0432\u043E\u0435 \u0434\u0435\u0440\u0435\u0432\u043E", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D"],
      heart: ["\u0421\u044B\u0447\u0443\u0430\u043D\u044C\u0441\u043A\u0438\u0439 \u043F\u0435\u0440\u0435\u0446", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440"],
      base: ["\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0421\u0435\u0440\u0430\u044F \u0430\u043C\u0431\u0440\u0430"],
      all: ["\u0423\u0434", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u041F\u0435\u0440\u0435\u0446", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0410\u043C\u0431\u0440\u0430"],
      family: ["\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("tom ford") && n.includes("ombre leather"),
    notes: {
      top: ["\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D"],
      heart: ["\u0427\u0435\u0440\u043D\u0430\u044F \u043A\u043E\u0436\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D \u0441\u0430\u043C\u0431\u0430\u043A"],
      base: ["\u0410\u043C\u0431\u0440\u0430", "\u041C\u043E\u0445", "\u041F\u0430\u0447\u0443\u043B\u0438"],
      all: ["\u041A\u043E\u0436\u0430", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u0410\u043C\u0431\u0440\u0430", "\u041C\u043E\u0445", "\u041F\u0430\u0447\u0443\u043B\u0438"],
      family: ["\u041A\u043E\u0436\u0430\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("tom ford") && n.includes("soleil blanc"),
    notes: {
      top: ["\u0424\u0438\u0441\u0442\u0430\u0448\u043A\u0438", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0446"],
      heart: ["\u0422\u0443\u0431\u0435\u0440\u043E\u0437\u0430", "\u0418\u043B\u0430\u043D\u0433-\u0438\u043B\u0430\u043D\u0433", "\u0416\u0430\u0441\u043C\u0438\u043D"],
      base: ["\u041A\u043E\u043A\u043E\u0441", "\u0421\u0435\u0440\u0430\u044F \u0430\u043C\u0431\u0440\u0430", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0411\u0435\u043D\u0437\u043E\u0438\u043D"],
      all: ["\u041A\u043E\u043A\u043E\u0441", "\u0424\u0438\u0441\u0442\u0430\u0448\u043A\u0438", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0422\u0443\u0431\u0435\u0440\u043E\u0437\u0430", "\u0418\u043B\u0430\u043D\u0433-\u0438\u043B\u0430\u043D\u0433", "\u0410\u043C\u0431\u0440\u0430", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u0421\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0435"]
    }
  },
  // === CREED ===
  {
    match: (b, n) => b.includes("creed") && n.includes("absolu"),
    notes: {
      top: ["\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430", "\u0413\u0440\u0435\u0439\u043F\u0444\u0440\u0443\u0442"],
      heart: ["\u0418\u043C\u0431\u0438\u0440\u044C", "\u041A\u043E\u0440\u0438\u0446\u0430", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0446"],
      base: ["\u041F\u0430\u0447\u0443\u043B\u0438", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0446", "\u041B\u0430\u0431\u0434\u0430\u043D\u0443\u043C"],
      all: ["\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430", "\u0413\u0440\u0435\u0439\u043F\u0444\u0440\u0443\u0442", "\u0418\u043C\u0431\u0438\u0440\u044C", "\u041A\u043E\u0440\u0438\u0446\u0430", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440"],
      family: ["\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("creed") && n.includes("cologne"),
    notes: {
      top: ["\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D", "\u0418\u043C\u0431\u0438\u0440\u044C", "\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0446"],
      heart: ["\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      base: ["\u0411\u0435\u0440\u0435\u0437\u0430", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430"],
      all: ["\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D", "\u0418\u043C\u0431\u0438\u0440\u044C", "\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0446", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0411\u0435\u0440\u0435\u0437\u0430", "\u041C\u0443\u0441\u043A\u0443\u0441"],
      family: ["\u0426\u0438\u0442\u0440\u0443\u0441\u043E\u0432\u044B\u0435", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u0421\u0432\u0435\u0436\u0438\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("creed") && n.includes("aventus"),
    notes: {
      top: ["\u0410\u043D\u0430\u043D\u0430\u0441", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430", "\u042F\u0431\u043B\u043E\u043A\u043E"],
      heart: ["\u0411\u0435\u0440\u0435\u0437\u0430", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u041C\u0430\u0440\u043E\u043A\u043A\u0430\u043D\u0441\u043A\u0438\u0439 \u0436\u0430\u0441\u043C\u0438\u043D", "\u0420\u043E\u0437\u0430"],
      base: ["\u041C\u0443\u0441\u043A\u0443\u0441", "\u0414\u0443\u0431\u043E\u0432\u044B\u0439 \u043C\u043E\u0445", "\u0421\u0435\u0440\u0430\u044F \u0430\u043C\u0431\u0440\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      all: ["\u0410\u043D\u0430\u043D\u0430\u0441", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430", "\u042F\u0431\u043B\u043E\u043A\u043E", "\u0411\u0435\u0440\u0435\u0437\u0430", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0410\u043C\u0431\u0440\u0430"],
      family: ["\u0428\u0438\u043F\u0440\u043E\u0432\u044B\u0435", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("creed") && n.includes("silver mountain"),
    notes: {
      top: ["\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D"],
      heart: ["\u0417\u0435\u043B\u0435\u043D\u044B\u0439 \u0447\u0430\u0439", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430"],
      base: ["\u041C\u0443\u0441\u043A\u0443\u0441", "\u041F\u0435\u0442\u0438\u0442\u0433\u0440\u0435\u0439\u043D", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0413\u0430\u043B\u044C\u0431\u0430\u043D\u0443\u043C"],
      all: ["\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D", "\u0417\u0435\u043B\u0435\u043D\u044B\u0439 \u0447\u0430\u0439", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      family: ["\u0421\u0432\u0435\u0436\u0438\u0435", "\u0424\u0443\u0436\u0435\u0440\u043D\u044B\u0435", "\u0426\u0438\u0442\u0440\u0443\u0441\u043E\u0432\u044B\u0435"]
    }
  },
  // === AMOUAGE ===
  {
    match: (b, n) => b.includes("amouage") && n.includes("guidance"),
    notes: {
      top: ["\u0413\u0440\u0443\u0448\u0430", "\u041B\u0430\u0434\u0430\u043D", "\u041B\u0435\u0441\u043D\u043E\u0439 \u043E\u0440\u0435\u0445"],
      heart: ["\u041E\u0441\u043C\u0430\u043D\u0442\u0443\u0441", "\u0420\u043E\u0437\u0430", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u0416\u0430\u0441\u043C\u0438\u043D \u0441\u0430\u043C\u0431\u0430\u043A"],
      base: ["\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0410\u043A\u0438\u0433\u0430\u043B\u0430\u0432\u0443\u0434", "\u0421\u0435\u0440\u0430\u044F \u0430\u043C\u0431\u0440\u0430", "\u041B\u0430\u0431\u0434\u0430\u043D\u0443\u043C"],
      all: ["\u0413\u0440\u0443\u0448\u0430", "\u041B\u0430\u0434\u0430\u043D", "\u041B\u0435\u0441\u043D\u043E\u0439 \u043E\u0440\u0435\u0445", "\u041E\u0441\u043C\u0430\u043D\u0442\u0443\u0441", "\u0420\u043E\u0437\u0430", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0410\u043C\u0431\u0440\u0430"],
      family: ["\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("amouage") && n.includes("interlude"),
    notes: {
      top: ["\u041E\u0440\u0435\u0433\u0430\u043D\u043E", "\u041F\u0435\u0440\u0435\u0446", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442"],
      heart: ["\u041B\u0430\u0434\u0430\u043D", "\u041E\u043F\u043E\u043F\u043E\u043D\u0430\u043A\u0441", "\u0410\u043C\u0431\u0440\u0430", "\u041B\u0430\u0431\u0434\u0430\u043D\u0443\u043C"],
      base: ["\u041A\u043E\u0436\u0430", "\u0423\u0434", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      all: ["\u041E\u0440\u0435\u0433\u0430\u043D\u043E", "\u041F\u0435\u0440\u0435\u0446", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041B\u0430\u0434\u0430\u043D", "\u0410\u043C\u0431\u0440\u0430", "\u041A\u043E\u0436\u0430", "\u0423\u0434", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u0421\u043C\u043E\u043B\u0438\u0441\u0442\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("amouage") && n.includes("reflection"),
    notes: {
      top: ["\u0420\u043E\u0437\u043C\u0430\u0440\u0438\u043D", "\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0446", "\u041F\u0435\u0442\u0438\u0442\u0433\u0440\u0435\u0439\u043D"],
      heart: ["\u041A\u043E\u0440\u0435\u043D\u044C \u0438\u0440\u0438\u0441\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u041D\u0435\u0440\u043E\u043B\u0438", "\u0418\u043B\u0430\u043D\u0433-\u0438\u043B\u0430\u043D\u0433"],
      base: ["\u0421\u0430\u043D\u0434\u0430\u043B", "\u0411\u0435\u043B\u044B\u0439 \u043A\u0435\u0434\u0440", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u041F\u0430\u0447\u0443\u043B\u0438"],
      all: ["\u0420\u043E\u0437\u043C\u0430\u0440\u0438\u043D", "\u041F\u0435\u0442\u0438\u0442\u0433\u0440\u0435\u0439\u043D", "\u0418\u0440\u0438\u0441", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u041D\u0435\u0440\u043E\u043B\u0438", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u041A\u0435\u0434\u0440", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440"],
      family: ["\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u041C\u0443\u0441\u043A\u0443\u0441\u043D\u044B\u0435"]
    }
  },
  // === MARC-ANTOINE BARROIS ===
  {
    match: (b, n) => (b.includes("barrois") || b.includes("marc-antoine")) && n.includes("ganymede"),
    notes: {
      top: ["\u0418\u0442\u0430\u043B\u044C\u044F\u043D\u0441\u043A\u0438\u0439 \u043C\u0430\u043D\u0434\u0430\u0440\u0438\u043D", "\u0428\u0430\u0444\u0440\u0430\u043D"],
      heart: ["\u041B\u0438\u0441\u0442 \u0444\u0438\u0430\u043B\u043A\u0438", "\u041A\u0438\u0442\u0430\u0439\u0441\u043A\u0438\u0439 \u043E\u0441\u043C\u0430\u043D\u0442\u0443\u0441"],
      base: ["\u0410\u043A\u0438\u0433\u0430\u043B\u0430\u0432\u0443\u0434", "\u0411\u0435\u0441\u0441\u043C\u0435\u0440\u0442\u043D\u0438\u043A", "\u041C\u0438\u043D\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0435 \u043D\u043E\u0442\u044B", "\u0417\u0430\u043C\u0448\u0430"],
      all: ["\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u041B\u0438\u0441\u0442 \u0444\u0438\u0430\u043B\u043A\u0438", "\u041E\u0441\u043C\u0430\u043D\u0442\u0443\u0441", "\u0411\u0435\u0441\u0441\u043C\u0435\u0440\u0442\u043D\u0438\u043A", "\u0417\u0430\u043C\u0448\u0430", "\u041C\u0438\u043D\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0435 \u043D\u043E\u0442\u044B"],
      family: ["\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435", "\u041C\u0438\u043D\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("barrois") || b.includes("marc-antoine")) && n.includes("b683"),
    notes: {
      top: ["\u041C\u0443\u0441\u043A\u0430\u0442\u043D\u044B\u0439 \u043E\u0440\u0435\u0445", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0446"],
      heart: ["\u041B\u0438\u0441\u0442 \u0444\u0438\u0430\u043B\u043A\u0438", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0410\u043C\u0431\u0440\u0430", "\u041B\u0430\u0431\u0434\u0430\u043D\u0443\u043C"],
      base: ["\u041F\u0430\u0447\u0443\u043B\u0438", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0411\u0435\u043B\u044B\u0439 \u043A\u0435\u0434\u0440"],
      all: ["\u041C\u0443\u0441\u043A\u0430\u0442\u043D\u044B\u0439 \u043E\u0440\u0435\u0445", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u041B\u0438\u0441\u0442 \u0444\u0438\u0430\u043B\u043A\u0438", "\u0410\u043C\u0431\u0440\u0430", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u041A\u0435\u0434\u0440"],
      family: ["\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435"]
    }
  },
  // === MAISON FRANCIS KURKDJIAN ===
  {
    match: (b, n) => (b.includes("kurkdjian") || b.includes("mfk")) && n.includes("baccarat"),
    notes: {
      top: ["\u0413\u043E\u0440\u044C\u043A\u0438\u0439 \u043C\u0438\u043D\u0434\u0430\u043B\u044C", "\u0428\u0430\u0444\u0440\u0430\u043D"],
      heart: ["\u0415\u0433\u0438\u043F\u0435\u0442\u0441\u043A\u0438\u0439 \u0436\u0430\u0441\u043C\u0438\u043D", "\u0411\u0435\u043B\u044B\u0439 \u043A\u0435\u0434\u0440"],
      base: ["\u0421\u0435\u0440\u0430\u044F \u0430\u043C\u0431\u0440\u0430", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0439 \u043C\u0443\u0441\u043A\u0443\u0441", "Amberwood"],
      all: ["\u0428\u0430\u0444\u0440\u0430\u043D", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u0410\u043C\u0431\u0440\u0430", "\u041A\u0435\u0434\u0440", "Amberwood", "\u041C\u0438\u043D\u0434\u0430\u043B\u044C"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u0410\u043C\u0431\u0440\u043E\u0432\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("kurkdjian") || b.includes("mfk")) && n.includes("grand soir"),
    notes: {
      top: ["\u0418\u0441\u043F\u0430\u043D\u0441\u043A\u0438\u0439 \u043B\u0430\u0431\u0434\u0430\u043D\u0443\u043C"],
      heart: ["\u0421\u0438\u0430\u043C\u0441\u043A\u0438\u0439 \u0431\u0435\u043D\u0437\u043E\u0438\u043D", "\u0411\u0440\u0430\u0437\u0438\u043B\u044C\u0441\u043A\u0438\u0435 \u0431\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430"],
      base: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u0421\u0435\u0440\u0430\u044F \u0430\u043C\u0431\u0440\u0430"],
      all: ["\u0410\u043C\u0431\u0440\u0430", "\u0411\u0435\u043D\u0437\u043E\u0438\u043D", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u041B\u0430\u0431\u0434\u0430\u043D\u0443\u043C"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0410\u043C\u0431\u0440\u043E\u0432\u044B\u0435", "\u0422\u0435\u043F\u043B\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("kurkdjian") || b.includes("mfk")) && (n.includes("satin") || n.includes("silk")),
    notes: {
      top: ["\u0411\u043E\u043B\u0433\u0430\u0440\u0441\u043A\u0430\u044F \u0440\u043E\u0437\u0430", "\u0422\u0443\u0440\u0435\u0446\u043A\u0430\u044F \u0440\u043E\u0437\u0430"],
      heart: ["\u041D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0443\u0434", "\u0424\u0438\u0430\u043B\u043A\u0430"],
      base: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u0421\u0438\u0430\u043C\u0441\u043A\u0438\u0439 \u0431\u0435\u043D\u0437\u043E\u0438\u043D"],
      all: ["\u0420\u043E\u0437\u0430", "\u0423\u0434", "\u0424\u0438\u0430\u043B\u043A\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0411\u0435\u043D\u0437\u043E\u0438\u043D"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u0420\u043E\u0437\u043E\u0432\u044B\u0435"]
    }
  },
  // === PARFUMS DE MARLY ===
  {
    match: (b, n) => (b.includes("marly") || b.includes("parfums de marly")) && n.includes("layton"),
    notes: {
      top: ["\u042F\u0431\u043B\u043E\u043A\u043E", "\u041B\u0430\u0432\u0430\u043D\u0434\u0430", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D"],
      heart: ["\u0413\u0435\u0440\u0430\u043D\u044C", "\u0424\u0438\u0430\u043B\u043A\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D"],
      base: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u041F\u0435\u0440\u0435\u0446", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u0413\u0432\u0430\u044F\u043A"],
      all: ["\u042F\u0431\u043B\u043E\u043A\u043E", "\u041B\u0430\u0432\u0430\u043D\u0434\u0430", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u041F\u0430\u0447\u0443\u043B\u0438"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("marly") || b.includes("parfums de marly")) && n.includes("delina"),
    notes: {
      top: ["\u041B\u0438\u0447\u0438", "\u0420\u0435\u0432\u0435\u043D\u044C", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0443\u0441\u043A\u0430\u0442\u043D\u044B\u0439 \u043E\u0440\u0435\u0445"],
      heart: ["\u0422\u0443\u0440\u0435\u0446\u043A\u0430\u044F \u0440\u043E\u0437\u0430", "\u041F\u0438\u043E\u043D", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u041F\u0435\u0442\u0430\u043B\u0438\u044F"],
      base: ["\u041A\u0430\u0448\u043C\u0435\u0440\u0430\u043D", "\u0411\u0435\u043B\u044B\u0439 \u043A\u0435\u0434\u0440", "\u041B\u0430\u0434\u0430\u043D", "\u0413\u0430\u0438\u0442\u044F\u043D\u0441\u043A\u0438\u0439 \u0432\u0435\u0442\u0438\u0432\u0435\u0440", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      all: ["\u041B\u0438\u0447\u0438", "\u0420\u0435\u0432\u0435\u043D\u044C", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0420\u043E\u0437\u0430", "\u041F\u0438\u043E\u043D", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u041A\u0430\u0448\u043C\u0435\u0440\u0430\u043D", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      family: ["\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("marly") || b.includes("parfums de marly")) && n.includes("valaya"),
    notes: {
      top: ["\u0410\u043B\u044C\u0434\u0435\u0433\u0438\u0434\u044B", "\u0411\u0435\u043B\u044B\u0439 \u043F\u0435\u0440\u0441\u0438\u043A", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D"],
      heart: ["\u0426\u0432\u0435\u0442\u043E\u043A \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u0430", "\u041B\u0430\u043D\u0434\u044B\u0448", "\u041F\u0435\u0442\u0430\u043B\u0438\u044F", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440"],
      base: ["\u041C\u0443\u0441\u043A\u0443\u0441", "\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D", "\u0410\u043A\u0438\u0433\u0430\u043B\u0430\u0432\u0443\u0434", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      all: ["\u0410\u043B\u044C\u0434\u0435\u0433\u0438\u0434\u044B", "\u041F\u0435\u0440\u0441\u0438\u043A", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D", "\u0426\u0432\u0435\u0442\u043E\u043A \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u0430", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D"],
      family: ["\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435", "\u041C\u0443\u0441\u043A\u0443\u0441\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("marly") || b.includes("parfums de marly")) && n.includes("althair"),
    notes: {
      top: ["\u041A\u043E\u0440\u0438\u0446\u0430", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0426\u0432\u0435\u0442\u043E\u043A \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u0430", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442"],
      heart: ["\u0411\u0443\u0440\u0431\u043E\u043D\u0441\u043A\u0430\u044F \u0432\u0430\u043D\u0438\u043B\u044C", "\u042D\u043B\u0435\u043C\u0438"],
      base: ["\u041F\u0440\u0430\u043B\u0438\u043D\u0435", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D", "\u0413\u0432\u0430\u044F\u043A\u043E\u0432\u043E\u0435 \u0434\u0435\u0440\u0435\u0432\u043E"],
      all: ["\u041A\u043E\u0440\u0438\u0446\u0430", "\u041A\u0430\u0440\u0434\u0430\u043C\u043E\u043D", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041F\u0440\u0430\u043B\u0438\u043D\u0435", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435"]
    }
  },
  // === BYREDO ===
  {
    match: (b, n) => b.includes("byredo") && n.includes("afrique"),
    notes: {
      top: ["\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0410\u043C\u0430\u043B\u044C\u0444\u0438\u0442\u0430\u043D\u0441\u043A\u0438\u0439 \u043B\u0438\u043C\u043E\u043D", "\u0410\u0444\u0440\u0438\u043A\u0430\u043D\u0441\u043A\u0438\u0439 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432\u044B\u0439 \u0446\u0432\u0435\u0442", "\u0411\u0430\u0440\u0445\u0430\u0442\u0446\u044B", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430"],
      heart: ["\u0424\u0438\u0430\u043B\u043A\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u0426\u0438\u043A\u043B\u0430\u043C\u0435\u043D"],
      base: ["\u0427\u0435\u0440\u043D\u0430\u044F \u0430\u043C\u0431\u0440\u0430", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u0412\u0438\u0440\u0434\u0436\u0438\u043D\u0441\u043A\u0438\u0439 \u043A\u0435\u0434\u0440"],
      all: ["\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041B\u0438\u043C\u043E\u043D", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430", "\u0424\u0438\u0430\u043B\u043A\u0430", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u0410\u043C\u0431\u0440\u0430", "\u041A\u0435\u0434\u0440"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u0426\u0438\u0442\u0440\u0443\u0441\u043E\u0432\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("byredo") && n.includes("blanche"),
    notes: {
      top: ["\u0410\u043B\u044C\u0434\u0435\u0433\u0438\u0434\u044B", "\u0411\u0435\u043B\u0430\u044F \u0440\u043E\u0437\u0430", "\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0446"],
      heart: ["\u041F\u0438\u043E\u043D", "\u0424\u0438\u0430\u043B\u043A\u0430", "\u0410\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432\u044B\u0439 \u0446\u0432\u0435\u0442"],
      base: ["\u0411\u0435\u043B\u044B\u0439 \u043C\u0443\u0441\u043A\u0443\u0441", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435 \u043D\u043E\u0442\u044B", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      all: ["\u0410\u043B\u044C\u0434\u0435\u0433\u0438\u0434\u044B", "\u0420\u043E\u0437\u0430", "\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0446", "\u041F\u0438\u043E\u043D", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      family: ["\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u0410\u043B\u044C\u0434\u0435\u0433\u0438\u0434\u043D\u044B\u0435", "\u0421\u0432\u0435\u0436\u0438\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("byredo") && n.includes("gypsy"),
    notes: {
      top: ["\u041C\u043E\u0436\u0436\u0435\u0432\u0435\u043B\u044C\u043D\u0438\u043A", "\u041B\u0438\u043C\u043E\u043D", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041F\u0435\u0440\u0435\u0446"],
      heart: ["\u0418\u0433\u043B\u044B \u0441\u043E\u0441\u043D\u044B", "\u041B\u0430\u0434\u0430\u043D", "\u041A\u043E\u0440\u0435\u043D\u044C \u0438\u0440\u0438\u0441\u0430"],
      base: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0410\u043C\u0431\u0440\u0430"],
      all: ["\u041C\u043E\u0436\u0436\u0435\u0432\u0435\u043B\u044C\u043D\u0438\u043A", "\u041B\u0438\u043C\u043E\u043D", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0418\u0433\u043B\u044B \u0441\u043E\u0441\u043D\u044B", "\u041B\u0430\u0434\u0430\u043D", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0410\u043C\u0431\u0440\u0430"],
      family: ["\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u0424\u0443\u0436\u0435\u0440\u043D\u044B\u0435", "\u0421\u0432\u0435\u0436\u0438\u0435"]
    }
  },
  // === XERJOFF ===
  {
    match: (b, n) => (b.includes("xerjoff") || b.includes("casamorati")) && n.includes("erba pura"),
    notes: {
      top: ["\u0421\u0438\u0446\u0438\u043B\u0438\u0439\u0441\u043A\u0438\u0439 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D", "\u041A\u0430\u043B\u0430\u0431\u0440\u0438\u0439\u0441\u043A\u0438\u0439 \u0431\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0421\u0438\u0446\u0438\u043B\u0438\u0439\u0441\u043A\u0438\u0439 \u043B\u0438\u043C\u043E\u043D"],
      heart: ["\u0421\u0440\u0435\u0434\u0438\u0437\u0435\u043C\u043D\u043E\u043C\u043E\u0440\u0441\u043A\u0438\u0435 \u0444\u0440\u0443\u043A\u0442\u044B"],
      base: ["\u0411\u0435\u043B\u044B\u0439 \u043C\u0443\u0441\u043A\u0443\u0441", "\u041C\u0430\u0434\u0430\u0433\u0430\u0441\u043A\u0430\u0440\u0441\u043A\u0430\u044F \u0432\u0430\u043D\u0438\u043B\u044C", "\u0410\u043C\u0431\u0440\u0430"],
      all: ["\u0410\u043F\u0435\u043B\u044C\u0441\u0438\u043D", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041B\u0438\u043C\u043E\u043D", "\u0424\u0440\u0443\u043A\u0442\u044B", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0410\u043C\u0431\u0440\u0430"],
      family: ["\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435", "\u0426\u0438\u0442\u0440\u0443\u0441\u043E\u0432\u044B\u0435", "\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("xerjoff") || b.includes("casamorati")) && n.includes("naxos"),
    notes: {
      top: ["\u041B\u0430\u0432\u0430\u043D\u0434\u0430", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041B\u0438\u043C\u043E\u043D"],
      heart: ["\u041C\u0435\u0434", "\u041A\u043E\u0440\u0438\u0446\u0430", "\u041A\u0430\u0448\u043C\u0435\u0440\u0430\u043D", "\u0416\u0430\u0441\u043C\u0438\u043D \u0441\u0430\u043C\u0431\u0430\u043A"],
      base: ["\u041B\u0438\u0441\u0442 \u0442\u0430\u0431\u0430\u043A\u0430", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      all: ["\u041B\u0430\u0432\u0430\u043D\u0434\u0430", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0435\u0434", "\u041A\u043E\u0440\u0438\u0446\u0430", "\u0422\u0430\u0431\u0430\u043A", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      family: ["\u0424\u0443\u0436\u0435\u0440\u043D\u044B\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435", "\u0422\u0430\u0431\u0430\u0447\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("xerjoff") || b.includes("casamorati")) && n.includes("lira"),
    notes: {
      top: ["\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041B\u0430\u0432\u0430\u043D\u0434\u0430"],
      heart: ["\u041A\u043E\u0440\u0438\u0446\u0430", "\u041B\u0430\u043A\u0440\u0438\u0447\u043D\u0438\u043A", "\u0416\u0430\u0441\u043C\u0438\u043D"],
      base: ["\u041A\u0430\u0440\u0430\u043C\u0435\u043B\u044C", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041C\u0443\u0441\u043A\u0443\u0441"],
      all: ["\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041B\u0430\u0432\u0430\u043D\u0434\u0430", "\u041A\u043E\u0440\u0438\u0446\u0430", "\u041A\u0430\u0440\u0430\u043C\u0435\u043B\u044C", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041C\u0443\u0441\u043A\u0443\u0441"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435", "\u0426\u0438\u0442\u0440\u0443\u0441\u043E\u0432\u044B\u0435"]
    }
  },
  // === LATTAFA & FRENCH AVENUE ===
  {
    match: (b, n) => (b.includes("lattafa") || b.includes("french avenue")) && n.includes("khamrah"),
    notes: {
      top: ["\u041A\u043E\u0440\u0438\u0446\u0430", "\u041C\u0443\u0441\u043A\u0430\u0442\u043D\u044B\u0439 \u043E\u0440\u0435\u0445", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442"],
      heart: ["\u0424\u0438\u043D\u0438\u043A\u0438", "\u041F\u0440\u0430\u043B\u0438\u043D\u0435", "\u0422\u0443\u0431\u0435\u0440\u043E\u0437\u0430"],
      base: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0411\u0435\u043D\u0437\u043E\u0438\u043D", "\u041C\u0438\u0440\u0440\u0430", "\u0410\u043A\u0438\u0433\u0430\u043B\u0430\u0432\u0443\u0434"],
      all: ["\u041A\u043E\u0440\u0438\u0446\u0430", "\u041C\u0443\u0441\u043A\u0430\u0442\u043D\u044B\u0439 \u043E\u0440\u0435\u0445", "\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u0424\u0438\u043D\u0438\u043A\u0438", "\u041F\u0440\u0430\u043B\u0438\u043D\u0435", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("french avenue") || b.includes("fragrance world")) && n.includes("royal blend"),
    notes: {
      top: ["\u041A\u043E\u043D\u044C\u044F\u043A", "\u041A\u043E\u0440\u0438\u0446\u0430", "\u041C\u0443\u0441\u043A\u0430\u0442\u043D\u044B\u0439 \u043E\u0440\u0435\u0445"],
      heart: ["\u0414\u0443\u0431", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0428\u043E\u043A\u043E\u043B\u0430\u0434"],
      base: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u041F\u0440\u0430\u043B\u0438\u043D\u0435", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      all: ["\u041A\u043E\u043D\u044C\u044F\u043A", "\u041A\u043E\u0440\u0438\u0446\u0430", "\u0414\u0443\u0431", "\u0411\u043E\u0431\u044B \u0442\u043E\u043D\u043A\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u041F\u0440\u0430\u043B\u0438\u043D\u0435", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0413\u0443\u0440\u043C\u0430\u043D\u0441\u043A\u0438\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("french avenue") || b.includes("fragrance world")) && n.includes("after effect"),
    notes: {
      top: ["\u041A\u0443\u0431\u0438\u043D\u0441\u043A\u0438\u0439 \u0440\u043E\u043C", "\u0428\u0430\u0444\u0440\u0430\u043D"],
      heart: ["\u0422\u0430\u0431\u0430\u043A", "\u041A\u043E\u0436\u0430", "\u041A\u043E\u0440\u0438\u0446\u0430"],
      base: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u0413\u0432\u0430\u044F\u043A\u043E\u0432\u043E\u0435 \u0434\u0435\u0440\u0435\u0432\u043E"],
      all: ["\u0420\u043E\u043C", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u0422\u0430\u0431\u0430\u043A", "\u041A\u043E\u0436\u0430", "\u041A\u043E\u0440\u0438\u0446\u0430", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0422\u0430\u0431\u0430\u0447\u043D\u044B\u0435", "\u041A\u043E\u0436\u0430\u043D\u044B\u0435"]
    }
  },
  // === ESCENTRIC MOLECULES ===
  {
    match: (b, n) => (b.includes("escentric") || b.includes("molecule")) && (n.includes("01") || n.includes("one")),
    notes: {
      top: ["Iso E Super"],
      heart: ["Iso E Super (\u0434\u0440\u0435\u0432\u0435\u0441\u043D\u043E-\u043A\u0435\u0434\u0440\u043E\u0432\u044B\u0435 \u043E\u0431\u0435\u0440\u0442\u043E\u043D\u044B)"],
      base: ["Iso E Super (\u0431\u0430\u0440\u0445\u0430\u0442\u043D\u044B\u0439 \u0434\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0439 \u0448\u043B\u0435\u0439\u0444)"],
      all: ["Iso E Super", "\u041A\u0435\u0434\u0440", "\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435 \u043D\u043E\u0442\u044B"],
      family: ["\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435", "\u041C\u0443\u0441\u043A\u0443\u0441\u043D\u044B\u0435", "\u041C\u043E\u043B\u0435\u043A\u0443\u043B\u044F\u0440\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => (b.includes("escentric") || b.includes("molecule")) && (n.includes("02") || n.includes("two")),
    notes: {
      top: ["\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D"],
      heart: ["\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D", "\u0418\u0440\u0438\u0441", "\u0416\u0430\u0441\u043C\u0438\u043D"],
      base: ["\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440"],
      all: ["\u0410\u043C\u0431\u0440\u043E\u043A\u0441\u0430\u043D", "\u0418\u0440\u0438\u0441", "\u0416\u0430\u0441\u043C\u0438\u043D", "\u0412\u0435\u0442\u0438\u0432\u0435\u0440", "\u041C\u0438\u043D\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0435 \u043D\u043E\u0442\u044B"],
      family: ["\u0410\u043C\u0431\u0440\u043E\u0432\u044B\u0435", "\u0421\u0432\u0435\u0436\u0438\u0435", "\u041C\u043E\u043B\u0435\u043A\u0443\u043B\u044F\u0440\u043D\u044B\u0435"]
    }
  },
  // === INITIO ===
  {
    match: (b, n) => b.includes("initio") && n.includes("greatness"),
    notes: {
      top: ["\u041B\u0430\u0432\u0430\u043D\u0434\u0430", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u041C\u0443\u0441\u043A\u0430\u0442\u043D\u044B\u0439 \u043E\u0440\u0435\u0445"],
      heart: ["\u041D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0443\u0434"],
      base: ["\u041F\u0430\u0447\u0443\u043B\u0438", "\u041C\u0443\u0441\u043A\u0443\u0441"],
      all: ["\u0423\u0434", "\u041B\u0430\u0432\u0430\u043D\u0434\u0430", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u041C\u0443\u0441\u043A\u0430\u0442\u043D\u044B\u0439 \u043E\u0440\u0435\u0445", "\u041F\u0430\u0447\u0443\u043B\u0438", "\u041C\u0443\u0441\u043A\u0443\u0441"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("initio") && n.includes("side effect"),
    notes: {
      top: ["\u041A\u043E\u0440\u0438\u0446\u0430", "\u0420\u043E\u043C"],
      heart: ["\u0422\u0430\u0431\u0430\u043A", "\u0428\u0430\u0444\u0440\u0430\u043D"],
      base: ["\u0412\u0430\u043D\u0438\u043B\u044C", "\u0421\u0430\u043D\u0434\u0430\u043B", "\u0413\u0435\u0434\u0438\u043E\u043D"],
      all: ["\u041A\u043E\u0440\u0438\u0446\u0430", "\u0420\u043E\u043C", "\u0422\u0430\u0431\u0430\u043A", "\u0428\u0430\u0444\u0440\u0430\u043D", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      family: ["\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0435", "\u0422\u0430\u0431\u0430\u0447\u043D\u044B\u0435", "\u041F\u0440\u044F\u043D\u044B\u0435"]
    }
  },
  {
    match: (b, n) => b.includes("initio") && n.includes("musk therapy"),
    notes: {
      top: ["\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D"],
      heart: ["\u0411\u0435\u043B\u0430\u044F \u043C\u0430\u0433\u043D\u043E\u043B\u0438\u044F", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430"],
      base: ["\u0411\u0435\u043B\u044B\u0439 \u043C\u0443\u0441\u043A\u0443\u0441", "\u0411\u0435\u043B\u044B\u0439 \u0441\u0430\u043D\u0434\u0430\u043B"],
      all: ["\u0411\u0435\u0440\u0433\u0430\u043C\u043E\u0442", "\u041C\u0430\u043D\u0434\u0430\u0440\u0438\u043D", "\u041C\u0430\u0433\u043D\u043E\u043B\u0438\u044F", "\u0427\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u043E\u0440\u043E\u0434\u0438\u043D\u0430", "\u041C\u0443\u0441\u043A\u0443\u0441", "\u0421\u0430\u043D\u0434\u0430\u043B"],
      family: ["\u041C\u0443\u0441\u043A\u0443\u0441\u043D\u044B\u0435", "\u0426\u0432\u0435\u0442\u043E\u0447\u043D\u044B\u0435", "\u0424\u0440\u0443\u043A\u0442\u043E\u0432\u044B\u0435"]
    }
  }
];
function resolveNotesForProduct(brand, name) {
  const b = brand.toLowerCase();
  const n = name.toLowerCase();
  for (const rule of NOTE_RULES) {
    if (rule.match(b, n)) {
      return rule.notes;
    }
  }
  return null;
}

// server/catalogStore.ts
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var ROOT2 = path2.resolve(__dirname2, "..");
var cache = null;
function catalogPath() {
  return path2.join(ROOT2, "data", "catalog.json");
}
function customPath() {
  return path2.join(ROOT2, "data", "catalog.custom.json");
}
function loadFile() {
  const mainPath = catalogPath();
  if (!fs2.existsSync(mainPath)) {
    return {
      meta: {
        importedAt: "",
        sourceFile: "",
        count: 0,
        kinds: [],
        priceMax: 2e5
      },
      products: []
    };
  }
  const main = JSON.parse(fs2.readFileSync(mainPath, "utf-8"));
  if (fs2.existsSync(customPath())) {
    const custom = JSON.parse(fs2.readFileSync(customPath(), "utf-8"));
    const byId = new Map(main.products.map((p) => [p.id, p]));
    for (const p of custom.products) {
      byId.set(p.id, { ...p, custom: true });
    }
    main.products = Array.from(byId.values());
    main.meta.count = main.products.length;
  }
  return main;
}
function extractVolumeOption(name, price, existing, isPerfume = true) {
  const m = name.match(/(\d+(?:[.,]\d+)?)\s*(мл|ml|г|g|л|l)(?:[\s,;\.\]\)]|$)/i);
  let volMl = existing?.volumeMl ?? 1;
  let unit = "\u043C\u043B";
  if (m) {
    volMl = parseFloat(m[1].replace(",", "."));
    const u = m[2].toLowerCase();
    if (u === "l" || u === "\u043B") volMl *= 1e3;
    else if (u === "g" || u === "\u0433") unit = "\u0433";
  } else if (existing?.volumeMl && existing.volumeMl > 0) {
    volMl = existing.volumeMl;
  }
  const isTester = /тестер|\(тестер\)/i.test(name) || (existing?.label ? /тестер/i.test(existing.label) : false);
  const isDecant = (/отливант|\(отливант|пробник/i.test(name) || (existing?.label ? /отливант|пробник/i.test(existing.label) : false)) && volMl <= 30;
  let format = "bottle";
  let label = `${volMl} ${unit}`;
  if (isTester) {
    format = "tester";
    label += " (\u0442\u0435\u0441\u0442\u0435\u0440)";
  } else if (isDecant) {
    format = "decant";
    label += " (\u043E\u0442\u043B\u0438\u0432\u0430\u043D\u0442)";
  } else if (isPerfume && volMl >= 30) {
    format = "bottle";
    label += " (\u0444\u043B\u0430\u043A\u043E\u043D)";
  }
  const type = `vol_${volMl}_${unit}_${format}`;
  return {
    type,
    label,
    volumeMl: volMl,
    price: Math.round(price),
    inStock: true
  };
}
var KNOWN_HOUSES = [
  "Tom Ford",
  "By Kilian",
  "Kilian",
  "Yves Saint Laurent",
  "YSL",
  "Dolce & Gabbana",
  "Dolce and Gabbana",
  "D&G",
  "French Avenue",
  "Attar Collection",
  "Escentric Molecules",
  "Juliette Has A Gun",
  "Haute Fragrance Company",
  "HFC",
  "Boadicea The Victorious",
  "Marc-Antoine Barrois",
  "Jean Paul Gaultier",
  "Hugo Boss",
  "Giorgio Armani",
  "Emporio Armani",
  "Clive Christian",
  "Carolina Herrera",
  "Paco Rabanne",
  "Rabanne",
  "Tiziana Terenzi",
  "Victoria's Secret",
  "Ex Nihilo",
  "Initio Parfums Prives",
  "Initio",
  "Jo Malone",
  "Le Labo",
  "Memo Paris",
  "Memo",
  "Vilhelm Parfumerie",
  "Frederic Malle",
  "Serge Lutens",
  "Penhaligon's",
  "Roja Dove",
  "Roja",
  "Maison Martin Margiela",
  "Maison Margiela",
  "Maison Francis Kurkdjian",
  "Acqua di Parma",
  "Atelier Cologne",
  "Atelier des Ors",
  "Bond No. 9",
  "Bottega Veneta",
  "Carner Barcelona",
  "Costume National",
  "Essential Parfums",
  "Etat Libre d'Orange",
  "Fragrance World",
  "Parfums de Marly",
  "Lattafa Perfumes",
  "Lattafa",
  "Paris Corner",
  "Maison Alhambra",
  "Alhambra",
  "Ard Al Zaafaran",
  "Swiss Arabian",
  "Al Haramain",
  "Christian Dior",
  "C.Dior",
  "Dior",
  "Chanel",
  "Creed",
  "Amouage",
  "Byredo",
  "Xerjoff",
  "Versace",
  "Armaf",
  "Gucci",
  "Givenchy",
  "Montale",
  "Mancera",
  "Nasomatto",
  "Bvlgari",
  "Bulgari",
  "Valentino",
  "Diptyque",
  "Chopard",
  "Hermes",
  "Guerlain",
  "Prada",
  "Burberry",
  "Davines",
  "Kerastase",
  "Matrix",
  "Redken",
  "Wella",
  "Estel",
  "Schwarzkopf",
  "Goldwell",
  "Lebel",
  "Olaplex",
  "Ahjaar",
  "Aigner",
  "Afnan",
  "Ajmal",
  "Rasasi",
  "Kajal",
  "Zimaya",
  "Nishane",
  "Vertus",
  "Orto Parisi",
  "Moschino",
  "Mugler",
  "Cartier",
  "Chloe",
  "Lanvin",
  "Lancome",
  "Lalique",
  "Kenzo",
  "Azzaro",
  "Caron",
  "Houbigant",
  "Frapin",
  "Jovoy Paris",
  "Jovoy",
  "Mizensir",
  "Stephane Humbert Lucas",
  "Thomas Kosmala",
  "The Merchant of Venice",
  "The Different Company",
  "Tauer Perfumes",
  "Van Cleef & Arpels",
  "Van Cleef",
  "Zarkoperfume",
  "Laboratorio Olfattivo",
  "L'Artisan Parfumeur",
  "Liquides Imaginaires",
  "Lorenzo Villoresi",
  "Maison Crivelli",
  "Maison Tahite",
  "Miller Harris",
  "Ormonde Jayne",
  "Profumum Roma",
  "BDK Parfums",
  "Alexandre.J",
  "Amouroud",
  "Anfas",
  "Annick Goutal",
  "Goutal",
  "Birkholz",
  "Bois 1920",
  "Calvin Klein",
  "Davidoff",
  "Electimuss",
  "Floraiku",
  "Gritti",
  "Histoires de Parfums",
  "Jacques Zolty",
  "Jardins d'Ecrivains",
  "Jimmy Choo",
  "Keiko Mecheri",
  "Kemi",
  "Korloff",
  "Les Liquides Imaginaires",
  "Linari",
  "Loewe",
  "M.Micallef",
  "Micallef",
  "Masque Milano",
  "Molinard",
  "Montblanc",
  "Narciso Rodriguez",
  "Nicolai",
  "Nobile 1942",
  "Ojar",
  "Perris Monte Carlo",
  "Pierre Guillaume",
  "Plume Impression",
  "Ramon Monegal",
  "Rance 1795",
  "Reminiscence",
  "Simone Andreoli",
  "Sospiro",
  "Teo Cabanel",
  "The House of Oud",
  "THOO",
  "Une Nuit Nomade",
  "Vilhelm",
  "Widian",
  "X-Ray",
  "Aesop",
  "Yves de Sistelle",
  "Yves Rocher",
  "The 7 Virtues",
  "The Beautiful Mind",
  "The Harmonist",
  "Parfums de Marly",
  "Maison 21G",
  "Maison Asrar",
  "Maison Alhambra"
];
var SORTED_HOUSES = [...KNOWN_HOUSES].sort((a, b) => b.length - a.length);
function normalizeBrand(raw) {
  if (!raw) return "\u0414\u0440\u0443\u0433\u043E\u0435";
  let b = raw.trim();
  b = b.replace(/^!+\s*/, "").replace(/^\d+\s+/, "").trim();
  const lower = b.toLowerCase();
  if (lower === "\u0431\u0440\u0435\u043D\u0434" || lower === "\u0434\u0440\u0443\u0433\u043E\u0435") return "\u0414\u0440\u0443\u0433\u043E\u0435";
  for (const house of SORTED_HOUSES) {
    const hLow = house.toLowerCase();
    if (lower === hLow || lower.startsWith(hLow + " ") || lower.startsWith(hLow + "'") || lower.startsWith(hLow + "-")) {
      if (/^kilian|^by kilian/i.test(house)) return "Kilian";
      if (/^c\.dior|^christian dior|^dior/i.test(house)) return "Dior";
      if (/^yves saint|^ysl/i.test(house)) return "Yves Saint Laurent";
      if (/^yves de/i.test(house)) return "Yves de Sistelle";
      if (/^dolce|^d&g/i.test(house)) return "Dolce & Gabbana";
      if (/^lattafa/i.test(house)) return "Lattafa Perfumes";
      if (/^bulgari|^bvlgari/i.test(house)) return "Bvlgari";
      if (/^paco rabanne|^rabanne/i.test(house)) return "Rabanne";
      if (/^roja/i.test(house)) return "Roja Dove";
      if (/^margiela/i.test(house)) return "Maison Martin Margiela";
      if (/^kurkdjian/i.test(house)) return "Maison Francis Kurkdjian";
      if (/^hfc/i.test(house)) return "Haute Fragrance Company";
      if (/^barrois/i.test(house)) return "Marc-Antoine Barrois";
      if (/^armani/i.test(house)) return "Giorgio Armani";
      if (/^boss/i.test(house)) return "Hugo Boss";
      if (/^memo/i.test(house)) return "Memo Paris";
      if (/^vilhelm/i.test(house)) return "Vilhelm Parfumerie";
      if (/^initio/i.test(house)) return "Initio Parfums Prives";
      if (/^jovoy/i.test(house)) return "Jovoy Paris";
      if (/^van cleef/i.test(house)) return "Van Cleef & Arpels";
      if (/^aesop/i.test(house)) return "Aesop";
      return house;
    }
  }
  const words = b.split(/\s+/);
  if (lower.startsWith("the ") && words.length >= 2) return words.slice(0, 3).join(" ");
  if (lower.startsWith("maison ") && words.length >= 2) return words.slice(0, 2).join(" ");
  if (lower.startsWith("parfums ") && words.length >= 2) return words.slice(0, 3).join(" ");
  return words[0] || b;
}
function cleanBaseModelName(name) {
  return name.replace(/\[[^\]]*\]/g, "").replace(/\((?:тестер|отливант[^\)]*|пробник|драмминг[^\)]*|декодированный|запаска|без спрея|без крышки|с носиком[^\)]*)\)/gi, "").replace(/(?:^|\s)\d+(?:[.,]\d+)?\s*(?:мл|ml|г|g|л|l)(?:[\s,;\.\]\)]|$)/gi, " ").replace(/(?:^|\s)\d+\s*по\s*\d+\s*(?:мл|ml)(?:[\s,;\.\]\)]|$)/gi, " ").replace(/\b(отливант|тестер|пробник|драмминг|dramming|запаска)\b/gi, "").replace(/\b\d+\s*\+\b/g, "").replace(/\s+/g, " ").trim();
}
var ARABIAN_BRAND_SUBSTRINGS = [
  "lattafa",
  "afnan",
  "armaf",
  "attar collection",
  "attar al",
  "attar",
  "al haramain",
  "haramain",
  "rasasi",
  "ajmal",
  "kajal",
  "swiss arabian",
  "norana",
  "arabesque",
  "khalis",
  "fragrance world",
  "paris corner",
  "alhambra",
  "maison alhambra",
  "zaafaran",
  "ard al zaafaran",
  "zimaya",
  "riiffs",
  "rovena",
  "orientica",
  "al rehab",
  "al-rehab",
  "ahmed al maghribi",
  "naseem",
  "asdaaf",
  "emper",
  "sterling",
  "vurv",
  "taif al emarat",
  "louis cardin",
  "junaid",
  "my perfumes"
];
var LUXURY_BRAND_SUBSTRINGS = [
  "chanel",
  "dior",
  "tom ford",
  "ysl",
  "saint laurent",
  "yves saint",
  "guerlain",
  "hermes",
  "kilian",
  "versace",
  "hugo boss",
  "boss",
  "armani",
  "giorgio armani",
  "gucci",
  "givenchy",
  "dolce",
  "d&g",
  "burberry",
  "paco rabanne",
  "prada",
  "valentino",
  "calvin klein",
  "lacoste",
  "carolina herrera",
  "narciso rodriguez",
  "bvlgari",
  "bulgari",
  "kenzo",
  "cartier",
  "lanvin",
  "moschino",
  "chloe",
  "lancome",
  "mugler",
  "montblanc",
  "trussardi",
  "rochas",
  "ferragamo",
  "jimmy choo",
  "marc jacobs",
  "jean paul gaultier",
  "viktor & rolf",
  "nina ricci",
  "azzaro"
];
function classifyProduct(p) {
  if (p.custom && p.kind) {
    return {
      kind: p.kind,
      kindLabel: p.kindLabel || p.kind,
      category: p.category || "niche",
      categoryName: p.categoryName || "\u041F\u0430\u0440\u0444\u044E\u043C\u0435\u0440\u0438\u044F"
    };
  }
  const text = `${p.brand} ${p.name}`.toLowerCase();
  if (/(?:шампун|кондиционер|краска\s+для\s+волос|бальзам\s+для\s+волос|маска\s+для\s+волос|окислител|оксид|стайлинг|лак\s+для\s+волос|сыворотка\s+для\s+волос|масло\s+для\s+волос|kerastase|wella|schwarzkopf|loreal\s+prof|matrix|olaplex|redken|moroccanoil|lebel|davines|londa|dewal|bouticle|ollin|estel|concept|kapous|keune|selective|chi|tigi|goldwell|constant delight|alfaparf)/i.test(
    text
  )) {
    return {
      kind: "haircare",
      kindLabel: "\u0423\u0445\u043E\u0434 \u0437\u0430 \u0432\u043E\u043B\u043E\u0441\u0430\u043C\u0438",
      category: "haircare",
      categoryName: "\u0423\u0445\u043E\u0434 \u0437\u0430 \u0432\u043E\u043B\u043E\u0441\u0430\u043C\u0438"
    };
  }
  if (/(?:помада|lipstick|тушь|mascara|тональн|concealer|консилер|румян|тени|блеск\s+для\s+губ|пудра|подводк|карандаш\s+для\s+губ|хайлайтер|бронзер)/i.test(
    text
  )) {
    return {
      kind: "makeup",
      kindLabel: "\u041C\u0430\u043A\u0438\u044F\u0436",
      category: "makeup",
      categoryName: "\u041C\u0430\u043A\u0438\u044F\u0436"
    };
  }
  if (/(?:крем\s+для\s+лица|сыворотк\w*\s+для\s+лица|тоник|лосьон\s+для\s+лица|маска\s+для\s+лица|скраб\s+для\s+лица|пилинг|патчи|солнцезащит|уход\s+за\s+кожей|крем\s+для\s+век|вокруг\s+глаз)/i.test(
    text
  )) {
    return {
      kind: "skincare",
      kindLabel: "\u0423\u0445\u043E\u0434 \u0437\u0430 \u043A\u043E\u0436\u0435\u0439",
      category: "skincare",
      categoryName: "\u0423\u0445\u043E\u0434 \u0437\u0430 \u043A\u043E\u0436\u0435\u0439"
    };
  }
  if (/(?:гель\s+для\s+душа|мыло|лосьон\s+для\s+тела|крем\s+для\s+тела|скраб\s+для\s+тела|масло\s+для\s+тела|body\s+wash|shower\s+gel)/i.test(
    text
  )) {
    return {
      kind: "bodycare",
      kindLabel: "\u0423\u0445\u043E\u0434 \u0437\u0430 \u0442\u0435\u043B\u043E\u043C",
      category: "bodycare",
      categoryName: "\u0423\u0445\u043E\u0434 \u0437\u0430 \u0442\u0435\u043B\u043E\u043C"
    };
  }
  const kind = "perfume";
  const kindLabel = "\u041F\u0430\u0440\u0444\u044E\u043C\u0435\u0440\u0438\u044F";
  if (ARABIAN_BRAND_SUBSTRINGS.some((b) => text.includes(b))) {
    return { kind, kindLabel, category: "arabian", categoryName: "\u0410\u0440\u0430\u0431\u0441\u043A\u0430\u044F \u043F\u0430\u0440\u0444\u044E\u043C\u0435\u0440\u0438\u044F" };
  }
  if (LUXURY_BRAND_SUBSTRINGS.some((b) => text.includes(b))) {
    return { kind, kindLabel, category: "luxury", categoryName: "\u041B\u044E\u043A\u0441\u043E\u0432\u0430\u044F \u043F\u0430\u0440\u0444\u044E\u043C\u0435\u0440\u0438\u044F" };
  }
  return { kind, kindLabel, category: "niche", categoryName: "\u041D\u0438\u0448\u0435\u0432\u0430\u044F \u043F\u0430\u0440\u0444\u044E\u043C\u0435\u0440\u0438\u044F" };
}
var ICONIC_SPECS = [
  { key: "creed-aventus", rank: 100, match: (b, n) => b.includes("creed") && n.includes("aventus") && !n.includes("absolu") && !n.includes("cologne") && !n.includes("her") },
  { key: "tom-ford-lost-cherry", rank: 99, match: (b, n) => b.includes("tom ford") && n.includes("lost cherry") && !n.includes("\u043D\u0430\u0431\u043E\u0440") && !n.includes("\u0441\u043F\u0440\u0435\u0439") },
  { key: "french-avenue-royal-blend", rank: 98, match: (b, n) => b.includes("french avenue") && n.includes("royal blend") },
  { key: "kilian-angels-share", rank: 97, match: (b, n) => b.includes("kilian") && (n.includes("angel") || n.includes("angels")) && !n.includes("\u043D\u0430\u0431\u043E\u0440") },
  { key: "barrois-ganymede", rank: 96, match: (b, n) => (b.includes("barrois") || b.includes("marc antoine")) && n.includes("ganymede") },
  { key: "amouage-guidance", rank: 95, match: (b, n) => b.includes("amouage") && n.includes("guidance") },
  { key: "french-avenue-after-effect", rank: 94, match: (b, n) => b.includes("french avenue") && n.includes("after effect") },
  { key: "creed-absolu-aventus", rank: 93, match: (b, n) => b.includes("creed") && n.includes("absolu") },
  { key: "tom-ford-tobacco-vanille", rank: 92, match: (b, n) => b.includes("tom ford") && n.includes("tobacco vanille") && !n.includes("\u043D\u0430\u0431\u043E\u0440") },
  { key: "lattafa-khamrah", rank: 91, match: (b, n) => b.includes("lattafa") && n.includes("khamrah") },
  { key: "armaf-cdn-intense", rank: 90, match: (b, n) => b.includes("armaf") && n.includes("club de nuit") && !n.includes("woman") && !n.includes("\u0436\u0435\u043D\u0441\u043A") },
  { key: "amouage-reflection", rank: 89, match: (b, n) => b.includes("amouage") && n.includes("reflection") },
  { key: "afnan-9pm", rank: 88, match: (b, n) => b.includes("afnan") && n.includes("9 pm") },
  { key: "attar-musk-kashmir", rank: 87, match: (b, n) => b.includes("attar") && n.includes("musk kashmir") },
  { key: "tom-ford-bitter-peach", rank: 86, match: (b, n) => b.includes("tom ford") && n.includes("bitter peach") && !n.includes("\u043D\u0430\u0431\u043E\u0440") },
  { key: "lattafa-asad", rank: 85, match: (b, n) => b.includes("lattafa") && n.includes("asad") },
  { key: "lattafa-yara", rank: 84, match: (b, n) => b.includes("lattafa") && n.includes("yara") },
  { key: "creed-silver-mountain", rank: 83, match: (b, n) => b.includes("creed") && n.includes("silver mountain") },
  { key: "kilian-good-girl", rank: 82, match: (b, n) => b.includes("kilian") && n.includes("good girl") },
  { key: "byredo-bal-dafrique", rank: 81, match: (b, n) => b.includes("byredo") && n.includes("bal d afrique") },
  { key: "xerjoff-erba-pura", rank: 80, match: (b, n) => b.includes("xerjoff") && n.includes("erba pura") },
  { key: "dior-sauvage", rank: 79, match: (b, n) => (b.includes("dior") || b.includes("c.dior")) && n.includes("sauvage") },
  { key: "chanel-bleu", rank: 78, match: (b, n) => b.includes("chanel") && n.includes("bleu") },
  { key: "creed-aventus-cologne", rank: 77, match: (b, n) => b.includes("creed") && n.includes("cologne") },
  { key: "creed-aventus-for-her", rank: 76, match: (b, n) => b.includes("creed") && n.includes("for her") },
  { key: "armaf-cdn-woman", rank: 75, match: (b, n) => b.includes("armaf") && n.includes("club de nuit") && (n.includes("woman") || n.includes("\u0436\u0435\u043D\u0441\u043A")) }
];
function groupProductsByModel(rawList) {
  const groups = /* @__PURE__ */ new Map();
  for (const p of rawList) {
    if (p.custom) {
      groups.set(`custom|||${p.id}`, [p]);
      continue;
    }
    const canonicalBrand = normalizeBrand(p.brand);
    const cls = classifyProduct(p);
    const b = canonicalBrand.toLowerCase().trim();
    const base = cleanBaseModelName(p.name).toLowerCase();
    const key = `${cls.kind}|||${b}|||${base}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  const grouped = [];
  const byId = /* @__PURE__ */ new Map();
  const bySlug = /* @__PURE__ */ new Map();
  for (const list of groups.values()) {
    const primary = list[0];
    const canonicalBrand = normalizeBrand(primary.brand);
    const cleanName = cleanBaseModelName(primary.name) || primary.name;
    const cls = classifyProduct(primary);
    const volumeMap = /* @__PURE__ */ new Map();
    const isPerfumeKind = cls.kind === "perfume";
    for (const item of list) {
      const sourceVolumes = item.volumes && item.volumes.length > 0 ? item.volumes : [extractVolumeOption(item.name, item.minPrice, void 0, isPerfumeKind)];
      for (const rawVol of sourceVolumes) {
        const vol = extractVolumeOption(
          `${item.name} ${rawVol.label || ""}`,
          rawVol.price || item.minPrice,
          rawVol,
          isPerfumeKind
        );
        const key = vol.type;
        if (!volumeMap.has(key)) {
          volumeMap.set(key, vol);
        } else {
          const existing = volumeMap.get(key);
          if (vol.price > existing.price) {
            volumeMap.set(key, vol);
          }
        }
      }
    }
    const labelMap = /* @__PURE__ */ new Map();
    for (const vol of volumeMap.values()) {
      if (!labelMap.has(vol.label)) {
        labelMap.set(vol.label, vol);
      } else {
        const existing = labelMap.get(vol.label);
        if (vol.price > existing.price) {
          labelMap.set(vol.label, vol);
        }
      }
    }
    const volumes = Array.from(labelMap.values()).sort(
      (a, b) => a.volumeMl - b.volumeMl || a.price - b.price
    );
    const minPrice = volumes[0]?.price ?? primary.minPrice;
    const resolvedNotes = resolveNotesForProduct(canonicalBrand, cleanName);
    const prod = {
      ...primary,
      brand: canonicalBrand,
      name: cleanName,
      kind: cls.kind,
      kindLabel: cls.kindLabel,
      category: cls.category,
      categoryName: cls.categoryName,
      minPrice,
      volumes: volumes.length ? volumes : primary.volumes,
      notes: resolvedNotes ? { top: resolvedNotes.top, heart: resolvedNotes.heart, base: resolvedNotes.base } : primary.notes,
      allNotes: resolvedNotes ? resolvedNotes.all : primary.allNotes || []
    };
    grouped.push(prod);
    byId.set(prod.id, prod);
    bySlug.set(prod.slug, prod);
    for (const item of list) {
      byId.set(item.id, prod);
      bySlug.set(item.slug, prod);
    }
  }
  for (const prod of grouped) {
    if (prod.custom) {
      prod._hitPriority = prod.isHit ? 200 : 0;
      continue;
    }
    if (prod.kind !== "perfume") {
      prod.isHit = false;
      prod._hitPriority = 0;
      continue;
    }
    if (prod.isHit) {
      prod._hitPriority = 10;
    } else {
      prod._hitPriority = 0;
    }
  }
  for (const spec of ICONIC_SPECS) {
    const matches = grouped.filter((p) => {
      if (p.kind !== "perfume") return false;
      if (p.name.includes("\u0430\u043D\u0430\u043B\u043E\u0433") || p.name.includes("\u043C\u043E\u0442\u0438\u0432")) return false;
      const b = (p.brand || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      return spec.match(b, n);
    });
    if (matches.length > 0) {
      matches.sort(
        (a, b) => (b.volumes?.length || 0) - (a.volumes?.length || 0) || b.minPrice - a.minPrice
      );
      const topRep = matches[0];
      topRep.isHit = true;
      topRep._hitPriority = 1e3 + spec.rank;
      for (let i = 1; i < matches.length; i++) {
        matches[i].isHit = true;
        matches[i]._hitPriority = 500 + spec.rank;
      }
    }
  }
  for (const prod of grouped) {
    if (prod.kind === "perfume" && prod.minPrice >= 1200) {
      const bLower = (prod.brand || "").toLowerCase();
      const isLuxury = /kilian|creed|tom ford|marly|xerjoff|amouage|kurkdjian|baccarat|chanel|dior|clive|roja|french avenue|lattafa|byredo|memo|le labo|initio|vilhelm|frederic malle|roja|hermes|guerlain|prada/i.test(bLower) || prod.minPrice >= 5e3;
      if (isLuxury) {
        const charSum = prod.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        if (charSum % 8 < 4) {
          const discountPercent = 7 + charSum % 5;
          const multiplier = 1 + discountPercent / 100;
          const oldPrice = Math.round(prod.minPrice * multiplier / 10) * 10;
          prod.oldPrice = oldPrice;
          prod.discountPercent = discountPercent;
        }
      }
    }
  }
  return { grouped, byId, bySlug };
}
function reloadCatalog() {
  cache = null;
  return getCatalog();
}
function getCatalog() {
  if (cache) return cache;
  const file = loadFile();
  if (file.meta.isCompiled) {
    const byId2 = /* @__PURE__ */ new Map();
    const bySlug2 = /* @__PURE__ */ new Map();
    for (const p of file.products) {
      if (!p.description) {
        p.description = `${p.name} \u2014 ${p.kindLabel || "\u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F"}.`;
      }
      if (!p.images) p.images = [];
      if (!p.allNotes) p.allNotes = [];
      byId2.set(p.id, p);
      bySlug2.set(p.slug, p);
    }
    cache = {
      products: file.products,
      byId: byId2,
      bySlug: bySlug2,
      meta: {
        ...file.meta,
        count: file.products.length
      }
    };
    return cache;
  }
  const { grouped, byId, bySlug } = groupProductsByModel(file.products);
  cache = {
    products: grouped,
    byId,
    bySlug,
    meta: {
      ...file.meta,
      count: grouped.length
    }
  };
  return cache;
}
function appendCustomProduct(product) {
  const cPath = customPath();
  let list = [];
  if (fs2.existsSync(cPath)) {
    list = JSON.parse(fs2.readFileSync(cPath, "utf-8")).products;
  }
  const idx = list.findIndex((p) => p.id === product.id || p.sku === product.sku);
  if (idx >= 0) list[idx] = product;
  else list.push(product);
  fs2.mkdirSync(path2.dirname(cPath), { recursive: true });
  fs2.writeFileSync(cPath, JSON.stringify({ products: list }, null, 2), "utf-8");
  reloadCatalog();
}
function deleteCustomProduct(id) {
  const cPath = customPath();
  if (!fs2.existsSync(cPath)) return false;
  const data = JSON.parse(fs2.readFileSync(cPath, "utf-8"));
  const next = data.products.filter((p) => p.id !== id);
  if (next.length === data.products.length) return false;
  fs2.writeFileSync(cPath, JSON.stringify({ products: next }, null, 2), "utf-8");
  reloadCatalog();
  return true;
}
function queryProducts(query) {
  const { products, meta } = getCatalog();
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(96, Math.max(1, query.limit ?? 24));
  const q = query.q?.trim().toLowerCase() ?? "";
  const brands = query.brands?.filter(Boolean) ?? [];
  let list = products;
  if (!q) {
    if (query.kind && query.kind !== "all") {
      list = list.filter((p) => p.kind === query.kind);
    }
    if (query.category && query.category !== "all") {
      list = list.filter((p) => p.category === query.category || p.kind === query.category);
    }
    if (query.gender && query.gender !== "all") {
      list = list.filter((p) => p.gender === query.gender);
    }
  }
  if (brands.length) {
    const brandLower = brands.map((b) => b.toLowerCase().trim()).filter(Boolean);
    list = list.filter((p) => {
      const pb = p.brand.toLowerCase();
      return brandLower.some((b) => pb === b || pb.startsWith(b + " ") || pb.includes(b));
    });
  }
  if (query.notes && query.notes.length) {
    const targetNotes = query.notes.map((n) => n.toLowerCase().trim()).filter(Boolean);
    list = list.filter((p) => {
      const pNotes = (p.allNotes || []).map((n) => n.toLowerCase());
      return targetNotes.every((tn) => pNotes.some((pn) => pn.includes(tn)));
    });
  }
  if (query.maxPrice != null && query.maxPrice > 0) {
    list = list.filter((p) => p.minPrice <= query.maxPrice);
  }
  if (query.isHit) list = list.filter((p) => p.isHit);
  if (query.isNew) list = list.filter((p) => p.isNew);
  if (query.isSale) list = list.filter((p) => !!p.oldPrice);
  const TRANSLIT_DICT = {
    \u0430\u0432\u0435\u043D\u0442\u0443\u0441: ["aventus"],
    \u0430\u0432\u0435\u043D\u0442\u0443\u0441\u044B: ["aventus"],
    \u0430\u0432\u0435\u043D\u0442\u0443\u0441\u0430: ["aventus"],
    \u043A\u0440\u0438\u0434: ["creed"],
    \u043A\u0440\u0438\u0434\u0430: ["creed"],
    \u043A\u0440\u0438\u0434\u044B: ["creed"],
    \u0434\u0438\u043E\u0440: ["dior"],
    \u0434\u0438\u043E\u0440\u044B: ["dior"],
    \u0441\u0430\u0432\u0430\u0436: ["sauvage"],
    \u0441\u043E\u0432\u0430\u0436: ["sauvage"],
    \u0448\u0430\u043D\u0435\u043B\u044C: ["chanel"],
    \u0432\u0435\u0440\u0441\u0430\u0447\u0435: ["versace"],
    \u044D\u0440\u043E\u0441: ["eros"],
    \u0431\u0440\u0430\u0439\u0442: ["bright"],
    \u043A\u0440\u0438\u0441\u0442\u0430\u043B: ["crystal"],
    \u043A\u0440\u0438\u0441\u0442\u0430\u043B\u043B: ["crystal"],
    \u0430\u0431\u0441\u043E\u043B\u044E: ["absolu"],
    \u0442\u043E\u043C: ["tom"],
    \u0444\u043E\u0440\u0434: ["ford"],
    \u043B\u043E\u0441\u0442: ["lost"],
    \u0447\u0435\u0440\u0440\u0438: ["cherry"],
    \u0442\u043E\u0431\u0430\u043A\u043E: ["tobacco"],
    \u0442\u0430\u0431\u0430\u043A\u043E: ["tobacco"],
    \u0432\u0430\u043D\u0438\u043B\u044C: ["vanille", "vanilla"],
    \u0431\u043E\u0441\u0441: ["boss"],
    \u0445\u044C\u044E\u0433\u043E: ["hugo"],
    \u043A\u0438\u043B\u0438\u0430\u043D: ["kilian"],
    \u043C\u0430\u043D\u0441\u0435\u0440\u0430: ["mancera"],
    \u043C\u043E\u043D\u0442\u0430\u043B\u044C: ["montale"],
    \u0431\u0430\u0439\u0440\u0435\u0434\u043E: ["byredo"],
    \u0431\u0438\u0440\u0435\u0434\u043E: ["byredo"],
    \u0431\u0430\u043A\u043A\u0430\u0440\u0430: ["baccarat"],
    \u0431\u0430\u043A\u0430\u0440\u0430: ["baccarat"],
    \u0440\u0443\u0436: ["rouge"],
    \u043C\u043E\u043B\u0435\u043A\u0443\u043B\u0430: ["molecule", "escentric"],
    \u0433\u0430\u043D\u0438\u043C\u0435\u0434: ["ganymede"],
    \u0430\u0442\u0442\u0430\u0440: ["attar"],
    \u043A\u0430\u0448\u043C\u0438\u0440: ["kashmir"],
    \u0445\u0430\u044F\u0442\u0438: ["hayati"],
    \u043B\u0430\u0442\u0442\u0430\u0444\u0430: ["lattafa"],
    \u043B\u0430\u0442\u0430\u0444\u0430: ["lattafa"],
    \u0445\u0430\u043C\u0440\u0430: ["khamrah"],
    \u043A\u0430\u043C\u0440\u0430: ["khamrah"],
    \u0430\u0441\u0430\u0434: ["asad"],
    \u044F\u0440\u0430: ["yara"],
    \u0430\u0444\u043D\u0430\u043D: ["afnan"],
    \u0430\u0440\u043C\u0430\u0444: ["armaf"],
    \u043C\u0438\u043B\u044C\u0441\u0442\u043E\u043D: ["milestone"],
    \u043C\u0430\u0439\u043B\u0441\u0442\u043E\u0443\u043D: ["milestone"],
    \u0441\u0438\u043B\u043B\u0430\u0436: ["sillage"],
    \u0443\u043D\u0442\u043E\u043B\u0434: ["untold"],
    \u0445\u0430\u0440\u0430\u043C\u0435\u0439\u043D: ["haramain"],
    \u0440\u0430\u0441\u0430\u0441\u0438: ["rasasi"],
    \u0445\u0430\u0432\u0430\u0441: ["hawas"],
    \u0430\u0434\u0436\u043C\u0430\u043B: ["ajmal"],
    \u043A\u0430\u0434\u0436\u0430\u043B: ["kajal"],
    \u043A\u043B\u0443\u0431: ["club"],
    \u0438\u043D\u0442\u0435\u043D\u0441: ["intense"],
    \u0441\u0435\u043B\u0435\u043A\u0442\u0438\u0432: ["niche"],
    \u043D\u0438\u0448\u0430: ["niche"],
    \u0434\u0443\u0445\u0438: ["parfum", "\u0434\u0443\u0445\u0438", "eau"],
    \u043F\u0430\u0440\u0444\u044E\u043C: ["perfume", "parfum", "eau"],
    \u0430\u043C\u0443\u0430\u0436: ["amouage"],
    \u0430\u043C\u0443\u0430\u0436\u0438: ["amouage"],
    \u0433\u0430\u0439\u0434\u0430\u043D\u0441: ["guidance"],
    \u0438\u043D\u0442\u0435\u0440\u043B\u044E\u0434: ["interlude"],
    \u0440\u0435\u0444\u043B\u0435\u043A\u0448\u043D: ["reflection"],
    \u0444\u0440\u0435\u043D\u0447: ["french"],
    \u0430\u0432\u0435\u043D\u044E: ["avenue"],
    \u0440\u043E\u044F\u043B: ["royal"],
    \u0431\u043B\u0435\u043D\u0434: ["blend"],
    \u0430\u0444\u0442\u0435\u0440: ["after"],
    \u044D\u0444\u0444\u0435\u043A\u0442: ["effect"],
    \u0430\u043D\u0433\u0435\u043B: ["angel", "angels"],
    \u0430\u043D\u0433\u0435\u043B\u044B: ["angel", "angels"],
    \u0448\u0435\u0440: ["share"],
    \u0448\u0430\u0440\u0435: ["share"],
    \u0442\u0438\u043B\u0438\u044F: ["tilia"],
    \u044D\u043D\u0446\u0435\u043B\u0430\u0434: ["encelade"],
    \u0435\u0440\u0431\u0430: ["erba"],
    \u043F\u0443\u0440\u0430: ["pura"],
    \u043D\u0430\u043A\u0441\u043E\u0441: ["naxos"],
    \u043B\u0438\u0440\u0430: ["lira"],
    \u0434\u0435\u043C\u0430\u0440\u043B\u0438: ["marly"],
    \u043C\u0430\u0440\u043B\u0438: ["marly"],
    \u0434\u0435\u043B\u0438\u043D\u0430: ["delina"],
    \u043B\u0435\u0439\u0442\u043E\u043D: ["layton"],
    \u0438\u043D\u0438\u0442\u0438\u043E: ["initio"],
    \u0441\u0430\u0439\u0434: ["side"],
    \u043A\u0443\u0440\u043A\u0434\u0436\u0430\u043D: ["kurkdjian"],
    \u043A\u0443\u0440\u043A\u0434\u0436\u044F\u043D: ["kurkdjian"]
  };
  function stemRussian(word) {
    return word.replace(/(?:ы|и|а|я|ов|ев|ом|ем|е|у|ю|ах|ях|ам|ям|ами|ями|ой|ей|ий|ый|ая|яя|ое|ее)$/, "");
  }
  function translitCyrillic(str) {
    const map = {
      \u0430: "a",
      \u0431: "b",
      \u0432: "v",
      \u0433: "g",
      \u0434: "d",
      \u0435: "e",
      \u0436: "zh",
      \u0437: "z",
      \u0438: "i",
      \u0439: "y",
      \u043A: "k",
      \u043B: "l",
      \u043C: "m",
      \u043D: "n",
      \u043E: "o",
      \u043F: "p",
      \u0440: "r",
      \u0441: "s",
      \u0442: "t",
      \u0443: "u",
      \u0444: "f",
      \u0445: "h",
      \u0446: "ts",
      \u0447: "ch",
      \u0448: "sh",
      \u0449: "sch",
      \u044A: "",
      \u044B: "y",
      \u044C: "",
      \u044D: "e",
      \u044E: "yu",
      \u044F: "ya"
    };
    return str.split("").map((c) => map[c] || c).join("");
  }
  function getQueryTokenVariants(token) {
    const t = token.toLowerCase().trim();
    const variants = /* @__PURE__ */ new Set([t]);
    const stem = stemRussian(t);
    if (stem.length >= 3) variants.add(stem);
    if (TRANSLIT_DICT[t]) TRANSLIT_DICT[t].forEach((v) => variants.add(v));
    if (TRANSLIT_DICT[stem]) TRANSLIT_DICT[stem].forEach((v) => variants.add(v));
    const tr = translitCyrillic(t);
    if (tr !== t) variants.add(tr);
    const trStem = translitCyrillic(stem);
    if (trStem !== stem) variants.add(trStem);
    return Array.from(variants);
  }
  if (q) {
    const rawTokens = q.split(/\s+/).filter(Boolean);
    const tokenVariantsList = rawTokens.map(getQueryTokenVariants);
    list = list.filter((p) => {
      const hay = `${p.name} ${p.brand} ${p.sku} ${p.kindLabel} ${p.categoryName} ${(p.allNotes || []).join(" ")}`.toLowerCase();
      return tokenVariantsList.every((variants) => variants.some((v) => hay.includes(v)));
    });
  }
  const sorted = [...list];
  const sort = query.sort ?? "popular";
  sorted.sort((a, b) => {
    if (sort === "popular") {
      const aRank = a._hitPriority ?? 0;
      const bRank = b._hitPriority ?? 0;
      if (aRank !== bRank) return bRank - aRank;
      return b.reviewsCount * b.rating - a.reviewsCount * a.rating;
    }
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "new") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    if (sort === "price_asc") return a.minPrice - b.minPrice;
    if (sort === "price_desc") return b.minPrice - a.minPrice;
    return 0;
  });
  const total = sorted.length;
  const start = (page - 1) * limit;
  const items = sorted.slice(start, start + limit).map(toListItem);
  return { items, total, page, limit, meta };
}
function toListItem(p) {
  const image = resolveProductImage(p);
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    brand: p.brand,
    kind: p.kind,
    kindLabel: p.kindLabel,
    category: p.category,
    categoryName: p.categoryName,
    gender: p.gender,
    genderLabel: p.genderLabel,
    minPrice: p.minPrice,
    oldPrice: p.oldPrice,
    discountPercent: p.discountPercent,
    image,
    isHit: p.isHit,
    isNew: p.isNew,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    volumes: p.volumes,
    notes: p.notes,
    allNotes: p.allNotes
  };
}
var JUNK_BRAND_FILTER = /(?:^бренд$|^другое$|распродажа|ограниченное|специальные|тестер|пробник|уценка|скидк|акци|ликвидац|дисконт|воск|индивидуальная|парфюмерия|расходные|честный|!!!|\?\?\?)/i;
function searchBrands(opts) {
  const { products } = getCatalog();
  const q = opts.q?.trim().toLowerCase() ?? "";
  const limit = Math.min(2e3, opts.limit ?? 1e3);
  const counts = /* @__PURE__ */ new Map();
  for (const p of products) {
    if (opts.kind && p.kind !== opts.kind) continue;
    if (!p.brand || JUNK_BRAND_FILTER.test(p.brand.trim()) || p.brand.trim().length < 2) continue;
    if (q && !p.brand.toLowerCase().includes(q)) continue;
    counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru")).slice(0, limit).map(([brand, count]) => ({ brand, count }));
}
function getPopularNotes(opts) {
  const { products } = getCatalog();
  const limit = opts?.limit ?? 100;
  const counts = /* @__PURE__ */ new Map();
  for (const p of products) {
    if (p.allNotes && p.allNotes.length) {
      for (const note of p.allNotes) {
        const clean = note.trim();
        if (clean.length >= 2) {
          counts.set(clean, (counts.get(clean) ?? 0) + 1);
        }
      }
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru")).slice(0, limit).map(([note, count]) => ({ note, count }));
}

// server/telegramNotifier.ts
import fs3 from "fs";
import path3 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
var __dirname3 = path3.dirname(fileURLToPath3(import.meta.url));
var CONFIG_PATH = path3.join(__dirname3, "..", "data", "telegram.config.json");
var DEFAULT_CONFIG = {
  enabled: false,
  botToken: "",
  chatId: "",
  managerUsername: "nikisss2"
};
function getTelegramConfig() {
  try {
    if (fs3.existsSync(CONFIG_PATH)) {
      const raw = fs3.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error("Error reading telegram config:", err);
  }
  return { ...DEFAULT_CONFIG };
}
function saveTelegramConfig(config) {
  const current = getTelegramConfig();
  const updated = {
    ...current,
    ...config,
    botToken: (config.botToken ?? current.botToken).trim(),
    chatId: (config.chatId ?? current.chatId).trim(),
    managerUsername: (config.managerUsername ?? current.managerUsername).trim() || "nikisss2",
    enabled: config.enabled ?? current.enabled
  };
  fs3.mkdirSync(path3.dirname(CONFIG_PATH), { recursive: true });
  fs3.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
async function sendTelegramMessage(text, inlineButtons) {
  const config = getTelegramConfig();
  if (!config.botToken) {
    return { ok: false, error: "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D Bot Token" };
  }
  if (!config.chatId) {
    return { ok: false, error: "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D Chat ID" };
  }
  const payload = {
    chat_id: config.chatId,
    text,
    parse_mode: "HTML"
  };
  if (inlineButtons && inlineButtons.length > 0) {
    payload.reply_markup = {
      inline_keyboard: inlineButtons
    };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.ok) {
      return { ok: false, error: data.description || "\u041E\u0448\u0438\u0431\u043A\u0430 Telegram API" };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "\u0421\u0435\u0442\u0435\u0432\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430" };
  }
}
function formatOrderHtml(order) {
  const items = (order.items || []).map(
    (it, i) => `<b>${i + 1}.</b> ${escapeHtml(it.brand || "")} \u2014 ${escapeHtml(it.name || "")}
   \u2514 <i>${escapeHtml(it.volumeLabel || "")}</i> \xD7 ${it.quantity} \u0448\u0442. = <b>${Number(it.price * it.quantity).toLocaleString("ru-RU")} \u20BD</b>`
  ).join("\n");
  const text = `\u{1F6CD} <b>\u041D\u041E\u0412\u042B\u0419 \u0417\u0410\u041A\u0410\u0417 \u2116${escapeHtml(order.orderNumber || "")}</b>
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F464} <b>\u041F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044C:</b> ${escapeHtml(order.recipient?.fullName || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E")}
\u{1F4F1} <b>\u0422\u0435\u043B\u0435\u0444\u043E\u043D:</b> <code>${escapeHtml(order.recipient?.phone || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D")}</code>
\u{1F4AC} <b>Telegram \u043A\u043B\u0438\u0435\u043D\u0442\u0430:</b> ${escapeHtml(order.recipient?.telegram || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D")}
${order.recipient?.email ? `\u2709\uFE0F <b>Email:</b> ${escapeHtml(order.recipient.email)}
` : ""}\u{1F4CD} <b>\u0413\u043E\u0440\u043E\u0434:</b> ${escapeHtml(order.recipient?.city || "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D")}
\u{1F69A} <b>\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430:</b> ${escapeHtml(order.deliveryMethod || "\u0421\u0414\u042D\u041A")}
\u{1F3E0} <b>\u0410\u0434\u0440\u0435\u0441 / \u041F\u0412\u0417:</b> <code>${escapeHtml(order.recipient?.address || "")}</code>
${order.recipient?.comment ? `\u{1F4DD} <b>\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439:</b> <i>${escapeHtml(order.recipient.comment)}</i>
` : ""}
\u{1F4E6} <b>\u0421\u041E\u0421\u0422\u0410\u0412 \u0417\u0410\u041A\u0410\u0417\u0410:</b>
${items || "\u2014"}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4B5} <b>\u0422\u043E\u0432\u0430\u0440\u044B:</b> ${Number(order.totalAmount - (order.deliveryPrice || 0) + (order.discount || 0)).toLocaleString("ru-RU")} \u20BD
${order.discount ? `\u{1F3F7} <b>\u0421\u043A\u0438\u0434\u043A\u0430:</b> -${Number(order.discount).toLocaleString("ru-RU")} \u20BD
` : ""}\u{1F69A} <b>\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430:</b> ${order.deliveryPrice ? `${Number(order.deliveryPrice).toLocaleString("ru-RU")} \u20BD` : "0 \u20BD (\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E)"}
\u{1F4B0} <b>\u0418\u0422\u041E\u0413\u041E \u041A \u041E\u041F\u041B\u0410\u0422\u0415:</b> <b>${Number(order.totalAmount).toLocaleString("ru-RU")} \u20BD</b>
\u{1F4B3} <b>\u0421\u043F\u043E\u0441\u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u044B:</b> \u0421\u0411\u041F / \u041E\u043D\u043B\u0430\u0439\u043D`;
  const buttons = [];
  const clientTg = (order.recipient?.telegram || "").replace("@", "").trim();
  const phone = (order.recipient?.phone || "").replace(/\D/g, "");
  const row1 = [];
  if (clientTg) {
    row1.push({ text: `\u{1F4AC} \u041D\u0430\u043F\u0438\u0441\u0430\u0442\u044C @${clientTg}`, url: `https://t.me/${clientTg}` });
  }
  if (phone) {
    row1.push({ text: "\u{1F4F1} WhatsApp", url: `https://wa.me/${phone}` });
  }
  if (row1.length) {
    buttons.push(row1);
  }
  return { text, buttons };
}
async function sendOrderNotification(order) {
  const config = getTelegramConfig();
  if (!config.enabled || !config.botToken || !config.chatId) {
    return { ok: false, error: "Telegram-\u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B \u0438\u043B\u0438 \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u044B" };
  }
  const { text, buttons } = formatOrderHtml(order);
  return sendTelegramMessage(text, buttons);
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// server/index.ts
var __dirname4 = path4.dirname(fileURLToPath4(import.meta.url));
var PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
var ADMIN_TOKEN = process.env.ADMIN_TOKEN || "parfum-admin-change-me";
var app = express();
app.set("etag", "strong");
app.use(compression({ level: 6 }));
app.use(express.json({ limit: "15mb" }));
function authAdmin(req, res, next) {
  const token = req.headers["x-admin-token"] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.get("/api/meta", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=1200");
  const { meta } = getCatalog();
  res.json(meta);
});
app.get("/api/products", (req, res) => {
  const brands = req.query.brands ? String(req.query.brands).split(",").map((s) => s.trim()).filter(Boolean) : void 0;
  const notes = req.query.notes ? String(req.query.notes).split(",").map((s) => s.trim()).filter(Boolean) : void 0;
  const result = queryProducts({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 24,
    q: req.query.q ? String(req.query.q) : void 0,
    kind: req.query.kind || "all",
    category: req.query.category ? String(req.query.category) : void 0,
    gender: req.query.gender ? String(req.query.gender) : "all",
    brands,
    notes,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : void 0,
    sort: req.query.sort || "popular",
    isHit: req.query.isHit === "1" || req.query.isHit === "true",
    isNew: req.query.isNew === "1" || req.query.isNew === "true",
    isSale: req.query.isSale === "1" || req.query.isSale === "true"
  });
  res.json(result);
});
app.get("/api/products/slug/:slug", (req, res) => {
  const { bySlug } = getCatalog();
  const product = bySlug.get(req.params.slug);
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(
    withResolvedImage({
      ...product,
      notes: product.notes ?? { top: [], heart: [], base: [] },
      allNotes: product.allNotes ?? [],
      concentration: product.concentration ?? (product.kind === "perfume" ? "Eau de Parfum" : "")
    })
  );
});
app.get("/api/products/item/:id", (req, res) => {
  const { byId } = getCatalog();
  const product = byId.get(req.params.id);
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(
    withResolvedImage({
      ...product,
      notes: product.notes ?? { top: [], heart: [], base: [] },
      allNotes: product.allNotes ?? [],
      concentration: product.concentration ?? (product.kind === "perfume" ? "Eau de Parfum" : "")
    })
  );
});
app.get("/api/products/related/:slug", (req, res) => {
  const { bySlug, products } = getCatalog();
  const product = bySlug.get(req.params.slug);
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const related = products.filter((p) => p.id !== product.id && (p.kind === product.kind || p.brand === product.brand)).slice(0, 8).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    minPrice: p.minPrice,
    image: resolveProductImage(p),
    kindLabel: p.kindLabel,
    genderLabel: p.genderLabel,
    categoryName: p.categoryName,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    isHit: p.isHit,
    isNew: p.isNew,
    volumes: p.volumes
  }));
  res.json(related);
});
app.post("/api/products/by-ids", (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const { byId } = getCatalog();
  const items = ids.map((id) => byId.get(id)).filter(Boolean).map((p) => withResolvedImage(p));
  res.json(items);
});
app.get("/api/brands", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=180, stale-while-revalidate=600");
  res.json(
    searchBrands({
      q: req.query.q ? String(req.query.q) : void 0,
      kind: req.query.kind,
      limit: req.query.limit ? Number(req.query.limit) : 80
    })
  );
});
app.get("/api/notes", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=1200");
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  res.json(getPopularNotes({ limit }));
});
app.post("/api/admin/reload", authAdmin, (_req, res) => {
  reloadCatalog();
  res.json({ ok: true, meta: getCatalog().meta });
});
app.post("/api/admin/products", authAdmin, (req, res) => {
  const body = req.body;
  if (!body.name?.trim() || !body.brand?.trim() || !body.sku?.trim()) {
    res.status(400).json({ error: "name, brand, sku \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B" });
    return;
  }
  const kind = body.kind || "other";
  const price = Number(body.minPrice ?? body.volumes?.[0]?.price ?? 0);
  if (!Number.isFinite(price) || price <= 0) {
    res.status(400).json({ error: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0446\u0435\u043D\u0443" });
    return;
  }
  const hash = createHash("md5").update(body.sku).digest("hex").slice(0, 8);
  const id = body.id || `p-${hash}-${body.sku}`;
  const slug = body.slug || `${body.brand}-${body.name}`.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 160) + `-${body.sku}`;
  const vol = body.volumes?.[0] ?? {
    type: "unit",
    label: "1 \u0448\u0442.",
    volumeMl: 1,
    price: Math.round(price),
    inStock: true
  };
  const product = {
    id,
    sku: String(body.sku),
    slug,
    name: body.name.trim(),
    brand: body.brand.trim(),
    kind,
    kindLabel: body.kindLabel || kind,
    category: body.category || kind,
    categoryName: body.categoryName || body.kindLabel || kind,
    gender: body.gender || "unisex",
    genderLabel: body.genderLabel || "\u0423\u043D\u0438\u0441\u0435\u043A\u0441",
    concentration: body.concentration,
    description: body.description || body.name,
    images: body.images?.length ? body.images : ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80"],
    allNotes: body.allNotes || [],
    notes: body.notes,
    longevity: body.longevity,
    sillage: body.sillage,
    isHit: Boolean(body.isHit),
    isNew: Boolean(body.isNew),
    rating: body.rating ?? 5,
    reviewsCount: body.reviewsCount ?? 0,
    minPrice: Math.round(price),
    volumes: [{ ...vol, price: Math.round(vol.price), inStock: vol.inStock !== false }],
    custom: true
  };
  appendCustomProduct(product);
  res.status(201).json(product);
});
app.put("/api/admin/products/:id", authAdmin, (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const { byId } = getCatalog();
  const existing = byId.get(id);
  if (!existing) {
    res.status(404).json({ error: "\u0422\u043E\u0432\u0430\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0435" });
    return;
  }
  let finalImages = Array.isArray(body.images) && body.images.length ? [...body.images] : [...existing.images];
  if (body.imageData && typeof body.imageData === "string" && body.imageData.startsWith("data:image/")) {
    const match = body.imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (match) {
      const ext = match[1] === "png" ? "png" : "jpg";
      const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `custom-${cleanId}-${Date.now()}.${ext}`;
      const filePath = path4.join(__dirname4, "..", "public", "assets", "products", filename);
      fs4.mkdirSync(path4.dirname(filePath), { recursive: true });
      fs4.writeFileSync(filePath, Buffer.from(match[2], "base64"));
      const uploadedUrl = `/assets/products/${filename}`;
      finalImages = [uploadedUrl, ...finalImages.filter((img) => img !== uploadedUrl)];
    }
  } else if (body.imageUrl && typeof body.imageUrl === "string" && body.imageUrl.trim()) {
    const url = body.imageUrl.trim();
    finalImages = [url, ...finalImages.filter((img) => img !== url)];
  }
  const minPrice = body.minPrice !== void 0 ? Number(body.minPrice) : body.volumes?.[0]?.price ?? existing.minPrice;
  const updated = {
    ...existing,
    name: body.name ? body.name.trim() : existing.name,
    brand: body.brand ? body.brand.trim() : existing.brand,
    sku: body.sku ? String(body.sku).trim() : existing.sku,
    description: body.description !== void 0 ? body.description.trim() : existing.description,
    images: finalImages,
    minPrice: Math.round(minPrice),
    oldPrice: body.oldPrice ? Math.round(Number(body.oldPrice)) : void 0,
    discountPercent: body.discountPercent ? Number(body.discountPercent) : void 0,
    volumes: Array.isArray(body.volumes) && body.volumes.length ? body.volumes : existing.volumes,
    notes: body.notes || existing.notes,
    allNotes: body.allNotes || existing.allNotes,
    isHit: body.isHit !== void 0 ? Boolean(body.isHit) : existing.isHit,
    isNew: body.isNew !== void 0 ? Boolean(body.isNew) : existing.isNew,
    gender: body.gender || existing.gender,
    genderLabel: body.genderLabel || existing.genderLabel,
    kind: body.kind || existing.kind,
    kindLabel: body.kindLabel || existing.kindLabel,
    category: body.category || existing.category,
    categoryName: body.categoryName || existing.categoryName,
    concentration: body.concentration || existing.concentration,
    custom: true
  };
  appendCustomProduct(updated);
  res.json({ ok: true, product: updated });
});
app.delete("/api/admin/products/:id", authAdmin, (req, res) => {
  const ok = deleteCustomProduct(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "\u0422\u043E\u0432\u0430\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0438\u043B\u0438 \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u043C" });
    return;
  }
  res.json({ ok: true });
});
app.post("/api/admin/products/:id/image", authAdmin, (req, res) => {
  const { id } = req.params;
  const { imageUrl, imageData } = req.body || {};
  let finalUrl = "";
  if (imageData && typeof imageData === "string" && imageData.startsWith("data:image/")) {
    const match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F" });
      return;
    }
    const ext = match[1] === "png" ? "png" : "jpg";
    const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `custom-${cleanId}.${ext}`;
    const filePath = path4.join(__dirname4, "..", "public", "assets", "products", filename);
    fs4.mkdirSync(path4.dirname(filePath), { recursive: true });
    fs4.writeFileSync(filePath, Buffer.from(match[2], "base64"));
    finalUrl = `/assets/products/${filename}`;
  } else if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) {
    finalUrl = imageUrl.trim();
  } else {
    res.status(400).json({ error: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 imageUrl \u0438\u043B\u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F" });
    return;
  }
  const { byId } = getCatalog();
  const existing = byId.get(id);
  if (!existing) {
    res.status(404).json({ error: "\u0422\u043E\u0432\u0430\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0435" });
    return;
  }
  const updated = {
    ...existing,
    images: [finalUrl, ...(existing.images || []).filter((img) => img !== finalUrl)],
    custom: true
  };
  appendCustomProduct(updated);
  res.json({ ok: true, product: updated });
});
app.get("/api/admin/telegram-config", authAdmin, (_req, res) => {
  res.json({ ok: true, config: getTelegramConfig() });
});
app.post("/api/admin/telegram-config", authAdmin, (req, res) => {
  const updated = saveTelegramConfig(req.body || {});
  res.json({ ok: true, config: updated });
});
app.post("/api/admin/telegram-test", authAdmin, async (_req, res) => {
  const result = await sendTelegramMessage(
    "\u{1F514} <b>\u0422\u0435\u0441\u0442\u043E\u0432\u043E\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0438\u0437 \u0430\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u0438 Parfum Direct!</b>\n\nTelegram-\u0431\u043E\u0442 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D \u0438 \u0433\u043E\u0442\u043E\u0432 \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u043E \u043F\u0440\u0438\u0441\u044B\u043B\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0435 \u0437\u0430\u043A\u0430\u0437\u044B \u0432 \u043B\u0438\u0447\u043D\u044B\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F.",
    [[{ text: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0447\u0430\u0442 \u0441 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u043E\u043C", url: "https://t.me/nikisss2" }]]
  );
  if (!result.ok) {
    res.status(400).json({ ok: false, error: result.error });
    return;
  }
  res.json({ ok: true });
});
app.post("/api/orders/notify-telegram", async (req, res) => {
  const order = req.body;
  if (!order) {
    res.status(400).json({ error: "Order body required" });
    return;
  }
  const result = await sendOrderNotification(order);
  res.json(result);
});
var dist = path4.join(__dirname4, "..", "dist");
var publicDir = path4.join(__dirname4, "..", "public");
if (fs4.existsSync(publicDir)) {
  app.use(
    express.static(publicDir, {
      maxAge: "7d",
      setHeaders: (res, filePath) => {
        if (filePath.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/i)) {
          res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
        }
      }
    })
  );
}
app.use(
  express.static(dist, {
    maxAge: "1y",
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if (filePath.match(/\.(js|css|woff2|woff|ttf)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (filePath.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      }
    }
  })
);
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  const indexHtml = path4.join(dist, "index.html");
  if (fs4.existsSync(indexHtml)) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(indexHtml);
  } else {
    next();
  }
});
app.listen(PORT, () => {
  reloadCatalog();
  const { meta } = getCatalog();
  console.log(`API http://localhost:${PORT} \u2014 \u0442\u043E\u0432\u0430\u0440\u043E\u0432: ${meta.count}`);
});
