import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App (受け入れ基準 要件 §8)', () => {
  it('§8-1: 初期値で 約984.9万 / 約1,233.1万 / 約1,562.8万、§8-3: 50歳時点', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: '50歳時点の運用資産額' })).toBeInTheDocument();
    expect(screen.getByText('約984.9万円')).toBeInTheDocument();
    expect(screen.getByText('約1,233.1万円')).toBeInTheDocument();
    expect(screen.getByText('約1,562.8万円')).toBeInTheDocument();
    expect(screen.getByText('12,331,010円')).toBeInTheDocument();
  });

  it('§8-3: 年齢85・期間20で警告が出る', async () => {
    const user = userEvent.setup();
    render(<App />);
    const age = screen.getByLabelText('現在の年齢');
    await user.clear(age);
    await user.type(age, '85{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('到達年齢が100歳を超えます(105歳)');
    expect(screen.getByRole('heading', { level: 2, name: '105歳時点の運用資産額' })).toBeInTheDocument();
  });

  it('§8-4: 利回り0%で壊れず、運用収益0・元本と同額', async () => {
    const user = userEvent.setup();
    render(<App />);
    const rateA = screen.getByLabelText('堅め');
    await user.clear(rateA);
    await user.type(rateA, '0{Enter}');
    const card = screen.getByRole('article', { name: '堅め 0.0%' });
    expect(within(card).getByText('約720.0万円')).toBeInTheDocument();
    expect(within(card).getByText('0.0万円')).toBeInTheDocument();
    expect(within(card).getByText('1.00倍')).toBeInTheDocument();
  });

  it('§8-5: 範囲外入力はクランプされてメッセージが出る', async () => {
    const user = userEvent.setup();
    render(<App />);
    const years = screen.getByLabelText('積立期間');
    await user.clear(years);
    await user.type(years, '99{Enter}');
    expect((years as HTMLInputElement).value).toBe('50');
    expect(screen.getByText('1〜50年の範囲で入力してください')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '80歳時点の運用資産額' })).toBeInTheDocument();
  });

  it('初期値に戻す', async () => {
    const user = userEvent.setup();
    render(<App />);
    const years = screen.getByLabelText('積立期間');
    await user.clear(years);
    await user.type(years, '10{Enter}');
    expect(screen.getByRole('heading', { level: 2, name: '40歳時点の運用資産額' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '初期値に戻す' }));
    expect(screen.getByRole('heading', { level: 2, name: '50歳時点の運用資産額' })).toBeInTheDocument();
  });

  it('免責が表示される', () => {
    render(<App />);
    expect(screen.getByText(/将来の運用成果を予測・保証するものではありません/)).toBeInTheDocument();
  });
});
