import type { Song, SongDataExportResult } from '@/domain/models/types'

/**
 * Exported song data format
 */
interface ExportedSongData extends Song {
  /** Export format version */
  version: string
  /** Export timestamp */
  exportedAt: string
}

/**
 * Exports song data to JSON format.
 * 
 * Responsibilities:
 * - Serialize song structure to JSON
 * - Include patterns, order, and BPM
 * - Add metadata (version, timestamp)
 * - Handle empty patterns gracefully
 */
export class SongDataExporter {
  private readonly VERSION = '1.0'

  /**
   * Export song data to JSON format
   */
  export(song: Song): SongDataExportResult {
    const exportData = this.createExportData(song)
    const jsonString = JSON.stringify(exportData, null, 2)
    
    return {
      data: jsonString,
      size: this.calculateSize(jsonString),
    }
  }

  /**
   * Create the export data structure
   */
  private createExportData(song: Song): ExportedSongData {
    return {
      version: this.VERSION,
      exportedAt: new Date().toISOString(),
      title: song.title,
      bpm: song.bpm,
      channelCount: song.channelCount,
      stepsPerBeat: song.stepsPerBeat,
      patterns: song.patterns.map((pattern) => ({
        id: pattern.id,
        name: pattern.name,
        stepsCount: pattern.stepsCount,
        channels: pattern.channels.map((channel) => ({
          waveform: channel.waveform,
          steps: channel.steps.map((step) => ({
            note: step.note
              ? {
                  pitch: step.note.pitch,
                  duration: step.note.duration,
                  volume: step.note.volume,
                }
              : null,
          })),
        })),
      })),
      patternOrder: [...song.patternOrder],
    }
  }

  /**
   * Calculate the byte size of the JSON string
   */
  private calculateSize(jsonString: string): number {
    const encoder = new TextEncoder()
    return encoder.encode(jsonString).length
  }
}
