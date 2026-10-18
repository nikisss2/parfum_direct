import fs from 'fs';
import path from 'path';
import https from 'https';

const CATEGORIES_DIR = path.resolve('public', 'assets', 'categories');
const PRODUCTS_DIR = path.resolve('public', 'assets', 'products');

if (!fs.existsSync(CATEGORIES_DIR)) fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

interface DownloadItem {
  filename: string;
  url: string;
  dir: string;
}

const ITEMS: DownloadItem[] = [
  // ==========================================
  // MAKEUP: SPECIFIC BRAND PACKSHOTS
  // ==========================================
  {
    filename: 'byredo-lipstick.jpg',
    url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'byredo-lip-balm.jpg',
    url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'byredo-eyeshadow.jpg',
    url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'charlotte-tilbury-lipstick.jpg',
    url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'charlotte-tilbury-powder.jpg',
    url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'kiko-double-touch.jpg',
    url: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'kiko-lipstick.jpg',
    url: 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'collistar-mascara.jpg',
    url: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'collistar-powder.jpg',
    url: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'delilah-foundation.jpg',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'delilah-lipstick.jpg',
    url: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'ysl-lipstick.jpg',
    url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'ysl-mascara.jpg',
    url: 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'kilian-lipstick.jpg',
    url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'makeup-blush-palette.jpg',
    url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'makeup-brow-pencil.jpg',
    url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },

  // ==========================================
  // HAIRCARE: SALON PACKSHOTS
  // ==========================================
  {
    filename: 'wella-color.jpg',
    url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'wella-care.jpg',
    url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'wella-oil.jpg',
    url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'kerastase-chronologiste.jpg',
    url: 'https://images.unsplash.com/photo-1608248597359-25f00eef0129?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'kerastase-shampoo.jpg',
    url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'schwarzkopf-igora.jpg',
    url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'schwarzkopf-bonacure.jpg',
    url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'schwarzkopf-osis.jpg',
    url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'estel-deluxe.jpg',
    url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'estel-curex.jpg',
    url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'redken-all-soft.jpg',
    url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'redken-extreme.jpg',
    url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'londa-color.jpg',
    url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'lebel-iau.jpg',
    url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'goldwell-topchic.jpg',
    url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'loreal-serie-expert.jpg',
    url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'ollin-perfect-hair.jpg',
    url: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'american-crew-pomade.jpg',
    url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'american-crew-fiber.jpg',
    url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'moroccanoil-treatment.jpg',
    url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },

  // ==========================================
  // SKINCARE: CLINICAL & LUXURY PACKSHOTS
  // ==========================================
  {
    filename: 'aesop-serum.jpg',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'aesop-cream.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'aesop-eye-serum.jpg',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'elemis-marine-cream.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'elemis-cleansing-balm.jpg',
    url: 'https://images.unsplash.com/photo-1608248597359-25f00eef0129?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'valmont-prime-pack.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'aravia-anti-acne.jpg',
    url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'paulas-choice-bha.jpg',
    url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'gehwol-fusskraft.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'la-roche-posay-b5.jpg',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },

  // ==========================================
  // BODYCARE: LUXURY BATH & SPA PACKSHOTS
  // ==========================================
  {
    filename: 'nesti-dante-soap.jpg',
    url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'baylis-harding-lotion.jpg',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'acqua-di-parma-body.jpg',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'jo-malone-body-creme.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'byredo-body-wash.jpg',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'replica-shower-gel.jpg',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'diptyque-body.jpg',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
  {
    filename: 'loccitane-hand-cream.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85',
    dir: CATEGORIES_DIR,
  },
];

async function downloadFile(item: DownloadItem): Promise<boolean> {
  const filePath = path.join(item.dir, item.filename);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    return true;
  }

  return new Promise(resolve => {
    https.get(item.url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location!, redirectRes => {
          const fileStream = fs.createWriteStream(filePath);
          redirectRes.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve(true);
          });
        }).on('error', () => resolve(false));
      } else if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

async function main() {
  console.log(`Starting download of ${ITEMS.length} beauty catalog packshots...`);
  let success = 0;
  for (const item of ITEMS) {
    const ok = await downloadFile(item);
    if (ok) success++;
    process.stdout.write(`Downloaded: ${item.filename} (${success}/${ITEMS.length})\r`);
  }
  console.log(`\nSuccessfully finalized ${success} product packshots!`);
}

main();
