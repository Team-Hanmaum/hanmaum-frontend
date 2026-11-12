import { Outlet, useMatches } from "react-router";
import { PageLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { Button } from "@/components/ui";
import { CareSpaceMenu } from "@/features/carespace/ui/CareSpaceMenu";
import { useCareSpaces } from "@/features/carespace/model/useCareSpaces";
import { toSpaceView } from "@/features/dashboard/model/homeData";
import { paths, spacePath, newsCreatePath, type SpaceTab } from "../paths";
import { useConnectedSpace } from "../useConnectedSpace";
import { useAppNavigate } from "../useAppNavigate";
import { SpaceBottomNavigation } from "./SpaceBottomNavigation";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { LoadingState, ErrorState } from "@/components/feedback";
import { CareListAction } from "./CareListAction";
import { ApiError } from "@/lib/api";
import { useWithdrawalReturn } from "../useWithdrawalReturn";

export function ConnectedTabLayout() {
  const { withReturn } = useWithdrawalReturn();
  const context = useConnectedSpace();
  const { space } = context;
  const navigate = useAppNavigate();
  const spaces = useCareSpaces();
  const match = [...useMatches()]
    .reverse()
    .find((value) => (value.handle as { tab?: SpaceTab } | undefined)?.tab);
  const active =
    (match?.handle as { tab: SpaceTab } | undefined)?.tab ?? "home";
  const members = useSpaceMembers(space.spaceId, active === "all");
  const membersDenied =
    members.error instanceof ApiError &&
    [403, 404].includes(members.error.status ?? 0);
  const view = toSpaceView(space, members.data ?? []);
  const items = (spaces.data ?? []).map((value) => ({
    id: value.spaceId,
    subjectLabel: value.subjectLabel,
    role: value.role === "OWNER" ? ("owner" as const) : ("member" as const),
    members: [],
    empty: false,
  }));
  const page = (
    <PageLayout
      header={
        <CareSpaceMenu
          space={toSpaceView(space, [])}
          spaces={items}
          state={
            spaces.isPending ? "loading" : spaces.isError ? "error" : "default"
          }
          onHome={() => void navigate(spacePath(space.spaceId))}
          onSelect={(id) => void navigate(spacePath(id))}
          onAllSpaces={() => void navigate(paths.spaces)}
          onRetry={() => void spaces.refetch()}
        />
      }
      footer={
        <FixedBottomArea position="fixed">
          {(active === "home" || active === "news") && (
            <div className="bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-12">
              <Button
                className="w-full"
                onClick={() =>
                  void navigate(withReturn(newsCreatePath(space.spaceId)))
                }
              >
                소식 남기기
              </Button>
            </div>
          )}
          {active === "care" && <CareListAction spaceId={space.spaceId} />}
          <SpaceBottomNavigation
            spaceId={space.spaceId}
            active={active}
          />
        </FixedBottomArea>
      }
    >
      {active === "all" && membersDenied ? (
        <ErrorState
          reason="no-permission"
          title="이 공간에 접근할 수 없어요"
          actionLabel="참여 공간 선택"
          onAction={() => void navigate(paths.spaces)}
        />
      ) : active === "all" && !members.data ? (
        members.isError ? (
          <ErrorState
            reason="load-error"
            onAction={() => void members.refetch()}
          />
        ) : (
          <LoadingState label="공간 정보를 확인하고 있어요" />
        )
      ) : (
        <Outlet context={{ ...view, ...context }} />
      )}
    </PageLayout>
  );
  return page;
}
