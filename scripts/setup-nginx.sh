#!/bin/bash
# Setup Nginx reverse proxy for GiveMeSomeTokens
# Usage: sudo ./scripts/setup-nginx.sh givemesometokens.dev

set -e

DOMAIN="${1:-givemesometokens.dev}"
CONF="/etc/nginx/sites-available/givemesometokens"

echo "==> Writing Nginx config for $DOMAIN"
cat > "$CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Proxy to Next.js on port 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }

    # Static file caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

echo "==> Enabling site"
ln -sf "$CONF" /etc/nginx/sites-enabled/givemesometokens
rm -f /etc/nginx/sites-enabled/default

echo "==> Testing Nginx config"
nginx -t

echo "==> Reloading Nginx"
systemctl reload nginx

echo "==> Done. Now run: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
