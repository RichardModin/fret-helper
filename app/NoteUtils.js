import {chromaticScale, intervalNames, intervals, scaleIntervals, modes} from "./constants.js";

/**
 * NoteUtils class to manage musical notes and their representations.
 */
class NoteUtils {
  static useSharps = true;

  /**
   * Get the index of a note in the chromatic scale.
   * @param note
   * @returns {*}
   */
  static getNoteIndex(note) {
    return chromaticScale.indexOf(note);
  }

  /**
   * Get the representation of a note based on the current setting of sharps or flats.
   * @param note
   * @returns {*}
   */
  static getNoteRepresentation(note) {
    if (!note) return note;
    const parts = note.split('/');
    return parts.length > 1 ? (NoteUtils.useSharps ? parts[0] : parts[1]) : note;
  }

  /**
   * Get the notes in the Chord based on the root note and chord type.
   * @param root
   * @param type
   * @returns {*|null}
   */
  static getChord(root, type) {
    const index = NoteUtils.getNoteIndex(root);
    if (index === -1 || !intervals[type]) return null;
    return intervals[type].map(i => chromaticScale[(index + i) % chromaticScale.length]);
  }

  /**
   * Get the notes in the Scale based on the root note and scale type.
   * @param root
   * @param type
   * @returns {*|null}
   */
  static getScale(root, type) {
    const index = NoteUtils.getNoteIndex(root);
    if (index === -1 || !scaleIntervals[type]) return null;
    return scaleIntervals[type].map(i => chromaticScale[(index + i) % chromaticScale.length]);
  }

  /**
   * Update the display of notes in the sunburst UI to be sharps or flats.
   * @param selectedNoteIndex
   */
  static toggleSharpsFlats() {
    NoteUtils.useSharps = !NoteUtils.useSharps;
    document.querySelectorAll('span.note').forEach(span => {
      const actualNote = span.getAttribute('data-actual-note');
      const newNote = NoteUtils.getNoteRepresentation(actualNote)
      const sup = span.querySelector('sup');
      span.textContent = newNote;
      if (sup) {
        span.appendChild(sup);
      }
    });
  }
}

export default NoteUtils;