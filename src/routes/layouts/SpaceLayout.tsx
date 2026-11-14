import { Outlet, useParams } from "react-router";
import { Header, PageLayout } from "@/components/layout";
import { ErrorState, LoadingState } from "@/components/feedback";
import { ApiError } from "@/lib/api";
import { useSpaceDetail } from "@/features/carespace/model/useSpaceDetail";
import { useAppNavigate } from "../useAppNavigate";
import { paths } from "../paths";

export function SpaceLayout() {
  const { careSpaceId = "" } = useParams();
  const detail = useSpaceDetail(careSpaceId);
  const navigate = useAppNavigate();
  const denied =
    detail.error instanceof ApiError &&
    [403, 404].includes(detail.error.status ?? 0);
  if (detail.data && !denied)
    return (
      <Outlet
        key={careSpaceId}
        context={{ space: detail.data }}
      />
    );
  return (
    <PageLayout
      header={
        <Header
          variant="back"
          title="돌봄 공간"
          onBack={() => void navigate(paths.spaces)}
        />
      }
    >
      {detail.isPending ? (
        <LoadingState label="돌봄 공간을 확인하고 있어요" />
      ) : (
        <ErrorState
          reason={denied ? "no-permission" : "load-error"}
          title={
            denied
              ? "이 공간에 접근할 수 없어요"
              : "돌봄 공간을 불러오지 못했어요"
          }
          actionLabel={denied ? "참여 공간 선택" : "다시 시도"}
          onAction={() =>
            denied ? void navigate(paths.spaces) : void detail.refetch()
          }
        />
      )}
    </PageLayout>
  );
}
