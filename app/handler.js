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
        shortcutKeys: this._settings.all(),
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

  _doAction(shortcutKey) {
    switch (shortcutKey.action) {
      case ActionId.OEPN_URL_NEW_TAB:
        chrome.tabs.create({url: shortcutKey.url}, () => {
          this._executeScript(shortcutKey.script);
        });
        break;

      case ActionId.OPEN_URL_CURRENT_TAB:
        chrome.tabs.update({url: shortcutKey.url}, () => {
          setTimeout(() => {
            this._executeScript(shortcutKey.script);
          }, 1000);
        });
        break;

      case ActionId.JUMP_URL:
        chrome.tabs.query({lastFocusedWindow: true}, (tabs) => {
          var matchTab = tabs.filter((tab) => {
            return tab.url.indexOf(shortcutKey.url) == 0;
          })[0];

          if (matchTab) {
            chrome.tabs.update(matchTab.id, {active: true}, () => {
              this._executeScript(shortcutKey.script);
            });

          } else {
            chrome.tabs.create({url: shortcutKey.url}, () => {
              this._executeScript(shortcutKey.script);
            });
          }
        });
        break;

      case ActionId.EXECUTE_SCRIPT:
        this._executeScript(shortcutKey.script);
        break;
        
      default:
        throw new RangeError('actionId is ' + shortcutKey.action);
    }
  }

  _executeScript(script) {
    if (script && script.trim() != '') {
      chrome.tabs.executeScript(null, {code: script});
    }
  }
}
