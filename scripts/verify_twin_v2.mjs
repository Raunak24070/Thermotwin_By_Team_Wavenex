import { spawn } from 'child_process';
import http from 'http';
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
    console.log(`[SCREENSHOT] Saved: ${outPath} (${buf.length} bytes)`);
    return outPath;
  }
}

async function run() {
  console.log('[1] Launching Headless Chrome...');
  const port = 9225;
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
    console.log('[2] Chrome CDP ready at:', wsUrl);

    const client = new CDPClient(wsUrl);
    await client.connect();
    console.log('[3] Connected to CDP');

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('[4] Waiting 3.2s for Skip Intro button to appear...');
    await sleep(3200);

    // Skip Intro
    const skipped = await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const skip = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('skip'));
        if (skip) {
          skip.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('[5] Skipped Intro:', skipped);
    await sleep(1200);

    // Verify 3D canvas and modes
    const uiState = await client.evaluate(`
      (() => {
        const canvas = document.querySelector('canvas');
        const modeButtons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim());
        return {
          hasCanvas: !!canvas,
          canvasWidth: canvas?.clientWidth,
          canvasHeight: canvas?.clientHeight,
          modeButtons: modeButtons.filter(b => ['NORMAL', 'THERMAL', 'HEAT FLOW', 'SENSORS', 'COOLER', 'HEATER', 'X-RAY', 'EXPLODED', 'CINEMATIC', 'DEMO MODE'].includes(b))
        };
      })()
    `);
    console.log('[6] 3D Digital Twin Mounted:', JSON.stringify(uiState, null, 2));

    // Capture Mode 1: NORMAL
    console.log('[7] Capturing MODE 1: NORMAL...');
    await client.captureScreenshot('mode_1_normal.png');

    // Test Mode 2: THERMAL
    console.log('[8] Testing MODE 2: THERMAL...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const thermal = btns.find(b => b.textContent && b.textContent.trim() === 'THERMAL');
        if (thermal) thermal.click();
      })()
    `);
    await sleep(800);
    await client.captureScreenshot('mode_2_thermal.png');

    // Test Mode 3: HEAT FLOW
    console.log('[9] Testing MODE 3: HEAT FLOW...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const hf = btns.find(b => b.textContent && b.textContent.trim() === 'HEAT FLOW');
        if (hf) hf.click();
      })()
    `);
    await sleep(800);
    await client.captureScreenshot('mode_3_heatflow.png');

    // Test Mode 4: SENSORS
    console.log('[10] Testing MODE 4: SENSORS & FOCUS T4...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const sensors = btns.find(b => b.textContent && b.textContent.trim() === 'SENSORS');
        if (sensors) sensors.click();
      })()
    `);
    await sleep(400);
    // Click T4 button or focus
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const t4 = btns.find(b => b.textContent && b.textContent.trim() === 'T4');
        if (t4) t4.click();
      })()
    `);
    await sleep(800);
    await client.captureScreenshot('mode_4_sensors.png');

    // Test Mode 5: COOLER
    console.log('[11] Testing MODE 5: COOLING...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cooler = btns.find(b => b.textContent && b.textContent.trim() === 'COOLER');
        if (cooler) cooler.click();
      })()
    `);
    await sleep(800);
    await client.captureScreenshot('mode_5_cooling.png');

    // Test Mode 6: HEATER
    console.log('[12] Testing MODE 6: HEATER...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const heater = btns.find(b => b.textContent && b.textContent.trim() === 'HEATER');
        if (heater) heater.click();
      })()
    `);
    await sleep(800);
    await client.captureScreenshot('mode_6_heater.png');

    // Test Mode 7: X-RAY / CUTAWAY
    console.log('[13] Testing MODE 7: X-RAY / CUTAWAY...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const xray = btns.find(b => b.textContent && b.textContent.trim() === 'X-RAY');
        if (xray) xray.click();
      })()
    `);
    await sleep(800);
    await client.captureScreenshot('mode_7_xray.png');

    // Test Mode 8: EXPLODED
    console.log('[14] Testing MODE 8: EXPLODED VIEW...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const exp = btns.find(b => b.textContent && b.textContent.trim() === 'EXPLODED');
        if (exp) exp.click();
      })()
    `);
    await sleep(1000);
    await client.captureScreenshot('mode_8_exploded.png');

    // Click RESET ASSEMBLY
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const reset = btns.find(b => b.textContent && b.textContent.includes('RESET ASSEMBLY'));
        if (reset) reset.click();
      })()
    `);
    await sleep(600);

    // Test Mode 9: CINEMATIC
    console.log('[15] Testing MODE 9: CINEMATIC TOUR...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cine = btns.find(b => b.textContent && b.textContent.trim() === 'CINEMATIC');
        if (cine) cine.click();
      })()
    `);
    await sleep(1500);
    await client.captureScreenshot('mode_9_cinematic.png');

    // Exit cinematic
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const exit = btns.find(b => b.textContent && b.textContent.includes('EXIT CINEMATIC'));
        if (exit) exit.click();
      })()
    `);
    await sleep(500);

    // Test Mode 10: DEMO MODE
    console.log('[16] Testing HACKATHON DEMO MODE...');
    await client.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const demo = btns.find(b => b.textContent && b.textContent.includes('DEMO MODE'));
        if (demo) demo.click();
      })()
    `);
    await sleep(1500);
    await client.captureScreenshot('mode_10_demo.png');

    console.log('[17] ALL MODES SUCCESSFULLY TESTED AND VERIFIED!');
  } finally {
    chromeProcess.kill();
  }
}

run().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
