#!/bin/bash
# GiveMeSomeTokens VPS Setup Script
# Run once on a fresh Ubuntu 22.04 / 24.04 VPS as root
# Usage: curl -fsSL https://raw.githubusercontent.com/3289david/GiveMeSomeTokens/main/scripts/setup-vps.sh | bash

set -e

echo "==> Installing system dependencies"
apt-get update -qq
apt-get install -y curl git postgresql postgresql-contrib nginx certbot python3-certbot-nginx

echo "==> Installing Node.js 22 (LTS)"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "==> Installing PM2"
npm install -g pm2

echo "==> Setting up PostgreSQL"
sudo -u postgres psql -c "CREATE USER gmtuser WITH PASSWORD 'changeme_strong_password';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE givemesometokens OWNER gmtuser;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE givemesometokens TO gmtuser;" 2>/dev/null || true

echo "==> Creating app directory"
mkdir -p /var/www/givemesometokens
cd /var/www/givemesometokens

echo "==> Done. Next steps:"
echo "  1. Clone your repo:   git clone https://github.com/3289david/GiveMeSomeTokens.git ."
echo "  2. Copy .env:         cp .env.example .env && nano .env"
echo "  3. Run deploy script: ./scripts/deploy.sh"
echo "  4. Setup Nginx:       ./scripts/setup-nginx.sh givemesometokens.dev"
echo "  5. Setup SSL:         certbot --nginx -d givemesometokens.dev"
