import { useAppNavigate } from "@/routes/useAppNavigate";
import { useMatches, useOutletContext, useParams } from "react-router";
import { EmptyState } from "@/components/feedback";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import {
  careKindLabels,
  type CareItemKind,
} from "@/features/careitem/model/careItemViewTypes";
import { isConfirmedQuestion } from "@/features/careitem/model/careItemStatus";
import type { CareChangeOperation } from "@/features/careitem/model/careChangeTypes";
import { careStatusChoices } from "@/features/careitem/model/careChangeRules";
import { CareChangeForm } from "@/features/careitem/ui/CareChangeForm";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { careListPath } from "@/routes/paths";

export function CareChangePage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId, kind: kindParam } = useParams();
  const data = useMockProposals(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const handle = useMatches().at(-1)?.handle as {
    operation: CareChangeOperation;
  };
  const operation = handle.operation;
  const kind =
    item?.kind ??
    (kindParam && Object.hasOwn(careKindLabels, kindParam)
      ? (kindParam as CareItemKind)
      : undefined);
  const navigate = useAppNavigate();
  const unavailable =
    operation === "create"
      ? !kind || !["schedule", "task", "question"].includes(kind)
      : !item ||
        item.deletedAt ||
        item.needsReconfirmation ||
        (isConfirmedQuestion(item) && operation !== "delete") ||
        (operation === "assignee" && item.kind !== "task") ||
        (operation === "answer" && item.kind !== "question") ||
        (operation === "status" && !careStatusChoices(item).length);
  if (!kind || unavailable)
    return (
      <ProposalPageLayout
        title="돌봄 변경"
        spaceId={space.id}
        onBack={() => void navigate(careListPath(space.id), { motion: "back" })}
      >
        <EmptyState
          title="지금은 변경할 수 없어요"
          body={
            isConfirmedQuestion(item)
              ? "확인된 질문은 종료된 항목이므로 내용을 수정하거나 다시 답변할 수 없어요."
              : "현재 항목과 상태를 다시 확인해 주세요. 완료·취소 일정의 되돌리기는 제공하지 않아요."
          }
          action={{
            label: "돌봄 목록으로",
            onClick: () => void navigate(careListPath(space.id)),
          }}
        />
      </ProposalPageLayout>
    );
  return (
    <CareChangeForm
      key={`${space.id}:${itemId ?? kind}:${operation}`}
      space={space}
      kind={kind}
      operation={operation}
      item={item}
    />
  );
}
