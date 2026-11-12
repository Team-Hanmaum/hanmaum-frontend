import { useRef, useState } from "react";
import type { CareDetail, CareEvidence } from "../api/careReadTypes";
import type { ReconfirmCareItemBody } from "../api/careReconfirmationTypes";
import { reconfirmCareItem } from "../api/careReconfirmationApi";
import { useReviewMutation } from "@/features/proposal/model/useReviewMutation";
import { canRetryReview } from "@/features/proposal/model/reviewFailure";
import { useReviewLeases } from "./useReviewLeases";
import {
  initialReconfirmationDraft,
  reconfirmationValues,
  reconfirmationError,
  type ReconfirmationDraft,
} from "./careReconfirmationDraft";

export function useCareReconfirmation(
  space: string,
  original: CareDetail,
  evidence: CareEvidence[],
) {
  const [item] = useState(original);
  const [draft, setDraft] = useState(() => initialReconfirmationDraft(item));
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const attempt = useRef<ReconfirmCareItemBody | null>(null);
  const sending = useRef(false);
  const leases = useReviewLeases(
    space,
    [{ itemId: item.itemId, version: item.version, purpose: "RECONFIRMATION" }],
    true,
  );
  const mutation = useReviewMutation(space, (body: ReconfirmCareItemBody) =>
    reconfirmCareItem(space, item.itemId, body),
  );
  const retry = mutation.isError && canRetryReview(mutation.error);
  const frozen = mutation.isPending || retry;
  const changed =
    !mutation.isPending &&
    !mutation.isSuccess &&
    original.version !== item.version;
  const values = reconfirmationValues(item, draft);
  const validate = () => {
    const message = reconfirmationError(item, draft, evidence);
    setError(message);
    return !message;
  };
  function submit(complete: () => void) {
    if (sending.current) return;
    if (!attempt.current) {
      if (changed || !leases.ensureCurrent() || !validate()) return;
      attempt.current = {
        expectedItemVersion: item.version,
        leaseToken: leases.leases[0].leaseToken,
        clientRequestId: crypto.randomUUID(),
        values,
        basis: draft.basis.trim() || null,
        evidenceIds: [...draft.evidenceIds],
      };
    }
    sending.current = true;
    mutation.mutate(attempt.current, {
      onSuccess: complete,
      onSettled: () => {
        sending.current = false;
      },
    });
  }
  return {
    item,
    draft,
    values,
    review,
    error,
    leases,
    mutation,
    retry,
    frozen,
    changed,
    dirty:
      JSON.stringify(draft) !==
      JSON.stringify(initialReconfirmationDraft(item)),
    update: (next: ReconfirmationDraft) => {
      if (!frozen) setDraft(next);
    },
    confirm: () => {
      const valid = validate();
      if (valid) setReview(true);
      return valid;
    },
    edit: () => {
      if (!frozen) {
        setReview(false);
        mutation.reset();
        attempt.current = null;
      }
    },
    submit,
  };
}
