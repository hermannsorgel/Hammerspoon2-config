// a chooser that runs the other commands.

/**
 * @typedef {object} MetaCommand
 * @property {string} name
 * @property {string} description
 * @property {string} [keyword] Typed plus a space runs the command instanly
 * @property {() => void} run
 */

/** @param {MetaCommand[]} commands */
function createMetaChooser(commands) {
  const chooser = hs.chooser.create();
  chooser.placeholder = "Run...";
  chooser.searchSubText = true;
  chooser.width = 0.4;

  const choices = commands.map((command, index) => ({
    text: command.name,
    subText: command.keyword
      ? `${command.description}  ·  ${command.keyword}`
      : command.description,
    index,
  }));

  chooser.onSelect = (choice) => {
    if (choice) commands[choice.index].run();
  };

  chooser.onQueryChange = (query) => {
    if (!query.endsWith(" ")) return;
    const words = query.trim().split(/\s+/);
    const typed = words[words.length - 1].toLowerCase();
    if (!typed) return;
    const command = commands.find((entry) => entry.keyword === typed);
    if (!command) return;
    chooser.hide();
    command.run();
  };

  return () => {
    chooser.setChoices(choices);
    chooser.query = "";
    chooser.show();
  };
}
