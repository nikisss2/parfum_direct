import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const dbPath = path.join(ROOT, 'data', 'maison.db');

if (!fs.existsSync(dbPath)) {
  console.log('Database not found at', dbPath);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

const testUsers = db.prepare(`
  SELECT id, email, full_name FROM users
  WHERE email LIKE '%test%'
     OR email LIKE '%demo%'
     OR email LIKE '%example.com%'
     OR email LIKE 'client_alpha_%'
     OR email LIKE 'client_beta_%'
     OR email LIKE '%deleted.maison-arome.ru%'
     OR email = 'client@maisonarome.ru'
     OR id = 'usr_client_demo'
`).all();

console.log('Found test users to delete:', testUsers.length);

const testUserIds = testUsers.map(u => u.id);

if (testUserIds.length > 0) {
  const placeholders = testUserIds.map(() => '?').join(',');

  db.prepare(`DELETE FROM sessions WHERE user_id IN (${placeholders})`).run(...testUserIds);
  db.prepare(`DELETE FROM bonus_transactions WHERE card_id IN (SELECT id FROM bonus_cards WHERE user_id IN (${placeholders}))`).run(...testUserIds);
  db.prepare(`DELETE FROM bonus_cards WHERE user_id IN (${placeholders})`).run(...testUserIds);
  db.prepare(`DELETE FROM orders WHERE user_id IN (${placeholders}) OR customer_email LIKE '%test%' OR customer_email LIKE '%example.com%' OR customer_email LIKE '%maisonarome.ru%' OR customer_name = 'Анна Воронцова' OR customer_name = 'Пользователь А'`).run(...testUserIds);
  db.prepare(`DELETE FROM users WHERE id IN (${placeholders})`).run(...testUserIds);
}

const remainingUsers = db.prepare('SELECT id, email, full_name, role FROM users').all();
console.log('Remaining genuine users:', remainingUsers.length, remainingUsers.map(u => u.email));

const remainingOrders = db.prepare('SELECT id, order_number, customer_name, customer_email, total_amount FROM orders').all();
console.log('Remaining real orders count:', remainingOrders.length);
