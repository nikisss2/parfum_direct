#!/usr/bin/env bash
# Maison Arôme — универсальный скрипт запуска
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")"

echo "🌸 Запуск Maison Arôme..."
echo "📍 Node: $(which node)"
echo "📍 NPM: $(which npm)"
echo "🚀 Сервер и фронтенд запускаются..."

npm run dev:all
