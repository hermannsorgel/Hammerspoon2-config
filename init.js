for (const dir of ["utils", "modules"]) {
  for (const file of hs.fs.list(dir) ?? []) {
    if (file.endsWith(".js")) require(`${dir}/${file}`);
  }
}

hs.ui.alert("Hammerspoon reloaded").duration(1.5).show();

// chooser for other choosers and commands
const showMetaChooser = createMetaChooser([
  {
    name: "Devdocs",
    keyword: "dd",
    description: "Documentation",
    run: createDevdocs,
  },
  {
    name: "Audio output",
    keyword: "ou",
    description: "Switch the audio output device",
    run: chooseAudioOutput,
  },
  {
    name: "Audio input",
    keyword: "in",
    description: "Switch the microphone",
    run: chooseAudioInput,
  },
  {
    name: "Bookmarks",
    keyword: "b",
    description: "Open a Brave bookmark",
    run: showBraveBookmarks,
  },
  {
    name: "Kill app",
    keyword: "k",
    description: "Quit an app",
    run: showProcessChooser,
  },
  {
    name: "Reload config",
    keyword: "r",
    description: "Reload the Hammerspoon",
    run: () => hs.reload(),
  },
  {
    name: "Garbage collection",
    description: "Force Hammerspoon GC",
    run: () => hs.collectGarbage(),
  },
]);

// bindngs
const cmd = ["cmd"];
const ctrl = ["ctrl"];
const opt = ["option"];

// utils
bind(ctrl, "space", spotlight);
bindDoubleTap("cmd", showMetaChooser);
bind(cmd, "space", keyboardLayout);
bind(opt, "f1", spotlightClipboard);
bind(opt, "f3", spotlightActions);
bind(opt, "f10", toggleMicState);

// windows
bind(opt, "a", place(units.left50));
bind(opt, "c", place(units.bottomRight));
bind(opt, "d", place(units.right50));
bind(opt, "e", place(units.right30));
bind(opt, "q", place(units.left70));
bind(opt, "return", toggleZoom);
bind(opt, "s", place(units.bottomLeft));

// launcher
bind(opt, "b", toggleApp("com.brave.Browser"));
bind(opt, "f", toggleApp("com.apple.finder"));
bind(opt, "m", toggleApp("com.apple.mail"));
bind(opt, "p", toggleApp("org.keepassxc.keepassxc"));
bind(opt, "t", toggleApp("com.mitchellh.ghostty"));
bind(opt, "z", toggleApp("dev.zed.Zed"));
bindDoubleTap("alt", toggleApp("com.mitchellh.ghostty"));
