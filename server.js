// WRec tanıtım sayfası: statik dosyalar + /indir (kurulum dosyası indirme).
// Kurulum dosyası git'e konmaz (GitHub 100 MB sınırı). /indir sırasıyla:
//   1) downloads/ klasöründe bir .exe (ya da .zip) varsa onu sunar
//   2) yoksa DOWNLOAD_URL ortam değişkenine, o da yoksa GitHub'daki son sürüme yönlendirir
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const DOWNLOADS = path.join(__dirname, 'downloads');
// Her sürümde aynı adla yüklenen dosya; "latest" her zaman en yeni sürümü verir.
const DOWNLOAD_URL = process.env.DOWNLOAD_URL
  || 'https://github.com/cneganes/wrec-site/releases/latest/download/WRec-Kurulum.exe';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
};

function latestFile() {
  try {
    return fs.readdirSync(DOWNLOADS).filter((f) => /\.(exe|zip)$/i.test(f))
      .map((f) => ({ f, t: fs.statSync(path.join(DOWNLOADS, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t)[0]?.f;
  } catch { return null; }
}

function sendDownload(res) {
  const name = latestFile();
  if (!name) {
    res.writeHead(302, { Location: DOWNLOAD_URL });
    return res.end();
  }
  const file = path.join(DOWNLOADS, name);
  res.writeHead(200, {
    'Content-Type': name.toLowerCase().endsWith('.exe') ? 'application/vnd.microsoft.portable-executable' : 'application/zip',
    'Content-Length': fs.statSync(file).size,
    'Content-Disposition': `attachment; filename="${name}"`,
  });
  fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url === '/indir') return sendDownload(res);

  const file = path.normalize(path.join(PUBLIC, url === '/' ? 'index.html' : url));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': file.endsWith('.html') ? 'no-cache' : 'public, max-age=86400',
    });
    res.end(data);
  });
}).listen(PORT, () => console.log(`WRec sitesi: http://localhost:${PORT}`));
