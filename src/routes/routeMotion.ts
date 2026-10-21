type Location = { pathname: string; search: string };
export type RouteMotion =
  "none" | "fade" | "forward" | "back" | "sheet-open" | "sheet-close";

export function canAnimateNavigation() {
  return (
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function getRouteMotion(
  from: Location,
  to: Location,
  direction: "forward" | "back" | "none",
  backRequested = false,
): RouteMotion {
  if (backRequested) return "back";
  if (from.pathname === to.pathname) {
    const wasTime = new URLSearchParams(from.search).get("picker") === "time";
    const isTime = new URLSearchParams(to.search).get("picker") === "time";
    if (wasTime !== isTime) return isTime ? "sheet-open" : "sheet-close";
    return "none"; // 필터·QA·해시 변경은 화면 진입이 아니다.
  }
  if (direction === "back") return "back";
  const tab = /^\/spaces\/[^/]+\/(home|care|news|family|all)$/;
  if (tab.test(from.pathname) && tab.test(to.pathname)) return "fade";
  if (
    direction === "none" ||
    /^\/account\/(logout|withdraw)/.test(to.pathname) ||
    to.pathname === "/login"
  )
    return "fade";
  return direction;
}
