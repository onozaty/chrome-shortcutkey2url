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
    this.settings = settings;
  }

  handle(message) {
    if (message.name == MessageName.STARTUP) {
      this._startup();
      return HandleResult.CONTINUE;
    } else {
      return this._receiveKey(message.value);
    }
  }

  _startup() {
    this.receivedKeys = [];
  }

  _receiveKey(keyEvent) {

    if (!keyEvent.charCode) {
      return HandleResult.FINISH;
    }

    var key = String.fromCharCode(keyEvent.charCode).toUpperCase();
    this.receivedKeys.push(key);

    if (this.receivedKeys.length < this.settings.keyLength) {
      return HandleResult.CONTINUE;
    }

    var shortcutkey = this.settings.find(key);
    if (shortcutkey) {
      this._doAction(shortcutkey);
    }

    return  HandleResult.FINISH;
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
