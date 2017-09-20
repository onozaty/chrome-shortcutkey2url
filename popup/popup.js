document.addEventListener('keypress', (e) => {
  console.log(e);

  var message = {
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

  chrome.runtime.sendMessage(message, (result) => {
    console.log('result: ', result);

    if (result == HandleResult.FINISH) {
      window.close();
    }
  });
});

// startup message
chrome.runtime.sendMessage({name: MessageName.STARTUP}, () => {});
