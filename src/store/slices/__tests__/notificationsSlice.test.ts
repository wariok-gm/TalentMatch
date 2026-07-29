import { AppNotification } from '../../../types';
import reducer, {
  loadNotifications,
  markAllRead,
  markRead,
  notificationsInitialState,
} from '../notificationsSlice';

const NOTIFS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'job_match',
    title: 'New casting match',
    body: 'A job matches your filters.',
    createdAt: '2026-07-28T10:00:00.000Z',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'profile_view',
    title: 'Profile view',
    body: 'Someone viewed your profile.',
    createdAt: '2026-07-27T10:00:00.000Z',
    read: false,
  },
];

describe('notificationsSlice', () => {
  it('applies persisted readIds when notifications load', () => {
    const withReadIds = { ...notificationsInitialState, readIds: ['notif-2'] };
    const state = reducer(withReadIds, loadNotifications.fulfilled(NOTIFS, 'req-1'));
    expect(state.items.find((n) => n.id === 'notif-1')?.read).toBe(false);
    expect(state.items.find((n) => n.id === 'notif-2')?.read).toBe(true);
  });

  it('markRead flags the item and records the id for persistence', () => {
    let state = reducer(notificationsInitialState, loadNotifications.fulfilled(NOTIFS, 'req-1'));
    state = reducer(state, markRead('notif-1'));
    expect(state.items.find((n) => n.id === 'notif-1')?.read).toBe(true);
    expect(state.readIds).toContain('notif-1');
  });

  it('markAllRead flags everything and records every id', () => {
    let state = reducer(notificationsInitialState, loadNotifications.fulfilled(NOTIFS, 'req-1'));
    state = reducer(state, markAllRead());
    expect(state.items.every((n) => n.read)).toBe(true);
    expect([...state.readIds].sort()).toEqual(['notif-1', 'notif-2']);
  });
});
