import { useParams } from "react-router";
import { Badge, Button, MenuRow } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { useCareItem } from "@/features/careitem/model/useCareQueries";
import {
  canChangeDirectly,
  careWriteUnavailable,
} from "@/features/careitem/model/careEditDraft";
import { CareValuesView } from "@/features/careitem/ui/CareValuesView";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath } from "@/routes/paths";
export function ConnectedCareManagePage() {
  const { space } = useConnectedSpace();
  const { itemId = "" } = useParams();
  const query = useCareItem(space.spaceId, itemId);
  const item = query.data;
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const base = careItemPath(space.spaceId, itemId);
  const back = () => void navigate(withReturn(base), { motion: "back" });
  return (
    <ProposalPageLayout
      connected
      title="항목 관리"
      spaceId={space.spaceId}
      onBack={back}
      actions={<Button onClick={back}>항목 상세로</Button>}
    >
      {!item || query.isError ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : (
        <>
          <Badge label={space.role === "OWNER" ? "소유자" : "구성원"} />
          <h1 className="text-hm-title-page">
            {item.title ?? "내용이 제거된 항목"}
          </h1>
          <CareValuesView
            values={item}
            keys={["status", "description"]}
          />
          {(
            [
              { operation: "edit", label: "내용 수정" },
              { operation: "assignee", label: "담당자 변경" },
              { operation: "status", label: "상태 변경" },
              { operation: "answer", label: "답변 남기기" },
              { operation: "delete", label: "항목 삭제" },
            ] as const
          )
            .filter(({ operation }) => !careWriteUnavailable(item, operation))
            .map(({ operation, label }) => (
              <MenuRow
                key={operation}
                icon="edit"
                tone={operation === "delete" ? "danger" : "default"}
                title={`${label}${operation === "answer" || canChangeDirectly(space, item, operation) ? "" : " 요청"}`}
                onClick={() =>
                  void navigate(withReturn(`${base}/${operation}`))
                }
              />
            ))}
          <Notice
            title={
              item.itemType === "QUESTION" && item.status === "CONFIRMED"
                ? "답변 확인이 끝난 질문이에요"
                : space.role === "OWNER"
                  ? "확인 후 반영해요"
                  : "소유자에게 변경을 요청해요"
            }
            body="최종 확인 전까지 현재 돌봄 정보는 유지돼요."
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
