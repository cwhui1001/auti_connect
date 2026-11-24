import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const frontend = fileURLToPath(new URL("../", import.meta.url));
const backend = fileURLToPath(new URL("../../backend/", import.meta.url));

async function availablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

function start(command, args, cwd, env) {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  let diagnostics = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => { diagnostics = (diagnostics + chunk).slice(-2000); });
  }
  child.on("error", (error) => { diagnostics += error.message; });
  return { child, diagnostics: () => diagnostics };
}

async function ready(server, url) {
  for (let attempt = 0; attempt < 60 && server.child.exitCode === null; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(500) });
      if (response.ok) return;
    } catch {
      // The process takes a moment to start listening.
    }
    await delay(250);
  }
  assert.fail(`Server did not become ready at ${url}\n${server.diagnostics()}`);
}

async function stop(server) {
  if (server.child.pid && server.child.exitCode === null && server.child.signalCode === null) {
    const closed = once(server.child, "close");
    server.child.kill();
    await closed;
  }
}

test("production frontend, protected routes and the real FastAPI health endpoint", async (t) => {
  const backendPort = await availablePort();
  const backendOrigin = `http://127.0.0.1:${backendPort}`;
  const api = start(process.env.PYTHON_BIN || "python", [
    "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", String(backendPort), "--no-access-log",
  ], backend, { SUPABASE_URL: "", SUPABASE_PUBLISHABLE_KEY: "" });
  t.after(() => stop(api));
  await ready(api, `${backendOrigin}/api/v1/health`);

  const frontendPort = await availablePort();
  const origin = `http://127.0.0.1:${frontendPort}`;
  const web = start(process.execPath, [
    require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(frontendPort),
  ], frontend, {
    SUPABASE_URL: "",
    SUPABASE_PUBLISHABLE_KEY: "",
    APP_ORIGIN: origin,
    AUTICONNECT_API_URL: backendOrigin,
    NEXT_TELEMETRY_DISABLED: "1",
  });
  t.after(() => stop(web));
  await ready(web, origin);

  await t.test("public routes expose predictable headings and keyboard landmarks", async () => {
    for (const [path, title] of [["/", "Welcome to AutiConnect"], ["/login", "Sign in"], ["/register", "Create an account"]]) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 200);
      const page = await response.text();
      assert.match(page, new RegExp(`<h1[^>]*>${title}</h1>`));
      assert.match(page, /href="#main-content"/);
      assert.match(page, /<main[^>]*id="main-content"/);
    }
  });

  await t.test("dashboard redirects signed-out requests and is not cached", async () => {
    const manifest = JSON.parse(readFileSync(new URL("../.next/prerender-manifest.json", import.meta.url), "utf8"));
    assert.ok(!Object.hasOwn(manifest.routes, "/dashboard"), "The dashboard must use runtime session settings.");
    const response = await fetch(`${origin}/dashboard`, { redirect: "manual" });
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location"), origin).pathname, "/login");
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  });

  await t.test("Next.js checks the FastAPI service and reports a dependency outage", async () => {
    const connected = await fetch(`${origin}/api/health`);
    assert.equal(connected.status, 200);
    assert.deepEqual(await connected.json(), { status: "ok" });

    await stop(api);
    const unavailable = await fetch(`${origin}/api/health`);
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { status: "unavailable" });
  });
});
