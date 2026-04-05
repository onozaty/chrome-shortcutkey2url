const { launchBrowser, getWorker } = require('./helpers/browser');

let browser;
let page;
let extensionId;

beforeAll(async () => {
  browser = await launchBrowser();
  ({ extensionId } = await getWorker(browser));
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.goto(`chrome-extension://${extensionId}/options/options.html`, {
    waitUntil: 'networkidle0',
  });
  // startup()の非同期処理(chrome.runtime.sendMessage)完了を待つ
  // デフォルトのショートカットキーがDOMに表示されたら準備完了
  await page.waitForSelector('#shortcutKeys .shortcut-entry');
});

afterEach(async () => {
  await page.close();
});

// options.jsのkeypressハンドラと競合しないようinputに値をセットするユーティリティ
// page.type() はkeypress/keydownを発火しoptions.jsのハンドラと二重になるため使わない
async function setKeyInput(selector, value) {
  await page.$eval(selector, (el, v) => {
    el.value = v;
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  }, value);
}

async function setTextInput(selector, value) {
  await page.$eval(selector, (el, v) => {
    el.value = v;
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  }, value);
}

async function isHidden(selector) {
  return page.$eval(selector, (el) => el.classList.contains('hidden'));
}

describe('ページ表示確認', () => {
  test('初期表示が正しい', async () => {
    // タイトル
    expect(await page.title()).toBe('ShortcutKey2URL');

    // パネル
    expect(await page.$eval('#settingsCard .card-header', (el) => el.textContent.trim())).toBe('Settings');
    expect(await page.$eval('#shortcutKeysCard .card-header', (el) => el.textContent.trim())).toBe('Shortcut keys');

    // ボタン
    expect(await page.$('#addButton')).not.toBeNull();
    expect(await page.$('#importButton')).not.toBeNull();
    expect(await page.$('#exportButton')).not.toBeNull();
    expect(await page.$('#saveButton')).not.toBeNull();

    // Startup key
    const startupKey = await page.$eval('#startupKey', (el) => el.value);
    expect(startupKey.length).toBeGreaterThan(0);

    // Column count
    const columnCount = await page.$eval('#inputColumnCount', (el) => el.value);
    expect(Number(columnCount)).toBeGreaterThanOrEqual(1);

    // デフォルトのショートカットキーが折りたたまれた状態で表示される
    const entries = await page.$$('#shortcutKeys .shortcut-entry');
    expect(entries.length).toBeGreaterThan(0);
    const isBodyHidden = await page.$eval(
      '#shortcutKeys .shortcut-entry:first-child .entry-body',
      (el) => el.classList.contains('hidden')
    );
    expect(isBodyHidden).toBe(true);
  });
});

describe('展開/折りたたみ', () => {
  test('サマリーをクリックすると詳細が展開される', async () => {
    await page.click('#shortcutKeys .shortcut-entry:first-child .summary');
    const isBodyHidden = await page.$eval(
      '#shortcutKeys .shortcut-entry:first-child .entry-body',
      (el) => el.classList.contains('hidden')
    );
    expect(isBodyHidden).toBe(false);
  });

  test('展開状態から折りたたみボタンで閉じられる', async () => {
    // まず展開
    await page.click('#shortcutKeys .shortcut-entry:first-child .summary');
    // 閉じる
    await page.click('#shortcutKeys .shortcut-entry:first-child .close-detail');
    const isBodyHidden = await page.$eval(
      '#shortcutKeys .shortcut-entry:first-child .entry-body',
      (el) => el.classList.contains('hidden')
    );
    expect(isBodyHidden).toBe(true);
  });
});

describe('新規追加', () => {
  test('Addボタンで新しいエントリが追加される', async () => {
    const countBefore = await page.$$eval('#shortcutKeys .shortcut-entry', (els) => els.length);
    await page.click('#addButton');
    const countAfter = await page.$$eval('#shortcutKeys .shortcut-entry', (els) => els.length);
    expect(countAfter).toBe(countBefore + 1);
  });

  test('追加されたエントリは展開状態', async () => {
    await page.click('#addButton');
    const lastEntryBody = await page.$('#shortcutKeys .shortcut-entry:last-child .entry-body');
    const isBodyHidden = await lastEntryBody.evaluate((el) => el.classList.contains('hidden'));
    expect(isBodyHidden).toBe(false);
  });

  test('追加されたエントリまでスクロールされる', async () => {
    // ページを十分な高さにするためエントリを複数追加
    for (let i = 0; i < 10; i++) {
      await page.click('#addButton');
    }

    const isVisible = await page.$eval('#shortcutKeys .shortcut-entry:last-child', (el) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    expect(isVisible).toBe(true);
  });
});

describe('リアルタイムサマリー更新', () => {
  beforeEach(async () => {
    await page.click('#addButton');
  });

  test('Keyフィールド入力でヘッダーサマリーが更新される', async () => {
    await setKeyInput('#shortcutKeys .shortcut-entry:last-child input[name="key"]', 'T');
    const keyText = await page.$eval(
      '#shortcutKeys .shortcut-entry:last-child .summary .key',
      (el) => el.textContent
    );
    expect(keyText).toBe('T');
  });

  test('Keyフィールドへのキー入力で文字が重複しない', async () => {
    const selector = '#shortcutKeys .shortcut-entry:last-child input[name="key"]';
    await page.click(selector);
    await page.keyboard.type('AB');
    const value = await page.$eval(selector, (el) => el.value);
    expect(value).toBe('AB');
  });

  test('Titleフィールド入力でヘッダーサマリーが更新される', async () => {
    await setTextInput('#shortcutKeys .shortcut-entry:last-child input[name="title"]', 'Test Title');
    const titleText = await page.$eval(
      '#shortcutKeys .shortcut-entry:last-child .summary .title',
      (el) => el.textContent
    );
    expect(titleText).toBe('Test Title');
  });
});

describe('アクション連動フィールド表示', () => {
  beforeEach(async () => {
    await page.click('#addButton');
  });

  test('Execute scriptを選ぶとURLフィールドが非表示、Scriptが表示', async () => {
    // Execute script の ActionId は 4
    await page.select('#shortcutKeys .shortcut-entry:last-child select[name="action"]', '4');

    const urlHidden = await page.$eval(
      '#shortcutKeys .shortcut-entry:last-child [data-field="url"]',
      (el) => el.classList.contains('hidden')
    );
    const scriptHidden = await page.$eval(
      '#shortcutKeys .shortcut-entry:last-child [data-field="script"]',
      (el) => el.classList.contains('hidden')
    );
    expect(urlHidden).toBe(true);
    expect(scriptHidden).toBe(false);
  });

  test('Open current tab in incognito を選ぶとURL/Script両方非表示', async () => {
    // OPEN_CURRENT_TAB_PRIVATE_MODE の ActionId は 6
    await page.select('#shortcutKeys .shortcut-entry:last-child select[name="action"]', '6');

    const urlHidden = await page.$eval(
      '#shortcutKeys .shortcut-entry:last-child [data-field="url"]',
      (el) => el.classList.contains('hidden')
    );
    const scriptHidden = await page.$eval(
      '#shortcutKeys .shortcut-entry:last-child [data-field="script"]',
      (el) => el.classList.contains('hidden')
    );
    expect(urlHidden).toBe(true);
    expect(scriptHidden).toBe(true);
  });
});

describe('バリデーション', () => {
  beforeEach(async () => {
    await page.click('#addButton');
  });

  test('Keyが空のままSaveするとエラーメッセージが表示される', async () => {
    await page.click('#saveButton');
    const errorHidden = await isHidden('#errorMessage');
    expect(errorHidden).toBe(false);
  });

  test('Keyが空のエントリにはエラーアイコンが表示される', async () => {
    await page.click('#saveButton');
    const alertIconHidden = await page.$eval(
      '#shortcutKeys .shortcut-entry:last-child .alert-icon',
      (el) => el.classList.contains('hidden')
    );
    expect(alertIconHidden).toBe(false);
  });

  test('重複キーで重複メッセージが表示される', async () => {
    // 既存のデフォルトキーと同じキーを入力(例: GS)
    await setKeyInput('#shortcutKeys .shortcut-entry:last-child input[name="key"]', 'GS');
    await setTextInput('#shortcutKeys .shortcut-entry:last-child input[name="title"]', 'Test');
    await page.select('#shortcutKeys .shortcut-entry:last-child select[name="action"]', '3');
    await page.$eval('#shortcutKeys .shortcut-entry:last-child input[name="url"]', (el) => { el.value = 'https://example.com'; });
    await page.click('#saveButton');

    const dupMsgHidden = await page.$eval(
      '#shortcutKeys .shortcut-entry:last-child .duplicate-message',
      (el) => el.classList.contains('hidden')
    );
    expect(dupMsgHidden).toBe(false);
  });
});

async function addAndSaveEntry(key) {
  await page.click('#addButton');
  await setKeyInput('#shortcutKeys .shortcut-entry:last-child input[name="key"]', key);
  await setTextInput('#shortcutKeys .shortcut-entry:last-child input[name="title"]', 'Test Entry');
  await page.select('#shortcutKeys .shortcut-entry:last-child select[name="action"]', '3');
  await page.$eval('#shortcutKeys .shortcut-entry:last-child input[name="url"]', (el) => { el.value = 'https://example.com'; });
  await page.click('#saveButton');
  await page.waitForFunction(
    () => !document.getElementById('successMessage').classList.contains('hidden')
  );
}

describe('保存成功', () => {
  test('全項目入力してSaveすると成功メッセージが表示される', async () => {
    await addAndSaveEntry('ZZ');
    const successHidden = await isHidden('#successMessage');
    expect(successHidden).toBe(false);
  });

  test('成功メッセージの×ボタンで閉じられる', async () => {
    await addAndSaveEntry('QQ');
    await page.click('#successMessage .close');
    const successHidden = await isHidden('#successMessage');
    expect(successHidden).toBe(true);
  });
});

describe('削除', () => {
  test('Removeボタンでエントリが削除される', async () => {
    await page.click('#addButton');
    const countBefore = await page.$$eval('#shortcutKeys .shortcut-entry', (els) => els.length);

    await page.click('#shortcutKeys .shortcut-entry:last-child .remove');
    const countAfter = await page.$$eval('#shortcutKeys .shortcut-entry', (els) => els.length);
    expect(countAfter).toBe(countBefore - 1);
  });
});

describe('Export', () => {
  test('Exportするとショートカットキーのデータが取得できる', async () => {
    // URL.createObjectURL をモックしてデータを直接取得
    const exportData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const originalCreateObjectURL = URL.createObjectURL;
        URL.createObjectURL = (blob) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsText(blob);
          URL.createObjectURL = originalCreateObjectURL;
          return 'blob:mock';
        };
        document.getElementById('exportButton').click();
      });
    });

    const parsed = JSON.parse(exportData);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]).toHaveProperty('key');
    expect(parsed[0]).toHaveProperty('title');
  });
});
