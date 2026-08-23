// mute current audio input

const micMenu = hs.menubar.create(true);
micMenu.title = "🔴 Muted";

function toggleMicState() {
  const mic = hs.audiodevice.defaultInputDevice();
  if (!mic) return;
  mic.inputMuted = !mic.inputMuted;
  if (mic.inputMuted) micMenu.show();
  else micMenu.hide();
}

micMenu.setClickCallback(toggleMicState);

if (hs.audiodevice.defaultInputDevice()?.inputMuted) micMenu.show();
