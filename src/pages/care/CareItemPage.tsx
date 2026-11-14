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
import { careTypeTabs } from "@/features/careitem/model/careItemSelectors";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import {
  careSourcesPath,
  careSharePath,
  careHistoryPath,
  careListPath,
  careItemPath,
  careReconfirmPath,
  proposalListPath,
} from "@/routes/paths";
export function CareItemPage() {
  const { space } = useSpaceContext();
  const { itemId = "" } = useParams();
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const query = useCareItem(space.spaceId, itemId);
  const members = useSpaceMembers(space.spaceId);
  const item = query.data;
  const listPath = withReturn(
    careListPath(space.spaceId, {
      type:
        careTypeTabs.find((tab) => tab.value.toUpperCase() === item?.itemType)
          ?.value ?? "schedule",
    }),
  );
  const back = useBackNavigation(listPath);
  return (
    <ProposalPageLayout
      title="돌봄 상세"
      spaceId={space.spaceId}
      onBack={back}
      activeTab="care"
      tabs
      actions={
        <Button
          variant="secondary"
          onClick={() => void navigate(listPath)}
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
          {item.needsReconfirmation &&
            item.visibility !== "DELETED" &&
            (space.role === "OWNER" ? (
              <Button
                onClick={() =>
                  void navigate(
                    withReturn(careReconfirmPath(space.spaceId, itemId)),
                  )
                }
              >
                다시 확인하기
              </Button>
            ) : (
              <Notice
                title="소유자의 재확인이 필요해요"
                body="소유자가 현재 값과 유효한 근거를 다시 확인해야 해요."
              />
            ))}
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
          {!item.needsReconfirmation &&
            item.visibility !== "DELETED" &&
            !item.redactedFields.length && (
              <MenuRow
                icon="link-brand"
                title="공유"
                description="카카오톡 또는 링크로 가족에게 알리기"
                onClick={() =>
                  void navigate(
                    withReturn(careSharePath(space.spaceId, itemId)),
                  )
                }
              />
            )}
          <MenuRow
            icon="edit"
            title="항목 관리"
            description="내용·담당자·상태 변경, 답변과 삭제"
            onClick={() =>
              void navigate(
                withReturn(`${careItemPath(space.spaceId, itemId)}/manage`),
              )
            }
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
