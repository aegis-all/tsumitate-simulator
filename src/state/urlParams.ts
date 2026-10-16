/**
 * クエリ文字列 ⇄ 入力値 (design.md §7)
 * 形式: ?age=30&years=20&monthly=30000&r=3,5,7
 * 純粋関数。不正値は undefined を返し、sanitizeInputs に既定値を任せる。
 */
import type { RateKey, SimulatorInputs } from '../domain/constraints';

function num(v: string | null): number | undefined {
  if (v === null || v.trim() === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function parseParams(search: string): Partial<SimulatorInputs> {
  const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const out: Partial<SimulatorInputs> = {};

  const age = num(sp.get('age'));
  if (age !== undefined) out.age = age;
  const years = num(sp.get('years'));
  if (years !== undefined) out.years = years;
  const monthly = num(sp.get('monthly'));
  if (monthly !== undefined) out.monthly = monthly;

  const r = sp.get('r');
  if (r !== null) {
    const parts = r.split(',').map((s) => num(s));
    const keys: RateKey[] = ['a', 'b', 'c'];
    const rates: Partial<Record<RateKey, number>> = {};
    keys.forEach((k, i) => {
      const v = parts[i];
      if (v !== undefined) rates[k] = v;
    });
    if (Object.keys(rates).length > 0) out.rates = rates as Record<RateKey, number>;
  }
  return out;
}

/** 先頭に ? を含まないクエリ文字列を返す */
export function buildParams(inputs: SimulatorInputs): string {
  const sp = new URLSearchParams();
  sp.set('age', String(inputs.age));
  sp.set('years', String(inputs.years));
  sp.set('monthly', String(inputs.monthly));
  sp.set('r', [inputs.rates.a, inputs.rates.b, inputs.rates.c].join(','));
  return sp.toString();
}
