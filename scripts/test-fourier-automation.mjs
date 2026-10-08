import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\Dipesh Padole\\.gemini\\antigravity-ide\\brain\\29116a74-0fc3-4dbe-a576-009d7622fc62\\.tempmediaStorage";

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
    this.consoleLogs = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        } else if (data.method === 'Runtime.consoleAPICalled') {
          const text = data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
          this.consoleLogs.push({ type: data.params.type, text });
          if (data.params.type === 'error') {
            console.error(`[Browser Console ${data.params.type}]:`, text);
          }
        } else if (data.method === 'Runtime.exceptionThrown') {
          console.error(`[Browser Runtime Exception]:`, data.params.exceptionDetails);
          this.consoleLogs.push({ type: 'error', text: JSON.stringify(data.params.exceptionDetails) });
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: `(() => { ${expr} })()`,
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
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
    return outPath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log("1. Obtaining JWT token from backend...");
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex.rivera@university.edu', password: 'password123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) throw new Error("Backend login failed");
  const token = loginData.token;
  const user = loginData.user;
  console.log("   Authenticated as:", user.name, "Role:", user.role);

  console.log("2. Launching headless Edge with CDP...");
  const edge = spawn(EDGE_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "http://localhost:5173/login"
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 2500));

  try {
    const targetsRes = await fetch("http://127.0.0.1:9222/json");
    const targets = await targetsRes.json();
    const labTarget = targets.find(t => t.url.includes("5173"));
    if (!labTarget) throw new Error("Target 5173 not found");

    const client = new CDPClient(labTarget.webSocketDebuggerUrl);
    await client.connect();
    console.log("   Connected to CDP WebSocket!");

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // Inject valid JWT auth session into localStorage and navigate to /lab?nointro=1
    console.log("3. Injecting session and navigating to /lab?nointro=1...");
    await client.eval(`
      localStorage.setItem('thermotwin_token', ${JSON.stringify(token)});
      localStorage.setItem('thermotwin-auth-v5', JSON.stringify({
        state: {
          token: ${JSON.stringify(token)},
          currentUser: ${JSON.stringify(user)},
          isAuthenticated: true
        },
        version: 0
      }));
      sessionStorage.setItem('thermotwin_intro_seen', 'true');
      window.location.href = "http://localhost:5173/lab?nointro=1";
    `);

    // Wait for /lab to load
    await new Promise(r => setTimeout(r, 3000));

    // A. Check Normal Lab page
    const labStatus = await client.eval(`
      const canvas = document.querySelector('canvas');
      const hasConfig = !!document.querySelector('aside');
      const rootChildren = document.getElementById('root')?.children.length || 0;
      return { hasCanvas: !!canvas, hasConfig, rootChildren, url: window.location.href };
    `);
    console.log("A. Normal Lab status:", labStatus);
    await client.captureScreenshot('fourier_flow_1_lab_initial.png');

    // B. Click FOURIER WORKBENCH button in Left IconRail
    console.log("B. Clicking 'FOURIER WORKBENCH' button...");
    const clickResult = await client.eval(`
      const fourierBtn = document.querySelector('button[aria-label="Fourier Workbench"]');
      if (fourierBtn) {
        fourierBtn.click();
        return "Clicked IconRail button[aria-label='Fourier Workbench']";
      }
      return "Button not found";
    `);
    console.log("   Result:", clickResult);
    await new Promise(r => setTimeout(r, 1500));

    // C. Verify Fourier Workbench is rendered without black screen
    const fourierState = await client.eval(`
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, div, p, span'));
      const titleFound = headings.some(h => h.textContent.includes('FOURIER WORKBENCH'));
      const successBadge = headings.some(h => h.textContent.includes('Fourier Workbench loaded successfully.'));
      const canvasStillPresent = !!document.querySelector('canvas');
      const hasBlackScreen = document.getElementById('root')?.children.length === 0 || document.body.innerHTML.trim() === '';
      const textSnippets = headings.map(h => h.textContent).filter(t => t.includes('Analytical') || t.includes('Gradient') || t.includes('Experimental k'));
      return { titleFound, successBadge, canvasStillPresent, hasBlackScreen, textSnippets: textSnippets.slice(0, 5) };
    `);
    console.log("C. Fourier Workbench open state:", fourierState);
    await client.captureScreenshot('fourier_flow_2_workbench_open.png');

    // D. Switch to Tab 2: Temperature Profile & Regression
    console.log("D. Testing Tab 2 (Gradient Graph)...");
    await client.eval(`
      const tab2 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Temperature Profile'));
      if (tab2) tab2.click();
    `);
    await new Promise(r => setTimeout(r, 1000));
    await client.captureScreenshot('fourier_flow_3_graph_tab.png');

    // E. Click [ CLOSE ]
    console.log("E. Clicking [ CLOSE ] button...");
    const closed = await client.eval(`
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CLOSE'));
      if (closeBtn) {
        closeBtn.click();
        return true;
      }
      return false;
    `);
    console.log("   Close clicked?", closed);
    await new Promise(r => setTimeout(r, 1200));

    const afterClose = await client.eval(`
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, div, p, span'));
      const workbenchClosed = !headings.some(h => h.textContent.includes('Fourier Workbench loaded successfully.'));
      const canvasActive = !!document.querySelector('canvas');
      return { workbenchClosed, canvasActive };
    `);
    console.log("   After close state:", afterClose);
    await client.captureScreenshot('fourier_flow_4_lab_returned.png');

    // F. Re-open Fourier Workbench a second time to verify toggle repeatability
    console.log("F. Re-opening Fourier Workbench second time...");
    await client.eval(`
      const fourierBtn = document.querySelector('button[aria-label="Fourier Workbench"]');
      if (fourierBtn) fourierBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1200));

    const reOpenState = await client.eval(`
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, div, p, span'));
      const titleFound = headings.some(h => h.textContent.includes('FOURIER WORKBENCH'));
      const canvasStillPresent = !!document.querySelector('canvas');
      return { titleFound, canvasStillPresent };
    `);
    console.log("   Re-open state:", reOpenState);
    await client.captureScreenshot('fourier_flow_5_reopen.png');

    // Close it again
    await client.eval(`
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CLOSE'));
      if (closeBtn) closeBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    // G. Verify other pages: /dashboard
    console.log("\nG. Testing /dashboard page...");
    await client.eval(`window.location.href = "http://localhost:5173/dashboard";`);
    await new Promise(r => setTimeout(r, 2000));
    const dashState = await client.eval(`
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, span')).map(h => h.textContent);
      return { url: window.location.href, hasContent: document.body.innerHTML.length > 500 };
    `);
    console.log("   Dashboard status:", dashState);
    await client.captureScreenshot('page_test_dashboard.png');

    // H. Verify other pages: /experiments
    console.log("H. Testing /experiments page...");
    await client.eval(`window.location.href = "http://localhost:5173/experiments";`);
    await new Promise(r => setTimeout(r, 2000));
    const expState = await client.eval(`
      return { url: window.location.href, hasContent: document.body.innerHTML.length > 500 };
    `);
    console.log("   Experiments status:", expState);
    await client.captureScreenshot('page_test_experiments.png');

    // I. Verify other pages: /login
    console.log("I. Testing /login page...");
    await client.eval(`window.location.href = "http://localhost:5173/login";`);
    await new Promise(r => setTimeout(r, 2000));
    const loginState = await client.eval(`
      const inputs = document.querySelectorAll('input').length;
      return { url: window.location.href, inputCount: inputs, hasContent: document.body.innerHTML.length > 500 };
    `);
    console.log("   Login status:", loginState);
    await client.captureScreenshot('page_test_login.png');

    // Console Error Summary
    const errors = client.consoleLogs.filter(l => l.type === 'error');
    console.log(`\n========================================`);
    console.log(`TEST SUMMARY & ACCEPTANCE CHECK`);
    console.log(`========================================`);
    console.log(`Total console runtime errors: ${errors.length}`);
    if (errors.length > 0) {
      console.error("Runtime errors caught:", errors);
    } else {
      console.log("✓ SUCCESS: ZERO RUNTIME CONSOLE ERRORS ACROSS ALL PAGES AND WORKFLOWS!");
    }

    client.close();
  } catch (err) {
    console.error("Test failed with exception:", err);
  } finally {
    edge.kill();
  }
}

main();
