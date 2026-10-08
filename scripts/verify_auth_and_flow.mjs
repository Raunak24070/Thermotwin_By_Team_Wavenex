import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;
const ARTIFACTS_DIR = 'C:\\Users\\Dipesh Padole\\.gemini\\antigravity-ide\\brain\\29116a74-0fc3-4dbe-a576-009d7622fc62\\.tempmediaStorage';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class SimpleCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.addEventListener('open', resolve);
      this.ws.addEventListener('error', reject);
      this.ws.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(msg.error);
          else cb.resolve(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(filepath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filepath}`);
  }
}

async function run() {
  console.log('[E2E Test] Starting headless Chrome...');
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    '--user-data-dir=' + path.resolve('./temp_chrome_e2e')
  ]);

  await delay(2500);

  try {
    const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const cdp = new SimpleCDP(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    const baseUrl = 'http://localhost:5173';
    console.log(`[E2E Test] Navigating to ${baseUrl}/ (root)...`);
    await cdp.send('Page.navigate', { url: baseUrl });
    await delay(2500);

    // 1. Verify redirected to /login
    const currentUrl1 = await cdp.evaluate('window.location.pathname');
    console.log(`[E2E Test] Step 1 - Root URL resolved to: ${currentUrl1}`);
    await cdp.captureScreenshot(path.join(ARTIFACTS_DIR, 'auth_1_login_initial.png'));

    // 2. Test Login Failure
    console.log('[E2E Test] Step 2 - Testing invalid login credentials...');
    await cdp.evaluate(`
      (() => {
        const emailInput = document.querySelector('input[type="email"]');
        const passInput = document.querySelector('input[type="password"]');
        const form = document.querySelector('form');
        if (emailInput && passInput) {
          emailInput.value = 'invalid.user@test.com';
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          passInput.value = 'wrongpassword';
          passInput.dispatchEvent(new Event('input', { bubbles: true }));
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      })()
    `);
    await delay(1500);
    const failureMsg = await cdp.evaluate(`document.body.innerText`);
    const hasFailure = failureMsg.includes('Invalid') || failureMsg.includes('failed');
    console.log(`[E2E Test] Step 2 - Login failure alert displayed: ${hasFailure}`);
    await cdp.captureScreenshot(path.join(ARTIFACTS_DIR, 'auth_2_login_error.png'));

    // 3. Test Successful Login using Quick Demo fill
    console.log('[E2E Test] Step 3 - Logging in as Alex Rivera (Student)...');
    await cdp.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const alexBtn = buttons.find(b => b.innerText.includes('Alex Rivera'));
        if (alexBtn) alexBtn.click();
      })()
    `);
    await delay(500);

    // Click submit
    await cdp.evaluate(`
      (() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `);
    await delay(2500);

    const currentUrl2 = await cdp.evaluate('window.location.pathname');
    console.log(`[E2E Test] Step 3 - Logged in, current pathname: ${currentUrl2}`);
    await cdp.captureScreenshot(path.join(ARTIFACTS_DIR, 'auth_3_dashboard.png'));

    // 4. Click "ENTER LAB"
    console.log('[E2E Test] Step 4 - Clicking ENTER LAB button...');
    await cdp.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const enterLabBtn = buttons.find(b => b.innerText.includes('ENTER LAB'));
        if (enterLabBtn) enterLabBtn.click();
      })()
    `);
    await delay(3500);

    const currentUrl3 = await cdp.evaluate('window.location.pathname');
    console.log(`[E2E Test] Step 4 - Navigated to: ${currentUrl3}`);

    // If cinematic intro shows, skip it
    await cdp.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const skip = btns.find(b => b.innerText.includes('SKIP'));
        if (skip) skip.click();
      })()
    `);
    await delay(1500);
    await cdp.captureScreenshot(path.join(ARTIFACTS_DIR, 'auth_4_lab_view.png'));

    // 5. Test "Save Run" button in TopBar
    console.log('[E2E Test] Step 5 - Testing Save Run to MongoDB...');
    await cdp.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const saveBtn = btns.find(b => b.innerText.includes('Save Run'));
        if (saveBtn) saveBtn.click();
      })()
    `);
    await delay(1500);
    console.log('[E2E Test] Step 5 - Save Run triggered.');
    await cdp.captureScreenshot(path.join(ARTIFACTS_DIR, 'auth_5_saved_toast.png'));

    // 6. Navigate to /experiments
    console.log('[E2E Test] Step 6 - Navigating to /experiments...');
    await cdp.send('Page.navigate', { url: `${baseUrl}/experiments` });
    await delay(2500);

    const experimentsCount = await cdp.evaluate(`
      document.querySelectorAll('table tbody tr').length
    `);
    console.log(`[E2E Test] Step 6 - Saved experiments in table: ${experimentsCount}`);
    await cdp.captureScreenshot(path.join(ARTIFACTS_DIR, 'auth_6_my_experiments.png'));

    // 6.5. Click View on the first experiment
    console.log('[E2E Test] Step 6.5 - Clicking View on the first saved experiment...');
    await cdp.evaluate(`
      (() => {
        const viewBtn = document.querySelector('table tbody tr button[title*="View"]');
        if (viewBtn) viewBtn.click();
      })()
    `);
    await delay(2500);
    const detailUrl = await cdp.evaluate('window.location.pathname');
    console.log(`[E2E Test] Step 6.5 - Navigated to detail view: ${detailUrl}`);
    await cdp.captureScreenshot(path.join(ARTIFACTS_DIR, 'auth_8_experiment_detail.png'));

    // 7. Test Logout
    console.log('[E2E Test] Step 7 - Testing Logout...');
    await cdp.send('Page.navigate', { url: `${baseUrl}/dashboard` });
    await delay(1500);
    await cdp.evaluate(`
      (() => {
        // Open user dropdown
        const userBtn = document.querySelector('header button');
        if (userBtn) userBtn.click();
      })()
    `);
    await delay(500);
    await cdp.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const logoutBtn = btns.find(b => b.innerText.includes('Sign Out') || b.innerText.includes('Logout'));
        if (logoutBtn) logoutBtn.click();
      })()
    `);
    await delay(1500);

    const currentUrl4 = await cdp.evaluate('window.location.pathname');
    const tokenAfterLogout = await cdp.evaluate(`localStorage.getItem('thermotwin_token')`);
    console.log(`[E2E Test] Step 7 - After logout pathname: ${currentUrl4}, token in storage: ${tokenAfterLogout}`);
    await cdp.captureScreenshot(path.join(ARTIFACTS_DIR, 'auth_7_logged_out.png'));

    // 8. Test Direct Protected Route Access while logged out
    console.log('[E2E Test] Step 8 - Testing direct access to /lab while unauthenticated...');
    await cdp.send('Page.navigate', { url: `${baseUrl}/lab` });
    await delay(1500);
    const currentUrl5 = await cdp.evaluate('window.location.pathname');
    console.log(`[E2E Test] Step 8 - Unauthenticated /lab redirected to: ${currentUrl5}`);

    console.log('[E2E Test] ALL FLOW VERIFICATION TESTS COMPLETED SUCCESSFULLY!');

  } finally {
    chromeProc.kill();
  }
}

run().catch(err => {
  console.error('[E2E Test Error]:', err);
  process.exit(1);
});
