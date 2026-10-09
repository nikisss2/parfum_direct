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
    url.includes('placeholder-product') ||
    url.endsWith('/assets/placeholder-product.svg')
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

/** Локальный файл из public/ */
function localIfExists(relative: string): string | null {
  const clean = relative.startsWith('/') ? relative.slice(1) : relative;
  const full = path.join(PUBLIC, clean);
  return fs.existsSync(full) ? `/${clean}` : null;
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
  { must: ['royal blend'], anyBrand: ['french avenue', 'fragrance world'], file: 'french-avenue-royal-blend.jpg' },
  { must: ['french avenue', 'royal blend'], file: 'french-avenue-royal-blend.jpg' },
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

export function resolveProductImage(p: {
  name: string;
  brand: string;
  images?: string[];
  kind?: string;
  custom?: boolean;
}): string {
  // 1. Если товар пользовательский и ссылка не стоковая — сохраняем
  const stored = p.images?.[0];
  if (stored && p.custom && !isGenericStock(stored)) return stored;

  // 2. Если уже указан локальный файл продукта в assets/products
  if (stored && stored.startsWith('/assets/products/')) {
    const loc = localIfExists(stored);
    if (loc) return loc;
  }

  // 3. Если уже есть не стоковая ссылка (не unsplash и не старый бренд-сток)
  if (stored && !isGenericStock(stored) && !stored.startsWith('/assets/brands/')) {
    return stored;
  }

  // 4. Поиск по каталогу популярных ароматов
  const hay = normalizeHaystack(p);

  for (const rule of ALL_PRODUCT_RULES) {
    if (rule.anyBrand && !rule.anyBrand.some(b => hay.includes(b))) {
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

  // Внимание: Брендовые одинаковые заглушки удалены намеренно!
  // Все товары, для которых нет конкретного фото, получают заглушку "Здесь скоро будет фотография".
  return PLACEHOLDER_IMAGE;
}

export function withResolvedImage<
  T extends { name: string; brand: string; images?: string[]; kind?: string; custom?: boolean }
>(p: T): T & { image: string; images: string[] } {
  const image = resolveProductImage(p);
  return { ...p, image, images: [image] };
}
