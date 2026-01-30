import { describe, it, expect, beforeEach } from 'vitest'
import { SongDataExporter } from '../SongDataExporter'
import type { Song, Pattern, Channel } from '@/domain/models/types'

describe('SongDataExporter', () => {
  let exporter: SongDataExporter

  beforeEach(() => {
    // Arrange
    exporter = new SongDataExporter()
  })

  describe('export', () => {
    it('should export song data to JSON format', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)

      // Assert
      expect(result).toBeDefined()
      expect(typeof result.data).toBe('string')
      expect(result.size).toBeGreaterThan(0)
    })

    it('should include all required fields in exported JSON', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      expect(parsed.title).toBe('Test Song')
      expect(parsed.bpm).toBe(120)
      expect(parsed.patterns).toBeDefined()
      expect(parsed.patternOrder).toBeDefined()
      expect(parsed.channelCount).toBe(2)
      expect(parsed.stepsPerBeat).toBe(4)
    })

    it('should export pattern data correctly', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      expect(parsed.patterns).toHaveLength(2)
      expect(parsed.patterns[0].id).toBe('p1')
      expect(parsed.patterns[0].name).toBe('Pattern 1')
      expect(parsed.patterns[0].stepsCount).toBe(16)
      expect(parsed.patterns[0].channels).toHaveLength(2)
    })

    it('should export pattern order correctly', () => {
      // Arrange
      const song = createTestSong()
      song.patternOrder = ['p2', 'p1', 'p2', 'p1']

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      expect(parsed.patternOrder).toEqual(['p2', 'p1', 'p2', 'p1'])
    })

    it('should export BPM correctly', () => {
      // Arrange
      const song = createTestSong()
      song.bpm = 180

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      expect(parsed.bpm).toBe(180)
    })

    it('should export channel waveforms', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      expect(parsed.patterns[0].channels[0].waveform).toBe('square')
      expect(parsed.patterns[0].channels[1].waveform).toBe('triangle')
    })

    it('should export step notes with all properties', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      const firstNote = parsed.patterns[0].channels[0].steps[0].note
      expect(firstNote).not.toBeNull()
      expect(firstNote.pitch).toBe(60)
      expect(firstNote.duration).toBe(1)
      expect(firstNote.volume).toBe(0.8)
    })

    it('should export null notes for empty steps', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      // Second step should be empty (null note)
      const secondNote = parsed.patterns[0].channels[0].steps[1].note
      expect(secondNote).toBeNull()
    })

    it('should produce valid JSON', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)

      // Assert
      expect(() => JSON.parse(result.data)).not.toThrow()
    })

    it('should calculate size correctly', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)

      // Assert
      const encoder = new TextEncoder()
      const expectedSize = encoder.encode(result.data).length
      expect(result.size).toBe(expectedSize)
    })
  })

  describe('empty pattern handling', () => {
    it('should export a song with empty patterns', () => {
      // Arrange
      const song = createSongWithEmptyPatterns()

      // Act
      const result = exporter.export(song)

      // Assert
      expect(result).toBeDefined()
      const parsed = JSON.parse(result.data)
      expect(parsed.patterns).toHaveLength(1)
    })

    it('should preserve empty pattern structure', () => {
      // Arrange
      const song = createSongWithEmptyPatterns()

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      const pattern = parsed.patterns[0]
      expect(pattern.channels).toHaveLength(2)
      expect(pattern.stepsCount).toBe(16)
      // All steps should have null notes
      pattern.channels.forEach((channel: Channel) => {
        channel.steps.forEach((step) => {
          expect(step.note).toBeNull()
        })
      })
    })

    it('should handle mixed empty and filled patterns', () => {
      // Arrange
      const song = createSongWithMixedPatterns()

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      expect(parsed.patterns).toHaveLength(3)
      // First pattern has notes
      expect(parsed.patterns[0].channels[0].steps[0].note).not.toBeNull()
      // Second pattern is empty
      expect(parsed.patterns[1].channels[0].steps[0].note).toBeNull()
      // Third pattern has notes
      expect(parsed.patterns[2].channels[0].steps[0].note).not.toBeNull()
    })
  })

  describe('export format', () => {
    it('should include version metadata', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      expect(parsed.version).toBeDefined()
      expect(parsed.version).toBe('1.0')
    })

    it('should include export timestamp', () => {
      // Arrange
      const song = createTestSong()

      // Act
      const result = exporter.export(song)
      const parsed = JSON.parse(result.data)

      // Assert
      expect(parsed.exportedAt).toBeDefined()
      expect(new Date(parsed.exportedAt).getTime()).toBeLessThanOrEqual(Date.now())
    })
  })
})

// Test helpers

function createTestSong(): Song {
  return {
    title: 'Test Song',
    bpm: 120,
    channelCount: 2,
    stepsPerBeat: 4,
    patterns: [
      createPattern('p1', 'Pattern 1', 16),
      createPattern('p2', 'Pattern 2', 16),
    ],
    patternOrder: ['p1', 'p2'],
  }
}

function createPattern(id: string, name: string, stepsCount: number): Pattern {
  const channels: Channel[] = [
    {
      waveform: 'square',
      steps: Array.from({ length: stepsCount }, (_, i) => ({
        note: i % 4 === 0 ? { pitch: 60, duration: 1, volume: 0.8 } : null,
      })),
    },
    {
      waveform: 'triangle',
      steps: Array.from({ length: stepsCount }, (_, i) => ({
        note: i % 8 === 0 ? { pitch: 48, duration: 2, volume: 0.6 } : null,
      })),
    },
  ]

  return { id, name, channels, stepsCount }
}

function createEmptyChannel(stepsCount: number): Channel {
  return {
    waveform: 'square',
    steps: Array.from({ length: stepsCount }, () => ({ note: null })),
  }
}

function createEmptyPattern(id: string, stepsCount: number): Pattern {
  return {
    id,
    name: `Empty Pattern ${id}`,
    channels: [createEmptyChannel(stepsCount), createEmptyChannel(stepsCount)],
    stepsCount,
  }
}

function createSongWithEmptyPatterns(): Song {
  return {
    title: 'Empty Song',
    bpm: 120,
    channelCount: 2,
    stepsPerBeat: 4,
    patterns: [createEmptyPattern('p1', 16)],
    patternOrder: ['p1'],
  }
}

function createSongWithMixedPatterns(): Song {
  return {
    title: 'Mixed Song',
    bpm: 120,
    channelCount: 2,
    stepsPerBeat: 4,
    patterns: [
      createPattern('p1', 'Pattern 1', 16),
      createEmptyPattern('p2', 16),
      createPattern('p3', 'Pattern 3', 16),
    ],
    patternOrder: ['p1', 'p2', 'p3'],
  }
}
