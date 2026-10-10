import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  const files = readdirSync(dir);
  for (const file of files) {
    if (['node_modules', 'dist', 'dist-server', '.git', 'public'].includes(file)) continue;
    
    const path = join(dir, file);
    if (statSync(path).isDirectory()) {
      walkDir(path, callback);
    } else {
      if (path.match(/\.(ts|tsx|html|json|md)$/)) {
        callback(path);
      }
    }
  }
}

let changedFiles = 0;

walkDir('.', (file) => {
  if (file.includes('package-lock.json') || file.includes('bun.lock')) return;
  
  const content = readFileSync(file, 'utf-8');
  let newContent = content;

  // Replaces
  newContent = newContent.replace(/Maison Arôme/g, 'Maison Arôme');
  newContent = newContent.replace(/MAISON ARÔME/g, 'MAISON ARÔME');
  newContent = newContent.replace(/MaisonArome/g, 'MaisonArome');
  newContent = newContent.replace(/parfum-direct\.ru/g, 'maisonarome.ru');
  newContent = newContent.replace(/parfumdirect\.ru/g, 'maisonarome.ru');

  if (content !== newContent) {
    writeFileSync(file, newContent, 'utf-8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done. Changed ${changedFiles} files.`);
