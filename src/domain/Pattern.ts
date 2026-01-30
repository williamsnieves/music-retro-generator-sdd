import { Note } from './Note'
import { Step } from './Step'

/**
 * Represents a pattern in the retro tracker.
 * A pattern is a grid of steps x channels containing notes.
 * Immutable entity following SOLID principles.
 */
export class Pattern {
  readonly id: string
  readonly name: string
  readonly stepCount: number
  private readonly steps: readonly Step[]

  constructor(id: string, name: string, stepCount: number, steps?: Step[]) {
    if (!id || id.trim() === '') {
      throw new Error('Pattern id cannot be empty')
    }
    if (!name || name.trim() === '') {
      throw new Error('Pattern name cannot be empty')
    }
    if (stepCount <= 0) {
      throw new Error('Step count must be positive')
    }

    this.id = id
    this.name = name
    this.stepCount = stepCount

    if (steps) {
      this.steps = Object.freeze([...steps])
    } else {
      // Initialize with empty steps
      const emptySteps: Step[] = []
      for (let i = 0; i < stepCount; i++) {
        emptySteps.push(new Step(i))
      }
      this.steps = Object.freeze(emptySteps)
    }
  }

  /**
   * Get a step at the specified position.
   */
  getStep(position: number): Step {
    if (position < 0 || position >= this.stepCount) {
      throw new Error('Step position out of bounds')
    }
    return this.steps[position]
  }

  /**
   * Get all steps in the pattern.
   */
  getAllSteps(): readonly Step[] {
    return this.steps
  }

  /**
   * Add a note at a specific step, returning a new Pattern.
   */
  addNoteAtStep(stepPosition: number, note: Note): Pattern {
    if (stepPosition < 0 || stepPosition >= this.stepCount) {
      throw new Error('Step position out of bounds')
    }

    const newSteps = [...this.steps]
    newSteps[stepPosition] = this.steps[stepPosition].addNote(note)

    return new Pattern(this.id, this.name, this.stepCount, newSteps)
  }

  /**
   * Remove a note at a specific step and channel, returning a new Pattern.
   */
  removeNoteAtStep(stepPosition: number, channel: number): Pattern {
    if (stepPosition < 0 || stepPosition >= this.stepCount) {
      throw new Error('Step position out of bounds')
    }

    const newSteps = [...this.steps]
    newSteps[stepPosition] = this.steps[stepPosition].removeNoteAtChannel(channel)

    return new Pattern(this.id, this.name, this.stepCount, newSteps)
  }

  /**
   * Check if the pattern is empty (no notes in any step).
   */
  isEmpty(): boolean {
    return this.steps.every(step => step.isEmpty())
  }

  /**
   * Create a new pattern with a different name.
   */
  withName(newName: string): Pattern {
    return new Pattern(this.id, newName, this.stepCount, [...this.steps])
  }
}
