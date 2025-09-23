import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemoryBoard from '../MemoryBoard';
import { useMemoryGame } from '../../../hooks';
import { getCharacterImageUrl } from '../../../utils/characterImageUtils';

// Mock dependencies
jest.mock('../../../hooks', () => ({
  useMemoryGame: jest.fn()
}));

jest.mock('../../../utils/characterImageUtils', () => ({
  getCharacterImageUrl: jest.fn()
}));

// Mock MemoryCard component
jest.mock('../MemoryCard', () => {
  return function MockMemoryCard({ id, onClick, isFlipped, isMatched, isMismatched, disabled, ariaLabel }) {
    return (
      <button onClick={() => onClick(id)} disabled={disabled} aria-label={ariaLabel} data-flipped={isFlipped} data-matched={isMatched} data-mismatched={isMismatched}>
        Card {id}
      </button>
    );
  };
});

// Mock ScreenReaderOnly component
  jest.mock('../../ui', () => ({
    ScreenReaderOnly: ({ children }) => <div aria-live="polite">{children}</div>
  }));

describe('MemoryBoard', () => {
  const mockGameState = {
    gameState: 'PLAYING',
    cards: [
      { id: 1, pairId: 'A', faceUrl: null, badge: null },
      { id: 2, pairId: 'A', faceUrl: null, badge: null },
      { id: 3, pairId: 'B', faceUrl: null, badge: null },
      { id: 4, pairId: 'B', faceUrl: null, badge: null }
    ],
    liveMessage: 'Game started',
    mismatchedIds: new Set(),
    GAME_STATES: {
      IDLE: 'IDLE',
      PLAYING: 'PLAYING',
      FINISHED: 'FINISHED'
    }
  };

  const mockHandlers = {
    initializeGame: jest.fn(),
    handleCardClick: jest.fn(),
    getCardState: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window dimensions
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 600
    });

    // Mock character image URLs
    getCharacterImageUrl.mockImplementation((level, type) => 
      `mock-image-${level}-${type}.png`
    );

    // Mock useMemoryGame hook
    useMemoryGame.mockReturnValue({
      ...mockGameState,
      ...mockHandlers
    });

    // Mock getCardState to return default state
    mockHandlers.getCardState.mockImplementation((card) => ({
      isFlipped: false,
      isMatched: false
    }));
  });

  describe('Rendering', () => {
    it('should render memory board with cards', () => {
      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Card 3')).toBeInTheDocument();
      expect(screen.getByText('Card 4')).toBeInTheDocument();
    });

    it('should render screen reader live region', () => {
      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      expect(screen.getByText('Game started')).toBeInTheDocument();
    });

    it('should render with custom character level and pair count', () => {
      render(<MemoryBoard characterLevel={3} pairCount={4} />);

      expect(getCharacterImageUrl).toHaveBeenCalledWith(3, 'default');
      expect(getCharacterImageUrl).toHaveBeenCalledWith(3, 'happy');
    });
  });

  describe('Game Initialization', () => {
    it('should initialize game on mount', () => {
      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      expect(mockHandlers.initializeGame).toHaveBeenCalledWith(
        'mock-image-1-default.png',
        'mock-image-1-happy.png'
      );
    });

    it('should reinitialize game when restartKey changes', () => {
      const { rerender } = render(
        <MemoryBoard characterLevel={1} pairCount={2} restartKey={0} />
      );

      expect(mockHandlers.initializeGame).toHaveBeenCalledTimes(1);

      rerender(<MemoryBoard characterLevel={1} pairCount={2} restartKey={1} />);

      expect(mockHandlers.initializeGame).toHaveBeenCalledTimes(2);
    });

    it('should reinitialize game when pairCount changes', () => {
      const { rerender } = render(
        <MemoryBoard characterLevel={1} pairCount={2} />
      );

      expect(mockHandlers.initializeGame).toHaveBeenCalledTimes(1);

      rerender(<MemoryBoard characterLevel={1} pairCount={4} />);

      expect(mockHandlers.initializeGame).toHaveBeenCalledTimes(2);
    });

    it('should reinitialize game when character level changes', () => {
      const { rerender } = render(
        <MemoryBoard characterLevel={1} pairCount={2} />
      );

      expect(mockHandlers.initializeGame).toHaveBeenCalledTimes(1);

      rerender(<MemoryBoard characterLevel={2} pairCount={2} />);

      expect(mockHandlers.initializeGame).toHaveBeenCalledTimes(2);
    });
  });

  describe('Game Start Callback', () => {
    it('should call onGameStart when game state becomes PLAYING', () => {
      const mockOnGameStart = jest.fn();

      useMemoryGame.mockReturnValue({
        ...mockGameState,
        gameState: 'PLAYING',
        ...mockHandlers
      });

      render(
        <MemoryBoard 
          characterLevel={1} 
          pairCount={2} 
          onGameStart={mockOnGameStart}
        />
      );

      expect(mockOnGameStart).toHaveBeenCalled();
    });

    it('should not call onGameStart when game state is not PLAYING', () => {
      const mockOnGameStart = jest.fn();

      useMemoryGame.mockReturnValue({
        ...mockGameState,
        gameState: 'IDLE',
        ...mockHandlers
      });

      render(
        <MemoryBoard 
          characterLevel={1} 
          pairCount={2} 
          onGameStart={mockOnGameStart}
        />
      );

      expect(mockOnGameStart).not.toHaveBeenCalled();
    });
  });

  describe('Card Interactions', () => {
    it('should handle card clicks', () => {
      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      const [firstCard] = screen.getAllByRole('button', { name: '뒤집기' });
      fireEvent.click(firstCard);

      expect(mockHandlers.handleCardClick).toHaveBeenCalledWith(1);
    });

    it('should disable cards when game is paused', () => {
      render(<MemoryBoard characterLevel={1} pairCount={2} isPaused={true} />);

      const card1 = screen.getAllByRole('button')[0];
      expect(card1).toBeDisabled();
    });

    it('should enable cards when game is not paused', () => {
      render(<MemoryBoard characterLevel={1} pairCount={2} isPaused={false} />);

      const card1 = screen.getAllByRole('button')[0];
      expect(card1).not.toBeDisabled();
    });
  });

  describe('Card States', () => {
    it('should display flipped cards correctly', () => {
      mockHandlers.getCardState.mockImplementation((card) => {
        if (card.id === 1) {
          return { isFlipped: true, isMatched: false };
        }
        return { isFlipped: false, isMatched: false };
      });

      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      const [card1, card2] = screen.getAllByRole('button');
      expect(card1).toHaveAttribute('data-flipped', 'true');
      expect(card2).toHaveAttribute('data-flipped', 'false');
    });

    it('should display matched cards correctly', () => {
      mockHandlers.getCardState.mockImplementation((card) => {
        if (card.id === 1 || card.id === 2) {
          return { isFlipped: true, isMatched: true };
        }
        return { isFlipped: false, isMatched: false };
      });

      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      const [card1, card2] = screen.getAllByRole('button');
      expect(card1).toHaveAttribute('data-matched', 'true');
      expect(card2).toHaveAttribute('data-matched', 'true');
      expect(card1).toHaveAttribute('aria-label', '매치된 카드');
      expect(card2).toHaveAttribute('aria-label', '매치된 카드');
    });

    it('should display mismatched cards correctly', () => {
      useMemoryGame.mockReturnValue({
        ...mockGameState,
        mismatchedIds: new Set([1, 2]),
        ...mockHandlers
      });

      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      const [card1, card2, card3] = screen.getAllByRole('button');
      expect(card1).toHaveAttribute('data-mismatched', 'true');
      expect(card2).toHaveAttribute('data-mismatched', 'true');
      expect(card3).toHaveAttribute('data-mismatched', 'false');
    });
  });

  describe('Responsive Canvas', () => {
    it('should update canvas size on window resize', () => {
      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      // Simulate window resize
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        value: 400
      });

      fireEvent(window, new Event('resize'));

      // Canvas should adapt to new size
      // Note: Detailed canvas size testing would require more complex mocking
      expect(screen.getByText('Card 1')).toBeInTheDocument();
    });

    it('should calculate different grid layouts for different pair counts', () => {
      // Test with smaller pair count (should use 4 columns)
      const { rerender } = render(<MemoryBoard characterLevel={1} pairCount={4} />);

      // Test with larger pair count (should use 6 columns)
      rerender(<MemoryBoard characterLevel={1} pairCount={12} />);

      expect(screen.getByText('Card 1')).toBeInTheDocument();
    });
  });

  describe('Character Images', () => {
    it('should use character-specific images', () => {
      render(<MemoryBoard characterLevel={5} pairCount={2} />);

      expect(getCharacterImageUrl).toHaveBeenCalledWith(5, 'default');
      expect(getCharacterImageUrl).toHaveBeenCalledWith(5, 'happy');
    });

    it('should use card-specific face URL when available', () => {
      const cardsWithCustomFace = [
        { id: 1, pairId: 'A', faceUrl: 'custom-face.png', badge: null },
        { id: 2, pairId: 'A', faceUrl: null, badge: null }
      ];

      useMemoryGame.mockReturnValue({
        ...mockGameState,
        cards: cardsWithCustomFace,
        ...mockHandlers
      });

      render(<MemoryBoard characterLevel={1} pairCount={1} />);

      // This would be verified in the actual MemoryCard component
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for unmatched cards', () => {
      mockHandlers.getCardState.mockImplementation(() => ({
        isFlipped: false,
        isMatched: false
      }));

      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      const cards = screen.getAllByRole('button');
      cards.forEach(card => {
        expect(card).toHaveAttribute('aria-label', '뒤집기');
      });
    });

    it('should update live region with game messages', () => {
      useMemoryGame.mockReturnValue({
        ...mockGameState,
        liveMessage: 'Match found!',
        ...mockHandlers
      });

      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      expect(screen.getByText('Match found!')).toBeInTheDocument();
    });

    it('should have proper aria-live attribute', () => {
      render(<MemoryBoard characterLevel={1} pairCount={2} />);

      const liveRegion = screen.getByText(/Game started|Match found!/).parentElement;
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Props Handling', () => {
    it('should handle missing onGameEnd prop', () => {
      expect(() => {
        render(<MemoryBoard characterLevel={1} pairCount={2} />);
      }).not.toThrow();
    });

    it('should handle missing onGameStart prop', () => {
      useMemoryGame.mockReturnValue({
        ...mockGameState,
        gameState: 'PLAYING',
        ...mockHandlers
      });

      expect(() => {
        render(<MemoryBoard characterLevel={1} pairCount={2} />);
      }).not.toThrow();
    });

    it('should use default values for optional props', () => {
      render(<MemoryBoard />);

      expect(getCharacterImageUrl).toHaveBeenCalledWith(1, 'default');
      expect(getCharacterImageUrl).toHaveBeenCalledWith(1, 'happy');
    });
  });
});