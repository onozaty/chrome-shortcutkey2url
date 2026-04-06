const { launchBrowser, getWorker } = require('./helpers/browser');

let browser;
let worker;
let extensionId;
let basePage;

beforeAll(async () => {
  browser = await launchBrowser();
  ({ extensionId, worker } = await getWorker(browser));

  // openPopup() はフォーカスがあるウィンドウでのみ動作するためベースページを開いておく
  basePage = await browser.newPage();
  await basePage.goto(`chrome-extension://${extensionId}/options/options.html`);
});

afterAll(async () => {
  await browser.close();
});

async function openPopup() {
  await worker.evaluate('chrome.action.openPopup();');
  const popupTarget = await browser.waitForTarget(
    (t) => t.type() === 'page' && t.url().includes('popup.html')
  );
  return popupTarget.asPage();
}

describe('ポップアップ表示確認', () => {
  let popup;

  beforeEach(async () => {
    popup = await openPopup();
    await popup.waitForSelector('#shortcutKeys .item');
  });

  afterEach(async () => {
    if (!popup.isClosed()) await popup.close();
  });

  test('ショートカットキーリストが表示される', async () => {
    const items = await popup.$$('#shortcutKeys .item');
    expect(items.length).toBeGreaterThan(0);
  });

  test('各アイテムにキーとタイトルが表示される', async () => {
    const keyText = await popup.$eval('#shortcutKeys .item:first-child .key', (el) => el.textContent.trim());
    const titleText = await popup.$eval('#shortcutKeys .item:first-child .title', (el) => el.textContent.trim());
    expect(keyText.length).toBeGreaterThan(0);
    expect(titleText.length).toBeGreaterThan(0);
  });

  test('Add current page リンクが存在する', async () => {
    const el = await popup.$('#add');
    expect(el).not.toBeNull();
  });

  test('Options リンクが存在する', async () => {
    const el = await popup.$('#options');
    expect(el).not.toBeNull();
  });
});

describe('Add to ShortcutKey2URL', () => {
  test('Add current page から現在ページを options に追加できる', async () => {
    const targetPage = await browser.newPage();
    let optionsPage;
    let popup;

    try {
      await targetPage.goto('https://example.com', { waitUntil: 'networkidle0' });
      await targetPage.bringToFront();

      // options ページを独立して開く
      optionsPage = await browser.newPage();
      await optionsPage.goto(`chrome-extension://${extensionId}/options/options.html`, {
        waitUntil: 'networkidle0',
      });
      await optionsPage.waitForSelector('#shortcutKeys .shortcut-entry');
      const countBefore = await optionsPage.$$eval('#shortcutKeys .shortcut-entry', (els) => els.length);

      // targetPage をアクティブにしてポップアップを開く
      await targetPage.bringToFront();
      popup = await openPopup();
      await popup.waitForSelector('#shortcutKeys .item');
      await popup.click('#add');

      await optionsPage.waitForFunction(
        (expectedCount) => document.querySelectorAll('#shortcutKeys .shortcut-entry').length >= expectedCount,
        {},
        countBefore + 1
      );

      const addedEntry = await optionsPage.$eval('#shortcutKeys .shortcut-entry:last-child', (entry) => ({
        key: entry.querySelector('input[name="key"]').value,
        title: entry.querySelector('input[name="title"]').value,
        url: entry.querySelector('input[name="url"]').value,
        action: entry.querySelector('select[name="action"]').value,
        isDetailHidden: entry.querySelector('.entry-body').classList.contains('hidden'),
      }));

      expect(addedEntry.key).toBe('');
      expect(addedEntry.title).toBe('Example Domain');
      expect(addedEntry.url).toBe('https://example.com/');
      expect(addedEntry.action).toBe('3');
      expect(addedEntry.isDetailHidden).toBe(false);
    } finally {
      if (popup && !popup.isClosed()) await popup.close();
      if (optionsPage && !optionsPage.isClosed()) await optionsPage.close();
      if (!targetPage.isClosed()) await targetPage.close();
    }
  });
});
