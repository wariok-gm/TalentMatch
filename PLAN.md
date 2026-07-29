# TalentMatch — iOS-26-style Mock Casting App: Build Plan

A fully offline, mock-data casting app built with Expo SDK 54 + TypeScript + React Navigation + Redux Toolkit. No backend, no APIs, no remote images — everything is generated locally with a seeded PRNG so the data is rich, "unreal", and stable across reloads. Designed as a design-inspiration playground: liquid-glass surfaces, skeleton shimmer loading, optimistic UI everywhere, spring physics, haptics.

> Note: AGENTS.md points at Expo v57 docs; the installed SDK in this repo is **54.0.36 / RN 0.81.5**, so all code targets SDK 54 (every API used here — expo-blur, expo-haptics, expo-image, expo-linear-gradient, reanimated 4 — is unchanged in 57).

## 1. Concept

**TalentMatch** — a two-sided casting marketplace seen from a casting director's + talent's hybrid POV:

- **Discover** — paginated feed of talent cards (actors, models, dancers, voice artists, musicians, influencers) with category rail, featured carousel, favorites.
- **Search** — instant local search with debounce, filter chips (role, location, rate, verified), recent searches.
- **Talent Profile** — hero gradient "photos", stats row (rating, followers, rate), credits, skills, favorite + message CTAs.
- **Castings (Jobs)** — paginated casting-call feed, job detail, **fake Apply flow** (form sheet → optimistic "Submitted" → auto-progresses to "In review"/"Shortlisted" over time), saved jobs.
- **Favorites & Saved Jobs** — persisted via AsyncStorage, optimistic toggle with animated heart.
- **Inbox** — conversation list with unread badges, chat screen with optimistic message send + fake typing indicator + auto-reply.
- **Notifications** — bell modal: application updates, profile views, matches; unread dots, mark-all-read.
- **My Profile** — editable mock profile (persisted), stats, links to Favorites/Saved/Applications.

## 2. Tech stack (all already installed)

| Dependency | Why it exists |
|---|---|
| `expo` 54 / `react-native` 0.81 | App runtime |
| `@react-navigation/native` + `native-stack` | Root stack, native iOS large titles, sheet presentation |
| `@react-navigation/bottom-tabs` | 5-tab root with blur tab bar |
| `@reduxjs/toolkit` + `react-redux` | All app state; async thunks against the fake API |
| `@react-native-async-storage/async-storage` | Persist favorites, saved jobs, applications, profile, read-state |
| `react-native-reanimated` (+ worklets) | Shimmer skeletons, spring press scale, animated hearts, list entering animations |
| `expo-blur` | Liquid-glass tab bar + headers |
| `expo-haptics` | Tap/success/selection haptics |
| `expo-linear-gradient` | Generated "photos" and avatar gradients (no remote images) |
| `expo-image` | Not strictly needed (no remote images) — kept for future real photos |
| `react-native-gesture-handler`, `screens`, `safe-area-context` | Navigation/runtime requirements |
| `axios` | Unused by design (no network); left in package.json from scaffold |

## 3. Architecture

```
src/
  theme/        tokens: colors, spacing, typography, radius, shadows
  types/        all domain models (Talent, CastingJob, Conversation, AppNotification, …)
  data/         seeded PRNG + generators (60 talents, 36 jobs, 12 conversations, 18 notifications)
  api/          fakeApi.ts — Promise-based, 350–900ms latency, page/pageSize pagination,
                small simulated failure rate to exercise error states
  store/        index.ts, hooks.ts, persistence.ts (AsyncStorage hydrate + subscribe),
                slices/: talents, search, favorites, jobs, inbox, notifications, profile
  navigation/   RootNavigator (stack + tabs), typed param lists, glass tab bar
  components/   UI kit: Skeleton, PressableScale, Avatar, GradientPhoto, Chip, Badge,
                HeartButton, RatingStars, EmptyState, ErrorView, SectionHeader, Screen
  features/
    discover/   DiscoverScreen, TalentCard, FeaturedCard, CategoryRail
    search/     SearchScreen, FilterSheet pieces
    talent/     TalentProfileScreen
    jobs/       JobsScreen, JobDetailScreen, ApplySheet
    favorites/  FavoritesScreen, SavedJobsScreen
    inbox/      InboxScreen, ChatScreen
    notifications/ NotificationsScreen
    profile/    MyProfileScreen, EditProfileScreen
```

**Data flow:** screens dispatch thunks → `fakeApi` (latency + pagination) → slices normalize → selectors. Mutations (favorite, save, apply, send message, mark read) are **optimistic**: state updates instantly, "server" confirmation lands later; failures roll back with haptic error.

**Persistence:** on boot, `hydrate()` reads 5 AsyncStorage keys before rendering the navigator (splash-style loading gate); a store subscriber debounce-writes changed slices.

## 4. iOS-26 design language

- **Liquid glass:** absolute-positioned `BlurView` tab bar with hairline border + soft shadow; transparent large-title headers with blur on scroll.
- **Depth:** cards `borderRadius` 20–28 with `borderCurve: 'continuous'`, layered soft shadows, gradient hero surfaces.
- **Motion:** every touchable is a `PressableScale` (spring scale 0.96 + haptic); list items fade/slide in; heart pops with overshoot; skeleton shimmer sweep.
- **States:** every list has skeleton → content → empty → error(retry); pull-to-refresh everywhere; infinite scroll with footer spinner.
- **Type:** SF system font ramp (34/800 large title → 11 caption), tight tracking on titles.
- Light mode only (scaffold is `userInterfaceStyle: light`); tokens structured so dark mode can be added later.

## 5. Multi-agent execution plan

**Phase 0 — Foundation (sequential, one author):** theme, types, data generators, fakeApi, store + slices + persistence, UI kit, navigation shell with placeholder screens, new App.tsx. This is the shared contract every feature agent codes against.

**Phase 1 — Feature fan-out (7 parallel agents, each owns only its listed files, overwriting placeholders):**
1. `discover` — DiscoverScreen + TalentCard/FeaturedCard/CategoryRail
2. `search` — SearchScreen + filters
3. `talent` — TalentProfileScreen
4. `jobs` — JobsScreen, JobDetailScreen, ApplySheet
5. `favorites` — FavoritesScreen, SavedJobsScreen
6. `inbox` — InboxScreen, ChatScreen
7. `notifications+profile` — NotificationsScreen, MyProfileScreen, EditProfileScreen

Each agent must: read theme/types/store/components first, use only existing store APIs and kit components, implement skeleton/empty/error/refresh states, and keep TypeScript strict-clean.

**Phase 2 — Integration & verify:** `tsc --noEmit` gate, fix residual errors, consistency pass (spacing, haptics, headers), final review.

## 6. Definition of done

- `npx tsc --noEmit` passes with strict mode.
- Every tab reachable; every screen has loading (skeleton), empty, error, and content states.
- Favorites/saved/applications/profile edits/read-state survive app restart.
- Apply, favorite, save, send-message, mark-read are all optimistic.
- No network calls anywhere; app is fully usable offline.
