/**
 * Represents a musical note in the retro tracker.
 * Immutable value object following SOLID principles.
 */
export class Note {
  readonly pitch: string
  readonly duration: number
  readonly channel: number

  constructor(pitch: string, duration: number, channel: number) {
    if (!pitch || pitch.trim() === '') {
      throw new Error('Pitch cannot be empty')
    }
    if (duration <= 0) {
      throw new Error('Duration must be positive')
    }
    if (channel < 0) {
      throw new Error('Channel must be non-negative')
    }

    this.pitch = pitch
    this.duration = duration
    this.channel = channel
  }

  /**
   * Check equality with another note.
   */
  equals(other: Note): boolean {
    return (
      this.pitch === other.pitch &&
      this.duration === other.duration &&
      this.channel === other.channel
    )
  }

  /**
   * Create a new note with a different pitch.
   */
  withPitch(newPitch: string): Note {
    return new Note(newPitch, this.duration, this.channel)
  }

  /**
   * Create a new note with a different duration.
   */
  withDuration(newDuration: number): Note {
    return new Note(this.pitch, newDuration, this.channel)
  }

  /**
   * Create a new note with a different channel.
   */
  withChannel(newChannel: number): Note {
    return new Note(this.pitch, this.duration, newChannel)
  }
}
