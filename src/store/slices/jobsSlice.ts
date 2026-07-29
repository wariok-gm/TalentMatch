import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fakeApi } from '../../api/fakeApi';
import { Application, ApplicationStatus, CastingJob, JobType, ListStatus } from '../../types';
import { FeedMode } from './talentsSlice';

export interface JobsState {
  entities: Record<string, CastingJob>;
  feedIds: string[];
  page: number;
  hasMore: boolean;
  status: ListStatus;
  error?: string;
  typeFilter: JobType | 'All';
  /** Persisted. */
  savedIds: string[];
  /** Persisted. Keyed by jobId. */
  applications: Record<string, Application>;
}

export const jobsInitialState: JobsState = {
  entities: {},
  feedIds: [],
  page: 0,
  hasMore: true,
  status: 'idle',
  typeFilter: 'All',
  savedIds: [],
  applications: {},
};

export const loadJobs = createAsyncThunk(
  'jobs/loadJobs',
  async (arg: { mode: FeedMode; type: JobType | 'All' }, { getState }) => {
    const state = getState() as { jobs: JobsState };
    const page = arg.mode === 'more' ? state.jobs.page + 1 : 0;
    return fakeApi.fetchJobs(page, arg.type);
  },
);

export const loadJob = createAsyncThunk('jobs/loadJob', (id: string) => fakeApi.fetchJob(id));

/**
 * Optimistic apply: the application appears instantly (pending), the fake
 * server confirms ~half a second later. Screens can then schedule
 * `advanceApplication` to fake the review pipeline moving.
 */
export const applyToJob = createAsyncThunk(
  'jobs/applyToJob',
  (arg: { jobId: string; note?: string }) => fakeApi.applyToJob(arg.jobId, arg.note),
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: jobsInitialState,
  reducers: {
    setTypeFilter(state, action: PayloadAction<JobType | 'All'>) {
      state.typeFilter = action.payload;
    },
    // Optimistic — persisted locally, no server round-trip.
    toggleSaveJob(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.savedIds = state.savedIds.includes(id)
        ? state.savedIds.filter((existing) => existing !== id)
        : [id, ...state.savedIds];
    },
    advanceApplication(
      state,
      action: PayloadAction<{ jobId: string; status: ApplicationStatus }>,
    ) {
      const app = state.applications[action.payload.jobId];
      if (app) app.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadJobs.pending, (state, action) => {
        const { mode } = action.meta.arg;
        state.error = undefined;
        state.status = mode === 'refresh' ? 'refreshing' : mode === 'more' ? 'loadingMore' : 'loading';
      })
      .addCase(loadJobs.fulfilled, (state, action) => {
        const { mode } = action.meta.arg;
        const { items, page, hasMore } = action.payload;
        for (const job of items) state.entities[job.id] = job;
        const ids = items.map((j) => j.id);
        state.feedIds = mode === 'more' ? [...state.feedIds, ...ids] : ids;
        state.page = page;
        state.hasMore = hasMore;
        state.status = 'ready';
      })
      .addCase(loadJobs.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Something went wrong';
      })
      .addCase(loadJob.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
      })
      .addCase(applyToJob.pending, (state, action) => {
        const { jobId, note } = action.meta.arg;
        state.applications[jobId] = {
          jobId,
          note,
          status: 'submitted',
          appliedAt: new Date().toISOString(),
          pending: true,
        };
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.applications[action.payload.jobId] = { ...action.payload, pending: false };
      })
      .addCase(applyToJob.rejected, (state, action) => {
        // Roll the optimistic write back.
        delete state.applications[action.meta.arg.jobId];
      });
  },
});

export const { setTypeFilter, toggleSaveJob, advanceApplication } = jobsSlice.actions;
export default jobsSlice.reducer;
