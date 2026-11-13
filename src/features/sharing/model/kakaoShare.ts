import type { ShareCard } from "../api/shareLinkTypes";
import { itemLabels } from "@/features/careitem/model/careReadView";

type KakaoSdk = {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (options: {
      objectType: "text";
      text: string;
      link: { webUrl: string; mobileWebUrl: string };
      buttonTitle: string;
    }) => void;
  };
};
declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const sdkUrl = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.5/kakao.min.js";
const integrity =
  "sha384-v6JKY3z4FUkWq21oZDHZe74YvuPk/WUrVLrDHTBojHXClOSa3iXy7sCXPY1jkFbj";
let pending: Promise<void> | undefined;
export const hasKakaoShareKey = () =>
  Boolean(import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY?.trim());

export function prepareKakaoShare(): Promise<void> {
  const key = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY?.trim();
  if (!key) return Promise.reject(new Error("카카오톡 공유 준비가 필요해요."));
  if (window.Kakao?.isInitialized()) return Promise.resolve();
  if (pending) return pending;
  pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = sdkUrl;
    script.integrity = integrity;
    script.crossOrigin = "anonymous";
    script.async = true;
    const timer = window.setTimeout(() => fail(), 10000);
    function fail() {
      window.clearTimeout(timer);
      script.onload = script.onerror = null;
      script.remove();
      reject(new Error("카카오톡 공유를 준비하지 못했어요."));
    }
    script.onerror = fail;
    script.onload = () => {
      window.clearTimeout(timer);
      try {
        if (!window.Kakao) throw new Error("SDK unavailable");
        if (!window.Kakao.isInitialized()) window.Kakao.init(key);
        resolve();
      } catch {
        fail();
      }
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
  return pending;
}

export function shareCardText(
  card: Pick<ShareCard, "itemType" | "includesChange">,
) {
  return `한마음\n${itemLabels[card.itemType]} 정보를 확인해 주세요\n${card.includesChange ? "변경된 정보가 있어요" : "함께 확인할 정보가 있어요"}`;
}

// Invoke synchronously from the user's click after preload, preserving popup activation.
// SDK resolution means the sharing UI was requested, not delivery to a recipient.
export function openKakaoShare(card: ShareCard) {
  if (!window.Kakao?.isInitialized())
    throw new Error("카카오톡 공유가 준비되지 않았어요.");
  return window.Kakao.Share.sendDefault({
    objectType: "text",
    text: shareCardText(card),
    link: { webUrl: card.url, mobileWebUrl: card.url },
    buttonTitle: "한마음에서 확인",
  });
}
