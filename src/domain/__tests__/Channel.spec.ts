import { describe, it, expect } from 'vitest'
import { Channel, ChannelConfig } from '../Channel'

describe('Channel', () => {
  describe('creation', () => {
    it('should create a channel with id and name', () => {
      // Arrange
      const id = 0
      const name = 'Lead'

      // Act
      const channel = new Channel(id, name)

      // Assert
      expect(channel.id).toBe(id)
      expect(channel.name).toBe(name)
    })

    it('should create a channel with default volume', () => {
      // Arrange & Act
      const channel = new Channel(0, 'Lead')

      // Assert
      expect(channel.volume).toBe(1.0)
    })

    it('should create a channel with custom volume', () => {
      // Arrange & Act
      const channel = new Channel(0, 'Lead', 0.8)

      // Assert
      expect(channel.volume).toBe(0.8)
    })
  })

  describe('validation', () => {
    it('should reject negative id', () => {
      // Arrange
      const negativeId = -1

      // Act & Assert
      expect(() => new Channel(negativeId, 'Lead')).toThrow('Channel id must be non-negative')
    })

    it('should reject empty name', () => {
      // Arrange
      const emptyName = ''

      // Act & Assert
      expect(() => new Channel(0, emptyName)).toThrow('Channel name cannot be empty')
    })

    it('should reject volume below 0', () => {
      // Arrange
      const negativeVolume = -0.1

      // Act & Assert
      expect(() => new Channel(0, 'Lead', negativeVolume)).toThrow('Volume must be between 0 and 1')
    })

    it('should reject volume above 1', () => {
      // Arrange
      const overVolume = 1.1

      // Act & Assert
      expect(() => new Channel(0, 'Lead', overVolume)).toThrow('Volume must be between 0 and 1')
    })
  })

  describe('immutability', () => {
    it('should return new channel when changing volume', () => {
      // Arrange
      const channel = new Channel(0, 'Lead', 0.5)

      // Act
      const newChannel = channel.withVolume(0.8)

      // Assert
      expect(newChannel).not.toBe(channel)
      expect(newChannel.volume).toBe(0.8)
      expect(channel.volume).toBe(0.5)
    })

    it('should return new channel when renaming', () => {
      // Arrange
      const channel = new Channel(0, 'Lead')

      // Act
      const newChannel = channel.withName('Bass')

      // Assert
      expect(newChannel).not.toBe(channel)
      expect(newChannel.name).toBe('Bass')
      expect(channel.name).toBe('Lead')
    })
  })
})

describe('ChannelConfig', () => {
  describe('channel limit', () => {
    it('should create config with max channels', () => {
      // Arrange & Act
      const config = new ChannelConfig(4)

      // Assert
      expect(config.maxChannels).toBe(4)
    })

    it('should reject zero max channels', () => {
      // Arrange
      const zeroMax = 0

      // Act & Assert
      expect(() => new ChannelConfig(zeroMax)).toThrow('Max channels must be positive')
    })

    it('should reject negative max channels', () => {
      // Arrange
      const negativeMax = -1

      // Act & Assert
      expect(() => new ChannelConfig(negativeMax)).toThrow('Max channels must be positive')
    })

    it('should validate channel id against limit', () => {
      // Arrange
      const config = new ChannelConfig(4)

      // Act & Assert
      expect(config.isValidChannel(0)).toBe(true)
      expect(config.isValidChannel(3)).toBe(true)
      expect(config.isValidChannel(4)).toBe(false)
      expect(config.isValidChannel(-1)).toBe(false)
    })
  })

  describe('default channels', () => {
    it('should create default channels up to limit', () => {
      // Arrange
      const config = new ChannelConfig(4)

      // Act
      const channels = config.createDefaultChannels()

      // Assert
      expect(channels).toHaveLength(4)
      expect(channels[0].id).toBe(0)
      expect(channels[0].name).toBe('Channel 1')
      expect(channels[3].id).toBe(3)
      expect(channels[3].name).toBe('Channel 4')
    })
  })
})
