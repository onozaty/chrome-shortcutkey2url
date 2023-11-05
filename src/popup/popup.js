let settings;

function render(shortcutKeys) {

  shortcutKeys = shortcutKeys || settings.shortcutKeys;
  const listColumnCount = settings.listColumnCount;

  const keyMaxLength = Math.max.apply(null, shortcutKeys.map((shortcutKey) => {
    return shortcutKey.key.length;
  }));

  const listElement = document.getElementById('shortcutKeys');
  listElement.style.columnCount = listColumnCount;
  listElement.textContent = null;
  const columns = [];

  for (var i = 0; i < listColumnCount; i++) {
    const column = listElement.appendChild(document.createElement('div'));
    column.className = 'column';
    columns.push(column);
  }

  const visibleShortcutKeys = shortcutKeys.filter(x => !x.hideOnPopup);

  for (var i = 0, length = Math.ceil(visibleShortcutKeys.length / listColumnCount) * listColumnCount; i < length; i++) {

    columns[i % listColumnCount].appendChild(createShortcutKeyElement(visibleShortcutKeys[i], keyMaxLength));
  }
}

function createShortcutKeyElement(shortcutKey, keyMaxLength) {

  if (!shortcutKey) {
    const emptyElement = document.createElement('div');
    emptyElement.textContent = '\u00A0';
    return emptyElement;
  }

  const keyElement = document.createElement('span');
  keyElement.className = 'key';
  keyElement.textContent = shortcutKey.key.padEnd(keyMaxLength, '\u00A0');

  const titleElement = document.createElement('span');
  titleElement.className = 'title';
  titleElement.textContent = shortcutKey.title;

  const shortcutKeyElement = document.createElement('div');
  shortcutKeyElement.className = 'item';
  shortcutKeyElement.appendChild(keyElement);
  shortcutKeyElement.appendChild(titleElement);
  shortcutKeyElement.addEventListener('click', () => {
    chrome.runtime.sendMessage({target: 'background-handler', name: MessageName.CLICK_EVENT, value: shortcutKey});
    window.close();
  })

  return shortcutKeyElement;
}

document.getElementById('add').addEventListener('click', () => {
  chrome.runtime.sendMessage({target: 'background-options', name: 'add'});
  window.close();
});

document.getElementById('options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
  window.close();
});

document.addEventListener('keypress', (e) => {
  console.log(e);

  const message = {
    target: 'background-handler',
    name: MessageName.KEY_EVENT,
    value: {
      'charCode': e.charCode,
      'keyCode': e.keyCode,
      'altKey': e.altKey,
      'ctrlKey': e.ctrlKey,
      'metaKey': e.metaKey,
      'shiftKey': e.shiftKey
    }
  };

  chrome.runtime.sendMessage(message, (response) => {
    console.log(response);

    if (response.result == HandleResult.FINISH) {
      window.close();
    } else {
      if (settings.filterOnPopup) {
        render(response.shortcutKeys);
      }
    }
  });
});

// startup message
chrome.runtime.sendMessage({target: 'background-handler', name: MessageName.STARTUP}, (response) => {
  settings = response.settings;
  render();
});
