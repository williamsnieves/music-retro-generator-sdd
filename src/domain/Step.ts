import { Note } from './Note'

/**
 * Represents a step (position) in a pattern.
 * Contains notes for different channels at this position.
 * Immutable value object following SOLID principles.
 */
export class Step {
  readonly position: number
  readonly notes: readonly Note[]

  constructor(position: number, notes: Note[] = []) {
    if (position < 0) {
      throw new Error('Position must be non-negative')
    }

    this.position = position
    this.notes = Object.freeze([...notes])
  }

  /**
   * Add a note to this step, returning a new Step.
   */
  addNote(note: Note): Step {
    return new Step(this.position, [...this.notes, note])
  }

  /**
   * Remove a note from this step, returning a new Step.
   */
  removeNote(noteToRemove: Note): Step {
    const filteredNotes = this.notes.filter(note => !note.equals(noteToRemove))
    return new Step(this.position, [...filteredNotes])
  }

  /**
   * Check if this step has a note for the specified channel.
   */
  hasNoteForChannel(channel: number): boolean {
    return this.notes.some(note => note.channel === channel)
  }

  /**
   * Get the note for a specific channel, if any.
   */
  getNoteForChannel(channel: number): Note | undefined {
    return this.notes.find(note => note.channel === channel)
  }

  /**
   * Check if this step has no notes.
   */
  isEmpty(): boolean {
    return this.notes.length === 0
  }

  /**
   * Remove note at specific channel, returning a new Step.
   */
  removeNoteAtChannel(channel: number): Step {
    const filteredNotes = this.notes.filter(note => note.channel !== channel)
    return new Step(this.position, [...filteredNotes])
  }
}
