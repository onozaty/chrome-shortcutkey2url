const HandleResult = {
  CONTINUE: 'continue',
  FINISH: 'finish'
}

const MessageName = {
  STARTUP: 'startup',
  KEY_EVENT: 'key_event'
}

class Handler {
  constructor(settings) {
    this._settings = settings;
  }

  async handle(message) {
    if (message.name == MessageName.STARTUP) {
      await this._startup();
      return {
        result: HandleResult.CONTINUE,
        shortcutkeys: this._settings.all()
      };
    } else {
      return this._receiveKey(message.value);
    }
  }

  async _startup() {
    this.receivedKeys = '';
    await this._settings.reload();
  }

  _receiveKey(keyEvent) {

    if (!keyEvent.charCode) {
      return {result: HandleResult.FINISH};
    }

    const key = String.fromCharCode(keyEvent.charCode).toUpperCase();
    this.receivedKeys += key;

    const matchShortcutkeys = this._settings.find(this.receivedKeys);

    if (matchShortcutkeys.length > 1) {
      return {
        result: HandleResult.CONTINUE,
        shortcutkeys: matchShortcutkeys
      };
    }

    if (matchShortcutkeys.length == 1) {
      this._doAction(matchShortcutkeys[0]);
    }

    return {result: HandleResult.FINISH};
  }

  _doAction(shortcutkey) {
    switch (shortcutkey.behavior) {
      case BehaviorId.OEPN_URL_NEW_TAB: 
        chrome.tabs.create({url: shortcutkey.content});
        break;

      case BehaviorId.OPEN_URL_CURRENT_TAB: 
        chrome.tabs.update({url: shortcutkey.content});
        break;

      case BehaviorId.JUMP_URL: 
        chrome.tabs.query({lastFocusedWindow: true}, (tabs) => {
          var matchTab = tabs.filter((tab) => {
            return tab.url.indexOf(shortcutkey.content) == 0;
          })[0];

          if (matchTab) {
            chrome.tabs.update(matchTab.id, {active: true});
          } else {
            chrome.tabs.create({url: shortcutkey.content});
          }
        });
        break;

      default:
        throw new RangeError('behaviorId is ' + shortcutkey.behavior);
    }
  }
}
