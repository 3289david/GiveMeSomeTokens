#!/bin/bash
# GiveMeSomeTokens Deploy Script
# Run from /var/www/givemesometokens after cloning
# Usage: ./scripts/deploy.sh

set -e

APP_DIR="/var/www/givemesometokens"
cd "$APP_DIR"

echo "==> Pulling latest code"
git pull origin main

echo "==> Installing dependencies"
npm ci --production=false

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Running database migrations"
npx prisma migrate deploy

echo "==> Building Next.js app"
npm run build

echo "==> Restarting app with PM2"
pm2 describe givemesometokens > /dev/null 2>&1 \
  && pm2 reload givemesometokens --update-env \
  || pm2 start npm --name givemesometokens -- start

pm2 save

echo "==> Deploy complete"
pm2 status givemesometokens
