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
import type { HomeView } from "../model/homeViewTypes";
import { HomeFamilySection } from "./HomeFamilySection";

export function HomeContent({
  space,
  data,
  state,
  onFamily,
  onInvite,
  onNews,
  onOpenNews,
  onCare,
  onPending,
  onRetry,
}: {
  space: CareSpaceView;
  data: HomeView;
  state: HomeScreenState;
  onFamily: () => void;
  onInvite: () => void;
  onNews: () => void;
  onOpenNews: (id: string) => void;
  onCare: () => void;
  onPending: () => void;
  onRetry: () => void;
}) {
  const empty = state === "empty" || state === "created";
  const newsSection = (
    <section className="flex flex-col gap-hm-12">
      <SectionHeader
        title="최근 가족 소식"
        action={{ label: "소식 보기", onClick: onNews }}
      />
      {data.recentNews.map((news) => (
        <NewsCard
          key={news.id}
          title={news.title}
          author={news.author}
          body={news.body}
          status={news.status}
          statusMessage={news.statusMessage}
          actionLabel="소식 자세히 보기"
          onAction={() => onOpenNews(news.id)}
        />
      ))}
    </section>
  );
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
          {space.empty && data.recentNews.length > 0 ? (
            newsSection
          ) : (
            <EmptyState
              title="아직 남긴 소식이 없어요"
              body={"병원에서 들은 이야기나\n오늘의 작은 변화를 남겨보세요."}
              className="rounded-hm-16"
            />
          )}
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
            title={`확인할 내용 ${data.pendingCount}건`}
            description={
              space.role === "owner"
                ? "제안과 가족의 요청을 확인해요."
                : "제안과 요청 상태를 확인해요. 최종 반영은 소유자가 진행해요."
            }
            tone="brand"
            onClick={onPending}
          />
          {newsSection}
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
                {data.upcomingSchedules.map((schedule) => (
                  <CareCard
                    key={schedule.id}
                    title={schedule.title}
                    statusLabel={schedule.statusLabel}
                    meta={schedule.meta}
                    body={schedule.body}
                    bodyTone="hint"
                  />
                ))}
                <MenuRow
                  icon="clock"
                  title={`지난 일정 ${data.pastScheduleCount}건`}
                  description="날짜가 지났지만 아직 예정으로 남아 있어요."
                  onClick={onCare}
                />
              </>
            )}
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title={`남은 할 일 ${data.tasks.length}`}
              action={{ label: "모두 보기", onClick: onCare }}
            />
            <div className="divide-y divide-hm-divider-default overflow-hidden rounded-hm-16 bg-hm-bg-surface">
              {data.tasks.map((task) => (
                <MenuRow
                  key={task.id}
                  icon="check-secondary"
                  title={task.title}
                  description={task.description}
                  onClick={onCare}
                />
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title={`미확인 질문 ${data.questions.length}`}
              action={{ label: "모두 보기", onClick: onCare }}
            />
            {data.questions.map((question) => (
              <MenuRow
                key={question.id}
                icon="info-secondary"
                title={question.title}
                description={question.description}
                onClick={onCare}
              />
            ))}
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title="최근 확정된 변경"
              action={{ label: "이력 보기", onClick: onPending }}
            />
            {data.recentChanges.map((change) => (
              <MenuRow
                key={change.id}
                icon="check"
                title={change.title}
                description={change.description}
                onClick={onPending}
              />
            ))}
          </section>
        </>
      )}
    </>
  );
}
