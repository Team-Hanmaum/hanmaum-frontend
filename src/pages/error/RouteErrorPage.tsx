import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { ErrorState } from "@/components/feedback";
import { paths } from "@/routes/paths";
import { NotFoundPage } from "./NotFoundPage";

export function RouteErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404)
    return <NotFoundPage />;
  return (
    <main
      tabIndex={-1}
      className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center gap-hm-20 p-hm-20 outline-none"
    >
      <h1 className="text-hm-title-page">화면을 불러오지 못했어요</h1>
      <ErrorState
        reason="load-error"
        onAction={() => window.location.reload()}
      />
      <Link
        to={paths.landing}
        replace
        className="hm-focus-ring rounded-hm-8 p-hm-12 text-center text-hm-text-brand underline"
      >
        시작 화면으로
      </Link>
    </main>
  );
}
