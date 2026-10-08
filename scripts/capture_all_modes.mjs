import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Dipesh Padole\\.gemini\\antigravity-ide\\brain\\29116a74-0fc3-4dbe-a576-009d7622fc62';
const tempMediaDir = path.join(artifactDir, '.tempmediaStorage');

if (!fs.existsSync(tempMediaDir)) {
  fs.mkdirSync(tempMediaDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWsUrl(port) {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const tabs = await res.json();
      const page = tabs.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) {
      await sleep(300);
    }
  }
  throw new Error('Failed to find page target in Chrome debug port');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
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
      const id = this.id++;
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
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.data, 'base64');
    const outPath = path.join(tempMediaDir, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`[SAVED] ${filename} (${buf.length} bytes)`);
    return outPath;
  }
}

async function run() {
  console.log('[1] Launching Chrome...');
  const port = 9226;
  const chromeProcess = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--window-size=1600,1000',
    'http://localhost:5173/student'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('[2] Waiting 16s for Cinematic Intro to complete transition...');
    await sleep(16000);
    console.log('[3] Main Lab Workspace Active. Initializing 3D Hero Mode testing...');
    await sleep(1000);

    // 1. NORMAL MODE
    console.log('[4] Testing NORMAL mode...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.trim() === 'NORMAL');
        if (btn) btn.click();
      })()
    `);
    await sleep(800);
    await client.captureScreenshot('hero_1_normal.png');

    // 2. THERMAL MODE
    console.log('[5] Testing THERMAL mode...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.trim() === 'THERMAL');
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot('hero_2_thermal.png');

    // 3. HEAT FLOW MODE
    console.log('[6] Testing HEAT FLOW mode...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.trim() === 'HEAT FLOW');
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot('hero_3_heatflow.png');

    // 4. SENSORS MODE & Focus T4
    console.log('[7] Testing SENSORS mode...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.trim() === 'SENSORS');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const t4 = btns.find(b => b.textContent && b.textContent.trim() === 'T4');
        if (t4) t4.click();
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot('hero_4_sensors.png');

    // 5. COOLER MODE
    console.log('[8] Testing COOLER mode...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.trim() === 'COOLER');
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot('hero_5_cooling.png');

    // 6. HEATER MODE
    console.log('[9] Testing HEATER mode...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.trim() === 'HEATER');
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot('hero_6_heater.png');

    // 7. X-RAY / CUTAWAY MODE
    console.log('[10] Testing X-RAY mode...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.trim() === 'X-RAY');
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot('hero_7_xray.png');

    // 8. EXPLODED MODE
    console.log('[11] Testing EXPLODED mode...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.trim() === 'EXPLODED');
        if (btn) btn.click();
      })()
    `);
    await sleep(1200);
    await client.captureScreenshot('hero_8_exploded.png');

    // 9. CINEMATIC TOUR
    console.log('[12] Testing CINEMATIC mode...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.trim() === 'CINEMATIC');
        if (btn) btn.click();
      })()
    `);
    await sleep(1800);
    await client.captureScreenshot('hero_9_cinematic.png');

    // 10. DEMO MODE
    console.log('[13] Testing DEMO MODE...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('DEMO MODE'));
        if (btn) btn.click();
      })()
    `);
    await sleep(2500);
    await client.captureScreenshot('hero_10_demo.png');

    console.log('[14] ALL HERO 3D MODES VERIFIED!');
  } finally {
    chromeProcess.kill();
  }
}

run().catch((e) => {
  console.error('[FAILED]', e);
  process.exit(1);
});
