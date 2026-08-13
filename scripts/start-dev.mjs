import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import net from "node:net";

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function describePort(port) {
  try {
    return execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN`, {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

const requestedPort = Number(process.env.PORT || 3000);
let port = requestedPort;

if (await portInUse(requestedPort)) {
  const listenerInfo = describePort(requestedPort);
  port = (await portInUse(3001)) ? 3010 : 3001;
  console.log("");
  console.log("=================================================");
  console.log(`Port ${requestedPort} is already in use.`);
  if (listenerInfo) {
    console.log(listenerInfo.split("\n")[0]);
  }
  console.log(`Starting Account Intel on http://localhost:${port}`);
  console.log(`Open that URL — localhost:${requestedPort} may not load.`);
  console.log("=================================================");
  console.log("");
}

const child = spawn("npx", ["next", "dev", "-p", String(port)], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(port) },
  shell: false,
});

child.on("exit", (code) => process.exit(code ?? 1));
