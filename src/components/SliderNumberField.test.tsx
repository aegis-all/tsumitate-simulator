import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SliderNumberField } from './SliderNumberField';
import { CONSTRAINTS } from '../domain/constraints';

function setup(value = 20) {
  const onCommit = vi.fn();
  render(
    <SliderNumberField
      label="積立期間"
      unit="年"
      value={value}
      constraint={CONSTRAINTS.years}
      onCommit={onCommit}
    />,
  );
  const number = screen.getByLabelText('積立期間') as HTMLInputElement;
  const range = screen.getByLabelText('積立期間(スライダー)') as HTMLInputElement;
  return { onCommit, number, range };
}

describe('SliderNumberField', () => {
  it('範囲外の入力は blur でクランプされ、メッセージが出る (V-1)', async () => {
    const user = userEvent.setup();
    const { onCommit, number } = setup();
    await user.clear(number);
    await user.type(number, '99');
    await user.tab(); // blur
    expect(onCommit).toHaveBeenCalledWith(50);
    expect(number.value).toBe('50');
    expect(screen.getByRole('status')).toHaveTextContent('1〜50年の範囲で入力してください');
    expect(number).toHaveAttribute('aria-invalid', 'true');
  });

  it('Enter でも確定する', async () => {
    const user = userEvent.setup();
    const { onCommit, number } = setup();
    await user.clear(number);
    await user.type(number, '25{Enter}');
    expect(onCommit).toHaveBeenCalledWith(25);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('空欄で blur すると直前値に戻り、onCommit は呼ばれない (V-2)', async () => {
    const user = userEvent.setup();
    const { onCommit, number } = setup(20);
    await user.clear(number);
    expect(number.value).toBe('');
    await user.tab();
    expect(number.value).toBe('20');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('入力途中では onCommit を呼ばない (D-2)', async () => {
    const user = userEvent.setup();
    const { onCommit, number } = setup();
    await user.clear(number);
    await user.type(number, '3');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('スライダーは即時確定', () => {
    const { onCommit, range } = setup();
    fireEvent.change(range, { target: { value: '30' } });
    expect(onCommit).toHaveBeenCalledWith(30);
  });

  it('同値の確定では onCommit を呼ばない', async () => {
    const user = userEvent.setup();
    const { onCommit, number } = setup(20);
    await user.click(number);
    await user.tab();
    expect(onCommit).not.toHaveBeenCalled();
  });
});
