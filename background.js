Settings.newAsync().then((settings) => {

  const handler = new Handler(settings);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);

    handler.handle(message).then((result) => {
      console.log(result);
      sendResponse(result);
    });

    return true;
  });
});