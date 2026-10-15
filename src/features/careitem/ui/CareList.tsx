import type { ReactNode } from "react";
import { ErrorState, Notice } from "@/components/feedback";
import { MenuRow, Tabs } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { CareItemView } from "../model/careItemViewTypes";
import { careKindLabels } from "../model/careItemViewTypes";
import {
  careCardBody,
  careCardMeta,
  careStatusLabel,
  careStatusTabs,
  careTypeTabs,
  selectCareItems,
  type CareListFilter,
} from "../model/careItemSelectors";
import type { CareListState } from "../model/careScreenStates";
import { CareCard } from "./CareCard";
import { CareListEmpty } from "./CareListEmpty";

export function CareList({
  items,
  members,
  filter,
  state,
  now,
  onType,
  onStatus,
  onOpen,
  onRetry,
  proposalNotice,
}: {
  items: readonly CareItemView[];
  members: CareSpaceView["members"];
  filter: CareListFilter;
  state: CareListState;
  now: number;
  onType: (value: string) => void;
  onStatus: (value: string) => void;
  onOpen: (id: string) => void;
  onRetry: () => void;
  proposalNotice: (item: CareItemView) => ReactNode;
}) {
  const typeItems = items.filter((item) => item.kind === filter.type);
  const first = state === "empty" || !typeItems.length;
  const filtered =
    first || state === "no-results" ? [] : selectCareItems(items, filter, now);
  const visible =
    state === "more-error"
      ? filtered.slice(0, Math.max(1, filtered.length - 1))
      : filtered;
  const reconfirm =
    state === "empty"
      ? []
      : typeItems.filter((item) => item.needsReconfirmation);
  const pastCount = selectCareItems(
    items,
    { type: "schedule", status: "past" },
    now,
  ).length;
  const heading =
    filter.type === "schedule"
      ? filter.status === "upcoming"
        ? "다가오는 일정"
        : filter.status === "past"
          ? "지난 일정"
          : "완료·취소된 일정"
      : filter.type === "task"
        ? `${filter.status === "completed" ? "완료한" : "남은"} 할 일 ${filtered.length}개`
        : filter.type === "question"
          ? `${filter.status === "confirmed" ? "확인된" : "미확인"} 질문 ${filtered.length}개`
          : undefined;
  const content = (
    <div className="flex flex-col gap-hm-24">
      {state === "loading" ? (
        <div role="status">
          <Notice
            tone="neutral"
            title="돌봄 내용을 불러오고 있어요"
            body="잠시 후 등록된 내용을 보여드릴게요."
          />
        </div>
      ) : state === "error" ? (
        <ErrorState
          reason="load-error"
          onAction={onRetry}
        />
      ) : (
        <>
          {filter.type === "schedule" &&
            filter.status === "upcoming" &&
            !first &&
            state !== "no-results" &&
            pastCount > 0 && (
              <MenuRow
                icon="clock-brand"
                title={`지난 일정 ${pastCount}건`}
                description="아직 ‘예정’으로 남아 있어요"
                onClick={() => onStatus("past")}
              />
            )}
          {filter.type === "schedule" &&
            filter.status === "past" &&
            filtered.length > 0 && (
              <Notice
                tone="neutral"
                title="아직 예정으로 남아 있어요"
                body="날짜가 지난 일정의 진행 여부를 확인해 주세요."
              />
            )}
          {!filtered.length ? (
            <CareListEmpty
              filter={filter}
              first={first}
              onCompleted={() => onStatus("completed")}
            />
          ) : (
            <>
              {heading && (
                <h2 className="text-hm-heading-section">{heading}</h2>
              )}
              {visible.map((item) => (
                <CareCard
                  key={item.id}
                  title={item.title}
                  meta={careCardMeta(item, members)}
                  body={careCardBody(item)}
                  statusLabel={careStatusLabel(item)}
                  notice={proposalNotice(item)}
                  action={{
                    label: `${careKindLabels[item.kind]} 자세히 보기`,
                    onClick: () => onOpen(item.id),
                  }}
                />
              ))}
              {state === "more-error" && (
                <>
                  <Notice
                    tone="neutral"
                    title="나머지 항목을 불러오지 못했어요"
                    body="지금 보이는 내용은 계속 확인할 수 있어요."
                  />
                  <MenuRow
                    icon="refresh"
                    title="나머지 항목 다시 불러오기"
                    description="성공하면 같은 목록 아래에 이어서 표시"
                    onClick={onRetry}
                  />
                </>
              )}
              {filter.type === "guidance" && (
                <Notice
                  tone="neutral"
                  title="원문도 함께 확인해 주세요"
                  body="안내의 자세한 내용은 가족이 남긴 소식에서 확인할 수 있어요."
                />
              )}
            </>
          )}
          {reconfirm.length > 0 && (
            <section
              className="flex flex-col gap-hm-16"
              aria-label="재확인이 필요한 항목"
            >
              <h2 className="text-hm-heading-section">
                재확인이 필요한 항목 {reconfirm.length}개
              </h2>
              {reconfirm.map((item) => (
                <CareCard
                  key={item.id}
                  title="내용을 다시 확인해 주세요"
                  meta={careCardMeta(item, members)}
                  body={careCardBody(item)}
                  statusLabel="재확인 필요"
                  statusTone="error"
                  action={{
                    label: "재확인 안내 보기",
                    onClick: () => onOpen(item.id),
                  }}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
  const statusTabs = careStatusTabs[filter.type];
  return (
    <>
      <h1 className="text-hm-title-page">돌봄</h1>
      {filter.type === "observation" && (
        <p className="text-hm-body-default text-hm-text-secondary">
          가족이 함께 살펴본 모습을 모았어요.
        </p>
      )}
      {filter.type === "guidance" && (
        <p className="text-hm-body-default text-hm-text-secondary">
          기관에서 전달받은 내용을 모았어요.
        </p>
      )}
      <Tabs
        label="돌봄 유형"
        value={filter.type}
        onValueChange={onType}
        items={careTypeTabs.map((tab) => ({
          ...tab,
          content:
            tab.value === filter.type ? (
              statusTabs.length ? (
                <Tabs
                  label={`${tab.label} 상태`}
                  value={filter.status!}
                  onValueChange={onStatus}
                  items={statusTabs.map((status) => ({
                    ...status,
                    content: status.value === filter.status ? content : null,
                  }))}
                />
              ) : (
                content
              )
            ) : null,
        }))}
      />
    </>
  );
}
