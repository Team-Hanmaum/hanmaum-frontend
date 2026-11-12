import { useRef, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import type { CareDetail } from "../api/careReadTypes";
import type { CareItemFields } from "./careItemViewTypes";
import type { SpaceDetail } from "@/features/carespace/api/spaceDetailTypes";
import type {
  UpdateCareItemBody,
  ChangeItemStatusBody,
  AnswerCareItemBody,
  ItemWriteIdentity,
} from "../api/careWriteTypes";
import type { RequestSubmissionBody } from "@/features/proposal/api/proposalWriteTypes";
import {
  updateCareItem,
  changeCareItemStatus,
  answerCareItem,
  deleteCareItem,
} from "../api/careWriteApi";
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

export type EditOperation =
  "edit" | "assignee" | "status" | "answer" | "delete";
type Attempt =
  | { mode: "edit"; body: UpdateCareItemBody }
  | { mode: "status"; body: ChangeItemStatusBody }
  | { mode: "answer"; body: AnswerCareItemBody }
  | { mode: "delete"; body: ItemWriteIdentity }
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
  const [answer, setAnswer] = useState("");
  const [basis, setBasis] = useState("");
  const [review, setReview] = useState(operation === "delete");
  const [error, setError] = useState("");
  const attempt = useRef<Attempt | null>(null);
  const direct = canChangeDirectly(space, item, operation);
  const leases = useReviewLeases(
    space.spaceId,
    operation === "answer"
      ? []
      : [
          {
            itemId: item.itemId,
            version: item.version,
            purpose: operation === "delete" ? "DELETION" : "EDIT",
          },
        ],
    operation !== "answer",
  );
  const mutation = useReviewMutation(space.spaceId, async (a: Attempt) => {
    if (a.mode === "request")
      return (await submitProposalRequest(space.spaceId, a.body)).requestId;
    if (a.mode === "answer")
      return (await answerCareItem(space.spaceId, item.itemId, a.body))
        .requestId;
    if (a.mode === "status")
      await changeCareItemStatus(space.spaceId, item.itemId, a.body);
    else if (a.mode === "delete")
      await deleteCareItem(space.spaceId, item.itemId, a.body);
    else await updateCareItem(space.spaceId, item.itemId, a.body);
    return undefined;
  });
  const values =
    operation === "status"
      ? { status }
      : operation === "answer"
        ? { answer: answer.trim(), basis: basis.trim() }
        : operation === "delete"
          ? {}
          : itemContentPatch(item, fields, operation);
  const retry = mutation.isError && canRetryReview(mutation.error);
  const frozen = mutation.isPending || retry;
  const changed =
    !mutation.isPending &&
    !mutation.isSuccess &&
    original.version !== item.version;
  function confirm() {
    const message =
      operation === "status"
        ? !itemStatusChoices(item).includes(status)
          ? "변경할 상태를 선택해 주세요."
          : ""
        : operation === "answer"
          ? !answer.trim() || !basis.trim()
            ? "답변과 어떻게 확인했는지 함께 입력해 주세요."
            : answer.length > 10000 || basis.length > 10000
              ? "각 입력은 10,000자 이내로 작성해 주세요."
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
        leaseToken: leases.leases[0]?.leaseToken ?? "",
      };
      attempt.current =
        operation === "answer"
          ? {
              mode: "answer",
              body: {
                clientRequestId: identity.clientRequestId,
                expectedItemVersion: item.version,
                answer: answer.trim(),
                basis: basis.trim(),
              },
            }
          : !direct
            ? {
                mode: "request",
                body: {
                  clientRequestId: identity.clientRequestId,
                  entries: [
                    {
                      sourceType: "DIRECT_INPUT",
                      action:
                        operation === "delete" ? "DELETE_ITEM" : "UPDATE_ITEM",
                      targetItemId: item.itemId,
                      expectedItemVersion: item.version,
                      leaseToken: identity.leaseToken,
                      ...(operation !== "delete" && { values }),
                    },
                  ],
                },
              }
            : operation === "delete"
              ? { mode: "delete", body: identity }
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
    answer,
    setAnswer,
    basis,
    setBasis,
    values,
    direct,
    review,
    error,
    leases,
    mutation,
    retry,
    needsRefresh:
      mutation.isError &&
      !retry &&
      normalizeApiError(mutation.error).status === 409,
    frozen,
    changed,
    confirm,
    submit,
    edit,
    dirty:
      JSON.stringify(fields) !== JSON.stringify(itemWriteFields(item)) ||
      !!status ||
      !!answer ||
      !!basis,
  };
}
