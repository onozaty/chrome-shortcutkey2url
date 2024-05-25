const HandleResult = {
  CONTINUE: 'continue',
  FINISH: 'finish'
}

const MessageName = {
  STARTUP: 'startup',
  KEY_EVENT: 'key_event',
  CLICK_EVENT: 'click_event'
}

class Handler {
  handle(message, settings) {
    switch (message.name) {
      case MessageName.STARTUP:
        this._startup();
        return {
          result: HandleResult.CONTINUE,
          settings: settings.data()
        };

      case MessageName.KEY_EVENT:
        return this._receiveKey(message.value, settings);

      case MessageName.CLICK_EVENT:
        this._doAction(message.value);
        return { result: HandleResult.FINISH };
    }
  }

  _startup() {
    this.receivedKeys = '';
  }

  _receiveKey(keyEvent, settings) {

    if (!keyEvent.charCode) {
      return { result: HandleResult.FINISH };
    }

    const key = String.fromCharCode(keyEvent.charCode).toUpperCase();
    this.receivedKeys += key;

    const matchShortcutKeys = settings.find(this.receivedKeys);

    if (matchShortcutKeys.length > 1) {
      return {
        result: HandleResult.CONTINUE,
        shortcutKeys: matchShortcutKeys
      };
    }

    if (matchShortcutKeys.length == 1) {
      this._doAction(matchShortcutKeys[0]);
    }

    return { result: HandleResult.FINISH };
  }

  _doAction(shortcutKey) {
    switch (shortcutKey.action) {
      case ActionId.OEPN_URL_NEW_TAB:
        this._createTab(shortcutKey.url, shortcutKey.scriptId);
        break;

      case ActionId.OPEN_URL_CURRENT_TAB:
        this._updateTab(shortcutKey.url, shortcutKey.scriptId);
        break;

      case ActionId.JUMP_URL:
        chrome.tabs.query({ lastFocusedWindow: true }, (tabs) => {
          var matchTab = tabs.filter((tab) => {
            return tab.url.indexOf(shortcutKey.url) == 0;
          })[0];

          if (matchTab) {
            this._selectTab(matchTab.id, shortcutKey.scriptId);
          } else {
            this._createTab(shortcutKey.url, shortcutKey.scriptId);
          }
        });
        break;

      case ActionId.EXECUTE_SCRIPT:
        this._executeScript(shortcutKey.scriptId);
        break;

      case ActionId.OPEN_URL_PRIVATE_MODE:
        chrome.windows.create({ url: shortcutKey.url, incognito: true });
        break;

      case ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE:
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const tab = tabs[0];
          chrome.windows.create({ url: tab.url, incognito: true });
        });
        break;

      case ActionId.JUMP_URL_ALL_WINDOWS:

        // First, search from the current window.
        chrome.tabs.query({ lastFocusedWindow: true }, (tabs) => {
          const matchTab = tabs.filter((tab) => {
            return tab.url.indexOf(shortcutKey.url) == 0;
          })[0];

          if (matchTab) {
            this._selectTab(matchTab.id, shortcutKey.scriptId);
          } else {
            // Second, search from all windows.
            chrome.tabs.query({}, (tabs) => {
              const matchTab = tabs.filter((tab) => {
                return tab.url.indexOf(shortcutKey.url) == 0;
              })[0];

              if (matchTab) {
                chrome.windows.update(matchTab.windowId, { focused: true });
                this._selectTab(matchTab.id, shortcutKey.scriptId);
              } else {
                this._createTab(shortcutKey.url, shortcutKey.scriptId);
              }
            });
          }
        });
        break;

      default:
        throw new RangeError('actionId is ' + shortcutKey.action);
    }
  }

  _selectTab(tabId, scriptId) {
    chrome.tabs.update(tabId, { active: true }, () => {
      this._executeScript(scriptId);
    });
  }

  _createTab(url, scriptId) {
    chrome.tabs.create({ url: url }, () => {
      setTimeout(() => {
        this._executeScript(scriptId);
      }, 1000);
    });
  }

  _updateTab(url, scriptId) {
    chrome.tabs.update({ url: url }, () => {
      setTimeout(() => {
        this._executeScript(scriptId);
      }, 1000);
    });
  }

  _executeScript(scriptId) {
    const script = USER_SCRIPTS.find(x => x.id == scriptId);
    if (script) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.scripting
          .executeScript({
            target: { tabId: activeTab.id },
            func: script.func
          });
      });

    }
  }
}

