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

  handle(message) {
    if (message.name == MessageName.STARTUP) {
      this._startup();
      return {
        result: HandleResult.CONTINUE,
        shortcutKeys: this._settings.all()
      };
    } else {
      return this._receiveKey(message.value);
    }
  }

  _startup() {
    this.receivedKeys = '';
  }

  _receiveKey(keyEvent) {

    if (!keyEvent.charCode) {
      return {result: HandleResult.FINISH};
    }

    const key = String.fromCharCode(keyEvent.charCode).toUpperCase();
    this.receivedKeys += key;

    const matchShortcutKeys = this._settings.find(this.receivedKeys);

    if (matchShortcutKeys.length > 1) {
      return {
        result: HandleResult.CONTINUE,
        shortcutKeys: matchShortcutKeys
      };
    }

    if (matchShortcutKeys.length == 1) {
      this._doAction(matchShortcutKeys[0]);
    }

    return {result: HandleResult.FINISH};
  }

  _doAction(shortcutkey) {
    switch (shortcutkey.method) {
      case OpenMethod.NEW:
        chrome.tabs.create({url: shortcutkey.url});
        break;

      case OpenMethod.CURRENT:
        chrome.tabs.update({url: shortcutkey.url});
        break;

      case OpenMethod.JUMP:
        chrome.tabs.query({lastFocusedWindow: true}, (tabs) => {
          var matchTab = tabs.filter((tab) => {
            return tab.url.indexOf(shortcutkey.url) == 0;
          })[0];

          if (matchTab) {
            chrome.tabs.update(matchTab.id, {active: true});
          } else {
            chrome.tabs.create({url: shortcutkey.url});
          }
        });
        break;

      default:
        break;
    }
  }
}
