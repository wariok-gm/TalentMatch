import { CastingJob } from '../types';

export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(value);
}

export function formatRate(hourlyRate: number): string {
  return `$${hourlyRate}/hr`;
}

export function formatPay(job: Pick<CastingJob, 'payMin' | 'payMax' | 'payUnit'>): string {
  const unit = job.payUnit === 'project' ? ' total' : `/${job.payUnit}`;
  return `$${job.payMin.toLocaleString()}–$${job.payMax.toLocaleString()}${unit}`;
}

export function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.round(days / 7)}w`;
}

/** For deadlines (dates in the future). */
export function daysUntil(isoDate: string): number {
  return Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000));
}

export function formatHeight(cm: number): string {
  const totalInches = Math.round(cm / 2.54);
  return `${Math.floor(totalInches / 12)}'${totalInches % 12}" · ${cm}cm`;
}
