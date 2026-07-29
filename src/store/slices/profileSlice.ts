import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PROFILE } from '../../data/mock';
import { MyProfile } from '../../types';

export interface ProfileState {
  /** Persisted. */
  profile: MyProfile;
}

export const profileInitialState: ProfileState = {
  profile: DEFAULT_PROFILE,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: profileInitialState,
  reducers: {
    updateProfile(state, action: PayloadAction<Partial<MyProfile>>) {
      state.profile = { ...state.profile, ...action.payload };
      const initials = state.profile.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      if (initials) state.profile.initials = initials;
    },
  },
});

export const { updateProfile } = profileSlice.actions;
export default profileSlice.reducer;
