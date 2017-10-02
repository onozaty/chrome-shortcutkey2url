function render(shortcutkeys) {

  const keyMaxLength = Math.max.apply(null, shortcutkeys.map((shortcutkey) => {
    return shortcutkey.key.length;
  }));

  const listElement = document.getElementById('list');
  listElement.textContent = null;

  shortcutkeys.forEach((shortcutkey) => {
    listElement.appendChild(createShortcutkeyElement(shortcutkey, keyMaxLength));
  });
}

function createShortcutkeyElement(shortcutkey, keyMaxLength) {

  const keyElement = document.createElement('span');
  keyElement.className = 'key';
  keyElement.textContent = shortcutkey.key.padEnd(keyMaxLength, '\u00A0');

  const titleElement = document.createElement('span');
  titleElement.className = 'title';
  titleElement.textContent = shortcutkey.title;

  const shortcutkeyElement = document.createElement('div');
  shortcutkeyElement.appendChild(keyElement);
  shortcutkeyElement.appendChild(titleElement);

  return shortcutkeyElement;
}

document.addEventListener('keypress', (e) => {
  console.log(e);

  const request = {
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

  chrome.runtime.sendMessage(request, (response) => {
    console.log(response);

    if (response.result == HandleResult.FINISH) {
      window.close();
    } else {
      //render(response.shortcutkeys);
    }
  });
});

// startup message
chrome.runtime.sendMessage({name: MessageName.STARTUP}, (response) => {
  render(response.shortcutkeys);
});
