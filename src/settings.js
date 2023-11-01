const DEFAULT_SHORTCUTKEYS = [
  { key: 'GS', title: 'Google', action: ActionId.OEPN_URL_NEW_TAB, url: 'https://www.google.com/' },
  { key: 'GM', title: 'Gmail', action: ActionId.JUMP_URL, url: 'https://mail.google.com/' },
  { key: 'T', title: 'Twitter', action: ActionId.JUMP_URL, url: 'https://twitter.com/' },
  { key: 'F', title: 'Facebook', action: ActionId.JUMP_URL, url: 'https://www.facebook.com/' },
  { key: 'Y', title: 'YouTube', action: ActionId.JUMP_URL, url: 'https://www.youtube.com/' },
  { key: 'P', title: 'Incognito', action: ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE },
];

const DEFAULT_LIST_COLUMN_COUNT = 3;

class Settings {

  static async newAsync() {

    const settings = new Settings();
    await settings._load();

    // Attempt one synchronous save to account for migration.
    await settings._save();

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
    const synced = await getLocalStorage('synced');

    let loaded;
    if (synced == null) {
      // first time
      loaded = await getSyncStorage('settings');
      if (!loaded) {
        loaded = await getLocalStorage('settings');
      }
    } else if (synced) {
      loaded = await getSyncStorage('settings');
    } else {
      loaded = await getLocalStorage('settings');
    }

    loaded = loaded || {};
    this._shortcutKeys = (loaded.shortcutKeys || DEFAULT_SHORTCUTKEYS).sort(Settings.shortcutKeyCompare);
    this._listColumnCount = loaded.listColumnCount || DEFAULT_LIST_COLUMN_COUNT;
    this._filterOnPopup = loaded.filterOnPopup || false;
    this._startupCommand = (await getAllCommands())[0];
  }

  async _save() {
    const saveData = {
      settings: {
        shortcutKeys: this._shortcutKeys,
        listColumnCount: this._listColumnCount,
        filterOnPopup: this._filterOnPopup
      }
    };

    // Save also to local in case saving to sync may fail
    await setLocalStorage(saveData);
    setSyncStorage(saveData).then(
      async () => {
        // sync succeeded
        await setLocalStorage({ synced: true });
      },
      async (err) => {
        // sync failed
        console.log('sync.save failed');
        console.log(err);
        await setLocalStorage({ synced: false });
      }
    );
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