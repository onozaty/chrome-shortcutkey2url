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
    this.keyLength = 1;
    this.shortcutkeys = [
      {key: 'G', url: 'https://mail.google.com/', method: OpenMethod.NEW},
      {key: 'T', url: 'https://twitter.com/', method: OpenMethod.JUMP},
      {key: 'E', url: 'http://www.enjoyxstudy.com/', method: OpenMethod.CURRENT}
    ];
  }

  find(key) {
    return this.shortcutkeys.filter((item) => {
      return item.key == key;
    })[0];
  }
}
