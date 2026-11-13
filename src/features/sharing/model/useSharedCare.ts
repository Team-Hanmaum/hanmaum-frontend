import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import { ApiError } from "@/lib/api";
import { getSharedItems } from "../api/shareLinkApi";

export const isShareToken = (token: string) =>
  /^[A-Za-z0-9_-]{43}$/.test(token);

const sharedCareKey = (accountId: string | undefined, token: string) =>
  ["shared-care", accountId, token] as const;

export function useSharedCare(token: string) {
  const session = useSession();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: sharedCareKey(session.accountId, token),
    queryFn: ({ signal }) => getSharedItems(token, signal),
    enabled: session.status === "authenticated" && isShareToken(token),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (
      query.error instanceof ApiError &&
      [401, 403, 404].includes(query.error.status ?? 0)
    )
      client.removeQueries({
        queryKey: sharedCareKey(session.accountId, token),
        exact: true,
      });
  }, [client, session.accountId, token, query.error]);

  return {
    ...query,
    // A fresh read rechecks current membership and redaction before showing data.
    data:
      session.status === "authenticated" && !query.isError && !query.isFetching
        ? query.data
        : undefined,
  };
}
