import { Outlet, useParams } from "react-router";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { ConnectedSpacePage } from "@/pages/space/ConnectedSpacePage";

// Until each domain is connected, real sessions cannot enter its Mock data tree.
export function SpaceSessionLayout() {
  const { careSpaceId = "" } = useParams();
  return isMockPreviewEnabled ? (
    <Outlet />
  ) : (
    <ConnectedSpacePage
      key={careSpaceId}
      spaceId={careSpaceId}
    />
  );
}
