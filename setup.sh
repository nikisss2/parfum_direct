#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🚀 MAISON ARÔME: АВТОМАТИЧЕСКАЯ УСТАНОВКА И ЗАПУСК СЕРВЕРА"
echo "=========================================================="

# 1. Добавление SSH ключа для беспарольного и мгновенного входа
mkdir -p /root/.ssh
chmod 700 /root/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPXl56e09DIX13i3/bA07WWbZtmxhhbn7uAjh7XPr8iY nikisss2" > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# 2. Сброс блокировок фаервола и перезапуск SSH
iptables -F || true
systemctl restart ssh || systemctl restart sshd || true

# 3. Установка Node.js 22, Git, Nginx, Certbot
echo "📦 Установка зависимостей (Node.js 22, Nginx, PM2)..."
apt-get update -y
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs git nginx certbot python3-certbot-nginx ufw
npm install -g pm2

# 4. Скачивание и сборка сайта
if [ -d "/var/www/maison/.git" ]; then
    echo "📥 Репозиторий уже скачан, обновляем..."
    cd /var/www/maison
    git pull
else
    echo "📥 Скачивание сайта из GitHub..."
    mkdir -p /var/www
    git clone https://github.com/nikisss2/parfum_direct.git /var/www/maison
    cd /var/www/maison
fi

echo "🔨 Сборка проекта..."
npm install
npm run build

# 5. Запуск через PM2 с автозапуском
echo "⚡ Запуск приложения через PM2..."
pm2 delete maison || true
pm2 start dist-server/index.js --name "maison"
pm2 save
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root || true

# 6. Настройка Nginx для maison-arome.ru
echo "🌐 Настройка веб-сервера Nginx..."
cat << 'NGINX_EOF' > /etc/nginx/sites-available/maison
server {
    listen 80;
    server_name maison-arome.ru www.maison-arome.ru;

    client_max_body_size 50M;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/maison /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 7. Настройка файрвола UFW
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
ufw --force enable || true

# 8. Попытка выпустить SSL сертификат Let's Encrypt
echo "🔒 Выпуск SSL сертификата (HTTPS)..."
certbot --nginx -d maison-arome.ru -d www.maison-arome.ru --non-interactive --agree-tos -m order@maisonarome.ru || true

echo "=========================================================="
echo "🎉 САЙТ УСПЕШНО РАЗВЕРНУТ И ЗАПУЩЕН!"
echo "   Откройте: http://maison-arome.ru или https://maison-arome.ru"
echo "=========================================================="
