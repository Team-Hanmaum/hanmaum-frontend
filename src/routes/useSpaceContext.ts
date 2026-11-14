import { useOutletContext } from "react-router";
import type { SpaceDetail } from "@/features/carespace/api/spaceDetailTypes";

export type SpaceContext = { space: SpaceDetail };
export function useSpaceContext() {
  return useOutletContext<SpaceContext>();
}
