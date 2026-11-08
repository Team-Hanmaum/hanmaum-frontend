import { randomUUID } from "node:crypto";
import {
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { updateDevelopmentEnv } from "./localEnvironment.ts";

/** Hold this lock through CA installation, certificate renewal and env updates. */
export function acquireLocalSetupLock(directory: string): () => void {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const path = join(directory, "setup.lock");
  let descriptor: number;
  try {
    descriptor = openSync(path, "wx", 0o600);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST")
      throw new Error(
        "다른 로컬 설정이 실행 중이거나 중단된 설정의 잠금이 남아 있습니다. docs/local-development.md의 setup.lock 복구 안내를 확인하세요.",
        { cause: error },
      );
    throw error;
  }
  const release = () => {
    closeSync(descriptor);
    rmSync(path);
  };
  try {
    writeFileSync(descriptor, `${process.pid}\n`, { flush: true });
  } catch (error) {
    release();
    throw error;
  }
  return release;
}

function readOptionalFile(path: string): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

/** Call while holding the setup lock. Detect editor saves before replacement. */
export function writeDevelopmentEnv(
  path: string,
  backupDirectory: string,
): void {
  for (let attempt = 0; attempt < 3; attempt++) {
    const previous = readOptionalFile(path);
    const next = updateDevelopmentEnv(previous ?? "");
    if (previous === next) return;

    // Same directory/filesystem for atomic rename; *.local stays Git-ignored.
    const temporary = join(dirname(path), `.env.setup-${randomUUID()}.local`);
    try {
      writeFileSync(temporary, next, { flag: "wx", mode: 0o600, flush: true });
      if (previous !== undefined)
        writeFileSync(
          join(backupDirectory, `env.before-${Date.now()}-${randomUUID()}`),
          previous,
          { flag: "wx", mode: 0o600, flush: true },
        );
      // Re-merge from the latest contents if an editor saved during preparation.
      if (readOptionalFile(path) !== previous) continue;
      renameSync(temporary, path);
      return;
    } finally {
      rmSync(temporary, { force: true });
    }
  }
  throw new Error(
    ".env.development.local이 다른 프로그램에서 계속 변경되고 있습니다. 편집을 마친 뒤 pnpm setup:local을 다시 실행하세요.",
  );
}
