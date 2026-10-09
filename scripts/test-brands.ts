import fs from 'fs';
import path from 'path';

const catalogFile = path.resolve('data/catalog.json');
const cat = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));

export const KNOWN_HOUSES = [
  "Tom Ford", "By Kilian", "Kilian", "Yves Saint Laurent", "YSL", "Dolce & Gabbana", "Dolce and Gabbana", "D&G",
  "French Avenue", "Attar Collection", "Escentric Molecules", "Juliette Has A Gun", "Haute Fragrance Company", "HFC",
  "Boadicea The Victorious", "Marc-Antoine Barrois", "Jean Paul Gaultier", "Hugo Boss", "Giorgio Armani", "Emporio Armani",
  "Clive Christian", "Carolina Herrera", "Paco Rabanne", "Rabanne", "Tiziana Terenzi", "Victoria's Secret",
  "Ex Nihilo", "Initio Parfums Prives", "Initio", "Jo Malone", "Le Labo", "Memo Paris", "Memo", "Vilhelm Parfumerie",
  "Frederic Malle", "Serge Lutens", "Penhaligon's", "Roja Dove", "Roja", "Maison Martin Margiela", "Maison Margiela",
  "Maison Francis Kurkdjian", "Acqua di Parma", "Atelier Cologne", "Atelier des Ors", "Bond No. 9", "Bottega Veneta",
  "Carner Barcelona", "Costume National", "Essential Parfums", "Etat Libre d'Orange", "Fragrance World", "Parfums de Marly",
  "Lattafa Perfumes", "Lattafa", "Paris Corner", "Maison Alhambra", "Alhambra", "Ard Al Zaafaran", "Swiss Arabian",
  "Al Haramain", "Christian Dior", "C.Dior", "Dior", "Chanel", "Creed", "Amouage", "Byredo", "Xerjoff",
  "Versace", "Armaf", "Gucci", "Givenchy", "Montale", "Mancera", "Nasomatto", "Bvlgari", "Bulgari",
  "Valentino", "Diptyque", "Chopard", "Hermes", "Guerlain", "Prada", "Burberry", "Davines", "Kerastase",
  "Matrix", "Redken", "Wella", "Estel", "Schwarzkopf", "Goldwell", "Lebel", "Olaplex",
  "Ahjaar", "Aigner", "Afnan", "Ajmal", "Rasasi", "Kajal", "Zimaya", "Nishane", "Vertus", "Orto Parisi",
  "Moschino", "Mugler", "Cartier", "Chloe", "Lanvin", "Lancome", "Lalique", "Kenzo", "Azzaro", "Caron",
  "Houbigant", "Frapin", "Jovoy Paris", "Jovoy", "Mizensir", "Stephane Humbert Lucas", "Thomas Kosmala",
  "The Merchant of Venice", "The Different Company", "Tauer Perfumes", "Van Cleef & Arpels", "Van Cleef",
  "Zarkoperfume", "Laboratorio Olfattivo", "L'Artisan Parfumeur", "Liquides Imaginaires", "Lorenzo Villoresi",
  "Maison Crivelli", "Maison Tahite", "Miller Harris", "Ormonde Jayne", "Profumum Roma", "BDK Parfums",
  "Alexandre.J", "Amouroud", "Anfas", "Annick Goutal", "Goutal", "Birkholz", "Bois 1920", "Calvin Klein",
  "Davidoff", "Electimuss", "Floraiku", "Gritti", "Histoires de Parfums", "Jacques Zolty", "Jardins d'Ecrivains",
  "Jimmy Choo", "Keiko Mecheri", "Kemi", "Korloff", "Les Liquides Imaginaires", "Linari", "Loewe", "M.Micallef",
  "Micallef", "Masque Milano", "Molinard", "Montblanc", "Narciso Rodriguez", "Nicolai", "Nobile 1942",
  "Ojar", "Perris Monte Carlo", "Pierre Guillaume", "Plume Impression", "Ramon Monegal", "Rance 1795",
  "Reminiscence", "Simone Andreoli", "Sospiro", "Teo Cabanel", "The House of Oud", "THOO", "Une Nuit Nomade",
  "Vilhelm", "Widian", "X-Ray", "Aesop"
];

// Sort houses by length descending so longer matches take precedence (e.g., "Parfums de Marly" before "Marly")
KNOWN_HOUSES.sort((a, b) => b.length - a.length);

export function resolveBrand(raw: string): string {
  if (!raw) return 'Другое';
  let b = raw.trim();
  b = b.replace(/^!+\s*/, '').replace(/^\d+\s+/, '').trim();
  const lower = b.toLowerCase();
  for (const house of KNOWN_HOUSES) {
    const hLow = house.toLowerCase();
    if (lower === hLow || lower.startsWith(hLow + ' ') || lower.startsWith(hLow + "'") || lower.startsWith(hLow + '-')) {
      if (/^kilian|^by kilian/i.test(house)) return 'Kilian';
      if (/^c\.dior|^christian dior|^dior/i.test(house)) return 'Dior';
      if (/^yves saint|^ysl/i.test(house)) return 'Yves Saint Laurent';
      if (/^dolce|^d&g/i.test(house)) return 'Dolce & Gabbana';
      if (/^lattafa/i.test(house)) return 'Lattafa Perfumes';
      if (/^bulgari|^bvlgari/i.test(house)) return 'Bvlgari';
      if (/^paco rabanne|^rabanne/i.test(house)) return 'Rabanne';
      if (/^roja/i.test(house)) return 'Roja Dove';
      if (/^margiela/i.test(house)) return 'Maison Martin Margiela';
      if (/^kurkdjian/i.test(house)) return 'Maison Francis Kurkdjian';
      if (/^hfc/i.test(house)) return 'Haute Fragrance Company';
      if (/^barrois/i.test(house)) return 'Marc-Antoine Barrois';
      if (/^armani/i.test(house)) return 'Giorgio Armani';
      if (/^boss/i.test(house)) return 'Hugo Boss';
      if (/^memo/i.test(house)) return 'Memo Paris';
      if (/^vilhelm/i.test(house)) return 'Vilhelm Parfumerie';
      if (/^initio/i.test(house)) return 'Initio Parfums Prives';
      if (/^jovoy/i.test(house)) return 'Jovoy Paris';
      if (/^van cleef/i.test(house)) return 'Van Cleef & Arpels';
      if (/^aesop/i.test(house)) return 'Aesop';
      return house;
    }
  }
  const words = b.split(/\s+/);
  return words[0] || b;
}

let kilianCount = 0;
let angelsCount = 0;
for (const p of cat.products) {
  const norm = resolveBrand(p.brand);
  if (norm === 'Kilian') {
    kilianCount++;
    if (p.name.toLowerCase().includes('angel') || p.brand.toLowerCase().includes('angel')) {
      angelsCount++;
    }
  }
}
console.log('Normalized Kilian count:', kilianCount, 'including Angels Share:', angelsCount);
