/**
 * Waveform types for retro synthesis
 * These match the classic chip-tune sound characteristics
 */
export type WaveformType = 'square' | 'triangle' | 'sawtooth'

/**
 * Represents a musical note to be played
 */
export interface Note {
  /** MIDI note number (0-127), where 60 is middle C */
  pitch: number
  /** Duration in seconds */
  duration: number
  /** Volume level (0-1) */
  volume: number
}

/**
 * Configuration for synthesis
 */
export interface SynthesizerConfig {
  /** Waveform type for the oscillator */
  waveform: WaveformType
  /** Attack time in seconds */
  attack: number
  /** Release time in seconds */
  release: number
}

/**
 * Configuration for channel mixing
 */
export interface MixerConfig {
  /** Maximum number of simultaneous channels */
  maxChannels: number
  /** Master volume (0-1) */
  masterVolume: number
}

/**
 * Represents an active voice in the synthesizer
 */
export interface Voice {
  /** Channel index this voice belongs to */
  channelIndex: number
  /** The oscillator node */
  oscillator: OscillatorNode
  /** The gain node for envelope */
  gain: GainNode
  /** Scheduled stop time */
  stopTime: number
}

/**
 * Port interface for audio synthesis operations
 */
export interface SynthesizerPort {
  /**
   * Play a note on a specific channel
   * @param channelIndex - The channel to play on (0-indexed)
   * @param note - The note configuration
   * @param startTime - When to start playing (AudioContext time)
   */
  playNote(channelIndex: number, note: Note, startTime: number): void
  
  /**
   * Stop all sounds on a specific channel
   * @param channelIndex - The channel to stop
   */
  stopChannel(channelIndex: number): void
  
  /**
   * Stop all sounds immediately
   */
  stopAll(): void
  
  /**
   * Configure the waveform for a channel
   * @param channelIndex - The channel to configure
   * @param waveform - The waveform type
   */
  setWaveform(channelIndex: number, waveform: WaveformType): void
}

/**
 * Port interface for channel mixing operations
 */
export interface ChannelMixerPort {
  /**
   * Check if a channel is available for playing
   * @param channelIndex - The channel to check
   */
  isChannelAvailable(channelIndex: number): boolean
  
  /**
   * Get the number of currently active channels
   */
  getActiveChannelCount(): number
  
  /**
   * Connect a node to the mixer for a specific channel
   * @param channelIndex - The channel index
   * @param node - The audio node to connect
   */
  connectChannel(channelIndex: number, node: AudioNode): void
  
  /**
   * Disconnect a channel from the mixer
   * @param channelIndex - The channel to disconnect
   */
  disconnectChannel(channelIndex: number): void
  
  /**
   * Set the master volume
   * @param volume - Volume level (0-1)
   */
  setMasterVolume(volume: number): void
  
  /**
   * Get the output node for connecting to destination
   */
  getOutput(): AudioNode
}
