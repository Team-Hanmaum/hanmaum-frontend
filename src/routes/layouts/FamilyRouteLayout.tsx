import { Outlet, useLocation, useParams } from "react-router";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { SpaceAccessState } from "./SpaceAccessState";
export function FamilyRouteLayout() {
  const { careSpaceId } = useParams();
  const { spaces } = useMockCareSpaces();
  const location = useLocation();
  const space = spaces.find((entry) => entry.id === careSpaceId);
  if (
    !isMockPreviewEnabled ||
    !space ||
    !space.members.some((member) => member.self)
  )
    return <SpaceAccessState />;
  return (
    <Outlet
      key={location.pathname}
      context={space}
    />
  );
}
