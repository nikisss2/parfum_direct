import { findExactNotesRule, resolveNotesForProduct } from './notesData.js';
import type { CatalogProduct } from './catalogStore.js';

interface AnalogRule {
  brandAny: string[];
  must: string[];
  exclude?: string[];
  analogOf: string;
}

const CURATED_ANALOG_RULES: AnalogRule[] = [
  // === FRENCH AVENUE / FRAGRANCE WORLD ===
  { brandAny: ['french avenue', 'fragrance world'], must: ['blonde empire'], analogOf: 'Clive Christian XXI Art Deco Blonde Amber' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['amber empire'], analogOf: 'Clive Christian XXI Art Deco Blonde Amber' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['liquid brun'], analogOf: 'Parfums de Marly Althaïr' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['royal blend', 'nero'], analogOf: 'Gissah Sava' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['royal blend', 'sequoia'], analogOf: "Kilian Angels' Share Paradis" },
  { brandAny: ['french avenue', 'fragrance world'], must: ['royal blend', 'vintage'], analogOf: 'Kilian Old Fashioned' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['royal blend'], exclude: ['nero', 'bourbon', 'sequoia', 'vintage'], analogOf: "Kilian Angels' Share" },
  { brandAny: ['french avenue', 'fragrance world'], must: ['vulcan feu'], analogOf: 'Stéphane Humbert Lucas 777 God of Fire' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['vulcan baie'], analogOf: 'Stéphane Humbert Lucas 777 Pink Boa' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['vulcan sable'], analogOf: 'Stéphane Humbert Lucas 777 Sand Dance' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['essence de blanc'], analogOf: 'Louis Vuitton Imagination' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['cocoa morado'], analogOf: 'Maison Crivelli Oud Cadenza' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['pinnace', 'noir'], analogOf: 'Hugo Boss Bottled Intense' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['pinnace', 'oryn'], analogOf: 'Louis Vuitton Afternoon Swim' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['pinnace'], exclude: ['noir', 'oryn'], analogOf: 'Louis Vuitton Pacific Chill' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['spectre', 'ghost'], analogOf: 'Nishane Ani' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['spectre', 'wraith'], analogOf: 'Kilian Black Phantom' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['spectre'], exclude: ['ghost', 'wraith'], analogOf: 'Matière Première Falcon Leather' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['divin asylum'], analogOf: 'Roja Parfums Elysium Parfum Cologne' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['lumiere garcon'], analogOf: 'Dolce & Gabbana The One Luminous Night' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['royal blanc'], analogOf: 'Initio Parfums Privés Musk Therapy' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['glorious oud'], exclude: ['royal blanc'], analogOf: 'Initio Parfums Privés Oud for Greatness' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['fierte', 'luna'], analogOf: 'Xerjoff XJ 1861 Naxos' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['fierte'], exclude: ['luna'], analogOf: 'Yves Saint Laurent Babycat' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['azzure aoud'], analogOf: 'Maison Crivelli Oud Maracujá' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['veneno', 'bianco'], analogOf: 'Kilian Sunkissed Goddess' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['veneno', 'scarlet'], analogOf: 'Stéphane Humbert Lucas 777 Venom Incarnat' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['veneno'], exclude: ['bianco', 'scarlet'], analogOf: 'Kilian Smoking Hot' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['zenith', 'blue'], analogOf: 'Dior Sauvage' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['zenith', 'santal'], analogOf: 'Emporio Armani Stronger With You Sandalwood' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['zenith', 'tobacco'], analogOf: 'Dior Tobacolor' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['zenith', 'vanilla'], analogOf: 'Dior Vanilla Diorama' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['opus magnum'], analogOf: 'Amouage Opus XIV Royal Tobacco' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['marmara'], analogOf: 'Amouage Purpose 50' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['obsidian'], analogOf: "Kilian Angels' Share On The Rocks" },
  { brandAny: ['french avenue', 'fragrance world'], must: ['eclair affair'], analogOf: 'Giardini Di Toscana Bianco Latte' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['luscious'], analogOf: 'Kayali Yum Pistachio Gelato | 33' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['miraj absolu'], analogOf: 'Parfums de Marly Layton Exclusif' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['tropical kiss'], analogOf: 'Stéphane Humbert Lucas 777 Soleil de Jeddah Mango Kiss' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['rose explosion'], analogOf: 'Initio Parfums Privés Atomic Rose' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['atlantis'], analogOf: 'Room 1015 Wavechild' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['after effect'], analogOf: 'Initio Parfums Privés Side Effect' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['aether'], analogOf: 'Parfums de Marly Greenley' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['enigma une'], analogOf: 'Dior Sauvage Elixir' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['imperium x'], analogOf: 'Roja Parfums Apex' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['imperium'], exclude: ['imperium x'], analogOf: 'Roja Parfums Elysium Parfum Cologne' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['cafe n cream'], analogOf: 'Mancera Amore Caffè' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['tabac n coke'], analogOf: 'Mancera Tonka Cola' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['creme of clouds'], analogOf: 'Theodoros Kalotinis Crème Brûlée' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['aqua pura'], analogOf: 'Orto Parisi Megamare' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['grandeur'], analogOf: 'Marc-Antoine Barrois Ganymede' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['intro paramount'], analogOf: 'Initio Parfums Privés Paragon' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['irida'], analogOf: 'Tom Ford Electric Cherry' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['one self'], analogOf: 'Yves Saint Laurent MYSLF' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['colosseum'], analogOf: 'Argos Triumph of Bacchus' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['varakh', 'silver'], analogOf: 'Maison Francis Kurkdjian Gentle Fluidity Silver' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['varakh', 'gold'], analogOf: 'Rabanne 1 Million Golden Oud' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['night club', 'irish'], analogOf: 'Creed Green Irish Tweed' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['night club', 'green'], analogOf: 'Creed Green Irish Tweed' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['night club', 'silver'], analogOf: 'Creed Silver Mountain Water' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['night club', 'silky'], analogOf: 'Creed Queen of Silk' },
  { brandAny: ['french avenue', 'fragrance world'], must: ['night club'], exclude: ['green', 'irish', 'silver', 'silky', 'absolute'], analogOf: 'Creed Aventus' },

  // === ARMAF ===
  { brandAny: ['armaf'], must: ['club de nuit', 'untold'], analogOf: 'Maison Francis Kurkdjian Baccarat Rouge 540' },
  { brandAny: ['armaf'], must: ['club de nuit', 'imperiale'], analogOf: 'Parfums de Marly Delina Exclusif' },
  { brandAny: ['armaf'], must: ['club de nuit', 'imperial'], analogOf: 'Parfums de Marly Delina Exclusif' },
  { brandAny: ['armaf'], must: ['club de nuit', 'milestone'], analogOf: 'Creed Millésime Impérial' },
  { brandAny: ['armaf'], must: ['club de nuit', 'sillage'], analogOf: 'Creed Silver Mountain Water' },
  { brandAny: ['armaf'], must: ['club de nuit', 'iconic'], analogOf: 'Chanel Bleu de Chanel' },
  { brandAny: ['armaf'], must: ['club de nuit', 'precieux'], exclude: ['iv'], analogOf: 'Creed Absolu Aventus' },
  { brandAny: ['armaf'], must: ['club de nuit', 'lionheart', 'man'], analogOf: 'Jean Paul Gaultier Le Male Elixir' },
  { brandAny: ['armaf'], must: ['club de nuit', 'lionheart', 'мужск'], analogOf: 'Jean Paul Gaultier Le Male Elixir' },
  { brandAny: ['armaf'], must: ['club de nuit', 'lionheart', 'woman'], analogOf: 'Burberry Goddess' },
  { brandAny: ['armaf'], must: ['club de nuit', 'lionheart', 'женск'], analogOf: 'Burberry Goddess' },
  { brandAny: ['armaf'], must: ['club de nuit', 'urban'], analogOf: 'Dior Sauvage & Creed Aventus' },
  { brandAny: ['armaf'], must: ['club de nuit', 'intense', 'женск'], analogOf: 'Tom Ford Noir de Noir' },
  { brandAny: ['armaf'], must: ['club de nuit', 'intense', 'woman'], analogOf: 'Tom Ford Noir de Noir' },
  { brandAny: ['armaf'], must: ['club de nuit', 'intense'], exclude: ['женск', 'woman'], analogOf: 'Creed Aventus' },
  { brandAny: ['armaf'], must: ['club de nuit', 'woman'], exclude: ['intense', 'imperiale', 'imperial', 'lionheart', 'maleka'], analogOf: 'Chanel Coco Mademoiselle' },
  { brandAny: ['armaf'], must: ['club de nuit', 'женск'], exclude: ['intense', 'imperiale', 'imperial', 'lionheart', 'maleka'], analogOf: 'Chanel Coco Mademoiselle' },
  { brandAny: ['armaf'], must: ['odyssey', 'mandarin sky'], analogOf: 'Jean Paul Gaultier Scandal Pour Homme' },
  { brandAny: ['armaf'], must: ['odyssey', 'homme', 'white'], analogOf: 'Emporio Armani Stronger With You' },
  { brandAny: ['armaf'], must: ['odyssey', 'homme'], exclude: ['white'], analogOf: 'Tom Ford Noir Extreme' },
  { brandAny: ['armaf'], must: ['odyssey', 'aqua'], analogOf: 'Rabanne Invictus Platinum' },
  { brandAny: ['armaf'], must: ['odyssey', 'mega'], analogOf: 'Yves Saint Laurent Y Eau de Parfum' },
  { brandAny: ['armaf'], must: ['odyssey', 'tyrant'], analogOf: 'Bvlgari Tygar' },
  { brandAny: ['armaf'], must: ['odyssey', 'limoni'], analogOf: 'Louis Vuitton Afternoon Swim' },
  { brandAny: ['armaf'], must: ['odyssey', 'spectra'], analogOf: 'Jean Paul Gaultier Ultra Male' },

  // === AFNAN & ZIMAYA ===
  { brandAny: ['afnan'], must: ['9 pm', 'elixir'], analogOf: 'Jean Paul Gaultier Le Male Elixir' },
  { brandAny: ['afnan'], must: ['9 pm'], exclude: ['elixir', 'rebel', 'night out', 'femme', 'женск', 'purple'], analogOf: 'Jean Paul Gaultier Ultra Male' },
  { brandAny: ['afnan'], must: ['9 am', 'dive'], analogOf: 'Chanel Bleu de Chanel' },
  { brandAny: ['afnan'], must: ['turathi', 'blue'], analogOf: 'Bvlgari Tygar' },
  { brandAny: ['afnan'], must: ['turathi', 'electric'], analogOf: 'Ex Nihilo Blue Talisman' },
  { brandAny: ['afnan'], must: ['turathi', 'brown'], analogOf: 'Yves Saint Laurent Tuxedo' },
  { brandAny: ['afnan'], must: ['supremacy', 'not only intense'], analogOf: 'Nishane Hacivat & Creed Aventus' },
  { brandAny: ['afnan'], must: ['supremacy', 'collector'], analogOf: 'Creed Absolu Aventus' },
  { brandAny: ['afnan'], must: ['supremacy', 'silver'], analogOf: 'Creed Aventus' },
  { brandAny: ['afnan'], must: ['supremacy', 'in oud'], analogOf: 'Initio Parfums Privés Oud for Greatness' },
  { brandAny: ['afnan'], must: ['supremacy', 'in heaven'], analogOf: 'Creed Silver Mountain Water' },
  { brandAny: ['afnan'], must: ['supremacy', 'incense'], analogOf: 'Amouage Interlude Man' },
  { brandAny: ['afnan'], must: ['supremacy', 'noir'], analogOf: 'Bottega Veneta Pour Homme' },
  { brandAny: ['afnan'], must: ['supremacy', 'pink'], analogOf: 'Parfums de Marly Delina' },
  { brandAny: ['afnan'], must: ['mystique bouquet'], analogOf: 'Parfums de Marly Valaya' },
  { brandAny: ['afnan'], must: ['cherry bouquet'], analogOf: 'Tom Ford Lost Cherry' },
  { brandAny: ['afnan'], must: ['delicious bouquet'], analogOf: 'Dolce & Gabbana Devotion' },
  { brandAny: ['afnan'], must: ['violet bouquet'], analogOf: 'Maison Francis Kurkdjian Baccarat Rouge 540' },
  { brandAny: ['afnan'], must: ['la fleur bouquet'], analogOf: 'Ex Nihilo Fleur Narcotique' },
  { brandAny: ['afnan'], must: ['souvenir', 'blooming bliss'], analogOf: 'Matière Première Vanilla Powder' },
  { brandAny: ['afnan'], must: ['souvenir', 'floral bouquet'], analogOf: 'Parfums de Marly Delina' },
  { brandAny: ['afnan'], must: ['souvenir', 'desert rose'], analogOf: 'Tiziana Terenzi Kirke' },
  { brandAny: ['afnan'], must: ['rare carbon'], analogOf: 'Tom Ford Ombré Leather' },
  { brandAny: ['afnan'], must: ['rare reef'], analogOf: 'Louis Vuitton Pacific Chill' },
  { brandAny: ['afnan'], must: ['kiaana angel'], analogOf: 'Kayali Yum Pistachio Gelato | 33' },
  { brandAny: ['zimaya', 'afnan'], must: ['sharaf blend'], analogOf: "Kilian Angels' Share" },
  { brandAny: ['zimaya', 'afnan'], must: ['sharaf the club'], analogOf: 'Creed Absolu Aventus' },
  { brandAny: ['zimaya', 'afnan'], must: ['tiramisu caramel'], analogOf: 'Giardini Di Toscana Bianco Latte' },
  { brandAny: ['zimaya', 'afnan'], must: ['tiramisu coco'], analogOf: 'Mancera Amore Caffè' },
  { brandAny: ['zimaya', 'afnan'], must: ['fatima velvet'], analogOf: 'Parfums de Marly Palatine' },
  { brandAny: ['zimaya', 'afnan'], must: ['ghali imperial'], analogOf: 'Dior Homme Parfum' },

  // === LATTAFA & MAISON ALHAMBRA ===
  { brandAny: ['lattafa'], must: ['khamrah'], exclude: ['qahwa', 'dukhan', 'waha'], analogOf: "Kilian Angels' Share" },
  { brandAny: ['lattafa'], must: ['asad', 'bourbon'], analogOf: 'Azzaro The Most Wanted' },
  { brandAny: ['lattafa'], must: ['asad'], exclude: ['bourbon', 'zanzibar', 'zanzibal', 'elixir'], analogOf: 'Dior Sauvage Elixir' },
  { brandAny: ['lattafa'], must: ['eclaire'], exclude: ['pistache', 'banoffi'], analogOf: 'Giardini Di Toscana Bianco Latte' },
  { brandAny: ['lattafa'], must: ['nebras'], analogOf: 'Billie Eilish Eilish' },
  { brandAny: ['lattafa'], must: ['angham'], analogOf: 'Burberry Goddess' },
  { brandAny: ['lattafa'], must: ['vintage radio'], analogOf: 'Initio Parfums Privés Paragon' },
  { brandAny: ['lattafa'], must: ['al nashama', 'caprice'], analogOf: "Yves Saint Laurent La Nuit de L'Homme Bleu Électrique" },
  { brandAny: ['lattafa'], must: ['al nashama'], exclude: ['caprice'], analogOf: 'Initio Parfums Privés Paragon' },
  { brandAny: ['lattafa'], must: ['liam', 'grey'], analogOf: 'BDK Parfums Gris Charnel' },
  { brandAny: ['lattafa'], must: ['liam', 'blue'], analogOf: 'Giorgio Armani Acqua di Giò Profondo' },
  { brandAny: ['lattafa'], must: ['oud for glory'], analogOf: 'Initio Parfums Privés Oud for Greatness' },
  { brandAny: ['lattafa'], must: ['amethyst'], analogOf: 'Initio Parfums Privés Atomic Rose' },
  { brandAny: ['lattafa'], must: ['bade', 'sublime'], analogOf: 'Kayali Eden Juicy Apple | 01' },
  { brandAny: ['lattafa'], must: ['fakhar', 'rose'], analogOf: "Givenchy L'Interdit" },
  { brandAny: ['lattafa'], must: ['fakhar', 'женск'], analogOf: "Givenchy L'Interdit" },
  { brandAny: ['lattafa'], must: ['fakhar'], exclude: ['rose', 'женск', 'femme', 'gold', 'extrait'], analogOf: 'Yves Saint Laurent Y Eau de Parfum' },
  { brandAny: ['lattafa'], must: ['maahir', 'legacy'], analogOf: 'Parfums de Marly Sedley' },
  { brandAny: ['lattafa'], must: ['maahir', 'black'], analogOf: 'Orto Parisi Terroni' },
  { brandAny: ['lattafa'], must: ['ana abiyedh', 'rouge'], analogOf: 'Maison Francis Kurkdjian Baccarat Rouge 540' },
  { brandAny: ['lattafa'], must: ['ajwad'], exclude: ['pink'], analogOf: 'Mancera Roses Vanille' },
  { brandAny: ['lattafa'], must: ['atlas'], analogOf: 'Orto Parisi Megamare' },
  { brandAny: ['lattafa'], must: ['al qiam', 'silver'], analogOf: 'Bvlgari Tygar' },
  { brandAny: ['lattafa'], must: ['al qiam', 'gold'], analogOf: 'Tom Ford Tuscan Leather' },
  { brandAny: ['lattafa'], must: ['mayar'], exclude: ['cherry', 'natural'], analogOf: 'Mugler Angel Nova' },
  { brandAny: ['lattafa'], must: ['yara', 'tous'], analogOf: 'Rabanne Fame' },

  { brandAny: ['alhambra'], must: ['tobacco touch'], analogOf: 'Tom Ford Tobacco Vanille' },
  { brandAny: ['alhambra'], must: ['eternal touch'], analogOf: 'Tom Ford Tobacco Vanille' },
  { brandAny: ['alhambra'], must: ['toscano leather'], analogOf: 'Tom Ford Tuscan Leather' },
  { brandAny: ['alhambra'], must: ['smoky touch'], analogOf: 'Tom Ford Tuscan Leather' },
  { brandAny: ['alhambra'], must: ['bright peach'], analogOf: 'Tom Ford Bitter Peach' },
  { brandAny: ['alhambra'], must: ['coral blush'], analogOf: 'Tom Ford Bitter Peach' },
  { brandAny: ['alhambra'], must: ['lovely cherie'], analogOf: 'Tom Ford Lost Cherry' },
  { brandAny: ['alhambra'], must: ['forbidden love'], analogOf: 'Tom Ford Lost Cherry' },
  { brandAny: ['alhambra'], must: ['rose petals'], analogOf: 'Tom Ford Rose Prick' },
  { brandAny: ['alhambra'], must: ['woody oud'], analogOf: 'Tom Ford Oud Wood' },
  { brandAny: ['alhambra'], must: ['dark aoud'], analogOf: 'Tom Ford Oud Wood' },
  { brandAny: ['alhambra'], must: ['fabulo intense'], analogOf: 'Tom Ford Fucking Fabulous' },
  { brandAny: ['alhambra'], must: ['porto neroli'], analogOf: 'Tom Ford Neroli Portofino' },
  { brandAny: ['alhambra'], must: ['flaming elixir'], analogOf: 'Tom Ford Cherry Smoke' },
  { brandAny: ['alhambra'], must: ['love spark'], analogOf: 'Tom Ford Electric Cherry' },
  { brandAny: ['alhambra'], must: ['kismet', 'magic'], analogOf: "Kilian Angels' Share" },
  { brandAny: ['alhambra'], must: ['kismet', 'angel'], analogOf: "Kilian Angels' Share" },
  { brandAny: ['alhambra'], must: ['kismet', 'moscow'], analogOf: 'Kilian Vodka on the Rocks' },
  { brandAny: ['alhambra'], must: ['kismet', 'men'], analogOf: 'Yves Saint Laurent Tuxedo' },
  { brandAny: ['alhambra'], must: ['jean lowe', 'immort'], analogOf: "Louis Vuitton L'Immensité" },
  { brandAny: ['alhambra'], must: ['jean lowe', 'azure'], analogOf: 'Louis Vuitton Afternoon Swim' },
  { brandAny: ['alhambra'], must: ['jean lowe', 'vibe'], analogOf: 'Louis Vuitton Pacific Chill' },
  { brandAny: ['alhambra'], must: ['jean lowe', 'fantasme'], analogOf: 'Louis Vuitton Imagination' },
  { brandAny: ['alhambra'], must: ['jean lowe', 'matiere'], analogOf: 'Louis Vuitton Matière Noire' },
  { brandAny: ['alhambra'], must: ['jean lowe', 'fraiche'], analogOf: 'Louis Vuitton Nouveau Monde' },
  { brandAny: ['alhambra'], must: ['salvo'], analogOf: 'Dior Sauvage' },
  { brandAny: ['alhambra'], must: ['alpine', 'sport'], analogOf: 'Chanel Allure Homme Sport Eau Extrême' },
  { brandAny: ['alhambra'], must: ['jorge', 'deep blue'], analogOf: 'Giorgio Armani Acqua di Giò Profondo' },
  { brandAny: ['alhambra'], must: ['jorge'], exclude: ['deep blue'], analogOf: 'Giorgio Armani Acqua di Giò Profumo' },
  { brandAny: ['alhambra'], must: ['toro'], analogOf: "Hermès Terre d'Hermès" },
  { brandAny: ['alhambra'], must: ['baroque', 'rouge'], analogOf: 'Maison Francis Kurkdjian Baccarat Rouge 540' },
  { brandAny: ['alhambra'], must: ['delilah'], analogOf: 'Parfums de Marly Delina' },
  { brandAny: ['alhambra'], must: ['infini', 'rose'], analogOf: 'Initio Parfums Privés Atomic Rose' },
  { brandAny: ['alhambra'], must: ['infini', 'oud'], analogOf: 'Initio Parfums Privés Oud for Greatness' },
  { brandAny: ['alhambra'], must: ['megara'], analogOf: 'Orto Parisi Megamare' },

  // === AL HARAMAIN, RASASI & ATTAR COLLECTION ===
  { brandAny: ['haramain'], must: ['amber oud', 'gold'], exclude: ['mine'], analogOf: 'Xerjoff Erba Pura' },
  { brandAny: ['haramain'], must: ['amber oud', 'tobacco'], analogOf: 'Tom Ford Tobacco Vanille' },
  { brandAny: ['haramain'], must: ['amber oud', 'ruby'], analogOf: 'Maison Francis Kurkdjian Baccarat Rouge 540 Extrait' },
  { brandAny: ['haramain'], must: ['amber oud', 'rouge'], analogOf: 'Maison Francis Kurkdjian Baccarat Rouge 540 Extrait' },
  { brandAny: ['haramain'], must: ['amber oud', 'carbon'], analogOf: 'Creed Green Irish Tweed' },
  { brandAny: ['haramain'], must: ['amber oud', 'bleu'], analogOf: 'Chanel Bleu de Chanel' },
  { brandAny: ['haramain'], must: ['amber oud', 'white'], analogOf: 'Chanel Coco Mademoiselle' },
  { brandAny: ['haramain'], must: ['detour noir'], exclude: ['exclusif', 'eco', 'intense'], analogOf: 'Parfums de Marly Layton' },
  { brandAny: ['haramain'], must: ['aventure', 'knight'], analogOf: 'Creed Green Irish Tweed' },
  { brandAny: ['haramain'], must: ['aventure', 'blanche'], analogOf: 'Creed Silver Mountain Water' },
  { brandAny: ['haramain'], must: ['aventure', 'femme'], analogOf: 'Creed Aventus for Her' },
  { brandAny: ['haramain'], must: ['aventure'], exclude: ['femme', 'женск', 'knight', 'blanche', 'fraiche', 'rose', 'intense', 'gold', 'grapefruit', 'ciel', 'iris', 'amber'], analogOf: 'Creed Aventus' },
  { brandAny: ['rasasi'], must: ['la yuqawam', 'jasmine'], analogOf: 'Xerjoff Erba Pura' },
  { brandAny: ['rasasi'], must: ['la yuqawam', 'homme'], analogOf: 'Tom Ford Tuscan Leather' },
  { brandAny: ['rasasi'], must: ['la yuqawam', 'мужск'], analogOf: 'Tom Ford Tuscan Leather' },
  { brandAny: ['rasasi'], must: ['hawas'], exclude: ['ice', 'black', 'fire', 'her', 'женск', 'tropical', 'elixir'], analogOf: 'Rabanne Invictus Aqua' },
  { brandAny: ['rasasi'], must: ['egra', 'мужск'], analogOf: 'Creed Green Irish Tweed' },
  { brandAny: ['rasasi'], must: ['qasamat', 'ebhar'], analogOf: 'Xerjoff Lira' },
  { brandAny: ['attar'], must: ['azora'], analogOf: 'Ex Nihilo Fleur Narcotique' },
  { brandAny: ['attar'], must: ['queen of sheba'], analogOf: 'Kilian Good Girl Gone Bad' },
  { brandAny: ['attar'], must: ['al rayhan'], analogOf: "Byredo Bal d'Afrique" },
  { brandAny: ['attar'], must: ['azalea'], analogOf: 'Initio Parfums Privés Psychedelic Love' },
  { brandAny: ['attar'], must: ['floral musk'], analogOf: 'Maison Francis Kurkdjian Baccarat Rouge 540' },
  { brandAny: ['attar'], must: ['crystal love', 'женск'], analogOf: "Kilian Love, Don't Be Shy" },
  { brandAny: ['attar'], must: ['crystal love', 'her'], analogOf: "Kilian Love, Don't Be Shy" },
];

const SLUG_STOP_WORDS = new Set([
  'унисекс', 'мужской', 'женский', 'мужская', 'женская', 'парфюмерная', 'туалетная',
  'вода', 'духи', 'одеколон', 'экстракт', 'масло', 'тестер', 'отливант', 'пробник',
  'набор', 'спрей', 'дезодорант', 'мист', 'лосьон', 'крем', 'гель', 'шампунь',
  'без', 'спрея', 'крышки', 'коробки', 'запаска', 'рефил', 'мл', 'ml', 'edp', 'edt',
  'parfum', 'extrait', 'eau', 'подарочный', 'автопарфюм', 'диффузор'
]);

const CANONICAL_ANALOG_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bmfk\b|\bkurkdjian\b|\bmaison francis kurkdjian\b/gi, 'Maison Francis Kurkdjian'],
  [/\bbaccarat rouge 540\b/gi, 'Baccarat Rouge 540'],
  [/\btom ford\b/gi, 'Tom Ford'],
  [/\bex nihilo\b/gi, 'Ex Nihilo'],
  [/\bfleur narcotique\b/gi, 'Fleur Narcotique'],
  [/\bby kilian\b|\bkilian\b/gi, 'Kilian'],
  [/\bangels share\b/gi, "Angels' Share"],
  [/\bgood girl gone bad\b/gi, 'Good Girl Gone Bad'],
  [/\blove don t be shy\b|\blove dont be shy\b/gi, "Love, Don't Be Shy"],
  [/\bparfums de marly\b|\bmarly\b/gi, 'Parfums de Marly'],
  [/\binitio parfums prives\b|\binitio\b/gi, 'Initio Parfums Privés'],
  [/\blouis vuitton\b|\blouis vitton\b/gi, 'Louis Vuitton'],
  [/\bl immensite\b|\bimmensite\b/gi, "L'Immensité"],
  [/\bbyredo\b/gi, 'Byredo'],
  [/\bbal d afrique\b/gi, "Bal d'Afrique"],
  [/\btiziana terenzi\b|\bterenzi\b/gi, 'Tiziana Terenzi'],
  [/\bmarc antoine barrois\b|\bbarrois\b/gi, 'Marc-Antoine Barrois'],
  [/\byves saint laurent\b|\bysl\b/gi, 'Yves Saint Laurent'],
  [/\bchristian dior\b|\bc dior\b|\bdior\b/gi, 'Dior'],
  [/\bchanel\b/gi, 'Chanel'],
  [/\bcreed\b/gi, 'Creed'],
  [/\bxerjoff\b/gi, 'Xerjoff'],
  [/\bamouage\b/gi, 'Amouage'],
  [/\broja dove\b|\broja parfums\b|\broja\b/gi, 'Roja Parfums'],
  [/\bnasomatto\b/gi, 'Nasomatto'],
  [/\borto parisi\b/gi, 'Orto Parisi'],
  [/\bescentric molecules\b/gi, 'Escentric Molecules'],
  [/\bclive christian\b/gi, 'Clive Christian'],
  [/\bhaute fragrance company\b|\bhfc\b/gi, 'Haute Fragrance Company'],
  [/\bstephane humbert lucas\b/gi, 'Stéphane Humbert Lucas 777'],
  [/\bjean paul gaultier\b/gi, 'Jean Paul Gaultier'],
  [/\bpaco rabanne\b|\brabanne\b/gi, 'Rabanne'],
  [/\bgiorgio armani\b|\barmani\b/gi, 'Giorgio Armani'],
  [/\bdolce gabbana\b|\bdolce and gabbana\b/gi, 'Dolce & Gabbana'],
  [/\bvladimir\b/gi, ''],
];

function prettifySlugAnalog(rawTokens: string[]): string | undefined {
  if (!rawTokens.length) return undefined;
  const cleaned: string[] = [];
  for (const t of rawTokens) {
    const low = t.toLowerCase();
    if (SLUG_STOP_WORDS.has(low)) break;
    if (/^\d+$/.test(low) && Number(low) > 1000) break; // SKU or volume tail
    // Stop on standalone bottle volume numbers right at the end if preceded by brand/model
    cleaned.push(t);
  }
  // Trim trailing standalone volume number like 30, 50, 80, 100 if not 540 / 01 / 02 / 777 / 1942
  while (cleaned.length > 2) {
    const last = cleaned[cleaned.length - 1];
    if (/^(?:15|30|50|60|75|80|90|100|105|120|125|200)$/.test(last)) {
      cleaned.pop();
    } else {
      break;
    }
  }
  if (cleaned.length < 2) return undefined;

  let phrase = cleaned
    .map(w => (w.length <= 2 && /^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');

  for (const [rx, rep] of CANONICAL_ANALOG_REPLACEMENTS) {
    phrase = phrase.replace(rx, rep);
  }
  phrase = phrase.replace(/\s+/g, ' ').trim();
  // Deduplicate repeated brand prefix if any (e.g. "Parfums de Marly Parfums de Marly")
  phrase = phrase.replace(/\b(Parfums de Marly|Initio Parfums Privés|Maison Francis Kurkdjian|Giorgio Armani)\s+\1\b/gi, '$1');
  return phrase.length >= 4 ? phrase : undefined;
}

export function parseAnalogFromSlugOrName(slug?: string, sourceName?: string): string | undefined {
  if (sourceName) {
    const m = sourceName.match(/\(\s*(?:аналог|по мотивам)\s+([^)]+)\)/i);
    if (m && m[1]) {
      const tokens = m[1].trim().split(/[\s\-_]+/).filter(Boolean);
      const pretty = prettifySlugAnalog(tokens);
      if (pretty) return pretty;
    }
  }
  if (slug && slug.includes('аналог-')) {
    const after = slug.split('аналог-')[1];
    if (after) {
      const tokens = after.split('-').filter(Boolean);
      return prettifySlugAnalog(tokens);
    }
  }
  return undefined;
}

const SORTED_ANALOG_RULES = [...CURATED_ANALOG_RULES].sort(
  (a, b) => b.must.length - a.must.length || b.must.join('').length - a.must.join('').length
);

export function resolveAnalogForProduct(
  brand: string,
  name: string,
  slug?: string,
  sourceName?: string
): string | undefined {
  const b = (brand || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();
  const hay = `${b} ${n}`;

  // Never mark discovery sampler sets, multi-scent packs, or deodorants/body sprays as single perfume analogs
  if (
    n.includes('sampler') ||
    /набор\s+\d+\s*по/i.test(n) ||
    /дезодорант|спрей для тела|мист для волос|гель для душа|лосьон/i.test(n)
  ) {
    return undefined;
  }

  for (const rule of SORTED_ANALOG_RULES) {
    if (!rule.brandAny.some(br => b.includes(br) || hay.includes(br))) continue;
    if (rule.exclude && rule.exclude.some(ex => hay.includes(ex))) continue;
    if (rule.must.every(m => hay.includes(m))) {
      return rule.analogOf;
    }
  }

  return parseAnalogFromSlugOrName(slug, sourceName);
}

interface SignatureCopyRule {
  match: (b: string, n: string) => boolean;
  copy: string;
}

const SIGNATURE_COPY_RULES: SignatureCopyRule[] = [
  {
    match: (b, n) => (b.includes('french avenue') || b.includes('fragrance world')) && (n.includes('blonde empire') || n.includes('amber empire')),
    copy: 'French Avenue Blonde Empire (Amber Empire) — роскошная восточно-гурманская композиция. Теплые оттенки золотой амбры, выдержанного рома, благородного табака и белого шоколада. Ольфакторный аналог Clive Christian XXI Art Deco Blonde Amber. 100% оригинал.',
  },
  {
    match: (b, n) => (b.includes('french avenue') || b.includes('fragrance world')) && n.includes('liquid brun'),
    copy: 'French Avenue Liquid Brun — бархатная восточно-гурманская композиция. Согревающая корица, пряный кардамон, нежный флердоранж, сливочное пралине и бурбонская ваниль на древесной базе. Ольфакторный аналог Parfums de Marly Althaïr. 100% оригинал.',
  },
  {
    match: (b, n) => (b.includes('french avenue') || b.includes('fragrance world')) && n.includes('royal blend') && !n.includes('nero') && !n.includes('bourbon') && !n.includes('sequoia') && !n.includes('vintage'),
    copy: "French Avenue Royal Blend — глубокая восточно-гурманская композиция с алкогольно-пряным характером. Выдержанный коньяк, теплая корица, спелая слива, дубовая бочка, пралине и ваниль. Ольфакторный аналог Kilian Angels' Share. 100% оригинал.",
  },
  {
    match: (b, n) => (b.includes('french avenue') || b.includes('fragrance world')) && n.includes('vulcan feu'),
    copy: 'French Avenue Vulcan Feu — яркая фруктово-древесная композиция. Сочное спелое манго, искристый имбирь, лимон, розовый перец, пралине и обволакивающая серая амбра с кедром. Ольфакторный аналог Stéphane Humbert Lucas 777 God of Fire. 100% оригинал.',
  },
  {
    match: (b, n) => (b.includes('french avenue') || b.includes('fragrance world')) && n.includes('essence de blanc'),
    copy: 'French Avenue Essence De Blanc — кристальная цитрусово-чайная композиция. Искристый цитрон, калабрийский бергамот, свежий имбирь, цейлонская корица и благородный китайский черный чай с амброксаном. Ольфакторный аналог Louis Vuitton Imagination. 100% оригинал.',
  },
  {
    match: (b, n) => (b.includes('french avenue') || b.includes('fragrance world')) && n.includes('spectre wraith'),
    copy: 'French Avenue Spectre Wraith — густая нишево-гурманская композиция. Выдержанный ром, свежесваренный черный кофе, горький шоколад, тростниковый сахар и сливочный сандал. Ольфакторный аналог Kilian Black Phantom. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('armaf') && n.includes('club de nuit') && n.includes('intense') && !n.includes('женск') && !n.includes('woman'),
    copy: 'Armaf Club de Nuit Intense Man — культовая фруктово-шипрово-дымная композиция. Искристый лимон, спелый ананас, черная смородина, березовый дым, пачули и серая амбра. Ольфакторный аналог Creed Aventus. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('armaf') && n.includes('club de nuit') && n.includes('untold'),
    copy: 'Armaf Club de Nuit Untold — гипнотическая восточно-амбровая композиция. Благородный шафран, лепестки жасмина, воздушная серая амбра, пихтовая смола и белый кедр. Ольфакторный аналог Maison Francis Kurkdjian Baccarat Rouge 540. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('armaf') && n.includes('club de nuit') && (n.includes('imperiale') || n.includes('imperial')),
    copy: 'Armaf Club de Nuit White Imperiale — утонченная цветочно-восточная композиция. Сочный личи, турецкая роза, пион, бархатная ваниль, кашмеран и благородный ладан. Ольфакторный аналог Parfums de Marly Delina Exclusif. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('lattafa') && n.includes('asad') && !n.includes('bourbon') && !n.includes('zanzibar') && !n.includes('zanzibal') && !n.includes('набор'),
    copy: 'Lattafa Perfumes Asad — статусная пряно-восточная композиция. Черный перец, табачный лист, лаванда, обжаренный кофе, пачули, сухая амбра и ваниль. Ольфакторный аналог Dior Sauvage Elixir. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('lattafa') && n.includes('eclaire') && !n.includes('pistache') && !n.includes('banoffi'),
    copy: 'Lattafa Perfumes Eclaire — нежная сливочно-гурманская композиция. Тягучая карамель, теплое молоко, белый мед, ореховое пралине и мадагаскарская ваниль. Ольфакторный аналог Giardini Di Toscana Bianco Latte. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('lattafa') && n.includes('vintage radio'),
    copy: 'Lattafa Perfumes Vintage Radio — медитативная древесно-фруктовая композиция. Бархатная слива, священное дерево Пало Санто, лаванда, шалфей, черный перец и сливочный сандал. Ольфакторный аналог Initio Parfums Privés Paragon. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('lattafa') && n.includes('khamrah') && n.includes('qahwa'),
    copy: 'Lattafa Perfumes Khamrah Qahwa — насыщенная пряно-кофейная гурманская композиция. Арабский кофе с кардамоном, теплая корица, имбирь, цукаты, пралине и бобы тонка. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('lattafa') && n.includes('khamrah') && !n.includes('qahwa') && !n.includes('dukhan'),
    copy: "Lattafa Perfumes Khamrah — обволакивающая восточно-гурманская композиция. Пряная корица, мускатный орех, медовые финики, ореховое пралине, бобы тонка и ваниль. Ольфакторный аналог Kilian Angels' Share. 100% оригинал.",
  },
  {
    match: (b, n) => b.includes('afnan') && n.includes('turathi blue'),
    copy: 'Afnan Turathi Blue — энергичная цитрусово-амбровая композиция. Сочный розовый грейпфрут, калабрийский бергамот, свежий имбирь, благородная амбра, пачули и чистый мускус. Ольфакторный аналог Bvlgari Tygar. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('afnan') && n.includes('mystique bouquet'),
    copy: 'Afnan Mystique Bouquet — воздушная цветочно-мускусная композиция. Белый персик, мандарин, личи, нежный флердоранж, пион и хрустальный шлейф амброксана. Ольфакторный аналог Parfums de Marly Valaya. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('attar') && n.includes('azora'),
    copy: 'Attar Collection Azora — сияющая цветочно-фруктовая композиция от парфюмера Мирослава Петкова. Сочный личи, белый персик, калабрийский бергамот, жасмин и шелковистый мускус. Ольфакторный аналог Ex Nihilo Fleur Narcotique. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('creed') && n.includes('aventus') && !n.includes('absolu') && !n.includes('cologne') && !n.includes('her'),
    copy: 'Creed Aventus — легендарная фруктово-шипрово-древесная композиция. Королевский ананас, бергамот, черная смородина, благородный березовый дым, дубовый мох и серая амбра. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('creed') && n.includes('absolu') && n.includes('aventus'),
    copy: 'Creed Absolu Aventus — концентрированная пряно-шипрово-цитрусовая композиция. Сочный грейпфрут, черная смородина, бергамот, теплый имбирь, корица, пачули и гаитянский ветивер. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('amouage') && n.includes('guidance') && !n.includes('sampler'),
    copy: 'Amouage Guidance — гипнотическая цветочно-восточная композиция Квентина Биша. Спелая груша, лесной орех, оманский ладан, османтус, шафран, сливочный сандал и акигалавуд. 100% оригинал.',
  },
  {
    match: (b, n) => b.includes('amouage') && n.includes('reflection') && !n.includes('woman'),
    copy: 'Amouage Reflection Man — аристократичная древесно-цветочная композиция. Пряный розмарин, нероли, пудровый корень ириса, жасмин, благородный сандал, кедр и ветивер. 100% оригинал.',
  },
];

function cleanDisplayPerfumeTitle(brand: string, name: string): string {
  let title = name
    .replace(/\((?:без спрея|тестер|отливант[^\)]*|пробник|запаска)\)/gi, '')
    .replace(/\b(?:мужской|женский|унисекс|парфюмерная вода|туалетная вода|одеколон|духи|отливант|тестер|edp|edt)\b/gi, '')
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:мл|ml)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!title.toLowerCase().startsWith(brand.toLowerCase())) {
    title = `${brand} ${title}`.trim();
  }
  return title || `${brand} ${name}`.trim();
}

function inferProfilePhrase(notes: string[], hay: string): string {
  const joined = `${notes.join(' ')} ${hay}`.toLowerCase();
  if (/ваниль|пралине|карамел|шоколад|кофе|какао|мед|миндал|финик/.test(joined) && /амбр|уд|табак|кориц|шафран|коньяк|ром|бобы тонка/.test(joined)) {
    return 'выразительная восточно-гурманская композиция';
  }
  if (/ваниль|пралине|карамел|шоколад|молоко|сливк|морожен/.test(joined)) {
    return 'утонченная гурманская композиция';
  }
  if (/уд|ладан|мирра|шафран|бензоин|опопонакс/.test(joined)) {
    return 'глубокая восточно-древесная композиция';
  }
  if (/табак|кожа|замш|берез/.test(joined)) {
    return 'харизматичная кожано-пряная композиция';
  }
  if (/морск|водн|соль|озон|акват/.test(joined)) {
    return 'свежая акватически-древесная композиция';
  }
  if (/грейпфрут|цитрон|лимон|бергамот|лайм|мандарин|апельсин/.test(joined) && /лаванд|мята|розмарин|шалфей|чай|ветивер/.test(joined)) {
    return 'элегантная цитрусово-фужерная композиция';
  }
  if (/роза|жасмин|пион|тубероз|флердоранж|апельсинов|гардени|магноли|османтус/.test(joined) && /персик|личи|груш|малин|ягод|манго|вишн|смородин/.test(joined)) {
    return 'чувственная цветочно-фруктовая композиция';
  }
  if (/роза|жасмин|пион|тубероз|ирис|фиалк|ландыш/.test(joined)) {
    return 'утонченная цветочно-мускусная композиция';
  }
  return 'благородная древесно-пряная композиция';
}

function isPlaceholderDescription(desc?: string): boolean {
  if (!desc || !desc.trim()) return true;
  const d = desc.trim();
  if (d.length < 48) return true;
  if (/—\s*(?:парфюмерия|другое|уход|макияж|оригинальная продукция|оригинальная парфюмерия)/i.test(d)) return true;
  if (/оригинальная продукция\.?$/i.test(d)) return true;
  if (/из нашего каталога\.?$/i.test(d)) return true;
  return false;
}

export function buildPerfumeDescription(p: CatalogProduct): string {
  const b = (p.brand || '').toLowerCase();
  const n = (p.name || '').toLowerCase();

  for (const rule of SIGNATURE_COPY_RULES) {
    if (rule.match(b, n)) {
      return rule.copy;
    }
  }

  const title = cleanDisplayPerfumeTitle(p.brand, p.name);
  const top = p.notes?.top || [];
  const heart = p.notes?.heart || [];
  const base = p.notes?.base || [];
  const pickedNotes = Array.from(
    new Set([...top.slice(0, 2), ...heart.slice(0, 2), ...base.slice(0, 2), ...(p.allNotes || []).slice(0, 5)])
  )
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);

  const profile = inferProfilePhrase(pickedNotes, `${b} ${n}`);
  const notesSentence =
    pickedNotes.length >= 2
      ? `Гармоничное раскрытие нот: ${pickedNotes.slice(0, -1).join(', ')} и ${pickedNotes[pickedNotes.length - 1]}.`
      : 'Многогранное звучание и благородный стойкий шлейф.';

  const analogSentence = p.analogOf ? ` Ольфакторный аналог ${p.analogOf}.` : '';
  return `${title} — ${profile}. ${notesSentence}${analogSentence} 100% оригинал.`;
}

export function enrichPerfumeMetadata(p: CatalogProduct): void {
  if (p.kind !== 'perfume') return;

  if (!p.analogOf) {
    const resolvedAnalog = resolveAnalogForProduct(p.brand, p.name, p.slug, p.sourceName);
    if (resolvedAnalog) {
      p.analogOf = resolvedAnalog;
    }
  }

  // Upgrade olfactory pyramid: exact product rule -> exact luxury original rule -> existing valid notes -> synthesizer
  const exactOwn = findExactNotesRule(p.brand, p.name);
  if (exactOwn && !p.custom) {
    p.notes = { top: exactOwn.top, heart: exactOwn.heart, base: exactOwn.base };
    p.allNotes = exactOwn.all;
  } else if (!exactOwn && p.analogOf && !p.custom) {
    const exactAnalogNotes = findExactNotesRule(p.analogOf, p.analogOf);
    if (exactAnalogNotes) {
      p.notes = { top: exactAnalogNotes.top, heart: exactAnalogNotes.heart, base: exactAnalogNotes.base };
      p.allNotes = exactAnalogNotes.all;
    }
  }

  if (!p.notes || !p.notes.top?.length || p.notes.top[0] === 'Верхние ноты') {
    const fallback = resolveNotesForProduct(p.brand, p.name);
    p.notes = { top: fallback.top, heart: fallback.heart, base: fallback.base };
    p.allNotes = fallback.all;
  } else if (!p.allNotes || p.allNotes.length === 0) {
    p.allNotes = Array.from(new Set([...(p.notes.top || []), ...(p.notes.heart || []), ...(p.notes.base || [])]));
  }

  const needsAnalogMention = Boolean(p.analogOf) && !p.description?.toLowerCase().includes('аналог');
  if (isPlaceholderDescription(p.description) || needsAnalogMention) {
    p.description = buildPerfumeDescription(p);
  }
}

const NOTE_MODIFIER_WORDS = new Set([
  'калабрийский', 'сицилийский', 'мадагаскарская', 'мадагаскарский', 'бурбонская', 'бурбонский',
  'турецкая', 'болгарская', 'майская', 'дамасская', 'индийский', 'индийская', 'гаитянский',
  'виргинский', 'атласский', 'техасский', 'египетский', 'марокканский', 'марокканская',
  'французский', 'французская', 'итальянский', 'испанский', 'китайский', 'тунисский', 'нигерийский',
  'цейлонская', 'выдержанный', 'спелый', 'спелая', 'спелое', 'свежий', 'свежая', 'благородный',
  'золотая', 'золотой', 'белый', 'белая', 'белое', 'белые', 'черный', 'черная', 'темный',
  'красный', 'красная', 'красное', 'розовый', 'горький', 'сладкий', 'сладкие', 'натуральный',
  'королевский', 'ледяная', 'дикая', 'сухое', 'сухая', 'теплый', 'сливочный', 'кремовый',
  'кристаллический', 'минеральный', 'бархатный', 'стручок', 'лист', 'листья', 'корень',
  'семена', 'масло', 'аккорд', 'ноты', 'дерево', 'древесина'
]);

export function normalizeNoteStem(raw: string): string {
  const words = raw
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !NOTE_MODIFIER_WORDS.has(w));

  const core = (words[words.length - 1] || raw.toLowerCase().trim())
    .replace(/(?:ая|яя|ый|ий|ой|ое|ее|ые|ие|ов|ев|ам|ям|ах|ях|ом|ем|а|я|ы|и|у|ю|е|ь)$/, '');

  if (core.startsWith('флердоранж') || raw.toLowerCase().includes('цветок апельсин') || raw.toLowerCase().includes('апельсиновый цвет')) {
    return 'флердоранж';
  }
  if (raw.toLowerCase().includes('бобы тонка') || core === 'тонк') return 'тонка';
  if (raw.toLowerCase().includes('пало санто')) return 'пало-санто';
  if (raw.toLowerCase().includes('iso e')) return 'iso-e-super';
  return core.length >= 2 ? core : raw.toLowerCase().trim();
}

function normalizeTitleTokens(str: string): string {
  return str
    .toLowerCase()
    .replace(/[ïî]/g, 'i')
    .replace(/[éèê]/g, 'e')
    .replace(/[áàâ]/g, 'a')
    .replace(/[^a-zа-я0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeNoteSimilarity(a: CatalogProduct, b: CatalogProduct): number {
  if (a.id === b.id || b.kind !== 'perfume') return -1;

  let score = 0;

  // 1. Direct luxury <-> analog or sibling analog relationship boost
  const aTitle = normalizeTitleTokens(`${a.brand} ${a.name}`);
  const bTitle = normalizeTitleTokens(`${b.brand} ${b.name}`);
  const aAnalog = a.analogOf ? normalizeTitleTokens(a.analogOf) : '';
  const bAnalog = b.analogOf ? normalizeTitleTokens(b.analogOf) : '';

  if (aAnalog && bAnalog && aAnalog === bAnalog) {
    score += 18; // Both are verified analogs of the exact same luxury fragrance
  }
  if (aAnalog && bAnalog === '') {
    const analogWords = aAnalog.split(' ').filter(w => w.length >= 3);
    if (analogWords.length >= 2 && analogWords.every(w => bTitle.includes(w))) {
      score += 30; // B is the luxury original that A is an analog of!
    }
  }
  if (bAnalog && aAnalog === '') {
    const analogWords = bAnalog.split(' ').filter(w => w.length >= 3);
    if (analogWords.length >= 2 && analogWords.every(w => aTitle.includes(w))) {
      score += 30; // B is a verified Arabic analog of luxury original A!
    }
  }

  // 2. Weighted pyramid stem overlap
  const aBase = new Set((a.notes?.base || []).map(normalizeNoteStem));
  const aHeart = new Set((a.notes?.heart || []).map(normalizeNoteStem));
  const aTop = new Set((a.notes?.top || []).map(normalizeNoteStem));
  const aAll = new Set([...(a.allNotes || []).map(normalizeNoteStem), ...aBase, ...aHeart, ...aTop]);

  const bBase = new Set((b.notes?.base || []).map(normalizeNoteStem));
  const bHeart = new Set((b.notes?.heart || []).map(normalizeNoteStem));
  const bTop = new Set((b.notes?.top || []).map(normalizeNoteStem));
  const bAll = new Set([...(b.allNotes || []).map(normalizeNoteStem), ...bBase, ...bHeart, ...bTop]);

  if (aAll.size === 0 || bAll.size === 0) return score;

  for (const s of bBase) {
    if (aBase.has(s)) score += 3.5;
    else if (aAll.has(s)) score += 1.5;
  }
  for (const s of bHeart) {
    if (aHeart.has(s)) score += 2.5;
    else if (aAll.has(s)) score += 1.2;
  }
  for (const s of bTop) {
    if (aTop.has(s)) score += 1.8;
    else if (aAll.has(s)) score += 0.8;
  }

  let sharedAll = 0;
  for (const s of bAll) {
    if (aAll.has(s)) sharedAll++;
  }
  const unionSize = aAll.size + bAll.size - sharedAll;
  if (unionSize > 0) {
    score += (sharedAll / unionSize) * 12;
  }

  // Require at least 2 shared notes (or an explicit analog relationship) so recommendations are genuinely close
  if (sharedAll < 2 && score < 15) return 0;

  return score;
}
