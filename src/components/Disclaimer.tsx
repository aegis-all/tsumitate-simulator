export function Disclaimer() {
  return (
    <footer className="disclaimer">
      <ul>
        <li>
          本シミュレーションは一定の前提(毎月末積立・月複利・税金や手数料を考慮しない)に基づく概算であり、将来の運用成果を予測・保証するものではありません。
        </li>
        <li>特定の金融商品の取引を推奨・勧誘するものではありません。</li>
        <li>入力された情報は端末内でのみ計算に使用し、外部へ送信・保存しません。</li>
      </ul>
      <p style={{ margin: '8px 0 0' }}>
        参考:{' '}
        <a
          href="https://www.fsa.go.jp/policy/nisa2/tsumitate-simulator/"
          target="_blank"
          rel="noopener noreferrer"
        >
          金融庁「つみたてシミュレーター」
        </a>
      </p>
    </footer>
  );
}
