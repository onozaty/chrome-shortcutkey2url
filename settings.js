const DefaultShortcutkeys = [
  {key: 'GS', title: 'Google', action: ActionId.OEPN_URL_NEW_TAB, content: 'https://www.google.com/'},
  {key: 'GM', title: 'Gmail', action: ActionId.JUMP_URL, content: 'https://mail.google.com/'},
  {key: 'T', title: 'Twitter', action: ActionId.JUMP_URL, content: 'https://twitter.com/'},
  {key: 'F', title: 'Facebook', action: ActionId.JUMP_URL, content: 'https://www.facebook.com/'},
  {key: 'Y', title: 'YouTube', action: ActionId.JUMP_URL, content: 'https://www.youtube.com/'}
];

class Settings {

  static async newAsync() {

    const settings = new Settings();
    await settings._load();
    return settings;
  }

  all() {
    return [].concat(this._shortcutkeys);
  }

  async update(shortcutkeys) {
    this._shortcutkeys = shortcutkeys;
    await this._save();
  }

  find(key) {
    return this._shortcutkeys.filter((item) => {
      return item.key.indexOf(key) == 0;
    });
  }

  async reload() {
    await this._load();
  }

  async _load() {
    this._shortcutkeys = await getLocalStorage('settings');
    this._shortcutkeys = this._shortcutkeys || DefaultShortcutkeys;
  }

  async _save() {
    await setLocalStorage({'settings': this._shortcutkeys});
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