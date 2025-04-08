import {chromaticScale} from "./constants.js";
import NoteUtils from "./NoteUtils.js";

class NeckRenderer {
  constructor(app) {
    this.app = app;
  }

  createTopRow() {
    const topRow = document.createElement('div');
    topRow.classList.add('row');
    const cells = [];

    for (let i = 0; i <= this.app.frets; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (i === 0) cell.classList.add('no-border');
      cell.textContent = [3, 5, 7, 9, 15, 17, 19, 21].includes(i) ? '•' : [12, 24].includes(i) ? '••' : '';
      cells.push(cell);
    }

    if (this.app.handedness === 'left') cells.reverse();
    cells.forEach(cell => topRow.appendChild(cell));
    return topRow;
  }

  generateMusicalScale(startingNotes) {
    return startingNotes.map(startNote => {
      const startIndex = NoteUtils.getNoteIndex(startNote);
      return Array.from({ length: this.app.frets + 1 }, (_, i) =>
        chromaticScale[(startIndex + i) % chromaticScale.length]
      );
    });
  }

  transformScale(scale) {
    return scale.map(row => row.map(note => ({
      name: note,
      active: this.app.activeNotes.includes(note),
    })));
  }

  render(selectedNoteIndex) {
    const musicalScale = this.generateMusicalScale(this.app.instrumentNotes);
    const container = document.getElementById('neck');
    container.innerHTML = '';
    const scaleGrid = this.transformScale(musicalScale);

    if (this.app.handedness === 'left') {
      scaleGrid.forEach(row => row.reverse());
    }

    const topRow = this.createTopRow();
    if (this.app.flipped) container.appendChild(topRow);

    scaleGrid.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');

      row.forEach(({ name, active }, index) => {
        const cell = document.createElement('div');
        const span = document.createElement('span');
        span.classList.add('note');
        span.setAttribute('data-actual-note', name);
        span.textContent = NoteUtils.getNoteRepresentation(name);
        cell.appendChild(span);

        const noteIndex = NoteUtils.getNoteIndex(name);
        if (selectedNoteIndex !== -1) {
          const interval = (noteIndex - selectedNoteIndex + chromaticScale.length) % chromaticScale.length;
          cell.classList.add(`interval-${interval}`);
        }

        cell.classList.add('cell');
        if (active) cell.classList.add('active');
        if (index === 0) cell.classList.add('open-note');

        cell.addEventListener('click', () => this.app.handleNoteClick(name));
        rowDiv.appendChild(cell);
      });

      container.appendChild(rowDiv);
    });

    if (!this.app.flipped) container.appendChild(topRow);
  }
}

export default NeckRenderer;