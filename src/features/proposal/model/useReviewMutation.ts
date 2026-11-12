import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import { invalidateReviewData } from "./invalidateReviewData";
export function useReviewMutation<TBody, TResult>(
  space: string,
  send: (body: TBody) => Promise<TResult>,
) {
  const client = useQueryClient();
  const session = useSession();
  return useMutation({
    mutationFn: send,
    retry: false,
    onSuccess: () => invalidateReviewData(client, session.accountId, space),
  });
}
