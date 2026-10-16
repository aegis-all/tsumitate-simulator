import { describe, it, expect } from 'vitest';
import { buildParams, parseParams } from './urlParams';
import { DEFAULT_INPUTS, sanitizeInputs } from '../domain/constraints';

describe('urlParams', () => {
  it('roundtrip: build → parse → sanitize で元に戻る', () => {
    const inputs = { age: 42, years: 18, monthly: 55_000, rates: { a: 1.5, b: 4, c: 8.2 } };
    const qs = buildParams(inputs);
    expect(qs).toBe('age=42&years=18&monthly=55000&r=1.5%2C4%2C8.2');
    expect(sanitizeInputs(parseParams(qs))).toEqual(inputs);
    expect(sanitizeInputs(parseParams('?' + qs))).toEqual(inputs);
  });
  it('既定値の roundtrip', () => {
    expect(sanitizeInputs(parseParams(buildParams(DEFAULT_INPUTS)))).toEqual(DEFAULT_INPUTS);
  });
  it('不正値は undefined (既定値に任せる)', () => {
    const p = parseParams('age=abc&years=&monthly=1e400&r=x,5,y');
    expect(p.age).toBeUndefined();
    expect(p.years).toBeUndefined();
    expect(p.monthly).toBeUndefined();
    expect(p.rates).toEqual({ b: 5 });
    const s = sanitizeInputs(p);
    expect(s).toEqual({ ...DEFAULT_INPUTS, rates: { a: 3, b: 5, c: 7 } });
  });
  it('空文字は空オブジェクト', () => {
    expect(parseParams('')).toEqual({});
    expect(parseParams('?')).toEqual({});
  });
  it('範囲外は sanitize でクランプされる', () => {
    const s = sanitizeInputs(parseParams('age=999&years=0&monthly=5&r=99,-1,5.55'));
    expect(s).toEqual({ age: 100, years: 1, monthly: 1000, rates: { a: 20, b: 0, c: 5.6 } });
  });
  it('r が 2 要素なら c は既定値', () => {
    expect(sanitizeInputs(parseParams('r=1,2')).rates).toEqual({ a: 1, b: 2, c: 7 });
  });
});
