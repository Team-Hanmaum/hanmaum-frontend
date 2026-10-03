import { useState } from "react";
import { FamilyAvatar, FamilyMember } from "@/features/carespace/ui";
import { CareCard } from "@/features/careitem/ui";
import { NewsCard, Source } from "@/features/record/ui";
import { Proposal } from "@/features/proposal/ui";
import { Comparison, TextAction } from "@/components/ui";
import { PreviewExample as Example } from "./PreviewExample";
const comparison = {
  beforeLabel: "현재 일정",
  beforeValue: "10월 15일",
  afterLabel: "변경 제안",
  afterValue: "10월 20일",
};
export function DomainPreview({
  onAction,
}: {
  onAction: (message: string) => void;
}) {
  const [selected, setSelected] = useState(false);
  const [redacted, setRedacted] = useState(false);
  return (
    <section
      id="domain"
      aria-labelledby="domain-heading"
      className="flex flex-col gap-hm-16"
    >
      <h2
        id="domain-heading"
        className="text-hm-heading-section"
      >
        도메인별 재사용 카드
      </h2>
      <p className="text-hm-body-small text-hm-text-secondary">
        이름·날짜·내용은 Figma의 합성 예시입니다. 승인 대기와 최종 반영은 서로
        다른 표시이며 API 요청은 없습니다.
      </p>
      <div className="grid gap-hm-16 md:grid-cols-2 xl:grid-cols-3">
        <Example title="FamilyMember / FamilyAvatar">
          <FamilyMember
            name="수진"
            role="owner"
            detail="나"
            self
          />
          <FamilyMember
            name="민수"
            role="member"
            detail="구성원"
          />
          <div className="flex gap-hm-16">
            <FamilyAvatar
              name="수진"
              roleLabel="나 · 소유자"
              self
            />
            <FamilyAvatar
              name="민수"
              roleLabel="구성원"
            />
          </div>
        </Example>
        {(["default", "needs-check", "locked"] as const).map((state) => (
          <Example
            key={state}
            title={`CareCard · ${state}`}
          >
            <CareCard
              title="내과 재진"
              meta="10월 15일 · 오전 10:00"
              body="수진과 함께 방문해요."
              statusLabel="예정"
              state={state}
              action={{
                label: "자세히 보기",
                onClick: () => onAction(`${state} 돌봄 카드 상세 확인`),
              }}
            />
          </Example>
        ))}
        {(
          [
            "analyzing",
            "review",
            "pending",
            "applied",
            "no-change",
            "failed",
          ] as const
        ).map((status) => (
          <Example
            key={status}
            title={`NewsCard · ${status}`}
          >
            <NewsCard
              title="엄마 재진 날짜가 바뀌었어요"
              author="민수 · 오늘 오전 10:20"
              body={
                "병원에서 10월 20일이라고 했어요.\n시간은 오전 10시 그대로예요."
              }
              status={status}
              statusMessage={
                status === "review"
                  ? "변경 제안 1건을 확인해 주세요."
                  : undefined
              }
              onAction={() =>
                onAction(`${status} 소식 카드 행동 확인 · 실제 저장 없음`)
              }
            />
          </Example>
        ))}
        <Example title="Comparison · 현재 / 제안">
          <Comparison {...comparison} />
          <p className="text-hm-caption-default text-hm-text-secondary">
            제안을 선택해도 현재 정보는 변경하지 않습니다.
          </p>
        </Example>
        <Example title="Source · 원문 있음 / 삭제됨">
          <TextAction onClick={() => setRedacted((value) => !value)}>
            {redacted ? "원본 예시 복원" : "원본 삭제 상태 보기"}
          </TextAction>
          {redacted ? (
            <Source state="redacted" />
          ) : (
            <Source
              state="available"
              heading="변경을 제안한 근거"
              meta="민수 · 2026.09.28 오전 10:20"
              quote={
                "병원에서 엄마 재진 날짜가\n10월 15일에서 20일로 바뀌었대.\n시간은 오전 10시 그대로래."
              }
              onViewOriginal={() => onAction("원문 보기 동작 확인")}
            />
          )}
          <Source state="redacted" />
        </Example>
        <Example title="Proposal · 미선택 / 선택">
          <Proposal
            title="내과 재진"
            badgeLabel="일정 변경"
            context={"2026년 · 오전 10:00 · 예정\n날짜만 변경하는 제안이에요."}
            comparison={comparison}
            selected={selected}
            onSelectedChange={setSelected}
            viewSourceLabel="현재 일정 · 근거 보기"
            onViewSource={() => onAction("현재 일정·근거 확인")}
            onChangeTarget={() => onAction("연결 대상 확인 동작")}
            onEdit={() => onAction("제안 수정 동작 · 확정 돌봄 정보 유지")}
          />
        </Example>
      </div>
    </section>
  );
}
