import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_INPUTS,
  sanitizeInputs,
  type RateKey,
  type SimulatorInputs,
} from '../domain/constraints';
import { buildParams, parseParams } from './urlParams';

const URL_SYNC_DEBOUNCE_MS = 300;

function readInitial(): SimulatorInputs {
  if (typeof window === 'undefined') return DEFAULT_INPUTS;
  try {
    return sanitizeInputs(parseParams(window.location.search));
  } catch {
    return DEFAULT_INPUTS;
  }
}

/**
 * 入力状態の持ち主 (design.md §7)
 * - 初回ロードで URL から復元
 * - 変更時に replaceState でクエリへ反映 (300ms デバウンス)
 */
export function useSimulatorInputs() {
  const [inputs, setInputs] = useState<SimulatorInputs>(readInitial);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      // 初回は URL をそのまま (不正値を既定値に正規化した結果で上書きしない)
      isFirst.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const qs = buildParams(inputs);
      const url = `${window.location.pathname}?${qs}${window.location.hash}`;
      try {
        window.history.replaceState(null, '', url);
      } catch {
        /* サンドボックス等で失敗しても動作に影響しない */
      }
    }, URL_SYNC_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [inputs]);

  const update = useCallback((patch: Partial<Omit<SimulatorInputs, 'rates'>>) => {
    setInputs((prev) => sanitizeInputs({ ...prev, ...patch }));
  }, []);

  const setRate = useCallback((key: RateKey, value: number) => {
    setInputs((prev) => sanitizeInputs({ ...prev, rates: { ...prev.rates, [key]: value } }));
  }, []);

  const reset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      /* noop */
    }
  }, []);

  return { inputs, update, setRate, reset };
}
