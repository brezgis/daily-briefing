#!/usr/bin/env node
// render-email.js — Convert briefing markdown to styled HTML email
// Usage: node render-email.js <briefing.md> > output.html

const fs = require('fs');
const path = require('path');

const mdFile = process.argv[2];
if (!mdFile || !fs.existsSync(mdFile)) {
  console.error('Usage: node render-email.js <briefing.md>');
  process.exit(1);
}

const md = fs.readFileSync(mdFile, 'utf-8');
const template = fs.readFileSync(path.join(__dirname, 'briefing-template.html'), 'utf-8');

// Machine name — set via env var or defaults to hostname
const machineName = process.env.BRIEFING_MACHINE || require('os').hostname().split('.')[0];

// --- Style constants ---
const S = {
  title: "font-family:Georgia, 'Times New Roman', serif; font-size:26px; color:#1a1a1a; font-weight:bold; line-height:1.3;",
  h3: "font-family:Georgia, 'Times New Roman', serif; font-size:18px; color:#1a1a1a; font-weight:bold; line-height:1.4;",
  body: "font-family:'Courier New', Courier, monospace; font-size:14px; color:#2a2a2a; line-height:1.75;",
  brief: "font-family:'Courier New', Courier, monospace; font-size:13px; color:#2a2a2a; line-height:1.7;",
  meta: "font-family:'Courier New', Courier, monospace; font-size:11px; color:#8a7f6e; letter-spacing:2px; text-transform:uppercase;",
  link: 'color:#6b5630; text-decoration:underline;',
  boldColor: '#1a1a1a',
  codeBg: '#efede9',
  blockquoteBorder: '#d4cfc7',
  blockquoteColor: '#444',
  divider: '#d4cfc7',
};

// --- Markdown to HTML ---
function mdToHtml(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="${S.link}">$1</a>`)
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${S.boldColor};">$1</strong>`)
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, `<code style="background-color:${S.codeBg}; padding:1px 4px; border-radius:2px; font-size:12px;">$1</code>`)
    .replace(/\u201c/g, '&ldquo;').replace(/\u201d/g, '&rdquo;')
    .replace(/\u2019/g, '&rsquo;').replace(/\u2018/g, '&lsquo;')
    .replace(/\u2014/g, '&mdash;').replace(/\u2013/g, '&ndash;')
    .replace(/ — /g, ' &mdash; ').replace(/—/g, '&mdash;');
}

function renderBlockquote(text) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
<tr><td style="width:3px; background-color:${S.blockquoteBorder};"></td>
<td style="padding:8px 16px; font-family:'Courier New', Courier, monospace; font-size:13px; color:${S.blockquoteColor}; line-height:1.7; font-style:italic;">
${mdToHtml(text)}</td></tr></table>`;
}

function renderParas(text, style) {
  style = style || S.body;
  const paras = text.trim().split(/\n\n+/);
  return paras.map(p => {
    const t = p.trim();
    if (!t) return '';
    if (t.startsWith('> ')) {
      return renderBlockquote(t.replace(/^> ?/gm, ''));
    }
    return `<p style="margin:0 0 14px 0;">${mdToHtml(t)}</p>`;
  }).join('\n');
}

function divider() {
  return `<tr><td style="padding:28px 32px 0 32px;"><div style="border-top:1px dashed ${S.divider};"></div></td></tr>`;
}

function storyTitle(title) {
  return `<tr><td style="padding:28px 32px 0 32px;"><div style="${S.title}"><b>${title}</b></div></td></tr>`;
}

function h3Title(title) {
  return `<tr><td style="padding:24px 32px 0 32px;"><div style="${S.h3}"><b>${title}</b></div></td></tr>`;
}

function bodyBlock(html) {
  return `<tr><td style="padding:16px 32px 0 32px; ${S.body}">${html}</td></tr>`;
}

// --- Parse the markdown into sections ---
// Split on --- dividers, then classify each section

const lines = md.split('\n');
let dateWeatherLine = '';
let dateShort = '';
let subject = '';
const sections = []; // {type: 'story'|'small'|'brief'|'postscript'|'signoff', title, body}

// Extract date line (first line starting with #)
let startIdx = 0;
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t.match(/^#\s*\w+day,/)) {
    dateWeatherLine = t.replace(/^#\s*/, '');
    const m = dateWeatherLine.match(/(\w+)\s+(\d+)/);
    if (m) {
      const months = {January:'01',February:'02',March:'03',April:'04',May:'05',June:'06',
        July:'07',August:'08',September:'09',October:'10',November:'11',December:'12'};
      dateShort = `2026-${months[m[1]] || '??'}-${m[2].padStart(2,'0')}`;
    }
    startIdx = i + 1;
    break;
  }
}

// Split remaining lines by --- into chunks
const chunks = [];
let currentChunk = [];
for (let i = startIdx; i < lines.length; i++) {
  if (lines[i].trim() === '---') {
    if (currentChunk.length) chunks.push(currentChunk.join('\n').trim());
    currentChunk = [];
  } else {
    currentChunk.push(lines[i]);
  }
}
if (currentChunk.length) chunks.push(currentChunk.join('\n').trim());

// Classify chunks
let storyCount = 0;
for (const chunk of chunks) {
  if (!chunk) continue;
  const firstLine = chunk.split('\n')[0].trim();
  const rest = chunk.split('\n').slice(1).join('\n').trim();

  // Sign-off line
  if (chunk.match(/^—\s*\w/) && chunk.length < 30) {
    sections.push({ type: 'signoff', body: chunk });
    continue;
  }

  // "In Brief" section
  if (firstLine.toLowerCase().replace(/\*/g, '').startsWith('in brief')) {
    sections.push({ type: 'brief', body: rest || '' });
    continue;
  }

  // Check if starts with ### (small story)
  if (firstLine.startsWith('### ') || firstLine.startsWith('## ') && storyCount >= 2) {
    const title = firstLine.replace(/^#{1,3}\s*/, '');
    sections.push({ type: 'small', title, body: rest });
    continue;
  }

  // Check if starts with **Title** (story)
  if (firstLine.startsWith('**') && firstLine.endsWith('**') && rest) {
    const title = firstLine.replace(/\*\*/g, '');
    if (!subject) subject = title;
    storyCount++;
    sections.push({ type: 'story', title, body: rest });
    continue;
  }

  // Postscript (italic block, typically starts with *)
  // Strip any sign-off line from the end of the chunk
  const chunkLines = chunk.split('\n');
  let postscriptBody = chunk;
  for (let j = chunkLines.length - 1; j >= 0; j--) {
    const cl = chunkLines[j].trim();
    if (cl === '') continue;
    if (cl.match(/^—\s*\w/)) {
      // This is a sign-off line — capture it and remove from postscript
      sections.push({ type: 'signoff', body: cl });
      postscriptBody = chunkLines.slice(0, j).join('\n').trim();
      break;
    }
    break; // only check the last non-empty line
  }
  if (firstLine.startsWith('*') && postscriptBody.length < 1000) {
    const cleaned = postscriptBody.replace(/^\*/, '').replace(/\*$/, '');
    if (cleaned.trim()) {
      sections.push({ type: 'postscript', body: cleaned });
    }
    continue;
  }

  // Sign-off
  if (firstLine.match(/^—/)) continue;

  // Fallback: if it has a bold title line, treat as story
  const boldMatch = firstLine.match(/^\*\*(.+?)\*\*/);
  if (boldMatch && rest) {
    const title = boldMatch[1];
    if (!subject) subject = title;
    storyCount++;
    sections.push({ type: 'story', title, body: rest });
    continue;
  }

  // Otherwise treat as small story with no title or misc content
  if (chunk.length > 50) {
    sections.push({ type: 'small', title: '', body: chunk });
  }
}

// --- Render all sections to HTML ---
let bodyHtml = '';
let signoffHtml = '<tr><td style="padding:20px 32px 32px 32px; font-family:\'Courier New\', Courier, monospace; font-size:14px; color:#444;">&mdash; C &#x1F319;</td></tr>';
let needsDivider = false;

for (const sec of sections) {
  if (needsDivider) bodyHtml += divider();

  if (sec.type === 'story') {
    bodyHtml += storyTitle(sec.title);
    bodyHtml += bodyBlock(renderParas(sec.body));
    needsDivider = true;
  }
  else if (sec.type === 'small') {
    if (sec.title) {
      bodyHtml += h3Title(sec.title);
    }
    bodyHtml += bodyBlock(renderParas(sec.body));
    needsDivider = true;
  }
  else if (sec.type === 'brief') {
    bodyHtml += `<tr><td style="padding:20px 32px 0 32px;"><div style="${S.meta}; margin-bottom:16px;">IN BRIEF</div>`;
    // Split brief items by double newline
    const items = sec.body.split(/\n\n+/).filter(i => i.trim());
    bodyHtml += items.map(item =>
      `<p style="margin:0 0 14px 0; ${S.brief}">${mdToHtml(item.trim())}</p>`
    ).join('\n');
    bodyHtml += '</td></tr>';
    needsDivider = true;
  }
  else if (sec.type === 'postscript') {
    bodyHtml += `<tr><td style="padding:20px 32px 0 32px; font-family:'Courier New', Courier, monospace; font-size:13px; color:#555; line-height:1.7; font-style:italic;">${mdToHtml(sec.body)}</td></tr>`;
    needsDivider = false;
  }
  else if (sec.type === 'signoff') {
    signoffHtml = `<tr><td style="padding:20px 32px 32px 32px; font-family:'Courier New', Courier, monospace; font-size:14px; color:#444;">${mdToHtml(sec.body)}</td></tr>`;
    needsDivider = false;
  }
}

// --- Fill template ---
const html = template
  .replace('{{SUBJECT}}', subject)
  .replace('{{DATE_WEATHER_LINE}}', mdToHtml(dateWeatherLine))
  .replace('{{BODY_HTML}}', bodyHtml)
  .replace('{{HEADER_LABEL}}', `TRANSMISSION FROM ${machineName.toUpperCase()}`)
  .replace('{{FOOTER_LABEL}}', `transmitted from ${machineName.toLowerCase()}`)
  .replace('{{SIGNOFF_HTML}}', signoffHtml)
  .replace('{{DATE_SHORT}}', dateShort);

process.stdout.write(html);
