# 積立シミュレーター 設計書 (design.md)

- 作成日: 2026-10-16
- 前提: requirement.md(要件定義書)の内容を満たす設計。要件番号(I-1, O-1, V-1, N-1 …)はそちらを参照。

---

## 1. 設計方針

1. **計算ロジックとUIを完全分離する。** 計算は純粋関数のモジュールにし、ブラウザAPIに依存させない。要件 §6.4 の期待値をそのまま単体テストにする。
2. **サーバーなしの静的サイト。** ビルド成果物は HTML/CSS/JS のみ(N-1, N-2)。
3. **状態は「入力値」だけ。** 結果は入力値から毎回導出し、キャッシュや保存状態を持たない。URLクエリも入力値の別表現として扱う。
4. **小さく始める。** 画面は1ページ。ルーティングなし。状態管理ライブラリなし。

## 2. 技術選定

| 領域 | 採用 | 理由 / 代替案 |
|---|---|---|
| 言語 | TypeScript | 計算仕様の型付け(円・%・年の混在ミス防止)。既存プロジェクト(CardPriceCheck系)と揃う |
| UI | React 18 + Vite | 1ページ・静的出力で十分。Next.js は過剰(SSR不要)。素のHTML/JSでも作れるが、3パターン×年次のテーブル/グラフ再描画をReactに任せたい |
| グラフ | Recharts | React向けで宣言的。折れ線・積み上げ棒・ツールチップ・レスポンシブコンテナが標準で揃う。代替: Chart.js(非React的)、自前SVG(軽いが工数増) |
| スタイル | CSS Modules(素のCSS) | 依存を増やさない。Tailwindは任意 |
| テスト | Vitest(+ @testing-library/react を一部) | 計算モジュールの単体テストが主。E2Eは Playwright を任意で追加 |
| Lint/Format | ESLint + Prettier | Vite テンプレ既定 |
| ホスティング | Vercel(静的) | 既存プロジェクトと同じ運用。GitHub Pages でも可(Q-3) |

Node 20 以上。パッケージマネージャは npm。

## 3. ディレクトリ構成

```
tsumitate-simulator/
├─ requirement.md
├─ design.md
├─ task.md
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ public/
│   └─ favicon.svg
└─ src/
    ├─ main.tsx                 # エントリ
    ├─ App.tsx                  # ページ全体のレイアウト・状態の持ち主
    ├─ domain/                  # ★ UI非依存。ブラウザAPI禁止
    │   ├─ simulate.ts          # 複利計算(§5)
    │   ├─ simulate.test.ts     # 要件§6.4の期待値テスト
    │   ├─ constraints.ts       # 入力範囲・初期値・クランプ(§4)
    │   ├─ constraints.test.ts
    │   ├─ format.ts            # 円/万円/倍率の表示整形(§5.3)
    │   └─ format.test.ts
    ├─ state/
    │   ├─ useSimulatorInputs.ts  # 入力状態 + クランプ + URL同期(§7)
    │   ├─ urlParams.ts           # クエリ ⇄ 入力値 の変換(純粋関数)
    │   └─ urlParams.test.ts
    ├─ components/
    │   ├─ InputPanel.tsx         # 年齢・期間・月額・利回り×3 の入力群
    │   ├─ SliderNumberField.tsx  # スライダー+数値入力の同期部品
    │   ├─ SummaryCards.tsx       # 3パターン横並びサマリー(O-1〜O-5)
    │   ├─ GrowthChart.tsx        # 折れ線(3パターン+元本)
    │   ├─ StackedChart.tsx       # 積み上げ棒(1パターン、タブ切替)
    │   ├─ YearlyTable.tsx        # 年次推移テーブル(折りたたみ・CSV)
    │   ├─ Warnings.tsx           # V-1〜V-3 のメッセージ
    │   └─ Disclaimer.tsx         # 免責(要件§7)
    └─ styles/
        ├─ global.css
        └─ tokens.css             # 色・余白・フォントの変数
```

`domain/` は import 先に react や window を含めないことを ESLint ルール(no-restricted-imports)で担保する。

## 4. 入力定義(constraints.ts)

```ts
export type RateKey = 'a' | 'b' | 'c';

export interface SimulatorInputs {
  age: number;            // 歳 (整数)
  years: number;          // 積立期間 年 (整数)
  monthly: number;        // 毎月の積立金額 円 (整数)
  rates: Record<RateKey, number>; // 年率 % (小数1桁) 例: { a: 3, b: 5, c: 7 }
}

export interface NumericConstraint { min: number; max: number; step: number; default: number }

export const CONSTRAINTS = {
  age:     { min: 0,    max: 100,       step: 1,    default: 30 },
  years:   { min: 1,    max: 50,        step: 1,    default: 20 },
  monthly: { min: 1000, max: 1_000_000, step: 1000, default: 30_000 },
  rate:    { min: 0,    max: 20,        step: 0.1,  default: { a: 3, b: 5, c: 7 } },
} as const;

export const RATE_LABELS: Record<RateKey, string> = { a: '堅め', b: '標準', c: '強め' };
export const MAX_REACH_AGE = 100;   // V-3 の閾値

export const DEFAULT_INPUTS: SimulatorInputs;
export function clamp(value: number, c: NumericConstraint): number;           // 範囲内に収め step に丸める
export function sanitizeInputs(partial: Partial<SimulatorInputs>): SimulatorInputs; // 欠損は既定値、範囲外はクランプ
export function validate(inputs: SimulatorInputs): Warning[];                // V-3 等。空配列なら警告なし
```

Warning は `{ code: 'REACH_AGE_OVER'; message: string }` のユニオン。メッセージ文言はここに集約する。

## 5. 計算モジュール(simulate.ts)

### 5.1 インターフェース

```ts
export interface YearPoint {
  year: number;       // k 年目 (1..years)
  age: number;        // 現在の年齢 + k
  principal: number;  // 元本累計 (円, 未丸め)
  balance: number;    // 運用資産額 (円, 未丸め)
  gain: number;       // balance - principal
}

export interface PatternResult {
  key: RateKey;
  ratePercent: number;
  final: YearPoint;          // 最終年 (= series[series.length-1])
  gainMultiple: number;      // balance / principal  (元本の何倍か)
  series: YearPoint[];       // 1..years
}

export interface SimulationResult {
  inputs: SimulatorInputs;
  reachAge: number;          // age + years
  principalSeries: number[]; // 元本累計 (パターン共通) index 0 = 1年目
  patterns: PatternResult[]; // a, b, c の順
}

/** 月末積立・月複利。rateAnnualPercent は % (例: 5)。 */
export function futureValue(monthly: number, rateAnnualPercent: number, months: number): number;
export function simulate(inputs: SimulatorInputs): SimulationResult;
```

### 5.2 実装メモ

- futureValue は要件 §6.2 をそのまま実装する。月利が 0 のケースを先に分岐して 0 除算を避ける(V-4)。
- 浮動小数誤差: (1+i)^n は Math.pow で十分(n ≤ 600)。丸めは format.ts 側のみで行う(要件 §6.3)。
- simulate は年次ループ(最大50回 × 3パターン)なので計算コストは無視できる。メモ化不要。入力変更ごとに毎回呼ぶ。
- パターン間で principalSeries は共通なので1回だけ計算し、各 YearPoint.principal にも同じ値を入れる(テーブル描画の都合で両方持たせる)。

### 5.3 表示整形(format.ts)

```ts
export function yen(n: number): string;        // 12331010 → "12,331,010円"
export function manYen(n: number): string;     // 12331010 → "約1,233.1万円"   (1,000円未満四捨五入・小数1桁)
export function manYenShort(n: number): string;// グラフ軸用: 12331010 → "1,233万"
export function multiple(x: number): string;   // 1.7126 → "1.71倍"
export function percent(x: number): string;    // 5 → "5.0%"
```

Intl.NumberFormat('ja-JP') を使う。万円の丸めは `Math.round(n / 1000) / 10` で行い、toFixed(1) の二重丸めを避ける。

## 6. 画面設計

### 6.1 レイアウト

PC(≥ 960px): 左に入力パネル(固定幅 360px・sticky)、右に結果。
スマホ(< 960px): 入力 → サマリー → グラフ → テーブル → 免責 の縦1列。

```
+--------------------------------------------------------------+
| つみたてシミュレーター                                       |
| 毎月の積立がいくらになるか、3つの利回りで比べられます        |
+--------------------+-----------------------------------------+
| 現在の年齢  [30]歳 |  50歳時点の運用資産額                   |
| -------o------     | +----------++----------++----------+    |
| 積立期間    [20]年 | |堅め 3.0% ||標準 5.0% ||強め 7.0% |    |
| -------o------     | |約984.9万 ||約1,233.1万||約1,562.8万|   |
| 毎月の積立 [30,000]| |元本 720万||元本 720万||元本 720万|    |
|   円 (3万円)       | |収益 264.9||収益 513.1||収益 842.8|    |
| -------o------     | | 1.37倍   || 1.71倍   || 2.17倍   |    |
|                    | +----------++----------++----------+    |
| 想定利回り(年率)   |  ! 到達年齢が100歳を超えます (条件時)   |
|  堅め  [3.0]%  --o |                                         |
|  標準  [5.0]%  --o |  [資産の推移]  [元本と収益の内訳]  <-タブ|
|  強め  [7.0]%  --o |  +------------------------------+       |
|                    |  |   折れ線 x3 + 元本(破線)      |       |
| [初期値に戻す]     |  |                               |       |
| [URLをコピー]      |  +------------------------------+       |
|                    |  > 年ごとの推移を見る   [CSVダウンロード]|
+--------------------+-----------------------------------------+
| 免責: 本シミュレーションは…                                  |
+--------------------------------------------------------------+
```

### 6.2 入力部品(SliderNumberField)

- `<input type="range">` と `<input type="number">` を横並び。どちらの onChange でも同じ onCommit(value) を呼ぶ。
- 数値入力は **blur または Enter で確定**し、確定時に clamp する(入力途中で勝手に値が飛ばないようにする。V-1)。range は即時確定。
- 空欄・NaN は確定時に直前値へ戻す(V-2)。
- クランプが発生した場合は部品直下に1行メッセージを表示し、次の有効入力で消す。
- `<label for>` と aria-describedby(メッセージ)を付ける(N-6)。
- 毎月の積立金額は「30,000円(3万円)」のように万円換算をラベル横に添える。

### 6.3 サマリーカード(SummaryCards)

- 3カード横並び(スマホは縦積み)。各カードの色は §6.5 の系列色と一致させ、グラフとの対応を取る。
- 最上段に「{reachAge}歳時点の運用資産額」の見出しを1回だけ出す(O-4)。
- 金額は万円表記を大きく、下に円表記を小さく(O-1)。
- 元本はカードごとに出す(比較の読みやすさ優先。要件 §4.2.1 の「共通欄1回」は不採用)。

### 6.4 グラフ

**GrowthChart(折れ線・既定タブ)**
- X: year(目盛ラベルは「10年」、ツールチップで「10年目(40歳)」)。
- Y: 万円。manYenShort で軸ラベル。
- 系列: 元本(グレー破線)、A/B/C(実線)。
- ツールチップ: 4系列の値を万円で表示。
- ResponsiveContainer で幅100%、高さ 320px(スマホ 260px)。

**StackedChart(積み上げ棒・第2タブ)**
- パターン A/B/C をセグメントで選択。選んだパターンの series を描く。
- 棒 = 元本(下・グレー) + 運用収益(上・パターン色)。金融庁版と同じ見え方。
- 期間が 30 年を超える場合は X 軸ラベルを 5 年刻みに間引く。

グラフは装飾ではなく、テーブルで同じ数値が読めること(N-6)。グラフ描画ライブラリの読み込みに失敗しても、サマリーとテーブルは表示される構成にする(React.lazy + Suspense + エラーバウンダリ)。

### 6.5 色・タイポグラフィ(tokens.css)

| 用途 | 変数 | 値(ライト) |
|---|---|---|
| 元本 | --c-principal | #8a8f98 |
| パターンA | --c-rate-a | #2f6fed |
| パターンB | --c-rate-b | #1f9d6a |
| パターンC | --c-rate-c | #d9731a |
| 警告 | --c-warn | #b45309 |
| 背景 / 文字 | --bg / --fg | #ffffff / #1b1f24 |

- 3色は色相で分かれ、かつ明度も段差を付けて色弱でも区別できるようにする。線種(A 実線 / B 実線+丸マーカー / C 実線+四角マーカー)でも区別する。
- 数字は font-variant-numeric: tabular-nums。
- ダークモードは prefers-color-scheme で背景・文字のみ反転(優先度: 低)。

### 6.6 年次テーブル(YearlyTable)

- `<details>` で折りたたみ(既定閉)。
- 列: 年 | 年齢 | 元本累計 | A | B | C。すべて万円(小数1桁)。右寄せ。
- CSV: ヘッダ行 + 各年の円単位(未丸め→四捨五入)の値。ファイル名 tsumitate_{age}_{years}_{monthly}.csv。BOM 付き UTF-8(Excel で開けるように)。

### 6.7 免責(Disclaimer)

要件 §7 の3文を `<footer>` に常時表示。金融庁サイトへの参照リンクを添える。

## 7. 状態管理と URL 同期

```
URL (?age=30&years=20&monthly=30000&r=3,5,7)
   |  初回ロード: parseParams -> sanitizeInputs
   v
useSimulatorInputs()  -- inputs: SimulatorInputs --> simulate(inputs) --> 各コンポーネント
   ^      |
   |      +-- 変更時: history.replaceState(buildParams(inputs))  (300ms デバウンス)
 ユーザー入力
```

- 単一の useState<SimulatorInputs> を App が持つ。useMemo(() => simulate(inputs), [inputs]) で結果を導出。
- URL への反映は replaceState(履歴を汚さない)。pushState は使わない。
- urlParams.ts は純粋関数(parseParams(search): Partial<SimulatorInputs> / buildParams(inputs): string)で、不正値は undefined を返して sanitizeInputs に既定値を任せる。
- 「URLをコピー」は navigator.clipboard.writeText(location.href)。失敗時は URL をテキスト表示してフォールバック。
- 「初期値に戻す」は DEFAULT_INPUTS に置き換え、URL のクエリを消す。

## 8. エラー処理

| 事象 | 扱い |
|---|---|
| クエリに不正値 | 既定値で起動(エラー表示しない) |
| グラフライブラリの読み込み失敗 | グラフ領域に「グラフを表示できませんでした。下の表をご覧ください」を表示 |
| クリップボード書き込み失敗 | URL を選択可能なテキストで表示 |
| 計算結果が Infinity / NaN | 範囲上限(20%・50年・100万円)では発生しない。念のため Number.isFinite で検知し「—」表示 |

## 9. テスト戦略

| 層 | 手段 | 内容 |
|---|---|---|
| domain | Vitest | 要件 §6.4 の 7 ケース(±1円)。0% 分岐。series.length === years。principalSeries が単調増加。clamp の境界(min-1, min, max, max+1, step 丸め)。format の丸め境界(…999.5円 等) |
| state | Vitest | parseParams / buildParams の往復(roundtrip)。不正値 → undefined |
| component | Vitest + Testing Library | SliderNumberField: 範囲外入力 → クランプ + メッセージ。空欄 blur → 直前値維持 |
| 受け入れ | 手動(スマホ実機 + PC) or Playwright | 要件 §8 の 1〜8 |
| 視覚 | 手動 | 360px / 768px / 1280px でレイアウト確認。カラーコントラスト確認 |

## 10. ビルド・デプロイ

- npm run dev / npm run build / npm run test / npm run lint。
- vite build の出力 dist/ をそのまま配信。ベースパスはルート(GitHub Pages のサブパス配信にする場合は vite.config.ts の base を変える)。
- Vercel: Framework Preset = Vite、ビルドコマンド npm run build、出力 dist。main ブランチ push で本番、PR でプレビュー。
- 環境変数なし。外部通信なし(フォントもセルフホストまたはシステムフォント)。

## 11. 将来拡張の受け口(今回は作らない)

- 逆算モード(毎月いくら? / 何年?): domain/ に requiredMonthly() / requiredYears() を追加し、App に「モード」状態を足せば済むように、入力パネルと結果表示はモードを意識しない形で分けておく。
- 初期一括投資額: futureValue に initial 引数を足すだけで対応できる。
- パターン数の可変化: rates を Record<RateKey, …> から配列にすればよいが、今回は3固定で型を単純にする。

## 12. 設計上の決定事項

| # | 決定 | 理由 |
|---|---|---|
| D-1 | 「計算する」ボタンを置かず即時再計算 | 計算が軽く、試行錯誤の体験が良い(要件 §4.1) |
| D-2 | 数値入力はblur/Enterで確定 | 入力途中のクランプで値が飛ぶのを防ぐ |
| D-3 | 元本カードを3枚それぞれに表示 | 比較時に視線移動が少ない |
| D-4 | 月末積立・月複利 | 金融庁版と一致(Q-1) |
| D-5 | Recharts を遅延読み込み | グラフ失敗時もサマリー/テーブルを守る(N-6) |
