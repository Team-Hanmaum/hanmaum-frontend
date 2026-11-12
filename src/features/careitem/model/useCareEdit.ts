import { useRef, useState } from "react";
import type { CareDetail } from "../api/careReadTypes";
import type { CareItemFields } from "./careItemViewTypes";
import type { SpaceDetail } from "@/features/carespace/api/spaceDetailTypes";
import type {
  UpdateCareItemBody,
  ChangeItemStatusBody,
} from "../api/careWriteTypes";
import type { RequestSubmissionBody } from "@/features/proposal/api/proposalWriteTypes";
import { updateCareItem, changeCareItemStatus } from "../api/careWriteApi";
import { submitProposalRequest } from "@/features/proposal/api/proposalWriteApi";
import { useReviewMutation } from "@/features/proposal/model/useReviewMutation";
import { canRetryReview } from "@/features/proposal/model/reviewFailure";
import { useReviewLeases } from "./useReviewLeases";
import {
  canChangeDirectly,
  itemContentPatch,
  itemStatusChoices,
  itemWriteFields,
} from "./careEditDraft";
import { writeFieldError } from "./careWriteDraft";

export type EditOperation = "edit" | "assignee" | "status";
type Attempt =
  | { mode: "edit"; body: UpdateCareItemBody }
  | { mode: "status"; body: ChangeItemStatusBody }
  | { mode: "request"; body: RequestSubmissionBody };
export function useCareEdit(
  space: SpaceDetail,
  original: CareDetail,
  operation: EditOperation,
) {
  // 재조회가 도착해도 작성 기준 버전과 입력은 자동 교체하지 않는다.
  const [item] = useState(original);
  const [fields, setFields] = useState(() => itemWriteFields(item));
  const [status, setStatus] = useState("");
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const attempt = useRef<Attempt | null>(null);
  const direct = canChangeDirectly(space, item, operation);
  const leases = useReviewLeases(
    space.spaceId,
    [{ itemId: item.itemId, version: item.version }],
    true,
  );
  const mutation = useReviewMutation(space.spaceId, async (a: Attempt) => {
    if (a.mode === "request")
      return (await submitProposalRequest(space.spaceId, a.body)).requestId;
    if (a.mode === "status")
      await changeCareItemStatus(space.spaceId, item.itemId, a.body);
    else await updateCareItem(space.spaceId, item.itemId, a.body);
    return undefined;
  });
  const values =
    operation === "status"
      ? { status }
      : itemContentPatch(item, fields, operation);
  const retry = mutation.isError && canRetryReview(mutation.error);
  const frozen = mutation.isPending || retry;
  const changed = original.version !== item.version;
  function confirm() {
    const message =
      operation === "status"
        ? !itemStatusChoices(item).includes(status)
          ? "변경할 상태를 선택해 주세요."
          : ""
        : operation === "edit"
          ? writeFieldError(fields)
          : "";
    setError(
      message ||
        (!Object.keys(values).length ? "변경할 내용을 입력해 주세요." : ""),
    );
    if (!message && Object.keys(values).length) setReview(true);
  }
  function submit(onComplete: (requestId?: string) => void) {
    if (mutation.isPending) return;
    if (!attempt.current) {
      if (changed || !leases.ensureCurrent()) return;
      const identity = {
        clientRequestId: crypto.randomUUID(),
        expectedItemVersion: item.version,
        leaseToken: leases.leases[0].leaseToken,
      };
      attempt.current = !direct
        ? {
            mode: "request",
            body: {
              clientRequestId: identity.clientRequestId,
              entries: [
                {
                  sourceType: "DIRECT_INPUT",
                  action: "UPDATE_ITEM",
                  targetItemId: item.itemId,
                  expectedItemVersion: item.version,
                  leaseToken: identity.leaseToken,
                  values,
                },
              ],
            },
          }
        : operation === "status"
          ? { mode: "status", body: { ...identity, status } }
          : { mode: "edit", body: { ...identity, values } };
    }
    mutation.mutate(attempt.current, { onSuccess: onComplete });
  }
  const edit = () => {
    if (!frozen) {
      setReview(false);
      mutation.reset();
      attempt.current = null;
    }
  };
  return {
    item,
    fields,
    setFields: (fields: CareItemFields) => {
      if (!frozen) setFields(fields);
    },
    status,
    setStatus,
    values,
    direct,
    review,
    error,
    leases,
    mutation,
    retry,
    frozen,
    changed,
    confirm,
    submit,
    edit,
    dirty:
      JSON.stringify(fields) !== JSON.stringify(itemWriteFields(item)) ||
      !!status,
  };
}
