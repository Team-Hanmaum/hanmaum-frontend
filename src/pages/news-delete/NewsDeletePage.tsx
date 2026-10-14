import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { Badge, Button, MenuRow, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { deleteMockRecord } from "@/features/record/model/deleteMockRecord";
import { formatRecordDate } from "@/features/record/model/recordDates";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { recordImpact } from "@/features/proposal/model/removeRecordEvidence";
import { careKindLabels } from "@/features/careitem/model/careItemViewTypes";
import { useMockAction } from "@/lib/useMockAction";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  careHistoryPath,
  careItemPath,
  careSourcesPath,
  newsDeletionPath,
  newsDetailPath,
  paths,
  spacePath,
} from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";

const states = [
  { value: "default", label: "기본" },
  { value: "error", label: "삭제 실패" },
  { value: "unknown", label: "결과 미확인" },
  { value: "permission", label: "권한 변경" },
  { value: "deleted", label: "이미 삭제됨" },
] as const;
export function NewsDeletePage() {
  const space = useOutletContext<CareSpaceView>();
  const { recordId = "" } = useParams();
  const records = useMockRecords(space);
  const data = useMockProposals(space);
  const record = records.find((entry) => entry.id === recordId);
  const previous = data.deletions?.find((entry) => entry.recordId === recordId);
  const [state, setState] = useMockScreenState(states, "default");
  const [phase, setPhase] = useState<"confirm" | "failed" | "unknown">(
    "confirm",
  );
  const { pending, run } = useMockAction();
  const navigate = useNavigate();
  const self = space.members.find((member) => member.self);
  const permitted =
    state !== "permission" &&
    (space.role === "owner" || record?.author.id === self?.id);
  const impacted = recordImpact(data, recordId);
  const onList = () => void navigate(spacePath(space.id, "news"));
  const back = () =>
    void navigate(
      record ? newsDetailPath(space.id, recordId) : spacePath(space.id, "news"),
    );
  const deleted = state === "deleted" || (!record && Boolean(previous));
  function remove() {
    if (!permitted) return;
    run(() => {
      if (state === "error") {
        setPhase("failed");
        return;
      }
      const result = deleteMockRecord(space, recordId);
      if (!result) {
        setPhase("failed");
        return;
      }
      if (state === "unknown") {
        setPhase("unknown");
        return;
      }
      void navigate(newsDeletionPath(space.id, result.id), { replace: true });
    });
  }
  function checkResult() {
    run(() => {
      if (previous)
        void navigate(newsDeletionPath(space.id, previous.id), {
          replace: true,
        });
      else {
        setPhase("confirm");
        setState("default");
      }
    });
  }
  return (
    <ProposalPageLayout
      title="소식 원본 삭제"
      spaceId={space.id}
      onBack={back}
      preview={{
        value: state,
        options: states,
        onChange: (value) => {
          setPhase("confirm");
          setState(value);
        },
      }}
      actions={
        phase !== "confirm" ? (
          <>
            <Button
              loading={pending}
              onClick={checkResult}
            >
              {phase === "unknown" ? "처리 결과 다시 확인" : "현재 상태 확인"}
            </Button>
            <TextAction onClick={onList}>소식 목록으로</TextAction>
          </>
        ) : deleted ? (
          <Button
            onClick={
              previous
                ? () => void navigate(newsDeletionPath(space.id, previous.id))
                : onList
            }
          >
            {previous ? "삭제 결과 보기" : "소식 목록으로"}
          </Button>
        ) : !permitted ? (
          <Button onClick={() => void navigate(paths.spaces)}>
            참여 중인 공간 확인
          </Button>
        ) : (
          record && (
            <>
              <Button
                variant="destructive"
                loading={pending}
                onClick={remove}
              >
                소식 원본 삭제
              </Button>
              <TextAction
                disabled={pending}
                onClick={back}
              >
                취소
              </TextAction>
            </>
          )
        )
      }
    >
      {phase === "unknown" ? (
        <>
          <h1 className="text-hm-title-page">삭제 결과를 확인하고 있어요</h1>
          <p className="text-hm-body-default">
            요청이 처리됐는지 아직 확인되지 않았어요.
          </p>
          <Notice
            title="같은 삭제를 다시 요청하지 않아요"
            body="결과가 확인되면 현재 상태를 안내할게요."
          />
        </>
      ) : phase === "failed" ? (
        <>
          <h1 className="text-hm-title-page">소식을 삭제하지 못했어요</h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            현재 상태를 확인한 뒤 다시 시도해 주세요.
          </p>
        </>
      ) : deleted ? (
        <EmptyState
          title="이미 삭제된 원본이에요"
          body="삭제된 원문과 복사된 내용은 표시하지 않아요."
        />
      ) : !permitted ? (
        <EmptyState
          title="지금은 삭제할 수 없어요"
          body="현재 참여 중인 작성자와 소유자만 소식 원본을 삭제할 수 있어요."
        />
      ) : !record ? (
        <EmptyState
          title="소식을 확인할 수 없어요"
          body="현재 공간의 소식 목록을 다시 확인해 주세요."
        />
      ) : (
        <>
          <h1 className="text-hm-title-page">이 소식을 삭제할까요?</h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            소식 원문과 다른 곳에 복사된 이 소식의 내용도 함께 삭제돼요.
          </p>
          <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
            <p className="text-hm-body-small text-hm-text-secondary">
              {record.author.name} · {formatRecordDate(record.createdAt)}
            </p>
            <p className="text-hm-body-reading whitespace-pre-wrap">
              {record.body}
            </p>
          </section>
          <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
            <h2 className="text-hm-heading-section">연결된 돌봄 항목</h2>
            {impacted.length ? (
              impacted.map((item) => (
                <p
                  key={item.id}
                  className="text-hm-body-default"
                >
                  {careKindLabels[item.kind]} ·{" "}
                  {item.needsReconfirmation ? "재확인 필요" : item.title}
                </p>
              ))
            ) : (
              <p className="text-hm-body-default">연결된 확정 항목이 없어요.</p>
            )}
          </section>
          <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
            <h2 className="text-hm-heading-section">함께 제거되는 내용</h2>
            <p className="text-hm-body-default">
              제안·근거·변경 이력 등에 이 소식에서 복사된 내용
            </p>
          </section>
          <Notice
            title="다른 유효 근거가 없다면"
            body="소유자가 다시 확인하기 전까지 홈과 새 공유에서 제외돼요."
          />
          <p className="text-hm-body-small text-hm-text-secondary">
            다른 가족이 별도로 확인한 유효 근거가 있으면 그 근거로 확인되는
            정보는 유지돼요.
          </p>
        </>
      )}
    </ProposalPageLayout>
  );
}

export function NewsDeletionResultPage() {
  const space = useOutletContext<CareSpaceView>();
  const { deletionId } = useParams();
  const data = useMockProposals(space);
  const deletion = data.deletions?.find((entry) => entry.id === deletionId);
  const navigate = useNavigate();
  const onList = () => void navigate(spacePath(space.id, "news"));
  const items = data.items.filter((item) =>
    deletion?.itemIds.includes(item.id),
  );
  const needsCheck = items.filter((item) => item.needsReconfirmation);
  return (
    <ProposalPageLayout
      title="소식 삭제"
      spaceId={space.id}
      onBack={onList}
      tabs
      actions={<Button onClick={onList}>소식 목록으로</Button>}
    >
      {!deletion ? (
        <EmptyState
          title="삭제 결과를 확인할 수 없어요"
          body="새로고침하면 Mock 삭제 결과는 초기화돼요."
        />
      ) : (
        <>
          <Badge
            className="self-start"
            label="삭제 완료"
          />
          <h1 className="text-hm-title-page">소식 원본을 삭제했어요</h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            이 소식에서 복사된 연결 내용도 함께 제거했어요.
          </p>
          <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
            <h2 className="text-hm-heading-section">삭제 기록</h2>
            <p className="text-hm-body-default">
              {deletion.actor.name} · {formatRecordDate(deletion.createdAt)}
            </p>
          </section>
          {needsCheck.length > 0 && (
            <Notice
              title="다시 확인할 항목이 있어요"
              body={`연결된 ${needsCheck.length}개 항목의 근거를 소유자가 다시 확인해야 해요.`}
            />
          )}
          {items.map((item) => (
            <section
              key={item.id}
              className="flex flex-col gap-hm-12"
            >
              <MenuRow
                icon="care-brand"
                title={
                  item.needsReconfirmation
                    ? "재확인할 항목 보기"
                    : "남은 근거로 유지된 항목 보기"
                }
                description={
                  item.needsReconfirmation
                    ? careKindLabels[item.kind]
                    : item.title
                }
                onClick={() => void navigate(careItemPath(space.id, item.id))}
              />
              <MenuRow
                icon="clock-brand"
                title="삭제 이후 이력 보기"
                description="삭제한 사람과 시각"
                onClick={() =>
                  void navigate(careHistoryPath(space.id, item.id))
                }
              />
              {!item.needsReconfirmation && (
                <MenuRow
                  icon="link-brand"
                  title="남아 있는 유효 근거 확인"
                  onClick={() =>
                    void navigate(careSourcesPath(space.id, item.id))
                  }
                />
              )}
            </section>
          ))}
        </>
      )}
    </ProposalPageLayout>
  );
}
