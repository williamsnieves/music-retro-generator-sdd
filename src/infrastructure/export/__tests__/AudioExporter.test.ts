import { describe, it, expect, beforeEach } from 'vitest'
import { AudioExporter } from '../AudioExporter'
import type { Song, Pattern, Channel, AudioExportOptions } from '@/domain/models/types'

describe('AudioExporter', () => {
  let exporter: AudioExporter

  beforeEach(() => {
    // Arrange
    exporter = new AudioExporter()
  })

  describe('export', () => {
    it('should export a song to WAV format', async () => {
      // Arrange
      const song = createTestSong()
      const options: AudioExportOptions = {
        sampleRate: 44100,
        bitDepth: 16,
        audioChannels: 2,
      }

      // Act
      const result = await exporter.export(song, options)

      // Assert
      expect(result).toBeDefined()
      expect(result.data).toBeInstanceOf(ArrayBuffer)
      expect(result.duration).toBeGreaterThan(0)
      expect(result.size).toBeGreaterThan(0)
    })

    it('should generate valid WAV header', async () => {
      // Arrange
      const song = createTestSong()
      const options: AudioExportOptions = {
        sampleRate: 44100,
        bitDepth: 16,
        audioChannels: 2,
      }

      // Act
      const result = await exporter.export(song, options)
      const view = new DataView(result.data)

      // Assert - Check WAV header
      // "RIFF" chunk
      expect(String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))).toBe('RIFF')
      // "WAVE" format
      expect(String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11))).toBe('WAVE')
      // "fmt " subchunk
      expect(String.fromCharCode(view.getUint8(12), view.getUint8(13), view.getUint8(14), view.getUint8(15))).toBe('fmt ')
    })

    it('should respect sample rate configuration', async () => {
      // Arrange
      const song = createTestSong()
      const options: AudioExportOptions = {
        sampleRate: 22050,
        bitDepth: 16,
        audioChannels: 1,
      }

      // Act
      const result = await exporter.export(song, options)
      const view = new DataView(result.data)

      // Assert - Sample rate is at byte 24 (little-endian)
      const sampleRate = view.getUint32(24, true)
      expect(sampleRate).toBe(22050)
    })

    it('should export with different bit depths', async () => {
      // Arrange
      const song = createTestSong()

      // Act & Assert - 8-bit
      const result8 = await exporter.export(song, { sampleRate: 44100, bitDepth: 8, audioChannels: 1 })
      expect(result8.data.byteLength).toBeGreaterThan(0)

      // Act & Assert - 16-bit
      const result16 = await exporter.export(song, { sampleRate: 44100, bitDepth: 16, audioChannels: 1 })
      expect(result16.data.byteLength).toBeGreaterThan(result8.data.byteLength)

      // Act & Assert - 24-bit
      const result24 = await exporter.export(song, { sampleRate: 44100, bitDepth: 24, audioChannels: 1 })
      expect(result24.data.byteLength).toBeGreaterThan(result16.data.byteLength)
    })

    it('should calculate correct duration based on BPM and patterns', async () => {
      // Arrange
      const song = createTestSong()
      song.bpm = 120
      song.stepsPerBeat = 4
      // 2 patterns, each with 16 steps = 32 steps total
      // At 120 BPM and 4 steps per beat: 32 steps / 4 = 8 beats
      // 8 beats / 120 BPM * 60 = 4 seconds
      const options: AudioExportOptions = {
        sampleRate: 44100,
        bitDepth: 16,
        audioChannels: 1,
      }

      // Act
      const result = await exporter.export(song, options)

      // Assert
      expect(result.duration).toBeCloseTo(4, 1)
    })
  })

  describe('empty pattern handling', () => {
    it('should handle a song with empty patterns', async () => {
      // Arrange
      const song = createSongWithEmptyPatterns()
      const options: AudioExportOptions = {
        sampleRate: 44100,
        bitDepth: 16,
        audioChannels: 1,
      }

      // Act
      const result = await exporter.export(song, options)

      // Assert
      expect(result).toBeDefined()
      expect(result.data).toBeInstanceOf(ArrayBuffer)
      expect(result.duration).toBeGreaterThan(0)
    })

    it('should generate silence for empty patterns', async () => {
      // Arrange
      const song = createSongWithEmptyPatterns()
      const options: AudioExportOptions = {
        sampleRate: 44100,
        bitDepth: 16,
        audioChannels: 1,
      }

      // Act
      const result = await exporter.export(song, options)
      const view = new DataView(result.data)

      // Assert - Check that audio data exists (WAV header + data)
      // WAV header is 44 bytes, so file should be larger than that
      expect(result.data.byteLength).toBeGreaterThan(44)
    })

    it('should handle mixed empty and filled patterns', async () => {
      // Arrange
      const song = createSongWithMixedPatterns()
      const options: AudioExportOptions = {
        sampleRate: 44100,
        bitDepth: 16,
        audioChannels: 1,
      }

      // Act
      const result = await exporter.export(song, options)

      // Assert
      expect(result).toBeDefined()
      expect(result.duration).toBeGreaterThan(0)
    })
  })

  describe('mono and stereo export', () => {
    it('should export mono audio', async () => {
      // Arrange
      const song = createTestSong()
      const options: AudioExportOptions = {
        sampleRate: 44100,
        bitDepth: 16,
        audioChannels: 1,
      }

      // Act
      const result = await exporter.export(song, options)
      const view = new DataView(result.data)

      // Assert - Number of channels is at byte 22 (little-endian)
      const numChannels = view.getUint16(22, true)
      expect(numChannels).toBe(1)
    })

    it('should export stereo audio', async () => {
      // Arrange
      const song = createTestSong()
      const options: AudioExportOptions = {
        sampleRate: 44100,
        bitDepth: 16,
        audioChannels: 2,
      }

      // Act
      const result = await exporter.export(song, options)
      const view = new DataView(result.data)

      // Assert - Number of channels is at byte 22 (little-endian)
      const numChannels = view.getUint16(22, true)
      expect(numChannels).toBe(2)
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
