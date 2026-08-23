// cycling through more than two layouts is a pain, so Hammerspoon
// flips between the two I use most and the macOS shortcut still
// cycles through all of them

function keyboardLayout() {
  const layout = hs.keycodes.currentLayout() === "U.S."
    ? "Hebrew – QWERTY"
    : "U.S.";
  hs.keycodes.setLayout(layout);
}
