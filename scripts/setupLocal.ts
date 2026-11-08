import { spawnSync } from "node:child_process";
import { X509Certificate } from "node:crypto";
import { lookup } from "node:dns/promises";
import {
  appendFileSync,
  chmodSync,
  closeSync,
  copyFileSync,
  existsSync,
  openSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { localDevelopment } from "../src/lib/localDevelopment.ts";
import {
  checkDevelopmentEnv,
  planHostsEntry,
  readLocalCertificate,
} from "./localEnvironment.ts";
import {
  acquireLocalSetupLock,
  writeDevelopmentEnv,
} from "./localSetupFiles.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const windows = process.platform === "win32";
const hostsPath = windows
  ? join(process.env.SystemRoot ?? "C:\\Windows", "System32/drivers/etc/hosts")
  : "/etc/hosts";
const envPath = join(root, ".env.development.local");
const certDirectory = join(root, ".certs");
const checkOnly = process.argv.includes("--check");
let mkcertCommand = "mkcert";
const installation = windows
  ? "winget install --id FiloSottile.mkcert --exact --source winget"
  : process.platform === "darwin"
    ? "brew install mkcert (Firefox 사용 시 brew install nss)"
    : "README의 Linux mkcert 설치 안내";

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    windowsHide: true,
    // mkcert skips unavailable NSS tools with a warning. Never include Java.
    env: {
      ...process.env,
      TRUST_STORES: windows ? "system" : "system,nss",
    },
  });
  if (result.error || result.status !== 0)
    throw new Error(
      `${command} 실행 실패. 출력된 오류를 해결한 뒤 다시 실행하세요.`,
    );
}

function checkMkcert() {
  const candidates = ["mkcert"];
  // Existing elevated terminals may not have received WinGet's new PATH yet.
  if (windows && process.env.LOCALAPPDATA) {
    const winget = join(process.env.LOCALAPPDATA, "Microsoft", "WinGet");
    candidates.push(join(winget, "Links", "mkcert.exe"));
    const packages = join(winget, "Packages");
    if (existsSync(packages))
      for (const name of readdirSync(packages))
        if (name.startsWith("FiloSottile.mkcert_"))
          candidates.push(join(packages, name, "mkcert.exe"));
  }
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["-version"], {
      encoding: "utf8",
      windowsHide: true,
    });
    if (!result.error && result.status === 0) {
      mkcertCommand = candidate;
      return;
    }
  }
  throw new Error(
    `mkcert를 먼저 설치하고 터미널을 다시 열어 주세요: ${installation}`,
  );
}

function readEnv() {
  return existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
}

async function checkDns() {
  const addresses = await lookup(localDevelopment.hostname, { all: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => address !== "127.0.0.1")
  )
    throw new Error(
      "개발 도메인이 127.0.0.1로 해석되지 않습니다. hosts·DNS 설정을 확인하세요.",
    );
}

async function main() {
  if (Number(process.versions.node.split(".")[0]) !== 24)
    throw new Error("프로젝트 기준 Node.js 24.x로 전환한 뒤 다시 실행하세요.");
  if (process.argv.slice(2).some((arg) => arg !== "--check"))
    throw new Error("사용법: pnpm setup:local 또는 pnpm setup:local --check");
  if (!windows && process.getuid?.() === 0)
    throw new Error(
      "sudo로 전체 스크립트를 실행하지 마세요. 개인 사용자로 실행하면 hosts 단계에서만 sudo를 요청합니다.",
    );

  if (checkOnly) {
    const checks: [string, () => unknown][] = [
      ["mkcert 설치", checkMkcert],
      [
        "hosts",
        () => {
          if (planHostsEntry(readFileSync(hostsPath, "utf8")))
            throw new Error("hosts 항목 없음");
        },
      ],
      ["DNS", checkDns],
      ["인증서와 개인 키", () => readLocalCertificate(root)],
      ["개발 환경 변수", () => checkDevelopmentEnv(readEnv())],
    ];
    let failed = false;
    for (const [label, check] of checks) {
      try {
        await check();
        console.log(`OK: ${label}`);
      } catch (error) {
        failed = true;
        console.error(`FAIL: ${label}: ${(error as Error).message}`);
      }
    }
    console.log(
      "인증서 신뢰 및 BE CORS/OAuth 연동은 브라우저에서 별도 확인하세요.",
    );
    if (failed) process.exitCode = 1;
    return;
  }

  checkMkcert();
  const hosts = readFileSync(hostsPath, "utf8");
  const addition = planHostsEntry(hosts);
  // Validate permissions before installing a CA or writing project settings.
  if (addition && windows) {
    try {
      closeSync(openSync(hostsPath, "r+"));
    } catch {
      const administrator = spawnSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          "([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)",
        ],
        { encoding: "utf8", windowsHide: true },
      ).stdout?.trim();
      throw new Error(
        administrator === "False"
          ? "현재 터미널은 관리자 권한이 아닙니다. Windows 시작 메뉴에서 PowerShell을 찾아 '관리자 권한으로 실행'한 새 창에서 프로젝트 폴더로 이동 후 pnpm setup:local을 실행하세요."
          : "관리자 권한에서도 hosts 쓰기가 차단되었습니다. 파일의 읽기 전용 속성·보안 정책을 확인하거나 README의 수동 hosts 설정을 사용하세요.",
      );
    }
  }
  const release = acquireLocalSetupLock(certDirectory);
  try {
    await configureLocal(addition);
  } finally {
    release();
  }
}

async function configureLocal(addition: string) {
  console.log(
    "이 PC에 mkcert 개발 CA를 신뢰하도록 설치하고, 로컬 도메인과 개발 전용 환경 파일을 설정합니다.",
  );
  console.log(".certs의 개인 키 및 mkcert의 rootCA-key.pem은 공유하지 마세요.");
  run(mkcertCommand, ["-install"]);

  const caRoot = spawnSync(mkcertCommand, ["-CAROOT"], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (caRoot.status !== 0)
    throw new Error("mkcert CA 위치를 확인할 수 없습니다.");
  const ca = new X509Certificate(
    readFileSync(join(caRoot.stdout.trim(), "rootCA.pem")),
  );
  let renew = true;
  try {
    renew = !readLocalCertificate(root, 7).certificate.verify(ca.publicKey);
  } catch {
    /* Missing, invalid, or expiring certificates are regenerated. */
  }
  if (renew) {
    run(mkcertCommand, [
      "-cert-file",
      join(certDirectory, "local.hanmaum.site.pem"),
      "-key-file",
      join(certDirectory, "local.hanmaum.site-key.pem"),
      localDevelopment.hostname,
    ]);
    chmodSync(join(certDirectory, "local.hanmaum.site-key.pem"), 0o600);
  }
  readLocalCertificate(root);

  if (addition) {
    // Append only this entry; preserve all existing bytes and aliases.
    const latest = readFileSync(hostsPath, "utf8");
    const missing = planHostsEntry(latest);
    if (missing) {
      copyFileSync(
        hostsPath,
        join(certDirectory, `hosts.before-${Date.now()}`),
      );
      if (windows) appendFileSync(hostsPath, missing);
      else {
        const result = spawnSync("sudo", ["tee", "-a", hostsPath], {
          input: missing,
          stdio: ["pipe", "ignore", "inherit"],
        });
        if (result.status !== 0)
          throw new Error(
            "hosts 추가 실패. sudo 권한을 확인한 뒤 다시 실행하세요.",
          );
      }
    }
  }
  await checkDns();
  writeDevelopmentEnv(envPath, certDirectory);
  console.log(`완료: pnpm dev → ${localDevelopment.origin}`);
  console.log(
    "브라우저를 재시작하세요. 실제 로그인은 BE의 개발 Origin·OAuth 복귀 지원 반영 후 확인합니다.",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
