// https://stackoverflow.com/questions/70474845/inject-javascript-from-content-script-with-a-chrome-extension-v3
function injectScript (src) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(src);
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}

injectScript('injected-script.js');
