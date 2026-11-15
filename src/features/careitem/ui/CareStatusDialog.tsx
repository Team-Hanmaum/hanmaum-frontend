import { useState } from "react";
import { ConfirmDialog } from "@/components/feedback";
import type { SpaceDetail } from "@/features/carespace/api/spaceDetailTypes";
import { reviewFailure } from "@/features/proposal/model/reviewFailure";
import type { CareDetail } from "../api/careReadTypes";
import { careWriteUnavailable } from "../model/careEditDraft";
import { displayCareValue } from "../model/careReadView";
import { useCareEdit } from "../model/useCareEdit";

export function CareStatusDialog({
  space,
  item,
  status,
  queryError,
  onClose,
  onComplete,
}: {
  space: SpaceDetail;
  item: CareDetail;
  status: string;
  queryError: unknown;
  onClose: () => void;
  onComplete: (requestId?: string) => void;
}) {
  const form = useCareEdit(space, item, "status", status);
  const [closing, setClosing] = useState(false);
  const unavailable = careWriteUnavailable(form.item, "status");
  const blocked = Boolean(
    queryError || unavailable || form.changed || !form.leases.ready,
  );
  const error = form.retry
    ? form.mutation.error
    : form.leases.error || form.mutation.error || queryError;
  const feedback = error
    ? reviewFailure(error)
    : form.error ||
      unavailable ||
      (form.changed
        ? "항목이 바뀌었어요. 닫고 최신 상태를 다시 확인해 주세요."
        : "");
  const close = () => {
    if (closing || form.mutation.isPending) return;
    setClosing(true);
    void form.leases.release().then(onClose, () => setClosing(false));
  };
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title={form.direct ? "상태를 바꿀까요?" : "상태 변경을 요청할까요?"}
      body={`${displayCareValue("status", form.item.status)} → ${displayCareValue("status", status)}${form.direct ? "" : "\n공간 소유자가 승인하면 반영돼요."}`}
      confirmLabel={
        form.retry ? "결과 다시 확인" : form.direct ? "상태 변경" : "변경 요청"
      }
      cancelLabel="닫기"
      busy={closing || form.mutation.isPending}
      confirmDisabled={!form.retry && (blocked || form.mutation.isError)}
      onConfirm={() => {
        if (form.retry || form.confirm()) form.submit(onComplete);
      }}
      feedback={
        feedback ? (
          <p
            role="alert"
            className="text-hm-body-small text-hm-feedback-error-text"
          >
            {feedback}
          </p>
        ) : (
          !form.leases.ready && (
            <p
              role="status"
              className="text-hm-body-small text-hm-text-secondary"
            >
              변경 가능 여부를 확인하고 있어요.
            </p>
          )
        )
      }
    />
  );
}
