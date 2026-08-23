// Switch the input/output device

/** @type {Record<string, string>} */
const transportSymbols = {
  "built-in": "laptopcomputer",
  usb: "cable.connector",
  thunderbolt: "cable.connector",
  firewire: "cable.connector",
  hdmi: "display",
  "display-port": "display",
  airplay: "airplayaudio",
  virtual: "waveform",
  aggregate: "waveform",
};

/** @param {string} transportType */
function deviceImage(transportType) {
  if (transportType.startsWith("bluetooth")) {
    return HSImage.fromName("NSBluetoothTemplate");
  }
  return HSImage.fromSymbol(transportSymbols[transportType] ?? "waveform");
}

/**
 * @param {HSAudioDevice[]} devices
 * @param {HSAudioDevice | null} defaultDevice
 */
function deviceChoices(devices, defaultDevice) {
  return devices
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((device) => ({
      text: device.uid === defaultDevice?.uid
        ? `✓ ${device.name}`
        : device.name,
      subText: device.transportType,
      image: deviceImage(device.transportType),
      uid: device.uid,
    }));
}

/**
 * @param {string} label
 * @param {() => HSAudioDevice[]} allDevices
 * @param {() => HSAudioDevice | null} defaultDevice
 * @param {(device: HSAudioDevice) => boolean} setDefaultDevice
 */
function createDeviceChooser(
  label,
  allDevices,
  defaultDevice,
  setDefaultDevice,
) {
  const chooser = hs.chooser.create();
  chooser.placeholder = `${label} device...`;
  chooser.searchSubText = true;
  chooser.width = 0.4;

  chooser.onSelect = (choice) => {
    if (!choice) return;

    const device = hs.audiodevice.findDeviceByUID(choice.uid);
    if (device && setDefaultDevice(device)) {
      hs.ui.alert(`${label}: ${device.name}`).duration(1.5).show();
    } else {
      hs.notify
        .create({
          title: `Could not switch ${label.toLowerCase()}`,
          body: choice.text,
        })
        ?.send();
    }
  };

  return () => {
    chooser.setChoices(deviceChoices(allDevices(), defaultDevice()));
    chooser.query = "";
    chooser.show();
  };
}

const chooseAudioOutput = createDeviceChooser(
  "Output",
  () => hs.audiodevice.allOutputDevices(),
  () => hs.audiodevice.defaultOutputDevice(),
  (device) => device.setDefaultOutputDevice(),
);

const chooseAudioInput = createDeviceChooser(
  "Input",
  () => hs.audiodevice.allInputDevices(),
  () => hs.audiodevice.defaultInputDevice(),
  (device) => device.setDefaultInputDevice(),
);
