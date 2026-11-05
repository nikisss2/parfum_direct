#!/usr/bin/env bash
set -e

echo "🚀 Обновление Maison Arôme из GitHub..."
cd /var/www/maison
git fetch origin main
git reset --hard origin/main
npm install --legacy-peer-deps
npm run build
systemctl restart maison
systemctl status maison --no-pager
echo "✅ Сайт успешно обновлен и перезапущен!"
