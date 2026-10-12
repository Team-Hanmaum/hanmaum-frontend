import { useEffect, useRef, useState } from "react";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { useMockAction } from "@/lib/useMockAction";
import type { InvitationScreenState } from "./invitationScreenStates";

type UseMockInvitationLinkOptions = {
  spaceId: string;
  state: InvitationScreenState;
  onStateChange: (state: string) => void;
  createUrl: (token: string) => string;
};

// UI 예시 기한. 실제 초대 발급·만료 검증이나 서버 요청을 수행하지 않는다.
const mockLifetime = 24 * 60 * 60 * 1000;

// 라우트 상태와 URL 생성은 페이지에서 주입한다. 공간 변경 시 호출 컴포넌트를
// key={space.id}로 재마운트해 이전 공간의 링크·비동기 완료 처리가 섞이지 않게 한다.
export function useMockInvitationLink({
  spaceId,
  state,
  onStateChange,
  createUrl,
}: UseMockInvitationLinkOptions) {
  function createLink() {
    const issuedAt = Date.now();
    return {
      issuedAt,
      url: createUrl(`mock-to-${spaceId}~${issuedAt}`),
    };
  }

  const [link, setLink] = useState(createLink);
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sharing, setSharing] = useState(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const { pending, run } = useMockAction();
  const failed = state === "error";
  const expired = state === "expired";
  const loading = pending || state === "loading";
  const unavailable = failed || expired || loading || !isMockPreviewEnabled;

  function changeState(value: string) {
    if (!sharing && !pending) {
      setFeedback("");
      onStateChange(value);
    }
  }

  function reissue() {
    setFeedback("");
    run(() => {
      setLink(createLink());
      onStateChange("default");
    });
  }

  async function copy() {
    if (unavailable || sharing) return;
    setSharing(true);
    setFeedback("");
    try {
      await navigator.clipboard.writeText(link.url);
      if (active.current) onStateChange("copied");
    } catch {
      if (!active.current) return;
      setFeedback(
        "자동 복사를 사용할 수 없어요. 링크를 직접 선택해 복사해 주세요.",
      );
      setFallbackOpen(true);
    } finally {
      if (active.current) setSharing(false);
    }
  }

  async function share() {
    if (unavailable || sharing) return;
    if (!navigator.share) {
      setFeedback(
        "이 브라우저에서는 공유 메뉴를 지원하지 않아요. 링크를 복사해 주세요.",
      );
      setFallbackOpen(true);
      return;
    }
    setSharing(true);
    setFeedback("");
    try {
      await navigator.share({
        title: "한마음 Mock 초대 화면",
        text: "화면 확인용 링크예요. 실제 가족 초대나 참여는 처리되지 않아요.",
        url: link.url,
      });
    } catch (error) {
      if (!active.current) return;
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setFeedback("공유 메뉴를 열지 못했어요. 링크를 직접 복사해 주세요.");
        setFallbackOpen(true);
      }
    } finally {
      if (active.current) setSharing(false);
    }
  }

  return {
    url: link.url,
    expiresAt: link.issuedAt + (expired ? -mockLifetime : mockLifetime),
    failed,
    expired,
    loading,
    sharing,
    unavailable,
    fallbackOpen,
    setFallbackOpen,
    feedback,
    changeState,
    reissue,
    copy,
    share,
  };
}
