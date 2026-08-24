// handles page zooming
const devdocsPageScript = `
(function () {
  if (window.hsDevdocs) return;
  let zoom = 1.25;
  const apply = function () { document.documentElement.style.zoom = zoom; };

  document.addEventListener("keydown", function (e) {
    if (!e.metaKey) return;
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

function createDevdocs() {
  const screen = hs.screen.main()?.frame;
  const primaryHeight = hs.screen.primary()?.fullFrame.h;
  if (!screen || primaryHeight === undefined) return;

  const wv = hs.ui
    .webview()
    .loadURL("https://devdocs.io")
    .onLoadChange(() => wv.execJS(devdocsDesktopScript + devdocsPageScript));

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
    .webview(wv)
    .onHide(() => {
      win.destroy();

      // frees ghost windows, see withCheckedContinuation, UIWebView.swift:743
      wv.loadURL("about:blank");
    });

  hs.application.launchOrFocus("net.tenshu.Hammerspoon-2");
  win.show();
}
