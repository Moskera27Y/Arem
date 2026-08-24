// Shared headless-Chrome launcher for the AREM test suite.
//
// Two Windows quirks are handled here:
// 1. `chrome.pid` is the short-lived launcher process — killing it does NOT
//    kill the real browser, so we kill the LISTENER PID on our debugging port
//    and any chrome process using our unique profile directory.
// 2. A fixed --remote-debugging-port collides with zombie instances from
//    crashed runs, silently attaching the test to a stale browser+profile.
//    Using port 0 (random) and reading DevToolsActivePort makes every run
//    fully isolated.

import { spawn, execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launchChrome(extraArgs = []) {
  const profile = mkdtempSync(join(tmpdir(), "arem-browser-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      ...extraArgs,
    ],
    { stdio: "ignore" },
  );

  let port = 0;
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; i < 60; i++) {
    try {
      if (existsSync(portFile)) {
        const first = readFileSync(portFile, "utf8").split("\n")[0]?.trim();
        const parsed = Number(first);
        if (parsed > 0) {
          port = parsed;
          break;
        }
      }
    } catch {
      /* retry */
    }
    await sleep(250);
  }

  if (!port) {
    killChromeByProfile(profile);
    throw new Error("Chrome did not open a debugging port");
  }
  return { chrome, profile, port };
}

/** Kill the real browser: the listener on our port + any process using our profile. */
export function killChromeTree({ port, profile }) {
  // 1. Kill the process listening on our debugging port (the actual browser).
  try {
    const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
      encoding: "utf8",
    });
    const pids = new Set();
    for (const line of out.split("\n")) {
      const m = line.trim().split(/\s+/).pop();
      if (m && /^\d+$/.test(m)) pids.add(m);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" });
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* no listener */
  }

  // 2. Sweep any chrome process referencing this run's unique profile dir.
  killChromeByProfile(profile);

  // 3. Remove the profile dir (retry in case Chrome still holds locks).
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 6, retryDelay: 400 });
  } catch {
    /* best effort */
  }
}

function killChromeByProfile(profile) {
  try {
    // Profile path travels via env var so no quoting can break the command.
    const script =
      "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -like ('*' + $env:AREM_PROFILE + '*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";
    execSync(`powershell -NoProfile -Command "${script}"`, {
      stdio: "ignore",
      env: { ...process.env, AREM_PROFILE: profile },
    });
  } catch {
    /* best effort */
  }
}
