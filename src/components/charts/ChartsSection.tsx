import { Component, Suspense, lazy, type ReactNode } from 'react';
import type { SimulationResult } from '../../domain/simulate';

const ChartsPanel = lazy(() => import('./ChartsPanel'));

const FALLBACK_MESSAGE = 'グラフを表示できませんでした。下の表をご覧ください。';

class ChartErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="chart-fallback" role="status">
          {FALLBACK_MESSAGE}
        </div>
      );
    }
    return this.props.children;
  }
}

/** グラフ領域。読み込み失敗時もサマリー/テーブルを巻き込まない (design.md §6.4, §8) */
export function ChartsSection({ result }: { result: SimulationResult }) {
  return (
    <section className="card" aria-label="グラフ">
      <ChartErrorBoundary>
        <Suspense fallback={<div className="chart-fallback">グラフを読み込んでいます…</div>}>
          <ChartsPanel result={result} />
        </Suspense>
      </ChartErrorBoundary>
    </section>
  );
}
