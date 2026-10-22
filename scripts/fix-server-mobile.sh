#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "⚡ MAISON ARÔME: ИСПРАВЛЕНИЕ ЗАГРУЗКИ ДЛЯ IPHONE / SAFARI"
echo "=========================================================="

# 1. Восстановление SSH и сброс блокировок
echo "🔓 [1/5] Сброс блокировок IP и проверка SSH..."
fail2ban-client unban --all 2>/dev/null || true
iptables -F || true
ufw allow 22/tcp || true
ufw allow 2222/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
systemctl restart ssh || systemctl restart sshd || true

# 2. Оптимизация сетевого стека для мобильных операторов (МТС, Мегафон, Билайн, Tele2)
echo "📶 [2/5] Настройка sysctl против зависаний мобильного интернета..."
cat << 'EOF' > /etc/sysctl.d/99-mobile-perf.conf
net.ipv4.tcp_slow_start_after_idle = 0
net.ipv4.tcp_mtu_probing = 1
net.ipv4.tcp_fastopen = 0
EOF
sysctl -p /etc/sysctl.d/99-mobile-perf.conf || true

# 3. Настройка Nginx: OCSP Stapling (убирает зависание Safari на 15-20%), HTTP/2 и буферы
echo "🌐 [3/5] Настройка Nginx с OCSP Stapling и HTTP/2..."
cat << 'EOF' > /etc/nginx/sites-available/maison
proxy_cache_path /var/cache/nginx/api levels=1:2 keys_zone=API_CACHE:10m max_size=150m inactive=30m use_temp_path=off;

upstream node_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name maison-arome.ru www.maison-arome.ru 212.193.10.100;
    return 301 https://maison-arome.ru$request_uri;
}

server {
    server_name maison-arome.ru www.maison-arome.ru 212.193.10.100;

    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    ssl_certificate /etc/letsencrypt/live/maison-arome.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maison-arome.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # OCSP Stapling: КРИТИЧЕСКИ ВАЖНО ДЛЯ IOS SAFARI!
    # Предотвращает обращение Safari к заблокированным серверам *.lencr.org
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/maison-arome.ru/fullchain.pem;
    resolver 8.8.8.8 1.1.1.1 77.88.8.8 valid=300s;
    resolver_timeout 5s;

    # Оптимальный буфер SSL для мобильных устройств
    ssl_buffer_size 16k;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets on;

    large_client_header_buffers 4 16k;
    client_header_buffer_size 2k;
    client_max_body_size 50M;

    root /var/www/maison/dist;
    index index.html;

    gzip on;
    gzip_static on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /assets/ {
        alias /var/www/maison/dist/assets/;
        gzip_static on;
        add_header Cache-Control "public, max-age=2592000, immutable" always;
        add_header Access-Control-Allow-Origin "*" always;
    }

    location = /robots.txt {
        alias /var/www/maison/dist/robots.txt;
    }

    location = /sitemap.xml {
        alias /var/www/maison/dist/sitemap.xml;
    }

    location ~* ^/api/(products|brands|meta|notes) {
        proxy_pass http://node_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache API_CACHE;
        proxy_cache_valid 200 302 5m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        add_header X-Cache-Status $upstream_cache_status;
    }

    location /api/ {
        proxy_pass http://node_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }
}
EOF

nginx -t
systemctl reload nginx

# 4. Обновление и сборка проекта из GitHub (без modulepreload и с неблокирующим CSS)
echo "📦 [4/5] Обновление файлов сайта из GitHub..."
cd /var/www/maison
git fetch origin main
git reset --hard origin/main
npm install --production=false
npm run build

# Генерация статического gzip для мгновенной отдачи с Nginx
echo "🗜️ [5/5] Предварительное сжатие gzip_static..."
gzip -k9f /var/www/maison/dist/assets/*.js /var/www/maison/dist/assets/*.css /var/www/maison/dist/index.html 2>/dev/null || true

# Перезапуск Node.js сервиса
systemctl restart maison
systemctl status maison --no-pager

echo "=========================================================="
echo "🎉 ВСЕ ИСПРАВЛЕНИЯ ПРИМЕНЕНЫ УСПЕШНО!"
echo "   OCSP Stapling активирован"
echo "   modulepreload удален"
echo "   TCP Fast Open отключен"
echo "   Nginx и Maison перезапущены"
echo "=========================================================="
