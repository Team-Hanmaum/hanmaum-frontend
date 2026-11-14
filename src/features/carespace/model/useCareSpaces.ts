import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { getCareSpaces } from "../api/careSpaceApi";
import type { CareSpaceSummary } from "../api/careSpaceTypes";
import { careSpaceKeys } from "./careSpaceKeys";

export function useCareSpaces({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<CareSpaceSummary[], ApiError>({
    queryKey: careSpaceKeys.list(),
    enabled,
    queryFn: ({ signal }) => {
      return getCareSpaces(signal);
    },
  });
}
