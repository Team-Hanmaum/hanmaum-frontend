import { requestCsrfToken } from "@/lib/api/csrf";

export class OAuthPreparationError extends Error {}

// 같은 Origin의 탭이 쿠키 없이 동시에 익명 세션을 생성하지 않도록 직렬화한다.
// 준비 토큰은 저장·공유하지 않는다. 로그인 후 변경 요청은 새 토큰을 받는다.
export async function prepareOAuthSession(
  signal: AbortSignal,
  onReady: () => void,
): Promise<void> {
  if (!navigator.locks)
    throw new OAuthPreparationError(
      "이 브라우저에서는 로그인을 준비할 수 없어요. 최신 Chrome·Safari·Edge에서 다시 열어 주세요.",
    );

  await navigator.locks.request(
    "hanmaum-oauth-session",
    { mode: "exclusive", signal },
    async () => {
      signal.throwIfAborted();
      // 캐시를 재사용하면 쿠키 만료·삭제 후 새 세션 생성 경쟁을 막을 수 없다.
      // 인증 상태 알림의 캐시 초기화와 분리된 요청이며 화면 이탈 시에는 취소한다.
      await requestCsrfToken(signal);
      signal.throwIfAborted();
      onReady();
    },
  );
}
