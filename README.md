# つみたてシミュレーター

毎月の積立額・積立期間・年齢と、3パターンの想定利回りを入力すると、将来の運用資産額を比較できる静的Webアプリです。
金融庁「[つみたてシミュレーター](https://www.fsa.go.jp/policy/nisa2/tsumitate-simulator/)」を参考に、年齢入力と3パターン同時比較を追加しています。

- 要件: [requirement.md](./requirement.md)
- 設計: [design.md](./design.md)
- タスク: [task.md](./task.md)

## 技術

Vite + React 18 + TypeScript / Recharts 3 / Vitest。サーバー処理・外部通信・Cookie なし。

## 開発

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # 単体・コンポーネントテスト
npm run lint
npm run build      # dist/ に静的ファイルを出力
npm run preview    # dist/ を http://localhost:4173 で確認
```

Node 20 以上。

### Windows のアプリ制御で rollup のネイティブ版がブロックされる場合

package.json の `overrides` で rollup を `@rollup/wasm-node` に差し替えてあります(ビルドは WASM 版で動きます)。

## 計算仕様

毎月末に一定額を積み立て、年率÷12 の月利で月複利運用した場合の将来価値です。
税金・手数料は考慮しません。詳細と検証値は requirement.md §6 を参照。

```
i = 年率 / 12
FV = P × ((1 + i)^n − 1) / i     (i = 0 のときは P × n)
```

例: 毎月3万円・年率5%・20年 → 12,331,010円(約1,233.1万円)。金融庁版の表示値と一致します。

## URL で条件を共有

`?age=30&years=20&monthly=30000&r=3,5,7` の形式で入力値が URL に反映されます。
「この条件のURLをコピー」ボタンでコピーできます。

## デプロイ

静的ファイルのみなので、`dist/` をそのまま配信できます。

- Vercel: Framework Preset = Vite、Build Command `npm run build`、Output Directory `dist`。環境変数なし。
- GitHub Pages など サブパス配信の場合は `vite.config.ts` の `base` を変更してください。
