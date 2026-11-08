const channelName = "hanmaum-session";
const storageKey = "hanmaum.session-change";

// A change notification only; identities, cookies and tokens are never shared here.
export function publishSessionChange() {
  const id = `${Date.now()}-${Math.random()}`;
  try {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage(id);
    channel.close();
  } catch {
    /* Storage events provide a fallback. */
  }
  try {
    localStorage.setItem(storageKey, id);
  } catch {
    /* Storage may be disabled. */
  }
}

export function onSessionChange(listener: () => void) {
  let lastId: string | undefined;
  const receive = (id: unknown) => {
    if (typeof id !== "string" || !id || id === lastId) return;
    lastId = id;
    listener();
  };
  let channel: BroadcastChannel | undefined;
  try {
    channel = new BroadcastChannel(channelName);
    channel.onmessage = (event: MessageEvent<unknown>) => receive(event.data);
  } catch {
    /* Storage events provide a fallback. */
  }
  const storage = (event: StorageEvent) => {
    if (event.key === storageKey) receive(event.newValue);
  };
  window.addEventListener("storage", storage);
  return () => {
    channel?.close();
    window.removeEventListener("storage", storage);
  };
}
