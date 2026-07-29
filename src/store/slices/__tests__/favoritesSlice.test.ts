import reducer, { favoritesInitialState, toggleFavorite } from '../favoritesSlice';

describe('favoritesSlice', () => {
  it('adds favorites newest-first', () => {
    let state = reducer(favoritesInitialState, toggleFavorite('talent-1'));
    state = reducer(state, toggleFavorite('talent-2'));
    expect(state.ids).toEqual(['talent-2', 'talent-1']);
  });

  it('toggling an existing favorite removes it', () => {
    let state = reducer(favoritesInitialState, toggleFavorite('talent-1'));
    state = reducer(state, toggleFavorite('talent-1'));
    expect(state.ids).toEqual([]);
  });
});
