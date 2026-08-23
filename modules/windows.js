/**
 * Screen-relative rectangle. Each component is a 0..1 fraction of the screen.
 * @typedef {{ x: number, y: number, w: number, h: number }} WindowUnit
 */

function toggleZoom() {
  const win = hs.window.focusedWindow();
  /** @type {HSAXElement | null} */
  const zoomButton = win?.axElement().attributeValue("AXZoomButton");
  zoomButton?.performAction("AXZoomWindow");
}

const units = {
  left50: { x: 0, y: 0, w: 0.5, h: 1 },
  right50: { x: 0.5, y: 0, w: 0.5, h: 1 },
  left70: { x: 0, y: 0, w: 0.7, h: 1 },
  right30: { x: 0.7, y: 0, w: 0.3, h: 1 },
  bottomLeft: { x: 0, y: 0.5, w: 0.5, h: 0.5 },
  bottomRight: { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
};

/** @param {WindowUnit} unit */
function place(unit) {
  return () => {
    const win = hs.window.focusedWindow();
    if (!win?.screen) {
      return;
    }
    const area = win.screen.frame;
    const frame = win.frame;
    if (!frame) {
      return;
    }
    frame.x = Math.round(area.x + unit.x * area.w);
    frame.y = Math.round(area.y + unit.y * area.h);
    frame.w = Math.round(unit.w * area.w);
    frame.h = Math.round(unit.h * area.h);
    win.frame = frame;
  };
}
