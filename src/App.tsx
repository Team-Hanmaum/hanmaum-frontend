import { useEffect } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useMatches,
} from "react-router";
import { MockAccountBoundary } from "@/routes/layouts/MockAccountBoundary";
import { QaModeProvider } from "@/routes/QaModeProvider";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider";

function App() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const handle = matches.at(-1)?.handle as { title?: string } | undefined;
  const title = handle?.title ?? "한마음";
  // 입력·승인·탈퇴 중에는 자동 설치 안내로 흐름을 끊지 않는다.
  const autoPrompt =
    ["/", "/login", "/spaces"].includes(pathname) ||
    /^\/spaces\/[^/]+\/(home|care|news|family|all)$/.test(pathname);

  useEffect(() => {
    document.title = title === "한마음" ? title : `${title} · 한마음`;
    document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
  }, [pathname, title]);

  return (
    <>
      <PwaInstallProvider autoPrompt={autoPrompt}>
        <QaModeProvider>
          <MockAccountBoundary>
            <Outlet />
          </MockAccountBoundary>
        </QaModeProvider>
      </PwaInstallProvider>
      <ScrollRestoration />
    </>
  );
}

export default App;
