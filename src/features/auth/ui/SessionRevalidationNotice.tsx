import { useSession } from "../model/useSession";

export function SessionRevalidationNotice() {
  const session = useSession();
  if (
    session.status !== "authenticated" ||
    session.revalidation?.status !== "error"
  )
    return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-24 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center gap-hm-12 rounded-hm-12 bg-hm-feedback-error-bg p-hm-16 text-hm-body-small text-hm-feedback-error-text shadow-lg"
    >
      <p className="flex-1">
        연결 상태를 확인하지 못했어요. 작성 중인 내용은 유지돼요.
      </p>
      <button
        type="button"
        className="hm-focus-ring min-h-hm-touch-min shrink-0 underline"
        onClick={() => void session.check()}
      >
        다시 확인
      </button>
    </div>
  );
}
