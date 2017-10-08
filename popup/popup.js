function render(shortcutkeys, listColumnCount) {

  const keyMaxLength = Math.max.apply(null, shortcutkeys.map((shortcutkey) => {
    return shortcutkey.key.length;
  }));

  const listElement = document.getElementById('shortcutkeys');
  listElement.style.columnCount = listColumnCount;
  listElement.textContent = null;
  const columns = [];

  for (var i = 0; i < listColumnCount; i++) {
    const column = listElement.appendChild(document.createElement('div'));
    column.className = 'column';
    columns.push(column);
  }

  for (var i = 0; i < shortcutkeys.length; i++) {
    columns[i % listColumnCount].appendChild(createShortcutkeyElement(shortcutkeys[i], keyMaxLength));
  }
}

function createShortcutkeyElement(shortcutkey, keyMaxLength) {

  const keyElement = document.createElement('span');
  keyElement.className = 'key';
  keyElement.textContent = shortcutkey.key.padEnd(keyMaxLength, '\u00A0');

  const titleElement = document.createElement('span');
  titleElement.className = 'title';
  titleElement.textContent = shortcutkey.title;

  const shortcutkeyElement = document.createElement('div');
  shortcutkeyElement.className = 'item';
  shortcutkeyElement.appendChild(keyElement);
  shortcutkeyElement.appendChild(titleElement);

  return shortcutkeyElement;
}

document.getElementById('add').addEventListener('click', () => {
  chrome.runtime.sendMessage({target: 'background-options', name: 'add'});
});

document.getElementById('options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
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
      //render(response.shortcutkeys);
    }
  });
});

// startup message
chrome.runtime.sendMessage({target: 'background-handler', name: MessageName.STARTUP}, (response) => {
  render(response.shortcutkeys, response.listColumnCount);
});
