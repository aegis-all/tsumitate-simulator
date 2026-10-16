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
        <h1>
          <span className="brand">資産形成アカデミー</span>
          つみたてシミュレーター
        </h1>
        <p>毎月の積立がいくらになるか、3つの想定利回りで比べられます。</p>
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
