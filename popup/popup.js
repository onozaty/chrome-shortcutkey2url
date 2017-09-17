document.addEventListener('keypress', (e) => {
  console.log(e);

  var message = {
    "charCode": e.charCode,
    "keyCode": e.keyCode,
    "altKey": e.altKey,
    "ctrlKey": e.ctrlKey,
    "metaKey": e.metaKey,
    "shiftKey": e.shiftKey
  };

  chrome.runtime.sendMessage(message, (response) => {
    console.log('response: ', response)
  });
});
