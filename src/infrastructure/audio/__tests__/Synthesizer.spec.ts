import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { Synthesizer } from '../Synthesizer'
import type { Note, WaveformType } from '@/domain/types/audio'

/**
 * Mock Web Audio API
 */
function createMockAudioContext() {
  const mockGainNode = {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  const mockOscillator = {
    type: 'square' as OscillatorType,
    frequency: {
      value: 440,
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
  }

  const mockDestination = {}

  return {
    currentTime: 0,
    destination: mockDestination,
    createOscillator: vi.fn(() => ({ ...mockOscillator })),
    createGain: vi.fn(() => ({
      ...mockGainNode,
      gain: { ...mockGainNode.gain },
    })),
    _mockOscillator: mockOscillator,
    _mockGainNode: mockGainNode,
  }
}

describe('Synthesizer', () => {
  let audioContext: ReturnType<typeof createMockAudioContext>
  let synthesizer: Synthesizer
  let mockMixerConnect: Mock

  beforeEach(() => {
    audioContext = createMockAudioContext()
    mockMixerConnect = vi.fn()
    synthesizer = new Synthesizer(
      audioContext as unknown as AudioContext,
      mockMixerConnect,
      { waveform: 'square', attack: 0.01, release: 0.1 }
    )
  })

  describe('playNote', () => {
    it('should create oscillator and gain nodes when playing a note', () => {
      // Arrange
      const note: Note = { pitch: 60, duration: 0.5, volume: 0.8 }
      const channelIndex = 0
      const startTime = 0

      // Act
      synthesizer.playNote(channelIndex, note, startTime)

      // Assert
      expect(audioContext.createOscillator).toHaveBeenCalled()
      expect(audioContext.createGain).toHaveBeenCalled()
    })

    it('should set correct frequency for MIDI note 60 (middle C)', () => {
      // Arrange
      const note: Note = { pitch: 60, duration: 0.5, volume: 0.8 }
      const expectedFrequency = 261.63 // Middle C frequency

      // Act
      synthesizer.playNote(0, note, 0)

      // Assert
      const oscillator = (audioContext.createOscillator as Mock).mock.results[0]?.value
      expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        expect.closeTo(expectedFrequency, 0.01),
        0
      )
    })

    it('should set correct frequency for MIDI note 69 (A4)', () => {
      // Arrange
      const note: Note = { pitch: 69, duration: 0.5, volume: 0.8 }
      const expectedFrequency = 440 // A4 = 440Hz

      // Act
      synthesizer.playNote(0, note, 0)

      // Assert
      const oscillator = (audioContext.createOscillator as Mock).mock.results[0]?.value
      expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        expect.closeTo(expectedFrequency, 0.01),
        0
      )
    })

    it('should apply volume envelope with attack', () => {
      // Arrange
      const note: Note = { pitch: 60, duration: 0.5, volume: 0.8 }
      const startTime = 1.0

      // Act
      synthesizer.playNote(0, note, startTime)

      // Assert
      const gainNode = (audioContext.createGain as Mock).mock.results[0]?.value
      expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, startTime)
      expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.8, // volume
        startTime + 0.01 // attack time
      )
    })

    it('should apply release envelope before stop', () => {
      // Arrange
      const note: Note = { pitch: 60, duration: 0.5, volume: 0.8 }
      const startTime = 1.0
      const releaseTime = 0.1

      // Act
      synthesizer.playNote(0, note, startTime)

      // Assert
      const gainNode = (audioContext.createGain as Mock).mock.results[0]?.value
      const endTime = startTime + note.duration
      expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, endTime + releaseTime)
    })

    it('should connect gain to mixer via callback', () => {
      // Arrange
      const note: Note = { pitch: 60, duration: 0.5, volume: 0.8 }

      // Act
      synthesizer.playNote(0, note, 0)

      // Assert
      expect(mockMixerConnect).toHaveBeenCalledWith(0, expect.any(Object))
    })

    it('should start oscillator at specified time', () => {
      // Arrange
      const note: Note = { pitch: 60, duration: 0.5, volume: 0.8 }
      const startTime = 2.5

      // Act
      synthesizer.playNote(0, note, startTime)

      // Assert
      const oscillator = (audioContext.createOscillator as Mock).mock.results[0]?.value
      expect(oscillator.start).toHaveBeenCalledWith(startTime)
    })

    it('should schedule oscillator stop after duration plus release', () => {
      // Arrange
      const note: Note = { pitch: 60, duration: 0.5, volume: 0.8 }
      const startTime = 1.0
      const releaseTime = 0.1

      // Act
      synthesizer.playNote(0, note, startTime)

      // Assert
      const oscillator = (audioContext.createOscillator as Mock).mock.results[0]?.value
      expect(oscillator.stop).toHaveBeenCalledWith(startTime + note.duration + releaseTime)
    })
  })

  describe('setWaveform', () => {
    it.each<[WaveformType, OscillatorType]>([
      ['square', 'square'],
      ['triangle', 'triangle'],
      ['sawtooth', 'sawtooth'],
    ])('should set %s waveform for channel', (waveformType, expectedOscType) => {
      // Arrange
      synthesizer.setWaveform(0, waveformType)
      const note: Note = { pitch: 60, duration: 0.5, volume: 0.8 }

      // Act
      synthesizer.playNote(0, note, 0)

      // Assert
      const oscillator = (audioContext.createOscillator as Mock).mock.results[0]?.value
      expect(oscillator.type).toBe(expectedOscType)
    })

    it('should allow different waveforms per channel', () => {
      // Arrange
      synthesizer.setWaveform(0, 'square')
      synthesizer.setWaveform(1, 'triangle')
      const note: Note = { pitch: 60, duration: 0.5, volume: 0.8 }

      // Act
      synthesizer.playNote(0, note, 0)
      synthesizer.playNote(1, note, 0)

      // Assert
      const oscillator0 = (audioContext.createOscillator as Mock).mock.results[0]?.value
      const oscillator1 = (audioContext.createOscillator as Mock).mock.results[1]?.value
      expect(oscillator0.type).toBe('square')
      expect(oscillator1.type).toBe('triangle')
    })
  })

  describe('stopChannel', () => {
    it('should stop all voices on a channel', () => {
      // Arrange
      const note: Note = { pitch: 60, duration: 1.0, volume: 0.8 }
      synthesizer.playNote(0, note, 0)

      // Act
      synthesizer.stopChannel(0)

      // Assert
      const oscillator = (audioContext.createOscillator as Mock).mock.results[0]?.value
      expect(oscillator.stop).toHaveBeenCalled()
    })
  })

  describe('stopAll', () => {
    it('should stop all voices on all channels', () => {
      // Arrange
      const note: Note = { pitch: 60, duration: 1.0, volume: 0.8 }
      synthesizer.playNote(0, note, 0)
      synthesizer.playNote(1, note, 0)

      // Act
      synthesizer.stopAll()

      // Assert
      const oscillator0 = (audioContext.createOscillator as Mock).mock.results[0]?.value
      const oscillator1 = (audioContext.createOscillator as Mock).mock.results[1]?.value
      expect(oscillator0.stop).toHaveBeenCalled()
      expect(oscillator1.stop).toHaveBeenCalled()
    })
  })

  describe('MIDI to frequency conversion', () => {
    it.each([
      [21, 27.5],     // A0
      [60, 261.63],   // C4 (Middle C)
      [69, 440],      // A4
      [108, 4186.01], // C8
    ])('should convert MIDI note %i to frequency %f Hz', (midiNote, expectedFreq) => {
      // Arrange
      const note: Note = { pitch: midiNote, duration: 0.5, volume: 0.8 }

      // Act
      synthesizer.playNote(0, note, 0)

      // Assert
      const oscillator = (audioContext.createOscillator as Mock).mock.results[0]?.value
      expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        expect.closeTo(expectedFreq, 0.1),
        0
      )
    })
  })
})
