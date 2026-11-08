import { ErrorState, LoadingState } from "@/components/feedback";
import { PageLayout } from "@/components/layout";
import { useSession } from "../model/useSession";

export function SessionStatus() {
  const session = useSession();
  const failed =
    session.status === "error" || session.status === "logout-unknown";
  return (
    <PageLayout>
      {failed ? (
        <ErrorState
          reason={session.error.kind === "network" ? "offline" : "load-error"}
          title={
            session.status === "logout-unknown"
              ? "로그아웃 상태를 확인하지 못했어요"
              : "로그인 상태를 확인하지 못했어요"
          }
          body="연결 상태를 확인한 뒤 다시 시도해 주세요."
          actionLabel="로그인 상태 다시 확인"
          onAction={() => void session.check()}
        />
      ) : (
        <LoadingState
          label={
            session.status === "signing-out"
              ? "로그아웃하고 있어요"
              : "로그인 상태를 확인하고 있어요"
          }
        />
      )}
    </PageLayout>
  );
}
