# 積立シミュレーター タスク一覧 (task.md)

- 作成日: 2026-10-16
- 元資料: requirement.md(要件) / design.md(設計)。番号はそれぞれの章・項目を参照。
- 進め方: フェーズ順に実施。各タスクの「完了条件」を満たしたらチェックを入れる。フェーズ1〜4で最小構成(MVP)が動く。フェーズ5以降は優先度順。
- 規模目安: S = 1時間以内 / M = 半日 / L = 1日

---

## フェーズ0: 準備

- [x] **T0-1** requirement.md / design.md のレビューと未決事項(要件 §9 Q-1〜Q-4)の確定 — S
  - 完了条件: Q-1〜Q-4 の「決定」欄が埋まり、変更があれば両ドキュメントに反映済み
- [x] **T0-2** リポジトリ初期化(git init、.gitignore、main ブランチ) — S
  - 完了条件: 3つの .md が初回コミットに含まれる

## フェーズ1: プロジェクト雛形

- [x] **T1-1** Vite + React + TypeScript でプロジェクト作成(設計 §2) — S
  - `npm create vite@latest . -- --template react-ts`
  - 完了条件: `npm run dev` で雛形が表示される
- [x] **T1-2** Vitest / Testing Library / ESLint / Prettier を導入し、npm scripts を揃える(設計 §10) — S
  - 完了条件: `npm run test` `npm run lint` `npm run build` が全て成功する
- [x] **T1-3** 設計 §3 のディレクトリを作成し、domain/ への react・window import を禁止する ESLint ルールを追加 — S
  - 完了条件: domain/ 内で `import React` を書くと lint が落ちる
- [x] **T1-4** tokens.css / global.css の骨格(設計 §6.5 の色変数、tabular-nums、リセット) — S

## フェーズ2: ドメイン層(UI非依存)

- [x] **T2-1** constraints.ts: CONSTRAINTS / DEFAULT_INPUTS / RATE_LABELS / clamp / sanitizeInputs / validate(設計 §4) — M
  - 完了条件: constraints.test.ts で clamp の境界(min-1, min, max, max+1, step 丸め)と validate(V-3)が通る
- [x] **T2-2** simulate.ts: futureValue / simulate(設計 §5.1, §5.2) — M
  - 完了条件: simulate.test.ts で要件 §6.4 の 7 ケースが ±1円で一致。0% で 0 除算なし。series.length === years。principalSeries 単調増加
- [x] **T2-3** format.ts: yen / manYen / manYenShort / multiple / percent(設計 §5.3) — S
  - 完了条件: format.test.ts で「12,331,010円 → 約1,233.1万円」「丸め境界(…999.5円)」が通る
- [x] **T2-4** urlParams.ts: parseParams / buildParams(設計 §7) — S
  - 完了条件: roundtrip テスト、不正値 → undefined のテストが通る

## フェーズ3: 入力UI

- [x] **T3-1** SliderNumberField(設計 §6.2): range と number の同期、blur/Enter 確定、クランプ、空欄で直前値維持、メッセージ表示、label/aria — M
  - 完了条件: コンポーネントテストで「範囲外 → クランプ+メッセージ」「空欄 blur → 直前値」が通る
- [x] **T3-2** InputPanel: 年齢・期間・月額・利回り×3(I-1〜I-6)を SliderNumberField で構成。月額の万円併記 — M
- [x] **T3-3** useSimulatorInputs: 単一 state、初回ロード時に URL から復元、変更時に replaceState(300ms デバウンス)(設計 §7) — M
  - 完了条件: 入力変更で URL が変わる。URL を開くと同じ状態になる(要件 §8-8)
- [x] **T3-4** 「初期値に戻す」「URLをコピー」ボタン(クリップボード失敗時のフォールバック含む) — S
- [x] **T3-5** Warnings: V-1〜V-3 のメッセージ表示(到達年齢 100 超) — S
  - 完了条件: 年齢85・期間20で警告が出る(要件 §8-3)

## フェーズ4: 結果表示(MVP 完成)

- [x] **T4-1** App: useMemo で simulate を導出し、入力→サマリーのデータフローをつなぐ(設計 §7) — S
- [x] **T4-2** SummaryCards(設計 §6.3): 3カード、到達年齢見出し、万円大+円小、元本・収益・倍率、系列色 — M
  - 完了条件: 初期値で 約984.9万 / 約1,233.1万 / 約1,562.8万、「50歳時点」と表示される(要件 §8-1, §8-3)
- [x] **T4-3** YearlyTable(設計 §6.6): details 折りたたみ、年|年齢|元本|A|B|C、右寄せ・万円 — M
  - 完了条件: グラフなしでも全年次の数値が読める(要件 §8-7)
- [x] **T4-4** Disclaimer(要件 §7 の3文 + 金融庁リンク)をフッターに常時表示 — S
- [x] **T4-5** レスポンシブレイアウト(設計 §6.1): 960px 以上で2カラム・sticky、未満で縦1列。360px で横スクロールなし — M
  - 完了条件: 360 / 768 / 1280px で崩れない(要件 §8-6)
- [x] **T4-6** MVP 受け入れ確認: 要件 §8 の 1〜7 を手動で通す(結果を task.md 末尾の記録欄に残す) — S

## フェーズ5: グラフ

- [x] **T5-1** Recharts 導入。React.lazy + Suspense + エラーバウンダリでグラフ領域を分離(設計 §6.4, D-5) — S
  - 完了条件: グラフ chunk の読み込みを失敗させてもサマリー/テーブルが表示され、代替メッセージが出る
- [x] **T5-2** GrowthChart(折れ線): 元本破線 + A/B/C、万円軸、ツールチップに「k年目(○歳)」と4系列 — M
- [x] **T5-3** StackedChart(積み上げ棒): パターン切替セグメント、元本+収益の積み上げ、30年超で X 軸間引き — M
- [x] **T5-4** タブ切替UI(資産の推移 / 元本と収益の内訳)とカード色・線種の統一(設計 §6.5) — S

## フェーズ6: 仕上げ(優先度順)

- [x] **T6-1** CSV ダウンロード(BOM 付き UTF-8、ファイル名規則)(設計 §6.6) — S
- [x] **T6-2** アクセシビリティ確認: キーボードのみで全操作、コントラスト 4.5:1、グラフの aria-hidden とテーブル代替(N-6) — S
- [x] **T6-3** 性能確認: 入力変更→更新 100ms 以内、初回表示 1秒以内(Lighthouse)。必要なら Recharts の bundle を確認(N-3) — S
- [x] **T6-4** ダークモード(背景・文字のみ)(設計 §6.5、優先度: 低) — S
- [x] **T6-5** README.md(起動・ビルド・デプロイ手順、計算仕様へのリンク) — S

## フェーズ7: デプロイ

- [x] **T7-1** ホスティング先の確定(Q-3) → GitHub Pages(公開リポジトリ aegis-all/tsumitate-simulator、Actions でビルド・デプロイ)。URL: https://simulator.financial-design-inc.com/ (カスタムドメイン、HTTPS強制) — S
- [x] **T7-2** main push で本番、PR でプレビューが出ることを確認 — S
- [x] **T7-3** 本番 URL で要件 §8 の 1〜8 を再確認(スマホ実機を含む) — S
- [x] **T7-4** 外部通信がないことを確認(DevTools の Network でビルド成果物以外のリクエストがない)(N-2) — S

## 任意(今回のスコープ外、着手するなら別途要件化)

- [ ] Playwright による受け入れテスト自動化(要件 §8)
- [ ] 逆算モード(毎月いくら? / 何年?)(設計 §11)
- [ ] 初期一括投資額の入力(設計 §11)

---

## 依存関係

```
T0 → T1 → T2 ─┬→ T3 → T4(MVP) → T5 → T6 → T7
              └→ (T2 は T3/T4 と並行着手可。T2-2 が終われば T4-2 の数値確認ができる)
```

- T3-3(URL 同期)は T2-4 に依存。
- T5 は T4-1 のデータフローが前提。グラフは最後に乗せる。
- T7 は T4-6(MVP 受け入れ)が通ってから。グラフ未完でも先にデプロイしてよい。

## 工数目安

| フェーズ | タスク数 | 目安 |
|---|---|---|
| 0 準備 | 2 | 0.5日 |
| 1 雛形 | 4 | 0.5日 |
| 2 ドメイン | 4 | 1日 |
| 3 入力UI | 5 | 1.5日 |
| 4 結果表示 | 6 | 1.5日 |
| 5 グラフ | 4 | 1日 |
| 6 仕上げ | 5 | 1日 |
| 7 デプロイ | 4 | 0.5日 |
| 合計 | 34 | 約7.5日 |

## 受け入れ確認の記録欄

| 日付 | 確認者 | 要件 §8 の項目 | 結果 | メモ |
|---|---|---|---|---|
| 2026-10-16 | Claude(自動) | 1,2,3,4,5,7 | OK | Vitest 61件(受け入れ基準をApp.test.tsxに実装) |
| 2026-10-16 | Claude(自動) | 6 | OK | Playwright+Chrome で 360/768/1280px を撮影、scrollWidth=viewport を確認(テーブル展開時も) |
| 2026-10-16 | Claude(自動) | 8 | OK | ?age=40&years=25&monthly=50000&r=2,4,6 を開いて再現、replaceState の同期は hook テストで確認 |
| 2026-10-16 | Claude(自動) | N-2 外部通信なし | OK | preview を開いたときのリクエスト元が localhost のみ |
| 2026-10-16 | Claude(自動) | 本番URL 1,3,6,8 | OK | GitHub Pages 公開URLを Chrome で 360/768/1280px 確認 |
| | ユーザー | スマホ実機 | 未 | 公開URLを実機で開いて確認 |
