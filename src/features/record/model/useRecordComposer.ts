import { useRef, useState } from "react";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
import type { ApiError } from "@/lib/api";
import { useCreateRecord } from "./useRecordMutations";

// BE 계약: 공백만 있는 원문은 거절하고 최대 10,000 UTF-16 코드 단위(JS length)까지 저장한다.
export const recordContentMaxLength = 10_000;
export const recordContentError = (content: string) =>
  !content.trim()
    ? "소식 내용을 입력해 주세요."
    : content.length > recordContentMaxLength
      ? "소식은 10,000자까지 남길 수 있어요."
      : undefined;

export type RecordComposerFailure = { title: string; body: string };

function describeError(error: ApiError): {
  field?: string;
  failure?: RecordComposerFailure | true;
  resetAttempt?: boolean;
} {
  if (error.status === 400 && error.code === "INVALID_REQUEST")
    return {
      field: "소식 내용을 확인해 주세요. 10,000자까지 남길 수 있어요.",
    };
  if (error.status === 401 && error.code === "UNAUTHENTICATED")
    return {
      failure: {
        title: "로그인이 필요해요",
        body: "작성한 내용은 그대로 있어요. 다시 로그인한 뒤 등록해 주세요.",
      },
    };
  if (error.status === 403 || error.status === 404)
    return {
      failure: {
        title: "이 공간에 소식을 남길 수 없어요",
        body: "참여 중인 공간인지 확인해 주세요.",
      },
    };
  // 처리 중·타임아웃·응답 유실은 같은 요청 ID로 다시 보내야 소식이 중복 저장되지 않는다.
  return {
    failure: true,
    resetAttempt: error.code === "IDEMPOTENCY_KEY_REUSED",
  };
}

export function useRecordComposer({
  spaceId,
  onCreated,
}: {
  spaceId: string;
  onCreated: (recordId: string) => void;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();
  const [failure, setFailure] = useState<RecordComposerFailure | boolean>(
    false,
  );
  const create = useCreateRecord(spaceId);
  const { blocker, allowNavigation } = useUnsavedChanges(Boolean(body));
  // 한 작성 시도의 요청 ID. 원문이 한 글자라도 바뀌면 새 시도로 보고 새 ID를 발급한다.
  const attempt = useRef<{ content: string; id: string } | null>(null);

  function submit() {
    if (create.isPending) return;
    const invalid = recordContentError(body);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (attempt.current?.content !== body)
      attempt.current = { content: body, id: crypto.randomUUID() };
    setError(undefined);
    setFailure(false);
    create.mutate(
      { content: body, clientRequestId: attempt.current.id },
      {
        onSuccess: (created) => {
          attempt.current = null;
          allowNavigation(() => onCreated(created.recordId));
        },
        onError: (createError) => {
          const result = describeError(createError);
          if (result.field) setError(result.field);
          if (result.resetAttempt) attempt.current = null;
          if (result.failure) setFailure(result.failure);
        },
      },
    );
  }

  return {
    body,
    changeBody(value: string) {
      setBody(value);
      setError(undefined);
    },
    error,
    failure,
    blocker,
    pending: create.isPending,
    canSubmit: Boolean(body.trim()),
    submit,
  };
}
