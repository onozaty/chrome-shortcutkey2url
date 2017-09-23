const OpenMethod = {
  NEW: 'new',
  CURRENT: 'current',
  JUMP: 'jump'
};

class Settings {

  constructor() {
    this._load();
  }

  _load() {
    this._shortcutkeys = [
      {key: 'GS', title: 'Google', url: 'https://www.google.com/', method: OpenMethod.NEW},
      {key: 'GM', title: 'Gmail', url: 'https://mail.google.com/', method: OpenMethod.JUMP},
      {key: 'T', title: 'Twitter', url: 'https://twitter.com/', method: OpenMethod.JUMP},
      {key: 'F', title: 'Facebook', url: 'https://www.facebook.com/', method: OpenMethod.CURRENT}
    ];
  }

  all() {
    return [].concat(this._shortcutkeys);
  }

  find(key) {
    return this._shortcutkeys.filter((item) => {
      return item.key.indexOf(key) == 0;
    });
  }
}
