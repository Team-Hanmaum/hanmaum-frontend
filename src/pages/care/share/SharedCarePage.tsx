import { useLocation, useParams } from "react-router";
import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { Badge, Button } from "@/components/ui";
import { useSession } from "@/features/auth/model/useSession";
import { useOAuthLogin } from "@/features/auth/model/useOAuthLogin";
import { SocialLoginOptions } from "@/features/auth/ui/SocialLoginOptions";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { CareSection } from "@/features/careitem/ui/CareSection";
import { CareValuesView } from "@/features/careitem/ui/CareValuesView";
import {
  fieldLabels,
  itemLabels,
} from "@/features/careitem/model/careReadView";
import {
  isShareToken,
  useSharedCare,
} from "@/features/sharing/model/useSharedCare";
import { ApiError } from "@/lib/api";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { careItemPath, paths } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";

export function SharedCarePage() {
  const { token = "" } = useParams();
  const { accountId } = useSession();
  // Public link routes must also reset local login state when accounts change.
  return (
    <SharedCareContent
      key={`${token}:${accountId ?? "anonymous"}`}
      token={token}
    />
  );
}

function SharedCareContent({ token }: { token: string }) {
  const session = useSession();
  const query = useSharedCare(token);
  const oauth = useOAuthLogin();
  const location = useLocation();
  const navigate = useAppNavigate();
  const authenticated = session.status === "authenticated";
  const login = isShareToken(token) && session.status === "anonymous";
  const error = query.error instanceof ApiError ? query.error : undefined;
  const shared = query.data;
  const members = useSpaceMembers(shared?.spaceId ?? "", !!shared);
  const forbidden = authenticated && error?.status === 403;
  const unavailable = !isShareToken(token) || error?.status === 404;
  const toStart = () =>
    void navigate(authenticated ? paths.spaces : paths.landing, {
      motion: "back",
    });

  return (
    <AccountPageLayout
      connected
      title="한마음"
      onBack={toStart}
      actions={
        login ? (
          <SocialLoginOptions
            loadingProvider={oauth.provider}
            onLogin={(provider) =>
              void oauth.start(
                provider,
                `${location.pathname}${location.search}${location.hash}`,
              )
            }
            helper="로그인 후 이 공유 링크로 돌아와 현재 참여 여부를 확인해요."
          />
        ) : (
          <Button onClick={toStart}>
            {authenticated ? "내 참여 공간으로" : "시작 화면으로"}
          </Button>
        )
      }
    >
      {unavailable ? (
        <>
          <h1 className="text-hm-title-page">지금은 이 정보를 열 수 없어요</h1>
          <Notice
            title="사용할 수 없는 공유 링크예요"
            body="링크를 다시 확인해 주세요. 항목이나 공간이 삭제되었을 수 있어요. 이전 제목과 내용은 표시하지 않아요."
          />
        </>
      ) : login ? (
        <>
          <h1 className="text-hm-title-page">
            공유된 정보를 보려면 로그인이 필요해요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            내가 참여한 돌봄 공간의 정보만 확인할 수 있어요.
          </p>
          <Notice
            title="가족의 정보를 보호해요"
            body="로그인과 현재 참여 여부를 확인한 뒤 상세 내용을 보여드려요."
          />
        </>
      ) : !authenticated ? (
        session.status === "error" ? (
          <ErrorState
            reason={session.error.kind === "network" ? "offline" : "load-error"}
            title="로그인 상태를 확인하지 못했어요"
            actionLabel="다시 확인"
            onAction={() => void session.check()}
          />
        ) : (
          <LoadingState label="로그인 상태를 확인하고 있어요" />
        )
      ) : forbidden ? (
        <>
          <h1 className="text-hm-title-page">
            이 정보를 볼 수 있는 참여 권한이 없어요
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            현재 이 돌봄 공간에 참여하고 있지 않아요.
          </p>
          <Notice
            title="공유 링크는 초대 링크와 달라요"
            body="가족에게 유효한 초대 링크를 받아 공간에 참여한 뒤 이 공유 링크를 다시 열어 주세요. 공유 링크만으로 공간에 참여되지는 않아요."
          />
          <Button
            variant="outline"
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            참여 여부 다시 확인
          </Button>
        </>
      ) : query.isError ? (
        <ErrorState
          reason={error?.kind === "network" ? "offline" : "load-error"}
          title="공유된 정보를 확인하지 못했어요"
          body="연결 상태와 로그인 상태를 확인한 뒤 다시 시도해 주세요."
          actionLabel="다시 확인"
          loading={query.isFetching}
          onAction={() => void query.refetch()}
        />
      ) : !shared ? (
        <LoadingState label="현재 참여 권한과 최신 정보를 확인하고 있어요" />
      ) : (
        <>
          <h1 className="text-hm-title-page">참여 중인 공간의 정보예요</h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            공유 당시의 내용이 아닌 현재 돌봄 정보를 보여드려요.
          </p>
          {shared.items.map((entry) =>
            entry.state !== "AVAILABLE" || !entry.item ? (
              <Notice
                key={entry.itemId}
                title={
                  entry.state === "NEEDS_RECONFIRMATION"
                    ? "근거를 다시 확인 중인 항목이에요"
                    : "삭제된 항목이에요"
                }
                body="이전 제목과 내용은 표시하지 않아요. 현재 확인할 수 있는 다른 항목을 확인해 주세요."
              />
            ) : (
              <CareSection
                key={entry.itemId}
                title={entry.item.title ?? "내용이 제거된 항목"}
              >
                <div className="flex flex-col gap-hm-16">
                  <Badge label={itemLabels[entry.item.itemType]} />
                  <CareValuesView
                    values={{ ...entry.item, fields: entry.item.fields }}
                    members={members.data}
                    keys={Object.keys(fieldLabels).filter(
                      (key) =>
                        key !== "title" &&
                        (key !== "confirmedAnswer" ||
                          entry.item?.itemType === "QUESTION"),
                    )}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      void navigate(careItemPath(shared.spaceId, entry.itemId))
                    }
                  >
                    현재 항목 보기
                  </Button>
                </div>
              </CareSection>
            ),
          )}
        </>
      )}
      {oauth.error && (
        <Notice
          tone="error"
          role="alert"
          title="로그인 시작 실패"
          body={oauth.error}
        />
      )}
    </AccountPageLayout>
  );
}
