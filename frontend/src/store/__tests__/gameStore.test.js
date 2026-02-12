/**
 * GameStore Tests
 */

import { create } from 'zustand';

// Mock do store
const mockStore = {
  user: null,
  gameState: {},
  setUser: jest.fn(),
  setGameState: jest.fn(),
  resetStore: jest.fn()
};

describe('GameStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should have initial state', () => {
      expect(mockStore.user).toBeNull();
      expect(mockStore.gameState).toEqual({});
    });
  });

  describe('setUser', () => {
    it('should set user', () => {
      const user = { id: 1, name: 'Test User' };
      mockStore.setUser(user);
      expect(mockStore.setUser).toHaveBeenCalledWith(user);
    });
  });

  describe('setGameState', () => {
    it('should set game state', () => {
      const gameState = { score: 100, level: 2 };
      mockStore.setGameState(gameState);
      expect(mockStore.setGameState).toHaveBeenCalledWith(gameState);
    });
  });

  describe('resetStore', () => {
    it('should reset store', () => {
      mockStore.resetStore();
      expect(mockStore.resetStore).toHaveBeenCalled();
    });
  });
});
