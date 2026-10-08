import { spawn } from 'child_process';
import http from 'http';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function run() {
  console.log("Launching Edge headless...");
  const edge = spawn(EDGE_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:5173/lab"
  ], { stdio: 'ignore' });

  // Wait 3 seconds for Edge to start and listen
  await new Promise(r => setTimeout(r, 3000));

  try {
    // Check targets from CDP HTTP endpoint
    const targetsRes = await fetch("http://127.0.0.1:9222/json");
    const targets = await targetsRes.json();
    console.log("CDP Targets found:", targets.length);
    const labTarget = targets.find(t => t.url.includes("5173"));
    if (!labTarget) {
      console.log("Lab target not found among targets:", targets.map(t => t.url));
      return;
    }
    console.log("Connected to page:", labTarget.title, labTarget.url);

    // Let's connect via WebSocket to CDP
    const wsUrl = labTarget.webSocketDebuggerUrl;
    console.log("WebSocket URL:", wsUrl);

    // Dynamic import ws or basic test
    const { WebSocket } = await import('ws').catch(() => ({ WebSocket: null }));
    if (!WebSocket) {
      console.log("ws module not directly installed, will test using fetch CDP commands");
    }
  } catch (err) {
    console.error("Error connecting to CDP:", err.message);
  } finally {
    edge.kill();
  }
}

run();
