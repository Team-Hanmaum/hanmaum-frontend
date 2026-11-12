import { ErrorState, LoadingState } from "@/components/feedback";
import { ApiError } from "@/lib/api";
export function ReviewQueryState({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const denied =
    error instanceof ApiError && [403, 404].includes(error.status ?? 0);
  return error ? (
    <ErrorState
      reason={denied ? "no-permission" : "load-error"}
      title={denied ? "내용을 확인할 수 없어요" : undefined}
      body={
        denied
          ? "권한이 없거나 이미 삭제된 내용이에요. 이전 화면에서 목록을 다시 확인해 주세요."
          : undefined
      }
      onAction={denied ? undefined : retry}
    />
  ) : (
    <LoadingState label="최신 내용을 확인하고 있어요" />
  );
}
