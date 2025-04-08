import {chromaticScale, instruments, intervalNames, intervals, scaleIntervals} from './constants.js';

let flipped = true
let handedness = 'right';
let instrumentNotes = flipped ? ["G", "D", "A", "E"].reverse() : ["G", "D", "A", "E"];
let useSharps = true;
let activeNotes = [];
let selectedNote = '';
let selectedChord = '';
let selectedScale = '';
let frets = 22;

function toggleSharpsFlats() {
  useSharps = !useSharps;
  document.querySelectorAll('span.note').forEach(span => {
    const actualNote = span.getAttribute('data-actual-note');
    const parent = span.parentElement;
    span.textContent = getNoteRepresentation(actualNote);
    if (['chordNotes', 'scaleNotes'].includes(parent.id)) {
      const noteIndex = getNoteIndex(actualNote);
      const selectedNoteIndex = getNoteIndex(selectedNote);
      if (selectedNoteIndex !== -1) {
        const interval = (noteIndex - selectedNoteIndex + chromaticScale.length) % chromaticScale.length;
        const sup = document.createElement('sup');
        sup.textContent = intervalNames[interval];
        span.appendChild(sup);
      }
    }
  });
}

function updateSelectedButton(selectedButton) {
  document.querySelectorAll('.sunburst-button').forEach(button => {
    button.classList.remove('selected');
  });
  selectedButton.classList.add('selected');
}

function getNoteRepresentation(note) {
  if (!note) return note;
  const noteParts = note?.split('/');
  return noteParts.length > 1 ? (useSharps ? noteParts[0] : noteParts[1]) : note;
}

function createScaleGrid(scale) {
  let grid = [];
  for (let row = 0; row < scale.length; row++) {
    grid.push([...scale[row]]);
  }
  return grid;
}

function transformScale(scale) {
  return scale.map(row =>
    row.map(note => ({
      name: note,
      active: activeNotes.includes(note),
    }))
  );
}

function updateActiveNotes(scale, notes) {
  activeNotes.length = 0;
  activeNotes.push(...notes);
  const title = scale ? document.getElementById('scaleNotes') : document.getElementById('chordNotes');
  title.innerHTML = '';
  const titleForEmpty = scale ? document.getElementById('chordNotes') : document.getElementById('scaleNotes');
  titleForEmpty.innerHTML = '';
  [...notes].forEach((note) => {
    const span = document.createElement('span');
    span.classList.add('note');
    span.setAttribute('data-actual-note', note);
    span.textContent = getNoteRepresentation(note);
    const noteIndex = getNoteIndex(note);
    const selectedNoteIndex = getNoteIndex(selectedNote);
    if (selectedNoteIndex !== -1) {
      const interval = (noteIndex - selectedNoteIndex + chromaticScale.length) % chromaticScale.length;
      span.classList.add('note-interval', `interval-${interval}`);
      const sup = document.createElement('sup');
      sup.textContent = intervalNames[interval];
      span.appendChild(sup);
    }
    title.appendChild(span);
  });
}

function generateMusicalScale(startingNotes, frets) {
  const musicalScale = [];

  startingNotes.forEach(startNote => {
    const startIndex = chromaticScale.indexOf(startNote);
    const scale = [];
    for (let i = 0; i < frets + 1; i++) {
      scale.push(chromaticScale[(startIndex + i) % chromaticScale.length]);
    }
    musicalScale.push(scale);
  });

  return musicalScale;
}

function updateSelectedNoteSpans(name) {
  document.querySelectorAll('span.selected-note').forEach(span => {
    span.setAttribute('data-actual-note', name);
    span.textContent = getNoteRepresentation(name);
  });
}

function renderScaleGrid() {
  const musicalScale = generateMusicalScale(instrumentNotes, frets);
  const container = document.getElementById('neck');
  container.innerHTML = '';
  const scaleGrid = createScaleGrid(transformScale(musicalScale));

  if (handedness === 'left') {
    scaleGrid.forEach(row => {
      row.reverse();
    });
  }

  const topRow = createTopRow();
  if (flipped === true) {
    container.appendChild(topRow);
  }

  scaleGrid.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');
    row.forEach(({name, active}, index) => {
      const cell = document.createElement('div');
      const span = document.createElement('span');
      span.classList.add('note');
      span.setAttribute('data-actual-note', name);
      span.textContent = getNoteRepresentation(name);
      cell.appendChild(span);
      const noteIndex = getNoteIndex(name);
      const selectedNoteIndex = getNoteIndex(selectedNote);
      if (selectedNoteIndex !== -1) {
        const interval = (noteIndex - selectedNoteIndex + chromaticScale.length) % chromaticScale.length;
        cell.classList.add(`interval-${interval}`);
      }
      cell.classList.add('cell');
      if (active) {
        cell.classList.add('active');
      }
      if (index === 0) {
        cell.classList.add('open-note');
      }
      cell.addEventListener('click', () => {
        selectedNote = name;
        document.querySelectorAll('.sunburst-button.disabled').forEach(button => {
          button.classList.remove('disabled');
        });
        activeNotes.length = 0;
        if (selectedScale !== '') {
          const notes = getScale(name, selectedScale);
          updateActiveNotes(true, notes);
        } else if (selectedChord !== '') {
          const notes = getChord(name, selectedChord);
          updateActiveNotes(false, notes);
        } else {
          updateActiveNotes(false, [name]);
        }
        //updateSelectedNoteSpans(name);
        renderScaleGrid();
      });
      rowDiv.appendChild(cell);
    });
    container.appendChild(rowDiv);
  });

  if (flipped === false) {
    container.appendChild(topRow);
  }

  document.querySelectorAll('.sunburst-table .cell.active').forEach((cell) => {
    const randomValue = new Uint32Array(1);
    window.crypto.getRandomValues(randomValue);
    cell.style.setProperty('--animation-order', String(randomValue[0] / (2 ** 32)));
  });
}

function createButton(label) {
  const button = document.createElement('button');
  button.textContent = label.charAt(0).toUpperCase() + label.slice(1).replace(/([A-Z0-9])/g, ' $1');
  button.classList.add('sunburst-button', 'disabled');
  return button;
}

function generateButtons() {
  const chordsContainer = document.getElementById('chordsContainer');
  const scalesContainer = document.getElementById('scalesContainer');

  Object.keys(intervals).forEach(key => {
    const button = createButton(key);
    button.addEventListener('click', () => {
      const notes = getChord(selectedNote, key);
      updateActiveNotes(false, notes);
      updateSelectedButton(button);
      selectedChord = key;
      selectedScale = '';
      renderScaleGrid();
    });
    chordsContainer.appendChild(button);
  });

  Object.keys(scaleIntervals).forEach(key => {
    const button = createButton(key);
    button.addEventListener('click', () => {
      const notes = getScale(selectedNote, key);
      updateActiveNotes(true, notes);
      updateSelectedButton(button);
      selectedScale = key;
      selectedChord = '';
      renderScaleGrid();
    });
    scalesContainer.appendChild(button);
  });
}

function createTopRow() {
  const topRow = document.createElement('div');
  topRow.classList.add('row');
  const cells = [];
  for (let i = 0; i <= frets; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    if (i === 0) cell.classList.add('no-border');
    cell.textContent = [3, 5, 7, 9, 15, 17, 19, 21].includes(i) ? '•' : [12, 24].includes(i) ? '••' : '';
    cells.push(cell);
  }

  if (handedness === 'left') {
    cells.reverse();
  }

  cells.forEach(cell => {
    topRow.appendChild(cell);
  })

  return topRow;
}

function populateInstrumentSelect() {
  const instrumentSelect = document.getElementById('instrumentSelect');
  instrumentSelect.innerHTML = '';

  for (const instrument in instruments) {
    const option = document.createElement('option');
    option.value = instrument;
    option.textContent = instrument.charAt(0).toUpperCase() + instrument.slice(1).replace(/([A-Z])/g, ' $1');
    instrumentSelect.appendChild(option);
  }
}

function handleInstrumentChange(event) {
  instrumentNotes = instruments[event.target.value].reverse();
  renderScaleGrid();
}


function getNoteIndex(note) {
  return chromaticScale.indexOf(note);
}

function getChord(root, type) {
  const index = getNoteIndex(root);
  if (index === -1) return null;
  if (!intervals[type]) return null;
  return intervals[type].map(i => chromaticScale[(index + i) % chromaticScale.length]);
}


function getScale(root, type) {
  const index = getNoteIndex(root);
  if (index === -1) return null;
  if (!scaleIntervals[type]) return null;
  return scaleIntervals[type].map(i => chromaticScale[(index + i) % chromaticScale.length]);
}

document.addEventListener('DOMContentLoaded', () => {
  populateInstrumentSelect();
  renderScaleGrid();
  generateButtons();

  document.getElementById('sharpsFlatsToggle').addEventListener('click', toggleSharpsFlats);
  document.getElementById('instrumentSelect').addEventListener('change', handleInstrumentChange);

  document.getElementById('handednessSelect').addEventListener('change', (event) => {
    const neck = document.getElementById('neck');
    if (event.target.value === 'left') {
      handedness = 'left';
      neck.classList.remove('ltr');
      neck.classList.add('rtl');
    } else {
      handedness = 'right';
      neck.classList.remove('rtl');
      neck.classList.add('ltr');
    }
    renderScaleGrid();
  });

  document.getElementById('flipNeckSelect').addEventListener('change', (event) => {
    flipped = event.target.value !== 'flipped';
    instrumentNotes = instrumentNotes.reverse();
    renderScaleGrid();
  });

  document.getElementById('fretCountSelect').addEventListener('change', (event) => {
    frets = parseInt(event.target.value, 10);
    renderScaleGrid();
  });
});