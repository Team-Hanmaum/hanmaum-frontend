export type InstallGuide = "ios" | "android" | "desktop";

export function getInstallGuide(
  userAgent: string,
  maxTouchPoints: number,
): InstallGuide {
  if (
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)
  )
    return "ios";
  return /Android/i.test(userAgent) ? "android" : "desktop";
}

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export const installDismissKey = "hanmaum:install-dismissed";
const installedBannerDismissKey = "hanmaum:installed-banner-dismissed";

export function isInstalledBannerDismissed() {
  try {
    return sessionStorage.getItem(installedBannerDismissKey) === "1";
  } catch {
    return false;
  }
}

export function saveInstalledBannerDismissal() {
  try {
    sessionStorage.setItem(installedBannerDismissKey, "1");
  } catch {
    // 저장소가 차단되어도 현재 실행 중에는 닫힌 상태를 유지한다.
  }
}

export function isInstallDismissed() {
  try {
    return (
      localStorage.getItem(installDismissKey) === "1" ||
      sessionStorage.getItem(installDismissKey) === "1"
    );
  } catch {
    return false;
  }
}

export function saveInstallDismissal(permanent: boolean) {
  try {
    (permanent ? localStorage : sessionStorage).setItem(installDismissKey, "1");
  } catch {
    // 저장소를 사용할 수 없어도 현재 실행 중에는 안내를 다시 띄우지 않는다.
  }
}
