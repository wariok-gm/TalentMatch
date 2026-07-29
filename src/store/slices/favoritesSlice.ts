import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoritesState {
  /** Talent ids, most recently favorited first. Persisted to AsyncStorage. */
  ids: string[];
}

export const favoritesInitialState: FavoritesState = {
  ids: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: favoritesInitialState,
  reducers: {
    // Purely optimistic — there is no server to disagree with us.
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.includes(id)
        ? state.ids.filter((existing) => existing !== id)
        : [id, ...state.ids];
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
