import { useEffect } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useMatches,
} from "react-router";
import { MockAccountBoundary } from "@/routes/layouts/MockAccountBoundary";
import { QaModeProvider } from "@/routes/QaModeProvider";

function App() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const handle = matches.at(-1)?.handle as { title?: string } | undefined;
  const title = handle?.title ?? "한마음";

  useEffect(() => {
    document.title = title === "한마음" ? title : `${title} · 한마음`;
    document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
  }, [pathname, title]);

  return (
    <>
      <QaModeProvider>
        <MockAccountBoundary>
          <Outlet />
        </MockAccountBoundary>
      </QaModeProvider>
      <ScrollRestoration />
    </>
  );
}

export default App;
