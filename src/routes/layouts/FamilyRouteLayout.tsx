import { ExampleSurface } from "./ExampleSurface";
import { Outlet, useLocation, useParams } from "react-router";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { isExamplePreviewEnabled } from "@/lib/examplePreview";
import { SpaceAccessState } from "./SpaceAccessState";
export function FamilyRouteLayout() {
  const { careSpaceId } = useParams();
  const { spaces } = useMockCareSpaces();
  const location = useLocation();
  const space = spaces.find((entry) => entry.id === careSpaceId);
  if (
    !isExamplePreviewEnabled ||
    !space ||
    !space.members.some((member) => member.self)
  )
    return (
      <ExampleSurface>
        <SpaceAccessState />
      </ExampleSurface>
    );
  return (
    <ExampleSurface>
      <Outlet
        key={location.pathname}
        context={space}
      />
    </ExampleSurface>
  );
}
