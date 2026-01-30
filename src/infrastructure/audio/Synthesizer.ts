import type { 
  Note, 
  SynthesizerConfig, 
  SynthesizerPort, 
  WaveformType,
  Voice 
} from '@/domain/types/audio'

/**
 * Converts MIDI note number to frequency in Hz
 * Uses the standard formula: f = 440 * 2^((n-69)/12)
 * where n is the MIDI note number and 69 is A4 (440Hz)
 */
function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

/**
 * Synthesizer implementation for retro audio generation
 * 
 * Uses Web Audio API to generate basic waveforms (square, triangle, sawtooth)
 * with simple ADSR-like envelope (attack and release only for retro feel).
 * 
 * Follows the Single Responsibility Principle - handles only note synthesis.
 */
export class Synthesizer implements SynthesizerPort {
  private readonly audioContext: AudioContext
  private readonly connectToMixer: (channelIndex: number, node: AudioNode) => void
  private readonly config: SynthesizerConfig
  private readonly channelWaveforms: Map<number, WaveformType> = new Map()
  private readonly activeVoices: Map<number, Voice[]> = new Map()

  constructor(
    audioContext: AudioContext,
    connectToMixer: (channelIndex: number, node: AudioNode) => void,
    config: SynthesizerConfig
  ) {
    this.audioContext = audioContext
    this.connectToMixer = connectToMixer
    this.config = config
  }

  /**
   * Play a note on a specific channel
   * Creates an oscillator with envelope and schedules playback
   */
  playNote(channelIndex: number, note: Note, startTime: number): void {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    // Set waveform type (channel-specific or default)
    const waveform = this.channelWaveforms.get(channelIndex) ?? this.config.waveform
    oscillator.type = waveform

    // Set frequency from MIDI note
    const frequency = midiToFrequency(note.pitch)
    oscillator.frequency.setValueAtTime(frequency, startTime)

    // Connect oscillator -> gain -> mixer
    oscillator.connect(gainNode)
    this.connectToMixer(channelIndex, gainNode)

    // Apply envelope
    this.applyEnvelope(gainNode, note, startTime)

    // Schedule start and stop
    const stopTime = startTime + note.duration + this.config.release
    oscillator.start(startTime)
    oscillator.stop(stopTime)

    // Track the voice for cleanup
    this.trackVoice(channelIndex, {
      channelIndex,
      oscillator,
      gain: gainNode,
      stopTime,
    })

    // Clean up after stop
    oscillator.addEventListener('ended', () => {
      this.removeVoice(channelIndex, oscillator)
    })
  }

  /**
   * Apply attack and release envelope to the gain node
   */
  private applyEnvelope(gainNode: GainNode, note: Note, startTime: number): void {
    const { attack, release } = this.config
    const endTime = startTime + note.duration

    // Start at 0 volume
    gainNode.gain.setValueAtTime(0, startTime)

    // Ramp up to target volume (attack)
    gainNode.gain.linearRampToValueAtTime(note.volume, startTime + attack)

    // Ramp down to 0 (release)
    gainNode.gain.linearRampToValueAtTime(0, endTime + release)
  }

  /**
   * Track a voice for later cleanup
   */
  private trackVoice(channelIndex: number, voice: Voice): void {
    const voices = this.activeVoices.get(channelIndex) ?? []
    voices.push(voice)
    this.activeVoices.set(channelIndex, voices)
  }

  /**
   * Remove a voice after it has ended
   */
  private removeVoice(channelIndex: number, oscillator: OscillatorNode): void {
    const voices = this.activeVoices.get(channelIndex) ?? []
    const filtered = voices.filter(v => v.oscillator !== oscillator)
    this.activeVoices.set(channelIndex, filtered)
  }

  /**
   * Stop all sounds on a specific channel
   */
  stopChannel(channelIndex: number): void {
    const voices = this.activeVoices.get(channelIndex) ?? []
    const currentTime = this.audioContext.currentTime

    for (const voice of voices) {
      try {
        voice.oscillator.stop(currentTime)
      } catch {
        // Oscillator may have already stopped
      }
    }

    this.activeVoices.set(channelIndex, [])
  }

  /**
   * Stop all sounds immediately on all channels
   */
  stopAll(): void {
    const currentTime = this.audioContext.currentTime

    for (const [channelIndex, voices] of this.activeVoices) {
      for (const voice of voices) {
        try {
          voice.oscillator.stop(currentTime)
        } catch {
          // Oscillator may have already stopped
        }
      }
      this.activeVoices.set(channelIndex, [])
    }
  }

  /**
   * Configure the waveform for a specific channel
   */
  setWaveform(channelIndex: number, waveform: WaveformType): void {
    this.channelWaveforms.set(channelIndex, waveform)
  }
}
