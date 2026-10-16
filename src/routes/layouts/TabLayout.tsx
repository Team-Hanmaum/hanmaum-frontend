import { useState } from "react";
import { Outlet, useMatches, useNavigate, useParams } from "react-router";
import { Header, PageLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { ErrorState } from "@/components/feedback";
import { MockNotice } from "@/components/feedback/MockNotice";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import { Button, Icon } from "@/components/ui";
import { CareSpaceMenu } from "@/features/carespace/ui/CareSpaceMenu";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { mockCareSpaces } from "@/features/carespace/model/mockCareSpaces";
import {
  homeScreenStates,
  type HomeScreenState,
} from "@/features/dashboard/model/homeScreenStates";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockAction } from "@/lib/useMockAction";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { newsListStates } from "@/features/record/model/newsScreenStates";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { NotFoundPage } from "@/pages/error/NotFoundPage";
import {
  paths,
  spacePath,
  spaceTabs,
  newsCreatePath,
  type SpaceTab,
} from "../paths";
import { useMockScreenState } from "../useMockScreenState";
import { SpaceBottomNavigation } from "./SpaceBottomNavigation";
import { careListStates } from "@/features/careitem/model/careScreenStates";
import { CareListAction } from "./CareListAction";
import { familyListStates } from "@/features/carespace/model/familyScreenStates";
import { SpaceAccessState } from "./SpaceAccessState";

function SpaceHeader({
  space,
  state,
  onRetry,
}: {
  space: CareSpaceView;
  state: HomeScreenState;
  onRetry: () => void;
}) {
  const { spaces } = useMockCareSpaces();
  const navigate = useNavigate();
  const { pending, run } = useMockAction();
  const [targetId, setTargetId] = useState<string>();
  const [failed, setFailed] = useState(false);
  function select(id: string, retry = false) {
    setTargetId(id);
    run(() => {
      if (state === "switch-error" && !retry) {
        setFailed(true);
        return;
      }
      mockCareSpaces.select(id);
      void navigate(spacePath(id));
    });
  }
  return (
    <CareSpaceMenu
      space={space}
      spaces={spaces}
      switchingId={pending ? targetId : undefined}
      state={
        failed
          ? "switch-error"
          : state === "menu-loading"
            ? "loading"
            : state === "menu-error"
              ? "error"
              : "default"
      }
      onSelect={select}
      onAllSpaces={() => {
        mockCareSpaces.select(space.id);
        void navigate(paths.spaces);
      }}
      onRetry={() => {
        if (failed && targetId) {
          setFailed(false);
          select(targetId, true);
        } else onRetry();
      }}
    />
  );
}

export function TabLayout() {
  const { careSpaceId } = useParams();
  const { spaces, ended } = useMockCareSpaces();
  const navigate = useNavigate();
  const matches = useMatches();
  const handle = matches.at(-1)?.handle as { tab?: SpaceTab } | undefined;
  const active = handle?.tab;
  const space = spaces.find((item) => item.id === careSpaceId);
  const [state, setState] = useMockScreenState(
    homeScreenStates,
    space?.empty ? "empty" : "default",
  );
  const [newsState, setNewsState] = useMockScreenState(
    newsListStates,
    "default",
  );
  const [careState, setCareState] = useMockScreenState(
    careListStates,
    "default",
  );
  const [familyState, setFamilyState] = useMockScreenState(
    familyListStates,
    "default",
  );
  if (!careSpaceId || !active || !spaceTabs.includes(active))
    return <NotFoundPage />;
  if (ended[careSpaceId]) return <SpaceAccessState />;
  if (!space || !isMockPreviewEnabled)
    return (
      <PageLayout
        header={<Header variant="main" />}
        notice={<MockNotice message="실제 공간 조회·권한 확인 연결 전" />}
      >
        <h1 className="text-hm-title-page">돌봄 공간 확인</h1>
        <ErrorState
          reason="load-error"
          title="화면 확인용 공간이 없어요"
          body="새로고침하면 직접 만든 Mock 공간은 초기화돼요. 예시 공간을 선택해 주세요."
          actionLabel="공간 선택으로"
          onAction={() => void navigate(paths.spaces)}
        />
      </PageLayout>
    );
  const empty = state === "empty" || state === "created";
  return (
    <PageLayout
      notice={
        active === "home" ? (
          <MockStateSelect
            message="UI 예시 · 실제 로그인·돌봄 데이터 없음"
            value={state}
            options={homeScreenStates}
            onChange={setState}
          />
        ) : active === "news" ? (
          <MockStateSelect
            message="소식 UI 예시 · 실제 저장·분석 없음 · 새로고침 시 초기화"
            value={newsState}
            options={newsListStates}
            onChange={setNewsState}
          />
        ) : active === "care" ? (
          <MockStateSelect
            message="돌봄 UI 예시 · 실제 저장 없음 · 새로고침 시 초기화"
            value={careState}
            options={careListStates}
            onChange={setCareState}
          />
        ) : active === "family" ? (
          <MockStateSelect
            message="가족 관리 Mock · 실제 변경 없음 · 새로고침 시 초기화"
            value={familyState}
            options={familyListStates}
            onChange={setFamilyState}
          />
        ) : (
          <MockNotice message="화면 이동 확인용 · 실제 업무 기능 연결 전" />
        )
      }
      header={
        <SpaceHeader
          key={`${space.id}:${active}:${state}`}
          space={space}
          state={state}
          onRetry={() => setState(space.empty ? "empty" : "default")}
        />
      }
      footer={
        <FixedBottomArea position="fixed">
          {active === "home" && (
            <NewsCreateAction
              space={space}
              mode="home"
              empty={empty}
            />
          )}
          {active === "news" &&
            (newsState === "default" || newsState === "more-error") && (
              <NewsCreateAction
                space={space}
                mode="news"
              />
            )}
          {active === "care" && <CareListAction spaceId={space.id} />}
          <SpaceBottomNavigation
            spaceId={space.id}
            active={active}
          />
        </FixedBottomArea>
      }
    >
      <Outlet
        key={space.id}
        context={space}
      />
    </PageLayout>
  );
}

function NewsCreateAction({
  space,
  mode,
  empty = false,
}: {
  space: CareSpaceView;
  mode: "home" | "news";
  empty?: boolean;
}) {
  const records = useMockRecords(space);
  const navigate = useNavigate();
  if (mode === "news" && !records.length) return null;
  const first = empty && (!space.empty || !records.length);
  return (
    <div className="bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-24">
      <Button
        className="w-full"
        icon={
          mode === "home" && !first ? <Icon name="plus-inverse" /> : undefined
        }
        onClick={() => void navigate(newsCreatePath(space.id))}
      >
        {first ? "첫 소식 남기기" : "소식 남기기"}
      </Button>
    </div>
  );
}
