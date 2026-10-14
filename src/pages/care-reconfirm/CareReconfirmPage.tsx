import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { Badge, Button, Field, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { mockProposals } from "@/features/proposal/model/mockProposals";
import {
  emptyCareFields,
  describeCareFields,
  validateCareFields,
} from "@/features/careitem/model/careItemFields";
import { CareFieldsForm } from "@/features/careitem/ui/CareFieldsForm";
import { useMockAction } from "@/lib/useMockAction";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { careItemPath } from "@/routes/paths";

export function CareReconfirmPage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId = "" } = useParams();
  const data = useMockProposals(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const [fields, setFields] = useState({ ...emptyCareFields });
  const [evidence, setEvidence] = useState("");
  const [review, setReview] = useState(false);
  const [errors, setErrors] = useState<ReturnType<typeof validateCareFields>>(
    {},
  );
  const [evidenceError, setEvidenceError] = useState("");
  const [error, setError] = useState("");
  const [version] = useState(item?.version);
  const { pending, run } = useMockAction();
  const navigate = useNavigate();
  const back = () => void navigate(careItemPath(space.id, itemId));
  const dirty = Boolean(evidence || Object.values(fields).some(Boolean));
  const { blocker, allowNavigation } = useUnsavedChanges(dirty);
  const allowed = item?.needsReconfirmation && space.role === "owner";
  function check() {
    if (!item) return;
    const next = validateCareFields(item.kind, fields);
    setErrors(next);
    setEvidenceError(
      evidence.trim() ? "" : "새로 확인한 근거를 입력해 주세요.",
    );
    if (!Object.keys(next).length && evidence.trim()) {
      setReview(true);
      window.scrollTo(0, 0);
    }
  }
  function submit() {
    if (!allowed || version === undefined) return;
    run(() => {
      const result = mockProposals.reconfirm(
        space,
        itemId,
        version,
        fields,
        evidence,
      );
      if (result.ok) allowNavigation(back);
      else
        setError(
          "권한과 현재 상태를 다시 확인해 주세요. 입력한 내용은 유지돼요.",
        );
    });
  }
  return (
    <ProposalPageLayout
      title={review ? "확인 내용 검토" : "다시 확인하기"}
      spaceId={space.id}
      onBack={back}
      actions={
        allowed && (
          <>
            <Button
              loading={pending}
              onClick={review ? submit : check}
            >
              {review ? "확인하고 반영" : "확인 내용 검토"}
            </Button>
            <TextAction
              disabled={pending}
              onClick={() => (review ? setReview(false) : back())}
            >
              {review ? "내용 다시 수정" : "작성 취소"}
            </TextAction>
          </>
        )
      }
    >
      {!allowed ? (
        <EmptyState
          title="재확인할 수 없는 상태예요"
          body="재확인이 필요한 항목만 소유자가 새 내용으로 확인할 수 있어요."
          action={{
            label: "현재 상태로 돌아가기",
            onClick: () => allowNavigation(back),
          }}
        />
      ) : (
        <>
          <Badge
            className="self-start"
            label="소유자"
          />
          <h1 className="text-hm-title-page">
            {review
              ? "이 내용으로 확인할까요?"
              : "지금 확인한 내용을 적어 주세요"}
          </h1>
          {error && (
            <Notice
              role="alert"
              tone="error"
              title="반영하지 못했어요"
              body={error}
            />
          )}
          {review ? (
            <>
              <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
                <h2 className="text-hm-heading-section">새로 확인한 내용</h2>
                <p className="text-hm-body-default">{fields.title}</p>
                <p className="text-hm-body-default whitespace-pre-wrap">
                  {describeCareFields(item.kind, fields, space.members)}
                </p>
              </section>
              <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
                <h2 className="text-hm-heading-section">새 근거</h2>
                <p className="text-hm-body-default whitespace-pre-wrap">
                  {evidence}
                </p>
              </section>
              <Notice
                title="현재 확인한 내용만 반영해요"
                body="삭제된 기록은 복원되지 않아요."
              />
            </>
          ) : (
            <>
              <CareFieldsForm
                kind={item.kind}
                fields={fields}
                onChange={setFields}
                members={space.members}
                errors={errors}
                disabled={pending}
              />
              <Field
                label="새로 확인한 근거"
                multiline
                rows={5}
                value={evidence}
                onChange={(event) => setEvidence(event.target.value)}
                helper="삭제된 내용 대신 새로 확인한 사실을 적어요."
                error={evidenceError}
              />
            </>
          )}
        </>
      )}
      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </ProposalPageLayout>
  );
}
