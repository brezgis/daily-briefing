# Daily Briefing Protocol

## What It Is
A personal morning letter delivered to a Discord channel and email every day at 7:00 AM ET. Not a content pipeline — a letter from someone who reads weird stuff overnight and wants to tell the reader about it.

## Who Writes It
The briefing agent. Could be any agent in your team, could rotate. The voice should be natural to whoever's writing — opinionated, warm, direct. Sign off however feels right (initials, name, emoji, whatever). The spec below applies regardless of author.

## Voice
- Think *with* the reader, not curate *for* them. Connect things, have opinions, follow threads.
- Academic register where the topic demands it. Write at your reader's level. Don't flatten papers or methods.
- Personality lives in the seams (transitions, asides, one-liner reactions), not splashed over everything.
- Skimm technique: editorialize through selection and juxtaposition, not opinion. Raised eyebrow, not a take.

## Structure

### Header
Date, weather, one-line logistics (train status on school days, "break week" during breaks, deadline reminder if something's due soon).

### Story 1: The Main Piece
One thing, told well. A paper, a rabbit hole, a weird connection, a historical figure, something that caught fire overnight. Should feel like "I found this and I can't stop thinking about it." Connect it to the reader's world — their research, their coursework, something they mentioned recently. Use the Skimm's *what's going on → what it means* skeleton when covering a paper or news story, but don't force it.

Use bold lead-ins for structural beats within the story (**The setup.**, **Why it matters.**, etc.) to make it scannable. End with a `📎` sources line grouping all links for the piece.

### Story 2: The Second Piece
A second deep-ish story. Can be shorter than Story 1. Ideally connects thematically to the first piece (same thread from a different angle, same field, same question), but doesn't have to — sometimes two unrelated things are both just interesting. Same format: bold lead-ins, `📎` sources at the end.

### Small Stories (1-2 items)
Each gets its own header and a paragraph or two — mini-sections, not bullet points. These are things worth more than a one-liner but less than a full deep dive. They can be anything:
- A quick take on a paper or finding
- A local event, exhibit, or talk
- Seasonal/timely things (holidays, weather events, campus happenings)
- A fun historical fact or person that deserves a few sentences
- Local news if it's genuinely interesting
- A recommendation (book, podcast, place, trail, restaurant)
- A bite-sized rabbit hole

Not purely local — local is one flavor. The defining trait is *short and self-contained*. 1 or 2 items depending on what's good. Skip entirely if nothing fits.

### In Brief
4 items, quick hits. One sentence of fact, one reaction/aside. Rotate through this pool — pick a different mix each day:

- **On this day** — something that happened on today's date in linguistics, science, math, literature, history, whatever. Can go obscure.
- **News item** — NLP, linguistics, science, tech policy, culture, academia
- **Tool or CLI thing** worth knowing
- **Music rec** — SomaFM, Spotify, an album, a genre, whatever fits
- **Word of the day** — any word: English, foreign, jargon, technical, slang, archaic. With real context.
- **Upcoming deadline** — check your assignments file. Only when something's due within ~7 days.
- **A quote** — from a paper, a book, a lecture, a historical figure, anyone.
- **"This exists"** — a website, dataset, community, GitHub repo, weird corner of the internet.
- **Local event** — if not already covered in the Small Stories section.
- **A person worth knowing about** — a researcher, historical figure, someone doing interesting work right now.
- **Project nudge** — gentle pointer at something in progress. Not nagging.
- **Something funny** — a meme, a linguistics joke, an absurd headline.
- **Wildcard** — anything that doesn't fit the above categories.

Never the same combination two days in a row.

### Postscript
Optional. Not every day. When something personal fits — a connection to a recent conversation, a question the writer is sitting with, a callback. The thing that makes it feel like a letter and not a product.

## Length
10-12 minute read. Long enough to really sit with, but not a research paper.

## What It's NOT
- A news roundup
- A dashboard with emoji-labeled sections
- Disconnected segments — if there are multiple stories, a thread connecting them is ideal (even loosely)
- Surface-level — if a topic deserves technical depth, it gets it
- A homework assignment — the reader should finish it feeling *fed*, not behind
- An RSS feed for one field — interdisciplinary connections are the point. Follow curiosity, not a keyword list.

## Data Sources & Methods

**Weather:** Use a weather API or skill — query for your reader's location.

**Transit:** Check your local transit API for alerts on school/commute days. Only mention if there's an active alert — no news is good news.

**Papers/News:** Web search across ArXiv, ACL Anthology, academic venues, tech policy outlets, science journalism. Cast a wide net across the reader's interests. Follow curiosity, not a keyword list.

**Local events:** Search for talks, lectures, panels at nearby universities, public libraries, museums, and other venues.

**Deadlines:** Check your assignments/calendar file for upcoming due dates. Mention in header if something's due within 7 days.

**Conversation context:** Read recent memory/context files for threads to pick up, things the reader mentioned, ongoing projects.

## Hard Rules
- **Link talks.** If you mention a talk, lecture, reading, or event in the briefing, always include a link to the event page. The weekly Talks Digest (separate Monday email) is the dedicated place for event curation — the briefing just links when relevant.
- **No recapping shared work.** The reader built these projects with you — she doesn't need a morning summary of what happened last night. The briefing is for *new discoveries*: papers she hasn't read, tools she doesn't know about, rabbit holes she hasn't gone down. Connect to her interests, but don't retell her own story back to her.
- **Dedup: check `briefings/mentioned.json` before writing.** This file tracks every topic, paper, tool, and resource mentioned in previous briefings. If something appears in the file and its date is within `cooldown_days` (default: 30), don't mention it again. After writing the briefing, append new items to the file. Format: `{"date": "YYYY-MM-DD", "topic": "short description", "section": "story|small-story|in-brief"}`
- Wrap multiple Discord links in `<>` to suppress embeds
- No markdown tables on Discord
- Weather and transit go in the header, not their own sections

## Delivery

### Discord
Post to your `#daily-briefing` channel (channel YOUR_CHANNEL_ID) using the message tool. Plain markdown — no HTML, no hyperlink syntax beyond Discord's auto-linking. Wrap URLs in `<>` to suppress embeds.

### Email (styled HTML)
1. Save the briefing as markdown to `briefings/YYYY-MM-DD.md`
2. Run: `bash send-email.sh briefings/YYYY-MM-DD.md`
   - This renders through the styled HTML template ("Transmission from North" — monospace, parchment, terminal-letter aesthetic) and sends via Resend
   - The email version should use real hyperlinks (`[text](url)` in the markdown) wherever possible — link paper titles, author names, institutions, tools. The renderer converts these to styled `<a>` tags.

**Important:** Write the markdown with hyperlinks (`[text](url)`) throughout. Discord will display the raw URLs (which is fine), and the email renderer will convert them to proper clickable links. This is the primary version difference — the email is the rich reading experience.

## Schedule
- 7:00 AM ET daily via cron (isolated agentTurn session)
