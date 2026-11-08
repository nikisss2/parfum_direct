import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

export const PLACEHOLDER_IMAGE = '/assets/placeholder-product.svg';

/** Проверяем, является ли ссылка старой/стоковой/заглушкой */
function isGenericStock(url: string): boolean {
  return (
    !url ||
    url.includes('unsplash.com') ||
    url.includes('perfume-luxury-flacon') ||
    url.includes('placeholder-product')
  );
}

function cleanTitle(str: string): string {
  return str
    .replace(/\[[^\]]*(?:аналог|мотив)[^\]]*\]/gi, '')
    .replace(/\([^\)]*(?:аналог|мотив)[^\)]*\)/gi, '');
}

function normalizeHaystack(p: { brand: string; name: string }): string {
  const cleaned = `${p.brand} ${cleanTitle(p.name)}`;
  return cleaned
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const LOCAL_EXISTS_CACHE = new Map<string, string | null>();
const RESOLVED_IMAGE_CACHE = new Map<string, string>();

/** Локальный файл из public/ или dist/ (с мемоизацией stat) */
function localIfExists(relative: string): string | null {
  const clean = relative.startsWith('/') ? relative.slice(1) : relative;
  if (LOCAL_EXISTS_CACHE.has(clean)) {
    return LOCAL_EXISTS_CACHE.get(clean) ?? null;
  }
  const fullPublic = path.join(PUBLIC, clean);
  if (fs.existsSync(fullPublic)) {
    const res = `/${clean}`;
    LOCAL_EXISTS_CACHE.set(clean, res);
    return res;
  }
  const fullDist = path.join(ROOT, 'dist', clean);
  if (fs.existsSync(fullDist)) {
    const res = `/${clean}`;
    LOCAL_EXISTS_CACHE.set(clean, res);
    return res;
  }
  LOCAL_EXISTS_CACHE.set(clean, null);
  return null;
}

interface ProductRule {
  must: string[];
  anyBrand?: string[];
  anyOf?: string[];
  exclude?: string[];
  file: string;
}

/**
 * Правила сопоставления для самых популярных оригинальных ароматов.
 * Каждый аромат ссылается на свой уникальный оптимизированный локальный файл в /assets/products/
 */
const PRODUCT_RULES: ProductRule[] = [
  // === TOM FORD ===
  { must: ['tom ford', 'black orchid'], file: 'tom-ford-black-orchid.jpg' },
  { must: ['tom ford', 'lost cherry'], file: 'tom-ford-lost-cherry.jpg' },
  { must: ['tom ford', 'tobacco vanille'], file: 'tom-ford-tobacco-vanille.jpg' },
  { must: ['tom ford', 'oud wood'], file: 'tom-ford-oud-wood.jpg' },
  { must: ['tom ford', 'tuscan leather'], file: 'tom-ford-tuscan-leather.jpg' },
  { must: ['tom ford', 'ombre leather'], file: 'tom-ford-ombre-leather.jpg' },
  { must: ['tom ford', 'bitter peach'], file: 'tom-ford-bitter-peach.jpg' },
  { must: ['tom ford', 'soleil blanc'], file: 'tom-ford-soleil-blanc.jpg' },
  { must: ['tom ford', 'neroli portofino'], file: 'tom-ford-neroli-portofino.jpg' },
  { must: ['tom ford', 'beau de jour'], file: 'tom-ford-beau-de-jour.jpg' },
  { must: ['tom ford', 'ebene fume'], file: 'tom-ford-ebene-fume.jpg' },
  { must: ['tom ford', 'rose prick'], file: 'tom-ford-rose-prick.jpg' },
  { must: ['tom ford', 'fabulous'], file: 'tom-ford-fucking-fabulous.jpg' },
  { must: ['tom ford', 'grey vetiver'], file: 'tom-ford-grey-vetiver.jpg' },
  { must: ['tom ford', 'noir extreme'], file: 'tom-ford-noir-extreme.jpg' },

  // === VERSACE ===
  { must: ['versace', 'flame'], file: 'versace-eros-flame.jpg' },
  { must: ['versace', 'eros'], exclude: ['flame'], file: 'versace-eros.jpg' },
  { must: ['versace', 'dylan blue'], file: 'versace-dylan-blue.jpg' },
  { must: ['versace', 'bright crystal'], file: 'versace-bright-crystal.jpg' },
  { must: ['versace', 'crystal noir'], file: 'versace-crystal-noir.jpg' },
  { must: ['versace', 'eau fraiche'], file: 'versace-man-eau-fraiche.jpg' },
  { must: ['versace', 'pour homme'], exclude: ['dylan'], file: 'versace-pour-homme.jpg' },
  { must: ['versace', 'versense'], file: 'versace-versense.jpg' },
  { must: ['versace', 'yellow diamond'], file: 'versace-yellow-diamond.jpg' },

  // === BOSS / HUGO BOSS ===
  { must: ['boss', 'bottled'], file: 'boss-bottled.jpg' },
  { must: ['boss', 'the scent'], file: 'boss-the-scent.jpg' },
  { must: ['boss', 'hugo men'], file: 'boss-hugo-man.jpg' },
  { must: ['hugo boss hugo'], file: 'boss-hugo-man.jpg' },
  { must: ['hugo man'], file: 'boss-hugo-man.jpg' },
  { must: ['boss', 'alive'], file: 'boss-alive.jpg' },
  { must: ['boss', 'femme'], file: 'boss-femme.jpg' },
  { must: ['boss', 'orange'], file: 'boss-orange.jpg' },

  // === AFNAN ===
  { must: ['afnan', '9 pm'], file: 'afnan-9pm.jpg' },
  { must: ['afnan', '9pm'], file: 'afnan-9pm.jpg' },
  { must: ['afnan', '9 am'], file: 'afnan-9am.jpg' },
  { must: ['afnan', '9am'], file: 'afnan-9am.jpg' },
  { must: ['afnan', 'supremacy silver'], file: 'afnan-supremacy-silver.jpg' },
  { must: ['afnan', 'not only intense'], file: 'afnan-supremacy-noi.jpg' },
  { must: ['afnan', 'in oud'], file: 'afnan-supremacy-in-oud.jpg' },
  { must: ['afnan', 'in heaven'], file: 'afnan-supremacy-in-heaven.jpg' },
  { must: ['afnan', 'rare carbon'], file: 'afnan-rare-carbon.jpg' },
  { must: ['afnan', 'turathi blue'], file: 'afnan-turathi-blue.jpg' },

  // === ARMAF ===
  { must: ['armaf', 'club de nuit'], anyOf: ['woman', 'женск', 'женщ', 'femme'], file: 'armaf-club-de-nuit-woman.jpg' },
  { must: ['armaf'], anyOf: ['white imperiale', 'imperiale', 'imperial'], file: 'arab-armaf-armaf-club-de-nuit-white-imperiale.jpg' },
  { must: ['armaf', 'milestone'], file: 'armaf-milestone.jpg' },
  { must: ['armaf', 'sillage'], file: 'armaf-sillage.jpg' },
  { must: ['armaf', 'untold'], file: 'armaf-untold.jpg' },
  { must: ['armaf', 'iconic'], file: 'armaf-iconic.jpg' },
  { must: ['armaf', 'club de nuit'], exclude: ['woman', 'женск', 'женщ', 'femme', 'white imperiale', 'imperiale', 'imperial', 'milestone', 'sillage', 'untold', 'iconic'], file: 'armaf-club-de-nuit.jpg' },

  // === BURBERRY ===
  { must: ['burberry', 'hero'], file: 'burberry-hero.jpg' },
  { must: ['burberry', 'goddess'], file: 'burberry-goddess.jpg' },
  { must: ['burberry', 'her'], exclude: ['hero', 'other'], file: 'burberry-her.jpg' },
  { must: ['burberry', 'london'], file: 'burberry-london.jpg' },
  { must: ['burberry', 'brit'], file: 'burberry-brit.jpg' },
  { must: ['burberry', 'touch'], file: 'burberry-touch.jpg' },
  { must: ['burberry', 'weekend'], file: 'burberry-weekend.jpg' },

  // === MANCERA ===
  { must: ['mancera', 'cedrat boise'], file: 'mancera-cedrat-boise.jpg' },
  { must: ['mancera', 'red tobacco'], file: 'mancera-red-tobacco.jpg' },
  { must: ['mancera', 'roses vanille'], file: 'mancera-roses-vanille.jpg' },
  { must: ['mancera', 'instant crush'], file: 'mancera-instant-crush.jpg' },
  { must: ['mancera', 'amore caffe'], file: 'mancera-amore-caffe.jpg' },
  { must: ['mancera', 'tonka cola'], file: 'mancera-tonka-cola.jpg' },
  { must: ['mancera', 'hindu kush'], file: 'mancera-hindu-kush.jpg' },
  { must: ['mancera', 'holidays'], file: 'mancera-holidays.jpg' },

  // === CLIVE CHRISTIAN ===
  { must: ['clive christian', 'no 1'], file: 'clive-christian-no1.jpg' },
  { must: ['clive christian', '1872'], file: 'clive-christian-1872.jpg' },
  { must: ['clive christian', 'crab apple'], file: 'clive-christian-crab-apple.jpg' },
  { must: ['clive christian', 'matsukita'], file: 'clive-christian-matsukita.jpg' },
  { must: ['clive christian', 'jump up'], file: 'clive-christian-jump-up.jpg' },
  { must: ['clive christian', 'woody leather'], file: 'clive-christian-c-woody.jpg' },
  { must: ['clive christian', 'x '], file: 'clive-christian-x.jpg' },
  { must: ['clive christian', 'x masculine'], file: 'clive-christian-x.jpg' },
  { must: ['clive christian', 'x feminine'], file: 'clive-christian-x.jpg' },

  // === CHRISTIAN DIOR ===
  { must: ['sauvage', 'elixir'], anyBrand: ['dior', 'c dior', 'c.dior'], file: 'dior-sauvage-elixir.jpg' },
  { must: ['dior', 'sauvage'], exclude: ['elixir'], file: 'dior-sauvage.jpg' },
  { must: ['c dior', 'sauvage'], exclude: ['elixir'], file: 'dior-sauvage.jpg' },
  { must: ['dior', 'homme'], file: 'dior-homme.jpg' },
  { must: ['dior', 'fahrenheit'], file: 'dior-fahrenheit.jpg' },
  { must: ['dior', 'j adore'], file: 'dior-jadore.jpg' },
  { must: ['dior', 'jadore'], file: 'dior-jadore.jpg' },
  { must: ['dior', 'miss dior'], file: 'dior-miss-dior.jpg' },
  { must: ['dior', 'poison'], file: 'dior-hypnotic-poison.jpg' },

  // === PACO RABANNE ===
  { must: ['1 million', 'royal'], anyBrand: ['rabanne', 'paco rabanne'], file: 'rabanne-1-million-royal.jpg' },
  { must: ['million', 'royal'], anyBrand: ['rabanne', 'paco rabanne'], file: 'rabanne-1-million-royal.jpg' },
  { must: ['1 million', 'elixir'], anyBrand: ['rabanne', 'paco rabanne'], file: 'rabanne-1-million-elixir.jpg' },
  { must: ['million', 'elixir'], anyBrand: ['rabanne', 'paco rabanne'], file: 'rabanne-1-million-elixir.jpg' },
  { must: ['1 million', 'lucky'], anyBrand: ['rabanne', 'paco rabanne'], file: 'rabanne-1-million-lucky.jpg' },
  { must: ['1 million', 'golden oud'], anyBrand: ['rabanne', 'paco rabanne'], file: 'rabanne-1-million-golden-oud.jpg' },
  { must: ['1 million'], anyBrand: ['rabanne', 'paco rabanne'], exclude: ['royal', 'elixir', 'lucky', 'black', 'golden', 'prive', 'intense'], file: 'rabanne-1-million.jpg' },
  { must: ['million'], anyBrand: ['rabanne', 'paco rabanne'], exclude: ['royal', 'elixir', 'lucky', 'black', 'golden', 'prive', 'intense'], file: 'rabanne-1-million.jpg' },

  // === JEAN PAUL GAULTIER ===
  { must: ['le male', 'elixir'], anyBrand: ['gaultier', 'jean paul'], file: 'jean-paul-gaultier-le-male-elixir.jpg' },
  { must: ['le male', 'parfum'], anyBrand: ['gaultier', 'jean paul'], file: 'jean-paul-gaultier-le-male-le-parfum.jpg' },
  { must: ['le male'], anyBrand: ['gaultier', 'jean paul'], exclude: ['elixir', 'parfum', 'ultra', 'beau'], file: 'jean-paul-gaultier-le-male.jpg' },

  // === THOMAS KOSMALA ===
  { must: ['thomas kosmala', 'apres'], file: 'thomas-kosmala-no4.jpg' },
  { must: ['thomas kosmala', 'no 4'], exclude: ['candy', 'sport'], file: 'thomas-kosmala-no4.jpg' },
  { must: ['thomas kosmala', 'candy'], file: 'thomas-kosmala-candy.jpg' },
  { must: ['thomas kosmala', 'desir du coeur'], file: 'thomas-kosmala-no10.jpg' },
  { must: ['thomas kosmala', 'no 10'], file: 'thomas-kosmala-no10.jpg' },
  { must: ['thomas kosmala', 'no10'], file: 'thomas-kosmala-no10.jpg' },
  { must: ['thomas kosmala', 'no 7'], file: 'thomas-kosmala-no7.jpg' },
  { must: ['thomas kosmala', 'le sel'], file: 'thomas-kosmala-no7.jpg' },
  { must: ['thomas kosmala', 'no 2'], file: 'thomas-kosmala-no2.jpg' },
  { must: ['thomas kosmala', 'seve nouvelle'], file: 'thomas-kosmala-no2.jpg' },
  { must: ['thomas kosmala', 'no 3'], file: 'thomas-kosmala-no3.jpg' },
  { must: ['thomas kosmala', 'crepuscule ardent'], file: 'thomas-kosmala-no3.jpg' },

  // === CREED ===
  { must: ['absolu aventus'], file: 'creed-absolu-aventus.jpg' },
  { must: ['creed', 'absolu'], file: 'creed-absolu-aventus.jpg' },
  { must: ['creed', 'cologne'], anyOf: ['aventus', 'cologne'], file: 'creed-aventus-cologne.jpg' },
  { must: ['creed', 'aventus for her'], file: 'creed-aventus-for-her.jpg' },
  { must: ['creed', 'aventus'], anyOf: ['for her', 'женск', 'женщ', 'femme'], file: 'creed-aventus-for-her.jpg' },
  { must: ['creed', 'aventus'], exclude: ['absolu', 'cologne', 'for her', 'женск', 'женщ', 'femme'], file: 'creed-aventus.jpg' },
  { must: ['creed', 'silver mountain'], file: 'creed-silver-mountain.jpg' },
  { must: ['creed', 'green irish tweed'], file: 'creed-green-irish-tweed.jpg' },
  { must: ['creed', 'millesime imperial'], file: 'creed-millesime-imperial.jpg' },
  { must: ['creed', 'virgin island'], file: 'creed-virgin-island.jpg' },

  // === KILIAN ===
  { must: ['kilian', 'good girl', 'extreme'], file: 'by-kilian-good-girl-gone-bad-extreme.jpg' },
  { must: ['kilian', 'good girl', 'fraiche'], file: 'by-kilian-good-girl-gone-bad-eau-fraiche.jpg' },
  { must: ['kilian', 'good girl'], exclude: ['extreme', 'fraiche', 'eau fraiche', 'hair', 'splash'], file: 'by-kilian-good-girl-gone-bad.jpg' },
  { must: ['kilian', 'angel', 'rocks'], file: 'by-kilian-angels-share-on-the-rocks.jpg' },
  { must: ['kilian', 'angel', 'paradis'], file: 'by-kilian-angels-share-paradis.jpg' },
  { must: ['kilian', 'angel'], exclude: ['rocks', 'paradis', 'feux'], file: 'by-kilian-angels-share.jpg' },
  { must: ['kilian', 'apple brandy', 'rocks'], file: 'by-kilian-apple-brandy-on-the-rocks.jpg' },
  { must: ['kilian', 'apple brandy'], exclude: ['rocks'], file: 'by-kilian-apple-brandy.jpg' },
  { must: ['kilian', 'love', 'extreme'], file: 'by-kilian-love-don-t-be-shy-extreme.jpg' },
  { must: ['kilian', 'black phantom'], file: 'kilian-black-phantom.jpg' },
  { must: ['kilian', 'don t be shy'], exclude: ['extreme', 'fraiche'], file: 'kilian-love-dont-be-shy.jpg' },
  { must: ['kilian', 'back to black'], file: 'by-kilian-back-to-black.jpg' },

  // === MAISON FRANCIS KURKDJIAN ===
  { must: ['baccarat'], file: 'mfk-baccarat-540.jpg' },
  { must: ['grand soir'], file: 'mfk-grand-soir.jpg' },
  { must: ['gentle fluidity'], file: 'mfk-gentle-fluidity.jpg' },
  { must: ['satin mood'], file: 'mfk-oud-satin-mood.jpg' },
  { must: ['silk mood'], file: 'mfk-oud-silk-mood.jpg' },

  // === XERJOFF ===
  { must: ['xerjoff', 'erba pura'], file: 'xerjoff-erba-pura.jpg' },
  { must: ['erba pura'], anyBrand: ['xerjoff'], file: 'xerjoff-erba-pura.jpg' },
  { must: ['xerjoff', 'erba gold'], file: 'xerjoff-erba-gold.jpg' },
  { must: ['xerjoff', 'naxos'], file: 'xerjoff-naxos.jpg' },
  { must: ['1861 naxos'], file: 'xerjoff-naxos.jpg' },
  { must: ['xerjoff', 'alexandria'], file: 'xerjoff-alexandria-ii.jpg' },
  { must: ['lira'], anyBrand: ['xerjoff', 'casamorati'], file: 'xerjoff-casamorati-lira.jpg' },
  { must: ['dama bianca'], anyBrand: ['xerjoff', 'casamorati'], file: 'xerjoff-casamorati-dama-bianca.jpg' },
  { must: ['bouquet ideale'], anyBrand: ['xerjoff', 'casamorati'], file: 'xerjoff-casamorati-bouquet-ideale.jpg' },
  { must: ['italica'], anyBrand: ['xerjoff', 'casamorati'], file: 'xerjoff-casamorati-italica.jpg' },
  { must: ['mefisto', 'gentiluomo'], anyBrand: ['xerjoff', 'casamorati'], file: 'xerjoff-casamorati-mefisto-gentiluomo.jpg' },
  { must: ['mefisto'], anyBrand: ['xerjoff', 'casamorati'], exclude: ['gentiluomo'], file: 'xerjoff-casamorati-mefisto.jpg' },
  { must: ['tony iommi'], file: 'xerjoff-tony-iommi.jpg' },

  // === LATTAFA ===
  { must: ['lattafa', 'khamrah', 'qahwa'], file: 'lattafa-perfumes-khamrah-qahwa.jpg' },
  { must: ['lattafa', 'khamrah'], exclude: ['qahwa', 'dukhan'], file: 'lattafa-khamrah.jpg' },
  { must: ['lattafa', 'asad', 'zanzibar'], file: 'lattafa-perfumes-asad-zanzibar.jpg' },
  { must: ['lattafa', 'asad'], exclude: ['zanzibar'], file: 'lattafa-asad.jpg' },
  { must: ['lattafa', 'yara', 'candy'], file: 'lattafa-perfumes-yara-candy.jpg' },
  { must: ['lattafa', 'yara', 'tous'], file: 'lattafa-perfumes-yara-tous.jpg' },
  { must: ['lattafa', 'yara', 'moi'], file: 'lattafa-perfumes-yara-moi.jpg' },
  { must: ['lattafa', 'yara'], exclude: ['candy', 'tous', 'moi'], file: 'lattafa-yara.jpg' },
  { must: ['lattafa', 'bade'], file: 'lattafa-badee-al-oud.jpg' },

  // === MONTALE ===
  { must: ['montale', 'arabians tonka'], file: 'montale-arabians-tonka.jpg' },
  { must: ['montale', 'chocolate greedy'], file: 'montale-chocolate-greedy.jpg' },
  { must: ['montale', 'intense cafe'], file: 'montale-intense-cafe.jpg' },
  { must: ['montale', 'roses musk'], file: 'montale-roses-musk.jpg' },
  { must: ['montale', 'black aoud'], file: 'montale-black-aoud.jpg' },
  { must: ['montale', 'soleil de capri'], file: 'montale-soleil-de-capri.jpg' },
  { must: ['montale', 'wild pears'], file: 'montale-wild-pears.jpg' },

  // === INITIO ===
  { must: ['initio', 'side effect'], file: 'initio-side-effect.jpg' },
  { must: ['initio', 'oud for greatness'], file: 'initio-oud-for-greatness.jpg' },
  { must: ['initio', 'musk therapy'], file: 'initio-musk-therapy.jpg' },
  { must: ['initio', 'atomic rose'], file: 'initio-atomic-rose.jpg' },

  // === BYREDO ===
  { must: ['byredo', 'bal d afrique'], file: 'byredo-bal-dafrique.jpg' },
  { must: ['byredo', 'blanche'], file: 'byredo-blanche.jpg' },
  { must: ['byredo', 'gypsy water'], file: 'byredo-gypsy-water.jpg' },
  { must: ['byredo', 'mojave ghost'], file: 'byredo-mojave-ghost.jpg' },

  // === PARFUMS DE MARLY ===
  { must: ['marly', 'layton'], file: 'pdm-layton.jpg' },
  { must: ['marly', 'delina'], file: 'pdm-delina.jpg' },
  { must: ['marly', 'althair'], file: 'pdm-althair.jpg' },
  { must: ['marly', 'pegasus', 'exclusif'], file: 'pdm-pegasus-exclusif.jpg' },
  { must: ['marly', 'pegasus'], exclude: ['exclusif'], file: 'pdm-pegasus.jpg' },
  { must: ['marly', 'percival'], file: 'pdm-percival.jpg' },
  { must: ['marly', 'herod'], file: 'pdm-herod.jpg' },
  { must: ['marly', 'haltane'], file: 'pdm-haltane.jpg' },
  { must: ['marly', 'valaya'], file: 'pdm-valaya.jpg' },

  // === CHANEL ===
  { must: ['chanel', 'bleu'], file: 'chanel-bleu.jpg' },
  { must: ['chanel', 'no 5'], file: 'chanel-no5.jpg' },
  { must: ['chanel', 'no5'], file: 'chanel-no5.jpg' },
  { must: ['chanel', 'coco mademoiselle'], file: 'chanel-coco-mademoiselle.jpg' },
  { must: ['chanel', 'chance'], file: 'chanel-chance.jpg' },
  { must: ['chanel', 'allure homme sport'], file: 'chanel-allure-homme-sport.jpg' },

  // === YVES SAINT LAURENT (YSL) ===
  { must: ['libre'], anyBrand: ['ysl', 'saint laurent', 'yves saint'], file: 'ysl-libre.jpg' },
  { must: ['black opium'], anyBrand: ['ysl', 'saint laurent', 'yves saint'], file: 'ysl-black-opium.jpg' },
  { must: ['la nuit de l homme'], file: 'ysl-la-nuit.jpg' },
  { must: ['y '], anyBrand: ['ysl', 'saint laurent', 'yves saint'], file: 'ysl-y.jpg' },

  // === AMOUAGE ===
  { must: ['guidance', '46'], anyBrand: ['amouage'], file: 'amouage-guidance-46.jpg' },
  { must: ['amouage', 'guidance', '46'], file: 'amouage-guidance-46.jpg' },
  { must: ['guidance'], anyBrand: ['amouage'], exclude: ['46'], file: 'amouage-guidance.jpg' },
  { must: ['amouage', 'guidance'], exclude: ['46'], file: 'amouage-guidance.jpg' },
  { must: ['interlude', '53'], anyBrand: ['amouage'], file: 'amouage-interlude-53-man.jpg' },
  { must: ['interlude', 'black iris'], anyBrand: ['amouage'], file: 'amouage-interlude-black-iris.jpg' },
  { must: ['interlude', 'woman'], anyBrand: ['amouage'], file: 'amouage-interlude-woman.jpg' },
  { must: ['interlude'], anyBrand: ['amouage'], exclude: ['black iris', 'black', 'iris', '53', 'woman'], file: 'amouage-interlude-man.jpg' },
  { must: ['amouage', 'interlude'], exclude: ['black iris', 'black', 'iris', '53', 'woman'], file: 'amouage-interlude-man.jpg' },
  { must: ['reflection', '45'], anyBrand: ['amouage'], file: 'amouage-reflection-45-man.jpg' },
  { must: ['reflection', 'woman'], anyBrand: ['amouage'], file: 'amouage-reflection-woman.jpg' },
  { must: ['reflection'], anyBrand: ['amouage'], exclude: ['45', 'woman'], file: 'amouage-reflection-man.jpg' },
  { must: ['amouage', 'reflection'], exclude: ['45', 'woman'], file: 'amouage-reflection-man.jpg' },

  // === FRENCH AVENUE ===
  { must: ['royal blend'], anyBrand: ['french avenue', 'fragrance world'], exclude: ['nero', 'bourbon', 'sequoia', 'vintage'], file: 'french-avenue-royal-blend.jpg' },
  { must: ['french avenue', 'royal blend'], exclude: ['nero', 'bourbon', 'sequoia', 'vintage'], file: 'french-avenue-royal-blend.jpg' },
  { must: ['after effect'], anyBrand: ['french avenue', 'fragrance world'], file: 'french-avenue-after-effect.jpg' },
  { must: ['french avenue', 'after effect'], file: 'french-avenue-after-effect.jpg' },

  // === MARC-ANTOINE BARROIS ===
  { must: ['ganymede', 'extrait'], anyBrand: ['barrois', 'marc antoine', 'marc-antoine'], file: 'barrois-ganymede-extrait.jpg' },
  { must: ['ganymede'], anyBrand: ['barrois', 'marc antoine', 'marc-antoine'], exclude: ['extrait'], file: 'barrois-ganymede.jpg' },
  { must: ['barrois', 'ganymede'], exclude: ['extrait'], file: 'barrois-ganymede.jpg' },
  { must: ['b683', 'extrait'], anyBrand: ['barrois', 'marc antoine', 'marc-antoine'], file: 'barrois-b683-extrait.jpg' },
  { must: ['b683'], anyBrand: ['barrois', 'marc antoine', 'marc-antoine'], exclude: ['extrait'], file: 'barrois-b683.jpg' },
];

// Загрузка дополнительных правил (включая все ароматы из scripts/curated-image-rules.json)
function loadAllRules(): ProductRule[] {
  const jsonPath = path.join(ROOT, 'scripts', 'curated-image-rules.json');
  let list: ProductRule[] = [];
  if (fs.existsSync(jsonPath)) {
    try {
      list = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as ProductRule[];
    } catch {
      list = [];
    }
  }

  const all: ProductRule[] = [];

  // Добавляем все правила из curated-image-rules.json
  for (const item of list) {
    all.push(item);
  }

  // Добавляем ручные правила PRODUCT_RULES
  for (const item of PRODUCT_RULES) {
    all.push(item);
  }

  // Сортировка по специфичности:
  // 1. Правила с большим числом must-токенов проверяются первыми (фланкеры и точные модели)
  // 2. Правила без exclude идут раньше правил с exclude при одинаковой длине must
  // 3. Общая длина строк must по убыванию
  all.sort((a, b) => {
    const aCount = a.must?.length || 0;
    const bCount = b.must?.length || 0;
    if (bCount !== aCount) return bCount - aCount;

    const aHasEx = (a.exclude?.length || 0) > 0 ? 1 : 0;
    const bHasEx = (b.exclude?.length || 0) > 0 ? 1 : 0;
    if (aHasEx !== bHasEx) return aHasEx - bHasEx;

    const aLen = (a.must || []).join('').length;
    const bLen = (b.must || []).join('').length;
    return bLen - aLen;
  });

  return all;
}

const ALL_PRODUCT_RULES = loadAllRules();

// Индексация всех 3500+ файлов изображений из public/assets/products для быстрого интеллектуального поиска
interface IndexedProductFile {
  file: string;
  tokens: string[];
}

function loadAllProductFiles(): IndexedProductFile[] {
  const dir = path.join(PUBLIC, 'assets', 'products');
  if (!fs.existsSync(dir)) return [];
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    return files.map(f => {
      const base = f.replace(/\.(jpg|png)$/i, '').replace(/^arab-/, '');
      const tokens = Array.from(
        new Set(base.split('-').filter(t => t.length > 1 && !/^\d+$/.test(t)))
      );
      return { file: f, tokens };
    });
  } catch {
    return [];
  }
}

export function fileBelongsToBrand(fileName: string, brandLower: string, _hay?: string): boolean {
  if (!fileName || !brandLower) return false;
  const b = brandLower.toLowerCase().trim();
  const f = fileName.toLowerCase().replace(/\.(jpg|png)$/i, '');
  const cleanF = f.startsWith('arab-') ? f.slice(5) : f;

  // 1. Zielinski & Rozen
  if (b.includes('zielinski') || b.includes('зелински') || b.includes('rozen')) {
    return cleanF.startsWith('zielinski');
  }

  // 2. Parfums de Marly (строго изолирован от Essential Parfums!)
  if (b === 'parfums de marly' || b === 'marly') {
    return cleanF.startsWith('pdm-') || cleanF.startsWith('parfums-de-marly-') || cleanF.startsWith('marly-');
  }

  // 3. Essential Parfums
  if (b === 'essential parfums' || b === 'essential') {
    return cleanF.startsWith('essential-parfums-') || cleanF.startsWith('essential-');
  }

  // 4. Kilian
  if (b.includes('kilian')) {
    return cleanF.startsWith('by-kilian-') || cleanF.startsWith('kilian-');
  }

  // 5. Maison Francis Kurkdjian
  if (b.includes('kurkdjian') || b === 'mfk') {
    return cleanF.startsWith('mfk-') || cleanF.startsWith('maison-francis-kurkdjian-');
  }

  // 6. Maison Margiela / Replica
  if (b.includes('margiela') || b.includes('replica')) {
    return cleanF.startsWith('replica-') || cleanF.startsWith('maison-margiela-');
  }

  // 7. Marc-Antoine Barrois
  if (b.includes('barrois')) {
    return cleanF.startsWith('barrois-') || cleanF.startsWith('marc-antoine-barrois-');
  }

  // 8. M.Micallef
  if (b.includes('micallef')) {
    return cleanF.startsWith('m-micallef-') || cleanF.startsWith('micallef-');
  }

  // 9. Franck Boclet
  if (b.includes('boclet')) {
    return cleanF.startsWith('franck-boclet-') || cleanF.startsWith('boclet-');
  }

  // 10. Antonio Banderas
  if (b.includes('banderas')) {
    return cleanF.startsWith('antonio-banderas-') || cleanF.startsWith('banderas-');
  }

  // 11. Antonio Maretti
  if (b.includes('maretti')) {
    return cleanF.startsWith('antonio-maretti-') || cleanF.startsWith('maretti-');
  }

  // 12. Dolce & Gabbana
  if (b.includes('dolce') || b === 'd&g') {
    return cleanF.startsWith('dolce-') || cleanF.startsWith('d-and-g-');
  }

  // 13. Yves Saint Laurent
  if (b.includes('saint laurent') || b === 'ysl' || b.includes('yves saint')) {
    return cleanF.startsWith('ysl-') || cleanF.startsWith('yves-saint-laurent-');
  }

  // 14. Giorgio Armani / Emporio Armani
  if (b.includes('armani')) {
    return cleanF.startsWith('armani-') || cleanF.startsWith('giorgio-armani-') || cleanF.startsWith('emporio-armani-');
  }

  // 15. Christian Dior
  if (b.includes('dior')) {
    return cleanF.startsWith('dior-');
  }

  // 15. The House of Oud
  if (b.includes('house of oud') || b === 'thoo') {
    return cleanF.startsWith('the-house-of-oud-') || cleanF.startsWith('house-of-oud-') || cleanF.startsWith('thoo-');
  }

  // 16. Les Liquides Imaginaires
  if (b.includes('liquides imaginaires') || b.includes('liquides')) {
    return cleanF.startsWith('les-liquides-imaginaires-') || cleanF.startsWith('liquides-imaginaires-');
  }

  // 17. Hugo Boss
  if (b.includes('boss')) {
    return cleanF.startsWith('boss-') || cleanF.startsWith('hugo-boss-');
  }

  // 18. Maison Alhambra
  if (b.includes('alhambra')) {
    return cleanF.startsWith('maison-alhambra-') || cleanF.startsWith('alhambra-');
  }

  // 18. Общее правило префикса бренда: slug бренда должен быть в начале имени файла
  const slug = b
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length >= 3) {
    if (cleanF.startsWith(slug + '-') || cleanF === slug) return true;
    const firstWord = slug.split('-')[0];
    if (firstWord && firstWord.length >= 4 && (cleanF.startsWith(firstWord + '-') || cleanF === firstWord)) {
      const generic = ['parfums', 'maison', 'collection', 'atelier', 'paris', 'laboratorio', 'royal'];
      if (!generic.includes(firstWord)) {
        return true;
      }
    }
  }

  return false;
}

const INDEXED_PRODUCT_FILES = loadAllProductFiles();

// Эталонные флаконы для ключевых парфюмерных брендов (если конкретный фланкер не найден)
const BRAND_SIGNATURE_FLACONS: Record<string, string> = {
  'zielinski & rozen': '/assets/products/zielinski-rozen-signature.jpg',
  'zielinski': '/assets/products/zielinski-rozen-signature.jpg',
  'зелински': '/assets/products/zielinski-rozen-signature.jpg',
  'dior': '/assets/products/dior-sauvage.jpg',
  'christian dior': '/assets/products/dior-sauvage.jpg',
  'armani': '/assets/products/armani-acqua-di-gio.jpg',
  'giorgio armani': '/assets/products/armani-acqua-di-gio.jpg',
  'carolina herrera': '/assets/products/carolina-herrera-good-girl-supreme.jpg',
  'guerlain': '/assets/products/guerlain-mon-guerlain.jpg',
  'givenchy': '/assets/products/givenchy-l-interdit.jpg',
  'chanel': '/assets/products/chanel-bleu-de-chanel.jpg',
  'tom ford': '/assets/products/tom-ford-lost-cherry.jpg',
  'creed': '/assets/products/creed-aventus.jpg',
  'xerjoff': '/assets/products/xerjoff-erba-pura.jpg',
  'byredo': '/assets/products/byredo-bal-d-afrique.jpg',
  'amouage': '/assets/products/amouage-guidance.jpg',
  'kilian': '/assets/products/by-kilian-angels-share.jpg',
  'by kilian': '/assets/products/by-kilian-angels-share.jpg',
  'ex nihilo': '/assets/products/ex-nihilo-fleur-narcotique.jpg',
  'kurkdjian': '/assets/products/mfk-baccarat-540.jpg',
  'maison francis kurkdjian': '/assets/products/mfk-baccarat-540.jpg',
  'replica': '/assets/products/replica-jazz-club.jpg',
  'maison margiela': '/assets/products/replica-jazz-club.jpg',
  'mancera': '/assets/products/mancera-cedrat-boise.jpg',
  'montale': '/assets/products/montale-roses-musk.jpg',
  'barrois': '/assets/products/barrois-ganymede.jpg',
  'marc-antoine barrois': '/assets/products/barrois-ganymede.jpg',
  'parfums de marly': '/assets/products/pdm-delina.jpg',
  'marly': '/assets/products/pdm-delina.jpg',
  'initio': '/assets/products/initio-oud-for-greatness.jpg',
  'initio parfums': '/assets/products/initio-oud-for-greatness.jpg',
  'roja': '/assets/products/roja-dove-elysium-pour-femme.jpg',
  'roja dove': '/assets/products/roja-dove-elysium-pour-femme.jpg',
  'le labo': '/assets/products/le-labo-santal-33.jpg',
  'vilhelm': '/assets/products/vilhelm-parfumerie-mango-skin.jpg',
  'vilhelm parfumerie': '/assets/products/vilhelm-parfumerie-mango-skin.jpg',
  'jo malone': '/assets/products/jo-malone-wood-sage-sea-salt.jpg',
  'lattafa': '/assets/products/lattafa-khamrah.jpg',
  'lattafa perfumes': '/assets/products/lattafa-khamrah.jpg',
  'afnan': '/assets/products/afnan-9pm.jpg',
  'armaf': '/assets/products/armaf-club-de-nuit.jpg',
  'calvin klein': '/assets/products/calvin-klein-ck-one.jpg',
  'lancome': '/assets/products/lancome-la-vie-est-belle.jpg',
  'cartier': '/assets/products/cartier-declaration.jpg',
  'chloe': '/assets/products/chloe-eau-de-parfum.jpg',
  'victorias secret': '/assets/products/victorias-secret-bombshell.jpg',
  'victoria`s': '/assets/products/victorias-secret-bombshell.jpg',
  'kenzo': '/assets/products/kenzo-l-eau-kenzo.jpg',
  'versace': '/assets/products/versace-bright-crystal.jpg',
  'burberry': '/assets/products/burberry-her.jpg',
  'paco rabanne': '/assets/products/rabanne-1-million.jpg',
  'rabanne': '/assets/products/rabanne-1-million.jpg',
  'jean paul gaultier': '/assets/products/jean-paul-gaultier-le-male.jpg',
  'gaultier': '/assets/products/jean-paul-gaultier-le-male.jpg',
  'ysl': '/assets/products/ysl-libre.jpg',
  'yves saint laurent': '/assets/products/ysl-libre.jpg',
  'hermes': '/assets/products/hermes-terre-d-hermes.jpg',
  'boss': '/assets/products/boss-bottled.jpg',
  'hugo boss': '/assets/products/boss-bottled.jpg',
  'louis vuitton': '/assets/products/louis-vuitton-afternoon-swim.jpg',
  'louis vitton': '/assets/products/louis-vuitton-afternoon-swim.jpg',
  'gritti': '/assets/products/gritti-adele.jpg',
  'dr gritti': '/assets/products/gritti-adele.jpg',
  'ormonde': '/assets/products/ormonde-jayne-montabaco.jpg',
  'ormonde jayne': '/assets/products/ormonde-jayne-montabaco.jpg',
  'les liquides': '/assets/products/les-liquides-imaginaires-fortis.jpg',
  'les liquides imaginaires': '/assets/products/les-liquides-imaginaires-fortis.jpg',
  'house of oud': '/assets/products/the-house-of-oud-dates-delight.jpg',
  'the house of oud': '/assets/products/the-house-of-oud-dates-delight.jpg',
  'franck boclet': '/assets/products/franck-boclet-cocaine.jpg',
  'micallef': '/assets/products/m-micallef-ananda.jpg',
  'm.micallef': '/assets/products/m-micallef-ananda.jpg',
  'boadicea': '/assets/products/boadicea-the-victorious-blue-sapphire.jpg',
  'boadicea the victorious': '/assets/products/boadicea-the-victorious-blue-sapphire.jpg',
  'loewe': '/assets/products/loewe-001-man.jpg',
  'pierre guillaume': '/assets/products/pierre-guillaume-paris-musc-maori.jpg',
  'antonio banderas': '/assets/products/antonio-banderas-blue-seduction.jpg',
  'antonio maretti': '/assets/products/antonio-maretti-almost-a-virgin.jpg',
  'alhambra': '/assets/products/maison-alhambra-tobacco-touch.jpg',
  'maison alhambra': '/assets/products/maison-alhambra-tobacco-touch.jpg',
  'salvatore ferragamo': '/assets/products/salvatore-ferragamo-uomo.jpg',
  'laboratorio olfattivo': '/assets/products/laboratorio-olfattivo-needle.jpg',
  'lalique': '/assets/products/lalique-encre-noire.jpg',
  'trussardi': '/assets/products/trussardi-donna.jpg',
  'estee lauder': '/assets/products/estee-lauder-pleasures.jpg',
  'boucheron': '/assets/products/boucheron-quatre.jpg',
  'van cleef': '/assets/products/van-cleef-arpels-bois-d-iris.jpg',
  'carner barcelona': '/assets/products/carner-barcelona-tardes.jpg',
  'essential parfums': '/assets/products/essential-parfums-bois-imperial.jpg',
  'state of mind': '/assets/products/state-of-mind-aesthetic-turbulence.jpg',
  'frederic malle': '/assets/products/frederic-malle-portrait-of-a-lady.jpg',
  'serge lutens': '/assets/products/serge-lutens-chergui.jpg',
  'penhaligon': '/assets/products/penhaligons-the-tragedy-of-lord-george.jpg',
};

function resolveCategoryFallback(
  _kind: string | undefined,
  _hay: string,
  _nameLower: string,
  _brandLower: string
): string {
  // Для всех остальных категорий (уход за кожей, волосами, макияж, тело) при отсутствии индивидуального фото
  // отдаем лаконичную векторную заглушку "Здесь скоро будет фотография"
  return PLACEHOLDER_IMAGE;
}

export function resolveProductImage(p: {
  name: string;
  brand: string;
  images?: string[];
  kind?: string;
  custom?: boolean;
}): string {
  const cacheKey = `${p.custom ? '1' : '0'}|${p.kind || ''}|${p.brand || ''}|${p.name || ''}|${p.images?.[0] || ''}`;
  const cached = RESOLVED_IMAGE_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  const result = resolveProductImageUncached(p);
  if (RESOLVED_IMAGE_CACHE.size > 50000) {
    RESOLVED_IMAGE_CACHE.clear();
  }
  RESOLVED_IMAGE_CACHE.set(cacheKey, result);
  return result;
}

function resolveProductImageUncached(p: {
  name: string;
  brand: string;
  images?: string[];
  kind?: string;
  custom?: boolean;
}): string {
  // 1. Если товар пользовательский и ссылка не стоковая — сохраняем
  const stored = p.images?.[0];
  if (stored && p.custom && !isGenericStock(stored)) return stored;

  // 2. Если уже указан локальный файл продукта в assets/
  if (stored && (stored.startsWith('/assets/products/') || stored.startsWith('/assets/categories/'))) {
    const loc = localIfExists(stored);
    if (loc) return loc;
  }

  // 3. Если уже есть прямая валидная ссылка (не сток и не старая заглушка)
  if (stored && !isGenericStock(stored) && !stored.startsWith('/assets/brands/')) {
    return stored;
  }

  const hay = normalizeHaystack(p);
  const nameLower = p.name.toLowerCase();
  const brandLower = (p.brand || '').toLowerCase().trim();

  // 4. НЕ-ПАРФЮМЕРИЯ: косметика, волосы, уход за кожей и телом НИКОГДА не должны получать фото флаконов духов!
  if (
    (p.kind && p.kind !== 'perfume') ||
    /(?:^|[\s\-_])(?:крем|лосьон|дезодорант|гель|шампунь|кондиционер|мыло|масло для тела|масло-крем|бальзам для тела|бальзам для губ|диффузор|свеча|спрей для дома|автопарфюм|массажер|сыворотка|пилинг|скраб|тоник|эмульсия|пенка|патчи|маска|помада|блеск для губ|тушь)/i.test(nameLower)
  ) {
    return resolveCategoryFallback(p.kind || 'cosmetics', hay, nameLower, brandLower);
  }
  if (brandLower.includes('gehwol') || /(фусскрафт|fusskraft|крем для ног|бальзам для ног)/i.test(nameLower)) {
    return resolveCategoryFallback('bodycare', hay, nameLower, brandLower);
  }
  if (brandLower.includes('kydra') || brandLower.includes('indola') || brandLower.includes('revlonissimo') || (brandLower.includes('revlon') && !hay.includes('charlie')) || /(краска для волос|окрашиван|тонирующ|оттеночн)/i.test(nameLower)) {
    return resolveCategoryFallback('haircare', hay, nameLower, brandLower);
  }
  if (brandLower.includes('paula') || brandLower.includes('aravia') || /(dr\.\s*jart|cicapair|ceramidin)/i.test(nameLower)) {
    return resolveCategoryFallback('skincare', hay, nameLower, brandLower);
  }

  // 5. ПАРФЮМЕРИЯ: поиск точного соответствия среди ручных правил (фланкеры)
  for (const rule of ALL_PRODUCT_RULES) {
    if (rule.anyBrand && !rule.anyBrand.some(b => hay.includes(b))) {
      continue;
    }
    // Правило не может привязать фото чужого бренда
    if (!fileBelongsToBrand(rule.file, brandLower, hay)) {
      continue;
    }
    if (rule.anyOf && !rule.anyOf.some(k => hay.includes(k))) {
      continue;
    }
    if (rule.exclude && rule.exclude.some(ex => hay.includes(ex))) {
      continue;
    }
    if (rule.must.every(k => hay.includes(k))) {
      const loc = localIfExists(`/assets/products/${rule.file}`);
      if (loc) return loc;
    }
  }

  // 6. Интеллектуальный поиск по токенам среди всех файлов оригинальных продуктов СТРОГО В РАМКАХ БРЕНДА ТОВАРА!
  // Товар бренда Zielinski никогда не получит фото Montale или Mancera!
  const hayTokens = new Set(hay.split(/\s+/).filter(t => t.length > 1));
  const brandTokenSet = new Set(
    brandLower
      .replace(/[^a-zа-яё0-9]+/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1)
      .concat(['perfumes', 'parfums', 'parfum', 'collection', 'maison', 'fragrance', 'world'])
  );
  let bestFile: string | null = null;
  let bestScore = 0;

  for (const item of INDEXED_PRODUCT_FILES) {
    // Проверяем, что файл действительно принадлежит бренду данного товара
    if (!fileBelongsToBrand(item.file, brandLower, hay)) {
      continue;
    }

    let hits = 0;
    let modelHits = 0;
    for (const t of item.tokens) {
      if (hayTokens.has(t)) {
        hits++;
        if (!brandTokenSet.has(t)) {
          modelHits++;
        }
      }
    }
    if (hits >= 2 && modelHits >= 1) {
      const ratio = hits / item.tokens.length;
      const score = hits + ratio * 0.9;
      if (ratio >= 0.45 && score > bestScore) {
        bestScore = score;
        bestFile = item.file;
      }
    }
  }

  if (bestFile) {
    const loc = localIfExists(`/assets/products/${bestFile}`);
    if (loc) return loc;
  }

  // 7. Эталонный сигнатурный флакон бренда (если есть в базе)
  const brandSig = BRAND_SIGNATURE_FLACONS[brandLower] ||
    (brandLower.includes('zielinski') ? BRAND_SIGNATURE_FLACONS['zielinski & rozen'] : null) ||
    (brandLower.includes('dior') ? BRAND_SIGNATURE_FLACONS['dior'] : null) ||
    (brandLower.includes('chanel') ? BRAND_SIGNATURE_FLACONS['chanel'] : null) ||
    (brandLower.includes('tom ford') ? BRAND_SIGNATURE_FLACONS['tom ford'] : null) ||
    ((brandLower === 'parfums de marly' || brandLower === 'marly') ? BRAND_SIGNATURE_FLACONS['parfums de marly'] : null) ||
    ((brandLower.includes('essential parfums') || brandLower === 'essential') ? BRAND_SIGNATURE_FLACONS['essential parfums'] : null);

  if (brandSig) {
    const loc = localIfExists(brandSig);
    if (loc) return loc;
  }

  // 8. Если для редкого товара нет индивидуальной фотографии в базе — отдаем лаконичную векторную заглушку "Здесь скоро будет фотография"
  return PLACEHOLDER_IMAGE;
}

export function withResolvedImage<
  T extends { name: string; brand: string; images?: string[]; kind?: string; custom?: boolean }
>(p: T): T & { image: string; images: string[] } {
  const image = resolveProductImage(p);
  return { ...p, image, images: [image] };
}
