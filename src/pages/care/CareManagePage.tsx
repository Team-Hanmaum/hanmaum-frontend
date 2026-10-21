import { useAppNavigate } from "@/routes/useAppNavigate";
import { useOutletContext, useParams } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { Badge, Button, MenuRow } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { careKindLabels } from "@/features/careitem/model/careItemViewTypes";
import { isConfirmedQuestion } from "@/features/careitem/model/careItemStatus";
import { careStatusChoices } from "@/features/careitem/model/careChangeRules";
import { describeCareFields } from "@/features/careitem/model/careItemFields";
import { CareSection } from "@/features/careitem/ui/CareSection";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { careItemPath, careListPath, careSharePath } from "@/routes/paths";

export function CareManagePage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId } = useParams();
  const data = useMockProposals(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const navigate = useAppNavigate();
  const back = () =>
    void navigate(
      item ? careItemPath(space.id, item.id) : careListPath(space.id),
      { motion: "back" },
    );
  const valid = item && !item.deletedAt && !item.needsReconfirmation;
  const locked = isConfirmedQuestion(item);
  const owner = space.role === "owner";
  return (
    <ProposalPageLayout
      title="항목 관리"
      spaceId={space.id}
      onBack={back}
      tabs
      activeTab="care"
      actions={<Button onClick={back}>항목 상세로</Button>}
    >
      {!valid ? (
        <EmptyState
          title="관리할 수 없는 항목이에요"
          body="삭제되었거나 유효한 근거를 다시 확인해야 해요."
        />
      ) : (
        <>
          <Badge
            className="self-start"
            label={owner ? "소유자" : "구성원"}
          />
          <h1 className="text-hm-title-page">{item.title}</h1>
          <CareSection title={`현재 ${careKindLabels[item.kind]}`}>
            {describeCareFields(item.kind, item.fields, space.members)}
          </CareSection>
          {!locked && (
            <MenuRow
              icon="edit"
              title={owner ? "내용 수정" : "내용 수정 요청"}
              description="현재 값을 불러와 필요한 부분만 수정해요"
              onClick={() =>
                void navigate(`${careItemPath(space.id, item.id)}/edit`)
              }
            />
          )}
          {item.kind === "task" && (
            <MenuRow
              icon="person-brand"
              title={owner ? "담당자 변경" : "담당자 변경 요청"}
              onClick={() =>
                void navigate(`${careItemPath(space.id, item.id)}/assignee`)
              }
            />
          )}
          {careStatusChoices(item).length > 0 && (
            <MenuRow
              icon="care-brand"
              title="상태 변경"
              description={
                item.kind === "schedule"
                  ? "완료 또는 취소"
                  : "진행 시작 · 완료 · 완료 취소"
              }
              onClick={() =>
                void navigate(`${careItemPath(space.id, item.id)}/status`)
              }
            />
          )}
          {item.kind === "question" && !locked && (
            <MenuRow
              icon="news-brand"
              title="답변 남기기"
              onClick={() =>
                void navigate(`${careItemPath(space.id, item.id)}/answer`)
              }
            />
          )}
          <MenuRow
            icon="link-brand"
            title="공유"
            description="상세 정보는 참여한 가족만 확인해요"
            onClick={() => void navigate(careSharePath(space.id, item.id))}
          />
          <MenuRow
            icon="close"
            tone="danger"
            title={`${careKindLabels[item.kind]} 삭제${owner ? "" : " 요청"}`}
            description="삭제 영향을 확인한 뒤 진행해요"
            onClick={() =>
              void navigate(`${careItemPath(space.id, item.id)}/delete`)
            }
          />
          <Notice
            title={
              locked
                ? "답변 확인이 끝난 질문이에요"
                : owner
                  ? "확인 후 반영해요"
                  : "소유자에게 변경을 요청해요"
            }
            body={
              locked
                ? "종료된 질문의 내용과 답변은 수정하지 않아요."
                : "최종 확인 전까지 현재 돌봄 정보는 유지돼요."
            }
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
