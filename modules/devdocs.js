// handles page zooming + change title to trigger GC
const devdocsPageScript = `
(function () {
  if (window.hsDevdocs) return;
  let zoom = 1.25;
  const apply = function () { document.documentElement.style.zoom = zoom; };

  document.addEventListener("keydown", function (e) {
    if (!e.metaKey) return;
    if (e.key === "w") {
      e.preventDefault();
      document.title = "killmeplease";
      return;
    }
    if (e.key === "=") zoom += 0.1;
    else if (e.key === "-") zoom += -0.1;
    else if (e.key === "0") zoom = 1;
    else return;
    e.preventDefault();
    apply();
  });

  apply();
  window.hsDevdocs = true;
})();
`;

const devdocsDesktopScript = `
if (!document.cookie.includes("override-mobile-detect=false")) {
  document.cookie = "override-mobile-detect=false; path=/; max-age=31536000";
  location.reload();
}
`;

/** @type {HSUIWindow | null} */
let devdocsWindow = null;

/** @type {UIWebView | null} */
let devdocsWebview = null;

function releaseDevdocs() {
  if (!devdocsWindow && !devdocsWebview) return;

  devdocsWindow?.close();

  // frees ghost windows, see withCheckedContinuation, UIWebView.swift:743
  devdocsWebview?.loadURL("about:blank");

  devdocsWindow = null;
  devdocsWebview = null;
}

function createDevdocs() {
  releaseDevdocs();

  const screen = hs.screen.main()?.frame;
  const primaryHeight = hs.screen.primary()?.fullFrame.h;
  if (!screen || primaryHeight === undefined) return;

  const wv = hs.ui
    .webview()
    .loadURL("https://devdocs.io")
    .onLoadChange(() => wv.execJS(devdocsDesktopScript + devdocsPageScript))
    .onTitleChange((title) => {
      if (title === "killmeplease") releaseDevdocs();
    });

  const width = 700;
  const height = 768;
  const top = screen.y;

  const win = hs.ui
    .window({
      x: screen.x + (screen.w - width) / 2,
      y: primaryHeight - top - height,
      w: width,
      h: height,
    })
    .webview(wv);

  devdocsWindow = win;
  devdocsWebview = wv;

  hs.application.launchOrFocus("net.tenshu.Hammerspoon-2");
  win.show();
}
