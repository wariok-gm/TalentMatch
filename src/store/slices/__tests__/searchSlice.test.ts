import reducer, { addRecent, clearRecent, searchInitialState, setQuery } from '../searchSlice';

describe('searchSlice — recent searches', () => {
  it('stores recents newest-first and dedupes case-insensitively', () => {
    let state = reducer(searchInitialState, addRecent('ballet'));
    state = reducer(state, addRecent('voice over'));
    state = reducer(state, addRecent('Ballet'));
    expect(state.recent).toEqual(['Ballet', 'voice over']);
  });

  it('ignores terms shorter than 2 characters and caps the list at 8', () => {
    let state = reducer(searchInitialState, addRecent('x'));
    expect(state.recent).toEqual([]);
    for (let i = 0; i < 10; i += 1) {
      state = reducer(state, addRecent(`term-${i}`));
    }
    expect(state.recent).toHaveLength(8);
    expect(state.recent[0]).toBe('term-9');
  });

  it('clearRecent empties the list', () => {
    let state = reducer(searchInitialState, addRecent('ballet'));
    state = reducer(state, clearRecent());
    expect(state.recent).toEqual([]);
  });

  it('clearing the query resets results and status', () => {
    const dirty = {
      ...searchInitialState,
      query: 'dancer',
      resultIds: ['talent-1'],
      status: 'ready' as const,
    };
    const state = reducer(dirty, setQuery(''));
    expect(state.resultIds).toEqual([]);
    expect(state.status).toBe('idle');
  });
});
