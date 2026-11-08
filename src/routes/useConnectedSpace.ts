import { useOutletContext } from "react-router";
import type { SpaceDetail } from "@/features/carespace/api/spaceDetailApi";

export type ConnectedSpaceContext = { space: SpaceDetail };
export function useConnectedSpace() {
  return useOutletContext<ConnectedSpaceContext>();
}
