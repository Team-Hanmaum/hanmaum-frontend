import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import {
  getCareItems,
  getCareItem,
  getCareEvidence,
  getCareHistory,
  getCareHistoryDetail,
} from "../api/careReadApi";
import type { ItemType } from "../api/careReadTypes";
export const careKeys = {
  space: (account: string | undefined, space: string) =>
    ["care-items", account, space] as const,
  detail: (account: string | undefined, space: string, id: string) =>
    [...careKeys.space(account, space), "detail", id] as const,
};
export function useCareItems(spaceId: string, type: ItemType, view?: string) {
  const session = useSession();
  return useQuery({
    queryKey: [
      ...careKeys.space(session.accountId, spaceId),
      "list",
      type,
      view,
    ],
    queryFn: ({ signal }) => getCareItems(spaceId, type, view, signal),
    enabled: session.status === "authenticated",
  });
}
export function useCareItem(spaceId: string, itemId: string) {
  const session = useSession();
  return useQuery({
    queryKey: careKeys.detail(session.accountId, spaceId, itemId),
    queryFn: ({ signal }) => getCareItem(spaceId, itemId, signal),
    enabled: session.status === "authenticated" && !!itemId,
  });
}
export function useCareEvidence(spaceId: string, itemId: string) {
  const session = useSession();
  return useQuery({
    queryKey: [
      ...careKeys.space(session.accountId, spaceId),
      "evidence",
      itemId,
    ],
    queryFn: ({ signal }) => getCareEvidence(spaceId, itemId, signal),
    enabled: session.status === "authenticated" && !!itemId,
  });
}
export function useCareHistory(spaceId: string, itemId: string) {
  const session = useSession();
  return useQuery({
    queryKey: [
      ...careKeys.space(session.accountId, spaceId),
      "history",
      itemId,
    ],
    queryFn: ({ signal }) => getCareHistory(spaceId, itemId, signal),
    enabled: session.status === "authenticated" && !!itemId,
  });
}
export function useCareHistoryDetail(
  spaceId: string,
  itemId: string,
  version: string,
) {
  const session = useSession();
  return useQuery({
    queryKey: [
      ...careKeys.space(session.accountId, spaceId),
      "history",
      itemId,
      version,
    ],
    queryFn: ({ signal }) =>
      getCareHistoryDetail(spaceId, itemId, version, signal),
    enabled: session.status === "authenticated" && !!itemId && !!version,
  });
}
