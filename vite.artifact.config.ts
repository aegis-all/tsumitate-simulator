import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * claude.ai 公開ページ用: JS/CSS をすべて 1 つの HTML に埋め込む。
 * 出力は dist-artifact/index.html → scripts/make-artifact-fragment.mjs で
 * スケルトンに包まれる前提のフラグメント (artifact/index.html) に変換する。
 */
export default defineConfig({
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  base: './',
  define: {
    'import.meta.env.VITE_ARTIFACT': JSON.stringify('1'),
  },
  build: {
    outDir: 'dist-artifact',
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
  },
});
