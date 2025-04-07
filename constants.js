const frets = 22;

const instruments = {
  mandolin: ["G", "D", "A", "E"],
  guitar: ["E", "A", "D", "G", "B", "E"],
  bass: ["E", "A", "D", "G"],
  ukulele: ["G", "C", "E", "A"],
  banjo: ["G", "D", "G", "B", "D"],
  sevenStringGuitar: ["B", "E", "A", "D", "G", "B", "E"],
  fiveStringBass: ["B", "E", "A", "D", "G"],
  openCGuitar: ["C", "G", "C", "G", "C", "E"],
  openDGuitar: ["D", "A", "D", "F#/Gb", "A", "D"],
  openEGuitar: ["E", "B", "E", "G#/Ab", "B", "E"],
  openGGuitar: ["D", "G", "D", "G", "B", "D"]
};

const intervalNames = {
  0: 'Perfect unison',
  1: 'Minor second',
  2: 'Major second',
  3: 'Minor third',
  4: 'Major third',
  5: 'Perfect fourth',
  6: 'Diminished fifth',
  7: 'Perfect fifth',
  8: 'Minor sixth',
  9: 'Major sixth',
  10: 'Minor seventh',
  11: 'Major seventh',
  12: 'Perfect octave',
}

const intervals = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  major9: [0, 4, 7, 11, 14],
  minor9: [0, 3, 7, 10, 14],
  dominant9: [0, 4, 7, 10, 14],
  diminished: [0, 3, 6],
  diminished7: [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10],
  augmented: [0, 4, 8],
  augmented7: [0, 4, 8, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  sixth: [0, 4, 7, 9],
  minor6: [0, 3, 7, 9],
  eleventh: [0, 4, 7, 10, 14, 17],
  thirteenth: [0, 4, 7, 10, 14, 17, 21]
};

const chromaticScale = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];

const scaleIntervals = {
  chromaticScale: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
};

export {
  frets,
  intervalNames,
  instruments,
  chromaticScale,
  intervals,
  scaleIntervals
}