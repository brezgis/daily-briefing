# daily-briefing ☀️

A personal AI morning letter — not a newsletter, not a dashboard, a letter from someone who reads weird stuff overnight and wants to tell you about it.

Built for [OpenClaw](https://github.com/openclaw/openclaw) agents, but the protocol is model-agnostic.

## Philosophy

Most AI-generated daily briefings are dashboards: weather widget, news widget, calendar widget, done. This is different. It's a **letter** — one main piece told well, a handful of brief items, occasionally a postscript. Designed to feel like your smartest friend caught you up over coffee.

Key principles (stolen from studying [The Skimm](https://www.theskimm.com/)):
- **The curator is the product.** Not the information — the taste, the connections, the voice.
- **One thing, told well.** The main piece isn't a summary. It's one idea the writer can't stop thinking about.
- **Editorialize through selection, not opinion.** Raised eyebrow, not a take.
- **Respect the reader's time.** 6-8 minutes. Coffee-length.
- **Academic where it needs to be.** Don't flatten depth for accessibility. Trust your reader.

## How It Works

A cron job fires an isolated agent session every morning. The agent:

1. Reads the briefing protocol (`briefing-spec.md`)
2. Reads recent context (memory files, assignments, ongoing conversations)
3. Checks weather and transit
4. Searches the web for papers, news, events, and rabbit holes
5. Writes the briefing
6. Delivers to Discord + email

## Structure

**Header** — Date, weather, one-line logistics.

**Main Piece** — One thing told well. A paper, a rabbit hole, a connection, something that caught fire overnight. Connected to the reader's world. Uses the Skimm's *what's going on → what it means* skeleton when it fits.

**In Brief** — 4-5 items, one line each. Rotates from a pool of categories:

| Category | Example |
|----------|---------|
| News item | NLP, science, tech policy, culture |
| Tool | CLI utility, library, workflow tip |
| Music rec | Album, playlist, radio stream |
| Word of the day | Any language, jargon, archaic, technical |
| Quote | From anyone, about anything |
| "This exists" | Website, dataset, community, weird corner of the internet |
| Local event | Talks, lectures, exhibits nearby |
| On this day | Historical event, obscure or famous |
| A person | Researcher, historical figure, someone doing interesting work |
| Something funny | Meme, joke, absurd headline |
| Wildcard | Anything that doesn't fit above |

**Postscript** — Optional. Personal. Not every day.

## Setup

### Prerequisites
- [OpenClaw](https://github.com/openclaw/openclaw) (or any agent framework with cron + web search + messaging)
- A Discord channel (or other delivery target)
- [Resend](https://resend.com) account for email delivery (free tier: 100 emails/day)

### 1. Customize the spec

Copy `briefing-spec.md` and edit it for your reader:
- Their interests, background, and level
- Delivery channels and addresses  
- Data sources (weather location, transit system, etc.)
- Voice and tone preferences

### 2. Set up email (optional)

If you want email delivery via Resend:

1. Sign up at [resend.com](https://resend.com)
2. Add a domain (we recommend a subdomain like `mail.yourdomain.com` to avoid MX conflicts with existing email forwarding)
3. Add DNS records (DKIM TXT + SPF TXT, optionally MX for bounce handling)
4. Store your API key in `.env`:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
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

For other frameworks, any scheduler that can trigger an LLM agent with web access will work.

## Files

```
├── README.md              # You're here
├── briefing-spec.md       # The protocol — voice, structure, sources, rules
├── example-briefing.md    # Sample output
└── .env.example           # Environment variable template
```

## Example Output

See [`example-briefing.md`](example-briefing.md) for a sample briefing.

## Email Infrastructure

If your domain already has email forwarding (e.g., Namecheap Email Forwarding), use a **subdomain** for Resend to avoid MX record conflicts:

- Root domain (`you.com`) → email forwarding (receiving)
- Subdomain (`mail.you.com`) → Resend (sending)

Required DNS records for the subdomain:
- **TXT** `resend._domainkey.mail` → DKIM public key (from Resend dashboard)
- **TXT** `send.mail` → SPF record (`v=spf1 include:amazonses.com ~all`)

Optional:
- **MX** `send.mail` → Resend's bounce handler (only needed if your DNS provider supports subdomain MX records)

## Inspiration

- [The Skimm](https://www.theskimm.com/) — conversational structure, "News in 5" compression, editorial voice in the seams
- [Craig Mod's Roden](https://craigmod.com/roden/) — the curator as the product, personal letters over content products
- [Robin Sloan's newsletter](https://www.robinsloan.com/newsletters/) — olive oil next to language models, coherence through trust in the writer's mind
- [Austin Kleon](https://austinkleon.com/newsletter/) — just sharing what you noticed this week

## License

MIT
