import { chromaticScale, instruments, intervalNames, intervals, scaleIntervals, modes } from './app/constants.js';
import NoteUtils from "./app/NoteUtils.js";
import NeckRenderer from "./app/NeckRenderer.js";

/**
 * MusicApp class to manage the music application.
 */
class MusicApp {

  /**
   * Constructor to initialize the MusicApp instance.
   */
  constructor() {
    this.flipped = true;
    this.handedness = 'right';
    this.instrumentNotes = ["G", "D", "A", "E"].reverse();
    this.frets = 22;
    this.activeNotes = [];
    this.selectedNote = '';
    this.selectedChord = '';
    this.selectedScale = '';
    this.renderer = new NeckRenderer(this);
    this.dotOn = 9;
  }

  /**
   * Handle the click event on a note in the sunburst UI.
   * @param name
   */
  handleNoteClick(name) {
    this.selectedNote = name;
    this.activeNotes = [];

    document.querySelectorAll('.sunburst-button.disabled').forEach(btn => btn.classList.remove('disabled'));

    if (this.selectedScale) {
      this.activeNotes = NoteUtils.getScale(name, this.selectedScale);
      this.updateNoteDisplay(true);
      if (modes[this.selectedScale]) {
        this.generateMode(this.selectedScale, this.selectedNote); // Only handle Major and Minor scales
      } else {
        this.emptyKeyChords();
      }
    } else if (this.selectedChord) {
      this.activeNotes = NoteUtils.getChord(name, this.selectedChord);
      this.updateNoteDisplay(false);
      this.emptyKeyChords();
    } else {
      this.activeNotes = [name];
      this.updateNoteDisplay(false);
      this.emptyKeyChords();
    }

    this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
  }

  /**
   * Update the display of notes in the sunburst UI.
   * @param isScale
   */
  updateNoteDisplay(isScale) {
    const main = isScale ? 'scaleNotes' : 'chordNotes';
    const other = isScale ? 'chordNotes' : 'scaleNotes';

    document.getElementById(main).innerHTML = '';
    document.getElementById(other).innerHTML = '';

    this.activeNotes.forEach(note => {
      const interval = (NoteUtils.getNoteIndex(note) - NoteUtils.getNoteIndex(this.selectedNote) + chromaticScale.length) % chromaticScale.length;
      const span = this.createNoteSpan(note, interval);
      const sup = document.createElement('sup');
      sup.textContent = intervalNames[interval];
      span.appendChild(sup);
      document.getElementById(main).appendChild(span);
    });
  }

  /**
   * Create a span element for a note with its interval.
   * @param note
   * @param interval
   * @returns {HTMLSpanElement}
   */
  createNoteSpan(note, interval) {
    const span = document.createElement('span');
    span.classList.add('note');
    span.setAttribute('data-actual-note', note);
    span.textContent = NoteUtils.getNoteRepresentation(note);
    span.classList.add('note-interval', `interval-${interval}`)
    return span;
  }

  buttonClickBase() {
    this.emptyKeyChords();
    this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
  }

  handleScaleButtonClick(scaleKey) {
    this.selectedScale = scaleKey;
    this.selectedChord = '';
    this.activeNotes = NoteUtils.getScale(this.selectedNote, scaleKey);
    this.updateNoteDisplay(true);
    this.buttonClickBase(this);
    if (modes[scaleKey]) {
      this.generateMode(scaleKey, this.selectedNote); // Only handle Major and Minor scales
    } else {
      this.emptyKeyChords();
    }
  }

  handleChordButtonClick(chordKey) {
    this.selectedChord = chordKey;
    this.selectedScale = '';
    this.activeNotes = NoteUtils.getChord(this.selectedNote, chordKey);
    this.updateNoteDisplay(false);
    this.buttonClickBase();
  }

   /**
   * Generate chords in the key for the selected scale and root note.
   * @param scaleType - The type of scale (e.g., 'major', 'minor').
   * @param rootNote - The root note of the scale (e.g., 'C', 'D').
   */
   generateMode(scaleType, rootNote) {
    const keyChordsContainer = document.getElementById('keyChords');
    keyChordsContainer.innerHTML = '';

    const scale = scaleIntervals[scaleType];
    const chords = modes[scaleType];

    if (!scale || !chords) {
      return;
    }

    // Generate the notes in the scale
    const scaleNotes = scale.map(interval => {
      const noteIndex = (chromaticScale.indexOf(rootNote) + interval) % chromaticScale.length;
      return chromaticScale[noteIndex];
    });

    // Create spans for each chord in the scale
    scaleNotes.forEach((note, index) => {
      const interval = (NoteUtils.getNoteIndex(note) - NoteUtils.getNoteIndex(this.selectedNote) + chromaticScale.length) % chromaticScale.length;
      const span = this.createNoteSpan(note, interval);
      const sup = document.createElement('sup');
      sup.textContent = chords[index];
      span.appendChild(sup);
      keyChordsContainer.appendChild(span);
    });
  }

  /**
   * Clear the key chords display.
   */
  emptyKeyChords() {
    const keyChordsContainer = document.getElementById('keyChords');
    keyChordsContainer.innerHTML = ''; // Clear existing content
  }

  /**
   * Initialize event listeners for various UI elements.
   */
  initEventListeners() {
    document.getElementById('sharpsFlatsToggle').addEventListener('click', () => {
      NoteUtils.toggleSharpsFlats();
    });
    document.getElementById('instrumentSelect').addEventListener('change', e => {
      this.instrumentNotes = instruments[e.target.value].slice().reverse();
      this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
    });

    document.getElementById('handednessSelect').addEventListener('change', e => {
      this.handedness = e.target.value;
      const neck = document.getElementById('neck');
      neck.classList.toggle('rtl', this.handedness === 'left');
      neck.classList.toggle('ltr', this.handedness === 'right');
      this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
    });

    document.getElementById('flipNeckSelect').addEventListener('change', e => {
      this.flipped = e.target.value !== 'flipped';
      this.instrumentNotes.reverse();
      this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
    });

    document.getElementById('fretCountSelect').addEventListener('change', e => {
      this.frets = parseInt(e.target.value, 10);
      this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
    });

    document.getElementById('dotPositionSelect').addEventListener('change', (event) => {
      this.dotOn = parseInt(event.target.value, 10);
      this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
    });

    document.querySelectorAll('.chord-button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.sunburst-button.selected')?.classList.remove('selected');
        e.target.classList.add('selected');
        const value = e.target.getAttribute('data-value');
        this.handleChordButtonClick(value);
      });
    });

    document.querySelectorAll('.scale-button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.sunburst-button.selected')?.classList.remove('selected');
        e.target.classList.add('selected');
        const value = e.target.getAttribute('data-value');
        this.handleScaleButtonClick(value);
      });
    });
  }

  /**
   * Start the application by populating the instrument select, rendering the neck, and generating buttons.
   */
  start() {
    this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
    this.initEventListeners();
  }
}

const app = new MusicApp();
document.addEventListener('DOMContentLoaded', () => app.start());
