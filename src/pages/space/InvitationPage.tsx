import { useParams } from "react-router";
import { useSession } from "@/features/auth/model/useSession";
import { ConnectedInvitationPage } from "./ConnectedInvitationPage";
export function InvitationPage() {
  const { invitationToken = "" } = useParams();
  const { accountId } = useSession();
  // 공개 경로도 계정이 바뀌면 이전 참여 실패와 요청 ID를 초기화한다.
  return (
    <ConnectedInvitationPage
      key={`${invitationToken}:${accountId ?? "anonymous"}`}
    />
  );
}
