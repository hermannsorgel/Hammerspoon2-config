// kills apps from a chooser,
// enter quits, right-click to force quit

/** @typedef {{ footprint: number, cpu: number }} ProcessUsage */
/** @typedef {{ footprint: number, cpu: number, ppid: number }} Process */

const runningTasks = new Set();

/**
 * @param {string} path
 * @param {string[]} args
 * @returns {Promise<string>} stdout
 */
function runCommand(path, args) {
  return new Promise((resolve) => {
    let stdout = "";
    const task = hs.task.create(
      path,
      args,
      () => {
        runningTasks.delete(task);
        resolve(stdout);
      },
      null,
      (stream, data) => {
        if (stream === "stdout") {
          stdout += data;
        }
      },
    );
    runningTasks.add(task);
    task.start();

    if (task.pid <= 0) {
      runningTasks.delete(task);
      resolve("");
    }
  });
}

/**
 * @type {Record<string, number>}
 */
const memoryScales = {
  B: 1,
  K: 1024,
  M: 1024 ** 2,
  G: 1024 ** 3,
  T: 1024 ** 4,
};

/** @param {string} size */
function parseMemory(size) {
  const match = /^([\d.]+)([BKMGT])[+-]?$/.exec(size);
  return match ? Number(match[1]) * memoryScales[match[2]] : 0;
}

/**
 * @returns {Promise<Map<number, Process>>}
 */
async function processUsage() {
  const stdout = await runCommand("/usr/bin/top", [
    "-l",
    "2",
    "-s",
    "0",
    "-stats",
    "pid,ppid,mem,cpu",
  ]);

  /** @type {Map<number, Process>} */
  const processes = new Map();

  const samples = stdout.split(/^PID.*$/m);

  for (const line of samples[samples.length - 1].split("\n")) {
    const [pid, ppid, size, cpu] = line.trim().split(/\s+/);
    if (!/^\d+$/.test(pid)) {
      continue;
    }
    processes.set(Number(pid), {
      footprint: parseMemory(size),
      cpu: Number(cpu),
      ppid: Number(ppid),
    });
  }

  return processes;
}

/**
 * @param {number} pid
 * @param {Map<number, Process>} processes
 * @param {Set<number>} appPids
 * @returns {number}
 */
function owningApp(pid, processes, appPids) {
  let current = pid;
  for (let hop = 0; hop < 64; hop++) {
    if (appPids.has(current)) {
      return current;
    }
    const ppid = processes.get(current)?.ppid;
    if (ppid === undefined || ppid === current) {
      return -1;
    }
    current = ppid;
  }
  return -1;
}

/**
 * @param {Map<number, Process>} processes
 * @param {Set<number>} appPids
 * @returns {Map<number, ProcessUsage>}
 */
function usageByApp(processes, appPids) {
  /** @type {Map<number, ProcessUsage>} */
  const totals = new Map();

  for (const [pid, row] of processes) {
    const app = owningApp(pid, processes, appPids);
    if (app === -1) {
      continue;
    }
    const total = totals.get(app);
    if (total) {
      total.footprint += row.footprint;
      total.cpu += row.cpu;
    } else {
      totals.set(app, { footprint: row.footprint, cpu: row.cpu });
    }
  }

  return totals;
}

/** @param {number} bytes */
function formatMemory(bytes) {
  const mb = bytes / 1024 ** 2;
  return mb < 1024 ? `${Math.round(mb)} MB` : `${(mb / 1024).toFixed(1)} GB`;
}

/**
 * @param {number} pid
 * @param {string} name
 * @param {boolean} force
 */
function quitApp(pid, name, force) {
  const app = hs.application.fromPID(pid);
  const quit = app && (force ? app.kill9() : app.kill());
  hs.ui
    .alert(quit ? `Quit ${name}` : `Could not quit ${name}`)
    .duration(1.5)
    .show();
}

/** @returns {{ name: string, bundlePath: string, pid: number }[]} */
function listedApps() {
  const apps = [];
  for (const app of hs.application.runningApplications()) {
    if (!app.bundlePath || !app.title || app.kind === "background") {
      continue;
    }
    apps.push({ name: app.title, bundlePath: app.bundlePath, pid: app.pid });
  }
  return apps;
}

function createProcessChooser() {
  const chooser = hs.chooser.create();
  chooser.placeholder = "Quit app...";
  chooser.searchSubText = false;
  chooser.width = 0.4;

  chooser.onSelect = (choice) => {
    if (choice) {
      quitApp(choice.pid, choice.text, false);
    }
  };

  const showApps = async () => {
    const processes = await processUsage();
    const apps = listedApps();
    const totals = usageByApp(processes, new Set(apps.map((app) => app.pid)));

    const rows = apps.map((app) => ({
      ...app,
      usage: totals.get(app.pid) ?? { footprint: 0, cpu: 0 },
    }));
    rows.sort((a, b) => b.usage.footprint - a.usage.footprint);

    chooser.setChoices(
      rows.map(({ name, bundlePath, pid, usage }) => ({
        text: name,
        subText: `${formatMemory(usage.footprint)} · ${
          usage.cpu.toFixed(
            1,
          )
        }% CPU`,
        image: HSImage.iconForFile(bundlePath),
        pid,
        contextMenu: [
          {
            title: "Force Quit",
            action: () => {
              chooser.hide();
              quitApp(pid, name, true);
            },
          },
        ],
      })),
    );

    chooser.query = "";
    chooser.show();
  };

  return async () => {
    try {
      await showApps();
    } catch (err) {
      hs.ui.alert(`Could not list processes: ${err}`).duration(2).show();
    }
  };
}

const showProcessChooser = createProcessChooser();
