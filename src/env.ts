/**
 * ビルド時フラグ。
 * IS_ARTIFACT: claude.ai の公開ページ向けビルド (vite.artifact.config.ts)。
 *   その環境ではファイルダウンロードと URL クエリが使えないため、
 *   CSV はクリップボードコピーにし、URL 共有は非表示にする。
 */
export const IS_ARTIFACT = import.meta.env.VITE_ARTIFACT === '1';
