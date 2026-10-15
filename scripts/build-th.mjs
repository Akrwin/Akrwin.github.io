// Builds th/index.html (the Thai landing page at /th/) from index.html.
//
// The site renders English by default and switches to Thai on the client, so
// search engines only see the English page. /th/ is the same page with
// <html lang="th">, Thai title/description/Open Graph tags and a Thai canonical,
// so Google can index the Thai version too.
//
// Run from the repo root after any change to index.html:
//   node scripts/build-th.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SITE = 'https://dataflicker.netlify.app/';
const TH_URL = SITE + 'th/';

const TH_TITLE = 'รับทำ Dashboard Tableau, Power BI | ฟรีแลนซ์ Data Analyst';
const TH_DESC = 'ฟรีแลนซ์ Data Analyst รับทำ Dashboard ด้วย Tableau, Power BI, Looker Studio รับทำ Excel / Google Sheets ดึงข้อมูลเว็บ ระบบ Automation และให้คำปรึกษาด้าน BI';
const TH_LD_DESC = 'ฟรีแลนซ์ Data Analyst ในประเทศไทย รับทำ Dashboard ด้วย Tableau, Looker Studio และ Power BI วิเคราะห์ข้อมูล รับทำ Excel และ Google Sheets ดึงข้อมูลเว็บ (Web Scraping) ทำความสะอาดข้อมูล ระบบ Automation และให้คำปรึกษาด้าน BI';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

let html = readFileSync('index.html', 'utf8');

// Replace exactly `count` matches, so the script fails loudly if index.html
// changes in a way this script no longer understands.
function swap(pattern, replacement, count = 1) {
  const re = typeof pattern === 'string'
    ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    : new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const found = (html.match(re) || []).length;
  if (found !== count) {
    throw new Error(`Expected ${count} match(es) for ${re}, found ${found}. Update scripts/build-th.mjs.`);
  }
  html = html.replace(re, replacement);
}

// Language: render Thai by default.
swap(/<!DOCTYPE html>(\r?\n)<html lang="en">/,
  '<!DOCTYPE html>$1<!-- Generated from index.html by scripts/build-th.mjs. Do not edit by hand; edit index.html and re-run the script. -->$1<html lang="th">');

// On /th/ the URL decides the language: drop the line that restores the saved
// EN/TH choice from localStorage (the theme is still restored). Pressing EN on
// this page still switches to English in place.
swap("var l=localStorage.getItem('dataon-lang');if(l)document.documentElement.lang=l;", '');

// Title, description, canonical, Open Graph and Twitter.
swap(/<title>[^<]*<\/title>/, `<title>${esc(TH_TITLE)}</title>`);
swap(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(TH_DESC)}">`);
swap(`<link rel="canonical" href="${SITE}">`, `<link rel="canonical" href="${TH_URL}">`);
swap(`<meta property="og:url" content="${SITE}">`, `<meta property="og:url" content="${TH_URL}">`);
swap(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(TH_TITLE)}">`);
swap(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(TH_DESC)}">`);
swap(/<meta property="og:locale" content="en_US">(\r?\n)<meta property="og:locale:alternate" content="th_TH">/,
  '<meta property="og:locale" content="th_TH">$1<meta property="og:locale:alternate" content="en_US">');
swap(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(TH_TITLE)}">`);
swap(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(TH_DESC)}">`);

// Structured data: Thai description for the service, Thai job title.
swap(/("@type": "ProfessionalService",[\s\S]*?"description": )"[^"]*"/, `$1${JSON.stringify(TH_LD_DESC)}`);
swap('"jobTitle": "Freelance Data Analyst"', '"jobTitle": "ฟรีแลนซ์ Data Analyst"');

// Paths: index.html uses paths relative to the site root, which break one
// folder down. Make them root-absolute so /th and /th/ both work.
swap('href="favicon.ico"', 'href="/favicon.ico"');
swap('src="./support.js"', 'src="/support.js"');
swap('from="./logo-intro.js"', 'from="/logo-intro.js"', 2);
swap(/(["'])(assets|vendor)\//, '$1/$2/', (html.match(/(["'])(assets|vendor)\//g) || []).length || 1);

// Safety net: nothing relative to the old folder may be left.
const leftover = html.match(/(["'(])(\.\/)?(assets|vendor)\/|["']\.\/[\w-]+\.js/g);
if (leftover) throw new Error('Relative paths left in th/index.html: ' + leftover.join(', '));

mkdirSync('th', { recursive: true });
writeFileSync('th/index.html', html);
console.log('Wrote th/index.html');
