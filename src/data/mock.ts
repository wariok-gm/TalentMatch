import { gradients } from '../theme';
import {
  AppNotification,
  CastingJob,
  Conversation,
  Credit,
  JobType,
  Message,
  MyProfile,
  Talent,
  TalentRole,
} from '../types';
import { Rng } from './random';

const FIRST_NAMES = [
  'Ava', 'Liam', 'Maya', 'Noah', 'Zoe', 'Kai', 'Luna', 'Mateo', 'Iris', 'Ezra',
  'Nina', 'Theo', 'Sofia', 'Jasper', 'Amara', 'Felix', 'Leila', 'Oscar', 'Priya', 'Hugo',
  'Naomi', 'Dante', 'Elif', 'Marcus', 'Yuki', 'Andre', 'Freya', 'Santiago', 'Imani', 'Ronan',
  'Camille', 'Idris', 'Bianca', 'Kenji', 'Salma', 'Viktor', 'Anouk', 'Rafael', 'Zara', 'Emil',
] as const;

const LAST_NAMES = [
  'Hart', 'Vega', 'Okafor', 'Lindqvist', 'Moreau', 'Tanaka', 'Reyes', 'Novak', 'Ashford', 'Diallo',
  'Petrov', 'Marino', 'Kim', 'Delacroix', 'Osei', 'Halvorsen', 'Iyer', 'Costa', 'Weiss', 'Nakamura',
  'Alves', 'Sorensen', 'Mbeki', 'Rousseau', 'Kaur', 'Vitale', 'Andersen', 'Zhang', 'Ferreira', 'Laurent',
] as const;

const CITIES = [
  'Los Angeles, CA', 'New York, NY', 'London, UK', 'Berlin, DE', 'Paris, FR',
  'Atlanta, GA', 'Vancouver, BC', 'Sydney, AU', 'Toronto, ON', 'Chicago, IL',
  'Austin, TX', 'Barcelona, ES', 'Amsterdam, NL', 'Seoul, KR', 'Lisbon, PT',
] as const;

const ROLES: readonly TalentRole[] = ['Actor', 'Model', 'Dancer', 'Voice Artist', 'Musician', 'Influencer'];

const SKILLS_BY_ROLE: Record<TalentRole, readonly string[]> = {
  Actor: ['Method acting', 'Improv', 'Stage combat', 'Comedy', 'Drama', 'Motion capture', 'Horse riding', 'Accents', 'Cold reading', 'Green screen'],
  Model: ['Runway', 'Editorial', 'Commercial print', 'Fitness', 'Beauty', 'E-commerce', 'Posing', 'Swimwear', 'High fashion', 'Catalog'],
  Dancer: ['Contemporary', 'Hip hop', 'Ballet', 'Jazz', 'Choreography', 'Breaking', 'Salsa', 'Tap', 'Waacking', 'Partnering'],
  'Voice Artist': ['Narration', 'Character voices', 'Animation', 'Audiobooks', 'Commercial VO', 'Dubbing', 'IVR', 'Podcast', 'Singing', 'Impressions'],
  Musician: ['Vocals', 'Guitar', 'Piano', 'Songwriting', 'Production', 'Violin', 'Drums', 'Live performance', 'Session work', 'Composition'],
  Influencer: ['Lifestyle', 'Beauty', 'Fitness', 'Travel', 'Food', 'Tech', 'UGC', 'Brand campaigns', 'Short-form video', 'Livestreams'],
};

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Portuguese', 'Korean', 'Italian', 'Arabic'] as const;

const BIO_OPENERS: Record<TalentRole, readonly string[]> = {
  Actor: [
    'Award-nominated screen and stage actor',
    'Character actor with a taste for complicated villains',
    'Trained at conservatory, forged in black-box theatre',
  ],
  Model: [
    'Editorial and runway model',
    'Commercial model with an athletic edge',
    'Print and campaign model',
  ],
  Dancer: [
    'Company-trained dancer turned commercial performer',
    'Street-style dancer with stage discipline',
    'Choreographer and performer',
  ],
  'Voice Artist': [
    'Warm, versatile voice with a home studio',
    'Character voice specialist',
    'Narrator with a documentary habit',
  ],
  Musician: [
    'Multi-instrumentalist and session player',
    'Singer-songwriter with sync placements',
    'Composer-performer',
  ],
  Influencer: [
    'Storytelling-first creator',
    'UGC specialist and on-camera host',
    'Community-driven creator',
  ],
};

const BIO_TAILS = [
  'Comfortable on set, obsessive about preparation, easy to direct.',
  'Believes the best take is the honest one. Travels light, shows up early.',
  'Equal parts craft and collaboration — brings options, takes notes well.',
  'Loves ambitious briefs and tight turnarounds. References available.',
  'Known for range, reliability, and keeping crews laughing between setups.',
  'Detail-driven and deadline-friendly. Full kit and passport ready.',
] as const;

const PRODUCTIONS = [
  'Northlight Pictures', 'Blue Harbor Studios', 'Neon Fern', 'Halcyon Films', 'Iron Orchid TV',
  'Papercrane Media', 'Golden Hour Productions', 'Static & Bloom', 'Wildfare Agency', 'Monarch Casting',
  'Driftwood Features', 'Nova Verse Studios', 'Copper Sky Entertainment', 'Lantern House', 'First Light Films',
] as const;

const CREDIT_TITLES = [
  'Midnight Cartography', 'The Last Ferry', 'Glasshouse', 'Echoes of June', 'Neon Harvest',
  'Paper Planets', 'The Understudy', 'Salt & Static', 'Northern Signal', 'A Quiet Racket',
  'Second Sunrise', 'The Archivist', 'Marrow', 'Low Tide', 'Golden Static',
] as const;

const CREDIT_ROLES = ['Lead', 'Supporting', 'Featured', 'Ensemble', 'Guest star', 'Principal', 'Narrator', 'Soloist'] as const;

const JOB_TYPES: readonly JobType[] = ['Film', 'TV Series', 'Commercial', 'Theatre', 'Music Video', 'Voiceover'];

const JOB_TITLE_TEMPLATES: Record<JobType, readonly string[]> = {
  Film: ['Lead in indie feature "{t}"', 'Supporting role — "{t}"', 'Day player for feature "{t}"'],
  'TV Series': ['Recurring role in "{t}"', 'Guest star — series "{t}"', 'Co-star in pilot "{t}"'],
  Commercial: ['National spot for {c}', 'Hero talent — {c} campaign', 'Lifestyle faces for {c}'],
  Theatre: ['Principal in "{t}" (stage)', 'Ensemble for "{t}" revival', 'Understudy — "{t}"'],
  'Music Video': ['Featured dancer — "{t}" video', 'Lead love interest in "{t}"', 'Movement artists for "{t}"'],
  Voiceover: ['Narrator for {c} docuseries', 'Animation voices — "{t}"', 'Brand voice for {c}'],
};

const JOB_REQUIREMENTS = [
  'Local hire or willing to work as local',
  'Must be 18+ at time of shoot',
  'Comfortable with early call times',
  'Current headshots and reel required',
  'Non-union and union submissions accepted',
  'Fittings the week before shoot',
  'Some improvisation required',
  'Travel and lodging covered for out-of-town talent',
  'Callback will be held remotely',
  'Usage: 12 months, all media',
] as const;

const JOB_ROLE_NAMES = [
  'The Cartographer', 'Detective Rowe', 'Young Parent', 'Barista with secrets', 'The Rival',
  'Night-shift nurse', 'Retired astronaut', 'Wedding guest', 'Gallery owner', 'The Neighbor',
  'Getaway driver', 'Chef de cuisine', 'Bookshop regular', 'Festival MC', 'The Understudy',
] as const;

const JOB_BLURBS = [
  'We are looking for a magnetic performer who can carry quiet scenes and land big emotional beats without pushing. The story follows two strangers whose lives intersect over one strange week.',
  'A stylish, fast-moving production with a director who loves actors. Expect a collaborative set, generous rehearsal time, and a script that actually earns its ending.',
  'This campaign celebrates real, unpolished charisma. No stiff commercial smiles — we want people who feel like someone you know and want to know better.',
  'An ambitious ensemble piece shot on location. Long days, great catering, and footage you will genuinely want on your reel.',
  'We are assembling a small, senior cast for an intimate story about ambition and its price. Chemistry reads will be part of callbacks.',
] as const;

const MSG_OUTBOUND = [
  'Hi! Loved your reel — are you available the week of the 14th?',
  'Thanks for applying. Could you send a quick self-tape for the second scene?',
  'The director shortlisted you. Can we set up a call this week?',
  'Quick check — are you still open to travel for this one?',
  'Your look is exactly what we storyboarded. What is your day rate?',
] as const;

const MSG_INBOUND = [
  'Thank you! Yes, I am available that week — happy to hold the dates.',
  'Absolutely, I can have the self-tape over by tomorrow evening.',
  'That is great news! I am free Thursday or Friday afternoon.',
  'Yes, travel works for me. I have a valid passport as well.',
  'Thanks so much! Rate depends on usage — sending my standard sheet now.',
  'Just following up on this — still very interested!',
  'Sounds good, talk soon!',
] as const;

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

const iso = (msAgo: number) => new Date(NOW - msAgo).toISOString();

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function makeCredits(rng: Rng, count: number): Credit[] {
  return rng.sample(CREDIT_TITLES, count).map((title, i) => ({
    id: `credit-${title}-${i}`,
    title,
    production: rng.pick(PRODUCTIONS),
    year: rng.int(2018, 2026),
    role: rng.pick(CREDIT_ROLES),
  }));
}

function makeTalents(rng: Rng, count: number): Talent[] {
  const names = new Set<string>();
  const talents: Talent[] = [];
  while (talents.length < count) {
    const name = `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
    if (names.has(name)) continue;
    names.add(name);
    const role = rng.pick(ROLES);
    const i = talents.length;
    talents.push({
      id: `talent-${i + 1}`,
      name,
      initials: initialsOf(name),
      role,
      location: rng.pick(CITIES),
      bio: `${rng.pick(BIO_OPENERS[role])} based in a suitcase. ${rng.pick(BIO_TAILS)}`,
      rating: Math.round(rng.float(3.6, 5) * 10) / 10,
      reviewsCount: rng.int(4, 210),
      followers: rng.int(800, 480_000),
      hourlyRate: rng.int(4, 60) * 25,
      age: rng.int(19, 52),
      heightCm: rng.int(155, 198),
      skills: rng.sample(SKILLS_BY_ROLE[role], rng.int(4, 6)),
      languages: ['English', ...rng.sample(LANGUAGES.slice(1), rng.int(0, 2))],
      credits: makeCredits(rng, rng.int(2, 5)),
      gradient: rng.pick(gradients),
      verified: rng.chance(0.38),
      available: rng.chance(0.72),
      featured: rng.chance(0.18),
    });
  }
  return talents;
}

function makeJobs(rng: Rng, count: number): CastingJob[] {
  return Array.from({ length: count }, (_, i) => {
    const jobType = rng.pick(JOB_TYPES);
    const template = rng.pick(JOB_TITLE_TEMPLATES[jobType]);
    const title = template
      .replace('{t}', rng.pick(CREDIT_TITLES))
      .replace('{c}', rng.pick(PRODUCTIONS).split(' ')[0]);
    const payUnit = jobType === 'Commercial' || jobType === 'Voiceover' ? 'project' : rng.chance(0.7) ? 'day' : 'project';
    const payMin = rng.int(3, 30) * 100;
    return {
      id: `job-${i + 1}`,
      title,
      company: rng.pick(PRODUCTIONS),
      type: jobType,
      location: rng.pick(CITIES),
      payMin,
      payMax: payMin + rng.int(2, 20) * 100,
      payUnit,
      postedAt: iso(rng.int(1, 21) * DAY + rng.int(0, 23) * 60 * 60 * 1000),
      deadline: iso(-rng.int(3, 30) * DAY),
      shootDates: `${rng.pick(['Aug', 'Sep', 'Oct'])} ${rng.int(2, 24)}–${rng.int(25, 30)}`,
      description: rng.pick(JOB_BLURBS),
      requirements: rng.sample(JOB_REQUIREMENTS, rng.int(3, 5)),
      rolesNeeded: rng.sample(JOB_ROLE_NAMES, rng.int(1, 3)),
      applicants: rng.int(3, 240),
      gradient: rng.pick(gradients),
      urgent: rng.chance(0.2),
    };
  });
}

function makeConversations(rng: Rng, talents: Talent[], count: number): Conversation[] {
  const partners = rng.sample(talents, count);
  return partners.map((talent, i) => {
    const messageCount = rng.int(3, 9);
    const conversationId = `conv-${i + 1}`;
    let msAgo = rng.int(1, 6) * DAY + rng.int(1, 20) * 60 * 60 * 1000;
    const messages: Message[] = [];
    let fromMe = rng.chance(0.6);
    for (let m = 0; m < messageCount; m++) {
      messages.push({
        id: `${conversationId}-msg-${m + 1}`,
        conversationId,
        text: fromMe ? rng.pick(MSG_OUTBOUND) : rng.pick(MSG_INBOUND),
        sentAt: iso(msAgo),
        fromMe,
        status: 'read',
      });
      msAgo -= rng.int(2, 500) * 60 * 1000;
      fromMe = rng.chance(0.5) ? !fromMe : fromMe;
    }
    const unread = !messages[messages.length - 1].fromMe && rng.chance(0.45) ? rng.int(1, 3) : 0;
    return {
      id: conversationId,
      talentId: talent.id,
      lastMessageAt: messages[messages.length - 1].sentAt,
      unread,
      messages,
    };
  });
}

function makeNotifications(
  rng: Rng,
  talents: Talent[],
  jobs: CastingJob[],
  count: number,
): AppNotification[] {
  const makers: Array<() => AppNotification> = [
    () => {
      const job = rng.pick(jobs);
      return base('application_update', 'Application update', `Your application for “${job.title}” moved to In review.`, { jobId: job.id });
    },
    () => {
      const job = rng.pick(jobs);
      return base('job_match', 'New casting match', `“${job.title}” in ${job.location} matches your saved filters.`, { jobId: job.id });
    },
    () => {
      const talent = rng.pick(talents);
      return base('message', 'New message', `${talent.name} replied to your message.`, { talentId: talent.id });
    },
    () => {
      const talent = rng.pick(talents);
      return base('profile_view', 'Profile view', `${talent.name} viewed your profile.`, { talentId: talent.id });
    },
    () => {
      const talent = rng.pick(talents);
      return base('favorite', 'New favorite', `${talent.name} added you to their favorites.`, { talentId: talent.id });
    },
    () => {
      const job = rng.pick(jobs);
      return base('callback', 'Callback invitation', `You are invited to callbacks for “${job.title}”. Check your inbox for slots.`, { jobId: job.id });
    },
  ];

  let counter = 0;
  function base(
    notifType: AppNotification['type'],
    title: string,
    body: string,
    refs: Pick<AppNotification, 'jobId' | 'talentId'>,
  ): AppNotification {
    counter += 1;
    return {
      id: `notif-${counter}`,
      type: notifType,
      title,
      body,
      createdAt: iso(rng.int(0, 9) * DAY + rng.int(2, 900) * 60 * 1000),
      read: false,
      ...refs,
    };
  }

  return Array.from({ length: count }, () => rng.pick(makers)())
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export const DEFAULT_PROFILE: MyProfile = {
  name: 'Daniel Podbrezsky',
  headline: 'Casting director · Producer',
  location: 'Los Angeles, CA',
  bio: 'Casting stories worth telling. Building ensembles for film, streaming, and brand work — always scouting the next unforgettable face.',
  roles: ['Actor', 'Voice Artist'],
  gradient: gradients[0],
  initials: 'DP',
};

const rng = new Rng(20260728);

export const TALENTS: Talent[] = makeTalents(rng, 60);
export const JOBS: CastingJob[] = makeJobs(rng, 36);
export const CONVERSATIONS: Conversation[] = makeConversations(rng, TALENTS, 12);
export const NOTIFICATIONS: AppNotification[] = makeNotifications(rng, TALENTS, JOBS, 18);

export const AUTO_REPLIES = MSG_INBOUND;
