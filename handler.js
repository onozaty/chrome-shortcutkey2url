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
        shortcutkeys: this._settings.all(),
        listColumnCount: this._settings.listColumnCount()
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
    switch (shortcutkey.action) {
      case ActionId.OEPN_URL_NEW_TAB:
        chrome.tabs.create({url: shortcutkey.url}, (tab) => {
          if (shortcutkey.script.trim() != '') {
            this._executeScript(shortcutkey.script);
          }
        });
        break;

      case ActionId.OPEN_URL_CURRENT_TAB:
        chrome.tabs.update({url: shortcutkey.url}, (tab) => {
          if (shortcutkey.script.trim() != '') {
            this._executeScript(shortcutkey.script);
          }
        });
        break;

      case ActionId.JUMP_URL:
        chrome.tabs.query({lastFocusedWindow: true}, (tabs) => {
          var matchTab = tabs.filter((tab) => {
            return tab.url.indexOf(shortcutkey.url) == 0;
          })[0];

          if (matchTab) {
            chrome.tabs.update(matchTab.id, {active: true}, (tab) => {
              this._executeScript(shortcutkey.script);
            });

          } else {
            chrome.tabs.create({url: shortcutkey.url}, (tab) => {
              this._executeScript(shortcutkey.script);
            });
          }
        });
        break;

      case ActionId.EXECUTE_SCRIPT:
        this._executeScript(shortcutkey.script);
        break;
        
      default:
        throw new RangeError('actionId is ' + shortcutkey.action);
    }
  }

  _executeScript(script) {
    if (script && script.trim() != '') {
      chrome.tabs.executeScript(null, {code: script});
    }
  }
}
