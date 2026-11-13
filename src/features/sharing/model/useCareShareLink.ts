import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { createShareLink } from "../api/shareLinkApi";
import type {
  CreateShareLinkBody,
  ShareLinkTarget,
} from "../api/shareLinkTypes";

// The caller remounts when the space, item version or confirmed sharing choice changes.
// Keep the exact request across unknown outcomes; never issue a new ID on a timeout.
export function useCareShareLink(spaceId: string, target: ShareLinkTarget) {
  const request = useRef<CreateShareLinkBody | null>(null);
  const busy = useRef(false);
  const mutation = useMutation({
    mutationFn: (body: CreateShareLinkBody) => createShareLink(spaceId, body),
  });
  async function prepare() {
    if (busy.current) return;
    busy.current = true;
    try {
      request.current ??= {
        clientRequestId: crypto.randomUUID(),
        targets: [{ ...target }],
      };
      await mutation.mutateAsync(request.current);
    } catch {
      // API failure is rendered from mutation.error; no automatic retry.
    } finally {
      busy.current = false;
    }
  }
  return { ...mutation, prepare };
}
