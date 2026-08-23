const doubleTapGap = 350;

const doubleTapTypes = hs.eventtap.eventTypes;
const doubleTapFlags = hs.eventtap.modifierFlags;
const doubleTapMask =
  doubleTapFlags.cmd |
  doubleTapFlags.alt |
  doubleTapFlags.ctrl |
  doubleTapFlags.shift;

/** @type {Record<number, () => void>} */
const doubleTapActions = {};

/** @type {HSEventTap | null} */
let doubleTapWatcher = null;

let doubleTapPrev = 0;
let doubleTapCandidate = 0;
let doubleTapLastMod = 0;
let doubleTapLastAt = 0;

/**
 * @param {HSEventTapEvent} event
 * @returns {undefined}
 */
function handleDoubleTap(event) {
  // a key or click while the modifier is held makes it a chord, not a tap
  if (event.type !== doubleTapTypes.flagsChanged) {
    doubleTapCandidate = 0;
    return;
  }

  const active = event.rawFlags & doubleTapMask;
  const prev = doubleTapPrev;
  doubleTapPrev = active;

  if (active) {
    // only a bound modifier pressed from nothing can become a tap
    doubleTapCandidate = prev || !doubleTapActions[active] ? 0 : active;
    return;
  }

  const mod = doubleTapCandidate;
  doubleTapCandidate = 0;
  if (!mod) return;

  const now = Date.now();
  if (mod === doubleTapLastMod && now - doubleTapLastAt < doubleTapGap) {
    doubleTapLastMod = 0;
    doubleTapActions[mod]();
  } else {
    doubleTapLastMod = mod;
    doubleTapLastAt = now;
  }
}

/**
 * @param {string} mod cmd, alt, ctrl or shift
 * @param {() => void} fn
 */
function bindDoubleTap(mod, fn) {
  doubleTapActions[doubleTapFlags[mod] & doubleTapMask] = fn;
  if (doubleTapWatcher) return;

  doubleTapWatcher = hs.eventtap.addWatcher(
    [
      doubleTapTypes.flagsChanged,
      doubleTapTypes.keyDown,
      doubleTapTypes.leftMouseDown,
    ],
    handleDoubleTap,
    true,
  );
  doubleTapWatcher?.start();
}
