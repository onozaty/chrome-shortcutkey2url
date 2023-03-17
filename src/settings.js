const DEFAULT_SHORTCUTKEYS = [
  {key: 'GS', title: 'Google', action: ActionId.OEPN_URL_NEW_TAB, url: 'https://www.google.com/'},
  {key: 'GM', title: 'Gmail', action: ActionId.JUMP_URL, url: 'https://mail.google.com/'},
  {key: 'T', title: 'Twitter', action: ActionId.JUMP_URL, url: 'https://twitter.com/'},
  {key: 'F', title: 'Facebook', action: ActionId.JUMP_URL, url: 'https://www.facebook.com/'},
  {key: 'Y', title: 'YouTube', action: ActionId.JUMP_URL, url: 'https://www.youtube.com/'},
  {key: 'P', title: 'Incognito', action: ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE},
];

const DEFAULT_LIST_COLUMN_COUNT = 3;

class Settings {

  static async newAsync() {

    const settings = new Settings();
    await settings._load();
    return settings;
  }

  data() {
    return {
      shortcutKeys: this._shortcutKeys,
      listColumnCount: this._listColumnCount,
      filterOnPopup: this._filterOnPopup,
      startupCommand: this._startupCommand
    };
  }

  async update(settings) {
    this._shortcutKeys = settings.shortcutKeys.sort(Settings.shortcutKeyCompare);
    this._listColumnCount = settings.listColumnCount;
    this._filterOnPopup = settings.filterOnPopup;
    await this._save();
  }

  find(key) {
    return this._shortcutKeys.filter((item) => {
      return item.key.indexOf(key) == 0;
    });
  }

  async reload() {
    await this._load();
  }

  async _load() {
    var loaded =  await getLocalStorage('settings');
    loaded = loaded || {};
    this._shortcutKeys = (loaded.shortcutKeys || DEFAULT_SHORTCUTKEYS).sort(Settings.shortcutKeyCompare);
    this._listColumnCount = loaded.listColumnCount || DEFAULT_LIST_COLUMN_COUNT;
    this._filterOnPopup = loaded.filterOnPopup || false;
    this._startupCommand = (await getAllCommands())[0];
  }

  async _save() {
    await setLocalStorage({
      settings: {
        shortcutKeys: this._shortcutKeys,
        listColumnCount: this._listColumnCount,
        filterOnPopup: this._filterOnPopup
      }
    });
  }

  static shortcutKeyCompare(o1, o2) {
    if (o1.key < o2.key) return -1;
    if (o1.key > o2.key) return 1;
    return 0;
  }
}

function setLocalStorage(obj) {
  return new Promise((resolve) => {
    chrome.storage.local.set(obj, () => resolve() );
  });
}

function getLocalStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (item) => {
      key ? resolve(item[key]) : resolve(item);
    });
  });
}

function getAllCommands() {
  return new Promise((resolve) => {
    chrome.commands.getAll((commands) => {
      resolve(commands);
    });
  });
}