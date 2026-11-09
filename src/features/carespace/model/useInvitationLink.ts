import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { createInvitation } from "../api/invitationApi";
import type {
  CreatedInvitation,
  InvitationRequest,
} from "../api/invitationTypes";

const minute = 60 * 1000;

// 화면 진입 시 초대 링크를 한 번 발급한다. 요청 ID는 발급이 성공할 때까지 유지해
// 첫 발급·새 링크 발급 모두 실패 후 재시도에는 같은 ID를 보내고, 성공 뒤의 새 발급만 새 ID를 쓴다.
// 공간이 바뀌면 호출 화면을 재마운트한다.
export function useInvitationLink(spaceId: string) {
  const create = useMutation<CreatedInvitation, ApiError, InvitationRequest>({
    mutationKey: ["carespace", "invitation", spaceId],
    mutationFn: (request) => createInvitation(spaceId, request),
  });
  const { mutate } = create;
  const attempt = useRef<string | null>(null);
  const started = useRef(false);
  const active = useRef(true);
  const [link, setLink] = useState<CreatedInvitation>();
  const [now, setNow] = useState(() => Date.now());
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  function issue() {
    if (!attempt.current) attempt.current = crypto.randomUUID();
    setFeedback("");
    setCopied(false);
    mutate(
      { clientRequestId: attempt.current },
      {
        onSuccess: (created) => {
          attempt.current = null;
          if (!active.current) return;
          setLink(created);
          setNow(Date.now());
        },
        onError: (error) => {
          if (error.code === "IDEMPOTENCY_KEY_REUSED") attempt.current = null;
        },
      },
    );
  }

  useEffect(() => {
    active.current = true;
    if (!started.current) {
      started.current = true;
      issue();
    }
    const timer = window.setInterval(() => setNow(Date.now()), minute);
    return () => {
      active.current = false;
      window.clearInterval(timer);
    };
    // 최초 진입 발급만 수행한다. 이후 발급은 사용자 동작으로 시작한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expired = Boolean(link && Date.parse(link.expiresAt) <= now);
  const loading = create.isPending;
  // 만료 링크를 새로 만들다 실패한 경우도 실패로 보여 같은 요청 ID로 다시 시도하게 한다.
  const failed = create.isError && !loading;
  const unavailable = !link || expired || loading;

  async function copy() {
    if (!link || unavailable || sharing) return;
    setSharing(true);
    setFeedback("");
    try {
      await navigator.clipboard.writeText(link.invitationUrl);
      if (active.current) setCopied(true);
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
    if (!link || unavailable || sharing) return;
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
        title: "한마음 가족 초대",
        text: "가족의 돌봄 공간에 초대했어요. 링크를 눌러 참여해 주세요.",
        url: link.invitationUrl,
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
    link,
    error: create.error,
    expired,
    loading,
    failed,
    copied,
    sharing,
    unavailable,
    fallbackOpen,
    setFallbackOpen,
    feedback,
    retry: issue,
    reissue: issue,
    copy,
    share,
  };
}
