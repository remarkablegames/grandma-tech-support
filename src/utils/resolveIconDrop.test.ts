import type { DesktopIconConfig } from 'src/types/game';

import { resolveIconDrop } from './resolveIconDrop';

const bin: DesktopIconConfig = {
  id: 'recycle',
  label: 'Recycle Bin',
  icon: 'bin.png',
  container: 'recycle',
};

const folder: DesktopIconConfig = {
  id: 'documents',
  label: 'My Documents',
  icon: 'folder.png',
  container: 'folder',
};

const computer: DesktopIconConfig = {
  id: 'computer',
  label: 'My Computer',
  icon: 'computer.png',
  system: true,
};

const notes: DesktopIconConfig = {
  id: 'notes',
  label: 'Sticky Notes',
  icon: 'notes.png',
};

const calculator: DesktopIconConfig = {
  id: 'calculator',
  label: 'Calculator',
  icon: 'calculator.png',
};

const icons = [bin, folder, computer, notes, calculator];

const positions = {
  recycle: { col: 0, row: 1 },
  documents: { col: 0, row: 2 },
  computer: { col: 0, row: 0 },
  notes: { col: 0, row: 4 },
  calculator: { col: 2, row: 3 },
};

describe('resolveIconDrop', () => {
  it('moves onto an empty cell', () => {
    expect(resolveIconDrop(notes, { col: 5, row: 5 }, positions, icons)).toBe(
      'move',
    );
  });

  it('moves onto another shortcut, overlap and all', () => {
    expect(resolveIconDrop(notes, positions.calculator, positions, icons)).toBe(
      'move',
    );
  });

  it('stays a move when the drop lands on the icon’s own cell', () => {
    expect(resolveIconDrop(notes, positions.notes, positions, icons)).toBe(
      'move',
    );
  });

  it('recycles a shortcut dropped on the bin', () => {
    expect(resolveIconDrop(notes, positions.recycle, positions, icons)).toBe(
      'recycle',
    );
  });

  it('files a shortcut dropped on My Documents', () => {
    expect(
      resolveIconDrop(calculator, positions.documents, positions, icons),
    ).toBe('file');
  });

  it('refuses to drop a container into another container', () => {
    expect(resolveIconDrop(bin, positions.documents, positions, icons)).toBe(
      'refuse',
    );
    expect(resolveIconDrop(folder, positions.recycle, positions, icons)).toBe(
      'refuse',
    );
  });

  it('refuses to drop a system icon into the bin', () => {
    expect(resolveIconDrop(computer, positions.recycle, positions, icons)).toBe(
      'refuse',
    );
  });

  it('refuses drops onto system icons', () => {
    expect(resolveIconDrop(notes, positions.computer, positions, icons)).toBe(
      'refuse',
    );
  });

  it('lets the bin win when containers overlap', () => {
    const stacked = {
      ...positions,
      documents: positions.recycle,
    };

    expect(resolveIconDrop(notes, positions.recycle, stacked, icons)).toBe(
      'recycle',
    );
    expect(resolveIconDrop(computer, positions.recycle, stacked, icons)).toBe(
      'refuse',
    );
  });
});
