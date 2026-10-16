import { useState } from 'react';
import {
  CONSTRAINTS,
  RATE_KEYS,
  RATE_LABELS,
  type RateKey,
  type SimulatorInputs,
} from '../domain/constraints';
import { monthlyHint } from '../domain/format';
import { PATTERN_COLORS } from './patternColors';
import { SliderNumberField } from './SliderNumberField';

interface Props {
  inputs: SimulatorInputs;
  onUpdate: (patch: Partial<Omit<SimulatorInputs, 'rates'>>) => void;
  onSetRate: (key: RateKey, value: number) => void;
  onReset: () => void;
}

export function InputPanel({ inputs, onUpdate, onSetRate, onReset }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'fallback'>('idle');

  const copyUrl = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopyState('done');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('fallback');
    }
  };

  return (
    <aside className="input-panel card" aria-label="シミュレーション条件">
      <h2 className="section-title">条件を入力</h2>

      <div className="field-group">
        <SliderNumberField
          label="現在の年齢"
          unit="歳"
          value={inputs.age}
          constraint={CONSTRAINTS.age}
          onCommit={(v) => onUpdate({ age: v })}
        />
        <SliderNumberField
          label="積立期間"
          unit="年"
          value={inputs.years}
          constraint={CONSTRAINTS.years}
          onCommit={(v) => onUpdate({ years: v })}
          hint={`${inputs.age + inputs.years}歳まで`}
        />
        <SliderNumberField
          label="毎月の積立金額"
          unit="円"
          value={inputs.monthly}
          constraint={CONSTRAINTS.monthly}
          onCommit={(v) => onUpdate({ monthly: v })}
          hint={monthlyHint(inputs.monthly)}
          wide
        />
      </div>

      <div className="field-group">
        <div className="group-title">想定利回り(年率)</div>
        {RATE_KEYS.map((key) => (
          <SliderNumberField
            key={key}
            label={RATE_LABELS[key]}
            unit="%"
            value={inputs.rates[key]}
            constraint={CONSTRAINTS.rate}
            onCommit={(v) => onSetRate(key, v)}
            accent={PATTERN_COLORS[key]}
          />
        ))}
      </div>

      <div className="panel-actions">
        <button type="button" className="btn" onClick={onReset}>
          初期値に戻す
        </button>
        <button type="button" className="btn" onClick={copyUrl}>
          {copyState === 'done' ? 'コピーしました' : 'この条件のURLをコピー'}
        </button>
      </div>
      {copyState === 'fallback' && (
        <div>
          <p className="muted" style={{ margin: '0 0 4px', fontSize: '0.85rem' }}>
            コピーできませんでした。以下のURLを選択してコピーしてください。
          </p>
          <div className="copy-fallback">{window.location.href}</div>
        </div>
      )}
    </aside>
  );
}
