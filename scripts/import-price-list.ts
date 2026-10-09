/**
 * Импорт прайс-листа (CSV / XLSX) в data/catalog.json для серверного API.
 * Запуск: npm run import:catalog
 * Путь к файлу: PRICE_FILE env или аргумент CLI.
 */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'data', 'catalog.json');

const DEFAULT_CSV =
  process.env.PRICE_FILE ||
  process.argv[2] ||
  path.join(ROOT, 'data', 'source', 'price-list.csv');

type ProductKind = 'perfume' | 'skincare' | 'haircare' | 'makeup' | 'bodycare' | 'other';
type Gender = 'unisex' | 'female' | 'male';

const KIND_LABELS: Record<ProductKind, string> = {
  perfume: 'Парфюмерия',
  skincare: 'Уход за кожей',
  haircare: 'Уход за волосами',
  makeup: 'Макияж',
  bodycare: 'Уход за телом',
  other: 'Другое',
};

const IMAGES: Record<ProductKind, string> = {
  perfume:
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80',
  skincare:
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1000&q=80',
  haircare:
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1000&q=80',
  makeup:
    'https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&w=1000&q=80',
  bodycare:
    'https://images.unsplash.com/photo-1608248543809-3a2759f8a1c7?auto=format&fit=crop&w=1000&q=80',
  other:
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
};

const PERFUME_SUB = [
  { id: 'niche' as const, label: 'Нишевая парфюмерия', brands: ['byredo', 'le labo', 'diptyque', 'amouage', 'xerjoff', 'nasomatto', 'initio'] },
  { id: 'arabian' as const, label: 'Арабская парфюмерия', brands: ['lattafa', 'rasasi', 'afnan', 'ard al zaafaran', 'attar'] },
  { id: 'luxury' as const, label: 'Люксовая парфюмерия', brands: ['chanel', 'dior', 'tom ford', 'ysl', 'guerlain', 'hermes', 'kilian'] },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function detectGender(name: string): { gender: Gender; label: string } {
  const n = name.toLowerCase();
  if (/\bженский\b/.test(n) || /\bfemale\b/.test(n)) return { gender: 'female', label: 'Женский' };
  if (/\bмужской\b/.test(n) || /\bmale\b/.test(n)) return { gender: 'male', label: 'Мужской' };
  if (/\bунисекс\b/.test(n) || /\bunisex\b/.test(n)) return { gender: 'unisex', label: 'Унисекс' };
  return { gender: 'unisex', label: 'Унисекс' };
}

function detectKind(name: string): ProductKind {
  const n = name.toLowerCase();
  const rules: [ProductKind, RegExp][] = [
    ['perfume', /\b(духи|туалетная вода|одеколон|parfum|eau de|парфюм|extrait|attar|масло парфюм|парфюмерн)\b/i],
    ['makeup', /\b(помада|lipstick|тушь|mascara|тональн|concealer|румян|тени|блеск для губ|пудра|подводк)\b/i],
    ['haircare', /\b(шампун|кондиционер|краска|окислител|волос|стайлинг|лак для волос|бальзам для волос|hair)\b/i],
    ['skincare', /\b(крем|сыворотк|serum|тоник|лotion|маска|скраб|spf|солнцезащит|уход за кож|для лица|для глаз)\b/i],
    ['bodycare', /\b(гель для душа|deodorant|дезodor|мыло|body|для тела)\b/i],
  ];
  for (const [kind, re] of rules) {
    if (re.test(n)) return kind;
  }
  return 'other';
}

function extractVolume(name: string): { volumeMl: number; label: string; type: string } | null {
  const m = name.match(/(\d+(?:[.,]\d+)?)\s*(мл|ml|г|g|л|l)\b/i);
  if (!m) return null;
  const num = parseFloat(m[1].replace(',', '.'));
  const unit = m[2].toLowerCase();
  let volumeMl = num;
  if (unit === 'г' || unit === 'g') volumeMl = num;
  if (unit === 'л' || unit === 'l') volumeMl = num * 1000;
  const label = `${m[1].replace(',', '.')} ${unit === 'ml' ? 'мл' : unit}`;
  const type = `vol_${volumeMl}_${unit}`;
  return { volumeMl, label, type };
}

function extractBrand(name: string, kind: ProductKind): string {
  let cleaned = name.replace(/^!+\s*/g, '').replace(/^\d+\s+/, '').trim();
  if (cleaned.includes('>')) {
    const parts = cleaned.split('>').map(p => p.trim());
    const first = parts[0];
    if (/professional|wella|kerastase|loreal|matrix|schwarzkopf/i.test(first)) {
      const m = first.match(/^[\d\s]*([A-Za-z][A-Za-z\s.'-]+?)(?:\s+Professional)?$/i);
      if (m) return m[1].trim();
    }
    if (first.length <= 40 && !/краска|color touch/i.test(first)) {
      return first.split(/\s+/).slice(0, 2).join(' ');
    }
  }
  const beforeGender = cleaned.split(/\s+(Женский|Мужской|Унисекс)\s/i)[0]?.trim() || cleaned;
  const words = beforeGender.split(/\s+/);
  if (words.length >= 1) {
    const brand = words[0];
    if (brand.length > 1 && /^[A-Za-z]/.test(brand)) {
      if (words.length >= 2 && /^[A-Z]/.test(words[1]) && words[1].length <= 12) {
        return `${words[0]} ${words[1]}`;
      }
      return brand;
    }
  }
  return kind === 'perfume' ? 'Парфюмерия' : 'Бренд';
}

function perfumeCategory(brand: string): { category: 'niche' | 'arabian' | 'luxury'; categoryName: string } {
  const b = brand.toLowerCase();
  for (const sub of PERFUME_SUB) {
    if (sub.brands.some(x => b.includes(x))) return { category: sub.id, categoryName: sub.label };
  }
  return { category: 'niche', categoryName: 'Нишевая парфюмерия' };
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || c === '\r') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

async function readRows(filePath: string): Promise<{ sku: string; name: string; price: number }[]> {
  const ext = path.extname(filePath).toLowerCase();
  const rows: { sku: string; name: string; price: number }[] = [];

  if (ext === '.xlsx') {
    const { spawnSync } = await import('child_process');
    const py = spawnSync(
      'python3',
      [
        '-c',
        `import openpyxl, json, sys
wb=openpyxl.load_workbook(sys.argv[1], read_only=True)
ws=wb.active
out=[]
for i,row in enumerate(ws.iter_rows(values_only=True)):
  if i<2: continue
  if not row[0] or not row[1]: continue
  out.append({"sku":str(int(row[0]) if isinstance(row[0],float) else row[0]),"name":str(row[1]),"price":float(row[2] or 0)})
print(json.dumps(out, ensure_ascii=False))`,
        filePath,
      ],
      { encoding: 'utf-8', maxBuffer: 512 * 1024 * 1024 }
    );
    if (py.status !== 0) throw new Error(py.stderr || 'xlsx read failed');
    return JSON.parse(py.stdout) as { sku: string; name: string; price: number }[];
  }

  const text = fs.readFileSync(filePath, 'utf-8');
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || i < 4) continue;
    if (line.startsWith('Код,')) continue;
    const cols = parseCsvLine(line);
    if (cols.length < 3) continue;
    const sku = cols[0].trim();
    const name = cols[1].trim();
    const price = parseFloat(cols[2].replace(/\s/g, '').replace(',', '.'));
    if (!sku || !name || !Number.isFinite(price) || price <= 0) continue;
    rows.push({ sku, name, price });
  }
  return rows;
}

function buildProduct(row: { sku: string; name: string; price: number }) {
  const kind = detectKind(row.name);
  const { gender, label: genderLabel } = detectGender(row.name);
  const brand = extractBrand(row.name, kind);
  const vol = extractVolume(row.name);
  const hash = createHash('md5').update(row.sku).digest('hex').slice(0, 8);
  const slug = `${slugify(brand)}-${slugify(row.name)}-${row.sku}`.slice(0, 180);
  const id = `p-${hash}-${row.sku}`;

  const volumes = [
    {
      type: vol?.type ?? 'unit',
      label: vol?.label ?? '1 шт.',
      volumeMl: vol?.volumeMl ?? 1,
      price: Math.round(row.price),
      inStock: true,
    },
  ];

  const minPrice = volumes[0].price;
  const isPerfume = kind === 'perfume';
  const { category, categoryName } = isPerfume ? perfumeCategory(brand) : { category: undefined, categoryName: KIND_LABELS[kind] };

  const displayName = row.name
    .replace(/^!+\s*ОГРАНИЧЕННОЕ ПРЕДЛОЖЕНИЕ!!!\s*>?\s*/i, '')
    .replace(/^\d+\s+WELLA\s+Professional\s*>\s*/i, '')
    .trim();

  const description =
    kind === 'perfume'
      ? `${displayName} — оригинальная парфюмерия из нашего каталога.`
      : `${displayName} — ${KIND_LABELS[kind].toLowerCase()}, оригинальная продукция.`;

  return {
    id,
    sku: row.sku,
    slug,
    name: displayName,
    brand,
    kind,
    kindLabel: KIND_LABELS[kind],
    category: isPerfume ? category : kind,
    categoryName: isPerfume ? categoryName : KIND_LABELS[kind],
    gender,
    genderLabel,
    concentration: isPerfume ? 'Eau de Parfum' : undefined,
    description,
    images: ['/assets/placeholder-product.svg'],
    notes: isPerfume
      ? { top: [] as string[], heart: [] as string[], base: [] as string[] }
      : undefined,
    allNotes: [] as string[],
    longevity: isPerfume ? 4 : undefined,
    sillage: isPerfume ? ('Средний' as const) : undefined,
    isHit: parseInt(hash, 16) % 800 === 0,
    isNew: parseInt(hash, 16) % 1200 === 0,
    rating: 4.5 + (parseInt(hash.slice(0, 2), 16) % 6) / 10,
    reviewsCount: parseInt(hash.slice(2, 6), 16) % 120,
    minPrice,
    volumes,
    sourceName: row.name,
  };
}

async function main() {
  const filePath = path.resolve(DEFAULT_CSV);
  if (!fs.existsSync(filePath)) {
    console.error(`Файл не найден: ${filePath}`);
    console.error('Скопируйте CSV в data/source/price-list.csv или задайте PRICE_FILE=...');
    process.exit(1);
  }

  console.log('Чтение:', filePath);
  const rows = await readRows(filePath);
  console.log('Строк праайса:', rows.length);

  const products = rows.map(buildProduct);
  const meta = {
    importedAt: new Date().toISOString(),
    sourceFile: path.basename(filePath),
    count: products.length,
    kinds: Object.keys(KIND_LABELS),
    priceMax: Math.max(...products.map(p => p.minPrice), 100000),
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ meta, products }), 'utf-8');
  const mb = (fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`Готово: ${OUT_PATH} (${mb} MB, ${products.length} товаров)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
