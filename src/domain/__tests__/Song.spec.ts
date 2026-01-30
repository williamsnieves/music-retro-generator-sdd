import { describe, it, expect } from 'vitest'
import { Song, PatternEntry } from '../Song'
import { Pattern } from '../Pattern'

describe('Song', () => {
  const createTestPattern = (id: string, name: string) => new Pattern(id, name, 16)

  describe('creation', () => {
    it('should create a song with id, name, and BPM', () => {
      // Arrange
      const id = 'song-1'
      const name = 'My Song'
      const bpm = 120

      // Act
      const song = new Song(id, name, bpm)

      // Assert
      expect(song.id).toBe(id)
      expect(song.name).toBe(name)
      expect(song.bpm).toBe(bpm)
    })

    it('should create a song with empty pattern sequence', () => {
      // Arrange & Act
      const song = new Song('s1', 'Test', 120)

      // Assert
      expect(song.patternSequence).toHaveLength(0)
    })

    it('should create a song with default repeat count of 1', () => {
      // Arrange & Act
      const song = new Song('s1', 'Test', 120)

      // Assert
      expect(song.repeatCount).toBe(1)
    })

    it('should create a song with custom repeat count', () => {
      // Arrange & Act
      const song = new Song('s1', 'Test', 120, 3)

      // Assert
      expect(song.repeatCount).toBe(3)
    })
  })

  describe('validation', () => {
    it('should reject empty id', () => {
      // Arrange
      const emptyId = ''

      // Act & Assert
      expect(() => new Song(emptyId, 'Test', 120)).toThrow('Song id cannot be empty')
    })

    it('should reject empty name', () => {
      // Arrange
      const emptyName = ''

      // Act & Assert
      expect(() => new Song('s1', emptyName, 120)).toThrow('Song name cannot be empty')
    })

    it('should reject zero BPM', () => {
      // Arrange
      const zeroBpm = 0

      // Act & Assert
      expect(() => new Song('s1', 'Test', zeroBpm)).toThrow('BPM must be positive')
    })

    it('should reject negative BPM', () => {
      // Arrange
      const negativeBpm = -10

      // Act & Assert
      expect(() => new Song('s1', 'Test', negativeBpm)).toThrow('BPM must be positive')
    })

    it('should reject zero repeat count', () => {
      // Arrange
      const zeroRepeat = 0

      // Act & Assert
      expect(() => new Song('s1', 'Test', 120, zeroRepeat)).toThrow('Repeat count must be positive and finite')
    })

    it('should reject negative repeat count', () => {
      // Arrange
      const negativeRepeat = -1

      // Act & Assert
      expect(() => new Song('s1', 'Test', 120, negativeRepeat)).toThrow('Repeat count must be positive and finite')
    })

    it('should reject infinite repeat count', () => {
      // Arrange
      const infiniteRepeat = Infinity

      // Act & Assert
      expect(() => new Song('s1', 'Test', 120, infiniteRepeat)).toThrow('Repeat count must be positive and finite')
    })
  })

  describe('pattern management', () => {
    it('should add pattern to sequence', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)
      const pattern = createTestPattern('p1', 'Intro')

      // Act
      const newSong = song.addPattern(pattern)

      // Assert
      expect(newSong.patternSequence).toHaveLength(1)
      expect(newSong.patternSequence[0].patternId).toBe('p1')
    })

    it('should add multiple patterns in order', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)
      const pattern1 = createTestPattern('p1', 'Intro')
      const pattern2 = createTestPattern('p2', 'Verse')
      const pattern3 = createTestPattern('p3', 'Chorus')

      // Act
      const newSong = song
        .addPattern(pattern1)
        .addPattern(pattern2)
        .addPattern(pattern3)

      // Assert
      expect(newSong.patternSequence).toHaveLength(3)
      expect(newSong.patternSequence[0].patternId).toBe('p1')
      expect(newSong.patternSequence[1].patternId).toBe('p2')
      expect(newSong.patternSequence[2].patternId).toBe('p3')
    })

    it('should remove pattern from sequence by index', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)
        .addPattern(createTestPattern('p1', 'Intro'))
        .addPattern(createTestPattern('p2', 'Verse'))

      // Act
      const newSong = song.removePatternAt(0)

      // Assert
      expect(newSong.patternSequence).toHaveLength(1)
      expect(newSong.patternSequence[0].patternId).toBe('p2')
    })

    it('should throw error for invalid remove index', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)

      // Act & Assert
      expect(() => song.removePatternAt(0)).toThrow('Index out of bounds')
    })

    it('should insert pattern at specific position', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)
        .addPattern(createTestPattern('p1', 'Intro'))
        .addPattern(createTestPattern('p3', 'Chorus'))

      // Act
      const newSong = song.insertPatternAt(1, createTestPattern('p2', 'Verse'))

      // Assert
      expect(newSong.patternSequence).toHaveLength(3)
      expect(newSong.patternSequence[1].patternId).toBe('p2')
    })

    it('should move pattern in sequence', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)
        .addPattern(createTestPattern('p1', 'Intro'))
        .addPattern(createTestPattern('p2', 'Verse'))
        .addPattern(createTestPattern('p3', 'Chorus'))

      // Act
      const newSong = song.movePattern(2, 0)

      // Assert
      expect(newSong.patternSequence[0].patternId).toBe('p3')
      expect(newSong.patternSequence[1].patternId).toBe('p1')
      expect(newSong.patternSequence[2].patternId).toBe('p2')
    })
  })

  describe('immutability', () => {
    it('should return new song when adding pattern', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)
      const pattern = createTestPattern('p1', 'Intro')

      // Act
      const newSong = song.addPattern(pattern)

      // Assert
      expect(newSong).not.toBe(song)
      expect(song.patternSequence).toHaveLength(0)
    })

    it('should return new song when changing BPM', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)

      // Act
      const newSong = song.withBpm(140)

      // Assert
      expect(newSong).not.toBe(song)
      expect(newSong.bpm).toBe(140)
      expect(song.bpm).toBe(120)
    })

    it('should return new song when changing repeat count', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)

      // Act
      const newSong = song.withRepeatCount(5)

      // Assert
      expect(newSong).not.toBe(song)
      expect(newSong.repeatCount).toBe(5)
      expect(song.repeatCount).toBe(1)
    })

    it('should return new song when renaming', () => {
      // Arrange
      const song = new Song('s1', 'Original', 120)

      // Act
      const newSong = song.withName('Renamed')

      // Assert
      expect(newSong).not.toBe(song)
      expect(newSong.name).toBe('Renamed')
      expect(song.name).toBe('Original')
    })
  })

  describe('song length', () => {
    it('should report empty song as having no patterns', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120)

      // Act & Assert
      expect(song.isEmpty()).toBe(true)
      expect(song.totalPatterns).toBe(0)
    })

    it('should report total patterns including repeats', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120, 3)
        .addPattern(createTestPattern('p1', 'A'))
        .addPattern(createTestPattern('p2', 'B'))

      // Act & Assert
      expect(song.totalPatterns).toBe(2)
      expect(song.totalPatternsWithRepeats).toBe(6)
    })
  })

  describe('defined end requirement', () => {
    it('should always have a finite repeat count', () => {
      // Arrange
      const song = new Song('s1', 'Test', 120, 5)

      // Act & Assert
      expect(Number.isFinite(song.repeatCount)).toBe(true)
      expect(song.hasDefinedEnd()).toBe(true)
    })
  })
})

describe('PatternEntry', () => {
  it('should create entry with pattern id and repeat', () => {
    // Arrange & Act
    const entry = new PatternEntry('p1', 2)

    // Assert
    expect(entry.patternId).toBe('p1')
    expect(entry.repeat).toBe(2)
  })

  it('should default repeat to 1', () => {
    // Arrange & Act
    const entry = new PatternEntry('p1')

    // Assert
    expect(entry.repeat).toBe(1)
  })

  it('should reject empty pattern id', () => {
    // Act & Assert
    expect(() => new PatternEntry('')).toThrow('Pattern id cannot be empty')
  })

  it('should reject zero repeat', () => {
    // Act & Assert
    expect(() => new PatternEntry('p1', 0)).toThrow('Repeat must be positive')
  })

  it('should reject negative repeat', () => {
    // Act & Assert
    expect(() => new PatternEntry('p1', -1)).toThrow('Repeat must be positive')
  })
})
