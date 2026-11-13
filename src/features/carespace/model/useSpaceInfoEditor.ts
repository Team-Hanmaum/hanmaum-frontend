import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { normalizeApiError } from "@/lib/api";
import { useSession } from "@/features/auth/model/useSession";
import { submitProposalRequest } from "@/features/proposal/api/proposalWriteApi";
import { invalidateReviewData } from "@/features/proposal/model/invalidateReviewData";
import type { SpaceDetail } from "../api/spaceDetailTypes";
import type { UpdateSpaceInfoBody } from "../api/spaceInfoTypes";
import { updateSpaceInfo } from "../api/spaceInfoApi";
import { useFamilyAction } from "./useFamilyAction";
import { useSpaceDetail } from "./useSpaceDetail";
import { normalizeSubjectLabel, validateSubjectLabel } from "./subjectLabel";

type Attempt = { role: SpaceDetail["role"]; body: UpdateSpaceInfoBody };
type Receipt = {
  role: SpaceDetail["role"];
  subjectLabel: string;
  requestId?: string;
};

export function useSpaceInfoEditor(initial: SpaceDetail) {
  const query = useSpaceDetail(initial.spaceId);
  const space = query.data ?? initial;
  const client = useQueryClient();
  const { accountId } = useSession();
  const [value, setValue] = useState(initial.subjectLabel);
  const [baseline, setBaseline] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [validation, setValidation] = useState("");
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const action = useFamilyAction<Attempt, Receipt>(async ({ role, body }) => {
    try {
      let receipt: Receipt;
      if (role === "OWNER") {
        const result = await updateSpaceInfo(initial.spaceId, body);
        receipt = { role, subjectLabel: result.subjectLabel };
      } else {
        const result = await submitProposalRequest(initial.spaceId, {
          clientRequestId: body.clientRequestId,
          entries: [
            {
              sourceType: "DIRECT_INPUT",
              action: "UPDATE_SPACE",
              expectedSpaceVersion: body.expectedSpaceVersion,
              values: { subjectLabel: body.subjectLabel },
            },
          ],
        });
        receipt = {
          role,
          subjectLabel: body.subjectLabel,
          requestId: result.requestId,
        };
      }
      // 성공 영수증은 즉시 표시하고 실제 현재 이름은 별도로 재조회한다.
      void invalidateReviewData(client, accountId, initial.spaceId);
      return receipt;
    } catch (cause) {
      const error = normalizeApiError(cause);
      if (
        [403, 404, 409].includes(error.status ?? 0) &&
        ![
          "SPACE_LABEL_DUPLICATED",
          "CHANGE_REQUEST_ALREADY_PENDING",
          "REQUEST_IN_PROGRESS",
        ].includes(error.code ?? "")
      ) {
        setNeedsRefresh(true);
      }
      throw cause;
    }
  });
  const changed =
    baseline.version !== space.version || baseline.role !== space.role;
  const blocked = action.pending || query.isFetching || !!query.error;
  const label = normalizeSubjectLabel(value);
  const dirty = label !== initial.subjectLabel && !action.result;

  async function refresh() {
    if (action.pending || action.uncertain) return;
    const result = await query.refetch();
    if (!result.isError && result.data) {
      setNeedsRefresh(false);
      setBaseline(result.data);
      setConfirming(false);
      action.reset();
    }
  }
  function proceed() {
    if (action.pending) return;
    if (action.uncertain) {
      action.retry(() => {});
      return;
    }
    if (blocked || needsRefresh) return;
    const invalid = validateSubjectLabel(value);
    if (invalid || label === space.subjectLabel) {
      setValidation(
        invalid || "현재 이름과 다른 이름 또는 호칭을 입력해 주세요.",
      );
      setConfirming(false);
      return;
    }
    if (!confirming || changed) {
      setBaseline(space);
      setConfirming(true);
      action.reset();
      return;
    }
    action.submit(
      {
        role: baseline.role,
        body: {
          subjectLabel: label,
          expectedSpaceVersion: baseline.version,
          clientRequestId: crypto.randomUUID(),
        },
      },
      () => {},
    );
  }
  return {
    space,
    value,
    label,
    baseline,
    confirming,
    validation,
    action,
    query,
    dirty,
    changed,
    needsRefresh,
    blocked,
    proceed,
    refresh,
    changeValue(next: string) {
      if (action.pending || action.uncertain) return;
      setValue(next);
      setValidation("");
      action.reset();
    },
    edit() {
      if (action.pending || action.uncertain) return;
      setConfirming(false);
      action.reset();
    },
  };
}
