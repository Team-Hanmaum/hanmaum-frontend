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

export function ConnectedTabLayout() {
  const context = useConnectedSpace();
  const { space } = context;
  const navigate = useAppNavigate();
  const spaces = useCareSpaces();
  const match = [...useMatches()]
    .reverse()
    .find((value) => (value.handle as { tab?: SpaceTab } | undefined)?.tab);
  const active =
    (match?.handle as { tab: SpaceTab } | undefined)?.tab ?? "home";
  const items = (spaces.data ?? []).map((value) => ({
    id: value.spaceId,
    subjectLabel: value.subjectLabel,
    role: value.role === "OWNER" ? ("owner" as const) : ("member" as const),
    members: [],
    empty: false,
  }));
  return (
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
          {active === "home" && (
            <div className="bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-12">
              <Button
                className="w-full"
                onClick={() => void navigate(newsCreatePath(space.spaceId))}
              >
                소식 남기기
              </Button>
            </div>
          )}
          <SpaceBottomNavigation
            spaceId={space.spaceId}
            active={active}
          />
        </FixedBottomArea>
      }
    >
      <Outlet context={context} />
    </PageLayout>
  );
}
