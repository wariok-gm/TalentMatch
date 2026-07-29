import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fakeApi } from '../../api/fakeApi';
import { ListStatus, Talent, TalentRole } from '../../types';
import { runSearch } from './searchSlice';

export interface TalentsState {
  entities: Record<string, Talent>;
  feedIds: string[];
  page: number;
  hasMore: boolean;
  status: ListStatus;
  error?: string;
  roleFilter: TalentRole | 'All';
}

export const talentsInitialState: TalentsState = {
  entities: {},
  feedIds: [],
  page: 0,
  hasMore: true,
  status: 'idle',
  roleFilter: 'All',
};

export type FeedMode = 'initial' | 'refresh' | 'more';

export const loadDiscover = createAsyncThunk(
  'talents/loadDiscover',
  async (arg: { mode: FeedMode; role: TalentRole | 'All' }, { getState }) => {
    const state = getState() as { talents: TalentsState };
    const page = arg.mode === 'more' ? state.talents.page + 1 : 0;
    return fakeApi.fetchTalents(page, arg.role);
  },
);

export const loadTalent = createAsyncThunk('talents/loadTalent', (id: string) =>
  fakeApi.fetchTalent(id),
);

const talentsSlice = createSlice({
  name: 'talents',
  initialState: talentsInitialState,
  reducers: {
    upsertTalents(state, action: PayloadAction<Talent[]>) {
      for (const talent of action.payload) state.entities[talent.id] = talent;
    },
    setRoleFilter(state, action: PayloadAction<TalentRole | 'All'>) {
      state.roleFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDiscover.pending, (state, action) => {
        const { mode } = action.meta.arg;
        state.error = undefined;
        state.status = mode === 'refresh' ? 'refreshing' : mode === 'more' ? 'loadingMore' : 'loading';
      })
      .addCase(loadDiscover.fulfilled, (state, action) => {
        const { mode } = action.meta.arg;
        const { items, page, hasMore } = action.payload;
        for (const talent of items) state.entities[talent.id] = talent;
        const ids = items.map((t) => t.id);
        state.feedIds = mode === 'more' ? [...state.feedIds, ...ids] : ids;
        state.page = page;
        state.hasMore = hasMore;
        state.status = 'ready';
      })
      .addCase(loadDiscover.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Something went wrong';
      })
      .addCase(loadTalent.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
      })
      // Search results live in searchSlice as ids; entities are normalized here.
      .addCase(runSearch.fulfilled, (state, action) => {
        for (const talent of action.payload) state.entities[talent.id] = talent;
      });
  },
});

export const { upsertTalents, setRoleFilter } = talentsSlice.actions;
export default talentsSlice.reducer;
