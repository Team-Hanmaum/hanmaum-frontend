import { createBrowserRouter, redirect, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "@/App";
import { LoginPage } from "@/pages/login/LoginPage";
import { NotFoundPage } from "@/pages/error/NotFoundPage";
import { RouteErrorPage } from "@/pages/error/RouteErrorPage";
import { recordNavigation } from "./navigationHistory";
import { paths, spacePath } from "./paths";
import { TabLayout } from "./layouts/TabLayout";
import { SpaceSelectionPage } from "@/pages/space-selection/SpaceSelectionPage";
import { HomePage } from "@/pages/home/HomePage";
import { CarePage } from "@/pages/care/CarePage";
import { NewsPage } from "@/pages/news/NewsPage";
import { FamilyPage } from "@/pages/family/FamilyPage";
import { AllPage } from "@/pages/all/AllPage";

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
      {
        path: paths.spaces,
        Component: SpaceSelectionPage,
        handle: { title: "돌봄 공간 선택" },
      },
      {
        path: `${paths.spaces}/:careSpaceId`,
        children: [
          {
            index: true,
            loader: ({ params, request }) => {
              if (!params.careSpaceId)
                throw new Response(null, { status: 404 });
              const url = new URL(request.url);
              return redirect(
                `${spacePath(params.careSpaceId)}${url.search}${url.hash}`,
              );
            },
          },
          {
            Component: TabLayout,
            children: [
              {
                path: "home",
                Component: HomePage,
                handle: { title: "홈", tab: "home" },
              },
              {
                path: "care",
                Component: CarePage,
                handle: { title: "돌봄", tab: "care" },
              },
              {
                path: "news",
                Component: NewsPage,
                handle: { title: "소식", tab: "news" },
              },
              {
                path: "family",
                Component: FamilyPage,
                handle: { title: "가족", tab: "family" },
              },
              {
                path: "all",
                Component: AllPage,
                handle: { title: "전체", tab: "all" },
              },
            ],
          },
          {
            path: "*",
            Component: NotFoundPage,
            handle: { title: "페이지를 찾을 수 없어요" },
          },
        ],
      },
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
