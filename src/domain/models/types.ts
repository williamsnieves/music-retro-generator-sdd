/**
 * Domain models for the retro music tracker
 */

/**
 * Represents a musical note with pitch and duration
 */
export interface Note {
  /** MIDI note number (0-127), null for rest/silence */
  pitch: number | null
  /** Note duration in steps */
  duration: number
  /** Volume (0-1) */
  volume: number
}

/**
 * Represents a step in a pattern (one time slot)
 */
export interface Step {
  /** Note at this step, null if empty */
  note: Note | null
}

/**
 * Represents a channel in a pattern
 */
export interface Channel {
  /** Steps in this channel */
  steps: Step[]
  /** Waveform type for this channel */
  waveform: WaveformType
}

/**
 * Available waveform types for retro synthesis
 */
export type WaveformType = 'square' | 'triangle' | 'sawtooth' | 'sine'

/**
 * Represents a pattern (grid of steps per channel)
 */
export interface Pattern {
  /** Unique pattern identifier */
  id: string
  /** Name of the pattern */
  name: string
  /** Channels in this pattern */
  channels: Channel[]
  /** Number of steps in the pattern */
  stepsCount: number
}

/**
 * Represents a complete song
 */
export interface Song {
  /** Song title */
  title: string
  /** Beats per minute */
  bpm: number
  /** Available patterns */
  patterns: Pattern[]
  /** Order of patterns to play (pattern IDs) */
  patternOrder: string[]
  /** Number of channels */
  channelCount: number
  /** Steps per beat (resolution) */
  stepsPerBeat: number
}

/**
 * Audio export configuration
 */
export interface AudioExportOptions {
  /** Sample rate in Hz */
  sampleRate: number
  /** Bit depth (8, 16, 24, 32) */
  bitDepth: 8 | 16 | 24 | 32
  /** Number of audio channels (1 = mono, 2 = stereo) */
  audioChannels: 1 | 2
}

/**
 * Result of an audio export operation
 */
export interface AudioExportResult {
  /** The audio data as ArrayBuffer (WAV format) */
  data: ArrayBuffer
  /** Duration in seconds */
  duration: number
  /** File size in bytes */
  size: number
}

/**
 * Result of a song data export operation
 */
export interface SongDataExportResult {
  /** The song data as JSON string */
  data: string
  /** File size in bytes */
  size: number
}
