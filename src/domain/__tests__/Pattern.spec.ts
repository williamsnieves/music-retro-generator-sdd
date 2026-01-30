import { describe, it, expect } from 'vitest'
import { Pattern } from '../Pattern'
import { Note } from '../Note'
import { Step } from '../Step'

describe('Pattern', () => {
  describe('creation', () => {
    it('should create a pattern with id, name, and default steps', () => {
      // Arrange
      const id = 'pattern-1'
      const name = 'Intro'
      const stepCount = 16

      // Act
      const pattern = new Pattern(id, name, stepCount)

      // Assert
      expect(pattern.id).toBe(id)
      expect(pattern.name).toBe(name)
      expect(pattern.stepCount).toBe(stepCount)
    })

    it('should initialize with empty steps', () => {
      // Arrange & Act
      const pattern = new Pattern('p1', 'Test', 8)

      // Assert
      expect(pattern.getStep(0).isEmpty()).toBe(true)
      expect(pattern.getStep(7).isEmpty()).toBe(true)
    })
  })

  describe('validation', () => {
    it('should reject empty id', () => {
      // Arrange
      const emptyId = ''

      // Act & Assert
      expect(() => new Pattern(emptyId, 'Test', 16)).toThrow('Pattern id cannot be empty')
    })

    it('should reject empty name', () => {
      // Arrange
      const emptyName = ''

      // Act & Assert
      expect(() => new Pattern('p1', emptyName, 16)).toThrow('Pattern name cannot be empty')
    })

    it('should reject zero step count', () => {
      // Arrange
      const zeroStepCount = 0

      // Act & Assert
      expect(() => new Pattern('p1', 'Test', zeroStepCount)).toThrow('Step count must be positive')
    })

    it('should reject negative step count', () => {
      // Arrange
      const negativeStepCount = -1

      // Act & Assert
      expect(() => new Pattern('p1', 'Test', negativeStepCount)).toThrow('Step count must be positive')
    })
  })

  describe('step access', () => {
    it('should get step at position', () => {
      // Arrange
      const pattern = new Pattern('p1', 'Test', 16)

      // Act
      const step = pattern.getStep(5)

      // Assert
      expect(step.position).toBe(5)
    })

    it('should throw error for out of bounds position', () => {
      // Arrange
      const pattern = new Pattern('p1', 'Test', 16)

      // Act & Assert
      expect(() => pattern.getStep(16)).toThrow('Step position out of bounds')
      expect(() => pattern.getStep(-1)).toThrow('Step position out of bounds')
    })

    it('should get all steps', () => {
      // Arrange
      const pattern = new Pattern('p1', 'Test', 8)

      // Act
      const steps = pattern.getAllSteps()

      // Assert
      expect(steps).toHaveLength(8)
    })
  })

  describe('note operations', () => {
    it('should add note at specific step and channel', () => {
      // Arrange
      const pattern = new Pattern('p1', 'Test', 16)
      const note = new Note('C4', 1, 0)

      // Act
      const newPattern = pattern.addNoteAtStep(0, note)

      // Assert
      expect(newPattern.getStep(0).hasNoteForChannel(0)).toBe(true)
    })

    it('should remove note at specific step and channel', () => {
      // Arrange
      const note = new Note('C4', 1, 0)
      const pattern = new Pattern('p1', 'Test', 16).addNoteAtStep(0, note)

      // Act
      const newPattern = pattern.removeNoteAtStep(0, 0)

      // Assert
      expect(newPattern.getStep(0).hasNoteForChannel(0)).toBe(false)
    })

    it('should be immutable when adding notes', () => {
      // Arrange
      const pattern = new Pattern('p1', 'Test', 16)
      const note = new Note('C4', 1, 0)

      // Act
      const newPattern = pattern.addNoteAtStep(0, note)

      // Assert
      expect(newPattern).not.toBe(pattern)
      expect(pattern.getStep(0).isEmpty()).toBe(true)
    })
  })

  describe('empty pattern support', () => {
    it('should allow empty patterns', () => {
      // Arrange
      const pattern = new Pattern('p1', 'Empty', 16)

      // Act & Assert
      expect(pattern.isEmpty()).toBe(true)
    })

    it('should report non-empty when has notes', () => {
      // Arrange
      const pattern = new Pattern('p1', 'Test', 16)
        .addNoteAtStep(0, new Note('C4', 1, 0))

      // Act & Assert
      expect(pattern.isEmpty()).toBe(false)
    })
  })

  describe('rename', () => {
    it('should rename pattern returning new instance', () => {
      // Arrange
      const pattern = new Pattern('p1', 'Original', 16)

      // Act
      const renamed = pattern.withName('Renamed')

      // Assert
      expect(renamed.name).toBe('Renamed')
      expect(pattern.name).toBe('Original')
    })
  })
})
