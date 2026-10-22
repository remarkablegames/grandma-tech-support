interface FlyoutAnchor {
  top: number;
  right: number;
}

interface FlyoutSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

// Where a Start-menu flyout sits: flush against its parent item's right edge
// and top, nudged back inside the screen the moment it would clip — the same
// edge discipline createWindowDrag applies to a dragging title bar. Kept
// branch-free so jsdom's zeroed rects and real pixels share one code path.
export function getFlyoutPosition(
  anchor: FlyoutAnchor,
  size: FlyoutSize,
  viewport: Viewport,
): { left: number; top: number } {
  return {
    left: Math.min(
      Math.max(anchor.right, 0),
      Math.max(viewport.width - size.width, 0),
    ),
    top: Math.min(
      Math.max(anchor.top, 0),
      Math.max(viewport.height - size.height, 0),
    ),
  };
}
