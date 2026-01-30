import { describe, it, expect, beforeEach } from 'vitest';
import { SongComposer } from '../SongComposer';
import { Song, Pattern, PatternEntry } from '../../domain';

describe('SongComposer', () => {
  let composer: SongComposer;
  let song: Song;
  let pattern1: Pattern;
  let pattern2: Pattern;

  beforeEach(() => {
    pattern1 = new Pattern('pattern-1', 'Intro', 16);
    pattern2 = new Pattern('pattern-2', 'Verse', 16);
    song = new Song('song-1', 'Test Song', 120);
    composer = new SongComposer(song);
  });

  describe('addPattern', () => {
    it('should add a pattern to the sequence', () => {
      // Arrange
      const entry = new PatternEntry('pattern-1', 1);
      
      // Act
      composer.addPattern(entry);
      
      // Assert
      const updatedSong = composer.getSong();
      expect(updatedSong.patternSequence.length).toBe(1);
      expect(updatedSong.patternSequence[0].patternId).toBe('pattern-1');
    });

    it('should add multiple patterns in order', () => {
      // Arrange
      const entry1 = new PatternEntry('pattern-1', 1);
      const entry2 = new PatternEntry('pattern-2', 2);
      
      // Act
      composer.addPattern(entry1);
      composer.addPattern(entry2);
      
      // Assert
      const updatedSong = composer.getSong();
      expect(updatedSong.patternSequence.length).toBe(2);
      expect(updatedSong.patternSequence[0].patternId).toBe('pattern-1');
      expect(updatedSong.patternSequence[1].patternId).toBe('pattern-2');
    });

    it('should add patterns with repeat count', () => {
      // Arrange
      const entry = new PatternEntry('pattern-1', 4);
      
      // Act
      composer.addPattern(entry);
      
      // Assert
      const updatedSong = composer.getSong();
      expect(updatedSong.patternSequence[0].repeat).toBe(4);
    });
  });

  describe('insertPattern', () => {
    it('should insert a pattern at specified position', () => {
      // Arrange
      composer.addPattern(new PatternEntry('pattern-1', 1));
      composer.addPattern(new PatternEntry('pattern-3', 1));
      const newEntry = new PatternEntry('pattern-2', 1);
      
      // Act
      composer.insertPattern(1, newEntry);
      
      // Assert
      const updatedSong = composer.getSong();
      expect(updatedSong.patternSequence.length).toBe(3);
      expect(updatedSong.patternSequence[1].patternId).toBe('pattern-2');
    });

    it('should throw error when position is out of bounds', () => {
      // Act & Assert
      expect(() => composer.insertPattern(5, new PatternEntry('pattern-1', 1)))
        .toThrow('Position 5 is out of bounds');
    });
  });

  describe('removePattern', () => {
    it('should remove a pattern at specified position', () => {
      // Arrange
      composer.addPattern(new PatternEntry('pattern-1', 1));
      composer.addPattern(new PatternEntry('pattern-2', 1));
      
      // Act
      composer.removePattern(0);
      
      // Assert
      const updatedSong = composer.getSong();
      expect(updatedSong.patternSequence.length).toBe(1);
      expect(updatedSong.patternSequence[0].patternId).toBe('pattern-2');
    });

    it('should throw error when position is out of bounds', () => {
      // Act & Assert
      expect(() => composer.removePattern(0)).toThrow('Position 0 is out of bounds');
    });
  });

  describe('movePattern', () => {
    it('should move a pattern to a new position', () => {
      // Arrange
      composer.addPattern(new PatternEntry('pattern-1', 1));
      composer.addPattern(new PatternEntry('pattern-2', 1));
      composer.addPattern(new PatternEntry('pattern-3', 1));
      
      // Act
      composer.movePattern(0, 2);
      
      // Assert
      const updatedSong = composer.getSong();
      expect(updatedSong.patternSequence[0].patternId).toBe('pattern-2');
      expect(updatedSong.patternSequence[2].patternId).toBe('pattern-1');
    });
  });

  describe('setRepeatCount', () => {
    it('should set song repeat count', () => {
      // Act
      composer.setRepeatCount(3);
      
      // Assert
      const updatedSong = composer.getSong();
      expect(updatedSong.repeatCount).toBe(3);
    });

    it('should throw error when repeat count is zero or negative', () => {
      // Act & Assert
      expect(() => composer.setRepeatCount(0)).toThrow('Repeat count must be positive');
      expect(() => composer.setRepeatCount(-1)).toThrow('Repeat count must be positive');
    });
  });

  describe('setBPM', () => {
    it('should set song BPM', () => {
      // Act
      composer.setBPM(140);
      
      // Assert
      const updatedSong = composer.getSong();
      expect(updatedSong.bpm).toBe(140);
    });

    it('should throw error when BPM is zero or negative', () => {
      // Act & Assert
      expect(() => composer.setBPM(0)).toThrow('BPM must be positive');
      expect(() => composer.setBPM(-10)).toThrow('BPM must be positive');
    });
  });

  describe('validateFiniteLoop', () => {
    it('should validate that song has finite loop with patterns', () => {
      // Arrange
      composer.addPattern(new PatternEntry('pattern-1', 1));
      composer.setRepeatCount(2);
      
      // Act
      const isValid = composer.validateFiniteLoop();
      
      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false when song has no patterns', () => {
      // Arrange
      composer.setRepeatCount(1);
      
      // Act
      const isValid = composer.validateFiniteLoop();
      
      // Assert
      expect(isValid).toBe(false);
    });

    it('should validate with default repeat count of 1', () => {
      // Arrange
      composer.addPattern(new PatternEntry('pattern-1', 1));
      
      // Act
      const isValid = composer.validateFiniteLoop();
      
      // Assert
      expect(isValid).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all patterns from song', () => {
      // Arrange
      composer.addPattern(new PatternEntry('pattern-1', 1));
      composer.addPattern(new PatternEntry('pattern-2', 1));
      
      // Act
      composer.clear();
      
      // Assert
      const updatedSong = composer.getSong();
      expect(updatedSong.patternSequence.length).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true when song has no patterns', () => {
      // Act
      const isEmpty = composer.isEmpty();
      
      // Assert
      expect(isEmpty).toBe(true);
    });

    it('should return false when song has patterns', () => {
      // Arrange
      composer.addPattern(new PatternEntry('pattern-1', 1));
      
      // Act
      const isEmpty = composer.isEmpty();
      
      // Assert
      expect(isEmpty).toBe(false);
    });
  });
});
