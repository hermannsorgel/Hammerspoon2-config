// Spotlight lacks next to Alfred/Raycast:
// - a forced keyboard layout
// - dedicated keybindings for the clipboard and action sections

/** @type {HSTimer | null} */
let spotlightFollowUp = null;

/** @param {string} [followUpKey] */
function openSpotlight(followUpKey) {
  hs.eventtap.keyStroke(["alt", "shift", "cmd"], "space");
  if (followUpKey) {
    spotlightFollowUp = hs.timer.doAfter(
      0.1,
      () => hs.eventtap.keyStroke(["cmd"], followUpKey),
    );
  }
}

function spotlight() {
  hs.keycodes.setLayout("U.S.");
  openSpotlight();
}

function spotlightClipboard() {
  openSpotlight("4");
}

function spotlightActions() {
  openSpotlight("3");
}
