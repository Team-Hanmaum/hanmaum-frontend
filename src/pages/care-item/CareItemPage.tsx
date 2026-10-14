import { useNavigate, useOutletContext, useParams } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { Badge, Button, MenuRow } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { careKindLabels } from "@/features/careitem/model/careItemViewTypes";
import { describeCareFields } from "@/features/careitem/model/careItemFields";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  careHistoryPath,
  careSourcesPath,
  careReconfirmPath,
  newsCreatePath,
  spacePath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function CareItemPage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId } = useParams();
  const data = useMockProposals(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const navigate = useNavigate();
  const onBack = useBackNavigation(spacePath(space.id, "news"));
  return (
    <ProposalPageLayout
      title={`${item ? careKindLabels[item.kind] : "돌봄"} 상세`}
      spaceId={space.id}
      onBack={onBack}
      actions={
        <>
          {item?.needsReconfirmation && space.role === "owner" && (
            <Button
              onClick={() =>
                void navigate(careReconfirmPath(space.id, item.id))
              }
            >
              새 내용으로 확인
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onBack}
          >
            이전 화면으로
          </Button>
        </>
      }
    >
      {!item ? (
        <EmptyState
          title="돌봄 항목을 확인할 수 없어요"
          body="아직 반영되지 않았거나 현재 공간에 없는 항목이에요."
        />
      ) : (
        <>
          <Badge
            label={
              item.needsReconfirmation
                ? "재확인 필요"
                : item.kind === "schedule"
                  ? "예정"
                  : item.kind === "task"
                    ? "미시작"
                    : item.kind === "question"
                      ? "미확인"
                      : careKindLabels[item.kind]
            }
            tone={item.needsReconfirmation ? "error" : "brand"}
          />
          <h1 className="text-hm-title-page">
            {item.needsReconfirmation
              ? "내용을 다시 확인해 주세요"
              : item.title}
          </h1>
          {item.needsReconfirmation ? (
            <Notice
              title="홈과 새 공유에서 제외돼요"
              body="이 항목의 유효 근거가 없어 내용을 보여드릴 수 없어요. 소유자가 새로 확인한 내용을 반영해야 해요."
            />
          ) : (
            <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
              <h2 className="text-hm-heading-section">
                {item.kind === "schedule" ? "날짜와 시간" : "현재 내용"}
              </h2>
              <p className="text-hm-body-default whitespace-pre-wrap">
                {describeCareFields(item.kind, item.fields, space.members)}
              </p>
              <p className="text-hm-body-small text-hm-text-secondary">
                {item.meta}
              </p>
            </section>
          )}
          <MenuRow
            icon="link"
            title="근거 보기"
            description="소식 원문과 직접 확인한 근거"
            onClick={() => void navigate(careSourcesPath(space.id, item.id))}
          />
          <MenuRow
            icon="clock"
            title="변경 이력"
            onClick={() => void navigate(careHistoryPath(space.id, item.id))}
          />
          {item.needsReconfirmation && (
            <MenuRow
              icon="news"
              title="새 소식 남기기"
              onClick={() => void navigate(newsCreatePath(space.id))}
            />
          )}
        </>
      )}
    </ProposalPageLayout>
  );
}
