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

  /**
   * Populate the instrument select dropdown with available instruments.
   */
  populateInstrumentSelect() {
    const select = document.getElementById('instrumentSelect');
    select.innerHTML = '';
    for (const name in instruments) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
      select.appendChild(option);
    }
  }

  /**
   * Generate buttons for chords and scales.
   */
  generateButtons() {
    const chordsContainer = document.getElementById('chordsContainer');
    const scalesContainer = document.getElementById('scalesContainer');

    const createBtn = (key, isScale) => {
      const button = document.createElement('button');
      button.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z0-9])/g, ' $1');
      button.classList.add('sunburst-button', 'disabled');
      button.addEventListener('click', () => {
        if (isScale) {
          if (modes[key]) {
            this.generateMode(key, this.selectedNote); // Only handle Major and Minor scales
          } else {
            this.emptyKeyChords();
          }
          this.activeNotes = NoteUtils.getScale(this.selectedNote, key);
          this.selectedScale = key;
          this.selectedChord = '';
          this.updateNoteDisplay(true);
        } else {
          this.activeNotes = NoteUtils.getChord(this.selectedNote, key);
          this.selectedScale = '';
          this.selectedChord = key;
          this.updateNoteDisplay(false);
          this.emptyKeyChords();
        }
        this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
        this.updateSelectedButton(button);
      });
      return button;
    };

    Object.keys(intervals).forEach(key => chordsContainer.appendChild(createBtn(key, false)));
    Object.keys(scaleIntervals).forEach(key => scalesContainer.appendChild(createBtn(key, true)));
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
   * Update the selected button in the sunburst UI.
   * @param button
   */
  updateSelectedButton(button) {
    document.querySelectorAll('.sunburst-button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
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
  }

  /**
   * Start the application by populating the instrument select, rendering the neck, and generating buttons.
   */
  start() {
    this.populateInstrumentSelect();
    this.renderer.render(NoteUtils.getNoteIndex(this.selectedNote));
    this.generateButtons();
    this.initEventListeners();
  }
}

const app = new MusicApp();
document.addEventListener('DOMContentLoaded', () => app.start());
