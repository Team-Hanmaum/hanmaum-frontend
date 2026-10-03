// Only entries observed in this app instance are safe back destinations.
// A reload/direct visit starts a new trail instead of using browser history length.
let keys: string[] = [];
let index = -1;

export function recordNavigation(
  key: string,
  action: "POP" | "PUSH" | "REPLACE",
) {
  if (keys[index] === key) return;
  if (action === "PUSH") {
    keys = [...keys.slice(0, index + 1), key];
    index = keys.length - 1;
  } else if (action === "REPLACE" && index >= 0) {
    keys[index] = key;
  } else {
    const previousIndex = keys.indexOf(key);
    if (previousIndex >= 0) index = previousIndex;
    else {
      keys = [key];
      index = 0;
    }
  }
}

export function hasPreviousAppEntry() {
  return index > 0;
}
