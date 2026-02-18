# Code Review — daily-briefing

**Reviewer:** Bea  
**Date:** 2026-02-18  
**Scope:** Heading rendering fix in `render-email.js` + full codebase review

---

## Critical

### 1. `send-email.sh` — Hardcoded paths and personal email addresses
- **Line 8:** `ENV_FILE="/home/anna/clawd/.env"` — hardcoded absolute path
- **Line 9:** `FROM_EMAIL="briefing@mail.brezgis.com"` — hardcoded sender
- **Line 10:** `TO_EMAIL="annabrezgis@gmail.com"` — hardcoded personal email

These should use env vars (the README already documents `BRIEFING_FROM` and `BRIEFING_TO` but the script doesn't use them). Also leaks PII if pushed to a public repo.

**Fix:** Source `.env` earlier and use `BRIEFING_FROM`/`BRIEFING_TO` env vars with fallback defaults.

---

## Important

### 2. Heading fix looks correct but `##` stories don't get `storyTitle()` styling for the first two
The fix properly classifies `## Heading` chunks as stories (type `'story'`) and `### Heading` as small stories. The `renderParas()` mid-body heading handler also looks correct. **No issues found with the fix itself.**

### 3. Section classifier operator precedence bug (pre-existing, now fixed)
The old code had `firstLine.startsWith('### ') || firstLine.startsWith('## ') && storyCount >= 2` which, due to `&&` binding tighter than `||`, would always match `### ` but only match `## ` when `storyCount >= 2`. The fix correctly restructures this. Good.

### 4. Date parsing is hardcoded to 2026
Line ~107: `dateShort = '2026-${months[m[1]]...` — hardcodes the year. Should extract from the date line or use the current year.

---

## Minor

### 5. `render-email.sh` exists but is gitignored
There's a second script `render-email.sh` with similar hardcoded values. It's gitignored so no PII leak, but it duplicates functionality with `send-email.sh`. Not blocking.

### 6. No `.env.example` file
README references one in the file listing but it doesn't exist.

### 7. Postscript detection is fragile
Only triggers if the chunk starts with `*` and is under 1000 chars. A postscript without leading italics would fall through to the generic handler.

### 8. No error handling for missing template
If `briefing-template.html` is missing, the script crashes with an unhelpful error.

---

## Summary

The heading rendering fix is clean and correct. One critical issue: hardcoded PII in `send-email.sh` needs scrubbing before push. The hardcoded year in date parsing is worth noting but not blocking.
