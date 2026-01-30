import { describe, it, expect, beforeEach } from 'vitest';
import { PatternEditor } from '../PatternEditor';
import { Pattern, Note } from '../../domain';

describe('PatternEditor', () => {
  let editor: PatternEditor;
  let pattern: Pattern;
  const MAX_CHANNELS = 4;

  beforeEach(() => {
    pattern = new Pattern('pattern-1', 'Test Pattern', 16); // id, name, 16 steps
    editor = new PatternEditor(pattern, MAX_CHANNELS);
  });

  describe('addNote', () => {
    it('should add a note to a valid step and channel', () => {
      // Arrange
      const note = new Note('C4', 0.5, 0);
      
      // Act
      editor.addNote(0, 0, note);
      
      // Assert
      const updatedPattern = editor.getPattern();
      const step = updatedPattern.getStep(0);
      const addedNote = step.getNoteForChannel(0);
      expect(addedNote).toBeDefined();
      expect(addedNote?.pitch).toBe('C4');
    });

    it('should replace existing note at the same position', () => {
      // Arrange
      const note1 = new Note('C4', 0.5, 0);
      const note2 = new Note('D4', 0.8, 0);
      
      // Act
      editor.addNote(0, 0, note1);
      editor.addNote(0, 0, note2);
      
      // Assert
      const updatedPattern = editor.getPattern();
      const step = updatedPattern.getStep(0);
      const finalNote = step.getNoteForChannel(0);
      expect(finalNote?.pitch).toBe('D4');
      expect(finalNote?.duration).toBe(0.8);
    });

    it('should throw error when channel exceeds limit', () => {
      // Arrange
      const note = new Note('C4', 0.5, 0);
      
      // Act & Assert
      expect(() => editor.addNote(0, 4, note)).toThrow('Channel 4 exceeds pattern channel limit');
    });

    it('should throw error when step is out of bounds', () => {
      // Arrange
      const note = new Note('C4', 0.5, 0);
      
      // Act & Assert
      expect(() => editor.addNote(16, 0, note)).toThrow('Step 16 is out of bounds');
    });
  });

  describe('removeNote', () => {
    it('should remove a note from a valid position', () => {
      // Arrange
      const note = new Note('C4', 0.5, 0);
      editor.addNote(0, 0, note);
      
      // Act
      editor.removeNote(0, 0);
      
      // Assert
      const updatedPattern = editor.getPattern();
      const step = updatedPattern.getStep(0);
      expect(step.getNoteForChannel(0)).toBeUndefined();
    });

    it('should not throw when removing from empty position', () => {
      // Act & Assert
      expect(() => editor.removeNote(0, 0)).not.toThrow();
    });

    it('should throw error when channel exceeds limit', () => {
      // Act & Assert
      expect(() => editor.removeNote(0, 4)).toThrow('Channel 4 exceeds pattern channel limit');
    });
  });

  describe('moveNote', () => {
    it('should move a note to a new position', () => {
      // Arrange
      const note = new Note('C4', 0.5, 0);
      editor.addNote(0, 0, note);
      
      // Act
      editor.moveNote(0, 0, 1, 1);
      
      // Assert
      const updatedPattern = editor.getPattern();
      expect(updatedPattern.getStep(0).getNoteForChannel(0)).toBeUndefined();
      const movedNote = updatedPattern.getStep(1).getNoteForChannel(1);
      expect(movedNote?.pitch).toBe('C4');
    });

    it('should throw error when source position is empty', () => {
      // Act & Assert
      expect(() => editor.moveNote(0, 0, 1, 1)).toThrow('No note at source position');
    });

    it('should throw error when target channel exceeds limit', () => {
      // Arrange
      const note = new Note('C4', 0.5, 0);
      editor.addNote(0, 0, note);
      
      // Act & Assert
      expect(() => editor.moveNote(0, 0, 1, 4)).toThrow('Channel 4 exceeds pattern channel limit');
    });
  });

  describe('clear', () => {
    it('should clear all notes from pattern', () => {
      // Arrange
      editor.addNote(0, 0, new Note('C4', 0.5, 0));
      editor.addNote(1, 1, new Note('D4', 0.5, 1));
      editor.addNote(2, 2, new Note('E4', 0.5, 2));
      
      // Act
      editor.clear();
      
      // Assert
      const updatedPattern = editor.getPattern();
      for (let step = 0; step < updatedPattern.stepCount; step++) {
        const stepObj = updatedPattern.getStep(step);
        expect(stepObj.isEmpty()).toBe(true);
      }
    });
  });

  describe('empty pattern handling', () => {
    it('should allow saving a pattern with no notes', () => {
      // Act
      const isEmpty = editor.isEmpty();
      
      // Assert
      expect(isEmpty).toBe(true);
      expect(() => editor.getPattern()).not.toThrow();
    });

    it('should correctly identify non-empty pattern', () => {
      // Arrange
      editor.addNote(0, 0, new Note('C4', 0.5, 0));
      
      // Act
      const isEmpty = editor.isEmpty();
      
      // Assert
      expect(isEmpty).toBe(false);
    });
  });

  describe('helper methods', () => {
    it('should return correct step count', () => {
      expect(editor.getStepCount()).toBe(16);
    });

    it('should return correct channel count', () => {
      expect(editor.getChannelCount()).toBe(MAX_CHANNELS);
    });
  });
});
