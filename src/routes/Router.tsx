import {
  createBrowserRouter,
  redirect,
  type LoaderFunctionArgs,
  type RouteObject,
} from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "@/App";

// 공간 진입 전 화면
import { LandingPage } from "@/pages/landing/LandingPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { InvitationPage } from "@/pages/invitations/InvitationPage";
import { OnboardingGuidePage } from "@/pages/onboarding/OnboardingGuidePage";
import { SpaceSelectionPage } from "@/pages/space-selection/SpaceSelectionPage";
import { SpaceCreatePage } from "@/pages/space-create/SpaceCreatePage";

// 공간 안의 화면
import { SpaceInvitePage } from "@/pages/space-invite/SpaceInvitePage";
import { HomePage } from "@/pages/home/HomePage";
import { CarePage } from "@/pages/care/CarePage";
import { NewsPage } from "@/pages/news/NewsPage";
import { FamilyPage } from "@/pages/family/FamilyPage";
import { AllPage } from "@/pages/all/AllPage";

// 공통 오류·레이아웃·경로
import { NotFoundPage } from "@/pages/error/NotFoundPage";
import { RouteErrorPage } from "@/pages/error/RouteErrorPage";
import { TabLayout } from "./layouts/TabLayout";
import { RecordRouteLayout } from "./layouts/RecordRouteLayout";
import { ProposalRouteLayout } from "./layouts/ProposalRouteLayout";
import { recordNavigation } from "./navigationHistory";
import { paths, spacePath } from "./paths";

// 경로 이동 처리
function landingLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (import.meta.env.DEV && url.searchParams.get("preview") === "components")
    return redirect(`${paths.components}${url.hash}`);
  return null;
}

function redirectToSpaceHome({ params, request }: LoaderFunctionArgs) {
  if (!params.careSpaceId) throw new Response(null, { status: 404 });
  const url = new URL(request.url);
  return redirect(`${spacePath(params.careSpaceId)}${url.search}${url.hash}`);
}

// 소식 페이지 지연 로딩
async function loadNewsCreatePage() {
  const { NewsCreatePage } = await import("@/pages/news-create/NewsCreatePage");
  return { Component: NewsCreatePage };
}

async function loadNewsDetailPage() {
  const { NewsDetailPage } = await import("@/pages/news-detail/NewsDetailPage");
  return { Component: NewsDetailPage };
}

function RouteLoadingFallback() {
  return (
    <p
      role="status"
      className="p-hm-20"
    >
      화면을 불러오는 중이에요
    </p>
  );
}

// 공간 진입 전 화면
const entryRoutes: RouteObject[] = [
  {
    index: true,
    Component: LandingPage,
    handle: { title: "한마음" },
    loader: landingLoader,
  },
  {
    path: paths.login,
    Component: LoginPage,
    handle: { title: "로그인" },
  },
  {
    path: "/invitations/:invitationToken",
    Component: InvitationPage,
    handle: { title: "초대 참여" },
  },
  {
    path: paths.onboardingGuide,
    Component: OnboardingGuidePage,
    handle: { title: "시작 전 안내" },
  },
  {
    path: paths.spaces,
    Component: SpaceSelectionPage,
    handle: { title: "돌봄 공간 선택" },
  },
  {
    path: paths.spaceCreate,
    Component: SpaceCreatePage,
    handle: { title: "돌봄 공간 만들기" },
  },
];

// 공간 헤더와 공통 하단 탭을 사용하는 화면
const tabRoutes: RouteObject[] = [
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
];

// 작성·상세의 공간 확인은 RecordRouteLayout에서 처리
const recordRoutes: RouteObject[] = [
  {
    path: "news/new",
    lazy: loadNewsCreatePage,
    handle: { title: "소식 남기기" },
  },
  {
    path: "news/:recordId",
    lazy: loadNewsDetailPage,
    handle: { title: "소식 상세" },
  },
];

// 소식 원본 삭제와 결과
const recordDeletionRoutes: RouteObject[] = [
  {
    path: "news/:recordId/delete",
    lazy: async () => ({
      Component: (await import("@/pages/news-delete/NewsDeletePage"))
        .NewsDeletePage,
    }),
    handle: { title: "소식 원본 삭제" },
  },
  {
    path: "news/deletions/:deletionId",
    lazy: async () => ({
      Component: (await import("@/pages/news-delete/NewsDeletePage"))
        .NewsDeletionResultPage,
    }),
    handle: { title: "소식 삭제 결과" },
  },
];

// 소식에서 연결되는 현재 돌봄 조회·근거·이력·재확인
const careItemRoutes: RouteObject[] = [
  {
    path: "care/items/:itemId",
    lazy: async () => ({
      Component: (await import("@/pages/care-item/CareItemPage")).CareItemPage,
    }),
    handle: { title: "돌봄 상세" },
  },
  {
    path: "care/items/:itemId/sources",
    lazy: async () => ({
      Component: (await import("@/pages/care-sources/CareSourcesPage"))
        .CareSourcesPage,
    }),
    handle: { title: "근거 보기" },
  },
  {
    path: "care/items/:itemId/history/:historyId?",
    lazy: async () => ({
      Component: (await import("@/pages/care-history/CareHistoryPage"))
        .CareHistoryPage,
    }),
    handle: { title: "변경 이력" },
  },
  {
    path: "care/items/:itemId/reconfirm",
    lazy: async () => ({
      Component: (await import("@/pages/care-reconfirm/CareReconfirmPage"))
        .CareReconfirmPage,
    }),
    handle: { title: "다시 확인하기" },
  },
];

// 제안 검토·요청·결과
const proposalRoutes: RouteObject[] = [
  {
    path: "proposals/:proposalId/evidence",
    lazy: async () => ({
      Component: (
        await import("@/pages/proposal-evidence/ProposalEvidencePage")
      ).ProposalEvidencePage,
    }),
    handle: { title: "근거 비교" },
  },
  {
    path: "proposals/:proposalId/edit",
    lazy: async () => ({
      Component: (await import("@/pages/proposal-edit/ProposalEditPage"))
        .ProposalEditPage,
    }),
    handle: { title: "제안 내용 수정" },
  },
  {
    path: "proposals/:proposalId/target",
    lazy: async () => ({
      Component: (await import("@/pages/proposal-target/ProposalTargetPage"))
        .ProposalTargetPage,
    }),
    handle: { title: "연결 대상 선택" },
  },
  {
    path: "news/:recordId/proposals",
    lazy: async () => ({
      Component: (await import("@/pages/proposal-review/ProposalReviewPage"))
        .ProposalReviewPage,
    }),
    handle: { title: "제안 검토" },
  },
  {
    path: "proposals/confirm",
    lazy: async () => ({
      Component: (await import("@/pages/proposal-confirm/ProposalConfirmPage"))
        .ProposalConfirmPage,
    }),
    handle: { title: "반영 전 확인" },
  },
  {
    path: "proposal-requests/:requestId",
    lazy: async () => ({
      Component: (await import("@/pages/proposal-request/ProposalRequestPage"))
        .ProposalRequestPage,
    }),
    handle: { title: "요청 상태" },
  },
  {
    path: "proposals/results/:resultId",
    lazy: async () => ({
      Component: (await import("@/pages/proposal-result/ProposalResultPage"))
        .ProposalResultPage,
    }),
    handle: { title: "반영 결과" },
  },
  {
    path: "proposals",
    lazy: async () => ({
      Component: (await import("@/pages/proposal-list/ProposalListPage"))
        .ProposalListPage,
    }),
    handle: { title: "확인할 내용" },
  },
];

// 개발 전용 화면: 프로덕션에서는 경로와 페이지 코드 제외
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

const notFoundRoute: RouteObject = {
  path: "*",
  Component: NotFoundPage,
  handle: { title: "페이지를 찾을 수 없어요" },
};

// 선택한 돌봄 공간의 화면 구성
const spaceRoutes: RouteObject[] = [
  {
    path: "invite",
    Component: SpaceInvitePage,
    handle: { title: "가족 초대" },
  },
  {
    index: true,
    loader: redirectToSpaceHome,
  },
  {
    Component: TabLayout,
    children: tabRoutes,
  },
  {
    Component: RecordRouteLayout,
    children: recordRoutes,
  },
  {
    Component: ProposalRouteLayout,
    children: [...recordDeletionRoutes, ...careItemRoutes, ...proposalRoutes],
  },
  notFoundRoute,
];

// 최종 라우터
const router = createBrowserRouter([
  {
    path: paths.landing,
    Component: App,
    ErrorBoundary: RouteErrorPage,
    HydrateFallback: RouteLoadingFallback,
    children: [
      ...entryRoutes,
      {
        path: `${paths.spaces}/:careSpaceId`,
        children: spaceRoutes,
      },
      ...developmentRoutes,
      notFoundRoute,
    ],
  },
]);

// 앱 내부 뒤로가기 판단을 위한 방문 이력 연결
recordNavigation(router.state.location.key, "POP");
router.subscribe(({ location, historyAction }) =>
  recordNavigation(location.key, historyAction),
);

export function Router() {
  return <RouterProvider router={router} />;
}
