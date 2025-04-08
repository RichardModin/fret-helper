import {chromaticScale, intervalNames, intervals, scaleIntervals} from "./constants.js";

class NoteUtils {
  static useSharps = true;

  static getNoteIndex(note) {
    return chromaticScale.indexOf(note);
  }

  static getNoteRepresentation(note) {
    if (!note) return note;
    const parts = note.split('/');
    return parts.length > 1 ? (NoteUtils.useSharps ? parts[0] : parts[1]) : note;
  }

  static getChord(root, type) {
    const index = NoteUtils.getNoteIndex(root);
    if (index === -1 || !intervals[type]) return null;
    return intervals[type].map(i => chromaticScale[(index + i) % chromaticScale.length]);
  }

  static getScale(root, type) {
    const index = NoteUtils.getNoteIndex(root);
    if (index === -1 || !scaleIntervals[type]) return null;
    return scaleIntervals[type].map(i => chromaticScale[(index + i) % chromaticScale.length]);
  }

  static toggleSharpsFlats(selectedNoteIndex) {
    NoteUtils.useSharps = !NoteUtils.useSharps;
    document.querySelectorAll('span.note').forEach(span => {
      const actualNote = span.getAttribute('data-actual-note');
      const parent = span.parentElement;
      span.textContent = NoteUtils.getNoteRepresentation(actualNote);
      if (['chordNotes', 'scaleNotes'].includes(parent.id)) {
        const noteIndex = NoteUtils.getNoteIndex(actualNote);
        if (selectedNoteIndex !== -1) {
          const interval = (noteIndex - selectedNoteIndex + chromaticScale.length) % chromaticScale.length;
          const sup = document.createElement('sup');
          sup.textContent = intervalNames[interval];
          span.appendChild(sup);
        }
      }
    });
  }
}

export default NoteUtils;