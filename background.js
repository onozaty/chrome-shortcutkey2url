const settings = new Settings();
const handler = new Handler(settings);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);

  var result = handler.handle(message);
  console.log(result);
  sendResponse(result);
});
