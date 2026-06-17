# GiveMeSomeTokens

**Support creators with AI tokens instead of money.**

GiveMeSomeTokens is a platform where supporters fund AI builders with Claude, GPT, Gemini, and OpenRouter API credits instead of dollars. Think BuyMeACoffee — but the currency is tokens, not coffee.

---

## What it does

Creators connect their AI provider API keys. Supporters send them tokens from their own wallet. Creators use a single GMT key in any OpenAI-compatible tool and their inference costs are covered by their supporters — without anyone ever sharing an API key.

```
Supporter wallet  →  GiveMeSomeTokens proxy  →  Claude / GPT / Gemini / Groq
       ↑                                                      ↑
   Tokens sent                                     Creator's requests
```

---

## Features

### For Creators
- Public profile at `/@username` with token totals, tier badge, and supporter feed
- Fundraising goals with progress bars
- Project-specific token support
- Creator tiers: Bronze (100M+), Silver (1B+), Gold (10B+), Platinum (100B+)
- OpenAI-compatible API proxy — use your GMT key in Cursor, Cline, Continue, Aider, and more
- Dashboard with usage analytics, supporter list, wallet management

### For Supporters
- Send Claude, GPT, Gemini, OpenRouter, or Groq tokens to any creator
- Project-targeted support
- Anonymous or public support with a message
- Monthly recurring subscriptions
- Streaks and supporter tiers

### Platform
- **BYOK Wallet** — connect your own API keys, stored AES-256-GCM encrypted
- **OpenAI-compatible proxy** at `/api/v1/chat/completions` — routes by model name, deducts from wallet
- **GMT Connect** — OAuth provider so third-party apps can "Login with GiveMeSomeTokens"
- **Marketplace** — buy and sell prompt packs, agents, MCP servers, and templates with tokens
- **Leaderboard** — monthly top creators and supporters
- **Widget** — embeddable iframe for any website

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (Google + GitHub OAuth) |
| CAPTCHA | Altcha (self-hosted, privacy-friendly) |
| Encryption | Node.js `crypto` — AES-256-GCM |
| Sessions | Database sessions, 30-day persistence |
| Process manager | PM2 (cluster mode) |
| Web server | Nginx (reverse proxy + SSL) |

---

## Local Development

### Prerequisites
- Node.js 22+
- PostgreSQL running locally
- Google OAuth app ([console.cloud.google.com](https://console.cloud.google.com))
- GitHub OAuth app ([github.com/settings/developers](https://github.com/settings/developers))

### Setup

```bash
git clone https://github.com/3289david/GiveMeSomeTokens.git
cd GiveMeSomeTokens
npm install
```

Generate secret values:

```bash
./scripts/gen-secrets.sh
```

Copy the output into a `.env` file:

```bash
cp .env.example .env
# Fill in the values from gen-secrets.sh output
```

Required `.env` variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/givemesometokens"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."          # openssl rand -base64 32
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
ENCRYPTION_KEY="..."           # openssl rand -hex 32  (64-char hex)
ALTCHA_HMAC_KEY="..."          # openssl rand -base64 24
```

Push the database schema:

```bash
npm run db:push
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to a VPS

### 1. Provision a server

Fresh Ubuntu 22.04 or 24.04 VPS. Run the setup script as root:

```bash
curl -fsSL https://raw.githubusercontent.com/3289david/GiveMeSomeTokens/main/scripts/setup-vps.sh | bash
```

This installs Node.js 22, PostgreSQL, Nginx, Certbot, and PM2.

### 2. Clone and configure

```bash
git clone https://github.com/3289david/GiveMeSomeTokens.git /var/www/givemesometokens
cd /var/www/givemesometokens
./scripts/gen-secrets.sh       # copy output
cp .env.example .env
nano .env                      # paste secrets + set your domain
```

### 3. Deploy

```bash
./scripts/deploy.sh
```

This runs `npm ci`, `prisma migrate deploy`, `next build`, and starts the app with PM2.

### 4. Configure Nginx and SSL

```bash
sudo ./scripts/setup-nginx.sh givemesometokens.dev
sudo certbot --nginx -d givemesometokens.dev -d www.givemesometokens.dev
```

### Future deploys

Just pull and re-run:

```bash
cd /var/www/givemesometokens
./scripts/deploy.sh
```

---

## API

The GMT proxy is OpenAI-compatible. Set these in any tool:

| Setting | Value |
|---|---|
| Base URL | `https://givemesometokens.dev/api/v1` |
| API Key | Your GMT key (`gmt_...`) from Dashboard → Integrations |

**Supported endpoints:**

```
POST /api/v1/chat/completions   OpenAI-compatible chat
GET  /api/v1/models             List available models
GET  /api/v1/balance            Token balances for the key
```

**Model routing:**

| Model prefix | Provider |
|---|---|
| `claude-*` | Anthropic |
| `gpt-*`, `o1-*`, `o3-*`, `o4-*` | OpenAI |
| `gemini-*` | Google |
| `llama-*`, `mixtral-*`, `gemma-*` | Groq |
| everything else | OpenRouter |

### GMT Connect (OAuth)

Third-party apps can authenticate users and access their token balances:

```
GET  /api/oauth/authorize       Authorization endpoint (code flow + PKCE S256)
POST /api/oauth/token           Token exchange
GET  /api/oauth/userinfo        User info
```

Scopes: `read_balance`, `use_provider`, `payment`, `subscription`, `read_profile`

---

## Project Structure

```
src/
├── app/
│   ├── @[username]/          Creator profile, support form, embeddable widget
│   ├── api/
│   │   ├── v1/               OpenAI-compatible proxy (chat, models, balance)
│   │   ├── oauth/            GMT Connect OAuth provider
│   │   ├── support/          Token support transactions
│   │   ├── wallet/           Wallet top-up
│   │   ├── providers/        BYOK key management (encrypted)
│   │   ├── keys/             GMT API key CRUD
│   │   ├── subscriptions/    Recurring token support
│   │   ├── marketplace/      Item listing and purchases
│   │   ├── projects/         Creator projects
│   │   ├── goals/            Fundraising goals
│   │   └── profile/          Profile editing
│   ├── dashboard/            Creator dashboard (all sub-pages)
│   ├── explore/              Discover creators
│   ├── leaderboard/          Monthly rankings
│   ├── marketplace/          Token-powered store
│   ├── wallet/               AI wallet overview
│   ├── login/                Google + GitHub OAuth (with Altcha)
│   ├── onboarding/           Username setup after first login
│   └── oauth/authorize/      OAuth consent screen
├── components/
│   ├── nav.tsx               Server nav wrapper
│   ├── nav-client.tsx        Mobile-responsive nav with hamburger
│   ├── dashboard-sidebar.tsx Mobile drawer + desktop sidebar
│   ├── session-provider.tsx  NextAuth SessionProvider wrapper
│   ├── icons.tsx             SVG icons (GMT logo, provider icons)
│   └── ui/                   button, card, input, badge
├── lib/
│   ├── auth.ts               NextAuth v5 config (30-day database sessions)
│   ├── db.ts                 Prisma singleton
│   ├── encryption.ts         AES-256-GCM encrypt/decrypt
│   ├── altcha.ts             Self-hosted CAPTCHA
│   └── utils.ts              formatTokens, providerLabel, generateGmtKey
prisma/
└── schema.prisma             18 models
scripts/
├── setup-vps.sh              One-time VPS provisioning
├── deploy.sh                 Pull + build + PM2 reload
├── setup-nginx.sh            Nginx config + SSL prompt
└── gen-secrets.sh            Generate all .env secret values
ecosystem.config.js           PM2 cluster config
```

---

## License

MIT
