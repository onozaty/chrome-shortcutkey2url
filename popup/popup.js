function render(shortcutKeys) {

  const keyMaxLenght = Math.max.apply(null, shortcutKeys.map((shortcutKey) => {
    return shortcutKey.key.length;
  }));

  const listElement = document.getElementById('list');
  listElement.textContent = null;

  shortcutKeys.forEach((shortcutKey) => {
    listElement.appendChild(createShortcutKeyElement(shortcutKey));
  });
}

function createShortcutKeyElement(shortcutKey, keyMaxLength) {

  const keyElement = document.createElement('span');
  keyElement.className = 'key';
  keyElement.textContent = shortcutKey.key.padEnd(keyMaxLength);

  const titleElement = document.createElement('span');
  titleElement.className = 'title';
  titleElement.textContent = shortcutKey.title;

  const shortcutKeyElement = document.createElement('div');
  shortcutKeyElement.appendChild(keyElement);
  shortcutKeyElement.appendChild(titleElement);

  return shortcutKeyElement;
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
      //render(response.shortcutKeys);
    }
  });
});

// startup message
chrome.runtime.sendMessage({name: MessageName.STARTUP}, (response) => {
  render(response.shortcutKeys);
});
