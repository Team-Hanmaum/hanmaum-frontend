import {
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
} from "@/components/feedback";
import { SectionHeader } from "@/components/layout";
import { Button, MenuRow } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import { NewsCard } from "@/features/record/ui";
import { CareCard } from "@/features/careitem/ui";
import type { HomeScreenState } from "../model/homeScreenStates";
import { HomeFamilySection } from "./HomeFamilySection";

export function HomeContent({
  space,
  state,
  onFamily,
  onInvite,
  onNews,
  onCare,
  onPending,
  onRetry,
}: {
  space: CareSpaceView;
  state: HomeScreenState;
  onFamily: () => void;
  onInvite: () => void;
  onNews: () => void;
  onCare: () => void;
  onPending: () => void;
  onRetry: () => void;
}) {
  const empty = state === "empty" || state === "created";
  if (state === "loading")
    return (
      <>
        <h1 className="text-hm-title-hero">지금의 돌봄 현황</h1>
        <LoadingState label="홈을 불러오고 있어요" />
      </>
    );
  if (state === "error")
    return (
      <>
        <h1 className="sr-only">홈</h1>
        <div className="flex flex-1 items-center">
          <ErrorState
            reason="load-error"
            title="홈을 불러오지 못했어요"
            body={"연결 상태를 확인한 뒤\n다시 시도해 주세요."}
            onAction={onRetry}
          />
        </div>
      </>
    );
  return (
    <>
      <h1 className="sr-only">{careSpaceName(space)} 홈</h1>
      {state === "created" && (
        <Notice
          title={`${careSpaceName(space)} 공간이 준비됐어요`}
          body="혼자 먼저 시작해도 좋아요."
        />
      )}
      {state === "joined" && (
        <Notice
          title={`${careSpaceName(space)}에 참여했어요`}
          body={
            space.role === "owner"
              ? "이미 참여한 공간이에요. 소유자 역할은 그대로예요."
              : "구성원으로 가족과 소식을 나눌 수 있어요."
          }
        />
      )}
      <HomeFamilySection
        members={space.members}
        onFamily={onFamily}
        onInvite={onInvite}
      />
      {empty ? (
        <>
          <EmptyState
            title="아직 남긴 소식이 없어요"
            body={"병원에서 들은 이야기나\n오늘의 작은 변화를 남겨보세요."}
            className="rounded-hm-16"
          />
          <section className="flex flex-col gap-hm-12">
            <SectionHeader title="다가오는 일정" />
            <div className="flex flex-col gap-hm-12 rounded-hm-16 bg-hm-bg-surface p-hm-20">
              <p className="text-hm-body-emphasis">
                아직 등록된 일정이 없어요.
              </p>
              <p className="text-hm-body-small text-hm-text-secondary">
                일정·할 일·질문은 돌봄 탭에서
                <br />
                직접 추가할 수도 있어요.
              </p>
              <Button
                variant="secondary"
                onClick={onCare}
              >
                돌봄 목록 보기
              </Button>
            </div>
          </section>
        </>
      ) : (
        <>
          <MenuRow
            icon="news-brand"
            title="확인할 내용 1건"
            description={
              space.role === "owner"
                ? "제안과 가족의 요청을 확인해요."
                : "제안과 요청 상태를 확인해요. 최종 반영은 소유자가 진행해요."
            }
            tone="brand"
            onClick={onPending}
          />
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title="최근 가족 소식"
              action={{ label: "소식 보기", onClick: onNews }}
            />
            <NewsCard
              title={`${space.subjectLabel} 재진 날짜가 10월 20일로 바뀌었대요`}
              author="민수 · 오늘 오전 10:20"
              body="“시간은 오전 10시 그대로래.”"
              status="review"
              statusMessage="변경 제안 1건을 확인해 주세요."
              onAction={onNews}
            />
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title="다가오는 일정"
              action={
                state === "section-error"
                  ? undefined
                  : { label: "모두 보기", onClick: onCare }
              }
            />
            {state === "section-error" ? (
              <ErrorState
                reason="load-error"
                title="일정을 불러오지 못했어요"
                body="다시 불러와 일정을 확인해 주세요."
                onAction={onRetry}
              />
            ) : (
              <>
                <CareCard
                  title="내과 재진"
                  statusLabel="예정"
                  meta="10월 15일 (목) · 오전 10:00"
                  body="날짜 변경 제안을 확인 중이에요."
                  bodyTone="hint"
                />
                <MenuRow
                  icon="clock"
                  title="지난 일정 1건"
                  description="날짜가 지났지만 아직 예정으로 남아 있어요."
                  onClick={onCare}
                />
              </>
            )}
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title="남은 할 일 2"
              action={{ label: "모두 보기", onClick: onCare }}
            />
            <div className="divide-y divide-hm-divider-default overflow-hidden rounded-hm-16 bg-hm-bg-surface">
              <MenuRow
                icon="check-secondary"
                title="혈압 기록 준비"
                description="수진 · 미시작"
                onClick={onCare}
              />
              <MenuRow
                icon="check-secondary"
                title="재진 동행"
                description="담당 미정 · 미시작"
                onClick={onCare}
              />
            </div>
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title="미확인 질문 1"
              action={{ label: "모두 보기", onClick: onCare }}
            />
            <MenuRow
              icon="info-secondary"
              title="센터를 토요일에도 이용할 수 있나요?"
              description="미확인"
              onClick={onCare}
            />
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title="최근 확정된 변경"
              action={{ label: "이력 보기", onClick: onPending }}
            />
            <MenuRow
              icon="check"
              title="수진님이 혈압 기록 준비를 맡았어요."
              description="오늘 오전 9:00"
              onClick={onPending}
            />
          </section>
        </>
      )}
    </>
  );
}
