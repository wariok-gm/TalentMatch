import { createAsyncThunk, createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import { fakeApi } from '../../api/fakeApi';
import { AppNotification, ListStatus } from '../../types';

export interface NotificationsState {
  items: AppNotification[];
  status: ListStatus;
  error?: string;
  /** Persisted so read-state survives restarts (mock items have stable ids). */
  readIds: string[];
}

export const notificationsInitialState: NotificationsState = {
  items: [],
  status: 'idle',
  readIds: [],
};

export const loadNotifications = createAsyncThunk('notifications/load', () =>
  fakeApi.fetchNotifications(),
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: notificationsInitialState,
  reducers: {
    markRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.read = true;
      if (!state.readIds.includes(action.payload)) state.readIds.push(action.payload);
    },
    markAllRead(state) {
      for (const item of state.items) item.read = true;
      state.readIds = state.items.map((n) => n.id);
    },
    /** Used by other features (e.g. after a fake apply confirms). */
    pushNotification(
      state,
      action: PayloadAction<Omit<AppNotification, 'id' | 'createdAt' | 'read'>>,
    ) {
      state.items.unshift({
        ...action.payload,
        id: `local-notif-${nanoid()}`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.pending, (state) => {
        state.error = undefined;
        state.status = state.status === 'ready' ? 'refreshing' : 'loading';
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        const locals = state.items.filter((n) => n.id.startsWith('local-notif-'));
        const fetched = action.payload.map((n) => ({
          ...n,
          read: state.readIds.includes(n.id),
        }));
        state.items = [...locals, ...fetched];
        state.status = 'ready';
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Something went wrong';
      });
  },
});

export const { markRead, markAllRead, pushNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
