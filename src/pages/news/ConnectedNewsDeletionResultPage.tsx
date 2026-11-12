import { useParams } from "react-router";
import { Badge, Button, MenuRow } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import { CareSection } from "@/features/careitem/ui/CareSection";
import { useRecordDeletionResult } from "@/features/record/model/useRecordDeletion";
import { formatRecordDate } from "@/features/record/model/recordDates";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath, careHistoryPath, spacePath } from "@/routes/paths";

export function ConnectedNewsDeletionResultPage() {
  const { space } = useConnectedSpace();
  // API는 삭제 결과 ID를 발급하지 않으므로 이 경로에는 원본 ID를 사용한다.
  const { deletionId = "" } = useParams();
  const { data } = useRecordDeletionResult(space.spaceId, deletionId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const list = () =>
    void navigate(withReturn(spacePath(space.spaceId, "news")), {
      motion: "back",
    });
  return (
    <ProposalPageLayout
      connected
      title="소식 삭제"
      spaceId={space.spaceId}
      onBack={list}
      tabs
      actions={<Button onClick={list}>소식 목록으로</Button>}
    >
      {!data ? (
        <EmptyState
          title="삭제 결과를 다시 불러올 수 없어요"
          body="삭제 결과는 이 탭에서 완료 직후에 확인할 수 있어요. 소식 목록과 돌봄 항목의 현재 상태를 확인해 주세요."
        />
      ) : (
        <>
          <Badge
            label="삭제 완료"
            className="self-start"
          />
          <h1 className="text-hm-title-page">소식 원본을 삭제했어요</h1>
          <p className="text-hm-body-default">
            이 소식에서 복사된 연결 내용도 함께 제거했어요.
          </p>
          <CareSection title="삭제 기록">
            {formatRecordDate(Date.parse(data.deletedAt))}
          </CareSection>
          {!!data.reconfirmationItemIds.length && (
            <Notice
              title="다시 확인할 항목이 있어요"
              body={`연결된 ${data.reconfirmationItemIds.length}개 항목의 근거를 소유자가 다시 확인해야 해요.`}
            />
          )}
          {data.affectedItemIds.map((id, index) => (
            <section
              className="flex flex-col gap-hm-12"
              key={id}
            >
              <MenuRow
                icon="care-brand"
                title={`연결 항목 ${index + 1}`}
                description={
                  data.reconfirmationItemIds.includes(id)
                    ? "소유자의 재확인 필요"
                    : "삭제 후 현재 정보 확인"
                }
                onClick={() =>
                  void navigate(withReturn(careItemPath(space.spaceId, id)))
                }
              />
              <MenuRow
                icon="clock-brand"
                title="삭제 이후 이력 보기"
                onClick={() =>
                  void navigate(withReturn(careHistoryPath(space.spaceId, id)))
                }
              />
            </section>
          ))}
        </>
      )}
    </ProposalPageLayout>
  );
}
