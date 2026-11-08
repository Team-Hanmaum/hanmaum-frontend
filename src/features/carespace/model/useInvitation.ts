import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/model/useSession";
import type { ApiError } from "@/lib/api";
import { getInvitationPreview, joinInvitation } from "../api/invitationApi";
import type {
  InvitationPreview,
  InvitationRequest,
  JoinInvitationResult,
} from "../api/invitationTypes";
import { careSpaceKeys } from "./careSpaceKeys";

// 초대 확인·참여는 로그인 세션이 필요하다. 비로그인 사용자는 로그인 후 이 화면으로 돌아온다.
export function useInvitationPreview(token: string) {
  const session = useSession();
  return useQuery<InvitationPreview, ApiError>({
    queryKey: ["invitation", session.accountId, token],
    queryFn: ({ signal }) => getInvitationPreview(token, signal),
    enabled: session.status === "authenticated" && Boolean(token),
  });
}

export function useJoinInvitation(token: string) {
  const session = useSession();
  const queryClient = useQueryClient();
  return useMutation<JoinInvitationResult, ApiError, InvitationRequest>({
    mutationKey: ["invitation", "join", token],
    mutationFn: (request) => joinInvitation(token, request),
    onSuccess: ({ joined }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: careSpaceKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: ["carespace", session.accountId, joined.spaceId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["invitation", session.accountId, token],
        }),
      ]),
  });
}
