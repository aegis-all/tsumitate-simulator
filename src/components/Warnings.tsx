import type { Warning } from '../domain/constraints';

export function Warnings({ warnings }: { warnings: Warning[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="warnings" role="alert">
      {warnings.map((w) => (
        <p key={w.code} className="warning">
          <span aria-hidden>⚠</span>
          <span>{w.message}</span>
        </p>
      ))}
    </div>
  );
}
