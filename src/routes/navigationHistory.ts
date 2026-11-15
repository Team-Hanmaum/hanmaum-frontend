// Only entries observed in this app instance are safe back destinations.
// A reload/direct visit starts a new trail instead of using browser history length.
type AppLocation = { key: string; pathname: string; search: string };
let entries: AppLocation[] = [];
let index = -1;

export function navigationDirection(
  key: string,
  action: "POP" | "PUSH" | "REPLACE",
) {
  if (action === "PUSH") return "forward";
  if (action === "POP") {
    const next = entries.findIndex((entry) => entry.key === key);
    if (next >= 0 && next !== index) return next < index ? "back" : "forward";
  }
  return "none";
}

export function recordNavigation(
  location: AppLocation,
  action: "POP" | "PUSH" | "REPLACE",
) {
  if (entries[index]?.key === location.key) return;
  if (action === "PUSH") {
    entries = [...entries.slice(0, index + 1), location];
    index = entries.length - 1;
  } else if (action === "REPLACE" && index >= 0) {
    entries[index] = location;
  } else {
    const previousIndex = entries.findIndex(
      (entry) => entry.key === location.key,
    );
    if (previousIndex >= 0) index = previousIndex;
    else {
      entries = [location];
      index = 0;
    }
  }
}

export function previousAppEntryDelta(destination?: string) {
  if (!destination) return index > 0 ? -1 : undefined;

  const [pathname, search] = destination.split("?");
  const requiredParams = new URLSearchParams(search);
  for (let previous = index - 1; previous >= 0; previous--) {
    const entry = entries[previous];
    if (entry.pathname !== pathname) continue;
    const params = new URLSearchParams(entry.search);
    if (
      [...requiredParams].every(([name, value]) => params.get(name) === value)
    )
      return previous - index;
  }
}
