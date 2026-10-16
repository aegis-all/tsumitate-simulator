import { useEffect, useId, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { clamp, rangeMessage, type NumericConstraint } from '../domain/constraints';

export interface SliderNumberFieldProps {
  label: string;
  unit: string;
  value: number;
  constraint: NumericConstraint;
  onCommit: (value: number) => void;
  /** ラベル右に添える補足 (例: 「3万円」) */
  hint?: string;
  /** 系列色 (利回りフィールド用) */
  accent?: string;
  /** 数値入力欄を広くする (金額用) */
  wide?: boolean;
}

/**
 * スライダー + 数値入力の同期部品 (design.md §6.2)
 * - range は即時確定
 * - number は blur / Enter で確定し、範囲外はクランプしてメッセージ表示 (V-1)
 * - 空欄・NaN は直前の有効値に戻す (V-2)
 */
export function SliderNumberField({
  label,
  unit,
  value,
  constraint,
  onCommit,
  hint,
  accent,
  wide,
}: SliderNumberFieldProps) {
  const id = useId();
  const inputId = `${id}-number`;
  const rangeId = `${id}-range`;
  const msgId = `${id}-msg`;
  const [text, setText] = useState(String(value));
  const [message, setMessage] = useState<string | null>(null);

  // 外部から value が変わったら表示を同期する
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commitText = () => {
    const trimmed = text.trim().replace(/,/g, '');
    const parsed = trimmed === '' ? NaN : Number(trimmed);
    if (!Number.isFinite(parsed)) {
      // V-2: 直前値を保持
      setText(String(value));
      setMessage(null);
      return;
    }
    const clamped = clamp(parsed, constraint);
    const outOfRange = parsed < constraint.min || parsed > constraint.max;
    setMessage(outOfRange ? rangeMessage(constraint, unit) : null);
    setText(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitText();
    }
  };

  const onRange = (v: string) => {
    const n = clamp(Number(v), constraint);
    setMessage(null);
    setText(String(n));
    if (n !== value) onCommit(n);
  };

  const pct = ((value - constraint.min) / (constraint.max - constraint.min)) * 100;
  const style = {
    ...(accent ? { '--accent': accent } : {}),
    '--pct': `${Math.min(100, Math.max(0, pct))}%`,
  } as CSSProperties;

  return (
    <div className="snf" style={style}>
      <div className="snf-head">
        <label className="snf-label" htmlFor={inputId}>
          {accent && <span className="snf-swatch" style={{ background: accent }} aria-hidden />}
          {label}
        </label>
        {hint && <span className="snf-hint">{hint}</span>}
      </div>
      <div className="snf-controls">
        <input
          id={rangeId}
          className="snf-range"
          type="range"
          min={constraint.min}
          max={constraint.max}
          step={constraint.step}
          value={value}
          onChange={(e) => onRange(e.target.value)}
          aria-label={`${label}(スライダー)`}
          aria-valuetext={`${value}${unit}`}
        />
        <span className="snf-number-wrap">
          <input
            id={inputId}
            className={`snf-number${wide ? ' is-wide' : ''}`}
            type="number"
            inputMode="decimal"
            min={constraint.min}
            max={constraint.max}
            step={constraint.step}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commitText}
            onKeyDown={onKeyDown}
            aria-describedby={message ? msgId : undefined}
            aria-invalid={message ? true : undefined}
          />
          <span className="snf-unit">{unit}</span>
        </span>
      </div>
      {message && (
        <p id={msgId} className="snf-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
