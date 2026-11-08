import { X509Certificate, createPrivateKey } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { localDevelopment } from "../src/lib/localDevelopment.ts";

export const developmentValues = {
  HANMAUM_LOCAL_HTTPS: "true",
  VITE_API_BASE_URL: localDevelopment.apiOrigin,
  VITE_ENABLE_MOCK_PREVIEW: "false",
  VITE_ENABLE_QA_TOOLS: "true",
};

export function planHostsEntry(content: string): string {
  if (content.includes("\0"))
    throw new Error(
      "hosts 파일이 UTF-16 형식입니다. README의 수동 설정을 확인하세요.",
    );
  const entries = content.split(/\r?\n/).flatMap((line) => {
    const [address, ...names] = line.split("#")[0].trim().split(/\s+/);
    return names.some(
      (name) =>
        name.toLowerCase().replace(/\.$/, "") === localDevelopment.hostname,
    )
      ? [address]
      : [];
  });
  if (entries.some((address) => address !== "127.0.0.1"))
    throw new Error(
      `${localDevelopment.hostname}의 기존 hosts 항목이 다른 IP를 가리킵니다. 자동으로 덮어쓰지 않으므로 직접 확인하세요.`,
    );
  if (entries.length) return "";
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  return `${content && !content.endsWith("\n") ? eol : ""}127.0.0.1 ${localDevelopment.hostname} # Hanmaum local FE${eol}`;
}

export function updateDevelopmentEnv(content: string): string {
  const remaining = new Map(Object.entries(developmentValues));
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/).flatMap((line) => {
    const key = /^\s*(?:export\s+)?([\w]+)\s*=/.exec(line)?.[1];
    if (!key || !Object.hasOwn(developmentValues, key)) return [line];
    const value = remaining.get(key);
    remaining.delete(key);
    return value === undefined ? [] : [`${key}=${value}`];
  });
  for (const [key, value] of remaining) lines.push(`${key}=${value}`);
  return `${lines.join(eol).trimEnd()}${eol}`;
}

export function checkDevelopmentEnv(content: string): void {
  const values = parseEnv(content);
  for (const [key, expected] of Object.entries(developmentValues)) {
    if (values[key] !== expected)
      throw new Error(`${key} 설정이 다릅니다. pnpm setup:local을 실행하세요.`);
  }
}

export function readLocalCertificate(root: string, minimumDays = 0) {
  const directory = join(root, ".certs");
  const cert = readFileSync(join(directory, "local.hanmaum.site.pem"));
  const key = readFileSync(join(directory, "local.hanmaum.site-key.pem"));
  const certificate = new X509Certificate(cert);
  if (
    !certificate.checkHost(localDevelopment.hostname, { wildcards: false }) ||
    !certificate.checkPrivateKey(createPrivateKey(key)) ||
    Date.parse(certificate.validFrom) > Date.now() ||
    Date.parse(certificate.validTo) <= Date.now() + minimumDays * 86_400_000
  )
    throw new Error("로컬 인증서의 도메인·개인 키·유효 기간을 확인하세요.");
  return { cert, key, certificate };
}
