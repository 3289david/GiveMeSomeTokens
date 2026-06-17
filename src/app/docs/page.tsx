import { Nav } from "@/components/nav";
import Link from "next/link";

function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  return (
    <pre className={`bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-sm font-mono text-zinc-300 language-${lang}`}>
      <code>{children}</code>
    </pre>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-xl font-bold mb-4 text-zinc-100">{title}</h2>
      {children}
    </section>
  );
}

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/20 text-blue-400",
    POST: "bg-green-500/20 text-green-400",
    DELETE: "bg-red-500/20 text-red-400",
    PUT: "bg-yellow-500/20 text-yellow-400",
  };
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 mb-3">
      <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono flex-shrink-0 mt-0.5 ${colors[method]}`}>{method}</span>
      <div>
        <code className="text-sm text-zinc-200 font-mono">{path}</code>
        <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 py-12 flex gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-6 space-y-1 text-sm">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Contents</p>
            {[
              ["#quickstart", "Quick Start"],
              ["#authentication", "Authentication"],
              ["#chat-completions", "Chat Completions"],
              ["#models", "Models"],
              ["#providers", "Providers"],
              ["#wallet", "Wallet API"],
              ["#support", "Support API"],
              ["#oauth", "GMT Connect OAuth"],
              ["#errors", "Error Codes"],
              ["#sdks", "SDKs & Tools"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="block text-zinc-500 hover:text-zinc-200 transition-colors py-0.5">{label}</a>
            ))}
          </div>
        </aside>

        {/* Main docs */}
        <main className="flex-1 min-w-0">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-3">API Documentation</h1>
            <p className="text-zinc-400">
              GiveMeSomeTokens provides an OpenAI-compatible API proxy that routes requests to 14 AI providers using your wallet balances.
              Use any OpenAI SDK — just swap the base URL and use your GMT key.
            </p>
          </div>

          <Section id="quickstart" title="Quick Start">
            <p className="text-zinc-400 text-sm mb-4">
              Get started in 3 steps: connect a provider key, generate a GMT key, and start making API calls.
            </p>
            <ol className="space-y-4 text-sm text-zinc-400 mb-6">
              <li className="flex gap-3">
                <span className="text-orange-400 font-bold flex-shrink-0">1.</span>
                <span>Sign up at <Link href="/login?mode=register" className="text-orange-400 hover:underline">givemesometokens.dev/login</Link> and connect your AI provider key under <strong className="text-zinc-300">Dashboard → API Keys</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-400 font-bold flex-shrink-0">2.</span>
                <span>Generate a GMT key under <strong className="text-zinc-300">Dashboard → Integrations</strong>. It starts with <code className="bg-zinc-800 px-1 rounded">gmt_</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-400 font-bold flex-shrink-0">3.</span>
                <span>Make API calls using your GMT key:</span>
              </li>
            </ol>
            <CodeBlock lang="bash">{`curl https://givemesometokens.dev/api/v1/chat/completions \\
  -H "Authorization: Bearer gmt_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-6",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}</CodeBlock>

            <p className="text-zinc-500 text-sm mt-4">Or use the OpenAI Python SDK:</p>
            <CodeBlock lang="python">{`from openai import OpenAI

client = OpenAI(
    api_key="gmt_your_key_here",
    base_url="https://givemesometokens.dev/api/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-6",   # or gpt-4o, gemini-2.5-pro, etc.
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`}</CodeBlock>
          </Section>

          <Section id="authentication" title="Authentication">
            <p className="text-zinc-400 text-sm mb-4">
              All API requests require a GMT key passed as a Bearer token in the <code className="bg-zinc-800 px-1 rounded text-zinc-300">Authorization</code> header.
            </p>
            <CodeBlock>{`Authorization: Bearer gmt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}</CodeBlock>
            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-300">
              <strong>Security:</strong> Your GMT key routes through your stored API keys — it never exposes the underlying provider keys. Treat your GMT key like a password.
            </div>
          </Section>

          <Section id="chat-completions" title="Chat Completions">
            <Endpoint method="POST" path="/api/v1/chat/completions" desc="Create a chat completion (OpenAI-compatible)" />
            <p className="text-zinc-400 text-sm mb-3">Full OpenAI-compatible endpoint. Supports streaming.</p>

            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Request body</h3>
            <CodeBlock lang="json">{`{
  "model": "claude-sonnet-4-6",        // Required: model name
  "messages": [                         // Required: conversation history
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": false,                      // Optional: enable SSE streaming
  "max_tokens": 1024,                   // Optional
  "temperature": 0.7,                   // Optional (0-2)
  "top_p": 1.0                          // Optional
}`}</CodeBlock>

            <h3 className="text-sm font-semibold text-zinc-300 mb-2 mt-4">Response</h3>
            <CodeBlock lang="json">{`{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1718000000,
  "model": "claude-sonnet-4-6",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  }
}`}</CodeBlock>

            <h3 className="text-sm font-semibold text-zinc-300 mb-2 mt-4">Streaming example</h3>
            <CodeBlock lang="python">{`stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a poem"}],
    stream=True
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")`}</CodeBlock>
          </Section>

          <Section id="models" title="Models">
            <Endpoint method="GET" path="/api/v1/models" desc="List all available models" />
            <CodeBlock lang="bash">{`curl https://givemesometokens.dev/api/v1/models \\
  -H "Authorization: Bearer gmt_your_key_here"`}</CodeBlock>
            <p className="text-zinc-500 text-sm mt-4 mb-2">Models are routed by prefix:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                    <th className="pb-2 font-medium">Model prefix</th>
                    <th className="pb-2 font-medium">Provider</th>
                    <th className="pb-2 font-medium">Examples</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm text-zinc-400">
                  {[
                    ["claude-*", "Anthropic", "claude-sonnet-4-6, claude-opus-4-7"],
                    ["gpt-*, o1-*, o4-*", "OpenAI", "gpt-4o, gpt-4o-mini, o4-mini"],
                    ["gemini-*", "Google", "gemini-2.5-pro, gemini-2.5-flash"],
                    ["llama-*, mixtral-*, gemma*", "Groq", "llama-3.3-70b-versatile"],
                    ["grok-*", "xAI", "grok-3, grok-3-mini"],
                    ["mistral-*, codestral-*", "Mistral AI", "mistral-large-latest"],
                    ["deepseek-*", "DeepSeek", "deepseek-chat, deepseek-reasoner"],
                    ["command-*", "Cohere", "command-r-plus, command-r"],
                    ["sonar-*, llama-*-online", "Perplexity", "sonar-pro"],
                    ["meta-llama/* (together)", "Together AI", "meta-llama/Llama-3.3-70B-Instruct-Turbo"],
                    ["accounts/fireworks/*", "Fireworks AI", "accounts/fireworks/models/llama-v3p1-70b-instruct"],
                    ["llama3.*b", "Cerebras", "llama3.3-70b, llama3.1-8b"],
                    ["jamba-*", "AI21 Labs", "jamba-1.5-large"],
                    ["Everything else", "OpenRouter", "Any 200+ OpenRouter model"],
                  ].map(([prefix, provider, examples]) => (
                    <tr key={prefix}>
                      <td className="py-2 font-mono text-zinc-300 text-xs">{prefix}</td>
                      <td className="py-2">{provider}</td>
                      <td className="py-2 text-xs text-zinc-500">{examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="providers" title="Providers">
            <p className="text-zinc-400 text-sm mb-4">
              14 providers supported. Connect your keys at <Link href="/dashboard/providers" className="text-orange-400 hover:underline">Dashboard → API Keys</Link>.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["Claude (Anthropic)", "GPT (OpenAI)", "Gemini (Google)", "OpenRouter", "Groq", "Grok (xAI)", "Mistral AI", "DeepSeek", "Cohere", "Perplexity AI", "Together AI", "Fireworks AI", "Cerebras", "AI21 Labs"].map(p => (
                <div key={p} className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5">{p}</div>
              ))}
            </div>
            <p className="text-zinc-500 text-xs mt-4">
              See <Link href="/providers" className="text-orange-400 hover:underline">all providers</Link> for supported models and API details.
            </p>
          </Section>

          <Section id="wallet" title="Wallet API">
            <Endpoint method="GET" path="/api/wallet" desc="Get your wallet balances across all providers" />
            <CodeBlock lang="bash">{`curl https://givemesometokens.dev/api/wallet \\
  -H "Authorization: Bearer gmt_your_key_here"`}</CodeBlock>
            <CodeBlock lang="json">{`{
  "claudeBalance": 50.0,
  "openaiBalance": 100.0,
  "geminiBalance": 25.0,
  "groqBalance": 75.0
  // ... all 14 providers
}`}</CodeBlock>
          </Section>

          <Section id="support" title="Support API">
            <p className="text-zinc-400 text-sm mb-4">Send token support to a creator programmatically.</p>
            <Endpoint method="POST" path="/api/support" desc="Send tokens to a creator" />
            <CodeBlock lang="json">{`{
  "creatorId": "clxxxxxxxxxxxx",
  "provider": "claude",
  "amount": 10.0,
  "message": "Keep up the great work!",
  "isAnonymous": false,
  "isPublic": true
}`}</CodeBlock>

            <Endpoint method="GET" path="/api/users/:username" desc="Get a creator's public profile and wallet address" />
            <CodeBlock lang="bash">{`curl https://givemesometokens.dev/api/users/alice`}</CodeBlock>
            <CodeBlock lang="json">{`{
  "id": "clxxxxxxxxxxxx",
  "username": "alice",
  "name": "Alice",
  "bio": "AI developer",
  "isCreator": true,
  "creatorTier": "Gold"
}`}</CodeBlock>
          </Section>

          <Section id="oauth" title="GMT Connect OAuth">
            <p className="text-zinc-400 text-sm mb-4">
              Allow your app to authenticate users via GiveMeSomeTokens and access their token balances.
              Requires a <strong className="text-zinc-200">Pro</strong> plan.{" "}
              <Link href="/dashboard/connect" className="text-orange-400 hover:underline">Register an OAuth app →</Link>
            </p>

            <h3 className="text-sm font-semibold text-zinc-300 mb-2">OAuth flow</h3>
            <ol className="space-y-3 text-sm text-zinc-400 mb-4">
              <li className="flex gap-3"><span className="text-orange-400 font-bold">1.</span> Redirect user to the authorization endpoint</li>
              <li className="flex gap-3"><span className="text-orange-400 font-bold">2.</span> User approves access on GMT</li>
              <li className="flex gap-3"><span className="text-orange-400 font-bold">3.</span> GMT redirects back with <code className="bg-zinc-800 px-1 rounded">?code=...</code></li>
              <li className="flex gap-3"><span className="text-orange-400 font-bold">4.</span> Exchange code for access token</li>
              <li className="flex gap-3"><span className="text-orange-400 font-bold">5.</span> Use token to call GMT APIs on behalf of the user</li>
            </ol>

            <Endpoint method="GET" path="/api/oauth/authorize" desc="Redirect user here to begin OAuth flow" />
            <CodeBlock>{`https://givemesometokens.dev/api/oauth/authorize
  ?client_id=your_client_id
  &redirect_uri=https://yourapp.com/callback
  &response_type=code
  &scope=read_balance use_provider
  &state=random_state_string
  &code_challenge=sha256_of_verifier   // PKCE required
  &code_challenge_method=S256`}</CodeBlock>

            <Endpoint method="POST" path="/api/oauth/token" desc="Exchange authorization code for access token" />
            <CodeBlock lang="json">{`{
  "grant_type": "authorization_code",
  "code": "auth_code_from_redirect",
  "redirect_uri": "https://yourapp.com/callback",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "code_verifier": "your_pkce_verifier"
}`}</CodeBlock>

            <Endpoint method="GET" path="/api/oauth/userinfo" desc="Get authenticated user info (requires token)" />

            <h3 className="text-sm font-semibold text-zinc-300 mb-2 mt-4">Available scopes</h3>
            <div className="space-y-1 text-sm">
              {[
                ["read_profile", "Read user's public profile info"],
                ["read_balance", "Read token wallet balances"],
                ["use_provider", "Route API calls through user's wallet"],
                ["payment", "Send token support on behalf of user"],
                ["subscription", "Manage recurring token subscriptions"],
              ].map(([scope, desc]) => (
                <div key={scope} className="flex gap-3">
                  <code className="text-orange-400 font-mono text-xs w-28 flex-shrink-0 mt-0.5">{scope}</code>
                  <span className="text-zinc-500 text-xs">{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="errors" title="Error Codes">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                    <th className="pb-2 font-medium">HTTP Status</th>
                    <th className="pb-2 font-medium">Error</th>
                    <th className="pb-2 font-medium">Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm text-zinc-400">
                  {[
                    ["401", "Unauthorized", "Missing or invalid GMT key"],
                    ["400", "Missing model", "No model specified in request"],
                    ["400", "No provider key", "Provider key not connected in your wallet"],
                    ["400", "Insufficient balance", "Wallet balance too low for this request"],
                    ["404", "Item not found", "Requested resource does not exist"],
                    ["429", "Rate limited", "Too many requests — slow down"],
                    ["500", "Provider error", "Upstream AI provider returned an error"],
                  ].map(([status, error, cause]) => (
                    <tr key={status + error}>
                      <td className="py-2 font-mono text-red-400">{status}</td>
                      <td className="py-2 text-zinc-300">{error}</td>
                      <td className="py-2 text-zinc-500 text-xs">{cause}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-zinc-500 text-sm mt-4">All errors return JSON: <code className="bg-zinc-800 px-1 rounded text-zinc-300">{"{ \"error\": \"message\" }"}</code></p>
          </Section>

          <Section id="sdks" title="SDKs & Tools">
            <p className="text-zinc-400 text-sm mb-4">
              Since GMT is OpenAI-compatible, any existing OpenAI SDK works out of the box.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  name: "Python (openai)",
                  code: `from openai import OpenAI\nclient = OpenAI(\n  api_key="gmt_...",\n  base_url="https://givemesometokens.dev/api/v1"\n)`,
                },
                {
                  name: "Node.js (openai)",
                  code: `import OpenAI from "openai";\nconst client = new OpenAI({\n  apiKey: "gmt_...",\n  baseURL: "https://givemesometokens.dev/api/v1"\n});`,
                },
                {
                  name: "Cursor / Cline / Continue",
                  code: `# Set in tool settings:\nAPI Base URL: https://givemesometokens.dev/api/v1\nAPI Key: gmt_your_key_here`,
                },
                {
                  name: "curl",
                  code: `curl https://givemesometokens.dev/api/v1/chat/completions \\\n  -H "Authorization: Bearer gmt_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"gpt-4o","messages":[...]}'`,
                },
              ].map(({ name, code }) => (
                <div key={name} className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800 text-xs font-medium text-zinc-400">{name}</div>
                  <pre className="p-3 text-xs font-mono text-zinc-400 overflow-x-auto"><code>{code}</code></pre>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="font-semibold text-sm mb-2">Integration guides</h3>
              <p className="text-zinc-500 text-sm mb-3">See <Link href="/dashboard/integrations" className="text-orange-400 hover:underline">Integrations</Link> in the dashboard for step-by-step setup for Cursor, Cline, Continue, Roo Code, Aider, and more.</p>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
