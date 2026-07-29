import { AUTO_REPLIES, CONVERSATIONS, JOBS, NOTIFICATIONS, TALENTS } from '../data/mock';
import { Rng } from '../data/random';
import {
  AppNotification,
  Application,
  CastingJob,
  Conversation,
  JobType,
  Message,
  Page,
  Talent,
  TalentRole,
} from '../types';

/**
 * Fully local "network" layer. Every call resolves after a realistic delay so
 * skeletons, pull-to-refresh, and optimistic UI have something real to do.
 * A small failure rate exercises error/retry states (never on mutations).
 */
const LATENCY_MS: readonly [number, number] = [350, 900];
const FAILURE_RATE = 0.06;
export const PAGE_SIZE = 10;

const rng = new Rng(97);

export class FakeApiError extends Error {
  constructor() {
    super('The network took a coffee break. Try again.');
    this.name = 'FakeApiError';
  }
}

function delay(): Promise<void> {
  const ms = rng.int(LATENCY_MS[0], LATENCY_MS[1]);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulate<T>(compute: () => T, options?: { canFail?: boolean }): Promise<T> {
  await delay();
  if ((options?.canFail ?? true) && rng.chance(FAILURE_RATE)) {
    throw new FakeApiError();
  }
  return compute();
}

function paginate<T>(all: T[], page: number, pageSize = PAGE_SIZE): Page<T> {
  const start = page * pageSize;
  const items = all.slice(start, start + pageSize);
  return { items, page, hasMore: start + items.length < all.length, total: all.length };
}

export interface TalentFilters {
  role?: TalentRole | 'All';
  query?: string;
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  maxRate?: number;
}

function filterTalents(filters: TalentFilters): Talent[] {
  const query = filters.query?.trim().toLowerCase() ?? '';
  return TALENTS.filter((talent) => {
    if (filters.role && filters.role !== 'All' && talent.role !== filters.role) return false;
    if (filters.verifiedOnly && !talent.verified) return false;
    if (filters.availableOnly && !talent.available) return false;
    if (filters.maxRate != null && talent.hourlyRate > filters.maxRate) return false;
    if (query.length > 0) {
      const haystack = `${talent.name} ${talent.role} ${talent.location} ${talent.skills.join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export const fakeApi = {
  fetchTalents(page: number, role?: TalentRole | 'All'): Promise<Page<Talent>> {
    return simulate(() => paginate(filterTalents({ role }), page));
  },

  fetchTalent(id: string): Promise<Talent> {
    return simulate(() => {
      const talent = TALENTS.find((t) => t.id === id);
      if (!talent) throw new FakeApiError();
      return talent;
    }, { canFail: false });
  },

  searchTalents(filters: TalentFilters): Promise<Talent[]> {
    return simulate(() => filterTalents(filters).slice(0, 30), { canFail: false });
  },

  fetchJobs(page: number, type?: JobType | 'All'): Promise<Page<CastingJob>> {
    return simulate(() => {
      const all = type && type !== 'All' ? JOBS.filter((job) => job.type === type) : JOBS;
      return paginate(all, page);
    });
  },

  fetchJob(id: string): Promise<CastingJob> {
    return simulate(() => {
      const job = JOBS.find((j) => j.id === id);
      if (!job) throw new FakeApiError();
      return job;
    }, { canFail: false });
  },

  /** Fake apply — always succeeds after a delay so optimistic UI can "confirm". */
  applyToJob(jobId: string, note?: string): Promise<Application> {
    return simulate(
      () => ({ jobId, note, status: 'submitted' as const, appliedAt: new Date().toISOString() }),
      { canFail: false },
    );
  },

  fetchConversations(): Promise<Conversation[]> {
    return simulate(
      () => [...CONVERSATIONS].sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1)),
      { canFail: false },
    );
  },

  /** "Server" acks a sent message. */
  sendMessage(conversationId: string, text: string, id: string): Promise<Message> {
    return simulate(
      () => ({
        id,
        conversationId,
        text,
        sentAt: new Date().toISOString(),
        fromMe: true,
        status: 'sent' as const,
      }),
      { canFail: false },
    );
  },

  /** A canned reply used to fake the other side typing back. */
  fetchAutoReply(conversationId: string, replyIndex: number): Promise<Message> {
    return simulate(
      () => ({
        id: `${conversationId}-reply-${replyIndex}-${Math.floor(Math.random() * 1e6)}`,
        conversationId,
        text: AUTO_REPLIES[replyIndex % AUTO_REPLIES.length],
        sentAt: new Date().toISOString(),
        fromMe: false,
        status: 'read' as const,
      }),
      { canFail: false },
    );
  },

  fetchNotifications(): Promise<AppNotification[]> {
    return simulate(() => NOTIFICATIONS.map((n) => ({ ...n })));
  },
};
