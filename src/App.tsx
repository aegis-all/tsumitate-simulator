import { useMemo } from 'react';
import { validate } from './domain/constraints';
import { simulate } from './domain/simulate';
import { useSimulatorInputs } from './state/useSimulatorInputs';
import { InputPanel } from './components/InputPanel';
import { SummaryCards } from './components/SummaryCards';
import { Warnings } from './components/Warnings';
import { YearlyTable } from './components/YearlyTable';
import { Disclaimer } from './components/Disclaimer';
import { ChartsSection } from './components/charts/ChartsSection';

export default function App() {
  const { inputs, update, setRate, reset } = useSimulatorInputs();
  const result = useMemo(() => simulate(inputs), [inputs]);
  const warnings = useMemo(() => validate(inputs), [inputs]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="visually-hidden">資産形成アカデミー つみたてシミュレーター</h1>
        <picture className="fv">
          <source media="(min-width: 768px)" srcSet="./fv-pc.webp" width={1672} height={941} />
          <img
            src="./fv-sp.webp"
            width={1122}
            height={1402}
            alt="資産形成アカデミー 未来つみたてシミュレーター。年齢・毎月の積立額・運用期間から、将来の資産の増え方をチェック。かんたん3分。"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </header>

      <main className="app-main">
        <InputPanel inputs={inputs} onUpdate={update} onSetRate={setRate} onReset={reset} />
        <div className="results">
          <SummaryCards result={result} />
          <Warnings warnings={warnings} />
          <ChartsSection result={result} />
          <YearlyTable result={result} />
        </div>
      </main>

      <Disclaimer />
    </div>
  );
}
