// open Brave bookmarks

/** @typedef {{ name?: string, url?: string, children?: BookmarkNode[] }} BookmarkNode */
/** @typedef {{ text: string, subText: string, image: HSImage | null }} BookmarkRow */

const braveBookmarksPath =
  "~/Library/Application Support/BraveSoftware/Brave-Browser/Default/Bookmarks";

const bookmarkIcon = HSImage.fromSymbol("bookmark");

/**
 * @param {BookmarkNode} node
 * @returns {BookmarkRow[]}
 */
function collectBookmarks(node) {
  if (node.url) {
    return [
      { text: node.name || node.url, subText: node.url, image: bookmarkIcon },
    ];
  }
  return (node.children ?? []).flatMap(collectBookmarks);
}

const braveBookmarkChooser = hs.chooser.create();
braveBookmarkChooser.placeholder = "Bookmark...";
braveBookmarkChooser.searchSubText = true;
braveBookmarkChooser.width = 0.4;
braveBookmarkChooser.onSelect = (choice) => {
  if (choice) {
    hs.urlevent.openURLWithBundle(choice.subText, "com.brave.Browser");
  }
};

function showBraveBookmarks() {
  try {
    const contents = hs.fs.read(braveBookmarksPath, 0, 0);
    if (!contents) {
      throw new Error(`could not read ${braveBookmarksPath}`);
    }

    /** @type {{ roots: Record<string, BookmarkNode> }} */
    const bookmarks = JSON.parse(contents);
    braveBookmarkChooser.setChoices(
      Object.values(bookmarks.roots).flatMap(collectBookmarks),
    );
    braveBookmarkChooser.query = "";
    braveBookmarkChooser.show();
  } catch (err) {
    hs.ui.alert(`Could not list bookmarks: ${err}`).duration(2).show();
  }
}
