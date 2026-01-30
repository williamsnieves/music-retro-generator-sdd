import type {
  Song,
  AudioExportOptions,
  AudioExportResult,
  Pattern,
  Channel,
  Note,
} from '@/domain/models/types'

/**
 * Exports songs to WAV audio format.
 * 
 * Responsibilities:
 * - Convert song patterns to audio samples
 * - Generate valid WAV file format
 * - Handle empty patterns (output silence)
 */
export class AudioExporter {
  /**
   * Export a song to WAV format
   */
  async export(song: Song, options: AudioExportOptions): Promise<AudioExportResult> {
    const duration = this.calculateDuration(song)
    const samples = this.renderSamples(song, options, duration)
    const wavData = this.createWavFile(samples, options)

    return {
      data: wavData,
      duration,
      size: wavData.byteLength,
    }
  }

  /**
   * Calculate total duration in seconds based on BPM and patterns
   */
  private calculateDuration(song: Song): number {
    const totalSteps = this.getTotalSteps(song)
    const beatsPerStep = 1 / song.stepsPerBeat
    const totalBeats = totalSteps * beatsPerStep
    return (totalBeats / song.bpm) * 60
  }

  /**
   * Get total number of steps in the song
   */
  private getTotalSteps(song: Song): number {
    return song.patternOrder.reduce((total, patternId) => {
      const pattern = song.patterns.find((p) => p.id === patternId)
      return total + (pattern?.stepsCount ?? 0)
    }, 0)
  }

  /**
   * Render all samples for the song
   */
  private renderSamples(
    song: Song,
    options: AudioExportOptions,
    duration: number
  ): Float32Array {
    const numSamples = Math.floor(duration * options.sampleRate)
    const samples = new Float32Array(numSamples * options.audioChannels)
    
    const stepDuration = this.getStepDuration(song)
    let currentSample = 0

    // Iterate through pattern order
    for (const patternId of song.patternOrder) {
      const pattern = song.patterns.find((p) => p.id === patternId)
      if (!pattern) continue

      currentSample = this.renderPattern(
        pattern,
        samples,
        options,
        song,
        currentSample,
        stepDuration
      )
    }

    return samples
  }

  /**
   * Get duration of one step in seconds
   */
  private getStepDuration(song: Song): number {
    const beatsPerStep = 1 / song.stepsPerBeat
    return (beatsPerStep / song.bpm) * 60
  }

  /**
   * Render a single pattern to the sample buffer
   */
  private renderPattern(
    pattern: Pattern,
    samples: Float32Array,
    options: AudioExportOptions,
    song: Song,
    startSample: number,
    stepDuration: number
  ): number {
    const samplesPerStep = Math.floor(stepDuration * options.sampleRate)
    let currentSample = startSample

    for (let step = 0; step < pattern.stepsCount; step++) {
      // Mix all channels for this step
      const stepSamples = this.renderStep(
        pattern,
        step,
        options,
        samplesPerStep,
        song.bpm,
        song.stepsPerBeat
      )

      // Write to output buffer
      for (let i = 0; i < samplesPerStep; i++) {
        const outIndex = (currentSample + i) * options.audioChannels
        if (outIndex >= samples.length) break

        if (options.audioChannels === 1) {
          samples[outIndex] = stepSamples[i]
        } else {
          // Stereo: duplicate to both channels
          samples[outIndex] = stepSamples[i]
          samples[outIndex + 1] = stepSamples[i]
        }
      }

      currentSample += samplesPerStep
    }

    return currentSample
  }

  /**
   * Render a single step (mix all channels)
   */
  private renderStep(
    pattern: Pattern,
    stepIndex: number,
    options: AudioExportOptions,
    numSamples: number,
    _bpm: number,
    _stepsPerBeat: number
  ): Float32Array {
    const stepSamples = new Float32Array(numSamples)
    let channelCount = 0

    // Mix all channels
    for (const channel of pattern.channels) {
      const step = channel.steps[stepIndex]
      if (step?.note) {
        const channelSamples = this.renderNote(
          step.note,
          channel.waveform,
          options.sampleRate,
          numSamples
        )
        
        // Add to mix
        for (let i = 0; i < numSamples; i++) {
          stepSamples[i] += channelSamples[i]
        }
        channelCount++
      }
    }

    // Normalize if we have multiple channels
    if (channelCount > 1) {
      for (let i = 0; i < numSamples; i++) {
        stepSamples[i] /= channelCount
      }
    }

    return stepSamples
  }

  /**
   * Render a single note with the given waveform
   */
  private renderNote(
    note: Note,
    waveform: Channel['waveform'],
    sampleRate: number,
    numSamples: number
  ): Float32Array {
    const samples = new Float32Array(numSamples)
    
    if (note.pitch === null) {
      return samples // Return silence for rest notes
    }

    const frequency = this.midiToFrequency(note.pitch)
    const volume = note.volume

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      const phase = (frequency * t) % 1

      let sample: number

      switch (waveform) {
        case 'square':
          sample = phase < 0.5 ? 1 : -1
          break
        case 'triangle':
          sample = 4 * Math.abs(phase - 0.5) - 1
          break
        case 'sawtooth':
          sample = 2 * phase - 1
          break
        case 'sine':
        default:
          sample = Math.sin(2 * Math.PI * phase)
          break
      }

      // Apply volume and simple envelope
      const envelope = this.applyEnvelope(i, numSamples)
      samples[i] = sample * volume * envelope
    }

    return samples
  }

  /**
   * Apply a simple ADSR-like envelope to reduce clicks
   */
  private applyEnvelope(sampleIndex: number, totalSamples: number): number {
    const attackTime = 0.01 // 1% attack
    const releaseTime = 0.05 // 5% release
    
    const position = sampleIndex / totalSamples
    
    if (position < attackTime) {
      return position / attackTime
    } else if (position > 1 - releaseTime) {
      return (1 - position) / releaseTime
    }
    return 1
  }

  /**
   * Convert MIDI note number to frequency
   */
  private midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12)
  }

  /**
   * Create a WAV file from samples
   */
  private createWavFile(samples: Float32Array, options: AudioExportOptions): ArrayBuffer {
    const { sampleRate, bitDepth, audioChannels } = options
    const bytesPerSample = bitDepth / 8
    const dataSize = samples.length * bytesPerSample
    const fileSize = 44 + dataSize // 44 bytes header + data

    const buffer = new ArrayBuffer(fileSize)
    const view = new DataView(buffer)

    // RIFF header
    this.writeString(view, 0, 'RIFF')
    view.setUint32(4, fileSize - 8, true) // File size - 8 bytes
    this.writeString(view, 8, 'WAVE')

    // fmt subchunk
    this.writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true) // AudioFormat (1 for PCM)
    view.setUint16(22, audioChannels, true) // NumChannels
    view.setUint32(24, sampleRate, true) // SampleRate
    view.setUint32(28, sampleRate * audioChannels * bytesPerSample, true) // ByteRate
    view.setUint16(32, audioChannels * bytesPerSample, true) // BlockAlign
    view.setUint16(34, bitDepth, true) // BitsPerSample

    // data subchunk
    this.writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true) // Subchunk2Size

    // Write samples
    let offset = 44
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]))
      
      switch (bitDepth) {
        case 8:
          // 8-bit is unsigned
          view.setUint8(offset, Math.floor((sample + 1) * 127.5))
          break
        case 16:
          view.setInt16(offset, Math.floor(sample * 32767), true)
          break
        case 24:
          const val24 = Math.floor(sample * 8388607)
          view.setUint8(offset, val24 & 0xff)
          view.setUint8(offset + 1, (val24 >> 8) & 0xff)
          view.setUint8(offset + 2, (val24 >> 16) & 0xff)
          break
        case 32:
          view.setInt32(offset, Math.floor(sample * 2147483647), true)
          break
      }
      
      offset += bytesPerSample
    }

    return buffer
  }

  /**
   * Write a string to the DataView
   */
  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }
}
