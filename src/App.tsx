import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { SocialProvider } from "@/components/ui";
import { LoginPage } from "@/pages/login/LoginPage";

const ComponentPreviewPage = import.meta.env.DEV
  ? lazy(() => import("@/pages/component-preview/ComponentPreviewPage"))
  : null;

function App() {
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [message, setMessage] = useState("실제 로그인·계정 생성 없음");
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pending.current !== null) clearTimeout(pending.current);
    },
    [],
  );

  function previewLogin(nextProvider: SocialProvider) {
    if (pending.current !== null) return;
    setProvider(nextProvider);
    setMessage("로딩 상태 확인 중 · 실제 인증 요청 없음");
    pending.current = setTimeout(() => {
      pending.current = null;
      setProvider(null);
      setMessage("상태 확인 완료 · 실제 로그인·계정 생성 없음");
    }, 1000);
  }

  if (
    ComponentPreviewPage &&
    new URLSearchParams(window.location.search).get("preview") === "components"
  ) {
    return (
      <Suspense fallback={<p className="p-hm-20">컴포넌트 불러오는 중</p>}>
        <ComponentPreviewPage />
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <aside
        aria-label="Mock 안내"
        className="flex flex-wrap items-center justify-center gap-x-hm-16 gap-y-hm-4 bg-hm-bg-brand-subtle px-hm-20 py-hm-8 text-hm-caption-default text-hm-text-brand"
      >
        <p
          role="status"
          aria-atomic="true"
        >
          Mock · {message}
        </p>
        {import.meta.env.DEV && (
          <a
            className="hm-focus-ring rounded-hm-5 underline underline-offset-4"
            href="?preview=components"
          >
            컴포넌트 보기
          </a>
        )}
      </aside>
      <LoginPage
        loadingProvider={provider}
        onLogin={previewLogin}
        onBack={() => setMessage("뒤로가기 동작 확인 · 이전 화면 연결 전")}
      />
    </div>
  );
}

export default App;
