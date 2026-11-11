// Folds the STANDALONE build (dist-standalone) into ONE self-contained HTML
// file: script, styles, fonts, photos, icons and sample videos all inlined,
// so it opens straight from disk with no server or network.
// Usage: npm run build:standalone
// With MOBILE=1 (npm run build:mobile) it also adds what makes the file feel
// like an installed app when opened in a phone's browser: home-screen tags,
// an inline web manifest, full-screen safe areas and native touch behaviour.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const dist = process.env.STANDALONE_DIST ?? 'dist-standalone';
const MOBILE = process.env.MOBILE === '1';
const out = process.argv[2] ?? 'kisani-urjaa-app.html';
const MIME = { '.png': 'image/png', '.mp4': 'video/mp4', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const dataUri = (file) => `data:${MIME[extname(file)] ?? 'application/octet-stream'};base64,${readFileSync(file).toString('base64')}`;

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

let html = readFileSync(join(dist, 'index.html'), 'utf8');

// Stylesheets.
html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g, (_, f) => `<style>\n${readFileSync(join(dist, f), 'utf8')}\n</style>`);

// Sample videos are referenced by path at runtime; map them to data URIs.
const media = Object.fromEntries(walk(join(dist, 'media')).map((f) => [relative(dist, f).split('\\').join('/'), dataUri(f)]));
const shim = `<script>
(function () {
  var M = ${JSON.stringify(media)};
  function map(v) { var k = String(v).replace(/^\\.\\//, ''); return M[k] || v; }
  var setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) { return setAttr.call(this, n, n === 'src' ? map(v) : v); };
  var d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
  Object.defineProperty(HTMLMediaElement.prototype, 'src', { get: d.get, set: function (v) { d.set.call(this, map(v)); }, configurable: true });
})();
</script>`;

// The app bundle, inline. Escape any closing script tag inside it.
html = html.replace(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/, (_, f) => {
  const js = readFileSync(join(dist, f), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `${shim}\n<script type="module">\n${js}\n</script>`;
});

// Icons; the web manifest is not needed offline.
html = html.replace(/(href)="\.\/(favicon\.png|apple-touch-icon\.png)"/g, (_, a, f) => `${a}="${dataUri(join(dist, f))}"`);
html = html.replace(/\s*<link rel="manifest"[^>]*>/, '');

if (MOBILE) {
  // Inline web manifest so Android Chrome can offer "Install app".
  const manifest = JSON.parse(readFileSync(join(dist, 'manifest.webmanifest'), 'utf8'));
  manifest.start_url = '.';
  manifest.icons = manifest.icons.map((i) => ({ ...i, src: dataUri(join(dist, i.src)) }));
  const manifestUri = `data:application/manifest+json;base64,${Buffer.from(JSON.stringify(manifest)).toString('base64')}`;
  const head = `
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Kisani Urjaa" />
    <meta name="application-name" content="Kisani Urjaa" />
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
    <link rel="manifest" href="${manifestUri}" />
    <style>
      /* Phone preview: behave like an installed app, not a web page. */
      html, body { height: 100%; overscroll-behavior: none; background: #fbf9f3; }
      @supports (height: 100dvh) { html, body, #root { height: 100dvh; } }
      body {
        position: fixed; inset: 0; overflow: hidden;
        touch-action: manipulation;           /* no double-tap zoom delay; pinch zoom still works */
        -webkit-touch-callout: none;          /* no long-press link and image menus */
        -webkit-user-select: none; user-select: none;
      }
      input, textarea, select, [contenteditable] { -webkit-user-select: text; user-select: text; -webkit-touch-callout: default; }
      img, svg { -webkit-user-drag: none; }
    </style>`;
  // Keyboard resizes the app rather than covering inputs (Android Chrome).
  html = html.replace(/<meta name="viewport" content="([^"]*)"/, (_, c) => `<meta name="viewport" content="${c}, interactive-widget=resizes-content"`);
  html = html.replace('</title>', `</title>${head}`);
}

if (/(src|href)="\.\//.test(html)) console.warn('warning: a relative reference was left in the page');
writeFileSync(out, html);
console.log(`${out}: ${(Buffer.byteLength(html) / 1048576).toFixed(1)} MB`);
