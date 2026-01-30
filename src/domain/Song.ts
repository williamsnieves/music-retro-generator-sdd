import { Pattern } from './Pattern'

/**
 * Represents an entry in the song's pattern sequence.
 * Stores the pattern id and how many times to repeat it.
 */
export class PatternEntry {
  readonly patternId: string
  readonly repeat: number

  constructor(patternId: string, repeat: number = 1) {
    if (!patternId || patternId.trim() === '') {
      throw new Error('Pattern id cannot be empty')
    }
    if (repeat <= 0) {
      throw new Error('Repeat must be positive')
    }

    this.patternId = patternId
    this.repeat = repeat
  }
}

/**
 * Represents a song composed of patterns in sequence.
 * A song has a BPM and a finite repeat count to prevent infinite loops.
 * Immutable entity following SOLID principles.
 */
export class Song {
  readonly id: string
  readonly name: string
  readonly bpm: number
  readonly repeatCount: number
  readonly patternSequence: readonly PatternEntry[]

  constructor(
    id: string,
    name: string,
    bpm: number,
    repeatCount: number = 1,
    patternSequence: PatternEntry[] = []
  ) {
    if (!id || id.trim() === '') {
      throw new Error('Song id cannot be empty')
    }
    if (!name || name.trim() === '') {
      throw new Error('Song name cannot be empty')
    }
    if (bpm <= 0) {
      throw new Error('BPM must be positive')
    }
    if (repeatCount <= 0 || !Number.isFinite(repeatCount)) {
      throw new Error('Repeat count must be positive and finite')
    }

    this.id = id
    this.name = name
    this.bpm = bpm
    this.repeatCount = repeatCount
    this.patternSequence = Object.freeze([...patternSequence])
  }

  /**
   * Add a pattern to the end of the sequence, returning a new Song.
   */
  addPattern(pattern: Pattern): Song {
    const newSequence = [...this.patternSequence, new PatternEntry(pattern.id)]
    return new Song(this.id, this.name, this.bpm, this.repeatCount, newSequence)
  }

  /**
   * Remove a pattern at a specific index, returning a new Song.
   */
  removePatternAt(index: number): Song {
    if (index < 0 || index >= this.patternSequence.length) {
      throw new Error('Index out of bounds')
    }

    const newSequence = [...this.patternSequence]
    newSequence.splice(index, 1)
    return new Song(this.id, this.name, this.bpm, this.repeatCount, newSequence)
  }

  /**
   * Insert a pattern at a specific position, returning a new Song.
   */
  insertPatternAt(index: number, pattern: Pattern): Song {
    const newSequence = [...this.patternSequence]
    newSequence.splice(index, 0, new PatternEntry(pattern.id))
    return new Song(this.id, this.name, this.bpm, this.repeatCount, newSequence)
  }

  /**
   * Move a pattern from one position to another, returning a new Song.
   */
  movePattern(fromIndex: number, toIndex: number): Song {
    if (
      fromIndex < 0 ||
      fromIndex >= this.patternSequence.length ||
      toIndex < 0 ||
      toIndex >= this.patternSequence.length
    ) {
      throw new Error('Index out of bounds')
    }

    const newSequence = [...this.patternSequence]
    const [moved] = newSequence.splice(fromIndex, 1)
    newSequence.splice(toIndex, 0, moved)
    return new Song(this.id, this.name, this.bpm, this.repeatCount, newSequence)
  }

  /**
   * Check if the song has no patterns.
   */
  isEmpty(): boolean {
    return this.patternSequence.length === 0
  }

  /**
   * Get the total number of unique patterns in the sequence.
   */
  get totalPatterns(): number {
    return this.patternSequence.length
  }

  /**
   * Get the total number of patterns considering song repeat.
   */
  get totalPatternsWithRepeats(): number {
    return this.patternSequence.length * this.repeatCount
  }

  /**
   * Check if the song has a defined end (finite repeat count).
   */
  hasDefinedEnd(): boolean {
    return Number.isFinite(this.repeatCount) && this.repeatCount > 0
  }

  /**
   * Create a new song with a different BPM.
   */
  withBpm(newBpm: number): Song {
    return new Song(this.id, this.name, newBpm, this.repeatCount, [...this.patternSequence])
  }

  /**
   * Create a new song with a different repeat count.
   */
  withRepeatCount(newRepeatCount: number): Song {
    return new Song(this.id, this.name, this.bpm, newRepeatCount, [...this.patternSequence])
  }

  /**
   * Create a new song with a different name.
   */
  withName(newName: string): Song {
    return new Song(this.id, newName, this.bpm, this.repeatCount, [...this.patternSequence])
  }
}
