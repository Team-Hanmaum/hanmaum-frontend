import { Outlet } from "react-router";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { ConnectedSpaceLayout } from "./ConnectedSpaceLayout";

// Until each domain is connected, real sessions cannot enter its Mock data tree.
export function SpaceSessionLayout() {
  return isMockPreviewEnabled ? <Outlet /> : <ConnectedSpaceLayout />;
}
