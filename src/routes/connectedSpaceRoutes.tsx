import { redirect, type RouteObject } from "react-router";
import { ConnectedHomePage } from "@/pages/home/ConnectedHomePage";
import { ConnectedFamilyPage } from "@/pages/family/ConnectedFamilyPage";
import {
  ConnectedAllPage,
  SpacePendingContent,
  SpacePendingPage,
} from "@/pages/space/SpacePendingPage";
import { NotFoundPage } from "@/pages/error/NotFoundPage";
import { ConnectedTabLayout } from "./layouts/ConnectedTabLayout";
import { spacePath } from "./paths";

// Add real domain pages here as their APIs are connected. No Mock route is mounted.
export const connectedSpaceRoutes: RouteObject[] = [
  {
    index: true,
    loader: ({ params, request }) => {
      const url = new URL(request.url);
      return redirect(
        `${spacePath(params.careSpaceId!)}${url.search}${url.hash}`,
      );
    },
  },
  {
    Component: ConnectedTabLayout,
    children: [
      {
        path: "home",
        Component: ConnectedHomePage,
        handle: { title: "홈", tab: "home" },
      },
      {
        path: "care",
        Component: SpacePendingContent,
        handle: { title: "돌봄", tab: "care" },
      },
      {
        path: "news",
        Component: SpacePendingContent,
        handle: { title: "소식", tab: "news" },
      },
      {
        path: "family",
        Component: ConnectedFamilyPage,
        handle: { title: "가족", tab: "family" },
      },
      {
        path: "all",
        Component: ConnectedAllPage,
        handle: { title: "전체", tab: "all" },
      },
    ],
  },
  { path: "care/*", Component: SpacePendingPage },
  { path: "news/*", Component: SpacePendingPage },
  { path: "family/*", Component: SpacePendingPage },
  { path: "proposals/*", Component: SpacePendingPage },
  { path: "info/*", Component: SpacePendingPage },
  { path: "invite", Component: SpacePendingPage },
  { path: "*", Component: NotFoundPage },
];
