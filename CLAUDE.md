# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (Turbopack, localhost:3000)
npm run build        # prisma generate + next build
npm run lint         # ESLint

npm run db:push      # Sync schema to DB without migrations (dev only)
npm run db:migrate   # Create and apply a named migration
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:studio    # Open Prisma Studio at localhost:5555
```

For local development, run `./scripts/gen-secrets.sh` to generate all required `.env` values, then `npm run db:push` before `npm run dev`.

## Architecture

### Request flow

Every page that needs auth uses `await auth()` from `src/auth.ts` (NextAuth v5 with PrismaAdapter). The middleware at `src/middleware.ts` guards `/dashboard` and `/wallet` routes — everything else is public. The `src/components/session-provider.tsx` wraps the root layout so client components can call `useSession()`.

New users land on `/onboarding` after their first OAuth sign-in to pick a username. The onboarding API (`/api/users/onboard`) also creates their `Wallet` row.

### Token amounts

All token amounts are stored and passed as **millions of tokens** (a `Float` in the DB). `formatTokens()` in `src/lib/utils.ts` converts to K/M/B display strings. When deducting from a wallet, the amount is always in this same unit.

### The proxy (`/api/v1/chat/completions`)

This is the core feature. It:
1. Reads the `Authorization: Bearer gmt_xxx` header and looks up the `GmtApiKey` record.
2. Determines provider from model name prefix (`claude-*` → Anthropic, `gpt-*`/`o1-*`/`o4-*` → OpenAI, `gemini-*` → Google, `llama-*`/`mixtral-*` → Groq, everything else → OpenRouter).
3. Decrypts the user's stored API key for that provider using `src/lib/encryption.ts` (AES-256-GCM, key from `ENCRYPTION_KEY` env var — must be 64-char hex).
4. Translates OpenAI request format to Anthropic's Messages API format for Claude.
5. Forwards the request, deducts token usage from `Wallet.[provider]Balance`, and writes to `ApiUsageLog`.

Provider API keys on the `Wallet` model are stored as `[provider]KeyEnc` fields (base64 ciphertext). The balance fields are `[provider]Balance` floats. Both sets follow the same naming pattern: `claude`, `openai`, `gemini`, `openrouter`, `groq`.

### Support transaction

`/api/support` runs a Prisma `$transaction` that:
- Decrements `supporter.wallet.[provider]Balance`
- Upserts `creator.wallet.[provider]Balance` (increments)
- Creates the `Support` record
- Advances any matching incomplete `Goal`
- Recalculates and writes `User.creatorTier`
- Upserts the supporter's `Streak`

All token mutations that cross wallet boundaries must go through a `$transaction` to avoid race conditions.

### OAuth provider (GMT Connect)

GiveMeSomeTokens acts as its own OAuth provider. The flow:
- `GET /api/oauth/authorize` — validates `client_id` against `OAuthApp`, checks redirect URI with exact-match, issues a 10-minute `OAuthAuthCode`. Supports PKCE (S256 only).
- `POST /api/oauth/token` — verifies client secret (SHA-256 hash), marks auth code used, issues `gmt_oauth_` prefixed `OAuthToken`.
- `GET /api/oauth/userinfo` — returns user info scoped to the token's granted scopes.
- The consent UI lives at `src/app/oauth/authorize/page.tsx` (server component).

### Wallet encryption

`src/lib/encryption.ts` exports `encrypt(plaintext)` and `decrypt(ciphertext)`. The stored format is `base64(iv[12] + authTag[16] + ciphertext)`. The `ENCRYPTION_KEY` env var must be exactly 64 hex characters (32 bytes). Never store plaintext keys; always encrypt before writing to `[provider]KeyEnc`.

### Nav and dashboard layout

`src/components/nav.tsx` is a server component that reads the session and passes `isLoggedIn`/`username` to `src/components/nav-client.tsx` (client component with mobile hamburger menu).

`src/app/dashboard/layout.tsx` is a server component that passes `email`/`username` to `src/components/dashboard-sidebar.tsx` (client component). On desktop it renders a fixed sidebar; on mobile it renders a top bar + slide-in drawer. Active link highlighting uses `usePathname()`.

### Session persistence

Sessions use `strategy: "database"` with a 30-day `maxAge` and a matching 30-day cookie `maxAge`. This means sessions survive browser restarts. The `updateAge: 24h` prevents a DB write on every single request.

### Altcha CAPTCHA

`src/lib/altcha.ts` wraps `altcha-lib` for server-side challenge generation and verification. The challenge endpoint is `GET /api/altcha`. The login page dynamically imports the `altcha` web component (browser-only) and listens for the `statechange` event before enabling OAuth buttons.

### Creator tier calculation

Tiers are recalculated on every support transaction in `/api/support`. Thresholds (in millions of tokens total received): Bronze ≥ 100, Silver ≥ 1000, Gold ≥ 10000, Platinum ≥ 100000. The result is written to `User.creatorTier`.

## Key env vars

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | 32-byte base64 string |
| `ENCRYPTION_KEY` | **64-char hex** (32 bytes) — wrong length throws at runtime |
| `ALTCHA_HMAC_KEY` | Any random string |
| `GOOGLE_CLIENT_ID/SECRET` | OAuth app from console.cloud.google.com |
| `GITHUB_CLIENT_ID/SECRET` | OAuth app from github.com/settings/developers |
