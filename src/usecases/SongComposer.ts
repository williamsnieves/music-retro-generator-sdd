import { Song, PatternEntry } from '../domain';

/**
 * SongComposer provides operations to compose songs from patterns.
 * It manages pattern ordering, repeat counts, and validates finite loops.
 */
export class SongComposer {
  private currentSong: Song;

  constructor(song: Song) {
    this.currentSong = song;
  }

  /**
   * Add a pattern entry to the end of the sequence.
   */
  addPattern(entry: PatternEntry): void {
    const newSequence = [...this.currentSong.patternSequence, entry];
    this.currentSong = new Song(
      this.currentSong.id,
      this.currentSong.name,
      this.currentSong.bpm,
      this.currentSong.repeatCount,
      newSequence
    );
  }

  /**
   * Insert a pattern entry at a specific position.
   * @throws {Error} if position is out of bounds
   */
  insertPattern(position: number, entry: PatternEntry): void {
    if (position < 0 || position > this.currentSong.patternSequence.length) {
      throw new Error(`Position ${position} is out of bounds`);
    }

    const newSequence = [...this.currentSong.patternSequence];
    newSequence.splice(position, 0, entry);
    
    this.currentSong = new Song(
      this.currentSong.id,
      this.currentSong.name,
      this.currentSong.bpm,
      this.currentSong.repeatCount,
      newSequence
    );
  }

  /**
   * Remove a pattern entry at a specific position.
   * @throws {Error} if position is out of bounds
   */
  removePattern(position: number): void {
    if (position < 0 || position >= this.currentSong.patternSequence.length) {
      throw new Error(`Position ${position} is out of bounds`);
    }

    const newSequence = [...this.currentSong.patternSequence];
    newSequence.splice(position, 1);
    
    this.currentSong = new Song(
      this.currentSong.id,
      this.currentSong.name,
      this.currentSong.bpm,
      this.currentSong.repeatCount,
      newSequence
    );
  }

  /**
   * Move a pattern from one position to another.
   * @throws {Error} if any position is out of bounds
   */
  movePattern(fromPosition: number, toPosition: number): void {
    if (fromPosition < 0 || fromPosition >= this.currentSong.patternSequence.length) {
      throw new Error(`From position ${fromPosition} is out of bounds`);
    }
    if (toPosition < 0 || toPosition >= this.currentSong.patternSequence.length) {
      throw new Error(`To position ${toPosition} is out of bounds`);
    }

    const newSequence = [...this.currentSong.patternSequence];
    const [movedEntry] = newSequence.splice(fromPosition, 1);
    newSequence.splice(toPosition, 0, movedEntry);
    
    this.currentSong = new Song(
      this.currentSong.id,
      this.currentSong.name,
      this.currentSong.bpm,
      this.currentSong.repeatCount,
      newSequence
    );
  }

  /**
   * Set the number of times the song repeats.
   * @throws {Error} if repeat count is not positive
   */
  setRepeatCount(repeatCount: number): void {
    if (repeatCount <= 0) {
      throw new Error('Repeat count must be positive');
    }

    this.currentSong = new Song(
      this.currentSong.id,
      this.currentSong.name,
      this.currentSong.bpm,
      repeatCount,
      [...this.currentSong.patternSequence]
    );
  }

  /**
   * Set the song's BPM.
   * @throws {Error} if BPM is not positive
   */
  setBPM(bpm: number): void {
    if (bpm <= 0) {
      throw new Error('BPM must be positive');
    }

    this.currentSong = new Song(
      this.currentSong.id,
      this.currentSong.name,
      bpm,
      this.currentSong.repeatCount,
      [...this.currentSong.patternSequence]
    );
  }

  /**
   * Validate that the song has a finite loop.
   * A song has a finite loop if:
   * - It has at least one pattern
   * - It has a positive, finite repeat count
   */
  validateFiniteLoop(): boolean {
    return (
      this.currentSong.patternSequence.length > 0 &&
      this.currentSong.repeatCount > 0 &&
      isFinite(this.currentSong.repeatCount)
    );
  }

  /**
   * Clear all patterns from the song.
   */
  clear(): void {
    this.currentSong = new Song(
      this.currentSong.id,
      this.currentSong.name,
      this.currentSong.bpm,
      this.currentSong.repeatCount,
      []
    );
  }

  /**
   * Check if the song has no patterns.
   */
  isEmpty(): boolean {
    return this.currentSong.patternSequence.length === 0;
  }

  /**
   * Get the current song.
   */
  getSong(): Song {
    return this.currentSong;
  }
}
