import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { readLocalCertificate } from "./scripts/localEnvironment.ts";
import { localDevelopment } from "./src/lib/localDevelopment.ts";

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const root = fileURLToPath(new URL(".", import.meta.url));
  const localHttps =
    command === "serve" &&
    !isPreview &&
    mode === "development" &&
    loadEnv(mode, root, "HANMAUM_").HANMAUM_LOCAL_HTTPS === "true";
  let https;
  if (localHttps) {
    try {
      const certificate = readLocalCertificate(root);
      https = { cert: certificate.cert, key: certificate.key };
    } catch {
      throw new Error(
        "로컬 HTTPS 인증서가 없거나 유효하지 않습니다. pnpm setup:local을 실행하세요.",
      );
    }
    console.info(`한마음 로컬 API 연동: ${localDevelopment.origin}`);
  }
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    ...(localHttps && {
      server: {
        host: "127.0.0.1",
        port: localDevelopment.port,
        strictPort: true,
        origin: localDevelopment.origin,
        https,
      },
    }),
  };
});
