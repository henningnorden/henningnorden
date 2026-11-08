// Header und Projektkarten im Plakat-Stil, je Projekt in dessen Farben.
// Aufruf: node scripts/plakat.mjs [zielordner]   (Standard: assets/)
// Schriften: Manrope und IBM Plex Mono (SIL OFL), auf die nötigen Zeichen gekürzt, in scripts/fonts/.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const hier = (p) => fileURLToPath(new URL(p, import.meta.url));
const ziel = process.argv[2] ?? hier('../assets');
const fonts = hier('fonts'), drivtsLogo = hier('logos/drivts.svg'), rigorlyLogo = hier('logos/rigorly.svg');
mkdirSync(ziel, { recursive: true });

const f64 = (p) => readFileSync(`${fonts}/${p}`).toString('base64');
const face = (fam, w, p) => `@font-face{font-family:${fam};font-weight:${w};src:url(data:font/woff2;base64,${f64(p)}) format('woff2')}`;
const FONT = {
  m600: face('MR', 600, 'manrope-latin-600-normal.woff2'),
  m800: face('MR', 800, 'manrope-latin-800-normal.woff2'),
  mono: face('PM', 500, 'ibm-plex-mono-latin-500-normal.woff2'),
};
const svg = (w, h, fs, body, label) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
<style>${fs.map((k) => FONT[k]).join('')}
.h{font-family:MR,Manrope,sans-serif;font-weight:800;letter-spacing:-.035em}
.n{font-family:MR,Manrope,sans-serif;font-weight:600;letter-spacing:-.03em}
.b{font-family:MR,Manrope,sans-serif;font-weight:600}
.k{font-family:PM,'IBM Plex Mono',ui-monospace,monospace;font-weight:500;letter-spacing:.06em}</style>
${body}
</svg>\n`;
const out = (n, s) => writeFileSync(`${ziel}/${n}`, s);
const rad = (d) => (d * Math.PI) / 180;

// Logo-Datei als eingebettetes <svg>, Farbe wird ersetzt
function logo(datei, x, y, h, farben = {}) {
  let s = readFileSync(datei, 'utf8');
  const vb = s.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const w = (h * vb[2]) / vb[3];
  for (const [a, b] of Object.entries(farben)) s = s.split(a).join(b);
  const inner = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>.*?<\/title>/, '');
  return `<svg x="${x}" y="${y}" width="${w.toFixed(1)}" height="${h}" viewBox="${vb.join(' ')}">${inner}</svg>`;
}

const drohne = (s, c, sw) => [45, 135, 225, 315].map((a) => { const x = Math.cos(rad(a)) * s, y = Math.sin(rad(a)) * s; return `<line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${c}" stroke-width="${sw}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s * .55).toFixed(1)}" fill="none" stroke="${c}" stroke-width="${sw}"/>`; }).join('') + `<rect x="${-s * .35}" y="${-s * .45}" width="${s * .7}" height="${s * .9}" fill="${c}"/>`;
const auto = (c, fill, sw) => `<rect x="-17" y="-36" width="34" height="72" rx="9" fill="${fill}" stroke="${c}" stroke-width="${sw}"/><rect x="-12" y="-14" width="24" height="16" rx="3" fill="none" stroke="${c}" stroke-width="${sw * .7}"/><rect x="-12" y="14" width="24" height="10" rx="3" fill="none" stroke="${c}" stroke-width="${sw * .7}"/>${[[-20, -24], [16, -24], [-20, 16], [16, 16]].map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="12" rx="1" fill="${c}"/>`).join('')}`;
const streifen = (id, x, y, w, h, a, b) => `<defs><pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="${a}"/><rect x="7" width="7" height="14" fill="${b}"/></pattern></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
const kicker = (x, y, t, c, s = 10.5) => `<rect x="${x}" y="${y - s * .74}" width="${s * 1.5}" height="${s * .32}" fill="${c}"/><text class="k" x="${x + s * 2.3}" y="${y}" font-size="${s}" fill="${c}">${t}</text>`;
const zeilen = (x, y, arr, c, size = 12.5, lh = 17) => arr.map((t, i) => `<text class="b" x="${x}" y="${y + i * lh}" font-size="${size}" fill="${c}">${t}</text>`).join('');
const chip = (x, y, t, bg, fg) => `<rect x="${x}" y="${y}" width="${t.length * 7.3 + 16}" height="22" fill="${bg}"/><text class="k" x="${x + 8}" y="${y + 15}" font-size="10.5" fill="${fg}">${t}</text>`;

export const FARBEN = {
  dcos: { grund: '#23274d', akzent: '#629ad0', hell: '#f8fafc' },          // DroneS Control: Navy, Hellblau
  cockpit: { grund: '#fff4e2', akzent: '#17181a', hell: '#17181a' },        // eigenes Werkzeug: Creme, Asphalt
  drivts: { grund: '#ff6420', akzent: '#17181a', hell: '#fff4e2' },         // Drivts: Signal-Orange, Asphalt, Creme
  rigorly: { grund: '#ffcf24', akzent: '#1e3bd1', hell: '#17181a' },        // Rigorly: Signalgelb, Kobalt
  framemesh: { grund: '#17181a', akzent: '#fff4e2', hell: '#a8a398' },      // framemesh: Asphalt, Creme
};
const W = 340, H = 250;

/* DCOS */
{
  const { grund: G, akzent: A, hell: L } = FARBEN.dcos;
  out('card-dcos.svg', svg(W, H, ['m800', 'm600', 'mono'], `<rect width="${W}" height="${H}" fill="${G}"/>
${streifen('s1', 0, 0, W, 12, G, A)}
${kicker(20, 42, 'DCOS · DRONES CONTROL', A)}
<text class="h" x="18" y="92" font-size="38" fill="${L}">800 km away.</text>
<text class="h" x="18" y="132" font-size="38" fill="${A}">Still flying.</text>
<g transform="translate(298 120) rotate(-14)">${drohne(15, A, 2)}</g>
${zeilen(20, 172, ['Ground control and fleet management', 'for drones, from the browser.'], L)}
${chip(20, 210, 'ANY DISTANCE', A, G)}`, 'DCOS'));
}

/* Cockpit */
{
  const { grund: G, akzent: A } = FARBEN.cockpit;
  const eintrag = (y, art, text, voll) => `<rect x="196" y="${y}" width="124" height="26" fill="${voll ? A : 'none'}" stroke="${A}" stroke-width="1.5"/><text class="k" x="204" y="${y + 11}" font-size="7.5" fill="${voll ? G : A}">${art}</text><text class="b" x="204" y="${y + 21}" font-size="9" fill="${voll ? G : A}">${text}</text>`;
  out('card-cockpit.svg', svg(W, H, ['m800', 'm600', 'mono'], `<rect width="${W}" height="${H}" fill="${G}"/>
<rect width="${W}" height="12" fill="${A}"/>
${kicker(20, 42, 'COCKPIT · MY OWN ERP', A)}
<text class="h" x="18" y="92" font-size="38" fill="${A}">Every</text>
<text class="h" x="18" y="132" font-size="38" fill="${A}">thread.</text>
<line x1="186" y1="56" x2="186" y2="196" stroke="${A}" stroke-width="1.5"/>
${[69, 103, 137, 171].map((y) => `<rect x="182" y="${y - 4}" width="8" height="8" fill="${A}"/>`).join('')}
${eintrag(56, 'MAIL', 'Quote sent', false)}${eintrag(90, 'CALL', '12 min, follow-up', false)}${eintrag(124, 'INVOICE', 'Paid', true)}${eintrag(158, 'TICKET', 'Closed', false)}
${zeilen(20, 172, ['Everything I work on,', 'in one timeline.'], A)}
${chip(20, 210, 'ONE TIMELINE PER CUSTOMER', A, G)}`, 'Cockpit'));
}

/* Drivts */
{
  const { grund: G, akzent: A, hell: L } = FARBEN.drivts;
  out('card-drivts.svg', svg(W, H, ['m800', 'm600', 'mono'], `<rect width="${W}" height="${H}" fill="${G}"/>
${logo(drivtsLogo, 18, 18, 26)}
<text class="h" x="18" y="92" font-size="38" fill="${A}">Sideways,</text>
<text class="h" x="18" y="132" font-size="38" fill="${L}">but right.</text>
<path d="M240 214 C 244 186, 254 168, 268 158" fill="none" stroke="${A}" stroke-width="6" stroke-opacity=".22"/>
<path d="M266 226 C 270 198, 282 180, 298 172" fill="none" stroke="${A}" stroke-width="6" stroke-opacity=".22"/>
<g transform="translate(284 118) rotate(62)">${auto(A, G, 2.4)}</g>
${zeilen(20, 172, ['AI drift trainer. Tells you after', 'every drift what went wrong.'], A)}
${Array.from({ length: 15 }, (_, i) => `<rect x="${20 + i * 12}" y="210" width="9" height="20" fill="${i < 3 ? A : 'none'}" stroke="${A}" stroke-width="1.5"/>`).join('')}
<text class="k" x="${20 + 15 * 12 + 6}" y="224" font-size="9.5" fill="${A}">15 LEVELS</text>`, 'Drivts'));
}

/* Rigorly */
{
  const { grund: G, akzent: A, hell: L } = FARBEN.rigorly;
  const fund = (y, t) => `<rect x="226" y="${y - 7}" width="7" height="7" fill="${G}"/><text class="b" x="238" y="${y}" font-size="9.5" fill="${L}">${t}</text>`;
  out('card-rigorly.svg', svg(W, H, ['m800', 'm600', 'mono'], `<rect width="${W}" height="${H}" fill="${G}"/>
${logo(rigorlyLogo, 18, 18, 24)}
<text class="h" x="18" y="92" font-size="38" fill="${L}">AI wrote it.</text>
<text class="h" x="18" y="132" font-size="38" fill="${A}">We read it.</text>
<rect x="218" y="150" width="106" height="80" fill="${L}"/>
<text class="k" x="226" y="166" font-size="8.5" fill="${G}">REPORT</text>
${fund(184, 'Open database').replace(`fill="${L}">Open`, `fill="${G}">Open`)}
${fund(200, 'Key in app code').replace(`fill="${L}">Key`, `fill="${G}">Key`)}
${fund(216, 'Login skippable').replace(`fill="${L}">Login`, `fill="${G}">Login`)}
${zeilen(20, 172, ['Security audits for apps', 'an AI built.'], L)}
${chip(20, 210, 'PLAIN-LANGUAGE REPORT', A, G)}`, 'Rigorly'));
}

/* framemesh */
{
  const { grund: G, akzent: A, hell: L } = FARBEN.framemesh;
  out('card-framemesh.svg', svg(W, H, ['m800', 'm600', 'mono'], `<rect width="${W}" height="${H}" fill="${G}"/>
${streifen('s5', 0, 0, W, 12, G, '#2a2c2f')}
${kicker(20, 42, 'FRAMEMESH · DEPLOY PLATFORM', A)}
<text class="h" x="18" y="92" font-size="38" fill="${A}">Push.</text>
<text class="h" x="18" y="132" font-size="38" fill="${L}">It's online.</text>
<rect x="222" y="150" width="104" height="64" fill="none" stroke="${L}" stroke-width="1"/>
<text class="k" x="230" y="170" font-size="9.5" fill="${L}">$ git push</text>
<text class="k" x="230" y="187" font-size="9.5" fill="${L}">  building …</text>
<text class="k" x="230" y="204" font-size="9.5" fill="${A}">■ online</text>
${zeilen(20, 172, ['My own platform for putting', 'my projects online.'], A)}
${chip(20, 210, 'PUSH TO ONLINE', A, G)}`, 'framemesh'));
}

/* Header */
{
  const AS = '#17181a', CR = '#fff4e2', HW = 1200, HH = 320;
  const reihe = ['dcos', 'cockpit', 'drivts', 'rigorly', 'framemesh'];
  const bw = 64, x0 = 820;
  const baender = reihe.map((k, i) => {
    const x = x0 + i * bw;
    return `<polygon points="${x + 90},0 ${x + 90 + bw},0 ${x + bw},${HH} ${x},${HH}" fill="${k === 'framemesh' ? '#34373b' : FARBEN[k].grund}"/>`;
  }).join('');
  out('header.svg', svg(HW, HH, ['m600', 'mono'], `<rect width="${HW}" height="${HH}" fill="${AS}"/>
${baender}
${kicker(60, 80, 'SCHLESWIG-HOLSTEIN · GERMANY', '#a8a398', 15)}
<text class="n" x="54" y="170" font-size="96" fill="${CR}">Henning Norden</text>
<text class="b" x="60" y="224" font-size="25" fill="${CR}">Founder of DroneS Control and HeNoMedia.</text>
<text class="b" x="60" y="258" font-size="25" fill="#a8a398">Fullstack developer.</text>`, 'Henning Norden. Founder of DroneS Control and HeNoMedia. Fullstack developer.'));
}
/* Trennlinie: die fünf Projektfarben, dann eine Haarlinie (wirkt auf hell und dunkel) */
{
  const reihe = ['dcos', 'cockpit', 'drivts', 'rigorly', 'framemesh'];
  const farbe = (k) => (k === 'cockpit' ? '#e8dcc4' : k === 'framemesh' ? '#59636e' : FARBEN[k].grund);
  out('divider.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="12" viewBox="0 0 1200 12">
${reihe.map((k, i) => `<rect x="${i * 24}" y="3" width="24" height="6" fill="${farbe(k)}"/>`).join('')}
<line x1="128" y1="6" x2="1200" y2="6" stroke="#8b949e" stroke-opacity=".45"/>
</svg>\n`);
}
console.log('Plakat geschrieben.');
