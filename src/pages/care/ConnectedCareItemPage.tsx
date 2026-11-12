import { useParams } from "react-router";
import { Button, Badge, MenuRow } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { useCareItem } from "@/features/careitem/model/useCareQueries";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { CareValuesView } from "@/features/careitem/ui/CareValuesView";
import {
  fieldLabels,
  itemLabels,
} from "@/features/careitem/model/careReadView";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import {
  careSourcesPath,
  careHistoryPath,
  spacePath,
  proposalListPath,
} from "@/routes/paths";
export function ConnectedCareItemPage() {
  const { space } = useConnectedSpace();
  const { itemId = "" } = useParams();
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const query = useCareItem(space.spaceId, itemId);
  const members = useSpaceMembers(space.spaceId);
  const item = query.data;
  const back = useBackNavigation(withReturn(spacePath(space.spaceId, "care")));
  return (
    <ProposalPageLayout
      connected
      title="돌봄 상세"
      spaceId={space.spaceId}
      onBack={back}
      activeTab="care"
      tabs
      actions={
        <Button
          variant="secondary"
          onClick={() =>
            void navigate(withReturn(spacePath(space.spaceId, "care")))
          }
        >
          돌봄 목록으로
        </Button>
      }
    >
      {!item || query.isError ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : (
        <>
          <Badge label={itemLabels[item.itemType]} />
          <h1 className="text-hm-title-page">
            {item.title ?? "내용이 제거된 항목"}
          </h1>
          {(item.needsReconfirmation || item.needsConflictReview) && (
            <Notice
              title={
                item.needsReconfirmation
                  ? "원본 변경으로 다시 확인이 필요해요"
                  : "서로 다른 내용이 있어요"
              }
              body="근거와 제안을 확인해 주세요. 현재 정보를 임의로 확정하지 않아요."
            />
          )}
          <section className="rounded-hm-14 bg-hm-bg-surface p-hm-20">
            <CareValuesView
              values={{ ...item, fields: item.fields }}
              keys={Object.keys(fieldLabels).filter(
                (key) =>
                  key !== "confirmedAnswer" || item.itemType === "QUESTION",
              )}
              members={members.data}
            />
          </section>
          {item.answers.length > 0 && (
            <section className="flex flex-col gap-hm-12">
              <h2 className="text-hm-heading-section">가족이 남긴 답변</h2>
              {item.answers.map((answer) => (
                <Notice
                  key={answer.answerId}
                  title={answer.answer ?? "내용이 제거된 답변"}
                  body={answer.basis ?? "근거 내용 없음"}
                />
              ))}
            </section>
          )}
          <MenuRow
            icon="news-brand"
            title="근거 보기"
            onClick={() =>
              void navigate(withReturn(careSourcesPath(space.spaceId, itemId)))
            }
          />
          <MenuRow
            icon="news-brand"
            title="변경 이력 보기"
            onClick={() =>
              void navigate(withReturn(careHistoryPath(space.spaceId, itemId)))
            }
          />
          <MenuRow
            icon="news-brand"
            title="제안·요청 확인"
            onClick={() =>
              void navigate(withReturn(proposalListPath(space.spaceId)))
            }
          />
          <Notice
            title="직접 수정·공유는 연동 준비 중이에요"
            body="이 화면은 서버에 저장된 돌봄 정보예요. 제안 반영 결과를 확인할 수 있어요."
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
