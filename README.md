# daily-briefing ☀️

A personal AI morning letter — not a newsletter, not a dashboard, a letter from someone who reads weird stuff overnight and wants to tell you about it.

Built for [OpenClaw](https://github.com/openclaw/openclaw) agents, but the protocol is model-agnostic.

## Philosophy

Most AI-generated daily briefings are dashboards: weather widget, news widget, calendar widget, done. This is different. It's a **letter** — two stories told well, a couple of short pieces, a handful of brief items, and occasionally a postscript. Designed to feel like your smartest friend caught you up over coffee.

Key principles (stolen from studying [The Skimm](https://www.theskimm.com/)):
- **The curator is the product.** Not the information — the taste, the connections, the voice.
- **Two things, told well.** The main stories aren't summaries. They're ideas the writer can't stop thinking about.
- **Editorialize through selection, not opinion.** Raised eyebrow, not a take.
- **Academic where it needs to be.** Don't flatten depth for accessibility. Trust your reader.
- **10-12 minutes.** Long enough to sit with, not a research paper.

## How It Works

A cron job fires an isolated agent session every morning. The agent:

1. Reads the briefing protocol (`briefing-spec.md`)
2. Reads recent context (memory files, assignments, ongoing conversations)
3. Checks weather and transit
4. Searches the web for papers, news, events, and rabbit holes
5. Writes the briefing
6. Delivers to Discord (plain markdown) + email (styled HTML)

## Structure

**Header** — Date, weather, one-line logistics.

**Story 1** — The main piece. One thing told well. Connected to the reader's world. Bold lead-ins for structural beats (**The setup.**, **Why it matters.**). `📎` sources at the end.

**Story 2** — A second deep-ish piece. Ideally threads back to the first story, but doesn't have to.

**Small Stories** (1-2) — Each gets its own header. A paragraph or two. Timely, local, seasonal, or just a bite-sized rabbit hole.

**In Brief** — 4 quick hits from a rotating pool:

| Category | Example |
|----------|---------|
| On this day | Historical event, obscure or famous |
| News item | NLP, science, tech policy, culture |
| Tool | CLI utility, library, workflow tip |
| Music rec | Album, playlist, radio stream |
| Word of the day | Any language, jargon, archaic, technical |
| Quote | From anyone, about anything |
| "This exists" | Website, dataset, community |
| Local event | Talks, lectures, exhibits nearby |
| A person | Researcher, historical figure |
| Something funny | Meme, joke, absurd headline |
| Wildcard | Anything that doesn't fit above |

**Postscript** — Optional. Personal. Not every day.

## Email Template

The email version uses a styled HTML template with a warm terminal-letter aesthetic:
- Monospace body text (Courier New)
- Serif headers (Georgia) — bold, large
- Warm near-white card on a parchment-toned background
- Dashed section dividers
- Styled blockquotes, links, and code snippets
- "TRANSMISSION FROM [YOUR MACHINE]" header (auto-detects hostname, or set `BRIEFING_MACHINE` env var)

The renderer (`render-email.js`) converts briefing markdown to HTML automatically. It handles:
- `**Bold Title**` → large serif heading
- `### Small Title` → medium serif heading
- `> blockquote` → styled sidebar quote
- `[link text](url)` → colored underlined links
- `**In Brief**` section → labeled quick-hit items
- Postscript detection (italic blocks)
- Sign-off extraction (writer's sign-off from the markdown)

## Setup

### Prerequisites
- [OpenClaw](https://github.com/openclaw/openclaw) (or any agent framework with cron + web search + messaging)
- Node.js (for the email renderer)
- A Discord channel (or other delivery target)
- [Resend](https://resend.com) account for email delivery (free tier: 100 emails/day)

### 1. Customize the spec

Edit `briefing-spec.md` for your reader:
- Their interests, background, and level
- Delivery channels and addresses
- Data sources (weather location, transit system, etc.)
- Voice and tone preferences

### 2. Set up email

If you want email delivery via Resend:

1. Sign up at [resend.com](https://resend.com)
2. Add a domain (we recommend a subdomain like `mail.yourdomain.com` to avoid MX conflicts)
3. Add DNS records (DKIM TXT + SPF TXT)
4. Create `.env` with your credentials:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   BRIEFING_FROM=briefing@mail.yourdomain.com
   BRIEFING_TO=reader@example.com
   ```

### 3. Create the cron job

For OpenClaw, add a cron job:

```json
{
  "name": "daily-briefing",
  "schedule": { "kind": "cron", "expr": "0 7 * * *", "tz": "America/New_York" },
  "payload": {
    "kind": "agentTurn",
    "message": "Read briefing-spec.md and write today's briefing following the protocol."
  },
  "sessionTarget": "isolated"
}
```

### 4. Test

```bash
# Render without sending
bash send-email.sh example-briefing.md --dry-run

# Send a test
bash send-email.sh example-briefing.md
```

## Files

```
├── README.md              # You're here
├── briefing-spec.md       # The protocol — voice, structure, sources, rules
├── briefing-template.html # Email HTML template
├── render-email.js        # Markdown → styled HTML renderer
├── send-email.sh          # Render + send via Resend
├── example-briefing.md    # Sample output
├── briefings/             # Generated daily briefings (gitignored)
└── .env.example           # Environment variable template
```

## Email Infrastructure

If your domain already has email forwarding (e.g., Namecheap), use a **subdomain** for Resend to avoid MX conflicts:

- Root domain (`you.com`) → email forwarding (receiving)
- Subdomain (`mail.you.com`) → Resend (sending)

Required DNS records for the subdomain:
- **TXT** `resend._domainkey.mail` → DKIM public key (from Resend dashboard)
- **TXT** `send.mail` → SPF record (`v=spf1 include:amazonses.com ~all`)

## Inspiration

- [The Skimm](https://www.theskimm.com/) — conversational structure, editorial voice in the seams, two-story format
- [Craig Mod's Roden](https://craigmod.com/roden/) — the curator as the product, personal letters over content products
- [Robin Sloan's newsletter](https://www.robinsloan.com/newsletters/) — olive oil next to language models, coherence through trust in the writer's mind
- [Austin Kleon](https://austinkleon.com/newsletter/) — just sharing what you noticed this week

## License

MIT
