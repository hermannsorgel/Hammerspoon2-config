// adds Alfred/Spotlight like ctrl+n/p
// to all choosers

/** @type {HSChooser | null} */
let visibleChooser = null;

/** @param {number} delta */
const moveChooserSelection = (delta) => () => {
  if (visibleChooser) {
    visibleChooser.selectedRow += delta;
  }
};

const chooserHotkeys = [
  hs.hotkey.create(["ctrl"], "n", moveChooserSelection(1), null),
  hs.hotkey.create(["ctrl"], "p", moveChooserSelection(-1), null),
].filter((key) => key !== null);

/** @param {HSChooser} chooser */
function attachChooserKeys(chooser) {
  chooser.onShow = () => {
    visibleChooser = chooser;
    for (const key of chooserHotkeys) key.enable();
  };

  chooser.onHide = () => {
    visibleChooser = null;
    for (const key of chooserHotkeys) key.disable();
  };
}

const nativeChooserCreate = hs.chooser.create;

hs.chooser.create = () => {
  const chooser = nativeChooserCreate.call(hs.chooser);
  attachChooserKeys(chooser);
  return chooser;
};
