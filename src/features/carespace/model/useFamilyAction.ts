import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { normalizeApiError } from "@/lib/api";
import { canRetryReview } from "@/features/proposal/model/reviewFailure";

// 결과 미확인 상태에서는 사용자가 확인한 요청 본문·ID를 그대로 재전송한다.
export function useFamilyAction<Body, Result>(
  execute: (body: Body) => Promise<Result>,
) {
  const attempt = useRef<Body | null>(null);
  const sending = useRef(false);
  const mutation = useMutation({ mutationFn: execute, retry: false });
  const error = mutation.error ? normalizeApiError(mutation.error) : null;
  const uncertain = !!error && canRetryReview(error);
  function send(body: Body, onSuccess: (result: Result) => void) {
    if (sending.current) return;
    sending.current = true;
    attempt.current = body;
    mutation.mutate(body, {
      onSuccess,
      onSettled: () => {
        sending.current = false;
      },
    });
  }
  return {
    pending: mutation.isPending,
    error,
    result: mutation.data,
    uncertain,
    submit(body: Body, onSuccess: (result: Result) => void) {
      if (uncertain || mutation.isSuccess) return;
      send(body, onSuccess);
    },
    retry(onSuccess: (result: Result) => void) {
      if (uncertain && attempt.current) send(attempt.current, onSuccess);
    },
    reset() {
      if (sending.current || uncertain) return;
      attempt.current = null;
      mutation.reset();
    },
  };
}
