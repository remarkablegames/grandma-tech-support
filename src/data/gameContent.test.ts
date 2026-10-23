import type {
  IconWindowId,
  IconWindowRow,
  StartMenuSubmenuItem,
} from 'src/types/game';

import { ICON_WINDOWS, rowContextMenu, START_ITEMS } from './gameContent';

// Start > Documents mirrors the real My Documents window: same files, same
// order, same icons, each leaf opening the window its folder row opens.
// Change one side alone and this test says so.
describe('gameContent data', () => {
  it('keeps the Start > Documents flyout in step with My Documents', () => {
    const documents = START_ITEMS.find(
      (item): item is StartMenuSubmenuItem =>
        item.id === 'documents' && 'children' in item,
    );

    if (documents === undefined) {
      throw new Error('Start > Documents should be a submenu');
    }

    const folder = ICON_WINDOWS.find((config) => config.id === 'documents');

    if (folder?.kind !== 'list') {
      throw new Error('My Documents should be a list window');
    }

    const [opener, ...files] = documents.children;

    expect(opener).toMatchObject({
      id: 'my-documents',
      label: folder.title,
      icon: folder.icon,
      iconWindowId: 'documents',
    });

    expect(
      files.map((file) => {
        if (!('iconWindowId' in file)) {
          throw new Error(
            `Start > Documents leaf ${file.id} should open a window`,
          );
        }

        return {
          label: file.label,
          icon: file.icon,
          iconWindowId: file.iconWindowId,
        };
      }),
    ).toEqual(
      folder.rows.map((row) => ({
        label: row.label,
        icon: row.icon,
        iconWindowId: row.opens,
      })),
    );
  });

  it('offers Restore only on deleted files inside the Recycle Bin', () => {
    const labels = (row: IconWindowRow, windowId: IconWindowId): string[] =>
      rowContextMenu(row, windowId).flatMap((item) =>
        'label' in item ? [item.label] : [],
      );

    const deleted: IconWindowRow = {
      label: 'Sticky Notes',
      desktopId: 'notes',
    };

    // The bin's file menu carries Win95's Restore on the file itself...
    expect(labels(deleted, 'recycle')).toContain('Restore');
    // ...a row without a desktop id never does, wherever it sits...
    expect(labels({ label: 'ghost' }, 'recycle')).not.toContain('Restore');
    // ...and folders, which hold nothing to restore, stay pure file menus.
    expect(labels(deleted, 'documents')).not.toContain('Restore');
  });
});
