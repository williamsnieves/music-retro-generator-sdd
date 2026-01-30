import { Pattern, Song, Note } from '../../domain';

type PlaybackState = 'stopped' | 'playing' | 'paused';

/**
 * PlaybackEngine coordinates real-time pattern and song playback.
 * 
 * Responsibilities:
 * - Schedule notes with precise timing based on BPM
 * - Maintain glitch-free playback during pattern updates
 * - Handle start/stop/pause/resume operations
 * - Support finite loop playback for songs
 * 
 * Uses Web Audio API for precise scheduling.
 * Follows Single Responsibility Principle - handles only playback coordination.
 */
export class PlaybackEngine {
  private readonly audioContext: AudioContext;
  private state: PlaybackState = 'stopped';
  private currentPattern: Pattern | null = null;
  private currentSong: Song | null = null;
  private patternMap: Map<string, Pattern> = new Map();
  private bpm: number = 120;
  private currentStep: number = 0;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private scheduleInterval: number | null = null;
  private totalLoops: number = 1;
  private currentLoop: number = 0;
  private onCompleteCallback: (() => void) | null = null;

  // Scheduling constants
  private readonly SCHEDULE_AHEAD_TIME = 0.1; // Schedule 100ms ahead
  private readonly SCHEDULE_INTERVAL = 25; // Check every 25ms

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Start playback of a pattern at the specified BPM.
   */
  start(pattern: Pattern, bpm: number): void {
    if (this.state === 'playing') {
      return; // Already playing
    }

    this.currentPattern = pattern;
    this.bpm = bpm;
    this.currentStep = 0;
    this.currentLoop = 0;
    this.totalLoops = 1;
    this.startTime = this.audioContext.currentTime;
    this.state = 'playing';

    this.schedulePlayback();
  }

  /**
   * Start playback of a song with pattern references.
   */
  startSong(song: Song, patterns: Pattern[]): void {
    if (this.state === 'playing') {
      return;
    }

    this.currentSong = song;
    this.bpm = song.bpm;
    this.totalLoops = song.repeatCount;
    this.currentLoop = 0;
    this.currentStep = 0;
    this.startTime = this.audioContext.currentTime;
    this.state = 'playing';

    // Build pattern map for quick lookup
    this.patternMap.clear();
    patterns.forEach(p => this.patternMap.set(p.id, p));

    // Start with first pattern
    if (song.patternSequence.length > 0) {
      const firstPatternId = song.patternSequence[0].patternId;
      this.currentPattern = this.patternMap.get(firstPatternId) || null;
    }

    this.schedulePlayback();
  }

  /**
   * Stop playback promptly and reset position.
   */
  stop(): void {
    if (this.scheduleInterval !== null) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }

    this.state = 'stopped';
    this.currentStep = 0;
    this.currentLoop = 0;
    this.currentPattern = null;
    this.currentSong = null;
    this.patternMap.clear();
  }

  /**
   * Pause playback at current position.
   */
  pause(): void {
    if (this.state !== 'playing') {
      return;
    }

    if (this.scheduleInterval !== null) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }

    this.pauseTime = this.audioContext.currentTime;
    this.state = 'paused';
  }

  /**
   * Resume playback from paused position.
   */
  resume(): void {
    if (this.state !== 'paused') {
      return;
    }

    // Adjust start time to account for pause duration
    const pauseDuration = this.audioContext.currentTime - this.pauseTime;
    this.startTime += pauseDuration;
    this.state = 'playing';

    this.schedulePlayback();
  }

  /**
   * Update the current pattern without stopping playback.
   * Allows glitch-free editing during playback.
   */
  updatePattern(pattern: Pattern): void {
    this.currentPattern = pattern;
    
    // Update in pattern map if playing a song
    if (this.currentSong && this.patternMap.has(pattern.id)) {
      this.patternMap.set(pattern.id, pattern);
    }
  }

  /**
   * Register a callback to be invoked when song playback completes.
   */
  onComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  /**
   * Check if engine is currently playing.
   */
  isPlaying(): boolean {
    return this.state === 'playing';
  }

  /**
   * Check if engine is paused.
   */
  isPaused(): boolean {
    return this.state === 'paused';
  }

  /**
   * Get current step position in the pattern.
   */
  getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * Get the duration of one step in seconds based on current BPM.
   * Assumes 16 steps per 4 beats (standard tracker pattern).
   */
  getStepDuration(): number {
    // 60 seconds per minute / BPM = seconds per beat
    // Divide by 4 to get seconds per step (16 steps = 4 beats)
    return (60 / this.bpm) / 4;
  }

  /**
   * Get total number of loops for current song.
   */
  getTotalLoops(): number {
    return this.totalLoops;
  }

  /**
   * Schedule playback using Web Audio API for precise timing.
   */
  private schedulePlayback(): void {
    if (this.scheduleInterval !== null) {
      return; // Already scheduling
    }

    this.scheduleInterval = setInterval(() => {
      if (this.state !== 'playing' || !this.currentPattern) {
        return;
      }

      this.scheduleNotes();
    }, this.SCHEDULE_INTERVAL) as unknown as number;

    // Schedule initial notes
    this.scheduleNotes();
  }

  /**
   * Schedule notes that fall within the scheduling window.
   */
  private scheduleNotes(): void {
    if (!this.currentPattern) {
      return;
    }

    const stepDuration = this.getStepDuration();
    const currentTime = this.audioContext.currentTime;
    const scheduleUntil = currentTime + this.SCHEDULE_AHEAD_TIME;

    while (this.getNextNoteTime() < scheduleUntil) {
      const noteTime = this.getNextNoteTime();
      
      // Get step and trigger notes
      const step = this.currentPattern.getStep(this.currentStep);
      if (!step.isEmpty()) {
        step.notes.forEach(note => {
          this.playNote(note, noteTime);
        });
      }

      // Advance to next step
      this.currentStep++;

      // Check for pattern/song boundaries
      if (this.currentStep >= this.currentPattern.stepCount) {
        this.currentStep = 0;
        
        if (this.currentSong) {
          this.handleSongAdvance();
        } else {
          // Single pattern loops indefinitely until stopped
          this.currentLoop++;
        }
      }
    }
  }

  /**
   * Calculate the scheduled time for the next note.
   */
  private getNextNoteTime(): number {
    const stepDuration = this.getStepDuration();
    return this.startTime + (this.currentStep * stepDuration);
  }

  /**
   * Handle advancing through song pattern sequence.
   */
  private handleSongAdvance(): void {
    if (!this.currentSong) {
      return;
    }

    this.currentLoop++;

    // Check if song is complete
    if (this.currentLoop >= this.totalLoops) {
      this.stop();
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }
  }

  /**
   * Play a note using the audio context.
   * This is a placeholder - actual synthesis should be handled by Synthesizer.
   */
  private playNote(note: Note, startTime: number): void {
    // In a full implementation, this would delegate to the Synthesizer
    // For now, create a simple oscillator as proof of concept
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Simple note frequency mapping (placeholder)
    oscillator.frequency.value = this.noteToFrequency(note.pitch);
    gainNode.gain.value = 0.1;

    const duration = note.duration * this.getStepDuration();
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * Convert note pitch to frequency (placeholder implementation).
   */
  private noteToFrequency(pitch: string): number {
    // Simplified pitch to frequency mapping
    const noteMap: Record<string, number> = {
      'C4': 261.63,
      'D4': 293.66,
      'E4': 329.63,
      'F4': 349.23,
      'G4': 392.00,
      'A4': 440.00,
      'B4': 493.88
    };

    return noteMap[pitch] || 440;
  }
}
