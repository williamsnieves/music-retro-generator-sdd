import type { ChannelMixerPort, MixerConfig } from '@/domain/types/audio'

/**
 * Channel state tracking
 */
interface ChannelState {
  gainNode: GainNode
  connectedNodes: Set<AudioNode>
}

/**
 * ChannelMixer implementation for mixing multiple audio channels
 * 
 * Respects the configured channel limit and provides volume control.
 * Follows the Single Responsibility Principle - handles only channel mixing.
 */
export class ChannelMixer implements ChannelMixerPort {
  private readonly audioContext: AudioContext
  private readonly config: MixerConfig
  private readonly masterGain: GainNode
  private readonly channels: Map<number, ChannelState> = new Map()

  constructor(audioContext: AudioContext, config: MixerConfig) {
    this.audioContext = audioContext
    this.config = config

    // Create master gain node
    this.masterGain = audioContext.createGain()
    this.masterGain.gain.value = config.masterVolume
    this.masterGain.connect(audioContext.destination)

    // Initialize channel gain nodes
    this.initializeChannels()
  }

  /**
   * Pre-create gain nodes for each channel
   */
  private initializeChannels(): void {
    for (let i = 0; i < this.config.maxChannels; i++) {
      const gainNode = this.audioContext.createGain()
      gainNode.connect(this.masterGain)
      this.channels.set(i, {
        gainNode,
        connectedNodes: new Set(),
      })
    }
  }

  /**
   * Check if a channel index is valid and available
   */
  isChannelAvailable(channelIndex: number): boolean {
    return channelIndex >= 0 && channelIndex < this.config.maxChannels
  }

  /**
   * Get the number of currently active channels (with connected nodes)
   */
  getActiveChannelCount(): number {
    let count = 0
    for (const [, state] of this.channels) {
      if (state.connectedNodes.size > 0) {
        count++
      }
    }
    return count
  }

  /**
   * Connect an audio node to a specific channel
   * @throws Error if channel index exceeds maximum
   */
  connectChannel(channelIndex: number, node: AudioNode): void {
    if (!this.isChannelAvailable(channelIndex)) {
      throw new Error(
        `Channel index ${channelIndex} exceeds maximum channels (${this.config.maxChannels})`
      )
    }

    const channel = this.channels.get(channelIndex)
    if (channel) {
      node.connect(channel.gainNode)
      channel.connectedNodes.add(node)
    }
  }

  /**
   * Disconnect a channel from the mixer
   */
  disconnectChannel(channelIndex: number): void {
    const channel = this.channels.get(channelIndex)
    if (channel) {
      for (const node of channel.connectedNodes) {
        try {
          node.disconnect()
        } catch {
          // Node may already be disconnected
        }
      }
      channel.connectedNodes.clear()
    }
  }

  /**
   * Set the master volume (clamped to 0-1)
   */
  setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.masterGain.gain.value = clampedVolume
  }

  /**
   * Get the output node for external connections
   */
  getOutput(): AudioNode {
    return this.masterGain
  }
}
