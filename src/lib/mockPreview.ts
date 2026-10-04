export const isMockPreviewEnabled =
  import.meta.env.VITE_ENABLE_MOCK_PREVIEW === "true" ||
  (import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_MOCK_PREVIEW === undefined);
