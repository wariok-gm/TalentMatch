import React from 'react';
import { EmptyState } from './EmptyState';

interface Props {
  message?: string;
  onRetry: () => void;
}

export function ErrorView({ message, onRetry }: Props) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Couldn't load"
      message={message ?? 'The network took a coffee break. Try again.'}
      actionLabel="Retry"
      onAction={onRetry}
    />
  );
}
