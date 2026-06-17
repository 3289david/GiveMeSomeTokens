#!/bin/bash
# Generate all required secret values for .env
# Usage: ./scripts/gen-secrets.sh
# Copy the output into your .env file

echo "# === Generated Secrets for GiveMeSomeTokens ==="
echo ""
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo ""
echo "# 64-char hex = 32 bytes for AES-256-GCM"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo ""
echo "# Random key for Altcha CAPTCHA"
echo "ALTCHA_HMAC_KEY=$(openssl rand -base64 24)"
echo ""
echo "# === Fill in manually ==="
echo "DATABASE_URL=postgresql://gmtuser:YOUR_DB_PASSWORD@localhost:5432/givemesometokens"
echo "NEXTAUTH_URL=https://givemesometokens.dev"
echo "GOOGLE_CLIENT_ID="
echo "GOOGLE_CLIENT_SECRET="
echo "GITHUB_CLIENT_ID="
echo "GITHUB_CLIENT_SECRET="
