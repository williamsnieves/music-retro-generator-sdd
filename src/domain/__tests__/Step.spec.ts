import { describe, it, expect } from 'vitest'
import { Step } from '../Step'
import { Note } from '../Note'

describe('Step', () => {
  describe('creation', () => {
    it('should create an empty step with position', () => {
      // Arrange
      const position = 0

      // Act
      const step = new Step(position)

      // Assert
      expect(step.position).toBe(position)
      expect(step.notes).toHaveLength(0)
    })

    it('should create a step with notes', () => {
      // Arrange
      const position = 4
      const notes = [new Note('C4', 1, 0), new Note('E4', 1, 1)]

      // Act
      const step = new Step(position, notes)

      // Assert
      expect(step.position).toBe(position)
      expect(step.notes).toHaveLength(2)
    })
  })

  describe('validation', () => {
    it('should reject negative position', () => {
      // Arrange
      const negativePosition = -1

      // Act & Assert
      expect(() => new Step(negativePosition)).toThrow('Position must be non-negative')
    })
  })

  describe('note management', () => {
    it('should add a note to the step', () => {
      // Arrange
      const step = new Step(0)
      const note = new Note('C4', 1, 0)

      // Act
      const newStep = step.addNote(note)

      // Assert
      expect(newStep.notes).toHaveLength(1)
      expect(newStep.notes[0].pitch).toBe('C4')
    })

    it('should return a new step when adding note (immutability)', () => {
      // Arrange
      const step = new Step(0)
      const note = new Note('C4', 1, 0)

      // Act
      const newStep = step.addNote(note)

      // Assert
      expect(newStep).not.toBe(step)
      expect(step.notes).toHaveLength(0)
    })

    it('should remove a note from the step', () => {
      // Arrange
      const note = new Note('C4', 1, 0)
      const step = new Step(0, [note])

      // Act
      const newStep = step.removeNote(note)

      // Assert
      expect(newStep.notes).toHaveLength(0)
    })

    it('should check if step has note for channel', () => {
      // Arrange
      const note = new Note('C4', 1, 0)
      const step = new Step(0, [note])

      // Act & Assert
      expect(step.hasNoteForChannel(0)).toBe(true)
      expect(step.hasNoteForChannel(1)).toBe(false)
    })

    it('should get note for specific channel', () => {
      // Arrange
      const note = new Note('C4', 1, 0)
      const step = new Step(0, [note])

      // Act
      const foundNote = step.getNoteForChannel(0)

      // Assert
      expect(foundNote).toBeDefined()
      expect(foundNote?.pitch).toBe('C4')
    })

    it('should return undefined for non-existent channel', () => {
      // Arrange
      const step = new Step(0)

      // Act
      const foundNote = step.getNoteForChannel(0)

      // Assert
      expect(foundNote).toBeUndefined()
    })
  })

  describe('empty check', () => {
    it('should report empty step as empty', () => {
      // Arrange
      const step = new Step(0)

      // Act & Assert
      expect(step.isEmpty()).toBe(true)
    })

    it('should report step with notes as not empty', () => {
      // Arrange
      const step = new Step(0, [new Note('C4', 1, 0)])

      // Act & Assert
      expect(step.isEmpty()).toBe(false)
    })
  })
})
