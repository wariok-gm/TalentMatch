import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fakeApi, TalentFilters } from '../../api/fakeApi';
import { TalentRole } from '../../types';

export interface SearchFilters {
  role: TalentRole | 'All';
  verifiedOnly: boolean;
  availableOnly: boolean;
  maxRate?: number;
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  resultIds: string[];
  status: 'idle' | 'searching' | 'ready';
  recent: string[];
}

export const searchInitialState: SearchState = {
  query: '',
  filters: { role: 'All', verifiedOnly: false, availableOnly: false },
  resultIds: [],
  status: 'idle',
  recent: [],
};

export const runSearch = createAsyncThunk(
  'search/run',
  (arg: { query: string; filters: SearchFilters }) => {
    const apiFilters: TalentFilters = {
      query: arg.query,
      role: arg.filters.role,
      verifiedOnly: arg.filters.verifiedOnly,
      availableOnly: arg.filters.availableOnly,
      maxRate: arg.filters.maxRate,
    };
    return fakeApi.searchTalents(apiFilters);
  },
);

const searchSlice = createSlice({
  name: 'search',
  initialState: searchInitialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
      if (action.payload.trim() === '') {
        state.resultIds = [];
        state.status = 'idle';
      }
    },
    setFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    addRecent(state, action: PayloadAction<string>) {
      const term = action.payload.trim();
      if (term.length < 2) return;
      state.recent = [term, ...state.recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    },
    clearRecent(state) {
      state.recent = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runSearch.pending, (state) => {
        state.status = 'searching';
      })
      .addCase(runSearch.fulfilled, (state, action) => {
        // Ignore stale responses from superseded queries.
        if (action.meta.arg.query !== state.query) return;
        state.resultIds = action.payload.map((t) => t.id);
        state.status = 'ready';
      })
      .addCase(runSearch.rejected, (state) => {
        state.status = 'ready';
      });
  },
});

export const { setQuery, setFilters, addRecent, clearRecent } = searchSlice.actions;
export default searchSlice.reducer;
