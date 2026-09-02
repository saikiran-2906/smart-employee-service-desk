import React from 'react';

// Reusable loading / error / empty presentational states.

export function Loading({ label = 'Loading...' }) {
  return (
    <div className="state">
      <div className="spinner" />
      <div>{label}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state">
      <div className="state__icon">⚠️</div>
      <div className="state__title">Something went wrong</div>
      <div>{message}</div>
      {onRetry && (
        <div style={{ marginTop: 16 }}>
          <button className="btn btn--secondary btn--sm" onClick={onRetry}>Retry</button>
        </div>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', message }) {
  return (
    <div className="state">
      <div className="state__icon">{icon}</div>
      <div className="state__title">{title}</div>
      {message && <div>{message}</div>}
    </div>
  );
}
