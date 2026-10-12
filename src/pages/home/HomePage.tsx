import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { BottomSheet } from "@/components/feedback";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { HomeContent } from "@/features/dashboard/ui/HomeContent";
import { homeScreenStates } from "@/features/dashboard/model/homeScreenStates";
import { getMockHomeData } from "@/features/dashboard/model/mockHomeData";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { spacePath, spaceInvitePath, newsDetailPath } from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function HomePage() {
  const space = useOutletContext<CareSpaceView>();
  const records = useMockRecords(space);
  const navigate = useNavigate();
  const [state, setState] = useMockScreenState(
    homeScreenStates,
    space.empty ? "empty" : "default",
  );
  const [pendingOpen, setPendingOpen] = useState(false);
  return (
    <>
      <HomeContent
        space={space}
        data={getMockHomeData(records)}
        state={state}
        onFamily={() => void navigate(spacePath(space.id, "family"))}
        onInvite={() => void navigate(spaceInvitePath(space.id))}
        onNews={() => void navigate(spacePath(space.id, "news"))}
        onOpenNews={(id) => void navigate(newsDetailPath(space.id, id))}
        onCare={() => void navigate(spacePath(space.id, "care"))}
        onPending={() => setPendingOpen(true)}
        onRetry={() => setState(space.empty ? "empty" : "default")}
      />
      <BottomSheet
        open={pendingOpen}
        onOpenChange={setPendingOpen}
        title="상세 화면 준비 중"
      >
        <p className="text-hm-body-default text-hm-text-secondary">
          현재 내용은 화면 확인용 예시예요. 제안·요청 검토와 변경 이력은 이후
          화면에서 연결해요. 실제 돌봄 정보는 변경되지 않아요.
        </p>
      </BottomSheet>
    </>
  );
}
