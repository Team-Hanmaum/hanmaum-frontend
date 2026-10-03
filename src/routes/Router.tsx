import { createBrowserRouter, redirect, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "@/App";
import { LoginPage } from "@/pages/login/LoginPage";
import { NotFoundPage } from "@/pages/error/NotFoundPage";
import { RouteErrorPage } from "@/pages/error/RouteErrorPage";
import { recordNavigation } from "./navigationHistory";
import { paths } from "./paths";

const developmentRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: paths.components,
        handle: { title: "공통 컴포넌트" },
        lazy: async () => ({
          Component: (
            await import("@/pages/component-preview/ComponentPreviewPage")
          ).default,
        }),
      },
    ]
  : [];

const router = createBrowserRouter([
  {
    path: paths.landing,
    Component: App,
    ErrorBoundary: RouteErrorPage,
    HydrateFallback: () => (
      <p
        role="status"
        className="p-hm-20"
      >
        화면을 불러오는 중이에요
      </p>
    ),
    children: [
      {
        index: true,
        loader: ({ request }) => {
          const url = new URL(request.url);
          return redirect(
            import.meta.env.DEV &&
              url.searchParams.get("preview") === "components"
              ? `${paths.components}${url.hash}`
              : paths.login,
          );
        },
      },
      { path: paths.login, Component: LoginPage, handle: { title: "로그인" } },
      ...developmentRoutes,
      {
        path: "*",
        Component: NotFoundPage,
        handle: { title: "페이지를 찾을 수 없어요" },
      },
    ],
  },
]);

recordNavigation(router.state.location.key, "POP");
router.subscribe(({ location, historyAction }) =>
  recordNavigation(location.key, historyAction),
);

export function Router() {
  return <RouterProvider router={router} />;
}
