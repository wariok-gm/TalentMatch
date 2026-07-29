export type TalentRole =
  | 'Actor'
  | 'Model'
  | 'Dancer'
  | 'Voice Artist'
  | 'Musician'
  | 'Influencer';

export interface Credit {
  id: string;
  title: string;
  production: string;
  year: number;
  role: string;
}

export interface Talent {
  id: string;
  name: string;
  initials: string;
  role: TalentRole;
  location: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  followers: number;
  hourlyRate: number;
  age: number;
  heightCm: number;
  skills: string[];
  languages: string[];
  credits: Credit[];
  /** Gradient pair for avatar + generated "photos" (fully offline, no image URLs). */
  gradient: [string, string];
  verified: boolean;
  available: boolean;
  featured: boolean;
}

export type JobType =
  | 'Film'
  | 'TV Series'
  | 'Commercial'
  | 'Theatre'
  | 'Music Video'
  | 'Voiceover';

export interface CastingJob {
  id: string;
  title: string;
  company: string;
  type: JobType;
  location: string;
  payMin: number;
  payMax: number;
  payUnit: 'day' | 'project' | 'hour';
  /** ISO date strings */
  postedAt: string;
  deadline: string;
  shootDates: string;
  description: string;
  requirements: string[];
  rolesNeeded: string[];
  applicants: number;
  gradient: [string, string];
  urgent: boolean;
}

export type ApplicationStatus = 'submitted' | 'in_review' | 'shortlisted';

export interface Application {
  jobId: string;
  status: ApplicationStatus;
  appliedAt: string;
  note?: string;
  /** True while the optimistic write has not been "confirmed by the server" yet. */
  pending?: boolean;
}

export type MessageStatus = 'sending' | 'sent' | 'read';

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  sentAt: string;
  fromMe: boolean;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  talentId: string;
  lastMessageAt: string;
  unread: number;
  typing?: boolean;
  messages: Message[];
}

export type NotificationType =
  | 'application_update'
  | 'job_match'
  | 'message'
  | 'profile_view'
  | 'favorite'
  | 'callback';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  jobId?: string;
  talentId?: string;
}

export interface MyProfile {
  name: string;
  headline: string;
  location: string;
  bio: string;
  roles: TalentRole[];
  gradient: [string, string];
  initials: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  total: number;
}

export type ListStatus = 'idle' | 'loading' | 'loadingMore' | 'refreshing' | 'error' | 'ready';
