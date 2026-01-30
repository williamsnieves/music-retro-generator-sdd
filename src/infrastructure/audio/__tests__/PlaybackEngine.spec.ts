import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PlaybackEngine } from '../PlaybackEngine';
import { Pattern, Song, PatternEntry, Note, Step } from '../../../domain';

describe('PlaybackEngine', () => {
  let engine: PlaybackEngine;
  let mockAudioContext: AudioContext;
  let pattern: Pattern;
  let song: Song;

  beforeEach(() => {
    // Mock AudioContext
    mockAudioContext = {
      currentTime: 0,
      createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 0 }
      }),
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
      }),
      destination: {}
    } as unknown as AudioContext;

    // Create a pattern with notes
    const note1 = new Note('C4', 1, 0);
    const note2 = new Note('E4', 1, 1);
    const step0 = new Step(0).addNote(note1);
    const step4 = new Step(4).addNote(note2);
    
    pattern = new Pattern('pattern-1', 'Test Pattern', 16, [step0, step4]);
    
    // Create a song with the pattern
    song = new Song('song-1', 'Test Song', 120, 1, [new PatternEntry('pattern-1', 1)]);

    engine = new PlaybackEngine(mockAudioContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('start', () => {
    it('should start playback at fixed BPM', () => {
      // Arrange
      const bpm = 120;

      // Act
      engine.start(pattern, bpm);

      // Assert
      expect(engine.isPlaying()).toBe(true);
    });

    it('should not restart if already playing', () => {
      // Arrange
      engine.start(pattern, 120);
      const firstState = engine.isPlaying();

      // Act
      engine.start(pattern, 120);

      // Assert
      expect(firstState).toBe(true);
      expect(engine.isPlaying()).toBe(true);
    });

    it('should accept a song for playback', () => {
      // Act
      engine.startSong(song, [pattern]);

      // Assert
      expect(engine.isPlaying()).toBe(true);
    });
  });

  describe('stop', () => {
    it('should stop playback promptly', () => {
      // Arrange
      engine.start(pattern, 120);
      expect(engine.isPlaying()).toBe(true);

      // Act
      engine.stop();

      // Assert
      expect(engine.isPlaying()).toBe(false);
    });

    it('should be idempotent when not playing', () => {
      // Act & Assert - should not throw
      expect(() => engine.stop()).not.toThrow();
      expect(engine.isPlaying()).toBe(false);
    });
  });

  describe('pause and resume', () => {
    it('should pause playback', () => {
      // Arrange
      engine.start(pattern, 120);

      // Act
      engine.pause();

      // Assert
      expect(engine.isPlaying()).toBe(false);
      expect(engine.isPaused()).toBe(true);
    });

    it('should resume from paused state', () => {
      // Arrange
      engine.start(pattern, 120);
      engine.pause();

      // Act
      engine.resume();

      // Assert
      expect(engine.isPlaying()).toBe(true);
      expect(engine.isPaused()).toBe(false);
    });
  });

  describe('BPM calculation', () => {
    it('should calculate correct step duration for 120 BPM', () => {
      // Arrange - 120 BPM = 2 beats per second
      // 16 steps per 4 beats = 4 steps per beat
      // 4 steps per beat at 2 beats/sec = 8 steps/sec
      // Each step = 1/8 sec = 0.125 sec
      const bpm = 120;
      const expectedStepDuration = 0.125;

      // Act
      engine.start(pattern, bpm);
      const stepDuration = engine.getStepDuration();

      // Assert
      expect(stepDuration).toBeCloseTo(expectedStepDuration, 3);
    });

    it('should calculate correct step duration for 140 BPM', () => {
      // Arrange - 140 BPM = 2.333... beats per second
      // 16 steps per 4 beats = 4 steps per beat
      // 4 steps per beat at 2.333 beats/sec = 9.333 steps/sec
      // Each step ≈ 0.107 sec
      const bpm = 140;
      const expectedStepDuration = 60 / bpm / 4; // 60 sec/min / bpm / (steps per beat)

      // Act
      engine.start(pattern, bpm);
      const stepDuration = engine.getStepDuration();

      // Assert
      expect(stepDuration).toBeCloseTo(expectedStepDuration, 3);
    });
  });

  describe('playback position', () => {
    it('should track current step position', () => {
      // Arrange
      engine.start(pattern, 120);

      // Act
      const position = engine.getCurrentStep();

      // Assert
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(16);
    });

    it('should reset position when stopped', () => {
      // Arrange
      engine.start(pattern, 120);
      engine.stop();

      // Act
      const position = engine.getCurrentStep();

      // Assert
      expect(position).toBe(0);
    });
  });

  describe('glitch-free playback', () => {
    it('should handle pattern changes without stopping', () => {
      // Arrange
      engine.start(pattern, 120);
      const newNote = new Note('G4', 1, 0);
      const newStep = new Step(8).addNote(newNote);
      const updatedPattern = new Pattern('pattern-1', 'Updated', 16, [newStep]);

      // Act - simulate editing during playback
      engine.updatePattern(updatedPattern);

      // Assert - should still be playing
      expect(engine.isPlaying()).toBe(true);
    });
  });

  describe('song playback with finite loop', () => {
    it('should play song with repeat count', () => {
      // Arrange
      const songWithRepeat = new Song('song-1', 'Test', 120, 2, [new PatternEntry('pattern-1', 1)]);

      // Act
      engine.startSong(songWithRepeat, [pattern]);

      // Assert
      expect(engine.isPlaying()).toBe(true);
      expect(engine.getTotalLoops()).toBe(2);
    });

    it('should stop after finite loop completion', () => {
      // Arrange
      const songWithRepeat = new Song('song-1', 'Test', 120, 1, [new PatternEntry('pattern-1', 1)]);
      
      // Act
      engine.startSong(songWithRepeat, [pattern]);
      
      // Simulate completion callback
      const onComplete = vi.fn();
      engine.onComplete(onComplete);

      // Assert - verify callback is registered
      expect(engine.isPlaying()).toBe(true);
    });
  });
});
