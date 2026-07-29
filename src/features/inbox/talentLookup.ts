import { TALENTS } from '../../data/mock';
import { Talent } from '../../types';

/** Synchronous talent display lookup (name/avatar) for inbox rows and chat headers. */
export const TALENT_BY_ID: ReadonlyMap<string, Talent> = new Map(
  TALENTS.map((talent) => [talent.id, talent]),
);
