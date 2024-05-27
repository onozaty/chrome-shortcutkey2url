const DEFAULT_SHORTCUTKEYS = [
  { key: 'GS', title: 'Google', action: ActionId.OEPN_URL_NEW_TAB, url: 'https://www.google.com/' },
  { key: 'GM', title: 'Gmail', action: ActionId.JUMP_URL, url: 'https://mail.google.com/' },
  { key: 'T', title: 'Twitter', action: ActionId.JUMP_URL, url: 'https://twitter.com/' },
  { key: 'F', title: 'Facebook', action: ActionId.JUMP_URL, url: 'https://www.facebook.com/' },
  { key: 'Y', title: 'YouTube', action: ActionId.JUMP_URL, url: 'https://www.youtube.com/' },
  { key: 'P', title: 'Incognito', action: ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE },
];

const DEFAULT_LIST_COLUMN_COUNT = 3;

// The name to be used when saving the shortcutkeys.
// To meet the capacity limit per item in storage.sync, it is saved in separate item.
// (shortcutKeys001, shortcutKeys002, ..., shortcutKeys100)
const SHORTCUT_KEYS_STORED_NAMES = [...Array(100)].map((_, i) => `shortcutKeys${String(i + 1).padStart(3, '0')}`);

class Settings {

  /** @type {({ key: string; title: string; action: number; url?: string; scriptId?: string })[] } */
  _shortcutKeys;
  /** @type {number} */
  _listColumnCount;
  /** @type {boolean} */
  _filterOnPopup;
  /** @type {boolean} */
  _synced;

  /**
   * @param {{
   *   shortcutKeys: { key: string; title: string; action: number; url?: string; scriptId?: string }[] ;
   *   listColumnCount: number;
   *   filterOnPopup: boolean;
   *   startupCommand: any;
   *   synced: boolean;
   * }} initialValue 
   */
  constructor(initialValue) {
    if (initialValue) {
      this._shortcutKeys = initialValue.shortcutKeys;
      this._listColumnCount = initialValue.listColumnCount;
      this._filterOnPopup = initialValue.filterOnPopup;
      this._synced = initialValue.synced;
    }
  }

  static async initialize() {

    const settings = new Settings();
    await settings._load();

    // Attempt one synchronous save to account for migration.
    await settings._save();

    return settings;
  }

  static async getCache() {

    const cache = await getLocalStorage('cache');
    if (cache == null) {
      const settings = new Settings();
      await settings._load();
      return settings;
    }

    return new Settings(cache);
  }

  data() {
    return {
      shortcutKeys: this._shortcutKeys,
      listColumnCount: this._listColumnCount,
      filterOnPopup: this._filterOnPopup,
      startupCommand: this._startupCommand,
      synced: this._synced
    };
  }

  async update(settings) {
    this._shortcutKeys = settings.shortcutKeys.sort(Settings.shortcutKeyCompare);
    this._listColumnCount = settings.listColumnCount;
    this._filterOnPopup = settings.filterOnPopup;
    this._synced = settings.synced;
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
    let synced = await getLocalStorage('synced');

    let loaded;
    if (synced == null) {
      // first time
      loaded = await getSyncStorage();
      if (!loaded) {
        loaded = await getLocalStorage();
      }
      synced = true; // default
    } else if (synced) {
      loaded = await getSyncStorage();
    } else {
      loaded = await getLocalStorage();
    }

    loaded = loaded || {};

    let shortcutKeys = DEFAULT_SHORTCUTKEYS;
    if (loaded.settings?.shortcutKeys) {
      // Supports migration from previous version
      shortcutKeys = loaded.settings.shortcutKeys;
    } else if (loaded[SHORTCUT_KEYS_STORED_NAMES[0]]) {
      shortcutKeys = this._mergeStoredShortcutKeys(loaded);
    }
    this._shortcutKeys = shortcutKeys.sort(Settings.shortcutKeyCompare);

    this._listColumnCount = loaded.settings?.listColumnCount || DEFAULT_LIST_COLUMN_COUNT;
    this._filterOnPopup = loaded.settings?.filterOnPopup || false;
    this._startupCommand = (await getAllCommands())[0];
    this._synced = synced;

    // save cache
    await setLocalStorage({ cache: this.data() });
  }

  async _save() {

    // synced has locally
    await setLocalStorage({ synced: this._synced });

    const saveData = {
      settings: {
        listColumnCount: this._listColumnCount,
        filterOnPopup: this._filterOnPopup
      }
    };
    Object.assign(saveData, this._splitStoredShortcutKeys(this._shortcutKeys));

    // Save also to local in case saving to sync may fail
    await setLocalStorage(saveData);

    if (this._synced) {
      await setSyncStorage(saveData).then(
        async () => {
          // sync succeeded
        },
        async (err) => {
          // sync failed
          console.log('sync.save failed');
          console.log(err);
          await setLocalStorage({ synced: false });
          this._synced = false;
        }
      );
    }

    // save cache
    await setLocalStorage({ cache: this.data() });
  }

  _mergeStoredShortcutKeys(splited) {
    const mergedShortcutKeys = [];

    for (let i = 0; i < SHORTCUT_KEYS_STORED_NAMES.length; i++) {
      const shortcutKeys = splited[SHORTCUT_KEYS_STORED_NAMES[i]];
      if (shortcutKeys) {
        mergedShortcutKeys.push(...shortcutKeys);
      }
    }

    return mergedShortcutKeys;
  }

  _splitStoredShortcutKeys(merged) {

    // init
    const splitedShortcutKeys = {};
    for (let i = 0; i < SHORTCUT_KEYS_STORED_NAMES.length; i++) {
      splitedShortcutKeys[SHORTCUT_KEYS_STORED_NAMES[i]] = [];
    }

    for (let i = 0; i < merged.length; i++) {
      const itemName = SHORTCUT_KEYS_STORED_NAMES[i % SHORTCUT_KEYS_STORED_NAMES.length];
      splitedShortcutKeys[itemName].push(merged[i]);
    }

    return splitedShortcutKeys;
  }

  static shortcutKeyCompare(o1, o2) {
    if (o1.key < o2.key) return -1;
    if (o1.key > o2.key) return 1;
    return 0;
  }
}

function setSyncStorage(obj) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(obj, () => {
      if (!chrome.runtime.lastError) {
        resolve();
      } else {
        reject(chrome.runtime.lastError);
      }
    });
  });
}

function setLocalStorage(obj) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(obj, () => {
      if (!chrome.runtime.lastError) {
        resolve();
      } else {
        reject(chrome.runtime.lastError);
      }
    });
  });
}

function getSyncStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, (item) => {
      key ? resolve(item[key]) : resolve(item);
    });
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
