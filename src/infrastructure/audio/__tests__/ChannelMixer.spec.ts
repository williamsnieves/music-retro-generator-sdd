import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChannelMixer } from '../ChannelMixer'
import type { MixerConfig } from '@/domain/types/audio'

/**
 * Mock Web Audio API nodes
 */
function createMockAudioContext() {
  const mockGainNode = {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  const mockDestination = {}

  return {
    currentTime: 0,
    destination: mockDestination,
    createGain: vi.fn(() => ({
      ...mockGainNode,
      gain: { ...mockGainNode.gain },
    })),
    _mockGainNode: mockGainNode,
    _mockDestination: mockDestination,
  }
}

function createMockAudioNode() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
}

describe('ChannelMixer', () => {
  let audioContext: ReturnType<typeof createMockAudioContext>
  let mixer: ChannelMixer
  const defaultConfig: MixerConfig = { maxChannels: 4, masterVolume: 1.0 }

  beforeEach(() => {
    audioContext = createMockAudioContext()
    mixer = new ChannelMixer(
      audioContext as unknown as AudioContext,
      defaultConfig
    )
  })

  describe('channel availability', () => {
    it('should report channel as available when within limit', () => {
      // Arrange
      const channelIndex = 0

      // Act
      const isAvailable = mixer.isChannelAvailable(channelIndex)

      // Assert
      expect(isAvailable).toBe(true)
    })

    it('should report channel as unavailable when exceeding limit', () => {
      // Arrange
      const channelIndex = 4 // maxChannels is 4, so index 4 is out of bounds

      // Act
      const isAvailable = mixer.isChannelAvailable(channelIndex)

      // Assert
      expect(isAvailable).toBe(false)
    })

    it('should report negative channel index as unavailable', () => {
      // Arrange
      const channelIndex = -1

      // Act
      const isAvailable = mixer.isChannelAvailable(channelIndex)

      // Assert
      expect(isAvailable).toBe(false)
    })
  })

  describe('channel connection', () => {
    it('should connect audio node to mixer for valid channel', () => {
      // Arrange
      const channelIndex = 0
      const audioNode = createMockAudioNode()

      // Act
      mixer.connectChannel(channelIndex, audioNode as unknown as AudioNode)

      // Assert
      expect(audioNode.connect).toHaveBeenCalled()
    })

    it('should throw error when connecting to invalid channel', () => {
      // Arrange
      const channelIndex = 10 // exceeds maxChannels
      const audioNode = createMockAudioNode()

      // Act & Assert
      expect(() => {
        mixer.connectChannel(channelIndex, audioNode as unknown as AudioNode)
      }).toThrow('Channel index 10 exceeds maximum channels (4)')
    })

    it('should track active channel count after connection', () => {
      // Arrange
      const audioNode = createMockAudioNode()

      // Act
      mixer.connectChannel(0, audioNode as unknown as AudioNode)

      // Assert
      expect(mixer.getActiveChannelCount()).toBe(1)
    })

    it('should not double-count same channel reconnection', () => {
      // Arrange
      const audioNode1 = createMockAudioNode()
      const audioNode2 = createMockAudioNode()

      // Act
      mixer.connectChannel(0, audioNode1 as unknown as AudioNode)
      mixer.connectChannel(0, audioNode2 as unknown as AudioNode)

      // Assert
      expect(mixer.getActiveChannelCount()).toBe(1)
    })
  })

  describe('channel disconnection', () => {
    it('should disconnect channel and reduce active count', () => {
      // Arrange
      const audioNode = createMockAudioNode()
      mixer.connectChannel(0, audioNode as unknown as AudioNode)

      // Act
      mixer.disconnectChannel(0)

      // Assert
      expect(mixer.getActiveChannelCount()).toBe(0)
    })

    it('should handle disconnecting non-connected channel gracefully', () => {
      // Arrange - no channel connected

      // Act & Assert
      expect(() => mixer.disconnectChannel(0)).not.toThrow()
      expect(mixer.getActiveChannelCount()).toBe(0)
    })
  })

  describe('active channel counting', () => {
    it('should return 0 when no channels are active', () => {
      // Arrange - fresh mixer

      // Act
      const count = mixer.getActiveChannelCount()

      // Assert
      expect(count).toBe(0)
    })

    it('should correctly count multiple active channels', () => {
      // Arrange
      const audioNode0 = createMockAudioNode()
      const audioNode1 = createMockAudioNode()
      const audioNode2 = createMockAudioNode()

      // Act
      mixer.connectChannel(0, audioNode0 as unknown as AudioNode)
      mixer.connectChannel(1, audioNode1 as unknown as AudioNode)
      mixer.connectChannel(2, audioNode2 as unknown as AudioNode)

      // Assert
      expect(mixer.getActiveChannelCount()).toBe(3)
    })
  })

  describe('master volume', () => {
    it('should set master volume on initialization', () => {
      // Arrange
      const config: MixerConfig = { maxChannels: 4, masterVolume: 0.5 }
      const ctx = createMockAudioContext()

      // Act
      new ChannelMixer(ctx as unknown as AudioContext, config)

      // Assert
      const gainNode = ctx.createGain.mock.results[0]?.value
      expect(gainNode.gain.value).toBe(0.5)
    })

    it('should update master volume dynamically', () => {
      // Arrange - mixer already created

      // Act
      mixer.setMasterVolume(0.75)

      // Assert
      const gainNode = audioContext.createGain.mock.results[0]?.value
      expect(gainNode.gain.value).toBe(0.75)
    })

    it('should clamp volume to valid range (0-1)', () => {
      // Arrange & Act
      mixer.setMasterVolume(1.5)
      const gainNode = audioContext.createGain.mock.results[0]?.value

      // Assert
      expect(gainNode.gain.value).toBe(1)
    })

    it('should clamp negative volume to 0', () => {
      // Arrange & Act
      mixer.setMasterVolume(-0.5)
      const gainNode = audioContext.createGain.mock.results[0]?.value

      // Assert
      expect(gainNode.gain.value).toBe(0)
    })
  })

  describe('output', () => {
    it('should return the master gain node as output', () => {
      // Arrange - mixer created

      // Act
      const output = mixer.getOutput()

      // Assert
      expect(output).toBeDefined()
      expect(audioContext.createGain).toHaveBeenCalled()
    })

    it('should connect master gain to destination on creation', () => {
      // Arrange - check connections made during constructor

      // Assert
      const masterGain = audioContext.createGain.mock.results[0]?.value
      expect(masterGain.connect).toHaveBeenCalledWith(audioContext.destination)
    })
  })

  describe('mixing within channel limit', () => {
    it('should allow mixing up to maxChannels simultaneously', () => {
      // Arrange
      const nodes = Array.from({ length: 4 }, () => createMockAudioNode())

      // Act
      nodes.forEach((node, index) => {
        mixer.connectChannel(index, node as unknown as AudioNode)
      })

      // Assert
      expect(mixer.getActiveChannelCount()).toBe(4)
      nodes.forEach(node => {
        expect(node.connect).toHaveBeenCalled()
      })
    })

    it('should prevent connecting beyond maxChannels by index validation', () => {
      // Arrange
      const extraNode = createMockAudioNode()

      // Act & Assert
      expect(() => {
        mixer.connectChannel(4, extraNode as unknown as AudioNode)
      }).toThrow('Channel index 4 exceeds maximum channels (4)')
    })
  })

  describe('configuration', () => {
    it('should respect custom maxChannels configuration', () => {
      // Arrange
      const customConfig: MixerConfig = { maxChannels: 8, masterVolume: 1.0 }
      const customMixer = new ChannelMixer(
        audioContext as unknown as AudioContext,
        customConfig
      )

      // Act & Assert
      expect(customMixer.isChannelAvailable(7)).toBe(true)
      expect(customMixer.isChannelAvailable(8)).toBe(false)
    })

    it('should handle single channel configuration', () => {
      // Arrange
      const monoConfig: MixerConfig = { maxChannels: 1, masterVolume: 1.0 }
      const monoMixer = new ChannelMixer(
        audioContext as unknown as AudioContext,
        monoConfig
      )

      // Act & Assert
      expect(monoMixer.isChannelAvailable(0)).toBe(true)
      expect(monoMixer.isChannelAvailable(1)).toBe(false)
    })
  })
})
