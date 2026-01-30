import { describe, it, expect } from 'vitest'
import { Note } from '../Note'

describe('Note', () => {
  describe('creation', () => {
    it('should create a note with pitch, duration, and channel', () => {
      // Arrange
      const pitch = 'C4'
      const duration = 1
      const channel = 0

      // Act
      const note = new Note(pitch, duration, channel)

      // Assert
      expect(note.pitch).toBe(pitch)
      expect(note.duration).toBe(duration)
      expect(note.channel).toBe(channel)
    })

    it('should create notes with different pitches', () => {
      // Arrange & Act
      const noteC = new Note('C4', 1, 0)
      const noteD = new Note('D#5', 2, 1)
      const noteA = new Note('A2', 0.5, 2)

      // Assert
      expect(noteC.pitch).toBe('C4')
      expect(noteD.pitch).toBe('D#5')
      expect(noteA.pitch).toBe('A2')
    })
  })

  describe('validation', () => {
    it('should reject negative duration', () => {
      // Arrange
      const pitch = 'C4'
      const negativeDuration = -1
      const channel = 0

      // Act & Assert
      expect(() => new Note(pitch, negativeDuration, channel)).toThrow('Duration must be positive')
    })

    it('should reject zero duration', () => {
      // Arrange
      const pitch = 'C4'
      const zeroDuration = 0
      const channel = 0

      // Act & Assert
      expect(() => new Note(pitch, zeroDuration, channel)).toThrow('Duration must be positive')
    })

    it('should reject negative channel', () => {
      // Arrange
      const pitch = 'C4'
      const duration = 1
      const negativeChannel = -1

      // Act & Assert
      expect(() => new Note(pitch, duration, negativeChannel)).toThrow('Channel must be non-negative')
    })

    it('should reject empty pitch', () => {
      // Arrange
      const emptyPitch = ''
      const duration = 1
      const channel = 0

      // Act & Assert
      expect(() => new Note(emptyPitch, duration, channel)).toThrow('Pitch cannot be empty')
    })
  })

  describe('equality', () => {
    it('should identify equal notes', () => {
      // Arrange
      const note1 = new Note('C4', 1, 0)
      const note2 = new Note('C4', 1, 0)

      // Act & Assert
      expect(note1.equals(note2)).toBe(true)
    })

    it('should identify different notes', () => {
      // Arrange
      const note1 = new Note('C4', 1, 0)
      const note2 = new Note('D4', 1, 0)

      // Act & Assert
      expect(note1.equals(note2)).toBe(false)
    })
  })

  describe('immutability', () => {
    it('should return a new note when changing pitch', () => {
      // Arrange
      const note = new Note('C4', 1, 0)

      // Act
      const newNote = note.withPitch('D4')

      // Assert
      expect(newNote).not.toBe(note)
      expect(newNote.pitch).toBe('D4')
      expect(note.pitch).toBe('C4')
    })

    it('should return a new note when changing duration', () => {
      // Arrange
      const note = new Note('C4', 1, 0)

      // Act
      const newNote = note.withDuration(2)

      // Assert
      expect(newNote).not.toBe(note)
      expect(newNote.duration).toBe(2)
      expect(note.duration).toBe(1)
    })

    it('should return a new note when changing channel', () => {
      // Arrange
      const note = new Note('C4', 1, 0)

      // Act
      const newNote = note.withChannel(2)

      // Assert
      expect(newNote).not.toBe(note)
      expect(newNote.channel).toBe(2)
      expect(note.channel).toBe(0)
    })
  })
})
