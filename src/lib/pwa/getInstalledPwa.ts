type RelatedApp = { platform: string; id?: string; url?: string };
type InstallNavigator = Navigator & {
  getInstalledRelatedApps?: () => Promise<RelatedApp[]>;
};

/** null은 미지원·조회 실패이며, 설치되지 않았다는 뜻이 아니다. */
export async function getInstalledPwa(): Promise<boolean | null> {
  const browser = navigator as InstallNavigator;
  if (typeof browser.getInstalledRelatedApps !== "function") return null;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const apps = await Promise.race([
      browser.getInstalledRelatedApps(),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 3000);
      }),
    ]);
    if (!apps) return null;
    const appId = new URL("/", location.origin).href;
    const manifestUrl = new URL("/manifest.webmanifest", location.origin).href;
    return apps.some((app) => {
      if (app.platform !== "webapp") return false;
      // 다른 관련 앱을 한마음 설치로 오인하지 않는다. Android는 id를 생략할 수 있다.
      return app.id ? app.id === appId : app.url === manifestUrl;
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
