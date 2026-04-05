const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, '../../../src');

async function launchBrowser() {
  return puppeteer.launch({
    headless: false,
    pipe: true,
    enableExtensions: [EXTENSION_PATH],
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO, 10) : 0,
  });
}

async function getWorker(browser) {
  const workerTarget = await browser.waitForTarget(
    (t) => t.type() === 'service_worker' && t.url().includes('background-wrapper.js')
  );
  const extensionId = workerTarget.url().split('/')[2];
  const worker = await workerTarget.worker();
  return { extensionId, worker };
}

module.exports = { launchBrowser, getWorker };
