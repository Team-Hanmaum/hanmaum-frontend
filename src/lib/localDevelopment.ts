// Shared by the local setup script, Vite, and the OAuth entry URL builder.
export const localDevelopment = {
  hostname: "local.hanmaum.site",
  port: 5173,
  origin: "https://local.hanmaum.site:5173",
  apiOrigin: "https://api.hanmaum.site",
} as const;
