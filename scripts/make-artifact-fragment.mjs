/**
 * dist-artifact/index.html (完全な HTML) から、claude.ai の公開ページ用フラグメントを作る。
 * 公開側が <!doctype html><head>…</head><body> を付けるため、こちらは
 * <title> / <meta> / <style> / 本文 / <script> だけを書き出す。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = readFileSync('dist-artifact/index.html', 'utf8');

const title = src.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? 'つみたてシミュレーター';
const description = src.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? '';
const styles = [...src.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0]);
const scripts = [...src.matchAll(/<script[^>]*>[\s\S]*?<\/script>/g)]
  .map((m) => m[0])
  // 外部参照の script が残っていたら失敗にする (単一ファイル化できていない)
  .filter((s) => {
    if (/\ssrc=/.test(s)) throw new Error('external script remains: ' + s.slice(0, 120));
    return true;
  })
  // 空の script (singlefile が残す module loader の殻など) は捨てる
  .filter((s) => s.replace(/<script[^>]*>|<\/script>/g, '').trim().length > 0)
  // crossorigin はインラインでは無意味なので外す。type="module" は維持 (defer 相当で #root 生成後に実行)
  .map((s) => s.replace(/\s+crossorigin(="[^"]*")?/, ''));
const noscript = src.match(/<noscript>[\s\S]*?<\/noscript>/)?.[0] ?? '';

if (styles.length === 0) throw new Error('no inline <style> found');
if (scripts.length === 0) throw new Error('no inline <script> found');

const out = [
  `<title>${title}</title>`,
  `<meta name="claude:viewport-fit-sides" content="cover">`,
  description ? `<meta name="description" content="${description}">` : '',
  ...styles,
  `<div id="root"></div>`,
  noscript,
  ...scripts,
]
  .filter(Boolean)
  .join('\n');

mkdirSync('artifact', { recursive: true });
writeFileSync('artifact/index.html', out, 'utf8');
console.log(`artifact/index.html: ${(Buffer.byteLength(out) / 1024).toFixed(0)} KB, title="${title}"`);
