import { EmptyState, Notice } from "@/components/feedback";
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
import type { CareListFilter } from "@/features/careitem/model/careItemSelectors";

export function HomeContent({
  space,
  data,
  state,
  onFamily,
  onInvite,
  onNews,
  onOpenNews,
  onCare,
  onOpenCare,
  onPending,
  onHistory,
  onChange,
}: {
  space: CareSpaceView;
  data: HomeView;
  state: HomeScreenState;
  onFamily: () => void;
  onInvite: () => void;
  onNews: () => void;
  onOpenNews: (id: string) => void;
  onCare: (filter?: CareListFilter) => void;
  onOpenCare: (id: string) => void;
  onPending: () => void;
  onHistory: () => void;
  onChange: (id: string) => void;
}) {
  const empty = state === "empty" || state === "created";
  const newsSection = (
    <section className="flex flex-col gap-hm-12">
      <SectionHeader
        title="최근 가족 소식"
        action={{
          label: "소식 보기",
          onClick: onNews,
        }}
      />
      {data.recentNews.map((news) => (
        <NewsCard
          key={news.id}
          title={news.title}
          author={news.author}
          body={news.body}
          previewBody
          status={news.status}
          statusMessage={news.statusMessage}
          actionLabel="소식 자세히 보기"
          onAction={() => onOpenNews(news.id)}
        />
      ))}
      {!data.recentNews.length && (
        <EmptyState
          title="아직 남긴 소식이 없어요"
          body="가족의 소식이 등록되면 여기에서 확인할 수 있어요."
        />
      )}
    </section>
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
              body="가족의 소식이 등록되면 여기에서 확인할 수 있어요."
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
                등록된 돌봄 정보가 있으면 여기에서 확인할 수 있어요.
              </p>
              <Button
                variant="secondary"
                onClick={() => onCare()}
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
            title={
              data.pendingCount
                ? `확인할 내용 ${data.pendingCount}건`
                : "제안·요청 확인"
            }
            tone="brand"
            onClick={onPending}
          />
          {newsSection}
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title="다가오는 일정"
              action={{
                label: "모두 보기",
                onClick: () => onCare({ type: "schedule", status: "upcoming" }),
              }}
            />
            {!data.upcomingSchedules.length && (
              <p className="text-hm-body-default text-hm-text-secondary">
                다가오는 일정이 없어요.
              </p>
            )}
            {data.upcomingSchedules.map((schedule) => (
              <CareCard
                key={schedule.id}
                title={schedule.title}
                statusLabel={schedule.statusLabel}
                meta={schedule.meta}
                body={schedule.body}
                bodyTone="hint"
                action={{
                  label: "일정 자세히 보기",
                  onClick: () => onOpenCare(schedule.id),
                }}
              />
            ))}
            <MenuRow
              icon="clock"

              title={`지난 일정 ${data.pastScheduleCount}건`}
              description="날짜가 지났지만 아직 예정으로 남아 있어요."
              onClick={() => onCare({ type: "schedule", status: "past" })}
            />
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title={`남은 할 일 ${data.totalCounts.tasks}`}
              action={{
                label: "모두 보기",
                onClick: () => onCare({ type: "task", status: "remaining" }),
              }}
            />
            <div className="divide-y divide-hm-divider-default overflow-hidden rounded-hm-16 bg-hm-bg-surface">
              {!data.tasks.length && (
                <p className="p-hm-16 text-hm-body-default text-hm-text-secondary">
                  남은 할 일이 없어요.
                </p>
              )}
              {data.tasks.map((task) => (
                <MenuRow
                  key={task.id}

                  icon="check-secondary"
                  title={task.title}
                  description={task.description}
                  onClick={() => onOpenCare(task.id)}
                />
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title={`미확인 질문 ${data.totalCounts.questions}`}
              action={{
                label: "모두 보기",
                onClick: () =>
                  onCare({ type: "question", status: "unconfirmed" }),
              }}
            />
            {!data.questions.length && (
              <p className="text-hm-body-default text-hm-text-secondary">
                미확인 질문이 없어요.
              </p>
            )}
            {data.questions.map((question) => (
              <MenuRow
                key={question.id}

                icon="info-secondary"
                title={question.title}
                description={question.description}
                onClick={() => onOpenCare(question.id)}
              />
            ))}
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title="최근 확정된 변경"
              action={{
                label: "반영 결과 보기",
                onClick: onHistory,
              }}
            />
            {!data.recentChanges.length && (
              <p className="text-hm-body-default text-hm-text-secondary">
                아직 반영된 변경이 없어요.
              </p>
            )}
            {data.recentChanges.map((change) => (
              <MenuRow
                key={change.id}

                icon="check"
                title={change.title}
                description={change.description}
                onClick={() => onChange(change.id)}
              />
            ))}
          </section>
        </>
      )}
    </>
  );
}
