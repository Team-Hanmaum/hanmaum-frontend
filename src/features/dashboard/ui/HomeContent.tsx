import { EmptyState, Notice } from "@/components/feedback";
import { SectionHeader } from "@/components/layout";
import { Badge, Button, Icon, MenuRow } from "@/components/ui";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import type { HomeScreenState } from "../model/homeScreenStates";
import type { HomeView } from "../model/homeViewTypes";
import { HomeFamilySection } from "./HomeFamilySection";
import type { CareListFilter } from "@/features/careitem/model/careItemSelectors";
import { ScheduleCountdownBadge } from "@/features/careitem/ui/ScheduleCountdownBadge";
import { NewsPreviewCard } from "@/features/record/ui/NewsPreviewCard";

function HomeDetailRow({
  title,
  description,
  statusLabel,
  daysUntil,
  onClick,
}: {
  title: string;
  description: string;
  statusLabel?: string;
  daysUntil?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="hm-focus-ring flex w-full min-w-0 items-center gap-hm-12 px-hm-16 py-hm-12 text-left first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle focus-visible:z-10"
      onClick={onClick}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-hm-4 wrap-anywhere">
        <span className="flex flex-wrap items-center gap-x-hm-8 gap-y-hm-4">
          <span className="min-w-0 text-hm-body-emphasis">{title}</span>
          {statusLabel && <Badge label={statusLabel} />}
        </span>
        <span className="text-hm-caption-default text-hm-text-secondary">
          {description}
        </span>
      </span>
      <ScheduleCountdownBadge daysUntil={daysUntil} />
      <Icon name="chevron-right-secondary" />
    </button>
  );
}

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
  const isOwner = space.role === "owner";
  const reviewAction = !empty && (
    <button
      type="button"
      className="hm-focus-ring flex min-h-14 w-full min-w-0 cursor-pointer items-center gap-hm-12 rounded-hm-12 border border-hm-action-primary/25 bg-hm-bg-brand-subtle px-hm-16 py-hm-8 text-left text-hm-text-brand hover:border-hm-action-primary/50"
      onClick={onPending}
    >
      <span className="grid size-hm-32 shrink-0 place-items-center">
        <Icon name="news-brand" />
      </span>
      <span className="min-w-0 flex-1 text-hm-body-default font-bold wrap-anywhere">
        {data.pendingCount
          ? `확인할 내용 ${data.pendingCount}건`
          : "제안·요청 확인"}
      </span>
      <Icon name="chevron-right-brand" />
    </button>
  );
  const newsSection = (
    <section className="flex flex-col gap-hm-12">
      <SectionHeader
        title="최근 가족 소식"
        action={{
          label: "소식 보기",
          onClick: onNews,
        }}
      />
      {data.recentNews.length ? (
        <div className="flex flex-col gap-hm-8">
          {data.recentNews.map((news) => (
            <NewsPreviewCard
              key={news.id}
              author={news.author}
              time={news.recordedAtLabel}
              title={news.title}
              body={news.body}
              onOpen={() => onOpenNews(news.id)}
            />
          ))}
        </div>
      ) : (
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
      {isOwner && reviewAction}
      <HomeFamilySection
        members={space.members}
        onFamily={onFamily}
        onInvite={onInvite}
      />
      {!isOwner && reviewAction}
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
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title="다가오는 일정"
              action={{
                label: "모두 보기",
                onClick: () => onCare({ type: "schedule", status: "upcoming" }),
              }}
            />
            {data.upcomingSchedules.length ? (
              <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
                {data.upcomingSchedules.map((schedule) => (
                  <HomeDetailRow
                    key={schedule.id}
                    title={schedule.title}
                    description={`${schedule.meta} · ${schedule.body}`}
                    statusLabel={schedule.statusLabel}
                    daysUntil={schedule.daysUntil}
                    onClick={() => onOpenCare(schedule.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-hm-body-default text-hm-text-secondary">
                다가오는 일정이 없어요.
              </p>
            )}
          </section>
          {newsSection}
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title={
                data.totalCounts.tasks
                  ? `남은 할 일 ${data.totalCounts.tasks}`
                  : "남은 할 일"
              }
              action={{
                label: "모두 보기",
                onClick: () => onCare({ type: "task", status: "remaining" }),
              }}
            />
            {data.tasks.length ? (
              <div className="divide-y divide-hm-divider-default overflow-hidden rounded-hm-16 bg-hm-bg-surface">
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
            ) : (
              <p className="text-hm-body-default text-hm-text-secondary">
                남은 할 일이 없어요.
              </p>
            )}
          </section>
          <section className="flex flex-col gap-hm-12">
            <SectionHeader
              title={
                data.totalCounts.questions
                  ? `미확인 질문 ${data.totalCounts.questions}`
                  : "미확인 질문"
              }
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
            {data.recentChanges.length ? (
              <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
                {data.recentChanges.map((change) => (
                  <HomeDetailRow
                    key={change.id}
                    title={change.title}
                    description={change.description}
                    onClick={() => onChange(change.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-hm-body-default text-hm-text-secondary">
                아직 반영된 변경이 없어요.
              </p>
            )}
          </section>
        </>
      )}
    </>
  );
}
