import { Pattern, Note, Step } from '../domain';

/**
 * PatternEditor provides a mutable interface for editing patterns.
 * It wraps the immutable Pattern entity and updates it internally.
 * Enforces channel limits and validates step bounds.
 */
export class PatternEditor {
  private currentPattern: Pattern;
  private readonly maxChannels: number;

  constructor(pattern: Pattern, maxChannels: number = 8) {
    this.currentPattern = pattern;
    this.maxChannels = maxChannels;
  }

  /**
   * Add a note at the specified step and channel.
   * Replaces any existing note at that channel for that step.
   * 
   * @throws {Error} if channel exceeds max channel limit
   * @throws {Error} if step is out of bounds
   */
  addNote(stepIndex: number, channelIndex: number, note: Note): void {
    this.validateChannelIndex(channelIndex);
    this.validateStepIndex(stepIndex);

    // Create note with the specified channel
    const noteWithChannel = new Note(note.pitch, note.duration, channelIndex);

    // Remove existing note at this channel if any, then add the new note
    const step = this.currentPattern.getStep(stepIndex);
    let updatedStep = step.removeNoteAtChannel(channelIndex);
    updatedStep = updatedStep.addNote(noteWithChannel);

    // Create new pattern with updated step
    const newSteps = [...this.currentPattern.getAllSteps()];
    newSteps[stepIndex] = updatedStep;
    this.currentPattern = new Pattern(
      this.currentPattern.id,
      this.currentPattern.name,
      this.currentPattern.stepCount,
      newSteps
    );
  }

  /**
   * Remove a note from the specified step and channel.
   * Does not throw if the position is already empty.
   * 
   * @throws {Error} if channel exceeds max channel limit
   * @throws {Error} if step is out of bounds
   */
  removeNote(stepIndex: number, channelIndex: number): void {
    this.validateChannelIndex(channelIndex);
    this.validateStepIndex(stepIndex);

    const step = this.currentPattern.getStep(stepIndex);
    const updatedStep = step.removeNoteAtChannel(channelIndex);

    const newSteps = [...this.currentPattern.getAllSteps()];
    newSteps[stepIndex] = updatedStep;
    this.currentPattern = new Pattern(
      this.currentPattern.id,
      this.currentPattern.name,
      this.currentPattern.stepCount,
      newSteps
    );
  }

  /**
   * Move a note from source position to target position.
   * Removes the note from source and adds it to target.
   * 
   * @throws {Error} if source position has no note
   * @throws {Error} if any channel index exceeds max channel limit
   * @throws {Error} if any step index is out of bounds
   */
  moveNote(
    sourceStep: number,
    sourceChannel: number,
    targetStep: number,
    targetChannel: number
  ): void {
    this.validateChannelIndex(sourceChannel);
    this.validateChannelIndex(targetChannel);
    this.validateStepIndex(sourceStep);
    this.validateStepIndex(targetStep);

    const sourceStepObj = this.currentPattern.getStep(sourceStep);
    const note = sourceStepObj.getNoteForChannel(sourceChannel);

    if (!note) {
      throw new Error('No note at source position');
    }

    // Remove from source
    this.removeNote(sourceStep, sourceChannel);
    
    // Add to target
    this.addNote(targetStep, targetChannel, note);
  }

  /**
   * Clear all notes from the pattern.
   */
  clear(): void {
    const emptySteps: Step[] = [];
    for (let i = 0; i < this.currentPattern.stepCount; i++) {
      emptySteps.push(new Step(i));
    }
    this.currentPattern = new Pattern(
      this.currentPattern.id,
      this.currentPattern.name,
      this.currentPattern.stepCount,
      emptySteps
    );
  }

  /**
   * Check if the pattern has no notes.
   */
  isEmpty(): boolean {
    return this.currentPattern.isEmpty();
  }

  /**
   * Get the current pattern.
   */
  getPattern(): Pattern {
    return this.currentPattern;
  }

  /**
   * Get the step count of the pattern.
   */
  getStepCount(): number {
    return this.currentPattern.stepCount;
  }

  /**
   * Get the max channel count.
   */
  getChannelCount(): number {
    return this.maxChannels;
  }

  private validateChannelIndex(channelIndex: number): void {
    if (channelIndex >= this.maxChannels) {
      throw new Error(`Channel ${channelIndex} exceeds pattern channel limit`);
    }
    if (channelIndex < 0) {
      throw new Error(`Channel ${channelIndex} is negative`);
    }
  }

  private validateStepIndex(stepIndex: number): void {
    if (stepIndex >= this.currentPattern.stepCount) {
      throw new Error(`Step ${stepIndex} is out of bounds`);
    }
    if (stepIndex < 0) {
      throw new Error(`Step ${stepIndex} is negative`);
    }
  }
}
