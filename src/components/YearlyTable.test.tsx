import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YearlyTable, buildCsv, csvFileName } from './YearlyTable';
import { simulate } from '../domain/simulate';
import { DEFAULT_INPUTS } from '../domain/constraints';

const result = simulate(DEFAULT_INPUTS);

describe('YearlyTable', () => {
  it('全年次の行があり、最終行に要件 §8-1 の値が万円で出る', () => {
    render(<YearlyTable result={result} />);
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1 + DEFAULT_INPUTS.years); // header + 20
    const last = rows[rows.length - 1];
    expect(last).toHaveTextContent('20年');
    expect(last).toHaveTextContent('50歳');
    expect(last).toHaveTextContent('720.0万');
    expect(last).toHaveTextContent('984.9万');
    expect(last).toHaveTextContent('1,233.1万');
    expect(last).toHaveTextContent('1,562.8万');
  });
});

describe('buildCsv', () => {
  it('ヘッダ + 年数行、円単位', () => {
    const csv = buildCsv(result);
    const lines = csv.trim().split('\r\n');
    expect(lines).toHaveLength(1 + 20);
    expect(lines[0]).toBe('経過年,年齢,元本累計(円),堅め 3.0% 資産額(円),標準 5.0% 資産額(円),強め 7.0% 資産額(円)');
    expect(lines[20]).toBe('20,50,7200000,9849060,12331010,15627800');
  });
  it('ファイル名規則', () => {
    expect(csvFileName(result)).toBe('tsumitate_30_20_30000.csv');
  });
});
