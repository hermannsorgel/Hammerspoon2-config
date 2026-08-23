const hotkeys = [];

/**
 * @param {string[]} mods
 * @param {string} key
 * @param {() => void} fn
 */
function bind(mods, key, fn) {
  hotkeys.push(hs.hotkey.bind(mods, key, fn, null));
}

/** @param {string} bundleID */
function toggleApp(bundleID) {
  return () => {
    const app = hs.application.matchingBundleID(bundleID);
    if (app?.isActive) {
      app.hide();
    } else {
      hs.application.launchOrFocus(bundleID);
    }
  };
}
