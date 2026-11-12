import type { RecordDeletionImpact as Impact } from "../api/recordDeletionTypes";
import { CareSection } from "@/features/careitem/ui/CareSection";
import { Notice } from "@/components/feedback";

export function RecordDeletionImpact({ impact }: { impact: Impact }) {
  const reconfirmations = impact.affectedItems.filter(
    (item) => item.requiresReconfirmation,
  ).length;
  return (
    <>
      <CareSection title="연결된 돌봄 항목">
        {impact.counts.items ? (
          <>
            <p>영향을 받는 항목 {impact.counts.items}개</p>
            <p>소유자의 재확인이 필요한 항목 {reconfirmations}개</p>
          </>
        ) : (
          <p>연결된 확정 항목이 없어요.</p>
        )}
      </CareSection>
      <CareSection title="함께 제거되는 내용">
        <p>
          제안 {impact.counts.proposals}개 · 근거 {impact.counts.evidence}개 ·
          변경 이력 {impact.counts.historyEntries}개에 복사된 내용
        </p>
      </CareSection>
      <Notice
        title="다른 유효 근거가 없다면"
        body="소유자가 다시 확인하기 전까지 홈과 새 공유에서 제외돼요."
      />
      <p className="text-hm-body-small text-hm-text-secondary">
        다른 가족이 별도로 확인한 유효 근거가 있으면 그 근거로 확인되는 정보는
        유지돼요. 삭제한 원문은 복구할 수 없어요.
      </p>
    </>
  );
}
