const key = "hanmaum:login-return";
let memory: string | null = null;

// Only known internal destinations; never accept an OAuth-supplied external URL.
export function safeLoginReturn(value: string | null): string | null {
  if (
    !value?.startsWith("/") ||
    value.includes("\\") ||
    Array.from(value).some((character) => character.charCodeAt(0) <= 32) ||
    /%2f|%5c/i.test(value)
  )
    return null;
  let url: URL;
  try {
    url = new URL(value, "https://return.invalid");
  } catch {
    return null;
  }
  if (!value.startsWith("/") || url.origin !== "https://return.invalid")
    return null;
  if (
    !/^\/(spaces(?:\/|$)|invitations\/[^/]+$|share\/[A-Za-z0-9_-]{43}$|onboarding\/guide$|account$)/.test(
      url.pathname,
    )
  )
    return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function saveLoginReturn(value: string) {
  memory = safeLoginReturn(value);
  try {
    if (memory) sessionStorage.setItem(key, memory);
    else sessionStorage.removeItem(key);
  } catch {
    /* Storage can be unavailable in private browsers. */
  }
}

export function readLoginReturn() {
  try {
    return safeLoginReturn(sessionStorage.getItem(key) ?? memory);
  } catch {
    return safeLoginReturn(memory);
  }
}

export function clearLoginReturn() {
  memory = null;
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* No persistent fallback. */
  }
}
