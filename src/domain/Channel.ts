/**
 * Represents an audio channel in the retro tracker.
 * Immutable value object following SOLID principles.
 */
export class Channel {
  readonly id: number
  readonly name: string
  readonly volume: number

  constructor(id: number, name: string, volume: number = 1.0) {
    if (id < 0) {
      throw new Error('Channel id must be non-negative')
    }
    if (!name || name.trim() === '') {
      throw new Error('Channel name cannot be empty')
    }
    if (volume < 0 || volume > 1) {
      throw new Error('Volume must be between 0 and 1')
    }

    this.id = id
    this.name = name
    this.volume = volume
  }

  /**
   * Create a new channel with a different volume.
   */
  withVolume(newVolume: number): Channel {
    return new Channel(this.id, this.name, newVolume)
  }

  /**
   * Create a new channel with a different name.
   */
  withName(newName: string): Channel {
    return new Channel(this.id, newName, this.volume)
  }
}

/**
 * Configuration for channel limits in the tracker.
 * Enforces the maximum number of channels allowed.
 */
export class ChannelConfig {
  readonly maxChannels: number

  constructor(maxChannels: number) {
    if (maxChannels <= 0) {
      throw new Error('Max channels must be positive')
    }

    this.maxChannels = maxChannels
  }

  /**
   * Check if a channel id is valid within the configured limit.
   */
  isValidChannel(channelId: number): boolean {
    return channelId >= 0 && channelId < this.maxChannels
  }

  /**
   * Create default channels up to the limit.
   */
  createDefaultChannels(): Channel[] {
    const channels: Channel[] = []
    for (let i = 0; i < this.maxChannels; i++) {
      channels.push(new Channel(i, `Channel ${i + 1}`))
    }
    return channels
  }
}
