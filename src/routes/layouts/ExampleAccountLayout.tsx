import { Outlet } from "react-router";
import { useCareSpaces } from "@/features/carespace/model/useCareSpaces";
import { useExampleSpaces } from "@/features/carespace/model/useExampleSpaces";
import { LoadingState, ErrorState } from "@/components/feedback";
import { PageLayout } from "@/components/layout";
import { ExampleSurface } from "./ExampleSurface";

export function ExampleAccountLayout() {
  const spaces = useCareSpaces();
  useExampleSpaces(spaces.data);
  return (
    <ExampleSurface>
      {!spaces.data ? (
        <PageLayout>
          {spaces.isError ? (
            <ErrorState
              reason="load-error"
              onAction={() => void spaces.refetch()}
            />
          ) : (
            <LoadingState label="참여 공간을 확인하고 있어요" />
          )}
        </PageLayout>
      ) : (
        <Outlet />
      )}
    </ExampleSurface>
  );
}
